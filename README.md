# Sombras sobre el Nilo — 1909 · v16 EDICIÓN DEFINITIVA

Remasterización y expansión del juego HTML5/Three.js (r128) original `v15`, centrada en el
**Capítulo VIII — Qal'at al-Nasr** (el fuerte), con mejoras globales que benefician a toda la campaña.

## Archivos

| Archivo | Qué es |
|---|---|
| `Sombras_sobre_el_Nilo_1909_v16.html` | **El juego completo y jugable** (un único archivo; Three.js r128 desde cdnjs, con respaldo en jsDelivr). Ábrelo en Chrome de escritorio o de Android. |
| `original_v15.html` | El archivo original recibido, sin tocar (base de construcción). |
| `src/v16.js` | Módulo nuevo v16 (~128 KB de sistemas nuevos). |
| `src/build.py` | Aplica ediciones quirúrgicas verificadas sobre el código original e inyecta el módulo. `python3 src/build.py` regenera el HTML jugable. Cada edición comprueba que su texto existe exactamente una vez; si algo no encaja, la construcción falla en vez de producir un archivo roto. |

Para jugar el capítulo nuevo: menú → **CAPÍTULO** → «VIII · Qal'at al-Nasr — EDICIÓN DEFINITIVA».

## Controles

- **PC:** WASD · Shift correr (consume aguante) · ratón · clic disparar · R recargar · Espacio saltar · **X / Ctrl agacharse** · C rodar · E usar · F melé · Q arma · G granada · V cámara · **T orden «¡Conmigo!» al teniente** · **P / Esc pausa** · **Intro / Espacio saltar cinemática**
- **Móvil:** joystick (analógico: poco = caminar, medio = marchar, a fondo = correr) · zona derecha mirar · botones originales + **AGA** (agacharse), **ORD** (orden al teniente), **II** (pausa). Diseño compacto automático en pantallas de menos de 440 px de alto.

## 1. Resumen de cambios

- **Noche incipiente** en el Cap. VIII: degradado azul-negro con horizonte cálido, dos lunas llenas con textura, cráteres, halo y distinto tamaño, ~900 estrellas granate con titileo, nubes oscuras en deriva que velan la luna mayor, niebla azulada y tinte nocturno en el post-proceso. Tras la detonación el cielo vira a una noche ensangrentada.
- **Iluminación cinematográfica con número fijo de luces**: luz lunar, fogatas y braseros con parpadeo, reflector enemigo barriendo el glacis desde la torre central (apagado por la explosión), reflector aliado sobre camión en la defensa final, destellos de disparos y explosiones (pool de luces). Las luces se crean una vez para no recompilar sombreadores en mitad del combate.
- **Guarnición aliada combatiente** (8 soldados + 4 refuerzos) que asalta, ocupa, defiende, se repliega y **muere individual y permanentemente**.
- **Teniente Hollenstein** rediseñado (kepi húngaro M.1908/12) y con **IA autónoma por prioridades**.
- **Búnkeres habitables** que sustituyen a las casamatas de bloques: troneras reales, puerta metálica animada con bisagras y colisión, interior con camilla, munición, teléfono de campaña, MG en trineo y lámpara.
- **Camión de transporte nuevo** (más largo, más alto, plataforma de 5,2 m) y **tanque nuevo único «Hunyadi M.16»**.
- **Destrucción parcial** del fuerte tras la detonación.
- **Cinemática del avance blindado** con artillero activo, antes de la secuencia final original.
- **Movimiento del jugador con peso**: aceleración y frenado progresivos, marcha analógica, sprint con aguante y fatiga, agacharse, balanceo moderado de cámara, aterrizaje con peso, retroceso al recibir impactos, animaciones de cambio de arma, lanzamiento y herida.
- **Pausa** real (juego, audio y cinemáticas), también automática al perder el foco o el puntero.
- **Audio por capas** con bus maestro y compresor, límite de voces simultáneas, disparos NPC atenuados por distancia, viento, artillería y ráfagas lejanas, grillos, campana de alarma, motor y orugas.
- **Rendimiento**: humanoides fusionados por articulación (≈60 % menos draw calls), liberación de memoria GPU, IA escalonada, pools de humo, trazadoras y luces.

## 2. Mejoras más importantes

1. La batalla del fuerte está viva: aliados y enemigos se disparan entre sí, no solo al jugador.
2. La guarnición disminuye de forma visible y gradual (en las pruebas: 12 → 9 → 7 → 5 supervivientes), con bajas, heridos, derribados por explosiones y moral.
3. El teniente toma decisiones razonables por sí mismo y su estado actual se ve en su etiqueta («★ Lt. Hollenstein · FLANQUEAR»).
4. La detonación ya no borra el fuerte: cae el ala este, el polvorín, la parte alta de una torre, un tramo de parapeto y un torreón de la puerta; el resto sigue siendo escenario de combate.
5. Antes de la secuencia final de tanques hay una cinemática de 18 s con 8 planos.
6. Los vehículos tienen modelos coherentes y detallados con muy pocos draw calls (mallas fusionadas con color por vértice).

## 3. Nuevas capacidades de IA

### Teniente (todas las campañas; en el Cap. VIII es Hollenstein)
Decide cada ~0,35 s (al instante ante amenaza inmediata) siguiendo la jerarquía pedida:
1. **Amenaza al jugador** (enemigo < 8 m, o cuerpo a cuerpo < 13 m) → *Proteger al Oberleutnant*: se interpone.
2. **Amenaza propia** (< 4,5 m) → *Carga a sable* (si el enemigo no es grande y tiene salud) o *Replegarse*.
3. **Amenaza a compañeros** (camaradas o guarnición a < 6 m de un enemigo) → *Apoyar*.
4. **Enemigos que bloquean el objetivo** → *Asaltar* / *Flanquear* / *Fuego y cobertura* según número, salud, personalidad y doctrina (suiza, milanesa, soviética).
5. **Enemigos de alto valor** (minotauros, granaderos, hacheros…) → *Fuego concentrado*: marca el objetivo y escuadra y guarnición lo priorizan.
6. **Defensa de posiciones** en fases defensivas → *Defender posición* en la cobertura entre jugador y amenaza.
7. **Reagrupar** si el jugador o la escuadra se dispersan.
8. **Avanzar** por saltos hacia el objetivo de la fase, buscando cobertura.
9. **Reconocer** el entorno en calma.

Además: recarga (y busca cobertura para hacerlo), cambia entre pistola C96, sable y granadas (lanza una si hay ≥ 3 enemigos agrupados lejos del jugador), cura heridas al cubrirse, puede caer herido y levantarse, nunca se queda encima del jugador, tiene personalidad aleatoria (agresividad / cautela), voz propia por subtítulos y responde a la orden del jugador (T / ORD).

### Navegación y antiatasco (teniente, escuadra, guarnición y enemigos de todos los capítulos)
- Rejilla espacial de obstáculos y «antenas» de dirección que prueban hasta 11 ángulos.
- Detección de atasco cada 0,7 s → desvío lateral → retroceso → abandono del objetivo y elección de alternativa.
- **Rutas por el fuerte**: puerta y brechas se detectan dinámicamente (cambian tras la explosión), así que los enemigos del portal salen por las brechas reales y los aliados entran por la puerta.

### Guarnición
Estados de movimiento, posición, asomarse, disparar en ráfagas, agacharse tras sacos, recargar, melé a bayoneta, repliegue al punto de retirada si la posición se desborda o la moral cae, derribo y levantarse tras explosiones, entrada a los búnkeres por la puerta y tiro por las troneras, línea de visión real (las paredes bloquean), percepción escalonada, reacción a compañeros caídos (moral y gritos) y a la llegada de los blindados.

### Enemigos
Conservan su clase y conducta original, pero ahora **eligen objetivo** entre jugador, teniente, camaradas y guarnición según distancia y protección; sus balas, granadas y golpes de minotauro dañan a los aliados; se encogen y buscan cobertura ante explosiones; la infantería huye de los tanques; y salen del fuerte por puerta o brechas.

### Escuadra (3 camaradas)
Mantienen sus roles y doctrinas, ahora con navegación antiatasco, uso de cobertura en «fuego y cobertura», fuego concentrado y la posibilidad de caer heridos y recomponerse (en el Cap. VIII).

## 4. Nuevas secuencias cinematográficas y fases

Director de batalla del Cap. VIII con fases encadenadas, cada una con su rótulo:

| Fase | Contenido |
|---|---|
| Sesión informativa (original) | Llegada en camión, el teniente (ahora con kepi) explica el plan, bombardeo Krupp. |
| I · Asalto al glacis | La guarnición avanza a los pozos de tirador; el reflector enemigo barre el glacis. |
| II · Combate en el patio | La guarnición ocupa los emplazamientos capturados; campana de alarma del fuerte. |
| Objetivo · Polvorín | Plantar la carga (original). |
| III · Defensa del fuerte | Contraataque: la retaguardia sostiene la puerta. Al llegar al detonador se ordena el **repliegue general** y el capitán Slando **espera** (máx. 9 s) a que sus hombres salgan del radio. |
| Detonación | Destello, onda expansiva en anillo, sacudida, columnas de humo, derrumbe parcial, escombros con colisión, fuegos localizados. Daño a la guarnición según distancia y protección. |
| IV · Reorganización | Supervivientes y refuerzos ocupan búnkeres y la línea de sacos; reflector aliado; el portal ataca. |
| **Avance blindado (nuevo)** | 18 s, saltable: plano general → frontal bajo → orugas → lateral → torreta y artillero → enemigos alcanzados → a través del humo → aproximación al portal. El artillero Weiss dispara ráfagas con trazadoras, pausas para reapuntar y cambios de objetivo; el cañón principal dispara con retroceso; el tanque cabecea sobre terreno irregular. |
| VI · La 4.ª División Blindada | Secuencia final original con tanques nuevos (torreta independiente, ametralladora de cúpula, orugas animadas) y sacrificio del comandante Reinhardt. |

Todas las cinemáticas se saltan con «Saltar», Intro o Espacio, y una pulsación sobrante ya no salta la siguiente.

## 5. Errores corregidos

- Las balas enemigas solo podían herir al jugador: los aliados eran invulnerables e ignorados.
- El «teniente Hollenstein» quedaba congelado como estatua junto al campamento tras la intro.
- Los defensores de las casamatas aparecían **encima del techo**; ahora están dentro, tras las troneras.
- La detonación destruía el fuerte entero (y todas sus colisiones); además, con destrucción parcial los enemigos del portal quedaban atrapados tras los muros: añadido enrutamiento por brechas.
- **Fuga de memoria GPU**: cadáveres y humo se quitaban de la escena sin liberar geometrías y materiales (la memoria crecía sin parar en batallas largas).
- Una pulsación de «Saltar» residual podía saltar la cinemática siguiente.
- Cadáveres que desaparecían a los 4 s (ahora persisten, con límite).
- Humo de mortero blanco brillante e incoherente de noche.
- Botones táctiles que se solapaban en pantallas bajas (GRA sobre 1ª/3ª).
- No existía pausa.

## 6. Qué podría mejorarse en una siguiente versión

- **Pruebas en dispositivos Android reales.** Todo se ha verificado en Chromium sin interfaz (renderizado por software), no en un teléfono; los draw calls se redujeron ~60 %, pero los FPS reales en gama media siguen sin medirse.
- Navegación por malla (navmesh) en lugar de dirección local + salidas del fuerte; ahora es robusta pero no planifica rutas largas por interiores complejos.
- Voces grabadas o sintetizadas: hoy órdenes y gritos son subtítulos con efectos sonoros.
- Sombras reales (hoy hay sombras de contacto y luces por vértice para ahorrar rendimiento).
- Llevar la noche, la guarnición y los búnkeres a otros capítulos (II tiene búnkeres originales).
- Escombros con colisión por bloque y cobertura destructible a medida que cae.
- Teniente y camaradas son «héroes» que caen heridos y se recomponen (decisión de diseño: aparecen en la cinemática final); la guarnición sí muere de forma permanente.

---

# v17 · OPERACIÓN TRES CORONAS — El Cerco de Vargenkreuz

Archivo jugable: **`Sombras_sobre_el_Nilo_1909_v17.html`** (incluye todo lo de v16). Menú → CAPÍTULO → «IX · OPERACIÓN TRES CORONAS». El código nuevo está en `src/v17.js`; `python3 src/build.py` regenera el HTML.

## Cambios en armas, escuadra y enemigos (todo el juego)
- **Fusil Mannlicher-Mauser 8,98×66**: cargador extraíble de 10 tiros tipo Enfield (modelado bajo el cajón de mecanismos), 62 de daño, **atraviesa a un enemigo** y sigue con el 60 % del daño, más retroceso, sacudida, frenado del jugador y estampido grave. Recarga con peines: 2,3 s rellenando, 3,1 s en vacío. Escuadra y guarnición usan el mismo calibre (10 tiros, más daño, penetración).
- **MP38** con modelo nuevo y **tambor de 50 cartuchos** (nervios, llave de carga); el tambor es la pieza que cae y se repone en la animación de recarga.
- **Sable polaco aserrado** rehecho (guarda de estribo, alambre en la empuñadura, vaceo, filo pulido). **Escudo eliminado.** Combo de **5 golpes**: tajo, revés, **estocada** (alcance largo, aturde), **molinete giratorio** (360°, empuja) y golpe aplastante; el golpe en caída usa el aplastante.
- **Sanitäter Ritter**, médico de la escuadra (todos los capítulos salvo el convoy): pistola C10 y cuchillo. Cuando alguien baja al **10 % de salud** (jugador, camaradas, teniente o guarnición) acude, se arrodilla y lo cura con animación de vendaje y partículas; reanima a los caídos. Combate, puede caer herido y se recompone.
- **Escuadra y jugador remodelados** con el mismo estilo: uniformes con tejido, costuras y manchas de barro, cascos, mochilas, rango, correaje con cartuchera, cantimplora de máscara, guantes y polainas.
- **Enemigos rediseñados**: los orcos tienen arco ciliar, colmillos, orejas, hombreras con pinchos, cuello de piel, trofeo de cráneo, faldón, brazales y rodilleras; además la plaga lleva pústulas luminosas y garras, el mago hábito, capucha y orbe, el custodio penacho y capa, y el trasgo capucha.
- **Esqueletos guardianes** (enemigo nuevo): huesos sobre el mismo esqueleto articulado, ojos espectrales, sable oxidado; se deshacen al morir.
- **Animación de combate de enemigos**: encorvamiento y balanceo pesado de los orcos, anticipación y torsión del cuerpo en cada golpe, retroceso al recibir impactos, temblor al quedar aturdidos, **rugido** al entrar en combate y respiración.
- **Tácticas enemigas**: los fusileros lanzan granadas, los orcos, la plaga y los esqueletos esquivan cuando el jugador les apunta, y la infantería herida busca cobertura.

## Capítulo IX — un solo mapa conectado (sur → norte)
S1 Trincheras de San Gregor · S2 Granja de Kessel (molino como hito) · S3 Llanura de Argentum · S4 Bosque de Tannen · S5 Puente del Cuervo (río, vado) · S6 Estación Vargenkreuz (locomotora, vagones, depósito de agua) · S7 Fortaleza de las Tres Coronas (tres torres coronadas, murallas destructibles por bloques, búnkeres, MG 08 utilizables) · S8 Monasterio (campanario con luz roja como hito) y ruinas subterráneas.

| Fase | Contenido |
|---|---|
| 1 · El barro y el acero | 10 soldados de guarnición en el parapeto, 3 oleadas (fusileros, granaderos, asalto, ametralladores, criaturas), **bombardeo dinámico** con cráteres y **sacos terreros que se dañan por etapas y desaparecen**, **nube de gas** que avanza, daña y ciega por zonas, puesto de comunicaciones que defender. |
| 2 · La carga de Argentum | 8 húsares a caballo con IA de escuadrón: llegada, formación, avance, **detección de ametralladoras y flanqueo**, carga a sable, media vuelta y reorientación, **retirada por bajas** y reagrupamiento. Nidos de ametralladora, blindado «Basilisco» con torreta y **cañón de campaña en la loma** que maneja el jugador. |
| 3 · El cerco de Tannen | Observadores en plataformas, repetidor que restaurar (mantener USAR), **ataques por ambos flancos**, patrulla aliada que se repliega, **árbol derribado que corta el camino → ruta alternativa por el arroyo**, emboscada por la retaguardia, aviso de cerco con orden de ruptura del teniente. |
| 4 · El Puente del Cuervo | Ingenieros **reparando el camión** (animación de trabajo, otro ocupa su puesto si cae), **saboteadores** que corren a colocar cargas, blindado aliado de apoyo; si el puente baja del 50 % **se hunde el tramo central y se abre el vado del oeste**, por donde pasa el camión. |
| 5 · Fortaleza | 12 soldados en parapetos y búnkeres; **ariete** que revienta la puerta este, **torre de asedio** que suelta tropas, **bombarda arcana** que bombardea y derriba bloques de muralla; 4 oleadas; derrota si el enemigo alcanza el monasterio. |
| 6 · Ruinas | Complejo subterráneo con pasillos, cámaras, pilares, runas, maquinaria y braseros; **tres resonadores** que destruir mientras sube el medidor de brecha; luego **el Coloso de las Tres Coronas** (jefe con golpe de área e invocación de esqueletos). |

**10 cinemáticas** breves, saltables y sincronizadas con eventos: inicio, caballería, emboscada, puente, regreso al fuerte, descubrimiento de las ruinas, destrucción de la máquina, derrumbe, llegada de los tanques y final. Si una condición de derrota se cumple, **se reintenta la fase**, no la misión entera.

## Optimización del capítulo IX
Sectores fusionados por separado y ocultos por distancia, árboles, hierba, rocas, sacos y cráteres instanciados, IA escalonada y límite de enemigos vivos. En las pruebas: **436–681 draw calls y ~2 ms de lógica por fotograma**, menos que el capítulo VIII.

## Errores corregidos en v17
- Las piezas nuevas de los enemigos compartían material con aliados: el tinte del frenesí o del portal teñía de rojo a **todos** los soldados. Ahora cada enemigo tiene su material.
- El cañón y las MG del mapa se fusionaban como geometría estática y no podían girar.
- La caballería no salía del estado de llegada.
- La ruta del camión atravesaba barandillas y sacos.
- Las etiquetas de nombre y el contador de aliados quedaban sobre las cinemáticas.
- El médico se colocaba entre la cámara y el jugador.

## Limitaciones restantes
- No hay terreno con desniveles transitables: el relieve es visual, y trincheras y lomas se simulan con parapetos y plataformas. El río solo se cruza por el puente o el vado.
- La navegación sigue siendo de dirección local con antiatasco y rutas por puntos, no una navmesh.
- Las voces son subtítulos.
- Probado en Chromium sin interfaz con renderizado por software, no en un teléfono Android real.
- Los caballos no tienen ragdoll completo: caen de lado y el jinete sale despedido.

---

# v18 · correcciones y mejoras

Archivo jugable: **`Sombras_sobre_el_Nilo_1909_v18.html`** (incluye v16 y v17). Código nuevo en `src/v18.js`.

## Capítulo IX
- **Caballería atrapada (corregido).** Aparecía en x = X−175, fuera del muro límite invisible del mapa (X−168), y quedaba encerrada fuera del escenario. Ahora **se llama por radio** desde la radio de campaña al pie de la loma (mantener USAR) y llega **por el camino del este** siguiendo una ruta de puntos de paso. Sus objetivos se limitan al interior del mapa y, si una montura no avanza durante 3 s, se recoloca en un punto libre cercano.
- **Blindado «Basilisco» (corregido).** Su propio obstáculo de colisión lo empujaba unos 5 m en cada fotograma (de ahí la velocidad absurda). Ahora va a 1,7 m/s y a 0,8 m/s mientras dispara, con aceleración, giro lento, traqueteo y humo de escape.
- **Caja de armas que siempre se repone** (trinchera, loma, puente y fortaleza; también en el campamento del cap. VIII y en el Puerto y la Encrucijada): da un **Panzerfaust** de un solo uso y **2 cargas satchel**. El Panzerfaust se lleva al hombro, dispara un cohete con estela y rebufo, y el tubo vacío cae al suelo; hace mucho daño a blindados, máquinas de asedio e incluso al T-Rex. Q lo guarda o lo vuelve a sacar.
- **Búnkeres destructibles con cargas satchel** (GRA lanza la carga cuando la llevas): el búnker desaparece, deja escombros con varillas, fuego, humo y cobertura, y mata a quien esté dentro. En San Gregor hay **dos búnkeres enemigos nuevos (E-1 y E-2)** con ametralladoras.
- **Capitán Argentum:** coraza de acero bruñido y **pistola Ruby de 11 mm**, que dispara con la mano izquierda cuando no está cargando.

## Escuadra
- **Personalidades al azar** (Agresivo, Cómico, Miedoso, Loco, Táctico), visibles en la etiqueta. Cambian la distancia de combate, la velocidad, la cadencia y la precisión. El miedoso se retira si el enemigo se acerca y el loco y el agresivo cargan. Cada uno tiene frases propias en combate y en calma.
- **Melé de la escuadra:** estocada de bayoneta (fusileros) y culatazo (apoyo), con animación y empuje.
- **Médico:** combo de cuchillo en 3 tiempos (estocada, tajo lateral y golpe fuerte con retroceso defensivo), se acerca a cuchillo cuando el enemigo está muy cerca, y dispara la pistola a dos manos con retroceso.
- **Granada de palo alemana (Stielhandgranate)** para el jugador, el teniente y los fusileros enemigos; dos colgadas del cinturón y una en la mano al lanzar.

## Capítulo VII (T-Rex)
- **Sd.Kfz. 250 nuevo:** semioruga con ruedas delanteras, orugas animadas, blindaje inclinado, escudo de la ametralladora, faros, antena, estiba, insignias y conductor.
- **Los tanques del convoy apuntan y disparan mientras avanzan:** cañón principal contra infantería, raptores y T-Rex, y ametralladora con trazadoras y ráfagas.
- **Artillero de torreta** (todos los tanques): de pie en la escotilla de cintura para arriba, manos en las empuñaduras, retroceso del torso, vainas expulsadas, fogonazo y búsqueda de blancos con la cabeza.

## Capítulo IV (Puerto)
6 defensores reales tras los sacos (combaten y pueden morir), bengalas de iluminación que caen lentamente y alumbran el muelle, reflector sobre la grúa, grúa con contenedor en movimiento y un carguero en llamas.

## Capítulo VI (Encrucijada)
- El pelotón del cruce ya no es decorado: **8 soldados reales** que combaten y caen uno a uno; la salud del pelotón depende de los vivos.
- Fuego de morteros de apoyo sobre los accesos durante el asedio.
- Iglesia en ruinas con el campanario en llamas como referencia visual, y vehículos ardiendo en las barricadas.

## Sonido
- Reverberación de campo en todo el juego (más intensa en mazmorras y ruinas).
- Capas nuevas en las armas: grave del disparo, chasquido supersónico y cerrojo del fusil.
- Explosiones con cuerpo, cola y retardo según la distancia.
- Ambiente propio de cada capítulo: viento, perros, truenos, goteo, cadenas, olas, gaviotas, sirena de barco, campanas, aviones, sirenas, cuervos, pájaros e insectos, rugidos lejanos, búhos y artillería lejana.

---

# v19 · CRÓNICAS DE HIERRO — Operación Tridente de Acero: «El incendio de Alejandría»

Archivo jugable: **`Sombras_sobre_el_Nilo_1909_v19.html`** (incluye todo lo anterior). Menú → **CAPÍTULO** → «X · CRÓNICAS DE HIERRO — El incendio de Alejandría». Módulo nuevo: `src/v19.js`.

En este capítulo eres **otro soldado de otro ejército**: el **Gefreiter Kasimir Wolff**, Sturmtruppe de la **Marca de Eisenmark** (1922 alternativo), con uniforme gris verdoso, casco oscuro y máscara de gas. La escuadra, el oficial (**Hauptmann Reuss**) y el sanitario (**Sanitäter Brenner**) visten también de Eisenmark durante el capítulo y recuperan su uniforme al volver a otros capítulos.

## Un solo mapa continuo (sur → norte), sin teletransportes
Costa → trincheras → desierto → minas (dentro de la meseta) → explanada → refinería y puerto. Cada sector se conecta con el siguiente por accesos físicos: pasos en la alambrada, la brecha de la barricada, la puerta del complejo (que se vuela), la boca de la mina, los puentes sobre el abismo, la compuerta norte y la valla de la refinería. A los lados de las minas, la meseta impide rodearlas.

| Fase | Contenido |
|---|---|
| **I · Infiltración costera** | De noche y solo. Patrullas con conos de visión, medidor de **detección progresiva**, alerta por ruido de disparos, eliminaciones silenciosas a cuchillo/sable sobre enemigos desprevenidos. Objetivos: sabotear la radio (si la cortas, la alarma no trae refuerzos), neutralizar 2 nidos de MG y subir al faro para lanzar la bengala → **desembarco aliado**. |
| **II · Trincheras de hierro** | Tres líneas. Cortas la alambrada (E) o lo hacen los zapadores; tomas la primera trinchera; eliminas a los servidores de mortero (bombardean de verdad) y los búnkeres de la segunda; silencias los 3 nidos de la tercera → **cinemática**: la tanqueta Kettenhund revienta la barricada mientras la infantería salta del parapeto. Después capturas la artillería enemiga. |
| **III · Desierto mecanizado** | Llegan las tanquetas de reconocimiento Zorn y Späher, el draco pesado Goliat y el draco de transporte Lastträger (desembarca infantería motorizada). Objetivos en paralelo: batería de cañones, cruce ferroviario, convoy de camiones cisterna que huye. **Evento:** un carro enemigo flanquea y persigue a las tanquetas; tiene puntos débiles (retaguardia y torreta) y Goliat puede embestirlo; hay Panzerfaust en las cajas. Por último, los zapadores (o tú) vuelan la puerta del complejo. |
| **IV · Minas de Khazrul** | Columnas monumentales, abismo con dos puentes, vagonetas sobre raíles, ascensor, fundición con metal fundido, estatuas y galerías. Activas 3 mecanismos (E) mientras salen oleadas de las galerías: trasgos, genglocks, gorlocks, acechadores, minotauro, capataz, bruto… El draco guarda la entrada: no cabe en la mina. |
| **V · Carga de los catafractos** | Tomas tres alturas, la artillería capturada bombardea la línea enemiga y Reuss ordena la carga. Los **catafractos** forman, cargan con **lanzas eléctricas** (chispas, retroceso, daño extra a blindados y descarga encadenada a dos enemigos cercanos), giran y vuelven a cargar mientras tú sigues combatiendo. |
| **VI · La refinería** | Destruir bombas, tomar la torre de control, inutilizar 3 antiaéreos, colocar cargas en los 3 depósitos principales y defender a los zapadores 40 s mientras cablean el detonador. **Jefe: el Guardián de la Refinería**, minotauro acorazado con cañón pesado en 3 etapas: dispara desde la plataforma elevada → salta y pelea cuerpo a cuerpo → enloquece, destroza coberturas y te persigue. El detonador provoca la explosión en cadena y empieza la **extracción** al muelle bajo persecución. |

Depósitos con estados **intacto → dañado (fuga) → incendiado → explosión → destruido**, y reacción en cadena con los tanques vecinos.

## Fuerzas
- **Vanguardia de Eisenmark** (12 al desembarcar + 4 motorizados): asalto con MP38, escopeteros, zapadores con mochila de cargas, escuderos acorazados con escudo, espada y pistola C10 (reciben un 60 % menos de daño), fusilero y ametrallador. Avanzan de posición en posición, se cubren, se repliegan y combaten cuerpo a cuerpo.
- **Grupo blindado:** 1 tanqueta de apoyo con cañón y 2 de reconocimiento con ametralladora.
- **Dracos terrestres:** asalto, transporte, pesado y reconocimiento. Embisten, muerden y pisotean.
- **Enemigos:** fusileros, granaderos, ametralladores, francotiradores, oficiales, orcos, trasgos, guerreros escudados, gorlocks, genglocks, hurlocks con ballesta, ogros artilleros, minotauros y dracos enemigos. Clases especiales: acechador (oculto hasta que te acercas), lanzador, ballestero, bruto (rompe sacos terreros), ogro artillero (bombardeo con proyectiles) y capataz (acelera a los cercanos; si cae, su tropa vacila). Los cuerpo a cuerpo **rodean** al objetivo.

## Navegación sin atascos
Ruta por «pasos» de cada línea (alambrada, parapeto, muralla, boca de la mina, puentes, compuerta, valla), recalculada cuando un paso se abre o se cierra. La usan la escuadra, la vanguardia, los enemigos y el sanitario, junto con el antiatasco existente. El abismo de la mina bloquea el paso pero **no** la línea de tiro.

## Controles y rendimiento
- Se mantienen todos los controles táctiles. **E / USAR** sirve para cortar alambre, sabotear, accionar mecanismos, colocar cargas y el detonador (mantente cerca; alejarte interrumpe).
- 10 cinemáticas saltables (botón, Enter o Espacio); ninguna bloquea el control de forma permanente.
- Cada sector se oculta cuando está lejos (y el exterior desaparece dentro de la mina); geometría estática fusionada; mismo presupuesto que el capítulo IX (≈130–640 draw calls, ~0,5–1 ms de lógica por fotograma en las pruebas).

## Otras correcciones de v19
- Reiniciar un capítulo desde el menú reutiliza el mismo AudioContext (antes podían aparecer errores de nodos de audio de contextos distintos).
- Texto del registro: «abatió a a un…» → «abatió a un…».

## Limitaciones
- Volver a jugar el capítulo X sin salir de la página recarga la página y deja el capítulo X preseleccionado: pulsa JUGAR otra vez.
- Los dracos aliados se quedan en la entrada de la mina y no acompañan a las fases V y VI.

---

# v20 · Técnica de Eisenmark 1922, Panzerfaust, niebla PS2, botiquines e IA local

Archivo jugable: **`Sombras_sobre_el_Nilo_1909_v20.html`**. Módulo nuevo: `src/v20.js`.

## Corrección importante: botones táctiles
En Android los botones **USAR, ARM, GRA, MEL, REC, SAL y ROD** llamaban a las funciones originales de v15, así que todo lo añadido después no llegaba al pulsarlos: la caja del Panzerfaust, las cargas satchel con GRA, los combos de sable, el cañón del cap. IX y los trabajos del cap. X (cortar alambre, sabotear, mecanismos, cargas). Ahora cada botón llama a la versión actual.

## Panzerfaust
- Modelo nuevo: tubo con franja de advertencia, alza abatible, palanca de disparo y cabeza hueca con ojiva.
- Al cogerlo de la caja va **a la espalda**, en diagonal.
- Con **ARM / Q** se **empuña al hombro, estilo bazooka**: mano derecha en la empuñadura y la izquierda sujetando el tubo por delante. Sigue la inclinación de la cámara.
- El disparo tiene **chorro de gases hacia atrás** (fogonazo, humo y sonido). La caja vuelve a llenarse siempre.

## Uniformes y armas de la lámina «Technische Infanterie 1922» (caps. IX y X)
- **Base:** Stahlhelm con faldón y emblema lateral, ribetes granate (cuello, hombreras, tapeta y puños), correaje en Y, cinturón con cartucheras triples, macuto, cantimplora, pala y botas altas. En el cap. X, el uniforme gris verdoso oscuro de la lámina.
- **Roles de la vanguardia (cap. X):**
  - tirador, con capa de camuflaje y fusil con visor;
  - granadero, con bandolera de granadas y MP de tambor;
  - fusilero, con Ew-R9;
  - zapador, con cortaalambres y bolsa de herramientas;
  - radiotelegrafista, con radio a la espalda y antena;
  - ametrallador, con Ew-MG12 y cintas cruzadas;
  - escuderos y escopeteros.
- **Mandos y sanitario:** Hauptmann Reuss lleva gorra de plato, monóculo y portamapas; el sanitario lleva brazalete y bolsa con cruz roja.
- **Armas nuevas:**
  - **Ew-R9 revisado:** guardamanos, cerrojo, cargador de 10 cartuchos, empuñadura de pistola y correa; versión con visor para el tirador.
  - **Ew-MG12:** camisa de refrigeración perforada, apagallamas, cargador lateral, bípode y asa.
  - El jugador del cap. X usa el Ew-R9 («EW-R9 REVISADO 8,98×66»).
- **Capítulo IX:** la guarnición lleva Stahlhelm, el equipo completo y Ew-R9 o Ew-MG12. La escuadra recibe botas altas, correaje y ribetes, y el médico su bolsa.

## Niebla PS2 (menú → NIEBLA PS2)
- **Modos:**
  - Desactivada (niebla de cada capítulo);
  - **PS2 clásica:** niebla densa y tramado retro;
  - **Dunas del Nilo:** ámbar;
  - **Noche del Velo:** corta, con cielo.
- La distancia de dibujo se acorta con la niebla, lo que también **aligera la carga en Android**. La elección se recuerda entre partidas.

## Médico y botiquines
- Si tu salud baja del 60 %, el sanitario te **lanza un botiquín** (cada 24 s como mínimo).
- Los enemigos sueltan a veces uno (8 %).
- Cada botiquín da +25 de salud y munición. Desaparece a los 45 s.

## IA táctica local (menú → IA LOCAL)
- **Cómo funciona:** al empezar busca un modelo local de **Ollama** en `127.0.0.1:11434` y usa el modelo elegido si está instalado (llama3.2, mistral, qwen2.5 o gemma2). El oficial genera entonces frases de radio cortas al cambiar de objetivo, cuando estás muy herido o cuando llega una oleada grande.
- **Respaldo:** si no hay Ollama (o falla o tarda), entra el **motor táctico integrado**, con frases propias, sin conexión y gratis. El indicador arriba a la derecha muestra cuál está activo.
- **Desactivar:** la opción «Desactivada» deja solo los diálogos originales del juego.
- **Requisito de Ollama:** para que el navegador pueda hablarle, arranca Ollama con `OLLAMA_ORIGINS=*` (o el origen desde el que abras el juego).
- **Aviso en la consola:** si Ollama no está en marcha, el navegador muestra un aviso de «conexión rechazada» en la consola. Es normal.

---

# v21 · Misión 0 «Campamento Tokovsky», cuerpo a tierra, coberturas y animaciones

Archivo jugable: **`Sombras_sobre_el_Nilo_1909_v21.html`**. Módulo nuevo: `src/v21.js`.

## Misión 0 — Campamento Tokovsky: «El que no sabe marchar, tampoco sabe morir»
Primera opción del menú (aparece preseleccionada mientras no se haya completado). Juegas solo, sin escuadra ni médico, como **recluta Kasimir Wolff**: uniforme gris azulado con ribetes granate, gorra de campaña y correaje, sin casco de acero.

### El campamento
- **Mapa:** un campamento explorable, sin pasillos, con bosque y montañas alrededor. Tiene vía férrea y andén, patio de formación con mástil y cuartel, cuatro barracones, cantina, enfermería, establos (con caballos y un draco de reconocimiento), carbonera y torre de observación.
- **Zonas de ejercicio:** circuito de obstáculos, polígono de tiro con berma, trinchera de instrucción, estaciones de armas, parque de vehículos, pueblo de prácticas y el «Sector Norte».
- **Vida del campamento:**
  - escuadra que marcha alrededor del patio;
  - centinelas que saludan;
  - reclutas que limpian fusiles sentados o comen en la cantina;
  - soldados fumando;
  - carboneros que discuten;
  - mecánico, conductor y guardia en la torre.
- **Sonido:** silbatos, campana, disparos lejanos, perros y viento.
- **Sargento instructor Koller:** gorra de plato, cigarrillo y portamapas. Camina delante, señala al hablar, se gira hacia ti y reacciona a lo que haces.

### Cinemáticas (todas en tiempo real y saltables)
- **Llegada en tren bajo la lluvia** («Bienvenido al infierno barato»): el diálogo completo, el recluta que vomita, la mochila en el charco, el oficial del cigarrillo y el título «TOKOVSKY · DÍA 1».
- **Escenas cortas durante la instrucción:** el desmayo, la ametralladora de fogueo, la MG 08, la alarma del Sector Norte y el cierre del combate («¡El suelo no tiene simpatía!»).
- **Escena final al atardecer** («Todavía respira»), con el discurso de Koller.

### Los ocho ejercicios
| Fase | Qué se aprende |
|---|---|
| I · Las piernas son gratis | Seguir a Koller, correr, sprint hasta la bandera y circuito de obstáculos: tronco y valla (saltar), barrera baja (agacharse), alambrada (cuerpo a tierra), barriles, escalones y puerta (USAR). Bromas si te quedas atrás o te estrellas contra el tronco. |
| II · La disciplina no se negocia | El chiste de «tu otra izquierda»; mirar las banderas que te nombran; seguir al cabo en marcha; mantener la posición; cubrirse tras los sacos; ponerse de pie; paso lateral; el recluta que se desmaya. |
| III · El fusil no es para rascarse | Recoger el Ew-R9 de la mesa. Tres ejercicios: blancos estáticos (cercano, medio y lejano), blancos móviles y precisión (sólo el color que dice Koller; si fallas, «carrera en artillería»). |
| IV · La guerra no espera a que recargues | Vaciar y recargar, cambiar a la pistola, cobertura y disparo asomándose, arrastrarse bajo fuego de fogueo, granadas al círculo y detrás de la barricada («un idiota con iniciativa»), bayoneta contra muñecos, sprint bajo fuego y botiquín. |
| V · Exposición de armas | Subfusil, MG 08 (ráfagas, no «derretir el cañón»), mortero (tres disparos observados), cañón de campaña contra un blindado de madera y pistola. |
| VI · Vehículos | Viaje en camión con la tropa (el recluta que se adelanta), ayudar al mecánico, **conducir la tanqueta** (joystick para avanzar y girar, FUEGO para el cañón) por puertas de conos, destruir el blanco y aparcar. Presentación de la caballería y de los dracos en los establos. |
| VII · Un ejército no es una colección de idiotas armados | Grupo de cuatro reclutas con órdenes **ORD / T**: SEGUIR, MANTENER, CUBRIR y ASALTAR. Dos cubren mientras el resto entra en el edificio; luego se despeja el pueblo y se reagrupa. Koller protesta si abandonas a tu grupo o si se atasca. |
| VIII · La última prueba | Alarma («¡Si fuera real, ya estarías llorando en otro idioma!»). Tomar la trinchera, flanquear la casamata, destruir tres objetivos y cruzar bajo fuego simulado hasta la extracción. |

### Reglas de la instrucción
- Las armas se reciben a lo largo de la instrucción: primero no tienes ninguna; luego el fusil, la pistola, la bayoneta, las granadas y el subfusil.
- El fuego es de fogueo: recibes el 40 % del daño. Si caes, reapareces en el último punto de control.

### Guardado, repetición y exploración
- Al terminar se guarda «Instrucción completada» (localStorage) y aparece «Campaña desbloqueada».
- El selector **EJERCICIO** permite repetir cada fase por separado o recorrer el campamento en **exploración libre**, con todas las armas y los blancos levantados.

## Cuerpo a tierra y arrastrarse (Z / botón TUM)
- El jugador se tumba y se arrastra (máx. 1,55 m/s) con animación de brazos y piernas alternos.
- La cámara baja y el blanco que ofreces se reduce: las balas enemigas sólo te alcanzan por debajo de 0,75 m y recibes un 40 % menos de daño.
- Disparas tumbado con gran precisión, y las balas salen a ras de suelo.
- SALTAR te levanta y AGACHAR te deja en cuclillas.

## Coberturas al estilo Gears (F / botón CUB)
- **El jugador:**
  - se pega a sacos, muros bajos, cajas, barriles o rocas cercanas y se agacha detrás;
  - se desplaza a lo largo de la cobertura;
  - FUEGO le hace asomarse para disparar y vuelve a ocultarse solo;
  - alejarse o volver a pulsar CUB le hace salir;
  - agachado y oculto recibe un 30 % del daño, y si la cobertura vuela, la pierde;
  - aparece la indicación «[F / CUB] Ponerse a cubierto» cuando hay combate y una cobertura cerca.
- **Los enemigos** que están en cobertura (o fijos en un nido) desvían el 45 % de los impactos que les llegan a través de la cobertura.
- **Los aliados** agachados detrás de cobertura desvían la mitad.
- **La escuadra** pasa a «fuego y cobertura» automáticamente cuando hay tres o más enemigos cerca.

## Animaciones de disparo y empuñe
- **Jugador:**
  - al apuntar, postura a dos manos: mano izquierda bajo el guardamanos, mejilla en la culata y torso perfilado;
  - ciclo del cerrojo: la mano derecha sube, tira y empuja tras cada disparo del fusil;
  - retroceso en la cadera y vibración del subfusil.
- **Vanguardia y guarnición:** retroceso en hombro y brazos, ciclo del cerrojo en los fusileros, vibración de la ametralladora y apoyo de la mano izquierda al apuntar.

## Catafractos (capítulo X)
- Antes sólo cargaban tras la cinemática y en la refinería se quedaban quietos.
- Ahora empiezan a hostigar el flanco en cuanto forman.
- Siguen activos durante la refinería y la extracción, con los límites de carga ampliados a la refinería.
- Rodean las líneas por los pasos (ya no chocan contra la valla).
- El registro anuncia los enemigos que ensartan.

## Refinería y misceláneos (capítulo X)
- **Refinería:**
  - antorcha de gas encendida de 28 m;
  - tres columnas de destilación con plataformas y escaleras;
  - dos racks de tuberías elevadas;
  - apartadero con tres vagones cisterna;
  - oficinas de ladrillo con ventanas y rótulo;
  - chimenea con humo negro;
  - tres balancines de bombeo animados;
  - respiraderos de vapor, charcos de crudo, pilas de bidones y cajas, farolas, extintores y carteles de aviso.
- **Resto del mapa:** cajas de munición y teléfonos de campaña en las trincheras, postes indicadores, postes de telégrafo junto a la vía, un camión calcinado, montones de mineral y cristales luminosos en las minas, banderas y carros rotos en la explanada.

## Otras correcciones
- **Niveles con objetivos:** comparten un único criterio (capítulos IX, X y Misión 0), con impactos en objetivos, cinemáticas saltables y explosiones.
- **Navegación del campamento:** rodea los tramos de valla largos.
- **Temporizadores de la instrucción:** usan el reloj del juego, así que respetan la pausa.
- **Diálogos de Koller:** las líneas que ya no vienen al caso se descartan.

## Rendimiento
- Campamento: ≈120–440 draw calls y ~0,35–0,55 ms de lógica por fotograma en las pruebas.
- Capítulo X: igual que antes.

---

# v22 · Húsares Argentum, empuñe, fortaleza defendible, obús con dotación, tren, edificios y físicas

Archivo jugable: **`Sombras_sobre_el_Nilo_1909_v22.html`**. Módulo nuevo: `src/v22.js`.

## 1. Húsares Argentum (cap. IX)
- **Aspecto:** kolpak de piel con bolsa roja y penacho blanco, pelliza azul con ribete de piel sobre el hombro, seis cordones dorados en el pecho, sabretache rojo con escudo, vaina de la espada en la cadera y carabina colgada a la espalda.
- **Carabina de caballería Mauser** (modelo propio: cañón corto, guardamanos, cerrojo acodado, cargador de 5, correa).
- **Alternancia espada ↔ carabina con transición de 0,8 s:** la mano va a la vaina o a la espalda, cambia el arma a mitad del gesto y vuelve. Nada aparece de golpe.
- **Elección del arma:**
  - En las cargas y a menos de 8 m, espada: guardia alta, tajo con aturdimiento y parada.
  - Entre 12 y 62 m, carabina: hostigamiento a caballo. El jinete gira el torso, el caballo encara al blanco si está parado, apunta a dos manos, dispara, acciona el cerrojo y recarga tras 5 disparos.
  - Al disparar en movimiento la dispersión es mayor.
- **Ya no se quedan inmóviles:** mientras «forman» esperando la orden de carga, hostigan con las carabinas. El capitán conserva la Ruby y la espada.
- **Desmontar:** no está implementado, porque el sistema de caballería no lo tenía. Todo el combate es montado.

## 2. Empuñe de armas (todas las tropas)
- **Postura de puntería resuelta numéricamente** sobre el esqueleto común (búsqueda exhaustiva fuera de línea): la mano derecha queda a 1,4 cm del objetivo y la de apoyo a 3 cm del guardamanos.
- **IK de muñeca:** cada fotograma la mano orienta el arma exactamente hacia el frente del soldado (cañón al frente y alza arriba). Antes el arma quedaba ladeada unos 30°.
- El arma se adelanta ligeramente al apuntar y vuelve a su sitio en reposo.
- **A quién se aplica:** vanguardia y guarnición, la escuadra al apuntar y los húsares con carabina (siguiendo el giro del torso).

## 3. Misión de entrenamiento: IA sin atascos
- **Grafo de navegación del campamento:** unos 80 nodos con aristas comprobadas contra los obstáculos y ruta más corta. Lo usan el sargento, los reclutas y la escuadra de instrucción cuando la línea recta está bloqueada.
- **Desatasco:** si un NPC no avanza durante 2,4 s, recalcula la ruta y se desplaza en lateral.
- **Separación entre unidades:** ningún soldado ocupa el sitio de otro y los NPC se apartan del jugador.
- **Corrección importante:** el punto de reunión de la fase VII estaba dentro de la berma del polígono de tiro y nadie podía llegar. Se ha movido.
- **Prueba:** Koller recorre las 13 estaciones del campamento y llega a todas, y la misión se completa de principio a fin.

## 4. Tren
- **Locomotora:**
  - caldera con cinco aros de latón, caja de humos con puerta y bisagras;
  - chimenea con corona, domos de vapor (latón) y de arena, silbato, farol;
  - pasamanos, estribos, topes y viga roja, quitapiedras;
  - filas de remaches, cabina con ventanas enmarcadas, resplandor del hogar y manchas de óxido.
- **Ténder** con carbón, tapa de agua, escalera y remaches.
- **Vagones:**
  - tablones verticales, puertas correderas con carriles y tirador;
  - techo curvo, escalerilla, rueda de freno, topes y enganches;
  - cartela, desgaste y tonos de madera distintos.
- **Movimiento:**
  - ruedas de radios y bielas de acoplamiento animadas según la distancia recorrida;
  - holgura entre vagones al frenar, con golpe sonoro.
- **Colisiones:** una caja por vagón, que se actualiza mientras el tren se mueve. Ya no se atraviesa.

## 5. Edificios, ventanas y puertas (campamento)
- **Ventanas con profundidad:** hueco oscuro, marco, cristal, cruceta, alféizar y contraventanas abiertas.
- **Puertas:** marco, tablones, travesaños, bisagras, tirador y escalón.
- **Tejados** con hiladas de tejas y chimenea con sombrerete. El cuartel tiene ventanas y puerta nuevas.
- **Barracón del este transitable:**
  - paredes reales y hueco de puerta;
  - interior con literas, estufa con tubo y mesa;
  - **puerta con bisagra animada** (USAR para abrir o cerrar).
- El portón del circuito de obstáculos es ahora de **doble hoja animada**.

## 6. Fortaleza de las Tres Coronas (cap. IX, fase 5)
- **Cuatro escaleras de piedra** (dos en la muralla sur, una en la este y otra en la oeste) con barandilla. El jugador sube por ellas y camina por la pasarela.
- **Parapeto exterior:**
  - frena caídas;
  - cubre a los tiradores agachados;
  - deja pasar los disparos de quien está de pie.
- **Dotación de la pasarela:** sacos en cada almena y cajas de munición.
- **16 puestos de tiro con ocupación** (10 en la sur, 3 en la este y 3 en la oeste).
- **IA de los fusileros:**
  - llegan por la puerta principal, suben por la escalera y avanzan por la pasarela hasta su almena;
  - se agachan tras el parapeto y se asoman para disparar (su línea de visión parte de la altura real);
  - no repiten almena.
- **Refuerzo de sectores:** cada 3 s, si un sector tiene 3 o más enemigos cerca y menos de 3 defensores, sube el fusilero libre más cercano.
- **Relevo:** quien recibe mucho daño cambia a otra almena.
- **Caída:** si la sección de muralla bajo sus pies vuela, el soldado cae al patio.

## 7. Obús de asedio con dotación (sustituye a la «bombarda arcana»)
- **Modelo:**
  - cureña de mástiles abiertos con arados;
  - ruedas de radios con llanta, escudo con mirilla;
  - cuna, cilindros de retroceso, tubo con aros, cierre;
  - arco de elevación, remaches;
  - caja de munición con proyectiles.
- **Dotación de tres:** artillero, cargador y auxiliar, que acompañan la pieza mientras avanza.
- **Ciclo coordinado:**
  - puntería: la pieza gira y eleva según la distancia, y el artillero maneja los volantes;
  - carga: el cargador va de la caja al cierre;
  - preparados: se tapan los oídos;
  - disparo: fogonazo, humo, polvo, retroceso del tubo, temblor de cámara y sonido;
  - recuperación.
- **Proyectil visible** en parábola con estela, que provoca explosión, cráter y daño a la guarnición.
- **Blancos:**
  - elige entre el jugador, la guarnición (algo menos a la de las murallas) y la escuadra, entre 40 y 175 m;
  - descarta blancos con obstáculos en los primeros 12 m del tiro.
- **Dotación reducida:** con menos sirvientes dispara más despacio; sin ninguno se queda en silencio.
- **Si se acercan aliados o hieren a la dotación**, esta abandona la pieza y combate. Vuelve al servicio cuando la zona lleva 6 s tranquila.

## 8. Físicas y colisiones
- **Separación entre personajes:** guarnición, escuadra, oficial, sanitario y NPC del campamento (0,9 m entre sí y respecto al jugador). También entre caballos (2,1 m).
- **Unidades en altura** (murallas, plataformas): ya no son expulsadas por el volumen sobre el que caminan.
- **Objetos empujables** (barriles y cajas) en el campamento y la fortaleza:
  - se apartan al chocar el jugador o los soldados;
  - frenan por rozamiento, rebotan en los muros;
  - salen despedidos con las explosiones.

## Otras correcciones
- **Nombres repetidos:** dos funciones de la v19 y la v21 repetían nombre con otras del juego (`mkDraco` del cap. VII y `upd11` de la fase de ruinas del cap. IX). Se han renombrado como precaución; las pruebas no mostraron que ninguna llegara a fallar.

## Rendimiento (pruebas en Chromium sin GPU)
- Fortaleza con 12 defensores, obús y oleadas: ≈700 draw calls y ~1,5 ms de lógica.
- Combate de húsares con 40 enemigos: ~3,4 ms de lógica.

## Limitaciones conocidas
- Los húsares no desmontan.
- La dotación del obús reutiliza el modelo de fusilero enemigo.
- Las mejoras de ventanas y puertas se aplican a los edificios del campamento. Las casas de la fortaleza conservan su modelo.
- No hay motor de cuerpos rígidos: la física de objetos es la descrita arriba.
- En algunas posturas extremas (cuerpo a cuerpo, muerte) el arma todavía puede atravesar el cuerpo.

# v23 · Misión XI «Operación Cielo de Acero» — Asalto aerotransportado, Eisenmark 1922

Archivo: `Sombras_sobre_el_Nilo_1909_v23.html` (código nuevo en `src/v23.js`; se construye con `python3 src/build.py`).
Menú → «XI · OPERACIÓN CIELO DE ACERO». El selector **PUNTO DE CONTROL** permite empezar en cualquiera de las siete fases.

## Desarrollo (≈6 minutos)
| Tiempo | Fase | Qué ocurre |
|---|---|---|
| 0:00 | Embarque | Cinemática «Todos a bordo» (megáfono, mecánicos, camión, bombarderos calentando motores). El jugador cruza la base, sube la rampa, entra en la góndola y toma asiento (E). Diálogo del «cacharro» y del correo; el sargento Brandner los manda abrocharse. |
| 0:45 | Despegue | Se cierra la puerta, se sueltan los amarres, el cepelín se eleva hasta 260 m. Se unen 5 bombarderos y 6 cazas de escolta. HUD «Mantén la posición… Avance de la formación». Diálogo de las «vacaciones»; el Hauptmann Adler ordena «¡A sus puestos!». |
| 1:40 | Interceptación | Breve cinemática de contacto. MG 08 de babor o estribor: cazas y aviones de ataque hacen pasadas desde el horizonte; la escolta los persigue. |
| 2:40 | Nubes oscuras | Niebla densa, turbulencia, motores que fallan. Dracos pequeños en grupos, dracos que se agarran a las ventanas, dracos blindados contra los motores, un draco que se estrella contra la góndola y el **dragón de guerra** (sin barra de vida; solo se le puede derribar en la parte final, si no se retira herido). Eventos: mecánico herido (ayudarlo con E), motor dos humeando, inclinación de la góndola y compañero que resbala y es sujetado, cinta de munición en el pañol. |
| 3:45 | El objetivo | Se despejan las nubes al atardecer. Cinemática con el oficial y el mapa, luego vista de la ciudad industrial amurallada (fábricas, chimeneas, estación, depósitos, arsenal, puente, refinería, puerto, AA, torres, barrios). Reflectores, sirenas, fuego antiaéreo. |
| 4:20 | Bombardeo | Palancas de lanzamiento en la bodega (si el jugador no llega, lo hace el oficial a los 15 s). Las compuertas se abren y las bombas caen, visibles por el **suelo de cristal**. Los bombarderos sueltan sus cargas. Explosiones distintas y escalonadas durante ~20 s: depósito ferroviario, combustible, arsenal (cadena de secundarias), AA, puente (se derrumba) y fábricas. Un draco se estrella contra un bombardero, otro pierde altura, el motor dos queda fuera. |
| 5:10 | Derribo | Explosión, el jugador cae al suelo, alarma roja, luces que fallan, humo, incendios pequeños que se pueden rodear, un panel que cae, carga suelta deslizándose. Lenz lo ayuda a levantarse; la escuadra salta por la puerta de emergencia. Diálogos del paracaídas. E en la puerta: **¡SALTAR!** |
| 5:35 | «La caída» | Cinemática en tercera persona: salto, caída libre, el cepelín ardiendo e inclinándose, compañeros con paracaídas, apertura del paracaídas, la ciudad en llamas, radio «…¡Weiss! ¿Me escuchás?…», fundido a negro y pantalla de resultados. |

## Sistemas
- **Vuelo con marco relativo:** la góndola no se mueve; el mundo (base, terreno en mosaico reciclable, nubes y ciudad) se desplaza y desciende, así que caminar dentro del dirigible es estable. La inclinación y la turbulencia se aplican a la cámara.
- **Góndola jugable** (44 m): compartimento de tropa con bancos, pasillo, radio, mesa de mapas, pañol de munición, dos troneras de MG 08, escalera a la escotilla, bodega de bombas con suelo de cristal, puerta de embarque y de emergencia, todo con colisión.
- **Base de Falkenhorst:** hangar de dirigibles, torre de control de tres plantas, cuartel, comedor, taller, depósitos de combustible, polvorín, estación ferroviaria con tren, cañones AA, nidos de MG, reflectores, garitas, alambrada, andamios, grúa, cables de amarre, camiones, bombarderos y cazas aparcados. Personal trabajando (mecánicos, pilotos discutiendo, patrulla, soldados fumando o comiendo).
- **IA aérea:** cada aparato tiene estados (aproximación, ataque, ruptura, agarre, retirada, derribado). Entran desde 560–820 m, hacen su pasada, rompen y vuelven. La escolta busca al enemigo más próximo al cepelín; los fusileros de la escuadra disparan desde las ventanas. Los derribados caen con humo y estallan en el suelo.
- **MG 08:** giro amplio pero limitado (±75°), cintas de 250 cartuchos con recarga manual (R / REC), recalentamiento con atasco, trazadoras, retroceso, casquillos y mayor alcance en el aire.
- **Daño expuesto:** el jugador solo recibe impactos si está en la MG o junto a una ventana del costado atacado.
- **Daño progresivo:** cristales que estallan, humo por las ventanas rotas, chispas, paneles que caen, alarma giratoria con luz roja, luces que se apagan, motores con humo o fuego, incendios en el casco.
- **Puntos de control:** al morir se reaparece dentro de la góndola sin perder la fase; el menú permite empezar en cualquier fase.

## Pruebas (Chromium sin GPU)
- Misión completa de principio a fin con las interacciones: embarque, asiento, MG, ayudar al mecánico, cinta, palancas, salto y pantalla final.
- Cada punto de control arranca en un estado coherente.
- Subida a la rampa con teclado real.
- Todos los niveles (1–12) arrancan sin errores (solo aparece el aviso esperado de la sonda de Ollama).
- El capítulo X se completa. Una ejecución automática se quedó en la compuerta de la fase IV, pero el mismo script también falla así a veces con la v22: es una inestabilidad previa del script, no de este cambio.
- **Rendimiento:**
  - base ≈630 draw calls, 0,5 ms de lógica;
  - en vuelo con 18 aparatos ≈110 draw calls, 0,7 ms;
  - bombardeo ≈70 draw calls.

## Limitaciones conocidas
- La inclinación de la góndola es visual (cámara): el suelo sigue siendo horizontal para la física.
- Los aviones y criaturas no colisionan entre sí; los choques (draco contra la góndola o contra un bombardero) están guionizados.
- Los NPC de la tripulación siguen rutas fijas dentro de la góndola, sin navegación general.
- Durante el embarque la escuadra puede cruzarse con el jugador en la rampa (se empujan, no se bloquean).

# v24 · «Cielo de Acero» mejorada: torreta ventral, cabina, aviación y más combate

Archivo: `Sombras_sobre_el_Nilo_1909_v24.html` (código en `src/v23.js`, sección v24).

## Torreta ventral con MG doble
- Cúpula acristalada bajo la popa de la góndola, colgada de un cuello, con aro, costillas y escotilla en el pañol.
- Se baja por la escotilla con E; **es el puesto que se ordena ocupar al empezar la interceptación**.
- **Giro libre de 360°**, MG doble con disparo alterno, caja de 500 cartuchos (R / REC para cambiarla), recalentamiento, trazadoras, casquillos y mira de anillo. Las cajas se reponen en el pañol.
- Los enemigos también atacan la torreta.

## Tripulación de aviación
- Soldados, sargento, radiotelegrafista y pilotos con chaqueta de cuero, casco de vuelo con orejeras y gafas, y bufanda. El oficial pasa a ser **Oberleutnant Adler**, con gorra de plato y uniforme azul de aviación.
- Sin fusiles: llevan **pistola en la pistolera de la cintura** y solo la desenfundan para disparar por una ventana cuando no están en una MG.

## MG 15 de trípode en las ventanas
- Cuatro MG 15 (camisa perforada, tambor doble) en las ventanas de babor y estribor, con un tirador cada una que apunta y dispara ráfagas.
- El jugador puede tomar cualquiera (E). El tirador se aparta y sigue con la pistola.
- Las balas atraviesan la franja de ventanas: ya se puede disparar a través de ellas.

## Cabina de mando
- En proa, con puerta que se abre y cierra con E.
- Dentro: dos pilotos en sus asientos, timón, rueda de profundidad, telégrafo de máquinas, instrumentos y ventanales.
- **Mapa de avance** en la pared, que se actualiza en vivo (ruta, posición del cepelín, porcentaje y fase).
- Los pilotos comentan la situación cuando entras.

## Aviones con pilotos
- Cada caza lleva su piloto, visible detrás del ala superior.
- Los aviones de ataque llevan además un artillero.
- Los bombarderos llevan dos pilotos, artillero de proa y artillero de cola.
- Los dracos blindados y el dragón llevan jinetes.

## Más combate aéreo
- Interceptación: 95 s (antes 62) con oleadas por la cola y desde abajo.
- Nubes y dracos: 88 s (antes 66).
- Más enemigos en la aproximación y el bombardeo. La misión dura unos 7 minutos.
- **Escolta de 8 cazas** (2 más).

## Base aérea ampliada
- Instalaciones: manga de viento, depósito de agua, planta de hidrógeno con tanques y tuberías, mástil de radio con vientos, mástil de amarre de celosía, globo cautivo de observación con su torno.
- En la plataforma: botellas de gas y banderas.
- Pista: carros con bombas, luces de pista, búnker de sacos con MG.
- Otros elementos: tiendas de mantenimiento, motocicleta con sidecar, camión cisterna, banco de motores y hélices de repuesto.
- Suelo con paleta de tierra y hierba (antes arena anaranjada).

## Pruebas
- Misión completa con torreta, MG 15, cabina y salto hasta la pantalla final.
- Los niveles 1–12 arrancan sin errores.

# v25 · Misión XII «Los que quedaron atrás» — tras las líneas del Principado de Praga

Archivo: `Sombras_sobre_el_Nilo_1909_v25.html` (código nuevo en `src/v25.js`). Menú → «XII · LOS QUE QUEDARON ATRÁS», con selector de **punto de control**:
- El árbol (misión completa)
- El bosque
- El granero
- Asalto a la granja
- Recuperar armamento enemigo
- El puente y los búnkeres
- Demolición

Al terminar la misión XI, el menú deja seleccionada la XII.

## Continuidad
Los supervivientes del Kaiser son tripulantes de la Fuerza Aérea de Eisenmark:
- guerrera y pantalón azul grisáceo de aviación, casco de acero, bufanda, correaje negro, cinturón y pistolera;
- insignia alada y ropa sucia o rasgada;
- vendajes (Krause en la cabeza, Ernst en el brazo), gafas de vuelo (Weiss), guantes y mochila (Müller);
- Adler con gorra de oficial y Vogel con casco de vuelo de cuero.

Todos empiezan **solo con la pistola Lugy**.

## Pistola Lugy y vista en primera persona
- **Lugy:** arma original de Eisenmark.
  - Silueta compacta tipo Ruby, empuñadura inclinada con cachas de madera estriada y botones de cerrojo de inspiración Luger.
  - Acabado pavonado, guardamonte, miras, aro de correa y emblema alado dorado.
  - Cargador de 8 cartuchos de 7,65 mm.
- **Modelo en primera persona** (escena propia dibujada encima, sin atravesar paredes):
  - mano derecha con palma sobre la empuñadura, tres dedos rodeando el frente, índice en el gatillo y pulgar alto en el costado;
  - mano izquierda de apoyo;
  - guantes de cuero y mangas azul grisáceas con puño y botones.
- **Animaciones:**
  - reposo con respiración, balanceo al caminar, arma inclinada al correr, inercia al girar;
  - disparo con retroceso, corredera que retrocede, dedo en el gatillo, fogonazo con luz y casquillos;
  - recarga completa: inclinar, soltar cargador, la mano izquierda trae uno nuevo, golpe y tirón de corredera;
  - revisión del arma (R con el cargador lleno, o tras un rato quieto);
  - bajar o subir el arma al interactuar, subir escaleras, recibir impactos y cambiar de arma;
  - transición al recoger un arma enemiga: la Lugy baja a la funda y se levanta el fusil, que se muestra un instante.
- **Fusil wz.29 y subfusil wz.39 «Mors» capturados**, ambos con manos y animación de disparo y recarga:
  - fusil: el cerrojo se acciona tras cada disparo y la recarga es con peine;
  - subfusil: recarga de cargador y tirón de la manivela.

## Desarrollo
1. **El árbol** (cinemática en primera persona, noche y lluvia): dos guardias y el perro Grauni, con todos los diálogos pedidos. Weiss y Ernst salen de los arbustos y abaten a los guardias con sus Lugy; el perro huye; te bajan del árbol.
2. **El bosque:**
   - patrullas con linterna (haz de luz), centinelas en hogueras y restos del Kaiser ardiendo;
   - sigilo: cono de visión, sospecha, ruido de disparos, ventaja al ir agachado, eliminación silenciosa cuerpo a cuerpo y alerta en grupo.
3. **El granero** de dos plantas, con altillo y escalera: Krause y Müller encañonan la puerta. Hay munición de pistola, mapa, linterna y herramientas. No hay fusiles.
4. **Asalto a la granja** con pistolas:
   - granja con casa de dos plantas, galpón con tractor, corral, pozo, carro, leñera, barricadas, cerca y portones;
   - unos 13 defensores: portón, patio, interior, tirador y ametrallador en las ventanas superiores, galpón y oficial.
5. **Camión de refuerzos** (modelo nuevo basado en tu imagen): llega con los faros encendidos y bajan 7 soldados.
6. **Recogida de armas** (cinemática): «No podemos continuar con las pistolas…». La escuadra se rearma (Müller con la ametralladora RKM). El jugador recoge el fusil y el HUD se actualiza. A partir de ahí los caídos sueltan munición y la Lugy queda como arma secundaria.
7. **El chofer** huye, Weiss lo detiene y se repite el interrogatorio completo; queda atado junto al camión.
8. **Puente y búnkeres:**
   - casamatas con tronera, nidos de ametralladora, torre con tirador, cañón ligero que dispara, patrulla con linterna en la vía y reflectores;
   - búnker de mando con pasillo, celda y puesto de mando.
9. **Rescate** del capitán Adler y el teniente Vogel (forzar la celda), con su diálogo. Después, el escritorio con la **orden de movimiento Nº 784** en pantalla.
10. **Demolición con cronómetro de 180 s:**
    - recoger las cargas en el depósito, colocarlas en la vía (barra de progreso) y volver al detonador;
    - el tren aparece en los últimos 44 s y solo se puede detonar con el tren encima;
    - llegan refuerzos por el puente este y por la vía oeste;
    - si se acaba el tiempo o mueres, se reintenta la fase.
11. **Final:**
    - explosión de la vía, frenada de emergencia con chispas y descarrilamiento parcial (vagones en tijera, vapor, incendios, soldados que salen);
    - diálogo final;
    - los pilotos se ponen capotes praguenses y conducen el camión; la escuadra va escondida bajo la lona;
    - plano aéreo y fundido;
    - pantalla «MISIÓN COMPLETADA» con «Próxima misión: El camino hacia las colinas».

## Principado de Praga (según tus referencias)
- **Uniforme:** capote negro largo, pantalón gris, casco de ala ancha (M/1923) y correaje.
- **Variantes:** fusilero (wz.29), tirador de subfusil (Mors), ametrallador (RKM wz.28) y oficial con rogatywka.

## Pruebas (Chromium sin GPU)
- La misión completa se recorre de principio a fin con interacciones y combates hasta la pantalla final; el reintento de la demolición también funciona.
- Los niveles 1–13 arrancan sin errores (solo aparece el aviso esperado de la sonda de Ollama).

## Limitaciones
- Las manos son de bloques, como el resto del juego, no un modelo orgánico.
- Los compañeros no reciben daño ni atraen el fuego enemigo, que se dirige siempre al jugador.
- El sistema de coberturas heredado puede hacer que un enemigo bien cubierto tarde en caer. Si en la granja quedan 1–2 atrincherados durante 45 s, huyen.
- El combate con el fusil mantiene la balística del juego (5 cartuchos y cerrojo).

## v26 · El último bastión (Misión XIII) + menú de campaña

- **Misión XIII «El último bastión»** (nivel 14): Fritz Hell, artillero del 3.er Regimiento de Infantería Blindada, con la tripulación Brenner (comandante), Otto (conductor) y Keller (cargador).
  - Cinemática dentro del tanque con órdenes por radio. Sólo se insinúa el sabotaje del tren: refuerzos que no llegan, línea de radio «...transporte ferroviario interrumpido...» y una nota en el mapa del palacio.
  - Avance blindado: el tanque se conduce con cañón y MG coaxial (tecla de cambio de arma) y tiene mira propia. Hay rutas alternativas por las calles laterales, cañones antitanque con dotación y tanques enemigos. El tanque recibe daño.
  - Fachada del edificio fortificado derribable con el cañón.
  - Emboscada: un antitanque rompe la oruga y te deja inmovilizado. Seguís combatiendo desde la torreta mientras pasa el tanque aliado de Kessel.
  - Cinemática del dragón: dobla el cañón y el tanque aliado lo abate.
  - «¡Abandonen el vehículo!»: animación en primera persona (escotilla, manos en el borde, deslizarse, desenfundar la Lugy).
  - A pie, en tres sectores:
    - Sector A, avenida de escombros, donde aparece el teniente Arnim («¿Tanquista?… Entonces hoy es infantería»).
    - Sector B, edificio de viviendas de 5 pisos: se entra por la brecha, se limpia la planta baja, se destruye la MG del 2.º piso y se sale por el patio trasero.
    - Sector C, plaza de la catedral, donde un tanque propio rompe un muro.
  - Palacio Real:
    - jardines con trincheras, alambre y minas, donde los zapadores vuelan la barricada;
    - puerta con MG y cañón ligero, que se abre con una carga de asalto;
    - gran salón, escalera monumental, piso superior y torre.
  - Terraza: dos defensores. Luego se retira la bandera enemiga y se iza la de Eisenmark, con el diálogo final y el parte por radio.
- **Menú estilo campaña clásica**: fondo sepia animado y columna de opciones (Continuar campaña, Selección de misión, Opciones, Controles, Informe del frente). La selección de misión agrupa las misiones e incluye el informe de cada una y los puntos de control.

## v27 · Misión XII mejorada (Los que quedaron atrás)

- **Brújula y minimapa** (misiones XII y XIII): una franja de rumbos arriba marca el objetivo con una estrella. Un minimapa circular gira con la vista y muestra edificios, la escuadra (verde), los enemigos cuando hay combate abierto (rojo) y el objetivo; si el objetivo queda fuera del mapa, aparece una flecha en el borde. Debajo se ve la distancia al objetivo.
- **Baliza roja parpadeante** en el punto de la vía donde se colocan las cargas: anillo pulsante, columna de luz, flecha y luz roja.
- **Búnkeres**:
  - Las casamatas pasan de 6×4,4 m a 10×7 m. Tienen tronera frontal con pilares, puerta trasera blindada abierta, techo con tierra y sacos terreros, terraplenes, MG, bancos y lámpara.
  - El búnker de mando suma puerta blindada, alas de hormigón, cartel, foco, terraplenes y red de camuflaje.
- **Edificios**:
  - Granero: zócalo de piedra, tablones, hastiales, portones con cruz de San Andrés, altillo, cumbrera y veleta.
  - Casa: ventanas con marcos, postigos y luz, chimeneas, porche y jardineras.
  - Galpón: más detalle.
- **Aliados con el uniforme de aviación** del cepelín (capítulo XI): chaqueta de cuero, casco de vuelo con gafas y bufanda. La Lugy va en la funda.
- **Casco praguense tipo wz.38** en acero marrón: cúpula, faldón abierto, reborde, remaches, barbuquejo y escarapela.
- **Interrogatorio del chofer rehecho**:
  - El chofer retrocede con las manos en alto, cae de rodillas, suplica, lo agarran del cuello, señala la vía y termina atado.
  - Weiss apunta con la Lugy mientras Krause y Müller cubren. Hay más planos de cámara.
- **Huida en camión rehecha**:
  - El escuadrón sube a la caja y Adler y Vogel se ponen los capotes praguenses.
  - Se baja la lona y la caja queda iluminada por una linterna.
  - En el camino al oeste hay un control praguense con barrera y centinela con farol, que los deja pasar.
- **Camión un 22 % más grande** para que todos quepan mejor.

## v28 · Misión XIV «El fiordo de los condenados» (nivel 15) + selección de misión deslizable

Misión naval completa de la Marina Real de Eisenmark (1922). Protagonista: Matthias Kern, marinero de segunda, a bordo de la torpedera B-17 «Wolfszahn».

- **Módulos**:
  - `src/v28_ships.js`: modelos navales (agente «ingeniero naval»): casco paramétrico, Wolfszahn, patrulleras, destructor, acorazado ZH-01 «Tianlong», barcaza, hidroaviones, torpedo, boyas y restos.
  - `src/v28_env.js`: fiordo (agente «diseñador de entornos»): terreno, agua animada, témpanos, bosques y minimapa del fiordo.
  - `src/v28_base.js`: base naval Kaltfjord y piezas destructibles.
  - `src/v28.js`: sistemas e integración.
- **Fases**: 1 rutina · 2 alarma · 3 defensa del puerto · 4 escoltas · 5 ataque aéreo · 6 plan de Falk · 7 primer torpedo · 8 caos naval · 9 último torpedo · 10 última defensa antiaérea · 11 retirada.
  - Fase 1: cajas, batería y torpedo.
  - Fase 2: el acorazado surge de la niebla y destruye la batería 1, el combustible, la grúa y el muelle 2.
  - Fase 3: barcazas de desembarco; hay que proteger el arsenal.
  - Fase 6: el canal del oeste y el paso lateral.
  - Fase 8: colisión entre un aliado y un destructor, restos flotantes y náufragos.
  - Fase 9: el último torpedo va a la popa; el acorazado pierde el timón y encalla.
- **Sistemas**:
  - **Navegación**: arcade con inercia, telégrafo, timón, colisión con el terreno y los barcos, oleaje, estela y espuma.
  - **Puestos (1-5 / ARM)**: puente, cañón de proa, Flak, director de torpedos y sala de máquinas.
  - **Daños por componentes**: casco, motor, hélice, timón, cañón, Flak, tubos, radio y combustible.
  - **Incendios e inundación**: la tripulación (Brandt, Keller, Voss) hace el control de averías y el jugador puede apagar fuegos y activar las bombas.
  - **Armas**: torpedos con seguro, giróscopo, estela, recarga y fallos (pasan por debajo, chocan con rocas, el enemigo esquiva); Flak con espoleta de proximidad.
  - **Acorazado con 12 sectores**: torres, puente, chimeneas, timón, propulsión, costados y otros; inundación y escora.
  - **IA**: patrulleras, destructores (incluido un abanico de torpedos) y aliados con 7 órdenes por radio (T/ORD).
  - **Radio, bengalas y vigía**: la radio sufre interferencias y, si se rompe, pasa a lámpara de señales; bengala roja (GRA); el vigía da rumbo, distancia e identificación parcial.
  - **Clima y HUD**: niebla, nieve y viento por fase; HUD naval contextual y minimapa del fiordo.
  - **Rescates y dificultad**: rescate de náufragos con cuerda; usa la dificultad del menú.
- **Menú**: tarjetas de misión, lista deslizable (táctil y rueda) con indicador, y diseño apilado en pantallas chicas que lleva directo al panel.

## v29 · Kaltfjord ampliado, rescate médico y cámara del tanque

- **Entorno**:
  - Techos invertidos corregidos: el signo de la pendiente estaba al revés en la base naval, el granero, la casa y los terraplenes de la misión XII.
  - Utilería instanciada (un draw call por tipo): sacos terreros, cajas, erizos checos, sendas pisoteadas y faroles con halo.
  - Fiordo ampliado ×1,2 de forma progresiva (`W28`/`IW28`): la base queda igual y mar adentro todo crece.
  - Acorazado escalado ×1,2, con impactos, sectores, calado y navegación ajustados.
- **Personajes**:
  - Marinero de Eisenmark: chaqueta blanca, pantalón azul, charreteras M40 azul petróleo y gorra negra con distintivo verde y granate.
  - Infantería de marina: el mismo uniforme, más cartucheras y correaje, y casco de acero tipo SSh-36.
  - Personal sanitario: 2 enfermeras, 1 médico y 2 sanitarios, con cruces visibles.
  - Nuevas poses: estabilizar, levantar, llevar la camilla, herido acostado, tirador y cargador de MG.
- **IA**:
  - Defensores con máquina de estados: reposo → alerta → arsenal (se arman) → cobertura → combate → herido.
  - 2 nidos de MG-15 con tirador y cargador: el cargador recarga y alarga las ráfagas; si cae el tirador, el cargador toma el arma.
  - Fuego enemigo contra los aliados: pueden quedar heridos.
  - Equipo médico que acude bajo fuego, estabiliza, carga al herido en la camilla, lo lleva sincronizado entre dos sanitarios a la enfermería y lo entrega a una enfermera.
  - El perro de la base acompaña al capitán Falk y, durante los rescates, al equipo médico.
  - Tripulación automática del Wolfszahn: Keller opera el cañón y Lenz el Flak cuando el jugador no los maneja.
  - Tras el desembarco y las escoltas, el acorazado retrocede hacia mar abierto.
- **Tanque (nivel 14)**:
  - Cámara en tercera persona sobre y detrás de la torreta, con inercia y colisión contra edificios y suelo.
  - Retícula central y anillo que marca hacia dónde apunta realmente el cañón.
  - V / 1ª-3ª alterna con la mira del cañón.

## v30 · Operación Nachtfall, tanque pesado, IA aliada por estados y biblioteca de recursos

- **Nueva misión XV · Operación Nachtfall** (nivel 16, `src/v30_taikin.js`):
  - Intro nocturna en la base de cepelines del cap. XI: equipo, diálogos y subida por la rampa.
  - Despegue y vuelo hacia Taikin; el 88 mm alcanza un motor, suenan las alarmas y llega la orden de salto.
  - Salto interactivo: caída libre con vista de máscara de gas, apertura del paracaídas (ESPACIO / USAR), dirección con WASD o joystick, aterrizaje y rescate si se cae en un lugar inválido.
  - Reagrupar a 4 paracaidistas: combatiendo, herido (se venda), escondido y esperando. Hay un contenedor de suministros.
  - Infiltración del perímetro: trinchera, torres con reflectores que delatan al jugador y puesto de control.
  - Tres antiaéreas híbridas (AA-1, AA-2 y AA-3) con guarnición que aparece al acercarse; se destruyen con carga explosiva.
  - Bengala (GRA) o baliza (USAR) para la segunda ola: cepelines, paracaidistas que caen y se suman a la escuadra, y un contraataque.
  - Ciudad de Taikin: periferia agrícola, patio ferroviario, canal con tres puentes, bloques estilo Leningrado, casas bávaras, fábricas con chimeneas y complejo militar.
- **Biblioteca reutilizable** (`src/v30_lib.js`, `LIB30`): paracaidista, casco aerotransportado, máscara de gas, mochila y arnés, paracaídas, baliza, cañón de 88 mm, antiaéreo híbrido cuádruple, 3 cabezas femeninas, casco de infantería de marina v2, infantería de marina de Zheng-Hua (exploradores, línea, choque y apoyo) y Vanguardia de choque de Eisenmark (sobre `mkEis` de Alejandría).
- **Tanque**:
  - Masa e inercia, giro sobre su eje, colisión con edificios, se aparta de los aliados y puede arrollar enemigos.
  - Suspensión visual, retroceso al disparar y torreta con inercia.
  - Daño por zonas: frontal, lateral y trasero; polvo y cráteres en los impactos.
- **IA aliada**: estados IDLE, FOLLOW, ALERT, ENGAGE, SEEK_COVER, ADVANCE, DEFEND y REGROUP. Prioriza amenazas al jugador, recarga, reacciona a explosiones, evita atascos y obedece órdenes (T/ORD: seguir, avanzar, mantener).
- **Fiordo**:
  - Desembarco en 5 oleadas de infantería de marina de Zheng-Hua; contraataque de la Vanguardia de choque.
  - Cámara exterior de la torpedera en el puente (V / 1ª-3ª alterna).
  - El 88 mm de las baterías apunta, dispara y retrocede.
  - Torre del vigía arreglada: las vigas se dibujaban en el origen del mundo.
  - Enfermeras con rostro femenino; marinero que estaba sobre el agua reubicado.
- **Terreno**: textura de suelo procedural y calcomanías instanciadas (barro, grava, huellas, cráteres, quemado, aceite) en Taikin, el fiordo, la ciudad del tanque y la misión XII.

## v31 · Iron Foundry
- **Operación Nachtfall (nivel 16):** los paracaidistas ahora aterrizan (ya no quedan colgados en el aire); hay patrullas entre las baterías AA y una patrulla de reacción después de cada voladura; vuelve la brújula/minimapa; Taikin suma más edificios (fila ribereña, iglesia de aldea, ruinas, manzanas, galpones, puestos de mercado).
- **Máscara de gas:** una capucha de goma que cubre toda la cabeza, con oculares, válvula y filtro.
- **Casco de paracaidista:** de inspiración Fallschirmjäger: sin ala, con el borde levantado al frente y barbijo en Y.
- **Nivel 12 (misión XI):** más detalle en la base del cepelín y en la ciudad (techos, casas bombardeadas, fábricas, cráteres).
- **Nivel 13 (misión XII):** granero y casa con interior, cobertizo, accesorios de granja, recinto ferroviario y detalle del puente.
- **Nivel 14 (misión XIII):** fachadas, tiendas, balcones, mansardas, daños, catedral y palacio. Para Android se adorna solo lo que se ve desde las rutas, con unos 120k vértices extra.

## v32 · Golfo de Hierro (Aethrion 1922)
- **Misión XVII «Golfo de Hierro — El viento no lleva nombres»** (nivel 17, nueva campaña de Volskaya), en 6 fases con puntos de control:
  1. Puesto de Karsk.
  2. Barranco Sokol.
  3. Línea de las Tres Cruces.
  4. Contraataque de hierro.
  5. Drovna arde.
  6. Puente de Orlov.
- **Mapa del Golfo de Karskaya** (`v32_env.js`): puesto y faro, barranco, trincheras, estepa, estación, refinería, puerto, garganta con puente, mar, niebla, aguanieve y viento.
- **Soldados** (`v32_lib.js`): 10 tipos de Volskaya y 9 de Veyrn, basados en las láminas de referencia.
- **Vehículos de 1922** (`v32_veh.js`): tanques, blindados, camiones, tren, cañones, morteros y barcos, con IA, daño y restos que sirven de cobertura.
- **Primera persona en todo el juego** (`v32_vm.js`): manos con dedos, armas con detalle, ciclo de cerrojo, recargas, vainas, fogonazo, sprint, bayoneta y lanzamiento de granada.
- **Opciones → Gráficos** (`v32.js`): presets Baja/Media/Alta/Ultra, resolución, detalle, partículas, distancia de visión, límite de FPS (30/45/60), medidor de FPS y brillo.
