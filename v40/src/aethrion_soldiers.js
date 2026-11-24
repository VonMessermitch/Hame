/* =========================================================================
   v40/src/aethrion_soldiers.js — Cerebro Aethrion para la infantería de la v39.

   Se carga DESPUÉS de la capa v40 (`aethrion_v40.js`) y después de todo el
   código de la v39 (el generador lo inyecta antes de </body>). Engancha las
   fábricas de soldados del juego para que **cada soldado de infantería**
   reciba un cerebro propio y lo conserve mientras vive:

     - enemigos de `spawnE()` (fusileros, custodios, granaderos, orcos, trasgos),
     - la escuadra del jugador (`allies`) y el oficial, al empezar el combate,
     - las guarniciones creadas por `gar9()`.

   El cerebro no sustituye a la IA de la v39: la modula. Cada segundo, un pulso
   cognitivo (barato, LOD 3) actualiza emoción y necesidades del soldado y
   escribe su miedo/moral. Ese estado produce dudas y hesitaciones reales en
   el combate, y las bajas cercanas suben el miedo de los compañeros.

   Todo el registro funciona sin DOM (probado en Node). El panel de v40 añade
   una pestaña «Soldados» si esta capa está presente.
   ========================================================================= */
(function (g) {
  'use strict';

  const AETH = g.AETH;
  const V = AETH && AETH.v40;
  if (!AETH || !V || !AETH.brain || !AETH.brain.Brain) {
    if (typeof console !== 'undefined') console.warn('[Aethrion soldados] falta el motor AETH o la capa v40');
    return;
  }

  const U = AETH.util;
  const S = (V.soldiers = {});

  S.version = '1.1.0';
  S.build = 'v40/v1.1';
  S.MAX = 260;          // cerebros vivos simultáneos (se reciclan los muertos)
  S.PULSE_SECONDS = 1;  // cadencia del pulso cognitivo
  S.enabled = true;

  S.units = [];         // enlaces vivos (binding)
  S.stats = {
    bound: 0,
    created: 0,
    pulses: 0,
    hesitations: 0,
    shocks: 0,
    deaths: 0,
    unbound: 0,
    errors: 0,
    lateBound: 0,
    lastPulseMs: 0
  };
  S.installed = [];
  S._acc = 0;
  S._pruneAcc = 0;

  /* ------------------------------------------------------------------ */
  /* Acceso seguro a variables léxicas de la v39 (no están en `window`). */
  /* ------------------------------------------------------------------ */

  function currentLevel() {
    try {
      return typeof level === 'number' ? level : 0;
    } catch (e) {
      return 0;
    }
  }

  function isPlaying() {
    try {
      return typeof playing !== 'undefined' && !!playing;
    } catch (e) {
      return false;
    }
  }

  function liveEnemies() {
    try {
      return Array.isArray(enemies) ? enemies : null;
    } catch (e) {
      return null;
    }
  }

  function liveAllies() {
    try {
      return Array.isArray(allies) ? allies : null;
    } catch (e) {
      return null;
    }
  }

  function playerPosition() {
    try {
      return P && P.g && P.g.position ? P.g.position : null;
    } catch (e) {
      return null;
    }
  }

  function positionOf(unit) {
    if (!unit) return null;
    if (unit.g && unit.g.position) return unit.g.position;
    if (unit.position) return unit.position;
    return null;
  }
  S.positionOf = positionOf;

  /* ------------------------------------------------------------------ */
  /* Identidad militar: nombres, grados y etnias coherentes con el canon. */
  /* ------------------------------------------------------------------ */

  const RANKS_ENEMY = ['Sturmmann', 'Gefreiter', 'Obergefreiter', 'Unteroffizier', 'Fusilero', 'Cabo'];
  const RANKS_ALLY = ['Fusilero', 'Cabo', 'Sargento', 'Teniente'];
  const SURNAMES = ['Brandt', 'Kessler', 'Vogt', 'Hartung', 'Lindner', 'Rauch', 'Falk', 'Adler', 'Holz', 'Weiss', 'Kranz', 'Roth', 'Baumann', 'Seidel', 'Krämer', 'Wendt', 'Busch', 'Lorenz', 'Vuković', 'Halász', 'Marek', 'Tepes'];
  const ETHNIA = ['montanesa_volskaya', 'riberena_borgnon', 'pragense_llanura', 'serevana_pradera', 'eirhama_costera', 'durn_karst'];
  const TRAITS = ['disciplinado', 'nervioso', 'valiente', 'desconfiado', 'leal', 'supersticioso', 'calculador', 'impulsivo', 'paciente', 'religioso'];
  const TYPES_INFANTRY = {
    sol: 'fusilero',
    custodio: 'guardia',
    granadero: 'granadero',
    orcoE: 'escopetero',
    orcoH: 'hachero',
    trasgo: 'hostigador'
  };

  let seq = 0;
  function nextName(side) {
    seq++;
    const rank = (side === 'ally' ? RANKS_ALLY : RANKS_ENEMY)[seq % (side === 'ally' ? RANKS_ALLY.length : RANKS_ENEMY.length)];
    return rank + ' ' + SURNAMES[(seq * 7 + Math.floor(seq / 3)) % SURNAMES.length];
  }

  function specFor(binding) {
    const side = binding.side;
    const lv = binding.level;
    const ethnicity = ETHNIA[(binding.n + lv) % ETHNIA.length];
    const veteran = (binding.n + lv) % 3 !== 0;
    const traits = [TRAITS[(binding.n * 3 + lv) % TRAITS.length], TRAITS[(binding.n * 5 + 2) % TRAITS.length]];
    return {
      id: 'mil_' + binding.n + '_' + lv + '_' + seq,
      name: binding.name,
      age: 19 + ((binding.n * 5 + lv * 3) % 24),
      sex: binding.n % 4 === 0 ? 'female' : 'male',
      profession: binding.type === 'oficial' ? 'oficial' : 'soldado',
      role: binding.type === 'oficial' ? 'oficial' : 'soldado',
      militaryRole: binding.type === 'oficial' ? 'oficial' : 'soldado',
      ethnicity: ethnicity,
      faction: side === 'ally' ? 'alianza_eisenmark' : 'coalicion_praga',
      nationality: side === 'ally' ? 'eisenmark' : 'praga',
      background: veteran ? 'Guerra de Orvek, 1921; servicio de infantería en el frente' : 'recluta de la leva de 1922',
      personality: traits,
      conditions: veteran && (binding.n + lv) % 7 === 0 ? { kneeInjury: true } : {},
      squadId: 'nivel_' + lv,
      tags: ['infanteria', 'nivel_' + lv, side]
    };
  }

  /* ------------------------------------------------------------------ */
  /* Enlace unidad del juego ↔ cerebro.                                  */
  /* ------------------------------------------------------------------ */

  function aliveCount() {
    let n = 0;
    for (const b of S.units) if (b.alive) n++;
    return n;
  }

  function prune() {
    if (S.units.length < S.MAX) {
      // Retira enlaces muertos antiguos aunque no se llegue al tope.
      if (S.units.length > 40) {
        S.units = S.units.filter((b) => b.alive || Date.now() - b.born < 120000);
      }
      return;
    }
    S.units = S.units.filter((b) => b.alive);
    while (S.units.length >= S.MAX) S.units.shift();
  }

  S.bind = function (unit, opts) {
    if (!unit || typeof unit !== 'object') return null;
    if (unit.__aethBinding) return unit.__aethBinding;
    opts = opts || {};
    const side = opts.side === 'ally' ? 'ally' : 'enemy';
    if (aliveCount() >= S.MAX) {
      prune();
      if (aliveCount() >= S.MAX) {
        S.stats.unbound++;
        return null;
      }
    }
    const type = opts.type || (side === 'ally' ? 'soldado' : 'sol');
    const binding = {
      n: ++seq,
      id: 'milsol_' + seq,
      side: side,
      level: opts.level === undefined ? currentLevel() : opts.level,
      type: type,
      late: !!opts.late,
      name: opts.name || (unit.name && String(unit.name).trim()) || nextName(side),
      unit: unit,
      born: Date.now(),
      alive: true,
      fear: 0,
      morale: 1,
      discipline: 0.5,
      aggression: 0.5,
      hesitations: 0,
      wounded: false,
      lastThreat: 0,
      lastShock: 0,
      view: null
    };
    let brain;
    try {
      brain = new AETH.brain.Brain(specFor(binding), { lod: 3 });
    } catch (e) {
      S.stats.errors++;
      return null;
    }
    binding.brain = brain;
    brain.identity.name = binding.name;
    brain.activity = 'combate';
    binding.discipline = brain.personality.get('discipline');
    binding.aggression = brain.personality.get('aggression');
    binding.fear = brain.emotions.get('miedo');
    binding.morale = U.clamp(1 - binding.fear * 0.65 + binding.discipline * 0.15, 0, 1);

    /* Postura inicial: la personalidad modula cadencia y paso, nunca el daño. */
    if (typeof unit.cd === 'number') unit.cd *= 0.9 + binding.aggression * 0.25;
    if (typeof unit.sp === 'number') unit.sp *= 0.95 + binding.aggression * 0.1;

    binding.view = {
      id: binding.id,
      name: binding.name,
      side: side,
      level: binding.level,
      fear: binding.fear,
      morale: binding.morale,
      discipline: binding.discipline,
      aggression: binding.aggression,
      hesitations: 0
    };
    unit.__aethBinding = binding;
    unit.aeth = binding.view;
    unit.aethBrain = brain;
    S.units.push(binding);
    S.stats.bound++;
    S.stats.created++;
    if (binding.late) S.stats.lateBound++;
    return binding;
  };

  function bindingOf(unit) {
    if (!unit) return null;
    return unit.__aethBinding || null;
  }
  S.bindingOf = bindingOf;

  /* Aliados creados por las fábricas propias de los capítulos IX–XVIII. */
  function bindLate(n, type) {
    if (!n || !n.g) return null;
    return S.bind(n, {
      side: 'ally',
      type: type || 'soldado',
      level: currentLevel(),
      name: n.name || null,
      late: true
    });
  }
  S.bindLate = bindLate;

  function markDead(binding, cause) {
    if (!binding || !binding.alive) return;
    binding.alive = false;
    binding.deadAt = Date.now();
    binding.cause = cause || 'combate';
    binding.brain.alive = false;
    S.stats.deaths++;
  }
  S.markDead = markDead;

  /* Sube el miedo de los compañeros de lado cerca de una baja. */
  S.shock = function (side, pos, intensity) {
    if (!pos) return 0;
    const now = Date.now();
    let touched = 0;
    const r = 28;
    for (const b of S.units) {
      if (!b.alive || b.side !== side) continue;
      const p = positionOf(b.unit);
      if (!p) continue;
      const d = Math.hypot(p.x - pos.x, p.z - pos.z);
      if (d > r || now - b.lastShock < 8000) continue;
      b.lastShock = now;
      try {
        b.brain.emotions.appraise({ type: 'muerte_conocido', intensity: U.clamp((intensity || 0.6) * (1 - d / r), 0.05, 0.9) });
        b.brain.memory.encodeEpisode({
          summary: 'perdió a un compañero a ' + Math.round(d) + ' m en el sector',
          kind: 'guerra',
          importance: 0.5,
          valence: -0.8,
          intensity: 0.7,
          time: b.brain.clockTime
        });
      } catch (e) {
        S.stats.errors++;
      }
      b.fear = U.clamp(b.brain.emotions.get('miedo'), 0, 1);
      b.morale = U.clamp(1 - b.fear * 0.65 + b.discipline * 0.15, 0, 1);
      if (b.view) {
        b.view.fear = U.round(b.fear, 3);
        b.view.morale = U.round(b.morale, 3);
      }
      touched++;
    }
    if (touched) S.stats.shocks += touched;
    return touched;
  };

  /* ------------------------------------------------------------------ */
  /* Pulso cognitivo: emoción + necesidades + decisiones de combate.     */
  /* ------------------------------------------------------------------ */

  function nearestFoeDistance(binding) {
    const p = positionOf(binding.unit);
    if (!p) return Infinity;
    if (binding.side === 'enemy') {
      const pp = playerPosition();
      return pp ? Math.hypot(pp.x - p.x, pp.z - p.z) : Infinity;
    }
    const list = liveEnemies();
    if (!list) return Infinity;
    let best = Infinity;
    for (const e of list) {
      if (e.active === false || !e.g) continue;
      const q = e.g.position;
      const d = Math.hypot(q.x - p.x, q.z - p.z);
      if (d < best) best = d;
    }
    return best;
  }

  function pulseUnit(b, seconds) {
    if (!b.alive) return;
    const brain = b.brain;
    const now = Date.now();
    /* El capítulo puede cambiar después de nacer (la escuadra se asigna antes
       de que startLevel2..6 fije `level`): el registro sigue al nivel real. */
    const lv = currentLevel();
    if (lv && lv !== b.level) {
      b.level = lv;
      if (b.view) b.view.level = lv;
    }
    try {
      brain.emotions.update(seconds);
      brain.needs.update(seconds / 3600, { danger: true, working: true });
      brain.memory.update(seconds / 86400, brain.personality);
    } catch (e) {
      S.stats.errors++;
      return;
    }

    /* Amenaza percibida: el cerebro la siente, no se la impone el guion. */
    const d = nearestFoeDistance(b);
    if (d < 34 && now - b.lastThreat > 9000) {
      b.lastThreat = now;
      try {
        /* Presión acotada: el miedo sube con la cercanía, pero no se satura
           en dos pulsos. La calma vuelve sola al alejarse el enemigo. */
        const intensity = U.clamp(0.05 + (1 - d / 34) * 0.15, 0.04, 0.2);
        brain.emotions.appraise({ type: 'amenaza', intensity: intensity });
        b.lastThreatDistance = Math.round(d);
      } catch (e) {
        S.stats.errors++;
      }
    }

    const fear = U.clamp(brain.emotions.get('miedo'), 0, 1);
    b.fear = fear;
    b.morale = U.clamp(1 - fear * 0.65 + b.discipline * 0.15, 0, 1);
    const u = b.unit;
    if (typeof u.aeth === 'object' && u.aeth) {
      u.aeth.fear = U.round(fear, 3);
      u.aeth.morale = U.round(b.morale, 3);
      u.aeth.hesitations = b.hesitations;
    }

    /* Los capítulos posteriores no usan `down`: cada fábrica marca a sus
       heridos y muertos con sus propias banderas. El cerebro las lee. */
    if (u.dead17 || u.dead === true) {
      if (b.alive) markDead(b, 'abatido');
      return;
    }
    if (u.down17 || u.down29) b.wounded = true;
    else if (typeof u.down === 'number' && u.down > 0) b.wounded = true;
    else if (b.wounded && (u.down === undefined || u.down <= 0) && !u.down17 && !u.down29) b.wounded = false;

    /* Consecuencia jugable: el miedo produce dudas; la disciplina las frena. */
    if (!isPlaying() || b.wounded) return;
    const scripted = !!u.scripted || !!u.k8 || u.type === 'boss' || u.type === 'mecha';
    if (scripted) return;

    if (fear > 0.78 && !u.unaware) {
      const chance = (fear - 0.75) * 2.2 * (1 - b.discipline * 0.75);
      if (chance > 0 && Math.random() < U.clamp(chance, 0, 0.6)) {
        if (hesitateUnit(u)) {
          b.hesitations++;
          S.stats.hesitations++;
        }
      }
    } else if (b.side === 'ally' && fear < 0.4 && b.discipline > 0.58) {
      if (typeof u.cd === 'number' && u.cd > 0.55 && Math.random() < 0.18) u.cd *= 0.85;
    }
  }

  /* Cada generación de la v39 mide la cadencia en un campo distinto: `cd` en la
     infantería base, `ft` en las escuadras XVII/XVIII y `gcd` en su guarnición.
     Se alarga el primero que esté activo; nunca se toca el daño ni el alcance. */
  const CADENCE_FIELDS = ['cd', 'ft', 'gcd'];
  function hesitateUnit(u) {
    for (const f of CADENCE_FIELDS) {
      const v = u[f];
      if (typeof v === 'number' && v < 1.2) {
        u[f] = 1.0 + Math.random() * 0.7;
        return true;
      }
    }
    return false;
  }

  function pruneUnits() {
    const en = liveEnemies();
    const al = liveAllies();
    if (!en && !al) return;
    const liveEnemy = en ? new Set(en) : null;
    const liveAlly = al ? new Set(al) : null;
    for (const b of S.units) {
      if (!b.alive) continue;
      const list = b.side === 'ally' ? liveAlly : liveEnemy;
      if (list && !list.has(b.unit)) {
        /* Los aliados heridos siguen en la lista; los retirados del juego no. */
        if (b.side === 'ally') {
          /* Las guarniciones (GAR) y las escuadras de capítulos posteriores no
             están en `allies`; sólo se retiran cuando el propio juego lo dice. */
          if (b.unit && b.unit.alive === false) {
            b.retired = true;
            b.alive = false;
          }
        } else if (!b.wounded) {
          markDead(b, 'retirado del campo');
        }
      }
    }
  }

  S.pulse = function (dt) {
    if (!S.enabled) return S.stats;
    S._acc += Math.max(0, dt || 0);
    if (S._acc < S.PULSE_SECONDS) return S.stats;
    const seconds = Math.min(S._acc, 5);
    S._acc = 0;
    const t0 = Date.now();
    for (const b of S.units) pulseUnit(b, seconds);
    S._pruneAcc += seconds;
    if (S._pruneAcc >= 4) {
      S._pruneAcc = 0;
      pruneUnits();
    }
    S.stats.pulses++;
    S.stats.lastPulseMs = Date.now() - t0;
    return S.stats;
  };

  S.update = function (dt) {
    return S.pulse(dt);
  };

  S.setEnabled = function (v) {
    S.enabled = !!v;
    return S.enabled;
  };

  /* ------------------------------------------------------------------ */
  /* Enganche con las fábricas de la v39 (envoltorios aditivos).         */
  /* ------------------------------------------------------------------ */

  function wrap(name, factory) {
    const orig = g[name];
    if (typeof orig !== 'function' || orig.__aethWrapped) return false;
    const replacement = factory(orig);
    replacement.__aethWrapped = true;
    replacement.__aethOrig = orig;
    g[name] = replacement;
    S.installed.push(name);
    return true;
  }

  S.install = function () {
    /* Enemigos: cualquier infantería creada por spawnE. */
    wrap('spawnE', (orig) =>
      function (type, x, z) {
        const e = orig.apply(this, arguments);
        try {
          if (e && TYPES_INFANTRY[type]) {
            S.bind(e, { side: 'enemy', type: type, level: currentLevel(), name: null });
            e.__aethType = TYPES_INFANTRY[type];
          }
        } catch (err) {
          S.stats.errors++;
        }
        return e;
      }
    );

    /* El oficial se recrea al empezar cada capítulo: se engancha al nacer. */
    wrap('makeOfficer', (orig) =>
      function () {
        const r = orig.apply(this, arguments);
        try {
          if (typeof officer !== 'undefined' && officer && officer.g) {
            S.bind(officer, { side: 'ally', type: 'oficial', level: currentLevel(), name: officer.name || null });
          }
        } catch (err) {
          S.stats.errors++;
        }
        return r;
      }
    );

    /* Escuadra del jugador y oficial: ya tienen nombre cuando se asignan. */
    wrap('assignBots', (orig) =>
      function () {
        const r = orig.apply(this, arguments);
        try {
          const list = liveAllies();
          if (list) {
            for (const a of list) {
              if (!a || !a.g) continue;
              S.bind(a, { side: 'ally', type: a.role === 'Apoyo' ? 'apoyo' : 'soldado', level: currentLevel(), name: a.name || null });
            }
          }
          try {
            if (typeof officer !== 'undefined' && officer && officer.g) {
              S.bind(officer, { side: 'ally', type: 'oficial', level: currentLevel(), name: officer.name || null });
            }
          } catch (e) {}
        } catch (err) {
          S.stats.errors++;
        }
        return r;
      }
    );

    /* Guarniciones aliadas de los capítulos con GAR. */
    wrap('gar9', (orig) =>
      function (list) {
        const made = orig.apply(this, arguments);
        try {
          if (Array.isArray(made)) {
            for (const s of made) {
              if (!s || !s.g) continue;
              S.bind(s, { side: 'ally', type: s.role || 'soldado', level: currentLevel(), name: s.name || null });
            }
          }
        } catch (err) {
          S.stats.errors++;
        }
        return made;
      }
    );

    /* ------------------ capítulos posteriores (IX–XVIII) ------------------ */
    /* Todas las guarniciones nacen en mkGar (gar9, gar10, capítulo VIII y
       las secciones siguientes). Enganchar la fábrica cubre a todas. */
    function lateAlly(name, type) {
      wrap(name, (orig) =>
        function () {
          const n = orig.apply(this, arguments);
          try {
            bindLate(n, type);
          } catch (err) {
            S.stats.errors++;
          }
          return n;
        }
      );
    }

    wrap('mkGar', (orig) =>
      function (i, kind) {
        const s = orig.apply(this, arguments);
        try {
          bindLate(s, kind || s.kind || 'guarnicion');
        } catch (err) {
          S.stats.errors++;
        }
        return s;
      }
    );
    lateAlly('gMk17', 'guarnicion');   // guarnición de las Tres Cruces (XVII)
    lateAlly('ally17', 'soldado');      // escuadra de Volskaya (XVII)
    lateAlly('ally18', 'soldado');      // escuadra y secciones del 12.º (XVIII)
    lateAlly('surv13', 'superviviente');// supervivientes tras las líneas (XIII)
    lateAlly('inf14', 'infanteria');    // infantería aliada del bastión (XIV)

    /* Marineros de Eisenmark (XV): sólo los que embarcan con arma. */
    wrap('sailor28', (orig) =>
      function (x, z, o) {
        const n = orig.apply(this, arguments);
        try {
          if (o && o.w) bindLate(n, 'marinero');
        } catch (err) {
          S.stats.errors++;
        }
        return n;
      }
    );

    /* Heridas y reanimación de las escuadras XVII/XVIII. */
    function lateDown(name) {
      wrap(name, (orig) =>
        function (n) {
          const r = orig.apply(this, arguments);
          try {
            const b = bindingOf(n);
            if (b && b.alive) {
              b.wounded = true;
              b.brain.emotions.appraise({ type: 'dolor', intensity: 0.55 });
              S.shock('ally', positionOf(n), 0.5);
            }
          } catch (err) {
            S.stats.errors++;
          }
          return r;
        }
      );
    }
    lateDown('down17');
    lateDown('down18');

    function lateRevive(name) {
      wrap(name, (orig) =>
        function (n) {
          const r = orig.apply(this, arguments);
          try {
            const b = bindingOf(n);
            if (b) {
              b.wounded = false;
              b.brain.emotions.appraise({ type: 'peligro_evitado', intensity: 0.4 });
            }
          } catch (err) {
            S.stats.errors++;
          }
          return r;
        }
      );
    }
    lateRevive('revive17');
    lateRevive('revive18');

    /* Daño y muerte: trauma real y shock de los compañeros. */
    wrap('hurt', (orig) =>
      function (e, dmg, mode, by) {
        const r = orig.apply(this, arguments);
        try {
          const b = bindingOf(e);
          if (b && b.alive) {
            const p = positionOf(e);
            if (typeof dmg === 'number' && dmg > 0) {
              b.brain.emotions.appraise({ type: 'dolor', intensity: U.clamp(dmg / (e.max || 100), 0.05, 0.8) });
              b.brain.physiology.state.pain = U.clamp((b.brain.physiology.state.pain || 0) + dmg / (e.max || 100), 0, 1);
            }
            if (e.hp <= 0) {
              markDead(b, 'abatido');
              S.shock('enemy', p, 0.7);
            }
          }
        } catch (err) {
          S.stats.errors++;
        }
        return r;
      }
    );

    wrap('kill', (orig) =>
      function (e) {
        try {
          const b = bindingOf(e);
          if (b && b.alive) {
            const p = positionOf(e);
            markDead(b, 'abatido');
            S.shock('enemy', p, 0.7);
          }
        } catch (err) {
          S.stats.errors++;
        }
        return orig.apply(this, arguments);
      }
    );

    wrap('garDamage', (orig) =>
      function (s, dmg, src, kind) {
        const r = orig.apply(this, arguments);
        try {
          const b = bindingOf(s);
          if (b && b.alive) {
            const p = positionOf(s);
            b.brain.emotions.appraise({ type: 'dolor', intensity: U.clamp((dmg || 0) / 120, 0.05, 0.7) });
            if (!s.alive) {
              markDead(b, 'muerto en la posición');
              S.shock('ally', p, 0.8);
            }
          }
        } catch (err) {
          S.stats.errors++;
        }
        return r;
      }
    );

    wrap('allyDamage', (orig) =>
      function (a, dmg) {
        const r = orig.apply(this, arguments);
        try {
          const b = bindingOf(a);
          if (b && b.alive) {
            b.brain.emotions.appraise({ type: 'dolor', intensity: U.clamp((dmg || 0) / 160, 0.05, 0.6) });
            if (typeof a.down === 'number' && a.down > 0) {
              b.wounded = true;
              S.shock('ally', positionOf(a), 0.45);
            }
          }
        } catch (err) {
          S.stats.errors++;
        }
        return r;
      }
    );

    /* Estado ya existente antes de cargar esta capa (raro, pero posible). */
    try {
      const list = liveAllies();
      if (list) for (const a of list) if (a && a.name && a.g) S.bind(a, { side: 'ally', level: currentLevel(), name: a.name });
    } catch (e) {}
    return S.installed.slice();
  };

  /* ------------------------------------------------------------------ */
  /* Panel: resumen por capítulo y fichas de soldados.                   */
  /* ------------------------------------------------------------------ */

  S.byLevel = function () {
    const out = {};
    for (const b of S.units) {
      const k = b.level || 0;
      const o = (out[k] = out[k] || { level: k, total: 0, alive: 0, fear: 0, morale: 0, hesitations: 0 });
      o.total++;
      if (b.alive) {
        o.alive++;
        o.fear += b.fear;
        o.morale += b.morale;
      }
      o.hesitations += b.hesitations;
    }
    for (const k of Object.keys(out)) {
      const o = out[k];
      if (o.alive) {
        o.fear = U.round(o.fear / o.alive, 2);
        o.morale = U.round(o.morale / o.alive, 2);
      }
    }
    return out;
  };

  S.list = function (opts) {
    opts = opts || {};
    let list = S.units.filter((b) => (opts.alive === false ? !b.retired : b.alive && !b.retired));
    if (opts.side) list = list.filter((b) => b.side === opts.side);
    if (opts.level) list = list.filter((b) => b.level === opts.level);
    list = list.slice().sort((a, b) => b.fear - a.fear);
    const limit = opts.limit || 14;
    return list.slice(0, limit).map((b) => ({
      id: b.id,
      name: b.name,
      side: b.side,
      level: b.level,
      type: b.type,
      alive: b.alive,
      fear: U.round(b.fear, 2),
      morale: U.round(b.morale, 2),
      discipline: U.round(b.discipline, 2),
      aggression: U.round(b.aggression, 2),
      hesitations: b.hesitations,
      wounded: b.wounded,
      profession: b.brain.identity.professionLabel,
      origin: b.brain.culture.ethnicityLabel,
      age: b.brain.identity.age,
      lastThreatDistance: b.lastThreatDistance || null
    }));
  };

  S.snapshot = function () {
    return {
      version: S.version,
      generatedAt: new Date().toISOString(),
      stats: Object.assign({}, S.stats),
      byLevel: S.byLevel(),
      units: S.units.map((b) => ({
        name: b.name,
        side: b.side,
        level: b.level,
        type: b.type,
        alive: b.alive,
        fear: U.round(b.fear, 2),
        morale: U.round(b.morale, 2),
        hesitations: b.hesitations
      }))
    };
  };

  /* El estado vivo de la escena no se puede reconstruir desde JSON; se
     restaura el registro histórico y se dice claramente. */
  S.restore = function (data) {
    if (!data) return 0;
    S.lastRestore = {
      at: new Date().toISOString(),
      units: (data.units || []).length,
      note: 'registro histórico restaurado; los soldados vivos los vuelve a crear el juego'
    };
    return S.lastRestore.units;
  };

  /* ------------------------------------------------------------------ */
  /* Arranque: enganchar ya y pulsar en segundo plano si hay navegador.  */
  /* ------------------------------------------------------------------ */

  S.install();

  if (typeof document !== 'undefined' && typeof setInterval === 'function') {
    setInterval(() => {
      try {
        S.pulse(1);
      } catch (e) {
        S.stats.errors++;
        if (typeof console !== 'undefined') console.warn('[Aethrion soldados] pulso', e);
      }
    }, 1000);
  }

  /* API de consola. */
  S.summary = function () {
    return {
      version: S.version,
      enabled: S.enabled,
      bound: S.stats.bound,
      alive: aliveCount(),
      pulses: S.stats.pulses,
      lateBound: S.stats.lateBound,
      hesitations: S.stats.hesitations,
      shocks: S.stats.shocks,
      deaths: S.stats.deaths,
      lastPulseMs: S.stats.lastPulseMs,
      installed: S.installed.slice()
    };
  };
})(typeof window !== 'undefined' ? window : globalThis);
