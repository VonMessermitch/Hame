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
  /* ---- AT-18 en el arsenal desde el inicio (17–20) ---- */
  let gv = -1;
  const _u2 = update;
  update = function (dt) {
    const r = _u2(dt);
    if (level >= 17 && level <= 20 && gv !== level && window.WEAPONS_VGAI && typeof WEAPONS_VGAI.giveAtRifle === 'function' && P && P.weapons) {
      const armed = (level === 17 && typeof N17 !== 'undefined') ? N17.arm && N17.arm.length : true;
      if (armed) { gv = level; const cur = P.cur; try { WEAPONS_VGAI.giveAtRifle(); P.cur = cur; } catch (e) {} }
    }
    return r;
  };
})();
