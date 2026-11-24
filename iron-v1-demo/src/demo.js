/* =========================================================================
   src/demo.js — IRON V1 DEMO · Borgñon (Aethrion, 1922)
   Escena Three.js r128 + cerebro autónomo. La IA no depende del render.
   ========================================================================= */
(function (g) {
  'use strict';
  const AETH = g.AETH;
  const U = AETH.util;

  if (!g.THREE) {
    document.body.innerHTML = '<p style="padding:40px;font-family:serif;color:#e0c080">No se pudo cargar Three.js (vendor/three.r128.min.js).</p>';
    return;
  }

  const world = AETH.world.createBorgnonWorld({ timeScale: 300 });
  g.AETH_WORLD = world;

  const FACTIONS = {
    alianza_eisenmark: 0x46688f,
    coalicion_praga: 0x9a5038,
    vardenia: 0x4a7a52,
    caerwyn: 0x557080,
    durn: 0x7a6a56,
    ghar_mor: 0x7a6248,
    sareth: 0x606a78,
    avar: 0x8a7a4a,
    nerath: 0x4a7a7a,
    varkh: 0x5a6a86
  };
  const TYPE_COLORS = {
    casa: 0x8a7a62,
    taller: 0x6a6156,
    estacion: 0x7d7263,
    mercado: 0x8f7f5a,
    templo: 0x9a8f74,
    posada: 0x7a6448,
    hospital: 0x8a8a7a,
    cuartel: 0x6a6a60,
    escuela: 0x8a7f6a,
    fuente: 0x707a7a
  };
  const TYPE_SIZE = {
    casa: [6, 4.5, 6],
    taller: [12, 6, 9],
    estacion: [16, 6, 10],
    mercado: [13, 4, 11],
    templo: [10, 9, 10],
    posada: [9, 5.5, 8],
    hospital: [10, 5, 8],
    cuartel: [16, 5, 13],
    escuela: [8, 4.5, 8]
  };

  /* --------------------------- escena --------------------------- */
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.setSize(innerWidth, innerHeight);
  if (THREE.sRGBEncoding !== undefined) renderer.outputEncoding = THREE.sRGBEncoding;
  document.body.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x8fa6bb);
  const camera = new THREE.PerspectiveCamera(52, innerWidth / innerHeight, 0.3, 800);

  const hemi = new THREE.HemisphereLight(0xc7d8ea, 0x3b3a2a, 0.75);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffe0b0, 1.1);
  sun.position.set(60, 90, 40);
  scene.add(sun);
  const moonLight = new THREE.DirectionalLight(0x8fa6d0, 0);
  moonLight.position.set(-50, 70, -30);
  scene.add(moonLight);

  scene.fog = new THREE.Fog(0x8fa6bb, 90, 260);

  const orbit = { theta: -0.7, phi: 1.05, dist: 78, target: new THREE.Vector3(4, 0, 6) };
  function updateCamera() {
    const p = orbit;
    camera.position.set(p.target.x + p.dist * Math.sin(p.phi) * Math.sin(p.theta), p.target.y + p.dist * Math.cos(p.phi), p.target.z + p.dist * Math.sin(p.phi) * Math.cos(p.theta));
    camera.lookAt(p.target);
    world.setFocus ? world.setFocus(p.target.x, p.target.z) : (world.focus = { x: p.target.x, z: p.target.z });
  }
  updateCamera();

  /* --------------------------- mundo estático --------------------------- */
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), new THREE.MeshLambertMaterial({ color: 0x596843 }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = false;
  scene.add(ground);

  const roadMat = new THREE.MeshLambertMaterial({ color: 0x7c7059 });
  function road(x1, z1, x2, z2, w) {
    const dx = x2 - x1,
      dz = z2 - z1;
    const len = Math.hypot(dx, dz);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w || 4, len), roadMat);
    m.rotation.x = -Math.PI / 2;
    m.rotation.z = Math.atan2(dx, dz);
    m.position.set((x1 + x2) / 2, 0.02, (z1 + z2) / 2);
    scene.add(m);
  }
  for (const loc of world.locations) {
    if (loc.id === 'plaza' || loc.id === 'fuente') continue;
    road(0, 0, loc.x, loc.z, 3.4);
  }

  const buildings = [];
  for (const loc of world.locations) {
    const size = TYPE_SIZE[loc.type];
    if (!size) continue;
    const mat = new THREE.MeshLambertMaterial({ color: TYPE_COLORS[loc.type] || 0x7a7264 });
    const b = new THREE.Mesh(new THREE.BoxGeometry(size[0], size[1], size[2]), mat);
    b.position.set(loc.x, size[1] / 2, loc.z);
    scene.add(b);
    buildings.push(b);
    // tejado
    const roof = new THREE.Mesh(new THREE.ConeGeometry(size[0] * 0.72, 2.4, 4), new THREE.MeshLambertMaterial({ color: loc.type === 'templo' ? 0xa08a5a : 0x4d4034 }));
    roof.position.set(loc.x, size[1] + 1.2, loc.z);
    roof.rotation.y = Math.PI / 4;
    scene.add(roof);
    // puerta
    const door = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 2.6), new THREE.MeshLambertMaterial({ color: 0x2e2620 }));
    door.position.set(loc.x, 1.3, loc.z + size[2] / 2 + 0.02);
    scene.add(door);
    if (loc.type === 'templo') {
      const tower = new THREE.Mesh(new THREE.BoxGeometry(2.4, 6, 2.4), mat);
      tower.position.set(loc.x + size[0] * 0.35, size[1] + 2, loc.z - size[2] * 0.2);
      scene.add(tower);
    }
  }

  // vías del tren
  const railMat = new THREE.MeshLambertMaterial({ color: 0x3b3a36 });
  const sleeperMat = new THREE.MeshLambertMaterial({ color: 0x4a3a2c });
  for (let i = -1; i <= 1; i += 2) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(90, 0.12, 0.16), railMat);
    rail.position.set(30, 0.1, -6 + i * 0.75);
    scene.add(rail);
  }
  for (let i = 0; i < 34; i++) {
    const sleeper = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.1, 2.4), sleeperMat);
    sleeper.position.set(-14 + i * 2.7, 0.06, -6);
    scene.add(sleeper);
  }

  // árboles
  const trunkMat = new THREE.MeshLambertMaterial({ color: 0x4a3a28 });
  const leafMat = new THREE.MeshLambertMaterial({ color: 0x3d5a34 });
  const forest = world.locations.find((l) => l.type === 'bosque');
  const field = world.locations.find((l) => l.type === 'campo');
  const treeSpots = [];
  for (let i = 0; i < 46; i++) {
    const nearForest = forest && i < 30;
    const base = nearForest ? forest : field || { x: 0, z: 50, radius: 18 };
    treeSpots.push([base.x + (Math.random() - 0.5) * base.radius * 2.4, base.z + (Math.random() - 0.5) * base.radius * 2.4, 1 + Math.random() * 1.4]);
  }
  for (const [x, z, s] of treeSpots) {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18 * s, 0.24 * s, 1.6 * s, 5), trunkMat);
    trunk.position.set(x, 0.8 * s, z);
    scene.add(trunk);
    const crown = new THREE.Mesh(new THREE.ConeGeometry(1.1 * s, 2.8 * s, 6), leafMat);
    crown.position.set(x, 2.3 * s, z);
    scene.add(crown);
  }

  // fuente
  const fountain = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.8, 0.8, 12), new THREE.MeshLambertMaterial({ color: 0x7f8478 }));
  fountain.position.set(3, 0.4, 4);
  scene.add(fountain);

  // estrellas
  const starGeo = new THREE.BufferGeometry();
  const starPos = [];
  for (let i = 0; i < 900; i++) {
    const a = Math.random() * Math.PI * 2;
    const e = Math.random() * Math.PI * 0.45 + 0.05;
    const r = 320;
    starPos.push(Math.cos(a) * Math.cos(e) * r, Math.sin(e) * r, Math.sin(a) * Math.cos(e) * r);
  }
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
  const starMat = new THREE.PointsMaterial({ color: 0xe4d4b0, size: 1.5, transparent: true, opacity: 0 });
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  /* --------------------------- avatares --------------------------- */
  const avatars = new Map();
  const clickable = [];

  function makeLabel(text) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 512, 128);
    ctx.font = 'italic 34px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillText(text, 258, 62);
    ctx.fillStyle = '#f0e3c2';
    ctx.fillText(text, 256, 60);
    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(3.6, 0.9, 1);
    return sprite;
  }

  function buildAvatar(brain) {
    const g3 = new THREE.Group();
    const color = FACTIONS[brain.identity.faction] || 0x777777;
    const bodyMat = new THREE.MeshLambertMaterial({ color: color });
    const skinHue = 0.07 + (brain.phenotype.skinTone || 0.4) * 0.05;
    const skinMat = new THREE.MeshLambertMaterial({ color: new THREE.Color().setHSL(skinHue, 0.42, 0.28 + (brain.phenotype.skinTone || 0.4) * 0.28) });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.36, 1.12, 7), bodyMat);
    body.position.y = 0.72;
    g3.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), skinMat);
    head.position.y = 1.48;
    g3.add(head);
    const isMilitary = !!brain.identity.militaryRole;
    if (isMilitary) {
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.26, 0.13, 8), new THREE.MeshLambertMaterial({ color: 0x2f3a30 }));
      cap.position.y = 1.66;
      g3.add(cap);
      const rifle = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 1.25), new THREE.MeshLambertMaterial({ color: 0x2a211a }));
      rifle.position.set(0.3, 0.95, 0.3);
      rifle.rotation.set(0.2, 0.3, 0.2);
      g3.add(rifle);
    } else {
      const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.08, 8), new THREE.MeshLambertMaterial({ color: 0x3a332a }));
      hat.position.y = 1.64;
      g3.add(hat);
    }
    const label = makeLabel(brain.identity.name);
    label.position.y = 2.15;
    g3.add(label);

    const ring = new THREE.Mesh(new THREE.RingGeometry(0.62, 0.78, 24), new THREE.MeshBasicMaterial({ color: 0xd9ae57, side: THREE.DoubleSide, transparent: true, opacity: 0.95 }));
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.04;
    ring.visible = false;
    g3.add(ring);

    g3.position.set(brain.position.x, 0, brain.position.z);
    g3.rotation.y = brain.position.facing || 0;
    g3.userData.npcId = brain.id;
    body.userData.npcId = brain.id;
    head.userData.npcId = brain.id;
    scene.add(g3);
    clickable.push(body, head);
    return { group: g3, body: body, head: head, ring: ring, label: label, mats: [bodyMat, skinMat], brain: brain, phase: Math.random() * 6.28 };
  }

  function addAvatar(brain) {
    const a = buildAvatar(brain);
    avatars.set(brain.id, a);
    return a;
  }

  function removeAvatar(id) {
    const a = avatars.get(id);
    if (!a) return;
    scene.remove(a.group);
    avatars.delete(id);
  }

  function clearPopulation() {
    for (const id of Array.from(avatars.keys())) removeAvatar(id);
    clickable.length = 0;
    for (const b of world.brains.slice()) world.remove(b.id);
  }

  /* --------------------------- población inicial --------------------------- */
  function repopulate() {
    clearPopulation();
    const preset = AETH.NPCFactory.presets;
    const cast = [preset.konrad(), preset.doctora(), preset.oficial(), preset.soldado(), preset.comerciante(), preset.nino()];
    const presetPlaces = ['taller', 'hospital', 'cuartel', 'cuartel', 'mercado', 'plaza'];
    cast.forEach((c, i) => {
      c.spawnLocation = presetPlaces[i] || 'plaza';
    });
    const workplaces = { mecanico_ferroviario: 'taller', ferroviario: 'estacion', medico: 'hospital', oficial: 'cuartel', soldado: 'cuartel', comerciante: 'mercado', tabernero: 'posada', sacerdote: 'templo', profesor: 'escuela', campesino: 'campo', cazador: 'bosque', marinero: 'estacion', piloto: 'estacion', minero: 'campo', artesano: 'taller', nino: 'escuela' };
    const rng = world.rng;
    const profs = Object.keys(AETH.culture.professions);
    const eths = Object.keys(AETH.culture.ethnicities);
    const traitPool = ['desconfiado', 'perseverante', 'reservado', 'curioso', 'prudente', 'impulsivo', 'leal', 'ambicioso', 'religioso', 'sociable', 'melancolico', 'terco', 'paciente', 'generoso'];
    for (let i = 0; i < 22; i++) {
      const prof = rng.pick(profs);
      const spec = {
        profession: prof,
        ethnicity: rng.pick(eths),
        age: prof === 'nino' ? rng.int(6, 13) : rng.int(19, 71),
        sex: rng.chance(0.5) ? 'female' : 'male',
        personality: [rng.pick(traitPool), rng.pick(traitPool)],
        conditions: {},
        spawnLocation: workplaces[prof] || 'plaza'
      };
      if (rng.chance(0.18)) spec.conditions.kneeInjury = true;
      if (rng.chance(0.12)) spec.conditions.hearingLoss = true;
      if (rng.chance(0.15)) spec.poverty = true;
      if (rng.chance(0.15)) spec.conditions.unemployed = true;
      if (prof === 'oficial') spec.militaryRole = 'teniente';
      if (prof === 'soldado') spec.militaryRole = rng.pick(['fusilero', 'ametrallador', 'granadero']);
      cast.push(spec);
    }
    for (const spec of cast) {
      const b = world.spawn(spec);
      addAvatar(b);
    }
    const first = world.brains.find((b) => b.identity.profession === 'mecanico_ferroviario') || world.brains[0];
    if (first && inspector) inspector.select(first.id);
    updateHud(true);
  }

  /* --------------------------- HUD e inspector --------------------------- */
  const $ = (id) => document.getElementById(id);
  const hud = {
    clock: $('clock'),
    weather: $('weatherline'),
    pop: $('stat-pop'),
    lod: $('stat-lod'),
    alert: $('stat-alert'),
    fps: $('stat-fps'),
    feed: $('feed'),
    selName: $('sel-name'),
    selDoing: $('sel-doing'),
    selWhy: $('sel-why'),
    selBar: $('selectedbar'),
    toast: $('eventtoast')
  };
  const inspector = AETH.inspector.create(world, $('inspector-host'), {});

  let selectedId = null;
  let fpsAvg = 60;
  let feedSeen = 0;
  function toast(text) {
    hud.toast.textContent = text;
    hud.toast.classList.add('on');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => hud.toast.classList.remove('on'), 2600);
  }

  function selectNpc(id) {
    selectedId = id;
    for (const [aid, a] of avatars) a.ring.visible = aid === id;
    const b = world.byId[id];
    if (b) {
      inspector.select(id);
      hud.selBar.classList.add('on');
      updateSelected(b);
    } else {
      hud.selBar.classList.remove('on');
    }
  }
  world.onSelect = selectNpc;

  function updateSelected(b) {
    hud.selName.textContent = b.identity.name + ' · ' + b.identity.professionLabel;
    hud.selDoing.textContent = (b.activity || b.intent.action) + (b.currentState ? '' : '') + (b.intent.goal ? ' · objetivo: ' + b.intent.goal : '');
    hud.selWhy.textContent = 'Por qué: ' + b.intent.reason;
  }

  let hudTimer = 0;
  function updateHud(force) {
    const now = performance.now();
    if (!force && now - hudTimer < 300) return;
    hudTimer = now;
    const d = world.describe();
    hud.clock.textContent = d.fecha + ' · ' + d.estacion;
    hud.weather.textContent = 'T ' + Math.round(d.temperatura) + '°C · lluvia ' + Math.round(d.clima.rain * 100) + '% · niebla ' + Math.round(d.clima.fog * 100) + '%';
    hud.pop.textContent = 'Población ' + d.poblacion;
    hud.lod.textContent = 'LOD ' + d.lod[1] + '/' + d.lod[2] + '/' + d.lod[3];
    hud.alert.textContent = 'Alerta ' + Math.round(d.alerta * 100) + '%';
    hud.fps.textContent = Math.round(fpsAvg) + ' fps · ' + world.lastLodMs + ' ms IA';
    const sel = world.byId[selectedId];
    if (sel) updateSelected(sel);
    // feed de diálogos
    const fresh = world.dialogueFeed.slice(feedSeen);
    if (fresh.length) {
      feedSeen = world.dialogueFeed.length;
      for (const f of fresh.slice(-4)) {
        const el = document.createElement('div');
        el.innerHTML = '<b>' + f.a.split(' ')[0] + '</b> → ' + f.b.split(' ')[0] + ': «' + f.text + '»';
        hud.feed.appendChild(el);
        setTimeout(() => el.remove(), 9000);
      }
    }
    if (hud.feed.children.length > 6) hud.feed.removeChild(hud.feed.firstChild);
  }

  /* --------------------------- cielo / clima --------------------------- */
  let lastSky = 0;
  function updateSky(t) {
    const env = world.environmentAt({ x: orbit.target.x, z: orbit.target.z });
    const light = env.light;
    const dayColor = new THREE.Color(0x9fb4c4);
    const duskColor = new THREE.Color(0x8a5a3a);
    const nightColor = new THREE.Color(0x0a1018);
    const col = new THREE.Color();
    if (env.sun > 0.35) col.copy(dayColor);
    else if (env.sun > 0.06) col.copy(duskColor).lerp(dayColor, env.sun / 0.35);
    else col.copy(nightColor).lerp(duskColor, Math.min(1, env.sun / 0.06));
    if (env.weather.rain > 0.2) col.lerp(new THREE.Color(0x4f5b60), env.weather.rain * 0.6);
    scene.background.copy(col);
    scene.fog.color.copy(col);
    scene.fog.near = 60 - env.weather.fog * 35;
    scene.fog.far = 260 - env.weather.fog * 140;
    sun.intensity = 0.15 + env.sun * 1.25;
    hemi.intensity = 0.2 + light * 0.7;
    sun.color.setHSL(0.09, 0.5, 0.65 + env.sun * 0.2);
    moonLight.intensity = env.moon * 2.2;
    starMat.opacity = U.clamp(1 - light * 4, 0, 0.85);
    const h = env.hour;
    const az = (h / AETH.astronomy.DAY_HOURS) * Math.PI * 2 - Math.PI / 2;
    sun.position.set(Math.cos(az) * 100, Math.max(4, Math.sin((h / AETH.astronomy.DAY_HOURS) * Math.PI) * 110), Math.sin(az) * 100);
  }

  /* --------------------------- interacción --------------------------- */
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let dragging = false,
    dragMoved = false,
    lastX = 0,
    lastY = 0;

  renderer.domElement.addEventListener('pointerdown', (e) => {
    dragging = true;
    dragMoved = false;
    lastX = e.clientX;
    lastY = e.clientY;
  });
  addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX,
      dy = e.clientY - lastY;
    if (Math.abs(dx) + Math.abs(dy) > 3) dragMoved = true;
    lastX = e.clientX;
    lastY = e.clientY;
    orbit.theta -= dx * 0.005;
    orbit.phi = U.clamp(orbit.phi - dy * 0.004, 0.22, 1.48);
    updateCamera();
  });
  addEventListener('pointerup', (e) => {
    dragging = false;
    if (dragMoved) return;
    if (e.target !== renderer.domElement) return;
    pointer.x = (e.clientX / innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(clickable, false);
    if (hits.length) {
      const id = hits[0].object.userData.npcId;
      selectNpc(id);
    }
  });
  addEventListener('wheel', (e) => {
    orbit.dist = U.clamp(orbit.dist + e.deltaY * 0.05, 14, 210);
    updateCamera();
  }, { passive: true });
  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });

  /* --------------------------- controles --------------------------- */
  const speeds = Array.from(document.querySelectorAll('#timebtns button'));
  function setSpeed(v) {
    world.timeScale = v;
    world.speedLabel = v === 0 ? 'pausa' : 'x' + v;
    speeds.forEach((b) => b.classList.toggle('on', parseInt(b.dataset.speed, 10) === v));
  }
  speeds.forEach((b) => b.addEventListener('click', () => setSpeed(parseInt(b.dataset.speed, 10))));
  setSpeed(300);
  $('btn-gen').addEventListener('click', () => {
    const before = world.brains.length;
    const traitPool = ['desconfiado', 'perseverante', 'curioso', 'prudente', 'impulsivo', 'leal', 'ambicioso', 'religioso', 'sociable', 'astuto'];
    const b = world.spawn({
      profession: world.rng.pick(Object.keys(AETH.culture.professions)),
      ethnicity: world.rng.pick(Object.keys(AETH.culture.ethnicities)),
      age: world.rng.int(8, 74),
      personality: [world.rng.pick(traitPool), world.rng.pick(traitPool)],
      conditions: world.rng.chance(0.2) ? { kneeInjury: true } : {}
    });
    addAvatar(b);
    selectNpc(b.id);
    toast('Nuevo habitante: ' + b.identity.name);
    if (world.brains.length === before) toast('No se pudo crear el habitante');
  });
  $('btn-cast').addEventListener('click', () => {
    repopulate();
    toast('Borgñon repoblado');
  });
  $('btn-inspector').addEventListener('click', (e) => {
    inspector.toggle();
    e.currentTarget.classList.toggle('on', inspector.visible);
  });

  /* --------------------------- bucle --------------------------- */
  let last = performance.now();
  let elapsed = 0;
  function animate(now) {
    requestAnimationFrame(animate);
    const dt = Math.min(0.12, (now - last) / 1000);
    last = now;
    elapsed += dt;
    fpsAvg = fpsAvg * 0.94 + (1 / Math.max(0.001, dt)) * 0.06;

    if (world.timeScale > 0) world.update(dt, { x: orbit.target.x, z: orbit.target.z });
    updateSky(now);

    for (const [id, a] of avatars) {
      const b = world.byId[id];
      if (!b) {
        removeAvatar(id);
        continue;
      }
      a.group.position.x = b.position.x;
      a.group.position.z = b.position.z;
      a.group.rotation.y = b.position.facing || 0;
      const walking = b.motion && b.motion.active;
      a.group.position.y = walking ? Math.abs(Math.sin(elapsed * 7 + a.phase)) * 0.09 : 0;
      a.label.visible = b.alive !== false;
      if (b.alive === false) {
        a.group.rotation.z = Math.PI / 2;
        a.group.position.y = 0.32;
        a.body.material.opacity = 0.55;
        a.body.material.transparent = true;
      }
      // Postura emocional: hombros caídos o erguidos
      const posture = b.emotions.modifiers().posture;
      a.body.rotation.x = U.clamp(-posture * 0.08, -0.12, 0.12);
      if (id === selectedId) a.ring.visible = true;
    }

    inspector.update();
    updateHud();
    renderer.render(scene, camera);
  }

  repopulate();
  inspectFirstFrame();
  function inspectFirstFrame() {
    setTimeout(() => {
      const b = world.brains.find((x) => x.identity.profession === 'mecanico_ferroviario') || world.brains[0];
      if (b) selectNpc(b.id);
    }, 600);
  }
  requestAnimationFrame(animate);

  // API pública para depuración desde la consola
  g.IRON = {
    world: world,
    inspector: inspector,
    create: AETH.createNPC,
    createFromDescription: AETH.createNPCFromDescription,
    spawn: function (spec) {
      const b = world.spawn(spec);
      addAvatar(b);
      return b;
    },
    event: function (type, opts) {
      return world.injectEvent(type, opts);
    },
    select: selectNpc,
    save: function () {
      return world.save();
    }
  };
  console.log('%cIRON V1 · Aethrion cognitive engine ' + AETH.version + ' — usa IRON.world / IRON.createFromDescription(...)', 'color:#d9ae57');
})(typeof window !== 'undefined' ? window : globalThis);
