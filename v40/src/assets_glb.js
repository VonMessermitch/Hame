/* =========================================================================
   v40/src/assets_glb.js — carga de GLB (TRELLIS.2) con respaldo procedural.

   El juego v39 dibuja las armas con generadores procedurales (mkRifle, mkSMG,
   mkMG08); esta capa permite sustituirlas por los GLB que produce el Space de
   TRELLIS.2 (tools/assets/trellis_assets.py) SIN romper nada:

     · si el GLB no está, no carga o el navegador lo bloquea (file://), el
       modelo procedural sigue exactamente como está;
     · si carga, se escala y se centra para coincidir con la caja del modelo
       procedural y se coloca en el mismo sitio;
     · nunca lanza: devuelve el grupo procedural y deja el estado consultable
       en AETH.v40.assets.estado().

   Uso desde la consola o desde código:
     AETH.v40.assets.engancharArmas();          // rifle, subfusil y MG 08
     AETH.v40.assets.montar('muralla_modulo', crearMuralla, {escala: 8})
     abrir el juego con ?glb=1 lo intenta solo al arrancar.

   Requiere THREE.GLTFLoader (vendor/GLTFLoader.r128.js, inyectado por
   v40/tools/build_v40.py).
   ========================================================================= */
(function (g) {
  'use strict';

  var AETH = (g.AETH = g.AETH || {});
  var V = (AETH.v40 = AETH.v40 || {});

  /* Catálogo de respaldo: se reemplaza por v40/data/assets_catalogo.js, que
     genera el pipeline con las rutas y escalas reales. */
  var CATALOGO_BASE = [
    { id: 'rifle_1909', nombre: 'Fusil de cerrojo 1909', tipo: 'arma', glb: 'assets_graphics/weapons/rifle_1909.glb', escala_juego: 2.3, disponible: false },
    { id: 'smg_sturm', nombre: 'Subfusil de asalto', tipo: 'arma', glb: 'assets_graphics/weapons/smg_sturm.glb', escala_juego: 1.9, disponible: false },
    { id: 'mg08_maxim', nombre: 'Ametralladora MG 08', tipo: 'arma', glb: 'assets_graphics/weapons/mg08_maxim.glb', escala_juego: 1.8, disponible: false },
    { id: 'muralla_modulo', nombre: 'Módulo de muralla', tipo: 'arquitectura', glb: 'assets_graphics/buildings/muralla_modulo.glb', escala_juego: 8.0, disponible: false }
  ];

  var estado = {
    gltfLoader: false,
    intentos: {},
    cargados: {},
    errores: {},
    intercambios: []
  };

  var cacheCarga = {};

  function catalogo() {
    var lista = V.assetsCatalogo;
    return Array.isArray(lista) && lista.length ? lista : CATALOGO_BASE;
  }

  function entrada(id) {
    var lista = catalogo();
    for (var i = 0; i < lista.length; i++) if (lista[i].id === id) return lista[i];
    return null;
  }

  function three() {
    var T = g.THREE;
    return T && T.Group ? T : null;
  }

  function gltfDisponible() {
    var T = three();
    return !!(T && T.GLTFLoader);
  }

  function avisar(mensaje) {
    if (g.console && console.warn) console.warn('[assets glb] ' + mensaje);
  }

  /* ------------------------------------------------------------ carga */

  function cargar(id) {
    if (cacheCarga[id]) return cacheCarga[id];

    var info = entrada(id);
    var T = three();

    if (!info) {
      return (cacheCarga[id] = Promise.reject(new Error('asset desconocido: ' + id)));
    }
    if (!T || !T.GLTFLoader) {
      estado.errores[id] = 'sin THREE.GLTFLoader';
      return (cacheCarga[id] = Promise.reject(new Error(estado.errores[id])));
    }

    estado.intentos[id] = (estado.intentos[id] || 0) + 1;

    cacheCarga[id] = new Promise(function (resolver, rechazar) {
      var cargador = new T.GLTFLoader();
      cargador.load(
        info.glb,
        function (gltf) {
          estado.cargados[id] = true;
          resolver(gltf.scene || (gltf.scenes && gltf.scenes[0]));
        },
        undefined,
        function (error) {
          estado.errores[id] = (error && (error.message || error.type)) || 'error de carga';
          rechazar(new Error(estado.errores[id]));
        }
      );
    });

    // Un fallo no debe quedar cacheado para siempre: permite reintentar.
    cacheCarga[id].catch(function () {
      delete cacheCarga[id];
    });
    return cacheCarga[id];
  }

  /* ---------------------------------------------------- escalado y centrado */

  /** Ajusta `objeto` a la caja envolvente de `referencia` (si existe). */
  function ajustar(objeto, referencia, escalaPedida) {
    var T = three();
    if (!T || !T.Box3) return objeto;

    var caja = new T.Box3().setFromObject(objeto);
    if (caja.isEmpty()) return objeto;
    var tam = caja.getSize(new T.Vector3());
    var mayor = Math.max(tam.x, tam.y, tam.z) || 1;

    var objetivo = escalaPedida;
    if (!objetivo && referencia && referencia.isObject3D) {
      var cajaRef = new T.Box3().setFromObject(referencia);
      if (!cajaRef.isEmpty()) {
        var tamRef = cajaRef.getSize(new T.Vector3());
        objetivo = Math.max(tamRef.x, tamRef.y, tamRef.z);
      }
    }
    if (objetivo) objeto.scale.multiplyScalar(objetivo / mayor);

    // Centrar en el origen de la referencia (o del propio objeto).
    var cajaFinal = new T.Box3().setFromObject(objeto);
    var centroFinal = cajaFinal.getCenter(new T.Vector3());
    var centroDestino = new T.Vector3(0, 0, 0);
    if (referencia && referencia.isObject3D) {
      var cajaRef2 = new T.Box3().setFromObject(referencia);
      if (!cajaRef2.isEmpty()) cajaRef2.getCenter(centroDestino);
    }
    objeto.position.add(centroDestino.sub(centroFinal));
    return objeto;
  }

  /* ------------------------------------------------------------- montaje */

  /**
   * Devuelve un grupo con el modelo procedural (inmediato) y, si el GLB carga,
   * lo cambia por el GLB respetando posición y tamaño.
   *
   * @param {string} id           id del catálogo
   * @param {function|object} procedural  generador o grupo de respaldo
   * @param {object} opciones     {escala, alCargar, visible}
   */
  function montar(id, procedural, opciones) {
    var opt = opciones || {};
    var T = three();
    if (!T) {
      avisar('no hay THREE: se devuelve el modelo procedural tal cual');
      return typeof procedural === 'function' ? procedural() : procedural;
    }

    var grupo = new T.Group();
    grupo.name = 'asset_' + id;
    grupo.userData.asset = { id: id, origen: 'procedural' };

    var respaldo = null;
    try {
      respaldo = typeof procedural === 'function' ? procedural() : procedural || null;
    } catch (e) {
      avisar('el modelo procedural de ' + id + ' falló: ' + e.message);
    }
    if (respaldo) {
      respaldo.name = (respaldo.name || id) + '_procedural';
      grupo.add(respaldo);
    }
    if (opt.visible === false) grupo.visible = false;

    var info = entrada(id);
    if (!info || info.disponible === false) {
      grupo.userData.asset.motivo = 'sin GLB generado';
      return grupo;
    }

    cargar(id)
      .then(function (escena) {
        if (!escena) throw new Error('GLB vacío');
        var glb = escena.clone ? escena.clone(true) : escena;
        glb.name = id + '_glb';
        /* Con modelo de referencia se copia su tamaño exacto: el cambio no se
           nota en pantalla. Sin referencia se usa la escala del catálogo. */
        ajustar(glb, respaldo, opt.escala || (respaldo ? null : info.escala_juego));
        if (respaldo) respaldo.visible = false;
        grupo.add(glb);
        grupo.userData.asset.origen = 'glb';
        estado.intercambios.push(id);
        if (typeof opt.alCargar === 'function') opt.alCargar(glb, grupo);
      })
      .catch(function (error) {
        grupo.userData.asset.motivo = 'respaldo procedural (' + (error.message || error) + ')';
      });

    return grupo;
  }

  /* -------------------------------------------------- armas del jugador */

  /** Accede al mapa `pW` del juego (const global del script de v39). */
  function armasEnMano() {
    try {
      /* eslint-disable no-undef */
      if (typeof pW === 'object' && pW) return pW;
      /* eslint-enable no-undef */
    } catch (e) {
      /* binding en zona muerta o inexistente */
    }
    return null;
  }

  /**
   * Sustituye las armas del jugador (rifle, subfusil) por sus GLB.
   * Si un GLB no está disponible, el arma procedural queda intacta.
   */
  function engancharArmas() {
    var pW = armasEnMano();
    if (!pW) return { ok: false, motivo: 'pW no accesible desde esta capa' };

    var mapa = { rifle_1909: 'rifle', smg_sturm: 'smg' };
    var aplicados = [];

    Object.keys(mapa).forEach(function (id) {
      var arma = pW[mapa[id]];
      var info = entrada(id);
      if (!arma || !info || info.disponible === false) return;

      cargar(id)
        .then(function (escena) {
          var glb = escena.clone ? escena.clone(true) : escena;
          /* La caja del arma procedural sirve de referencia de tamaño/posición,
             pero sus hijos son varios: se usa el propio grupo como referencia. */
          ajustar(glb, arma, null);
          for (var i = 0; i < arma.children.length; i++) arma.children[i].visible = false;
          glb.name = id + '_glb';
          arma.add(glb);
          estado.intercambios.push(mapa[id]);
          aplicados.push(mapa[id]);
        })
        .catch(function (error) {
          estado.errores[id] = error.message || String(error);
        });
    });

    return { ok: true, enCurso: Object.keys(mapa), aplicados: aplicados };
  }

  function estadoActual() {
    return {
      gltfLoader: gltfDisponible(),
      catalogo: catalogo().map(function (a) {
        return { id: a.id, disponible: !!a.disponible, glb: a.glb };
      }),
      cargados: Object.keys(estado.cargados),
      errores: estado.errores,
      intercambios: estado.intercambios.slice()
    };
  }

  V.assets = {
    version: '1.0.0',
    catalogo: catalogo,
    entrada: entrada,
    cargar: cargar,
    montar: montar,
    engancharArmas: engancharArmas,
    estado: estadoActual
  };

  /* Opt-in: ?glb=1 intenta cambiar las armas al arrancar. Sin GLB no hace nada. */
  var arranque = g.location && g.location.search ? g.location.search : '';
  if (/[?&]glb=1\b/.test(arranque)) {
    var lanzar = function () {
      try {
        var r = engancharArmas();
        if (!r.ok && g.console) console.info('[assets glb] ' + r.motivo);
      } catch (e) {
        avisar('no se pudo enganchar las armas: ' + e.message);
      }
    };
    if (g.document && g.document.readyState === 'loading') {
      g.document.addEventListener('DOMContentLoaded', lanzar);
    } else {
      setTimeout(lanzar, 1500);
    }
  }
})(typeof window !== 'undefined' ? window : globalThis);
