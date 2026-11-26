# Inventario Verificado de Audio y Librería Reutilizable (`V.GAI.1.0`)

**Responsable:** Agente 6 (Ingeniero de Audio)  
**Módulo:** `vGAI/src/audio_vgai.js` + `vGAI/src/core_vgai.js`

---

## 1. Fuentes verificadas en disco (0 rutas inventadas)

1. **`assets/audio/manifest.json` (`53` clips normalizados EBU R128 `-16 LUFS @ 44.1 kHz`)** con pares reales `.ogg` (primario) + `.mp3` (respaldo) en `assets/audio/processed/`:
   - **Voces Kokoro en español (8):** `brenner_01`, `civil_01`, `falk_01`, `falk_02`, `koller_01`, `koller_02`, `koller_03`, `varsk_01`.
   - **Órdenes y gritos de combate en alemán (13):** `ES_Ger_A_001_TheEnemy`, `ES_Ger_A_002alt_Amerikaner`, `ES_Ger_B_005_ItsThem`, `GE_cmd_movein`, `GE_cmd_rightflank`, `GE_cmd_together`, `gfm_bunkerexplosion2`, `gfm_feindpanzer`, `gfm_feindpanzerrunter`, `gfm_feuer`, `gfm_funk`, `gfm_grundel`, `gfm_luken`, `gfm_mayer1..3`, `gfm_siekommen`, `gfm_strand`, `gfm_treffer1` (19 en total bajo `dialogos/` y `gfm/`).
   - **Órdenes y combates en inglés / aviación (14):** `Hoeve/*` (`PegNight_Copilot_01_no_bavent`, `PegNight_Glider_02_no_bavent`, `assembled`, `fallbackandcover`, `fallbackletsgo`, `fallbackoncommand`, `findaspot`, `goodluck`, `makitacross`, `movingnorth`, `pool1`, `pool2`, `roadblock`, `run`) + `alertadetanqueENG`.
   - **Vehículos reales (4):** `vehiculos/disparotanquemedio`, `vehiculos/movimientotanque`, `vehiculos/flyby`, `vehiculos/plane`.
   - **Puertas procesadas (6):** `doors/door_steel_{open,close}`, `doors/door_wood_{open,close}`, `doors/door_glass_{open,close}`.
   - **Ambiente agua (1):** `agua/watersound`.
2. **`assets/voz/` (47 archivos fuente preservados intactos):** todos los `.wav`/`.mp3` originales de voces, radio, vehículos y agua mantienen su ubicación original.

---

## 2. Sistema de perfiles reutilizables (`AUDIO_VGAI`)

| API Pública | Perfiles soportados | Técnica de síntesis / buffer |
|---|---|---|
| `playWeaponProfile(profile, x, z, opts)` | `atrifle`, `mg08`, `atgun`, `rifle`, `smg`, `pistol`, `tank` | Combina buffer real (`tank_cannon_fire` filtrado/pitch para AT-18/cañón AT) o capas WebAudio (transiente metálico + cuerpo subgrave + ruido pasa-banda + cola ecoica), variación `rate` ±6%, espacialización 3D (`pan`, atenuación `d^1.35`, filtro pasa-bajos por distancia). |
| `playReloadProfile(profile, x, z)` | `atrifle`, `mg08`, `rifle`, `smg`, `pistol` | Secuencia mecánica multi-pulso (apertura de cerrojo/tapa, inserción de cartucho/cinta, cierre metálico). |
| `playImpactProfile(surface, x, z, heavy)` | `armor`, `steel`, `wood`, `dirt`, `snow`, `flesh` | Ricochet metálico para impactos en blindaje, impacto sordo en madera/tierra/nieve, control estricto de concurrencia. |
| `playDoor(material, opening, x, z)` | `steel`, `wood`, `wood_glass` | Clips procesados `door_*` con respaldo WebAudio instantáneo si el decode sigue pendiente. |
| `shout(kind, x, z, isVeyrn)` | `order_advance`, `order_regroup`, `order_fire`, `enemy_spotted`, `tank_spotted`, `tank_hit`, `heavy_fire`, `air` | Selección contextual por facción/nivel con anti-repetición (`recentVoiceIds`), cooldowns y tope máximo de 4 voces simultáneas. |

---

## 3. Control de recursos y mezcla

- Límite duro de **4 voces simultáneas** (reemplazo por prioridad) y **12 SFX concurrentes** para evitar saturación en asaltos pesados.
- `CORE_VGAI.computeAudioSpatial()` + `canTriggerRateLimited()` previenen disparos duplicados en el mismo milisegundo y atenúan según distancia real a `cam.position`.
