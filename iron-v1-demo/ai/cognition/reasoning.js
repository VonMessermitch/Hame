/* =========================================================================
   ai/cognition/reasoning.js — razonamiento procedural y aprendizaje ligero.
   Percibir → saber qué sabe → recuperar → evaluar → generar → comparar →
   elegir → observar → aprender.
   ========================================================================= */
(function (g) {
  'use strict';
  const AETH = g.AETH;
  const U = AETH.util;

  const R = (AETH.reasoning = {});

  class Reasoner {
    constructor(brain) {
      this.brain = brain;
      this.q = {}; // "accion|contexto" -> {q, n}
      this.blacklist = {}; // goalId -> {actionId: untilTime}
      this.trace = [];
      this.planner = new AETH.goap.Planner();
      this.confidence = 0.5;
      this.knownUnknowns = [];
    }

    ctxTag(goal) {
      if (!goal) return 'ocio';
      return goal.tags.length ? goal.tags[0] : 'general';
    }

    qValue(actionId, ctx) {
      const k = actionId + '|' + ctx;
      return this.q[k] ? this.q[k].q : 0;
    }

    /* Aprendizaje por refuerzo ligero: media incremental con descuento. */
    learn(actionId, ctx, reward, nextBest) {
      const k = actionId + '|' + ctx;
      const entry = this.q[k] || { q: 0, n: 0 };
      const lr = U.clamp(0.35 / (1 + entry.n * 0.15), 0.06, 0.35);
      const target = reward + 0.75 * (nextBest || 0);
      entry.q = entry.q + lr * (target - entry.q);
      entry.n++;
      this.q[k] = entry;
      if (Object.keys(this.q).length > 400) {
        // Poda de experiencias poco usadas
        const keys = Object.keys(this.q).sort((a, b) => this.q[a].n - this.q[b].n);
        for (let i = 0; i < 40; i++) delete this.q[keys[i]];
      }
      return entry.q;
    }

    /* Plan GOAP para un objetivo, con capacidad de reconocer imposibilidad. */
    plan(goal, world) {
      const brain = this.brain;
      if (!goal) return { ok: false, plan: [], reason: 'sin objetivo' };
      const facts = AETH.goap.factsFor(brain);
      const required = goal.conditions || [];
      if (!required.length) return { ok: false, plan: [], reason: 'objetivo sin condiciones verificables' };
      const result = this.planner.plan(facts, required, brain);
      if (result.ok) {
        const plan = result.plan.filter((a) => {
          const bl = this.blacklist[goal.id];
          if (!bl || !bl[a.id]) return true;
          return bl[a.id] < (world ? world.clock.timeSeconds : 0);
        });
        if (plan.length !== result.plan.length) return { ok: false, plan: [], reason: 'acciones bloqueadas por fracasos previos' };
        result.plan = plan;
        this.trace.push({ t: world ? world.clock.timeSeconds : 0, kind: 'plan', goal: goal.label, plan: result.plan.map((a) => a.id), cost: result.cost });
        if (this.trace.length > 60) this.trace.shift();
        return result;
      }
      // Reconocer qué le falta (no fingir que puede)
      this.knownUnknowns = result.blocked.map((b) => b.action + ': ' + b.reason);
      return result;
    }

    blockAction(goal, action, world, minutes) {
      if (!goal) return;
      this.blacklist[goal.id] = this.blacklist[goal.id] || {};
      const t = (world ? world.clock.timeSeconds : 0) + (minutes || 30) * 60;
      this.blacklist[goal.id][action.id] = t;
    }

    /* Evaluación de una acción por utilidad (fallback cuando GOAP no planifica). */
    scoreAction(action, brain, world) {
      const app = AETH.goap.applicable(action, brain);
      if (!app.ok) return { score: -Infinity, reason: app.reason };
      const emo = brain.emotions.modifiers();
      const phys = brain.physiology.cognitiveModifiers();
      let score = 0;
      for (const need of Object.keys(action.needs || {})) {
        const urgency = brain.needs.urgency(need);
        score += action.needs[need] * (0.3 + urgency * 1.8);
      }
      for (const need of Object.keys(action.strain || {})) {
        score -= action.strain[need] * brain.needs.urgency(need) * 1.2;
      }
      score += this.qValue(action.id, 'utilidad') * 0.5;
      score -= action.risk * (1.2 - emo.riskTolerance) * (0.5 + phys.riskAversion);
      score -= action.durationMin / 240;
      if (action.tags.indexOf('social') >= 0) score *= emo.sociability;
      if (action.tags.indexOf('peligro') >= 0) score *= emo.threatBias * 0.6;
      if (action.tags.indexOf('fe') >= 0) score *= 0.6 + (brain.culture.faith.devotion || 0.4) * 0.8;
      if (action.tags.indexOf('comida') >= 0 && brain.physiology.state.hunger > 0.7) score += 0.5;
      if (action.tags.indexOf('dinero') >= 0 && brain.economy.money < 3) score += 0.4;
      // Lugares conocidos: no elegir ir a donde no sabe llegar si tiene alternativa
      if (world && action.place.length && brain.location && action.place.indexOf(brain.location.type) < 0 && !world.hasPlaceOfType(action.place)) {
        score -= 0.6;
      }
      return { score: U.round(score, 3), reason: 'utilidad' };
    }

    chooseFallback(brain, world) {
      const ctx = world ? world.clock.phaseOfDay : 'dia';
      const candidates = [];
      for (const action of AETH.goap.ACTIONS) {
        if (action.id === 'disparar' || action.id === 'recargar') continue; // combate se decide aparte
        const s = this.scoreAction(action, brain, world);
        if (!isFinite(s.score)) continue;
        candidates.push({ action: action, score: s.score, reason: s.reason });
      }
      candidates.sort((a, b) => b.score - a.score);
      if (!candidates.length) return { action: null, score: 0, reason: 'sin acciones posibles' };
      const best = candidates[0];
      // Ruido de decisión: no siempre la misma acción, pero sesgado por utilidad.
      const pick = brain.rng.chance(0.15) && candidates[1] ? candidates[1] : best;
      const q = this.qValue(pick.action.id, ctx);
      return { action: pick.action, score: U.round(pick.score + q * 0.2, 3), reason: 'utilidad (' + pick.score + ')', alternatives: candidates.slice(1, 4).map((c) => c.action.label) };
    }

    /* Compara coste/beneficio de dos planes alternativos (p. ej. trabajar vs robar). */
    compare(plans, brain, world) {
      const scored = plans
        .filter((p) => p && p.ok)
        .map((p) => {
          const emo = brain.emotions.modifiers();
          const risk = U.sum(p.plan.map((a) => a.risk));
          const benefit = U.sum(p.plan.map((a) => U.sum(Object.keys(a.needs || {}).map((n) => a.needs[n] * brain.needs.urgency(n)))));
          const value = benefit - risk * (2 - emo.riskTolerance) - p.cost / 300;
          return { plan: p, value: U.round(value, 3) };
        })
        .sort((a, b) => b.value - a.value);
      return scored;
    }

    explain() {
      return {
        ultimoPlan: this.trace.length ? this.trace[this.trace.length - 1] : null,
        bloqueos: this.knownUnknowns,
        accionesAprendidas: Object.keys(this.q).length,
        confianza: U.round(this.confidence, 2)
      };
    }

    toJSON() {
      return { q: this.q, blacklist: this.blacklist, trace: this.trace.slice(-20), knownUnknowns: this.knownUnknowns, confidence: this.confidence };
    }
    load(d) {
      if (!d) return;
      this.q = d.q || {};
      this.blacklist = d.blacklist || {};
      this.trace = d.trace || [];
      this.knownUnknowns = d.knownUnknowns || [];
      this.confidence = d.confidence || 0.5;
    }
  }

  R.Reasoner = Reasoner;
})(typeof window !== 'undefined' ? window : globalThis);
