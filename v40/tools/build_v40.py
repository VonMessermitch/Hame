#!/usr/bin/env python3
"""Genera Sombras_sobre_el_Nilo_1909_v40.html (edición Aethrion).

Toma la v39 SIN MODIFICARLA y le añade, antes de </body>:
  1) los módulos del cerebro universal Aethrion (iron-v1-demo/ai/*.js),
  2) la capa de fusión v40/src/aethrion_v40.js,
  3) el arranque de la capa cognitiva.

Salida: v40/Sombras_sobre_el_Nilo_1909_v40.html y una copia en la raíz con el
nombre correlativo de la serie (v16…v39). No modifica la v39 original.

Uso: python3 v40/tools/build_v40.py
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
V39 = os.path.join(ROOT, "Sombras_sobre_el_Nilo_1909_v39.html")
OUT_DIR = os.path.join(ROOT, "v40")
OUT = os.path.join(OUT_DIR, "Sombras_sobre_el_Nilo_1909_v40.html")
OUT_COPY = os.path.join(ROOT, "Sombras_sobre_el_Nilo_1909_v40.html")
BRIDGE = os.path.join(OUT_DIR, "src", "aethrion_v40.js")
SOLDIERS = os.path.join(OUT_DIR, "src", "aethrion_soldiers.js")
VOICES = os.path.join(OUT_DIR, "data", "voces_v40.js")
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
    out = out.replace(
        "<title>Sombras sobre el Nilo — 1909 (v39 · Motor embebido)</title>",
        "<title>Sombras sobre el Nilo — 1909 (v40 · Edición Aethrion)</title>",
        1,
    )

    os.makedirs(OUT_DIR, exist_ok=True)
    for dest in (OUT, OUT_COPY):
        with open(dest, "w", encoding="utf-8") as fh:
            fh.write(out)

    print("v40 generada")
    print("  scripts añadidos : %d" % total_scripts)
    print("  tamaño           : %.1f KB" % (len(out.encode("utf-8")) / 1024.0))
    print("  salida           : %s" % OUT)
    print("  copia raíz       : %s" % OUT_COPY)
    # Comprobaciones estructurales mínimas.
    for marker in ("window.AETH", "AETH.v40", "aethrion_v40", "aethrion_soldiers", "v40 · Edición Aethrion", "VOZ40.engancharTalk"):
        if marker not in out:
            sys.exit("falta el marcador esperado: " + marker)
    if out.count("<script") < total_scripts:
        sys.exit("número de bloques script inesperado")
    print("  comprobación     : marcadores y bloques presentes")


if __name__ == "__main__":
    main()
