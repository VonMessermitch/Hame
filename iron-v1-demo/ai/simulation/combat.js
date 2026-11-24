/* =========================================================================
   ai/simulation/combat.js — comportamiento militar.
   La doctrina, el entrenamiento y la jerarquía no convierten a nadie en marioneta.
   ========================================================================= */
(function (g) {
  'use strict';
  const AETH = g.AETH;
  const U = AETH.util;

  const CB = (AETH.combat = {});

  CB.COMPETENCES = {
    fusilero: { label: 'fusilero', cover: 0.6, fireDiscipline: 0.6, initiative: 0.4, morale: 0.6 },
    granadero: { label: 'granadero', cover: 0.5, fireDiscipline: 0.5, initiative: 0.5, morale: 0.65 },
    ametrallador: { label: 'ametrallador', cover: 0.7, fireDiscipline: 0.8, initiative: 0.3, morale: 0.6 },
    medico: { label: 'médico de campaña', cover: 0.5, fireDiscipline: 0.2, initiative: 0.6, morale: 0.7 },
    explorador: { label: 'explorador', cover: 0.8, fireDiscipline: 0.4, initiative: 0.75, morale: 0.65 },
    cabo: { label: 'cabo', cover: 0.6, fireDiscipline: 0.7, initiative: 0.6, morale: 0.7 },
    sargento: { label: 'sargento', cover: 0.65, fireDiscipline: 0.75, initiative: 0.7, morale: 0.8 },
    teniente: { label: 'teniente', cover: 0.5, fireDiscipline: 0.6, initiative: 0.8, morale: 0.8 },
    oficial: { label: 'oficial', cover: 0.45, fireDiscipline: 0.5, initiative: 0.9, morale: 0.85 },
    artillero: { label: 'artillero', cover: 0.6, fireDiscipline: 0.7, initiative: 0.3, morale: 0.6 },
    mecanico: { label: 'mecánico de campaña', cover: 0.5, fireDiscipline: 0.3, initiative: 0.5, morale: 0.55 },
    conductor: { label: 'conductor', cover: 0.4, fireDiscipline: 0.3, initiative: 0.5, morale: 0.6 },
    tripulante: { label: 'tripulante de blindado', cover: 0.7, fireDiscipline: 0.6, initiative: 0.4, morale: 0.7 },
    piloto: { label: 'piloto', cover: 0.3, fireDiscipline: 0.4, initiative: 0.7, morale: 0.75 },
    ingeniero: { label: 'ingeniero', cover: 0.6, fireDiscipline: 0.3, initiative: 0.6, morale: 0.6 },
    caballeria: { label: 'caballería', cover: 0.2, fireDiscipline: 0.5, initiative: 0.8, morale: 0.7 }
  };

  class CombatTactics {
    constructor(brain) {
      this.brain = brain;
      this.competence = CB.COMPETENCES[(brain.identity.militaryRole || 'fusilero')] || CB.COMPETENCES.fusilero;
      this.morale = 0.65;
      this.suppression = 0;
      this.lastDecision = null;
      this.casualtiesSeen = 0;
      this.roundsFired = 0;
    }

    /* Estado táctico a partir de la percepción y del estado interno. */
    assess(percepts, world) {
      const brain = this.brain;
      const emo = brain.emotions;
      const phys = brain.physiology.cognitiveModifiers();
      const threats = [];
      const allies = [];
      let cover = 0.2;
      for (const p of percepts) {
        if (p.kind !== 'humanoid') continue;
        const hostile = p.entity && p.entity.faction && brain.identity.faction !== p.entity.faction;
        const armed = (p.tags || []).indexOf('arma') >= 0;
        if (hostile && (armed || p.distance < 25)) {
          threats.push({
            id: p.id,
            distance: p.distance,
            bearing: p.bearing,
            confidence: p.confidence,
            armed: armed,
            cover: (p.entity && p.entity.cover) || 0,
            threat: U.clamp((1 - p.distance / 80) * (armed ? 1 : 0.5) * (p.confidence || 0.5), 0, 1)
          });
        } else if (!hostile && p.identified) {
          allies.push({ id: p.id, distance: p.distance, bearing: p.bearing });
        }
        if (p.entity && p.entity.cover !== undefined) cover = Math.max(cover, p.entity.cover);
      }
      const wounds = brain.physiology.state;
      const cohesion = allies.length ? U.clamp(0.4 + allies.length * 0.12, 0, 1) : 0.3;
      const leadership = brain.identity.militaryRole === 'oficial' || brain.identity.militaryRole === 'sargento' || brain.identity.militaryRole === 'teniente' ? 0.85 : 0.4;
      const morale =
        this.competence.morale * 0.5 +
        brain.personality.get('discipline') * 0.3 +
        cohesion * 0.25 +
        leadership * 0.2 +
        brain.personality.get('stressTolerance') * 0.25 -
        emo.get('miedo') * 0.8 -
        emo.get('ira') * 0.1 -
        (wounds.pain > 0.4 ? 0.3 : 0) -
        this.suppression * 0.5 -
        this.casualtiesSeen * 0.05;
      this.morale = U.clamp(morale + 0.25, 0, 1);
      return {
        threats: threats.sort((a, b) => b.threat - a.threat),
        allies: allies,
        cover: cover,
        morale: U.round(this.morale, 2),
        suppression: U.round(this.suppression, 2),
        ammo: (brain.inventory || []).some((i) => i.tags && i.tags.indexOf('municion') >= 0) ? 1 : 0,
        cohesion: U.round(cohesion, 2),
        fatigue: U.round(wounds.fatigue, 2),
        pain: U.round(wounds.pain, 2)
      };
    }

    /* Devuelve intención táctica razonada, no una secuencia prefabricada. */
    decide(percepts, world) {
      const a = this.assess(percepts, world);
      const brain = this.brain;
      const emo = brain.emotions.modifiers();
      const discipline = brain.personality.get('discipline');
      const aggression = brain.personality.get('aggression');
      const top = a.threats[0];
      let decision;

      if (!top) {
        decision = { action: 'vigilar', reason: 'sin amenazas visibles', target: null, morale: a.morale };
      } else if (a.morale < 0.25 && a.pain > 0.35) {
        decision = {
          action: brain.personality.get('loyalty') > 0.65 && discipline > 0.6 ? 'replegarse_con_camaradas' : 'huir',
          reason: 'moral rota por heridas y fuego enemigo',
          target: top.id,
          morale: a.morale
        };
      } else if (a.morale < 0.35) {
        decision = {
          action: discipline > 0.65 ? 'mantener_posicion' : 'buscar_cobertura',
          reason: 'moral baja; la disciplina sostiene la posición',
          target: top.id,
          morale: a.morale
        };
      } else if (a.ammo === 0) {
        decision = { action: 'recargar', reason: 'sin munición', target: null, morale: a.morale };
      } else if (top.distance < 12 && aggression > 0.6 && emo.riskTolerance > 1.1) {
        decision = { action: 'asalto', reason: 'enemigo a corta distancia, ímpetu agresivo', target: top.id, morale: a.morale };
      } else if (a.cover < 0.35) {
        decision = { action: 'buscar_cobertura', reason: 'expuesto y bajo fuego', target: top.id, morale: a.morale };
      } else if (top.armed && top.distance > 45 && brain.memory.skill('fusil') > 0.45) {
        decision = { action: 'fuego_selectivo', reason: 'tirador con pericia a distancia', target: top.id, morale: a.morale };
      } else if (a.suppression > 0.5) {
        decision = { action: 'fuego_de_supresion', reason: 'suprimir para romper el avance enemigo', target: top.id, morale: a.morale };
      } else if (a.allies.length && top.threat > 0.6) {
        decision = { action: 'coordinar_con_escuadra', reason: 'coordinar con los compañeros cercanos', target: top.id, morale: a.morale };
      } else {
        decision = { action: 'disparar', reason: 'amenaza identificada al alcance', target: top.id, morale: a.morale };
      }

      // Un oficial no dispara: dirige. Pero sus hombres no son marionetas.
      if ((brain.identity.militaryRole === 'oficial' || brain.identity.militaryRole === 'teniente') && top) {
        const obey = brain.personality.get('loyalty') * 0.6 + brain.personality.get('discipline') * 0.4;
        decision = {
          action: 'dirigir_escuadra',
          reason: 'oficial: evaluar y ordenar (confianza de la tropa ' + U.round(obey, 2) + ')',
          target: top.id,
          morale: a.morale,
          order: top.distance > 40 ? 'fuego_a_distancia' : a.cover < 0.4 ? 'cubrirse_y_responder' : 'mantener_linea'
        };
      }

      if (a.pain > 0.6 && a.morale < 0.5) {
        decision.reason += '; herido y bajo de moral';
        decision.action = brain.memory.skill('medicina') > 0.3 ? 'autocuración' : decision.action;
      }

      this.lastDecision = {
        t: world ? world.clock.timeSeconds : 0,
        action: decision.action,
        reason: decision.reason,
        morale: a.morale,
        threats: a.threats.length,
        ammo: a.ammo
      };
      AETH.debug.log('combate', brain.identity.name + ': ' + decision.action + ' — ' + decision.reason);
      return decision;
    }

    underFire(intensity) {
      this.suppression = U.clamp(this.suppression + intensity * 0.35, 0, 1);
      if (this.brain.emotions) this.brain.emotions.appraise({ type: 'amenaza', intensity: U.clamp(intensity, 0, 1), reason: 'fuego enemigo' });
    }

    witnessCasualty() {
      this.casualtiesSeen++;
      this.brain.emotions.appraise({ type: 'muerte_conocido', intensity: 0.7, reason: 'compañero caído' });
      this.brain.memory.encodeEpisode({
        summary: 'vio caer a un compañero en combate',
        kind: 'combate',
        location: this.brain.location ? this.brain.location.id : null,
        importance: 0.85,
        valence: -0.9,
        intensity: 0.9,
        time: this.brain.clockTime || 0
      });
    }

    update(dt) {
      this.suppression = U.clamp(this.suppression - dt * 0.0008, 0, 1);
      this.morale = U.clamp(this.morale + dt * 0.00002 * (1 - this.suppression), 0, 1);
    }

    toJSON() {
      return { morale: this.morale, suppression: this.suppression, lastDecision: this.lastDecision, casualtiesSeen: this.casualtiesSeen, roundsFired: this.roundsFired };
    }
    load(d) {
      if (!d) return;
      this.morale = d.morale === undefined ? 0.65 : d.morale;
      this.suppression = d.suppression || 0;
      this.lastDecision = d.lastDecision || null;
      this.casualtiesSeen = d.casualtiesSeen || 0;
      this.roundsFired = d.roundsFired || 0;
    }
  }

  CB.CombatTactics = CombatTactics;
})(typeof window !== 'undefined' ? window : globalThis);
