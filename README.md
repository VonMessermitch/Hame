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
