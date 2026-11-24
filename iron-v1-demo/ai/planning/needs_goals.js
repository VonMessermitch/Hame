/* =========================================================================
   ai/planning/needs_goals.js — necesidades, objetivos jerárquicos y utilidad.
   ========================================================================= */
(function (g) {
  'use strict';
  const AETH = g.AETH;
  const U = AETH.util;

  const G = (AETH.goals = {});
  const N = (AETH.needs = {});

  /* Necesidades: nivel 0 = satisfecha, 1 = crítica. rate = por hora simulada. */
  N.DEFS = {
    supervivencia: { label: 'supervivencia', rate: 0, critical: 0.85, priority: 1.0, tag: 'peligro' },
    alimentacion: { label: 'alimentación', rate: 0.045, critical: 0.75, priority: 0.9, tag: 'comida' },
    hidratacion: { label: 'hidratación', rate: 0.06, critical: 0.8, priority: 0.95, tag: 'agua' },
    descanso: { label: 'descanso', rate: 0.022, critical: 0.8, priority: 0.8, tag: 'cansancio' },
    seguridad: { label: 'seguridad', rate: 0, critical: 0.7, priority: 0.9, tag: 'peligro' },
    salud: { label: 'salud', rate: 0, critical: 0.65, priority: 0.95, tag: 'herido' },
    refugio: { label: 'refugio', rate: 0, critical: 0.7, priority: 0.6, tag: 'frio' },
    relaciones: { label: 'relaciones sociales', rate: 0.018, critical: 0.7, priority: 0.5, tag: 'persona' },
    pertenencia: { label: 'pertenencia', rate: 0.012, critical: 0.7, priority: 0.45, tag: 'grupo' },
    familia: { label: 'familia', rate: 0.01, critical: 0.65, priority: 0.7, tag: 'familia' },
    economia: { label: 'economía', rate: 0.02, critical: 0.7, priority: 0.65, tag: 'dinero' },
    prestigio: { label: 'prestigio', rate: 0.008, critical: 0.75, priority: 0.35, tag: 'reputacion' },
    religion: { label: 'religión', rate: 0.02, critical: 0.6, priority: 0.4, tag: 'fe' },
    curiosidad: { label: 'curiosidad', rate: 0.015, critical: 0.6, priority: 0.3, tag: 'novedad' },
    desarrollo: { label: 'desarrollo personal', rate: 0.006, critical: 0.7, priority: 0.35, tag: 'aprender' },
    lealtad: { label: 'lealtad', rate: 0.008, critical: 0.75, priority: 0.5, tag: 'deber' },
    venganza: { label: 'venganza', rate: 0.004, critical: 0.8, priority: 0.3, tag: 'rencor' },
    ambicion: { label: 'ambición', rate: 0.006, critical: 0.8, priority: 0.3, tag: 'ascenso' }
  };

  class Needs {
    constructor(rng, personality, identity, physiology) {
      this.p = personality;
      this.identity = identity;
      this.physiology = physiology;
      this.state = {};
      const r = rng;
      for (const k of Object.keys(N.DEFS)) {
        const def = N.DEFS[k];
        let v = r.range(0.03, 0.35);
        if (k === 'economia' && identity.poverty) v = 0.65;
        if (k === 'familia' && identity.familyBurden) v = 0.55;
        if (k === 'venganza' && identity.vengeance) v = 0.7;
        if (k === 'religion') v = r.range(0.1, 0.5) + identity.devotion * 0.2;
        if (k === 'salud' && identity.injured) v = 0.6;
        if (k === 'descanso') v = 0.2;
        this.state[k] = { level: U.round(U.clamp(v, 0.02, 0.95), 3), priority: def.priority, lastSatisfied: 0 };
      }
      this.history = [];
    }

    get(k) {
      return this.state[k] ? this.state[k].level : 0;
    }
    set(k, v) {
      if (this.state[k]) this.state[k].level = U.clamp(v, 0, 1.2);
    }
    satisfy(k, amount) {
      if (!this.state[k]) return;
      this.state[k].level = U.clamp(this.state[k].level - amount, 0, 1.2);
      this.state[k].lastSatisfied = this.clockNow || 0;
    }

    /* dtHoras: horas simuladas. La fisiología realimenta las necesidades. */
    update(dtHoras, ctx) {
      ctx = ctx || {};
      const p = this.p;
      const work = ctx.working ? 1.15 : 1;
      for (const k of Object.keys(this.state)) {
        if (k === 'alimentacion' || k === 'hidratacion' || k === 'descanso') continue;
        const def = N.DEFS[k];
        if (!def) continue;
        let rate = def.rate * work;
        if (k === 'seguridad' && ctx.danger) rate = 0.9;
        if (k === 'salud' && ctx.pain) rate = ctx.pain * 0.4;
        if (k === 'refugio' && ctx.cold) rate = ctx.cold * 0.5;
        if (k === 'relaciones') rate *= 0.6 + p.get('sociability') * 0.8;
        if (k === 'familia') rate *= 0.5 + p.get('loyalty') * 0.9;
        if (k === 'economia') rate *= 0.5 + p.get('ambition') * 0.9;
        if (k === 'religion') rate *= 0.4 + (this.identity.devotion || 0.5) * 1.1;
        if (k === 'curiosidad') rate *= 0.4 + p.get('curiosity') * 1.2;
        if (k === 'prestigio') rate *= 0.4 + p.get('ambition') * 1.0;
        if (k === 'venganza') rate *= this.identity.vengeance ? 0.5 : 0;
        this.state[k].level = U.clamp(this.state[k].level + rate * dtHoras, 0, 1.2);
      }

      if (this.physiology) {
        const s = this.physiology.state;
        this.state.alimentacion.level = U.clamp(s.hunger * 0.9, 0, 1.2);
        this.state.hidratacion.level = U.clamp(s.thirst * 0.95, 0, 1.2);
        this.state.descanso.level = U.clamp(s.fatigue * 0.85 + s.sleepDebt * 0.35, 0, 1.2);
        this.state.salud.level = U.clamp(s.pain * 0.9 + s.infection * 0.8 + (1 - s.bloodVolume) * 2.4, 0, 1.2);
        this.state.seguridad.level = U.clamp(this.state.seguridad.level, 0, 1.2);
      }
      return this.state;
    }

    urgency(k) {
      const s = this.state[k];
      if (!s) return 0;
      const deficit = U.clamp((s.level - 0.15) / 0.85, 0, 1);
      return deficit * s.priority;
    }

    top(n) {
      return Object.keys(this.state)
        .map((k) => ({ need: k, label: N.DEFS[k].label, level: U.round(this.state[k].level, 2), urgency: U.round(this.urgency(k), 3) }))
        .sort((a, b) => b.urgency - a.urgency)
        .slice(0, n || 5);
    }

    urgencyTags() {
      const tags = {};
      for (const k of Object.keys(this.state)) {
        const def = N.DEFS[k];
        if (!def || !def.tag) continue;
        tags[def.tag] = Math.max(tags[def.tag] || 0, this.urgency(k));
      }
      tags.social = this.urgency('relaciones');
      tags.food = this.urgency('alimentacion');
      return tags;
    }

    describe() {
      const out = {};
      for (const k of Object.keys(this.state)) out[N.DEFS[k] ? N.DEFS[k].label : k] = U.round(this.state[k].level, 2);
      return out;
    }

    toJSON() {
      return { state: this.state, history: this.history };
    }
    load(d) {
      if (!d) return;
      if (d.state) U.deepMerge(this.state, d.state);
      this.history = d.history || [];
    }
  }
  N.Needs = Needs;

  /* ------------------------------ OBJETIVOS ------------------------------ */
  G.HORIZONS = { inmediato: 'segundos o minutos', corto: 'minutos u horas', medio: 'días o semanas', largo: 'meses o años' };

  class Goal {
    constructor(cfg) {
      this.id = cfg.id || U.uid('goal');
      this.label = cfg.label;
      this.horizon = cfg.horizon || 'corto';
      this.conditions = cfg.conditions || [];
      this.parent = cfg.parent || null;
      this.source = cfg.source || 'necesidad';
      this.utility = cfg.utility || 0.5;
      this.progress = 0;
      this.deadline = cfg.deadline || null;
      this.tags = cfg.tags || [];
      this.status = 'activo'; // activo | completado | fallido | abandonado
      this.created = cfg.created || 0;
      this.attempts = 0;
      this.failures = 0;
      this.reason = cfg.reason || '';
      this.motivation = cfg.motivation || '';
      this.subgoals = cfg.subgoals || [];
    }
    toJSON() {
      return U.sanitize(this);
    }
  }
  G.Goal = Goal;

  class Goals {
    constructor(rng, personality, identity, needs) {
      this.rng = rng;
      this.p = personality;
      this.identity = identity;
      this.needs = needs;
      this.list = [];
      this.completed = [];
      this.abandoned = [];
      this.lastSelection = null;
      this.seedLongTerm();
      this.clockNow = 0;
    }

    seedLongTerm() {
      const id = this.identity;
      const add = (label, conditions, utility, tags, motivation) =>
        this.list.push(
          new Goal({
            label: label,
            horizon: 'largo',
            conditions: conditions,
            utility: utility,
            source: 'identidad',
            tags: tags || [],
            motivation: motivation
          })
        );
      if (id.familyBurden) add('mantener a su familia', ['familia_estable'], 0.8, ['familia'], 'dependen de mí');
      add('conservar el empleo', ['empleo_activo'], 0.7, ['economia'], 'sin trabajo no hay pan');
      if (id.profession === 'soldado' || id.profession === 'oficial')
        add('sobrevivir al próximo combate', ['a_salvo'], 0.85, ['militar'], 'no pienso morir en una zanja');
      if (id.vengeance) add('ajustar cuentas', ['venganza_cumplida'], 0.6, ['rencor'], 'hay deudas que no prescriben');
      if (id.role === 'nino') add('aprender un oficio', ['habilidad_util'], 0.6, ['desarrollo'], 'quiero ser alguien');
      if (id.ambition > 0.6) add('ascender en la jerarquía', ['prestigio_alto'], 0.55, ['ambicion'], 'quiero más que esto');
      if (id.devotion > 0.5) add('cumplir con la Fe', ['deber_religioso'], 0.5, ['fe'], 'el Hacedor ve lo que hago');
      add('ahorrar para el invierno', ['dinero_suficiente'], 0.55, ['economia'], 'los inviernos son largos');
    }

    parentFor(goal) {
      return goal && goal.parent ? this.list.find((g) => g.id === goal.parent) : null;
    }

    /* Convierte necesidades urgentes en objetivos de corto plazo. */
    refreshFromNeeds(time) {
      this.clockNow = time;
      this.cooldowns = this.cooldowns || {};
      const top = this.needs.top(6);
      for (const t of top) {
        if (t.urgency < 0.28) continue;
        const label = this.goalForNeed(t.need);
        if (!label) continue;
        const exists = this.list.some((g) => g.status === 'activo' && g.tags.indexOf(label.tag) >= 0 && g.horizon !== 'largo');
        const cooling = this.cooldowns[label.label] !== undefined && time - this.cooldowns[label.label] < 6 * 3600;
        if (!exists && !cooling) {
          this.list.push(
            new Goal({
              label: label.label,
              horizon: t.urgency > 0.7 ? 'corto' : 'medio',
              conditions: label.conditions,
              utility: label.utility * (0.6 + t.urgency),
              source: 'necesidad',
              tags: [label.tag],
              motivation: 'nivel ' + t.level,
              created: time
            })
          );
        }
      }
      // Limpieza de objetivos efímeros resueltos
      for (const g of this.list) {
        if (g.status !== 'activo' && g.horizon === 'inmediato') g.status = 'completado';
      }
      if (this.list.length > 22) {
        const weak = this.list.filter((g) => g.status === 'activo' && g.horizon !== 'largo').sort((a, b) => a.utility - b.utility)[0];
        if (weak) weak.status = 'abandonado';
      }
      this.list = this.list.filter((g) => g.status !== 'abandonado' || this.abandoned.length < 10);
      for (const g of this.list) if (g.status === 'abandonado') this.abandoned.push(g);
      this.list = this.list.filter((g) => g.status !== 'abandonado');
      return this.list;
    }

    goalForNeed(need) {
      const map = {
        alimentacion: { label: 'conseguir comida', conditions: ['alimentado'], utility: 0.9, tag: 'comida' },
        hidratacion: { label: 'beber algo', conditions: ['hidratado'], utility: 0.95, tag: 'agua' },
        descanso: { label: 'descansar', conditions: ['descansado'], utility: 0.8, tag: 'cansancio' },
        seguridad: { label: 'ponerse a salvo', conditions: ['a_salvo'], utility: 1.0, tag: 'peligro' },
        salud: { label: 'tratar sus heridas', conditions: ['heridas_tratadas'], utility: 0.9, tag: 'herido' },
        refugio: { label: 'buscar refugio', conditions: ['en_refugio'], utility: 0.7, tag: 'frio' },
        relaciones: { label: 'hablar con alguien', conditions: ['contacto_social'], utility: 0.5, tag: 'persona' },
        pertenencia: { label: 'estar con los suyos', conditions: ['contacto_grupo'], utility: 0.45, tag: 'grupo' },
        familia: { label: 'ver a su familia', conditions: ['familia_visitada'], utility: 0.6, tag: 'familia' },
        economia: { label: 'conseguir dinero', conditions: ['dinero_suficiente'], utility: 0.7, tag: 'dinero' },
        prestigio: { label: 'ganarse el respeto', conditions: ['reputacion_alta'], utility: 0.4, tag: 'reputacion' },
        religion: { label: 'cumplir con la Fe', conditions: ['deber_religioso'], utility: 0.5, tag: 'fe' },
        curiosidad: { label: 'investigar algo nuevo', conditions: ['novedad_explorada'], utility: 0.35, tag: 'novedad' },
        desarrollo: { label: 'practicar un oficio', conditions: ['habilidad_util'], utility: 0.4, tag: 'aprender' },
        lealtad: { label: 'cumplir con su deber', conditions: ['deber_cumplido'], utility: 0.55, tag: 'deber' },
        venganza: { label: 'ajustar cuentas', conditions: ['venganza_cumplida'], utility: 0.5, tag: 'rencor' },
        ambicion: { label: 'medrar', conditions: ['prestigio_alto'], utility: 0.4, tag: 'ascenso' }
      };
      return map[need] || null;
    }

    /* Selección por utilidad con sensibilidad a emoción, personalidad y fracasos. */
    select(ctx) {
      const emo = ctx.emotion ? ctx.emotion.modifiers() : { riskTolerance: 1 };
      const p = this.p;
      const candidates = [];
      for (const g of this.list) {
        if (g.status !== 'activo') continue;
        const horizonBoost = g.horizon === 'inmediato' ? 1.25 : g.horizon === 'corto' ? 1.05 : g.horizon === 'medio' ? 0.95 : 0.8;
        const need = g.tags.length ? Math.max(0, ...g.tags.map((t) => this.needUrgencyByTag(t))) : 0.2;
        const sourceBoost = g.source === 'identidad' ? 1 + p.get('perseverance') * 0.25 : 1;
        const failurePenalty = Math.pow(0.72, g.failures);
        const personalityBias = this.personalityBias(g);
        const utility = g.utility * horizonBoost * (0.55 + need * 0.9) * sourceBoost * failurePenalty * personalityBias * (0.85 + emo.riskTolerance * 0.15);
        candidates.push({ goal: g, utility: U.round(utility, 3), need: U.round(need, 2) });
      }
      candidates.sort((a, b) => b.utility - a.utility);
      // Evitar bucles: no elegir un objetivo recién fallido si hay alternativa razonable.
      let chosen = candidates[0];
      if (chosen && this.lastSelection && chosen.goal.id === this.lastSelection.id && chosen.goal.failures > 0 && candidates[1] && candidates[1].utility > chosen.utility * 0.72) {
        chosen = candidates[1];
      }
      this.lastSelection = chosen ? { id: chosen.goal.id, label: chosen.goal.label, utility: chosen.utility, at: ctx.time } : null;
      return { chosen: chosen ? chosen.goal : null, critical: candidates.slice(0, 5), reason: this.explain(chosen) };
    }

    needUrgencyByTag(tag) {
      const map = { comida: 'alimentacion', agua: 'hidratacion', cansancio: 'descanso', peligro: 'seguridad', herido: 'salud', frio: 'refugio', persona: 'relaciones', grupo: 'pertenencia', familia: 'familia', dinero: 'economia', reputacion: 'prestigio', fe: 'religion', novedad: 'curiosidad', aprender: 'desarrollo', deber: 'lealtad', rencor: 'venganza', ascenso: 'ambicion' };
      const need = map[tag];
      return need ? this.needs.urgency(need) : 0.15;
    }

    personalityBias(goal) {
      const p = this.p;
      const t = goal.tags;
      let b = 1;
      if (t.indexOf('familia') >= 0) b *= 0.7 + p.get('loyalty') * 0.6;
      if (t.indexOf('peligro') >= 0) b *= 1.3 - p.get('confidence') * 0.4;
      if (t.indexOf('dinero') >= 0) b *= 0.75 + p.get('ambition') * 0.5;
      if (t.indexOf('fe') >= 0) b *= 0.7 + p.get('discipline') * 0.6;
      if (t.indexOf('rencor') >= 0) b *= 0.6 + p.get('aggression') * 0.8;
      if (t.indexOf('aprender') >= 0) b *= 0.7 + p.get('curiosity') * 0.6;
      return b;
    }

    explain(chosen) {
      if (!chosen) return 'sin objetivos activos';
      return chosen.label + ' (utilidad ' + chosen.utility + ', necesidad ' + chosen.need + ')';
    }

    activateTags() {
      const tags = [];
      for (const g of this.list) {
        if (g.status !== 'activo') continue;
        for (const t of g.tags) if (tags.indexOf(t) < 0) tags.push(t);
      }
      return tags;
    }
    activeTags() {
      return this.activateTags();
    }

    complete(goal) {
      goal.status = 'completado';
      this.cooldowns = this.cooldowns || {};
      this.cooldowns[goal.label] = this.clockNow || 0;
      this.completed.push({ id: goal.id, label: goal.label, at: this.clockNow });
      if (this.completed.length > 40) this.completed.shift();
      const parent = this.parentFor(goal);
      if (parent) parent.progress = U.clamp(parent.progress + 0.25, 0, 1);
    }
    fail(goal, reason) {
      goal.failures++;
      goal.reason = reason || 'condiciones no cumplidas';
      if (goal.failures >= 4) goal.status = 'abandonado';
    }

    describe() {
      return {
        activos: this.list.filter((g) => g.status === 'activo').map((g) => ({ label: g.label, horizonte: g.horizon, utilidad: U.round(g.utility, 2), fallos: g.failures, motivo: g.motivation })),
        completados: this.completed.slice(-5).reverse(),
        seleccion: this.lastSelection
      };
    }

    toJSON() {
      return { list: this.list.map((g) => g.toJSON()), completed: this.completed, abandoned: this.abandoned, lastSelection: this.lastSelection };
    }
    load(d) {
      if (!d) return;
      this.list = (d.list || []).map((g) => Object.assign(new Goal({ label: g.label }), g));
      this.cooldowns = d.cooldowns || {};
      this.completed = d.completed || [];
      this.abandoned = d.abandoned || [];
      this.lastSelection = d.lastSelection || null;
    }
  }

  G.Goals = Goals;
})(typeof window !== 'undefined' ? window : globalThis);
