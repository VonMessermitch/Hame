# Changelog — Versión V.GAI.1.0

## [V.GAI.1.0] — 2026-11-25
### Añadido
- **Campaña de Veyrn (Niveles 19 y 20)** en `vGAI/src/missions_veyrn_vgai.js`:
  - Nivel 19 (`XIX · OPERACIÓN ROMPEOLAS`) sobre el mapa Karsk (`X17`) con 6 puntos de control y 2 objetivos secundarios.
  - Nivel 20 (`XX · BASTIÓN DE HIERRO`) sobre el mapa Varnholt (`X18`) con 6 puntos de control y 2 objetivos secundarios.
  - Integración en `#lvsel`, Códice (`#cod`) y `localStorage`.
- **Audio contextual HTTP (`vGAI/src/audio_vgai.js`)** + `53` clips normalizados (`OGG` + `MP3`) en `assets/audio/processed/` y `assets/audio/manifest.json`.
- **Puertas interactivas 3D (`vGAI/src/doors_vgai.js`)** con 3 familias (`steel`, `wood`, `wood_glass`), colisionadores dinámicos (`obstB` + `NV.sig`), uso por IA, sonido y mobiliario interior.
- **Catálogos en 10 categorías** (`assets/models/`, `assets/textures/`, `assets/catalog/model_catalog.json`, `assets/catalog/resource_registry.json`, `vGAI/src/registry_vgai.js`).
- **Compilado y entrega**: `Sombras_sobre_el_Nilo_1909_V.GAI.1.0.html`, paquete `V.GAI.1.0/` (`RELEASE_NOTES.md`, `prepare_tag.sh`) y documentación en `DOCUMENTATION/`.

### Corregido
- **Brújula y minimapa (`vGAI/src/hud_compass_vgai.js`)**: Sincronización real con cámara (`-Z = N = 0°`), suavizado sin saltos `0°/360°`, cobertura de niveles `1–20` y eliminación de solapes con `#bap18` y elementos superiores.
- **Ambientes y suelo**: Parcheados `AMB35[18..20]` y `floorAt` / `weather17` / `weather18` para niveles 19 y 20.
- **Servidor (`server.js`)**: Ruta `/` actualizada a `Sombras_sobre_el_Nilo_1909_V.GAI.1.0.html`.

### Preservado sin modificaciones
- Niveles 1–18, `Sombras_sobre_el_Nilo_1909_v39.html`, `Sombras_sobre_el_Nilo_1909_v41.html` y archivos originales en `assets/voz/`.
