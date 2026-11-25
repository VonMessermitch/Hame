"""TRELLIS.2-4B · imagen -> malla GLB con materiales PBR.

Demo orientada a assets de juego (armas, props, personajes, arquitectura).
Corre en ZeroGPU (48 GB): importa `spaces` ANTES que torch y deja la carga del
pipeline en el ámbito del módulo para que ZeroGPU la empaquete.

Reglas de ZeroGPU que respeta esta app:
  · la duración reservada se pide por preset (45–120 s), nunca fuera de rango:
    una reserva mayor que el tope del visitante da «ZeroGPU illegal duration»;
  · los pasos se recortan al máximo del preset, así el preset 1536³ no se pasa
    del minuto y medio ni muere a mitad de muestreo;
  · todo fallo del pipeline (OOM incluido) sale como `gr.Error` legible, no
    como traza cruda de Gradio.
"""

import spaces  # debe ir primero: parchea torch.cuda para ZeroGPU

import os

os.environ.setdefault("OPENCV_IO_ENABLE_OPENEXR", "1")
os.environ.setdefault("PYTORCH_CUDA_ALLOC_CONF", "expandable_segments:True")
os.environ.setdefault("ATTN_BACKEND", "flash_attn")
os.environ["FLEX_GEMM_AUTOTUNE_CACHE_PATH"] = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), "autotune_cache.json"
)
os.environ.setdefault("FLEX_GEMM_AUTOTUNER_VERBOSE", "1")

import tempfile
import time
import traceback
import uuid

import gradio as gr
import numpy as np
import torch
from gradio_client import Client, handle_file
from PIL import Image

import o_voxel
from trellis2.pipelines import Trellis2ImageTo3DPipeline

MAX_SEED = int(np.iinfo(np.int32).max)

# Tope por llamada de ZeroGPU (fuera de rango: «illegal duration»).
DURACION_MAXIMA = 120

# Presets de salida pensados para Three.js / motores de juego.
#   decimation = triángulos objetivo
#   texture    = resolución de textura en píxeles
#   duracion   = segundos de GPU que se reservan (menos = mejor cola y menos cuota)
#   pasos_max  = techo de pasos de muestreo para no pasarse de esa reserva
PRESETS = {
    "Arma o prop (ligero)": {
        "res": "512", "decimation": 20_000, "texture": 1024,
        "duracion": 45, "pasos_max": 20,
    },
    "Personaje": {
        "res": "1024", "decimation": 50_000, "texture": 2048,
        "duracion": 75, "pasos_max": 16,
    },
    "Edificio o arquitectura": {
        "res": "1024", "decimation": 120_000, "texture": 2048,
        "duracion": 90, "pasos_max": 12,
    },
    "Alta calidad (1536³)": {
        "res": "1536", "decimation": 200_000, "texture": 4096,
        "duracion": 120, "pasos_max": 8,
    },
}
ETIQUETAS_PRESET = list(PRESETS)
PRESET_POR_DEFECTO = ETIQUETAS_PRESET[0]

pipeline = None
ERROR_ARRANQUE = ""

_rmbg = None


def soporta_duracion_dinamica() -> bool:
    """¿La versión de `spaces` instalada acepta una función en `duration=`?

    Si no, se declara una reserva fija conservadora (60 s) en vez de arriesgar
    un error de programación en la primera llamada.
    """
    try:
        import inspect

        fuente = inspect.getsource(spaces.GPU)
        return "DynamicDuration" in fuente or "Callable" in fuente
    except Exception:
        return False


def duracion_gpu(*args, **kwargs) -> int:
    """Duración de la reserva según el preset elegido (40–120 s).

    Gradio puede pasar argumentos extra (por ejemplo `progress`) de forma
    posicional, así que la firma es deliberadamente permisiva.
    """
    preset = kwargs.get("preset")
    if preset is None and len(args) > 1:
        preset = args[1]
    cfg = PRESETS.get(preset, PRESETS[PRESET_POR_DEFECTO])
    return max(40, min(DURACION_MAXIMA, int(cfg["duracion"])))


DURACION_GPU = duracion_gpu if soporta_duracion_dinamica() else 60


def cliente_rembg() -> Client:
    """Cliente del Space de segmentación; se crea la primera vez que se usa."""
    global _rmbg
    if _rmbg is None:
        _rmbg = Client("briaai/BRIA-RMBG-2.0")
    return _rmbg


def quitar_fondo(imagen: Image.Image) -> Image.Image:
    with tempfile.NamedTemporaryFile(suffix=".png") as f:
        imagen.convert("RGB").save(f.name)
        salida = cliente_rembg().predict(handle_file(f.name), api_name="/image")[0][0]
    return Image.open(salida).convert("RGBA")


def preprocesar(imagen: Image.Image) -> Image.Image:
    """Recorta al objeto y compone sobre negro, que es lo que espera el pipeline."""
    if imagen is None:
        raise gr.Error("Subí una imagen primero.")

    tiene_alfa = False
    if imagen.mode == "RGBA":
        alfa = np.array(imagen)[:, :, 3]
        tiene_alfa = not np.all(alfa == 255)

    max_lado = max(imagen.size)
    escala = min(1.0, 1024 / max_lado)
    if escala < 1:
        imagen = imagen.resize(
            (int(imagen.width * escala), int(imagen.height * escala)),
            Image.Resampling.LANCZOS,
        )

    if tiene_alfa:
        recortada = imagen
    else:
        try:
            recortada = quitar_fondo(imagen)
        except Exception as exc:  # el Space de segmentación puede estar caído
            raise gr.Error(
                "No se pudo quitar el fondo automáticamente. Subí un PNG con "
                f"transparencia (RGBA) y volvé a intentar. Detalle: {exc}"
            ) from exc

    datos = np.array(recortada)
    alfa = datos[:, :, 3]
    puntos = np.argwhere(alfa > 0.8 * 255)
    if len(puntos) == 0:
        raise gr.Error("La imagen quedó vacía después de quitar el fondo.")

    x0, y0 = int(np.min(puntos[:, 1])), int(np.min(puntos[:, 0]))
    x1, y1 = int(np.max(puntos[:, 1])), int(np.max(puntos[:, 0]))
    centro_x, centro_y = (x0 + x1) / 2, (y0 + y1) / 2
    lado = int(max(x1 - x0, y1 - y0))
    recorte = (
        int(centro_x - lado // 2),
        int(centro_y - lado // 2),
        int(centro_x + lado // 2),
        int(centro_y + lado // 2),
    )
    recortada = recortada.crop(recorte)

    plano = np.array(recortada).astype(np.float32) / 255
    plano = plano[:, :, :3] * plano[:, :, 3:4]  # premultiplicado sobre negro
    return Image.fromarray((plano * 255).astype(np.uint8))


def estadisticas(ruta: str) -> str:
    try:
        import trimesh

        malla = trimesh.load(ruta, force="mesh")
        caras = len(malla.faces)
        vertices = len(malla.vertices)
        kb = os.path.getsize(ruta) / 1024
        return (
            f"**{caras:,}** triángulos · **{vertices:,}** vértices · "
            f"**{kb:,.0f} KB**. Materiales PBR (base color, roughness, metallic, opacity)."
        ).replace(",", ".")
    except Exception:
        kb = os.path.getsize(ruta) / 1024
        return f"GLB de **{kb:,.0f} KB**.".replace(",", ".")


def error_legible(exc: Exception, preset: str) -> gr.Error:
    """Convierte un fallo del pipeline en un gr.Error con instrucciones."""
    crudo = str(exc).strip()
    detalle = crudo.splitlines()[0][:280] if crudo else type(exc).__name__
    bajo = detalle.lower()

    if isinstance(exc, torch.cuda.OutOfMemoryError) or "out of memory" in bajo or "cuda error" in bajo:
        return gr.Error(
            "La GPU se quedó sin memoria con este preset. Probá «Arma o prop "
            f"(ligero)», bajá los pasos de muestreo o subí una imagen más simple. Detalle: {detalle}"
        )
    if "quota" in bajo or "zerogpu" in bajo or "duration" in bajo:
        return gr.Error(
            "ZeroGPU rechazó la reserva de GPU (cuota diaria o duración). "
            f"Esperá a que se renueve la cuota o usá el preset más liviano. Detalle: {detalle}"
        )
    return gr.Error(
        "El pipeline de TRELLIS.2 falló mientras procesaba la imagen "
        f"(preset «{preset}»). Volvé a intentar; si se repite, probá otro "
        f"preset. Detalle: {detalle}"
    )


@spaces.GPU(duration=DURACION_GPU)
def generar(
    imagen: Image.Image,
    preset: str,
    semilla: float,
    aleatoria: bool,
    pasos: float,
    progress=gr.Progress(track_tqdm=True),
):
    """Genera una malla 3D texturizada a partir de una imagen de referencia."""
    arranque = time.perf_counter()

    if pipeline is None:
        raise gr.Error(
            "El modelo no llegó a cargar al arrancar el Space. "
            f"Motivo: {ERROR_ARRANQUE or 'revisá los logs del contenedor.'}"
        )
    if imagen is None:
        raise gr.Error("Subí una imagen de referencia.")

    preset = preset if preset in PRESETS else PRESET_POR_DEFECTO
    cfg = PRESETS[preset]
    reserva = int(cfg["duracion"])
    semilla = int(np.random.randint(0, MAX_SEED)) if aleatoria else int(semilla)

    pasos_pedidos = int(pasos)
    pasos = max(1, min(pasos_pedidos, int(cfg["pasos_max"])))
    avisos = []
    if pasos < pasos_pedidos:
        avisos.append(f"pasos ajustados a {pasos} (máximo del preset «{preset}»)")

    ruta = None
    try:
        progress(0.02, desc="Preparando la imagen")
        entrada = preprocesar(imagen)

        progress(0.1, desc=f"Muestreando a {cfg['res']}³")
        salidas, latentes = pipeline.run(
            entrada,
            seed=semilla,
            preprocess_image=False,
            sparse_structure_sampler_params={
                "steps": pasos,
                "guidance_strength": 7.5,
                "guidance_rescale": 0.5,
                "rescale_t": 5.0,
            },
            shape_slat_sampler_params={
                "steps": pasos,
                "guidance_strength": 7.5,
                "guidance_rescale": 0.5,
                "rescale_t": 3.0,
            },
            tex_slat_sampler_params={
                "steps": pasos,
                "guidance_strength": 1.0,
                "guidance_rescale": 0.0,
                "rescale_t": 3.0,
            },
            pipeline_type={
                "512": "512",
                "1024": "1024_cascade",
                "1536": "1536_cascade",
            }[cfg["res"]],
            return_latent=True,
        )

        malla = salidas[0]
        malla.simplify(16_777_216)  # límite de nvdiffrast
        resolucion = latentes[2]

        progress(0.75, desc="Extrayendo GLB")
        glb = o_voxel.postprocess.to_glb(
            vertices=malla.vertices,
            faces=malla.faces,
            attr_volume=malla.attrs,
            coords=malla.coords,
            attr_layout=pipeline.pbr_attr_layout,
            grid_size=resolucion,
            aabb=[[-0.5, -0.5, -0.5], [0.5, 0.5, 0.5]],
            decimation_target=int(cfg["decimation"]),
            texture_size=int(cfg["texture"]),
            remesh=True,
            remesh_band=1,
            remesh_project=0,
            use_tqdm=True,
        )

        carpeta = tempfile.mkdtemp(prefix="trellis2_")
        ruta = os.path.join(carpeta, f"asset_{uuid.uuid4().hex[:8]}.glb")
        glb.export(ruta, extension_webp=True)
    except gr.Error:
        raise
    except Exception as exc:  # noqa: BLE001 — todo fallo debe salir como gr.Error
        raise error_legible(exc, preset) from exc
    finally:
        torch.cuda.empty_cache()

    segundos = time.perf_counter() - arranque
    resumen = estadisticas(ruta)
    avisos.append(
        f"{segundos:.0f} s de GPU (reserva {reserva} s, preset «{preset}», {pasos} pasos)"
        + (" — quedó cerca del límite, bajá los pasos si querés margen" if segundos > reserva * 0.85 else "")
    )
    return ruta, ruta, f"{resumen}  \n" + "  \n".join("* " + a for a in avisos)


with gr.Blocks(delete_cache=(600, 600), title="TRELLIS.2 · assets 3D") as demo:
    gr.Markdown(
        """
        # TRELLIS.2 · imagen → malla 3D de juego
        Subí una foto o render de referencia (mejor con el objeto recortado) y elegí el preset
        según el destino del asset. La salida es un **GLB con materiales PBR** listo para
        Three.js, Godot, Unity o Blender.

        Modelo: [`microsoft/TRELLIS.2-4B`](https://huggingface.co/microsoft/TRELLIS.2-4B) ·
        [proyecto](https://microsoft.github.io/TRELLIS.2) · MIT.
        """
    )

    with gr.Row():
        with gr.Column(scale=1, min_width=340):
            imagen = gr.Image(
                label="Imagen de referencia",
                type="pil",
                image_mode="RGBA",
                sources=["upload", "clipboard"],
                height=360,
            )
            preset = gr.Radio(
                ETIQUETAS_PRESET,
                value=PRESET_POR_DEFECTO,
                label="Destino del asset",
                info="Define resolución del modelo, triángulos, textura y segundos de GPU.",
            )
            boton = gr.Button("Generar malla 3D", variant="primary")
            with gr.Accordion("Ajustes avanzados", open=False):
                semilla = gr.Slider(0, MAX_SEED, value=0, step=1, label="Semilla")
                aleatoria = gr.Checkbox(value=True, label="Semilla aleatoria")
                pasos = gr.Slider(4, 30, value=12, step=1, label="Pasos de muestreo")
            gr.Markdown(
                "*ZeroGPU: cada visita consume su propia cuota diaria. 512³ reserva 45 s; "
                "1536³ reserva 120 s y recorta los pasos a 8 para no pasarse del tope.*"
            )
        with gr.Column(scale=2):
            visor = gr.Model3D(
                label="Malla generada",
                height=520,
                display_mode="solid",
                clear_color=(0.15, 0.15, 0.17, 1.0),
            )
            info = gr.Markdown("")
            descarga = gr.DownloadButton("Descargar GLB")

    gr.Examples(
        examples=[
            ["assets/ejemplos/rifle_1909.jpg", "Arma o prop (ligero)"],
            ["assets/ejemplos/farol_laton.jpg", "Arma o prop (ligero)"],
            ["assets/ejemplos/fuerte_desierto.jpg", "Edificio o arquitectura"],
        ],
        inputs=[imagen, preset],
        label="Ejemplos",
    )

    gr.Markdown(
        """
        ### Para el pipeline del juego
        Los GLB salen en **Y-up**, centrados en el origen y con la escala normalizada a una
        caja de 1 unidad: hay que escalarlos en el motor. Con `decimation=20k` y
        `texture=1024` un arma queda en ~1–2 MB, que es lo que conviene para el HTML único
        de «Sombras sobre el Nilo». El pipeline del repo
        (`tools/assets/render_assets.js` → `tools/assets/trellis_assets.py`) ya manda los
        renders de los modelos procedurales a este Space y deja los GLB en
        `assets_graphics/`, con `GLTFLoader` y respaldo procedural en el juego.
        """
    )

    boton.click(
        generar,
        inputs=[imagen, preset, semilla, aleatoria, pasos],
        outputs=[visor, descarga, info],
    )

if __name__ == "__main__":
    try:
        pipeline = Trellis2ImageTo3DPipeline.from_pretrained("microsoft/TRELLIS.2-4B")
        pipeline.rembg_model = None  # el fondo se quita con el Space de BRIA
        pipeline.low_vram = False
        pipeline.cuda()
    except Exception as exc:  # noqa: BLE001 — la UI debe arrancar igual
        ERROR_ARRANQUE = f"{type(exc).__name__}: {exc}"
        print("[trellis2] no se pudo cargar el modelo:", ERROR_ARRANQUE)
        traceback.print_exc()

    demo.launch(mcp_server=True)
