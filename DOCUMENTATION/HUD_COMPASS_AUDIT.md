# Auditoría de HUD, Brújula y Navegación (`hud_compass_vgai.js`)

## 1. Correcciones de Brújula
- **Convención del motor verificada**: `-Z = Norte (0° N)`, `+X = Este (90° E)`, `+Z = Sur (180° S)`, `-X = Oeste (270° O)`.
- **Orientación real**: Calcula la dirección horizontal de cámara con `cam.getWorldDirection(v)` mediante `headingDegFromDir(dx, dz) = normDeg(atan2(dx, -dz) * 180 / π)`, manteniendo sincronía exacta tanto a pie como en vehículo, tanque, barcaza o ametralladora fija.
- **Sin saltos en `0° / 360°`**: `shortestAngleDiffDeg(fromDeg, toDeg)` normaliza la diferencia angular al intervalo `[-180°, +180°]` para interpolación exponencial suave (`k = clamp(dt * 20, 0.15, 1)`).
- **Lectura numérica + cardinal**: `#dist27` muestra `OBJ · {distancia} m · {grados}° {cardinal}` (o rumbo cardinal cuando no hay objetivo activo).

## 2. Minimapa Universal (Niveles 1–20)
- `mm27(dt)` funciona ahora en **todos los capítulos 1 a 20** (ocultando `#arrow` cuando está activo y respetando cinemáticas `L9.cine`).
- **Capas representadas**:
  - Muros y obstáculos filtrados desde `obstB` rotados al rumbo del jugador.
  - Anillos de distancia de `20 m` y `40 m`.
  - Puertas interactivas (`AETH.vgai.doors.list`): amarillo si cerradas, verde suave si abiertas.
  - Aliados (`allies`, `sq` de niveles 13–20): puntos verdes.
  - Enemigos (`enemies`) y vehículos (`VEH32.list`): puntos rojos y marcadores naranjas/celestes.
  - Estrella amarilla / flecha en el borde indicando el objetivo activo (`L9.obj`, `N19.obj`, `N20.obj`, `OB` o enemigo más cercano).
  - Indicador `'N'` rotando alrededor del borde según el Norte real.

## 3. Layout Responsivo Sin Solapes
- Reglas `#css_vgai_hud` reposicionan `#mm27`, `#dist27`, `#gar`, `#bap18`, `#score`, `#combo`, `#style`, `#cp27`, `#bb`, `#t13` y `#feed` usando `clamp()` y variables seguras `--sl`, `--st`, `--sr`, `--u` para evitar colisiones visuales en 1920×1080, 2560×1080, 1366×768 y móvil vertical/horizontal.
