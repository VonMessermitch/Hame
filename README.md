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
