# v50 · Edición Aethrion (versión preliminar)

`python3 v50/tools/build_v50.py` → `Sombras_sobre_el_Nilo_1909_v50.html`. Toma como base V.GAI.1.0, que ya incluye la v39, el cerebro de la v40 y la v41, y le suma estos módulos:

| Módulo | Qué es | Estado |
|---|---|---|
| `src/brain_v50.js` | Une en un solo recorrido la IA de la v33, el cerebro de Aethrion (v40) y la IA táctica de V.GAI. | Borrador sin pruebas propias (agente detenido por límite de uso). |
| `src/doors_all_v50.js` | Puertas de V.GAI coherentes por tipo de edificio: madera, madera con vidrio y hierro. | Borrador sin pruebas propias. |
| `src/veyrn_v50.js` | Pulido de los niveles XIX y XX. | Borrador sin pruebas propias (estaba en revisión de errores). |
| `src/v50.js` | Integración. | Vacío. |

**Prueba de arranque (2026-11-28):** los niveles 3, 13, 14, 17, 18, 19 y 20 arrancan y corren 200 cuadros sin errores de página.

**Pendiente:**
- Recorridos completos de los niveles 19 y 20.
- Métricas de la IA.
- Verificar puerta por puerta.

## v50.2
- **Nivel 18:** se quitó la placa marrón de las puertas viejas (`door17`/`door18`). Ahora la hoja nueva de V.GAI/v50 la reemplaza.
- **Nivel 17:**
  - 9 oleadas en lugar de 5.
  - Cada oleada ataca también las otras dos cruces.
  - Desde la 3.ª oleada entra un blindado o tanque de Veyrn extra por la otra punta de la línea.
  - El contraataque (IV) encuentra 3 blindados más defendiendo la estación: 5 en total.
  - La cinemática de «IV · Contraataque de hierro» pasa a tener 5 planos: vista aérea, el tren, los camiones, el tanque y la estación al norte, con artillería a lo lejos.
