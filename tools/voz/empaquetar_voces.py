#!/usr/bin/env python3
"""Empaqueta las voces generadas en un módulo JS con base64, para el HTML único.

Uso:
    python3 tools/voz/empaquetar_voces.py
    python3 tools/voz/empaquetar_voces.py --dir assets/voz --salida v40/data/voces_v40.js

Lee assets/voz/manifest.json y escribe un módulo con la forma:

    window.VOZ40 = { formato: "mp3", datos: { id: "<base64>", ... },
                     texto: { "<texto normalizado>": "id", ... } };

El módulo es aditivo: si no existe, el juego sigue con subtítulos. Se puede inyectar
en el build con una línea, como los módulos de sonido de v34–v36.
"""
import argparse
import base64
import json
import os
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def normalizar(texto):
    """Misma normalización que voz40.js: minúsculas, sin acentos ni signos."""
    import unicodedata

    texto = unicodedata.normalize("NFD", texto)
    texto = "".join(c for c in texto if unicodedata.category(c) != "Mn")
    for ch in "«»¡!¿?.,;:\"'()[]—–-":
        texto = texto.replace(ch, " ")
    return " ".join(texto.lower().split())


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dir", default=os.path.join(RAIZ, "assets", "voz"))
    ap.add_argument("--salida", default=os.path.join(RAIZ, "v40", "data", "voces_v40.js"))
    args = ap.parse_args()

    manifiesto_ruta = os.path.join(args.dir, "manifest.json")
    if not os.path.exists(manifiesto_ruta):
        sys.exit("falta el manifiesto: " + manifiesto_ruta + " (corré antes kokoro_local.py)")
    with open(manifiesto_ruta, encoding="utf-8") as fh:
        manifiesto = json.load(fh)

    datos, textos, formato, total = {}, {}, "", 0
    for lid, info in manifiesto.items():
        ruta = os.path.join(args.dir, info["archivo"])
        if not os.path.exists(ruta):
            print(f"  ! {lid}: falta {ruta}")
            continue
        with open(ruta, "rb") as fh:
            crudo = fh.read()
        datos[lid] = base64.b64encode(crudo).decode("ascii")
        textos[normalizar(info["texto"])] = lid
        formato = info["archivo"].rsplit(".", 1)[-1]
        total += len(crudo)

    if not datos:
        sys.exit("no hay voces para empaquetar")

    os.makedirs(os.path.dirname(args.salida), exist_ok=True)
    with open(args.salida, "w", encoding="utf-8") as fh:
        fh.write("/* Voces Kokoro-82M (Apache 2.0) generadas en local. No editar a mano:\n")
        fh.write("   regenerar con tools/voz/kokoro_local.py + tools/voz/empaquetar_voces.py */\n")
        fh.write("window.VOZ40=window.VOZ40||{};\n")
        fh.write("var VOZ40=window.VOZ40;\n")
        fh.write("VOZ40.formato=" + json.dumps(formato) + ";\n")
        fh.write("VOZ40.datos=" + json.dumps(datos, separators=(",", ":")) + ";\n")
        fh.write("VOZ40.texto=" + json.dumps(textos, ensure_ascii=False, separators=(",", ":")) + ";\n")
    print(
        f"{len(datos)} voces · {total/1024:.0f} KB de audio · "
        f"{os.path.getsize(args.salida)/1024:.0f} KB de JS → {args.salida}"
    )


if __name__ == "__main__":
    main()
