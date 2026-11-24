/* =========================================================================
   ai/cognition/perception.js — percepción multisensorial y atención contextual.
   ========================================================================= */
(function (g) {
  'use strict';
  const AETH = g.AETH;
  const U = AETH.util;
  const SE = AETH.senses;

  const P = (AETH.perception = {});

  /* Perfiles de atención: qué merece la mirada de cada oficio. */
  P.ATTENTION_PROFILES = {
    centinela: ['arma', 'manos', 'movimiento', 'acceso', 'uniforme', 'vehiculo'],
    fusilero: ['arma', 'movimiento', 'cobertura', 'uniforme', 'humo'],
    oficial: ['posicion', 'comunicacion', 'subordinado', 'arma', 'terreno'],
    medico: ['herido', 'sangre', 'sintoma', 'camilla', 'medicamento'],
    mecanico: ['vibracion', 'motor', 'herramienta', 'ruido_metalico', 'vapor'],
    ferroviario: ['via', 'locomotora', 'aguja', 'senal', 'horario'],
    comerciante: ['mercancia', 'cliente', 'moneda', 'riesgo', 'competencia'],
    cazador: ['huella', 'olor', 'fauna', 'viento', 'rama'],
    campesino: ['clima', 'tierra', 'cosecha', 'animal', 'herramienta'],
    sacerdote: ['feligres', 'ritual', 'simbolo', 'pecado', 'procesion'],
    nino: ['juego', 'adulto', 'curiosidad', 'animal', 'dulce'],
    profesor: ['alumno', 'libro', 'error', 'pregunta'],
    artesano: ['material', 'textura', 'medida', 'herramienta'],
    piloto: ['cielo', 'motor', 'viento', 'aeronave'],
    marinero: ['agua', 'viento', 'nube', 'cuerda'],
    default: ['movimiento', 'persona']
  };

  P.KIND_TAGS = {
    humanoid: ['persona', 'movimiento', 'uniforme'],
    animal: ['fauna', 'movimiento', 'olor'],
    vehicle: ['vehiculo', 'motor', 'ruido_metalico'],
    object: ['objeto'],
    building: ['edificio', 'acceso'],
    anomaly: ['anomalia', 'arcano'],
    blood: ['sangre', 'herido'],
    weapon: ['arma']
  };

  P.visualTags = function (entity) {
    let tags = (P.KIND_TAGS[entity.kind] || P.KIND_TAGS.object).slice();
    if (entity.weapon) tags.push('arma');
    if (entity.blood) tags.push('sangre', 'herido');
    if (entity.moving) tags.push('movimiento');
    if (entity.role && P.ATTENTION_PROFILES[entity.role]) tags = tags.concat(P.ATTENTION_PROFILES[entity.role]);
    return tags;
  };

  class Perception {
    constructor(brain) {
      this.brain = brain;
      this.last = { percepts: [], sounds: [], smells: [], arcane: [], place: null, light: 0.6 };
      this.knownAnomalies = {};
      this.scanCount = 0;
    }

    /* world: AETH.World con snapshot(), environmentAt(), occlusionBetween() */
    scan(world) {
      const b = this.brain;
      const env = world.environmentAt(b.position);
      const organs = b.organs;
      const out = {
        time: world.clock.timeOfDay,
        day: world.clock.day,
        light: env.light,
        weather: env.weather,
        place: world.placeAt(b.position),
        percepts: [],
        sounds: [],
        smells: [],
        arcane: [],
        entitiesSeen: []
      };
      this.scanCount++;

      // Visión
      for (const ent of world.entitiesNear(b.position, 70)) {
        if (ent.id === b.id) continue;
        const target = {
          x: ent.x,
          z: ent.z,
          size: ent.size || 0.6,
          moving: !!(ent.vx || ent.vz || ent.moving),
          contrast: ent.contrast === undefined ? 0.7 : ent.contrast,
          occlusion: world.occlusionBetween ? world.occlusionBetween(b.position, ent) : 0
        };
        const v = SE.vision(organs, b.position, target, env);
        if (!v.visible) continue;
        const tags = P.visualTags(ent);
        const known = b.memory.people[ent.id];
        out.percepts.push({
          kind: ent.kind || 'humanoid',
          id: ent.id,
          x: ent.x,
          z: ent.z,
          distance: v.distance,
          bearing: v.bearing,
          confidence: v.confidence,
          identified: v.identified,
          name: v.identified ? ent.name || (known ? known.name : 'desconocido') : 'figura',
          relation: known ? { familiarity: known.familiarity, trust: known.trust } : null,
          tags: tags,
          summary: (v.identified ? ent.name || 'persona' : 'silueta') + ' a ' + v.distance + ' m',
          entity: ent
        });
        out.entitiesSeen.push(ent.id);
      }

      // Audición
      for (const snd of world.soundsNear(b.position, organs.ears.rangeM)) {
        const h = SE.hear(organs, b.position, snd, env);
        if (!h.heard) continue;
        out.sounds.push({
          kind: 'sound',
          id: snd.id,
          soundKind: snd.kind,
          x: snd.x,
          z: snd.z,
          distance: h.distance,
          bearing: h.bearing,
          directionErrorRad: h.directionErrorRad,
          confidence: h.loudness,
          identified: h.identified,
          tags: ['sonido', snd.kind].concat(snd.tags || []),
          summary: (h.identified ? snd.kind : 'sonido sin identificar') + ' a ' + h.distance + ' m'
        });
      }

      // Olfato
      for (const sc of world.scentsNear(b.position, 40)) {
        const sm = SE.smell(organs, b.position, sc, env);
        if (!sm.detected) continue;
        out.smells.push({
          kind: 'smell',
          id: sc.id,
          scentKind: sc.kind,
          x: sc.x,
          z: sc.z,
          strength: sm.strength,
          identified: sm.identified,
          tags: ['olor', sc.kind],
          summary: (sm.identified ? sc.kind : 'olor tenue')
        });
      }

      // Arcano (solo si hay emanaciones: no es un radar universal)
      if (world.arcaneNear) {
        const em = world.arcaneNear(b.position, organs.arcane.rangeM + 4);
        if (em.length) {
          for (const a of SE.arcane(organs, b.position, em, env, b.rng)) {
            out.arcane.push({
              kind: 'arcane',
              id: 'arc_' + U.round(a.bearing, 2),
              x: b.position.x + Math.sin(a.bearing) * a.distance,
              z: b.position.z + Math.cos(a.bearing) * a.distance,
              distance: a.distance,
              bearing: a.bearing,
              confidence: a.confidence,
              identified: a.identified,
              source: a.source,
              falsePositive: !!a.falsePositive,
              tags: ['arcano', 'anomalia'],
              summary: 'fenómeno arcano (' + (a.identified ? a.source : 'origen desconocido') + ') a ' + a.distance + ' m'
            });
          }
        }
      }

      // Sentido del lugar: familiaridad, seguridad, ruta
      if (out.place) {
        const known = b.memory.recallPlace(out.place.id);
        out.place.familiarity = known ? known.familiarity : 0;
        out.place.safety = known ? known.safety : 0.5;
        out.place.known = !!known;
      }

      // Fatiga ocular y adaptación
      SE.adaptEyes(organs, 1, env.light);

      this.last = out;
      return out;
    }

    toJSON() {
      return { knownAnomalies: this.knownAnomalies, scanCount: this.scanCount };
    }
    load(d) {
      if (!d) return;
      this.knownAnomalies = d.knownAnomalies || {};
      this.scanCount = d.scanCount || 0;
    }
  }

  P.Perception = Perception;

  /* ------------------------------ ATENCIÓN ------------------------------ */
  class Attention {
    constructor(brain) {
      this.brain = brain;
      this.habituation = {};
      this.focus = [];
      this.lastScores = [];
      this.switches = 0;
      this.lastFocusId = null;
    }

    /* Puntúa estímulos y selecciona los que ocupan la memoria de trabajo. */
    select(percepts, ctx) {
      const b = this.brain;
      const p = b.personality;
      const emo = b.emotions.modifiers();
      const phys = b.physiology.cognitiveModifiers();
      const profile = P.ATTENTION_PROFILES[b.identity.roleProfile] || P.ATTENTION_PROFILES.default;
      const knowledgeTags = b.culture.focusTags || [];
      const needs = b.needs ? b.needs.urgencyTags() : {};
      const goalTags = b.goals ? b.goals.activeTags() : [];
      const scored = [];

      for (const perc of percepts) {
        const tags = perc.tags || [];
        let score = 0.12 + (perc.confidence || 0) * 0.4;
        // Amenaza
        if (perc.kind === 'humanoid' && !perc.identified) score += 0.12 * emo.threatBias;
        if (tags.indexOf('arma') >= 0) score += 0.3 * emo.threatBias;
        if (tags.indexOf('anomalia') >= 0) score += 0.4 * emo.threatBias;
        if (tags.indexOf('sangre') >= 0) score += 0.2 + 0.2 * p.get('empathy');
        // Perfil profesional y conocimiento
        for (const t of tags) {
          if (profile.indexOf(t) >= 0) score += 0.22;
          if (knowledgeTags.indexOf(t) >= 0) score += 0.14;
          if (goalTags.indexOf(t) >= 0) score += 0.16;
        }
        // Novedad y habituación
        const id = perc.id || perc.summary;
        const hab = this.habituation[id] || 0;
        score += 0.14 * (1 - hab);
        if (perc.identified && perc.relation && perc.relation.familiarity > 0.6) score -= 0.06;
        // Necesidades
        if (tags.indexOf('persona') >= 0 && needs.social > 0.4) score += needs.social * 0.2;
        if (tags.indexOf('comida') >= 0 && needs.food > 0.4) score += needs.food * 0.5;
        // Emoción
        score *= emo.focusBias;
        // Curiosidad
        if (tags.indexOf('persona') < 0) score += p.get('curiosity') * 0.08;
        // Fatiga reduce atención sostenida
        score *= 0.55 + 0.45 * phys.focus;
        scored.push({ perc: perc, score: U.round(score, 3), id: id });
      }

      scored.sort((a, b2) => b2.score - a.score);
      const cap = phys.workingMemorySlots;
      const chosen = scored.slice(0, cap);
      const prevFocus = this.lastFocusId;
      this.focus = chosen.map((c) => c.perc);
      this.lastScores = scored.slice(0, 12);
      this.lastFocusId = chosen.length ? chosen[0].id : null;
      if (prevFocus && this.lastFocusId && prevFocus !== this.lastFocusId) this.switches++;

      // Habituación: decae con el tiempo, sube con la exposición.
      for (const k of Object.keys(this.habituation)) this.habituation[k] *= 0.97;
      for (const c of chosen) {
        if ((c.perc.tags || []).indexOf('arma') >= 0) continue;
        this.habituation[c.id] = U.clamp((this.habituation[c.id] || 0) + 0.18, 0, 0.95);
      }

      b.memory.setWorking(
        chosen.map((c) => ({
          id: c.perc.id,
          kind: c.perc.kind,
          summary: c.perc.summary,
          salience: c.score,
          t: ctx && ctx.time
        }))
      );
      return { focus: this.focus, scores: this.lastScores, capacity: cap, load: U.round(chosen.length / Math.max(1, cap), 2) };
    }

    /* ¿Merece interrumpir la tarea actual? (sobresalto / reorientación) */
    interrupt(percepts, threshold) {
      const emo = this.brain.emotions.modifiers();
      let max = 0,
        reason = null;
      for (const p of percepts) {
        const tags = p.tags || [];
        let s = 0;
        if (tags.indexOf('arma') >= 0) s += 0.5;
        if (tags.indexOf('anomalia') >= 0) s += 0.6;
        if (p.kind === 'sound' && p.soundKind === 'disparo') s += 0.7;
        if (p.kind === 'sound' && p.soundKind === 'explosion') s += 0.9;
        if (p.kind === 'humanoid' && p.identified && p.relation && p.relation.trust > 0.6) s += 0.2;
        s *= emo.threatBias;
        if (s > max) {
          max = s;
          reason = p.summary;
        }
      }
      return { interrupt: max >= (threshold === undefined ? 0.55 : threshold), strength: max, reason: reason };
    }

    toJSON() {
      return { habituation: this.habituation, switches: this.switches, lastFocusId: this.lastFocusId };
    }
    load(d) {
      if (!d) return;
      this.habituation = d.habituation || {};
      this.switches = d.switches || 0;
      this.lastFocusId = d.lastFocusId || null;
    }
  }

  P.Attention = Attention;
})(typeof window !== 'undefined' ? window : globalThis);
