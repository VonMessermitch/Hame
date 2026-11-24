/* =========================================================================
   ai/biology/species.js — Homo sapienselfwer
   Genética procedimental y expresión del fenotipo.
   Una única especie con cuatro componentes evolutivos integrados.
   ========================================================================= */
(function (g) {
  'use strict';
  const AETH = g.AETH;
  const U = AETH.util;

  const S = (AETH.species = {});

  S.id = 'homo_sapienselfwer';
  S.name = 'Homo sapienselfwer';
  S.components = [
    {
      id: 'dunedain',
      label: 'Dúnedain',
      desc: 'Longevidad, mantenimiento celular, desarrollo prolongado y ventana de aprendizaje extensa.',
      genes: ['longevity', 'cellMaintenance', 'learningWindow']
    },
    {
      id: 'rhun',
      label: 'Rhûn',
      desc: 'Adaptabilidad ambiental, diversidad física, resistencia y orientación.',
      genes: ['adaptability', 'physique', 'orientation']
    },
    {
      id: 'elfblood',
      label: 'Elfo de sangre',
      desc: 'Discriminación sensorial, coordinación fina, atención sostenida y sensibilidad arcana.',
      genes: ['sensoryAcuity', 'fineMotor', 'arcaneSensitivity']
    },
    {
      id: 'dwarf',
      label: 'Enano',
      desc: 'Densidad ósea, estabilidad articular, fuerza manual y sensibilidad vibratoria.',
      genes: ['boneDensity', 'jointStability', 'manualStrength', 'vibrationSense']
    }
  ];

  /* Genes: media 0.5, sd 0.16 (población general). Las etnias añaden sesgos. */
  S.GENES = {
    longevity: { label: 'Longevidad', mean: 0.5, sd: 0.17 },
    cellMaintenance: { label: 'Mantenimiento celular', mean: 0.5, sd: 0.16 },
    learningWindow: { label: 'Ventana de aprendizaje', mean: 0.5, sd: 0.16 },
    adaptability: { label: 'Adaptabilidad', mean: 0.5, sd: 0.16 },
    physique: { label: 'Complexión', mean: 0.5, sd: 0.17 },
    orientation: { label: 'Orientación espacial', mean: 0.5, sd: 0.16 },
    sensoryAcuity: { label: 'Agudeza sensorial', mean: 0.5, sd: 0.16 },
    fineMotor: { label: 'Motricidad fina', mean: 0.5, sd: 0.15 },
    arcaneSensitivity: { label: 'Sensibilidad arcana', mean: 0.35, sd: 0.2 },
    boneDensity: { label: 'Densidad ósea', mean: 0.5, sd: 0.15 },
    jointStability: { label: 'Estabilidad articular', mean: 0.5, sd: 0.15 },
    manualStrength: { label: 'Fuerza manual', mean: 0.5, sd: 0.16 },
    vibrationSense: { label: 'Sensibilidad vibratoria', mean: 0.5, sd: 0.17 },
    metabolism: { label: 'Metabolismo', mean: 0.5, sd: 0.15 },
    stature: { label: 'Estatura', mean: 0.5, sd: 0.16 },
    pigmentation: { label: 'Pigmentación', mean: 0.5, sd: 0.18 },
    stressReactivity: { label: 'Reactividad al estrés', mean: 0.5, sd: 0.16 },
    immunity: { label: 'Inmunidad', mean: 0.5, sd: 0.15 }
  };

  S.generateGenome = function (rng, mods) {
    mods = mods || {};
    const genes = {};
    for (const key of Object.keys(S.GENES)) {
      const def = S.GENES[key];
      const mod = mods[key] || {};
      const mean = U.clamp(def.mean + (mod.d || 0), 0.02, 0.98);
      const sd = def.sd * (mod.s || 1);
      genes[key] = U.round(U.clamp(rng.gauss(mean, sd), 0.02, 0.98), 4);
    }
    return { genes: genes, version: 1 };
  };

  /* Perfil por edad: crecimiento, plenitud, declive. */
  S.ageProfile = function (age) {
    age = U.clamp(age, 0, 130);
    let physical, sensory, fluid, crystal, jointWear;
    if (age < 1) {
      physical = 0.05;
      sensory = 0.35;
      fluid = 0.15;
      crystal = 0.02;
      jointWear = 0;
    } else if (age < 6) {
      physical = 0.18 + age * 0.05;
      sensory = 0.55 + age * 0.03;
      fluid = 0.35 + age * 0.055;
      crystal = 0.05;
      jointWear = 0;
    } else if (age < 14) {
      physical = 0.45 + (age - 6) * 0.045;
      sensory = 0.85 + (age - 6) * 0.018;
      fluid = 0.68 + (age - 6) * 0.03;
      crystal = 0.06 + (age - 6) * 0.035;
      jointWear = 0;
    } else if (age < 19) {
      physical = 0.81 + (age - 14) * 0.035;
      sensory = 0.99;
      fluid = 0.95;
      crystal = 0.35 + (age - 14) * 0.028;
      jointWear = 0.01;
    } else if (age <= 33) {
      physical = 1;
      sensory = 1;
      fluid = 1;
      crystal = 0.5 + (age - 19) * 0.025;
      jointWear = 0.02 + (age - 19) * 0.002;
    } else if (age <= 50) {
      const t = (age - 33) / 17;
      physical = 1 - t * 0.1;
      sensory = 1 - t * 0.08;
      fluid = 1 - t * 0.07;
      crystal = 0.85 + t * 0.12;
      jointWear = 0.05 + t * 0.08;
    } else if (age <= 70) {
      const t = (age - 50) / 20;
      physical = 0.9 - t * 0.22;
      sensory = 0.92 - t * 0.28;
      fluid = 0.93 - t * 0.25;
      crystal = 0.97 + t * 0.02;
      jointWear = 0.13 + t * 0.22;
    } else {
      const t = U.clamp((age - 70) / 40, 0, 1);
      physical = 0.68 - t * 0.3;
      sensory = 0.64 - t * 0.3;
      fluid = 0.68 - t * 0.34;
      crystal = 0.99;
      jointWear = 0.35 + t * 0.35;
    }
    return {
      physical: U.clamp(physical, 0.05, 1),
      sensory: U.clamp(sensory, 0.12, 1),
      fluid: U.clamp(fluid, 0.1, 1),
      crystal: U.clamp(crystal, 0, 1),
      jointWear: U.clamp(jointWear, 0, 0.9)
    };
  };

  /* Expresión fenotípica. opt: {age, sex, ethnicity, heightDelta, buildDelta} */
  S.express = function (genome, opt) {
    opt = opt || {};
    const gn = genome.genes;
    const age = U.clamp(opt.age === undefined ? 30 : opt.age, 0, 130);
    const sex = opt.sex === 'female' ? 'female' : 'male';
    const prof = S.ageProfile(age);
    const J = (k) => U.clamp(gn[k] + (opt.geneJitter ? opt.geneJitter(k) : 0), 0.02, 0.98);

    const comp = {
      dunedain: 0.5 * J('longevity') + 0.3 * J('cellMaintenance') + 0.2 * J('learningWindow'),
      rhun: 0.45 * J('adaptability') + 0.35 * J('physique') + 0.2 * J('orientation'),
      elfblood: 0.5 * J('sensoryAcuity') + 0.3 * J('fineMotor') + 0.2 * J('arcaneSensitivity'),
      dwarf: 0.4 * J('boneDensity') + 0.3 * J('jointStability') + 0.3 * J('manualStrength')
    };

    let height = 152 + J('stature') * 26 + (sex === 'male' ? 8 : 0) + (opt.heightDelta || 0);
    if (age < 19) height *= 0.55 + 0.45 * U.clamp(age / 18, 0.15, 1);
    height = Math.round(height);

    const build = 0.85 + J('physique') * 0.4 + (opt.buildDelta || 0);
    const mass = Math.round(U.clamp(21 * Math.pow(height / 100, 2) * build * (sex === 'male' ? 1.06 : 0.95), 8, 160));

    // Capacidad física base
    const speed = (sex === 'male' ? 1.42 : 1.33) * (0.74 + 0.28 * prof.physical) * (0.92 + 0.16 * J('physique'));
    const capacity = {
      heightCm: height,
      massKg: mass,
      build: U.round(build, 2),
      walkSpeed: U.round(speed * 0.78, 2),
      runSpeed: U.round(speed, 2),
      sprintSpeed: U.round(speed * 1.28, 2),
      staminaSec: Math.round(70 + 120 * prof.physical * (0.7 + 0.5 * J('physique'))),
      carryKg: U.round((mass * 0.55 + 12) * (0.8 + 0.4 * J('manualStrength')) * (sex === 'male' ? 1.15 : 1), 1),
      climb: U.round(0.55 * prof.physical + 0.3 * J('fineMotor') + 0.15 * J('jointStability'), 3),
      manualDexterity: U.round(0.35 + 0.4 * J('fineMotor') + 0.25 * prof.sensory, 3),
      balance: U.round(0.4 * J('jointStability') + 0.3 * J('orientation') + 0.3 * prof.physical, 3),
      manualStrength: U.round(0.35 * J('manualStrength') + 0.35 * J('physique') + 0.3 * prof.physical, 3),
      grip: U.round(28 + 22 * J('manualStrength'), 1),
      painTolerance: U.round(0.3 + 0.45 * J('stressReactivity') * 0.4 + 0.3 * prof.physical, 3),
      coldTolerance: U.round(0.25 * J('adaptability') + 0.25 * J('physique') + 0.3 * (opt.coldAdapt || 0) + 0.2 * prof.physical, 3),
      heatTolerance: U.round(0.25 * J('adaptability') + 0.3 * (opt.heatAdapt || 0) + 0.25 * J('metabolism') + 0.2 * prof.physical, 3),
      altitudeTolerance: U.round(0.2 * J('adaptability') + 0.3 * (opt.altitudeAdapt || 0) + 0.2 * J('physique') + 0.3 * prof.physical, 3),
      immune: U.round(0.25 + 0.45 * J('immunity') + 0.3 * prof.physical, 3),
      healingRate: U.round(0.35 + 0.45 * J('cellMaintenance') + 0.2 * J('metabolism'), 3),
      reactionBaseMs: Math.round(230 - 55 * prof.fluid + 30 * (1 - J('sensoryAcuity')))
    };

    const acuity = 0.45 + 0.55 * J('sensoryAcuity');
    const senses = {
      visionAcuity: U.round(U.clamp(acuity * prof.sensory * (0.85 + 0.15 * J('fineMotor')), 0.06, 1.3), 3),
      nightVision: U.round(U.clamp(0.25 + 0.55 * J('sensoryAcuity') + 0.2 * (1 - J('pigmentation')), 0.05, 1), 3),
      colorVision: U.round(0.7 + 0.3 * J('sensoryAcuity'), 3),
      hearingAcuity: U.round(U.clamp((0.4 + 0.6 * J('sensoryAcuity')) * prof.sensory, 0.05, 1.1), 3),
      hearingRangeM: Math.round(30 + 70 * J('sensoryAcuity')),
      smellAcuity: U.round((0.3 + 0.5 * J('sensoryAcuity') + 0.2 * J('metabolism')) * prof.sensory, 3),
      touchAcuity: U.round(0.4 + 0.45 * J('fineMotor') + 0.15 * J('sensoryAcuity'), 3),
      vibrationSense: U.round(0.3 + 0.5 * J('vibrationSense') + 0.2 * J('sensoryAcuity'), 3),
      proprioception: U.round(0.45 * J('orientation') + 0.3 * J('fineMotor') + 0.25 * prof.physical, 3),
      arcaneSensitivity: U.round(U.clamp(J('arcaneSensitivity') * (0.6 + 0.4 * prof.fluid), 0, 1), 3),
      arcaneRangeM: Math.round(4 + 16 * J('arcaneSensitivity')),
      fieldOfViewDeg: Math.round(150 + 40 * J('sensoryAcuity'))
    };

    const cognition = {
      workingMemorySlots: Math.max(2, Math.round(4 + 5 * (0.5 * prof.fluid + 0.5 * J('learningWindow')) + (comp.elfblood - 0.5) * 2)),
      processingSpeed: U.round(0.45 * prof.fluid + 0.3 * J('learningWindow') + 0.25 * prof.sensory, 3),
      attentionSpanSec: Math.round(14 + 40 * prof.fluid * (0.6 + 0.4 * J('learningWindow'))),
      learningRate: U.round(0.25 + 0.5 * J('learningWindow') + 0.25 * prof.fluid, 3),
      inhibition: U.round(0.25 + 0.5 * J('stressReactivity') * 0.5 + 0.35 * prof.fluid, 3),
      spatialSkill: U.round(0.3 + 0.4 * J('orientation') + 0.3 * prof.fluid, 3),
      memoryCapacity: Math.round(60 + 180 * prof.fluid + 80 * comp.dunedain),
      imagination: U.round(0.25 + 0.4 * J('learningWindow') + 0.35 * prof.fluid, 3)
    };

    return {
      species: S.id,
      age: U.round(age, 1),
      sex: sex,
      heightCm: height,
      massKg: mass,
      bmi: U.round(mass / Math.pow(height / 100, 2), 1),
      eyeColor: opt.eyeColor || null,
      hairColor: opt.hairColor || null,
      skinTone: U.round(J('pigmentation'), 3),
      build: U.round(build, 2),
      components: {
        dunedain: U.round(comp.dunedain, 3),
        rhun: U.round(comp.rhun, 3),
        elfblood: U.round(comp.elfblood, 3),
        dwarf: U.round(comp.dwarf, 3)
      },
      capacity: capacity,
      senses: senses,
      cognition: cognition,
      voice: {
        pitch: U.round(0.75 + 0.5 * J('physique') - (sex === 'female' ? 0.25 : 0) + (age > 60 ? -0.08 : 0), 3),
        resonance: U.round(0.4 + 0.4 * comp.dwarf, 3),
        tremor: U.round(age > 65 ? U.clamp((age - 65) / 60, 0, 0.4) : 0, 3)
      },
      ageProfile: prof,
      longevity: Math.round(68 + 62 * comp.dunedain),
      metabolicRate: U.round(0.75 + 0.5 * J('metabolism') * (sex === 'male' ? 1.06 : 0.94), 3)
    };
  };

  /* Envejecimiento: el estado biológico envejece con los años simulados. */
  S.agingDelta = function (phenotype) {
    return 1 / 365.25; // años por día simulado
  };
})(typeof window !== 'undefined' ? window : globalThis);
