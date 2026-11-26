# Resultados de Pruebas — V.GAI.1.0

## 1. Suite Automatizada V.GAI.1.0 (`node vGAI/tests/vgai_tests.mjs`)
- **Resultado**: `7 / 7` pruebas superadas (`0` fallidas).
  1. Orientación cardinal de brújula (`-Z = N = 0°`, `+X = E = 90°`, `+Z = S = 180°`, `-X = O = 270°`).
  2. Interpolación sin saltos en el cruce `0° / 360°` (`shortestAngleDiffDeg(355, 5) = +10°`, `(5, 355) = -10°`).
  3. Integridad del manifiesto de audio: `53` clips en `assets/audio/manifest.json`, frecuencia `44100 Hz`, presencia en disco de los `53` originales, `53` `.ogg` y `53` `.mp3`.
  4. Catálogos 3D y texturas: `10` categorías, `21` modelos, `10` texturas y `20` niveles registrados en `model_catalog.json` y `resource_registry.json`.
  5. Colisionadores dinámicos de puertas: `DOORS_VGAI.toggleDoorCollider()` inserta/retira el colisionador en `obstB` y limpia `NV.sig = ''`.
  6. Análisis sintáctico (`vm.Script`) de los 6 módulos `vGAI/src/*.js`.
  7. Integridad del HTML compilado (`Sombras_sobre_el_Nilo_1909_V.GAI.1.0.html`, `5,582,412` bytes UTF-8) idéntico en raíz y en `V.GAI.1.0/`, con presencia de `startLevel17..20`, `opt_vgai_19`, `opt_vgai_20` y preservación de `v39` y `v41`.

## 2. Suites Heredadas (`node vGAI/tests/run_legacy_tests.cjs`)
- `iron-v1-demo/tests/engine_tests.js`: **`20 / 20` correctas**, `0` fallidas.
- `v40/tests/v40_tests.js`: **`24 / 24` correctas**, `0` fallidas (`676 ms`).

## 3. Verificación HTTP Express (Modo Híbrido)
Todos los recursos consultados sobre Express devolvieron **HTTP 200 OK**:
- `GET /` (`5,582,412` bytes)
- `GET /assets/audio/manifest.json` (`49,072` bytes)
- `GET /assets/audio/processed/doors/door_steel_open.ogg` (`6,172` bytes)
- `GET /assets/audio/processed/doors/door_glass_open.mp3` (`3,324` bytes)
- `GET /assets/audio/processed/brenner_01.ogg` (`51,959` bytes)
- `GET /assets/audio/processed/dialogos/gfm/gfm_feindpanzer.ogg` (`16,508` bytes)
- `GET /assets/catalog/model_catalog.json` (`15,711` bytes)
- `GET /assets/catalog/resource_registry.json` (`4,180` bytes)

## 4. Alcance y Limitaciones del Entorno
- Todas las pruebas unitarias, de sintaxis, integridad de activos en disco, generación FFmpeg y servicio HTTP Express fueron ejecutadas y verificadas directamente en el entorno Linux.
- No se dispone de navegador con aceleración WebGL/AudioContext en este sandbox sin cabeza para ejecutar una sesión interactiva completa de renderizado 3D o playtest manual con ratón/táctil en vivo.
