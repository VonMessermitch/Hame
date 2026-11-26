/* ============================================================================
   V.GAI.1.0 · ARQUITECTURA DE NIVELES, DEFENSAS Y COBERTURA URBANA (AGENTE 3)
   - Martillo de Hierro (Niveles 18 & 20): patios, callejones laterales (>=6m libres),
     búnkeres de sacos, carros volcados y barricadas en Falkenbrück.
   - Línea Tres Cruces (Niveles 17 & 19): refuerzo de parapetos antitanque (cheek-walls),
     tablas de tiro, traveses en zonas muertas y pasos señalizados en alambrada.
   - Cobertura urbana narrativa en niveles 13 y 14 (sacos, cajas, bidones, muretes).
   ============================================================================ */
(function (root) {
  'use strict';

  var api = {
    version: 'V.GAI.1.0',
    enhanced: Object.create(null),
    addedProps: 0
  };

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    root.LEVELS_ARCH_VGAI = api;
    return;
  }

  var M = null;
  function getMats() {
    if (M || typeof THREE === 'undefined') return M;
    var T = THREE;
    M = {
      sandbag: new T.MeshLambertMaterial({ color: 0x9b8b69 }),
      sandbagDark: new T.MeshLambertMaterial({ color: 0x7c6e50 }),
      timber: new T.MeshLambertMaterial({ color: 0x523b25 }),
      crate: new T.MeshLambertMaterial({ color: 0x5d4c32 }),
      drum: new T.MeshLambertMaterial({ color: 0x3b483d }),
      stone: new T.MeshLambertMaterial({ color: 0x7a766e }),
      whiteMark: new T.MeshLambertMaterial({ color: 0xe6e2d4 })
    };
    return M;
  }

  function sampleY(lv, x, z) {
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

  function addObstacleAndCover(x, z, y, hw, hd, h, rCov) {
    if (typeof obstB !== 'undefined') {
      obstB.push({ x: x, z: z, y0: y, hw: hw, hd: hd, h: y + h });
    }
    if (typeof covers !== 'undefined') {
      covers.push({ x: x, z: z, r: rCov || Math.max(hw, hd) + 1.0 });
    }
    if (typeof NV !== 'undefined' && NV) NV.sig = '';
    api.addedProps++;
  }

  function placeSandbagWall(lv, x, z, len, rotY, tiers) {
    if (typeof scene === 'undefined' || typeof THREE === 'undefined') return;
    var T = THREE, mt = getMats(), y = sampleY(lv, x, z);
    var g = new T.Group();
    g.position.set(x, y, z);
    g.rotation.y = rotY || 0;
    var count = Math.max(2, Math.round(len / 0.85));
    var rows = tiers || 2;
    for (var r = 0; r < rows; r++) {
      for (var i = 0; i < count; i++) {
        var bx = -len * 0.5 + (i + 0.5) * (len / count);
        var bag = new T.Mesh(new T.BoxGeometry(0.82, 0.34, 0.62), r % 2 ? mt.sandbagDark : mt.sandbag);
        bag.position.set(bx, 0.17 + r * 0.33, (r % 2) * 0.05);
        g.add(bag);
      }
    }
    scene.add(g);
    var c = Math.abs(Math.cos(rotY || 0)), s = Math.abs(Math.sin(rotY || 0));
    var hw = c * (len * 0.5) + s * 0.35;
    var hd = s * (len * 0.5) + c * 0.35;
    addObstacleAndCover(x, z, y, hw, hd, rows * 0.36, Math.max(hw, hd) + 0.9);
  }

  function placeCrateCluster(lv, x, z, rotY) {
    if (typeof scene === 'undefined' || typeof THREE === 'undefined') return;
    var T = THREE, mt = getMats(), y = sampleY(lv, x, z);
    var g = new T.Group();
    g.position.set(x, y, z);
    g.rotation.y = rotY || 0;
    var c1 = new T.Mesh(new T.BoxGeometry(1.15, 0.95, 0.95), mt.crate);
    c1.position.set(-0.35, 0.475, 0);
    g.add(c1);
    var c2 = new T.Mesh(new T.BoxGeometry(0.9, 0.85, 0.85), mt.timber);
    c2.position.set(0.65, 0.425, 0.12);
    g.add(c2);
    var c3 = new T.Mesh(new T.BoxGeometry(0.7, 0.6, 0.65), mt.crate);
    c3.position.set(-0.2, 1.25, 0.05);
    g.add(c3);
    var dr = new T.Mesh(new T.CylinderGeometry(0.32, 0.32, 0.95, 10), mt.drum);
    dr.position.set(1.25, 0.475, -0.2);
    g.add(dr);
    scene.add(g);
    addObstacleAndCover(x + 0.25, z, y, 1.35, 0.85, 1.3, 2.0);
  }

  function placeLowWall(lv, x, z, len, rotY) {
    if (typeof scene === 'undefined' || typeof THREE === 'undefined') return;
    var T = THREE, mt = getMats(), y = sampleY(lv, x, z);
    var g = new T.Group();
    g.position.set(x, y, z);
    g.rotation.y = rotY || 0;
    var wall = new T.Mesh(new T.BoxGeometry(len, 1.08, 0.52), mt.stone);
    wall.position.y = 0.54;
    g.add(wall);
    var cap = new T.Mesh(new T.BoxGeometry(len + 0.12, 0.14, 0.62), mt.stone);
    cap.position.y = 1.12;
    g.add(cap);
    scene.add(g);
    var c = Math.abs(Math.cos(rotY || 0)), s = Math.abs(Math.sin(rotY || 0));
    addObstacleAndCover(x, z, y, c * len * 0.5 + s * 0.32, s * len * 0.5 + c * 0.32, 1.18, len * 0.5 + 0.8);
  }

  function enhanceTresCruces() {
    if (api.enhanced.karsk17 || typeof K17 === 'undefined' || !K17) return;
    api.enhanced.karsk17 = true;
    var Xk = typeof X17 !== 'undefined' ? X17 : 160000;

    // 1. Muros laterales de protección en pozos AT (cheek-walls) y traveses en zonas muertas
    var ats = K17.at || [];
    for (var i = 0; i < ats.length; i++) {
      var ax = Xk + ats[i].x;
      var az = ats[i].z;
      placeSandbagWall(17, ax - 3.6, az + 0.6, 2.6, Math.PI * 0.38, 3);
      placeSandbagWall(17, ax + 3.6, az + 0.6, 2.6, -Math.PI * 0.38, 3);
    }

    // 2. Pasos de alambrada claramente balizados en tierra de nadie (preservando K17.lanes y rutas de patrulla)
    var lanes = K17.lanes || [];
    var mt = getMats();
    if (mt && typeof scene !== 'undefined') {
      for (var l = 0; l < lanes.length; l++) {
        var lx = Xk + lanes[l].x;
        var lz = -225.5;
        var ly = sampleY(17, lx, lz);
        for (var s = -1; s <= 1; s += 2) {
          var post = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.35, 0.14), mt.whiteMark);
          post.position.set(lx + s * 2.4, ly + 0.68, lz);
          scene.add(post);
        }
        placeSandbagWall(17, lx - 3.8, -234.5, 2.1, 0.25, 2);
        placeSandbagWall(17, lx + 3.8, -234.5, 2.1, -0.25, 2);
      }
    }

    // 3. Coberturas en zonas muertas entre Tres Cruces y Barranco Sokol
    var deadZones = [[-82, -214], [-34, -212], [18, -214], [70, -216]];
    for (var d = 0; d < deadZones.length; d++) {
      placeCrateCluster(17, Xk + deadZones[d][0], deadZones[d][1], d * 0.6);
    }
  }

  function enhanceVarnholtFalkenbruck() {
    if (api.enhanced.varn18) return;
    api.enhanced.varn18 = true;
    var Xv = typeof X18 !== 'undefined' ? X18 : 200000;

    // Respetar corredores de >= 6 m libres en ejes viales (|x| > 5.5 m del eje central)
    var barricades = [
      { x: -16, z: -558, len: 4.2, ry: 0.2 },
      { x: 16, z: -568, len: 4.2, ry: -0.2 },
      { x: -24, z: -604, len: 4.5, ry: Math.PI / 2 - 0.15 },
      { x: 24, z: -618, len: 4.5, ry: Math.PI / 2 + 0.15 },
      { x: -12, z: -650, len: 3.8, ry: 0.3 },
      { x: 13, z: -662, len: 3.8, ry: -0.3 },
      { x: -34, z: -156, len: 4.4, ry: 0.1 },
      { x: 34, z: -162, len: 4.4, ry: -0.1 }
    ];
    for (var i = 0; i < barricades.length; i++) {
      var b = barricades[i];
      placeSandbagWall(18, Xv + b.x, b.z, b.len, b.ry, 3);
    }

    var clusters = [
      [-18, -540], [18, -546], [-28, -592], [28, -598],
      [-15, -638], [16, -644], [-45, -352], [32, -365]
    ];
    for (var c = 0; c < clusters.length; c++) {
      placeCrateCluster(18, Xv + clusters[c][0], clusters[c][1], c * 0.55);
    }

    // Muretes de patio lateral en Falkenbrück (flanqueo seguro)
    placeLowWall(18, Xv - 28, -578, 5.5, 0);
    placeLowWall(18, Xv + 28, -584, 5.5, 0);
  }

  function enhanceUrbanL13L14(lv) {
    if (lv === 13 && !api.enhanced.l13) {
      api.enhanced.l13 = true;
      var X13v = typeof X13 !== 'undefined' ? X13 : 40000;
      placeSandbagWall(13, X13v - 11, -175, 3.6, 0.25, 2);
      placeSandbagWall(13, X13v + 12, -260, 3.6, -0.25, 2);
      placeCrateCluster(13, X13v + 16, -196, 0.4);
      placeLowWall(13, X13v - 14, -310, 4.8, 0.15);
      placeSandbagWall(13, X13v - 12, -495, 4.0, 0.2, 3);
      placeSandbagWall(13, X13v + 24, -498, 4.0, -0.2, 3);
    }
    if (lv === 14 && !api.enhanced.l14) {
      api.enhanced.l14 = true;
      var X14v = typeof X14 !== 'undefined' ? X14 : 56000;
      placeLowWall(14, X14v - 12, -482, 4.6, 0.1);
      placeLowWall(14, X14v + 12, -512, 4.6, -0.1);
      placeSandbagWall(14, X14v - 14, -558, 4.0, 0.28, 3);
      placeSandbagWall(14, X14v + 14, -592, 4.0, -0.28, 3);
      placeCrateCluster(14, X14v - 11, -635, 0.35);
      placeCrateCluster(14, X14v + 11, -642, -0.45);
    }
  }

  function installArchHooks() {
    if (api._installed) return;
    api._installed = true;

    if (typeof window.buildKarsk17 === 'function' && !window.buildKarsk17._vgaiArch) {
      var _bk = window.buildKarsk17;
      window.buildKarsk17 = function () {
        var r = _bk.apply(this, arguments);
        try { enhanceTresCruces(); } catch (_) {}
        return r;
      };
      window.buildKarsk17._vgaiArch = true;
    }

    if (typeof window.buildVarn18 === 'function' && !window.buildVarn18._vgaiArch) {
      var _bv = window.buildVarn18;
      window.buildVarn18 = function () {
        var r = _bv.apply(this, arguments);
        try { enhanceVarnholtFalkenbruck(); } catch (_) {}
        return r;
      };
      window.buildVarn18._vgaiArch = true;
    }

    if (typeof window.build13 === 'function' && !window.build13._vgaiArch) {
      var _b13 = window.build13;
      window.build13 = function () {
        var r = _b13.apply(this, arguments);
        try { enhanceUrbanL13L14(13); } catch (_) {}
        return r;
      };
      window.build13._vgaiArch = true;
    }

    if (typeof window.build14 === 'function' && !window.build14._vgaiArch) {
      var _b14 = window.build14;
      window.build14 = function () {
        var r = _b14.apply(this, arguments);
        try { enhanceUrbanL13L14(14); } catch (_) {}
        return r;
      };
      window.build14._vgaiArch = true;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installArchHooks);
  } else {
    installArchHooks();
  }

  api.enhanceTresCruces = enhanceTresCruces;
  api.enhanceVarnholtFalkenbruck = enhanceVarnholtFalkenbruck;
  api.enhanceUrbanL13L14 = enhanceUrbanL13L14;
  window.LEVELS_ARCH_VGAI = api;
  window.AETH = window.AETH || {};
  window.AETH.vgai = window.AETH.vgai || {};
  window.AETH.vgai.levelsArch = api;
})(typeof window !== 'undefined' ? window : globalThis);
