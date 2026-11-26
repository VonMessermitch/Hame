/* ============================================================================
   V.GAI.1.0 · ARMAMENTO, CONTENEDOR MILITAR AT-18, MG08 1.ª PERSONA Y ZEPELÍN
   1) Nivel 12 (Cepelín Kaiser): Pistola Lugy 7,65 mm obligatoria (solo pistola en mano,
      mantiene MG15/torreta, bloquea swap/pickups de fusil y restaura arsenal en leave12).
   2) Contenedor militar verde oliva corrugado + Fusil Antitanque AT-18 recogible [E]
      en niveles blindados (17, 18, 19, 20), vista 1.ª persona VM32.R.AT y daño AP.
   3) Overhaul visual de mkMG08 y modelo 1.ª persona VM32.R.MG activo con P.mg.
   ============================================================================ */
(function (root) {
  'use strict';

  var api = {
    version: 'V.GAI.1.0',
    hasAT: false,
    containersBuilt: Object.create(null),
    atPickups: [],
    hiddenWorldBar: null,
    mgSteamCd: 0
  };

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    root.WEAPONS_VGAI = api;
    return;
  }

  var MAT = null;
  function getMats() {
    if (MAT || typeof THREE === 'undefined') return MAT;
    var T = THREE;
    MAT = {
      olive: new T.MeshLambertMaterial({ color: 0x454f36 }),
      oliveRib: new T.MeshLambertMaterial({ color: 0x363e2a }),
      oliveDark: new T.MeshLambertMaterial({ color: 0x262b1d }),
      steel: new T.MeshLambertMaterial({ color: 0x2c3034 }),
      steelLight: new T.MeshLambertMaterial({ color: 0x52585e }),
      brass: new T.MeshLambertMaterial({ color: 0xb69346 }),
      wood: new T.MeshLambertMaterial({ color: 0x5b3c22 }),
      cloth: new T.MeshLambertMaterial({ color: 0x8d8361 }),
      stencil: new T.MeshLambertMaterial({ color: 0xd9d1b6 }),
      glow: new T.MeshBasicMaterial({ color: 0xf4c45c, transparent: true, opacity: 0.85 })
    };
    return MAT;
  }

  function groundY(lv, x, z) {
    if ((lv === 18 || lv === 20) && typeof floor18 === 'function') {
      var Xv = typeof X18 !== 'undefined' ? X18 : 200000;
      return floor18(x - Xv, z) || 0;
    }
    if ((lv === 17 || lv === 19) && typeof floor17 === 'function') {
      var Xk = typeof X17 !== 'undefined' ? X17 : 160000;
      return floor17(x - Xk, z) || 0;
    }
    if (typeof floorAt === 'function') return floorAt({ x: x, y: 0.2, z: z }) || 0;
    return 0;
  }

  // ---------------- 1. NIVEL 12 ZEPELÍN: SOLO PISTOLA LUGY 7,65 MM ----------------
  function enforceLevel12PistolOnly() {
    if (typeof P === 'undefined' || !P || !P.weapons) return;
    if (typeof L12 !== 'undefined' && L12 && !L12.w0) {
      L12.w0 = JSON.parse(JSON.stringify(P.weapons));
    }
    Object.assign(P.weapons.revolver, { mag: 8, max: 8, reserve: 48, cd: 0.28, dmg: 36, reload: 1.7, fov: 4 });
    P.cur = 'revolver';
    P.grenades = 0;
    P.rel = 0;
    P.reloading = null;
  }

  function restoreLevel12Weapons() {
    if (typeof P === 'undefined' || !P || !P.weapons) return;
    if (typeof L12 !== 'undefined' && L12 && L12.w0) {
      for (var k in L12.w0) {
        if (P.weapons[k]) Object.assign(P.weapons[k], L12.w0[k]);
      }
      L12.w0 = null;
    }
  }

  // ---------------- 2. VIEWMODELS 1.ª PERSONA: AT-18 & MG08 ----------------
  function ensureViewmodelsBuilt() {
    if (typeof VM32 === 'undefined' || !VM32 || !VM32.R || typeof THREE === 'undefined') return false;
    var T = THREE;
    var m = getMats();
    var targetScene = (typeof VM13 !== 'undefined' && VM13 && VM13.scene) ? VM13.scene : null;
    if (!targetScene) return false;

    // VM32.R.AT (Fusil Antitanque AT-18)
    if (!VM32.R.AT) {
      var rootAT = new T.Group();
      rootAT.visible = false;
      var pivAT = new T.Group();
      rootAT.add(pivAT);

      // Cajón de mecanismos, culata de madera, bípode y cañón pesado de 13,2 mm con freno de boca
      var body = new T.Mesh(new T.BoxGeometry(0.068, 0.085, 0.42), m.steel);
      body.position.set(0, -0.02, -0.08);
      pivAT.add(body);

      var stock = new T.Mesh(new T.BoxGeometry(0.056, 0.11, 0.34), m.wood);
      stock.position.set(0, -0.05, 0.22);
      pivAT.add(stock);

      var grip = new T.Mesh(new T.BoxGeometry(0.044, 0.11, 0.055), m.wood);
      grip.position.set(0, -0.10, 0.08);
      grip.rotation.x = 0.28;
      pivAT.add(grip);

      var barrel = new T.Mesh(new T.CylinderGeometry(0.019, 0.024, 0.96, 10), m.steel);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0.006, -0.72);
      pivAT.add(barrel);

      var flute = new T.Mesh(new T.CylinderGeometry(0.027, 0.030, 0.28, 10), m.steelLight);
      flute.rotation.x = Math.PI / 2;
      flute.position.set(0, 0.006, -0.38);
      pivAT.add(flute);

      var brake = new T.Mesh(new T.BoxGeometry(0.052, 0.044, 0.095), m.steel);
      brake.position.set(0, 0.006, -1.21);
      pivAT.add(brake);

      var bolt = new T.Mesh(new T.CylinderGeometry(0.011, 0.011, 0.08, 8), m.steelLight);
      bolt.rotation.z = Math.PI / 2;
      bolt.position.set(0.045, 0.01, -0.02);
      pivAT.add(bolt);

      var sight = new T.Mesh(new T.BoxGeometry(0.018, 0.032, 0.06), m.brass);
      sight.position.set(0, 0.042, -0.16);
      pivAT.add(sight);

      targetScene.add(rootAT);
      VM32.R.AT = {
        root: rootAT,
        piv: pivAT,
        bolt: bolt,
        k: { p: [0.19, -0.18, -0.28], a: [0.02, -0.04, 0], ap: [0.03, -0.115, -0.24], rc: 0.14, rs: 4.5, drop: 0.16, rt: 0.45, sway: 1 }
      };
    }

    // VM32.R.MG (Ametralladora pesada MG08 en 1.ª persona)
    if (!VM32.R.MG) {
      var rootMG = new T.Group();
      rootMG.visible = false;
      var pivMG = new T.Group();
      rootMG.add(pivMG);

      var rec = new T.Mesh(new T.BoxGeometry(0.11, 0.14, 0.46), m.steel);
      rec.position.set(0, -0.02, -0.05);
      pivMG.add(rec);

      var jacket = new T.Mesh(new T.CylinderGeometry(0.062, 0.062, 0.72, 12), m.steelLight);
      jacket.rotation.x = Math.PI / 2;
      jacket.position.set(0, 0.005, -0.58);
      pivMG.add(jacket);

      for (var r = 0; r < 4; r++) {
        var ring = new T.Mesh(new T.CylinderGeometry(0.068, 0.068, 0.024, 12), m.steel);
        ring.rotation.x = Math.PI / 2;
        ring.position.set(0, 0.005, -0.32 - r * 0.17);
        pivMG.add(ring);
      }

      var muzzle = new T.Mesh(new T.CylinderGeometry(0.022, 0.034, 0.16, 8), m.steel);
      muzzle.rotation.x = Math.PI / 2;
      muzzle.position.set(0, 0.005, -1.01);
      pivMG.add(muzzle);

      // Empuñaduras traseras dobles + gatillo central
      for (var s = -1; s <= 1; s += 2) {
        var sp = new T.Mesh(new T.CylinderGeometry(0.015, 0.015, 0.16, 8), m.wood);
        sp.position.set(s * 0.055, -0.04, 0.21);
        pivMG.add(sp);
      }
      var cross = new T.Mesh(new T.BoxGeometry(0.15, 0.028, 0.028), m.steel);
      cross.position.set(0, 0.045, 0.21);
      pivMG.add(cross);

      // Cinta textil de munición entrando por la derecha
      var belt = new T.Group();
      belt.position.set(0.09, -0.02, -0.14);
      for (var c = 0; c < 6; c++) {
        var rnd = new T.Mesh(new T.CylinderGeometry(0.008, 0.008, 0.055, 6), m.brass);
        rnd.rotation.x = Math.PI / 2;
        rnd.position.set(c * 0.026, -c * 0.014, 0);
        belt.add(rnd);
      }
      var cloth = new T.Mesh(new T.BoxGeometry(0.16, 0.018, 0.052), m.cloth);
      cloth.position.set(0.075, -0.04, 0);
      cloth.rotation.z = -0.45;
      belt.add(cloth);
      pivMG.add(belt);

      var rearSight = new T.Mesh(new T.BoxGeometry(0.026, 0.05, 0.024), m.brass);
      rearSight.position.set(0, 0.078, 0.09);
      pivMG.add(rearSight);

      targetScene.add(rootMG);
      VM32.R.MG = {
        root: rootMG,
        piv: pivMG,
        belt: belt,
        k: { p: [0, -0.14, -0.32], a: [0, 0, 0], ap: [0, -0.135, -0.30], rc: 0.045, rs: 12.0, drop: 0.02, rt: 0.1, sway: 0.25 }
      };
    }

    return true;
  }

  // ---------------- 3. CONTENEDOR MILITAR Y RECOGIDA DE AT-18 ----------------
  function buildATContainer(lv, x, z, ry) {
    if (typeof scene === 'undefined' || typeof THREE === 'undefined') return null;
    var T = THREE, m = getMats(), y = groundY(lv, x, z);
    var g = new T.Group();
    g.position.set(x, y, z);
    g.rotation.y = ry || 0;

    var W = 2.6, H = 2.45, L = 5.6;
    // Suelo y techo
    var floor = new T.Mesh(new T.BoxGeometry(W, 0.14, L), m.oliveDark);
    floor.position.y = 0.07;
    g.add(floor);
    var roof = new T.Mesh(new T.BoxGeometry(W + 0.08, 0.14, L + 0.08), m.olive);
    roof.position.y = H + 0.07;
    g.add(roof);

    // Pared trasera y paredes laterales con nervaduras corrugadas
    var back = new T.Mesh(new T.BoxGeometry(W, H, 0.14), m.olive);
    back.position.set(0, H / 2 + 0.07, -L / 2 + 0.07);
    g.add(back);

    for (var s = -1; s <= 1; s += 2) {
      var side = new T.Mesh(new T.BoxGeometry(0.14, H, L), m.olive);
      side.position.set(s * (W / 2 - 0.07), H / 2 + 0.07, 0);
      g.add(side);
      for (var rz = -L / 2 + 0.35; rz < L / 2 - 0.2; rz += 0.45) {
        var rib = new T.Mesh(new T.BoxGeometry(0.05, H - 0.16, 0.12), m.oliveRib);
        rib.position.set(s * (W / 2 + 0.02), H / 2 + 0.07, rz);
        g.add(rib);
      }
      var stPlate = new T.Mesh(new T.BoxGeometry(0.04, 0.28, 1.35), m.stencil);
      stPlate.position.set(s * (W / 2 + 0.04), H * 0.72, 0.4);
      g.add(stPlate);
    }

    // Puertas frontales abiertas (115 grados hacia afuera)
    for (var ds = -1; ds <= 1; ds += 2) {
      var dPiv = new T.Group();
      dPiv.position.set(ds * (W / 2 - 0.07), 0.1, L / 2);
      dPiv.rotation.y = ds * 2.02;
      var dLeaf = new T.Mesh(new T.BoxGeometry(W * 0.48, H - 0.08, 0.09), m.oliveRib);
      dLeaf.position.set(-ds * (W * 0.24), (H - 0.08) / 2, 0);
      dPiv.add(dLeaf);
      g.add(dPiv);
    }

    // Mesa armero interior + Fusil Antitanque AT-18 3D sobre soporte
    var rack = new T.Mesh(new T.BoxGeometry(1.5, 0.78, 0.8), m.wood);
    rack.position.set(0, 0.46, 0.6);
    g.add(rack);

    var pickupGroup = new T.Group();
    pickupGroup.position.set(0, 0.98, 0.65);
    var pRec = new T.Mesh(new T.BoxGeometry(0.09, 0.11, 0.65), m.steel);
    pickupGroup.add(pRec);
    var pBar = new T.Mesh(new T.CylinderGeometry(0.022, 0.028, 1.25, 10), m.steelLight);
    pBar.rotation.z = Math.PI / 2;
    pBar.position.set(0.65, 0.02, 0);
    pickupGroup.add(pBar);
    var pStock = new T.Mesh(new T.BoxGeometry(0.45, 0.13, 0.07), m.wood);
    pStock.position.set(-0.46, -0.02, 0);
    pickupGroup.add(pStock);
    var pHalo = new T.Mesh(new T.CylinderGeometry(0.55, 0.55, 0.03, 14), m.glow);
    pHalo.position.set(0, -0.10, 0);
    pickupGroup.add(pHalo);
    g.add(pickupGroup);

    scene.add(g);

    // Colisiones en obstB solo para paredes izquierda, derecha y trasera (frente abierto para entrar)
    if (typeof obstB !== 'undefined') {
      var c = Math.cos(ry || 0), si = Math.sin(ry || 0);
      var toW = function (lx, lz) { return { x: x + lx * c + lz * si, z: z - lx * si + lz * c }; };
      var pL = toW(-W / 2 + 0.1, 0), pR = toW(W / 2 - 0.1, 0), pB = toW(0, -L / 2 + 0.1);
      var rot90 = Math.abs(si) > 0.5;
      obstB.push(
        { x: pL.x, z: pL.z, y0: y, hw: rot90 ? L / 2 : 0.18, hd: rot90 ? 0.18 : L / 2, h: y + H },
        { x: pR.x, z: pR.z, y0: y, hw: rot90 ? L / 2 : 0.18, hd: rot90 ? 0.18 : L / 2, h: y + H },
        { x: pB.x, z: pB.z, y0: y, hw: rot90 ? 0.18 : W / 2, hd: rot90 ? W / 2 : 0.18, h: y + H }
      );
      if (typeof NV !== 'undefined' && NV) NV.sig = '';
    }

    var pickPos = {
      level: lv,
      x: x + Math.sin(ry || 0) * 0.65,
      y: y,
      z: z + Math.cos(ry || 0) * 0.65,
      mesh: pickupGroup,
      taken: false
    };
    api.atPickups.push(pickPos);
    return pickPos;
  }

  function ensureArmorContainersForLevel(lv) {
    if (api.containersBuilt[lv]) return;
    if (lv !== 17 && lv !== 18 && lv !== 19 && lv !== 20) return;
    api.containersBuilt[lv] = true;
    if (lv === 17 || lv === 19) {
      var Xk = typeof X17 !== 'undefined' ? X17 : 160000;
      buildATContainer(lv, Xk + 16, 26, -0.35);
    } else {
      var Xv = typeof X18 !== 'undefined' ? X18 : 200000;
      buildATContainer(lv, Xv + 15, 14, -0.25);
    }
  }

  function giveAtRifle() {
    if (typeof P === 'undefined' || !P || !P.weapons) return;
    api.hasAT = true;
    P.weapons.atrifle = { mag: 1, max: 1, reserve: 10, cd: 1.35, dmg: 195, reload: 2.5, fov: 6, ap: true };
    if (typeof N17 !== 'undefined' && N17 && Array.isArray(N17.arm) && N17.arm.indexOf('atrifle') < 0) N17.arm.push('atrifle');
    if (typeof N18 !== 'undefined' && N18 && Array.isArray(N18.arm) && N18.arm.indexOf('atrifle') < 0) N18.arm.push('atrifle');
    P.cur = 'atrifle';
    P.rel = 0;
    P.reloading = null;
    ensureViewmodelsBuilt();
    if (typeof feed === 'function') feed('★ Fusil Antitanque AT-18 (13,2 mm AP) equipado');
    if (typeof say === 'function') say('Has recogido el Fusil Antitanque AT-18. Perfora carros blindados y casamatas.', 3.8);
    if (window.AUDIO_VGAI && typeof window.AUDIO_VGAI.playReloadProfile === 'function') {
      window.AUDIO_VGAI.playReloadProfile('atrifle');
    }
  }

  function fireAtRifleShot() {
    if (typeof P === 'undefined' || !P || !P.weapons || !P.weapons.atrifle) return;
    var w = P.weapons.atrifle;
    if (P.cd > 0 || P.rel > 0 || P.roll > 0) return;
    if (w.mag <= 0) {
      if (typeof reload === 'function') reload();
      return;
    }
    w.mag--;
    P.cd = w.cd;
    P.aim = 1;
    P.rc = 1.35;
    P.bolt = 0.65;
    if (typeof fovKick !== 'undefined') fovKick = w.fov;
    if (typeof shake !== 'undefined') shake = Math.max(shake, 1.05);
    if (typeof pitch !== 'undefined' && typeof clamp === 'function') pitch = clamp(pitch - 0.042, -0.25, 1.1);

    if (typeof cam !== 'undefined' && typeof THREE !== 'undefined') {
      var dir = new THREE.Vector3();
      cam.getWorldDirection(dir);
      var orig = cam.position.clone().addScaledVector(dir, 1.2);
      if (typeof muzzleFX === 'function') muzzleFX(orig, dir, true);

      // Impacto perforante sobre vehículos blindados VEH32
      var bestHit = null, bestDist = 320;
      if (typeof VEH32 !== 'undefined' && VEH32 && Array.isArray(VEH32.list)) {
        for (var i = 0; i < VEH32.list.length; i++) {
          var v = VEH32.list[i];
          if (!v || !v.g || !v.alive || !v.on || v.ally) continue;
          var vp = v.g.position;
          var toV = vp.clone().setY(vp.y + ((v.spec && v.spec.h) || 2) * 0.45).sub(orig);
          var dist = toV.length();
          if (dist > 320 || dist < 1) continue;
          var dot = toV.clone().normalize().dot(dir);
          var hitRad = Math.max(1.8, (v.spec && v.spec.hw) || 1.5);
          if (dot > Math.cos(Math.atan2(hitRad, dist)) && dist < bestDist) {
            bestDist = dist;
            bestHit = v;
          }
        }
      }
      if (bestHit && typeof vhVehDmg32 === 'function') {
        var apDmg = 260;
        if (root.CORE_VGAI && typeof root.CORE_VGAI.computeAtRifleDamage === 'function') {
          apDmg = root.CORE_VGAI.computeAtRifleDamage(260, bestHit.tp || 'tank', (bestHit.spec && bestHit.spec.armB) || 0.35, bestDist);
        }
        vhVehDmg32(bestHit, apDmg, 'at', orig.x, orig.z);
        var crEl = typeof $ === 'function' ? $('cr') : null;
        if (crEl) { crEl.classList.add('head'); setTimeout(function () { crEl.classList.remove('head'); }, 150); }
        if (window.AUDIO_VGAI && typeof window.AUDIO_VGAI.playImpactProfile === 'function') {
          window.AUDIO_VGAI.playImpactProfile('armor_pen', bestHit.g.position.x, bestHit.g.position.z);
        }
      }

      // Impacto también contra infantería en línea de fuego
      if (typeof enemies !== 'undefined' && typeof hurt === 'function') {
        for (var j = enemies.length - 1; j >= 0; j--) {
          var e = enemies[j];
          if (!e || e.hp <= 0 || !e.g) continue;
          var ep = e.g.position.clone().setY(e.g.position.y + 1.2 * (e.s || 1));
          var toE = ep.sub(orig);
          var ed = toE.length();
          if (ed < bestDist && toE.normalize().dot(dir) > 0.992) {
            hurt(e, 240, 'h');
            break;
          }
        }
      }
    }

    if (window.AUDIO_VGAI && typeof window.AUDIO_VGAI.playWeaponProfile === 'function') {
      window.AUDIO_VGAI.playWeaponProfile('atrifle');
    } else if (typeof weaponSfx === 'function') {
      weaponSfx('revolver');
    }
  }

  // ---------------- 4. HOOKS DE INTEGRACIÓN ----------------
  function installHooks() {
    if (api._installed) return;
    api._installed = true;

    // Overhaul visual de mkMG08 (enfriador remachado, mira óptica, manguera de vapor y caja)
    if (typeof window.mkMG08 === 'function' && !window.mkMG08._vgaiOverhaul) {
      var _mg08 = window.mkMG08;
      window.mkMG08 = function (x, z, y, lv) {
        var o = _mg08.apply(this, arguments);
        if (o && o.bar && typeof THREE !== 'undefined') {
          var m = getMats();
          var sight = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.08, 0.14), m.brass);
          sight.position.set(0.06, 0.21, 0.18);
          o.bar.add(sight);
          var latch = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.05, 0.24), m.steelLight);
          latch.position.set(0, 0.18, -0.05);
          o.bar.add(latch);
        }
        return o;
      };
      window.mkMG08._vgaiOverhaul = true;
    }

    // Nivel 12 start/leave
    if (typeof window.startLevel12 === 'function' && !window.startLevel12._vgaiPistol) {
      var _sl12 = window.startLevel12;
      window.startLevel12 = function () {
        var r = _sl12.apply(this, arguments);
        enforceLevel12PistolOnly();
        return r;
      };
      window.startLevel12._vgaiPistol = true;
    }
    if (typeof window.leave12 === 'function' && !window.leave12._vgaiPistol) {
      var _lv12 = window.leave12;
      window.leave12 = function () {
        var r = _lv12.apply(this, arguments);
        restoreLevel12Weapons();
        return r;
      };
      window.leave12._vgaiPistol = true;
    }

    // Bloquear swap en L12 y añadir 'atrifle' cuando esté desbloqueado
    if (typeof window.swap === 'function' && !window.swap._vgaiWpn) {
      var _sw = window.swap;
      window.swap = function () {
        if (typeof level !== 'undefined' && level === 12) {
          enforceLevel12PistolOnly();
          if (typeof say === 'function') say('Pistola Lugy 7,65 mm reglamentaria (única arma portátil en cubierta).', 1.6);
          return;
        }
        if (api.hasAT && typeof P !== 'undefined' && P && typeof playing !== 'undefined' && playing && !(P.roll > 0) && !(P.swT >= 0)) {
          var order = ['rifle', 'smg', 'revolver', 'atrifle', 'sword'];
          var idx = order.indexOf(P.cur);
          P.cur = order[(idx + 1) % order.length];
          P.rel = 0;
          P.reloading = null;
          if (typeof snd === 'function') snd(500, 0.08, 'square', 0.03);
          if (typeof say === 'function') {
            say({
              rifle: 'Fusil reglamentario listo',
              smg: 'Subfusil listo — fuego automático',
              revolver: 'Pistola / Revólver listo',
              atrifle: 'Fusil Antitanque AT-18 — munición perforante 13,2 mm',
              sword: 'Arma cuerpo a cuerpo'
            }[P.cur] || P.cur, 1.8);
          }
          return;
        }
        return _sw.apply(this, arguments);
      };
      window.swap._vgaiWpn = true;
    }

    // Bloquear pickups ajenos a pistola en L12
    if (typeof window.pick === 'function' && !window.pick._vgaiL12) {
      var _pk = window.pick;
      window.pick = function (x, z, t) {
        if (typeof level !== 'undefined' && level === 12 && t === 'g') return;
        return _pk.apply(this, arguments);
      };
      window.pick._vgaiL12 = true;
    }

    // Viewmodels VM32: Lugy single-pistol L12, AT-18, MG08 1st person
    if (typeof window.vmKey32 === 'function' && !window.vmKey32._vgaiWpn) {
      var _vk = window.vmKey32;
      window.vmKey32 = function () {
        if (typeof P !== 'undefined' && P) {
          if (P.mg && typeof curMG !== 'undefined' && curMG && !curMG.k15) return 'MG';
          if (P.cur === 'atrifle') return 'AT';
          if (typeof level !== 'undefined' && level === 12) return 'P';
        }
        return _vk.apply(this, arguments);
      };
      window.vmKey32._vgaiWpn = true;
    }

    if (typeof window.vmTick32 === 'function' && !window.vmTick32._vgaiWpn) {
      var _vt = window.vmTick32;
      window.vmTick32 = function (dt) {
        ensureViewmodelsBuilt();
        // Ocultar barril de mundo mientras el jugador usa la MG08 en 1.ª persona
        var inMG1P = typeof P !== 'undefined' && P && P.mg && typeof curMG !== 'undefined' && curMG && !curMG.k15 &&
          typeof playing !== 'undefined' && playing && typeof fpv !== 'undefined' && fpv && !(typeof L9 !== 'undefined' && L9 && L9.cine);

        if (api.hiddenWorldBar && (!inMG1P || (typeof curMG !== 'undefined' && curMG && api.hiddenWorldBar !== curMG.bar))) {
          api.hiddenWorldBar.visible = true;
          api.hiddenWorldBar = null;
        }
        if (inMG1P && curMG.bar) {
          curMG.bar.visible = false;
          api.hiddenWorldBar = curMG.bar;
          if (typeof VM32 !== 'undefined' && VM32.R && VM32.R.MG) {
            if (typeof VM13 !== 'undefined' && VM13) VM13.on = true;
            VM32.on = true;
            VM32.key = 'MG';
            if (VM32.R.MG.belt && typeof firing !== 'undefined' && firing) {
              VM32.R.MG.belt.position.y = -0.02 + Math.sin(performance.now() * 0.045) * 0.008;
            }
          }
        }
        var r = _vt.apply(this, arguments);
        if (inMG1P && typeof VM32 !== 'undefined' && VM32.R && VM32.R.MG) {
          for (var k in VM32.R) if (VM32.R[k] && VM32.R[k].root) VM32.R[k].root.visible = (k === 'MG');
          VM32.R.MG.root.visible = true;
          if (typeof cam !== 'undefined' && typeof VM13 !== 'undefined' && VM13.cam) {
            VM32.R.MG.root.position.set(0, -0.14 + Math.sin((typeof time !== 'undefined' ? time : 0) * 18) * ((typeof firing !== 'undefined' && firing) ? 0.004 : 0), -0.32 + ((typeof P !== 'undefined' && P.rc) ? P.rc * 0.03 : 0));
          }
        }
        return r;
      };
      window.vmTick32._vgaiWpn = true;
    }

    // Disparo AT-18 y animaciones de retroceso MG08 / Lugy
    if (typeof window.fire === 'function' && !window.fire._vgaiWpn) {
      var _fi = window.fire;
      window.fire = function () {
        if (typeof P !== 'undefined' && P) {
          if (typeof level !== 'undefined' && level === 12 && !P.mg && !(typeof L12 !== 'undefined' && L12 && L12.tur)) {
            if (P.cur !== 'revolver') P.cur = 'revolver';
          }
          if (!P.mg && P.cur === 'atrifle') {
            fireAtRifleShot();
            return;
          }
        }
        return _fi.apply(this, arguments);
      };
      window.fire._vgaiWpn = true;
    }

    // Interacción [E] para recoger AT-18 dentro del contenedor
    if (typeof window.interact === 'function' && !window.interact._vgaiWpn) {
      var _in = window.interact;
      window.interact = function () {
        if (typeof P !== 'undefined' && P && P.g && typeof level !== 'undefined') {
          for (var i = 0; i < api.atPickups.length; i++) {
            var pk = api.atPickups[i];
            if (pk.level === level && !pk.taken && Math.hypot(pk.x - P.g.position.x, pk.z - P.g.position.z) < 2.8) {
              pk.taken = true;
              if (pk.mesh) pk.mesh.visible = false;
              giveAtRifle();
              return;
            }
          }
        }
        return _in.apply(this, arguments);
      };
      window.interact._vgaiWpn = true;
    }

    // Actualización por frame (contenedores, prompt de AT-18, HUD L12 y AT-18, vapor MG08)
    if (typeof window.update === 'function' && !window.update._vgaiWpn) {
      var _up = window.update;
      window.update = function (dt) {
        var r = _up.apply(this, arguments);
        try {
          var lv = typeof level !== 'undefined' ? level : 0;
          if (typeof playing !== 'undefined' && playing) {
            ensureArmorContainersForLevel(lv);
            if (lv === 12 && typeof P !== 'undefined' && P && !P.mg && P.cur !== 'revolver') {
              enforceLevel12PistolOnly();
            }
          }

          // Animar fusil recogible y mostrar prompt [E]
          if (typeof P !== 'undefined' && P && P.g && typeof $ === 'function') {
            for (var i = 0; i < api.atPickups.length; i++) {
              var pk = api.atPickups[i];
              if (pk.level !== lv || pk.taken) continue;
              if (pk.mesh) pk.mesh.rotation.y += (dt || 0.016) * 1.1;
              if (Math.hypot(pk.x - P.g.position.x, pk.z - P.g.position.z) < 2.8) {
                var pr = $('pr');
                if (pr && !pr.textContent) pr.textContent = '[E] Recoger Fusil Antitanque AT-18 (13,2 mm)';
              }
              // Bot backup en nivel 17 si el jugador no lo recoge en 15s
              if (lv === 17 && !api._botAtAssigned) {
                pk._unclaimedTime = (pk._unclaimedTime || 0) + (dt || 0.016);
                if (pk._unclaimedTime > 15.0) {
                  api._botAtAssigned = true;
                  pk.taken = true;
                  if (pk.mesh) pk.mesh.visible = false;
                  if (typeof N17 !== 'undefined' && N17 && Array.isArray(N17.sq) && N17.sq.length) {
                    var bot = N17.sq[0];
                    if (bot) {
                      bot.hasAT18 = true;
                      if (typeof feed === 'function') feed('★ Escuadra aliada: Bot equipado con AT-18 para asaltar el blindado');
                    }
                  }
                }
              }
            }

            // Texto #ammo consistente en L12 y AT-18
            var amEl = $('ammo');
            if (amEl && !(typeof L9 !== 'undefined' && L9 && L9.cine)) {
              if (lv === 12 && !P.mg && !(typeof L12 !== 'undefined' && L12 && L12.tur) && P.weapons && P.weapons.revolver) {
                var wr = P.weapons.revolver;
                amEl.textContent = 'PISTOLA LUGY 7,65 mm · ' + (P.rel > 0 ? 'RECARGANDO' : wr.mag + ' / ' + wr.reserve);
              } else if (P.cur === 'atrifle' && !P.mg && P.weapons && P.weapons.atrifle) {
                var wa = P.weapons.atrifle;
                amEl.textContent = 'FUSIL ANTITANQUE AT-18 · ' + (P.rel > 0 ? 'RECARGANDO' : wa.mag + ' / ' + wa.reserve) + ' · GRANADAS ' + (P.grenades || 0);
              }
            }
          }

          // Vapor de camisa de agua MG08 al disparar ráfaga
          if (typeof P !== 'undefined' && P && P.mg && typeof firing !== 'undefined' && firing && typeof curMG !== 'undefined' && curMG && !curMG.k15) {
            api.mgSteamCd -= (dt || 0.016);
            if (api.mgSteamCd <= 0 && typeof smoke === 'function') {
              api.mgSteamCd = 0.25;
              smoke(curMG.x, (curMG.y || 0) + 1.35, curMG.z, 0.22, 0.45, 0xe8ecf0, 0.22, 0.22);
            }
          }
          if (typeof pitch !== 'undefined' && typeof clamp === 'function') {
            pitch = clamp(pitch, -0.25, 1.52);
          }
        } catch (_) {}
        return r;
      };
      window.update._vgaiWpn = true;
    }

    // Cinemática de destrucción de tanques / blindados (Misiones 17, 18, 19, 20)
    if (typeof window.vhVehKill32 === 'function' && !window.vhVehKill32._vgaiCine) {
      var _vk32 = window.vhVehKill32;
      window.vhVehKill32 = function (v) {
        var r = _vk32.apply(this, arguments);
        try {
          if (v && v.g) {
            if (typeof shake !== 'undefined') shake = Math.max(shake, 1.6);
            if (typeof L9 !== 'undefined') {
              L9.cine = true;
              setTimeout(function () { L9.cine = false; }, 2500);
            }
            if (typeof feed === 'function') {
              feed('★ ¡DESTRUCCIÓN CINEMÁTICA! El blindado pesado ha volado por los aires');
            }
            if (window.AUDIO_VGAI && typeof window.AUDIO_VGAI.playEvent === 'function') {
              window.AUDIO_VGAI.playEvent('bunker_explosion', { x: v.g.position.x, z: v.g.position.z, vol: 1.0 });
            }
            if (typeof boom === 'function' && typeof THREE !== 'undefined') {
              boom(new THREE.Vector3(v.g.position.x, v.g.position.y || 1, v.g.position.z));
            }
          }
        } catch (_) {}
        return r;
      };
      window.vhVehKill32._vgaiCine = true;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installHooks);
  } else {
    installHooks();
  }

  api.buildATContainer = buildATContainer;
  api.giveAtRifle = giveAtRifle;
  api.enforceLevel12PistolOnly = enforceLevel12PistolOnly;
  window.WEAPONS_VGAI = api;
  window.AETH = window.AETH || {};
  window.AETH.vgai = window.AETH.vgai || {};
  window.AETH.vgai.weapons = api;
})(typeof window !== 'undefined' ? window : globalThis);
