# Informe de Rendimiento y Optimización (`perf_vgai.js` + Pipeline)

## 1. Presupuesto de Activos y Compresión de Audio
- **Audio original (`assets/voz/` + maestros puertas)**: `19,959,864` bytes (~`19.04 MB`).
- **Audio procesado (`assets/audio/processed/`)**:
  - `53` archivos `.ogg` (Ogg Vorbis `-q:a 4`): `2,502,735` bytes (~`2.39 MB`, ahorro de `87.5%`).
  - `53` archivos `.mp3` (LAME `-q:a 5`): `2,411,080` bytes (~`2.30 MB`, ahorro de `87.9%`).
- **Compilado HTML (`Sombras_sobre_el_Nilo_1909_V.GAI.1.0.html`)**: `5,572,261` bytes (vs `5,468,228` bytes en `v41`; sobrecarga total de los 6 módulos V.GAI.1.0 ≈ `104 KB` / `+1.9%`).

## 2. Salvaguardas en Tiempo de Ejecución (`perf_vgai.js`)
- **Topes dinámicos de entidades**:
  - Cadáveres/ragdolls activos (`corpses`): máximo `18`.
  - Proyectiles en vuelo (`bullets`): máximo `90`.
  - Partículas (`parts`): máximo `180`.
- **Culling y clima unificados**: Niveles `19` y `20` aplican el recorte por distancia de sectores (`W18.cull`) y niebla dinámica evitando dibujar sectores más allá del límite de visibilidad.
- **Limpieza en transición**: Al ejecutarse `clearStage()`, `REGISTRY_VGAI.disposeCache()` libera las `CanvasTexture` cacheadas antes de construir el siguiente teatro.
- **Cero telemetría en HUD**: No se muestran contadores de diagnóstico ni bitácoras en la interfaz del jugador.
