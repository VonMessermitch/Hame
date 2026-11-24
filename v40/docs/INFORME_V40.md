# Informe de ingeniería — v40 / Edición Aethrion

Fecha: 24 de noviembre de 2026 · Base: `Sombras_sobre_el_Nilo_1909_v39.html` · Motor: Aethrion 1.0.0

---

## 1. Auditoría de la v39 (antes de tocar nada)

**Punto de entrada.** `Sombras_sobre_el_Nilo_1909_v39.html` es un único archivo de
4,66 MB y 13.837 líneas. Estructura real:

| Línea | Contenido |
|---|---|
| 1–62 | `<head>`, CSS del HUD, menú, controles táctiles |
| 63–71 | Three.js r128 embebido (licencia MIT), `window.__THREE__` |
| 72–13.837 | Un solo `<script>` con todo el juego (sin módulos) |
| final | `</script></body></html>` |

**Arquitectura observada.**

* Estado global: `G` (opciones gráficas + `localStorage['nilo_gfx']`), `enemies[]`,
  `allies[]`, `bullets[]`, `ebul[]`, `picks[]`, `grens[]`, `corpses[]`, `level`.
* Bucle único `(function loop(){requestAnimationFrame(loop); … update(dt) … draw()})()`.
* Dieciocho niveles construidos por funciones `buildL2…buildL8` y bloques `N17`, `N18`
  con *hooks* que reemplazan `VEH32.allies`, `VEH32.onAllyHit`, `VEH32.onKill`.
* Arte **100 % procedural**: `human()`, `mkRifle()`, `mkSMG()`, `mkMG08()`, `mkPlane()`,
  `mkDragon()`, `mkTank2()`, `mkKrupp()`, `mkMortar()`, `mkMecha()`, `mkSoldier()`,
  `mkOfficerModel()`, `buildStage()`, `buildL2…buildL8()`. Sin `TextureLoader` ni
  archivos de audio: los sonidos se sintetizan con `createOscillator`.
* Persistencia: `localStorage` para opciones y récord; no hay guardado de partida.

**Diagnóstico.**

| Clase | Hallazgo |
|---|---|
| Crítico | Un solo archivo de 4,66 MB y un solo ámbito global: cualquier cambio comparte espacio de nombres con todo el juego. |
| Crítico | La IA de las misiones es específica por nivel (hooks por `level`), no reutilizable. |
| Importante | No existen entidades genéricas: los soldados son mallas con propiedades sueltas; no hay identidad, memoria ni estado interno persistente. |
| Importante | Sin serialización de partida: no se puede guardar ni reproducir una situación. |
| Moderado | Arte sin LOD ni catálogo: cada nivel construye su geometría al entrar. |
| Moderado | El audio no tiene espacialización (osciladores mono). |
| Cosmético | Textos del menú desactualizados respecto a versiones acumuladas. |

**Decisión de intervención.** No reescribir la v39. Se elige una integración **aditiva**:
la v39 se conserva byte a byte y la v40 añade un `<script>` final con el motor Aethrion
y una capa de fusión. Así se cumple la regla de no destruir lo que funciona y se puede
verificar (las 20 pruebas del motor y el juego original siguen pasando).

---

## 2. Lo implementado en la v40

### 2.1 Cerebro universal integrado (18 módulos, ~7.900 líneas)

`util` (RNG determinista, saneado), `species` (Homo sapienselfwer, genética y
fenotipo), `anatomy` (cuerpo, fisiología, lesiones), `senses`, `memory` (sensorial,
de trabajo, episódica, semántica, procedimental, espacial y social, con olvido y
consolidación), `emotion` (apreciación, decaimiento, humor dominante), `perception`
y atención, `personality` (16 dimensiones, contradicciones y deriva), `culture`
(etnias, facciones, religión, oficios, idiomas, conocimiento), `astronomy`
(2 soles, Auralis 32 d / Veyra 16 d, año 410 d, día 25 h), `climate` y biomas,
`needs_goals`, `goap` (36 acciones con poda por relevancia), `reasoning` (aprendizaje
ligero), `combat`, `brain` (ciclo cognitivo, LOD y serialización), `world` (reloj,
LOD 1/2/3 con presupuesto de CPU, ejecución autónoma, acontecimientos) y `factory`
(API `create` y `createFromDescription`).

Mejora aplicada al motor compartido: el parser de descripciones reconoce ahora
`francotirador`, `tirador`, `sniper`, `explorador` y `batidor` como oficio militar
(antes caían en `campesino`). Se regeneró también `Iron_V1_Demo.html`.

### 2.2 Teatro de operaciones

Los seis capítulos de la v39 se convierten en sectores del mundo cognitivo
(*La Grieta de Tebas*, *La Trinchera*, *Mazmorra de Stalingrado*, *Puerto Oriental*,
*La Casa Pávlov*, *La Encrucijada*) con propietario, valor estratégico y fortificación,
más seis lugares de apoyo (hospital, cantina, eras, soto, fuente, apeadero).

### 2.3 Población

28 cerebros completos: doce figuras canónicas descritas en lenguaje natural (Kovač,
Vuković, Weiss, Halász, Marek, Seshat, Anhur, Broz, Ilse, Tepes, Sato, Zheng) y el
resto generados por tablas con facción, oficio, edad y rasgos. Cada uno tiene memoria
inicial coherente con la Guerra de Orvek (1921) y el canon de 1922.

### 2.4 Creación de NPC por descripción

`AETHRION.create(texto)` → individuo con identidad, etnia, facción, fisiología,
lesiones, personalidad, creencias, habilidades, objetivos personales y recuerdos.
Probado con el caso pedido (veterano de Volskaya de 34 años, montañés, desconfiado,
buen tirador, casado, religioso, artillería, miedo a los dragones): devuelve soldado,
etnia `montanesa_volskaya`, habilidad de fusil, lesión de rodilla cuando se menciona
y episodios iniciales.

### 2.5 Batalla por sectores

Simulación táctica con dos facciones, escuadras por especialidad (fusileros, asalto,
ametralladoras, ingenieros, reconocimiento, artillería), órdenes derivadas del cerebro
(defender, atacar, preparar, asaltar, replegarse), supresión, moral, refuerzos,
captura de sectores y parte de guerra. **Las bajas matan cerebros reales**: el resto
registra el duelo y cambia su estado emocional, que a su vez altera la siguiente
decisión de su escuadra. Es el ejemplo de integración entre sistemas que pedía el
encargo, verificable en la prueba 8.

### 2.6 Inspector, datos y persistencia

Panel con seis pestañas (resumen, crear, habitantes, batalla, datos, ayuda), barras de
necesidades y emociones, memoria reciente, heridas, objetivo y actividad; exportación e
importación de JSON con validación, guardado en `localStorage` y autoguardado cada 45 s.

### 2.7 Rendimiento

LOD cognitivo 1/2/3 con presupuesto de 4,5 ms por fotograma y simulación regional en
pasos de hasta 6 h. Medición real: 60 NPC + batalla, 400 pasos en ~106 ms
(**0,27 ms/paso**), muy por debajo del presupuesto de un fotograma a 60 Hz.

### 2.8 Cerebro Aethrion en la infantería de los niveles (v40/v1.1)

La v39 crea a sus soldados con varias fábricas repartidas por capítulo. En lugar de
reescribir sus niveles, la capa `v40/src/aethrion_soldiers.js` envuelve las fábricas
globales y les añade un cerebro a cada infante al nacer:

| Envoltorio | Qué cubre |
|---|---|
| `spawnE` | fusileros, custodios, granaderos, orcos escopeteros/hacheros y trasgos (las plagas, magos, mechas y jefes quedan fuera) |
| `makeOfficer` / `assignBots` | el oficial y los tres soldados de la escuadra del jugador |
| `gar9` / `mkGar` | todas las guarniciones aliadas de `GAR` (capítulos IV y siguientes), incluida la de VIII y las creadas por `gar10` y las secciones posteriores |
| `gMk17` / `ally17` | guarnición de las Tres Cruces y escuadra de Volskaya (XVII) |
| `ally18` | escuadra, secciones y dotaciones del 12.º (XVIII) |
| `surv13` / `inf14` | supervivientes tras las líneas (XIII) e infantería aliada del bastión (XIV) |
| `sailor28` | marineros de Eisenmark armados (XV); los no combatientes quedan fuera |
| `down17` / `down18` / `revive17` / `revive18` | heridas, reanimación y shock en las escuadras XVII/XVIII |
| `hurt` / `kill` / `garDamage` / `allyDamage` | dolor, bajas y propagación del duelo |

Cada cerebro es un `AETH.brain.Brain` completo (genética, anatomía, personalidad,
emoción, memoria, necesidades) con LOD 3 y un pulso propio cada segundo (coste real
medido: **<1 ms por pulso con 126 soldados**). El pulso actualiza emoción y
necesidades, percibe la amenaza cercana y escribe miedo/moral en la unidad.

La conexión con el combate es deliberadamente conservadora, para no romper lo que ya
funcionaba:

* **Postura inicial**: agresión y disciplina ajustan un ±10 % la cadencia y el paso
  al nacer. Nunca tocan el daño ni la vida.
* **Dudas por miedo**: con miedo > 0,78 y disciplina baja, el soldado retrasa el
  disparo (sube ~1 s el campo de cadencia que use su generación: `cd` en la infantería
  base, `ft` en las escuadras XVII/XVIII, `gcd` en su guarnición). Es una hesitación
  visible, no una huida que rompa guiones.
* **Disciplina**: reduce la probabilidad de duda y, en aliados serenos, acelera un
  poco la vuelta al fuego.
* **Shock colectivo**: una baja sube el miedo de los compañeros a menos de 28 m
  (con enfriamiento de 8 s) y deja un recuerdo de guerra.
* Los soldados con guion (`scripted`, jefes, mechas) quedan excluidos de las dudas.

Las escuadras de los capítulos posteriores no usan `down`: la capa lee sus banderas
`down17`/`down29`/`dead17` en el pulso, y envuelve `down17`/`down18` para contagiar el
shock al herir y `revive17`/`revive18` para retirar la herida al reanimar. La caballería
(CAV) se deja fuera a propósito: es una entidad montada con su propia IA, no infantería.

El registro se agrupa por capítulo real (se corrige al cambiar de nivel), se recicla
al superar 260 cerebros vivos y se puede desactivar desde el panel. El guardado JSON
de la v40 incluye un snapshot del registro; al importar se restaura el histórico,
pero **no** se reconstruyen unidades de la escena, que vuelve a crear el juego.

---

## 3. Estado de las fases del encargo

| Fase | Estado | Nota |
|---|---|---|
| 1. Auditoría y diagnóstico | **Hecha** | Sección 1 de este informe. |
| 2. Arquitectura central y cerebro universal | **Hecha y probada** | 18 módulos, 20 + 11 pruebas. |
| 3. Combate, animaciones y cinemáticas | **Parcial** | Cerebro conectado a la infantería real de los niveles I–XVIII, incluidos aliados, guarniciones y escuadras posteriores (miedo, dudas, shock); animaciones y cinemáticas nuevas **no** implementadas. |
| 4. Sistemas narrativos y RPG | **Parcial** | Diálogo contextual y relaciones del cerebro activos; misiones ramificadas y compañeros con arco propio **pendientes**. |
| 5. Remodelado y recursos gráficos | **Parcial** | `assets_graphics/` creado y catalogado; no se ha remodelado la geometría de la v39. |
| 6. Modo Battlefield | **Parcial** | Simulación de sectores, escuadras y refuerzos hecha, y cada soldado de los niveles tiene cerebro; representación 3D con vehículos y cientos de soldados **pendiente**. |
| 7. Balance y optimización | **Parcial** | LOD y presupuestos medidos; tabla de balance centralizada **pendiente**. |
| 8. Documentación y entrega | **Hecha** | README, este informe, catálogo de recursos y pruebas. |

No se declara terminado lo que sólo tiene estructura: las fases marcadas como
parciales describen exactamente qué existe y qué falta.

---

## 4. Trabajo pendiente, priorizado

**Crítico**

1. Guardado de partida de la campaña (hoy se guarda la capa cognitiva y el registro
   de soldados, pero no la escena de la v39).
2. Sustituir la patrulla de la v39 por el planificador GOAP completo en los niveles
   con infantería, manteniendo la IA actual como respaldo (hoy el cerebro sólo modula
   cadencia y moral).

**Importante**

3. Representación 3D de la batalla: instanciar escuadras con LOD visual sobre el
   terreno existente y enlazar cada malla con su cerebro.
4. Catálogo de balance centralizado (daño, cadencia, dispersión, blindaje, moral).
5. Que la hesitación por miedo se note en la animación (cabeceo, gritos, buscar
   cubierta) y no sólo en la cadencia de disparo.

**Moderado**

6. Remodelar los modelos de baja calidad (`mkRag`, `mkSeg`) y añadir LOD de malla.
7. Audio espacial con `PannerNode` y ecos por distancia.
8. Misiones ramificadas y compañeros con arco propio conectados a memoria y relaciones.

**Cosmético**

9. Actualizar los textos del menú de la v39 a la edición v40.

---

## 5. Cómo se ha verificado (sin inventar resultados)

* `node iron-v1-demo/tests/engine_tests.js` → 20/20.
* `node v40/tests/v40_tests.js` → **18/18**, repetido quince veces sin fallos. Para
  lograr reproducibilidad se fijó la semilla de los cerebros del teatro y se procesó
  toda la población en cada paso de las pruebas (`budgetMs = 1e9`); en el juego se
  mantiene el planificador por presupuesto. La prueba de duelo se corrigió porque un
  sector puede quedar arrasado: el recuerdo vive también en los cerebros muertos.
* `node --check` de los scripts añadidos al HTML fusionado.
* Navegador (Chromium del entorno): la v40 carga con título propio, `AETH` y
  `AETHRION` presentes, 28 cerebros, canvas activo; el panel abre, crea un NPC
  (*"Francotirador de Volskaya…"* → oficio militar, etnia montañesa), la batalla
  avanza y la consola no muestra errores de JavaScript (sólo avisos de WebGL del
  propio entorno de prueba).

### Repaso de capítulos en navegador (v40/v1.1)

Se cargaron los seis capítulos del menú en Chromium y se midió el estado real:

| Capítulo | Escena / HUD | Cerebros de infantería | Errores JS |
|---|---|---|---|
| I · La Grieta de Tebas | Carga tras el prólogo | 3 soldados + oficial enganchados | Ninguno |
| II · La Trinchera | Carga, «Resistid 3 oleadas» | 3 soldados + oficial; enemigo de prueba enganchado | Ninguno |
| III · Mazmorra | Carga, HUD activo | 3 soldados + oficial; enemigo de prueba enganchado | Ninguno |
| IV · Puerto Oriental | Carga, «Resiste…» | 3 soldados + oficial + **6 guarniciones** (11 vivos) | Ninguno |
| V · La Casa Pávlov | Carga, HUD activo | 3 soldados + oficial; enemigo de prueba enganchado | Ninguno |
| VI · La Encrucijada | Carga, pelotón | **12 soldados** + 3 enemigos de prueba (15 vivos) | Ninguno |

Comprobaciones adicionales en el capítulo VI: `wave()` real creó 9 enemigos, de los
que recibieron cerebro los 5 de infantería (los demás eran plagas/magos); el miedo de
los fusileros subió a 0,55–0,63 con el jugador a 7–10 m; 90 fotogramas simulados con
`update(1/60)` produjeron 3 bajas y 2 shocks colectivos sin excepciones; la pestaña
**Soldados** se renderizó con datos reales.

**Lo que falla o queda cojo en el entorno de prueba**

* El navegador headless rechaza `requestPointerLock` (`WrongDocumentError`), así que
  el juego se pausa solo al entrar en combate y el contador de FPS no arranca. No es
  un fallo de la v40: ocurre igual sin la capa Aethrion. Los fotogramas se simularon a
  mano para verificar la lógica.
* Con la pestaña en segundo plano el `requestAnimationFrame` no corre; los pulsos
  cognitivos usan `setInterval` y también se ralentizan. En una pestaña visible el
  pulso es de 1 s.
* Al entrar en un capítulo los enemigos están a 0 porque las oleadas son guionizadas:
  se verificó el enganche con `spawnE()` directo y con `wave()` en el capítulo VI.
* Los custodios recién creados a 18–28 m mantienen miedo bajo (0,02): el pulso sólo
  reacciona a menos de 34 m y con enfriamiento de 9 s. Es intencionado, pero significa
  que un soldado lejano tarda en «sentir» la batalla.
* No se recorrieron los capítulos 0 y VII–XXX del menú ampliado; esta entrega verifica
  los seis capítulos del teatro v40.
