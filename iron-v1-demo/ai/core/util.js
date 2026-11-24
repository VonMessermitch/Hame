/* =========================================================================
   IRON V1 · AETHRION COGNITIVE ENGINE
   ai/core/util.js — utilidades comunes, RNG determinista y depuración.
   Sin dependencias. Compatible con navegador (script clásico) y Node.
   ========================================================================= */
(function (g) {
  'use strict';
  const AETH = (g.AETH = g.AETH || {});
  AETH.version = '1.0.0';
  AETH.engineName = 'IRON V1 · Motor Cognitivo de Aethrion';

  const U = (AETH.util = {});

  U.clamp = function (v, lo, hi) {
    v = +v;
    if (!isFinite(v)) return lo;
    return v < lo ? lo : v > hi ? hi : v;
  };
  U.lerp = (a, b, t) => a + (b - a) * t;
  U.invLerp = (a, b, v) => (a === b ? 0 : U.clamp((v - a) / (b - a), 0, 1));
  U.remap = (v, a, b, c, d) => U.lerp(c, d, U.invLerp(a, b, v));
  U.round = (v, d) => {
    const m = Math.pow(10, d === undefined ? 2 : d);
    return Math.round(v * m) / m;
  };
  U.sum = (a) => a.reduce((x, y) => x + y, 0);
  U.avg = (a) => (a.length ? U.sum(a) / a.length : 0);
  U.maxBy = (arr, fn) => {
    let best = null,
      bv = -Infinity;
    for (const it of arr) {
      const v = fn(it);
      if (v > bv) {
        bv = v;
        best = it;
      }
    }
    return best;
  };
  U.finite = (v, fallback) => (typeof v === 'number' && isFinite(v) ? v : fallback || 0);
  U.dist = (a, b) => Math.hypot((a.x || 0) - (b.x || 0), (a.z || 0) - (b.z || 0));
  U.dist2 = (a, b) => {
    const dx = (a.x || 0) - (b.x || 0),
      dz = (a.z || 0) - (b.z || 0);
    return dx * dx + dz * dz;
  };
  U.azimuth = (a, b) => Math.atan2((b.x || 0) - (a.x || 0), (b.z || 0) - (a.z || 0));
  U.angleDiff = (a, b) => {
    let d = a - b;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    return Math.abs(d);
  };
  U.smoothstep = (t) => {
    t = U.clamp(t, 0, 1);
    return t * t * (3 - 2 * t);
  };

  U.deepMerge = function deepMerge(base, over) {
    if (!over || typeof over !== 'object') return base;
    for (const k of Object.keys(over)) {
      if (over[k] && typeof over[k] === 'object' && !Array.isArray(over[k]) && base[k] && typeof base[k] === 'object') {
        deepMerge(base[k], over[k]);
      } else base[k] = over[k];
    }
    return base;
  };
  U.clone = function (v) {
    if (v === undefined || v === null) return v;
    return JSON.parse(JSON.stringify(v));
  };

  /* ---------- RNG determinista (xorshift32 + Box-Muller) ---------- */
  class RNG {
    constructor(seed) {
      let s = seed >>> 0;
      if (!s) s = 0x2f6e2b1;
      this.s = s >>> 0;
      this._spare = null;
    }
    next() {
      let x = this.s;
      x ^= x << 13;
      x >>>= 0;
      x ^= x >>> 17;
      x ^= x << 5;
      x >>>= 0;
      this.s = x || 0x2f6e2b1;
      return this.s / 4294967296;
    }
    range(a, b) {
      return a + (b - a) * this.next();
    }
    int(a, b) {
      return Math.floor(this.range(a, b + 0.999999));
    }
    chance(p) {
      return this.next() < p;
    }
    pick(arr) {
      return arr.length ? arr[Math.floor(this.next() * arr.length) % arr.length] : undefined;
    }
    shuffle(arr) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(this.next() * (i + 1));
        const t = arr[i];
        arr[i] = arr[j];
        arr[j] = t;
      }
      return arr;
    }
    gauss(mean, sd) {
      if (this._spare !== null) {
        const v = this._spare;
        this._spare = null;
        return mean + v * sd;
      }
      let u = 0,
        v = 0,
        s = 0;
      do {
        u = this.next() * 2 - 1;
        v = this.next() * 2 - 1;
        s = u * u + v * v;
      } while (s >= 1 || s === 0);
      const m = Math.sqrt((-2 * Math.log(s)) / s);
      this._spare = v * m;
      return mean + u * m * sd;
    }
    weighted(items, weightOf) {
      let total = 0;
      for (const it of items) total += Math.max(0, weightOf(it));
      if (total <= 0) return U.pick(this, items);
      let r = this.next() * total;
      for (const it of items) {
        r -= Math.max(0, weightOf(it));
        if (r <= 0) return it;
      }
      return items[items.length - 1];
    }
    fork(tag) {
      return new RNG((this.s ^ U.hashString(String(tag || ''))) >>> 0);
    }
  }
  U.RNG = RNG;

  let _uid = 0;
  U.hashString = function (str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  };
  U.uid = function (prefix, rng) {
    _uid++;
    const r = rng ? Math.floor(rng.next() * 0xffffff).toString(36) : Math.floor(Math.random() * 0xffffff).toString(36);
    return (prefix || 'id') + '_' + _uid.toString(36) + r;
  };
  U.now = () => (typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now());

  /* ---------- Registro de depuración (para el inspector) ---------- */
  const debug = (AETH.debug = AETH.debug || {});
  debug.events = debug.events || [];
  debug.max = 500;
  debug.enabled = true;
  debug.log = function (channel, message, data) {
    if (!debug.enabled) return;
    debug.events.push({ t: Date.now(), channel: channel, message: message, data: data });
    if (debug.events.length > debug.max) debug.events.splice(0, debug.events.length - debug.max);
  };
  debug.clear = function () {
    debug.events.length = 0;
  };

  /* ---------- Saneado de estado serializado ---------- */
  // Sustituye NaN/Infinity, elimina funciones y corta referencias circulares.
  U.sanitize = function sanitize(value, seen, depth) {
    seen = seen || new WeakSet();
    depth = depth || 0;
    if (depth > 24) return null;
    if (typeof value === 'number') return isFinite(value) ? value : 0;
    if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
    if (typeof value === 'function' || typeof value === 'undefined') return undefined;
    if (typeof value === 'object') {
      if (seen.has(value)) return undefined;
      seen.add(value);
      if (Array.isArray(value)) {
        const out = [];
        for (const v of value) {
          const s = sanitize(v, seen, depth + 1);
          if (s !== undefined) out.push(s);
        }
        return out;
      }
      const out = {};
      for (const k of Object.keys(value)) {
        const s = sanitize(value[k], seen, depth + 1);
        if (s !== undefined) out[k] = s;
      }
      return out;
    }
    return undefined;
  };

  U.fmtHour = function (h) {
    const hh = Math.floor(U.clamp(h, 0, 24.999));
    const mm = Math.floor((h - hh) * 60);
    return String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
  };
})(typeof window !== 'undefined' ? window : globalThis);
