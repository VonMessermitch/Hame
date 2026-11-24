# IRON V1 DEMO — Aethrion · Motor Cognitivo Universal

Copia nueva y autónoma del proyecto: un **motor de NPC biológicos, cognitivos y autónomos** para
Aethrion, montado sobre una demo jugable en HTML5 + Three.js (Borgñon, 1922).

- No modifica ni sustituye `Sombras_sobre_el_Nilo_1909_v39.html` ni el resto del juego original.
- No usa APIs externas, ni modelos generativos, ni dependencias nuevas.
- El motor no depende del motor gráfico: funciona igual en Node (pruebas) que en el navegador.

## Cómo abrirlo

| Archivo | Qué es |
|---|---|
| `Iron_V1_Demo.html` (raíz) | **Demo completa en un solo archivo** (Three.js y motor embebidos). Se abre directamente con doble clic. |
| `iron-v1-demo/index.html` | La misma demo en módulos separados (desarrollo). |
| `iron-v1-demo/ai/**` | El motor cognitivo (independiente del render). |
| `iron-v1-demo/tests/engine_tests.js` | 20 pruebas automatizadas. |
| `iron-v1-demo/tests/benchmark.js` | Informe de rendimiento reproducible. |

Para la versión modular (por ejemplo, para depurar con recarga en caliente):

```bash
cd iron-v1-demo
python3 -m http.server 3000
# http://localhost:3000/
```

Para regenerar el archivo único después de tocar el motor:

```bash
python3 iron-v1-demo/tools/bundle_iron.py
```

## Controles de la demo

- **Arrastrar**: orbitar la cámara. **Rueda**: acercar/alejar.
- **Clic en un habitante**: abrirlo en el inspector.
- Barra inferior: pausa y velocidades **x60 · x300 · x1800 · x7200** (segundos simulados por segundo real).
- **+ Habitante**: genera un individuo nuevo. **Repoblar**: reinicia la población.
- **Inspector**: ficha, mente, cuerpo, memoria, vida social y registro; botones para inyectar
  bombardeo, sermón, feria, rumor, ataque, accidente, fenómeno arcano, y exportar el estado.
- Consola del navegador: `IRON.world`, `IRON.createFromDescription('...')`, `IRON.spawn({...})`,
  `IRON.event('bombardeo')`, `IRON.select(id)`.

## Estructura

```
iron-v1-demo/
  index.html                 demo (HUD + inspector + carga de módulos)
  src/demo.js                escena Three.js, cámara, avatares, controles
  lib/three.r128.min.js      copia local de Three.js (sin CDN)
  ai/
    core/util.js             RNG determinista, matemáticas, saneado, depuración
    core/brain.js            cerebro: ciclo cognitivo completo, API, save/load, LOD
    biology/species.js       Homo sapienselfwer: genoma y fenotipo
    biology/anatomy.js       cuerpo, articulaciones, lesiones, fisiología
    biology/senses.js        visión, audición, olfato, tacto, propiocepción, arcano
    cognition/perception.js  percepción multisensorial y atención contextual
    cognition/memory.js      5 memorias, olvido, distorsión, consolidación
    cognition/emotion.js     15 emociones, appraisal, decaimiento, modificadores
    cognition/reasoning.js   razonamiento procedural + refuerzo ligero (Q)
    personality/personality.js 16 dimensiones, contradicciones, deriva lenta
    culture/culture.js       etnias, facciones, Fe del Hacedor, oficios, idiomas
    environment/astronomy.js dos soles, dos lunas, calendario y luz
    environment/climate.js   biomas, clima diario y entorno local
    planning/needs_goals.js  18 necesidades y objetivos jerárquicos por utilidad
    planning/goap.js         36 acciones y planificador GOAP con poda
    simulation/world.js      reloj, lugares, scheduler LOD, vida autónoma, eventos
    simulation/combat.js     competencias militares, moral, cobertura, órdenes
    interfaces/factory.js    API universal: create / createFromDescription
    debug/inspector.js       inspector visual y controles de depuración
  tests/                     pruebas y benchmark
  tools/bundle_iron.py       empaquetado a un único HTML
```

## El ciclo cognitivo

```
ENTORNO → RECEPTORES → PERCEPCIÓN → ATENCIÓN → INTERPRETACIÓN → MEMORIA
        → NECESIDADES → EMOCIÓN → PLANIFICACIÓN → DECISIÓN → ACCIÓN → APRENDIZAJE
```

- La cognición corre en **tiempo real** (1,5 s por ciclo en LOD 1), mientras la fisiología y el
  mundo avanzan en tiempo simulado. No hay `setInterval` por NPC.
- El **LOD** se asigna por distancia y relevancia: 10 individuos cercanos piensan por completo,
  el resto usa actualización regional o estadística con presupuesto de CPU por frame.
- Un NPC no sabe lo que no percibe. Sus recuerdos se degradan, se distorsionan y se olvidan.
- Las decisiones se justifican: cada intención guarda objetivo, plan, motivo y última experiencia.

## Canon aplicado

- **Especie única** `Homo sapienselfwer` con cuatro componentes integrados (Dúnedain, Rhûn, Elfo de
  sangre, Enano) expresados por genética y desarrollo. Nunca razas separadas.
- **Astronomía**: Aster (ámbar) y Eiren (blanco-amarilla); Auralis (32 d) y Veyra (16 d) en
  resonancia 2:1; año de 410 días; día de 25 h; inclinación 23,5°; cuatro estaciones. La luz y las
  lunas afectan visión, clima y fauna, **nunca la personalidad**.
- **Geografía** con seis biomas y adaptaciones poblacionales; el conocimiento del terreno no se
  regala a quien no lo ha visitado.
- **Fe del Hacedor**: monoteísmo, santos intercesores, cuatro ramas (ortodoxa, apostólica,
  evangélica, restauracionista), devoción, dudas, supersticiones y conflictos.
- **Facciones**: Alianza de Eisenmark, Coalición de Praga y territorios menores; la Guerra de Orvek
  (1921) y la frontera Volskaya/Veyrn marcan biografías.
- **Tecnología de 1922**: ferrocarril, radio analógica, telégrafo, aviación temprana, blindados y
  mechs experimentales. Cada oficio conoce lo suyo y no lo ajeno.

## API universal

### Crear desde una descripción

```js
const konrad = AETH.createNPCFromDescription(
  'Genera un veterano de Volskaya de 47 años, originario de una región montañosa, ' +
  'antiguo soldado del 12.º Regimiento de Infantería, actualmente mecánico ferroviario en Borgñon. ' +
  'Es desconfiado, religioso, tiene problemas en una rodilla, perdió a su hermano durante la ' +
  'Guerra de Orvek y necesita dinero para mantener a su familia.'
);

konrad.getState(world);      // ficha completa serializable
konrad.think(1.5, world);    // un ciclo cognitivo
konrad.getNextIntent();      // { goal, action, reason, dialogue, ... }
```

El parser en español reconoce edad, sexo, oficio, etnia, nación, facción, rama religiosa,
condiciones físicas (rodilla, sordera, miopía, heridas, viudedad), adjetivos de personalidad,
objetivos («mantener a su familia», «ahorrar», «vengar»...) y la Guerra de Orvek. Todo lo que falta
se completa con reglas coherentes: no hay campos obligatorios.

### Crear con un objeto

```js
const npc = AETH.createNPC({
  role: 'mecanico_ferroviario',
  name: 'Konrad Weiss',
  age: 47,
  ethnicity: 'montanesa_volskaya',
  nationality: 'volskaya',
  faction: 'alianza_eisenmark',
  origin: 'cordillera_de_las_cuatro_coronas',
  residence: 'borgnon',
  religion: 'fe_del_hacedor',
  background: 'veterano de la Guerra de Orvek',
  personality: ['desconfiado', 'perseverante', 'reservado'],
  conditions: { kneeInjury: true },
  personalGoals: [
    { label: 'mantener a su familia', conditions: ['familia_estable'], utility: 0.85, tags: ['familia'] }
  ]
});
```

### Métodos del individuo

`getState(world)` · `perceive(world)` · `think(dt, world)` · `chooseAction(world)` ·
`executeAction(world)` · `learn(exp)` · `remember(evento)` · `setGoal(goal)` · `getNextIntent()` ·
`save()` · `load(data)` · `speak(ctx)` · `tickRegional(h, world)` · `tickAbstract(días, world)`.

### Mundo y simulación

```js
const world = AETH.world.createBorgnonWorld({ timeScale: 300 });
world.spawn({ description: 'Anciana médica de Namar, religiosa, viuda, desconfiada de los militares.' });
world.update(dtReal, { x: 0, z: 0 });     // avanza reloj, LOD, acciones y aprendizaje
world.injectEvent('bombardeo', { severity: 0.7 });
world.save();                             // estado completo serializable
```

## Resultados de las pruebas

```bash
cd iron-v1-demo && node tests/engine_tests.js
```

20/20 correctas: genética determinista, lesión de rodilla que limita de verdad, fisiología,
visión nocturna y campo visual, memoria con olvido y consolidación, emociones, plan GOAP
trabajar → cobrar → comprar → comer, reconocimiento de objetivos imposibles, dos descripciones
complejas convertidas en individuos, diversidad de 100 soldados iguales, 40 NPC simulados 3 días
sin NaN, aprendizaje, persistencia, combate, LOD, bombardeo, esquema completo y astronomía.

## Rendimiento medido

`node tests/benchmark.js` (Node 26, sin GPU; el render es independiente):

| Escenario | Coste de IA | LOD 1/2/3 |
|---|---|---|
| Generar 300 NPC | 83 ms (0,28 ms/NPC) | — |
| 40 NPC · x300 | 0,45 ms/frame | 10/30/0 |
| 120 NPC · x300 | 0,71 ms/frame | 10/110/0 |
| 120 NPC · x1800 | 0,71 ms/frame | 10/110/0 |
| 300 NPC · x300 | 1,83 ms/frame | 10/290/0 |
| Ciclo cognitivo individual | 0,08 ms por llamada | — |
| Guardar mundo de 120 NPC | 108 ms · 2,1 MB JSON | — |

El presupuesto de CPU es configurable (`budgetMs`, por defecto 4,5 ms) y el LOD garantiza que el
coste no crezca linealmente con la población visible.

## Ampliar el motor

- **Nueva profesión**: añadir entrada en `ai/culture/culture.js` (`knowledge`, `skills`,
  `focusTags`, `equipment`, `workPlace`) y, si procede, su acción en `ai/planning/goap.js`.
- **Nueva etnia**: `C.ethnicities` con sesgos genéticos, idioma, rama religiosa y costumbres.
- **Nueva acción**: `act('id', 'etiqueta', { pre, add, del, needs, requires, place, risk })`.
  El planificador la usará automáticamente.
- **Nuevo acontecimiento**: `world.injectEvent(tipo)` y su caso en `world.js`.
- **Otro juego**: el cerebro solo necesita un objeto mundo con `clock`, `environmentAt`,
  `entitiesNear`, `soundsNear`, `scentsNear`, `placeAt` y `hasPlaceOfType`. Ver `Brain.NULL_WORLD`.

## Limitaciones conocidas

- El diálogo es procedural por plantillas + contexto; no genera discursos largos (por decisión de
  rendimiento y de diseño). La arquitectura deja el punto de extensión en `Brain.speak`.
- La memoria episódica está acotada (40–300 recuerdos por individuo) y se consolida al dormir.
- La simulación regional usa pasos de hasta 6 h simuladas; los sucesos entre pasos se resumen.
- No hay modelo lingüístico ni red neuronal: el objetivo era un motor procedural ligero,
  determinista y comprensible, no una IA generativa por NPC.
- El combate cubre competencias y moral, pero no sustituye a un motor táctico de multitudes.

## Créditos

Three.js r128 (MIT) embebido desde `vendor/three.r128.min.js`. El resto es código nuevo del
proyecto IRON V1. El juego original y sus versiones previas quedan intactos.
