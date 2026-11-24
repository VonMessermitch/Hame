/* =========================================================================
   ai/environment/climate.js — biomas, clima, meteorología y entorno local.
   Proporciona datos ambientales coherentes al cerebro de cada NPC.
   ========================================================================= */
(function (g) {
  'use strict';
  const AETH = g.AETH;
  const U = AETH.util;
  const AST = AETH.astronomy;

  const CL = (AETH.climate = {});

  CL.biomes = {
    varend: {
      id: 'varend',
      label: 'Varend · selva tropical',
      baseTempC: 26,
      humidity: 0.86,
      rainChance: 0.42,
      fogChance: 0.14,
      terrain: 'selva, manglar, islas',
      flora: ['caoba', 'helechos gigantes', 'orquídeas', 'bambú'],
      fauna: ['jaguares', 'tapires', 'aves de presa', 'serpientes', 'dragones forestales'],
      hazards: ['barro', 'enfermedad', 'tormenta', 'fauna venenosa'],
      resources: ['madera', 'especias', 'resina', 'fruta']
    },
    orm: {
      id: 'orm',
      label: 'Orm · taiga y turberas',
      baseTempC: -4,
      humidity: 0.7,
      rainChance: 0.28,
      fogChance: 0.3,
      terrain: 'coníferas, pantanos helados, montañas',
      flora: ['pino', 'abedul', 'musgo', 'arándano'],
      fauna: ['alces', 'lobos', 'osos', 'linces', 'dragones alpinos'],
      hazards: ['frío extremo', 'nieve', 'turba traicionera'],
      resources: ['madera', 'turba', 'caza', 'hierro']
    },
    cordillera: {
      id: 'cordillera',
      label: 'Cordillera de las Cuatro Coronas',
      baseTempC: 2,
      humidity: 0.55,
      rainChance: 0.25,
      fogChance: 0.28,
      terrain: 'glaciares, bosques australes, estepas de altura',
      flora: ['alerce', 'pino negro', 'líquenes', 'brezo'],
      fauna: ['cabra montés', 'águila', 'lobo de altura', 'dragones alpinos'],
      hazards: ['altitud', 'aludes', 'frío', 'precipicios'],
      resources: ['piedra', 'hierro', 'carbón', 'madera']
    },
    serevan: {
      id: 'serevan',
      label: 'Serevan · praderas y humedales',
      baseTempC: 12,
      humidity: 0.62,
      rainChance: 0.22,
      fogChance: 0.18,
      terrain: 'pradera, lagunas, ríos, sotos',
      flora: ['trigo', 'cebada', 'sauce', 'junco'],
      fauna: ['ciervos', 'bisontes', 'garzas', 'lobos de pradera'],
      hazards: ['crecidas', 'tormenta', 'barro'],
      resources: ['grano', 'ganado', 'pesca', 'arcilla']
    },
    eirhama: {
      id: 'eirhama',
      label: 'Eirhama · acantilados y volcanes',
      baseTempC: 14,
      humidity: 0.68,
      rainChance: 0.3,
      fogChance: 0.26,
      terrain: 'acantilados, bosque templado, volcanes, islas',
      flora: ['roble', 'pino marítimo', 'hinojo', 'musgo'],
      fauna: ['focas', 'halcones', 'cabras', 'dragones costeros'],
      hazards: ['desprendimientos', 'ceniza', 'marea'],
      resources: ['pesca', 'sal', 'basalto', 'astilleros']
    },
    namar: {
      id: 'namar',
      label: 'Namar · selvas inundadas',
      baseTempC: 29,
      humidity: 0.92,
      rainChance: 0.48,
      fogChance: 0.35,
      terrain: 'pantanos, ríos lentos, grandes cuencas',
      flora: ['mangle', 'loto', 'caña', 'lianas'],
      fauna: ['cocodrilos', 'aves acuáticas', 'serpientes', 'peces eléctricos'],
      hazards: ['enfermedad', 'pozos de fango', 'inundación', 'fauna'],
      resources: ['pesca', 'arroz', 'fibras', 'medicinas']
    }
  };

  CL.seasonTempDelta = function (biomeId, day) {
    const season = AST.season(day);
    const biome = CL.biomes[biomeId] || CL.biomes.serevan;
    const ampl = biome.id === 'varend' || biome.id === 'namar' ? 2.5 : biome.id === 'orm' || biome.id === 'cordillera' ? 1.4 : 1.0;
    return season.tempDelta * ampl;
  };

  /* Genera el clima del día para un bioma; determinista por semilla de día. */
  CL.dayWeather = function (biomeId, day, seed) {
    const biome = CL.biomes[biomeId] || CL.biomes.serevan;
    const rng = new U.RNG(U.hashString(biomeId + ':' + day + ':' + (seed || 0)));
    const season = AST.season(day);
    const delta = CL.seasonTempDelta(biomeId, day);
    const tempBase = biome.baseTempC + delta + AST.seasonIndex(day) * 0.4;
    const diurnal = rng.range(-2.5, 2.5);
    const storm = rng.chance(0.06 + (season.id === 'verano' ? 0.06 : 0));
    return {
      biome: biomeId,
      season: season.id,
      tempHighC: U.round(tempBase + 5 + diurnal, 1),
      tempLowC: U.round(tempBase - 4 + diurnal, 1),
      humidity: U.round(U.clamp(biome.humidity + rng.gauss(0, 0.07), 0.1, 1), 2),
      rain: U.round(U.clamp((rng.chance(biome.rainChance) ? rng.range(0.25, 0.95) : 0) + (storm ? 0.4 : 0), 0, 1), 2),
      fog: U.round(U.clamp((rng.chance(biome.fogChance) ? rng.range(0.15, 0.8) : 0) + (storm ? 0.2 : 0), 0, 1), 2),
      wind: U.round(rng.range(0.05, 0.85), 2),
      cloud: U.round(rng.range(0.1, 0.9), 2),
      storm: storm,
      visibility: U.round(U.clamp(1 - biome.fogChance * 0.5 - (storm ? 0.3 : 0), 0.25, 1), 2)
    };
  };

  CL.temperatureAt = function (dayWeather, hour) {
    const h = ((hour % AST.DAY_HOURS) + AST.DAY_HOURS) % AST.DAY_HOURS;
    const t = (h - 4) / (AST.DAY_HOURS - 3);
    const curve = Math.sin(U.clamp(t, 0, 1) * Math.PI);
    const base = dayWeather.tempLowC + (dayWeather.tempHighC - dayWeather.tempLowC) * curve;
    return U.round(base - dayWeather.rain * 1.5, 1);
  };

  CL.weatherObjects = {};

  CL.weatherFor = function (location, day) {
    if (!location) return CL.dayWeather('serevan', day, 0);
    const key = location.biome + ':' + day;
    if (!CL.weatherObjects[key]) CL.weatherObjects[key] = CL.dayWeather(location.biome, day, U.hashString(location.id || ''));
    return CL.weatherObjects[key];
  };

  /* Entorno percibido por un NPC en una posición. */
  CL.environmentAt = function (location, day, hour, extra) {
    const weather = CL.weatherFor(location, day);
    const lightAst = AST.illumination(day, hour);
    const temp = CL.temperatureAt(weather, hour);
    const fog = weather.fog;
    const rain = weather.rain;
    const light = U.clamp(lightAst.light * (1 - fog * 0.45) * (1 - rain * 0.2), 0.01, 1);
    return {
      location: location ? location.id : 'desconocido',
      biome: location ? location.biome : 'serevan',
      day: day,
      hour: hour,
      temperatureC: temp,
      humidity: weather.humidity,
      weather: { fog: fog, rain: rain, wind: weather.wind, storm: weather.storm, cloud: weather.cloud },
      light: U.round(light, 3),
      sun: lightAst.sun,
      moon: lightAst.moon,
      moons: lightAst.moons,
      season: weather.season,
      noiseFloor: U.round(U.clamp(0.08 + rain * 0.3 + weather.wind * 0.12 + (location && location.noisy ? 0.18 : 0), 0, 0.7), 2),
      arcaneNoise: U.round(U.clamp((extra && extra.arcaneNoise) || 0.05, 0, 1), 2),
      wind: { x: Math.sin(hour * 0.26) * weather.wind, z: Math.cos(hour * 0.19) * weather.wind, strength: weather.wind },
      visibility: weather.visibility,
      stars: lightAst.stars,
      phaseOfDay: AST.phaseOfDay(hour)
    };
  };
})(typeof window !== 'undefined' ? window : globalThis);
