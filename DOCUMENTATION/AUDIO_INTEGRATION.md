# Integración de Audio Contextual (`audio_vgai.js` + `assets/audio/manifest.json`)

## 1. Inventario y Compresión (FFmpeg EBU R128)
- **Origen**: 47 archivos originales en `assets/voz/` (`19.96 MB` sumando WAV PCM 16-bit y MP3) + 6 maestros WAV generados para puertas en `assets/audio/original/doors/`.
- **Respaldo sin sobrescritura**: Todos los originales copiados en `assets/audio/original/` (y `assets/voz/` permanece intacto).
- **Normalización y transcodificación**: EBU R128 (`loudnorm=I=-16:TP=-1.5:LRA=11`) a `44100 Hz`, mono (estéreo conservado en `plane.wav`):
  - **Primario OGG Vorbis (`-q:a 4`)**: `53` archivos (`2,502,735` bytes, ratio global `12.5%`).
  - **Respaldo MP3 (`-q:a 5`)**: `53` archivos (`2,411,080` bytes, ratio global `12.1%`).

## 2. Mapeo Contextual en Gameplay
- **Voces Kokoro en español (`priority: 10`)**: `brenner_01`, `civil_01`, `falk_01/02`, `koller_01/02/03`, `varsk_01` integradas en diálogos de campaña (`talk`/`say`/`VOZ40`) y cierres de misión 19 y 20.
- **Voces alemanas de combate y oficiales (`de`, `priority: 6–9`)**: `dialogos/ES_Ger_*`, `dialogos/GE_cmd_*` y `dialogos/gfm/*` disparadas según facción Veyrn, órdenes de escuadra (`orderLt`), asaltos, blindados (`gfm_feindpanzer`), impactos (`gfm_treffer1`) y explosiones (`gfm_bunkerexplosion2`).
- **Voces inglesas de combate y aviación (`en`, `priority: 5–9`)**: `dialogos/alertadetanqueENG.wav` y `dialogos/Hoeve/*` mapeadas a unidades Volskaya/aliadas, alertas antitanque, repliegues y comunicaciones aéreas.
- **Vehículos (`vehiculos/*`, `priority: 8`)**: `disparotanquemedio`, `movimientotanque`, `flyby` y `plane` conectados a cañones, proximidad de blindados y pasadas aéreas.
- **Agua y ambiente (`agua/watersound.wav`, `priority: 2`)**: Bucle continuo adaptativo en mapas costeros/fluviales (`15`, `17`, `19`, y proximidad al río en `18` y `20`), además de registro de `AMB35[18]`, `AMB35[19]`, `AMB35[20]`.
- **Puertas (`doors/*`, `priority: 7`)**: 6 clips (`steel`, `wood`, `glass` × `open`, `close`) disparados por `DOORS_VGAI.setDoorOpen()` con respaldo procedural WebAudio si el buffer aún no terminó de decodificarse.

## 3. Reglas de Mezcla y Concurrencia
- Máximo **4 voces humanas simultáneas** (con reemplazo si entra prioridad ≥ 9), máximo **12 SFX simultáneos**.
- Ventana **anti-repetición** (últimos 4 IDs reproducidos) y **cooldowns** por evento (`1.2–7.5 s`).
- **Atenuación espacial 3D** por distancia, paneo estéreo (`StereoPannerNode`) y filtro paso-bajo progresivo (`BiquadFilterNode`) por encima de `26 m`.
