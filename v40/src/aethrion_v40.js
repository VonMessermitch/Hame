/* =========================================================================
   v40/src/aethrion_v40.js — Capa de fusión Aethrion para Sombras sobre el Nilo.

   Se carga DESPUÉS de:
     - el motor del juego v39 (capítulos I–VI, ya funcionando),
     - los módulos del cerebro universal (AETH: genética, fisiología, sentidos,
       memoria, emoción, personalidad, cultura, GOAP, combate, mundo).

   No modifica el juego original: añade un teatro de operaciones cognitivo
   paralelo, la creación de NPC por descripción, un inspector, una batalla por
   sectores dirigida por los mismos cerebros y persistencia JSON.

   Todo el núcleo (teatro, población, batalla) funciona sin DOM, de modo que
   puede probarse en Node. El panel sólo se monta si existe `document`.
   ========================================================================= */
(function (g) {
  'use strict';

  const AETH = g.AETH;
  if (!AETH) {
    if (typeof console !== 'undefined') console.warn('[Aethrion v40] falta el motor AETH');
    return;
  }

  const U = AETH.util;
  const V = (AETH.v40 = {});

  V.version = '1.0.0';
  V.build = 'v40/v1';
  V.title = 'Sombras sobre el Nilo — Edición Aethrion v40';

  /* =======================================================================
     1. TEATRO DE OPERACIONES — los seis capítulos de v39 como lugares
     ======================================================================= */

  V.SECTORS = [
    { id: 'tebas', name: 'La Grieta de Tebas', type: 'templo', biome: 'desierto', x: 0, z: 0, radius: 24, owner: 'coalicion_praga', value: 1.0, fort: 0.45 },
    { id: 'trinchera', name: 'La Trinchera', type: 'cuartel', biome: 'serevan', x: 90, z: 10, radius: 22, owner: 'alianza_eisenmark', value: 1.1, fort: 0.7 },
    { id: 'mazmorra', name: 'Mazmorra de Stalingrado', type: 'taller', biome: 'durn', x: 178, z: -6, radius: 18, owner: 'coalicion_praga', value: 0.8, fort: 0.6 },
    { id: 'puerto', name: 'Puerto Oriental', type: 'mercado', biome: 'eirhama', x: 262, z: 14, radius: 24, owner: 'alianza_eisenmark', value: 1.3, fort: 0.3 },
    { id: 'pavlov', name: 'La Casa Pávlov', type: 'casa', biome: 'serevan', x: 344, z: -4, radius: 16, owner: 'coalicion_praga', value: 1.0, fort: 0.8 },
    { id: 'encrucijada', name: 'La Encrucijada', type: 'plaza', biome: 'serevan', x: 424, z: 8, radius: 22, owner: 'alianza_eisenmark', value: 1.4, fort: 0.2 }
  ];

  const SUPPORT = [
    { id: 'hospital_v40', name: 'Puesto de socorro', type: 'hospital', biome: 'serevan', x: 120, z: -40, radius: 10, indoor: true, noise: 0.1 },
    { id: 'posada_v40', name: 'Cantina de campaña', type: 'posada', biome: 'serevan', x: 80, z: 46, radius: 10, indoor: true, noise: 0.3 },
    { id: 'campo_v40', name: 'Eras del sur', type: 'campo', biome: 'serevan', x: 210, z: 60, radius: 18, noise: 0.06 },
    { id: 'bosque_v40', name: 'Soto de la orilla', type: 'bosque', biome: 'serevan', x: 300, z: 60, radius: 16, noise: 0.05 },
    { id: 'fuente_v40', name: 'Fuente de la encrucijada', type: 'fuente', biome: 'serevan', x: 418, z: 34, radius: 5, noise: 0.15 },
    { id: 'estacion_v40', name: 'Apeadero militar', type: 'estacion', biome: 'serevan', x: 168, z: 40, radius: 12, noise: 0.35 }
  ];

  const CAST = [
    'Oberleutnant Kovač, 34 años, oficial jäger de Eisenmark, nacido en las montañas de Volskaya, desconfiado, buen tirador, casado, religioso, experiencia en artillería y miedo a los dragones',
    'Sargento Vuković, 41 años, soldado veterano de Volskaya, originario de una región montañosa, leal, supersticioso, casado, con la rodilla lesionada y sed de venganza por la Guerra de Orvek',
    'Cabo Weiss, 26 años, ametrallador de Eisenmark, frío, disciplinado, soltero, jugador empedernido',
    'Fusilero Halász, 22 años, soldado raso de Eisenmark, nervioso, curioso, analfabeto, con miedo a morir y ganas de volver a casa',
    'Sanitario Marek, 38 años, médico de campaña de Volskaya, empático, insomne, viudo, devoto de la Fe del Hacedor',
    'Hierofante Seshat, 57 años, sacerdote del Sol de Tebas, orgulloso, culto, con ambición política y miedo a la Plaga Ámbar',
    'Custodio Anhur, 29 años, oficial de los Custodios de Horus, fanático, valiente, con un hermano perdido en la grieta',
    'Mecánico Broz, 47 años, mecánico ferroviario de Borgñon, pragmático, ahorrador, con deudas y una familia que mantener',
    'Cantinera Ilse, 33 años, tabernera de Praga, sociable, chismosa, madre soltera, con buen ojo para el dinero',
    'Explorador Tepes, 24 años, cazador de los bosques de Orm, silencioso, desconfiado de los oficiales, con cicatrices de metralla',
    'Ingeniero Sato, 36 años, ingeniero de la coalición de Praga, metódico, escéptico, con experiencia en explosivos',
    'Comandante Zheng, 45 años, oficial de Zheng-Hua, austero, calculador, con prestigio alto y miedo a la artillería'
  ];

  V.CAST = CAST;

  V.createTheatre = function (opts) {
    opts = opts || {};
    const w = new AETH.world.World({ day: 148, hour: 8.5, seed: opts.seed || 77192, timeScale: opts.timeScale || 300 });
    for (const s of V.SECTORS) {
      w.addLocation({
        id: s.id,
        name: s.name,
        type: s.type,
        biome: s.biome,
        x: s.x,
        z: s.z,
        radius: s.radius,
        noise: 0.3,
        sector: true,
        owner: s.owner,
        value: s.value,
        fort: s.fort
      });
    }
    for (const s of SUPPORT) w.addLocation(U.clone(s));
    w.focus = { x: 90, z: 10 };
    return w;
  };

  /* =======================================================================
     2. POBLACIÓN — cerebros completos ligados a los sectores del teatro
     ======================================================================= */

  V.seedPopulation = function (world, opts) {
    opts = opts || {};
    const count = opts.count === undefined ? 28 : opts.count;
    const brains = [];
    for (let i = 0; i < count; i++) {
      const desc = i < CAST.length ? CAST[i] : generatedDescription(world.rng, i);
      let b;
      try {
        b = world.spawn({ description: desc });
      } catch (e) {
        b = world.spawn({ name: 'Habitante ' + (i + 1), age: 20 + Math.floor(world.rng.next() * 40), profession: 'campesino' });
      }
      // Reparto territorial coherente con la facción.
      const faction = b.identity.faction;
      const pool = V.SECTORS.filter((s) => (faction === 'coalicion_praga' ? s.owner === 'coalicion_praga' : s.owner === 'alianza_eisenmark'));
      const sector = (pool.length ? pool : V.SECTORS)[Math.floor(world.rng.next() * (pool.length || V.SECTORS.length))];
      b.position.x = sector.x + world.rng.range(-sector.radius * 0.6, sector.radius * 0.6);
      b.position.z = sector.z + world.rng.range(-sector.radius * 0.6, sector.radius * 0.6);
      b.location = world.placeAt(b.position);
      b.sectorId = sector.id;
      if (b.identity.profession === 'soldado' || b.identity.profession === 'oficial' || /soldad|oficial|militar/.test(desc)) {
        b.identity.militaryRole = b.identity.profession === 'oficial' ? 'oficial' : 'soldado';
      }
      b.task = null;
      b.pendingDecision = null;
      brains.push(b);
    }
    return brains;
  };

  const NAMES = ['Ada', 'Boris', 'Celia', 'Dmitri', 'Elena', 'Fyodor', 'Greta', 'Hugo', 'Irina', 'Jonas', 'Kira', 'Lars', 'Mira', 'Nikolai', 'Olga', 'Pavel', 'Rosa', 'Stefan', 'Tamara', 'Ulf'];
  const PROFESSIONS = ['soldado', 'mecanico ferroviario', 'medico', 'campesino', 'comerciante', 'cazador', 'artesano', 'profesor', 'oficial', 'marinero'];
  const TRAITS = ['desconfiado', 'leal', 'sarcástico', 'religioso', 'ambicioso', 'tímido', 'valiente', 'calculador', 'supersticioso', 'paciente'];

  function generatedDescription(rng, i) {
    const name = NAMES[Math.floor(rng.next() * NAMES.length)] + ' ' + (i + 1);
    const age = 18 + Math.floor(rng.next() * 45);
    const prof = PROFESSIONS[Math.floor(rng.next() * PROFESSIONS.length)];
    const t1 = TRAITS[Math.floor(rng.next() * TRAITS.length)];
    const t2 = TRAITS[Math.floor(rng.next() * TRAITS.length)];
    const faction = rng.next() < 0.5 ? 'de Eisenmark' : 'de la coalición de Praga';
    return name + ', ' + age + ' años, ' + prof + ' ' + faction + ', ' + t1 + ' y ' + t2;
  }
  V.generatedDescription = generatedDescription;

  /* =======================================================================
     3. BATALLA POR SECTORES — escuadras dirigidas por cerebros
     ======================================================================= */

  const SQUAD_TYPES = [
    { id: 'fusileros', label: 'Fusileros', atk: 1.0, def: 1.0, sup: 0.5 },
    { id: 'asalto', label: 'Asalto', atk: 1.3, def: 0.8, sup: 0.3 },
    { id: 'ametralladora', label: 'Ametralladoras', atk: 1.15, def: 1.2, sup: 1.4 },
    { id: 'ingenieros', label: 'Ingenieros', atk: 0.7, def: 1.1, sup: 0.4 },
    { id: 'reconocimiento', label: 'Reconocimiento', atk: 0.8, def: 0.7, sup: 0.2 },
    { id: 'artilleria', label: 'Artillería', atk: 1.5, def: 0.6, sup: 1.6 }
  ];

  class Battlefield {
    constructor(opts) {
      opts = opts || {};
      this.world = opts.world || null;
      this.rng = new U.RNG(opts.seed || 4242);
      this.factions = (opts.factions || [
        { id: 'alianza_eisenmark', label: 'Alianza Eisenmark' },
        { id: 'coalicion_praga', label: 'Coalición de Praga' }
      ]).map((f) => Object.assign({}, f));
      this.sectors = (opts.sectors || V.SECTORS).map((s) => ({
        id: s.id,
        name: s.name,
        owner: s.owner,
        value: s.value,
        fort: s.fort,
        contested: false
      }));
      this.squads = [];
      this.log = [];
      this.time = 0;
      this.running = false;
      this.winner = null;
      this.casualties = { alianza_eisenmark: 0, coalicion_praga: 0 };
      this._lastCycle = 0;
      this._lastReinforce = 0;
      this.buildSquads(opts.brains);
    }

    indexOf(id) {
      for (let i = 0; i < this.sectors.length; i++) if (this.sectors[i].id === id) return i;
      return -1;
    }
    sector(id) {
      const i = this.indexOf(id);
      return i < 0 ? null : this.sectors[i];
    }
    neighbors(id) {
      const i = this.indexOf(id);
      if (i < 0) return [];
      return [this.sectors[i - 1], this.sectors[i + 1]].filter(Boolean);
    }

    buildSquads(brains) {
      const list = (brains || (this.world ? this.world.brains : [])).filter((b) => b.alive !== false);
      const byFaction = {};
      for (const b of list) {
        const f = b.identity.faction === 'coalicion_praga' ? 'coalicion_praga' : 'alianza_eisenmark';
        (byFaction[f] = byFaction[f] || []).push(b);
      }
      for (const f of this.factions) {
        const pool = byFaction[f.id] || [];
        const own = this.sectors.filter((s) => s.owner === f.id);
        if (!own.length) continue;
        const groups = Math.max(1, Math.ceil(pool.length / 4));
        for (let i = 0; i < groups; i++) {
          const members = pool.slice(i * 4, i * 4 + 4);
          const type = SQUAD_TYPES[i % SQUAD_TYPES.length];
          this.squads.push({
            id: f.id + '_sq' + i,
            name: type.label + ' ' + (i + 1) + ' · ' + f.label,
            faction: f.id,
            type: type.id,
            sectorId: own[i % own.length].id,
            strength: Math.max(24, members.length * 22 + 20),
            morale: 0.7,
            suppression: 0,
            fatigue: 0,
            order: 'defender',
            brainIds: members.map((m) => m.id),
            typeDef: type,
            destroyed: false
          });
        }
      }
    }

    squadBrains(sq) {
      if (!this.world) return [];
      return sq.brainIds.map((id) => this.world.byId[id]).filter((b) => b && b.alive !== false);
    }

    /* Moral, agresión y miedo salen del cerebro de los integrantes. */
    squadMind(sq) {
      const bs = this.squadBrains(sq);
      if (!bs.length) return { fear: 0.25, aggression: 0.5, discipline: 0.5, morale: sq.morale, cohesion: 0.5, count: 0 };
      let fear = 0,
        aggression = 0,
        discipline = 0,
        morale = 0,
        cohesion = 0;
      for (const b of bs) {
        fear += b.emotions.get('miedo');
        aggression += b.personality.get('aggression');
        discipline += b.personality.get('discipline');
        morale += 1 - b.needs.state.supervivencia.level * 0.5;
        cohesion += b.memory.people ? Math.min(1, Object.keys(b.memory.people).length / 6) : 0.3;
      }
      const n = bs.length;
      return { fear: fear / n, aggression: aggression / n, discipline: discipline / n, morale: morale / n, cohesion: cohesion / n, count: n };
    }

    start() {
      this.running = true;
      this.note('La batalla comienza. ' + this.squads.length + ' escuadras en ' + this.sectors.length + ' sectores.');
      return this;
    }
    pause() {
      this.running = false;
      return this;
    }

    note(text, kind) {
      this.log.unshift({ t: Math.round(this.time), kind: kind || 'info', text: text });
      if (this.log.length > 60) this.log.pop();
    }

    tick(dt) {
      if (!this.running || this.winner) return this;
      dt = Math.max(0, Math.min(dt, 30));
      this.time += dt;
      this._lastCycle = this._lastCycle || 0;
      if (this.time - this._lastCycle >= 5) {
        this._lastCycle = this.time;
        for (const sq of this.squads) if (!sq.destroyed) this.decide(sq);
        for (const s of this.sectors) this.resolveSector(s);
        this.checkVictory();
      }
      if (this.time - this._lastReinforce >= 45) {
        this._lastReinforce = this.time;
        this.reinforce();
      }
      return this;
    }

    decide(sq) {
      const mind = this.squadMind(sq);
      const here = this.sector(sq.sectorId);
      if (!here) return;
      sq.morale = U.clamp(sq.morale * 0.7 + (1 - mind.fear) * 0.5 * (0.6 + mind.discipline * 0.6), 0, 1);
      const broken = sq.morale < 0.32 || mind.fear > 0.62;
      const enemies = this.squads.filter((o) => !o.destroyed && o.faction !== sq.faction && o.sectorId === sq.sectorId);
      if (broken) {
        const home = this.neighbors(sq.sectorId).filter((s) => s.owner === sq.faction);
        if (home.length) {
          if (sq.order !== 'retirarse') this.note(sq.name + ' se repliega: la moral se ha roto.', 'rout');
          sq.order = 'retirarse';
          sq.sectorId = home[Math.floor(this.rng.next() * home.length)].id;
          sq.suppression = Math.max(0, sq.suppression - 0.2);
          return;
        }
        sq.order = 'resistir';
        return;
      }
      if (enemies.length) {
        sq.order = here.owner === sq.faction ? 'defender' : 'asaltar';
        return;
      }
      if (here.owner === sq.faction) {
        // Buscar el sector enemigo más débil y adyacente.
        const targets = this.neighbors(sq.sectorId).filter((s) => s.owner !== sq.faction);
        if (targets.length) {
          let best = targets[0],
            bs = Infinity;
          for (const t of targets) {
            const def = this.squads.filter((o) => !o.destroyed && o.faction === t.owner && o.sectorId === t.id).reduce((a, o) => a + o.strength, 0) + t.fort * 60;
            const score = def / Math.max(0.3, t.value) - mind.aggression * 120;
            if (score < bs) {
              bs = score;
              best = t;
            }
          }
          sq.order = best.fort > 0.6 && mind.aggression < 0.5 ? 'preparar' : 'atacar';
          if (sq.order === 'atacar') sq.sectorId = best.id;
          else sq.suppression = Math.max(0, sq.suppression - 0.15);
          return;
        }
        sq.order = 'reforzar';
        return;
      }
      sq.order = 'asaltar';
    }

    resolveSector(s) {
      const present = this.squads.filter((q) => !q.destroyed && q.sectorId === s.id);
      const factions = [...new Set(present.map((q) => q.faction))];
      s.contested = factions.length > 1;
      if (factions.length < 2) return;
      const power = {};
      for (const q of present) {
        const mind = this.squadMind(q);
        const atk = q.typeDef.atk * (0.65 + mind.aggression * 0.55) * (1 - q.suppression) * (0.6 + q.morale * 0.7);
        power[q.faction] = (power[q.faction] || 0) + q.strength * atk;
      }
      const entries = Object.keys(power).sort((a, b) => power[b] - power[a]);
      const best = entries[0];
      const worst = entries[entries.length - 1];
      const ratio = power[best] / Math.max(1, power[worst]);
      for (const q of present) {
        const sup = q.typeDef.sup || 0.4;
        q.suppression = U.clamp(q.suppression + (q.faction === worst ? sup * 0.18 : 0.04), 0, 1);
        q.strength = Math.max(0, q.strength - (q.faction === worst ? 3 + ratio * 2 : 1.5));
        if (q.suppression > 0.85) q.morale = U.clamp(q.morale - 0.08, 0, 1);
        // La baja se propaga al cerebro: memoria, duelo y miedo reales.
        if (q.faction === worst && q.strength < 55 && this.world) {
          const bs = this.squadBrains(q);
          if (bs.length && this.rng.chance(0.55)) this.killMember(bs[0], s);
        }
        if (q.strength <= 0) {
          q.destroyed = true;
          this.note('La ' + q.name + ' ha sido aniquilada en ' + s.name + '.', 'loss');
        }
      }
      if (ratio > 1.35 && best !== s.owner) {
        s.owner = best;
        this.note(s.name + ' cae en manos de ' + this.factionLabel(best) + '.', 'capture');
      }
    }

    killMember(brain, sector) {
      if (!brain || brain.alive === false) return;
      this.world.kill(brain, 'combate en ' + sector.name);
      this.casualties[brain.identity.faction === 'coalicion_praga' ? 'coalicion_praga' : 'alianza_eisenmark']++;
    }

    reinforce() {
      for (const f of this.factions) {
        const owned = this.sectors.filter((s) => s.owner === f.id);
        if (!owned.length) continue;
        let live = this.squads.filter((q) => !q.destroyed && q.faction === f.id);
        if (!live.length) {
          const s = owned[0];
          const type = SQUAD_TYPES[0];
          live = [
            {
              id: f.id + '_sq' + this.squads.length,
              name: type.label + ' de reserva · ' + f.label,
              faction: f.id,
              type: type.id,
              sectorId: s.id,
              strength: 70,
              morale: 0.6,
              suppression: 0,
              order: 'defender',
              brainIds: [],
              typeDef: type,
              destroyed: false
            }
          ];
          this.squads.push(live[0]);
          this.note('Llegan refuerzos de ' + f.label + ' a ' + s.name + '.', 'reinforce');
        }
        for (const q of live) {
          q.strength = Math.min(120, q.strength + 4);
          q.morale = U.clamp(q.morale + 0.03, 0, 1);
          q.suppression = Math.max(0, q.suppression - 0.05);
        }
      }
    }

    factionLabel(id) {
      const f = this.factions.find((x) => x.id === id);
      return f ? f.label : id;
    }

    checkVictory() {
      const owners = [...new Set(this.sectors.map((s) => s.owner))];
      if (owners.length === 1 && this.sectors.length) {
        this.winner = owners[0];
        this.running = false;
        this.note('Victoria de ' + this.factionLabel(this.winner) + ': controla todos los sectores.', 'victory');
      }
    }

    status() {
      const out = { time: Math.round(this.time), running: this.running, winner: this.winner, sectors: [], squads: [], casualties: this.casualties, log: this.log.slice(0, 12) };
      for (const s of this.sectors) {
        const garrison = this.squads.filter((q) => !q.destroyed && q.sectorId === s.id);
        out.sectors.push({ id: s.id, name: s.name, owner: s.owner, ownerLabel: this.factionLabel(s.owner), contested: s.contested, strength: Math.round(garrison.reduce((a, q) => a + q.strength, 0)) });
      }
      for (const q of this.squads) {
        if (q.destroyed) continue;
        const m = this.squadMind(q);
        out.squads.push({ id: q.id, name: q.name, faction: q.faction, sector: q.sectorId, strength: Math.round(q.strength), morale: U.round(q.morale, 2), suppression: U.round(q.suppression, 2), fear: U.round(m.fear, 2), order: q.order });
      }
      return out;
    }

    save() {
      return U.sanitize({
        time: this.time,
        running: this.running,
        winner: this.winner,
        rng: this.rng.save ? this.rng.save() : null,
        sections: this.sectors.map((s) => ({ id: s.id, owner: s.owner, contested: s.contested })),
        squads: this.squads.map((q) => ({ id: q.id, sectorId: q.sectorId, strength: q.strength, morale: q.morale, suppression: q.suppression, order: q.order, destroyed: q.destroyed, brainIds: q.brainIds }))
      });
    }

    load(data) {
      if (!data) return this;
      this.time = data.time || 0;
      this.running = !!data.running;
      this.winner = data.winner || null;
      if (data.sections) for (const d of data.sections) {
        const s = this.sector(d.id);
        if (s) {
          s.owner = d.owner;
          s.contested = !!d.contested;
        }
      }
      if (data.squads) for (const d of data.squads) {
        const q = this.squads.find((x) => x.id === d.id);
        if (q) Object.assign(q, { sectorId: d.sectorId, strength: d.strength, morale: d.morale, suppression: d.suppression, order: d.order, destroyed: d.destroyed });
      }
      return this;
    }
  }

  V.Battlefield = Battlefield;
  V.SQUAD_TYPES = SQUAD_TYPES;

  /* =======================================================================
     4. SESIÓN — mundo + batalla + persistencia
     ======================================================================= */

  function Session(opts) {
    opts = opts || {};
    this.world = opts.world || V.createTheatre(opts);
    if (!this.world.brains.length) V.seedPopulation(this.world, { count: opts.population === undefined ? 28 : opts.population });
    this.battle = opts.battle || new Battlefield({ world: this.world, seed: opts.seed || 4242 });
    this.created = [];
    this.startedAt = Date.now();
    this._lastSave = 0;
    this._acc = 0;
  }

  Session.prototype.step = function (dtReal) {
    if (!(dtReal > 0)) return this;
    this.world.update(Math.min(dtReal, 0.25), this.world.focus);
    if (this.battle.running) this.battle.tick(dtReal * Math.max(1, this.world.timeScale / 300));
    return this;
  };

  Session.prototype.create = function (description, where) {
    const brain = this.world.spawn({ description: description, spawnLocation: where || null });
    // Colocación junto al sector indicado o junto al oficial.
    const anchor = where ? this.world.locationById(where) : this.world.locations.find((l) => l.id === 'trinchera');
    if (anchor) {
      brain.position.x = anchor.x + this.world.rng.range(-4, 4);
      brain.position.z = anchor.z + this.world.rng.range(-4, 4);
      brain.location = anchor;
      brain.sectorId = anchor.id;
    }
    brain.task = null;
    brain.pendingDecision = null;
    this.created.push(brain.id);
    return brain;
  };

  Session.prototype.save = function () {
    return U.sanitize({
      app: 'aethrion-v40',
      version: V.version,
      savedAt: new Date().toISOString(),
      world: this.world.save(),
      battle: this.battle.save(),
      created: this.created
    });
  };

  Session.prototype.load = function (data) {
    if (!data) throw new Error('estado vacío');
    if (data.app && data.app !== 'aethrion-v40') throw new Error('el archivo no es un guardado de Aethrion v40');
    if (!data.world) throw new Error('el archivo no contiene un mundo');
    this.world.load(data.world);
    for (const b of this.world.brains) {
      b.task = null;
      b.pendingDecision = null;
      b.motion = { active: false };
    }
    if (data.battle) this.battle.load(data.battle);
    this.created = data.created || [];
    return this;
  };

  V.Session = Session;
  V.createSession = function (opts) {
    return new Session(opts);
  };

  /* =======================================================================
     5. PANEL DE INTERFAZ (sólo navegador)
     ======================================================================= */

  const CSS = `
  #a40btn{position:fixed;left:14px;top:14px;z-index:40;background:#1d2a1aee;color:#b9e68c;border:1px solid #6f9a4b;padding:9px 14px;font:bold 13px Georgia,serif;letter-spacing:2px;border-radius:4px;cursor:pointer;text-shadow:0 1px 3px #000}
  #a40btn:hover{background:#2b3d25}
  #a40panel{position:fixed;inset:4% 4% 4% 4%;z-index:41;background:#14100bee;border:1px solid #8a6a32;color:#f3e6c4;display:none;flex-direction:column;font:13px/1.45 Georgia,serif;border-radius:6px;box-shadow:0 12px 40px #000c;overflow:hidden}
  #a40panel.on{display:flex}
  .a40-head{display:flex;align-items:center;gap:10px;padding:10px 14px;border-bottom:1px solid #8a6a3255;background:#1c150e}
  .a40-head h3{margin:0;font-size:15px;letter-spacing:2px;color:#e0b050}
  .a40-head .a40-x{margin-left:auto}
  .a40-tabs{display:flex;flex-wrap:wrap;gap:4px;padding:8px 10px;background:#181209;border-bottom:1px solid #8a6a3233}
  .a40-tabs button{background:#231a10;color:#d8c79c;border:1px solid #6b5328;padding:6px 12px;font:12px Georgia,serif;border-radius:3px;cursor:pointer;letter-spacing:1px}
  .a40-tabs button.on{background:#e0b050;color:#1b140d;font-weight:bold}
  .a40-body{flex:1;overflow:auto;padding:14px}
  .a40-tab{display:none}.a40-tab.on{display:block}
  .a40-panel button{background:#2a2013;color:#e6d6ac;border:1px solid #7a5f2c;padding:7px 12px;font:12px Georgia,serif;border-radius:3px;cursor:pointer}
  .a40-panel button:hover{background:#3a2c18}
  .a40-panel button.pri{background:#e0b050;color:#1b140d;font-weight:bold;border-color:#e0b050}
  .a40-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:10px}
  .a40-card{background:#1c1610;border:1px solid #4d3d20;border-radius:4px;padding:10px}
  .a40-card h4{margin:0 0 6px;color:#e0b050;font-size:13px;letter-spacing:1px}
  .a40-kv{display:flex;justify-content:space-between;gap:8px;font-size:12px;color:#cfc0a0;border-bottom:1px dotted #3a2f1d;padding:2px 0}
  .a40-bar{height:7px;background:#00000066;border:1px solid #4d3d20;margin:3px 0 6px}
  .a40-bar i{display:block;height:100%;background:linear-gradient(90deg,#6b9a3a,#e0b050)}
  .a40-bar.bad i{background:linear-gradient(90deg,#a33,#e0553a)}
  .a40-list{max-height:46vh;overflow:auto;border:1px solid #4d3d20;border-radius:4px}
  .a40-row{padding:6px 9px;border-bottom:1px solid #2c2314;cursor:pointer;display:flex;gap:8px;justify-content:space-between;font-size:12px}
  .a40-row:hover{background:#241b10}.a40-row.on{background:#33270f;color:#ffe2a0}
  .a40-row small{color:#9b8a68}
  #a40text{width:100%;min-height:90px;background:#0f0c07;color:#f3e6c4;border:1px solid #6b5328;padding:8px;font:13px Georgia,serif;box-sizing:border-box;border-radius:3px}
  .a40-log{font:12px/1.5 monospace;color:#bfd8a8;max-height:190px;overflow:auto;background:#0f0c07;border:1px solid #3a2f1d;padding:8px;border-radius:3px}
  .a40-sector{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;margin:8px 0}
  .a40-sec{padding:8px;border-radius:4px;border:1px solid #6b5328;font-size:12px;text-align:center;background:#1b1610}
  .a40-sec.eisen{border-color:#7fa6d8;background:#16202c}
  .a40-sec.praga{border-color:#d88a7f;background:#2a1614}
  .a40-sec b{display:block;font-size:11px;letter-spacing:1px;color:#e0b050}
  .a40-sec .a40-own{font-size:11px;opacity:.85}
  .a40-note{font-size:12px;color:#a89a7c;font-style:italic}
  .a40-pill{display:inline-block;padding:1px 7px;border:1px solid #6b5328;border-radius:9px;font-size:11px;margin:0 4px 4px 0;color:#d8c79c}
  `;

  function esc(s) {
    return String(s === undefined || s === null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function bar(v, bad) {
    const p = Math.round(U.clamp(v, 0, 1) * 100);
    return '<div class="a40-bar' + (bad ? ' bad' : '') + '"><i style="width:' + p + '%"></i></div>';
  }

  V.mount = function (opts) {
    if (typeof document === 'undefined') return null;
    opts = opts || {};
    if (V._mounted) return V._mounted;
    const session = opts.session || V.createSession(opts);
    V.session = session;

    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    const btn = document.createElement('button');
    btn.id = 'a40btn';
    btn.type = 'button';
    btn.textContent = '⬢ AETHRION';
    document.body.appendChild(btn);

    const panel = document.createElement('div');
    panel.id = 'a40panel';
    panel.className = 'a40-panel';
    panel.innerHTML = `
      <div class="a40-head"><h3>AETHRION · CEREBRO UNIVERSAL</h3>
        <span class="a40-note" id="a40-ver">v40/v1</span>
        <button class="a40-x" data-act="close" type="button">Cerrar ✕</button></div>
      <div class="a40-tabs">
        <button data-tab="resumen" class="on" type="button">Resumen</button>
        <button data-tab="crear" type="button">Crear NPC</button>
        <button data-tab="hab" type="button">Habitantes</button>
        <button data-tab="batalla" type="button">Batalla</button>
        <button data-tab="datos" type="button">Datos</button>
        <button data-tab="ayuda" type="button">Ayuda</button>
      </div>
      <div class="a40-body">
        <div class="a40-tab on" data-tab="resumen" id="a40-t-resumen"></div>
        <div class="a40-tab" data-tab="crear">
          <p class="a40-note">Describe un personaje en español. El motor lo convierte en genética, fisiología, personalidad, cultura, memoria, objetivos y comportamiento. Sin modelos de lenguaje: tablas semánticas y ontologías.</p>
          <textarea id="a40text">Soldado veterano de Volskaya, 34 años, originario de una región montañosa, desconfiado, buen tirador, casado, religioso, con experiencia en artillería y miedo a los dragones</textarea>
          <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap">
            <button class="pri" data-act="create" type="button">Crear NPC</button>
            <button data-act="example1" type="button">Ejemplo: oficial</button>
            <button data-act="example2" type="button">Ejemplo: sanitaria</button>
            <button data-act="example3" type="button">Ejemplo: hierofante</button>
          </div>
          <div id="a40-created" style="margin-top:10px"></div>
        </div>
        <div class="a40-tab" data-tab="hab" id="a40-t-hab"></div>
        <div class="a40-tab" data-tab="batalla" id="a40-t-batalla"></div>
        <div class="a40-tab" data-tab="datos" id="a40-t-datos"></div>
        <div class="a40-tab" data-tab="ayuda">
          <div class="a40-card">
            <h4>Qué añade la edición Aethrion (v40)</h4>
            <p>El juego de la v39 se conserva intacto: menú, capítulos I–VI, armas, vehículos, jefes y opciones gráficas funcionan igual. Encima se añade un <b>teatro de operaciones cognitivo</b> con población autónoma, creación de NPC por descripción, inspector, batalla por sectores y guardado JSON.</p>
            <h4 style="margin-top:12px">Controles</h4>
            <div class="a40-kv"><span>Pulsar ⬢ AETHRION (arriba izquierda)</span><span>abrir / cerrar el panel</span></div>
            <div class="a40-kv"><span>K</span><span>abrir / cerrar el panel</span></div>
            <div class="a40-kv"><span>Consola</span><span>window.AETHRION</span></div>
            <h4 style="margin-top:12px">Límites conocidos</h4>
            <p>La simulación cognitiva corre en paralelo al combate FPS; no sustituye a la IA de las misiones de la v39. La batalla por sectores es una simulación táctica (escuadras, moral, suministros) representada en el panel, no un campo de batalla 3D con cientos de soldados visibles.</p>
          </div>
        </div>
      </div>`;
    document.body.appendChild(panel);

    const el = (id) => document.getElementById(id);
    let tab = 'resumen';
    let selected = session.world.brains[0] ? session.world.brains[0].id : null;

    function open(v) {
      panel.classList.toggle('on', v !== false);
      if (v !== false) refreshAll();
    }
    btn.addEventListener('click', () => open(!panel.classList.contains('on')));
    panel.addEventListener('click', (ev) => {
      const t = ev.target.closest('button,[data-id]');
      if (!t) return;
      if (t.dataset.tab) {
        tab = t.dataset.tab;
        panel.querySelectorAll('.a40-tabs button').forEach((b) => b.classList.toggle('on', b.dataset.tab === tab));
        panel.querySelectorAll('.a40-tab').forEach((b) => b.classList.toggle('on', b.dataset.tab === tab));
        refreshAll();
        return;
      }
      if (t.dataset.id) {
        selected = t.dataset.id;
        refreshHab();
        return;
      }
      act(t.dataset.act);
    });

    function act(a) {
      if (a === 'close') return open(false);
      if (a === 'create') return doCreate(el('a40text').value);
      if (a === 'example1') return (el('a40text').value = 'Coronel Reinhardt, 52 años, oficial de Eisenmark, nacido en la llanura industrial de Praga, autoritario, calculador, viudo, con prestigio alto y miedo a la artillería');
      if (a === 'example2') return (el('a40text').value = 'Sanitaria Mira, 29 años, médico de Volskaya, empática, insomne, soltera, religiosa, con experiencia en heridas de metralla');
      if (a === 'example3') return (el('a40text').value = 'Hierofante Anubis, 63 años, sacerdote del Sol de Tebas, orgulloso, culto, ambicioso, con miedo a la Plaga Ámbar y sed de venganza');
      if (a === 'event-bomb') return doEvent('bombardeo');
      if (a === 'event-fair') return doEvent('feria');
      if (a === 'event-rumor') return doEvent('rumor', { text: 'la coalición ha cruzado el río' });
      if (a === 'event-train') return doEvent('tren');
      if (a === 'advance') {
        session.world.advanceStep(60);
        return refreshAll();
      }
      if (a === 'battle-start') {
        session.battle.running ? session.battle.pause() : session.battle.start();
        return refreshBatalla();
      }
      if (a === 'battle-step') {
        session.battle.running = true;
        session.battle.tick(30);
        return refreshBatalla();
      }
      if (a === 'battle-reset') {
        session.battle = new Battlefield({ world: session.world, seed: 4242 });
        return refreshBatalla();
      }
      if (a === 'export') return doExport();
      if (a === 'import') return el('a40file').click();
      if (a === 'save-local') return doSaveLocal();
      if (a === 'load-local') return doLoadLocal();
      if (a === 'tick10') {
        for (let i = 0; i < 10; i++) session.step(0.25);
        return refreshAll();
      }
    }

    function doCreate(text) {
      const t = String(text || '').trim();
      if (t.length < 8) return;
      const b = session.create(t, null);
      selected = b.id;
      const p = b.describeShort ? b.describeShort() : { name: b.identity.name };
      el('a40-created').innerHTML =
        '<div class="a40-card"><h4>' + esc(b.identity.name) + '</h4>' +
        '<div class="a40-kv"><span>Oficio</span><span>' + esc(b.identity.profession) + '</span></div>' +
        '<div class="a40-kv"><span>Etnia / facción</span><span>' + esc(b.culture.ethnicityLabel || b.identity.ethnicity) + ' · ' + esc(b.culture.factionLabel) + '</span></div>' +
        '<div class="a40-kv"><span>Edad / sexo</span><span>' + b.identity.age + ' · ' + esc(b.identity.sex) + '</span></div>' +
        '<div class="a40-kv"><span>Sector</span><span>' + esc((b.location && b.location.name) || '—') + '</span></div>' +
        '<p class="a40-note">' + esc(p.text || p.summary || 'Ha nacido en la simulación y ya tiene memoria, necesidades y objetivos propios.') + '</p></div>';
      refreshHab();
      refreshResumen();
    }

    function doEvent(type, extra) {
      session.world.focus = session.world.focus || { x: 0, z: 0 };
      const near = selected && session.world.byId[selected];
      if (near) session.world.focus = { x: near.position.x, z: near.position.z };
      session.world.injectEvent(type, extra || {});
      refreshResumen();
    }

    function doExport() {
      const blob = new Blob([JSON.stringify(session.save(), null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'aethrion_v40_estado.json';
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    }

    function doSaveLocal() {
      try {
        localStorage.setItem('aethrion_v40', JSON.stringify(session.save()));
        alert('Partida de Aethrion guardada en este navegador.');
      } catch (e) {
        alert('No se pudo guardar: ' + e.message);
      }
    }
    function doLoadLocal() {
      try {
        const raw = localStorage.getItem('aethrion_v40');
        if (!raw) return alert('No hay partida guardada en este navegador.');
        session.load(JSON.parse(raw));
        selected = session.world.brains[0] ? session.world.brains[0].id : null;
        refreshAll();
        alert('Partida restaurada: ' + session.world.brains.length + ' habitantes.');
      } catch (e) {
        alert('No se pudo cargar: ' + e.message);
      }
    }

    const file = document.createElement('input');
    file.type = 'file';
    file.accept = '.json,application/json';
    file.id = 'a40file';
    file.style.display = 'none';
    panel.appendChild(file);
    file.addEventListener('change', () => {
      const f = file.files && file.files[0];
      if (!f) return;
      const fr = new FileReader();
      fr.onload = () => {
        try {
          session.load(JSON.parse(String(fr.result)));
          selected = session.world.brains[0] ? session.world.brains[0].id : null;
          refreshAll();
        } catch (e) {
          alert('Archivo no válido: ' + e.message);
        }
      };
      fr.readAsText(f);
      file.value = '';
    });

    function refreshResumen() {
      const w = session.world;
      const d = w.describe();
      const st = w.stats;
      el('a40-t-resumen').innerHTML =
        '<div class="a40-grid">' +
        card('Reloj', [
          ['Fecha', d.fecha],
          ['Estación', d.estacion],
          ['Escala', '×' + w.timeScale],
          ['Clima', d.clima + ' · ' + U.round(d.temperatura, 1) + ' °C']
        ]) +
        card('Población', [
          ['Vivos', d.poblacion],
          ['LOD 1 / 2 / 3', d.lod[1] + ' / ' + d.lod[2] + ' / ' + d.lod[3]],
          ['Decisiones', st.actions],
          ['Encuentros', st.social]
        ]) +
        card('Faccciones', Object.keys(w.populationByFaction()).map((k) => [k, w.populationByFaction()[k]])) +
        '</div>' +
        '<div class="a40-card" style="margin-top:10px"><h4>Últimos acontecimientos</h4>' +
        (d.eventos.length ? d.eventos.map((e) => '<div class="a40-kv"><span>' + esc(e.at) + '</span><span>' + esc(e.label) + '</span></div>').join('') : '<p class="a40-note">Sin acontecimientos todavía.</p>') +
        '<div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap">' +
        '<button data-act="advance" type="button">Avanzar 1 h</button>' +
        '<button data-act="event-bomb" type="button">Bombardeo</button>' +
        '<button data-act="event-fair" type="button">Feria</button>' +
        '<button data-act="event-rumor" type="button">Rumor</button>' +
        '<button data-act="event-train" type="button">Tren</button>' +
        '</div></div>' +
        '<div class="a40-card" style="margin-top:10px"><h4>Diálogos recientes</h4>' +
        (w.dialogueFeed.length
          ? w.dialogueFeed.slice(-6).reverse().map((l) => '<div class="a40-kv"><span>' + esc(l.a) + ' → ' + esc(l.b) + '</span><span>' + esc(l.text) + '</span></div>').join('')
          : '<p class="a40-note">Los habitantes aún no han conversado. Avanza el tiempo.</p>') +
        '</div>';
    }

    function card(title, rows) {
      return '<div class="a40-card"><h4>' + esc(title) + '</h4>' + rows.map((r) => '<div class="a40-kv"><span>' + esc(r[0]) + '</span><span>' + esc(r[1]) + '</span></div>').join('') + '</div>';
    }

    function refreshHab() {
      const brains = session.world.brains;
      const list = brains.map((b) =>
        '<div class="a40-row' + (b.id === selected ? ' on' : '') + '" data-id="' + b.id + '"><span>' + esc(b.identity.name) + '</span><small>' + esc(b.identity.profession) + ' · ' + (b.alive === false ? 'muerto' : esc(b.activity)) + '</small></div>'
      ).join('');
      const b = selected && session.world.byId[selected];
      let detail = '<p class="a40-note">Selecciona un habitante.</p>';
      if (b) {
        const needs = Object.keys(AETH.needs.DEFS).slice(0, 10).map((k) => {
          const lvl = b.needs.state[k] ? b.needs.state[k].level : 0;
          return '<div class="a40-kv"><span>' + esc(AETH.needs.DEFS[k].label) + '</span><span>' + Math.round(lvl * 100) + '%</span></div>' + bar(lvl, lvl > 0.7);
        }).join('');
        const emo = ['miedo', 'ira', 'alegria', 'ansiedad', 'confianza', 'orgullo'].map((k) => '<div class="a40-kv"><span>' + k + '</span><span>' + Math.round(b.emotions.get(k) * 100) + '%</span></div>' + bar(b.emotions.get(k), k === 'miedo' || k === 'ira')).join('');
        const mems = (b.memory.episodic || []).slice(-4).reverse().map((m) => '<div class="a40-kv"><span>' + esc(m.summary) + '</span><span>' + U.round(m.importance, 2) + '</span></div>').join('') || '<p class="a40-note">Sin recuerdos aún.</p>';
        const g0 = b.intent && b.intent.goal;
        const goal = esc(g0 && g0.label ? g0.label : typeof g0 === 'string' ? g0 : (b.intent && b.intent.reason) || '—');
        detail =
          '<div class="a40-card"><h4>' + esc(b.identity.name) + ' <span class="a40-pill">' + esc(b.identity.profession) + '</span><span class="a40-pill">' + esc(b.culture.factionLabel) + '</span></h4>' +
          '<div class="a40-kv"><span>Edad / sexo</span><span>' + b.identity.age + ' · ' + esc(b.identity.sex) + '</span></div>' +
          '<div class="a40-kv"><span>Etnia</span><span>' + esc(b.culture.ethnicityLabel || b.identity.ethnicity) + '</span></div>' +
          '<div class="a40-kv"><span>Sector</span><span>' + esc((b.location && b.location.name) || '—') + '</span></div>' +
          '<div class="a40-kv"><span>Actividad</span><span>' + esc(b.alive === false ? 'muerto' : b.activity) + '</span></div>' +
          '<div class="a40-kv"><span>Objetivo</span><span>' + goal + '</span></div>' +
          '<div class="a40-kv"><span>Salud / sangre</span><span>' + Math.round((b.physiology.state.health || 0) * 100) + '% · ' + U.round(b.physiology.state.bloodVolume, 2) + '</span></div>' +
          '<div class="a40-kv"><span>Heridas</span><span>' + ((b.body.injuries || []).map((i) => i.label).join(', ') || 'ninguna') + '</span></div>' +
          '</div>' +
          '<div class="a40-grid" style="margin-top:10px">' +
          '<div class="a40-card"><h4>Necesidades</h4>' + needs + '</div>' +
          '<div class="a40-card"><h4>Emociones</h4>' + emo + '</div>' +
          '<div class="a40-card"><h4>Memoria</h4>' + mems + '</div>' +
          '</div>';
      }
      el('a40-t-hab').innerHTML =
        '<div style="display:grid;grid-template-columns:minmax(190px,1fr) 2fr;gap:12px">' +
        '<div class="a40-list">' + list + '</div><div>' + detail + '</div></div>';
    }

    function refreshBatalla() {
      const st = session.battle.status();
      const secs = st.sectors.map((s) =>
        '<div class="a40-sec ' + (s.owner === 'alianza_eisenmark' ? 'eisen' : 'praga') + '"><b>' + esc(s.name) + '</b>' +
        '<div class="a40-own">' + esc(s.ownerLabel) + (s.contested ? ' ⚔' : '') + '</div>' +
        '<div class="a40-own">' + s.strength + ' hombres</div></div>'
      ).join('');
      const sq = st.squads.map((q) => '<div class="a40-row"><span>' + esc(q.name) + '</span><small>' + esc(q.order) + ' · ' + q.strength + ' · moral ' + q.morale + ' · miedo ' + q.fear + '</small></div>').join('') || '<p class="a40-note">Sin escuadras.</p>';
      el('a40-t-batalla').innerHTML =
        '<div class="a40-card"><h4>Frente de sectores · t+' + st.time + ' s' + (st.winner ? ' · VICTORIA ' + esc(st.winner) : '') + '</h4>' +
        '<div class="a40-sector">' + secs + '</div>' +
        '<div style="display:flex;gap:6px;flex-wrap:wrap">' +
        '<button class="pri" data-act="battle-start" type="button">' + (st.running ? 'Pausar' : 'Iniciar batalla') + '</button>' +
        '<button data-act="battle-step" type="button">Avanzar 30 s</button>' +
        '<button data-act="battle-reset" type="button">Reiniciar</button>' +
        '<span class="a40-note">Bajas: Eisenmark ' + st.casualties.alianza_eisenmark + ' · Praga ' + st.casualties.coalicion_praga + '</span>' +
        '</div></div>' +
        '<div class="a40-grid" style="margin-top:10px"><div class="a40-card"><h4>Escuadras</h4><div class="a40-list">' + sq + '</div></div>' +
        '<div class="a40-card"><h4>Parte de guerra</h4><div class="a40-log">' + st.log.map((l) => '[' + l.t + 's] ' + esc(l.text)).join('<br>') + '</div></div></div>';
    }

    function refreshDatos() {
      el('a40-t-datos').innerHTML =
        '<div class="a40-grid">' +
        '<div class="a40-card"><h4>Guardado JSON</h4>' +
        '<p class="a40-note">Exporta el estado completo (mundo, cerebros, memorias, relaciones, batalla) e impórtalo después. La importación valida el archivo y reconstruye la simulación.</p>' +
        '<div style="display:flex;gap:6px;flex-wrap:wrap"><button class="pri" data-act="export" type="button">Exportar JSON</button>' +
        '<button data-act="import" type="button">Importar JSON</button></div></div>' +
        '<div class="a40-card"><h4>Este navegador</h4>' +
        '<p class="a40-note">Guardado rápido en localStorage, útil para continuar entre sesiones sin descargar archivos.</p>' +
        '<div style="display:flex;gap:6px;flex-wrap:wrap"><button data-act="save-local" type="button">Guardar</button>' +
        '<button data-act="load-local" type="button">Cargar</button></div></div>' +
        '<div class="a40-card"><h4>Consola</h4>' +
        '<div class="a40-kv"><span>AETHRION.session.world</span><span>mundo</span></div>' +
        '<div class="a40-kv"><span>AETHRION.session.battle</span><span>batalla</span></div>' +
        '<div class="a40-kv"><span>AETHRION.create(\'...\')</span><span>nuevo NPC</span></div>' +
        '<div class="a40-kv"><span>AETHRION.save()</span><span>estado</span></div></div>' +
        '</div>';
    }

    function refreshAll() {
      refreshResumen();
      refreshHab();
      refreshBatalla();
      refreshDatos();
    }

    /* Bucle propio de la capa cognitiva (independiente del render del juego). */
    setInterval(() => {
      try {
        session.step(0.25);
        if (panel.classList.contains('on')) {
          if (tab === 'resumen') refreshResumen();
          else if (tab === 'batalla') refreshBatalla();
        }
      } catch (e) {
        if (typeof console !== 'undefined') console.warn('[Aethrion v40] tick', e);
      }
    }, 700);

    setInterval(() => {
      try {
        localStorage.setItem('aethrion_v40', JSON.stringify(session.save()));
      } catch (e) {
        /* almacenamiento lleno o bloqueado: no es fatal */
      }
    }, 45000);

    document.addEventListener('keydown', (ev) => {
      if (ev.key === 'k' || ev.key === 'K') {
        if (ev.target && /input|textarea|select/i.test(ev.target.tagName || '')) return;
        open(!panel.classList.contains('on'));
      }
    });

    V._mounted = { panel: panel, session: session, refresh: refreshAll, open: open };
    return V._mounted;
  };

  /* API de consola. */
  V.bootstrap = function (opts) {
    const mounted = V.mount(opts || {});
    const session = (mounted && mounted.session) || V.session || V.createSession(opts || {});
    const api = {
      version: V.version,
      build: V.build,
      session: session,
      get world() {
        return session.world;
      },
      get battle() {
        return session.battle;
      },
      create: (desc, where) => session.create(desc, where),
      spawn: (spec) => session.world.spawn(spec),
      event: (type, opts2) => session.world.injectEvent(type, opts2),
      save: () => session.save(),
      load: (data) => session.load(data),
      open: () => mounted && mounted.open(true),
      close: () => mounted && mounted.open(false),
      V: V,
      AETH: AETH
    };
    g.AETHRION = api;
    V.api = api;
    return api;
  };
})(typeof window !== 'undefined' ? window : globalThis);
