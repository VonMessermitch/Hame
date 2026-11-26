# Auditoría y Reparación Integral de Puertas (`V.GAI.1.0`)

**Responsable:** Agente 5 (Física y Colisiones) + Agente 3 (Arquitectura de Niveles)  
**Módulos modificados:** `vGAI/src/doors_vgai.js`, `vGAI/src/core_vgai.js`

---

## Problemas detectados en la implementación anterior

1. **Altura `y = 0` fija:** `addDoor()` ignoraba desniveles de terreno (`floor17`, `floor18`, `floorAt`) y cubiertas elevadas (Zepelín a `y = 1.5`), dejando puertas flotando o enterradas.
2. **Hojas estáticas congeladas superpuestas:**
   - `casemate17` (`v32_env.js`) y `casemate18` (`v38_env.js`) generaban una hoja estática rotada `1.8 rad` junto al marco mientras `DOORS_VGAI` colocaba otra puerta interactiva en el mismo vano.
   - `dug17` y `dug18` generaban una hoja estática a `x - 0.8` y una losa opaca trasera que impedían usar el refugio como interior real.
   - `rail13` (`v25.js`) generaba hojas estáticas en las casamatas `(X13-25, -524)` y `(X13+45, -524)` y en el vano del granero `(X13+30, -181.8)`.
3. **Coordenadas base obsoletas:** `doors_vgai.js` tenía `X11 = 40000` y `X13 = 80000` como respaldo cuando en `v41` son `X11 = 27000` y `X13 = 40000`.
4. **Colisionador estático no orientado:** Al rotar la hoja entre `0` y `±1.62 rad`, el colisionador no se actualizaba con el AABB orientado de la hoja ni empujaba suavemente a actores atrapados en el marco.

---

## Inventario y corrección aplicada por nivel

| Nivel | Ubicación / ID | Tipo | Corrección |
|---|---|---|---|
| **11** | Cuartel (`X11+18, -56`), Búnker (`X11-22, -84`), Almacén (`X11+8, -72`) | `wood_glass` / `steel` | `X11=27000`, altura `floorAt()`, AABB orientado |
| **12** | Puerta cabina proa (`X12, -22, y=1.5`) | `wood_glass` | Sincronizada con `cdoor12()` sobre cubierta `F=1.5` sin duplicar malla ni colisión |
| **13** | Granero (`X13+30, -181.8`), Casa granja (`X13-18, -287.5`), Casamatas (`X13-23/-25`, `X13+47/+45, -527.95`) | `wood` / `wood_glass` / `steel` | `X13=40000`, supresión de hoja estática de `rail13`, bisagra alineada a jamba |
| **14** | Puesto de control (`X14-14, -148`), Depósito (`X14+24, -295`) | `wood` / `steel` | Altura muestreada en `floorAt()`, apertura `[E]` e IA |
| **17 / 19** | Puesto Karsk sur/norte, Terek, Drovna, Casamatas Línea Tres Cruces | `wood_glass` / `wood` / `steel` | Envoltura de `casemate17` y `dug17` eliminando hojas congeladas y bloqueos traseros, `y = floor17()` |
| **18 / 20** | Cabaña Dravik, Granja meseta, Capilla, Caseta aeródromo, Casas urbanas de Falkenbrück y Túnel | `wood` / `wood_glass` / `steel` | Envoltura de `casemate18` y `dug18` eliminando hojas estáticas, `y = floor18()`, puertas alineadas en edificios accesibles |

---

## Garantías de física y navegación

- `CORE_VGAI.computeOrientedDoorAABB()` calcula el AABB real de la hoja según `ry + angle` alrededor de la bisagra (`hingeX, hingeZ`), sincronizando `obstB` e invalidando `NV.sig = ''`.
- `CORE_VGAI.computeDoorPinchPushout()` evita que el jugador o los NPCs queden encajados al cerrar una puerta.
- Interacción `[E]` unificada con prioridad limpia sobre prompts y apertura automática por aliados/enemigos sin bloquear el paso.
