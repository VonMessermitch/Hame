/* =========================================================================
   ai/biology/senses.js — órganos sensoriales y receptores.
   Cada receptor consulta capacidades biológicas reales y condiciones ambientales.
   ========================================================================= */
(function (g) {
  'use strict';
  const AETH = g.AETH;
  const U = AETH.util;

  const SE = (AETH.senses = {});

  /* Órganos: agudeza base del fenotipo + patologías y lesiones oculares/auditivas. */
  SE.buildOrgans = function (phenotype, conditions) {
    conditions = conditions || {};
    const s = phenotype.senses;
    const organs = {
      eyes: {
        acuity: U.round(s.visionAcuity * (conditions.myopia ? 0.42 : 1) * (conditions.blindEye ? 0.2 : 1), 3),
        nightVision: U.round(s.nightVision * (conditions.nightBlind ? 0.3 : 1), 3),
        fieldOfViewDeg: s.fieldOfViewDeg,
        adaptation: 0.2,
        fatigue: 0,
        damaged: !!(conditions.myopia || conditions.blindEye)
      },
      ears: {
        acuity: U.round(s.hearingAcuity * (conditions.hearingLoss ? 0.38 : 1), 3),
        rangeM: Math.round(s.hearingRangeM * (conditions.hearingLoss ? 0.5 : 1)),
        tinnitus: !!conditions.tinnitus,
        damaged: !!(conditions.hearingLoss || conditions.tinnitus)
      },
      nose: { acuity: U.round(s.smellAcuity * (conditions.anosmia ? 0.05 : 1), 3) },
      skin: { acuity: U.round(s.touchAcuity * (conditions.burns ? 0.5 : 1), 3), thermal: 1 },
      muscles: { proprioception: U.round(s.proprioception, 3), vibration: U.round(s.vibrationSense, 3) },
      arcane: {
        sensitivity: U.round(s.arcaneSensitivity, 3),
        rangeM: s.arcaneRangeM,
        overload: 0,
        falsePositive: U.clamp(0.16 * (1 - s.arcaneSensitivity) + (conditions.arcaneScar ? 0.1 : 0), 0.01, 0.4)
      }
    };
    return organs;
  };

  /* Iluminación relativa 0..1 según el entorno (la calcula environment/astronomy). */
  SE.illumination = function (organs, env) {
    const lux = env && env.light !== undefined ? env.light : 0.6; // 0 noche cerrada, 1 pleno día
    const adapt = organs.eyes.adaptation || 0;
    const effective = U.clamp(lux + adapt * (1 - lux) * 0.35, 0.02, 1.2);
    return effective;
  };

  /* Visión: campo visual, distancia, oclusión, iluminación, movimiento, contraste. */
  SE.vision = function (organs, observer, target, env) {
    const eyes = organs.eyes;
    const dx = (target.x || 0) - observer.x;
    const dz = (target.z || 0) - observer.z;
    const dist = Math.hypot(dx, dz);
    const bearing = Math.atan2(dx, dz);
    const facing = observer.facing === undefined ? 0 : observer.facing;
    const off = U.angleDiff(bearing, facing);
    const halfFov = ((eyes.fieldOfViewDeg * 0.5) * Math.PI) / 180;
    if (off > halfFov * 1.18) return { visible: false, reason: 'fuera_de_campo', distance: dist };

    const lux = SE.illumination(organs, env);
    const nightGain = lux < 0.25 ? eyes.nightVision : 1;
    const weather = env && env.weather ? env.weather : {};
    const fog = weather.fog || 0;
    const rain = weather.rain || 0;
    const contrast = target.contrast === undefined ? 0.7 : target.contrast;
    const motionBonus = target.moving ? 0.18 : 0;
    const size = target.size === undefined ? 0.6 : target.size;
    const range = (24 + 150 * eyes.acuity) * lux * (0.35 + 0.65 * nightGain) * (1 - fog * 0.55) * (1 - rain * 0.15);
    const effective = Math.max(1, range);
    const distanceFactor = 1 - U.invLerp(effective * 0.55, effective * 1.35, dist) * 0.95;
    const occlusion = target.occlusion === undefined ? 0 : target.occlusion;
    let confidence = eyes.acuity * distanceFactor * (0.55 + 0.45 * contrast) * (0.7 + 0.3 * size) * (1 - occlusion * 0.85) + motionBonus;
    confidence = U.clamp(confidence - eyes.fatigue * 0.12, 0, 1);
    const identified = confidence > 0.42 && dist < effective * 0.75;
    return {
      visible: confidence > 0.06,
      distance: U.round(dist, 1),
      bearing: U.round(bearing, 3),
      offAngle: U.round(off, 2),
      confidence: U.round(confidence, 3),
      identified: identified,
      reason: identified ? 'reconocido' : confidence > 0.06 ? 'silueta' : 'no_percibido'
    };
  };

  /* Audición: atenuación por distancia, oclusión y ruido de fondo. */
  SE.hear = function (organs, observer, sound, env) {
    const ears = organs.ears;
    const d = Math.hypot((sound.x || 0) - observer.x, (sound.z || 0) - observer.z);
    if (d > ears.rangeM) return { heard: false, distance: d };
    const attenuation = Math.pow(1 - d / ears.rangeM, 1.6);
    const ambient = env && env.noiseFloor !== undefined ? env.noiseFloor : 0.12;
    const loud = U.clamp(sound.loudness === undefined ? 0.5 : sound.loudness, 0, 1);
    const signal = loud * attenuation * ears.acuity * (1 - ambient * 0.7);
    const heard = signal > 0.035;
    const bearing = Math.atan2((sound.x || 0) - observer.x, (sound.z || 0) - observer.z);
    const directionError = U.round(U.clamp((0.7 - signal) * 1.4, 0.04, 1.2), 3);
    return {
      heard: heard,
      distance: U.round(d, 1),
      bearing: U.round(bearing, 3),
      directionErrorRad: directionError,
      loudness: U.round(signal, 3),
      identified: signal > 0.3 && !!sound.known,
      kind: signal > 0.3 ? sound.kind : 'sonido_indeterminado'
    };
  };

  /* Olfato: intensidad, dirección aproximada y persistencia. */
  SE.smell = function (organs, observer, scent, env) {
    const nose = organs.nose;
    const d = Math.hypot((scent.x || 0) - observer.x, (scent.z || 0) - observer.z);
    const wind = (env && env.wind) || { x: 0, z: 0, strength: 0.2 };
    const downwind = (Math.sin(observer.facing) * 0 + 1) * 1; // aproximación: el viento transporta el olor
    const reach = 8 + 34 * nose.acuity;
    if (d > reach) return { detected: false };
    const persistence = U.clamp(scent.persistence === undefined ? 0.5 : scent.persistence, 0, 1);
    const strength = U.clamp((scent.intensity === undefined ? 0.5 : scent.intensity) * persistence * (1 - d / reach) * nose.acuity * (0.7 + wind.strength * 0.6) * downwind, 0, 1);
    return {
      detected: strength > 0.05,
      strength: U.round(strength, 3),
      directionErrorRad: U.round(U.clamp(0.9 - strength, 0.15, 1.4), 3),
      identified: strength > 0.32 && !!scent.known,
      kind: strength > 0.32 ? scent.kind : 'olor_indeterminado',
      distance: U.round(d, 1)
    };
  };

  SE.touch = function (organs, stimulus) {
    const t = organs.skin;
    return {
      pressure: U.round(U.clamp((stimulus.pressure || 0) * t.acuity, 0, 1), 3),
      temperatureC: stimulus.temperatureC,
      texture: t.acuity > 0.5 ? stimulus.texture : 'indeterminada',
      pain: Math.round(U.clamp((stimulus.force || 0) * 30 * (1.6 - t.acuity), 0, 100))
    };
  };

  SE.proprioception = function (organs, body, motion) {
    const m = organs.muscles;
    return {
      balance: U.round(U.clamp(0.5 * m.proprioception + 0.5 * (1 - Math.min(1, motion.dizziness || 0)), 0, 1), 3),
      limbPosition: 'consciente',
      effort: U.round(U.clamp(motion.exertion || 0, 0, 1), 2),
      vibrationDetected: motion.vibration !== undefined ? motion.vibration * m.vibration : null
    };
  };

  /* Sentido arcano: ficticio, imperfecto, con falsos positivos y fatiga. */
  SE.arcane = function (organs, observer, emanations, env, rng) {
    const arc = organs.arcane;
    const out = [];
    const noise = (env && env.arcaneNoise) || 0;
    const overload = arc.overload;
    for (const em of emanations) {
      const d = Math.hypot((em.x || 0) - observer.x, (em.z || 0) - observer.z);
      const range = arc.rangeM * (1 - overload * 0.6) * (1 - noise * 0.3);
      if (d > range) continue;
      const signal = U.clamp((em.intensity || 0.5) * (1 - d / range) * arc.sensitivity * (0.7 + 0.3 * (em.coherence || 0.5)), 0, 1);
      if (signal < 0.08) continue;
      const bearingErr = (1 - signal) * 1.1;
      out.push({
        type: 'arcane',
        distance: U.round(d, 1),
        bearing: U.round(Math.atan2((em.x || 0) - observer.x, (em.z || 0) - observer.z) + (rng ? rng.range(-bearingErr, bearingErr) : 0), 3),
        intensity: U.round(signal, 3),
        identified: signal > 0.45 && !!em.known,
        source: signal > 0.45 && em.known ? em.source : 'origen_desconocido',
        confidence: U.round(signal * (1 - arc.falsePositive * 0.4), 3)
      });
    }
    // Falsos positivos: el sistema arcano no es un radar fiable.
    if (arc.sensitivity > 0.2 && rng && rng.chance(arc.falsePositive * 0.06)) {
      out.push({
        type: 'arcane',
        distance: U.round(rng.range(4, Math.max(6, arc.rangeM)), 1),
        bearing: rng.range(-Math.PI, Math.PI),
        intensity: U.round(rng.range(0.08, 0.22), 3),
        identified: false,
        source: 'origen_desconocido',
        confidence: U.round(rng.range(0.1, 0.3), 3),
        falsePositive: true
      });
    }
    arc.overload = U.clamp(arc.overload + out.length * 0.01 - 0.002, 0, 1);
    return out;
  };

  SE.adaptEyes = function (organs, dt, lux) {
    const target = U.clamp(lux, 0, 1);
    organs.eyes.adaptation += (target - organs.eyes.adaptation) * U.clamp(dt / 20, 0, 0.4);
    organs.eyes.adaptation = U.clamp(organs.eyes.adaptation, 0, 0.9);
    organs.eyes.fatigue = U.clamp(organs.eyes.fatigue + dt * (lux < 0.2 ? 0.0006 : 0.0002) - dt * 0.0001, 0, 1);
  };

  SE.describe = function (organs) {
    return {
      vision: U.round(organs.eyes.acuity, 2),
      visionNocturna: U.round(organs.eyes.nightVision, 2),
      campoVisual: organs.eyes.fieldOfViewDeg + '°',
      audicion: U.round(organs.ears.acuity, 2),
      alcanceOido: organs.ears.rangeM + ' m',
      olfato: U.round(organs.nose.acuity, 2),
      tacto: U.round(organs.skin.acuity, 2),
      vibracion: U.round(organs.muscles.vibration, 2),
      propiocepcion: U.round(organs.muscles.proprioception, 2),
      arcano: U.round(organs.arcane.sensitivity, 2)
    };
  };
})(typeof window !== 'undefined' ? window : globalThis);
