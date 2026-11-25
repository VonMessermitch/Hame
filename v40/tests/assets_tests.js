/* =========================================================================
   v40/tests/assets_tests.js — pruebas del cargador GLB con respaldo procedural.

   Se ejecutan sin navegador: montan un THREE mínimo y un GLTFLoader de mentira
   y comprueban que la capa de assets:
     · devuelve siempre un objeto (procedural) aunque no haya GLB,
     · cambia al GLB cuando carga,
     · deja el procedural intacto si la carga falla,
     · no explota si el juego no expone `pW`.

   Uso: node v40/tests/assets_tests.js
   ========================================================================= */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..', '..');
const RUTA_ASSETS = path.join(ROOT, 'v40', 'src', 'assets_glb.js');
const RUTA_CATALOGO = path.join(ROOT, 'v40', 'data', 'assets_catalogo.js');

let pass = 0;
const resultados = [];

function ok(nombre, fn) {
  try {
    return Promise.resolve(fn()).then(function (extra) {
      pass++;
      resultados.push('  ✓ ' + nombre + (extra ? ' — ' + extra : ''));
    }).catch(function (e) {
      resultados.push('  ✗ ' + nombre + ' — ' + e.message);
    });
  } catch (e) {
    resultados.push('  ✗ ' + nombre + ' — ' + e.message);
    return Promise.resolve();
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

/* ------------------------------------------------------- THREE de mentira */

function crearThree(opciones) {
  const opt = opciones || {};

  function Vector3(x, y, z) {
    this.x = x || 0; this.y = y || 0; this.z = z || 0;
  }
  Vector3.prototype.set = function (x, y, z) { this.x = x; this.y = y; this.z = z; return this; };
  Vector3.prototype.copy = function (v) { this.x = v.x; this.y = v.y; this.z = v.z; return this; };
  Vector3.prototype.add = function (v) { this.x += v.x; this.y += v.y; this.z += v.z; return this; };
  Vector3.prototype.sub = function (v) { this.x -= v.x; this.y -= v.y; this.z -= v.z; return this; };

  function Object3D() {
    this.position = new Vector3();
    this.scale = {
      x: 1, y: 1, z: 1,
      multiplyScalar: function (s) { this.x *= s; this.y *= s; this.z *= s; return this; },
    };
    this.children = [];
    this.visible = true;
    this.isObject3D = true;
    this.userData = {};
    this.name = '';
  }
  Object3D.prototype.add = function (o) { this.children.push(o); o.parent = this; return this; };
  Object3D.prototype.clone = function () {
    const c = new Object3D();
    c.tam = this.tam;
    return c;
  };

  function Group() { Object3D.call(this); }
  Group.prototype = Object.create(Object3D.prototype);
  Group.prototype.constructor = Group;
  Group.prototype.clone = Object3D.prototype.clone;

  function Box3() { this.tam = null; this.centro = null; }
  Box3.prototype.setFromObject = function (o) {
    this.tam = o && o.tam ? o.tam : { x: 1, y: 1, z: 1 };
    this.centro = { x: 0, y: 0, z: 0 };
    return this;
  };
  Box3.prototype.isEmpty = function () { return !this.tam; };
  Box3.prototype.getSize = function (v) {
    v.set(this.tam.x, this.tam.y, this.tam.z);
    return v;
  };
  Box3.prototype.getCenter = function (v) {
    v.set(this.centro.x, this.centro.y, this.centro.z);
    return v;
  };

  function GLTFLoader() {}
  GLTFLoader.prototype.load = function (url, alCargar, alProgreso, alError) {
    opt.cargados = (opt.cargados || 0) + 1;
    if (opt.falla) {
      setTimeout(function () { alError(new Error('404 simulado')); }, 0);
      return;
    }
    setTimeout(function () {
      const escena = new Object3D();
      escena.tam = { x: 10, y: 0.5, z: 0.5 }; // GLB normalizado, a otra escala
      alCargar({ scene: escena });
    }, 0);
  };

  return { Group: Group, Vector3: Vector3, Box3: Box3, GLTFLoader: GLTFLoader };
}

function cargarCapa(opciones) {
  const THREE = crearThree(opciones);
  const contexto = {
    console: { warn: function () {}, info: function () {}, log: function () {} },
    setTimeout: setTimeout,
    Promise: Promise,
    THREE: THREE,
  };
  contexto.window = contexto;
  contexto.globalThis = contexto;
  const caja = vm.createContext(contexto);

  if (fs.existsSync(RUTA_CATALOGO)) {
    vm.runInContext(fs.readFileSync(RUTA_CATALOGO, 'utf8'), caja, { filename: 'assets_catalogo.js' });
  }
  // Catálogo con los GLB marcados como disponibles, como tras generarlos.
  vm.runInContext(
    'AETH.v40.assetsCatalogo = AETH.v40.assetsCatalogo.map(function (a) {' +
      ' a.disponible = true; return a; });',
    caja
  );
  vm.runInContext(fs.readFileSync(RUTA_ASSETS, 'utf8'), caja, { filename: 'assets_glb.js' });
  return { assets: caja.AETH.v40.assets, caja: caja };
}

function esperar(ms) {
  return new Promise(function (r) { setTimeout(r, ms || 12); });
}

/* --------------------------------------------------------------- pruebas */

(async function main() {
  const base = cargarCapa();
  const assets = base.assets;

  resultados.push('Cargador GLB con respaldo procedural');

  await ok('el catálogo generado tiene los 4 assets', function () {
    const lista = assets.catalogo();
    assert(lista.length === 4, 'se esperaban 4 assets, hay ' + lista.length);
    const ids = lista.map(function (a) { return a.id; }).sort();
    assert(ids.join(',') === 'mg08_maxim,muralla_modulo,rifle_1909,smg_sturm', 'ids: ' + ids.join(','));
    return ids.join(' ');
  });

  await ok('montar() devuelve un grupo con el procedural al instante', function () {
    let creados = 0;
    const grupo = assets.montar('rifle_1909', function () {
      creados++;
      const g = new (base.caja.THREE.Group)();
      g.tam = { x: 0.2, y: 2.7, z: 0.3 };
      return g;
    });
    assert(creados === 1, 'el generador procedural debe llamarse una vez');
    assert(grupo && grupo.children.length === 1, 'el grupo debe traer el modelo procedural');
    assert(grupo.userData.asset.origen === 'procedural', 'origen inicial: procedural');
    return 'procedural inmediato';
  });

  await ok('cuando el GLB carga, reemplaza y oculta el procedural', async function () {
    const { caja } = cargarCapa();
    const T = caja.THREE;
    const respaldo = new T.Group();
    respaldo.tam = { x: 0.2, y: 2.7, z: 0.3 };
    const grupo = caja.AETH.v40.assets.montar('rifle_1909', respaldo);
    await esperar();

    assert(grupo.userData.asset.origen === 'glb', 'origen: ' + grupo.userData.asset.origen);
    assert(grupo.children.length === 2, 'debe haber procedural + glb');
    assert(respaldo.visible === false, 'el procedural debe quedar oculto');
    const glb = grupo.children[1];
    const escala = glb.scale.x;
    // El GLB mide 10 de largo y el rifle procedural 2.7: escala ≈ 0.27.
    assert(Math.abs(escala - 0.27) < 0.01, 'escala esperada ~0.27, fue ' + escala.toFixed(3));
    return 'escala ' + escala.toFixed(2) + ' · procedural oculto';
  });

  await ok('si el GLB falla, el procedural queda visible y sin excepción', async function () {
    const { caja } = cargarCapa({ falla: true });
    const T = caja.THREE;
    const respaldo = new T.Group();
    respaldo.tam = { x: 1, y: 1, z: 1 };
    const grupo = caja.AETH.v40.assets.montar('smg_sturm', respaldo);
    await esperar();
    assert(grupo.userData.asset.origen === 'procedural', 'sigue en procedural');
    assert(respaldo.visible === true, 'el respaldo debe seguir visible');
    assert(/respaldo/.test(grupo.userData.asset.motivo || ''), 'motivo: ' + grupo.userData.asset.motivo);
    return grupo.userData.asset.motivo;
  });

  await ok('engancharArmas() informa si el juego no expone pW', function () {
    const r = assets.engancharArmas();
    assert(r && r.ok === false, 'debe devolver ok:false sin pW');
    return r.motivo;
  });

  await ok('si el asset no está disponible, no intenta descargar', function () {
    const { caja } = cargarCapa();
    caja.AETH.v40.assetsCatalogo.forEach(function (a) { a.disponible = false; });
    const grupo = caja.AETH.v40.assets.montar('muralla_modulo', null, { escala: 8 });
    assert(grupo.userData.asset.motivo === 'sin GLB generado', 'motivo: ' + grupo.userData.asset.motivo);
    return 'sin red';
  });

  console.log(resultados.join('\n'));
  console.log('\n' + pass + '/' + (pass + resultados.filter(function (r) { return r.indexOf('✗') >= 0; }).length) + ' pruebas OK');
  if (resultados.some(function (r) { return r.indexOf('✗') >= 0; })) process.exitCode = 1;
})();
