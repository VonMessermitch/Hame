# Auditoría de Niveles y Misiones (Niveles 1–20)

## 1. Niveles Originales (1–18) — Preservación
Los capítulos I–XVIII (`Sombras_sobre_el_Nilo_1909_v39.html` y `Sombras_sobre_el_Nilo_1909_v41.html`) permanecen intactos en estructura, objetivos, enemigos, scripts de nivel y lógica de victoria/derrota. Se añadieron mejoras aditivas transversales (brújula/minimapa universal y puertas interactivas en zonas accesibles).

## 2. Nuevas Misiones — Campaña de Veyrn (Niveles 19 y 20)

### Nivel 19 (XIX) · Operación Rompeolas (Mapa base: Karsk / `buildKarsk17`, `X17`)
- **Perspectiva**: Facción **Veyrn** (*Oberleutnant Brandt*, 4.º Sturmregiment) contra guarnición de Volskaya.
- **Armamento inicial**: Fusil Veyrn V98, Subfusil Sturm V22, Pistola V-08 y 3 granadas.
- **6 Puntos de Control (`#cp19`) y Fases**:
  1. **Desembarco del Faro** `[105, 38]` → Tomar el puesto costero `[35, 22]`.
  2. **Barranco Sokol** `[12, -45]` → Remontar el barranco hasta `[-30, -165]`.
  3. **Línea Tres Cruces** `[-10, -210]` → Abrir brecha en las defensas `[-2, -255]`.
  4. **Depósito de Terek** `[-30, -450]` → Asegurar la estación ferroviaria `[-30, -480]`.
  5. **Puerto de Drovna** `[55, -620]` → Sabotear depósitos de combustible `[82, -642]`.
  6. **Puente de Orlov** `[-20, -740]` → Cruzar el puente y asegurar la orilla norte `[-20, -860]`.
- **Objetivos Secundarios**:
  - Sabotear la radio costera de Volskaya (`[36, 22]`, `+350` pts).
  - Recuperar planos de defensa en el edificio de Terek (`[-42, -576]`, `+400` pts).

### Nivel 20 (XX) · Bastión de Hierro (Mapa base: Varnholt / `buildVarn18`, `X18`)
- **Perspectiva**: Facción **Veyrn** (*Hauptmann Lindemann*) en defensa y contraataque invernal sobre Varnholt frente a columnas de Volskaya.
- **6 Puntos de Control (`#cp20`) y Fases**:
  1. **Bosque de Dravik** `[0, 15]` → Contener vanguardia enemiga al sur `[0, 75]`.
  2. **Muro de Varn** `[0, -185]` → Defender el paso del foso antitanque `[-35, -172]` y Cota 214.
  3. **Meseta de Varn** `[-40, -340]` → Contraatacar batería en `[-40, -405]`.
  4. **Calles de Falkenbrück** `[0, -610]` → Sostener la plaza `[0, -650]`.
  5. **Playa de Vías** `[-90, -710]` → Despejar estación y talleres `[-125, -705]`.
  6. **Ciudadela y Puente** `[0, -785]` → Rechazar asalto final y asegurar el puente norte `[0, -875]`.
- **Objetivos Secundarios**:
  - Calibrar observatorio en Cota 214 (`[70, -250]`, `+350` pts).
  - Reagrupar patrulla aislada en la Granja borgoñona (`[-70, -368]`, `+400` pts).

## 3. Códice y Guardado
Ambas misiones figuran en `#lvsel`, en el panel del Códice (`#cod → cpL`) bajo **CAMPAÑA DE VEYRN · AETHRION 1922–1923**, y persisten avance en `localStorage` (`rompeolas_vgai`, `bastion_vgai` y checkpoints).
