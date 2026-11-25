#!/usr/bin/env python3
"""Genera los GLB de los assets con el Space de TRELLIS.2.

Pipeline completo:

    mkRifle / mkSMG / mkMG08 / módulo de muralla  (procedural, v39)
        └─ tools/assets/render_assets.js   → PNG de referencia (fondo alfa)
             └─ este script (gradio_client) → Space TRELLIS.2 → GLB PBR
                  └─ assets_graphics/{weapons,buildings}/*.glb
                       └─ v40/data/assets_catalogo.js → cargador del juego

El juego sigue usando el modelo procedural si el GLB no está o no carga.

Uso:
    python3 tools/assets/trellis_assets.py --seco
    python3 tools/assets/trellis_assets.py --space usuario/trellis2-assets
    python3 tools/assets/trellis_assets.py --space prithivMLmods/TRELLIS.2-Text-to-3D --solo rifle_1909
    python3 tools/assets/trellis_assets.py --texto "fusilero de 1909 con casco y capote" --id soldado_1909

El backend se detecta solo: usa `/generar` si es nuestro Space y
`/generate_3d` si es el Space público de prithivMLmods (imagen → GLB, o
texto → imagen → GLB con `/generate_txt2img`).

Requisitos: `pip install gradio_client`; `trimesh` es opcional (solo valida).
"""
import argparse
import json
import os
import shutil
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
MANIFIESTO = ROOT / "assets_graphics" / "renderes" / "manifest.json"
CATALOGO_JS = ROOT / "v40" / "data" / "assets_catalogo.js"
SPACE_POR_DEFECTO = os.environ.get("TRELLIS_SPACE", "<tu-usuario>/trellis2-assets")

# Parámetros de /generate_3d (Space de prithivMLmods) por preset del manifiesto.
RESOLUCION_3D = {
    "Arma o prop (ligero)": ("512", 50_000, 1024),  # el Space exige decimation >= 50000
    "Personaje": ("1024", 50_000, 2048),
    "Edificio o arquitectura": ("1024", 120_000, 2048),
    "Alta calidad (1536³)": ("1536", 200_000, 4096),
}


def cargar_manifiesto():
    if not MANIFIESTO.exists():
        sys.exit(
            "falta %s — corré primero: node tools/assets/render_assets.js"
            % MANIFIESTO.relative_to(ROOT)
        )
    return json.loads(MANIFIESTO.read_text(encoding="utf-8"))


def escribir_catalogo(assets, space, pasos):
    """Reescribe el catálogo JS que consume el cargador del juego."""
    limpio = []
    for a in assets:
        limpio.append(
            {
                "id": a["id"],
                "nombre": a["nombre"],
                "tipo": a["tipo"],
                "glb": a["glb"],
                "escala_juego": a["escala_juego"],
                "disponible": bool(a.get("disponible")),
                "bytes": a.get("bytes"),
            }
        )
    cuerpo = json.dumps(limpio, ensure_ascii=False, indent=2).replace("\n", "\n  ")
    CATALOGO_JS.parent.mkdir(parents=True, exist_ok=True)
    CATALOGO_JS.write_text(
        "/* Generado por tools/assets/trellis_assets.py — no editar a mano. */\n"
        "(function (g) {\n"
        "  'use strict';\n"
        "  var AETH = (g.AETH = g.AETH || {});\n"
        "  var v40 = (AETH.v40 = AETH.v40 || {});\n"
        "  v40.assetsCatalogo = %s;\n"
        "})(typeof window !== 'undefined' ? window : globalThis);\n"
        % cuerpo,
        encoding="utf-8",
    )


def extraer_glb(resultado):
    """Del resultado de Gradio saca la ruta del GLB (Model3D o DownloadButton)."""
    candidatos = []

    def recorrer(x):
        if isinstance(x, str):
            candidatos.append(x)
        elif isinstance(x, (list, tuple)):
            for y in x:
                recorrer(y)
        elif isinstance(x, dict):
            for clave in ("path", "name", "value"):
                if clave in x:
                    recorrer(x[clave])

    recorrer(resultado)
    for c in candidatos:
        if c.lower().endswith(".glb") and Path(c).exists():
            return Path(c)
    return None


def validar(ruta):
    try:
        import trimesh
    except ImportError:
        return "trimesh no instalado: sin validación de malla"
    try:
        escena = trimesh.load(str(ruta))
        if hasattr(escena, "geometry"):
            mallas = list(escena.geometry.values())
        else:
            mallas = [escena]
        caras = sum(len(m.faces) for m in mallas)
        vertices = sum(len(m.vertices) for m in mallas)
        if caras == 0:
            return "ADVERTENCIA: el GLB no tiene caras"
        return "%s caras · %s vértices" % (f"{caras:,}".replace(",", "."), f"{vertices:,}".replace(",", "."))
    except Exception as exc:  # noqa: BLE001 — solo es un chequeo
        return "no se pudo leer el GLB: %s" % exc


def endpoints(cliente):
    try:
        api = cliente.view_api(return_format="dict", print_info=False)
        return api.get("named_endpoints", {}) or {}
    except Exception:
        return {}


def llamar_generar(cliente, nombres, png, preset, semilla, pasos):
    """Llama al endpoint correcto según el Space y devuelve la respuesta cruda."""
    from gradio_client import handle_file

    if "/generar" in nombres:  # Space propio (este repo)
        return cliente.predict(
            handle_file(str(png)), preset, semilla, False, pasos, api_name="/generar"
        )
    if "/generate_3d" in nombres:  # Space público de prithivMLmods
        resolucion, decimacion, textura = RESOLUCION_3D.get(preset, RESOLUCION_3D["Arma o prop (ligero)"])
        return cliente.predict(
            handle_file(str(png)),
            float(semilla),          # seed
            resolucion,              # resolution
            float(decimacion),       # decimation_target
            float(textura),          # texture_size
            7.5, 0.5, float(pasos), 5.0,   # sparse structure
            7.5, 0.5, float(pasos), 3.0,   # shape slat
            1.0, 0.0, float(pasos), 3.0,   # texture slat
            api_name="/generate_3d",
        )
    raise RuntimeError(
        "el Space no expone /generar ni /generate_3d; endpoints: %s" % ", ".join(nombres)
    )


def texto_a_imagen(cliente, nombres, prompt, destino):
    """Texto → imagen con el Space de prithivMLmods (Z-Image-Turbo), si existe."""
    if "/generate_txt2img" not in nombres:
        sys.exit("este Space no tiene /generate_txt2img: pasá una imagen de referencia")
    ruta = cliente.predict(prompt, api_name="/generate_txt2img")
    if isinstance(ruta, (list, tuple)):
        ruta = ruta[0]
    destino = Path(destino)
    destino.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(ruta, destino)
    return destino


def main():
    ap = argparse.ArgumentParser(description="Procedural → TRELLIS.2 → GLB")
    ap.add_argument("--space", default=SPACE_POR_DEFECTO, help="Space a usar (ID de HF)")
    ap.add_argument("--solo", action="append", help="limita a uno o más ids del manifiesto")
    ap.add_argument("--pasos", type=int, default=12, help="pasos de muestreo")
    ap.add_argument("--semilla", type=int, default=0)
    ap.add_argument("--texto", help="en vez de un render: prompt → imagen → GLB (text-to-3D)")
    ap.add_argument("--id", default="soldado_1909", help="id del asset cuando se usa --texto")
    ap.add_argument("--seco", action="store_true", help="solo muestra el plan, sin red")
    args = ap.parse_args()

    manifiesto = cargar_manifiesto()
    assets = manifiesto["assets"]
    elegidos = [a for a in assets if not args.solo or a["id"] in args.solo]
    if not elegidos:
        sys.exit("ningún asset coincide con --solo")

    print("Space : %s" % args.space)
    print("Assets: %d" % len(elegidos))
    for a in elegidos:
        print("  · %-16s %-42s → %s" % (a["id"], a["render"], a["glb"]))
    if args.seco:
        print("\n(--seco: no se llamó al Space; el catálogo del juego no se modificó)")
        return 0

    if "<" in args.space:
        sys.exit(
            "indicá el Space real con --space usuario/nombre (o exportá TRELLIS_SPACE).\n"
            "Se crea una vez con: hf repos create usuario/trellis2-assets --type space "
            "--space-sdk gradio --flavor zero-a10g --public"
        )

    try:
        from gradio_client import Client, handle_file  # noqa: F401 — handle_file se usa en llamar_generar
    except ImportError:
        sys.exit("falta gradio_client: pip install gradio_client")

    print("\nconectando con el Space…")
    cliente = Client(args.space)
    nombres = endpoints(cliente)
    print("endpoints: %s" % (", ".join(sorted(nombres)) or "ninguno"))

    # Text-to-3D: se salta el render procedural y se genera la referencia.
    if args.texto:
        entrada = {
            "id": args.id,
            "nombre": args.id.replace("_", " "),
            "tipo": "personaje",
            "render": "assets_graphics/renderes/%s.png" % args.id,
            "glb": "assets_graphics/characters/%s.glb" % args.id,
            "preset_trellis": "Personaje",
            "escala_juego": 1.8,
            "disponible": False,
            "prompt": args.texto,
        }
        png = texto_a_imagen(cliente, nombres, args.texto, ROOT / entrada["render"])
        print("✓ imagen de referencia: %s" % png.relative_to(ROOT))
        assets.append(entrada)
        elegidos = [entrada]

    fallos = 0

    for a in elegidos:
        png = ROOT / a["render"]
        if not png.exists():
            print("✗ %s: falta el render %s" % (a["id"], png))
            fallos += 1
            continue
        print("\n→ %s (%s)" % (a["id"], a["preset_trellis"]))
        try:
            resultado = llamar_generar(cliente, nombres, png, a["preset_trellis"], args.semilla, args.pasos)
        except Exception as exc:  # noqa: BLE001 — la cola de ZeroGPU falla de muchas formas
            print("✗ el Space devolvió un error: %s" % exc)
            fallos += 1
            continue

        origen = extraer_glb(resultado)
        if origen is None:
            print("✗ no se encontró un GLB en la respuesta: %r" % (resultado,))
            fallos += 1
            continue

        destino = ROOT / a["glb"]
        destino.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(origen, destino)
        a["disponible"] = True
        a["bytes"] = destino.stat().st_size
        a["validacion"] = validar(destino)
        a["generado"] = datetime.now(timezone.utc).isoformat(timespec="seconds")
        print(
            "✓ %s · %.0f KB · %s"
            % (destino.relative_to(ROOT), a["bytes"] / 1024, a["validacion"])
        )

    manifiesto["assets"] = assets
    manifiesto["ultima_generacion"] = datetime.now(timezone.utc).isoformat(timespec="seconds")
    manifiesto["space"] = args.space
    MANIFIESTO.write_text(json.dumps(manifiesto, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    escribir_catalogo(assets, args.space, args.pasos)

    listos = [a for a in assets if a.get("disponible")]
    print("\nGLB disponibles: %d/%d" % (len(listos), len(assets)))
    print("catálogo: %s" % CATALOGO_JS.relative_to(ROOT))
    print("El juego los toma con ?glb=1 (o AETH.v40.assets.engancharArmas()); sin GLB sigue el procedural.")
    return 1 if fallos else 0


if __name__ == "__main__":
    sys.exit(main())
