#!/usr/bin/env python3
"""
Genera la organización completa de modelos 3D, texturas y registro central
para Sombras sobre el Nilo 1909 + Aethrion (versión V.GAI.1.0):
  - assets/models/{soldiers,weapons,helmets,uniforms,buildings,doors,vehicles,props,equipment,environment}/*.json
  - assets/textures/{...}/*.json
  - assets/catalog/model_catalog.json
  - assets/catalog/resource_registry.json
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CATEGORIES = [
    "soldiers", "weapons", "helmets", "uniforms", "buildings",
    "doors", "vehicles", "props", "equipment", "environment",
]

MODELS = [
    {"id": "soldier_eisenmark_inf", "name": "Soldado Eisenmark Hechtgrau", "category": "soldiers", "constructor": "npc11('sol')", "faction": "Eisenmark", "scale": [1, 1, 1], "collider": {"hw": 0.45, "hd": 0.45, "h": 1.8}, "levels": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]},
    {"id": "soldier_volskaya_inf", "name": "Fusilero Volskaya", "category": "soldiers", "constructor": "volsk32", "faction": "Volskaya", "scale": [1, 1, 1], "collider": {"hw": 0.45, "hd": 0.45, "h": 1.8}, "levels": [17, 18, 19, 20]},
    {"id": "soldier_veyrn_inf", "name": "Granadero Veyrn Sturmtrupp", "category": "soldiers", "constructor": "veyrn32", "faction": "Veyrn", "scale": [1, 1, 1], "collider": {"hw": 0.45, "hd": 0.45, "h": 1.8}, "levels": [17, 18, 19, 20]},
    {"id": "weapon_rifle_1909", "name": "Fusil de cerrojo Mannlicher / V98 1909", "category": "weapons", "constructor": "mkRifle", "previewRender": "assets_graphics/renderes/rifle_1909.png", "glbPlanned": "assets_graphics/weapons/rifle_1909.glb", "scale": [2.3, 2.3, 2.3], "bounds": {"w": 0.235, "h": 2.77, "d": 0.32}, "levels": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]},
    {"id": "weapon_smg_sturm", "name": "Subfusil Sturm V22 / MP38", "category": "weapons", "constructor": "mkSMG", "previewRender": "assets_graphics/renderes/smg_sturm.png", "glbPlanned": "assets_graphics/weapons/smg_sturm.glb", "scale": [1.9, 1.9, 1.9], "bounds": {"w": 0.187, "h": 2.22, "d": 0.71}, "levels": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]},
    {"id": "weapon_mg08_maxim", "name": "Ametralladora pesada MG 08", "category": "weapons", "constructor": "mkMG08", "previewRender": "assets_graphics/renderes/mg08_maxim.png", "glbPlanned": "assets_graphics/weapons/mg08_maxim.glb", "scale": [1.8, 1.8, 1.8], "bounds": {"w": 1.468, "h": 1.725, "d": 2.775}, "levels": [4, 7, 11, 13, 17, 18, 19, 20]},
    {"id": "helmet_stahlhelm_veyrn", "name": "Casco acero Veyrn M1916", "category": "helmets", "constructor": "veyrn32.helm", "faction": "Veyrn", "scale": [1, 1, 1], "levels": [17, 18, 19, 20]},
    {"id": "helmet_adrian_volskaya", "name": "Casco campaña Volskaya", "category": "helmets", "constructor": "volsk32.helm", "faction": "Volskaya", "scale": [1, 1, 1], "levels": [17, 18, 19, 20]},
    {"id": "uniform_hechtgrau_1909", "name": "Guerrera Hechtgrau 1909", "category": "uniforms", "constructor": "npc11.torso", "faction": "Eisenmark", "scale": [1, 1, 1], "levels": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]},
    {"id": "uniform_veyrn_winter", "name": "Capote invernal Feldgrau Veyrn", "category": "uniforms", "constructor": "veyrn32.coat", "faction": "Veyrn", "scale": [1, 1, 1], "levels": [17, 18, 19, 20]},
    {"id": "building_muralla_modulo", "name": "Módulo de muralla con adarve", "category": "buildings", "constructor": "crearModuloMuralla", "previewRender": "assets_graphics/renderes/muralla_modulo.png", "glbPlanned": "assets_graphics/buildings/muralla_modulo.glb", "scale": [8, 8, 8], "bounds": {"w": 8.02, "h": 9.9, "d": 5.312}, "levels": [11, 13, 18, 20]},
    {"id": "building_casemate_karsk", "name": "Casamata costera de hormigón", "category": "buildings", "constructor": "casemate17 / casemate18", "scale": [1, 1, 1], "collider": {"hw": 5.3, "hd": 3.5, "h": 3.2}, "levels": [13, 17, 18, 19, 20]},
    {"id": "building_house_interior", "name": "Edificio residencial transitable (interior activo)", "category": "buildings", "constructor": "house17 / house18", "scale": [1, 1, 1], "hasInterior": True, "levels": [11, 13, 17, 18, 19, 20]},
    {"id": "door_steel_bunker", "name": "Puerta Blindada de Acero Remachado", "category": "doors", "constructor": "DOORS_VGAI.create('steel')", "materialType": "steel", "audioOpen": "door_steel_open", "audioClose": "door_steel_close", "bounds": {"w": 1.38, "h": 2.15, "d": 0.14}, "levels": [13, 17, 18, 19, 20]},
    {"id": "door_wood_panel", "name": "Puerta de Madera Reforzada con Tablas y Herrajes", "category": "doors", "constructor": "DOORS_VGAI.create('wood')", "materialType": "wood", "audioOpen": "door_wood_open", "audioClose": "door_wood_close", "bounds": {"w": 1.28, "h": 2.18, "d": 0.10}, "levels": [11, 13, 17, 18, 19, 20]},
    {"id": "door_wood_glass", "name": "Puerta de Madera con Ventanales Translúcidos", "category": "doors", "constructor": "DOORS_VGAI.create('wood_glass')", "materialType": "wood_glass", "audioOpen": "door_glass_open", "audioClose": "door_glass_close", "bounds": {"w": 1.32, "h": 2.22, "d": 0.10}, "levels": [11, 17, 18, 19, 20]},
    {"id": "vehicle_tank_aethrion", "name": "Tanque de Asalto Blindado", "category": "vehicles", "constructor": "tank32 / veh18", "scale": [1, 1, 1], "collider": {"hw": 2.1, "hd": 3.4, "h": 2.4}, "audioMove": "tank_engine_move", "audioFire": "tank_cannon_fire", "levels": [17, 18, 19, 20]},
    {"id": "vehicle_griffin_aircraft", "name": "Biplano / Hidroavión Griffin", "category": "vehicles", "constructor": "AIR38 / air15", "scale": [1, 1, 1], "audioFlyby": "aircraft_flyby", "audioEngine": "aircraft_engine", "levels": [15, 16, 18, 19, 20]},
    {"id": "prop_interior_pack", "name": "Mobiliario interior (cajas, mesas, lámparas, literas)", "category": "props", "constructor": "DOORS_VGAI.populateInterior", "scale": [1, 1, 1], "levels": [11, 13, 17, 18, 19, 20]},
    {"id": "equipment_field_radio", "name": "Equipo de radio de campaña y telégrafo", "category": "equipment", "constructor": "radio32 / pole18", "scale": [1, 1, 1], "levels": [5, 17, 18, 19, 20]},
    {"id": "environment_karsk_varn", "name": "Terrenos Karsk y Distrito Varnholt", "category": "environment", "constructor": "buildKarsk17 / buildVarn18", "scale": [1, 1, 1], "levels": [17, 18, 19, 20]},
]

TEXTURES = [
    {"id": "tex_soldier_skin_cloth", "category": "soldiers", "width": 128, "height": 128, "palette": ["#4a5248", "#3a4038", "#d8b496"], "pattern": "woven_cloth", "levels": [1, 17, 18, 19, 20]},
    {"id": "tex_weapon_blued_steel", "category": "weapons", "width": 128, "height": 128, "palette": ["#2a2e32", "#4e545c", "#6a4424"], "pattern": "brushed_gunmetal", "levels": [1, 17, 18, 19, 20]},
    {"id": "tex_helmet_feldgrau", "category": "helmets", "width": 128, "height": 128, "palette": ["#4a5244", "#32382e", "#d8e0e8"], "pattern": "matte_enamel", "levels": [17, 18, 19, 20]},
    {"id": "tex_uniform_wool", "category": "uniforms", "width": 128, "height": 128, "palette": ["#58625a", "#3e463e", "#c9a45a"], "pattern": "wool_twill", "levels": [1, 17, 18, 19, 20]},
    {"id": "tex_building_concrete_brick", "category": "buildings", "width": 128, "height": 128, "palette": ["#8a8780", "#8e4632", "#b9ae96"], "pattern": "tex17/tex18('b')", "levels": [17, 18, 19, 20]},
    {"id": "tex_door_steel_wood_glass", "category": "doors", "width": 128, "height": 128, "palette": ["#3e4440", "#5e432c", "#9ec6d8"], "pattern": "riveted_steel_and_oak", "levels": [11, 13, 17, 18, 19, 20]},
    {"id": "tex_vehicle_armor_camo", "category": "vehicles", "width": 128, "height": 128, "palette": ["#4a5042", "#2e322a", "#a89878"], "pattern": "riveted_armor_plate", "levels": [15, 17, 18, 19, 20]},
    {"id": "tex_prop_crate_grain", "category": "props", "width": 128, "height": 128, "palette": ["#6a5236", "#4a3824", "#8a704a"], "pattern": "wood_planks", "levels": [11, 13, 17, 18, 19, 20]},
    {"id": "tex_equipment_brass_bakelite", "category": "equipment", "width": 128, "height": 128, "palette": ["#c9a45a", "#26201a", "#786238"], "pattern": "knurled_brass", "levels": [5, 17, 18, 19, 20]},
    {"id": "tex_env_terrain_water_snow", "category": "environment", "width": 128, "height": 128, "palette": ["#c8d0da", "#465c64", "#8a7e64"], "pattern": "tex17('r','w') + tex18('f')", "levels": [17, 18, 19, 20]},
]

LEVELS_META = [
    {"level": 1, "code": "I", "title": "La Grieta de Tebas", "faction": "Eisenmark"},
    {"level": 2, "code": "II", "title": "La Trinchera + Jefe", "faction": "Eisenmark"},
    {"level": 3, "code": "III", "title": "Mazmorra de Stalingrado", "faction": "Eisenmark"},
    {"level": 4, "code": "IV", "title": "Puerto Oriental (MG 08)", "faction": "Eisenmark"},
    {"level": 5, "code": "V", "title": "La Casa Pávlov", "faction": "Eisenmark"},
    {"level": 6, "code": "VI", "title": "La Encrucijada", "faction": "Eisenmark"},
    {"level": 7, "code": "VII", "title": "Las Dos Orillas", "faction": "Eisenmark"},
    {"level": 8, "code": "VIII", "title": "Estación Ferroviaria", "faction": "Eisenmark"},
    {"level": 9, "code": "IX", "title": "El Puente", "faction": "Eisenmark"},
    {"level": 10, "code": "X", "title": "La Ruptura del Norte", "faction": "Eisenmark"},
    {"level": 11, "code": "XI", "title": "Corazón de la Ciudad", "faction": "Eisenmark"},
    {"level": 12, "code": "XII", "title": "El Bastión Central", "faction": "Eisenmark"},
    {"level": 13, "code": "XIII", "title": "Muralla Norte / Tren Blindado", "faction": "Eisenmark"},
    {"level": 14, "code": "XIV", "title": "Ciudadela / Ofensiva Final", "faction": "Eisenmark"},
    {"level": 15, "code": "XV", "title": "Fiordo Kaltfjord", "faction": "Eisenmark"},
    {"level": 16, "code": "XVI", "title": "Aeródromo Taikin", "faction": "Eisenmark"},
    {"level": 17, "code": "XVII", "title": "Golfo de Hierro (Karsk)", "faction": "Volskaya"},
    {"level": 18, "code": "XVIII", "title": "Martillo de Nieve (Varnholt)", "faction": "Volskaya"},
    {"level": 19, "code": "XIX", "title": "Operación Rompeolas (Golfo de Hierro)", "faction": "Veyrn"},
    {"level": 20, "code": "XX", "title": "Bastión de Hierro (Martillo de Nieve)", "faction": "Veyrn"},
]


def main():
    for base in ("models", "textures", "catalog"):
        (ROOT / "assets" / base).mkdir(parents=True, exist_ok=True)
    for cat in CATEGORIES:
        (ROOT / "assets" / "models" / cat).mkdir(parents=True, exist_ok=True)
        (ROOT / "assets" / "textures" / cat).mkdir(parents=True, exist_ok=True)

    model_entries = []
    for m in MODELS:
        rel = f"assets/models/{m['category']}/{m['id']}.json"
        m_full = dict(m, path=rel, version="V.GAI.1.0")
        (ROOT / rel).write_text(json.dumps(m_full, indent=2, ensure_ascii=False), encoding="utf-8")
        model_entries.append(m_full)

    tex_entries = []
    for t in TEXTURES:
        rel = f"assets/textures/{t['category']}/{t['id']}.json"
        t_full = dict(t, path=rel, version="V.GAI.1.0")
        (ROOT / rel).write_text(json.dumps(t_full, indent=2, ensure_ascii=False), encoding="utf-8")
        tex_entries.append(t_full)

    model_catalog = {
        "version": "V.GAI.1.0",
        "categories": CATEGORIES,
        "models": model_entries,
        "textures": tex_entries,
    }
    (ROOT / "assets" / "catalog" / "model_catalog.json").write_text(
        json.dumps(model_catalog, indent=2, ensure_ascii=False), encoding="utf-8"
    )

    audio_manifest_path = ROOT / "assets" / "audio" / "manifest.json"
    audio_data = json.loads(audio_manifest_path.read_text(encoding="utf-8")) if audio_manifest_path.exists() else {"count": 0, "clips": []}

    registry = {
        "version": "V.GAI.1.0",
        "summary": {
            "levels": len(LEVELS_META),
            "models": len(model_entries),
            "textures": len(tex_entries),
            "audioClips": len(audio_data.get("clips", [])),
            "doorFamilies": 3,
        },
        "levels": LEVELS_META,
        "modelsByCategory": {c: [m["id"] for m in model_entries if m["category"] == c] for c in CATEGORIES},
        "texturesByCategory": {c: [t["id"] for t in tex_entries if t["category"] == c] for c in CATEGORIES},
        "audioManifest": "assets/audio/manifest.json",
        "modelCatalog": "assets/catalog/model_catalog.json",
    }
    (ROOT / "assets" / "catalog" / "resource_registry.json").write_text(
        json.dumps(registry, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    print(f"Catalog built: {len(model_entries)} models, {len(tex_entries)} textures, {len(LEVELS_META)} levels, {registry['summary']['audioClips']} audio clips.")


if __name__ == "__main__":
    main()
