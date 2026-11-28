/* =============================================================================
   v50.js · integración de la Edición Aethrion
   Nivel 17 «Golfo de Hierro»:
   - Más oleadas (5 → 9) y presión en TODA la línea de las Tres Cruces: cada oleada
     manda además un grupo de asalto contra las otras dos cruces, desde la niebla.
   - Más blindados de Veyrn: un blindado o tanque extra por oleada a partir de la 3.ª,
     por la otra punta de la línea, y dos más defendiendo la estación en el contraataque.
   - Cinemática del punto de control IV «Contraataque de hierro» rehecha (5 planos).
   ============================================================================= */
(function () {
  'use strict';
  if (typeof WV17 === 'undefined' || typeof wave17 !== 'function') return;
  /* 1 · oleadas extra (el ritmo y los avisos de la línea ya usan WV17.length) */
  WV17.push({ n: 8, mg: 1, veh: 'armcar' }, { n: 9, smoke: 1 }, { n: 10, mg: 1, veh: 'tank' }, { n: 11, smoke: 1, mg: 1, veh: 'tank' });
  const XL = typeof XL17 !== 'undefined' ? XL17 : 160000;
  /* 2 · presión en toda la línea + blindados por la otra punta */
  const _w = wave17;
  wave17 = function (i) {
    const r = _w.apply(this, arguments);
    try {
      const cr = N17.cross, ci = N17.cur, dif = typeof DIF17 === 'function' ? DIF17() : 1;
      for (let j = 0; j < cr.length; j++) {
        if (j === ci || !cr[j]) continue;
        const c = cr[j], cx = c.x - XL, n = Math.max(2, Math.round((2 + i * 0.6) * dif));
        const sp = [[cx - 14, c.z + 112], [cx + 12, c.z + 118], [cx, c.z + 125]];
        for (let k = 0; k < n; k++) q17(k % 3 === 2 ? 'stv' : 'mosin', sp, { tag: 'wx' + i, goal: [c.x, c.z], flank: k % 2 === 0, kind: k === 0 ? 'gren' : undefined });
      }
      if (i >= 2) {
        const far = cr[ci === 0 ? cr.length - 1 : 0], fx = far.x - XL, kind = i >= 5 && i % 2 ? 'tank' : 'armcar';
        const v = veh17(kind, 'veyrn', fx < 0 ? -95 : 95, far.z + 150, Math.PI);
        if (v) {
          path17(v, [[fx < 0 ? -85 : 85, far.z + 80], [fx + (fx < 0 ? 18 : -18), far.z + 40], [fx, far.z + 16]]);
          N17.evh.push(v); if (typeof gVehBal17 === 'function') gVehBal17(v);
          if (typeof radio28 === 'function') radio28('Brask', kind === 'tank' ? '¡Otro tanque por el flanco! ¡No dejen solo al antitanque!' : '¡Blindado de Veyrn por la otra punta de la línea!', 2.4);
        }
      }
    } catch (e) { console.warn('v50 wave17', e); }
    return r;
  };
  /* 3 · el contraataque encuentra la estación defendida por blindados */
  if (typeof ph3start17 === 'function') {
    const _p = ph3start17;
    ph3start17 = function () {
      const r = _p.apply(this, arguments);
      try {
        const d = KP17('depot');
        for (const [ox, oz, k] of [[42, -55, 'tank'], [-55, -40, 'armcar'], [20, -95, 'armcar']]) {
          const v = veh17(k, 'veyrn', d[0] + ox, d[1] + oz, 0);
          if (!v) continue;
          if (typeof vehOrder32 === 'function') try { vehOrder32(v, { mode: 'hold' }) } catch (e) {}
          N17.evh.push(v); if (typeof gVehBal17 === 'function') gVehBal17(v);
        }
      } catch (e) { console.warn('v50 ph3', e); }
      return r;
    };
  }
  /* 4 · cinemática «IV · Contraataque de hierro»: se reemplazan los planos, se conserva el final */
  if (typeof cineArr17 === 'function' && typeof cine9 === 'function') {
    const _c = cineArr17;
    cineArr17 = function () {
      const _c9 = cine9;
      cine9 = function (shots, end, ev) {
        cine9 = _c9;
        try {
          const LN = KL17('line'), c = LN[1], W = WG17, rz = c[1];
          const tk = () => { const t = N17.tank && N17.tank.g ? N17.tank.g.position : { x: W(c[0]), z: rz }; return [t.x, 1.8, t.z]; };
          shots = [
            { d: 4.5, a: [W(-60), 26, rz + 70], b: [W(-30), 18, rz + 20], la: [W(-20), 2, rz - 40], txt: 'IV · CONTRAATAQUE DE HIERRO' },
            { d: 4, a: [W(-12), 1.4, rz - 70], b: [W(-12), 1.6, rz - 40], la: [W(-20), 3, rz - 10], txt: 'El tren del 11.º Regimiento entra a la línea' },
            { d: 4, a: [W(52), 3, rz + 30], b: [W(48), 3.5, rz + 18], la: [W(38), 1.5, rz + 40], txt: 'Los camiones descargan a los refuerzos detrás del alambrado' },
            { d: 4.5, a: [W(c[0] - 22), 2.2, rz - 26], b: [W(c[0] - 14), 2.6, rz - 34], la: tk, txt: 'Blindados de Volskaya, por primera vez de nuestro lado' },
            { d: 4.5, a: [W(c[0] + 4), 2.6, rz + 6], b: [W(c[0] + 2), 3.6, rz - 4], la: [W(-30), 6, rz - 240], txt: 'Al norte, la estación Karsk. Hay que recuperarla.' }
          ];
          const evs = (ev || []).slice();
          for (let k = 0; k < 6; k++) evs.push({ t: 1 + k * 3.2, fn: () => { try { const d = KP17('depot'); shell17(W(d[0] + (Math.random() - .5) * 90), d[1] - 20 - Math.random() * 60, { r: 5, pw: 0, dl: .1 }) } catch (e) {} } });
          return _c9.call(this, shots, end, evs);
        } catch (e) { console.warn('v50 cine', e); return _c9.call(this, shots, end, ev); }
      };
      try { return _c.apply(this, arguments); } finally { cine9 = _c9; }
    };
  }
})();
/* =============================================================================
   v50.3
   - Cañón antitanque del nivel 17 más realista: 36 proyectiles listos (el armón y las
     cajas de una pieza de 37 mm en posición), cadencia práctica de ~13 disparos/min
     (4,6 s por disparo apuntado), voces de orden y carga, y recarga desde las cajas.
   - Conductor de camión (recurso reutilizable DRIVER50): tanquista de Veyrn que acelera
     y huye, o se baja y combate antes de que el antitanque destruya el camión.
   - Contraataque: el tanque aliado baja del tren por una rampa.
   - Fusil antitanque AT-18 en el arsenal desde el inicio en los niveles 17–20.
   ============================================================================= */
(function () {
  'use strict';
  /* ---- antitanque: munición, cadencia y órdenes ---- */
  if (typeof atFire17 === 'function' && typeof N17 !== 'undefined') {
    const _f = atFire17;
    atFire17 = function () {
      const a = N17.at; if (!a) return _f.apply(this, arguments);
      if (!a.v50) { a.v50 = 1; if (a.ammo === 14) a.ammo = 36; }
      const n0 = a.ammo; const r = _f.apply(this, arguments);
      if (a.ammo < n0) {
        a.cd = 4.6;
        if (typeof say === 'function') say('Apuntador: «¡FUEGO!» · Cargador: abre el cierre, saca la vaina, mete el proyectil… (' + a.ammo + ' restantes)', 2.2);
        setTimeout(() => { if (N17.at === a && typeof say === 'function') say('Cargador: «¡CARGADO!»', 1.1); }, 4300);
      }
      return r;
    };
  }
  /* ---- DRIVER50: conductores de camión de Veyrn ---- */
  const DRV = window.DRIVER50 = {
    /* opts: spawn(lx,z,i) → soldado; aimedAt(v) → bool; flee(v) ; bail(v) */
    tick(v, st, o) {
      if (!v || !v.alive || st.done) return;
      const hurt = v.maxhp && v.hp < v.maxhp * 0.72, aimed = o.aimedAt && o.aimedAt(v);
      if (!hurt && !aimed) return;
      const nearStop = st.stop && Math.hypot(v.g.position.x - o.wx(st.stop[0]), v.g.position.z - st.stop[1]) < 28;
      if (aimed && !nearStop && !st.fled && Math.random() < 0.5) { st.fled = 1; o.flee(v); return; }
      st.done = 1; o.bail(v);
    }
  };
  if (typeof N17 !== 'undefined' && typeof sp17 === 'function') {
    const XL = typeof XL17 !== 'undefined' ? XL17 : 160000, wx = x => x + XL;
    const aimedAt = v => {
      const a = N17.at; if (!a || typeof cam === 'undefined') return false;
      const d = new THREE.Vector3(); cam.getWorldDirection(d);
      const p = v.g.position, dx = p.x - cam.position.x, dz = p.z - cam.position.z, L = Math.hypot(dx, dz);
      return L < 260 && (dx * d.x + dz * d.z) / L > Math.cos(0.09);
    };
    const flee = v => { const p = v.g.position, lx = p.x - XL; try { path17(v, [[lx + (lx > 0 ? 35 : -35), p.z + 50], [lx + (lx > 0 ? 60 : -60), p.z + 170]], 15) } catch (e) {} if (typeof feed === 'function') feed('El conductor de Veyrn acelera y se escapa'); };
    const bail = v => {
      v.hold = true; const p = v.g.position, lx = p.x - XL;
      for (let i = 0; i < 2; i++) { try { const e = sp17('mosin', lx + (i ? 2.2 : -2.2), p.z + 1.5, { tag: 'drv', kind: 'crew' }); if (e) e.cv = { x: p.x + (i ? 6 : -6), z: p.z + 4 }; } catch (er) {} }
      if (typeof radio28 === 'function') radio28('Brask', '¡Los conductores saltan del camión! ¡Ojo, que vienen a pie!', 2);
    };
    let t = 0;
    const _u = update;
    update = function (dt) {
      const r = _u(dt);
      if (level === 17 && N17.trucks && (t += dt) > 0.25) { t = 0; for (const tr of N17.trucks) { tr.d50 = tr.d50 || { stop: tr.stop }; DRV.tick(tr.v, tr.d50, { wx, aimedAt, flee, bail }); } }
      return r;
    };
  }
  /* ---- el tanque aliado baja del tren en el contraataque ---- */
  if (typeof cineArr17 === 'function') {
    const _c = cineArr17;
    cineArr17 = function () {
      const r = _c.apply(this, arguments);
      try {
        const LN = KL17('line'), rz = LN[1][1] - 30, W = WG17;
        const ramp = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.25, 4.5), new THREE.MeshLambertMaterial({ color: 0x5a4632 }));
        ramp.position.set(W(-20) + 3.8, 0.55, rz); ramp.rotation.z = -0.28; scene.add(ramp); setTimeout(() => scene.remove(ramp), 60000);
        setTimeout(() => { const v = N17.tank; if (!v || !v.g) return; const home = [LN[1][0] - 12, LN[1][1] - 30]; v.g.position.set(W(-20) + 1.2, 1.25, rz); try { path17(v, [[-20 + 6.5, rz], home], 3); } catch (e) {} }, 4200);
      } catch (e) { console.warn('v50 ramp', e); }
      return r;
    };
  }
})();

/* v50.4 · arreglo del fusil antitanque en 1.ª persona: el registro VM32.R.AT no traía
   hip/aim ni los campos que espera vmUpd13 → se completan con los del fusil */
(function(){
  function fixAT(){try{const R=VM32&&VM32.R,A=R&&R.AT,B=R&&(R.Rf||VM13.Rf);if(!A||!B||A.fix50)return;A.fix50=1;
    if(!A.hip)A.hip=(A.k&&A.k.p)||[.19,-.18,-.28];if(!A.aim)A.aim=(A.k&&A.k.ap)||[.03,-.115,-.24];
    for(const k in B)if(A[k]===undefined&&k!=='root'&&k!=='piv'&&k!=='gun')A[k]=Array.isArray(B[k])?B[k].slice():(typeof B[k]==='object'&&B[k]&&!B[k].isObject3D?Object.assign({},B[k]):B[k]);
    if(!A.gun)A.gun=A.piv;}catch(e){}}
  const _u=update;update=function(dt){if(level>=17)fixAT();return _u(dt)};
  if(typeof vmCur13==='function'){const _c=vmCur13;vmCur13=function(){fixAT();const w=_c.apply(this,arguments);return w&&w.hip?w:(VM13.Rf||w)}}
})();
/* =============================================================================
   v50.4 · Fusil antitanque «KbUr-L 22» (fusión Kb Ur wz. 35 × Lahti L-39, 22×140 mm)
   - Modelo nuevo en 1.ª persona sobre el registro VM32.R.AT (cañón largo, freno de boca
     grande, cargador superior de 5, culata de madera fina, bípode plegado y miras).
   - Se recoge en una caja en la línea de las Tres Cruces (además del contenedor del puesto);
     el jugador ya no lo recibe automáticamente.
   - Sonido de MG 08 para las ametralladoras de la guarnición (npcShot 'mg').
   ============================================================================= */
(function () {
  'use strict';
  const T = THREE;
  function remodel() {
    try {
      const A = VM32 && VM32.R && VM32.R.AT; if (!A || A.m50 || !A.piv) return; A.m50 = 1;
      const piv = A.piv; for (let i = piv.children.length - 1; i >= 0; i--) piv.children[i].visible = false;
      const G = new T.Group(); G.position.set(0, .01, -.34); G.scale.setScalar(.72); piv.add(G);
      const st = new T.MeshLambertMaterial({ color: 0x2b2d2f }), st2 = new T.MeshLambertMaterial({ color: 0x45484b }), wd = new T.MeshLambertMaterial({ color: 0x6b3f1f }), bk = new T.MeshLambertMaterial({ color: 0x151515 });
      const B = (w, h, d, m, x, y, z, rx) => { const o = new T.Mesh(new T.BoxGeometry(w, h, d), m); o.position.set(x, y, z); if (rx) o.rotation.x = rx; G.add(o); return o; };
      const C = (r, l, m, x, y, z, seg) => { const o = new T.Mesh(new T.CylinderGeometry(r, r, l, seg || 10), m); o.rotation.x = Math.PI / 2; o.position.set(x, y, z); G.add(o); return o; };
      B(.072, .085, .5, st, 0, -.02, -.05);            // cajón de mecanismos
      C(.019, 1.3, st, 0, .0, -.92);                    // cañón largo 22 mm
      C(.03, .36, st2, 0, .0, -.42, 12);                // camisa de refrigeración
      C(.048, .15, st, 0, .0, -1.6, 12);                // freno de boca (Lahti)
      for (const s of [-1, 1]) B(.012, .07, .1, bk, s * .045, 0, -1.6);
      B(.055, .17, .1, st2, 0, .115, -.1, -.22);        // cargador superior de 5
      B(.058, .11, .38, wd, 0, -.04, .32);              // culata fina (wz. 35)
      B(.064, .15, .035, bk, 0, -.035, .52);            // cantonera
      B(.04, .1, .05, wd, 0, -.1, .06, .35);            // empuñadura
      B(.008, .035, .02, st, 0, .045, -1.48);           // punto de mira
      B(.03, .02, .03, st, 0, .05, -.02);               // alza
      const bolt = B(.02, .02, .09, st2, .05, .02, .0); bolt.rotation.y = .6; A.bolt = bolt; // palanca de cerrojo
      for (const s of [-1, 1]) { const l = C(.008, .42, st, s * .05, -.1, -.82, 6); l.rotation.set(Math.PI / 2 - .25, 0, s * .12); } // bípode plegado
    } catch (e) { console.warn('v50 AT model', e); }
  }
  if (window.WEAPONS_VGAI && typeof WEAPONS_VGAI.giveAtRifle === 'function') {
    const _g = WEAPONS_VGAI.giveAtRifle;
    WEAPONS_VGAI.giveAtRifle = function () {
      const r = _g.apply(this, arguments);
      try { Object.assign(P.weapons.atrifle, { mag: 5, max: 5, reserve: 20, cd: 1.1, dmg: 260, reload: 4.2, ap: true }); for (const n of ['WN17','WN18','WN']) try { const o = eval(n); if (o) o.atrifle = 'FUSIL ANTITANQUE KbUr-L 22 · 22×140'; } catch (e) {} remodel();
        if (typeof feed === 'function') feed('★ Fusil antitanque KbUr-L 22 (22×140 mm) · cargador de 5'); } catch (e) {}
      return r;
    };
  }
  let lv = -1;
  const _u = update;
  update = function (dt) {
    const r = _u(dt);
    if (level !== lv) { lv = level; if ((level === 17 || level === 19) && window.WEAPONS_VGAI && WEAPONS_VGAI.buildATContainer) { try { WEAPONS_VGAI.buildATContainer(level, (typeof X17 !== 'undefined' ? X17 : 160000) + 14, -260, 0); } catch (e) {} } }
    if (level >= 17) remodel();
    return r;
  };
  if (typeof npcShot === 'function') {
    const _n = npcShot;
    npcShot = function (kind, x, z) {
      if (kind === 'mg' && typeof samp34 === 'function') { for (let i = 0; i < 3; i++) if (samp34('ametralladora', .9, 1, x, z, { delay: i * .09, reach: 30, max: 260 })) {} else return _n.apply(this, arguments); return; }
      return _n.apply(this, arguments);
    };
  }
})();
/* =============================================================================
   v50.5 · blindados del nivel 17 y FRUST
   - Clases más ágiles: ligero 5,2 m/s (camino 6,5), medio 4,2 (5,5): los aliados llegan a
     la estación y los enemigos presionan la línea.
   - Tanque medio de Veyrn al 96 % de su tamaño.
   - Ametrallador tanquista de Veyrn (veyrn32 'crew') asomado en la torreta con MG pesada:
     apunta con la torreta, retrocede al disparar y suena (muestra mg15), sincronizado con las
     ráfagas de las ametralladoras del vehículo.
   ============================================================================= */
(function () {
  'use strict';
  if (typeof VEH32 === 'undefined') return;
  const C = VEH32.cls || {};
  if (C.light) Object.assign(C.light, { speed: 5.2, road: 6.5 });
  if (C.medium) Object.assign(C.medium, { speed: 4.2, road: 5.5 });
  const T = THREE, tb = new T.Box3(), tv = new T.Vector3();
  function gunner(v) {
    try {
      const m0 = v.mounts && v.mounts[0]; if (!m0 || !m0.y || typeof mkSoldier !== 'function') return;
      const o = { g: mkSoldier({}) }; if (typeof veyrn32 === 'function') try { veyrn32(o, 'crew') } catch (e) {}
      const g = o.g, u = g.userData; tb.setFromObject(m0.y); tv.set((tb.min.x + tb.max.x) / 2, tb.max.y - .55, (tb.min.z + tb.max.z) / 2); m0.y.worldToLocal(tv);
      g.position.set(0, .2, -.25); m0.y.add(g);
      for (const a of [u.aR, u.aL]) if (a) a.rotation.x = -1.35;
      const mg = new T.Group(); const s = new T.MeshLambertMaterial({ color: 0x222426 });
      const b = new T.Mesh(new T.BoxGeometry(.12, .16, .62), s); b.position.set(0, 0, .1); mg.add(b);
      const br = new T.Mesh(new T.CylinderGeometry(.03, .03, .7, 8), s); br.rotation.x = Math.PI / 2; br.position.set(0, .02, .7); mg.add(br);
      const sh = new T.Mesh(new T.BoxGeometry(.5, .32, .03), s); sh.position.set(0, .05, .38); mg.add(sh);
      mg.position.set(0, 1.42, .55); g.add(mg);
      v.gun50 = { g, mg, t: 0, rec: 0 };
    } catch (e) { console.warn('v50 gunner', e); }
  }
  const _s = vehSpawn32;
  vehSpawn32 = function (v) {
    const r = _s.apply(this, arguments);
    try { if (v && v.kind === 'tank_medium' && v.side === 'veyrn') { v.g.scale.multiplyScalar(.96); gunner(v); } } catch (e) {}
    return r;
  };
  const _u = update;
  update = function (dt) {
    const r = _u(dt);
    if (VEH32.list) for (const v of VEH32.list) {
      const G = v.gun50; if (!G || !v.alive) { if (G && !v.alive && G.g.visible) G.g.visible = false; continue; }
      const firing = v.mounts.some(m => m.kind === 'mg' && m.burst > 0);
      G.t -= dt; if (firing && G.t <= 0) { G.t = .1; G.rec = 1; if (typeof samp34 === 'function') samp34('mg15', .8, 1, v.g.position.x, v.g.position.z, { reach: 28, max: 240 }); }
      G.rec = Math.max(0, G.rec - dt * 14); G.mg.position.z = .55 - G.rec * .06; G.g.position.y += 0;
    }
    return r;
  };
})();
