#!/usr/bin/env python3
"""
Phase 3 Audio Processing Pipeline for V.GAI.1.0
- Non-destructive: keeps assets/voz/ completely untouched.
- Copies raw originals to assets/audio/original/.
- Generates 6 procedural WAV door SFX in assets/audio/original/doors/.
- Transcodes & normalizes (-16 LUFS) everything to .ogg (primary) and .mp3 (fallback)
  at 44100 Hz in assets/audio/processed/.
- Outputs comprehensive assets/audio/manifest.json.
"""
import json
import math
import os
import shutil
import struct
import subprocess
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
VOZ_DIR = ROOT / "assets" / "voz"
ORIG_DIR = ROOT / "assets" / "audio" / "original"
PROC_DIR = ROOT / "assets" / "audio" / "processed"
MANIFEST_PATH = ROOT / "assets" / "audio" / "manifest.json"


def synth_door_wavs():
    """Synthesize realistic procedural door SFX masters (44100 Hz, 16-bit PCM)."""
    doors_dir = ORIG_DIR / "doors"
    doors_dir.mkdir(parents=True, exist_ok=True)
    sr = 44100

    def write_wav(name, samples):
        p = doors_dir / f"{name}.wav"
        peak = max((abs(x) for x in samples), default=1.0) or 1.0
        scale = min(1.0, 0.85 / peak) * 32767.0
        with wave.open(str(p), "wb") as wf:
            wf.setnchannels(1)
            wf.setsampwidth(2)
            wf.setframerate(sr)
            raw = bytearray()
            for x in samples:
                v = max(-32767, min(32767, int(x * scale)))
                raw += struct.pack("<h", v)
            wf.writeframes(bytes(raw))
        return p

    # Deterministic pseudo-noise helper
    def lcg(seed):
        s = seed
        while True:
            s = (s * 1664525 + 1013904223) & 0xFFFFFFFF
            yield (s / 2147483648.0) - 1.0

    # 1. Steel door open: heavy latch release + metallic creak
    rng = lcg(101)
    n = int(sr * 0.65)
    s_open = []
    for i in range(n):
        t = i / sr
        latch = math.exp(-t * 48) * math.sin(2 * math.pi * 190 * t) * 0.9 + (next(rng) * math.exp(-t * 60) * 0.5)
        creak_f = 135 + 45 * math.sin(2 * math.pi * 6 * t)
        creak = math.exp(-max(0, t - 0.08) * 4.5) * (0.45 * math.sin(2 * math.pi * creak_f * t) + 0.25 * math.sin(2 * math.pi * creak_f * 2.13 * t))
        if t < 0.08:
            creak = 0.0
        s_open.append(latch + creak)
    write_wav("door_steel_open", s_open)

    # 2. Steel door close: heavy metallic thud + bolt slam
    rng = lcg(202)
    n = int(sr * 0.50)
    s_close = []
    for i in range(n):
        t = i / sr
        impact = math.exp(-t * 22) * (math.sin(2 * math.pi * 92 * t) * 0.9 + math.sin(2 * math.pi * 245 * t) * 0.5 + next(rng) * 0.4)
        ring = math.exp(-t * 9) * math.sin(2 * math.pi * 520 * t) * 0.18
        s_close.append(impact + ring)
    write_wav("door_steel_close", s_close)

    # 3. Wood door open: crisp latch click + warm wooden creak
    rng = lcg(303)
    n = int(sr * 0.55)
    w_open = []
    for i in range(n):
        t = i / sr
        click = math.exp(-t * 95) * (math.sin(2 * math.pi * 680 * t) + next(rng) * 0.6) * 0.55
        creak = 0.0
        if 0.05 < t < 0.52:
            tt = t - 0.05
            f = 220 + 60 * math.sin(2 * math.pi * 9 * tt)
            creak = math.exp(-tt * 5.0) * 0.35 * math.sin(2 * math.pi * f * tt) * (0.6 + 0.4 * math.sin(2 * math.pi * 18 * tt))
        w_open.append(click + creak)
    write_wav("door_wood_open", w_open)

    # 4. Wood door close: hollow timber thump + latch
    rng = lcg(404)
    n = int(sr * 0.42)
    w_close = []
    for i in range(n):
        t = i / sr
        thump = math.exp(-t * 28) * (math.sin(2 * math.pi * 115 * t) * 0.95 + next(rng) * 0.35)
        w_close.append(thump)
    write_wav("door_wood_close", w_close)

    # 5. Wood+Glass door open: wooden click + high glass pane shimmer
    rng = lcg(505)
    n = int(sr * 0.55)
    g_open = []
    for i in range(n):
        t = i / sr
        click = math.exp(-t * 80) * (math.sin(2 * math.pi * 540 * t) + next(rng) * 0.5) * 0.5
        shimmer = math.exp(-max(0, t - 0.03) * 8.5) * (0.32 * math.sin(2 * math.pi * 1950 * t) + 0.22 * math.sin(2 * math.pi * 2870 * t))
        g_open.append(click + shimmer)
    write_wav("door_glass_open", g_open)

    # 6. Wood+Glass door close: wood thud + subtle pane rattle
    rng = lcg(606)
    n = int(sr * 0.48)
    g_close = []
    for i in range(n):
        t = i / sr
        thump = math.exp(-t * 30) * (math.sin(2 * math.pi * 125 * t) * 0.85 + next(rng) * 0.3)
        rattle = math.exp(-max(0, t - 0.02) * 10.0) * (0.35 * math.sin(2 * math.pi * 2340 * t) * math.sin(2 * math.pi * 28 * t) + 0.25 * math.sin(2 * math.pi * 3120 * t))
        g_close.append(thump + rattle)
    write_wav("door_glass_close", g_close)


def classify(rel_posix: str, kokoro_meta: dict) -> dict:
    name = Path(rel_posix).stem
    lower = rel_posix.lower()

    if lower.startswith("doors/"):
        return {
            "category": "sfx_door",
            "event": name,
            "characterOrFaction": "environment",
            "language": "sfx",
            "priority": 7,
        }
    if lower == "agua/watersound.wav":
        return {
            "category": "ambient_water",
            "event": "amb_water_coast",
            "characterOrFaction": "environment",
            "language": "sfx",
            "priority": 2,
        }
    if lower.startswith("vehiculos/"):
        ev_map = {
            "disparotanquemedio": "tank_cannon_fire",
            "flyby": "aircraft_flyby",
            "movimientotanque": "tank_engine_move",
            "plane": "aircraft_engine",
        }
        return {
            "category": "sfx_vehicle",
            "event": ev_map.get(name.lower(), name.lower()),
            "characterOrFaction": "vehicle",
            "language": "sfx",
            "priority": 8,
        }
    if name in kokoro_meta:
        char_map = {
            "koller_01": "Sargento Koller (Eisenmark)",
            "koller_02": "Sargento Koller (Eisenmark)",
            "koller_03": "Sargento Koller (Eisenmark)",
            "brenner_01": "Oficial Brenner (Eisenmark)",
            "falk_01": "Oficial Falk (Marina Eisenmark)",
            "falk_02": "Oficial Falk (Marina Eisenmark)",
            "varsk_01": "Teniente Varsk (Volskaya)",
            "civil_01": "Narración / Epílogo",
        }
        return {
            "category": "dialogue_campaign",
            "event": f"kokoro_{name}",
            "characterOrFaction": char_map.get(name, "Oficial"),
            "language": "es",
            "priority": 10,
            "subtitle": kokoro_meta[name].get("texto", ""),
        }
    if lower.startswith("dialogos/gfm/"):
        ev_map = {
            "gfm_bunkerexplosion2": ("sfx_voice_combat", "bunker_explosion", "Veyrn / Bunker", 9),
            "gfm_feindpanzer": ("voice_combat_de", "tank_spotted_de", "Veyrn / Soldado", 9),
            "gfm_feindpanzerrunter": ("voice_combat_de", "tank_damaged_de", "Veyrn / Artillero", 8),
            "gfm_feuer": ("voice_order_de", "order_fire_de", "Veyrn / Oficial", 8),
            "gfm_funk": ("voice_radio_de", "radio_chatter_de", "Veyrn / Radio", 6),
            "gfm_grundel": ("voice_combat_de", "combat_callout_de", "Veyrn / Escuadra", 6),
            "gfm_luken": ("voice_combat_de", "tank_hatches_de", "Veyrn / Tripulación", 7),
            "gfm_mayer1": ("voice_officer_de", "officer_order_de_1", "Veyrn / Comandante", 7),
            "gfm_mayer2": ("voice_officer_de", "officer_order_de_2", "Veyrn / Comandante", 7),
            "gfm_mayer3": ("voice_officer_de", "officer_order_de_3", "Veyrn / Comandante", 7),
            "gfm_siekommen": ("voice_combat_de", "enemy_wave_de", "Veyrn / Defensor", 8),
            "gfm_strand": ("voice_combat_de", "beach_assault_de", "Veyrn / Desembarco", 8),
            "gfm_treffer1": ("voice_combat_de", "direct_hit_de", "Veyrn / Artillero", 8),
        }
        cat, ev, fac, prio = ev_map.get(name.lower(), ("voice_combat_de", name.lower(), "Veyrn", 6))
        return {"category": cat, "event": ev, "characterOrFaction": fac, "language": "de", "priority": prio}

    if lower.startswith("dialogos/hoeve/"):
        ev_map = {
            "assembled": ("voice_order_en", "squad_assembled", "Volskaya / Aliado", 7),
            "fallbackandcover": ("voice_order_en", "order_retreat_cover", "Volskaya / Aliado", 8),
            "fallbackletsgo": ("voice_order_en", "order_retreat_move", "Volskaya / Aliado", 8),
            "fallbackoncommand": ("voice_order_en", "order_retreat_ready", "Volskaya / Aliado", 7),
            "findaspot": ("voice_order_en", "order_take_cover", "Volskaya / Aliado", 6),
            "goodluck": ("voice_dialogue_en", "mission_goodluck", "Volskaya / Oficial", 7),
            "makitacross": ("voice_combat_en", "bridge_cross_en", "Volskaya / Soldado", 7),
            "movingnorth": ("voice_order_en", "order_advance_north", "Volskaya / Oficial", 7),
            "pegnight_copilot_01_no_bavent": ("voice_aircraft_en", "air_copilot_en", "Aviación", 7),
            "pegnight_glider_02_no_bavent": ("voice_aircraft_en", "air_approach_en", "Aviación", 7),
            "pool1": ("voice_combat_en", "combat_callout_en_1", "Volskaya / Soldado", 5),
            "pool2": ("voice_combat_en", "combat_callout_en_2", "Volskaya / Soldado", 5),
            "roadblock": ("voice_combat_en", "roadblock_spotted", "Volskaya / Explorador", 7),
            "run": ("voice_combat_en", "under_heavy_fire_en", "Volskaya / Soldado", 8),
        }
        cat, ev, fac, prio = ev_map.get(name.lower(), ("voice_combat_en", name.lower(), "Volskaya / Aliado", 6))
        return {"category": cat, "event": ev, "characterOrFaction": fac, "language": "en", "priority": prio}

    # Root dialogos/ clips
    ev_map = {
        "alertadetanqueeng": ("voice_combat_en", "tank_alert_en", "Allied / Antitank", 9),
        "es_ger_a_001_theenemy": ("voice_combat_de", "enemy_spotted_de_1", "Veyrn / Soldado", 8),
        "es_ger_a_002alt_amerikaner": ("voice_combat_de", "enemy_spotted_de_2", "Veyrn / Soldado", 8),
        "es_ger_b_005_itsthem": ("voice_combat_de", "enemy_spotted_de_3", "Veyrn / Soldado", 8),
        "ge_cmd_movein": ("voice_order_de", "order_move_in_de", "Veyrn / Oficial", 8),
        "ge_cmd_rightflank": ("voice_order_de", "order_right_flank_de", "Veyrn / Oficial", 8),
        "ge_cmd_together": ("voice_order_de", "order_regroup_de", "Veyrn / Oficial", 8),
    }
    cat, ev, fac, prio = ev_map.get(name.lower(), ("voice_combat", name.lower(), "Veyrn / Volskaya", 6))
    lang = "en" if "eng" in name.lower() else "de"
    return {"category": cat, "event": ev, "characterOrFaction": fac, "language": lang, "priority": prio}


def probe(path: Path) -> dict:
    out = subprocess.check_output(
        [
            "ffprobe", "-v", "error", "-show_entries",
            "format=duration,size:stream=codec_name,sample_rate,channels",
            "-of", "json", str(path),
        ],
        text=True,
    )
    data = json.loads(out)
    fmt = data.get("format", {})
    st = (data.get("streams") or [{}])[0]
    return {
        "duration": round(float(fmt.get("duration") or 0), 3),
        "size": int(fmt.get("size") or path.stat().st_size),
        "codec": st.get("codec_name", ""),
        "sampleRate": int(st.get("sample_rate") or 44100),
        "channels": int(st.get("channels") or 1),
    }


def transcode(src: Path, dst_ogg: Path, dst_mp3: Path, channels: int):
    dst_ogg.parent.mkdir(parents=True, exist_ok=True)
    dst_mp3.parent.mkdir(parents=True, exist_ok=True)
    ch = str(min(2, max(1, channels)))
    # Loudness-normalized speech/SFX at 44100 Hz
    af = "loudnorm=I=-16:TP=-1.5:LRA=11"
    subprocess.run(
        ["ffmpeg", "-y", "-v", "error", "-i", str(src), "-af", af, "-ar", "44100", "-ac", ch, "-c:a", "libvorbis", "-q:a", "4", str(dst_ogg)],
        check=True,
    )
    subprocess.run(
        ["ffmpeg", "-y", "-v", "error", "-i", str(src), "-af", af, "-ar", "44100", "-ac", ch, "-c:a", "libmp3lame", "-q:a", "5", str(dst_mp3)],
        check=True,
    )


def main():
    ORIG_DIR.mkdir(parents=True, exist_ok=True)
    PROC_DIR.mkdir(parents=True, exist_ok=True)

    kokoro_meta = {}
    km_path = VOZ_DIR / "manifest.json"
    if km_path.exists():
        kokoro_meta = json.loads(km_path.read_text(encoding="utf-8"))

    # Copy all original audio files from assets/voz/ to assets/audio/original/
    for src in sorted(VOZ_DIR.rglob("*")):
        if src.is_file() and src.suffix.lower() in {".wav", ".mp3", ".ogg"}:
            rel = src.relative_to(VOZ_DIR)
            dst = ORIG_DIR / rel
            dst.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src, dst)

    # Synthesize procedural door SFX WAV masters into assets/audio/original/doors/
    synth_door_wavs()

    entries = []
    totals = {"origBytes": 0, "oggBytes": 0, "mp3Bytes": 0}

    for orig in sorted(ORIG_DIR.rglob("*")):
        if not orig.is_file() or orig.suffix.lower() not in {".wav", ".mp3", ".ogg"}:
            continue
        rel = orig.relative_to(ORIG_DIR)
        rel_posix = rel.as_posix()
        stem_rel = rel.with_suffix("")
        dst_ogg = (PROC_DIR / stem_rel).with_suffix(".ogg")
        dst_mp3 = (PROC_DIR / stem_rel).with_suffix(".mp3")

        p_orig = probe(orig)
        transcode(orig, dst_ogg, dst_mp3, p_orig["channels"])
        p_ogg = probe(dst_ogg)
        p_mp3 = probe(dst_mp3)

        meta = classify(rel_posix, kokoro_meta)
        totals["origBytes"] += p_orig["size"]
        totals["oggBytes"] += p_ogg["size"]
        totals["mp3Bytes"] += p_mp3["size"]

        entries.append({
            "id": rel.with_suffix("").as_posix().replace("/", "_").lower(),
            "originalName": f"assets/audio/original/{rel_posix}",
            "sourceVozPath": None if rel_posix.startswith("doors/") else f"assets/voz/{rel_posix}",
            "processedName": f"assets/audio/processed/{stem_rel.as_posix()}.ogg",
            "processedOgg": f"assets/audio/processed/{stem_rel.as_posix()}.ogg",
            "processedMp3": f"assets/audio/processed/{stem_rel.as_posix()}.mp3",
            "format": "ogg/vorbis (primary), mp3 (fallback)",
            "originalFormat": p_orig["codec"],
            "duration": p_ogg["duration"],
            "sampleRate": p_ogg["sampleRate"],
            "channels": p_ogg["channels"],
            "originalSize": p_orig["size"],
            "compressedSize": p_ogg["size"],
            "compressedSizeOgg": p_ogg["size"],
            "compressedSizeMp3": p_mp3["size"],
            "compressionRatio": round(p_ogg["size"] / max(1, p_orig["size"]), 3),
            **meta,
        })

    manifest = {
        "version": "V.GAI.1.0",
        "generatedAt": "2026-11-25",
        "normalization": "EBU R128 loudnorm I=-16 TP=-1.5 LRA=11 @ 44100Hz",
        "count": len(entries),
        "totals": {
            **totals,
            "overallRatioOgg": round(totals["oggBytes"] / max(1, totals["origBytes"]), 3),
            "overallRatioMp3": round(totals["mp3Bytes"] / max(1, totals["origBytes"]), 3),
        },
        "clips": entries,
    }
    MANIFEST_PATH.write_text(json.dumps(manifest, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Processed {len(entries)} clips -> OGG {totals['oggBytes']} B, MP3 {totals['mp3Bytes']} B (original {totals['origBytes']} B)")


if __name__ == "__main__":
    main()
