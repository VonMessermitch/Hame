/* ============================================================================
   V.GAI.1.0 · SISTEMA DE AUDIO CONTEXTUAL (AGENTE 4 — INGENIERO DE SONIDO)
   Integra los 53 clips procesados de assets/audio/processed/ + manifest.json:
   - Voces alemanas (Veyrn) e inglesas (Volskaya/Aviación) en combate activo
   - Voces Kokoro en español para oficiales, campaña, cinemáticas y epílogos
   - Vehículos reales (disparo/motor de tanque, motor/pasada de avión)
   - Ambiente costero/fluvial (agua) + viento invernal niveles 18/19/20
   - Puertas (acero, madera, madera con vidrio · abrir y cerrar)
   - Control de concurrencia, prioridades, no repetición y atenuación 3D
   ============================================================================ */
(function () {
  'use strict';
  if (typeof window === 'undefined') return;

  window.AETH = window.AETH || {};
  window.AETH.vgai = window.AETH.vgai || {};

  var state = {
    ready: false,
    loading: false,
    manifest: null,
    byId: Object.create(null),
    byEvent: Object.create(null),
    byCategory: Object.create(null),
    buffers: Object.create(null),
    pendingDecode: Object.create(null),
    recentVoiceIds: [],
    activeVoices: [], // {id, src, gain, priority, endAt, category}
    activeSfx: 0,
    lastEventAt: Object.create(null),
    lastVoiceAt: 0,
    waterLoop: null,
    tankLoop: null,
    planeLoop: null,
    ambientGain: null,
    extMode: 'ogg',
    stats: { played: 0, suppressed: 0, loaded: 0, errors: 0 }
  };

  function detectAudioFormat() {
    try {
      var a = document.createElement('audio');
      if (a && typeof a.canPlayType === 'function') {
        var ogg = a.canPlayType('audio/ogg; codecs="vorbis"');
        if (ogg === 'probably' || ogg === 'maybe') return 'ogg';
      }
    } catch (_) {}
    return 'mp3';
  }
  state.extMode = detectAudioFormat();

  function getCtx() {
    try {
      if (typeof ac !== 'undefined' && ac) return ac;
    } catch (_) {}
    return window._vgaiAC || null;
  }

  function getOut(ctx) {
    try {
      if (typeof out34 === 'function') return out34();
    } catch (_) {}
    try {
      if (typeof AB === 'function') return AB();
    } catch (_) {}
    return ctx ? ctx.destination : null;
  }

  function soundAllowed() {
    try {
      if (typeof sndOK === 'function' && !sndOK()) return false;
      if (typeof G !== 'undefined' && G && G.mute) return false;
    } catch (_) {}
    return true;
  }

  function clipUrl(clip) {
    if (!clip) return null;
    if (state.extMode === 'ogg' && clip.processedOgg) return clip.processedOgg;
    return clip.processedMp3 || clip.processedOgg || clip.processedName || null;
  }

  function indexManifest(data) {
    if (!data || !Array.isArray(data.clips)) return;
    state.manifest = data;
    state.byId = Object.create(null);
    state.byEvent = Object.create(null);
    state.byCategory = Object.create(null);
    for (var i = 0; i < data.clips.length; i++) {
      var c = data.clips[i];
      state.byId[c.id] = c;
      if (c.event) {
        if (!state.byEvent[c.event]) state.byEvent[c.event] = [];
        state.byEvent[c.event].push(c);
      }
      if (c.category) {
        if (!state.byCategory[c.category]) state.byCategory[c.category] = [];
        state.byCategory[c.category].push(c);
      }
    }
    state.ready = true;
  }

  // Fallback índice mínimo por si fetch se retrasa antes del primer evento
  var FALLBACK_CLIPS = [
    { id: 'agua_watersound', processedOgg: 'assets/audio/processed/agua/watersound.ogg', processedMp3: 'assets/audio/processed/agua/watersound.mp3', category: 'ambient_water', event: 'amb_water_coast', language: 'sfx', priority: 2, duration: 22.655 },
    { id: 'brenner_01', processedOgg: 'assets/audio/processed/brenner_01.ogg', processedMp3: 'assets/audio/processed/brenner_01.mp3', category: 'dialogue_campaign', event: 'kokoro_brenner_01', language: 'es', priority: 10, duration: 6.6 },
    { id: 'civil_01', processedOgg: 'assets/audio/processed/civil_01.ogg', processedMp3: 'assets/audio/processed/civil_01.mp3', category: 'dialogue_campaign', event: 'kokoro_civil_01', language: 'es', priority: 10, duration: 2.352 },
    { id: 'falk_01', processedOgg: 'assets/audio/processed/falk_01.ogg', processedMp3: 'assets/audio/processed/falk_01.mp3', category: 'dialogue_campaign', event: 'kokoro_falk_01', language: 'es', priority: 10, duration: 3.888 },
    { id: 'falk_02', processedOgg: 'assets/audio/processed/falk_02.ogg', processedMp3: 'assets/audio/processed/falk_02.mp3', category: 'dialogue_campaign', event: 'kokoro_falk_02', language: 'es', priority: 10, duration: 4.536 },
    { id: 'koller_01', processedOgg: 'assets/audio/processed/koller_01.ogg', processedMp3: 'assets/audio/processed/koller_01.mp3', category: 'dialogue_campaign', event: 'kokoro_koller_01', language: 'es', priority: 10, duration: 5.544 },
    { id: 'koller_02', processedOgg: 'assets/audio/processed/koller_02.ogg', processedMp3: 'assets/audio/processed/koller_02.mp3', category: 'dialogue_campaign', event: 'kokoro_koller_02', language: 'es', priority: 10, duration: 5.592 },
    { id: 'koller_03', processedOgg: 'assets/audio/processed/koller_03.ogg', processedMp3: 'assets/audio/processed/koller_03.mp3', category: 'dialogue_campaign', event: 'kokoro_koller_03', language: 'es', priority: 10, duration: 4.512 },
    { id: 'varsk_01', processedOgg: 'assets/audio/processed/varsk_01.ogg', processedMp3: 'assets/audio/processed/varsk_01.mp3', category: 'dialogue_campaign', event: 'kokoro_varsk_01', language: 'es', priority: 10, duration: 4.392 },
    { id: 'doors_door_steel_open', processedOgg: 'assets/audio/processed/doors/door_steel_open.ogg', processedMp3: 'assets/audio/processed/doors/door_steel_open.mp3', category: 'sfx_door', event: 'door_steel_open', language: 'sfx', priority: 7, duration: 0.65 },
    { id: 'doors_door_steel_close', processedOgg: 'assets/audio/processed/doors/door_steel_close.ogg', processedMp3: 'assets/audio/processed/doors/door_steel_close.mp3', category: 'sfx_door', event: 'door_steel_close', language: 'sfx', priority: 7, duration: 0.50 },
    { id: 'doors_door_wood_open', processedOgg: 'assets/audio/processed/doors/door_wood_open.ogg', processedMp3: 'assets/audio/processed/doors/door_wood_open.mp3', category: 'sfx_door', event: 'door_wood_open', language: 'sfx', priority: 7, duration: 0.55 },
    { id: 'doors_door_wood_close', processedOgg: 'assets/audio/processed/doors/door_wood_close.ogg', processedMp3: 'assets/audio/processed/doors/door_wood_close.mp3', category: 'sfx_door', event: 'door_wood_close', language: 'sfx', priority: 7, duration: 0.42 },
    { id: 'doors_door_glass_open', processedOgg: 'assets/audio/processed/doors/door_glass_open.ogg', processedMp3: 'assets/audio/processed/doors/door_glass_open.mp3', category: 'sfx_door', event: 'door_glass_open', language: 'sfx', priority: 7, duration: 0.55 },
    { id: 'doors_door_glass_close', processedOgg: 'assets/audio/processed/doors/door_glass_close.ogg', processedMp3: 'assets/audio/processed/doors/door_glass_close.mp3', category: 'sfx_door', event: 'door_glass_close', language: 'sfx', priority: 7, duration: 0.48 },
    { id: 'vehiculos_disparotanquemedio', processedOgg: 'assets/audio/processed/vehiculos/disparotanquemedio.ogg', processedMp3: 'assets/audio/processed/vehiculos/disparotanquemedio.mp3', category: 'sfx_vehicle', event: 'tank_cannon_fire', language: 'sfx', priority: 8, duration: 1.089 },
    { id: 'vehiculos_flyby', processedOgg: 'assets/audio/processed/vehiculos/flyby.ogg', processedMp3: 'assets/audio/processed/vehiculos/flyby.mp3', category: 'sfx_vehicle', event: 'aircraft_flyby', language: 'sfx', priority: 8, duration: 12.492 },
    { id: 'vehiculos_movimientotanque', processedOgg: 'assets/audio/processed/vehiculos/movimientotanque.ogg', processedMp3: 'assets/audio/processed/vehiculos/movimientotanque.mp3', category: 'sfx_vehicle', event: 'tank_engine_move', language: 'sfx', priority: 8, duration: 14.529 },
    { id: 'vehiculos_plane', processedOgg: 'assets/audio/processed/vehiculos/plane.ogg', processedMp3: 'assets/audio/processed/vehiculos/plane.mp3', category: 'sfx_vehicle', event: 'aircraft_engine', language: 'sfx', priority: 8, duration: 29.563 }
  ];
  indexManifest({ version: 'V.GAI.1.0', clips: FALLBACK_CLIPS });

  function loadManifest() {
    if (state.loading || typeof fetch !== 'function') return Promise.resolve(state.manifest);
    state.loading = true;
    return fetch('assets/audio/manifest.json')
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        indexManifest(data);
        state.loading = false;
        preloadPriority();
        return data;
      })
      .catch(function () {
        state.loading = false;
        return state.manifest;
      });
  }

  function decodeClip(clip) {
    if (!clip) return Promise.resolve(null);
    if (state.buffers[clip.id]) return Promise.resolve(state.buffers[clip.id]);
    if (state.pendingDecode[clip.id]) return state.pendingDecode[clip.id];
    var ctx = getCtx();
    if (!ctx || typeof fetch !== 'function') return Promise.resolve(null);

    var primary = clipUrl(clip);
    var secondary = clip.processedMp3 && clip.processedMp3 !== primary ? clip.processedMp3 : null;
    if (!primary) return Promise.resolve(null);

    function tryUrl(u) {
      return fetch(u)
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.arrayBuffer();
        })
        .then(function (ab) {
          return ctx.decodeAudioData(ab);
        });
    }

    var p = tryUrl(primary)
      .catch(function () {
        return secondary ? tryUrl(secondary) : Promise.reject(new Error('decode failed'));
      })
      .then(function (buf) {
        state.buffers[clip.id] = buf;
        state.stats.loaded++;
        try {
          if (typeof SND34 !== 'undefined' && SND34.buf && clip.id) {
            SND34.buf[clip.id] = buf;
          }
        } catch (_) {}
        delete state.pendingDecode[clip.id];
        return buf;
      })
      .catch(function () {
        state.stats.errors++;
        delete state.pendingDecode[clip.id];
        return null;
      });

    state.pendingDecode[clip.id] = p;
    return p;
  }

  function preloadPriority() {
    var ctx = getCtx();
    if (!ctx) return;
    var priorityEvents = [
      'door_steel_open', 'door_steel_close', 'door_wood_open', 'door_wood_close',
      'door_glass_open', 'door_glass_close', 'tank_cannon_fire', 'tank_spotted_de',
      'tank_alert_en', 'order_fire_de', 'order_move_in_de', 'amb_water_coast'
    ];
    for (var i = 0; i < priorityEvents.length; i++) {
      var list = state.byEvent[priorityEvents[i]];
      if (list && list[0]) decodeClip(list[0]);
    }
  }

  function pruneVoices(nowMs) {
    var keep = [];
    for (var i = 0; i < state.activeVoices.length; i++) {
      if (state.activeVoices[i].endAt > nowMs) keep.push(state.activeVoices[i]);
    }
    state.activeVoices = keep;
  }

  function canPlayVoice(clip, priority, opts) {
    var now = performance.now();
    pruneVoices(now);
    opts = opts || {};
    var evKey = opts.cooldownKey || clip.event || clip.id;
    var minGap = opts.cooldownMs != null ? opts.cooldownMs : (clip.category === 'dialogue_campaign' ? 1200 : 2400);
    if (state.lastEventAt[evKey] && now - state.lastEventAt[evKey] < minGap) {
      state.stats.suppressed++;
      return false;
    }

    var isVoice = clip.language && clip.language !== 'sfx';
    if (isVoice) {
      var globalGap = priority >= 9 ? 450 : 1350;
      if (now - state.lastVoiceAt < globalGap && priority < 10) {
        state.stats.suppressed++;
        return false;
      }
      if (state.activeVoices.length >= 4) {
        // Si llega prioridad mayor, atenúa y reemplaza la voz de menor prioridad
        var lowestIdx = -1, lowestPri = priority;
        for (var i = 0; i < state.activeVoices.length; i++) {
          if (state.activeVoices[i].priority < lowestPri) {
            lowestPri = state.activeVoices[i].priority;
            lowestIdx = i;
          }
        }
        if (lowestIdx < 0) {
          state.stats.suppressed++;
          return false;
        }
        try {
          state.activeVoices[lowestIdx].src.stop();
        } catch (_) {}
        state.activeVoices.splice(lowestIdx, 1);
      }
    } else if (state.activeSfx >= 12) {
      state.stats.suppressed++;
      return false;
    }
    return true;
  }

  function pickClip(query, opts) {
    opts = opts || {};
    var pool = null;
    if (typeof query === 'string') {
      if (state.byId[query]) return state.byId[query];
      if (state.byEvent[query]) pool = state.byEvent[query];
      else if (state.byCategory[query]) pool = state.byCategory[query];
    } else if (Array.isArray(query)) {
      pool = [];
      for (var i = 0; i < query.length; i++) {
        var c = state.byId[query[i]] || (state.byEvent[query[i]] && state.byEvent[query[i]][0]);
        if (c) pool.push(c);
      }
    }
    if (!pool || !pool.length) return null;
    if (opts.lang) {
      var flt = pool.filter(function (c) { return c.language === opts.lang; });
      if (flt.length) pool = flt;
    }
    if (pool.length === 1) return pool[0];

    var fresh = pool.filter(function (c) { return state.recentVoiceIds.indexOf(c.id) < 0; });
    var pickFrom = fresh.length ? fresh : pool;
    return pickFrom[Math.floor(Math.random() * pickFrom.length)];
  }

  function spatialize(ctx, dest, x, z, maxDist, baseVol) {
    var g = ctx.createGain();
    var vol = baseVol;
    var panVal = 0;
    var dist = 0;

    if (typeof x === 'number' && typeof z === 'number' && typeof cam !== 'undefined' && cam && cam.position) {
      var dx = x - cam.position.x;
      var dz = z - cam.position.z;
      dist = Math.hypot(dx, dz);
      var lim = maxDist || 95;
      if (dist >= lim) {
        g.disconnect();
        return null;
      }
      var atten = Math.pow(Math.max(0, 1 - dist / lim), 1.35);
      vol *= atten;

      if (dist > 0.5 && typeof yaw === 'number') {
        var rx = Math.cos(yaw), rz = -Math.sin(yaw);
        panVal = Math.max(-0.9, Math.min(0.9, (dx * rx + dz * rz) / dist));
      }
    }

    if (vol < 0.015) return null;
    g.gain.value = Math.min(1.25, vol);

    var head = g;
    if (dist > 26 && ctx.createBiquadFilter) {
      var lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = Math.max(680, 2800 - dist * 24);
      head.connect(lp);
      head = lp;
    }
    if (Math.abs(panVal) > 0.04 && ctx.createStereoPanner) {
      var pn = ctx.createStereoPanner();
      pn.pan.value = panVal;
      head.connect(pn);
      pn.connect(dest);
    } else {
      head.connect(dest);
    }
    return g;
  }

  function playBuffer(clip, buf, opts) {
    var ctx = getCtx();
    var dest = getOut(ctx);
    if (!ctx || !dest || !buf || !soundAllowed()) return false;
    opts = opts || {};

    var baseVol = opts.vol != null ? opts.vol : (clip.language && clip.language !== 'sfx' ? 0.78 : 0.65);
    var gNode = spatialize(ctx, dest, opts.x, opts.z, opts.maxDist || (clip.language === 'sfx' ? 140 : 85), baseVol);
    if (!gNode) return false;

    var src = ctx.createBufferSource();
    src.buffer = buf;
    var rate = opts.rate || (clip.language && clip.language !== 'sfx' ? (0.97 + Math.random() * 0.06) : (0.94 + Math.random() * 0.12));
    src.playbackRate.value = rate;
    if (opts.loop) src.loop = true;

    src.connect(gNode);
    src.start(0);

    var now = performance.now();
    var durMs = ((buf.duration || clip.duration || 2) / rate) * 1000;
    state.lastEventAt[opts.cooldownKey || clip.event || clip.id] = now;
    if (clip.language && clip.language !== 'sfx') {
      state.lastVoiceAt = now;
      state.recentVoiceIds.push(clip.id);
      if (state.recentVoiceIds.length > 4) state.recentVoiceIds.shift();
      var entry = { id: clip.id, src: src, gain: gNode, priority: opts.priority || clip.priority || 6, endAt: now + durMs, category: clip.category };
      state.activeVoices.push(entry);
      src.onended = function () {
        var idx = state.activeVoices.indexOf(entry);
        if (idx >= 0) state.activeVoices.splice(idx, 1);
      };
    } else {
      state.activeSfx++;
      src.onended = function () { state.activeSfx = Math.max(0, state.activeSfx - 1); };
    }
    state.stats.played++;
    return src;
  }

  function synthDoorFallback(material, opening, x, z) {
    var ctx = getCtx();
    var dest = getOut(ctx);
    if (!ctx || !dest || !soundAllowed()) return;
    var g = spatialize(ctx, dest, x, z, 50, 0.36);
    if (!g) return;
    var t = ctx.currentTime;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    if (material === 'steel') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(opening ? 130 : 180, t);
      osc.frequency.exponentialRampToValueAtTime(opening ? 240 : 62, t + 0.35);
      gain.gain.setValueAtTime(0.32, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.42);
    } else if (material === 'glass') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(opening ? 980 : 1380, t);
      osc.frequency.exponentialRampToValueAtTime(opening ? 640 : 880, t + 0.25);
      gain.gain.setValueAtTime(0.24, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.30);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(opening ? 160 : 120, t);
      osc.frequency.exponentialRampToValueAtTime(opening ? 220 : 58, t + 0.28);
      gain.gain.setValueAtTime(0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
    }
    osc.connect(gain);
    gain.connect(g);
    osc.start(t);
    osc.stop(t + 0.46);
  }

  function playEvent(query, opts) {
    opts = opts || {};
    if (!soundAllowed()) return Promise.resolve(false);
    var clip = pickClip(query, opts);
    if (!clip) return Promise.resolve(false);
    var pri = opts.priority != null ? opts.priority : (clip.priority || 6);
    if (!canPlayVoice(clip, pri, opts)) return Promise.resolve(false);

    var cached = state.buffers[clip.id];
    if (cached) return Promise.resolve(!!playBuffer(clip, cached, opts));

    return decodeClip(clip).then(function (buf) {
      if (!buf) return false;
      if (!canPlayVoice(clip, pri, opts)) return false;
      return !!playBuffer(clip, buf, opts);
    });
  }

  function playDoor(material, opening, x, z) {
    var m = material === 'wood_glass' ? 'glass' : (material === 'steel' ? 'steel' : (material === 'glass' ? 'glass' : 'wood'));
    var ev = 'door_' + m + '_' + (opening ? 'open' : 'close');
    var clip = pickClip(ev);
    if (clip && state.buffers[clip.id]) {
      return playEvent(ev, { x: x, z: z, vol: 0.72, maxDist: 45, cooldownMs: 120 });
    }
    if (clip) decodeClip(clip);
    synthDoorFallback(m, opening, x, z);
    return Promise.resolve(true);
  }

  // Bucle ambiental costero / río real (agua/watersound.wav)
  function updateWaterAmbience() {
    var ctx = getCtx();
    var dest = getOut(ctx);
    if (!ctx || !dest || !soundAllowed() || typeof playing === 'undefined' || !playing) {
      if (state.waterLoop && state.waterLoop.gain) state.waterLoop.gain.gain.value = 0;
      return;
    }
    var nearWater = false;
    var targetVol = 0;
    var lv = typeof level !== 'undefined' ? level : 0;
    if (lv === 15 || lv === 17 || lv === 19) {
      nearWater = true;
      targetVol = lv === 15 ? 0.24 : 0.20;
    } else if ((lv === 18 || lv === 20) && typeof cam !== 'undefined' && cam) {
      var dRiv = Math.abs(cam.position.z + 831);
      if (dRiv < 95) {
        nearWater = true;
        targetVol = Math.max(0.02, 0.22 * (1 - dRiv / 95));
      }
    } else {
      try {
        if (typeof water35 === 'function' && typeof P !== 'undefined' && P && P.g && water35(P.g.position.x, P.g.position.z)) {
          nearWater = true;
          targetVol = 0.22;
        }
      } catch (_) {}
    }

    if (!nearWater) {
      if (state.waterLoop && state.waterLoop.gain) {
        state.waterLoop.gain.gain.value += (0 - state.waterLoop.gain.gain.value) * 0.15;
      }
      return;
    }

    var clip = state.byId['agua_watersound'];
    if (!clip) return;
    if (!state.waterLoop && state.buffers[clip.id]) {
      var g = ctx.createGain();
      g.gain.value = 0.001;
      g.connect(dest);
      var src = ctx.createBufferSource();
      src.buffer = state.buffers[clip.id];
      src.loop = true;
      src.connect(g);
      src.start(0);
      state.waterLoop = { src: src, gain: g };
    } else if (!state.waterLoop) {
      decodeClip(clip);
    } else if (state.waterLoop.gain) {
      state.waterLoop.gain.gain.value += (targetVol - state.waterLoop.gain.gain.value) * 0.12;
    }
  }

  // Selector contextual alemán / inglés según facción, mapa y situación
  function factionLang(isVeyrnUnit) {
    var lv = typeof level !== 'undefined' ? level : 1;
    if (lv === 19 || lv === 20) return isVeyrnUnit === false ? 'en' : 'de';
    if (lv === 17 || lv === 18) return isVeyrnUnit ? 'de' : 'en';
    return isVeyrnUnit ? 'de' : 'en';
  }

  function contextualCombatShout(kind, x, z, isVeyrn) {
    var lang = factionLang(isVeyrn);
    var map = {
      order_advance: lang === 'de' ? ['order_move_in_de', 'order_right_flank_de', 'order_advance_north'] : ['order_advance_north', 'squad_assembled', 'order_move_in_de'],
      order_regroup: lang === 'de' ? ['order_regroup_de', 'officer_order_de_2'] : ['squad_assembled', 'order_retreat_ready'],
      order_fire: lang === 'de' ? ['order_fire_de', 'officer_order_de_3'] : ['combat_callout_en_1', 'order_fire_de'],
      enemy_spotted: lang === 'de' ? ['enemy_spotted_de_1', 'enemy_spotted_de_2', 'enemy_spotted_de_3', 'enemy_wave_de'] : ['roadblock_spotted', 'combat_callout_en_2'],
      tank_spotted: lang === 'de' ? ['tank_spotted_de', 'tank_hatches_de'] : ['tank_alert_en', 'tank_spotted_de'],
      tank_hit: ['tank_damaged_de', 'direct_hit_de'],
      heavy_fire: lang === 'de' ? ['combat_callout_de', 'beach_assault_de'] : ['under_heavy_fire_en', 'order_retreat_cover', 'order_retreat_move'],
      air: ['air_copilot_en', 'air_approach_en']
    };
    var choices = map[kind] || ['combat_callout_de', 'combat_callout_en_1'];
    return playEvent(choices, { x: x, z: z, vol: 0.72, cooldownKey: 'shout_' + kind, cooldownMs: 3600 });
  }

  // Registrar ambientes faltantes en AMB35 (niveles 18, 19, 20)
  function patchAmb35() {
    try {
      if (typeof AMB35 !== 'undefined' && AMB35) {
        if (!AMB35[18]) AMB35[18] = ['amb_wind'];
        if (!AMB35[19]) AMB35[19] = ['amb_wind'];
        if (!AMB35[20]) AMB35[20] = ['amb_wind'];
      }
    } catch (_) {}
  }

  function installGameplayHooks() {
    if (state._hooksInstalled) return;
    state._hooksInstalled = true;

    patchAmb35();

    // 1. Kokoro / talk / say — asegura respaldo HTTP OGG/MP3 si VOZ40 está en modo archivo
    if (typeof window.VOZ40 !== 'undefined' && window.VOZ40) {
      var origSonar = window.VOZ40.sonarTexto;
      if (typeof origSonar === 'function') {
        window.VOZ40.sonarTexto = function (t) {
          var ok = false;
          try { ok = origSonar.apply(this, arguments); } catch (_) {}
          if (!ok && t) {
            var n = String(t).toLowerCase();
            if (n.indexOf('brenner') >= 0 || n.indexOf('calles') >= 0) playEvent('kokoro_brenner_01', { vol: 0.9 });
            else if (n.indexOf('kern') >= 0 || n.indexOf('cajas') >= 0) playEvent('kokoro_falk_01', { vol: 0.9 });
            else if (n.indexOf('agujero') >= 0) playEvent('kokoro_falk_02', { vol: 0.9 });
            else if (n.indexOf('recluta') >= 0 || n.indexOf('carteles') >= 0) playEvent('kokoro_koller_01', { vol: 0.9 });
            else if (n.indexOf('caballeros') >= 0) playEvent('kokoro_koller_02', { vol: 0.9 });
            else if (n.indexOf('bunker') >= 0 || n.indexOf('búnker') >= 0) playEvent('kokoro_koller_03', { vol: 0.9 });
            else if (n.indexOf('viento no lleva') >= 0) playEvent('kokoro_civil_01', { vol: 0.9 });
            else if (n.indexOf('kovac') >= 0 || n.indexOf('kovač') >= 0 || n.indexOf('varsk') >= 0) playEvent('kokoro_varsk_01', { vol: 0.9 });
          }
          return ok;
        };
      }
    }

    // 2. Orden de escuadra (`orderLt`)
    if (typeof window.orderLt === 'function' && !window.orderLt._vgai) {
      var _ord = window.orderLt;
      window.orderLt = function () {
        var r = _ord.apply(this, arguments);
        try {
          var p = typeof P !== 'undefined' && P && P.g ? P.g.position : { x: 0, z: 0 };
          contextualCombatShout('order_regroup', p.x, p.z, level >= 19);
        } catch (_) {}
        return r;
      };
      window.orderLt._vgai = true;
    }

    // 3. Disparos enemigos / fuego IA -> voces alemanas o inglesas periódicas sin saturar
    if (typeof window.fireE33 === 'function' && !window.fireE33._vgai) {
      var _fe = window.fireE33;
      window.fireE33 = function (e) {
        var r = _fe.apply(this, arguments);
        try {
          if (e && e.g && Math.random() < 0.045) {
            var isVeyrn = e.faction === 'veyrn' || e.team === 'veyrn' || (typeof level !== 'undefined' && (level === 17 || level === 18));
            contextualCombatShout(Math.random() < 0.55 ? 'order_fire' : 'enemy_spotted', e.g.position.x, e.g.position.z, isVeyrn);
          }
        } catch (_) {}
        return r;
      };
      window.fireE33._vgai = true;
    }

    // 4. Daño al jugador -> alertas de fuego intenso / retirada
    if (typeof window.hitP === 'function' && !window.hitP._vgai) {
      var _hp = window.hitP;
      window.hitP = function () {
        var h0 = typeof P !== 'undefined' ? P.hp : 100;
        var r = _hp.apply(this, arguments);
        try {
          if (typeof P !== 'undefined' && P.hp < h0 && P.hp < 55 && Math.random() < 0.35 && P.g) {
            contextualCombatShout('heavy_fire', P.g.position.x, P.g.position.z, level >= 19);
          }
        } catch (_) {}
        return r;
      };
      window.hitP._vgai = true;
    }

    // 5. Explosiones (`boom` / `expSnd`) -> en búnkeres/grandes cargas, disparar audio contextual
    if (typeof window.expSnd === 'function' && !window.expSnd._vgai) {
      var _exp = window.expSnd;
      window.expSnd = function (x, z, k) {
        var r = _exp.apply(this, arguments);
        try {
          if ((k || 0) >= 1.15 && Math.random() < 0.32) {
            playEvent('bunker_explosion', { x: x, z: z, vol: 0.65, maxDist: 140, cooldownMs: 7500 });
          }
        } catch (_) {}
        return r;
      };
      window.expSnd._vgai = true;
    }

    // 6. Bajas (`kill`) -> celebración táctica o impacto directo ocasional
    if (typeof window.kill === 'function' && !window.kill._vgai) {
      var _kl = window.kill;
      window.kill = function (e) {
        var r = _kl.apply(this, arguments);
        try {
          if (e && e.g && Math.random() < 0.14) {
            playEvent(level >= 19 ? ['direct_hit_de', 'officer_order_de_2'] : ['direct_hit_de', 'bridge_cross_en'], {
              x: e.g.position.x, z: e.g.position.z, vol: 0.62, cooldownMs: 5500
            });
          }
        } catch (_) {}
        return r;
      };
      window.kill._vgai = true;
    }

    // 7. Actualización periódica de ambiente acuático y motores de tanque cercanos
    setInterval(function () {
      try {
        updateWaterAmbience();
        if (typeof playing !== 'undefined' && playing && typeof cam !== 'undefined' && cam) {
          var nearTank = null;
          if (typeof VEH32 !== 'undefined' && VEH32 && VEH32.list) {
            for (var i = 0; i < VEH32.list.length; i++) {
              var v = VEH32.list[i];
              if (!v || !v.g || v.hp <= 0) continue;
              var d = Math.hypot(v.g.position.x - cam.position.x, v.g.position.z - cam.position.z);
              if (d < 80) { nearTank = { x: v.g.position.x, z: v.g.position.z, d: d }; break; }
            }
          }
          if (nearTank) {
            playEvent('tank_engine_move', { x: nearTank.x, z: nearTank.z, vol: 0.36, maxDist: 90, cooldownMs: 13500 });
          }
        }
      } catch (_) {}
    }, 900);

    // 8. Perfiles reutilizables para armas, recargas e impactos
    if (typeof window.weaponSfx === 'function' && !window.weaponSfx._vgaiProfile) {
      var _ws = window.weaponSfx;
      window.weaponSfx = function (kind) {
        var r = _ws.apply(this, arguments);
        try {
          if (kind === 'mg' || kind === 'revolver' || kind === 'rifle' || kind === 'smg') {
            playWeaponProfile(kind === 'revolver' && typeof level !== 'undefined' && level === 12 ? 'pistol' : kind);
          }
        } catch (_) {}
        return r;
      };
      window.weaponSfx._vgaiProfile = true;
    }

    if (typeof window.reloadFx === 'function' && !window.reloadFx._vgaiProfile) {
      var _rfx = window.reloadFx;
      window.reloadFx = function () {
        var r = _rfx.apply(this, arguments);
        try {
          playReloadProfile(typeof P !== 'undefined' && P ? P.cur : 'rifle');
        } catch (_) {}
        return r;
      };
      window.reloadFx._vgaiProfile = true;
    }
  }

  // ---------------- SISTEMA REUTILIZABLE DE PERFILES SONOROS ----------------
  var RATE_MAP = Object.create(null);

  function canRateLimit(key, ms) {
    var now = performance.now();
    if (window.CORE_VGAI && typeof window.CORE_VGAI.canTriggerRateLimited === 'function') {
      return window.CORE_VGAI.canTriggerRateLimited(RATE_MAP, key, now, ms || 80);
    }
    if (now - (RATE_MAP[key] || 0) < (ms || 80)) return false;
    RATE_MAP[key] = now;
    return true;
  }

  function computeSpatialGain(x, z, maxDist) {
    if (x === undefined || z === undefined || typeof cam === 'undefined' || !cam) return { gain: 1, pan: 0 };
    if (window.CORE_VGAI && typeof window.CORE_VGAI.computeAudioSpatial === 'function') {
      return window.CORE_VGAI.computeAudioSpatial(
        x,
        z,
        cam.position.x,
        cam.position.z,
        maxDist || 120,
        false,
        typeof yaw !== 'undefined' ? yaw : 0
      );
    }
    var d = Math.hypot(x - cam.position.x, z - cam.position.z);
    return { gain: Math.max(0, Math.min(1, 1 - d / (maxDist || 120))), pan: 0 };
  }

  function playSynthLayer(freqStart, freqEnd, dur, type, vol, pan) {
    try {
      if (typeof ac === 'undefined' || !ac || typeof sfxOK === 'function' && !sfxOK()) return false;
      var t = ac.currentTime;
      var osc = ac.createOscillator();
      var g = ac.createGain();
      osc.type = type || 'sawtooth';
      osc.frequency.setValueAtTime(freqStart, t);
      osc.frequency.exponentialRampToValueAtTime(Math.max(24, freqEnd), t + dur);
      g.gain.setValueAtTime(Math.max(0.001, vol), t);
      g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
      if (typeof ac.createStereoPanner === 'function' && pan) {
        var pn = ac.createStereoPanner();
        pn.pan.value = Math.max(-1, Math.min(1, pan));
        osc.connect(g); g.connect(pn); pn.connect(ac.destination);
      } else {
        osc.connect(g); g.connect(ac.destination);
      }
      osc.start(t);
      osc.stop(t + dur + 0.01);
      return true;
    } catch (_) {
      return false;
    }
  }

  function playWeaponProfile(kind, x, z) {
    if (!canRateLimit('wpn_' + kind, kind === 'smg' || kind === 'mg' ? 50 : 75)) return false;
    var sp = computeSpatialGain(x, z, kind === 'atrifle' || kind === 'atgun' || kind === 'cannon' ? 220 : 120);
    if (sp.gain <= 0.02) return false;
    var g = sp.gain;
    if (kind === 'atrifle') {
      playSynthLayer(240, 48, 0.36, 'sawtooth', 0.14 * g, sp.pan);
      setTimeout(function () { playSynthLayer(880, 320, 0.07, 'square', 0.05 * g, sp.pan); }, 18);
      return true;
    }
    if (kind === 'atgun' || kind === 'cannon') {
      playEvent('tank_cannon_fire', { x: x, z: z, vol: 0.75 * g, maxDist: 220, cooldownMs: 140 });
      playSynthLayer(155, 34, 0.42, 'sawtooth', 0.15 * g, sp.pan);
      return true;
    }
    if (kind === 'pistol') {
      playSynthLayer(460, 145, 0.12, 'triangle', 0.08 * g, sp.pan);
      return true;
    }
    if (kind === 'mg') {
      playSynthLayer(210, 85, 0.075, 'sawtooth', 0.055 * g, sp.pan);
      return true;
    }
    if (kind === 'rifle') {
      playSynthLayer(280, 95, 0.14, 'sawtooth', 0.07 * g, sp.pan);
      return true;
    }
    if (kind === 'smg') {
      playSynthLayer(320, 140, 0.06, 'square', 0.045 * g, sp.pan);
      return true;
    }
    return false;
  }

  function playReloadProfile(kind) {
    if (!canRateLimit('rld_' + kind, 250)) return false;
    if (kind === 'atrifle') {
      playSynthLayer(420, 680, 0.08, 'square', 0.045, 0);
      setTimeout(function () { playSynthLayer(540, 260, 0.11, 'triangle', 0.05, 0); }, 280);
      return true;
    }
    if (kind === 'revolver' || kind === 'pistol') {
      playSynthLayer(640, 480, 0.06, 'square', 0.035, 0);
      setTimeout(function () { playSynthLayer(760, 920, 0.06, 'triangle', 0.035, 0); }, 220);
      return true;
    }
    playSynthLayer(500, 320, 0.07, 'square', 0.035, 0);
    return true;
  }

  function playImpactProfile(surface, x, z) {
    if (!canRateLimit('imp_' + surface, 65)) return false;
    var sp = computeSpatialGain(x, z, 95);
    if (sp.gain <= 0.03) return false;
    if (surface === 'armor_ricochet') {
      playSynthLayer(1750, 920, 0.16, 'sine', 0.06 * sp.gain, sp.pan);
      return true;
    }
    if (surface === 'armor_pen') {
      playSynthLayer(280, 62, 0.22, 'sawtooth', 0.10 * sp.gain, sp.pan);
      return true;
    }
    if (surface === 'metal') {
      playSynthLayer(1150, 480, 0.09, 'triangle', 0.045 * sp.gain, sp.pan);
      return true;
    }
    if (surface === 'wood') {
      playSynthLayer(360, 140, 0.07, 'triangle', 0.04 * sp.gain, sp.pan);
      return true;
    }
    playSynthLayer(220, 90, 0.06, 'sine', 0.035 * sp.gain, sp.pan);
    return true;
  }

  function unlockAndPreload() {
    try {
      if (typeof sndOK === 'function') sndOK();
    } catch (_) {}
    loadManifest().then(preloadPriority);
  }

  ['pointerdown', 'touchstart', 'keydown'].forEach(function (ev) {
    window.addEventListener(ev, unlockAndPreload, { once: true, passive: true });
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      loadManifest();
      installGameplayHooks();
    });
  } else {
    loadManifest();
    installGameplayHooks();
  }

  var api = {
    version: 'V.GAI.1.0',
    state: state,
    loadManifest: loadManifest,
    playEvent: playEvent,
    playDoor: playDoor,
    playWeaponProfile: playWeaponProfile,
    playReloadProfile: playReloadProfile,
    playImpactProfile: playImpactProfile,
    playTankShot: function (x, z) { return playEvent('tank_cannon_fire', { x: x, z: z, vol: 0.85, maxDist: 160, cooldownMs: 220 }); },
    playAircraftFlyby: function (x, z) { return playEvent(['aircraft_flyby', 'aircraft_engine'], { x: x, z: z, vol: 0.65, maxDist: 280, cooldownMs: 6500 }); },
    shout: contextualCombatShout,
    getClip: function (idOrEvent) { return pickClip(idOrEvent); },
    getStats: function () { return Object.assign({}, state.stats, { decoded: Object.keys(state.buffers).length, totalManifest: state.manifest ? state.manifest.clips.length : 0 }); }
  };

  window.AUDIO_VGAI = api;
  window.AETH.vgai.audio = api;
})();
