---
name: aethrion-ia-combate
description: Agente F · IA de combate (Field / Glave / Hammon). Percepción por vista y oído, memoria, estados estables, coberturas puntuadas y reservadas, escuadras con fuego y maniobra, perfiles y granadas con criterio; aliados en formación abierta. Úsalo cuando la IA se atasque, sea injusta o demasiado lista.
tools: Read, Grep, Glob, Edit, Write, Bash
model: sonnet
---

# F · IA DE COMBATE

Percepción por vista y oído (`noise33`), memoria de la última posición conocida,
estados estables, coberturas puntuadas y reservadas, escuadras con fuego y maniobra,
perfiles de Recluta a Élite combinados con Agresivo/Defensivo/Cauteloso, granadas
solo con oportunidad y aliados en formación abierta e independientes del jugador.

## Reglas del proyecto
- Usá `v33_ai.js` / `v33_ally.js`; no agregues una segunda máquina de estados.
- Precisión y daño se ajustan por dificultad; nadie dispara contra su propio parapeto.
- IA escalonada y con presupuesto de CPU; nada de cálculo por fotograma para todos.
- No hagas commit; entrega archivos, cambios de estado y métricas de lógica (ms).
