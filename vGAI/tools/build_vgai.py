#!/usr/bin/env python3
"""
Compila Sombras_sobre_el_Nilo_1909_V.GAI.1.0.html a partir de
Sombras_sobre_el_Nilo_1909_v41.html inyectando los módulos V.GAI.1.0
sin alterar v39 ni v41 ni los niveles 1..18.
Genera además la carpeta distribuible V.GAI.1.0/.
"""
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SRC_HTML = ROOT / "Sombras_sobre_el_Nilo_1909_v41.html"
OUT_ROOT_HTML = ROOT / "Sombras_sobre_el_Nilo_1909_V.GAI.1.0.html"
OUT_DIR = ROOT / "V.GAI.1.0"
OUT_DIR_HTML = OUT_DIR / "Sombras_sobre_el_Nilo_1909_V.GAI.1.0.html"

MODULES = [
    "vGAI/src/core_vgai.js",
    "vGAI/src/registry_vgai.js",
    "vGAI/src/audio_vgai.js",
    "vGAI/src/hud_compass_vgai.js",
    "vGAI/src/doors_vgai.js",
    "vGAI/src/missions_veyrn_vgai.js",
    "vGAI/src/ai_tactical_vgai.js",
    "vGAI/src/levels_arch_vgai.js",
    "vGAI/src/weapons_vgai.js",
    "vGAI/src/vehicles_at_vgai.js",
    "vGAI/src/paratroopers_vgai.js",
    "vGAI/src/battlefield_vgai.js",
    "vGAI/src/perf_vgai.js",
]


def safe_inline_js(code: str) -> str:
    return code.replace("</script>", "<\\/script>")


def main():
    if not SRC_HTML.exists():
        raise SystemExit(f"No existe {SRC_HTML}")
    html = SRC_HTML.read_text(encoding="utf-8")

    old_title = "<title>Sombras sobre el Nilo — 1909 (v41 · Edición Aethrion · modelos mejorados)</title>"
    new_title = (
        "<title>Sombras sobre el Nilo 1909 · V.GAI.1.0</title>\n"
        '<meta name="description" content="HTML5/Three.js 3D action campaign and Aethrion cognitive NPC simulation (v41 · V.GAI.1.0).">\n'
        '<meta property="og:title" content="Sombras sobre el Nilo 1909">\n'
        '<meta property="og:description" content="HTML5/Three.js 3D action campaign and Aethrion cognitive NPC simulation (v41 · V.GAI.1.0).">'
    )
    if old_title in html:
        html = html.replace(old_title, new_title, 1)

    blocks = []
    for rel in MODULES:
        p = ROOT / rel
        if not p.exists():
            raise SystemExit(f"Falta módulo: {rel}")
        js = safe_inline_js(p.read_text(encoding="utf-8"))
        blocks.append(f'<script data-vgai-module="{rel}">\n{js}\n</script>')

    injection = "\n<!-- ==================== CAPA V.GAI.1.0 ==================== -->\n" + "\n".join(blocks) + "\n</body>"
    marker = "</body>"
    idx = html.rfind(marker)
    if idx < 0:
        raise SystemExit("No se encontró </body> en v41")
    out_html = html[:idx] + injection + html[idx + len(marker):]

    OUT_ROOT_HTML.write_text(out_html, encoding="utf-8")
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    OUT_DIR_HTML.write_text(out_html, encoding="utf-8")

    # Notas de versión y script de tag Git
    (OUT_DIR / "RELEASE_NOTES.md").write_text(
        """# Sombras sobre el Nilo 1909 + Aethrion · V.GAI.1.0 (IRON FOUNDRY)

## Resumen de cambios
- **Campaña completa (Niveles 1–20)**: Niveles 1–18 intactos + **Nivel 19 (XIX · Operación Rompeolas, Veyrn en Karsk)** y **Nivel 20 (XX · Bastión de Hierro, Veyrn en Varnholt)** con 6 puntos de control reales y objetivos secundarios.
- **Puertas e interiores (`doors_vgai.js` + `core_vgai.js`)**: Nivelación automática al terreno real (`sampleDoorY`), supresión de hojas congeladas en casamatas/búnkeres/vías, sincronía de puerta de cabina del Zepelín (L12), AABB orientados por bisagra en `obstB` con invalidación `NV.sig` y empuje anti-atrapamiento.
- **Cerebro táctico NPC y colisiones globales (`ai_tactical_vgai.js`)**: Eliminación de omnisciencia global (`AI33.cfg.rumor`), conos de visión/sigilo/niebla, memoria LKP con decaimiento, emoción/moral Iron Mod, asignación de cobertura sin solapes, bloqueo de fuego amigo, recarga a cubierto y `solveSoldierCollisions` global con verificación contra muros.
- **Arquitectura de niveles (`levels_arch_vgai.js`)**: Mejoras tácticas en *Las Tres Cruces* (L17/19), *Martillo de Hierro* (L18/20), entornos urbanos L13/L14 y preservación de calzadas >= 6 m para tanques.
- **Armamento en 1.ª persona (`weapons_vgai.js`)**:
  - Nivel 12 (Zepelín): restricción estricta a Pistola Lugy 7,65 mm (modelo único en 1.ª persona).
  - Niveles 17–20: contenedor militar verde oliva con puertas abiertas, colisionadores y recogida interactiva `[E]` del **Fusil Antitanque AT-18** con daño AP real contra blindados.
  - Ametralladora MG08: rediseño visual `mkMG08` y vista dedicada en 1.ª persona (`VM32.R.MG`) con cinta animada y vapor.
- **Vehículos y dotaciones (`vehicles_at_vgai.js`)**: Tanques Sokol/Vrak a escala `+18%`, cañones AT `+15%`, corrección de fusil colgado a la espalda (`slingRif`) para artilleros de AT/MG y onda de choque en disparo.
- **Paracaidistas de Taijin (`paratroopers_vgai.js`)**: Deriva por viento, inflado de campana, separación entre pares, evasión de canal/obstáculos y aterrizaje seguro sobre terreno transitable.
- **Audio contextual (`audio_vgai.js`)**: 53 clips normalizados (EBU R128 `-16 LUFS`) en OGG/MP3 más perfiles espaciales 3D dedicados por arma, recarga e impacto con limitación de frecuencia.
""",
        encoding="utf-8",
    )

    tag_sh = OUT_DIR / "prepare_tag.sh"
    tag_sh.write_text(
        """#!/usr/bin/env bash
set -euo pipefail
if [ ! -d .git ]; then
  git init
  git add -A
  git commit -m "Release V.GAI.1.0: Sombras sobre el Nilo 1909 + Aethrion"
fi
git tag -f V.GAI.1.0 -m "Versión V.GAI.1.0 lista para entrega"
echo "Tag V.GAI.1.0 preparado."
""",
        encoding="utf-8",
    )
    tag_sh.chmod(0o755)
    print(f"Built {OUT_ROOT_HTML.name} ({len(out_html)} bytes) + V.GAI.1.0/")


if __name__ == "__main__":
    main()
