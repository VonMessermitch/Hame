/* =========================================================================
   ai/cognition/memory.js — memoria sensorial, de trabajo, episódica,
   semántica y procedimental. Nada es omnisciente: hay olvido y distorsión.
   ========================================================================= */
(function (g) {
  'use strict';
  const AETH = g.AETH;
  const U = AETH.util;

  const M = (AETH.memory = {});

  const STOP = new Set(['de', 'la', 'el', 'los', 'las', 'un', 'una', 'y', 'en', 'por', 'para', 'con', 'del', 'al', 'que', 'se', 'su', 'sus', 'lo']);

  M.tokenize = function (text) {
    return String(text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9ñ\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP.has(w));
  };

  M.overlap = function (a, b) {
    if (!a.length || !b.length) return 0;
    const setB = new Set(b);
    let hit = 0;
    for (const w of a) if (setB.has(w)) hit++;
    return hit / Math.sqrt(a.length * b.length);
  };

  M.DECAY = {
    episodicPerDay: 0.004,
    lowImportanceForget: 0.35
  };

  class Memory {
    constructor(rng, phenotype, ethos) {
      this.rng = rng;
      this.ethos = ethos || []; // valores culturales que enfatizan ciertos recuerdos
      this.sensory = [];
      this.sensoryCap = 12;
      this.working = [];
      this.workingSlots = phenotype.cognition.workingMemorySlots;
      this.episodic = [];
      this.episodicCap = Math.max(40, phenotype.cognition.memoryCapacity);
      this.semantic = {}; // topic -> {content, confidence, source, updated, dissonance}
      this.procedural = {}; // skill -> {level, practiceHours, lastUse, confidence, failureStreak}
      this.places = {}; // placeId -> {name, familiarity, safety, lastVisit, routes:{}}
      this.people = {}; // personId -> {name, familiarity, trust, affinity, fear, lastSeen, notes}
      this.bias = { positivity: 0.5, threatSalience: 0.5 };
      this.stats = { encoded: 0, forgotten: 0, recalled: 0 };
    }

    /* ---------- Memoria sensorial y de trabajo ---------- */
    pushSensory(percept, clock) {
      this.sensory.push({
        kind: percept.kind,
        id: percept.id,
        summary: percept.summary || percept.kind,
        confidence: percept.confidence || 0.5,
        x: percept.x,
        z: percept.z,
        t: clock
      });
      if (this.sensory.length > this.sensoryCap) this.sensory.shift();
    }

    setWorking(items) {
      this.working = items.slice(0, this.workingSlots).map((it) => ({
        ref: it.id || it.ref || null,
        kind: it.kind,
        summary: it.summary || (it.name || ''),
        salience: U.round(it.salience || 0, 3),
        t: it.t
      }));
    }

    /* ---------- Memoria episódica ---------- */
    encodeEpisode(ev) {
      const mem = {
        id: U.uid('mem'),
        summary: ev.summary,
        tags: M.tokenize(ev.summary + ' ' + (ev.tags || []).join(' ')),
        kind: ev.kind || 'general',
        location: ev.location || null,
        participants: ev.participants || [],
        time: ev.time === undefined ? 0 : ev.time,
        day: ev.day === undefined ? 0 : ev.day,
        source: ev.source || 'experiencia_propia', // experiencia_propia | relato | rumor | inferencia
        confidence: U.clamp(ev.confidence === undefined ? 0.85 : ev.confidence, 0.05, 1),
        importance: U.clamp(ev.importance === undefined ? 0.4 : ev.importance, 0.02, 1),
        valence: U.clamp(ev.valence === undefined ? 0 : ev.valence, -1, 1),
        intensity: U.clamp(ev.intensity === undefined ? 0.4 : ev.intensity, 0, 1),
        access: 1,
        distortions: 0,
        rehearsals: 0
      };
      // Repetición: si ya hay un recuerdo casi idéntico, se refuerza en vez de duplicar.
      const dup = this.episodic.find(
        (e) => e.kind === mem.kind && e.location === mem.location && e.day === mem.day && M.overlap(e.tags, mem.tags) > 0.75
      );
      if (dup) {
        dup.rehearsals++;
        dup.importance = U.clamp(dup.importance + 0.08, 0, 1);
        dup.confidence = U.clamp(dup.confidence + 0.03, 0, 1);
        dup.access = 1;
        return dup;
      }
      this.episodic.push(mem);
      this.stats.encoded++;
      if (this.episodic.length > this.episodicCap) this._forgetOne();
      return mem;
    }

    /* Recuperación por pistas: similitud + importancia + recencia + emoción. */
    recall(query, limit) {
      const tokens = M.tokenize(query);
      const now = this.clockNow || 0;
      const scored = [];
      for (const e of this.episodic) {
        const sim = tokens.length ? M.overlap(tokens, e.tags) : 0.1;
        const recency = 1 / (1 + Math.abs(now - e.time) / 259200); // escala de días
        const emotion = Math.abs(e.valence) * 0.4 + e.intensity * 0.25;
        const score = sim * 1.6 + e.importance * 0.8 + recency * 0.5 + emotion * 0.4 + e.confidence * 0.2;
        if (sim > 0.04 || e.importance > 0.65) scored.push({ e: e, score: score });
      }
      scored.sort((a, b) => b.score - a.score);
      this.stats.recalled++;
      const out = scored.slice(0, limit || 5).map((s) => {
        s.e.access = Math.min(1, s.e.access + 0.15);
        return s.e;
      });
      // El acto de recordar refuerza (y puede distorsionar levemente).
      for (const e of out) {
        if (this.rng.chance(0.04 * (1 - e.importance))) this._distort(e);
      }
      return out;
    }

    recallPlace(placeId) {
      return this.places[placeId] || null;
    }

    knowPlace(placeId) {
      return !!this.places[placeId];
    }

    learnPlace(placeId, name, info) {
      const p = this.places[placeId] || { name: name, familiarity: 0, safety: 0.5, lastVisit: null, routes: {}, features: [] };
      p.familiarity = U.clamp(p.familiarity + (info && info.visits ? 0.12 * info.visits : 0.15), 0, 1);
      p.lastVisit = info && info.time !== undefined ? info.time : p.lastVisit;
      if (info && info.safety !== undefined) p.safety = U.lerp(p.safety, info.safety, 0.3);
      if (info && info.feature && p.features.indexOf(info.feature) < 0) p.features.push(info.feature);
      this.places[placeId] = p;
      return p;
    }

    learnRoute(fromId, toId, minutes, danger) {
      const p = this.places[fromId];
      if (!p) return;
      const prev = p.routes[toId];
      p.routes[toId] = {
        minutes: minutes,
        danger: danger === undefined ? (prev ? prev.danger : 0.2) : danger,
        confidence: prev ? U.clamp(prev.confidence + 0.2, 0, 1) : 0.5
      };
    }

    /* ---------- Semántica ---------- */
    addFact(topic, content, confidence, source) {
      const key = String(topic).toLowerCase();
      const existing = this.semantic[key];
      if (existing) {
        // Una creencia previa puede resistirse: no se sustituye automáticamente.
        const weight = U.clamp(confidence, 0.05, 1);
        const resistance = U.clamp(1 - existing.confidence * 0.55, 0.25, 1);
        const blended = existing.confidence * (1 - weight * resistance) + confidence * weight * resistance;
        existing.content = confidence > existing.confidence + 0.25 ? content : existing.content;
        existing.confidence = U.clamp(blended, 0.05, 1);
        existing.source = existing.source + '|' + (source || 'observacion');
        existing.updated = this.clockNow || 0;
        return existing;
      }
      this.semantic[key] = {
        topic: topic,
        content: content,
        confidence: U.clamp(confidence, 0.05, 1),
        source: source || 'observacion',
        updated: this.clockNow || 0,
        rehearsals: 0
      };
      return this.semantic[key];
    }
    getFact(topic) {
      return this.semantic[String(topic).toLowerCase()] || null;
    }
    knows(topic, minConfidence) {
      const f = this.getFact(topic);
      return !!f && f.confidence >= (minConfidence || 0.4);
    }

    setBelief(topic, content, confidence, source) {
      return this.addFact(topic, content, confidence, source || 'creenza');
    }

    /* ---------- Procedimental ---------- */
    ensureSkill(id, base) {
      if (!this.procedural[id]) {
        this.procedural[id] = {
          id: id,
          level: U.clamp(base === undefined ? 0.05 : base, 0.01, 1),
          practiceHours: 0,
          lastUse: null,
          failureStreak: 0
        };
      }
      return this.procedural[id];
    }
    skill(id) {
      const s = this.procedural[id];
      return s ? s.level : 0;
    }
    practiceSkill(id, quality, hours, rate) {
      const s = this.ensureSkill(id, 0.04);
      const gain = U.clamp(quality, 0, 1) * hours * 0.035 * (rate || 1) * (1 - s.level) * 1.6;
      s.level = U.clamp(s.level + gain, 0.01, 1);
      s.practiceHours += hours;
      s.lastUse = this.clockNow || 0;
      return s.level;
    }
    failSkill(id) {
      const s = this.ensureSkill(id);
      s.failureStreak++;
      if (s.failureStreak > 2) {
        s.level = U.clamp(s.level - 0.01, 0.01, 1);
        s.failureStreak = 0;
      }
    }

    /* ---------- Personas ---------- */
    meetPerson(personId, name, info) {
      const p = this.people[personId] || { name: name, familiarity: 0, trust: 0.2, affinity: 0, fear: 0, lastSeen: null, notes: [] };
      p.familiarity = U.clamp(p.familiarity + 0.15, 0, 1);
      if (info && info.trustDelta) p.trust = U.clamp(p.trust + info.trustDelta, -1, 1);
      if (info && info.affinityDelta) p.affinity = U.clamp(p.affinity + info.affinityDelta, -1, 1);
      if (info && info.fearDelta) p.fear = U.clamp(p.fear + info.fearDelta, 0, 1);
      p.lastSeen = this.clockNow || 0;
      this.people[personId] = p;
      return p;
    }

    /* ---------- Actualización y sueño ---------- */
    update(dtDays, personality) {
      const retention = 0.4 + 0.6 * (personality ? personality.get('discipline') : 0.5);
      for (const e of this.episodic) {
        const decay = M.DECAY.episodicPerDay * dtDays * (1 - e.importance * 0.75) / retention;
        e.confidence = U.clamp(e.confidence - decay, 0.03, 1);
        e.access = U.clamp(e.access - decay * 0.6, 0.02, 1);
        if (this.ethos.indexOf(e.kind) >= 0) e.access = U.clamp(e.access + 0.01, 0, 1);
        if (e.confidence < 0.12 && e.importance < 0.5 && this.rng.chance(0.02 * dtDays * 24)) e.confidence = 0;
      }
      this.episodic = this.episodic.filter((e) => e.confidence > 0.04);
      for (const k of Object.keys(this.semantic)) {
        const f = this.semantic[k];
        if (!f) continue;
        f.confidence = U.clamp(f.confidence - 0.0006 * dtDays * (f.source.indexOf('rumor') >= 0 ? 4 : 1), 0.03, 1);
        if (f.confidence < 0.05) delete this.semantic[k];
      }
      for (const k of Object.keys(this.procedural)) {
        const s = this.procedural[k];
        s.level = Math.max(0.01, s.level - 0.00035 * dtDays * (1 - s.level));
      }
      for (const k of Object.keys(this.people)) {
        const p = this.people[k];
        p.familiarity = Math.max(0, p.familiarity - 0.0008 * dtDays);
        if (p.familiarity < 0.02) delete this.people[k];
      }
    }

    /* Consolidación durante el sueño: refuerza lo importante, desecha ruido. */
    consolidate(qualityHours) {
      const q = U.clamp(qualityHours / 8, 0, 1.4);
      for (const e of this.episodic) {
        if (e.importance > 0.45 && e.confidence > 0.15) {
          e.confidence = U.clamp(e.confidence + 0.02 * q, 0, 1);
          e.access = U.clamp(e.access + 0.05 * q, 0, 1);
        } else if (e.importance < 0.2 && this.rng.chance(0.3 * q)) {
          e.confidence = U.clamp(e.confidence - 0.15 * q, 0, 1);
        }
      }
      for (const k of Object.keys(this.procedural)) {
        this.procedural[k].level = U.clamp(this.procedural[k].level + 0.002 * q, 0, 1);
      }
      this.episodic = this.episodic.filter((e) => e.confidence > 0.06);
      return { consolidated: this.episodic.length, quality: U.round(q, 2) };
    }

    _distort(e) {
      e.distortions++;
      e.confidence = U.clamp(e.confidence - 0.06, 0.03, 1);
      const swaps = [
        ['noche', 'tarde'],
        ['tren', 'camión'],
        ['soldado', 'oficial'],
        ['disparo', 'grito'],
        ['mercado', 'plaza'],
        ['invierno', 'otoño']
      ];
      const pair = this.rng.pick(swaps);
      const idx = e.tags.indexOf(pair[0]);
      if (idx >= 0) {
        e.tags[idx] = pair[1];
        e.summary = e.summary + ' (recuerdo impreciso)';
      }
    }

    _forgetOne() {
      let worst = null,
        wv = Infinity;
      for (const e of this.episodic) {
        const v = e.importance * 1.4 + e.confidence * 0.6 + Math.abs(e.valence) * 0.3;
        if (v < wv) {
          wv = v;
          worst = e;
        }
      }
      if (worst) {
        this.episodic.splice(this.episodic.indexOf(worst), 1);
        this.stats.forgotten++;
      }
    }

    summary() {
      return {
        episodios: this.episodic.length,
        hechos: Object.keys(this.semantic).length,
        habilidades: Object.keys(this.procedural).length,
        lugares: Object.keys(this.places).length,
        personas: Object.keys(this.people).length,
        codificados: this.stats.encoded,
        olvidados: this.stats.forgotten
      };
    }

    toJSON() {
      return U.sanitize({
        sensory: this.sensory,
        working: this.working,
        episodic: this.episodic,
        semantic: this.semantic,
        procedural: this.procedural,
        places: this.places,
        people: this.people,
        stats: this.stats,
        clockNow: this.clockNow
      });
    }

    load(data) {
      if (!data) return;
      const keys = ['sensory', 'working', 'episodic', 'semantic', 'procedural', 'places', 'people', 'stats'];
      for (const k of keys) if (data[k]) this[k] = data[k];
      this.clockNow = data.clockNow || 0;
      this.episodic = (this.episodic || []).map((e) => {
        if (!e.tags) e.tags = M.tokenize(e.summary || '');
        return e;
      });
    }
  }

  M.Memory = Memory;
})(typeof window !== 'undefined' ? window : globalThis);
