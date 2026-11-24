#!/usr/bin/env python3
"""Empaqueta IRON V1 DEMO en un único HTML autónomo.

Uso:  python3 iron-v1-demo/tools/bundle_iron.py
Salida: Iron_V1_Demo.html (raíz del repositorio), con Three.js y el motor embebidos.
"""
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[2]          # raíz del repositorio
DEMO = Path(__file__).resolve().parents[1]          # iron-v1-demo/
INDEX = DEMO / "index.html"
OUT = ROOT / "Iron_V1_Demo.html"

if not INDEX.exists():
    sys.exit(f"No se encuentra {INDEX}")

html = INDEX.read_text(encoding="utf-8")


def inline(match: re.Match) -> str:
    src = match.group(1)
    if src.startswith(("http://", "https://", "//")):
        return match.group(0)
    path = (DEMO / src).resolve()
    if not path.exists():
        sys.exit(f"Falta el recurso {src} ({path})")
    code = path.read_text(encoding="utf-8")
    if "</script>" in code.lower():
        sys.exit(f"{src} contiene la secuencia </script> y no puede embeberse")
    return f'<script data-src="{src}">\n{code}\n</script>'


bundled = re.sub(r'<script src="([^"]+)"></script>', inline, html)
bundled = bundled.replace(
    "<title>IRON V1 DEMO · Aethrion — Motor Cognitivo</title>",
    "<title>Iron V1 Demo · Aethrion — Motor Cognitivo Universal</title>",
)
if '<script src="' in bundled:
    sys.exit("Quedaron scripts externos sin embeber")

OUT.write_text(bundled, encoding="utf-8")
print(f"OK  {OUT}  ({OUT.stat().st_size / 1024:.0f} KB)")
print(f"    scripts embebidos: {bundled.count('<script')}")
