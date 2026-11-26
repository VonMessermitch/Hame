/* ============================================================================
   V.GAI.1.0 · REGISTRO CENTRAL DE RECURSOS 3D, TEXTURAS Y NIVELES (AGENTE 5)
   Conecta assets/catalog/model_catalog.json y resource_registry.json con el
   motor Three.js r128 en tiempo de ejecución y cachea texturas procedurales.
   ============================================================================ */
(function () {
  'use strict';
  if (typeof window === 'undefined') return;

  window.AETH = window.AETH || {};
  window.AETH.vgai = window.AETH.vgai || {};

  var state = {
    ready: false,
    catalog: null,
    registry: null,
    modelsById: Object.create(null),
    texturesById: Object.create(null),
    texCache: Object.create(null)
  };

  function indexData(cat, reg) {
    if (cat && Array.isArray(cat.models)) {
      state.catalog = cat;
      state.modelsById = Object.create(null);
      for (var i = 0; i < cat.models.length; i++) state.modelsById[cat.models[i].id] = cat.models[i];
    }
    if (cat && Array.isArray(cat.textures)) {
      state.texturesById = Object.create(null);
      for (var j = 0; j < cat.textures.length; j++) state.texturesById[cat.textures[j].id] = cat.textures[j];
    }
    if (reg) state.registry = reg;
    state.ready = !!(state.catalog || state.registry);
  }

  function loadCatalogs() {
    if (typeof fetch !== 'function') return Promise.resolve(state);
    return Promise.all([
      fetch('assets/catalog/model_catalog.json').then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }),
      fetch('assets/catalog/resource_registry.json').then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; })
    ]).then(function (pair) {
      indexData(pair[0], pair[1]);
      return state;
    });
  }

  function getTexture(id, opts) {
    opts = opts || {};
    var key = id + '|' + (opts.rx || 1) + 'x' + (opts.ry || 1);
    if (state.texCache[key]) return state.texCache[key];
    if (typeof THREE === 'undefined' || typeof document === 'undefined') return null;

    var spec = state.texturesById[id] || { width: 128, height: 128, palette: ['#58544c', '#3c3832', '#9a8c74'], pattern: 'generic' };
    var w = spec.width || 128, h = spec.height || 128;
    var c = document.createElement('canvas');
    c.width = w; c.height = h;
    var g = c.getContext('2d');
    var pal = spec.palette || ['#555555', '#333333', '#777777'];
    g.fillStyle = pal[0];
    g.fillRect(0, 0, w, h);

    if (id.indexOf('door') >= 0) {
      g.fillStyle = pal[1];
      for (var y = 0; y < h; y += 16) g.fillRect(0, y, w, 2);
      g.fillStyle = 'rgba(255,255,255,0.08)';
      for (var x = 8; x < w; x += 16) for (var r = 8; r < h; r += 16) g.fillRect(x, r, 3, 3);
    } else if (id.indexOf('prop') >= 0) {
      g.fillStyle = pal[1];
      for (var py = 0; py < h; py += 12) g.fillRect(0, py, w, 1.5);
      g.strokeStyle = pal[2] || pal[1];
      g.lineWidth = 3;
      g.strokeRect(4, 4, w - 8, h - 8);
    } else {
      g.fillStyle = pal[1];
      for (var i = 0; i < 180; i++) {
        g.fillRect((i * 37) % w, (i * 53) % h, 2, 2);
      }
    }

    var tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    if (opts.rx || opts.ry) tex.repeat.set(opts.rx || 1, opts.ry || 1);
    state.texCache[key] = tex;
    return tex;
  }

  function disposeCache() {
    for (var k in state.texCache) {
      try { state.texCache[k].dispose(); } catch (_) {}
    }
    state.texCache = Object.create(null);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadCatalogs);
  } else {
    loadCatalogs();
  }

  var api = {
    version: 'V.GAI.1.0',
    state: state,
    loadCatalogs: loadCatalogs,
    getModel: function (id) { return state.modelsById[id] || null; },
    getTextureSpec: function (id) { return state.texturesById[id] || null; },
    getTexture: getTexture,
    disposeCache: disposeCache,
    getSummary: function () { return state.registry ? state.registry.summary : null; }
  };

  window.REGISTRY_VGAI = api;
  window.AETH.vgai.registry = api;
})();
