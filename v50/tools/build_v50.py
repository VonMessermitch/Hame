#!/usr/bin/env python3
"""v50 · Edición Aethrion completa. Compila Sombras_sobre_el_Nilo_1909_v50.html a partir
de Sombras_sobre_el_Nilo_1909_V.GAI.1.0.html (que ya incluye v39 → v40 cerebro → v41 → V.GAI)
inyectando los módulos de v50/src en orden. Uso: python3 v50/tools/build_v50.py [salida.html]"""
import sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "Sombras_sobre_el_Nilo_1909_V.GAI.1.0.html"
MODULES = ["brain_v50.js", "doors_all_v50.js", "veyrn_v50.js", "v50.js"]
def main():
    html = SRC.read_text(encoding="utf-8")
    code = "\n".join("/* ==== v50/src/%s ==== */\n" % m + (ROOT / "v50" / "src" / m).read_text(encoding="utf-8") for m in MODULES)
    code = code.replace("</script>", "<\\/script>")
    # v50.5 · ángulo de mira hacia arriba ampliado (antes −0,25 rad ≈ 14°; ahora −1,2 rad ≈ 69°)
    import re
    html = re.sub(r"(pitch=clamp\([^;]{0,60}?),-\.25,1\.1\)", r"\1,-1.2,1.1)", html)
    html = html.replace("pitch=clamp(pitch,-.4,1.25)", "pitch=clamp(pitch,-1.2,1.25)").replace("Math.min(-.25,pitch)", "Math.min(-1.2,pitch)")
    i = html.rfind("</body>")
    if i < 0: raise SystemExit("No encuentro </body> en la base")
    out = html[:i] + "<script>\n/* ===== v50 · Edición Aethrion completa ===== */\n" + code + "\n</script>\n" + html[i:]
    out = out.replace("<title>Sombras sobre el Nilo 1909 · V.GAI.1.0", "<title>Sombras sobre el Nilo 1909 · v50 Edición Aethrion", 1)
    dst = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "Sombras_sobre_el_Nilo_1909_v50.html"
    dst.write_text(out, encoding="utf-8")
    print("OK", dst, len(out), "bytes")
if __name__ == "__main__":
    main()
