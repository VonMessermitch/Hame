#!/usr/bin/env python3
"""Genera voces para el juego con Kokoro-82M **en local** (sin API ni nube).

Requisitos (una vez):
    python3 -m venv .venv
    .venv/bin/pip install kokoro-onnx soundfile lameenc
    # modelo de 311 MB y banco de voces de 27 MB
    curl -L -o kokoro-v1.0.onnx  https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
    curl -L -o voices-v1.0.bin   https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin

Uso:
    .venv/bin/python tools/voz/kokoro_local.py                 # lee tools/voz/guion.json
    .venv/bin/python tools/voz/kokoro_local.py --voz ef_dora    # fuerza otra voz
    .venv/bin/python tools/voz/kokoro_local.py --solo koller_01 # una sola línea
    .venv/bin/python tools/voz/kokoro_local.py --formato wav    # sin MP3

Los archivos se escriben en assets/voz/ y se actualiza assets/voz/manifest.json,
que es lo que lee el empaquetador (tools/voz/empaquetar_voces.py).

Licencia: Kokoro-82M es Apache 2.0; el audio que generes es tuyo y se puede usar
comercialmente. No hace falta atribución, pero es buena práctica citar el modelo.
"""
import argparse
import json
import os
import sys
import wave

RAIZ = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
VOZ_DIR = os.path.join(RAIZ, "assets", "voz")
GUION = os.path.join(RAIZ, "tools", "voz", "guion.json")

# Kokoro v1.0: 54 voces. Español: ef_dora (mujer), em_alex (hombre), em_santa (hombre).
VOCES_ES = ("ef_dora", "em_alex", "em_santa")


def ruta_modelo():
    """Modelo y voces: junto al script, en tools/voz/modelo/ o donde digan las variables."""
    candidatos = [
        (os.environ.get("KOKORO_MODELO"), os.environ.get("KOKORO_VOCES")),
        (
            os.path.join(RAIZ, "tools", "voz", "modelo", "kokoro-v1.0.onnx"),
            os.path.join(RAIZ, "tools", "voz", "modelo", "voices-v1.0.bin"),
        ),
        (os.path.join(RAIZ, "kokoro-v1.0.onnx"), os.path.join(RAIZ, "voices-v1.0.bin")),
    ]
    for modelo, voces in candidatos:
        if modelo and voces and os.path.exists(modelo) and os.path.exists(voces):
            return modelo, voces
    sys.exit(
        "No encuentro el modelo. Poné kokoro-v1.0.onnx y voices-v1.0.bin en\n"
        "  tools/voz/modelo/\n"
        "o exportá KOKORO_MODELO y KOKORO_VOCES con las rutas completas."
    )


def guardar_wav(ruta, muestras, sr):
    import numpy as np

    datos = np.clip(muestras, -1.0, 1.0)
    datos = (datos * 32767).astype("<i2")
    with wave.open(ruta, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes(datos.tobytes())


def guardar_mp3(ruta, muestras, sr, kbps=48):
    import lameenc
    import numpy as np

    datos = np.clip(muestras, -1.0, 1.0)
    pcm = (datos * 32767).astype("<i2").tobytes()
    enc = lameenc.Encoder()
    enc.set_bit_rate(kbps)
    enc.set_in_sample_rate(sr)
    enc.set_channels(1)
    enc.set_quality(2)
    with open(ruta, "wb") as fh:
        fh.write(enc.encode(pcm))
        fh.write(enc.flush())


def main():
    ap = argparse.ArgumentParser(description="Voces Kokoro-82M en local para el juego")
    ap.add_argument("--guion", default=GUION)
    ap.add_argument("--salida", default=VOZ_DIR)
    ap.add_argument("--modelo")
    ap.add_argument("--voces")
    ap.add_argument("--voz", help="fuerza una voz para todas las líneas (p. ej. em_alex)")
    ap.add_argument("--solo", help="sintetiza solo los ids indicados (separados por coma)")
    ap.add_argument("--formato", choices=("mp3", "wav"), default="mp3")
    ap.add_argument("--velocidad", type=float, default=None)
    ap.add_argument("--fuerza", action="store_true", help="regenera aunque el archivo exista")
    args = ap.parse_args()

    try:
        from kokoro_onnx import Kokoro
    except ImportError:
        sys.exit("Falta kokoro-onnx:  .venv/bin/pip install kokoro-onnx soundfile lameenc")

    with open(args.guion, encoding="utf-8") as fh:
        guion = json.load(fh)
    lineas = guion["lineas"] if isinstance(guion, dict) else guion
    if args.solo:
        pedidos = {x.strip() for x in args.solo.split(",") if x.strip()}
        lineas = [l for l in lineas if l["id"] in pedidos]

    modelo = args.modelo or ruta_modelo()[0]
    voces = args.voces or ruta_modelo()[1]
    print(f"modelo: {modelo}\nvoces:  {voces}")
    k = Kokoro(modelo, voces)
    disponibles = set(k.get_voices())
    os.makedirs(args.salida, exist_ok=True)
    manifiesto_ruta = os.path.join(args.salida, "manifest.json")
    manifiesto = {}
    if os.path.exists(manifiesto_ruta):
        with open(manifiesto_ruta, encoding="utf-8") as fh:
            manifiesto = json.load(fh)

    for linea in lineas:
        lid = linea["id"]
        voz = args.voz or linea.get("voz", "em_alex")
        idioma = linea.get("idioma", "es")
        velocidad = args.velocidad or float(linea.get("velocidad", 1.0))
        destino = os.path.join(args.salida, f"{lid}.{args.formato}")
        if voz not in disponibles:
            print(f"  ! {lid}: voz '{voz}' inexistente; uso em_alex")
            voz = "em_alex"
        if os.path.exists(destino) and not args.fuerza:
            print(f"  = {lid}: ya existe")
            continue
        muestras, sr = k.create(linea["texto"], voice=voz, speed=velocidad, lang=idioma)
        if args.formato == "mp3":
            guardar_mp3(destino, muestras, sr)
        else:
            guardar_wav(destino, muestras, sr)
        dur = len(muestras) / sr
        kb = os.path.getsize(destino) / 1024
        manifiesto[lid] = {
            "archivo": os.path.basename(destino),
            "texto": linea["texto"],
            "voz": voz,
            "idioma": idioma,
            "segundos": round(dur, 3),
            "kb": round(kb, 1),
        }
        print(f"  + {lid}: {dur:.2f} s · {kb:.0f} KB · {voz}")

    with open(manifiesto_ruta, "w", encoding="utf-8") as fh:
        json.dump(manifiesto, fh, ensure_ascii=False, indent=2)
    print(f"\n{len(manifiesto)} líneas en {args.salida} (manifiesto actualizado)")


if __name__ == "__main__":
    main()
