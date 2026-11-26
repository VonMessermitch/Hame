/* ============================================================================
   V.GAI.1.0 · PUERTAS INTERACTIVAS (3 MODELOS) E INTERIORES FUNCIONALES (AGENTE 5)
   1) Acero remachado ('steel') · búnkeres, casamatas y almacenes militares
   2) Madera reforzada ('wood') · casas, refugios, estaciones y cabañas
   3) Madera con ventanales translúcidos ('wood_glass') · oficinas, viviendas
   Incluye:
   - Alturas de terreno reales (floor17, floor18, floorAt, cabina L12)
   - Supresión de hojas congeladas estáticas (casemate17/18, dug17/18, rail13)
   - Sincronía con cabina L12 (cdoor12) y L14
   - Colisionadores orientados en obstB + invalidación instantánea NV.sig=''
   - Protección anti-aprisionamiento (pushout) y uso [E] + IA auto-apertura/cierre
   ============================================================================ */
(function (root) {
  'use strict';

  var doorApi = {
    version: 'V.GAI.1.0',
    list: [],
    builtLevels: Object.create(null),
    propsByLevel: Object.create(null),
    activePromptDoor: null
  };

  function computeAABB(door) {
    if (root.CORE_VGAI && typeof root.CORE_VGAI.computeOrientedDoorAABB === 'function') {
      return root.CORE_VGAI.computeOrientedDoorAABB(door);
    }
    var c = Math.abs(Math.cos(door.ry || 0));
    var s = Math.abs(Math.sin(door.ry || 0));
    var w = door.width || 1.3;
    var th = door.thick || 0.18;
    return {
      x: door.x,
      z: door.z,
      hw: Math.max(0.12, c * (w * 0.5) + s * (th * 0.5)),
      hd: Math.max(0.12, s * (w * 0.5) + c * (th * 0.5))
    };
  }

  function toggleDoorCollider(door, obstBList, navObj) {
    if (!door || !Array.isArray(obstBList)) return false;
    var box = computeAABB(door);
    if (!door.collider) {
      door.collider = {
        x: box.x,
        z: box.z,
        hw: box.hw,
        hd: box.hd,
        y0: door.y || 0,
        h: (door.y || 0) + (door.height || 2.25),
        door: true
      };
    } else {
      door.collider.x = box.x;
      door.collider.z = box.z;
      door.collider.hw = box.hw;
      door.collider.hd = box.hd;
      door.collider.y0 = door.y || 0;
      door.collider.h = (door.y || 0) + (door.height || 2.25);
    }
    var idx = obstBList.indexOf(door.collider);
    var shouldBlock = !door.open && (Math.abs(door.angle || 0) < 0.45);
    if (shouldBlock && idx < 0) {
      obstBList.push(door.collider);
      if (navObj) navObj.sig = '';
      return true;
    } else if (!shouldBlock && idx >= 0) {
      obstBList.splice(idx, 1);
      if (navObj) navObj.sig = '';
      return true;
    }
    return false;
  }

  doorApi.toggleDoorCollider = toggleDoorCollider;

  root.DOORS_VGAI = doorApi;
  root.AETH = root.AETH || {};
  root.AETH.vgai = root.AETH.vgai || {};
  root.AETH.vgai.doors = doorApi;

  if (typeof document === 'undefined' || typeof window === 'undefined') return;

  var MATS = null;
  function getMats() {
    if (MATS || typeof THREE === 'undefined') return MATS;
    var T = THREE;
    MATS = {
      steelFrame: new T.MeshLambertMaterial({ color: 0x252826 }),
      steelBody: new T.MeshLambertMaterial({ color: 0x424844 }),
      steelTrim: new T.MeshLambertMaterial({ color: 0x5c645e }),
      brass: new T.MeshLambertMaterial({ color: 0xc8a458 }),
      woodFrame: new T.MeshLambertMaterial({ color: 0x3b2817 }),
      woodBody: new T.MeshLambertMaterial({ color: 0x62442a }),
      woodDark: new T.MeshLambertMaterial({ color: 0x49311d }),
      iron: new T.MeshLambertMaterial({ color: 0x242424 }),
      glass: new T.MeshPhongMaterial({
        color: 0x9ac6d8,
        emissive: 0x16242a,
        specular: 0xd8eef8,
        shininess: 85,
        transparent: true,
        opacity: 0.44,
        side: T.DoubleSide,
        depthWrite: false
      }),
      crate: new T.MeshLambertMaterial({ color: 0x5f4a2e }),
      lampGlow: new T.MeshBasicMaterial({ color: 0xffd27a })
    };
    return MATS;
  }

  function createDoorMesh(kind, width, height) {
    var T = THREE;
    var M = getMats();
    var rootG = new T.Group();
    var w = width || 1.3;
    var h = height || 2.2;
    var th = 0.08;

    var frameMat = kind === 'steel' ? M.steelFrame : M.woodFrame;
    var postGeo = new T.BoxGeometry(0.11, h + 0.06, 0.16);
    var pL = new T.Mesh(postGeo, frameMat); pL.position.set(-w / 2 - 0.055, h / 2, 0); rootG.add(pL);
    var pR = new T.Mesh(postGeo, frameMat); pR.position.set(w / 2 + 0.055, h / 2, 0); rootG.add(pR);
    var lintel = new T.Mesh(new T.BoxGeometry(w + 0.22, 0.12, 0.18), frameMat);
    lintel.position.set(0, h + 0.06, 0);
    rootG.add(lintel);

    var pivot = new T.Group();
    pivot.position.set(-w / 2, 0, 0);
    rootG.add(pivot);

    var leaf = new T.Group();
    leaf.position.set(w / 2, 0, 0);
    pivot.add(leaf);

    if (kind === 'steel') {
      var slab = new T.Mesh(new T.BoxGeometry(w, h, 0.10), M.steelBody);
      slab.position.y = h / 2;
      leaf.add(slab);
      var bar = new T.Mesh(new T.BoxGeometry(w * 0.88, 0.09, 0.13), M.steelTrim);
      bar.position.y = h * 0.5;
      leaf.add(bar);
      var rivGeo = new T.BoxGeometry(0.04, 0.04, 0.125);
      for (var ry = 0.25; ry < h - 0.15; ry += 0.45) {
        for (var rx = -w / 2 + 0.12; rx <= w / 2 - 0.1; rx += (w - 0.24) / 2) {
          var rv = new T.Mesh(rivGeo, M.steelTrim);
          rv.position.set(rx, ry, 0);
          leaf.add(rv);
        }
      }
      var handleS = new T.Mesh(new T.BoxGeometry(0.16, 0.06, 0.18), M.iron);
      handleS.position.set(w / 2 - 0.14, h * 0.47, 0);
      leaf.add(handleS);
    } else if (kind === 'wood_glass') {
      var bottom = new T.Mesh(new T.BoxGeometry(w, h * 0.44, th), M.woodBody);
      bottom.position.y = h * 0.22;
      leaf.add(bottom);
      var topRail = new T.Mesh(new T.BoxGeometry(w, 0.13, th), M.woodDark);
      topRail.position.y = h - 0.065;
      leaf.add(topRail);
      var stGeo = new T.BoxGeometry(0.11, h * 0.56, th);
      var stL = new T.Mesh(stGeo, M.woodDark); stL.position.set(-w / 2 + 0.055, h * 0.72, 0); leaf.add(stL);
      var stR = new T.Mesh(stGeo, M.woodDark); stR.position.set(w / 2 - 0.055, h * 0.72, 0); leaf.add(stR);
      var midV = new T.Mesh(new T.BoxGeometry(0.045, h * 0.48, th * 0.9), M.woodDark);
      midV.position.set(0, h * 0.70, 0);
      leaf.add(midV);
      var midH = new T.Mesh(new T.BoxGeometry(w - 0.18, 0.045, th * 0.9), M.woodDark);
      midH.position.set(0, h * 0.70, 0);
      leaf.add(midH);
      var pane = new T.Mesh(new T.BoxGeometry(w - 0.22, h * 0.46, 0.025), M.glass);
      pane.position.set(0, h * 0.70, 0);
      leaf.add(pane);
      var knobG = new T.Mesh(new T.BoxGeometry(0.13, 0.05, 0.15), M.brass);
      knobG.position.set(w / 2 - 0.12, h * 0.45, 0);
      leaf.add(knobG);
    } else {
      var wslab = new T.Mesh(new T.BoxGeometry(w, h, th), M.woodBody);
      wslab.position.y = h / 2;
      leaf.add(wslab);
      for (var p = -2; p <= 2; p++) {
        var seam = new T.Mesh(new T.BoxGeometry(0.02, h - 0.08, th + 0.012), M.woodDark);
        seam.position.set(p * (w / 5.4), h / 2, 0);
        leaf.add(seam);
      }
      var strap1 = new T.Mesh(new T.BoxGeometry(w * 0.72, 0.07, th + 0.02), M.iron);
      strap1.position.set(-w * 0.10, h * 0.76, 0);
      leaf.add(strap1);
      var strap2 = new T.Mesh(new T.BoxGeometry(w * 0.72, 0.07, th + 0.02), M.iron);
      strap2.position.set(-w * 0.10, h * 0.24, 0);
      leaf.add(strap2);
      var knobW = new T.Mesh(new T.BoxGeometry(0.13, 0.05, 0.15), M.brass);
      knobW.position.set(w / 2 - 0.12, h * 0.46, 0);
      leaf.add(knobW);
    }

    return { group: rootG, pivot: pivot };
  }

  function sampleDoorY(lv, x, z) {
    if (lv === 12 && Math.abs(z + 22) < 3) return 1.5;
    if ((lv === 18 || lv === 20) && typeof floor18 === 'function') {
      var Xv = typeof X18 !== 'undefined' ? X18 : 200000;
      return floor18(x - Xv, z) || 0;
    }
    if ((lv === 17 || lv === 19) && typeof floor17 === 'function') {
      var Xk = typeof X17 !== 'undefined' ? X17 : 160000;
      return floor17(x - Xk, z) || 0;
    }
    if (typeof floorAt === 'function') {
      return floorAt({ x: x, y: 0.2, z: z }) || 0;
    }
    return 0;
  }

  function overlapsDoorList(x, z) {
    for (var i = 0; i < doorApi.list.length; i++) {
      var d = doorApi.list[i];
      if (Math.hypot(d.x - x, d.z - z) < 1.05) return true;
    }
    return false;
  }

  function addDoor(spec) {
    if (typeof scene === 'undefined' || !scene || typeof THREE === 'undefined') return null;
    if (overlapsDoorList(spec.x, spec.z)) return null;

    var lv = spec.level || 0;
    var y = spec.y !== undefined ? spec.y : sampleDoorY(lv, spec.x, spec.z);
    var kind = spec.kind || 'wood';
    var w = spec.width || 1.32;
    var h = spec.height || 2.22;
    var ry = spec.ry || 0;
    var mesh = createDoorMesh(kind, w, h);
    mesh.group.position.set(spec.x, y, spec.z);
    mesh.group.rotation.y = ry;
    scene.add(mesh.group);

    var openInit = !!spec.open;
    var swing = spec.swing || 1;
    var targetA = openInit ? swing * 1.62 : 0;
    mesh.pivot.rotation.y = targetA;

    var entry = {
      id: spec.id || ('door_' + (doorApi.list.length + 1)),
      level: lv,
      kind: kind,
      label: kind === 'steel' ? 'puerta blindada' : (kind === 'wood_glass' ? 'puerta acristalada' : 'puerta de madera'),
      x: spec.x,
      y: y,
      z: spec.z,
      ry: ry,
      width: w,
      height: h,
      thick: 0.18,
      swing: swing,
      open: openInit,
      angle: targetA,
      targetAngle: targetA,
      aiTimer: 0,
      locked: !!spec.locked,
      group: mesh.group,
      pivot: mesh.pivot,
      collider: null,
      onToggle: spec.onToggle || null
    };

    if (typeof obstB !== 'undefined') {
      toggleDoorCollider(entry, obstB, typeof NV !== 'undefined' ? NV : null);
    }
    doorApi.list.push(entry);
    return entry;
  }

  function pushActorsOutOfDoor(door) {
    if (!door || !door.collider || !root.CORE_VGAI || typeof root.CORE_VGAI.computeDoorPinchPushout !== 'function') return;
    var checkUnit = function (pos, radius) {
      if (!pos) return;
      var push = root.CORE_VGAI.computeDoorPinchPushout(door, pos, radius);
      if (push) {
        pos.x += push.dx;
        pos.z += push.dz;
      }
    };
    if (typeof P !== 'undefined' && P && P.g) checkUnit(P.g.position, 0.52);
    var lists = [];
    if (typeof allies !== 'undefined') lists.push(allies);
    if (typeof enemies !== 'undefined') lists.push(enemies);
    if (typeof NPC11 !== 'undefined') lists.push(NPC11);
    if (typeof N19 !== 'undefined' && N19 && N19.sq) lists.push(N19.sq);
    if (typeof N20 !== 'undefined' && N20 && N20.sq) lists.push(N20.sq);
    for (var l = 0; l < lists.length; l++) {
      var arr = lists[l];
      if (!Array.isArray(arr)) continue;
      for (var i = 0; i < arr.length; i++) {
        var u = arr[i];
        if (u && u.g && u.g.visible) checkUnit(u.g.position, 0.48);
      }
    }
  }

  function setDoorOpen(door, shouldOpen, byAI) {
    if (!door || door.locked) return false;
    shouldOpen = !!shouldOpen;
    if (door.open === shouldOpen) return false;
    door.open = shouldOpen;
    door.targetAngle = shouldOpen ? door.swing * 1.62 : 0;
    door.aiTimer = (shouldOpen && byAI) ? 5.5 : 0;

    if (typeof obstB !== 'undefined') {
      toggleDoorCollider(door, obstB, typeof NV !== 'undefined' ? NV : null);
    }
    if (!shouldOpen) {
      pushActorsOutOfDoor(door);
    }
    if (typeof door.onToggle === 'function') {
      try { door.onToggle(shouldOpen, door); } catch (_) {}
    }
    if (window.AUDIO_VGAI && typeof window.AUDIO_VGAI.playDoor === 'function') {
      window.AUDIO_VGAI.playDoor(door.kind, shouldOpen, door.x, door.z);
    }
    return true;
  }

  function populateInterior(lv, cx, cz, ry, items) {
    if (typeof scene === 'undefined' || !scene || typeof THREE === 'undefined') return;
    var T = THREE, M = getMats();
    var g = new T.Group();
    var fy = sampleDoorY(lv, cx, cz);
    g.position.set(cx, fy, cz);
    g.rotation.y = ry || 0;
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      if (it.t === 'table') {
        var top = new T.Mesh(new T.BoxGeometry(1.7, 0.08, 0.9), M.woodBody);
        top.position.set(it.x, 0.78, it.z);
        g.add(top);
        for (var lx = -0.7; lx <= 0.7; lx += 1.4) {
          for (var lz = -0.35; lz <= 0.35; lz += 0.7) {
            var leg = new T.Mesh(new T.BoxGeometry(0.08, 0.78, 0.08), M.woodDark);
            leg.position.set(it.x + lx, 0.39, it.z + lz);
            g.add(leg);
          }
        }
        var lmp = new T.Mesh(new T.BoxGeometry(0.18, 0.24, 0.18), M.lampGlow);
        lmp.position.set(it.x + 0.35, 0.94, it.z);
        g.add(lmp);
      } else if (it.t === 'crate') {
        var cr = new T.Mesh(new T.BoxGeometry(0.8, 0.65, 0.8), M.crate);
        cr.position.set(it.x, 0.325, it.z);
        g.add(cr);
      } else if (it.t === 'bunk') {
        var bed = new T.Mesh(new T.BoxGeometry(1.9, 0.22, 0.85), M.woodDark);
        bed.position.set(it.x, 0.45, it.z);
        g.add(bed);
        var mat = new T.Mesh(new T.BoxGeometry(1.8, 0.12, 0.78), M.steelTrim);
        mat.position.set(it.x, 0.60, it.z);
        g.add(mat);
      }
    }
    scene.add(g);
    (doorApi.propsByLevel[lv] || (doorApi.propsByLevel[lv] = [])).push(g);
  }

  // Suprimir hojas de puertas estáticas fusionadas en Karsk (17) y Varnholt (18) antes de build
  function installFrozenLeafSuppressors() {
    if (doorApi._leafSuppressors) return;
    doorApi._leafSuppressors = true;

    function wrapBuilder(fnName, bxName, isFrozenFn) {
      if (typeof window[fnName] !== 'function' || window[fnName]._vgaiNoLeaf) return;
      var orig = window[fnName];
      window[fnName] = function () {
        var origBx = window[bxName];
        if (typeof origBx === 'function') {
          window[bxName] = function (w, h, d, c, x, y, z, rx, ry, rz, m) {
            if (isFrozenFn(w, h, d, ry)) return;
            return origBx.apply(this, arguments);
          };
        }
        try {
          return orig.apply(this, arguments);
        } finally {
          if (typeof origBx === 'function') window[bxName] = origBx;
        }
      };
      window[fnName]._vgaiNoLeaf = true;
    }

    var isCasemateLeaf = function (w, h, d, ry) {
      return Math.abs(w - 1.4) < 0.1 && Math.abs(h - 2.2) < 0.1 && Math.abs(d - 0.12) < 0.05 && Math.abs((ry || 0) - 1.8) < 0.08;
    };
    var isDugoutLeaf = function (w, h, d) {
      return Math.abs(w - 1.5) < 0.1 && Math.abs(h - 2.1) < 0.1 && Math.abs(d - 0.12) < 0.05;
    };

    wrapBuilder('casemate17', 'bx17', isCasemateLeaf);
    wrapBuilder('dug17', 'bx17', isDugoutLeaf);
    wrapBuilder('casemate18', 'bx18', isCasemateLeaf);
    wrapBuilder('dug18', 'bx18', isDugoutLeaf);
  }

  function cleanL13StaticLeaves() {
    if (typeof scene === 'undefined' || !scene) return;
    var X13v = typeof X13 !== 'undefined' ? X13 : 40000;
    var targets = [
      { x: X13v - 25 + 1.32, z: -524 - 3.95 },
      { x: X13v + 45 + 1.32, z: -524 - 3.95 }
    ];
    for (var i = scene.children.length - 1; i >= 0; i--) {
      var obj = scene.children[i];
      if (!obj || !obj.position) continue;
      for (var t = 0; t < targets.length; t++) {
        if (Math.hypot(obj.position.x - targets[t].x, obj.position.z - targets[t].z) < 0.45 && Math.abs(obj.rotation.y - 1.8) < 0.15) {
          obj.visible = false;
        }
      }
    }
  }

  function ensureDoorsForLevel(lv) {
    if (doorApi.builtLevels[lv]) return;
    doorApi.builtLevels[lv] = true;

    // Nivel 11 · Campamento (edificios reales de build11)
    if (lv === 11) {
      var X11v = typeof X11 !== 'undefined' ? X11 : 27000;
      addDoor({ id: 'l11_hq_door', level: 11, kind: 'wood_glass', x: X11v, z: -23.4, width: 1.4, ry: 0 });
      addDoor({ id: 'l11_sta_door', level: 11, kind: 'wood_glass', x: X11v - 38, z: 38.6, width: 1.35, ry: 0 });
      addDoor({ id: 'l11_bar1', level: 11, kind: 'wood', x: X11v - 30, z: -2.9, width: 1.35, ry: 0 });
      addDoor({ id: 'l11_bar2', level: 11, kind: 'wood', x: X11v + 30, z: -2.9, width: 1.35, ry: 0 });
      addDoor({ id: 'l11_bunk_door', level: 11, kind: 'steel', x: X11v - 18, z: -48, width: 1.4, ry: 0 });
      populateInterior(11, X11v, -26, 0, [{ t: 'table', x: 0, z: 0 }, { t: 'crate', x: 2.2, z: -1 }]);
    }

    // Nivel 12 · Cabina del Cepelín Kaiser (sincronizada con cdoor12)
    if (lv === 12) {
      var X12v = typeof X12 !== 'undefined' ? X12 : 33000;
      if (typeof ZEP12 !== 'undefined' && ZEP12 && ZEP12.G && ZEP12.G.cdoor && ZEP12.G.cdoor.dp) {
        ZEP12.G.cdoor.dp.visible = false;
        var cabIdx = typeof obstB !== 'undefined' ? obstB.indexOf(ZEP12.G.cdoor.ob) : -1;
        if (cabIdx >= 0) obstB.splice(cabIdx, 1);
      }
      addDoor({
        id: 'l12_cockpit_door',
        level: 12,
        kind: 'wood_glass',
        x: X12v,
        y: 1.5,
        z: -22.0,
        width: 1.4,
        height: 2.25,
        ry: 0,
        open: typeof ZEP12 !== 'undefined' && ZEP12 && ZEP12.G && ZEP12.G.cdoor ? !!ZEP12.G.cdoor.open : false,
        onToggle: function (open) {
          if (typeof ZEP12 !== 'undefined' && ZEP12 && ZEP12.G && ZEP12.G.cdoor) ZEP12.G.cdoor.open = open;
        }
      });
    }

    // Nivel 13 · Granja, granero y casamatas ferroviarias
    if (lv === 13) {
      cleanL13StaticLeaves();
      var X13v = typeof X13 !== 'undefined' ? X13 : 40000;
      addDoor({ id: 'l13_barn_door', level: 13, kind: 'wood', x: X13v + 30, z: -182.0, width: 1.8, ry: 0, open: true });
      addDoor({ id: 'l13_casa_door', level: 13, kind: 'wood_glass', x: X13v - 18, z: -287.5, width: 1.5, ry: 0 });
      addDoor({ id: 'l13_bunk_door', level: 13, kind: 'steel', x: X13v + 10, z: -526.0, width: 1.45, ry: 0 });
      addDoor({ id: 'l13_case_w', level: 13, kind: 'steel', x: X13v - 23, z: -527.92, width: 1.4, ry: 0, open: true });
      addDoor({ id: 'l13_case_e', level: 13, kind: 'steel', x: X13v + 47, z: -527.92, width: 1.4, ry: 0, open: true });
      populateInterior(13, X13v + 30, -189, 0, [{ t: 'crate', x: -2.2, z: 0 }, { t: 'table', x: 1.8, z: -1.5 }]);
    }

    // Nivel 14 · Ciudad y palacio
    if (lv === 14) {
      var X14v = typeof X14 !== 'undefined' ? X14 : 56000;
      addDoor({ id: 'l14_apt_back', level: 14, kind: 'wood_glass', x: X14v, z: -459.4, width: 1.6, ry: 0, open: true });
      addDoor({ id: 'l14_gate_side', level: 14, kind: 'steel', x: X14v + 6.2, z: -674.7, width: 1.5, ry: 0 });
      addDoor({ id: 'l14_street_w', level: 14, kind: 'wood', x: X14v - 18, z: -520, width: 1.35, ry: Math.PI / 2 });
      addDoor({ id: 'l14_street_e', level: 14, kind: 'wood', x: X14v + 18, z: -580, width: 1.35, ry: Math.PI / 2 });
    }

    // Karsk (Niveles 17 & 19)
    if (lv === 17 || lv === 19) {
      var Xk = typeof X17 !== 'undefined' ? X17 : 160000;
      var casemates = (typeof K17 !== 'undefined' && K17 && K17.casemates && K17.casemates.length)
        ? K17.casemates
        : [{ x: -99, z: -237.8 }, { x: -27, z: -237.8 }, { x: 89, z: -237.8 }];
      for (var c = 0; c < casemates.length; c++) {
        addDoor({
          id: 'karsk_cm_' + c,
          level: lv,
          kind: 'steel',
          x: Xk + casemates[c].x + 2,
          z: casemates[c].z - 3.92,
          width: 1.4,
          ry: 0,
          open: true
        });
      }
      var dugouts = (typeof K17 !== 'undefined' && K17 && K17.dugouts && K17.dugouts.length)
        ? K17.dugouts
        : [{ x: -104, z: -251 }, { x: -58, z: -251 }, { x: -30, z: -251 }, { x: 14, z: -251 }, { x: 44, z: -251 }, { x: 98, z: -251 }];
      for (var dg = 0; dg < dugouts.length; dg++) {
        addDoor({
          id: 'karsk_dug_' + dg,
          level: lv,
          kind: 'wood',
          x: Xk + dugouts[dg].x,
          z: dugouts[dg].z - 0.08,
          width: 1.5,
          ry: 0,
          open: dg !== 1 && dg !== 5
        });
      }
      if (typeof K17 !== 'undefined' && K17 && K17.north && K17.north.bunkers) {
        for (var nb = 0; nb < K17.north.bunkers.length; nb++) {
          var bk = K17.north.bunkers[nb];
          addDoor({
            id: 'karsk_nb_' + nb,
            level: lv,
            kind: 'steel',
            x: Xk + bk.x + 2,
            z: bk.z - 3.92,
            width: 1.4,
            ry: 0,
            open: true
          });
        }
      }
      addDoor({ id: 'karsk_sta_door', level: lv, kind: 'wood_glass', x: Xk - 29.5, z: -482, width: 1.5, ry: Math.PI / 2 });
      addDoor({ id: 'karsk_pump_s', level: lv, kind: 'steel', x: Xk + 20, z: -601, width: 1.4, ry: 0 });
      populateInterior(lv, Xk - 18, -210, 0, [{ t: 'table', x: -1.5, z: 0 }, { t: 'crate', x: 2.2, z: 1.4 }, { t: 'bunk', x: 2.0, z: -1.8 }]);
      populateInterior(lv, Xk + 22, -604, 0, [{ t: 'table', x: 0, z: 0 }, { t: 'crate', x: -2.0, z: -1.4 }, { t: 'crate', x: 2.0, z: 1.2 }]);
    }

    // Varnholt (Niveles 18 & 20)
    if (lv === 18 || lv === 20) {
      var Xv = typeof X18 !== 'undefined' ? X18 : 200000;
      var vCasemates = (typeof K18 !== 'undefined' && K18 && K18.casemates && K18.casemates.length)
        ? K18.casemates
        : [{ x: -115, z: -203 }, { x: -5, z: -205 }, { x: 110, z: -203 }];
      for (var vc = 0; vc < vCasemates.length; vc++) {
        addDoor({
          id: 'varn_cm_' + vc,
          level: lv,
          kind: 'steel',
          x: Xv + vCasemates[vc].x + 2,
          z: vCasemates[vc].z - 3.92,
          width: 1.4,
          ry: 0,
          open: true
        });
      }
      var vDugouts = [{ x: -160, z: -244 }, { x: -70, z: -245 }, { x: -25, z: -246 }, { x: -40, z: -392 }];
      for (var vd = 0; vd < vDugouts.length; vd++) {
        addDoor({
          id: 'varn_dug_' + vd,
          level: lv,
          kind: 'wood',
          x: Xv + vDugouts[vd].x,
          z: vDugouts[vd].z - 0.08,
          width: 1.5,
          ry: 0,
          open: vd !== 2
        });
      }
      addDoor({ id: 'varn_cabin_s', level: lv, kind: 'wood', x: Xv - 74, z: -1.5, width: 1.25, ry: 0 });
      addDoor({ id: 'varn_farm_s', level: lv, kind: 'wood_glass', x: Xv - 70, z: -362.5, width: 1.4, ry: 0 });
      addDoor({ id: 'varn_falk_town', level: lv, kind: 'wood_glass', x: Xv - 18, z: -586, width: 1.5, ry: Math.PI / 2 });
      addDoor({ id: 'varn_air_hut', level: lv, kind: 'wood_glass', x: Xv + 240, z: -626, width: 1.2, ry: 0 });
      populateInterior(lv, Xv - 74, -5, 0, [{ t: 'table', x: 0, z: 0 }, { t: 'bunk', x: -2.0, z: -1.3 }, { t: 'crate', x: 2.0, z: 1.0 }]);
      populateInterior(lv, Xv - 70, -368, 0, [{ t: 'table', x: 1.4, z: 0.3 }, { t: 'crate', x: -3.0, z: -1.4 }, { t: 'bunk', x: -2.8, z: 1.6 }]);
    }
  }

  function findNearDoor(x, z, maxD) {
    var lv = typeof level !== 'undefined' ? level : -1;
    var best = null, bd = maxD || 2.9;
    for (var i = 0; i < doorApi.list.length; i++) {
      var d = doorApi.list[i];
      if (d.level !== lv) continue;
      var dist = Math.hypot(d.x - x, d.z - z);
      if (dist < bd) { bd = dist; best = d; }
    }
    return best;
  }

  function checkNpcNearDoor(d) {
    var lists = [];
    if (typeof allies !== 'undefined') lists.push(allies);
    if (typeof enemies !== 'undefined') lists.push(enemies);
    if (typeof NPC11 !== 'undefined') lists.push(NPC11);
    if (typeof N19 !== 'undefined' && N19 && N19.sq) lists.push(N19.sq);
    if (typeof N20 !== 'undefined' && N20 && N20.sq) lists.push(N20.sq);
    for (var l = 0; l < lists.length; l++) {
      var arr = lists[l];
      if (!Array.isArray(arr)) continue;
      for (var j = 0; j < arr.length; j++) {
        var u = arr[j];
        if (!u || !u.g || !u.g.visible || (u.hp !== undefined && u.hp <= 0)) continue;
        if (Math.hypot(u.g.position.x - d.x, u.g.position.z - d.z) < 2.35) return true;
      }
    }
    return false;
  }

  function updateDoors(dt) {
    var lv = typeof level !== 'undefined' ? level : -1;
    if (typeof playing !== 'undefined' && playing) ensureDoorsForLevel(lv);

    var pp = typeof P !== 'undefined' && P && P.g ? P.g.position : null;
    doorApi.activePromptDoor = pp ? findNearDoor(pp.x, pp.z, 2.95) : null;

    if (doorApi.activePromptDoor && typeof $ === 'function') {
      var prEl = $('pr');
      if (prEl && !prEl.textContent) {
        prEl.textContent = (doorApi.activePromptDoor.open ? '[E] Cerrar ' : '[E] Abrir ') + doorApi.activePromptDoor.label;
      }
    }

    for (var i = 0; i < doorApi.list.length; i++) {
      var d = doorApi.list[i];
      if (d.level !== lv) {
        if (d.group.visible) d.group.visible = false;
        continue;
      }
      if (!d.group.visible) d.group.visible = true;

      var diff = d.targetAngle - d.angle;
      if (Math.abs(diff) > 0.005) {
        d.angle += diff * Math.min(1, (dt || 0.016) * 10);
        d.pivot.rotation.y = d.angle;
        if (typeof obstB !== 'undefined') toggleDoorCollider(d, obstB, typeof NV !== 'undefined' ? NV : null);
      }

      var npcNear = checkNpcNearDoor(d);
      if (npcNear && !d.open && !d.locked) {
        setDoorOpen(d, true, true);
      } else if (d.aiTimer > 0) {
        d.aiTimer -= (dt || 0.016);
        var playerClose = pp && Math.hypot(pp.x - d.x, pp.z - d.z) < 2.35;
        if (d.aiTimer <= 0 && !npcNear && !playerClose && d.open) {
          setDoorOpen(d, false, true);
        }
      }
    }
  }

  function installDoorHooks() {
    if (doorApi._installed) return;
    doorApi._installed = true;
    installFrozenLeafSuppressors();

    if (typeof window.cdoor12 === 'function' && !window.cdoor12._vgaiDoors) {
      var _cd12 = window.cdoor12;
      window.cdoor12 = function (open) {
        var r = _cd12.apply(this, arguments);
        for (var i = 0; i < doorApi.list.length; i++) {
          if (doorApi.list[i].id === 'l12_cockpit_door') {
            setDoorOpen(doorApi.list[i], !!open, false);
          }
        }
        return r;
      };
      window.cdoor12._vgaiDoors = true;
    }

    if (typeof window.interact === 'function' && !window.interact._vgaiDoors) {
      var _int = window.interact;
      window.interact = function () {
        try {
          if (typeof P !== 'undefined' && P && P.g && !P.veh && !P.mg) {
            var nd = findNearDoor(P.g.position.x, P.g.position.z, 2.95);
            if (nd && setDoorOpen(nd, !nd.open, false)) return;
          }
        } catch (_) {}
        return _int.apply(this, arguments);
      };
      window.interact._vgaiDoors = true;
    }

    if (typeof window.update === 'function' && !window.update._vgaiDoors) {
      var _upd = window.update;
      window.update = function (dt) {
        var r = _upd.apply(this, arguments);
        try { updateDoors(dt); } catch (_) {}
        return r;
      };
      window.update._vgaiDoors = true;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installDoorHooks);
  } else {
    installDoorHooks();
  }

  doorApi.create = createDoorMesh;
  doorApi.addDoor = addDoor;
  doorApi.setDoorOpen = setDoorOpen;
  doorApi.ensureDoorsForLevel = ensureDoorsForLevel;
  doorApi.populateInterior = populateInterior;
  doorApi.updateDoors = updateDoors;
  doorApi.sampleDoorY = sampleDoorY;
})(typeof window !== 'undefined' ? window : globalThis);
