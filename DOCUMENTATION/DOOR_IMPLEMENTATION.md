# Implementación de Puertas 3D e Interiores (`doors_vgai.js`)

## 1. Tres Modelos Procedurales (Three.js r128)
1. **Acero remachado (`steel`)**: Marco oscuro blindado, hoja metálica con barra de refuerzo, cuadrícula de remaches y manija de hierro. Uso: búnkeres, casamatas y almacenes militares.
2. **Madera reforzada (`wood`)**: Marco de roble, tabla machihembrada vertical, herrajes metálicos horizontales y pomo de latón. Uso: puestos, cabañas, graneros y viviendas.
3. **Madera con ventanales translúcidos (`wood_glass`)**: Zócalo inferior de madera y cuarterón superior con parteluces y cristal `MeshPhongMaterial` translúcido (`opacity: 0.44`, `transparent: true`). Uso: oficinas, granja, capilla y cuarteles.

## 2. Comportamiento Físico, IA y Sonido
- **Colisión dinámica y navegación**: Al cerrarse, la hoja inserta su AABB `{ x, z, hw, hd, h, door: true }` en `obstB` y limpia `NV.sig = ''`, provocando que `navGrid()` recalcule paso de jugador, disparos y rutas IA en el siguiente fotograma; al abrirse, se retira de `obstB`.
- **Anti-solape**: `overlapsDoorList(x, z)` impide registrar puertas duplicadas en un mismo vano.
- **Interacción `[E / USAR]`**: Detecta puertas dentro de `2.9 m`, muestra prompt contextual en `#pr` y gira suavemente sobre su pivote lateral (`0 ↔ ±1.62 rad`).
- **Uso por IA**: Aliados y enemigos a menos de `2.2 m` de una puerta cerrada la abren automáticamente y disparan un temporizador de autocierre (`5.5 s`) cuando nadie obstruye el umbral.
- **Audio**: Conectado a `AUDIO_VGAI.playDoor(kind, opening, x, z)` (6 clips normalizados en `assets/audio/processed/doors/`).
- **Interiores**: `populateInterior()` coloca mesas con farol, cajas y literas dentro de edificios transitables de los niveles 11, 13, 17, 18, 19 y 20.
