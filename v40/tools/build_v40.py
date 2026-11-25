#!/usr/bin/env python3
"""Genera Sombras_sobre_el_Nilo_1909_v40.html (edición Aethrion).

Toma la v39 SIN MODIFICARLA y le añade, antes de </body>:
  1) los módulos del cerebro universal Aethrion (iron-v1-demo/ai/*.js),
  2) la capa de fusión v40/src/aethrion_v40.js,
  3) el arranque de la capa cognitiva.

Salida: v40/Sombras_sobre_el_Nilo_1909_v40.html y una copia en la raíz con el
nombre correlativo de la serie (v16…v39). No modifica la v39 original.

Uso:
  python3 v40/tools/build_v40.py                 # reproduce la v40
  python3 v40/tools/build_v40.py --version 41    # v41: + detalle de modelos
"""
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
V39 = os.path.join(ROOT, "Sombras_sobre_el_Nilo_1909_v39.html")


def _version():
    for i, arg in enumerate(sys.argv[1:]):
        if arg == "--version":
            return sys.argv[i + 2]
        if arg.startswith("--version="):
            return arg.split("=", 1)[1]
    return "40"


VERSION = _version()
OUT_DIR = os.path.join(ROOT, "v" + VERSION)
OUT = os.path.join(OUT_DIR, "Sombras_sobre_el_Nilo_1909_v%s.html" % VERSION)
OUT_COPY = os.path.join(ROOT, "Sombras_sobre_el_Nilo_1909_v%s.html" % VERSION)
BRIDGE = os.path.join(ROOT, "v40", "src", "aethrion_v40.js")
SOLDIERS = os.path.join(ROOT, "v40", "src", "aethrion_soldiers.js")
GLTF_LOADER = os.path.join(ROOT, "vendor", "GLTFLoader.r128.js")
ASSETS_GLB = os.path.join(ROOT, "v40", "src", "assets_glb.js")
ASSETS_CATALOGO = os.path.join(ROOT, "v40", "data", "assets_catalogo.js")
MODELOS = os.path.join(ROOT, "v40", "src", "modelos_v40.js")
VOICES = os.path.join(ROOT, "v40", "data", "voces_v40.js")
VOICE_PLAYER = os.path.join(ROOT, "tools", "voz", "voz40.js")

# Orden de dependencias del motor (el mismo que iron-v1-demo/index.html,
# sin src/demo.js —que es el render propio de Iron— y sin el inspector DOM,
# porque v40 trae su propio panel).
AI_MODULES = [
    "ai/core/util.js",
    "ai/biology/species.js",
    "ai/biology/anatomy.js",
    "ai/biology/senses.js",
    "ai/cognition/memory.js",
    "ai/cognition/emotion.js",
    "ai/cognition/perception.js",
    "ai/personality/personality.js",
    "ai/culture/culture.js",
    "ai/cognition/competence.js",
    "ai/environment/astronomy.js",
    "ai/environment/climate.js",
    "ai/planning/needs_goals.js",
    "ai/planning/goap.js",
    "ai/cognition/reasoning.js",
    "ai/simulation/combat.js",
    "ai/core/brain.js",
    "ai/simulation/world.js",
    "ai/interfaces/factory.js",
]

BOOTSTRAP = """
/* Arranque de la capa Aethrion v40. Si algo falla aquí, el juego v39 sigue
   funcionando: la capa cognitiva es aditiva. */
(function(){
  try {
    if (window.AETH && AETH.v40 && AETH.v40.bootstrap) AETH.v40.bootstrap({ population: 28 });
    if (window.AETH && AETH.v40 && AETH.v40.soldiers && console) console.log('[Aethrion v40] soldados enganchados:', AETH.v40.soldiers.summary().installed.join(', '));
    /* Voces pregrabadas (Kokoro en local). Aditivas: si falta el módulo o el
       navegador bloquea el audio, el juego sigue con subtítulos. */
    if (window.VOZ40 && VOZ40.engancharTalk) {
      var enganchado = VOZ40.engancharTalk();
      var clips = VOZ40.datos ? Object.keys(VOZ40.datos).length : 0;
      if (window.console) console.log('[Kokoro] clips:', clips, '· enganchado a talk/say:', enganchado);
    }
  } catch (e) {
    if (window.console) console.warn('[Aethrion v40] no se pudo arrancar la capa cognitiva:', e);
  }
})();
"""


def read(path):
    with open(path, encoding="utf-8") as fh:
        return fh.read()


def main():
    if not os.path.exists(V39):
        sys.exit("falta la v39: " + V39)
    base = read(V39)
    if "</body>" not in base:
        sys.exit("la v39 no tiene </body>: no se puede inyectar")

    chunks = []
    total_scripts = 0

    # Cargador glTF (Three r128) para los GLB de TRELLIS.2. Se inyecta antes de
    # la capa Aethrion; el juego arranca igual si los GLB no existen.
    gltf = read(GLTF_LOADER)
    if "</script" in gltf.lower():
        sys.exit("el GLTFLoader contiene </script y rompería el HTML")
    chunks.append("<script>/* vendor/GLTFLoader.r128.js — Three.js r128, MIT */\n%s\n</script>" % gltf)
    total_scripts += 1

    for rel in AI_MODULES:
        path = os.path.join(ROOT, "iron-v1-demo", rel)
        src = read(path)
        if "</script" in src.lower():
            sys.exit("el módulo contiene </script y rompería el HTML: " + rel)
        chunks.append("<script>/* %s */\n%s\n</script>" % (rel, src))
        total_scripts += 1

    bridge = read(BRIDGE)
    if "</script" in bridge.lower():
        sys.exit("la capa v40 contiene </script y rompería el HTML")
    chunks.append("<script>/* v40/src/aethrion_v40.js */\n%s\n</script>" % bridge)
    soldiers = read(SOLDIERS)
    if "</script" in soldiers.lower():
        sys.exit("la capa de soldados contiene </script y rompería el HTML")
    chunks.append("<script>/* v40/src/aethrion_soldiers.js */\n%s\n</script>" % soldiers)
    if os.path.exists(ASSETS_CATALOGO):
        catalogo = read(ASSETS_CATALOGO)
        if "</script" in catalogo.lower():
            sys.exit("el catálogo de assets contiene </script y rompería el HTML")
        chunks.append("<script>/* v40/data/assets_catalogo.js */\n%s\n</script>" % catalogo)
        total_scripts += 1
    assets = read(ASSETS_GLB)
    if "</script" in assets.lower():
        sys.exit("la capa de assets contiene </script y rompería el HTML")
    chunks.append("<script>/* v40/src/assets_glb.js */\n%s\n</script>" % assets)
    total_scripts += 1
    # Detalle aditivo de los modelos (v41 en adelante). Es opcional: si el
    # archivo no existe, el build sigue produciendo la v40 de siempre.
    if VERSION != "40" and os.path.exists(MODELOS):
        modelos = read(MODELOS)
        if "</script" in modelos.lower():
            sys.exit("la capa de modelos contiene </script y rompería el HTML")
        chunks.append("<script>/* v40/src/modelos_v40.js */\n%s\n</script>" % modelos)
        total_scripts += 1
    voces = read(VOICES)
    if "</script" in voces.lower():
        sys.exit("el módulo de voces contiene </script y rompería el HTML")
    chunks.append("<script>/* v40/data/voces_v40.js — voces Kokoro (base64) */\n%s\n</script>" % voces)
    player = read(VOICE_PLAYER)
    if "</script" in player.lower():
        sys.exit("el reproductor de voz contiene </script y rompería el HTML")
    chunks.append("<script>/* tools/voz/voz40.js */\n%s\n</script>" % player)
    chunks.append("<script>%s</script>" % BOOTSTRAP)
    total_scripts += 5

    payload = "\n".join(chunks)
    out = base.replace("</body>", "\n<!-- ===== Aethrion v40: cerebro universal + capa de fusión ===== -->\n" + payload + "\n</body>", 1)
    edicion = "Edición Aethrion" if VERSION == "40" else "Edición Aethrion · modelos mejorados"
    out = out.replace(
        "<title>Sombras sobre el Nilo — 1909 (v39 · Motor embebido)</title>",
        "<title>Sombras sobre el Nilo — 1909 (v%s · %s)</title>" % (VERSION, edicion),
        1,
    )

    os.makedirs(OUT_DIR, exist_ok=True)
    for dest in (OUT, OUT_COPY):
        with open(dest, "w", encoding="utf-8") as fh:
            fh.write(out)

    print("v%s generada" % VERSION)
    print("  scripts añadidos : %d" % total_scripts)
    print("  tamaño           : %.1f KB" % (len(out.encode("utf-8")) / 1024.0))
    print("  salida           : %s" % OUT)
    print("  copia raíz       : %s" % OUT_COPY)
    # Comprobaciones estructurales mínimas.
    marcadores = [
        "window.AETH", "AETH.v40", "aethrion_v40", "aethrion_soldiers",
        "v%s · %s" % (VERSION, edicion), "VOZ40.engancharTalk",
        "THREE.GLTFLoader = GLTFLoader", "V.assets = {",
    ]
    if VERSION != "40":
        marcadores.append("V.modelos = {")
    for marker in marcadores:
        if marker not in out:
            sys.exit("falta el marcador esperado: " + marker)
    if out.count("<script") < total_scripts:
        sys.exit("número de bloques script inesperado")
    print("  comprobación     : marcadores y bloques presentes")


if __name__ == "__main__":
    main()
