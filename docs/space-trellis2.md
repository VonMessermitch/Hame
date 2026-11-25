# Space de TRELLIS.2 — despliegue y pipeline de assets

El Space está armado y validado en `hf-space/` (82 archivos, 1,8 MB). No se creó en
Hugging Face porque este entorno no tiene navegador ni sesión iniciada: `hf auth whoami`
responde 401 y el login del CLI es interactivo (imprime una URL y un código de un solo uso).

## 1. Instalar el CLI e iniciar sesión

```bash
curl -LsSf https://hf.co/cli/install.sh | bash
hf auth login          # imprime URL + código: abrilo en tu navegador e ingresalo
hf auth whoami         # comprobá usuario, plan y canPay
```

Una cuenta personal gratuita puede alojar **2 Spaces con ZeroGPU**; es justo lo que usa este
Space (`zero-a10g`). No hace falta GPU dedicada.

## 2. Crear el Space y subir los archivos

```bash
cd hf-space
hf repos create <usuario>/trellis2-assets --type space --space-sdk gradio \
  --flavor zero-a10g --public --exist-ok

hf upload <usuario>/trellis2-assets . --repo-type space \
  --exclude "**/__pycache__/**"
```

`--repo-type space` es obligatorio: sin eso, `hf upload` crea un repo de **modelo** con el
mismo nombre.

## 3. Verificar el arranque

```bash
hf spaces info <usuario>/trellis2-assets --expand runtime   # stage + hardware
hf spaces logs <usuario>/trellis2-assets --tail 200         # errores reales
```

El log tiene que mostrar la descarga de `microsoft/TRELLIS.2-4B` y el arranque de Gradio sin
`falling back to CPU` ni avisos de extensiones. Después, una llamada de prueba:

```python
from gradio_client import Client, handle_file
c = Client("<usuario>/trellis2-assets", httpx_kwargs={"timeout": 600})
c.predict(handle_file("assets/ejemplos/rifle_1909.jpg"), "Arma o prop (ligero)", 0, True, 12,
          api_name="/generar")
```

## 4. Endurecimiento para el primer deploy (ZeroGPU)

ZeroGPU no cobra el tiempo real, sino la **reserva** que declara `@spaces.GPU(duration=N)`.
De ahí los dos errores clásicos: `ZeroGPU illegal duration` (N mayor que el tope del
visitante) y `ZeroGPU quota exceeded` (la reserva pedida supera la cuota que le queda al
visitante). La app ahora:

| Preset | Resolución | Reserva | Pasos máx. | Textura |
|---|---|---|---|---|
| Arma o prop (ligero) | 512³ | 45 s | 20 | 1024 |
| Personaje | 1024³ | 75 s | 16 | 2048 |
| Edificio o arquitectura | 1024³ | 90 s | 12 | 2048 |
| Alta calidad | 1536³ | 120 s | 8 | 4096 |

- **Duración dinámica**: `duracion_gpu()` devuelve la reserva según el preset (tope 120 s).
  Si la versión de `spaces` instalada no admite una función en `duration=`, cae a 60 s fijos
  (`soporta_duracion_dinamica()` inspecciona el código del decorador).
- **1536³ no revienta**: 8 pasos como techo, así el muestreo entra en los 120 s reservados.
  Si el preset pidiera más pasos, el recorte se avisa en el resultado.
- **Errores legibles**: todo el cuerpo de `generar()` está envuelto; OOM, fallo del pipeline y
  rechazo de cuota salen como `gr.Error` con instrucciones, no como traza de Gradio. El
  `torch.cuda.empty_cache()` corre en `finally`.
- **Arranque a prueba de fallos**: si el modelo no carga, la UI igual arranca y el botón
  explica el motivo (`ERROR_ARRANQUE`) en vez de dejar el Space en «Runtime error» mudo.
- El resultado informa **segundos de GPU reales** contra la reserva: sirve para calibrar los
  valores de la tabla con dos o tres llamadas (criterio: reserva ≈ máximo medido × 1,4).

## 5. Pipeline de assets del juego (procedural → TRELLIS → GLB)

```
mkRifle / mkSMG / mkMG08 / módulo de muralla   (generadores de v39, sin tocarlos)
  └─ node tools/assets/render_assets.js        → PNG 1024² con fondo alfa
       └─ python3 tools/assets/trellis_assets.py → Space TRELLIS.2 → GLB PBR
            └─ assets_graphics/{weapons,buildings}/*.glb
                 └─ v40/data/assets_catalogo.js → v40/src/assets_glb.js (GLTFLoader)
```

- `tools/assets/three_lite.js` es una escena mínima (Group, Mesh, Box/Cylinder/Sphere) más un
  rasterizador con z-buffer y un escritor PNG. No usa navegador ni GPU: extrae del propio
  HTML de v39 el texto de `mkRifle`, `mkSMG` y `mkMG08` y lo ejecuta tal cual, así el render
  es el modelo real del juego, no una copia que se desincroniza.
- `tools/assets/muralla_procedural.js` genera el módulo de muralla (8 × 2 × 6 m con adarve,
  almenas, contrafuertes, escalera, puerta y estandarte) con los mismos helpers `box`/`cp`.
- `assets_graphics/renderes/manifest.json` guarda caja, triángulos y rutas; es la fuente de
  verdad del pipeline.
- `v40/src/assets_glb.js` monta el procedural al instante y, si el GLB carga, lo reemplaza
  escalándolo y centrándolo contra la caja del procedural (el cambio de tamaño no se nota).
  Sin GLB, sin `GLTFLoader` o con `file://` bloqueando el fetch, **queda el procedural**.
  `?glb=1` lo intenta al arrancar; también se puede llamar a mano:
  `AETH.v40.assets.engancharArmas()` y `AETH.v40.assets.estado()`.
- `vendor/GLTFLoader.r128.js` es el loader oficial de Three r128 (MIT), inyectado por
  `v40/tools/build_v40.py` antes de la capa Aethrion.

Comandos:

```bash
node tools/assets/render_assets.js                 # PNG + manifiesto (sin GPU ni red)
python3 tools/assets/trellis_assets.py --seco      # plan, sin red
python3 tools/assets/trellis_assets.py --space <usuario>/trellis2-assets
python3 tools/assets/trellis_assets.py --space prithivMLmods/TRELLIS.2-Text-to-3D \
    --texto "fusilero de 1909, casco de acero, capote gris, de cuerpo entero" --id soldado_1909
python3 v40/tools/build_v40.py && node v40/tests/v40_tests.js && node v40/tests/assets_tests.js
```

## 6. Sobre el «TRELLIS.2 Text-to-3D» de prithivMLmods

Es el Space público `prithivMLmods/TRELLIS.2-Text-to-3D`: **texto → imagen (Z-Image-Turbo) →
TRELLIS.2 → GLB**, y además acepta imagen directa (image-to-3D) por el mismo endpoint.

Comprobado desde la nube de este chat:

- El Space es invocable sin navegador: `gradio_client` conecta y publica sus endpoints
  `/generate_txt2img`, `/generate_3d`, `/preprocess_image`, `/get_seed`, `/start_session`.
- `/generate_3d` recibe `(imagen, seed, resolution[512|1024|1536], decimation_target,
  texture_size, 12 parámetros de muestreo)` y devuelve `(visor Rerun, GLB)`.
- Exige `decimation_target >= 50000` (con 20000 lo rechaza antes de gastar GPU). El pipeline
  ya manda 50000 para el preset de arma.
- La generación **no** se pudo completar desde acá: sin sesión de Hugging Face el Space
  anónimo responde `You have exceeded your ZeroGPU runs limit. Authenticate with a Hugging
  Face token for more quota`. Es decir: el camino en la nube está verificado hasta la cola de
  GPU; para producir los GLB hace falta `hf auth login` (o `HF_TOKEN` en el entorno).

Para los soldados del juego, cuando subas las imágenes de referencia al repositorio:

1. **No hace falta el text-to-3D**: si ya tenés la referencia, se manda directo al pipeline
   image-to-3D (el nuestro o el de prithivMLmods), que es el que da la fidelidad del uniforme.
   El texto→imagen agrega un paso generativo que inventa detalles (hebillas, correajes) y
   cambia entre ejecuciones.
2. El text-to-3D sirve para **idear** variantes antes de tener referencias: sirvientes,
   oficiales, centinelas enemigos. Se usa con `--texto` y queda registrado en el manifiesto.
3. Un render de cuerpo entero con fondo transparente y pose neutra (A-pose) funciona mejor que
   una foto de grupo o con fondo: TRELLIS reconstruye un objeto único, no una escena.
4. Los personajes conviene generarlos a 1024³ / 50k triángulos / textura 2048; un soldado
   completo con correajes a 512³ pierde las manos y las cartucheras.
5. La malla sale sin esqueleto: para animar hay que riggear en Blender o quedarse con el
   modelo procedural, que ya está articulado (`userData.l1/l2/k1/k2`, brazos, cabeza).

## Qué se comprobó y qué no

Comprobado aquí:

- `python3 -m py_compile` de `app.py` y de `trellis_assets.py`.
- Las firmas del pipeline vendorizado coinciden con las llamadas de la app
  (`run(...) → (mensajes, (shape_slat, tex_slat, res))`, `pbr_attr_layout`, `to_glb(...)`).
- El frontmatter del README cumple los límites de Hub (51 caracteres de `short_description`,
  `sdk_version` 6.1.0, `python_version` 3.12).
- `node tools/assets/render_assets.js`: los 4 assets se construyen desde el código real de
  v39 y salen PNG de 1024² con alfa (rifle 516 tris, subfusil 640, MG 08 764, muralla 968).
- `node v40/tests/assets_tests.js`: 6/6 (catálogo, montaje inmediato, cambio a GLB con escala
  0,27, respaldo si falla la carga, `pW` inaccesible, sin GLB no hay red).
- `node v40/tests/v40_tests.js`: 24/24 tras inyectar `GLTFLoader` y la capa de assets.
- El Space de prithivMLmods: conexión, endpoints y validación de parámetros.

No comprobado (falta GPU y sesión de HF): una inferencia real de TRELLIS.2, el GLB resultante,
su tiempo por preset y el aspecto del arma sustituida dentro del juego. Los GLB del catálogo
están en `disponible: false` hasta que corra el pipeline con una cuenta con cuota; mientras
tanto el juego usa el procedural, que es el comportamiento por diseño.

## Ajustes probables en la primera iteración

- Las reservas de la tabla (45/75/90/120 s) son estimaciones: el primer resultado devuelve los
  segundos reales; recalibrar con 2–3 llamadas y volver a subir la app.
- `sdk_version: 6.1.0` está fijado a propósito para coincidir con el Space oficial que
  funciona; si Gradio publica cambios incompatibles, es el primer número a mover.
- El recorte de fondo depende del Space `briaai/BRIA-RMBG-2.0`. Si está en cola, la app
  devuelve un error claro pidiendo un PNG con transparencia. Los renders del pipeline ya
  llevan alfa, así que ese paso no se usa.
- Si el GLB de un arma entra rotado en el juego, se corrige con `rotation` en la entrada del
  catálogo (`v40/data/assets_catalogo.js`), sin tocar el HTML.
