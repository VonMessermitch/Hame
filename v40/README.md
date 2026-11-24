# Sombras sobre el Nilo — 1909 · **v40 / Edición Aethrion**

Fusión de la campaña de la **v39** con el **cerebro universal de NPC de Aethrion**
(desarrollado en `iron-v1-demo/`). La v39 se conserva intacta: sus seis capítulos,
armas, vehículos, jefes y opciones gráficas siguen funcionando igual. La v40 añade
encima una capa cognitiva que da vida propia a la población y convierte el juego en
una plataforma de simulación y creación de escenarios.

## Abrir la versión

* `v40/Sombras_sobre_el_Nilo_1909_v40.html` — copia dentro de la carpeta de la versión.
* `Sombras_sobre_el_Nilo_1909_v40.html` — copia en la raíz, con el nombre correlativo de la serie.

Ambos archivos son idénticos (5,0 MB) y **autónomos**: Three.js va embebido y no se
descarga nada de internet. Se abren con doble clic, o se sirven con
`python3 -m http.server` desde la raíz del repositorio.

Las versiones v15–v39 **no se han modificado**.

## Qué aporta la v40

| Sistema | Estado |
|---|---|
| Campaña v39 (capítulos I–VI, armas, vehículos, jefes, gráficos) | Intacta, sin cambios |
| Población autónoma (28 habitantes, dos facciones) | Funcionando |
| Creación de NPC por descripción en español | Funcionando |
| Genética, fenotipo, anatomía, fisiología y lesiones | Funcionando |
| Sentidos, percepción, atención y memoria (5 tipos) | Funcionando |
| Emociones, personalidad (16 dimensiones) y contradicciones | Funcionando |
| Cultura, etnia, facción, religión, oficios e idiomas | Funcionando |
| GOAP (36 acciones), necesidades, objetivos y aprendizaje | Funcionando |
| Acontecimientos (bombardeo, feria, rumor, tren) con reacción emocional | Funcionando |
| Inspector de habitantes (necesidades, emociones, memoria, heridas, objetivo) | Funcionando |
| **Cerebro Aethrion en cada soldado de infantería de los capítulos** | Funcionando (enemigos, escuadra, oficial y guarniciones) |
| Influencia cognitiva en el combate (miedo → dudas, disciplina, shock por bajas) | Funcionando |
| Guardado / importación JSON y guardado en el navegador | Funcionando |
| Batalla por sectores con escuadras, moral, supresión y refuerzos | Funcionando (simulación táctica) |
| LOD cognitivo 1/2/3 con presupuesto de CPU | Funcionando |
| Batalla 3D con cientos de soldados visibles, animaciones nuevas, vehículos jugables | **Pendiente** (ver `docs/INFORME_V40.md`) |

## Controles de la capa Aethrion

* Botón **⬢ AETHRION** (arriba a la izquierda) o tecla **K**: abrir / cerrar el panel.
* Pestañas: **Resumen**, **Crear NPC**, **Habitantes**, **Soldados**, **Batalla**, **Datos**, **Ayuda**.
* El juego de la v39 responde a sus controles habituales (WASD, ratón, táctil) sin cambios.

### Crear un NPC

En la pestaña *Crear NPC*, escribe una descripción en español y pulsa **Crear NPC**:

> Soldado veterano de Volskaya, 34 años, originario de una región montañosa,
> desconfiado, buen tirador, casado, religioso, con experiencia en artillería y
> miedo a los dragones.

El motor deduce oficio, etnia, facción, nacionalidad, edad, sexo, condición física,
lesiones, personalidad, creencias, habilidades, objetivos personales, recuerdos
iniciales y comportamiento. No usa modelos de lenguaje: tablas semánticas y
ontologías del canon de Aethrion.

### Batalla por sectores

La pestaña *Batalla* simula el frente de los seis capítulos. Cada escuadra está
mandada por cerebros reales: su moral, su miedo, su agresión y su disciplina salen
de la personalidad y las emociones de sus integrantes. Las bajas matan cerebros de
verdad: los supervivientes registran el duelo, cambian de opinión y modifican sus
decisiones posteriores.

### Soldados con cerebro

Cada infante que aparece en un capítulo recibe un cerebro propio al nacer: los
enemigos de `spawnE()` (fusileros, custodios, granaderos, orcos escopeteros y
hacheros, trasgos), la escuadra del jugador, el oficial y las guarniciones (`GAR`).
Las plagas, magos, mechas y jefes **no** son infantería y quedan fuera.

El cerebro no reescribe la IA de la misión: la modula. Su personalidad fija la
cadencia y el paso iniciales; su miedo crece con la amenaza cercana; si el miedo
supera el umbral, el soldado duda antes de disparar (su `cd` sube) y la disciplina
reduce esa probabilidad. Las bajas cercanas contagian miedo a los compañeros y
quedan en su memoria. La pestaña **Soldados** muestra el registro por capítulo, el
miedo y la moral medios, las dudas acumuladas y la ficha del soldado más afectado.

## Consola

```js
AETHRION.soldiers              // capa de infantería (bind, pulse, list, byLevel…)
AETHRION.soldiers.summary()    // enganchados, vivos, dudas, shocks, coste del pulso
AETHRION.soldiers.list()       // soldados ordenados por miedo
AETHRION.world                  // mundo cognitivo (cerebros, lugares, eventos)
AETHRION.battle                 // batalla por sectores
AETHRION.create('descripción')  // nuevo NPC por descripción
AETHRION.event('bombardeo')     // acontecimiento en el foco actual
AETHRION.save()                 // estado serializable
AETHRION.AETH                   // motor completo (factory, GOAP, memoria…)
```

## Recompilar

```bash
python3 v40/tools/build_v40.py     # v39 + motor Aethrion + capa v40 → HTML
node v40/tests/v40_tests.js        # 20 pruebas del núcleo (sin navegador)
node iron-v1-demo/tests/engine_tests.js   # 20 pruebas del motor
```

El generador lee la v39 **sin tocarla**, inserta los 18 módulos del cerebro y la capa
de fusión antes de `</body>`, cambia el título y escribe las dos copias. Verifica que
estén todos los marcadores y bloques.

## Resultados de las pruebas (última ejecución)

* `v40/tests/v40_tests.js` → **20/20** correctas (teatro, población, descripción,
  simulación sin NaN, bombardeo, guardado/carga, batalla con capturas y bajas,
  duelo en los cerebros, determinismo desde un guardado, rendimiento, modo headless,
  cerebro por soldado, amenaza cercana, shock entre compañeros, enganches reales,
  guardado del registro, rendimiento de 126 cerebros, modulación de la cadencia
  `cd`/`ft` y fábricas aliadas de los capítulos IX–XVIII).
* `iron-v1-demo/tests/engine_tests.js` → **20/20** correctas.
* Capítulos posteriores (IX–XVIII): las fábricas propias de aliados reciben cerebro
  (`mkGar` y con ella `gar9`/`gar10`, `gMk17`, `ally17`, `ally18`, `surv13`, `inf14`
  y los marineros armados de XV). Las escuadras XVII/XVIII usan `ft` como cadencia;
  el miedo también las hace dudar. Los jinetes de caballería (CAV) quedan fuera por
  ser una entidad montada distinta, no infantería.
* Navegador (Chromium del entorno), capítulos I–VI: los seis cargan su escena, HUD y
  sin errores de JavaScript. En II–VI se verificó que la infantería nacida por
  `spawnE()` recibe cerebro, que el miedo sube con el enemigo a 7–10 m, que las bajas
  se propagan (3 muertes y 2 shocks en 90 fotogramas simulados del capítulo VI) y que
  la pestaña **Soldados** se renderiza. El capítulo IV registró 6 guarniciones, 3
  aliados y el oficial con cerebro (11 vivos).
  Limitación del entorno: al no haber foco de ventana, el navegador rechaza el
  *pointer lock* y el bucle de render se pausa; los fotogramas del capítulo VI se
  simularon llamando a `update(1/60)`, no con el reloj real.
* Rendimiento del núcleo: 60 NPC + batalla, 400 pasos en ~106 ms (**0,27 ms/paso**).
  Pulso cognitivo de 126 soldados: **<1 ms por pulso** (medido en las pruebas).

## Estructura

```
v40/
  Sombras_sobre_el_Nilo_1909_v40.html   juego fusionado (copia)
  src/aethrion_v40.js                   capa de fusión (teatro, población, batalla, panel)
  src/aethrion_soldiers.js              cerebro por soldado de infantería y sus enganches
  tools/build_v40.py                    generador reproducible
  tests/v40_tests.js                    pruebas del núcleo
  docs/INFORME_V40.md                   auditoría, alcance y trabajo pendiente
  README.md
assets_graphics/                        catálogo de recursos (procedurales)
```

## Límites conocidos

* La capa cognitiva del **teatro** (28 habitantes) corre en paralelo al combate FPS.
  La **infantería de los niveles** sí tiene cerebro, pero éste modula la IA original
  (cadencia, dudas, moral); no la sustituye. Reemplazar la patrulla de la v39 por el
  planificador GOAP completo sigue pendiente y está documentado en el informe.
* El registro de soldados vivos no se reconstruye al importar un JSON: se restaura el
  histórico (nombres, miedo, dudas) y el juego vuelve a crear a sus soldados. No se
  inventa una escena que el motor gráfico no puede serializar.
* La batalla por sectores es una **simulación táctica** mostrada en el panel, no un
  campo de batalla 3D con cientos de soldados visibles.
* No hay recursos gráficos externos: todo el arte de la v39/v40 es geometría y
  textura procedural, y el audio se sintetiza con WebAudio.
