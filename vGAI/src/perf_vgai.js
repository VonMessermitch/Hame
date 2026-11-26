/* ============================================================================
   V.GAI.1.0 · OPTIMIZACIÓN DE RENDIMIENTO Y GESTIÓN DE MEMORIA (AGENTE 1/5/2)
   - Límite de partículas, cadáveres y trazas de impacto para evitar caídas FPS
   - Limpieza segura de cachés al cambiar de capítulo
   - Métricas internas accesibles por API (sin telemetría visible en el HUD)
   ============================================================================ */
(function () {
  'use strict';
  if (typeof window === 'undefined') return;

  window.AETH = window.AETH || {};
  window.AETH.vgai = window.AETH.vgai || {};

  var state = {
    frameMsAvg: 16.6,
    samples: 0,
    lastTs: 0,
    trimmedCorpses: 0,
    trimmedParticles: 0
  };

  function enforceBudgets() {
    // 1. Tope de cadáveres/ragdolls activos en escena (máx. 18)
    try {
      if (typeof corpses !== 'undefined' && Array.isArray(corpses) && corpses.length > 18) {
        while (corpses.length > 18) {
          var c = corpses.shift();
          if (c && c.g && typeof scene !== 'undefined' && scene) scene.remove(c.g);
          state.trimmedCorpses++;
        }
      }
    } catch (_) {}

    // 2. Tope de balas/partículas sobrantes
    try {
      if (typeof bullets !== 'undefined' && Array.isArray(bullets) && bullets.length > 90) {
        while (bullets.length > 90) {
          var b = bullets.shift();
          if (b && b.m && typeof scene !== 'undefined' && scene) scene.remove(b.m);
          state.trimmedParticles++;
        }
      }
      if (typeof parts !== 'undefined' && Array.isArray(parts) && parts.length > 180) {
        while (parts.length > 180) {
          var p = parts.shift();
          if (p && p.m && typeof scene !== 'undefined' && scene) scene.remove(p.m);
          state.trimmedParticles++;
        }
      }
    } catch (_) {}
  }

  function installPerfHooks() {
    if (state._installed) return;
    state._installed = true;

    if (typeof window.update === 'function' && !window.update._vgaiPerf) {
      var _up = window.update;
      window.update = function (dt) {
        var t0 = typeof performance !== 'undefined' ? performance.now() : 0;
        var r = _up.apply(this, arguments);
        if ((state.samples++ & 15) === 0) enforceBudgets();
        if (t0) {
          var el = performance.now() - t0;
          state.frameMsAvg = state.frameMsAvg * 0.92 + el * 0.08;
        }
        return r;
      };
      window.update._vgaiPerf = true;
    }

    if (typeof window.clearStage === 'function' && !window.clearStage._vgaiPerf) {
      var _cs = window.clearStage;
      window.clearStage = function () {
        try {
          if (window.REGISTRY_VGAI && typeof window.REGISTRY_VGAI.disposeCache === 'function') {
            window.REGISTRY_VGAI.disposeCache();
          }
        } catch (_) {}
        return _cs.apply(this, arguments);
      };
      window.clearStage._vgaiPerf = true;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installPerfHooks);
  } else {
    installPerfHooks();
  }

  var api = {
    version: 'V.GAI.1.0',
    enforceBudgets: enforceBudgets,
    getMetrics: function () { return Object.assign({}, state); }
  };

  window.PERF_VGAI = api;
  window.AETH.vgai.perf = api;
})();
