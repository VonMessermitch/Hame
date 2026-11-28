/* =============================================================================
   v50 · PUERTAS EN TODOS LOS EDIFICIOS (niveles 1–20)  ·  doors_all_v50.js
   Extiende las puertas interactivas de V.GAI (vGAI/src/doors_vgai.js) a todos los
   edificios con vano o puerta pintada, con las mismas 3 familias:
     steel      · búnkeres, casamatas, depósitos, edificios militares de hormigón
     wood       · casas comunes, cabañas, graneros, barracas, talleres, iglesias
     wood_glass · viviendas urbanas, oficinas, estaciones, granjas de dos plantas, palacio
   Dos modos:
     'int'  · vano real hacia un interior transitable → puerta interactiva [E], colisión
              orientada en obstB (+ NV.sig=''), apertura automática por la IA y autocierre.
     'deco' · puerta pintada sobre fachada maciza → hoja cerrada al ras de la fachada,
              sin colisión ni interacción (nunca abre hacia geometría sólida).
   Detección: envolturas de los constructores (house, bldg, door22, door31_12, door14,
   house17/18 → door17/door18, casemate17/18, dug17/18, gable16, block16, church31) y un
   detector genérico de puertas pintadas (box/pBox oscuros con tamaño de puerta, al ras
   del suelo) cuya orientación se resuelve contra obstB.
   Rendimiento: creación perezosa e incremental (≤40 candidatos por fotograma), marcos y
   puertas decorativas fusionados en una malla por familia y celda de 160 m, una malla por
   hoja interactiva, conjunto activo (≤48 m) recalculado 2 veces por segundo, IA revisada
   por turnos (≤6 puertas por fotograma), cero asignaciones por fotograma en el bucle.
   No duplica puertas de V.GAI (radio 1.05 m) y ajusta al vano real las de V.GAI que
   quedaron desplazadas (p. ej. granja de Varnholt).
   ============================================================================= */
(function () {
  'use strict';
  if (typeof window === 'undefined') return;
  var W = window;

  var DA = {
    version: 'v50.1',
    cand: [],          // candidatos registrados por los constructores
    done: 0,           // candidatos ya procesados
    list: [],          // puertas interactivas propias
    deco: 0,
    decoList: [],
    batches: [],
    stats: {},         // stats[lv][mode+':'+kind]
    skipped: { dup: 0, noface: 0, wide: 0, vgai_snap: 0 },
    activeList: [],
    prompt: null
  };
  W.DOORS_ALL_V50 = DA;
  W.AETH = W.AETH || {}; W.AETH.v50 = W.AETH.v50 || {}; W.AETH.v50.doors = DA;

  var PI = Math.PI, HP = Math.PI / 2;
  var explicitDepth = 0;   // >0 mientras corre un constructor envuelto (silencia el detector genérico)

  function lvNow() { return typeof level !== 'undefined' ? level : 0; }
  function num(v, d) { return (typeof v === 'number' && isFinite(v)) ? v : d; }

  /* ------------------------------------------------------------------ registro */
  function reg(c) {
    if (!c || !isFinite(c.x) || !isFinite(c.z)) return;
    c.lv = lvNow();
    c.y = num(c.y, 0);
    c.ry = num(c.ry, 0);
    c.w = num(c.w, 1.3);
    c.h = num(c.h, 2.2);
    c.prio = c.mode === 'gen' ? 1 : 0;
    DA.cand.push(c);
  }

  /* ------------------------------------------------------------------ materiales y geometría */
  var C = {
    steelFrame: 0x252826, steelBody: 0x424844, steelTrim: 0x5c645e, brass: 0xc8a458,
    woodFrame: 0x3b2817, woodBody: 0x62442a, woodDark: 0x49311d, iron: 0x242424
  };
  var MAT = null, GLASS = null, TPL = null, _m4 = null, _q = null, _v = null, _s = null, _col = null, _nm = null, _yAx = null;
  function initGfx() {
    if (MAT || typeof THREE === 'undefined') return !!MAT;
    var T = THREE;
    MAT = new T.MeshLambertMaterial({ vertexColors: true });
    GLASS = new T.MeshPhongMaterial({ color: 0x9ac6d8, emissive: 0x16242a, specular: 0xd8eef8, shininess: 85,
      transparent: true, opacity: 0.44, side: T.DoubleSide, depthWrite: false });
    var bg = new T.BoxGeometry(1, 1, 1);
    TPL = { p: bg.attributes.position.array, n: bg.attributes.normal.array, i: bg.index.array };
    _m4 = new T.Matrix4(); _q = new T.Quaternion(); _v = new T.Vector3(); _s = new T.Vector3(1, 1, 1);
    _col = new T.Color(); _nm = new T.Matrix3(); _yAx = new T.Vector3(0, 1, 0);
    return true;
  }
  function GB() { return { p: [], n: [], c: [], i: [], nv: 0 }; }
  // caja (w,h,d) centrada en (x,y,z) del marco local; marco local → mundo: traslación (ox,oy,oz) + giro ry
  function gbBox(g, w, h, d, col, x, y, z, ox, oy, oz, ry) {
    var cs = Math.cos(ry), sn = Math.sin(ry);
    _col.setHex(col);
    var base = g.nv, P = TPL.p, N = TPL.n, I = TPL.i;
    for (var k = 0; k < 24; k++) {
      var lx = P[k * 3] * w + x, ly = P[k * 3 + 1] * h + y, lz = P[k * 3 + 2] * d + z;
      g.p.push(ox + lx * cs + lz * sn, oy + ly, oz - lx * sn + lz * cs);
      var nx = N[k * 3], ny = N[k * 3 + 1], nz = N[k * 3 + 2];
      g.n.push(nx * cs + nz * sn, ny, -nx * sn + nz * cs);
      g.c.push(_col.r, _col.g, _col.b);
    }
    for (var j = 0; j < 36; j++) g.i.push(base + I[j]);
    g.nv += 24;
  }
  function gbMesh(g, mat) {
    if (!g.nv) return null;
    var T = THREE, geo = new T.BufferGeometry();
    geo.setAttribute('position', new T.Float32BufferAttribute(g.p, 3));
    geo.setAttribute('normal', new T.Float32BufferAttribute(g.n, 3));
    geo.setAttribute('color', new T.Float32BufferAttribute(g.c, 3));
    geo.setIndex(g.nv > 65000 ? new T.Uint32BufferAttribute(g.i, 1) : new T.Uint16BufferAttribute(g.i, 1));
    geo.computeBoundingSphere();
    var m = new T.Mesh(geo, mat);
    m.matrixAutoUpdate = false; m.updateMatrix();
    return m;
  }

  /* marco (en coordenadas del centro de la puerta) */
  function frameBoxes(g, kind, w, h, ox, oy, oz, ry) {
    var fc = kind === 'steel' ? C.steelFrame : C.woodFrame;
    gbBox(g, 0.11, h + 0.06, 0.16, fc, -w / 2 - 0.055, (h + 0.06) / 2, 0, ox, oy, oz, ry);
    gbBox(g, 0.11, h + 0.06, 0.16, fc, w / 2 + 0.055, (h + 0.06) / 2, 0, ox, oy, oz, ry);
    gbBox(g, w + 0.22, 0.12, 0.18, fc, 0, h + 0.06, 0, ox, oy, oz, ry);
  }
  /* hoja en coordenadas de bisagra: se extiende de 0 a m*lw (m = ±1) */
  function leafBoxes(g, gg, kind, lw, h, m, ox, oy, oz, ry) {
    var cx = m * lw / 2, th = 0.08, hk = m * (lw - 0.13); // posición del pomo
    if (kind === 'steel') {
      gbBox(g, lw, h, 0.10, C.steelBody, cx, h / 2, 0, ox, oy, oz, ry);
      gbBox(g, lw * 0.88, 0.09, 0.13, C.steelTrim, cx, h * 0.5, 0, ox, oy, oz, ry);
      for (var yy = 0.25; yy < h - 0.15; yy += 0.45) {
        for (var r = 0; r < 3; r++) gbBox(g, 0.04, 0.04, 0.125, C.steelTrim, m * (0.12 + r * (lw - 0.24) / 2), yy, 0, ox, oy, oz, ry);
      }
      gbBox(g, 0.16, 0.06, 0.18, C.iron, hk, h * 0.47, 0, ox, oy, oz, ry);
    } else if (kind === 'wood_glass') {
      gbBox(g, lw, h * 0.44, th, C.woodBody, cx, h * 0.22, 0, ox, oy, oz, ry);
      gbBox(g, lw, 0.13, th, C.woodDark, cx, h - 0.065, 0, ox, oy, oz, ry);
      gbBox(g, 0.11, h * 0.56, th, C.woodDark, m * 0.055, h * 0.72, 0, ox, oy, oz, ry);
      gbBox(g, 0.11, h * 0.56, th, C.woodDark, m * (lw - 0.055), h * 0.72, 0, ox, oy, oz, ry);
      gbBox(g, 0.045, h * 0.48, th * 0.9, C.woodDark, cx, h * 0.70, 0, ox, oy, oz, ry);
      gbBox(g, lw - 0.18, 0.045, th * 0.9, C.woodDark, cx, h * 0.70, 0, ox, oy, oz, ry);
      gbBox(gg, lw - 0.22, h * 0.46, 0.025, 0xffffff, cx, h * 0.70, 0, ox, oy, oz, ry);
      gbBox(g, 0.13, 0.05, 0.15, C.brass, hk, h * 0.45, 0, ox, oy, oz, ry);
    } else {
      gbBox(g, lw, h, th, C.woodBody, cx, h / 2, 0, ox, oy, oz, ry);
      var ns = Math.max(2, Math.round(lw / 0.27));
      for (var p = 1; p < ns; p++) gbBox(g, 0.02, h - 0.08, th + 0.012, C.woodDark, m * (p * lw / ns), h / 2, 0, ox, oy, oz, ry);
      gbBox(g, lw * 0.72, 0.07, th + 0.02, C.iron, m * lw * 0.40, h * 0.76, 0, ox, oy, oz, ry);
      gbBox(g, lw * 0.72, 0.07, th + 0.02, C.iron, m * lw * 0.40, h * 0.24, 0, ox, oy, oz, ry);
      gbBox(g, 0.13, 0.05, 0.15, C.brass, hk, h * 0.46, 0, ox, oy, oz, ry);
    }
  }

  /* lotes estáticos fusionados por familia y celda de 160 m (marcos + puertas decorativas) */
  var pend = {};
  function batchFor(x, z) {
    var key = Math.floor(x / 160) + ',' + Math.floor(z / 160);
    return pend[key] || (pend[key] = { g: GB(), gg: GB() });
  }
  function flushBatches() {
    for (var k in pend) {
      var b = pend[k];
      var m = gbMesh(b.g, MAT); if (m) { m.name = 'doors50_batch'; scene.add(m); DA.batches.push(m); }
      var mg = gbMesh(b.gg, GLASS); if (mg) { mg.name = 'doors50_glass'; mg.renderOrder = 2; scene.add(mg); DA.batches.push(mg); }
    }
    pend = {};
  }

  /* ------------------------------------------------------------------ utilidades de mundo */
  function vgaiList() { return (W.DOORS_VGAI && W.DOORS_VGAI.list) || []; }
  function nearExisting(x, z, r, y) {
    var L = vgaiList(), i;
    y = y || 0;
    for (i = 0; i < L.length; i++) if (Math.abs((L[i].y || 0) - y) < 1.5 && Math.abs(L[i].x - x) < r && Math.abs(L[i].z - z) < r && Math.hypot(L[i].x - x, L[i].z - z) < r) return L[i];
    for (i = 0; i < placed.length; i++) { var p = placed[i]; if (Math.abs(p[2] - y) < 1.5 && Math.abs(p[0] - x) < r && Math.abs(p[1] - z) < r && Math.hypot(p[0] - x, p[1] - z) < r) return p; }
    return null;
  }
  var placed = []; // [x,z] de todas las puertas propias (int y deco)

  function insideSolid(x, z) {
    if (typeof obstB === 'undefined') return false;
    for (var i = 0; i < obstB.length; i++) {
      var b = obstB[i];
      if (!b || b.door || b.step || (b.y0 || 0) > 0.5 || (b.h - (b.y0 || 0)) < 1.6) continue;
      if (Math.abs(x - b.x) < b.hw && Math.abs(z - b.z) < b.hd) return true;
    }
    return false;
  }

  function addStat(lv, mode, kind) {
    var s = DA.stats[lv] || (DA.stats[lv] = {});
    var k = mode + ':' + kind; s[k] = (s[k] || 0) + 1;
  }

  /* ------------------------------------------------------------------ creación */
  var OPEN_A = 1.62;
  function makeDeco(c) {
    var b = batchFor(c.x, c.z), w = c.w, h = c.h;
    frameBoxes(b.g, c.kind, w, h, c.x, c.y, c.z, c.ry);
    if (c.dbl) {
      leafBoxes(b.g, b.gg, c.kind, w / 2, h, 1, c.x - (w / 2) * Math.cos(c.ry), c.y, c.z + (w / 2) * Math.sin(c.ry), c.ry);
      leafBoxes(b.g, b.gg, c.kind, w / 2, h, -1, c.x + (w / 2) * Math.cos(c.ry), c.y, c.z - (w / 2) * Math.sin(c.ry), c.ry);
    } else {
      leafBoxes(b.g, b.gg, c.kind, w, h, 1, c.x - (w / 2) * Math.cos(c.ry), c.y, c.z + (w / 2) * Math.sin(c.ry), c.ry);
    }
    placed.push([c.x, c.z, c.y]);
    DA.decoList.push({ x: c.x, y: c.y, z: c.z, ry: c.ry, kind: c.kind, src: c.src, lv: c.lv, w: c.w });
    DA.deco++;
    addStat(c.lv, 'deco', c.kind);
  }

  function makeLeafPivot(kind, lw, h, m, hx, y, hz, ry) {
    var T = THREE, pv = new T.Group();
    pv.position.set(hx, y, hz); pv.rotation.y = ry;
    var g = GB(), gg = GB();
    leafBoxes(g, gg, kind, lw, h, m, 0, 0, 0, 0);
    var lm = gbMesh(g, MAT); lm.matrixAutoUpdate = false; pv.add(lm);
    if (gg.nv) { var gm = gbMesh(gg, GLASS); gm.renderOrder = 2; pv.add(gm); }
    pv.name = 'doors50_leaf';
    scene.add(pv);
    return pv;
  }

  function closedBox(d) {
    var c = Math.abs(Math.cos(d.ry)), s = Math.abs(Math.sin(d.ry)), th = 0.2;
    return { hw: Math.max(0.12, c * d.w / 2 + s * th / 2), hd: Math.max(0.12, s * d.w / 2 + c * th / 2) };
  }

  function makeInt(c) {
    var b = batchFor(c.x, c.z), w = c.w, h = c.h, cs = Math.cos(c.ry), sn = Math.sin(c.ry);
    frameBoxes(b.g, c.kind, w, h, c.x, c.y, c.z, c.ry);
    var d = {
      id: 'd50_' + DA.list.length, lv: c.lv, kind: c.kind, src: c.src,
      label: c.kind === 'steel' ? 'puerta blindada' : (c.kind === 'wood_glass' ? 'puerta vidriada' : 'puerta de madera'),
      x: c.x, y: c.y, z: c.z, ry: c.ry, w: w, h: h, dbl: !!c.dbl,
      open: !!c.open, angle: c.open ? OPEN_A : 0, target: c.open ? OPEN_A : 0,
      aiT: 0, piv: [], collider: null, vis: true, nx: sn, nz: cs
    };
    if (d.dbl) {
      d.piv.push({ o: makeLeafPivot(c.kind, w / 2, h, 1, c.x - (w / 2) * cs, c.y, c.z + (w / 2) * sn, c.ry), s: 1 });
      d.piv.push({ o: makeLeafPivot(c.kind, w / 2, h, -1, c.x + (w / 2) * cs, c.y, c.z - (w / 2) * sn, c.ry), s: -1 });
    } else {
      d.piv.push({ o: makeLeafPivot(c.kind, w, h, 1, c.x - (w / 2) * cs, c.y, c.z + (w / 2) * sn, c.ry), s: 1 });
    }
    var bx = closedBox(d);
    d.collider = { x: c.x, z: c.z, hw: bx.hw, hd: bx.hd, y0: c.y, h: c.y + h, door: true, d50: true };
    applyAngle(d);
    syncCollider(d);
    DA.list.push(d);
    placed.push([c.x, c.z, c.y]);
    addStat(c.lv, 'int', c.kind);
    return d;
  }

  function applyAngle(d) {
    for (var i = 0; i < d.piv.length; i++) d.piv[i].o.rotation.y = d.ry + d.piv[i].s * d.angle;
  }
  function syncCollider(d) {
    if (typeof obstB === 'undefined') return;
    var idx = obstB.indexOf(d.collider);
    var block = !d.open && d.angle < 0.45;
    if (block && idx < 0) { obstB.push(d.collider); if (typeof NV !== 'undefined') NV.sig = ''; }
    else if (!block && idx >= 0) { obstB.splice(idx, 1); if (typeof NV !== 'undefined') NV.sig = ''; }
  }

  /* ajusta al vano real una puerta de V.GAI cercana (no la duplica) */
  function snapVgai(c) {
    if (c.mode !== 'int') return false;
    var L = vgaiList(), best = null, bd = 3.0;
    for (var i = 0; i < L.length; i++) {
      var v = L[i];
      if (v._d50snap || Math.abs((v.y || 0) - c.y) > 1.5) continue;
      var dd = Math.hypot(v.x - c.x, v.z - c.z);
      var dry = Math.abs(((((v.ry || 0) - c.ry) % PI) + PI * 1.5) % PI - HP); // 0 = paralelas
      if (dd < bd && dry < 0.2) { bd = dd; best = v; }
    }
    if (!best) return false;
    best._d50snap = true;
    if (bd > 0.08) {
      if (Math.abs((best.width || 1.3) - c.w) < 0.45) {
        best.x = c.x; best.z = c.z; best.ry = c.ry;
        if (best.group) { best.group.position.x = c.x; best.group.position.z = c.z; best.group.rotation.y = c.ry; }
        if (typeof obstB !== 'undefined' && W.DOORS_VGAI && W.DOORS_VGAI.toggleDoorCollider) {
          W.DOORS_VGAI.toggleDoorCollider(best, obstB, typeof NV !== 'undefined' ? NV : null);
          if (typeof NV !== 'undefined') NV.sig = '';
        }
        DA.skipped.vgai_snap++;
      }
    }
    return true;
  }

  function resolveGeneric(c) {
    // c.thin: 'z' (hoja en plano x) o 'x' (hoja en plano z); se busca de qué lado está el edificio
    var e = 0.5, a, b;
    if (c.thin === 'z') {
      a = insideSolid(c.x, c.z - e); b = insideSolid(c.x, c.z + e);
      if (a === b) return false;
      var sz = a ? 1 : -1; c.z = c.z + sz * (c.t / 2 + 0.045); c.ry = sz > 0 ? 0 : PI;
    } else {
      a = insideSolid(c.x - e, c.z); b = insideSolid(c.x + e, c.z);
      if (a === b) return false;
      var sx = a ? 1 : -1; c.x = c.x + sx * (c.t / 2 + 0.045); c.ry = sx > 0 ? HP : -HP;
    }
    c.mode = 'deco';
    return true;
  }

  function processOne(c) {
    if (c.mode === 'gen') {
      if (!resolveGeneric(c)) { DA.skipped.noface++; return; }
    }
    if (c.w > 3.75) { DA.skipped.wide++; return; }
    if (c.w > 2.15 && !c.dbl) c.dbl = true;
    if (c.mode === 'int' && snapVgai(c)) { DA.skipped.dup++; return; }
    if (nearExisting(c.x, c.z, c.mode === 'int' ? 1.05 : 0.9, c.y)) { DA.skipped.dup++; return; }
    if (c.mode === 'int') makeInt(c); else makeDeco(c);
  }

  var sortedUpTo = 0;
  function processPending() {
    if (DA.done >= DA.cand.length || typeof scene === 'undefined' || !scene || !initGfx()) return;
    // explícitos antes que genéricos dentro del bloque nuevo (estable)
    if (sortedUpTo < DA.cand.length) {
      var tail = DA.cand.slice(DA.done);
      tail.sort(function (p, q) { return p.prio - q.prio; });
      for (var t = 0; t < tail.length; t++) DA.cand[DA.done + t] = tail[t];
      sortedUpTo = DA.cand.length;
    }
    var n = 0;
    while (DA.done < DA.cand.length && n < 40) {
      try { processOne(DA.cand[DA.done]); } catch (e) { DA.lastErr = String(e && e.message || e); }
      DA.done++; n++;
    }
    flushBatches();
  }

  /* ------------------------------------------------------------------ elección de familia */
  function kindForHouse(o, dw) {
    if (o.d50kind) return o.d50kind;
    var mat = o.mat || 'c', area = (o.w || 0) * (o.d || 0);
    if (mat === 'r') return 'wood';
    if (o.flat && mat === 'c' && area < 60) return 'steel';
    if (mat === 'b') return dw >= 2.2 ? 'wood' : 'wood_glass';
    return 'wood_glass';
  }
  function colKind(col, dflt) {
    var r = (col >> 16) & 255, g = (col >> 8) & 255, b = col & 255;
    if (r + g + b < 80) return dflt;
    if (r - b >= 12 && r >= g) return 'wood';
    return 'steel';
  }

  /* ------------------------------------------------------------------ envolturas */
  function wrap(name, fn) {
    var o = W[name];
    if (typeof o !== 'function' || o._d50) return;
    var w = function () {
      explicitDepth++;
      try { try { fn.apply(this, arguments); } catch (e) { DA.lastErr = name + ': ' + (e && e.message); } return o.apply(this, arguments); }
      finally { explicitDepth--; }
    };
    w._d50 = true; w._d50orig = o;
    W[name] = w;
  }
  function wrapSilent(name) { // solo silencia el detector genérico mientras corre
    var o = W[name];
    if (typeof o !== 'function' || o._d50) return;
    var w = function () { explicitDepth++; try { return o.apply(this, arguments); } finally { explicitDepth--; } };
    w._d50 = true; W[name] = w;
  }

  // puerta sobre la fachada de house17/house18 (kit girado "a")
  function regKitDoor(K, o, face, al, dw, open, X0, Y0, src) {
    if (!K || !o || typeof K.P !== 'function' || !(dw > 0.5)) return;
    var a = K.a || 0, ns = face === 'n' || face === 's', sg = (face === 's' || face === 'e') ? 1 : -1;
    var isInt = open === 2, dh = o.dh || 2.3;
    if (dh > 3.4 && dw > 2.6) return;            // portones de naves: quedan abiertos
    var off = isInt ? 0.13 : 0.13, half = ns ? o.d / 2 : o.w / 2;
    var dist = isInt ? (half - off) : (half + off);
    var p = ns ? K.P(al, sg * dist) : K.P(sg * dist, al);
    var ry = ns ? (sg > 0 ? a : a + PI) : (sg > 0 ? a + HP : a - HP);
    var kind = kindForHouse(o, dw);
    var lw = isInt ? dw - 0.03 : dw;
    reg({ mode: isInt ? 'int' : 'deco', src: src, kind: kind, x: X0 + p[0], y: Y0, z: p[1], ry: ry,
      w: lw, h: (isInt ? dh : dh) - 0.04, dbl: lw > 2.15 });
  }

  function install() {
    if (DA._installed) return;
    DA._installed = true;

    // Nilo y otros: casa maciza con puerta pintada en +z
    wrap('house', function (x, z, w, d, h) {
      reg({ mode: 'deco', src: 'house', kind: 'wood', x: x, y: 0, z: z + d / 2 + 0.16, ry: 0, w: 1.2, h: 2.0 });
    });
    // Nilo: edificio de adobe (puerta de madera con arco)
    wrap('bldg', function (x, z, w, d, h, fr) {
      var zs = fr > 0 ? 1 : -1, fz = z + zs * d / 2;
      reg({ mode: 'deco', src: 'bldg', kind: 'wood', x: x, y: 0, z: fz + zs * 0.16, ry: zs > 0 ? 0 : PI, w: 1.62, h: 2.26 });
    });
    // v22: puerta pintada sobre barracas y cuarteles (cap. XI)
    wrap('door22', function (x, z, face, w, h) {
      face = face >= 0 ? 1 : -1;
      reg({ mode: 'deco', src: 'door22', kind: 'wood', x: x, y: 0, z: z + face * 0.16, ry: face > 0 ? 0 : PI, w: w, h: h });
    });
    // v31 cap. XII: puertas de Falkenhorst (torre, cuartel, comedor, estación, hidrógeno, radio)
    wrap('door31_12', function (q, qg, x, z, nx, nz, u, w, h, o) {
      o = o || {};
      var lf = o.lf || 0x3a2818, kind = 'wood';
      if (lf === 0x2e3a2e || lf === 0x4a4a42) kind = 'steel';
      else if (typeof X12 !== 'undefined' && Math.hypot(x - (X12 + 128), z + 60) < 12) kind = 'wood_glass';
      if (nx) reg({ mode: 'deco', src: 'door31_12', kind: kind, x: x + nx * 0.14, y: 0, z: z + u, ry: nx > 0 ? HP : -HP, w: w, h: h });
      else reg({ mode: 'deco', src: 'door31_12', kind: kind, x: x + u, y: 0, z: z + nz * 0.14, ry: nz > 0 ? 0 : PI, w: w, h: h });
    });
    // v26 cap. XIV: puertas interiores del palacio (vanos reales, varias plantas)
    wrap('door14', function (q, ax, c, u, w, y0, h, t) {
      if (w > 2.6) return; // arco principal: queda abierto
      var X = typeof X14 !== 'undefined' ? X14 : 56000;
      var open = (y0 || 0) < 0.5; // planta baja abierta (el asalto entra por ahí), plantas altas cerradas
      if (ax === 'x') reg({ mode: 'int', src: 'door14', kind: 'wood_glass', x: X + u, y: y0 || 0, z: c, ry: 0, w: w - 0.04, h: h - 0.04, dbl: true, open: open });
      else reg({ mode: 'int', src: 'door14', kind: 'wood_glass', x: X + c, y: y0 || 0, z: u, ry: HP, w: w - 0.04, h: h - 0.04, dbl: true, open: open });
    });
    // Karsk / Varnholt: puertas de los edificios con kit (interiores reales o pintadas)
    wrap('door17', function (K, o, face, al, dw, open) {
      regKitDoor(K, o, face, al, dw, open, typeof X17 !== 'undefined' ? X17 : 160000, 0, 'door17');
    });
    wrap('door18', function (K, o, face, al, dw, open) {
      regKitDoor(K, o, face, al, dw, open, typeof X18 !== 'undefined' ? X18 : 200000, typeof Y18 !== 'undefined' ? (+Y18 || 0) : 0, 'door18');
    });
    wrapSilent('house17'); wrapSilent('house18');
    // casamatas: vano trasero real (la hoja estática la suprime V.GAI) → acero interactivo
    wrap('casemate17', function (cx, cz) {
      reg({ mode: 'int', src: 'casemate17', kind: 'steel', x: (typeof X17 !== 'undefined' ? X17 : 160000) + cx + 2, y: 0, z: cz - 3.92, ry: 0, w: 1.36, h: 2.08, open: true });
    });
    wrap('casemate18', function (cx, cz) {
      reg({ mode: 'int', src: 'casemate18', kind: 'steel', x: (typeof X18 !== 'undefined' ? X18 : 200000) + cx + 2, y: typeof Y18 !== 'undefined' ? (+Y18 || 0) : 0, z: cz - 3.92, ry: 0, w: 1.36, h: 2.08, open: true });
    });
    // refugios: detrás de la puerta hay un túmulo macizo → hoja cerrada decorativa
    wrap('dug17', function (x, z, o) {
      o = o || {};
      reg({ mode: 'deco', src: 'dug17', kind: o.wood ? 'wood' : 'steel', x: (typeof X17 !== 'undefined' ? X17 : 160000) + x, y: 0, z: z - 0.06, ry: 0, w: 1.5, h: 2.26 });
    });
    wrap('dug18', function (x, z, o) {
      o = o || {};
      reg({ mode: 'deco', src: 'dug18', kind: o.wood ? 'wood' : 'steel', x: (typeof X18 !== 'undefined' ? X18 : 200000) + x, y: typeof Y18 !== 'undefined' ? (+Y18 || 0) : 0, z: z - 0.06, ry: 0, w: 1.5, h: 2.26 });
    });
    // Taikin (cap. XVI): casas de entramado y bloques (fachadas macizas, sin puerta pintada)
    wrap('gable16', function (q, x, z, w, d, h) {
      var X = typeof X16 !== 'undefined' ? X16 : 120000, n = Math.floor(w / 2.6);
      if (n < 1 || h < 2.9) return;
      var u = -w / 2 + 1.3 + 1.3; // sobre el primer pie derecho, entre ventanas
      reg({ mode: 'deco', src: 'gable16', kind: 'wood', x: X + x + u, y: 0, z: z + d / 2 + 0.1, ry: 0, w: 1.1, h: Math.min(2.1, h - 0.7) });
    });
    wrap('block16', function (q, x, z, w, d) {
      var X = typeof X16 !== 'undefined' ? X16 : 120000, n = Math.floor(w / 3);
      if (n < 2) return;
      var k = Math.max(0, Math.floor(n / 2) - 1), u = -w / 2 + 3 + 3 * k;
      reg({ mode: 'deco', src: 'block16', kind: 'wood_glass', x: X + x + u, y: 0, z: z + d / 2 + 0.1, ry: 0, w: 1.3, h: 2.25 });
      reg({ mode: 'deco', src: 'block16', kind: 'wood_glass', x: X + x - u, y: 0, z: z - d / 2 - 0.1, ry: PI, w: 1.3, h: 2.25 });
    });
    wrap('church31', function (q, x, z) {
      var X = typeof X16 !== 'undefined' ? X16 : 120000;
      reg({ mode: 'deco', src: 'church31', kind: 'wood', x: X + x, y: 0, z: z + 16.19, ry: 0, w: 2.3, h: 3.5, dbl: true });
    });
    // constructores con puertas propias o ya cubiertas por V.GAI/v22: solo silenciar el detector
    ['barn13', 'farm13', 'mkDoor22', 'leaf22', 'bunker8', 'cath14', 'apt14', 'casemate17', 'casemate18'].forEach(wrapSilent);

    // detector genérico de puertas pintadas (Nilo, cap. IX–XII, base del fiordo, etc.)
    var det = function (w, h, d, c, x, y, z, ry) {
      if (explicitDepth > 0 || ry) return;
      var thinZ = d <= 0.22 && w >= 0.9 && w <= 2.0, thinX = w <= 0.22 && d >= 0.9 && d <= 2.0;
      if (!(thinZ || thinX) || h < 1.75 || h > 2.7) return;
      var bot = y - h / 2;
      if (bot < -0.05 || bot > 0.3) return;
      var r = (c >> 16) & 255, g = (c >> 8) & 255, b = c & 255;
      if (r + g + b > 330) return;
      var lv = lvNow(), dflt = 'wood';
      var kind = colKind(c, dflt);
      if (lv === 15 && typeof X15 !== 'undefined' && Math.hypot(x - (X15 + 10), z - 78) < 12) kind = 'wood_glass'; // hospital del fiordo
      reg({ mode: 'gen', src: 'gen', kind: kind, x: x, y: 0, z: z, thin: thinZ ? 'z' : 'x', t: thinZ ? d : w,
        w: (thinZ ? w : d), h: h });
    };
    var ob = W.box;
    if (typeof ob === 'function' && !ob._d50) {
      W.box = function (w, h, d, c, x, y, z, p) {
        if (explicitDepth === 0 && (!p || (typeof scene !== 'undefined' && p === scene))) { try { det(w, h, d, c, x, y, z, 0); } catch (e) {} }
        return ob.apply(this, arguments);
      };
      W.box._d50 = true;
    }
    var op = W.pBox;
    if (typeof op === 'function' && !op._d50) {
      W.pBox = function (pb, w, h, d, c, x, y, z, rx, ry) {
        if (explicitDepth === 0 && !rx) { try { det(w, h, d, c, x, y, z, ry); } catch (e) {} }
        return op.apply(this, arguments);
      };
      W.pBox._d50 = true;
    }
  }
  install(); // antes de que corra cualquier constructor de nivel

  /* ------------------------------------------------------------------ actualización */
  var LISTS = [];
  function unitLists() {
    LISTS.length = 0;
    if (typeof allies !== 'undefined' && Array.isArray(allies)) LISTS.push(allies);
    if (typeof enemies !== 'undefined' && Array.isArray(enemies)) LISTS.push(enemies);
    if (typeof npcs !== 'undefined' && Array.isArray(npcs)) LISTS.push(npcs);
    if (typeof NPC11 !== 'undefined' && Array.isArray(NPC11)) LISTS.push(NPC11);
    if (typeof N19 !== 'undefined' && N19 && Array.isArray(N19.sq)) LISTS.push(N19.sq);
    if (typeof N20 !== 'undefined' && N20 && Array.isArray(N20.sq)) LISTS.push(N20.sq);
    return LISTS;
  }
  function npcNear(d, r) {
    var L = LISTS;
    for (var l = 0; l < L.length; l++) {
      var a = L[l];
      for (var j = 0; j < a.length; j++) {
        var u = a[j];
        if (!u || !u.g || !u.g.visible || (u.hp !== undefined && u.hp <= 0)) continue;
        var p = u.g.position, dx = p.x - d.x, dz = p.z - d.z;
        if (dx * dx + dz * dz < r * r && Math.abs(p.y - d.y) < 2.6) return true;
      }
    }
    return false;
  }
  function pushOut(d) {
    // al cerrar: empuja fuera de la hoja cerrada, hacia el lado en que está cada actor
    var bx = closedBox(d), r = 0.5;
    var f = function (p) {
      if (!p || Math.abs(p.y - d.y) > 2.6) return;
      if (Math.abs(p.x - d.x) < bx.hw + r && Math.abs(p.z - d.z) < bx.hd + r) {
        var dn = (p.x - d.x) * d.nx + (p.z - d.z) * d.nz, s = dn >= 0 ? 1 : -1, need = 0.1 + r + 0.05;
        if (Math.abs(dn) < need) { var k = s * need - dn; p.x += d.nx * k; p.z += d.nz * k; }
      }
    };
    if (typeof P !== 'undefined' && P && P.g) f(P.g.position);
    for (var l = 0; l < LISTS.length; l++) for (var j = 0; j < LISTS[l].length; j++) { var u = LISTS[l][j]; if (u && u.g && u.g.visible) f(u.g.position); }
  }
  function setOpen(d, open, byAI) {
    if (d.open === open) return false;
    d.open = open; d.target = open ? OPEN_A : 0; d.aiT = (open && byAI) ? 5.5 : 0;
    if (!open) { unitLists(); pushOut(d); }
    syncCollider(d);
    if (W.AUDIO_VGAI && typeof W.AUDIO_VGAI.playDoor === 'function') { try { W.AUDIO_VGAI.playDoor(d.kind, open, d.x, d.z); } catch (e) {} }
    return true;
  }
  DA.setOpen = setOpen;

  var tSlow = 0, rr = 0, lastPrompt = '';
  function nearestMine(x, y, z, maxD) {
    var best = null, bd = maxD, A = DA.activeList;
    for (var i = 0; i < A.length; i++) {
      var d = A[i]; if (Math.abs(y - d.y) > 2.4) continue;
      var dd = Math.hypot(d.x - x, d.z - z);
      if (dd < bd) { bd = dd; best = d; }
    }
    DA._nd = bd;
    return best;
  }
  function nearestVgaiDist(x, z) {
    var L = vgaiList(), lv = lvNow(), bd = 1e9;
    for (var i = 0; i < L.length; i++) { if (L[i].level !== lv) continue; var dd = Math.hypot(L[i].x - x, L[i].z - z); if (dd < bd) bd = dd; }
    return bd;
  }

  function update(dt) {
    dt = dt || 0.016;
    if (typeof playing !== 'undefined' && !playing) return;
    processPending();
    var pp = (typeof P !== 'undefined' && P && P.g) ? P.g.position : null;
    if (!pp) return;
    // pase lento (2 Hz): conjunto activo, visibilidad por distancia, resincronía de colisión
    tSlow -= dt;
    if (tSlow <= 0) {
      tSlow = 0.5;
      var A = DA.activeList; A.length = 0;
      for (var i = 0; i < DA.list.length; i++) {
        var d = DA.list[i], dx = d.x - pp.x, dz = d.z - pp.z, q = dx * dx + dz * dz;
        var vis = q < 170 * 170;
        if (vis !== d.vis) { d.vis = vis; for (var k = 0; k < d.piv.length; k++) d.piv[k].o.visible = vis; }
        if (q < 48 * 48) { A.push(d); syncCollider(d); }
        else if (d.angle !== d.target) { d.angle = d.target; applyAngle(d); syncCollider(d); }
      }
    }
    var A2 = DA.activeList;
    if (!A2.length) { clearPrompt(); return; }
    // animación de hojas
    for (var a = 0; a < A2.length; a++) {
      var e = A2[a], diff = e.target - e.angle;
      if (Math.abs(diff) > 0.004) { e.angle += diff * Math.min(1, dt * 9); applyAngle(e); syncCollider(e); }
    }
    // IA: apertura automática y autocierre, por turnos
    unitLists();
    var nAi = Math.min(6, A2.length);
    for (var s = 0; s < nAi; s++) {
      rr = (rr + 1) % A2.length;
      var f = A2[rr];
      var near = npcNear(f, 2.35);
      if (near && !f.open) setOpen(f, true, true);
      else if (f.aiT > 0) {
        f.aiT -= dt * A2.length / nAi;
        if (f.aiT <= 0 && f.open && !near && Math.hypot(pp.x - f.x, pp.z - f.z) > 2.35) setOpen(f, false, true);
        else if (f.aiT <= 0 && near) f.aiT = 1.5;
      }
    }
    // indicación [E]
    var pr = typeof $ === 'function' ? $('pr') : null;
    var nd = (P.veh || P.mg) ? null : nearestMine(pp.x, pp.y, pp.z, 2.6);
    if (nd && nearestVgaiDist(pp.x, pp.z) < DA._nd) nd = null;
    DA.prompt = nd;
    if (pr) {
      if (nd) {
        var txt = (nd.open ? '[E / USAR] Cerrar ' : '[E / USAR] Abrir ') + nd.label;
        if (!pr.textContent || pr.textContent === lastPrompt) { pr.textContent = txt; lastPrompt = txt; }
      } else clearPrompt();
    }
  }
  function clearPrompt() {
    if (!lastPrompt) return;
    var pr = typeof $ === 'function' ? $('pr') : null;
    if (pr && pr.textContent === lastPrompt) pr.textContent = '';
    lastPrompt = '';
  }
  DA.update = update;

  function hooks() {
    if (DA._hooked) return;
    DA._hooked = true;
    install(); // por si algún constructor se definió después
    if (typeof W.update === 'function' && !W.update._d50) {
      var _u = W.update;
      W.update = function (dt) { var r = _u.apply(this, arguments); try { update(dt); } catch (e) { DA.lastErr = 'upd: ' + (e && e.message); } return r; };
      W.update._d50 = true;
    }
    if (typeof W.interact === 'function' && !W.interact._d50) {
      var _i = W.interact;
      W.interact = function () {
        try {
          if (typeof P !== 'undefined' && P && P.g && !P.veh && !P.mg) {
            var p = P.g.position, nd = nearestMine(p.x, p.y, p.z, 2.6);
            if (nd && nearestVgaiDist(p.x, p.z) >= DA._nd && setOpen(nd, !nd.open, false)) return;
          }
        } catch (e) {}
        return _i.apply(this, arguments);
      };
      W.interact._d50 = true;
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', hooks); else hooks();

  /* ------------------------------------------------------------------ diagnóstico */
  DA.summary = function () {
    var out = { int: DA.list.length, deco: DA.deco, cand: DA.cand.length, done: DA.done, batches: DA.batches.length, skipped: DA.skipped, byLevel: DA.stats, err: DA.lastErr || null };
    return out;
  };
})();
