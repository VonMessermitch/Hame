# Auditoría Técnica — Sombras sobre el Nilo 1909 + Aethrion (V.GAI.1.0)

## 1. Arquitectura General
- **Motor 3D**: Three.js r128 embebido sin dependencias externas en tiempo de ejecución.
- **Idioma / Tiempo de ejecución**: JavaScript ES2020 sobre HTML5 + WebGL + WebAudio, servido por `server.js` (Express `^4.21.2` en puerto `3000`).
- **Base de campaña**: `Sombras_sobre_el_Nilo_1909_v41.html` (capítulos 1–18 + capa cognitiva Aethrion `v40` + voces Kokoro `VOZ40`).
- **Capa V.GAI.1.0**: 6 módulos aditivos en `vGAI/src/` compilados sobre `v41` hacia `Sombras_sobre_el_Nilo_1909_V.GAI.1.0.html` y `V.GAI.1.0/Sombras_sobre_el_Nilo_1909_V.GAI.1.0.html`:
  1. `vGAI/src/registry_vgai.js` — Registro central de modelos, texturas y cachés `CanvasTexture`.
  2. `vGAI/src/audio_vgai.js` — Sistema de audio contextual HTTP sobre `assets/audio/manifest.json`.
  3. `vGAI/src/hud_compass_vgai.js` — Brújula, minimapa universal (niveles 1–20) y layout HUD sin solapes.
  4. `vGAI/src/doors_vgai.js` — 3 modelos procedurales de puertas interactivas e interiores.
  5. `vGAI/src/missions_veyrn_vgai.js` — Niveles 19 y 20 (Campaña de Veyrn).
  6. `vGAI/src/perf_vgai.js` — Control de presupuesto de partículas/ragdolls y limpieza de cachés.

## 2. Problemas Detectados y Reparados
- **Brújula y minimapa restringidos**: `mm27(dt)` en `src/v27.js` estaba limitado a niveles `13–14` (con envoltorios aislados en `17` y `18`) y leía `yaw` directo en lugar de la orientación real de cámara. Reparado en `hud_compass_vgai.js` mediante `cam.getWorldDirection` y suavizado angular sin saltos `0°/360°`.
- **Solapes HUD**: `#bap18` (`left:16px; top:186px`) se superponía a `#mm27`. Reubicado mediante reglas CSS responsivas (`#css_vgai_hud`).
- **Audio externo sin pipeline ni integración**: `assets/voz/` contenía 47 archivos sin compresión ni mapeo contextual unificado. Procesados en 53 clips normalizados (`.ogg` + `.mp3`) e integrados en `AUDIO_VGAI`.
- **Ambientes faltantes**: `AMB35[18]`, `AMB35[19]` y `AMB35[20]` no estaban registrados en `v35_audio.js`; parcheados en `audio_vgai.js`.
- **Aislamiento de cielo/suelo**: `v32_env.js` y `v38_env.js` desactivan nieve/niebla/cull/floor fuera de `level === 17` / `level === 18`; replicado de forma segura para los niveles `19` y `20`.
- **Compatibilidad CJS/ESM en pruebas heredadas**: El `package.json` raíz (`"type": "module"`) impedía ejecutar `iron-v1-demo/tests/engine_tests.js` y `v40/tests/v40_tests.js` directamente; resuelto con `vGAI/tests/run_legacy_tests.cjs` sin modificar los tests originales.
