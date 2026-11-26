/* ============================================================================
   V.GAI.1.0 · CAMPAÑA DE VEYRN — NIVELES 19 Y 20 (AGENTE 2 & DISEÑO DE MISIONES)
   - Nivel 19 (XIX): «OPERACIÓN ROMPEOLAS» en Karsk (buildKarsk17 / X17)
     Perspectiva Veyrn: desembarco anfibio, Barranco Sokol, Tres Cruces,
     Depósito de Terek, Puerto de Drovna y ruptura del Puente de Orlov.
   - Nivel 20 (XX): «BASTIÓN DE HIERRO» en Varnholt (buildVarn18 / X18)
     Perspectiva Veyrn: emboscada en Dravik, defensa del Muro de Varn y
     Cota 214, Meseta, batalla urbana en Falkenbrück y contraataque norte.
   - Objetivos principales y 2 secundarios con recompensa en cada misión.
   - 6 puntos de control reales (0..5), guardado localStorage e integración
     completa en #lvsel, #cod (Códice) y #go.
   ============================================================================ */
(function () {
  'use strict';
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  window.AETH = window.AETH || {};
  window.AETH.vgai = window.AETH.vgai || {};

  var AT19 = [
    ['I', 'DESEMBARCO DEL FARO', [105, 38], 'Asalta la playa de Karsk y toma el puesto costero [E en radio/puertas]'],
    ['II', 'BARRANCO SOKOL', [12, -45], 'Remonta el barranco Sokol y limpia las emboscadas de Volskaya'],
    ['III', 'LÍNEA TRES CRUCES', [-10, -210], 'Abre brecha en las Tres Cruces y destruye los búnkeres defensivos'],
    ['IV', 'DEPÓSITO DE TEREK', [-30, -450], 'Captura la estación de Terek y asegura los planos en el edificio'],
    ['V', 'PUERTO DE DROVNA', [55, -620], 'Sabotea los depósitos de combustible [E] en el puerto de Drovna'],
    ['VI', 'PUENTE DE ORLOV', [-20, -740], 'Cruza el puente de Orlov y asegura la cabeza de puente norte']
  ];

  var AT20 = [
    ['I', 'BOSQUE DE DRAVIK', [0, 15], 'Contén la vanguardia de Volskaya al sur de la cabaña de Dravik'],
    ['II', 'MURO DE VARN', [0, -185], 'Defiende las trincheras de Varn y la Cota 214 contra el asalto enemigo'],
    ['III', 'MESETA DE VARN', [-40, -340], 'Contraataca en la meseta y rescata la patrulla en la granja borgoñona'],
    ['IV', 'CALLES DE FALKENBRÜCK', [0, -610], 'Defiende la plaza de Falkenbrück frente a las columnas enemigas'],
    ['V', 'PLAYA DE VÍAS', [-90, -710], 'Silencia la batería de Volskaya junto a la estación y talleres'],
    ['VI', 'CIUDADELA Y PUENTE', [0, -785], 'Rechaza el asalto final y asegúrate el puente norte de Varnholt']
  ];

  var N19 = {
    built: false, on: false, ph: 0, cpPh: 0, T: 0, t0: 0, kills: 0, sec1: false, sec2: false,
    sq: [], all: [], works: [], obj: null, w0: null, fpv0: true, supCd: 0, supCount: 0,
    enPool: [], spawnQueue: []
  };

  var N20 = {
    built: false, on: false, ph: 0, cpPh: 0, T: 0, t0: 0, kills: 0, sec1: false, sec2: false,
    sq: [], all: [], works: [], obj: null, w0: null, fpv0: true, supCd: 0, supCount: 0,
    enPool: [], spawnQueue: []
  };

  function difMul() {
    var d = typeof difficulty !== 'undefined' ? difficulty : 'normal';
    return d === 'easy' ? 0.78 : (d === 'hard' ? 1.25 : 1);
  }

  function sayVeyrn(speaker, text, clipEvent) {
    try {
      if (typeof talk === 'function') talk([[speaker, text, Math.max(2.6, text.length * 0.052)]]);
      else if (typeof say === 'function') say(speaker + ': «' + text + '»', 3.2);
    } catch (_) {}
    try {
      if (clipEvent && window.AUDIO_VGAI) window.AUDIO_VGAI.playEvent(clipEvent, { vol: 0.78 });
    } catch (_) {}
  }

  function spawnVeyrnAlly(lv, X, x, z, name, wpn, officer) {
    if (typeof npc11 !== 'function') return null;
    var n = npc11(X + x, z, {
      name: name,
      coat: 0x3a4048,
      hat: 'helm',
      hatC: 0x2c3032,
      rank: officer ? 2 : 0,
      officer: !!officer,
      f: Math.PI
    });
    n.lv = lv;
    if (typeof arm13 === 'function') arm13(n, wpn || 'r');
    if (typeof veyrn32 === 'function') {
      try { veyrn32(n, officer ? 'officer' : (wpn === 'smg' ? 'assault' : 'rifle')); } catch (_) {}
    }
    n.hp = 120;
    n.on = true;
    n.g.visible = true;
    n.vgaiAlly = true;
    if (typeof L9 !== 'undefined' && L9 && Array.isArray(L9.tgts)) {
      L9.tgts.push({
        p: n.g.position,
        h: function (d) { n.hp -= d * 0.65; if (n.hp <= 20) n.hp = 20; },
        ok: function () { return n.lv === level && n.g.visible && !n.down17; },
        r: 0.6, bias: 2, y: 1.9
      });
    }
    return n;
  }

  function spawnVolskEnemy(lv, X, k, x, z, tag) {
    if (typeof sp13 !== 'function') return null;
    var Xref = typeof X13 !== 'undefined' ? X13 : 80000;
    var e = sp13(k || 'mosin', x + X - Xref, z, { tag: tag || ('v' + lv) });
    e.t13 = tag || ('v' + lv);
    e.faction = 'volskaya';
    e.k8n = k === 'bar' ? 'a un ametrallador de Volskaya' : (k === 'stv' ? 'a un asaltante de Volskaya' : 'a un fusilero de Volskaya');
    if (typeof volsk32 === 'function') {
      try { volsk32(e, k === 'bar' ? 'mg' : (k === 'stv' ? 'r12' : 'rifle')); } catch (_) {}
    }
    e.unaware = false;
    e.active = true;
    e.alert = 0.4;
    e.hp *= difMul();
    e.max = e.hp;
    if (lv === 20 && typeof floor18 === 'function') {
      var fy = floor18(x, z);
      if (fy > 0.05) e.g.position.y = fy;
    }
    return e;
  }

  function clearMissionEntities(st) {
    if (typeof enemies !== 'undefined' && Array.isArray(enemies)) {
      for (var i = enemies.length - 1; i >= 0; i--) {
        if (enemies[i] && enemies[i].g && typeof scene !== 'undefined') scene.remove(enemies[i].g);
      }
      enemies.length = 0;
    }
    for (var j = 0; j < st.all.length; j++) {
      if (st.all[j] && st.all[j].g && typeof scene !== 'undefined') scene.remove(st.all[j].g);
    }
    st.all.length = 0;
    st.sq.length = 0;
    st.works.length = 0;
  }

  function equipVeyrnArsenal(st) {
    if (typeof P === 'undefined' || !P || !P.weapons) return;
    if (!st.w0) st.w0 = JSON.parse(JSON.stringify(P.weapons));
    if (typeof refill === 'function') refill(0);
    Object.assign(P.weapons.rifle, { mag: 5, max: 5, reserve: 45, cd: 0.52, dmg: 46, reload: 2.2, fov: 4, n: 'Fusil Veyrn V98' });
    Object.assign(P.weapons.smg, { mag: 32, max: 32, reserve: 96, cd: 0.085, dmg: 18, reload: 2.1, fov: 1, n: 'Subfusil Sturm V22' });
    Object.assign(P.weapons.revolver, { mag: 8, max: 8, reserve: 32, cd: 0.30, dmg: 35, reload: 1.9, fov: 4, n: 'Pistola V-08' });
    P.cur = 'rifle';
    P.grenades = 3;
    P.hp = 100;
  }

  function makeInteractiveMarker(X, x, z, label, r, onDone) {
    var m = null;
    if (typeof THREE !== 'undefined' && typeof scene !== 'undefined') {
      m = new THREE.Mesh(
        new THREE.CylinderGeometry(0.45, 0.45, 1.4, 10),
        new THREE.MeshBasicMaterial({ color: 0xf0b84a, transparent: true, opacity: 0.65 })
      );
      m.position.set(X + x, 0.7, z);
      scene.add(m);
    }
    return { x: X + x, z: z, r: r || 3.2, lbl: label, done: false, mesh: m, onDone: onDone };
  }

  function clearMarkers(st) {
    for (var i = 0; i < st.works.length; i++) {
      if (st.works[i].mesh && typeof scene !== 'undefined') scene.remove(st.works[i].mesh);
    }
    st.works.length = 0;
  }

  function loadPhase19(ph, isCheckpoint) {
    var X = typeof X17 !== 'undefined' ? X17 : 160000;
    N19.ph = ph;
    N19.cpPh = ph;
    N19.T = 0;
    clearMarkers(N19);
    if (typeof enemies !== 'undefined') {
      for (var i = enemies.length - 1; i >= 0; i--) {
        if (enemies[i].g && typeof scene !== 'undefined') scene.remove(enemies[i].g);
      }
      enemies.length = 0;
    }

    var row = AT19[ph] || AT19[0];
    var sp = row[2];
    if (isCheckpoint && typeof P !== 'undefined' && P.g) {
      P.g.position.set(X + sp[0], 0, sp[1]);
      for (var a = 0; a < N19.sq.length; a++) {
        if (N19.sq[a] && N19.sq[a].g) N19.sq[a].g.position.set(X + sp[0] + (a - 1.5) * 1.8, 0, sp[1] + 2.5);
      }
    }

    if (ph === 0) {
      N19.obj = [X + 35, 22];
      if (typeof obj9 === 'function') obj9('XIX · Toma el puesto costero de Karsk [Faro]', X + 35, 22);
      [[42, 24], [30, 18], [58, 28], [22, 12], [68, 16]].forEach(function (p, i) {
        spawnVolskEnemy(19, X, i === 2 ? 'stv' : 'mosin', p[0], p[1], 'p19_0');
      });
      N19.works.push(makeInteractiveMarker(X, 36, 22, '[E] Sabotear radio costera de Volskaya (Secundario)', 3.6, function () {
        N19.sec1 = true;
        if (typeof score !== 'undefined') score += 350;
        if (typeof feed === 'function') feed('★ Objetivo secundario completado: radio costera destruida');
        sayVeyrn('Feldwebel Richter', '¡Comunicaciones costeras enemigas fuera de combate!', 'beach_assault_de');
      }));
      sayVeyrn('Oberleutnant Brandt', '¡Escuadra Sturmtrupp a tierra! ¡Tomen el puesto del faro antes de que cierren la playa!', 'beach_assault_de');
    } else if (ph === 1) {
      N19.obj = [X - 30, -165];
      if (typeof obj9 === 'function') obj9('XIX · Asegura el Barranco Sokol hacia el norte', X - 30, -165);
      [[10, -55], [-4, -85], [-16, -115], [-28, -148], [-35, -172]].forEach(function (p, i) {
        spawnVolskEnemy(19, X, i === 3 ? 'bar' : 'mosin', p[0], p[1], 'p19_1');
      });
      sayVeyrn('Feldwebel Richter', '¡Avancen por el Barranco Sokol! Cuidado con los tiradores en las crestas.', 'order_move_in_de');
    } else if (ph === 2) {
      N19.obj = [X - 2, -255];
      if (typeof obj9 === 'function') obj9('XIX · Abre brecha en la Línea de las Tres Cruces', X - 2, -255);
      [[-75, -245], [-28, -252], [0, -255], [34, -250], [65, -246]].forEach(function (p, i) {
        spawnVolskEnemy(19, X, i % 2 ? 'stv' : 'bar', p[0], p[1], 'p19_2');
      });
      sayVeyrn('Pionier Weber', '¡Cuidado con la línea fortificada! ¡Fuego de supresión sobre las Tres Cruces!', 'order_fire_de');
    } else if (ph === 3) {
      N19.obj = [X - 30, -480];
      if (typeof obj9 === 'function') obj9('XIX · Toma el Depósito Ferroviario de Terek', X - 30, -480);
      [[-42, -468], [-25, -485], [-10, -495], [-55, -475], [-38, -515]].forEach(function (p, i) {
        spawnVolskEnemy(19, X, i === 1 ? 'bar' : 'stv', p[0], p[1], 'p19_3');
      });
      N19.works.push(makeInteractiveMarker(X, -42, -576, '[E] Recuperar planos de defensa de Drovna (Secundario)', 3.6, function () {
        N19.sec2 = true;
        if (typeof score !== 'undefined') score += 400;
        if (typeof feed === 'function') feed('★ Planos ferroviarios capturados');
        sayVeyrn('Oberleutnant Brandt', '¡Mapas asegurados! Ya conocemos los depósitos del puerto.', 'officer_order_de_1');
      }));
      sayVeyrn('Gefreiter Voss', '¡Estación de Terek a la vista! Hay tropas de Volskaya en el almacén.', 'enemy_spotted_de_1');
    } else if (ph === 4) {
      N19.obj = [X + 105, -635];
      if (typeof obj9 === 'function') obj9('XIX · Sabotea los depósitos del Puerto de Drovna [E]', X + 105, -635);
      [[35, -618], [58, -635], [82, -622], [115, -645], [148, -655]].forEach(function (p, i) {
        spawnVolskEnemy(19, X, i % 2 === 0 ? 'stv' : 'mosin', p[0], p[1], 'p19_4');
      });
      N19.works.push(makeInteractiveMarker(X, 82, -642, '[E] Colocar carga explosiva en depósito de combustible', 4.0, function () {
        if (typeof boom === 'function' && typeof THREE !== 'undefined') boom(new THREE.Vector3(X + 82, 1.5, -642));
        if (typeof feed === 'function') feed('★ Depósito de combustible destruido');
        if (typeof score !== 'undefined') score += 500;
        if (window.AUDIO_VGAI) window.AUDIO_VGAI.playEvent('bunker_explosion', { x: X + 82, z: -642, vol: 0.78 });
      }));
      sayVeyrn('Oberleutnant Brandt', '¡A los muelles de Drovna! Volad los tanques de combustible enemigos.', 'officer_order_de_2');
    } else if (ph === 5) {
      N19.obj = [X - 20, -860];
      if (typeof obj9 === 'function') obj9('XIX · Cruza el Puente de Orlov y asegura la orilla norte', X - 20, -860);
      [[-22, -770], [-18, -792], [-25, -830], [-10, -845], [-32, -858]].forEach(function (p, i) {
        spawnVolskEnemy(19, X, i % 2 ? 'stv' : 'bar', p[0], p[1], 'p19_5');
      });
      if (window.AUDIO_VGAI) window.AUDIO_VGAI.playAircraftFlyby(X - 20, -810);
      sayVeyrn('Feldwebel Richter', '¡El puente de Orlov es el último paso! ¡Toda la escuadra adelante!', 'order_move_in_de');
    }

    try {
      localStorage.setItem('rompeolas_vgai_cp', String(Math.max(ph, +(localStorage.getItem('rompeolas_vgai_cp') || 0))));
    } catch (_) {}
  }

  function loadPhase20(ph, isCheckpoint) {
    var X = typeof X18 !== 'undefined' ? X18 : 200000;
    N20.ph = ph;
    N20.cpPh = ph;
    N20.T = 0;
    clearMarkers(N20);
    if (typeof enemies !== 'undefined') {
      for (var i = enemies.length - 1; i >= 0; i--) {
        if (enemies[i].g && typeof scene !== 'undefined') scene.remove(enemies[i].g);
      }
      enemies.length = 0;
    }

    var row = AT20[ph] || AT20[0];
    var sp = row[2];
    if (isCheckpoint && typeof P !== 'undefined' && P.g) {
      var fy = typeof floor18 === 'function' ? floor18(sp[0], sp[1]) : 0;
      P.g.position.set(X + sp[0], fy, sp[1]);
      for (var a = 0; a < N20.sq.length; a++) {
        if (N20.sq[a] && N20.sq[a].g) N20.sq[a].g.position.set(X + sp[0] + (a - 1.5) * 1.8, fy, sp[1] - 2.5);
      }
    }

    if (ph === 0) {
      if (typeof sky18 === 'function') sky18('dawn');
      N20.obj = [X, 75];
      if (typeof obj9 === 'function') obj9('XX · Rechaza la vanguardia enemiga en el Bosque de Dravik', X, 75);
      [[-18, 65], [0, 78], [20, 70], [-32, 85], [28, 88]].forEach(function (p, i) {
        spawnVolskEnemy(20, X, i === 1 ? 'stv' : 'mosin', p[0], p[1], 'p20_0');
      });
      sayVeyrn('Hauptmann Lindemann', '¡Vanguardia de Volskaya entre los pinos de Dravik! ¡Mantened la línea!', 'enemy_wave_de');
    } else if (ph === 1) {
      if (typeof sky18 === 'function') sky18('morning', 4);
      N20.obj = [X - 35, -172];
      if (typeof obj9 === 'function') obj9('XX · Defiende el paso del Muro de Varn y Cota 214', X - 35, -172);
      [[-45, -148], [-35, -162], [-20, -155], [10, -165], [52, -210]].forEach(function (p, i) {
        spawnVolskEnemy(20, X, i === 1 ? 'bar' : 'stv', p[0], p[1], 'p20_1');
      });
      N20.works.push(makeInteractiveMarker(X, 70, -250, '[E] Calibrar observatorio de Cota 214 (Secundario)', 3.6, function () {
        N20.sec1 = true;
        if (typeof score !== 'undefined') score += 350;
        if (typeof feed === 'function') feed('★ Cota 214 recalibrada · fuego de apoyo reforzado');
        sayVeyrn('Unteroffizier Becker', '¡Observatorio enlazado! Nuestra artillería barre el foso.', 'direct_hit_de');
      }));
      sayVeyrn('Hauptmann Lindemann', '¡No cedáis el paso del foso! Si cruzan las alambradas tomarán la meseta.', 'order_fire_de');
    } else if (ph === 2) {
      if (typeof sky18 === 'function') sky18('morning', 4);
      N20.obj = [X - 40, -405];
      if (typeof obj9 === 'function') obj9('XX · Contraataca la batería de la Meseta de Varn', X - 40, -405);
      [[-62, -395], [-40, -408], [-18, -402], [-58, -365], [-25, -420]].forEach(function (p, i) {
        spawnVolskEnemy(20, X, i % 2 ? 'bar' : 'stv', p[0], p[1], 'p20_2');
      });
      N20.works.push(makeInteractiveMarker(X, -70, -368, '[E] Reagrupar patrulla aislada en la Granja (Secundario)', 4.0, function () {
        N20.sec2 = true;
        if (typeof score !== 'undefined') score += 400;
        if (typeof feed === 'function') feed('★ Patrulla de la Granja rescatada');
        sayVeyrn('Schütze Kroll', '¡Gracias a Dios que llegaron! La granja estaba rodeada.', 'order_regroup_de');
      }));
      sayVeyrn('Unteroffizier Becker', '¡Batería enemiga en la meseta! Usen las trincheras de piedra y avancen.', 'order_right_flank_de');
    } else if (ph === 3) {
      if (typeof sky18 === 'function') sky18('day', 5);
      N20.obj = [X, -650];
      if (typeof obj9 === 'function') obj9('XX · Sostén la Plaza de Falkenbrück frente al asalto', X, -650);
      [[-14, -638], [16, -642], [0, -668], [-30, -652], [32, -658]].forEach(function (p, i) {
        spawnVolskEnemy(20, X, i === 2 ? 'bar' : 'stv', p[0], p[1], 'p20_3');
      });
      if (window.AUDIO_VGAI) window.AUDIO_VGAI.playAircraftFlyby(X + 180, -680);
      sayVeyrn('Hauptmann Lindemann', '¡Combate en la plaza de Falkenbrück! Cubran las esquinas y ventanas.', 'combat_callout_de');
    } else if (ph === 4) {
      if (typeof sky18 === 'function') sky18('day', 5);
      N20.obj = [X - 125, -705];
      if (typeof obj9 === 'function') obj9('XX · Despeja los talleres y la playa de vías', X - 125, -705);
      [[-115, -692], [-138, -708], [-150, -732], [-95, -715], [-128, -745]].forEach(function (p, i) {
        spawnVolskEnemy(20, X, i % 2 ? 'stv' : 'mosin', p[0], p[1], 'p20_4');
      });
      sayVeyrn('Pionier Haas', '¡Estación ferroviaria infestada! Despejen los andenes y las vías.', 'order_move_in_de');
    } else if (ph === 5) {
      if (typeof sky18 === 'function') sky18('day', 5);
      N20.obj = [X, -875];
      if (typeof obj9 === 'function') obj9('XX · Contraataque final: cruza el puente norte de Varnholt', X, -875);
      [[-8, -810], [8, -828], [0, -848], [-18, -865], [16, -870]].forEach(function (p, i) {
        spawnVolskEnemy(20, X, i % 2 ? 'bar' : 'stv', p[0], p[1], 'p20_5');
      });
      sayVeyrn('Hauptmann Lindemann', '¡Último empuje sobre el puente del río! ¡Varnholt vuelve a ser de Veyrn!', 'officer_order_de_3');
    }

    try {
      localStorage.setItem('bastion_vgai_cp', String(Math.max(ph, +(localStorage.getItem('bastion_vgai_cp') || 0))));
    } catch (_) {}
  }

  function startLevel19() {
    var X = typeof X17 !== 'undefined' ? X17 : 160000;
    level = 19;
    if (typeof clearStage === 'function') clearStage();
    if (typeof WC !== 'undefined') { WC.x = X + 20; WC.z = -440; WC.r = 680; }
    if (typeof mobs !== 'undefined') { mobs.forEach(function (m) { scene.remove(m.g); }); mobs.length = 0; }
    if (typeof convoy !== 'undefined') { convoy.forEach(function (v) { scene.remove(v.g); }); convoy.length = 0; }
    if (typeof npcs !== 'undefined') { npcs.forEach(function (n) { scene.remove(n.g); }); npcs.length = 0; }
    if (typeof lightsInit === 'function') lightsInit();

    if (typeof buildKarsk17 === 'function' && (typeof W17 === 'undefined' || !W17.built)) {
      buildKarsk17();
    }
    N19.built = true;
    N19.on = true;
    N19.kills = 0;
    N19.sec1 = false;
    N19.sec2 = false;
    N19.t0 = typeof time !== 'undefined' ? time : 0;

    if (typeof sky17 === 'function') {
      try { sky17(); } catch (_) {}
    }
    if (typeof W17 !== 'undefined' && W17) {
      if (W17.sl && W17.sl.m) W17.sl.m.visible = true;
      if (typeof skyMesh !== 'undefined' && skyMesh) skyMesh.scale.setScalar(2.4);
      W17.skyS = 1;
    }

    clearMissionEntities(N19);
    equipVeyrnArsenal(N19);
    N19.fpv0 = typeof fpv !== 'undefined' ? fpv : true;
    fpv = true;
    playing = true;
    var tc = document.getElementById('tc');
    if (tc) tc.style.display = 'block';
    if (typeof P !== 'undefined' && P.g) P.g.visible = true;
    if (typeof ambStart === 'function') ambStart();
    if (typeof lvl35 === 'function') try { lvl35(); } catch (_) {}

    N19.sq = [
      spawnVeyrnAlly(19, X, 102, 41, 'Feldwebel Richter', 'smg', true),
      spawnVeyrnAlly(19, X, 106, 42, 'Gefreiter Voss', 'r', false),
      spawnVeyrnAlly(19, X, 108, 40, 'Pionier Weber', 'lmg', false)
    ].filter(Boolean);
    N19.all = N19.sq.slice();

    var cp = +(document.getElementById('cp19') ? document.getElementById('cp19').value : 0);
    loadPhase19(cp, true);
    if (window.DOORS_VGAI) window.DOORS_VGAI.ensureDoorsForLevel(19);
  }

  function startLevel20() {
    var X = typeof X18 !== 'undefined' ? X18 : 200000;
    level = 20;
    if (typeof VEH32 !== 'undefined' && typeof VEH32.origin === 'function') {
      try {
        VEH32.origin(X);
        VEH32.floor = function(x, z) { return typeof floor18 === 'function' ? floor18(x - X, z) : 0; };
      } catch (_) {}
    }
    if (typeof clearStage === 'function') clearStage();
    if (typeof WC !== 'undefined') { WC.x = X; WC.z = -400; WC.r = 950; }
    if (typeof mobs !== 'undefined') { mobs.forEach(function (m) { scene.remove(m.g); }); mobs.length = 0; }
    if (typeof convoy !== 'undefined') { convoy.forEach(function (v) { scene.remove(v.g); }); convoy.length = 0; }
    if (typeof npcs !== 'undefined') { npcs.forEach(function (n) { scene.remove(n.g); }); npcs.length = 0; }
    if (typeof lightsInit === 'function') lightsInit();

    if (typeof buildVarn18 === 'function' && (typeof W18 === 'undefined' || !W18.built)) {
      buildVarn18();
    }
    N20.built = true;
    N20.on = true;
    N20.kills = 0;
    N20.sec1 = false;
    N20.sec2 = false;
    N20.t0 = typeof time !== 'undefined' ? time : 0;

    if (typeof sky18 === 'function') sky18('dawn');
    if (typeof W18 !== 'undefined' && W18) W18.skyS = 1;

    clearMissionEntities(N20);
    equipVeyrnArsenal(N20);
    N20.fpv0 = typeof fpv !== 'undefined' ? fpv : true;
    fpv = true;
    playing = true;
    var tc = document.getElementById('tc');
    if (tc) tc.style.display = 'block';
    if (typeof P !== 'undefined' && P.g) P.g.visible = true;
    if (typeof ambStart === 'function') ambStart();
    if (typeof lvl35 === 'function') try { lvl35(); } catch (_) {}

    N20.sq = [
      spawnVeyrnAlly(20, X, -3, 12, 'Hauptmann Lindemann', 'smg', true),
      spawnVeyrnAlly(20, X, 3, 12, 'Unteroffizier Becker', 'r', false),
      spawnVeyrnAlly(20, X, 0, 10, 'Pionier Haas', 'lmg', false)
    ].filter(Boolean);
    N20.all = N20.sq.slice();

    var cp = +(document.getElementById('cp20') ? document.getElementById('cp20').value : 0);
    loadPhase20(cp, true);
    if (window.DOORS_VGAI) window.DOORS_VGAI.ensureDoorsForLevel(20);
  }

  function leaveMission(st) {
    st.on = false;
    clearMarkers(st);
    if (st.w0 && typeof P !== 'undefined' && P && P.weapons) {
      for (var k in st.w0) Object.assign(P.weapons[k], st.w0[k]);
    }
    if (st.fpv0 !== undefined && typeof fpv !== 'undefined') fpv = st.fpv0;
  }

  function updateMissionFollowAndProgress(dt, st, lv) {
    st.T += dt;
    var pp = P.g.position;
    // Seguir al jugador sin invadir vehículos ni morir en vano
    for (var i = 0; i < st.sq.length; i++) {
      var n = st.sq[i];
      if (!n || !n.g || !n.g.visible) continue;
      var ox = (i - 1) * 2.4, oz = (lv === 19 ? 3.5 : -3.5);
      var tx = pp.x + ox, tz = pp.z + oz;
      var dp = Math.hypot(tx - n.g.position.x, tz - n.g.position.z);
      if (dp > 4.5) {
        n.tgt = [tx, tz];
        n.sp = dp > 18 ? 6.2 : 4.2;
        n.act = 'run';
      } else {
        n.tgt = null;
        n.act = 'crouchaim';
      }
      if (lv === 20 && typeof floor18 === 'function') {
        n.g.position.y = floor18(n.g.position.x - (typeof X18 !== 'undefined' ? X18 : 200000), n.g.position.z);
      }
    }

    // Prompt de interacción con objetivos secundarios o cargas
    var nearW = null;
    for (var wi = 0; wi < st.works.length; wi++) {
      var w = st.works[wi];
      if (w.done) continue;
      if (Math.hypot(pp.x - w.x, pp.z - w.z) < w.r) { nearW = w; break; }
    }
    var prEl = document.getElementById('pr');
    if (nearW && prEl && !prEl.textContent) prEl.textContent = nearW.lbl;

    // Avance por eliminación de sector o aproximación al objetivo tras limpiar defensas
    var aliveFoes = 0;
    if (typeof enemies !== 'undefined') {
      for (var ei = 0; ei < enemies.length; ei++) if (enemies[ei] && enemies[ei].hp > 0) aliveFoes++;
    }
    var distObj = st.obj ? Math.hypot(pp.x - st.obj[0], pp.z - st.obj[1]) : 999;
    if ((aliveFoes === 0 && distObj < 38) || (distObj < 9 && aliveFoes <= 1)) {
      if (st.ph < 5) {
        if (lv === 19) loadPhase19(st.ph + 1, false);
        else loadPhase20(st.ph + 1, false);
      } else if (aliveFoes === 0 || distObj < 10) {
        if (typeof end === 'function') end(true);
      }
    }
  }

  function installVeyrnHooks() {
    // Asegurar suelo de Cota 214 para Nivel 20
    if (typeof window.floorAt === 'function' && !window.floorAt._vgai) {
      var _fa = window.floorAt;
      window.floorAt = function (q) {
        var f = _fa(q);
        if (level === 20 && typeof W18 !== 'undefined' && W18.built && typeof floor18 === 'function') {
          var h = floor18(q.x - (typeof X18 !== 'undefined' ? X18 : 200000), q.z);
          if (h > f) return h;
        }
        return f;
      };
      window.floorAt._vgai = true;
    }

    // Envolver update para clima y progreso de niveles 19 y 20
    if (typeof window.update === 'function' && !window.update._vgaiMissions) {
      var _upd = window.update;
      window.update = function (dt) {
        if (level !== 19 && N19.on) leaveMission(N19);
        if (level !== 20 && N20.on) leaveMission(N20);
        _upd(dt);
        if (typeof playing === 'undefined' || !playing) return;
        if (level === 19 && N19.on) {
          if (typeof W17 !== 'undefined' && W17.built) {
            if (W17.sl && W17.sl.m) W17.sl.m.visible = true;
            if (typeof skyMesh !== 'undefined' && skyMesh) skyMesh.scale.setScalar(2.4);
            if (typeof weather17 === 'function') try { weather17(dt); } catch (_) {}
          }
          if (typeof L9 !== 'undefined' && L9) L9.obj = N19.obj;
          updateMissionFollowAndProgress(dt, N19, 19);
        } else if (level === 20 && N20.on) {
          if (typeof W18 !== 'undefined' && W18.built) {
            W18.skyS = 1;
            if (typeof skyMesh !== 'undefined' && skyMesh) skyMesh.scale.setScalar(2.4);
            if (typeof cam !== 'undefined' && cam && W18.cull) {
              var lim = (W18.fogF || 280) * 1.05;
              for (var ci = 0; ci < W18.cull.length; ci++) {
                var cq = W18.cull[ci];
                cq.m.visible = Math.hypot(cq.c.x - cam.position.x, cq.c.z - cam.position.z) - cq.r < lim;
              }
            }
            if (typeof scene !== 'undefined' && scene.fog) {
              scene.fog.near = W18.fogN || 12;
              scene.fog.far = W18.fogF || 260;
              scene.fog.color.setHex(W18.fogC || 0x2c3650);
            }
            if (typeof weather18 === 'function') try { weather18(dt); } catch (_) {}
          }
          if (typeof L9 !== 'undefined' && L9) L9.obj = N20.obj;
          updateMissionFollowAndProgress(dt, N20, 20);
        }
      };
      window.update._vgaiMissions = true;
    }

    // Hook interact para marcadores secundarios y de demolición
    if (typeof window.interact === 'function' && !window.interact._vgaiMissions) {
      var _in = window.interact;
      window.interact = function () {
        if ((level === 19 || level === 20) && typeof playing !== 'undefined' && playing && typeof P !== 'undefined' && P.g) {
          var st = level === 19 ? N19 : N20;
          for (var i = 0; i < st.works.length; i++) {
            var w = st.works[i];
            if (!w.done && Math.hypot(P.g.position.x - w.x, P.g.position.z - w.z) < w.r) {
              w.done = true;
              if (w.mesh && typeof scene !== 'undefined') w.mesh.visible = false;
              if (typeof w.onDone === 'function') w.onDone();
              return;
            }
          }
        }
        return _in.apply(this, arguments);
      };
      window.interact._vgaiMissions = true;
    }

    // Hook kill para conteo de bajas en 19 y 20
    if (typeof window.kill === 'function' && !window.kill._vgaiMissions) {
      var _kl = window.kill;
      window.kill = function (e) {
        if (level === 19) N19.kills++;
        else if (level === 20) N20.kills++;
        return _kl.apply(this, arguments);
      };
      window.kill._vgaiMissions = true;
    }

    // Hook respawnP para devolver al checkpoint activo de 19 o 20
    if (typeof window.respawnP === 'function' && !window.respawnP._vgaiMissions) {
      var _rp = window.respawnP;
      window.respawnP = function () {
        _rp.apply(this, arguments);
        if (level === 19) loadPhase19(N19.cpPh || 0, true);
        else if (level === 20) loadPhase20(N20.cpPh || 0, true);
      };
      window.respawnP._vgaiMissions = true;
    }

    // Hook surf35 para pasos en nieve / madera / piedra en 19 y 20
    if (typeof window.surf35 === 'function' && !window.surf35._vgaiMissions) {
      var _sf = window.surf35;
      window.surf35 = function () {
        if (level === 19 && typeof P !== 'undefined' && P.g) {
          return P.g.position.y > 0.6 ? 'wood' : (P.g.position.z < -560 ? 'stone' : 'dirt');
        }
        if (level === 20 && typeof P !== 'undefined' && P.g) {
          var X = typeof X18 !== 'undefined' ? X18 : 200000;
          var x = P.g.position.x - X, z = P.g.position.z;
          return (z < -541 && z > -819 && Math.abs(x) < 172) ? 'stone' : 'snow';
        }
        return _sf.apply(this, arguments);
      };
      window.surf35._vgaiMissions = true;
    }

    // Hook end para pantallas de victoria de la Campaña de Veyrn
    if (typeof window.end === 'function' && !window.end._vgaiMissions) {
      var _en = window.end;
      window.end = function (w) {
        if ((level === 19 || level === 20) && w) {
          var lv = level;
          var st = lv === 19 ? N19 : N20;
          _en(true);
          playing = false;
          var menuH1 = document.querySelector('#menu h1');
          var tx = document.getElementById('tx');
          var mins = Math.max(1, Math.round(((typeof time !== 'undefined' ? time : 60) - (st.t0 || 0)) / 60));
          if (lv === 19) {
            if (menuH1) menuH1.textContent = 'OPERACIÓN ROMPEOLAS COMPLETADA';
            if (tx) {
              tx.innerHTML = '<b style="font-size:19px;color:#e0b050">VICTORIA DE VEYRN · EL CORREDOR DE KARSK HA CAÍDO</b><br><br>' +
                '• Bajas causadas a Volskaya: <b>' + st.kills + '</b><br>' +
                '• Radio costera saboteada: <b>' + (st.sec1 ? 'Sí (+350)' : 'Omitida') + '</b><br>' +
                '• Planos de Drovna capturados: <b>' + (st.sec2 ? 'Sí (+400)' : 'Omitidos') + '</b><br>' +
                '• Tiempo de operación: <b>' + mins + ' min</b><br><br>' +
                '<i>«Las playas de Karsk arden detrás de nosotros. Adelante hacia Varnholt.»</i><br><br>' +
                '<b style="font-size:20px;color:#e0b050">PUNTUACIÓN: ' + (typeof score !== 'undefined' ? score : 0) + '</b>';
            }
            try { localStorage.setItem('rompeolas_vgai', '1'); } catch (_) {}
          } else {
            if (menuH1) menuH1.textContent = 'BASTIÓN DE HIERRO COMPLETADO';
            if (tx) {
              tx.innerHTML = '<b style="font-size:19px;color:#e0b050">VICTORIA DE VEYRN · VARNHOLT RESISTE Y CONTRAATACA</b><br><br>' +
                '• Bajas causadas a Volskaya: <b>' + st.kills + '</b><br>' +
                '• Observatorio Cota 214: <b>' + (st.sec1 ? 'Calibrado (+350)' : 'Omitido') + '</b><br>' +
                '• Patrulla de la Granja: <b>' + (st.sec2 ? 'Rescatada (+400)' : 'Sin contacto') + '</b><br>' +
                '• Tiempo de defensa: <b>' + mins + ' min</b><br><br>' +
                '<i>«El viento helado de Varnholt guarda las líneas de hierro de Veyrn.»</i><br><br>' +
                '<b style="font-size:20px;color:#e0b050">PUNTUACIÓN: ' + (typeof score !== 'undefined' ? score : 0) + '</b>';
            }
            try { localStorage.setItem('bastion_vgai', '1'); } catch (_) {}
          }
          if (window.AUDIO_VGAI) window.AUDIO_VGAI.playEvent('kokoro_civil_01', { vol: 0.9 });
          if (window.codShow) window.codShow('cpM');
          return;
        }
        return _en.apply(this, arguments);
      };
      window.end._vgaiMissions = true;
    }

    // Hook menú (#lvsel + #cp19 + #cp20 + #cod + #go.onclick)
    var lvs = document.getElementById('lvsel');
    if (lvs && !document.getElementById('opt_vgai_19')) {
      var d19 = false, d20 = false;
      try { d19 = localStorage.getItem('rompeolas_vgai') === '1'; d20 = localStorage.getItem('bastion_vgai') === '1'; } catch (_) {}
      lvs.insertAdjacentHTML('beforeend',
        '<option id="opt_vgai_19" value="19">XIX · OPERACIÓN ROMPEOLAS (Veyrn · Golfo de Hierro) ' + (d19 ? '✔ completada' : '(V.GAI)') + '</option>' +
        '<option id="opt_vgai_20" value="20">XX · BASTIÓN DE HIERRO (Veyrn · Martillo de Nieve) ' + (d20 ? '✔ completada' : '(V.GAI)') + '</option>'
      );
      var selStyle = 'background:#302417;color:#f3e6c4;padding:10px;border:1px solid #a77b35';
      lvs.parentElement.insertAdjacentHTML('afterend',
        '<label id="cp19l" style="display:none">PUNTO DE CONTROL XIX <select id="cp19" style="' + selStyle + '">' +
        AT19.map(function (a, i) { return '<option value="' + i + '">' + a[0] + ' · ' + a[1] + (i ? '' : ' (misión completa)') + '</option>'; }).join('') +
        '</select></label>' +
        '<label id="cp20l" style="display:none">PUNTO DE CONTROL XX <select id="cp20" style="' + selStyle + '">' +
        AT20.map(function (a, i) { return '<option value="' + i + '">' + a[0] + ' · ' + a[1] + (i ? '' : ' (misión completa)') + '</option>'; }).join('') +
        '</select></label>'
      );
      var cm = document.getElementById('cmCP');
      if (cm) {
        cm.appendChild(document.getElementById('cp19l'));
        cm.appendChild(document.getElementById('cp20l'));
      }
      var syncCp = function () {
        var v = lvs.value;
        var l19 = document.getElementById('cp19l'), l20 = document.getElementById('cp20l');
        if (l19) l19.style.display = v === '19' ? '' : 'none';
        if (l20) l20.style.display = v === '20' ? '' : 'none';
      };
      lvs.addEventListener('change', syncCp);
      syncCp();

      // Integración en Códice (#cod -> cpL)
      if (typeof window.codShow === 'function' && !window.codShow._vgai) {
        var _cs = window.codShow;
        window.codShow = function (p) {
          var r = _cs.apply(this, arguments);
          if (p === 'cpL') {
            var list = document.getElementById('cmList');
            if (list && !list.querySelector('[data-vgai-lv="19"]')) {
              list.insertAdjacentHTML('beforeend',
                '<div class="grp">CAMPAÑA DE VEYRN · AETHRION 1922–1923 (V.GAI.1.0)</div>' +
                '<div class="it" data-vgai-lv="19"><b>XIX</b><span>Operación Rompeolas (Golfo)</span></div>' +
                '<div class="it" data-vgai-lv="20"><b>XX</b><span>Bastión de Hierro (Varnholt)</span></div>'
              );
              var selectVeyrn = function (lvStr) {
                lvs.value = lvStr;
                lvs.dispatchEvent(new Event('change'));
                list.querySelectorAll('.it').forEach(function (el) {
                  el.classList.toggle('on', el.getAttribute('data-vgai-lv') === lvStr);
                });
                var bx = document.getElementById('cmB');
                if (bx) {
                  var is19 = lvStr === '19';
                  var bt = bx.querySelector('.bt'), bl = bx.querySelector('.bl'), txEl = bx.querySelector('.bx');
                  if (bt) bt.textContent = is19 ? 'XIX · OPERACIÓN ROMPEOLAS' : 'XX · BASTIÓN DE HIERRO';
                  if (bl) bl.textContent = is19 ? 'Frente de Karsk · Facción Veyrn (1922)' : 'Distrito de Varnholt · Facción Veyrn (1923)';
                  if (txEl) txEl.textContent = is19
                    ? 'Asalto anfibio del 4.º Sturmregiment de Veyrn sobre las defensas costeras de Volskaya en Karsk: desembarco del faro, barranco Sokol, ruptura de las Tres Cruces, depósito de Terek, sabotaje en Drovna y captura del Puente de Orlov.'
                    : 'Defensa invernal y contraataque estratégico de Veyrn en Varnholt: emboscada inicial en el bosque de Dravik, resistencia en el Muro de Varn y Cota 214, rescate en la meseta, combate urbano en Falkenbrück y ruptura hacia la orilla norte.';
                }
              };
              list.querySelectorAll('[data-vgai-lv]').forEach(function (el) {
                el.onclick = function () { selectVeyrn(el.getAttribute('data-vgai-lv')); };
              });
            }
          }
          return r;
        };
        window.codShow._vgai = true;
      }

      // Restaurar selección tras reload limpio
      try {
        var s19 = sessionStorage.getItem('sel19');
        var s20 = sessionStorage.getItem('sel20');
        if (s19 !== null) {
          sessionStorage.removeItem('sel19');
          lvs.value = '19';
          var c19 = document.getElementById('cp19');
          if (c19) c19.value = s19;
          lvs.dispatchEvent(new Event('change'));
        } else if (s20 !== null) {
          sessionStorage.removeItem('sel20');
          lvs.value = '20';
          var c20 = document.getElementById('cp20');
          if (c20) c20.value = s20;
          lvs.dispatchEvent(new Event('change'));
        }
      } catch (_) {}

      // Botón #go.onclick para Niveles 19 y 20
      var goBtn = document.getElementById('go');
      if (goBtn && !goBtn._vgaiMissions) {
        var _go = goBtn.onclick;
        goBtn.onclick = function () {
          var v = lvs.value;
          if (v !== '19' && v !== '20') return _go ? _go.apply(this, arguments) : undefined;
          var otherBuilt = (typeof N16 !== 'undefined' && N16.built) ||
            (typeof L12 !== 'undefined' && L12.built) ||
            (v === '19' && ((typeof N18 !== 'undefined' && N18.built) || N20.built)) ||
            (v === '20' && ((typeof N17 !== 'undefined' && N17.built) || N19.built));
          if (otherBuilt) {
            try {
              sessionStorage.setItem(v === '19' ? 'sel19' : 'sel20', document.getElementById(v === '19' ? 'cp19' : 'cp20').value || '0');
            } catch (_) {}
            location.reload();
            return;
          }
          try {
            if (typeof V20 !== 'undefined' && document.getElementById('ps2fog')) V20.ps2 = document.getElementById('ps2fog').value;
            if (document.getElementById('difficulty')) difficulty = document.getElementById('difficulty').value;
            ac = new (window.AudioContext || window.webkitAudioContext)();
            if (ac.state === 'suspended') ac.resume();
            if (typeof startMusic === 'function') startMusic();
          } catch (_) {}
          var mEl = document.getElementById('menu');
          if (mEl) mEl.style.display = 'none';
          if (typeof P !== 'undefined' && P.g) P.g.visible = true;
          if (typeof cam !== 'undefined' && cam) { cam.fov = 65; cam.updateProjectionMatrix(); }
          if (v === '19') startLevel19(); else startLevel20();
          try { if (typeof rend !== 'undefined' && rend.domElement) rend.domElement.requestPointerLock(); } catch (_) {}
        };
        goBtn._vgaiMissions = true;
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installVeyrnHooks);
  } else {
    installVeyrnHooks();
  }

  var api = {
    version: 'V.GAI.1.0',
    N19: N19,
    N20: N20,
    AT19: AT19,
    AT20: AT20,
    startLevel19: startLevel19,
    startLevel20: startLevel20,
    leave19: function () { leaveMission(N19); },
    leave20: function () { leaveMission(N20); }
  };

  window.startLevel19 = startLevel19;
  window.startLevel20 = startLevel20;
  window.VEYRN_MISSIONS_VGAI = api;
  window.AETH.vgai.missions = api;
})();
