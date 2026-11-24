/* =========================================================================
   ai/core/brain.js — el cerebro artificial individual.
   Ciclo: entorno → sentidos → percepción → atención → interpretación →
   memoria → necesidades → emoción → planificación → decisión → acción → aprendizaje.
   La frecuencia cognitiva está separada de la del render.
   ========================================================================= */
(function (g) {
  'use strict';
  const AETH = g.AETH;
  const U = AETH.util;
  const S = AETH.species;
  const A = AETH.anatomy;
  const SE = AETH.senses;
  const M = AETH.memory;
  const EMO = AETH.emotion;
  const PER = AETH.perception;
  const PERS = AETH.personality;
  const C = AETH.culture;
  const G = AETH.goals;
  const N = AETH.needs;
  const R = AETH.reasoning;
  const CB = AETH.combat;

  const B = (AETH.brain = {});

  B.LOD_INTERVALS = { 1: 1.5, 2: 12, 3: 120 };

  const clamp01 = U.clamp;

  class Brain {
    constructor(spec, opts) {
      opts = opts || {};
      spec = spec || {};
      this.spec = spec;
      this.id = spec.id || U.uid('npc');
      const seed = spec.seed !== undefined ? spec.seed : U.hashString(this.id + '|' + (spec.name || '') + '|' + (spec.age || 30));
      this.rng = opts.rng || new U.RNG(seed);
      const rng = this.rng;

      /* ---------------- identidad y cultura ---------------- */
      const profession = C.professionOf(spec.profession || spec.role || 'campesino');
      const ethId = spec.ethnicity || 'riberena_borgnon';
      const eth = C.ethnicityOf(ethId);
      const age = U.clamp(spec.age === undefined ? rng.int(18, 62) : spec.age, 1, 120);
      const sex = spec.sex === 'female' ? 'female' : spec.sex === 'male' ? 'male' : rng.chance(0.5) ? 'female' : 'male';
      const conditions = Object.assign({}, spec.conditions || {});
      const education = U.clamp(spec.education === undefined ? profession.education : spec.education, 0, 1);
      const militaryRole = spec.militaryRole || (profession.roleProfile === 'fusilero' ? 'fusilero' : null);

      this.identity = {
        id: this.id,
        name: spec.name || C.nameFor(rng, ethId, sex),
        age: age,
        birthYear: 1922 - Math.floor(age),
        sex: sex,
        role: spec.role || profession.id,
        profession: profession.id,
        professionLabel: profession.label,
        roleProfile: profession.roleProfile,
        militaryRole: militaryRole,
        rank: spec.rank || null,
        ethnicity: ethId,
        ethnicityLabel: eth.label,
        nationality: spec.nationality || this.nationalityFromEthnicity(ethId),
        faction: spec.faction || this.factionFromNationality(spec.nationality || this.nationalityFromEthnicity(ethId)),
        origin: spec.origin || eth.region,
        residence: spec.residence || 'borgnon',
        religion: spec.religion || 'fe_del_hacedor',
        education: education,
        literacy: education > 0.35 && !conditions.illiterate,
        background: spec.background || '',
        familyBurden: spec.familyBurden !== undefined ? spec.familyBurden : rng.chance(0.5),
        poverty: spec.poverty !== undefined ? spec.poverty : rng.chance(0.35),
        vengeance: spec.vengeance !== undefined ? spec.vengeance : rng.chance(0.18),
        ambition: spec.ambition === undefined ? rng.range(0.2, 0.8) : spec.ambition,
        devotion: spec.devotion === undefined ? rng.range(0.15, 0.9) : spec.devotion,
        injured: !!(conditions.kneeInjury || conditions.oldWound || conditions.chronicIllness),
        conditions: conditions,
        militaryRecord: spec.militaryRecord || (/guerra|regimiento|veterano|frente/i.test(spec.background || '') ? { served: true, war: 'Guerra de Orvek', year: 1921 } : null),
        tags: spec.tags || []
      };

      /* ---------------- biología ---------------- */
      this.genome = S.generateGenome(rng, eth.genes || {});
      this.phenotype = S.express(this.genome, {
        age: age,
        sex: sex,
        heightDelta: eth.heightDelta || 0,
        buildDelta: eth.buildDelta || 0,
        coldAdapt: eth.coldAdapt || 0,
        heatAdapt: eth.heatAdapt || 0,
        altitudeAdapt: eth.altitudeAdapt || 0,
        eyeColor: spec.eyeColor,
        hairColor: spec.hairColor
      });
      this.body = A.buildBody(rng, this.phenotype, {
        age: age,
        wear: U.clamp(profession.wear * rng.range(0.65, 1.4) + (age > 55 ? 0.08 : 0), 0, 0.9),
        kneeInjury: !!conditions.kneeInjury,
        oldWound: !!conditions.oldWound,
        chronic: conditions.chronic ? [conditions.chronic] : [],
        scars: conditions.scars || []
      });
      if (conditions.infection) A.applyInjury(this.body, { type: 'wound', severity: 0.4, label: 'herida infectada', infection: 0.5, healDays: 20 });
      this.organs = SE.buildOrgans(this.phenotype, conditions);
      this.physiology = new A.Physiology(rng, this.body, this.phenotype);
      if (conditions.fatigue) this.physiology.state.fatigue = U.clamp(conditions.fatigue, 0, 1.2);
      if (conditions.wounded) A.applyInjury(this.body, { type: 'wound', severity: conditions.wounded, label: 'herida reciente' });

      /* ---------------- personalidad ---------------- */
      const baseDims = this.randomDims(rng, profession, age);
      const traits = (spec.personality || []).slice();
      this.personality = new PERS.Personality(rng, baseDims, traits);
      this.personality.applyTraits(traits);

      /* ---------------- cultura, fe, idiomas, redes ---------------- */
      const knowledge = C.buildKnowledge(rng, { geographicKnowledge: spec.geographicKnowledge || 0, conditions: conditions }, profession, education);
      const faith = C.buildFaith(rng, { branch: spec.branch, devotion: this.identity.devotion }, eth, this.personality);
      const languages = C.buildLanguages(rng, { language: spec.language }, eth, education);
      const social = C.buildSocial(rng, { ethnicity: ethId, role: this.identity.role, background: this.identity.background }, eth, profession);
      this.culture = {
        ethnicity: ethId,
        ethnicityLabel: eth.label,
        nationality: this.identity.nationality,
        faction: this.identity.faction,
        factionLabel: this.factionLabel(this.identity.faction),
        origin: this.identity.origin,
        residence: this.identity.residence,
        profession: profession.id,
        professionLabel: profession.label,
        education: education,
        literacy: knowledge.literacy,
        knowledge: { domains: knowledge.domains, facts: knowledge.facts },
        focusTags: profession.focusTags.slice(),
        faith: faith,
        languages: languages,
        customs: eth.customs.slice(),
        socialClass: education > 0.7 ? 'acomodada' : profession.income > 150 ? 'media' : 'trabajadora',
        values: AETH.culture.religion.values,
        social: social
      };
      this.social = social;

      /* ---------------- memoria ---------------- */
      this.memory = new M.Memory(rng, this.phenotype, faith.devotion > 0.6 ? ['religioso', 'familia'] : ['familia']);
      for (const f of knowledge.facts) this.memory.addFact(f.topic, f.content, f.confidence, 'educación');
      for (const sk of Object.keys(profession.skills || {})) this.memory.ensureSkill(sk, profession.skills[sk]);
      this.memory.addFact('fe del hacedor', 'El Hacedor creó el universo; los santos interceden, no son dioses.', faith.devotion, 'catequesis');
      this.seedMemories(rng, eth, profession, conditions);
      this.memory.clockNow = 0;

      /* ---------------- necesidades, objetivos, emociones ---------------- */
      this.needs = new N.Needs(rng, this.personality, {
        poverty: this.identity.poverty,
        familyBurden: this.identity.familyBurden,
        vengeance: this.identity.vengeance,
        devotion: this.identity.devotion,
        injured: this.identity.injured
      }, this.physiology);
      this.goals = new G.Goals(rng, this.personality, {
        familyBurden: this.identity.familyBurden,
        poverty: this.identity.poverty,
        vengeance: this.identity.vengeance,
        ambition: this.identity.ambition,
        devotion: this.identity.devotion,
        injured: this.identity.injured,
        profession: profession.id,
        role: this.identity.role,
        militaryRole: militaryRole
      }, this.needs);
      this.emotions = new EMO.EmotionSystem(rng, this.personality, {
        religiosity: faith.devotion,
        arcaneComfort: ethId === 'namari_pantanosa' || ethId === 'varendi_selvatica' ? 0.55 : 0.35
      });

      /* ---------------- cognición ---------------- */
      this.perception = new PER.Perception(this);
      this.attention = new PER.Attention(this);
      this.reasoner = new R.Reasoner(this);
      this.tactics = new CB.CombatTactics(this);

      /* ---------------- economía e inventario ---------------- */
      this.economy = {
        money: U.round(profession.income * rng.range(0.1, 0.7) + (age > 40 ? profession.income * 0.5 : 0), 1),
        income: profession.income,
        debt: this.identity.poverty ? U.round(rng.range(10, 160), 1) : 0,
        employment: age >= 15 && profession.id !== 'nino' && !conditions.unemployed,
        workplace: spec.workplace || profession.workPlace,
        foodCost: 2
      };
      this.inventory = this.buildInventory(profession, conditions, rng);

      /* ---------------- estado de simulación ---------------- */
      this.position = { x: spec.x || 0, z: spec.z || 0, facing: spec.facing || 0 };
      this.location = spec.location || { id: 'casa', type: 'casa', name: 'casa' };
      this.climate = { insulation: spec.insulation === undefined ? 0.65 : spec.insulation };
      this.activity = 'inactivo';
      this.currentAction = null;
      this.plan = { ok: false, plan: [], index: 0, goal: null, reason: '' };
      this.task = null;
      this.motion = { active: false };
      this.alive = true;
      this.achievedFacts = {};
      this.intent = { goal: null, action: 'observar', reason: 'recién llegado', target: null, dialogue: null };
      this.lastResult = null;
      this.threatLevel = 0;
      this.worldWoundedNear = false;
      this.clockTime = 0;
      this.lod = opts.lod || 1;
      this.thinkTimer = this.rng.range(0, 2);
      this.stats = { thoughts: 0, decisions: 0, plans: 0, planFailures: 0, actions: 0, failures: 0, distanceWalked: 0, born: Date.now() };
      this.memory.clockNow = 0;
      this.cognitiveEvents = [];
      this.threatCooldown = {};
      this.squadId = spec.squadId || null;
      this.orders = [];
      this.history = [];
      this.dialogueLog = [];
      this.insulation = spec.insulation === undefined ? 0.65 : spec.insulation;
    }

    nationalityFromEthnicity(ethId) {
      const map = {
        montanesa_volskaya: 'volskaya',
        riberena_borgnon: 'eisenmark',
        namari_pantanosa: 'namar',
        varendi_selvatica: 'vardenia',
        ormi_taiga: 'orm',
        serevana_pradera: 'serevan',
        eirhama_costera: 'eirhama',
        pragense_llanura: 'praga',
        zheng_hua: 'zheng_hua',
        durn_karst: 'durn'
      };
      return map[ethId] || 'eisenmark';
    }
    factionFromNationality(nat) {
      const map = {
        volskaya: 'alianza_eisenmark',
        eisenmark: 'alianza_eisenmark',
        argentum: 'alianza_eisenmark',
        genovar: 'alianza_eisenmark',
        praga: 'coalicion_praga',
        veyrn: 'coalicion_praga',
        zheng_hua: 'coalicion_praga',
        vardenia: 'vardenia',
        namar: 'vardenia',
        eirhama: 'caerwyn',
        orm: 'ghar_mor',
        serevan: 'alianza_eisenmark',
        durn: 'durn'
      };
      return map[nat] || 'alianza_eisenmark';
    }
    factionLabel(id) {
      const f = AETH.culture.factions[id];
      return f ? f.label : id;
    }

    randomDims(rng, profession, age) {
      const d = {};
      for (const k of PERS.DIMS) d[k] = U.clamp(0.5 + rng.gauss(0, 0.16), 0.05, 0.95);
      // Correlaciones plausibles (no rígidas)
      d.introversion = U.clamp(1 - d.extroversion + rng.gauss(0, 0.1), 0.05, 0.95);
      d.selfControl = U.clamp(1 - d.impulsivity * 0.7 + rng.gauss(0, 0.12), 0.05, 0.95);
      if (profession.id === 'soldado' || profession.id === 'oficial') {
        d.discipline = U.clamp(d.discipline + 0.15, 0, 0.97);
        d.stressTolerance = U.clamp(d.stressTolerance + 0.1, 0, 0.97);
      }
      if (profession.id === 'mecanico_ferroviario' || profession.id === 'artesano' || profession.id === 'minero') d.prudence = U.clamp(d.prudence + 0.1, 0, 0.97);
      if (profession.id === 'comerciante' || profession.id === 'tabernero') d.sociability = U.clamp(d.sociability + 0.12, 0, 0.97);
      if (age > 55) d.impulsivity = U.clamp(d.impulsivity - 0.08, 0, 0.97);
      if (age < 22) d.impulsivity = U.clamp(d.impulsivity + 0.08, 0, 0.97);
      return d;
    }

    buildInventory(profession, conditions, rng) {
      const inv = [];
      const tagFor = (item) => {
        const s = String(item).toLowerCase();
        if (/fusil|pistola|rifle|bayoneta/.test(s)) return ['arma'];
        if (/municion|municiones/i.test(s)) return ['municion'];
        if (/llave|martillo|formón|pico|azada|herramienta/.test(s)) return ['herramienta'];
        if (/botiqu|venda|morfina|estetoscopio/.test(s)) return ['botiquin'];
        if (/pan|comida|racion/.test(s)) return ['comida'];
        return ['objeto'];
      };
      for (const item of profession.equipment || []) inv.push({ id: U.uid('item'), name: item, tags: tagFor(item) });
      for (const item of this.spec.equipment || []) inv.push({ id: U.uid('item'), name: item, tags: tagFor(item) });
      if (!inv.some((i) => i.tags.indexOf('comida') >= 0) && rng.chance(0.55)) inv.push({ id: U.uid('item'), name: 'raciones secas', tags: ['comida'] });
      if (!inv.some((i) => i.tags.indexOf('botiquin') >= 0) && rng.chance(0.18)) inv.push({ id: U.uid('item'), name: 'botiquín de campaña', tags: ['botiquin'] });
      if ((profession.id === 'soldado' || profession.id === 'oficial') && !inv.some((i) => i.tags.indexOf('municion') >= 0))
        inv.push({ id: U.uid('item'), name: 'munición', tags: ['municion'] });
      if (conditions.kneeBrace) inv.push({ id: U.uid('item'), name: 'rodillera de cuero', tags: ['objeto'] });
      return inv;
    }

    seedMemories(rng, eth, profession, conditions) {
      const t0 = -this.identity.age * 365.25 * 86400;
      this.memory.encodeEpisode({
        summary: 'infancia en ' + eth.region.replace(/_/g, ' ') + '; aprendió las costumbres de ' + eth.label,
        kind: 'infancia',
        location: eth.region,
        importance: 0.55,
        valence: 0.3,
        intensity: 0.4,
        confidence: 0.7,
        time: t0,
        day: 0
      });
      this.memory.encodeEpisode({
        summary: 'aprendizaje del oficio de ' + profession.label,
        kind: 'formacion',
        location: 'taller',
        importance: 0.6,
        valence: 0.35,
        intensity: 0.5,
        confidence: 0.8,
        time: t0 + 18 * 365.25 * 86400,
        day: 0
      });
      if (/guerra|orvek|frente/i.test(this.identity.background) || conditions.kneeInjury || conditions.oldWound) {
        this.memory.encodeEpisode({
          summary: 'Guerra de Orvek: barro, fuego de artillería y compañeros muertos',
          kind: 'guerra',
          location: 'orvek',
          importance: 0.95,
          valence: -0.95,
          intensity: 1,
          confidence: 0.85,
          time: t0 + (this.identity.age - 1) * 365.25 * 86400,
          day: 0
        });
        this.memory.addFact('guerra de orvek', 'Ocho meses de trincheras y un armisticio sin tratado; nadie ganó.', 0.85, 'experiencia');
      }
      if (this.identity.vengeance) {
        this.memory.encodeEpisode({ summary: 'alguien de los suyos no volvió y nadie pagó por ello', kind: 'perdida', location: 'orvek', importance: 0.9, valence: -1, intensity: 1, confidence: 0.7, time: t0 + 500 * 86400 });
      }
      this.memory.learnPlace(this.identity.residence, this.identity.residence, { visits: 5, safety: 0.7, time: 0 });
      this.memory.learnPlace(profession.workPlace, profession.workPlace, { visits: 3, safety: 0.6, time: 0 });
      this.memory.learnPlace(eth.region, eth.label, { visits: 1, safety: 0.5, time: 0 });
      for (const f of this.social.family) this.memory.meetPerson(f.id, f.name, { trustDelta: f.closeness * 0.5, affinityDelta: f.closeness * 0.5 });
      for (const fr of this.social.friends) this.memory.meetPerson(fr.id, fr.name, { trustDelta: fr.trust * 0.6, affinityDelta: 0.3 });
    }

    /* ============================ CICLO COGNITIVO ============================ */
    tick(dtSeconds, world) {
      if (!(dtSeconds > 0)) return this.intent;
      this.clockTime = world && world.clock ? world.clock.timeSeconds : this.clockTime + dtSeconds;
      this.memory.clockNow = this.clockTime;
      const env = world && world.environmentAt ? world.environmentAt(this.position) : { temperatureC: 16, humidity: 0.6, light: 0.6, weather: { fog: 0, rain: 0 } };
      const exertion = this.currentAction ? U.clamp(this.currentAction.exertion || 0.25, 0, 1) : 0.12;
      const asleep = this.activity === 'durmiendo';
      this.physiology.update(dtSeconds, {
        temperatureC: env.temperatureC,
        humidity: env.humidity,
        exertion: asleep ? 0.02 : exertion,
        asleep: asleep,
        insulation: this.insulation,
        fear: this.emotions.get('miedo'),
        threat: this.threatLevel,
        painSpike: this.pendingPainSpike || 0
      });
      this.pendingPainSpike = 0;
      this.emotions.physiological(this.physiology, this.personality);
      this.emotions.update(dtSeconds);
      this.tactics.update(dtSeconds);
      this.tactics.suppression = this.tactics.suppression;

      const pain = this.physiology.state.pain;
      const cold = env.temperatureC < 8 ? U.clamp((8 - env.temperatureC) / 20, 0, 1) : 0;
      this.needs.update(dtSeconds / 3600, {
        working: this.activity === 'trabajando',
        danger: this.threatLevel > 0.4,
        pain: pain,
        cold: cold
      });
      this.memory.update(dtSeconds / 86400, this.personality);
      this.attention.habituation = this.attention.habituation;

      if (this.lod <= 2) {
        // El pensamiento corre en tiempo real, no en tiempo simulado acelerado.
        const realDt = world && world.realDt > 0 ? world.realDt : dtSeconds;
        this.thinkTimer -= realDt;
        if (this.thinkTimer <= 0) {
          this.cognitiveCycle(dtSeconds, world, env);
          this.thinkTimer = B.LOD_INTERVALS[this.lod] * this.rng.range(0.85, 1.25);
        }
      }
      return this.intent;
    }

    cognitiveCycle(dt, world, env) {
      this.stats.thoughts++;
      const percepts = this.perception.scan(world || B.NULL_WORLD);
      const all = percepts.percepts.concat(percepts.sounds, percepts.smells, percepts.arcane);
      const attention = this.attention.select(all, { time: this.clockTime });
      this.updateThreat(percepts, env);
      this.goals.refreshFromNeeds(this.clockTime);
      this.cognitiveEvents = [];

      // Aprendizaje incidental: reconocer personas y lugares.
      for (const p of percepts.percepts) {
        if (p.identified && p.kind === 'humanoid') {
          const known = this.memory.people[p.id];
          if (!known) {
            this.memory.meetPerson(p.id, p.name, { trustDelta: 0 });
            this.memory.encodeEpisode({ summary: 'vio a ' + p.name + ' en ' + (percepts.place ? percepts.place.name || percepts.place.id : 'la calle'), kind: 'social', location: percepts.place ? percepts.place.id : null, participants: [p.id], importance: 0.2, valence: 0, intensity: 0.2, time: this.clockTime });
          } else {
            known.familiarity = U.clamp(known.familiarity + 0.02, 0, 1);
          }
        }
      }
      if (percepts.place) this.memory.learnPlace(percepts.place.id, percepts.place.name || percepts.place.id, { visits: 0.02, time: this.clockTime, safety: this.threatLevel > 0.5 ? 0.3 : 0.6 });

      // Emociones ante lo percibido (solo hechos relevantes, con enfriamiento).
      for (const p of percepts.arcane) {
        if (!this.threatCooldown['arc_' + p.source] || this.clockTime - this.threatCooldown['arc_' + p.source] > 600) {
          this.threatCooldown['arc_' + p.source] = this.clockTime;
          this.emotions.appraise({ type: p.falsePositive ? 'estimulo_desconocido' : 'arcano', intensity: U.clamp(p.confidence + 0.2, 0, 1), time: this.clockTime });
          this.memory.encodeEpisode({ summary: p.summary, kind: 'arcano', location: percepts.place ? percepts.place.id : null, importance: 0.6, valence: 0, intensity: p.confidence, confidence: 0.5, time: this.clockTime });
        }
      }
      for (const p of percepts.percepts) {
        if (!p.identified) continue;
        const armed = (p.tags || []).indexOf('arma') >= 0;
        if (armed && p.confidence > 0.55 && this.threatLevel > 0.45) {
          const key = 'threat_' + p.id;
          if (!this.threatCooldown[key] || this.clockTime - this.threatCooldown[key] > 45) {
            this.threatCooldown[key] = this.clockTime;
            this.emotions.appraise({ type: 'amenaza', intensity: U.clamp(p.confidence, 0, 1), time: this.clockTime, reason: 'persona armada cerca' });
            this.memory.encodeEpisode({ summary: 'vio a un desconocido armado a ' + p.distance + ' m', kind: 'peligro', location: percepts.place ? percepts.place.id : null, participants: [p.id], importance: 0.65, valence: -0.7, intensity: 0.7, time: this.clockTime });
          }
        }
      }

      this.decide(world, percepts);
    }

    updateThreat(percepts, env) {
      let threat = 0;
      this.worldWoundedNear = false;
      for (const p of percepts.percepts) {
        if ((p.tags || []).indexOf('herido') >= 0) this.worldWoundedNear = true;
        if (!p.identified) {
          threat = Math.max(threat, 0.15 * (1 - p.distance / 60));
          continue;
        }
        const hostile = p.entity && p.entity.faction && p.entity.faction !== this.identity.faction;
        const armed = (p.tags || []).indexOf('arma') >= 0;
        if (hostile && armed) threat = Math.max(threat, U.clamp((1 - p.distance / 90) * (0.5 + p.confidence * 0.5), 0, 1));
        if (p.entity && p.entity.threatening) threat = Math.max(threat, U.clamp(1 - p.distance / 40, 0, 1));
      }
      for (const s of percepts.sounds) {
        if (s.soundKind === 'disparo') threat = Math.max(threat, 0.5 * (1 - s.distance / 100));
        if (s.soundKind === 'explosion') threat = Math.max(threat, 0.8);
        if (s.soundKind === 'grito') threat = Math.max(threat, 0.3);
      }
      const smooth = 0.65;
      this.threatLevel = U.clamp(this.threatLevel * smooth + threat * (1 - smooth), 0, 1);
      if (this.threatLevel > 0.55) this.needs.state.seguridad.level = Math.max(this.needs.state.seguridad.level, this.threatLevel);
    }

    decide(world, percepts) {
      this._physMods = this.physiology.cognitiveModifiers();
      const inDanger = this.threatLevel > 0.45 || (world && world.alertLevel > 0.5);
      const military = !!this.identity.militaryRole;
      let decision = null;

      if (inDanger) {
        const emo = this.emotions.modifiers();
        if (military) {
          decision = this.tactics.decide(percepts.percepts, world);
        } else if (this.threatLevel > 0.7 && (this.personality.get('confidence') < 0.45 || emo.riskTolerance < 0.7)) {
          decision = { action: 'huir', reason: 'civil sin entrenamiento ante una amenaza grave', target: null };
        } else if (this.threatLevel > 0.7) {
          decision = { action: 'buscar_cobertura', reason: 'busca protegerse sin perder de vista el peligro', target: null };
        } else {
          decision = { action: 'vigilar', reason: 'alerta moderada; observa antes de actuar', target: null };
        }
      }

      if (!decision) {
        const selection = this.goals.select({ time: this.clockTime, emotion: this.emotions });
        const goal = selection.chosen;
        if (goal) {
          // Un objetivo cuyas condiciones ya se cumplen no se planifica: se cierra.
          const factsNow = AETH.goap.factsFor(this);
          const already = (goal.conditions || []).length && goal.conditions.every((c) => factsNow.has(c));
          if (already) {
            this.goals.complete(goal);
            const nextSel = this.goals.select({ time: this.clockTime, emotion: this.emotions });
            if (!nextSel.chosen) return this.intent;
            decision = null;
          }
          const planMatches = this.plan.ok && this.plan.goal && this.plan.goal.id === goal.id && this.plan.index < this.plan.plan.length;
          if (!planMatches) {
            const res = this.reasoner.plan(goal, world);
            this.stats.plans++;
            if (res.ok && res.plan.length) {
              this.plan = { ok: true, plan: res.plan, index: 0, goal: goal, reason: res.reason, cost: res.cost };
              this.stats.decisions++;
            } else {
              this.stats.planFailures++;
              this.plan = { ok: false, plan: [], index: 0, goal: goal, reason: res.reason };
              this.memory.encodeEpisode({
                summary: 'no pudo cumplir «' + goal.label + '»: ' + res.reason,
                kind: 'fracaso',
                importance: 0.3,
                valence: -0.3,
                intensity: 0.3,
                time: this.clockTime
              });
              this.emotions.appraise({ type: 'fracaso', intensity: 0.25, time: this.clockTime });
              this.goals.fail(goal, res.reason);
            }
          }
          let action = null;
          let reason = this.plan.reason;
          if (this.plan.ok && this.plan.plan[this.plan.index]) {
            action = this.plan.plan[this.plan.index];
            reason = 'plan: ' + this.plan.plan.map((a) => a.label).join(' → ');
          } else {
            const fb = this.reasoner.chooseFallback(this, world);
            action = fb.action;
            reason = fb.reason + (goal ? ' para «' + goal.label + '»' : '');
          }
          if (action) {
            decision = {
              action: action.id,
              actionDef: action,
              goal: goal,
              reason: reason,
              target: null,
              alternatives: this.plan.ok ? [] : this.reasoner.chooseFallback(this, world).alternatives
            };
            this.stats.decisions++;
          }
        }
      }

      if (!decision) {
        decision = { action: 'observar', actionDef: { id: 'observar', label: 'observar', durationMin: 10, needs: {}, risk: 0, place: [] }, goal: null, reason: 'sin nada urgente que hacer' };
      }

      decision.at = this.clockTime;
      this.intent = {
        goal: decision.goal ? decision.goal.label : null,
        goalId: decision.goal ? decision.goal.id : null,
        action: decision.action,
        actionLabel: (decision.actionDef && decision.actionDef.label) || decision.action,
        reason: decision.reason,
        target: decision.target || null,
        dialogue: decision.action === 'conversar' || decision.action === 'dirigir_escuadra' ? this.speak({ context: decision.action }) : null,
        nextIntent: decision.goal ? decision.goal.label : 'esperar'
      };
      this.pendingDecision = decision;
      if (this.cognitiveEvents.length > 60) this.cognitiveEvents.shift();
      this.cognitiveEvents.push({ t: this.clockTime, action: decision.action, reason: decision.reason, goal: this.intent.goal });
      return this.intent;
    }

    /* ============================ ACCIONES ============================ */
    chooseAction(world) {
      if (!this.pendingDecision) this.decide(world, this.perception.last);
      return this.pendingDecision;
    }

    executeAction(world) {
      const d = this.pendingDecision;
      if (!d) return { ok: false, reason: 'sin decisión' };
      if (world && world.performAction) return world.performAction(this, d.actionDef || AETH.goap.BY_ID[d.action]);
      return { ok: false, reason: 'mundo sin ejecutor' };
    }

    beginAction(actionDef) {
      this.currentAction = actionDef ? Object.assign({}, actionDef, { startedAt: this.clockTime }) : null;
      this.activity = actionDef ? actionDef.label : 'inactivo';
    }

    /* Resultado de la acción: satisfacción, aprendizaje, memoria y emoción. */
    onActionComplete(action, outcome, world) {
      if (!action) return;
      outcome = outcome || { success: true, quality: 0.7 };
      const quality = U.clamp(outcome.quality === undefined ? 0.7 : outcome.quality, 0, 1);
      const success = outcome.success !== false;
      const fatigue = this.physiology.state.fatigue;
      let eff = success ? U.clamp(quality * (1 - fatigue * 0.25) * (1 - this.physiology.state.pain * 0.2), 0.15, 1) : 0;
      if (action.id === 'descansar') eff *= 1 - U.clamp(fatigue - 0.3, 0, 0.7) * 0.8;

      if (success) {
        for (const need of Object.keys(action.needs || {})) {
          this.needs.satisfy(need, action.needs[need] * eff);
        }
        for (const need of Object.keys(action.strain || {})) {
          if (this.needs.state[need]) this.needs.state[need].level = U.clamp(this.needs.state[need].level + action.strain[need], 0, 1.2);
        }
      } else {
        for (const need of Object.keys(action.strain || {})) {
          if (this.needs.state[need]) this.needs.state[need].level = U.clamp(this.needs.state[need].level + action.strain[need] * 0.6, 0, 1.2);
        }
      }

      // Efectos directos
      if (action.id === 'comer' && success) this.physiology.eat(0.8 * eff);
      if (action.id === 'beber_agua' && success) this.physiology.drink(0.85);
      if (action.id === 'dormir') {
        this.physiology.sleepRestore(7.5 * eff);
        const cons = this.memory.consolidate(7.5 * eff);
        this.pendingPainSpike = 0.05;
        AETH.debug.log('sueño', this.identity.name + ' consolidó ' + cons.consolidated + ' recuerdos');
      }
      if (action.id === 'beber_alcohol') this.physiology.addSubstance('alcohol');
      if (action.id === 'cobrar_salario' && success) {
        this.economy.money += this.economy.income * 0.45;
        if (this.economy.debt > 0) {
          const pay = Math.min(this.economy.debt, this.economy.income * 0.15);
          this.economy.debt = U.round(this.economy.debt - pay, 1);
        }
      }
      if (action.id === 'comprar_comida' && success) {
        this.economy.money = Math.max(0, this.economy.money - this.economy.foodCost);
        if (!this.inventory.some((i) => i.tags.indexOf('comida') >= 0)) this.inventory.push({ id: U.uid('item'), name: 'provisiones', tags: ['comida'] });
      }
      if (action.id === 'buscar_trabajo' && success && this.rng.chance(0.55)) this.economy.employment = true;
      if (action.id === 'tratar_heridas' && success) {
        const inj = this.body.injuries.filter((i) => !i.chronic).sort((a, b) => b.severity - a.severity)[0];
        if (inj) inj.severity = U.clamp(inj.severity - 0.25 * eff, 0, 1);
        this.physiology.state.infection = U.clamp(this.physiology.state.infection - 0.2, 0, 1);
      }
      if (action.id === 'disparar') this.tactics.roundsFired++;
      if (action.id === 'saquear' && success && this.emotions.get('culpa') < 0.6) {
        this.emotions.appraise({ type: 'transgresion', intensity: 0.5, time: this.clockTime });
      }

      // Habilidades: la práctica mejora con rendimientos decrecientes
      const skillMap = {
        trabajar: this.primarySkill(),
        practicar: this.primarySkill(),
        cazar: 'rastreo',
        tratar_heridas: 'medicina',
        visitar_medico: 'medicina',
        disparar: 'fusil',
        patrullar: 'disciplina',
        entrenar: 'fusil',
        conversar: 'idiomas',
        leer: 'escritura'
      };
      const skillId = skillMap[action.id];
      if (skillId && success) {
        const rate = this.physiology.cognitiveModifiers().learningRate;
        this.memory.practiceSkill(skillId, quality, (action.durationMin || 30) / 60, rate);
      }

      // Aprendizaje por refuerzo ligero
      const ctx = this.reasoner.ctxTag(this.goalForAction(action));
      const reward = success ? U.clamp(0.2 + U.sum(Object.keys(action.needs || {}).map((n) => action.needs[n] * this.needs.urgency(n))) * 0.5 - action.risk * 0.2, -0.2, 1) : -0.5;
      this.reasoner.learn(action.id, ctx, reward);

      // Memoria episódica de lo significativo
      if (Math.abs(reward) > 0.25 || action.risk > 0.3) {
        this.memory.encodeEpisode({
          summary: action.label + (success ? '' : ' (falló)') + ' en ' + (this.location ? this.location.name || this.location.type : 'el lugar'),
          kind: action.tags[0] || 'accion',
          location: this.location ? this.location.id : null,
          importance: U.clamp(0.25 + Math.abs(reward) * 0.6 + action.risk, 0, 0.95),
          valence: reward,
          intensity: U.clamp(Math.abs(reward) + action.risk * 0.5, 0, 1),
          time: this.clockTime
        });
      }
      if (action.social) this.emotions.appraise({ type: 'elogio', intensity: 0.2, time: this.clockTime });

      // Hechos alcanzados: permiten verificar objetivos cumplidos y encadenar planes.
      const horizon = this.clockTime + 3 * 3600;
      for (const f of action.add) this.achievedFacts[f] = horizon;
      for (const f of action.del) delete this.achievedFacts[f];
      for (const k of Object.keys(this.achievedFacts)) if (this.achievedFacts[k] < this.clockTime) delete this.achievedFacts[k];

      // Avance del plan y consecución de objetivos
      if (this.plan.ok && this.plan.goal) {
        this.plan.index++;
        const facts = AETH.goap.factsFor(this);
        const requirements = this.plan.goal.conditions || [];
        const done = requirements.every((r) => facts.has(r));
        if (done) {
          this.goals.complete(this.plan.goal);
          this.emotions.appraise({ type: 'exito', intensity: 0.5, time: this.clockTime });
          this.personality.drift({ type: 'exito', intensity: 0.45, time: this.clockTime });
          this.plan = { ok: false, plan: [], index: 0, goal: null, reason: 'completado' };
        } else if (this.plan.index >= this.plan.plan.length) {
          this.goals.fail(this.plan.goal, 'el plan terminó sin cumplir el objetivo');
          this.plan = { ok: false, plan: [], index: 0, goal: null, reason: 'plan agotado' };
        }
      }

      this.lastResult = { action: action.id, success: success, quality: quality, reward: U.round(reward, 2), at: this.clockTime };
      this.stats.actions++;
      if (!success) this.stats.failures++;
      this.activity = 'inactivo';
      this.currentAction = null;
      this.history.push({ t: this.clockTime, action: action.id, result: success ? 'ok' : 'fallo', goal: this.intent.goal });
      if (this.history.length > 120) this.history.shift();
      return this.lastResult;
    }

    onActionFailed(action, reason, world) {
      if (!action) return;
      this.emotions.appraise({ type: 'fracaso', intensity: 0.4, time: this.clockTime });
      this.goals.fail(this.plan.goal, reason);
      this.reasoner.blockAction(this.plan.goal, action, world, 45);
      this.reasoner.learn(action.id, this.reasoner.ctxTag(this.plan.goal), -0.6);
      this.memory.encodeEpisode({
        summary: 'intentó ' + action.label + ' y no pudo: ' + reason,
        kind: 'fracaso',
        importance: 0.45,
        valence: -0.4,
        intensity: 0.5,
        time: this.clockTime
      });
      this.plan = { ok: false, plan: [], index: 0, goal: null, reason: reason };
      this.task = null;
      this.stats.failures++;
      this.activity = 'inactivo';
      AETH.debug.log('fallo', this.identity.name + ': ' + action.label + ' — ' + reason);
      return { ok: false, reason: reason };
    }

    goalForAction(action) {
      return this.plan.goal || (this.pendingDecision ? this.pendingDecision.goal : null);
    }

    primarySkill() {
      const map = {
        mecanico_ferroviario: 'mecanica',
        ferroviario: 'ferrocarriles',
        soldado: 'fusil',
        oficial: 'mando',
        medico: 'medicina',
        comerciante: 'comercio',
        cazador: 'rastreo',
        campesino: 'labranza',
        sacerdote: 'liturgia',
        profesor: 'ensenanza',
        marinero: 'navegacion',
        piloto: 'pilotaje',
        minero: 'picado',
        artesano: 'artesania',
        tabernero: 'hosteleria',
        nino: 'juego'
      };
      return map[this.identity.profession] || 'mantenimiento';
    }

    /* ============================ DIÁLOGO ============================ */
    speak(ctx) {
      ctx = ctx || {};
      const emo = this.emotions.modifiers();
      const tone = emo.speech.tone;
      const urgency = emo.speech.urgency;
      const p = this.personality;
      const edu = this.identity.education;
      const templates = {
        saludo: ['Buen día.', 'El Hacedor te guarde.', '¿Qué se ofrece?', 'Vaya, un rostro conocido.'],
        amenaza: ['Apártate de ahí.', 'No des un paso más.', 'Esto no es asunto tuyo.'],
        miedo: ['No, no, no…', 'Hay que salir de aquí.', 'Que el Hacedor nos ampare.'],
        orden: ['¡A cubierto!', '¡Fuego a voluntad!', 'Mantened la línea.', 'Que nadie retroceda.'],
        trabajo: ['La máquina no se arregla sola.', 'Otra jornada más.', 'Esto hay que apretarlo bien.'],
        luto: ['Se fue demasiado pronto.', 'Rezo por él cada noche.', 'La guerra se lo llevó.'],
        fe: ['El Hacedor proveerá.', 'San Corvus nos escuche.', 'No me perdono, pero rezo.'],
        mercado: ['¿Cuánto por esto?', 'Le doy dos marcos y ni uno más.', 'Está caro este invierno.'],
        charla: ['¿Supiste lo del tren?', 'Dicen que cierran la frontera.', 'Mi rodilla no aguanta el frío.', 'Los tiempos están revueltos.'],
        cansancio: ['Necesito sentarme.', 'No doy más.', 'Déjame descansar.'],
        dolor: ['Ay… la rodilla.', 'No es nada, sigue.', 'Me duele hasta respirar.']
      };
      let pool = 'charla';
      if (ctx.context === 'dirigir_escuadra') pool = 'orden';
      else if (urgency > 0.6) pool = emotionalPool(tone);
      else if (ctx.context === 'conversar') pool = p.get('sociability') > 0.55 ? 'saludo' : 'charla';
      else if (this.threatLevel > 0.4) pool = 'amenaza';
      else if (this.needs.get('alimentacion') > 0.7) pool = 'mercado';
      else if (this.physiology.state.pain > 0.45) pool = 'dolor';
      else if (this.physiology.state.fatigue > 0.7) pool = 'cansancio';

      function emotionalPool(t) {
        if (t === 'miedo' || t === 'ansiedad') return 'miedo';
        if (t === 'ira' || t === 'frustracion') return 'amenaza';
        if (t === 'tristeza') return 'luto';
        if (t === 'alegria' || t === 'orgullo') return 'saludo';
        return 'charla';
      }

      let line = this.rng.pick(templates[pool] || templates.charla);
      // Marca de educación y oficio: un mecánico habla de máquinas, un médico de heridas.
      if (ctx.context === 'conversar' && this.rng.chance(0.35)) {
        const flavour = {
          mecanico_ferroviario: 'El silbido de la caldera no me deja dormir.',
          soldado: 'En Orvek aprendí a no asomar dos veces.',
          oficial: 'La disciplina es lo único que sostiene una línea.',
          medico: 'Hay heridas que no se ven y matan igual.',
          comerciante: 'Todo tiene un precio, hasta el silencio.',
          cazador: 'Esta mañana había huellas frescas junto al río.',
          campesino: 'Si no llueve esta semana, perdemos la cosecha.',
          sacerdote: 'El Hacedor no promete una vida fácil.',
          ferroviario: 'El correo de las seis no espera a nadie.',
          minero: 'La mina cruje antes de caer. Hay que escucharla.',
          nino: '¿Es verdad que hay dragones en la cordillera?',
          artesano: 'La madera verde se dobla; la seca se parte.',
          profesor: 'Un pueblo que no lee es un pueblo que obedece.',
          marinero: 'El faro de Eirhama se apagó tres noches.',
          piloto: 'Desde arriba las fronteras no existen.',
          tabernero: 'Aquí se entera uno de todo antes que el telégrafo.'
        };
        if (flavour[this.identity.profession]) line += ' ' + flavour[this.identity.profession];
      }
      if (edu < 0.3 && this.rng.chance(0.5)) line = line.replace(/mantened|apártate/gi, (m) => (m === 'mantened' ? 'mantened' : 'aparta'));
      const out = { text: line, tone: tone, language: this.culture.languages[0].id, urgency: U.round(urgency, 2), speaker: this.identity.name };
      this.dialogueLog.push(out);
      if (this.dialogueLog.length > 25) this.dialogueLog.shift();
      return out;
    }

    /* ============================ ESTADO / PERSISTENCIA ============================ */
    getState(world) {
      const env = world && world.environmentAt ? world.environmentAt(this.position) : null;
      return {
        npcId: this.id,
        identity: this.identity,
        biology: {
          genetics: this.genome.genes,
          phenotype: {
            altura: this.phenotype.heightCm,
            peso: this.phenotype.massKg,
            complexion: this.phenotype.build,
            componentes: this.phenotype.components,
            longevidad: this.phenotype.longevity
          },
          anatomy: {
            articulaciones: Object.keys(this.body.joints).reduce((o, k) => {
              o[k] = { integridad: U.round(this.body.joints[k].integrity, 2), dolor: U.round(this.body.joints[k].pain, 2), nota: this.body.joints[k].note };
              return o;
            }, {}),
            lesiones: this.body.injuries.map((i) => ({ label: i.label, severidad: U.round(i.severity, 2), cronica: !!i.chronic })),
            sangre: U.round(this.body.bloodVolume, 2)
          },
          physiology: this.physiology.describe(),
          nervousSystem: this.physiology.cognitiveModifiers(),
          senses: SE.describe(this.organs)
        },
        cognition: {
          perception: {
            luz: this.perception.last.light,
            lugar: this.perception.last.place ? this.perception.last.place.id : null,
            vistos: this.perception.last.percepts.length,
            sonidos: this.perception.last.sounds.length,
            olores: this.perception.last.smells.length,
            arcano: this.perception.last.arcane.length
          },
          attention: {
            foco: this.attention.focus.map((f) => f.summary).slice(0, 6),
            capacidad: this.physiology.cognitiveModifiers().workingMemorySlots,
            cambios: this.attention.switches
          },
          memory: this.memory.summary(),
          emotion: this.emotions.describe(),
          mood: U.round(this.emotions.mood, 2),
          reasoning: this.reasoner.explain(),
          learning: { acciones: Object.keys(this.reasoner.q).length, habilidades: Object.keys(this.memory.procedural).length }
        },
        personality: {
          dims: this.personality.dims,
          summary: this.personality.summary(),
          contradictions: this.personality.contradictions
        },
        culture: {
          ethnicity: this.culture.ethnicity,
          nationality: this.culture.nationality,
          faction: this.culture.factionLabel,
          residence: this.culture.residence,
          profession: this.culture.professionLabel,
          education: U.round(this.culture.education, 2),
          literacy: this.culture.literacy,
          language: this.culture.languages,
          religion: this.culture.faith,
          knowledge: { domains: this.culture.knowledge.domains, facts: Object.keys(this.memory.semantic).length },
          customs: this.culture.customs
        },
        social: this.social,
        needs: this.needs.describe(),
        goals: this.goals.describe(),
        skills: Object.keys(this.memory.procedural).reduce((o, k) => {
          o[k] = U.round(this.memory.procedural[k].level, 2);
          return o;
        }, {}),
        equipment: this.inventory,
        health: this.physiology.describe(),
        environment: env,
        currentState: {
          activity: this.activity,
          intent: this.intent,
          plan: this.plan.ok ? this.plan.plan.map((a) => a.label) : [],
          planReason: this.plan.reason,
          location: this.location,
          lod: this.lod,
          stats: this.stats,
          lastResult: this.lastResult,
          threatLevel: U.round(this.threatLevel, 2)
        },
        memory: {
          recentEpisodic: this.memory.episodic.slice(-8).reverse().map((e) => ({ summary: e.summary, importance: U.round(e.importance, 2), confidence: U.round(e.confidence, 2), day: e.day })),
          people: Object.keys(this.memory.people).slice(0, 10).map((k) => ({ name: this.memory.people[k].name, trust: U.round(this.memory.people[k].trust, 2), familiarity: U.round(this.memory.people[k].familiarity, 2) })),
          places: Object.keys(this.memory.places).slice(0, 10)
        },
        history: this.history.slice(-10).reverse(),
        dialogue: this.dialogueLog.slice(-3)
      };
    }

    /* Respuesta estructurada para el juego (formato del prompt maestro). */
    getResponse() {
      const focus = this.perception.last;
      return {
        npcId: this.id,
        internalState: {
          stress: U.round(this.physiology.state.cortisol, 2),
          fear: U.round(this.emotions.get('miedo'), 2),
          fatigue: U.round(this.physiology.state.fatigue, 2),
          pain: U.round(this.physiology.state.pain, 2),
          morale: this.identity.militaryRole ? this.tactics.morale : undefined
        },
        perception: {
          threatDetected: this.threatLevel > 0.4,
          confidence: focus.percepts.length ? U.round(U.maxBy(focus.percepts, (p) => p.confidence).confidence, 2) : 0,
          knownThreats: focus.percepts.filter((p) => p.identified && p.entity && p.entity.faction !== this.identity.faction).map((p) => p.id),
          heard: focus.sounds.length,
          arcane: focus.arcane.length
        },
        decision: { goal: this.intent.goal, action: this.intent.action, reason: this.intent.reason },
        dialogue: this.intent.dialogue,
        nextIntent: this.intent.nextIntent || this.intent.nextIntent || 'continuar'
      };
    }

    setGoal(goal) {
      if (!goal) return null;
      const gl = goal instanceof G.Goal ? goal : new G.Goal(goal);
      gl.source = gl.source || 'externo';
      this.goals.list.push(gl);
      this.goals.lastSelection = { id: gl.id, label: gl.label, utility: gl.utility, at: this.clockTime };
      this.plan = { ok: false, plan: [], index: 0, goal: null, reason: 'objetivo impuesto' };
      return gl;
    }

    remember(ev) {
      return this.memory.encodeEpisode(ev);
    }

    learn(exp) {
      if (!exp) return;
      if (exp.action) this.reasoner.learn(exp.action, exp.context || 'general', exp.reward || 0);
      if (exp.skill) this.memory.practiceSkill(exp.skill, exp.quality || 0.5, exp.hours || 1);
      if (exp.emotion) this.emotions.appraise(exp.emotion);
      if (exp.episode) this.memory.encodeEpisode(exp.episode);
    }

    perceive(world) {
      return this.perception.scan(world);
    }

    think(dt, world) {
      return this.tick(dt, world);
    }

    getNextIntent() {
      return this.intent;
    }

    /* --------------------- LOD 2 y 3 --------------------- */
    tickRegional(dtHours, world) {
      const dt = dtHours * 3600;
      const env = world && world.environmentAt ? world.environmentAt(this.position) : { temperatureC: 16, humidity: 0.6 };
      this.clockTime = world && world.clock ? world.clock.timeSeconds : this.clockTime + dt;
      this.memory.clockNow = this.clockTime;
      this.physiology.update(dt, { temperatureC: env.temperatureC, humidity: env.humidity, exertion: 0.2, asleep: this.activity === 'durmiendo', insulation: this.insulation });
      this.needs.update(dtHours, { working: this.activity === 'trabajando' });
      this.emotions.update(dt);
      this.memory.update(dtHours / 24, this.personality);
      this.goals.refreshFromNeeds(this.clockTime);
      // Los individuos fuera de cámara también deciden: viven, no esperan.
      if (!this.task) this.decide(world, this.perception.last);
      return this.intent;
    }

    tickAbstract(dtDays, world) {
      const dt = dtDays * 86400;
      this.clockTime = world && world.clock ? world.clock.timeSeconds : this.clockTime + dt;
      this.memory.clockNow = this.clockTime;
      this.physiology.update(dt, { temperatureC: 14, humidity: 0.6, exertion: 0.15, asleep: true });
      this.needs.update(dtDays * 24, {});
      this.memory.update(dtDays, this.personality);
      this.emotions.update(dt);
      // Economía abstracta y salud
      if (this.economy.employment) this.economy.money += this.economy.income * dtDays * 0.5;
      this.economy.money -= dtDays * (0.8 + (this.identity.familyBurden ? 1.2 : 0.3));
      if (this.economy.money < 0) {
        this.economy.money = 0;
        this.needs.state.economia.level = U.clamp(this.needs.state.economia.level + dtDays * 0.12, 0, 1);
        if (this.rng.chance(dtDays * 0.02)) this.economy.employment = false;
      }
      this.identity.age += dtDays / 365.25;
      if (this.identity.age > this.phenotype.longevity && this.rng.chance(dtDays * 0.01)) this.alive = false;
      return this.intent;
    }

    /* --------------------- Serialización --------------------- */
    save() {
      return U.sanitize({
        version: AETH.version,
        spec: this.spec,
        id: this.id,
        identity: this.identity,
        genome: this.genome,
        organs: this.organs,
        physiology: this.physiology.toJSON(),
        personality: this.personality.toJSON(),
        culture: this.culture,
        memory: this.memory.toJSON(),
        needs: this.needs.toJSON(),
        goals: this.goals.toJSON(),
        emotions: this.emotions.toJSON(),
        attention: this.attention.toJSON(),
        perception: this.perception.toJSON(),
        reasoner: this.reasoner.toJSON(),
        tactics: this.tactics.toJSON(),
        economy: this.economy,
        inventory: this.inventory,
        position: this.position,
        location: this.location,
        activity: this.activity,
        intent: this.intent,
        plan: { ok: this.plan.ok, goalId: this.plan.goal ? this.plan.goal.id : null, reason: this.plan.reason, plan: (this.plan.plan || []).map((a) => a.id), index: this.plan.index },
        stats: this.stats,
        history: this.history,
        dialogueLog: this.dialogueLog,
        clockTime: this.clockTime,
        lod: this.lod,
        alive: this.alive !== false
      });
    }

    load(data) {
      if (!data) return this;
      if (data.identity) U.deepMerge(this.identity, data.identity);
      if (data.genome) U.deepMerge(this.genome, data.genome);
      if (data.organs) U.deepMerge(this.organs, data.organs);
      this.physiology.load(data.physiology);
      this.personality.load(data.personality);
      if (data.culture) U.deepMerge(this.culture, data.culture);
      this.memory.load(data.memory);
      this.needs.load(data.needs);
      this.goals.load(data.goals);
      this.emotions.load(data.emotions);
      this.attention.load(data.attention);
      this.perception.load(data.perception);
      this.reasoner.load(data.reasoner);
      this.tactics.load(data.tactics);
      if (data.economy) U.deepMerge(this.economy, data.economy);
      if (data.inventory) this.inventory = data.inventory;
      if (data.position) U.deepMerge(this.position, data.position);
      if (data.location) this.location = data.location;
      this.activity = data.activity || 'inactivo';
      this.intent = data.intent || this.intent;
      this.stats = U.deepMerge(this.stats, data.stats || {});
      this.history = data.history || [];
      this.dialogueLog = data.dialogueLog || [];
      this.clockTime = data.clockTime || 0;
      this.lod = data.lod || 1;
      this.alive = data.alive !== false;
      this.memory.clockNow = this.clockTime;
      return this;
    }

    describeShort() {
      return {
        id: this.id,
        nombre: this.identity.name,
        edad: this.identity.age,
        oficio: this.identity.professionLabel,
        etnia: this.identity.ethnicityLabel,
        faccion: this.culture.factionLabel,
        actividad: this.activity,
        objetivo: this.intent.goal,
        animo: this.emotions.dominant().name,
        lod: this.lod
      };
    }
  }

  B.Brain = Brain;

  B.NULL_WORLD = {
    clock: { timeSeconds: 0, day: 1, hour: 12, phaseOfDay: 'mediodía', season: 'primavera' },
    environmentAt: function () {
      return { temperatureC: 16, humidity: 0.6, light: 0.7, weather: { fog: 0, rain: 0 }, noiseFloor: 0.1, wind: { x: 0, z: 0, strength: 0.1 } };
    },
    entitiesNear: function () {
      return [];
    },
    soundsNear: function () {
      return [];
    },
    scentsNear: function () {
      return [];
    },
    placeAt: function () {
      return { id: 'casa', type: 'casa', name: 'casa', biome: 'serevan' };
    },
    hasPlaceOfType: function () {
      return true;
    },
    occlusionBetween: function () {
      return 0;
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
