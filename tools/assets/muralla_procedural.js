/* =========================================================================
   tools/assets/muralla_procedural.js — módulo de muralla procedural.

   Pieza de 8 m de largo × 2 m de espesor × 6 m de alto (7,3 m con almenas),
   pensada para encadenarse en serie a lo largo de un frente fortificado y
   para servir de referencia al pipeline TRELLIS (render → GLB).

   Usa los mismos helpers que el resto del juego (`box` y `cp`), así que se
   comporta igual que los generadores de v39 y el resultado renderizado es
   coherente con el arte existente. No toca ningún nivel ni la v39.

   Convención: la muralla corre sobre el eje X, el espesor sobre Z y el
   adarve (camino de ronda) mira a +Y. El origen está en el centro, a nivel
   del suelo.
   ========================================================================= */
'use strict';

/**
 * @param {object} h  helpers: {T, box, cp}
 * @returns {object}  Group de la muralla
 */
module.exports = function crearModuloMuralla(h) {
  const T = h.T, box = h.box, cp = h.cp;

  const PIEDRA = 0x9a8d74;
  const PIEDRA_OSCURA = 0x6f6553;
  const PIEDRA_CLARA = 0xb3a68c;
  const MADERA = 0x5a3a22;
  const HIERRO = 0x2e3236;
  const ESTANDARTE = 0x8a2f36;

  const LARGO = 8, ALTO = 6, ESPESOR = 2;
  const g = new T.Group();
  g.name = 'modulo_muralla';

  /* --- cuerpo: dos hojas de sillería con relleno de cascote --- */
  box(LARGO, 0.6, ESPESOR + 0.35, PIEDRA_OSCURA, 0, 0.3, 0, g);          // cimiento
  box(LARGO, ALTO - 0.6, ESPESOR, PIEDRA, 0, 0.6 + (ALTO - 0.6) / 2, 0, g); // fábrica
  box(LARGO, 0.22, ESPESOR + 0.12, PIEDRA_CLARA, 0, 4.15, 0, g);         // verdugo

  /* --- hiladas: junta horizontal cada 0,55 m para leer la sillería --- */
  for (let y = 0.9; y < 5.9; y += 0.55) {
    box(LARGO + 0.02, 0.035, ESPESOR + 0.04, PIEDRA_OSCURA, 0, y, 0, g);
  }

  /* --- contrafuertes alternos en la cara exterior (-Z) --- */
  for (const x of [-3.1, 3.1]) {
    box(1.05, 4.1, 0.7, PIEDRA_OSCURA, x, 2.35, -1.05, g);
    box(1.25, 0.35, 0.9, PIEDRA_CLARA, x, 0.2, -1.05, g);
    // talud del contrafuerte
    const talud = box(1.25, 1.5, 0.55, PIEDRA, x, 0.85, -1.45, g);
    talud.rotation.x = -0.22;
  }

  /* --- adarve: losa de coronación y pretil --- */
  box(LARGO, 0.18, ESPESOR - 0.2, PIEDRA_CLARA, 0, ALTO, 0, g);
  for (const s of [-1, 1]) box(LARGO, 0.95, 0.3, PIEDRA, 0, ALTO + 0.5, s * (ESPESOR / 2 - 0.15), g);

  /* --- almenas: 6 por módulo, con saetera alterna --- */
  for (let i = 0; i < 6; i++) {
    const x = -LARGO / 2 + 0.75 + i * ((LARGO - 1.5) / 5);
    for (const s of [-1, 1]) {
      box(0.7, 1.15, 0.32, PIEDRA, x, ALTO + 1.5, s * (ESPESOR / 2 - 0.16), g);
      box(0.82, 0.12, 0.42, PIEDRA_CLARA, x, ALTO + 2.1, s * (ESPESOR / 2 - 0.16), g);
    }
    if (i % 2 === 0) box(0.14, 0.62, 0.36, 0x1a1a1a, x, ALTO + 1.15, -ESPESOR / 2 + 0.02, g); // saetera
  }

  /* --- escalera de acceso al adarve, pegada al machón este (+Z interior) --- */
  for (let k = 0; k < 9; k++) {
    const alto = (ALTO - 0.2) * ((k + 1) / 9);
    box(1.35, alto, 0.62, PIEDRA_OSCURA, 2.9, alto / 2, 0.72 + k * 0.3, g);
  }
  box(1.5, 1.05, 0.12, PIEDRA_CLARA, 2.9, ALTO + 0.05, 0.55, g);

  /* --- puerta de servicio en la cara interior (+Z) --- */
  box(1.35, 2.15, 0.22, 0x161310, -2.4, 1.08, ESPESOR / 2 + 0.01, g);
  box(1.55, 0.22, 0.3, PIEDRA_CLARA, -2.4, 2.3, ESPESOR / 2 + 0.02, g);
  for (const s of [-1, 1]) box(0.12, 2.15, 0.3, PIEDRA_CLARA, -2.4 + s * 0.74, 1.08, ESPESOR / 2 + 0.02, g);
  for (let i = 0; i < 3; i++) box(1.25, 0.06, 0.04, HIERRO, -2.4, 0.45 + i * 0.65, ESPESOR / 2 + 0.13, g);
  cp(0.035, 0.035, 0.12, HIERRO, -1.85, 1.05, ESPESOR / 2 + 0.15, g).rotation.x = 1.5708;

  /* --- estandarte sobre el machón oeste y antorcha junto a la puerta --- */
  cp(0.04, 0.05, 2.6, MADERA, -3.1, ALTO + 2.6, 0.9, g);
  box(0.9, 1.5, 0.05, ESTANDARTE, -3.1, ALTO + 2.2 + 0.75, 0.9, g);
  box(0.24, 0.24, 0.06, 0xc7a34b, -3.1, ALTO + 2.2 + 1.25, 0.93, g);
  box(0.16, 0.42, 0.16, HIERRO, -1.5, 2.4, ESPESOR / 2 + 0.12, g);
  box(0.16, 0.16, 0.16, 0xffa030, -1.5, 2.66, ESPESOR / 2 + 0.12, g, 0xff8820);

  /* --- remate: dos gárgolas-caño de desagüe --- */
  for (const s of [-1, 1]) cp(0.16, 0.16, 0.7, PIEDRA_OSCURA, s * 3.7, ALTO - 0.5, -1.15, g).rotation.x = 1.5708;

  return g;
};
