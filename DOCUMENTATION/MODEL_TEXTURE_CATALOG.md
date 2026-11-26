# Catálogo de Modelos 3D y Texturas (`assets/catalog/` + `registry_vgai.js`)

## 1. Estructura de Directorios
Creadas las 10 categorías requeridas bajo `assets/models/` y `assets/textures/`:
`soldiers`, `weapons`, `helmets`, `uniforms`, `buildings`, `doors`, `vehicles`, `props`, `equipment`, `environment`.

## 2. Resumen Cuantitativo Verificado
- **Modelos descriptivos indexados**: `21` fichas JSON en `assets/models/<categoria>/*.json` referenciando los constructores reales del motor (`npc11`, `volsk32`, `veyrn32`, `mkRifle`, `mkSMG`, `mkMG08`, `crearModuloMuralla`, `casemate17/18`, `house17/18`, `DOORS_VGAI`, `tank32`, `AIR38`, etc.), escalas, límites y colisiones, además de vincular los 4 renders de `assets_graphics/renderes/*.png`.
- **Recetas de texturas procedurales**: `10` fichas JSON en `assets/textures/<categoria>/*.json` consumibles en ejecución mediante `REGISTRY_VGAI.getTexture(id)` con caché y limpieza automática al cambiar de nivel (`clearStage`).
- **Catálogos centrales**:
  - `assets/catalog/model_catalog.json`
  - `assets/catalog/resource_registry.json` (unifica los 20 niveles, 21 modelos, 10 texturas, 3 familias de puertas y los 53 clips de `assets/audio/manifest.json`).
