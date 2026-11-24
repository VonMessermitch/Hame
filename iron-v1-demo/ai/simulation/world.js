/* =========================================================================
   ai/simulation/world.js — modelo del mundo, reloj de Aethrion, planificador
   de CPU por LOD, ejecución autónoma de acciones y acontecimientos.
   Sin dependencias del motor gráfico.
   ========================================================================= */
(function (g) {
  'use strict';
  const AETH = g.AETH;
  const U = AETH.util;
  const AST = AETH.astronomy;
  const CL = AETH.climate;

  const W = (AETH.world = {});

  class Clock {
    constructor(day, hour) {
      this.day = day === undefined ? 1 : day;
      this.hour = hour === undefined ? 7 : hour;
      this.timeSeconds = 0;
      this.totalHours = 0;
    }
    advance(seconds) {
      this.timeSeconds += seconds;
      this.totalHours += seconds / 3600;
      this.hour += seconds / 3600;
      while (this.hour >= AST.DAY_HOURS) {
        this.hour -= AST.DAY_HOURS;
        this.day++;
      }
      while (this.hour < 0) {
        this.hour += AST.DAY_HOURS;
        this.day--;
      }
    }
    get phaseOfDay() {
      return AST.phaseOfDay(this.hour);
    }
    get season() {
      return AST.season(this.day).id;
    }
    get seasonLabel() {
      return AST.season(this.day).label;
    }
    get label() {
      return AST.dateLabel(this.day, this.hour);
    }
    toJSON() {
      return { day: this.day, hour: this.hour, timeSeconds: this.timeSeconds, totalHours: this.totalHours };
    }
    load(d) {
      if (!d) return;
      this.day = d.day || 1;
      this.hour = d.hour || 0;
      this.timeSeconds = d.timeSeconds || 0;
      this.totalHours = d.totalHours || 0;
    }
  }
  W.Clock = Clock;

  /* ------------------------------- MUNDO ------------------------------- */
  class World {
    constructor(opts) {
      opts = opts || {};
      this.clock = new Clock(opts.day || 1, opts.hour === undefined ? 7 : opts.hour);
      this.seed = opts.seed || 12345;
      this.rng = new U.RNG(this.seed);
      this.locations = [];
      this.brains = [];
      this.byId = {};
      this.sounds = [];
      this.scents = [];
      this.arcane = [];
      this.events = [];
      this.alertLevel = 0;
      this.combatMode = false;
      this.timeScale = opts.timeScale || 300; // segundos simulados por segundo real
      this.realDt = 0;
      this.focus = { x: 0, z: 0 };
      this.lodCounts = { 1: 0, 2: 0, 3: 0 };
      this.stats = { updates: 0, regional: 0, abstract: 0, actions: 0, social: 0 };
      this.budgetMs = opts.budgetMs || 4.5;
      this.regionalCursor = 0;
      this.abstractCursor = 0;
      this.speedLabel = 'x300';
      this.arcaneNoise = 0.05;
      this.deaths = [];
      this.dialogueFeed = [];
      this.lastLodMs = 0;
    }

    addLocation(loc) {
      const l = Object.assign(
        { id: U.uid('loc'), name: 'lugar', type: 'plaza', biome: 'serevan', x: 0, z: 0, radius: 8, noise: 0.1, indoor: false, capacity: 8 },
        loc
      );
      this.locations.push(l);
      return l;
    }

    locationById(id) {
      return this.locations.find((l) => l.id === id) || null;
    }
    hasPlaceOfType(types) {
      if (!types || !types.length) return true;
      return this.locations.some((l) => types.indexOf(l.type) >= 0);
    }

    placeAt(pos) {
      let best = null,
        bd = Infinity;
      for (const l of this.locations) {
        const d = Math.hypot(l.x - pos.x, l.z - pos.z);
        if (d < l.radius && d < bd) {
          bd = d;
          best = l;
        }
      }
      return best || this.locations[0] || { id: 'plaza', name: 'plaza', type: 'plaza', biome: 'serevan', x: 0, z: 0, radius: 10 };
    }

    environmentAt(pos) {
      const place = this.placeAt(pos);
      return CL.environmentAt(place, this.clock.day, this.clock.hour, { arcaneNoise: this.arcaneNoise });
    }

    register(brain) {
      if (!brain || this.byId[brain.id]) return brain;
      this.brains.push(brain);
      this.byId[brain.id] = brain;
      if (!brain.location || !brain.location.id) brain.location = this.placeAt(brain.position);
      return brain;
    }

    spawn(spec, opts) {
      const brain = spec && spec.description
        ? AETH.NPCFactory.createFromDescription(spec.description, Object.assign({ rng: this.rng, lod: 1 }, opts || {}))
        : AETH.NPCFactory.create(spec, Object.assign({ rng: this.rng, lod: 1 }, opts || {}));
      const loc = brain.spec.spawnLocation ? this.locationById(brain.spec.spawnLocation) : this.locations[Math.floor(this.rng.next() * this.locations.length)];
      if (loc) {
        const a = this.rng.range(0, Math.PI * 2);
        const r = this.rng.range(0, Math.max(1, loc.radius - 1));
        brain.position.x = loc.x + Math.sin(a) * r;
        brain.position.z = loc.z + Math.cos(a) * r;
        brain.location = loc;
        brain.memory.learnPlace(loc.id, loc.name, { visits: 0.4, time: this.clock.timeSeconds, safety: 0.6 });
      }
      brain.clockTime = this.clock.timeSeconds;
      brain.memory.clockNow = this.clock.timeSeconds;
      brain.homeLocation = this.locations.find((l) => l.type === 'casa') || loc;
      this.register(brain);
      return brain;
    }

    remove(brainOrId) {
      const id = typeof brainOrId === 'string' ? brainOrId : brainOrId.id;
      const b = this.byId[id];
      if (!b) return false;
      this.brains = this.brains.filter((x) => x.id !== id);
      delete this.byId[id];
      return true;
    }

    /* --------------------- consultas sensoriales --------------------- */
    entitiesNear(pos, radius) {
      const out = [];
      for (const b of this.brains) {
        if (b.alive === false) continue;
        const d = Math.hypot(b.position.x - pos.x, b.position.z - pos.z);
        if (d > radius) continue;
        const moving = b.motion && b.motion.active;
        out.push({
          id: b.id,
          name: b.identity.name,
          kind: 'humanoid',
          role: b.identity.roleProfile,
          x: b.position.x,
          z: b.position.z,
          vx: moving ? 1 : 0,
          vz: moving ? 1 : 0,
          moving: moving,
          faction: b.identity.faction,
          size: b.phenotype.heightCm > 180 ? 0.72 : 0.6,
          weapon: (b.inventory || []).some((i) => i.tags.indexOf('arma') >= 0),
          blood: b.physiology.state.bloodVolume < 0.8,
          cover: b.inCovers ? 0.8 : 0.1,
          threatening: b.threatLevel > 0.6 && (b.inventory || []).some((i) => i.tags.indexOf('arma') >= 0),
          contrast: b.inCovers ? 0.4 : 0.7
        });
      }
      return out;
    }

    soundsNear(pos, radius) {
      const out = [];
      for (const s of this.sounds) {
        if (s.life <= 0) continue;
        const d = Math.hypot(s.x - pos.x, s.z - pos.z);
        if (d <= radius && d <= s.range) out.push(s);
      }
      return out;
    }
    scentsNear(pos, radius) {
      return this.scents.filter((s) => Math.hypot(s.x - pos.x, s.z - pos.z) <= radius);
    }
    arcaneNear(pos, radius) {
      return this.arcane.filter((a) => Math.hypot(a.x - pos.x, a.z - pos.z) <= radius);
    }
    occlusionBetween(a, b) {
      // Edificios grandes entre dos puntos del pueblo: oclusión aproximada.
      let occ = 0;
      for (const l of this.locations) {
        if (!l.indoor) continue;
        const d = Math.hypot(l.x - (a.x + b.x) / 2, l.z - (a.z + b.z) / 2);
        if (d < l.radius * 0.8) occ = Math.max(occ, 0.35);
      }
      return occ;
    }

    emitSound(snd) {
      this.sounds.push(Object.assign({ id: U.uid('snd'), life: 3, range: 120, loudness: 0.5, kind: 'ruido', known: false }, snd));
      if (this.sounds.length > 40) this.sounds.shift();
      return snd;
    }
    emitScent(scent) {
      this.scents.push(Object.assign({ id: U.uid('sct'), persistence: 0.5 }, scent));
      if (this.scents.length > 25) this.scents.shift();
    }
    emitArcane(em) {
      this.arcane.push(Object.assign({ id: U.uid('arc'), intensity: 0.5, coherence: 0.5, known: false }, em));
      if (this.arcane.length > 10) this.arcane.shift();
    }

    /* --------------------- bucle principal --------------------- */
    update(dtReal, focus) {
      if (!(dtReal > 0)) return;
      if (focus) this.focus = focus;
      this.realDt = dtReal;
      const dtSim = dtReal * this.timeScale;
      this.clock.advance(dtSim);
      this.alertLevel = U.clamp(this.alertLevel - dtReal * 0.01, 0, 1);
      for (const s of this.sounds) s.life -= dtReal;
      for (const b of this.brains) {
        b.clockTime = this.clock.timeSeconds;
        b.memory.clockNow = this.clock.timeSeconds;
      }

      this.updateLOD(dtReal, dtSim);
      this.updateTasks(dtReal, dtSim);
      this.updateSensory(dtReal);
      this.stats.updates++;
    }

    updateLOD(dtReal, dtSim) {
      const t0 = U.now();
      const counts = { 1: 0, 2: 0, 3: 0 };
      const near = [];
      for (const b of this.brains) {
        if (b.alive === false) continue;
        const d = Math.hypot(b.position.x - this.focus.x, b.position.z - this.focus.z);
        b._distFocus = d;
        near.push(b);
      }
      near.sort((a, b) => a._distFocus - b._distFocus);
      for (let i = 0; i < near.length; i++) {
        const b = near[i];
        let lod;
        if (i < 10 && b._distFocus < 90) lod = 1;
        else if (b._distFocus < 260 || b.identity.militaryRole) lod = 2;
        else lod = 3;
        b.lod = lod;
        counts[lod]++;
        b._nextTick = b._nextTick || {};
      }
      this.lodCounts = counts;

      // LOD 1: cognición completa (con intervalo interno)
      for (const b of near) {
        if (b.lod === 1) b.tick(dtSim, this);
      }

      // LOD 2: actualización regional por turnos con presupuesto de CPU
      const t1 = U.now();
      let processed = 0;
      while (U.now() - t0 < this.budgetMs && processed < near.length) {
        const b = near[this.regionalCursor % near.length];
        this.regionalCursor++;
        processed++;
        if (!b || b.lod !== 2) continue;
        const nowMs = U.now();
        if (b._nextRegionalAt && nowMs < b._nextRegionalAt) continue;
        b._nextRegionalAt = nowMs + 420 + this.rng.range(0, 260);
        const hours = (dtReal * this.timeScale) / 3600;
        // Actualización regional en pasos de hasta 6 horas simuladas
        b.tickRegional(U.clamp(hours, 0, 6), this);
        this.stats.regional++;
      }

      // LOD 3: simulación estadística en segundo plano
      if (near.length && this.clock.totalHours - (this._lastAbstract || 0) > 0.15) {
        const step = Math.min(6, this.clock.totalHours - (this._lastAbstract || 0));
        this._lastAbstract = this.clock.totalHours;
        let n = 0;
        while (U.now() - t1 < this.budgetMs && n < near.length) {
          const b = near[this.abstractCursor % near.length];
          this.abstractCursor++;
          n++;
          if (!b || b.lod !== 3) continue;
          b.tickAbstract(step / 24, this);
          this.stats.abstract++;
        }
      }
      this.lastLodMs = U.round(U.now() - t0, 2);
    }

    /* Ejecución autónoma: viajar y actuar. */
    updateTasks(dtReal, dtSim) {
      for (const b of this.brains) {
        if (b.alive === false) continue;
        const task = b.task;
        if (!task) {
          // Sin tarea: el cerebro ya decidió; el mundo la materializa.
          if (b.lod <= 2 && b.pendingDecision && b.intent && b.intent.action) {
            const def = b.pendingDecision.actionDef || AETH.goap.BY_ID[b.pendingDecision.action];
            if (def) this.performAction(b, def);
            else b.pendingDecision = null;
          }
          continue;
        }
        if (task.phase === 'travel') {
          const dx = task.target.x - b.position.x;
          const dz = task.target.z - b.position.z;
          const d = Math.hypot(dx, dz);
          // Fuera de cámara el desplazamiento se resuelve de forma abstracta.
          if (b.lod >= 2) {
            b.position.x = task.target.x;
            b.position.z = task.target.z;
            b.location = this.placeAt(b.position);
            task.phase = 'act';
            task.remaining = task.action.durationMin * 60;
            b.beginAction(task.action);
            continue;
          }
          if (d < 0.6) {
            b.position.x = task.target.x;
            b.position.z = task.target.z;
            task.phase = 'act';
            task.remaining = task.action.durationMin * 60;
            b.location = this.placeAt(b.position);
            b.beginAction(task.action);
            continue;
          }
          // A gran velocidad de simulación, desplazarse no puede costar minutos reales.
          const speed = (b.lod === 1 ? 2.4 : 6) * Math.max(1, Math.min(8, this.timeScale / 60));
          const step = Math.min(d, speed * dtReal);
          b.position.x += (dx / d) * step;
          b.position.z += (dz / d) * step;
          b.position.facing = Math.atan2(dx, dz);
          b.motion = { active: true, target: task.target };
          b.stats.distanceWalked += step;
          if (d - step < 0.6) {
            task.phase = 'act';
            task.remaining = task.action.durationMin * 60;
            b.location = this.placeAt(b.position);
            b.beginAction(task.action);
          }
        } else if (task.phase === 'act') {
          const mult = b.lod === 1 ? 1 : 6;
          task.remaining -= dtSim * mult;
          if (task.remaining <= 0) {
            this.completeTask(b);
          }
        }
      }
    }

    /* Avance manual de la simulación (depuración paso a paso). */
    advanceStep(minutes) {
      const sec = (minutes || 1) * 60;
      this.clock.advance(sec);
      for (const b of this.brains) {
        b.clockTime = this.clock.timeSeconds;
        b.memory.clockNow = this.clock.timeSeconds;
        if (b.lod === 1) b.cognitiveCycle(sec, this, this.environmentAt(b.position));
        else b.tickRegional(sec / 3600, this);
      }
      this.updateTasks(1 / 60, sec);
      return this.clock.label;
    }

    updateSensory(dtReal) {
      for (const s of this.sounds) if (Math.abs(s.life) > 1000) s.life = 0;
      this.sounds = this.sounds.filter((s) => s.life > 0);
      this.arcane = this.arcane.filter((a) => a.life === undefined || a.life > 0);
      if (this.arcane.length) for (const a of this.arcane) if (a.life !== undefined) a.life -= dtReal;
    }

    performAction(brain, action) {
      if (!brain || !action) return { ok: false, reason: 'sin acción' };
      if (action.id === 'observar') {
        brain.pendingDecision = null;
        return { ok: true, immediate: true };
      }
      const target = this.pickTargetLocation(brain, action);
      if (!target && action.place && action.place.length) {
        return brain.onActionFailed(action, 'no hay ningún lugar de tipo ' + action.place.join('/') + ' al que ir', this);
      }
      const loc = target || brain.location || this.locations[0];
      brain.task = {
        action: action,
        phase: 'travel',
        target: { x: loc.x + this.rng.range(-loc.radius * 0.35, loc.radius * 0.35), z: loc.z + this.rng.range(-loc.radius * 0.35, loc.radius * 0.35) },
        location: loc,
        startedAt: this.clock.timeSeconds
      };
      brain.location = loc;
      brain.activity = 'yendo a ' + loc.name;
      this.stats.actions++;
      return { ok: true, traveling: true, to: loc.name };
    }

    pickTargetLocation(brain, action) {
      const types = action.place || [];
      let candidates = this.locations.filter((l) => !types.length || types.indexOf(l.type) >= 0);
      if (!candidates.length) return null;
      const known = candidates.filter((l) => brain.memory.knowPlace(l.id));
      if (known.length) candidates = known;
      // Preferir lugares cercanos y conocidos; penalizar el mismo lugar si la acción lo permite.
      let best = null,
        bs = -Infinity;
      for (const l of candidates) {
        const d = Math.hypot(l.x - brain.position.x, l.z - brain.position.z);
        const fam = brain.memory.recallPlace(l.id);
        let s = -d * 0.02 + (fam ? fam.familiarity * 0.8 : 0.1) + this.rng.range(0, 0.3);
        if (brain.location && l.id === brain.location.id) s -= 0.15;
        if (l.type === 'casa' && brain.homeLocation && l.id === brain.homeLocation.id) s += 0.4;
        if (s > bs) {
          bs = s;
          best = l;
        }
      }
      return best;
    }

    completeTask(brain) {
      const task = brain.task;
      if (!task) return;
      brain.task = null;
      brain.motion = { active: false };
      const action = task.action;
      const skillId = this.skillForAction(action, brain);
      const skill = skillId ? brain.memory.skill(skillId) : 0.3;
      const phys = brain.physiology.cognitiveModifiers();
      let quality = U.clamp(0.35 + skill * 0.55 + phys.precision * 0.2 + this.rng.gauss(0, 0.08), 0.1, 1);
      let success = true;
      // Acciones que pueden fallar por capacidad o circunstancia
      if (action.id === 'cazar' && brain.rng.chance(0.25 + (1 - skill) * 0.3)) success = false;
      if (action.id === 'buscar_trabajo' && brain.rng.chance(0.35)) success = false;
      if (action.id === 'disparar' && brain.rng.chance(0.2)) success = false;
      if (action.id === 'saquear' && brain.rng.chance(0.3) && this.alertLevel > 0.3) success = false;
      if (action.id === 'dormir' && brain.rng.chance(0.05)) quality *= 0.5;

      brain.onActionComplete(action, { success: success, quality: quality }, this);
      brain.pendingDecision = null;

      if (action.social && success) this.socialEncounter(brain);

      if (action.id === 'disparar') {
        this.emitSound({ x: brain.position.x, z: brain.position.z, kind: 'disparo', loudness: 0.9, range: 220, known: true, tags: ['militar'] });
        this.alertLevel = U.clamp(this.alertLevel + 0.25, 0, 1);
        const victims = this.entitiesNear(brain.position, 18).filter((e) => e.faction !== brain.identity.faction);
        if (victims.length && brain.rng.chance(0.35)) {
          const target = this.byId[victims[0].id];
          if (target) {
            AETH.anatomy.applyInjury(target.body, { type: 'gunshot', severity: target.rng.range(0.2, 0.8), label: 'herida de bala', bleed: 0.05, healDays: 30 });
            target.emotions.appraise({ type: 'dolor', intensity: 0.8, time: this.clock.timeSeconds });
            target.memory.encodeEpisode({ summary: 'fue alcanzado por un disparo', kind: 'combate', importance: 0.95, valence: -0.9, intensity: 1, time: this.clock.timeSeconds });
            if (target.body.bloodVolume < 0.45) this.kill(target, 'herida de bala');
          }
        }
      }
      if (action.id === 'saquear' && success) this.emitSound({ x: brain.position.x, z: brain.position.z, kind: 'cristales', loudness: 0.5, range: 60, known: false });
      if (action.id === 'orar') this.emitScent({ x: brain.position.x, z: brain.position.z, kind: 'incienso', intensity: 0.4, persistence: 0.6, known: true });
      if (action.id === 'cobrar_salario') this.emitSound({ x: brain.position.x, z: brain.position.z, kind: 'monedas', loudness: 0.2, range: 12, known: true });
      return brain.lastResult;
    }

    skillForAction(action, brain) {
      const map = {
        trabajar: brain.identity.profession,
        practicar: brain.identity.profession,
        cazar: 'rastreo',
        tratar_heridas: 'medicina',
        visitar_medico: 'medicina',
        disparar: 'fusil',
        patrullar: 'disciplina',
        entrenar: 'fusil',
        leer: 'escritura'
      };
      return map[action.id] || null;
    }

    socialEncounter(a, b) {
      if (!b) {
        // Buscar a alguien cercano
        const near = this.entitiesNear(a.position, 45).filter((e) => e.id !== a.id);
        if (near.length) b = this.byId[near[Math.floor(this.rng.next() * near.length)].id];
      }
      if (!b || b === a || b.alive === false) {
        a.emotions.appraise({ type: 'fracaso', intensity: 0.15, time: this.clock.timeSeconds });
        return null;
      }
      const sameFaction = a.identity.faction === b.identity.faction;
      const trustA = a.memory.people[b.id] ? a.memory.people[b.id].trust : 0;
      const trustB = b.memory.people[a.id] ? b.memory.people[a.id].trust : 0;
      const compatibility =
        (a.personality.get('empathy') + b.personality.get('empathy')) * 0.2 +
        (a.personality.get('sociability') + b.personality.get('sociability')) * 0.15 +
        (sameFaction ? 0.3 : -0.15) +
        trustA * 0.2 +
        trustB * 0.2 -
        a.emotions.get('ira') * 0.3;
      const warmth = U.clamp(compatibility, -0.8, 0.9);
      a.memory.meetPerson(b.id, b.identity.name, { trustDelta: warmth * 0.15, affinityDelta: warmth * 0.2 });
      b.memory.meetPerson(a.id, a.identity.name, { trustDelta: warmth * 0.15, affinityDelta: warmth * 0.2 });
      a.emotions.appraise({ type: warmth > 0 ? 'elogio' : 'insulto', intensity: Math.abs(warmth) * 0.5, time: this.clock.timeSeconds });
      b.emotions.appraise({ type: warmth > 0 ? 'elogio' : 'insulto', intensity: Math.abs(warmth) * 0.5, time: this.clock.timeSeconds });
      const line = a.speak({ context: 'conversar' });
      this.dialogueFeed.push({ t: this.clock.label, a: a.identity.name, b: b.identity.name, text: line.text, tone: line.tone, warmth: U.round(warmth, 2) });
      if (this.dialogueFeed.length > 40) this.dialogueFeed.shift();
      a.memory.encodeEpisode({
        summary: 'conversó con ' + b.identity.name + (warmth > 0.2 ? ' y se entendieron' : warmth < -0.2 ? ' y discutieron' : ''),
        kind: 'social',
        participants: [b.id],
        location: a.location ? a.location.id : null,
        importance: 0.25 + Math.abs(warmth) * 0.3,
        valence: warmth,
        intensity: Math.abs(warmth),
        time: this.clock.timeSeconds
      });
      this.stats.social++;
      return { partner: b, warmth: warmth, line: line };
    }

    kill(brain, cause) {
      if (!brain || brain.alive === false) return;
      brain.alive = false;
      brain.activity = 'muerto (' + cause + ')';
      brain.intent = { goal: null, action: 'muerto', reason: cause, target: null };
      this.deaths.push({ id: brain.id, name: brain.identity.name, cause: cause, at: this.clock.label });
      for (const other of this.brains) {
        if (other === brain || other.alive === false) continue;
        const d = Math.hypot(other.position.x - brain.position.x, other.position.z - brain.position.z);
        if (d < 60) {
          const known = other.memory.people[brain.id];
          other.emotions.appraise({ type: 'muerte_conocido', intensity: known ? 0.8 : 0.4, time: this.clock.timeSeconds });
          other.memory.encodeEpisode({
            summary: 'vio morir a ' + brain.identity.name + ' (' + cause + ')',
            kind: 'muerte',
            participants: [brain.id],
            location: this.placeAt(brain.position).id,
            importance: known ? 0.9 : 0.5,
            valence: -1,
            intensity: 0.9,
            time: this.clock.timeSeconds
          });
          if (known && known.familiarity > 0.4) other.memory.encodeEpisode({ summary: 'ha perdido a ' + brain.identity.name, kind: 'perdida', importance: 0.95, valence: -1, intensity: 1, time: this.clock.timeSeconds });
        }
      }
      AETH.debug.log('muerte', brain.identity.name + ' — ' + cause);
      if (this.onDeath) this.onDeath(brain, cause);
    }

    /* --------------------- acontecimientos del mundo --------------------- */
    injectEvent(type, opts) {
      opts = opts || {};
      const ev = { id: U.uid('evt'), type: type, at: this.clock.label, time: this.clock.timeSeconds, label: opts.label || type };
      const applyToNear = (radius, fn) => {
        for (const b of this.brains) {
          if (b.alive === false) continue;
          const d = Math.hypot(b.position.x - this.focus.x, b.position.z - this.focus.z);
          if (d <= radius) fn(b, d);
        }
      };
      switch (type) {
        case 'bombardeo': {
          this.alertLevel = 1;
          ev.label = 'Bombardeo de artillería';
          ev.severity = opts.severity || 0.6;
          for (let i = 0; i < 3; i++) {
            this.emitSound({ x: this.focus.x + this.rng.range(-60, 60), z: this.focus.z + this.rng.range(-60, 60), kind: 'explosion', loudness: 1, range: 400, known: true, tags: ['guerra'] });
          }
          this.emitScent({ x: this.focus.x, z: this.focus.z, kind: 'pólvora', intensity: 0.9, persistence: 0.8, known: true });
          applyToNear(200, (b, d) => {
            b.emotions.appraise({ type: 'amenaza', intensity: U.clamp(1 - d / 220, 0.2, 1), reason: 'bombardeo', time: this.clock.timeSeconds });
            b.memory.encodeEpisode({ summary: 'bombardeo en ' + this.placeAt(b.position).name, kind: 'guerra', location: this.placeAt(b.position).id, importance: 0.85, valence: -0.9, intensity: 0.95, time: this.clock.timeSeconds });
            if (d < 90 && this.rng.chance(0.25 * (opts.severity || 0.6))) {
              AETH.anatomy.applyInjury(b.body, { type: 'shrapnel', severity: this.rng.range(0.2, 0.6), label: 'herida de metralla', bleed: 0.04, healDays: 25 });
              b.pendingPainSpike = 0.4;
            }
          });
          break;
        }
        case 'ataque': {
          this.alertLevel = 1;
          ev.label = 'Ataque armado';
          this.emitSound({ x: this.focus.x, z: this.focus.z, kind: 'disparo', loudness: 0.9, range: 250, known: true });
          this.emitSound({ x: this.focus.x + 10, z: this.focus.z, kind: 'grito', loudness: 0.7, range: 120, known: false });
          applyToNear(120, (b) => {
            b.emotions.appraise({ type: 'amenaza', intensity: 0.9, reason: 'ataque armado', time: this.clock.timeSeconds });
            b.threatLevel = Math.max(b.threatLevel, 0.8);
          });
          break;
        }
        case 'sermon': {
          ev.label = 'Sermón en el templo';
          applyToNear(90, (b) => {
            if (b.emotions.get('tranquilidad') < 0.7) b.emotions.appraise({ type: 'religioso', intensity: 0.6, time: this.clock.timeSeconds });
            b.needs.satisfy('religion', 0.3);
          });
          this.emitSound({ x: this.focus.x, z: this.focus.z, kind: 'campana', loudness: 0.6, range: 150, known: true });
          break;
        }
        case 'feria': {
          ev.label = 'Feria de mercado';
          this.emitSound({ x: this.focus.x, z: this.focus.z, kind: 'voces', loudness: 0.5, range: 80, known: false });
          this.emitScent({ x: this.focus.x, z: this.focus.z, kind: 'comida', intensity: 0.6, persistence: 0.7, known: true });
          applyToNear(120, (b) => {
            b.needs.satisfy('relaciones', 0.15);
            b.needs.satisfy('economia', 0.1);
            b.emotions.appraise({ type: 'elogio', intensity: 0.3, time: this.clock.timeSeconds });
          });
          break;
        }
        case 'accidente': {
          ev.label = 'Accidente laboral';
          const target = opts.target ? this.byId[opts.target] : this.brains.find((b) => b.alive !== false && b.lod === 1);
          if (target) {
            AETH.anatomy.applyInjury(target.body, { type: 'crush', severity: this.rng.range(0.3, 0.7), label: 'pierna atrapada en la máquina', bleed: 0.06, healDays: 40 });
            target.emotions.appraise({ type: 'dolor', intensity: 0.9, time: this.clock.timeSeconds });
            target.pendingPainSpike = 0.6;
            target.memory.encodeEpisode({ summary: 'accidente de trabajo en ' + (target.location ? target.location.name : 'el taller'), kind: 'accidente', importance: 0.8, valence: -0.8, intensity: 0.9, time: this.clock.timeSeconds });
            ev.target = target.identity.name;
          }
          this.emitSound({ x: this.focus.x, z: this.focus.z, kind: 'grito', loudness: 0.6, range: 80, known: false });
          break;
        }
        case 'tren': {
          ev.label = 'El tren de las 6:20 llega a la estación';
          this.emitSound({ x: this.focus.x, z: this.focus.z, kind: 'silbato', loudness: 0.7, range: 200, known: true, tags: ['tren'] });
          this.emitScent({ x: this.focus.x, z: this.focus.z, kind: 'carbón', intensity: 0.35, persistence: 0.5, known: true });
          break;
        }
        case 'rumor': {
          ev.label = 'Rumor: ' + (opts.text || 'cierran la frontera');
          applyToNear(80, (b) => {
            b.memory.addFact('rumor reciente', opts.text || 'cierran la frontera', 0.4, 'rumor');
            b.memory.encodeEpisode({ summary: 'oyó un rumor: ' + (opts.text || 'cierran la frontera'), kind: 'rumor', importance: 0.3, valence: -0.1, intensity: 0.3, confidence: 0.4, time: this.clock.timeSeconds });
          });
          break;
        }
        case 'arcano': {
          ev.label = 'Fenómeno arcano';
          this.arcaneNoise = 0.35;
          this.emitArcane({ x: this.focus.x + this.rng.range(-20, 20), z: this.focus.z + this.rng.range(-20, 20), intensity: this.rng.range(0.5, 1), coherence: 0.7, known: opts.known || false, source: opts.source || 'origen desconocido', life: 90 });
          applyToNear(60, (b) => b.emotions.appraise({ type: 'arcano', intensity: 0.6, time: this.clock.timeSeconds }));
          break;
        }
        case 'muerte': {
          const target = opts.target ? this.byId[opts.target] : this.brains.find((b) => b.alive !== false && b.lod === 1);
          if (target) {
            ev.label = target.identity.name + ' ha muerto';
            this.kill(target, opts.cause || 'enfermedad');
            ev.target = target.identity.name;
          }
          break;
        }
        case 'clima': {
          ev.label = 'Cambio de tiempo: ' + (opts.weather || 'tormenta');
          this.emitSound({ x: this.focus.x, z: this.focus.z, kind: 'trueno', loudness: 0.9, range: 400, known: true });
          break;
        }
        default:
          ev.label = opts.label || type;
      }
      this.events.push(ev);
      if (this.events.length > 30) this.events.shift();
      AETH.debug.log('evento', ev.label);
      return ev;
    }

    /* --------------------- serialización --------------------- */
    save() {
      return U.sanitize({
        version: AETH.version,
        clock: this.clock.toJSON(),
        seed: this.seed,
        locations: this.locations,
        npcs: this.brains.map((b) => b.save()),
        events: this.events.slice(-10),
        dialogueFeed: this.dialogueFeed.slice(-10),
        alertLevel: this.alertLevel
      });
    }

    load(data) {
      if (!data) return this;
      this.clock.load(data.clock);
      if (data.locations) this.locations = data.locations;
      this.brains = [];
      this.byId = {};
      if (data.npcs) {
        for (const d of data.npcs) {
          const b = AETH.NPCFactory.create(d.spec || { id: d.id }, { rng: this.rng });
          b.load(d);
          this.register(b);
        }
      }
      this.events = data.events || [];
      this.dialogueFeed = data.dialogueFeed || [];
      this.alertLevel = data.alertLevel || 0;
      return this;
    }

    populationByFaction() {
      const out = {};
      for (const b of this.brains) {
        if (b.alive === false) continue;
        const k = b.culture.factionLabel;
        out[k] = (out[k] || 0) + 1;
      }
      return out;
    }

    describe() {
      return {
        fecha: this.clock.label,
        estacion: this.clock.seasonLabel,
        poblacion: this.brains.filter((b) => b.alive !== false).length,
        lod: this.lodCounts,
        clima: this.environmentAt(this.focus).weather,
        temperatura: this.environmentAt(this.focus).temperatureC,
        alerta: U.round(this.alertLevel, 2),
        eventos: this.events.slice(-4).reverse()
      };
    }
  }

  W.World = World;

  W.createBorgnonWorld = function (opts) {
    const w = new World(Object.assign({ day: 148, hour: 8.5, seed: 77192, timeScale: 300 }, opts || {}));
    const L = (loc) => w.addLocation(loc);
    L({ id: 'plaza', name: 'Plaza del Hacedor', type: 'plaza', biome: 'serevan', x: 0, z: 0, radius: 12, noise: 0.25 });
    L({ id: 'estacion', name: 'Estación de Borgñon', type: 'estacion', biome: 'serevan', x: 34, z: -6, radius: 11, noise: 0.35 });
    L({ id: 'taller', name: 'Taller ferroviario', type: 'taller', biome: 'serevan', x: 24, z: 14, radius: 9, indoor: true, noise: 0.4 });
    L({ id: 'mercado', name: 'Mercado cubierto', type: 'mercado', biome: 'serevan', x: -18, z: 8, radius: 10, noise: 0.35 });
    L({ id: 'templo', name: 'Templo del Hacedor', type: 'templo', biome: 'serevan', x: -6, z: -22, radius: 9, indoor: true, noise: 0.05 });
    L({ id: 'posada', name: 'Posada del Puente', type: 'posada', biome: 'serevan', x: 14, z: 24, radius: 8, indoor: true, noise: 0.3 });
    L({ id: 'hospital', name: 'Casa de socorro', type: 'hospital', biome: 'serevan', x: -26, z: -12, radius: 8, indoor: true, noise: 0.12 });
    L({ id: 'cuartel', name: 'Cuartel de Volskaya', type: 'cuartel', biome: 'serevan', x: 30, z: 32, radius: 12, noise: 0.3 });
    L({ id: 'escuela', name: 'Escuela de la plaza', type: 'escuela', biome: 'serevan', x: -30, z: 24, radius: 7, indoor: true, noise: 0.15 });
    L({ id: 'campo', name: 'Campos del sur', type: 'campo', biome: 'serevan', x: -4, z: 52, radius: 18, noise: 0.08 });
    L({ id: 'bosque', name: 'Soto del río', type: 'bosque', biome: 'serevan', x: 58, z: 34, radius: 16, noise: 0.05 });
    L({ id: 'casa_konrad', name: 'Casa de los Weiss', type: 'casa', biome: 'serevan', x: 8, z: 18, radius: 6, indoor: true, noise: 0.05 });
    L({ id: 'casa_aldea', name: 'Casas del barrio bajo', type: 'casa', biome: 'serevan', x: -14, z: -6, radius: 8, indoor: true, noise: 0.08 });
    L({ id: 'casa_oficial', name: 'Vivienda del oficial', type: 'casa', biome: 'serevan', x: 22, z: -20, radius: 6, indoor: true, noise: 0.05 });
    L({ id: 'fuente', name: 'Fuente de la plaza', type: 'fuente', biome: 'serevan', x: 3, z: 4, radius: 3, noise: 0.15 });
    return w;
  };
})(typeof window !== 'undefined' ? window : globalThis);
