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

---

## 3. Estado de las fases del encargo

| Fase | Estado | Nota |
|---|---|---|
| 1. Auditoría y diagnóstico | **Hecha** | Sección 1 de este informe. |
| 2. Arquitectura central y cerebro universal | **Hecha y probada** | 18 módulos, 20 + 11 pruebas. |
| 3. Combate, animaciones y cinemáticas | **Parcial** | Combate y moral integrados en la simulación; animaciones y cinemáticas nuevas **no** implementadas. |
| 4. Sistemas narrativos y RPG | **Parcial** | Diálogo contextual y relaciones del cerebro activos; misiones ramificadas y compañeros con arco propio **pendientes**. |
| 5. Remodelado y recursos gráficos | **Parcial** | `assets_graphics/` creado y catalogado; no se ha remodelado la geometría de la v39. |
| 6. Modo Battlefield | **Parcial** | Simulación de sectores, escuadras y refuerzos hecha; representación 3D con vehículos y cientos de soldados **pendiente**. |
| 7. Balance y optimización | **Parcial** | LOD y presupuestos medidos; tabla de balance centralizada **pendiente**. |
| 8. Documentación y entrega | **Hecha** | README, este informe, catálogo de recursos y pruebas. |

No se declara terminado lo que sólo tiene estructura: las fases marcadas como
parciales describen exactamente qué existe y qué falta.

---

## 4. Trabajo pendiente, priorizado

**Crítico**

1. Extraer los ganchos por nivel de la v39 a una capa de entidades común (`Unit`,
   `Squad`, `Sector`) para que el cerebro pueda dirigir a los soldados de las misiones
   sin duplicar lógica.
2. Guardado de partida de la campaña (hoy sólo se guarda la capa cognitiva).

**Importante**

3. Sustituir la IA de patrulla de la v39 por `brain.tick()` en los niveles con
   infantería, manteniendo el comportamiento actual como respaldo.
4. Representación 3D de la batalla: instanciar escuadras con LOD visual sobre el
   terreno existente y enlazar cada malla con su cerebro.
5. Catálogo de balance centralizado (daño, cadencia, dispersión, blindaje, moral).

**Moderado**

6. Remodelar los modelos de baja calidad (`mkRag`, `mkSeg`) y añadir LOD de malla.
7. Audio espacial con `PannerNode` y ecos por distancia.
8. Misiones ramificadas y compañeros con arco propio conectados a memoria y relaciones.

**Cosmético**

9. Actualizar los textos del menú de la v39 a la edición v40.

---

## 5. Cómo se ha verificado (sin inventar resultados)

* `node iron-v1-demo/tests/engine_tests.js` → 20/20.
* `node v40/tests/v40_tests.js` → 11/11, repetido seis veces sin fallos tras
  estabilizar la prueba de capturas (900 s de simulación).
* `node --check` de los scripts añadidos al HTML fusionado.
* Navegador (Chromium del entorno): la v40 carga con título propio, `AETH` y
  `AETHRION` presentes, 28 cerebros, canvas activo; el panel abre, crea un NPC
  (*"Francotirador de Volskaya…"* → oficio militar, etnia montañesa), la batalla
  avanza y la consola no muestra errores de JavaScript (sólo avisos de WebGL del
  propio entorno de prueba).

No se ha probado el juego completo capítulo a capítulo tras la fusión: la v39 no se
modificó y sus scripts se cargan en el mismo orden, pero esa verificación manual de
los seis capítulos queda pendiente.
