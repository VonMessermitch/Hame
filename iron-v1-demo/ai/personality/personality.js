/* =========================================================================
   ai/personality/personality.js — personalidad continua, contradictoria
   y de cambio lento. Los rasgos modulan, no dictan.
   ========================================================================= */
(function (g) {
  'use strict';
  const AETH = g.AETH;
  const U = AETH.util;

  const P = (AETH.personality = {});

  P.DIMS = [
    'extroversion',
    'introversion',
    'curiosity',
    'aggression',
    'prudence',
    'empathy',
    'sociability',
    'discipline',
    'impulsivity',
    'perseverance',
    'susceptibility',
    'stressTolerance',
    'confidence',
    'ambition',
    'loyalty',
    'selfControl'
  ];

  P.LABELS = {
    extroversion: 'extroversión',
    introversion: 'introversión',
    curiosity: 'curiosidad',
    aggression: 'agresividad',
    prudence: 'prudencia',
    empathy: 'empatía',
    sociability: 'sociabilidad',
    discipline: 'disciplina',
    impulsivity: 'impulsividad',
    perseverance: 'perseverancia',
    susceptibility: 'susceptibilidad',
    stressTolerance: 'tolerancia al estrés',
    confidence: 'confianza',
    ambition: 'ambición',
    loyalty: 'lealtad',
    selfControl: 'autocontrol'
  };

  /* Léxico de rasgos en español: descripciones → vectores de personalidad. */
  P.TRAIT_LEXICON = {
    desconfiado: { confidence: -0.2, prudence: 0.15, empathy: -0.1, sociability: -0.1 },
    reservado: { extroversion: -0.25, sociability: -0.15, introversion: 0.2 },
    perseverante: { perseverance: 0.3, discipline: 0.15 },
    terco: { perseverance: 0.2, selfControl: -0.1, discipline: 0.1 },
    valiente: { confidence: 0.25, stressTolerance: 0.2, prudence: -0.1 },
    cobarde: { confidence: -0.2, prudence: 0.25, stressTolerance: -0.2 },
    impulsivo: { impulsivity: 0.3, selfControl: -0.25, prudence: -0.2 },
    prudente: { prudence: 0.3, selfControl: 0.15, impulsivity: -0.15 },
    agresivo: { aggression: 0.3, empathy: -0.15 },
    amable: { empathy: 0.25, sociability: 0.2 },
    religioso: { discipline: 0.15, loyalty: 0.15, prudence: 0.1 },
    devoto: { discipline: 0.2, loyalty: 0.2 },
    curioso: { curiosity: 0.3, extroversion: 0.1 },
    sociable: { sociability: 0.3, extroversion: 0.2 },
    solitario: { sociability: -0.3, introversion: 0.25 },
    ambicioso: { ambition: 0.35, confidence: 0.1 },
    leal: { loyalty: 0.3 },
    traidor: { loyalty: -0.3, empathy: -0.15 },
    empatico: { empathy: 0.3 },
    cruel: { empathy: -0.3, aggression: 0.2 },
    ansioso: { stressTolerance: -0.25, susceptibility: 0.2 },
    sereno: { stressTolerance: 0.25, selfControl: 0.2 },
    disciplinado: { discipline: 0.3, selfControl: 0.2 },
    indisciplinado: { discipline: -0.3, impulsivity: 0.2 },
    orgulloso: { confidence: 0.2, susceptibility: 0.15 },
    humilde: { confidence: -0.1, empathy: 0.15 },
    generoso: { empathy: 0.2, sociability: 0.15 },
    tacaño: { empathy: -0.1, prudence: 0.15 },
    vengativo: { aggression: 0.2, perseverance: 0.15, empathy: -0.2 },
    melancolico: { extroversion: -0.2, introversion: 0.2, confidence: -0.1 },
    alegre: { extroversion: 0.25, sociability: 0.2 },
    callado: { extroversion: -0.2, introversion: 0.2 },
    nervioso: { susceptibility: 0.2, stressTolerance: -0.2 },
    paciente: { selfControl: 0.25, prudence: 0.15 },
    impaciente: { selfControl: -0.2, impulsivity: 0.2 },
    astuto: { curiosity: 0.15, confidence: 0.15 },
    ingenuo: { susceptibility: 0.2, confidence: -0.1 },
    despiadado: { empathy: -0.35, aggression: 0.2 },
    protector: { empathy: 0.25, loyalty: 0.2 },
    bebedor: { selfControl: -0.2, impulsivity: 0.15 },
    trabajador: { discipline: 0.25, perseverance: 0.2 },
    perezoso: { discipline: -0.3, perseverance: -0.2 },
    avaro: { prudence: 0.2, empathy: -0.15 },
    idealista: { curiosity: 0.15, ambition: 0.15, empathy: 0.1 },
    pragmatico: { prudence: 0.2, empathy: -0.08 },
    supersticioso: { susceptibility: 0.2, curiosity: 0.1 }
  };

  /* Rasgos sintéticos visibles (no deterministas). */
  P.descriptors = function (dims) {
    const out = [];
    const add = (cond, word) => {
      if (cond) out.push(word);
    };
    add(dims.introversion > 0.6, 'reservado');
    add(dims.extroversion > 0.65, 'sociable');
    add(dims.aggression > 0.65, 'irascible');
    add(dims.prudence > 0.65, 'cauto');
    add(dims.empathy > 0.65, 'comprensivo');
    add(dims.empathy < 0.3, 'duro');
    add(dims.discipline > 0.7, 'disciplinado');
    add(dims.impulsivity > 0.65, 'impulsivo');
    add(dims.perseverance > 0.7, 'tenaz');
    add(dims.confidence < 0.35, 'inseguro');
    add(dims.ambition > 0.7, 'ambicioso');
    add(dims.loyalty > 0.7, 'leal');
    add(dims.selfControl > 0.7, 'contenido');
    add(dims.stressTolerance < 0.35, 'nervioso');
    add(dims.curiosity > 0.7, 'curioso');
    return out.slice(0, 5);
  };

  class Personality {
    constructor(rng, dims, traits) {
      this.rng = rng;
      this.dims = {};
      for (const k of P.DIMS) this.dims[k] = U.clamp((dims && dims[k] !== undefined ? dims[k] : 0.5) + rng.gauss(0, 0.04), 0.03, 0.97);
      this.traits = traits ? traits.slice() : []; // etiquetas declaradas
      this.driftLog = [];
      this.contradictions = [];
      this.noteContradictions();
    }

    get(name) {
      return this.dims[name] === undefined ? 0.5 : this.dims[name];
    }
    set(name, v) {
      this.dims[name] = U.clamp(v, 0.03, 0.97);
    }

    /* Un individuo puede ser impulsivo y cauteloso: se registran tensiones reales. */
    noteContradictions() {
      const d = this.dims;
      const pairs = [
        ['impulsivity', 'selfControl'],
        ['extroversion', 'introversion'],
        ['confidence', 'susceptibility'],
        ['aggression', 'empathy'],
        ['loyalty', 'ambition']
      ];
      this.contradictions = [];
      for (const [a, b] of pairs) {
        if (d[a] > 0.62 && d[b] > 0.62) {
          this.contradictions.push({ a: a, b: b, tension: U.round((d[a] + d[b]) / 2, 2) });
        }
      }
      return this.contradictions;
    }

    applyTraits(traits) {
      for (const raw of traits || []) {
        const key = String(raw)
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z]/g, '');
        const vec = P.TRAIT_LEXICON[key];
        if (vec) {
          for (const k of Object.keys(vec)) {
            let v = this.dims[k] + vec[k] * 0.75;
            // Un rasgo declarado se nota: no puede quedar sepultado por el azar de base.
            if (vec[k] > 0.1 && v < 0.55) v = 0.55;
            if (vec[k] < -0.1 && v > 0.45) v = 0.45;
            this.dims[k] = U.clamp(v, 0.03, 0.97);
          }
          if (this.traits.indexOf(raw) < 0) this.traits.push(raw);
        }
      }
      this.noteContradictions();
    }

    /* Deriva lenta por experiencias significativas (no aleatoria por turno). */
    drift(event) {
      if (!event || event.intensity === undefined || event.intensity < 0.55) return null;
      if (this.rng.chance(0.4)) return null;
      const mag = 0.004 + event.intensity * 0.012;
      const d = this.dims;
      const apply = {};
      switch (event.type) {
        case 'traicion':
          apply.confidence = -mag;
          apply.susceptibility = mag * 0.6;
          apply.sociability = -mag * 0.5;
          break;
        case 'muerte_conocido':
        case 'perdida':
          apply.stressTolerance = mag * 0.4;
          apply.empathy = mag * 0.5;
          apply.prudence = mag * 0.4;
          break;
        case 'exito':
          apply.confidence = mag;
          apply.ambition = mag * 0.6;
          break;
        case 'fracaso':
          apply.confidence = -mag * 0.6;
          apply.prudence = mag * 0.5;
          apply.perseverance = mag * 0.3;
          break;
        case 'peligro_evitado':
          apply.prudence = mag;
          apply.stressTolerance = mag * 0.4;
          break;
        case 'ayuda':
        case 'intimidad':
          apply.empathy = mag * 0.5;
          apply.loyalty = mag * 0.4;
          break;
        case 'orden':
          apply.discipline = mag * 0.5;
          apply.loyalty = mag * 0.4;
          break;
        default:
          return null;
      }
      for (const k of Object.keys(apply)) {
        d[k] = U.clamp(d[k] + apply[k], 0.03, 0.97);
        if (this.driftLog.length < 40) this.driftLog.push({ t: event.time, dim: k, delta: U.round(apply[k], 4), cause: event.type });
      }
      this.noteContradictions();
      return apply;
    }

    summary() {
      const d = this.dims;
      const top = P.DIMS.filter((k) => d[k] > 0.6)
        .sort((a, b) => d[b] - d[a])
        .slice(0, 4)
        .map((k) => P.LABELS[k]);
      return { traits: this.traits, descriptors: P.descriptors(d).concat(top).slice(0, 6), contradictions: this.contradictions };
    }

    toJSON() {
      return { dims: this.dims, traits: this.traits, driftLog: this.driftLog };
    }
    load(d) {
      if (!d) return;
      if (d.dims) U.deepMerge(this.dims, d.dims);
      this.traits = d.traits || [];
      this.driftLog = d.driftLog || [];
      this.noteContradictions();
    }
  }

  P.Personality = Personality;
})(typeof window !== 'undefined' ? window : globalThis);
