/* =========================================================================
   ai/cognition/emotion.js — sistema emocional dinámico.
   Las emociones modifican atención, memoria, decisión, lenguaje y postura.
   ========================================================================= */
(function (g) {
  'use strict';
  const AETH = g.AETH;
  const U = AETH.util;

  const E = (AETH.emotion = {});

  E.DEFS = {
    miedo: { decay: 0.0035, label: 'miedo' },
    ira: { decay: 0.0025, label: 'ira' },
    alegria: { decay: 0.003, label: 'alegría' },
    tristeza: { decay: 0.0012, label: 'tristeza' },
    curiosidad: { decay: 0.004, label: 'curiosidad' },
    verguenza: { decay: 0.002, label: 'vergüenza' },
    orgullo: { decay: 0.0018, label: 'orgullo' },
    culpa: { decay: 0.0012, label: 'culpa' },
    confianza: { decay: 0.0008, label: 'confianza' },
    desconfianza: { decay: 0.001, label: 'desconfianza' },
    tranquilidad: { decay: 0.003, label: 'tranquilidad' },
    frustracion: { decay: 0.0026, label: 'frustración' },
    esperanza: { decay: 0.0009, label: 'esperanza' },
    ansiedad: { decay: 0.0018, label: 'ansiedad' },
    admiracion: { decay: 0.0014, label: 'admiración' }
  };

  E.EVENTS = [
    'amenaza',
    'dolor',
    'perdida',
    'insulto',
    'elogio',
    'exito',
    'fracaso',
    'estimulo_desconocido',
    'arcano',
    'transgresion',
    'orden',
    'religioso',
    'intimidad',
    'muerte_conocido',
    'traicion',
    'ayuda',
    'peligro_evitado',
    'anomalia'
  ];

  class EmotionSystem {
    constructor(rng, personality, ethos) {
      this.rng = rng;
      this.p = personality;
      this.ethos = ethos || {};
      this.state = {};
      for (const k of Object.keys(E.DEFS)) this.state[k] = k === 'tranquilidad' ? 0.45 : 0.06;
      this.state.curiosidad = 0.25;
      this.mood = 0; // valencia agregada -1..1
      this.arousal = 0.2;
      this.lastAppraisal = null;
      this.history = [];
    }

    get(name) {
      return this.state[name] || 0;
    }

    appraise(event) {
      if (!event) return;
      const p = this.p;
      const s = this.state;
      const i = U.clamp(event.intensity === undefined ? 0.5 : event.intensity, 0, 1);
      const d = {};
      const add = (k, v) => {
        if (!v) return;
        d[k] = (d[k] || 0) + v;
      };
      const dread = 1.2 - p.get('stressTolerance') * 0.5;
      const trustBias = p.get('confidence') * 0.4 + 0.6;
      const religious = this.ethos.religiosity === undefined ? 0.5 : this.ethos.religiosity;

      switch (event.type) {
        case 'amenaza':
          add('miedo', i * (1.25 - p.get('confidence') * 0.4) * dread);
          add('ansiedad', i * 0.5 * dread);
          add('ira', i * p.get('aggression') * 0.55);
          add('tranquilidad', -i * 0.5);
          break;
        case 'peligro_evitado':
          add('alegria', i * 0.45);
          add('tranquilidad', i * 0.5);
          add('miedo', i * 0.2);
          break;
        case 'dolor':
          add('miedo', i * 0.4);
          add('ira', i * (0.25 + p.get('aggression') * 0.4));
          add('frustracion', i * 0.4);
          add('tranquilidad', -i * 0.4);
          break;
        case 'perdida':
          add('tristeza', i * (0.8 + p.get('empathy') * 0.5));
          add('culpa', i * p.get('empathy') * 0.25);
          add('esperanza', -i * 0.3);
          break;
        case 'muerte_conocido':
          add('tristeza', i * (1 + p.get('empathy') * 0.6));
          add('miedo', i * 0.3);
          add('ira', i * 0.25 * p.get('aggression'));
          if (religious > 0.6) add('esperanza', i * 0.15);
          break;
        case 'insulto':
          add('ira', i * (0.5 + p.get('aggression') * 0.8) * (1 - p.get('selfControl') * 0.3));
          add('verguenza', i * (0.25 + p.get('susceptibility') * 0.7));
          add('desconfianza', i * 0.4);
          add('frustracion', i * 0.3);
          break;
        case 'elogio':
          add('alegria', i * (0.45 + p.get('extroversion') * 0.3));
          add('orgullo', i * (0.3 + p.get('confidence') * 0.5));
          add('confianza', i * 0.35);
          add('admiracion', i * 0.2);
          break;
        case 'exito':
          add('alegria', i * 0.7);
          add('orgullo', i * (0.4 + p.get('ambition') * 0.5));
          add('esperanza', i * 0.4);
          add('frustracion', -i * 0.5);
          add('tranquilidad', i * 0.2);
          break;
        case 'fracaso':
          add('frustracion', i * (0.6 + (1 - p.get('perseverance')) * 0.6));
          add('tristeza', i * 0.35);
          add('verguenza', i * p.get('susceptibility') * 0.3);
          add('ira', i * p.get('aggression') * 0.25);
          add('esperanza', -i * 0.3);
          break;
        case 'estimulo_desconocido':
          add('curiosidad', i * (0.4 + p.get('curiosity') * 0.9));
          add('miedo', i * (0.25 + (1 - p.get('curiosity')) * 0.3));
          add('ansiedad', i * 0.2);
          break;
        case 'anomalia':
        case 'arcano':
          add('curiosidad', i * (0.3 + p.get('curiosity') * 0.8));
          add('miedo', i * 0.4 * (1 - this.ethos.arcaneComfort || 0.5));
          add('admiracion', i * (this.ethos.arcaneComfort || 0.4));
          break;
        case 'transgresion':
          add('culpa', i * (0.4 + p.get('empathy') * 0.5 + p.get('discipline') * 0.3));
          add('verguenza', i * (0.3 + p.get('susceptibility') * 0.5));
          if (religious > 0.6) add('miedo', i * 0.3);
          break;
        case 'orden':
          add('confianza', i * p.get('discipline') * 0.3);
          add('frustracion', i * (1 - p.get('discipline')) * 0.5);
          add('ira', i * (1 - p.get('loyalty')) * 0.35);
          break;
        case 'religioso':
          add('tranquilidad', i * religious * 0.7);
          add('esperanza', i * religious * 0.6);
          add('admiracion', i * religious * 0.5);
          break;
        case 'intimidad':
          add('alegria', i * 0.5);
          add('confianza', i * 0.5);
          add('tranquilidad', i * 0.4);
          add('desconfianza', -i * 0.4);
          break;
        case 'traicion':
          add('ira', i * (0.6 + p.get('aggression') * 0.6));
          add('desconfianza', i * (0.6 + (1 - p.get('empathy')) * 0.4));
          add('tristeza', i * 0.4);
          add('verguenza', i * 0.15);
          break;
        case 'ayuda':
          add('confianza', i * 0.5);
          add('alegria', i * 0.35);
          add('admiracion', i * 0.25);
          break;
        default:
          add('curiosidad', i * 0.1);
      }

      s.tranquilidad = U.clamp(s.tranquilidad - i * 0.3, 0, 1);
      for (const k of Object.keys(d)) s[k] = U.clamp((s[k] || 0) + d[k], 0, 1);

      // Arousal y valencia agregada
      this.arousal = U.clamp(this.arousal * 0.7 + (s.miedo + s.ira + s.ansiedad + s.alegria * 0.6) * 0.35, 0, 1);
      this.mood = U.clamp(this.mood * 0.8 + (s.alegria + s.orgullo + s.esperanza + s.confianza - s.tristeza - s.miedo - s.ira - s.verguenza - s.culpa) * 0.22, -1, 1);

      this.lastAppraisal = { event: event.type, intensity: i, deltas: d, t: event.time, reason: event.reason || '' };
      this.history.push({ type: event.type, i: U.round(i, 2), t: event.time });
      if (this.history.length > 30) this.history.shift();
      AETH.debug.log('emoción', (event.type || '?') + ' → ' + (Object.keys(d).join(', ') || 'neutro'), { npc: event.npcId, intensity: i });
      return d;
    }

    /* Refresco fisiológico: dolor, fatiga y hambre también generan emoción. */
    physiological(physio, personality) {
      const m = physio.cognitiveModifiers();
      const s = this.state;
      if (m.painLoad > 0.25) {
        s.ira = U.clamp(s.ira + m.painLoad * 0.004, 0, 1);
        s.frustracion = U.clamp(s.frustracion + m.painLoad * 0.005, 0, 1);
      }
      if (physio.state.hunger > 0.7) s.frustracion = U.clamp(s.frustracion + 0.002, 0, 1);
      if (physio.state.thirst > 0.75) s.ansiedad = U.clamp(s.ansiedad + 0.002, 0, 1);
      if (physio.state.fatigue > 0.8) s.ira = U.clamp(s.ira + 0.002 * (1 - personality.get('selfControl')), 0, 1);
    }

    update(dtSeconds) {
      const dtDays = dtSeconds / 86400;
      for (const k of Object.keys(E.DEFS)) {
        const dec = E.DEFS[k].decay * dtSeconds;
        this.state[k] = U.clamp(this.state[k] - dec, 0, 1);
      }
      // Las emociones se mezclan: la ira alimenta el valor, el miedo se contagia de calma.
      if (this.state.tranquilidad > 0.5) {
        this.state.miedo *= 1 - 0.02 * (dtSeconds / 60);
        this.state.ansiedad *= 1 - 0.02 * (dtSeconds / 60);
      }
      this.arousal = U.clamp(this.arousal - dtSeconds * 0.00008, 0, 1);
      this.mood *= 1 - 0.004 * (dtSeconds / 60);
    }

    dominant() {
      let best = 'tranquilidad',
        bv = -1;
      for (const k of Object.keys(E.DEFS)) {
        if (this.state[k] > bv) {
          bv = this.state[k];
          best = k;
        }
      }
      return { name: best, value: U.round(bv, 2) };
    }

    active(threshold) {
      const t = threshold === undefined ? 0.25 : threshold;
      return Object.keys(E.DEFS)
        .filter((k) => this.state[k] > t)
        .map((k) => ({ name: k, value: U.round(this.state[k], 2) }))
        .sort((a, b) => b.value - a.value);
    }

    /* Modificadores de conducta y cognición (multiplicativos sobre utilidad). */
    modifiers() {
      const s = this.state;
      return {
        riskTolerance: U.clamp(1 + s.ira * 0.6 + s.alegria * 0.3 - s.miedo * 0.9 - s.ansiedad * 0.5 - s.tristeza * 0.3, 0.15, 2),
        patience: U.clamp(1 - s.ira * 0.6 - s.frustracion * 0.5 + s.tranquilidad * 0.4, 0.1, 1.5),
        sociability: U.clamp(1 + s.alegria * 0.5 + s.confianza * 0.4 - s.miedo * 0.4 - s.tristeza * 0.5 - s.verguenza * 0.4, 0.2, 1.8),
        focusBias: U.clamp(1 + s.ansiedad * 0.4 + s.curiosidad * 0.3 - s.tristeza * 0.3, 0.5, 1.6),
        threatBias: U.clamp(1 + s.miedo * 0.9 + s.ansiedad * 0.6 + s.ira * 0.25, 0.8, 2.2),
        aggression: U.clamp(1 + s.ira * 1.1 - s.miedo * 0.5 - s.culpa * 0.3, 0.2, 2),
        helpBias: U.clamp(1 + s.culpa * 0.6 + s.confianza * 0.3 - s.ira * 0.5 - s.miedo * 0.4, 0.2, 1.8),
        speech: {
          tone: this.dominant().name,
          urgency: U.round(U.clamp(s.miedo + s.ansiedad + s.ira * 0.7, 0, 1), 2),
          warmth: U.round(U.clamp(s.confianza + s.alegria - s.desconfianza * 0.7, -1, 1), 2)
        },
        posture: U.round(s.tristeza * -1 + s.orgullo * 0.7 + s.miedo * -0.6 + s.ira * 0.3, 2)
      };
    }

    describe() {
      const out = {};
      for (const k of Object.keys(this.state)) out[k] = U.round(this.state[k], 2);
      return out;
    }

    toJSON() {
      return { state: this.state, mood: this.mood, arousal: this.arousal, history: this.history, lastAppraisal: this.lastAppraisal };
    }
    load(d) {
      if (!d) return;
      if (d.state) U.deepMerge(this.state, d.state);
      this.mood = d.mood || 0;
      this.arousal = d.arousal || 0;
      if (d.history) this.history = d.history;
      this.lastAppraisal = d.lastAppraisal || null;
    }
  }

  E.EmotionSystem = EmotionSystem;
})(typeof window !== 'undefined' ? window : globalThis);
