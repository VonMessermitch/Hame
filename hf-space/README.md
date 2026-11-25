---
title: TRELLIS.2 · assets 3D de juego
emoji: 🏺
colorFrom: yellow
colorTo: red
sdk: gradio
sdk_version: 6.1.0
python_version: 3.12
app_file: app.py
pinned: false
license: mit
models:
  - microsoft/TRELLIS.2-4B
short_description: Imagen a GLB PBR con TRELLIS.2 para assets de juego
---

# TRELLIS.2 · imagen → malla 3D de juego

Demo de [`microsoft/TRELLIS.2-4B`](https://huggingface.co/microsoft/TRELLIS.2-4B)
(4B parámetros, MIT) orientada a producir assets para un motor: se sube una imagen de
referencia y sale un **GLB con materiales PBR** con la topología y el tamaño de textura
que pida el destino.

## Qué hace distinto al Space oficial

El original (`microsoft/TRELLIS.2`) está pensado para mirar el resultado: renderiza 48
vistas y ofrece un paso aparte de extracción. Este recorta ese circuito y lo enfoca a
producción de assets:

| Control | Efecto |
|---|---|
| **Arma o prop (ligero)** | 512³ · 20 000 triángulos · textura 1024 |
| **Personaje** | 1024³ · 50 000 triángulos · textura 2048 |
| **Edificio o arquitectura** | 1024³ · 120 000 triángulos · textura 2048 |
| **Alta calidad (1536³)** | 1536³ · 200 000 triángulos · textura 4096 |

Un único botón hace muestreo + extracción y devuelve el GLB en el visor y en un botón de
descarga. La app también expone su función como **herramienta MCP** (`mcp_server=True`).

## Detalles técnicos

- **Hardware**: ZeroGPU (`zero-a10g`, 48 GB). El modelo necesita ≥24 GB.
- **Preprocesado**: si la imagen no trae alfa, se quita el fondo con el Space
  `briaai/BRIA-RMBG-2.0`; después se recorta al objeto y se compone sobre negro, que es lo
  que espera el pipeline con `preprocess_image=False`.
- **Extensiones CUDA**: `flash_attn`, `flex_gemm`, `nvdiffrast`, `nvdiffrec_render`,
  `cumesh` y `o_voxel` se instalan como **ruedas precompiladas** desde `requirements.txt`.
  No se compilan en el build del Space (no hay `nvcc` ahí).
- **Código del modelo**: el árbol `trellis2/` va vendorizado en este repo, igual que en el
  Space oficial. No hay instalación limpia por pip de esta librería.

## Salida

- GLB con `base color`, `roughness`, `metallic` y `opacity` en las texturas (WebP).
- Y-up, centrado en el origen, normalizado a una caja de 1 unidad.
- El GLB se exporta en modo **OPAQUE**: el alfa está en la textura pero hay que conectarlo
  a mano en el material de destino si se quiere transparencia.

## Límites conocidos

- El modelo base no está alineado con preferencias humanas: el estilo varía con la entrada.
- Las mallas crudas pueden traer agujeros pequeños (el postproceso remalla, pero no
  garantiza geometría estanca).
- La extracción de GLB es la parte lenta; bajar `decimation` y `texture` es la palanca.
- Una vista (una sola imagen) por generación.

## Uso del Space

```python
from gradio_client import Client, handle_file

c = Client("<usuario>/trellis2-assets")
glb = c.predict(
    handle_file("rifle.png"),
    "Arma o prop (ligero)",
    0, True, 12,
    api_name="/generar",
)[0]
```

## Créditos y licencia

Modelo y código: Microsoft Research, MIT. La demo reutiliza el árbol `trellis2/` y las
ruedas CUDA publicadas por el Space oficial `microsoft/TRELLIS.2`. nvdiffrast y nvdiffrec
tienen sus propias licencias (NVIDIA).
