# Voces locales con Kokoro-82M

Pipeline para dar voz a los subtítulos del juego **sin API, sin nube y sin coste**.
Kokoro-82M es un modelo TTS de 82 M de parámetros, Apache 2.0, que corre en CPU
(unos 3–5 s de audio en 1–3 s de proceso en esta máquina de 2 núcleos).

## 1 · Instalación (una vez)

```bash
python3 -m venv tools/voz/.venv
tools/voz/.venv/bin/pip install kokoro-onnx soundfile lameenc

mkdir -p tools/voz/modelo
curl -L -o tools/voz/modelo/kokoro-v1.0.onnx \
  https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
curl -L -o tools/voz/modelo/voices-v1.0.bin \
  https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
```

Son 311 MB de modelo + 27 MB de voces. Están en `.gitignore`: no se versionan, se
descargan. Si preferís tenerlos en otro lado, exportad `KOKORO_MODELO` y `KOKORO_VOCES`
con las rutas completas.

## 2 · Generar

```bash
tools/voz/.venv/bin/python tools/voz/kokoro_local.py            # todo el guion
tools/voz/.venv/bin/python tools/voz/kokoro_local.py --solo koller_01,falk_01
tools/voz/.venv/bin/python tools/voz/kokoro_local.py --voz ef_dora   # forzar voz
tools/voz/.venv/bin/python tools/voz/kokoro_local.py --formato wav
python3 tools/voz/empaquetar_voces.py                           # → v40/data/voces_v40.js
```

- Entrada: `tools/voz/guion.json` (`id`, `texto`, `voz`, `idioma`, `velocidad`).
- Salida: `assets/voz/<id>.mp3` + `assets/voz/manifest.json` (duración, KB, voz).
- El empaquetador genera un módulo con base64 y un índice **texto normalizado → id**
  para que el reproductor encuentre el clip por el subtítulo.

Voces en español de Kokoro v1.0: **`em_alex`** y **`em_santa`** (hombres),
**`ef_dora`** (mujer). Hay 54 en total para inglés, francés, italiano, portugués,
hindi, japonés y chino.

## 3 · Enchufarlo al juego

El módulo `voz40.js` es aditivo: si no hay clips, no hace nada. **Ya está inyectado**
en el build de la v40 (`v40/tools/build_v40.py` añade `v40/data/voces_v40.js` y
`tools/voz/voz40.js` antes del arranque y llama a `VOZ40.engancharTalk()` dentro de
un `try`). No hay que editar el HTML a mano:

```bash
python3 tools/voz/empaquetar_voces.py   # si cambiaron los clips
python3 v40/tools/build_v40.py          # regenera el HTML con las voces
```

`engancharTalk()` envuelve dos canales de subtítulo, sin quitar nada de lo que se ve:

| Canal | Origen | Forma de la línea |
|---|---|---|
| `talk(lines)` | diálogos de nivel (v21, v28, v32…) | `[['Koller', 'texto', dur]]` |
| `say(txt)` / `sayN13()` | cinemáticas, que componen `Hablante: «texto»` | cadena |

El clip se busca por el texto normalizado (minúsculas, sin acentos ni signos), así
que `Hablante: «texto»` y `texto` encuentran el mismo archivo. Un mismo id no suena
dos veces en 250 ms por si el juego lo muestra por los dos canales.

También se puede llamar a mano: `VOZ40.decir('koller_01')`,
`VOZ40.porTexto('…')` (devuelve el id o `null`).

## 4 · Límites y decisiones

- **Una voz por personaje**, no una por línea: Kokoro no actúa la emoción. El miedo,
  la rabia y el cansancio se consiguen con `velocidad` y con el volumen del bus, no
  con interpretación.
- **Texto exacto**: el clip se encuentra por el subtítulo normalizado. Si cambiás una
  línea del guion, regenerá su clip o quedará muda (y el juego seguirá mostrando el
  subtítulo, que es el respaldo).
- **Tamaño**: 8 líneas ≈ 206 KB de MP3 → 276 KB de JS en base64. Unas 300 líneas
  quedarían en ~7 MB de HTML extra; por eso el pipeline está pensado para frases
  cortas y frecuentes (órdenes, avisos, radio), no para toda la campaña.
- **Licencia**: Kokoro-82M es Apache 2.0. El audio generado es tuyo y se puede usar
  comercialmente; no exige atribución (citarla es buena práctica). No uses voces
  clonadas de personas reales sin permiso.
