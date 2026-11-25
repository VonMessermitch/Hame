/* =========================================================================
   ai/cognition/competence.js — competencias operativas del individuo.
   Aritmética de campaña y geografía práctica: no son frases, son funciones
   que la planificación usa para estimar distancias, coste de viaje y fuerza.
   Todo es determinista: no consume el RNG del cerebro (si lo hiciera,
   cambiaría el resto de la simulación); el ruido deriva de su semilla.
   ========================================================================= */
(function (g) {
  'use strict';
  const AETH = g.AETH;
  const U = AETH.util;

  const CO = (AETH.competence = {});
  CO.version = '1.0.0';

  CO.stats = { distance: 0, travel: 0, strength: 0, reach: 0, rejected: 0 };

  function domainsOf(brain) {
    return (brain && brain.culture && brain.culture.knowledge && brain.culture.knowledge.domains) || {};
  }
  function educationOf(brain) {
    return U.clamp((brain && brain.culture && brain.culture.education) || 0, 0, 1);
  }
  function literacyOf(brain) {
    return !!(brain && brain.culture && brain.culture.literacy);
  }

  /* Aritmética de campaña: contar raciones, munición y efectivos. No es
     cultura académica; nace del oficio (comercio, mecánica, ciencia,
     ferrocarril, milicia) y de la escuela. */
  CO.numeracy = function (brain) {
    const d = domainsOf(brain);
    const trade = Math.max(
      (d.comercial || 0) * 1.0,
      (d.cientifico || 0) * 0.9,
      (d.mecanico || 0) * 0.85,
      (d.ferroviario || 0) * 0.8,
      (d.militar || 0) * 0.55
    );
    const v = 0.62 * trade + 0.33 * educationOf(brain) + (literacyOf(brain) ? 0.05 : 0);
    return U.clamp(v, 0.02, 1);
  };

  /* Geografía práctica: orientarse, estimar distancias y recordar caminos. */
  CO.geography = function (brain) {
    const d = domainsOf(brain);
    const known = brain && brain.memory && brain.memory.places ? Object.keys(brain.memory.places).length : 0;
    const familiarity = U.clamp(known / 6, 0, 1);
    const v = 0.68 * (d.geografico || 0) + 0.17 * educationOf(brain) + 0.15 * familiarity;
    return U.clamp(v, 0.02, 1);
  };

  /* Ruido estable por cerebro y clave: mismo resultado siempre, sin RNG. */
  function noise(brain, key) {
    const id = (brain && brain.id) || 'npc';
    const h = U.hashString(id + '|competence|' + key);
    return (h % 1000) / 1000;
  }

  /* Distancia estimada a ojo: el error baja con la competencia geográfica. */
  CO.estimateDistance = function (brain, meters, key, geoCache) {
    const geo = geoCache === undefined ? CO.geography(brain) : geoCache;
    const error = (1 - geo) * 0.55;
    const signed = (noise(brain, 'dist|' + (key || '')) * 2 - 1) * error;
    CO.stats.distance++;
    return {
      meters: Math.max(1, meters * (1 + signed)),
      error: U.round(Math.abs(signed), 3),
      confidence: U.round(0.4 + 0.55 * geo, 2)
    };
  };

  /* ¿Sabe llegar a un tipo de lugar? Sin geografía y sin haber estado, no. */
  CO.canReach = function (brain, place, world) {
    if (!place) return { ok: true };
    CO.stats.reach++;
    const geo = CO.geography(brain);
    const loc = brain && brain.location ? brain.location.type : null;
    if (loc && loc === place) return { ok: true };
    if (geo >= 0.3) return { ok: true };
    const places = (brain && brain.memory && brain.memory.places) || {};
    for (const id of Object.keys(places)) {
      const p = places[id];
      if (p && String(p.name || '').toLowerCase().indexOf(String(place).toLowerCase()) >= 0) return { ok: true };
    }
    if (world && typeof world.hasPlaceOfType === 'function' && world.hasPlaceOfType(place) && geo >= 0.1) return { ok: true };
    CO.stats.rejected++;
    return { ok: false, reason: 'no sabe llegar a ' + place };
  };

  /* Coste de viaje en minutos: lo paga el planificador. Quien no sabe
     orientarse sobreestima el camino y prefiere lo que ya conoce. */
  CO.travelMinutes = function (brain, action, geoCache) {
    const place = action && action.place;
    if (!place || !place.length) return 0;
    const here = brain && brain.location ? brain.location.type : null;
    if (here && place.indexOf(here) >= 0) return 0;
    const cache = (brain._compTravel = brain._compTravel || {});
    const key = (action.id || 'accion') + '|' + (here || '-');
    if (cache[key] !== undefined) return cache[key];
    const geo = geoCache === undefined ? CO.geography(brain) : geoCache;
    const est = CO.estimateDistance(brain, 1300, action.id || 'accion', geo).meters;
    const pessimism = 1 + (1 - geo) * 0.9;
    const minutes = U.clamp((est / 75) * pessimism, 2, 240);
    cache[key] = U.round(minutes, 1);
    CO.stats.travel++;
    return cache[key];
  };

  /* Fuerza estimada de un grupo: el número no es el mismo para todos. */
  CO.estimateStrength = function (brain, n, quality) {
    const num = CO.numeracy(brain);
    const err = 0.05 + (1 - num) * 0.45;
    const mid = n * (quality === undefined ? 1 : quality);
    CO.stats.strength++;
    return {
      mid: U.round(mid, 1),
      lo: U.round(Math.max(0, mid * (1 - err)), 1),
      hi: U.round(mid * (1 + err), 1),
      error: U.round(err, 2)
    };
  };

  /* Raciones: cuántos días aguanta la tropa con lo que hay. */
  CO.rationDays = function (brain, kg, people) {
    const num = CO.numeracy(brain);
    const exact = kg / (0.6 * Math.max(1, people || 1));
    const err = 0.05 + (1 - num) * 0.5;
    const signed = (noise(brain, 'ration|' + Math.round(kg * 10)) * 2 - 1) * err;
    return {
      days: Math.max(0, U.round(exact * (1 + signed), 1)),
      exact: U.round(exact, 1),
      error: U.round(Math.abs(signed), 2)
    };
  };

  CO.describe = function (brain) {
    return {
      numeracy: U.round(CO.numeracy(brain), 2),
      geography: U.round(CO.geography(brain), 2),
      literacy: literacyOf(brain)
    };
  };
})(typeof window !== 'undefined' ? window : globalThis);
