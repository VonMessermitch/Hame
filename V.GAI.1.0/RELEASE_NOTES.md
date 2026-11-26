# Sombras sobre el Nilo 1909 + Aethrion · V.GAI.1.0 (IRON FOUNDRY)

## Resumen de cambios
- **Campaña completa (Niveles 1–20)**: Niveles 1–18 intactos + **Nivel 19 (XIX · Operación Rompeolas, Veyrn en Karsk)** y **Nivel 20 (XX · Bastión de Hierro, Veyrn en Varnholt)** con 6 puntos de control reales y objetivos secundarios.
- **Puertas e interiores (`doors_vgai.js` + `core_vgai.js`)**: Nivelación automática al terreno real (`sampleDoorY`), supresión de hojas congeladas en casamatas/búnkeres/vías, sincronía de puerta de cabina del Zepelín (L12), AABB orientados por bisagra en `obstB` con invalidación `NV.sig` y empuje anti-atrapamiento.
- **Cerebro táctico NPC y colisiones globales (`ai_tactical_vgai.js`)**: Eliminación de omnisciencia global (`AI33.cfg.rumor`), conos de visión/sigilo/niebla, memoria LKP con decaimiento, emoción/moral Iron Mod, asignación de cobertura sin solapes, bloqueo de fuego amigo, recarga a cubierto y `solveSoldierCollisions` global con verificación contra muros.
- **Arquitectura de niveles (`levels_arch_vgai.js`)**: Mejoras tácticas en *Las Tres Cruces* (L17/19), *Martillo de Hierro* (L18/20), entornos urbanos L13/L14 y preservación de calzadas >= 6 m para tanques.
- **Armamento en 1.ª persona (`weapons_vgai.js`)**:
  - Nivel 12 (Zepelín): restricción estricta a Pistola Lugy 7,65 mm (modelo único en 1.ª persona).
  - Niveles 17–20: contenedor militar verde oliva con puertas abiertas, colisionadores y recogida interactiva `[E]` del **Fusil Antitanque AT-18** con daño AP real contra blindados.
  - Ametralladora MG08: rediseño visual `mkMG08` y vista dedicada en 1.ª persona (`VM32.R.MG`) con cinta animada y vapor.
- **Vehículos y dotaciones (`vehicles_at_vgai.js`)**: Tanques Sokol/Vrak a escala `+18%`, cañones AT `+15%`, corrección de fusil colgado a la espalda (`slingRif`) para artilleros de AT/MG y onda de choque en disparo.
- **Paracaidistas de Taijin (`paratroopers_vgai.js`)**: Deriva por viento, inflado de campana, separación entre pares, evasión de canal/obstáculos y aterrizaje seguro sobre terreno transitable.
- **Audio contextual (`audio_vgai.js`)**: 53 clips normalizados (EBU R128 `-16 LUFS`) en OGG/MP3 más perfiles espaciales 3D dedicados por arma, recarga e impacto con limitación de frecuencia.
