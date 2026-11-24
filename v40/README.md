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
| Guardado / importación JSON y guardado en el navegador | Funcionando |
| Batalla por sectores con escuadras, moral, supresión y refuerzos | Funcionando (simulación táctica) |
| LOD cognitivo 1/2/3 con presupuesto de CPU | Funcionando |
| Batalla 3D con cientos de soldados visibles, animaciones nuevas, vehículos jugables | **Pendiente** (ver `docs/INFORME_V40.md`) |

## Controles de la capa Aethrion

* Botón **⬢ AETHRION** (arriba a la izquierda) o tecla **K**: abrir / cerrar el panel.
* Pestañas: **Resumen**, **Crear NPC**, **Habitantes**, **Batalla**, **Datos**, **Ayuda**.
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

## Consola

```js
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
node v40/tests/v40_tests.js        # 11 pruebas del núcleo (sin navegador)
node iron-v1-demo/tests/engine_tests.js   # 20 pruebas del motor
```

El generador lee la v39 **sin tocarla**, inserta los 18 módulos del cerebro y la capa
de fusión antes de `</body>`, cambia el título y escribe las dos copias. Verifica que
estén todos los marcadores y bloques.

## Resultados de las pruebas (última ejecución)

* `v40/tests/v40_tests.js` → **11/11** correctas (teatro, población, descripción,
  simulación sin NaN, bombardeo, guardado/carga, batalla con capturas y bajas,
  duelo en los cerebros, determinismo desde un guardado, rendimiento, modo headless).
* `iron-v1-demo/tests/engine_tests.js` → **20/20** correctas.
* Comprobación en navegador: la página carga con título v40, `AETH` y `AETHRION`
  presentes, 28 cerebros, canvas activo; el panel abre, crea un NPC, la batalla
  avanza y no hay errores de JavaScript (sólo avisos de WebGL del entorno de prueba).
* Rendimiento del núcleo: 60 NPC + batalla, 400 pasos en ~106 ms (**0,27 ms/paso**).

## Estructura

```
v40/
  Sombras_sobre_el_Nilo_1909_v40.html   juego fusionado (copia)
  src/aethrion_v40.js                   capa de fusión (teatro, población, batalla, panel)
  tools/build_v40.py                    generador reproducible
  tests/v40_tests.js                    pruebas del núcleo
  docs/INFORME_V40.md                   auditoría, alcance y trabajo pendiente
  README.md
assets_graphics/                        catálogo de recursos (procedurales)
```

## Límites conocidos

* La capa cognitiva corre **en paralelo** al combate FPS; no sustituye a la IA de las
  misiones de la v39. Integrar los cerebros en cada nivel es trabajo pendiente y está
  documentado en `docs/INFORME_V40.md`.
* La batalla por sectores es una **simulación táctica** mostrada en el panel, no un
  campo de batalla 3D con cientos de soldados visibles.
* No hay recursos gráficos externos: todo el arte de la v39/v40 es geometría y
  textura procedural, y el audio se sintetiza con WebAudio.
