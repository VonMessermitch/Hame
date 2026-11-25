#!/usr/bin/env node
/* =========================================================================
   tools/assets/render_assets.js — render procedural → PNG de referencia.

   Extrae los generadores REALES de armas de la v39 (mkRifle, mkSMG, mkMG08)
   sin copiarlos ni modificarlos, los ejecuta sobre la escena mínima de
   three_lite y escribe un PNG con fondo transparente por asset, más el
   manifiesto que consume tools/assets/trellis_assets.py.

   Uso:  node tools/assets/render_assets.js [--ancho 1024] [--solo rifle_1909]

   Salida:
     assets_graphics/renderes/<id>.png
     assets_graphics/renderes/manifest.json
     v40/data/assets_catalogo.js   (catálogo que lee el cargador GLB)
   ========================================================================= */
'use strict';

const fs = require('fs');
const path = require('path');
const TL = require('./three_lite');
const crearModuloMuralla = require('./muralla_procedural');

const ROOT = path.resolve(__dirname, '..', '..');
const V39 = path.join(ROOT, 'Sombras_sobre_el_Nilo_1909_v39.html');
const SALIDA = path.join(ROOT, 'assets_graphics', 'renderes');
const CATALOGO_JS = path.join(ROOT, 'v40', 'data', 'assets_catalogo.js');

function leerArgs(argv) {
  const out = { ancho: 1024, solo: null };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--ancho') out.ancho = parseInt(argv[++i], 10) || 1024;
    else if (argv[i] === '--solo') out.solo = argv[++i];
  }
  return out;
}

/* ------------------------------------------------- extracción de funciones */

/**
 * Devuelve el texto de `function <nombre>(...) {...}` desde la fuente, contando
 * llaves y respetando cadenas, plantillas y comentarios.
 */
function extraerFuncion(fuente, nombre) {
  const marca = 'function ' + nombre + '(';
  const inicio = fuente.indexOf(marca);
  if (inicio < 0) throw new Error('no se encontró `function ' + nombre + '` en la v39');

  let i = fuente.indexOf('{', inicio);
  if (i < 0) throw new Error('no se encontró el cuerpo de ' + nombre);

  let nivel = 0;
  let estado = null; // null | "'" | '"' | '`' | '//' | '/*'
  for (; i < fuente.length; i++) {
    const c = fuente[i];
    const sig = fuente[i + 1];

    if (estado === '//') {
      if (c === '\n') estado = null;
      continue;
    }
    if (estado === '/*') {
      if (c === '*' && sig === '/') { estado = null; i++; }
      continue;
    }
    if (estado) {
      if (c === '\\') { i++; continue; }
      if (c === estado) estado = null;
      continue;
    }
    if (c === '/' && sig === '/') { estado = '//'; i++; continue; }
    if (c === '/' && sig === '*') { estado = '/*'; i++; continue; }
    if (c === "'" || c === '"' || c === '`') { estado = c; continue; }
    if (c === '{') nivel++;
    else if (c === '}') {
      nivel--;
      if (nivel === 0) return fuente.slice(inicio, i + 1);
    }
  }
  throw new Error('cuerpo sin cerrar en ' + nombre);
}

/* ------------------------------------------------------- entorno de juego */

/** Helpers `box` y `cp` equivalentes a los de la v39, sin caché de materiales. */
function crearEntorno() {
  const T = TL.T;
  const STAT = null;
  const scene = new T.Group();
  const matCache = new Map();

  function sMat(c, em, map) {
    const k = c + '|' + (em || 0) + '|' + (map ? map.uuid : 0);
    let m = matCache.get(k);
    if (!m) {
      m = new T.MeshLambertMaterial({ color: c, emissive: em || 0, map: map || null });
      matCache.set(k, m);
    }
    return m;
  }

  function box(w, h, d, c, x, y, z, p, em, map) {
    const m = new T.Mesh(
      new T.BoxGeometry(w, h, d),
      new T.MeshLambertMaterial({ color: c, emissive: em || 0, map: map || null })
    );
    m.position.set(x, y, z);
    (p || scene).add(m);
    return m;
  }

  function cp(r1, r2, h, c, x, y, z, p, em) {
    const m = new T.Mesh(
      new T.CylinderGeometry(r1, r2, h, 8),
      new T.MeshLambertMaterial({ color: c, emissive: em || 0 })
    );
    m.position.set(x, y, z);
    (p || scene).add(m);
    return m;
  }

  return { T, STAT, scene, matCache, sMat, box, cp, steelT: null, grainT: null, MGS: [] };
}

function cargarGenerador(fuente, nombre, env) {
  const src = extraerFuncion(fuente, nombre);
  const fabrica = new Function(
    'T', 'box', 'cp', 'scene', 'steelT', 'grainT', 'STAT', 'MGS', 'sMat', 'matCache',
    src + '\nreturn ' + nombre + ';'
  );
  return fabrica(
    env.T, env.box, env.cp, env.scene, env.steelT, env.grainT, env.STAT, env.MGS, env.sMat, env.matCache
  );
}

/* -------------------------------------------------------------- los assets */

const ASSETS = [
  {
    id: 'rifle_1909',
    nombre: 'Fusil de cerrojo 1909',
    tipo: 'arma',
    funcion: 'mkRifle',
    direccion: [0.92, 0.12, 0.5],
    escala_juego: 2.3,
    preset: 'Arma o prop (ligero)',
    construir: function (env, fuente) {
      return cargarGenerador(fuente, 'mkRifle', env)();
    },
  },
  {
    id: 'smg_sturm',
    nombre: 'Subfusil de asalto',
    tipo: 'arma',
    funcion: 'mkSMG',
    direccion: [0.92, 0.15, 0.5],
    escala_juego: 1.9,
    preset: 'Arma o prop (ligero)',
    construir: function (env, fuente) {
      return cargarGenerador(fuente, 'mkSMG', env)();
    },
  },
  {
    id: 'mg08_maxim',
    nombre: 'Ametralladora MG 08',
    tipo: 'arma',
    funcion: 'mkMG08',
    direccion: [0.88, 0.3, 0.55],
    escala_juego: 1.8,
    preset: 'Arma o prop (ligero)',
    construir: function (env, fuente) {
      const mkMG08 = cargarGenerador(fuente, 'mkMG08', env);
      const o = mkMG08(0, 0, 0, 0);
      return o && o.g ? o.g : o;
    },
  },
  {
    id: 'muralla_modulo',
    nombre: 'Módulo de muralla con adarve',
    tipo: 'arquitectura',
    funcion: 'crearModuloMuralla',
    direccion: [1.0, 0.5, -1.25],
    escala_juego: 8.0,
    preset: 'Edificio o arquitectura',
    construir: function (env) {
      return crearModuloMuralla({ T: env.T, box: env.box, cp: env.cp });
    },
  },
];

/* --------------------------------------------------------------------- main */

function main() {
  const args = leerArgs(process.argv);
  if (!fs.existsSync(V39)) {
    console.error('falta la fuente: ' + V39);
    process.exit(1);
  }
  const fuente = fs.readFileSync(V39, 'utf8');
  fs.mkdirSync(SALIDA, { recursive: true });
  fs.mkdirSync(path.dirname(CATALOGO_JS), { recursive: true });

  const hechos = [];
  for (const asset of ASSETS) {
    if (args.solo && args.solo !== asset.id) continue;

    const env = crearEntorno();
    let raiz;
    try {
      raiz = asset.construir(env, fuente);
    } catch (e) {
      console.error('✗ ' + asset.id + ': no se pudo construir — ' + e.message);
      process.exitCode = 1;
      continue;
    }

    let salida;
    try {
      salida = TL.render(raiz, {
        ancho: args.ancho,
        alto: args.ancho,
        muestras: Math.max(1, Math.round(2048 / args.ancho)),
        direccion: asset.direccion,
      });
    } catch (e) {
      console.error('✗ ' + asset.id + ': no se pudo renderizar — ' + e.message);
      process.exitCode = 1;
      continue;
    }

    const destino = path.join(SALIDA, asset.id + '.png');
    fs.writeFileSync(destino, salida.png);

    const caja = salida.caja;
    const medidas = {
      ancho: +(caja.max.x - caja.min.x).toFixed(3),
      alto: +(caja.max.y - caja.min.y).toFixed(3),
      fondo: +(caja.max.z - caja.min.z).toFixed(3),
    };

    hechos.push({
      id: asset.id,
      nombre: asset.nombre,
      tipo: asset.tipo,
      funcion_procedural: asset.funcion,
      render: path.relative(ROOT, destino).split(path.sep).join('/'),
      glb: 'assets_graphics/' + (asset.tipo === 'arquitectura' ? 'buildings' : 'weapons') + '/' + asset.id + '.glb',
      preset_trellis: asset.preset,
      escala_juego: asset.escala_juego,
      medidas_procedurales: medidas,
      triangulos_render: salida.triangulos,
      disponible: false,
    });

    console.log(
      '✓ ' + asset.id.padEnd(16) +
      String(salida.triangulos).padStart(6) + ' tris  ' +
      medidas.ancho.toFixed(2) + '×' + medidas.alto.toFixed(2) + '×' + medidas.fondo.toFixed(2) + ' u  ' +
      '→ ' + path.relative(ROOT, destino)
    );
  }

  const manifiesto = {
    generado_por: 'tools/assets/render_assets.js',
    fuente: 'Sombras_sobre_el_Nilo_1909_v39.html',
    nota: 'Los renders salen de los generadores procedurales del juego; el GLB lo produce el Space de TRELLIS.2.',
    assets: hechos,
  };
  const rutaManifiesto = path.join(SALIDA, 'manifest.json');
  fs.writeFileSync(rutaManifiesto, JSON.stringify(manifiesto, null, 2) + '\n');

  fs.writeFileSync(
    CATALOGO_JS,
    '/* Generado por tools/assets/render_assets.js — no editar a mano. */\n' +
      '(function (g) {\n' +
      "  'use strict';\n" +
      '  var AETH = (g.AETH = g.AETH || {});\n' +
      '  var v40 = (AETH.v40 = AETH.v40 || {});\n' +
      '  v40.assetsCatalogo = ' + JSON.stringify(hechos, null, 2).replace(/\n/g, '\n  ') + ';\n' +
      '})(typeof window !== \'undefined\' ? window : globalThis);\n'
  );

  console.log('✓ manifiesto: ' + path.relative(ROOT, rutaManifiesto));
  console.log('✓ catálogo : ' + path.relative(ROOT, CATALOGO_JS));
}

if (require.main === module) main();

module.exports = { ASSETS, extraerFuncion, crearEntorno, cargarGenerador };
