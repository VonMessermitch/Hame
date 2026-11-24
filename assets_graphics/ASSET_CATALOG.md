# Catálogo de recursos gráficos — Sombras sobre el Nilo / Aethrion

Inventario levantado el 24/11/2026 sobre `Sombras_sobre_el_Nilo_1909_v39.html`
(4,66 MB) y `iron-v1-demo/`.

## Situación de partida

El proyecto **no tiene archivos de recursos externos**: no hay `.png`, `.jpg`,
`.webp`, `.glb`, `.gltf`, `.fbx`, `.obj`, `.mp3`, `.ogg` ni `.wav`. Todo el arte se
genera en tiempo de ejecución con geometría y materiales de Three.js r128, y todo el
audio se sintetiza con `AudioContext` / `createOscillator`. Por eso no se ha movido
ningún archivo: moverlos habría roto rutas y no había nada que mover. Esta carpeta
queda como destino normalizado para los recursos que se añadan en el futuro y como
registro de los generadores procedurales existentes.

## Reglas de la carpeta

* No duplicar recursos; enlazar o referenciar los originales mientras sigan en su sitio.
* No mover un archivo sin actualizar todas sus referencias en el código.
* Los recursos maestros de alta calidad van aquí; las versiones de ejecución (LOD y
  texturas optimizadas) se guardan junto a ellos con el sufijo `_lod1`, `_lod2`, `_col`.
* Nada de material con derechos sin autorización expresa; documentar procedencia y
  licencia de cada incorporación.
* Nombres descriptivos en minúsculas y guiones bajos.

## Inventario de generadores procedurales (v39)

| Nombre en el código | Categoría | Qué genera | Sistema que lo usa | Línea aprox. | Estado |
|---|---|---|---|---|---|
| `human(colors…)` | characters | Silueta humana básica (torso, cabeza, brazos, piernas) | Todos los niveles | 315 | Activo, sin LOD |
| `mkSoldier()` | characters | Soldado completo con casco y fusil | Niveles de infantería | 1590 | Activo |
| `makeOfficer()` | characters | Oficial con distintivos | Escuadra aliada, mando táctico | 516 | Activo |
| `mkOfficerModel()` | characters | Modelo de oficial detallado | Niveles de mando | 1634 | Activo |
| `mkNPC()` | characters | Civil / NPC genérico | Poblados | 1217 | Activo |
| `eisenKit(g)` | armor | Equipo y uniforme Hechtgrau de Eisenmark | Aliados | 508 | Activo |
| `mkRifle()` | weapons | Fusil de cerrojo | Jugador y fusileros | 331 | Activo |
| `mkSMG()` | weapons | Subfusil | Asalto | 342 | Activo |
| `mkRev()` | weapons | Revólver | Oficiales | 350 | Activo |
| `mkShotgun()` | weapons | Escopeta | Niveles urbanos | 355 | Activo |
| `mkMG08()` | weapons | Ametralladora pesada MG 08 | Capítulo IV | 752 | Activo |
| `mkGun()` | weapons | Arma genérica parametrizable | Varios | 1622 | Activo |
| `mkAxe()`, `mkSword()`, `mkSabre()` | weapons | Melé y sable polaco aserrado | Jugador | 356, 358, 1628 | Activo |
| `mkShield()` | armor | Escudo del Custodio | Jefes | 370 | Activo |
| `mkGren()` (en `grens`) | props | Granada | Jugador e IA | — | Activo |
| `mkTank2()`, `mkKrupp()` | vehicles | Blindados / Dampfpanzer | Capítulos con vehículos | 1494, 1323 | Activo |
| `mkVeh()` | vehicles | Vehículo genérico | Varios | 1098, 1193 | Activo |
| `mkMortar()` | vehicles | Mortero / artillería de campaña | Apoyo | 1327 | Activo |
| `mkMecha()` | creatures | Autómata blindado | Jefes | 668 | Activo |
| `mkC10()` | creatures | Criatura del Velo | Niveles avanzados | 674 | Activo |
| `mkPlane()` | vehicles | Avión | Ataques aéreos | 478 | Activo |
| `mkDragon()`, `mkDraco()` | creatures | Dragón | Niveles fantásticos | 483, 1088 | Activo |
| `mkRaptor()`, `mkRex()` | creatures | Criaturas menores y mayores | Fauna hostil | 1083, 1090 | Activo |
| `mkAngel()` | creatures | Entidad arcana | Final | 1103 | Activo |
| `mkPortal()` | props | Grieta del Velo | Capítulo I | 594 | Activo |
| `buildStage()` | buildings | Escenario genérico | Todos | 596 | Activo |
| `buildL2()` … `buildL8()` | buildings | Escenarios de nivel (trinchera, mazmorra, puerto, casa, encrucijada…) | Campaña | 637–1307 | Activo |
| `mkRag()`, `mkSeg()` | props | Coberturas y sacos de arena | Niveles | 703, 1300 | Activo, calidad baja (candidatos a remodelado) |
| `canvasTexture` (patrón interno) | textures | Texturas de suelo, ladrillo, agua y cielo por canvas | Escenarios | — | Activo |
| `DataTexture` | textures | Ruido y degradados procedurales | Cielo, efectos | — | Activo |
| osciladores WebAudio | effects / audio | Disparos, explosiones, pasos, voces sintéticas | Todo el juego | 444–451 | Activo, sin espacialización |

## Inventario de la capa Aethrion (`iron-v1-demo/`)

| Recurso | Categoría | Descripción | Ubicación |
|---|---|---|---|
| `three.r128.min.js` | materials / motor | Copia local de Three.js (MIT) para funcionar sin internet | `iron-v1-demo/lib/` |
| Avatares por facción | characters | Cápsulas y colores por facción y oficio, generados en `demo.js` | `iron-v1-demo/src/demo.js` |
| Edificios del pueblo | buildings | Cajas compuestas (estación, taller, templo, cuartel…) | `iron-v1-demo/src/demo.js` |
| Árboles y vías | vegetation / props | Instanciación simple de árboles y traviesas | `iron-v1-demo/src/demo.js` |
| Inspector DOM | ui | Panel de seis pestañas | `iron-v1-demo/ai/debug/inspector.js` |
| Panel v40 | ui | Panel Aethrion integrado en el juego | `v40/src/aethrion_v40.js` |

## Un recurso nuevo: cómo registrarlo

1. Colócalo en la subcarpeta que corresponda (`characters`, `weapons`, `vehicles`…).
2. Añade una fila a la tabla con nombre, categoría, formato, ubicación, sistema que lo
   usa, dimensiones o polígonos, estado de optimización, dependencias y observaciones.
3. Si sustituye a un generador procedural, deja el generador antiguo hasta comprobar
   que el nuevo recurso funciona en todos los niveles.
4. Añade su versión de ejecución (`_lod1`, `_lod2`) y su colisión simplificada (`_col`).

## Pendiente

* Exportar los generadores procedurales a mallas maestras (glTF) para poder modelar y
  remodelar con herramientas externas, manteniendo el modo procedural como respaldo.
* Añadir LOD de malla y colisiones simplificadas a personajes y edificios.
* Espacializar el audio y sustituir osciladores por bancos de sonido propios.
