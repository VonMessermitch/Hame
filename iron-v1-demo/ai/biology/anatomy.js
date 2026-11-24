/* =========================================================================
   ai/biology/anatomy.js — anatomía, lesiones y fisiología.
   La biología impone capacidades y costes; no es una lista de bonificaciones.
   ========================================================================= */
(function (g) {
  'use strict';
  const AETH = g.AETH;
  const U = AETH.util;

  const A = (AETH.anatomy = {});

  A.JOINTS = [
    ['neck', 'cuello'],
    ['shoulderL', 'hombro izq.'],
    ['shoulderR', 'hombro der.'],
    ['elbowL', 'codo izq.'],
    ['elbowR', 'codo der.'],
    ['wristL', 'muñeca izq.'],
    ['wristR', 'muñeca der.'],
    ['spine', 'columna'],
    ['hipL', 'cadera izq.'],
    ['hipR', 'cadera der.'],
    ['kneeL', 'rodilla izq.'],
    ['kneeR', 'rodilla der.'],
    ['ankleL', 'tobillo izq.'],
    ['ankleR', 'tobillo der.']
  ];

  A.ORGANS = [
    ['heart', 'corazón'],
    ['lungs', 'pulmones'],
    ['liver', 'hígado'],
    ['kidneys', 'riñones'],
    ['stomach', 'estómago'],
    ['intestines', 'intestinos'],
    ['brain', 'cerebro'],
    ['skin', 'piel'],
    ['immune', 'sistema inmune']
  ];

  /* Construye el cuerpo. ctx: {age, wear (0..1), injuries:[], labourTags:[]} */
  A.buildBody = function (rng, phenotype, ctx) {
    ctx = ctx || {};
    const age = phenotype.age;
    const wear = U.clamp(ctx.wear === undefined ? phenotype.ageProfile.jointWear : ctx.wear, 0, 0.95);
    const joints = {};
    for (const [id, label] of A.JOINTS) {
      const structural = id === 'spine' || id === 'kneeL' || id === 'kneeR' || id === 'hipL' || id === 'hipR';
      let integrity = 1 - wear * (structural ? 0.85 : 0.55) * (0.7 + 0.6 * rng.next());
      integrity = U.clamp(integrity, 0.05, 1);
      joints[id] = {
        id: id,
        label: label,
        integrity: U.round(integrity, 3),
        pain: 0,
        swelling: 0,
        injured: false,
        note: ''
      };
    }
    const organs = {};
    for (const [id, label] of A.ORGANS) {
      organs[id] = { id: id, label: label, health: U.round(U.clamp(0.9 + rng.range(-0.08, 0.1), 0.5, 1), 3), strain: 0 };
    }
    const body = {
      joints: joints,
      organs: organs,
      skeleton: {
        density: U.round(0.35 + 0.6 * phenotype.components.dwarf, 3),
        frame: U.round(0.3 + 0.6 * phenotype.components.rhun, 3)
      },
      musculature: {
        strength: U.round(0.3 + 0.55 * phenotype.capacity.manualStrength, 3),
        endurance: U.round(0.25 + 0.6 * phenotype.ageProfile.physical, 3),
        tone: U.round(0.35 + 0.5 * phenotype.ageProfile.physical, 3),
        atrophy: 0
      },
      skin: { integrity: 1, temperatureC: 34, perfusion: 1 },
      injuries: [],
      scars: ctx.scars ? ctx.scars.slice() : [],
      chronic: ctx.chronic ? ctx.chronic.slice() : [],
      bloodVolume: 1,
      bodyFat: U.round(U.clamp(0.1 + rng.range(0, 0.22) + (phenotype.massKg > 95 ? 0.1 : 0), 0.06, 0.45), 3)
    };

    const injuries = (ctx.injuries || []).slice();
    if (ctx.kneeInjury) {
      injuries.push({
        type: 'knee',
        joint: 'kneeR',
        severity: 0.55,
        label: 'lesión antigua de rodilla derecha',
        chronic: true,
        mobilityLoss: 0.3,
        painOnLoad: 0.45,
        bleed: 0,
        healDays: 0,
        ageDays: 900
      });
    }
    if (ctx.oldWound) {
      injuries.push({
        type: 'wound',
        joint: 'shoulderL',
        severity: 0.25,
        label: 'herida antigua de metralla',
        chronic: true,
        mobilityLoss: 0.1,
        painOnLoad: 0.2,
        bleed: 0,
        healDays: 0,
        ageDays: 1200
      });
    }
    for (const inj of injuries) A.applyInjury(body, inj, true);
    return body;
  };

  A.applyInjury = function (body, inj, silent) {
    const final = U.deepMerge(
      {
        id: U.uid('inj'),
        type: 'wound',
        joint: null,
        severity: 0.3,
        label: 'herida',
        chronic: false,
        mobilityLoss: 0,
        painOnLoad: 0,
        bleed: 0,
        infection: 0,
        healDays: 10,
        ageDays: 0
      },
      inj
    );
    if (!final.mobilityLoss) final.mobilityLoss = final.severity * 0.5;
    if (!final.painOnLoad) final.painOnLoad = final.severity * 0.7;
    if (!final.bleed) final.bleed = final.severity > 0.5 ? final.severity * 0.1 : 0;
    body.injuries.push(final);
    if (final.joint && body.joints[final.joint]) {
      const j = body.joints[final.joint];
      j.integrity = U.clamp(j.integrity - final.severity * 0.6, 0.03, 1);
      j.injured = true;
      j.pain = Math.max(j.pain, final.severity);
      j.note = final.label;
    }
    body.bloodVolume = U.clamp(body.bloodVolume - final.bleed * 0.25, 0.35, 1);
    if (!silent) AETH.debug.log('biología', final.label + ' — severidad ' + U.round(final.severity, 2));
    return final;
  };

  A.updateInjuries = function (body, dtDays) {
    for (const inj of body.injuries) {
      inj.ageDays += dtDays;
      if (inj.chronic) continue;
      if (inj.healDays > 0) {
        const heal = dtDays / inj.healDays;
        inj.severity = U.clamp(inj.severity - heal * 0.9, 0, 1);
        inj.bleed = U.clamp(inj.bleed - heal * 0.1, 0, 1);
        inj.infection = U.clamp(inj.infection + (inj.severity > 0.4 ? dtDays * 0.04 : -heal * 0.2), 0, 1);
        if (inj.joint && body.joints[inj.joint]) {
          const j = body.joints[inj.joint];
          j.integrity = U.clamp(j.integrity + heal * 0.25, 0.03, 1);
          j.pain = U.clamp(j.pain - heal, 0, 1);
          if (inj.severity < 0.05) {
            j.injured = false;
            j.note = '';
          }
        }
      }
    }
    body.injuries = body.injuries.filter((i) => i.chronic || i.severity > 0.02);
    body.bloodVolume = U.clamp(body.bloodVolume + dtDays * 0.02, 0.35, 1);
    for (const id of Object.keys(body.joints)) {
      const j = body.joints[id];
      if (!j.injured) j.pain = Math.max(0, j.pain - dtDays * 0.3);
    }
  };

  A.totalPain = function (body) {
    let p = 0;
    for (const inj of body.injuries) p += inj.severity * (inj.chronic ? 0.55 : 1);
    return U.clamp(p, 0, 1.5);
  };

  A.mobility = function (body) {
    let m = 1;
    const legs = Math.min(body.joints.kneeL.integrity, body.joints.kneeR.integrity, body.joints.ankleL.integrity, body.joints.ankleR.integrity, body.joints.hipL.integrity, body.joints.hipR.integrity);
    m *= 0.45 + 0.55 * legs;
    for (const inj of body.injuries) m *= 1 - inj.mobilityLoss * 0.6;
    m *= 0.75 + 0.25 * body.musculature.strength;
    return U.clamp(m, 0.12, 1);
  };

  /* ---------------------------- FISIOLOGÍA ---------------------------- */
  class Physiology {
    constructor(rng, body, phenotype) {
      this.body = body;
      this.phenotype = phenotype;
      this.rng = rng;
      this.state = {
        heartRate: 68,
        respRate: 14,
        oxygenSat: 0.98,
        adrenaline: 0.06,
        cortisol: 0.2,
        fatigue: 0.08,
        sleepDebt: 0.05,
        pain: 0,
        hunger: 0.15,
        thirst: 0.1,
        bodyTempC: 36.7,
        skinTempC: 33.5,
        bloodVolume: body.bloodVolume,
        intoxication: 0,
        infection: 0,
        energy: 0.9,
        shivering: 0,
        sweating: 0,
        nausea: 0
      };
      this.lastActivity = 'reposo';
    }

    /* dt: segundos simulados. ctx: {temperatureC, humidity, exertion 0..1, asleep, bleeding} */
    update(dt, ctx) {
      if (!(dt > 0)) return this.state;
      ctx = ctx || {};
      const s = this.state;
      const dtDays = dt / 86400;
      const bmr = this.phenotype.metabolicRate;
      const exertion = U.clamp(ctx.exertion || 0, 0, 1);
      const temp = ctx.temperatureC === undefined ? 18 : ctx.temperatureC;
      const humidity = ctx.humidity === undefined ? 0.55 : ctx.humidity;

      // Hambre / sed
      s.hunger = U.clamp(s.hunger + (dt / 86400) * (0.55 + bmr * 0.5) * (0.6 + exertion), 0, 1.6);
      s.thirst = U.clamp(s.thirst + (dt / 86400) * (0.9 + exertion * 0.8 + Math.max(0, temp - 22) * 0.05), 0, 1.6);

      // Fatiga y sueño
      const sleepNeed = 1 / (16 * 3600);
      const fatigueGain = (dt / 3600) * (0.55 + 1.6 * exertion) * (0.8 + 0.4 * bmr);
      if (ctx.asleep) {
        s.fatigue = Math.max(0, s.fatigue - dt * (1 / 7200) * 1.4);
        s.sleepDebt = Math.max(0, s.sleepDebt - dt / (8 * 3600));
      } else {
        s.fatigue = U.clamp(s.fatigue + fatigueGain * (1 + s.sleepDebt * 0.6), 0, 1.6);
        s.sleepDebt = U.clamp(s.sleepDebt + dt * sleepNeed * (0.6 + 0.8 * (1 - (ctx.nightComfort || 0.5))), 0, 1.6);
      }

      // Dolor e infección
      this.body.bloodVolume = U.clamp(this.body.bloodVolume - dtDays * (ctx.bleeding || 0), 0.3, 1);
      s.bloodVolume = this.body.bloodVolume;
      s.pain = U.clamp(A.totalPain(this.body) + (ctx.painSpike || 0), 0, 1.5);
      s.infection = U.clamp(
        s.infection + dtDays * (this.body.injuries.some((i) => i.severity > 0.45) ? 0.06 : -0.05 * this.phenotype.capacity.immune),
        0,
        1
      );

      // Termorregulación
      const comfort = 21 + (this.phenotype.capacity.coldTolerance - 0.5) * 8;
      const cold = Math.max(0, comfort - temp);
      const heat = Math.max(0, temp - comfort - 4);
      const insulation = ctx.insulation === undefined ? 0.65 : ctx.insulation;
      const coldLoad = Math.max(0, cold * (1 - insulation * 0.65)) / 22;
      const heatLoad = Math.max(0, heat * (1 - humidity * 0.3)) / 18;
      s.shivering = U.clamp(s.shivering + dt * (coldLoad > 0.05 ? 0.08 : -0.1), 0, 1);
      s.sweating = U.clamp(s.sweating + dt * (heatLoad > 0.05 ? 0.08 : -0.1), 0, 1);
      const targetTemp = 36.8 - coldLoad * 1.4 + heatLoad * 0.9 + s.infection * 1.8;
      s.bodyTempC += (targetTemp - s.bodyTempC) * U.clamp(dt / 900, 0, 0.6);
      s.skinTempC = s.bodyTempC - 2.8 + s.shivering * -1.2 + s.sweating * 0.6;

      if (s.bodyTempC < 35.4) s.energy = U.clamp(s.energy - dt / 5400, 0.05, 1);
      if (s.bodyTempC > 38.6) s.thirst = U.clamp(s.thirst + dt / 14400, 0, 1.8);

      // Estrés / adrenalina
      const stressIn = (ctx.fear || 0) * 0.5 + (ctx.threat || 0) * 0.4 + s.pain * 0.25 + (ctx.cognitiveStrain || 0) * 0.2;
      s.adrenaline += (U.clamp(stressIn, 0, 1) - s.adrenaline) * U.clamp(dt / 25, 0, 0.5);
      const cortisolTarget = U.clamp(0.18 + stressIn * 0.7 + s.sleepDebt * 0.2 + (ctx.grief || 0) * 0.3, 0, 1);
      s.cortisol += (cortisolTarget - s.cortisol) * U.clamp(dt / 600, 0, 0.4);

      // Cardiovascular
      const hrTarget =
        60 +
        exertion * 85 +
        s.adrenaline * 42 +
        s.pain * 8 +
        s.shivering * 12 +
        Math.max(0, s.bodyTempC - 37) * 6 +
        (s.bloodVolume < 0.85 ? (0.85 - s.bloodVolume) * 60 : 0);
      s.heartRate += (U.clamp(hrTarget, 45, 195) - s.heartRate) * U.clamp(dt / 20, 0, 0.5);
      const respTarget = 12 + exertion * 20 + s.adrenaline * 8 + Math.max(0, s.bodyTempC - 37) * 4;
      s.respRate += (U.clamp(respTarget, 8, 48) - s.respRate) * U.clamp(dt / 25, 0, 0.5);
      s.oxygenSat = U.clamp(0.985 - s.pain * 0.02 - s.infection * 0.05 - Math.max(0, 0.75 - s.bloodVolume) * 0.1, 0.72, 1);

      // Energía / intoxicación
      s.intoxication = U.clamp(s.intoxication - dt / 9000, 0, 1);
      s.energy = U.clamp(0.92 - s.fatigue * 0.45 - s.hunger * 0.14 - s.thirst * 0.16 - s.pain * 0.12 + (ctx.asleep ? 0.1 : 0), 0.05, 1);

      this.body.bloodVolume = s.bloodVolume;
      A.updateInjuries(this.body, dtDays);
      this.lastActivity = ctx.activity || this.lastActivity;
      return s;
    }

    eat(amount) {
      this.state.hunger = U.clamp(this.state.hunger - amount, 0, 1.6);
      this.state.energy = U.clamp(this.state.energy + amount * 0.35, 0, 1);
    }
    drink(amount) {
      this.state.thirst = U.clamp(this.state.thirst - amount, 0, 1.6);
    }
    sleepRestore(hours) {
      const q = U.clamp(hours / 8, 0, 1.4);
      this.state.fatigue = U.clamp(this.state.fatigue - q * 0.75, 0, 1.6);
      this.state.sleepDebt = U.clamp(this.state.sleepDebt - q * 0.85, 0, 1.6);
      this.state.cortisol = U.clamp(this.state.cortisol - q * 0.4, 0, 1);
    }
    addSubstance(kind) {
      if (kind === 'alcohol') {
        this.state.intoxication = U.clamp(this.state.intoxication + 0.35, 0, 1);
        this.state.inhibition = true;
      }
      if (kind === 'stimulant') {
        this.state.fatigue = U.clamp(this.state.fatigue - 0.2, 0, 1.6);
        this.state.heartRate += 12;
        this.state.sleepDebt = U.clamp(this.state.sleepDebt + 0.05, 0, 1.6);
      }
    }

    /* Modificadores cognitivos derivados del organismo (no del ánimo). */
    cognitiveModifiers() {
      const s = this.state;
      const p = this.phenotype;
      const t = this.body.bodyTempC === undefined ? 0 : 0;
      const coldPenalty = s.bodyTempC < 35.6 ? (35.6 - s.bodyTempC) * 0.22 : 0;
      const heatPenalty = s.bodyTempC > 38.2 ? (s.bodyTempC - 38.2) * 0.16 : 0;
      const alertness = U.clamp(1 - s.fatigue * 0.55 - s.sleepDebt * 0.45 - s.pain * 0.32 - s.infection * 0.5 - s.intoxication * 0.6 - coldPenalty - heatPenalty, 0.08, 1.05);
      const precision = U.clamp(alertness * (0.65 + 0.35 * p.capacity.manualDexterity) - s.pain * 0.2 - s.adrenaline * 0.08, 0.05, 1);
      const focus = U.clamp(alertness * (0.7 + 0.3 * p.cognition.processingSpeed), 0.05, 1.05);
      const painLoad = U.clamp(s.pain * 0.6, 0, 1);
      return {
        alertness: alertness,
        focus: focus,
        precision: precision,
        reactionTimeMs: Math.round(p.capacity.reactionBaseMs * (1.55 - 0.55 * alertness) + s.pain * 90 + s.intoxication * 140),
        workingMemorySlots: Math.max(2, Math.round(p.cognition.workingMemorySlots * (0.45 + 0.55 * focus))),
        attentionSpanSec: Math.max(4, Math.round(p.cognition.attentionSpanSec * (0.35 + 0.65 * focus))),
        learningRate: U.clamp(p.cognition.learningRate * (0.35 + 0.65 * alertness) * (1 - s.cortisol * 0.25), 0.05, 1.2),
        riskAversion: U.clamp(0.2 + painLoad * 0.25 + s.fatigue * 0.2 + s.cortisol * 0.15, 0, 0.9),
        speedMul: U.clamp(A.mobility(this.body) * (0.55 + 0.45 * alertness) * (1 - s.bodyTempC < 35 ? 0.25 : 0), 0.12, 1.15),
        available: s.bloodVolume > 0.4 && s.bodyTempC > 33.5,
        painLoad: painLoad,
        coldPenalty: coldPenalty,
        heatPenalty: heatPenalty
      };
    }

    describe() {
      const s = this.state;
      return {
        pulso: Math.round(s.heartRate),
        respiracion: Math.round(s.respRate),
        adrenalina: U.round(s.adrenaline, 2),
        cortisol: U.round(s.cortisol, 2),
        fatiga: U.round(s.fatigue, 2),
        sueño: U.round(s.sleepDebt, 2),
        dolor: U.round(s.pain, 2),
        hambre: U.round(s.hunger, 2),
        sed: U.round(s.thirst, 2),
        temperatura: U.round(s.bodyTempC, 1),
        sangre: U.round(s.bloodVolume, 2),
        infeccion: U.round(s.infection, 2)
      };
    }

    toJSON() {
      return { state: U.sanitize(this.state), body: this.body };
    }
    load(data) {
      if (data && data.state) U.deepMerge(this.state, data.state);
      if (data && data.body) U.deepMerge(this.body, data.body);
    }
  }

  A.Physiology = Physiology;
})(typeof window !== 'undefined' ? window : globalThis);
