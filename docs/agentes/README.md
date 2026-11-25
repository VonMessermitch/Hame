# Agentes de Aethrion — copia utilizable

Esta carpeta convierte la **Biblioteca de agentes** de [`docs/agentes.txt`](../agentes.txt)
en archivos de agente listos para usar (un archivo por agente, con frontmatter).
`docs/agentes.txt` sigue siendo la fuente original: si cambiás la biblioteca, cambiá
también el archivo correspondiente de acá.

| Archivo | Agente | Se ocupa de |
|---|---|---|
| [`00-ingeniero-principal.md`](00-ingeniero-principal.md) | Ingeniero principal / coordinador | Reglas del proyecto, reparto de trabajo, integración, entregas |
| [`01-arquitecto-integrador.md`](01-arquitecto-integrador.md) | A · Arquitecto / integrador | Dependencias, choques de nombres, build y regresión |
| [`02-entornos-mapas.md`](02-entornos-mapas.md) | B · Entornos y mapas | Sectores fusionados, edificios transitables, clima, LOD |
| [`03-personajes-armas.md`](03-personajes-armas.md) | C · Personajes y armas | Uniformes, siluetas, equipo, variación anti-clones |
| [`04-vehiculos-blindados.md`](04-vehiculos-blindados.md) | D · Vehículos y blindados | Modelos cacheados, IA vehicular, dotaciones |
| [`05-aviacion-criaturas.md`](05-aviacion-criaturas.md) | E · Aviación y criaturas | Aviones, dracos, pasadas de ataque |
| [`06-ia-combate.md`](06-ia-combate.md) | F · IA de combate | Percepción, coberturas, escuadras, aliados |
| [`07-diseno-mision.md`](07-diseno-mision.md) | G · Diseño de misión | Fases, checkpoints, objetivos, cinemáticas |
| [`08-primera-persona.md`](08-primera-persona.md) | H · Primera persona | Manos, armas, cerrojo, recargas |
| [`09-sonido.md`](09-sonido.md) | I · Sonido | Muestras, mezcla, ambiente, voces |
| [`10-hud-android.md`](10-hud-android.md) | J · HUD y controles Android | Doble pulgar, arrastre, ajustes |
| [`11-qa-limpieza.md`](11-qa-limpieza.md) | K · QA y limpieza | Congelados, flotantes, atascos, regresión |

## Cómo usarlos

- **Claude Code:** los agentes de `.claude/agents/*.md` tienen el mismo contenido y se
  cargan solos; se invocan como subagentes y pueden correr en paralelo con archivos
  propios. Los de esta carpeta (`docs/agentes/`) sirven para cualquier otra
  herramienta: pegá el archivo como *system prompt* del subagente o como fase.
- **Cualquier chat sin subagentes:** pegá `00-ingeniero-principal.md` y después el
  bloque del agente que toque, en orden (primero assets, después misión, al final QA).
- **Máximo 5 en paralelo**, cada uno con archivos propios y una SPEC común con
  coordenadas, nombres exactos de funciones y reglas.
- **Los agentes no hacen commit.** Integra, prueba y hace commit el coordinador.
