/* =========================================================================
   ai/environment/astronomy.js — Aethrion: dos estrellas, dos lunas,
   año de 410 días, día de 25 horas, inclinación 23,5°.
   La astronomía influye en luz, clima, ritmos y visibilidad; no en la personalidad.
   ========================================================================= */
(function (g) {
  'use strict';
  const AETH = g.AETH;
  const U = AETH.util;

  const AST = (AETH.astronomy = {});

  AST.DAY_HOURS = 25;
  AST.YEAR_DAYS = 410;
  AST.AXIAL_TILT = 23.5;
  AST.DAYS_PER_SEASON = 102.5;
  AST.STARS = [
    { id: 'aster', label: 'Aster', color: '#d9834a', intensity: 0.52, note: 'rojiza y ámbar' },
    { id: 'eiren', label: 'Eiren', color: '#f2efdc', intensity: 1.0, note: 'amarilla blanquecina' }
  ];
  AST.MOONS = [
    { id: 'auralis', label: 'Auralis', period: 32, radius: 1.0, light: 0.055, color: '#e8e2cf' },
    { id: 'veyra', label: 'Veyra', period: 16, radius: 0.62, light: 0.032, color: '#cfd6c8' }
  ];
  AST.SEASONS = [
    { id: 'primavera', label: 'Primavera', start: 1, tempDelta: 2, light: 1.0 },
    { id: 'verano', label: 'Verano', start: 103.5, tempDelta: 9, light: 1.08 },
    { id: 'otono', label: 'Otoño', start: 206, tempDelta: 0, light: 0.92 },
    { id: 'invierno', label: 'Invierno', start: 308.5, tempDelta: -10, light: 0.82 }
  ];

  AST.seasonIndex = function (day) {
    const d = ((day - 1) % AST.YEAR_DAYS + AST.YEAR_DAYS) % AST.YEAR_DAYS;
    const idx = Math.floor(d / AST.DAYS_PER_SEASON);
    return U.clamp(idx, 0, 3);
  };
  AST.season = function (day) {
    return AST.SEASONS[AST.seasonIndex(day)];
  };
  AST.dateLabel = function (day, hour) {
    const d = ((day - 1) % AST.YEAR_DAYS) + 1;
    const s = AST.season(day);
    const dayOfSeason = Math.floor((((day - 1) % AST.YEAR_DAYS) % AST.DAYS_PER_SEASON) + 1);
    return (
      'Día ' + d + ' · ' + s.label + ' ' + dayOfSeason + ' · ' + U.fmtHour(hour)
    );
  };

  AST.lunarPhase = function (day, moon) {
    const phase = (((day - 1) % moon.period) / moon.period) % 1;
    let name = 'nueva';
    if (phase > 0.1 && phase < 0.4) name = 'creciente';
    else if (phase >= 0.4 && phase <= 0.6) name = 'llena';
    else if (phase > 0.6 && phase < 0.9) name = 'menguante';
    const illuminated = (1 - Math.cos(phase * Math.PI * 2)) / 2;
    return { phase: U.round(phase, 3), illuminated: U.round(illuminated, 3), name: name };
  };

  /* Luz 0..1 (1 = mediodía claro). Afecta visión, sueño, fauna y agricultura. */
  AST.illumination = function (day, hour) {
    const H = AST.DAY_HOURS;
    const h = ((hour % H) + H) % H;
    const season = AST.season(day);
    const dayFraction = (h - 5.5) / (H - 4); // amanecer ~5:30, anochecer ~21:30 en verano
    const sunHeight = Math.sin(U.clamp(dayFraction, 0, 1) * Math.PI);
    const sun = U.clamp(sunHeight, 0, 1) * season.light;
    const aster = sun * AST.STARS[0].intensity * 0.55;
    const eiren = sun * AST.STARS[1].intensity;
    const sunLight = U.clamp(eiren * 0.82 + aster * 0.35, 0, 1);
    let moonLight = 0;
    const moons = [];
    for (const m of AST.MOONS) {
      const ph = AST.lunarPhase(day, m);
      const elevation = Math.sin((h / H) * Math.PI * 2 + 1.2) * 0.5 + 0.5;
      const contrib = ph.illuminated * elevation * m.light;
      moonLight += contrib;
      moons.push({ id: m.id, label: m.label, phase: ph, elevation: U.round(elevation, 2), light: U.round(U.clamp(contrib, 0, 1), 3) });
    }
    const light = U.clamp(sunLight * (1 - 0.25 * (0.5 - 0.5 * Math.cos((h / H) * Math.PI * 2))) + moonLight, 0.015, 1);
    return {
      light: U.round(light, 3),
      sun: U.round(sunLight, 3),
      moon: U.round(moonLight, 3),
      moons: moons,
      daylight: sunLight > 0.08,
      stars: sunLight < 0.06,
      goldenHour: sunLight > 0.1 && sunLight < 0.35,
      hour: U.round(h, 2),
      season: season.id
    };
  };

  /* Etiqueta de momento del día usada por los horarios y el sueño. */
  AST.phaseOfDay = function (hour) {
    const h = ((hour % AST.DAY_HOURS) + AST.DAY_HOURS) % AST.DAY_HOURS;
    if (h < 4.5) return 'madrugada';
    if (h < 7) return 'amanecer';
    if (h < 12) return 'mañana';
    if (h < 15) return 'mediodía';
    if (h < 19) return 'tarde';
    if (h < 22) return 'anochecer';
    return 'noche';
  };

  AST.lunarInfluence = function (day) {
    const a = AST.lunarPhase(day, AST.MOONS[0]);
    const v = AST.lunarPhase(day, AST.MOONS[1]);
    // Uso físico: marea lumínica y actividad de fauna. Nunca cambios de personalidad.
    return {
      auralis: a,
      veyra: v,
      resonance: '2:1',
      nightLightBoost: U.round(a.illuminated * 0.7 + v.illuminated * 0.3, 2),
      predatorActivity: U.round(0.4 + a.illuminated * 0.4, 2),
      tide: U.round(Math.cos(a.phase * Math.PI * 2), 2)
    };
  };
})(typeof window !== 'undefined' ? window : globalThis);
