# Evaluación Técnica de Iron Mod (`iron-v1-demo/`) y Capa `v40/`

**Estándar:** IRON FOUNDRY · Auditoría de Agente 7  
**Fecha:** 2026-11-25  
**Objetivo:** Clasificar rigurosamente todos los módulos de `iron-v1-demo/ai/` (20 archivos) y `v40/src/` (4 archivos) para integrar únicamente los sistemas probados, compatibles y de alto valor en `V.GAI.1.0`.

---

## Criterio de clasificación

- **A — Integrar:** Lógica matemática o de comportamiento limpia, determinista, sin estado global conflictivo, integrable directo vía `core_vgai.js` y `ai_tactical_vgai.js`.
- **B — Adaptar:** Concepto sólido pero acoplado al mundo de demo (`Iron_V1_Demo.html`) o a objetos incompatibles; se extrae el algoritmo en forma pura con presupuesto por fotograma.
- **C — Inspiración:** Sirve como referencia conceptual para diseño o QA sin copiar código.
- **D — Descartar:** Incompatible con el bucle FPS en tiempo real, redundante con módulos ya estabilizados en `v41`/`V.GAI.1.0`, o con coste de CPU/memoria inadecuado.

---

## Inventario de `iron-v1-demo/ai/` (20 módulos)

| Módulo | Subsistema | Clasificación | Decisión técnica y motivo |
|---|---|---|---|
| `core/brain.js` | Arquitectura cognitiva | **B — Adaptar** | Se extrae el ciclo percepción → memoria → emoción → selección táctica adaptado al bucle `AI33` sin asignaciones por frame. |
| `core/util.js` | Utilidades matemáticas/ángulos | **A — Integrar** | Normalización angular y clamping determinista integrados en `core_vgai.js`. |
| `cognition/perception.js` | Visión cono foveal/periférico + ruido | **A — Integrar** | Sustituye la fuga omnisciente (`AI33.cfg.rumor`) con visión realista por cono, postura, niebla y distancia en `computePerception()`. |
| `cognition/memory.js` | LKP y decaimiento temporal | **A — Integrar** | Modela pérdida progresiva de confianza de `lkx/lkz` cuando se rompe la línea de visión (`decayMemory()`). |
| `cognition/emotion.js` | Estrés, miedo, supresión | **B — Adaptar** | Modula dispersión, búsqueda de cobertura y repliegue cuando caen compañeros (`computeEmotionPersonality()`). |
| `cognition/competence.js` | Curvas de habilidad por rol | **B — Adaptar** | Refina precisión, cadencia y velocidad de reacción según rol/veteranía sobre `AI33.prof`. |
| `cognition/reasoning.js` | Evaluación de amenazas | **C — Inspiración** | Referencia para ponderar prioridad de blancos (AT/oficiales/flanqueadores). |
| `personality/personality.js` | Rasgos valentía/agresión/cautela | **A — Integrar** | Perfila comportamiento agresivo/cauteloso/defensivo sin romper los temperamentos `AI33.temp`. |
| `planning/goap.js` | Planificador GOAP | **D — Descartar** | Búsqueda de grafos por agente demasiado costosa y redundante frente a la FSM táctica + escuadra (`thinkE33`/`sqTickE33`). |
| `planning/needs_goals.js` | Necesidades fisiológicas/vida | **D — Descartar** | Orientado a simulación de asentamiento (hambre/descanso), fuera de alcance del combate FPS. |
| `biology/anatomy.js` | Daño anatómico detallado | **C — Inspiración** | Ya cubierto por multiplicadores de zona/postura en `v41` (`e8Hit`). |
| `biology/senses.js` | Sensores base vista/oído | **B — Adaptar** | Fusionado junto con `perception.js` en `computePerception()` y `hearE33`. |
| `biology/species.js` | Definiciones de especies | **D — Descartar** | No aplica a soldados humanos del conflicto 1909/Aethrion. |
| `culture/culture.js` | Normas/cultura de grupo | **C — Inspiración** | Concepto de respuesta por facción aplicado a gritos de combate contextuales (`AUDIO_VGAI`). |
| `environment/astronomy.js` | Ciclo astronómico | **D — Descartar** | La campaña ya usa cielo e iluminación específicos por misión (`sky9`, `sky16`, `sky17`, `sky18`). |
| `environment/climate.js` | Modulador climático | **B — Adaptar** | Multiplicador de visibilidad por niebla/ventisca integrado en `fogKE33` y `computePerception()`. |
| `simulation/combat.js` | Resolución táctica y fuego amigo | **A — Integrar** | Verificación de línea de tiro libre (`hasFriendlyFireRisk()`) y escalonado de ráfagas. |
| `simulation/world.js` | Rejilla de mundo demo | **D — Descartar** | Reemplazado por `NV` y `obstB` reales de `v41`. |
| `interfaces/factory.js` | Fábrica de agentes demo | **D — Descartar** | Incompatible con `sp13`/`sp17`/`npc11` del motor principal. |
| `debug/inspector.js` | Telemetría en pantalla | **D — Descartar** | Mantener la UI limpia sin logs visibles ni paneles de telemetría en pantalla. |

---

## Inventario de `v40/src/` (4 módulos)

| Módulo | Subsistema | Clasificación | Decisión técnica y motivo |
|---|---|---|---|
| `aethrion_soldiers.js` | Siluetas, rangos y uniformes | **C — Inspiración** | Ya consolidado en `Sombras_sobre_el_Nilo_1909_v41.html` (`veyrn32`/`volsk32`). |
| `aethrion_v40.js` | Puente de campaña v40 | **D — Descartar** | Reemplazado por la capa modular `vGAI/src/` para no duplicar parches heredados. |
| `assets_glb.js` | Cargador externo GLB opcional | **D — Descartar** | Los modelos procedurales Three.js r128 actuales cargan en 0 ms sin dependencias externas rotas. |
| `modelos_v40.js` | Variantes de modelos v40 | **B — Adaptar** | Patrones de acabado metálico/madera y detalles de accesorios tomados como base para `MG08`, `AT-18` y contenedor militar. |

---

## Ganancias concretas integradas en V.GAI.1.0

1. **Fin de omnisciencia IA:** Se anula la fuga de coordenadas exactas (`AI33.cfg.rumor`) y se reemplaza por búsqueda basada en memoria LKP decreciente y última fuente acústica real.
2. **Combate táctico de escuadra:** Asignación de slots de cobertura sin apelotonamiento (`allocateCoverSlots`), escalonado de ráfagas, recarga protegida y chequeo estricto de fuego amigo.
3. **Cero asignaciones en caliente:** Todas las evaluaciones cognitivas reutilizan estructuras planas y respetan el presupuesto por fotograma.
