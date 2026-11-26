/* ============================================================================
   V.GAI.1.0 · HUD UNIFICADO, BRÚJULA Y MINIMAPA (AGENTE 3)
   - Brújula sincronizada con la orientación real del mundo (-Z = N = 0°)
     sin saltos ni desincronización 0°/360° en a pie, vehículo o torreta.
   - Soporte de brújula y minimapa en TODOS los capítulos (niveles 1 a 20).
   - Marcadores en minimapa y brújula: objetivo principal, aliados, enemigos,
     vehículos y puertas interactivas (AETH.vgai.doors).
   - Corrección de solapamientos HUD en escritorio y móvil (aspectos 21:9..9:19).
   ============================================================================ */
(function (root) {
  'use strict';

  var CARDS = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];

  function normDeg(d) {
    var r = d % 360;
    return r < 0 ? r + 360 : r;
  }

  // En Three.js del motor: Norte = -Z (0°), Este = +X (90°), Sur = +Z (180°), Oeste = -X (270°)
  function headingDegFromDir(dx, dz) {
    if (!isFinite(dx) || !isFinite(dz) || (Math.abs(dx) < 1e-7 && Math.abs(dz) < 1e-7)) return 0;
    return normDeg(Math.atan2(dx, -dz) * 180 / Math.PI);
  }

  function shortestAngleDiffDeg(fromDeg, toDeg) {
    var d = ((toDeg - fromDeg + 540) % 360) - 180;
    return d < -180 ? d + 360 : d;
  }

  function bearingDeg(px, pz, tx, tz) {
    return headingDegFromDir(tx - px, tz - pz);
  }

  function relativeBearingDeg(playerHeadingDeg, targetBearingDeg) {
    return shortestAngleDiffDeg(playerHeadingDeg, targetBearingDeg);
  }

  function cardinalLabel(deg) {
    var idx = Math.round(normDeg(deg) / 45) % 8;
    return CARDS[idx];
  }

  var compassApi = {
    version: 'V.GAI.1.0',
    normDeg: normDeg,
    headingDegFromDir: headingDegFromDir,
    shortestAngleDiffDeg: shortestAngleDiffDeg,
    bearingDeg: bearingDeg,
    relativeBearingDeg: relativeBearingDeg,
    cardinalLabel: cardinalLabel
  };

  root.COMPASS_VGAI = compassApi;
  if (root.AETH || typeof window !== 'undefined') {
    root.AETH = root.AETH || {};
    root.AETH.vgai = root.AETH.vgai || {};
    root.AETH.vgai.compass = compassApi;
  }

  if (typeof document === 'undefined' || typeof window === 'undefined') return;

  // CSS sin solapamientos para escritorio (16:9, 21:9) y móvil (vertical/horizontal)
  if (!document.getElementById('css_vgai_hud')) {
    document.head.insertAdjacentHTML('beforeend',
      '<style id="css_vgai_hud">' +
      '#a40btn{left:auto!important;right:18px!important;top:auto!important;bottom:16px!important;z-index:40}' +
      'body.vgai-playing #a40btn{top:calc(var(--st) + 12px)!important;bottom:auto!important;right:calc(var(--sr) + 114px)!important;left:auto!important;padding:6px 10px!important;font-size:11px!important}' +
      'body.h37 #mm27{left:calc(var(--sl) + var(--u)*2.2)!important;top:calc(var(--st) + var(--u)*2.2)!important;width:clamp(88px,calc(var(--u)*25),144px)!important;height:clamp(88px,calc(var(--u)*25),144px)!important;z-index:6}' +
      'body.h37 #dist27{left:calc(var(--sl) + var(--u)*2.2)!important;top:calc(var(--st) + clamp(98px,calc(var(--u)*28.5),156px))!important;width:clamp(108px,calc(var(--u)*30),164px)!important;text-align:left!important;font-size:clamp(10px,calc(var(--u)*2.2),12px)!important;line-height:1.25;letter-spacing:.08em;z-index:6;white-space:nowrap}' +
      'body.h37 #gar{left:calc(var(--sl) + var(--u)*2.2)!important;top:calc(var(--st) + clamp(118px,calc(var(--u)*34),182px))!important;max-width:calc(var(--u)*48);z-index:6}' +
      'body.h37 #bo{left:calc(var(--sl) + var(--u)*2.2)!important;top:calc(var(--st) + clamp(142px,calc(var(--u)*41),210px))!important;z-index:6}' +
      'body.h37 #bap18{left:calc(var(--sl) + clamp(110px,calc(var(--u)*30),170px))!important;top:calc(var(--st) + var(--u)*15)!important;z-index:6}' +
      'body.h37 #score{left:calc(var(--sl) + clamp(112px,calc(var(--u)*30),172px))!important;top:calc(var(--st) + var(--u)*1.6)!important}' +
      'body.h37 #combo{left:calc(var(--sl) + clamp(112px,calc(var(--u)*30),172px))!important;top:calc(var(--st) + var(--u)*6.8)!important}' +
      'body.h37 #style{left:calc(var(--sl) + clamp(112px,calc(var(--u)*30),172px))!important;top:calc(var(--st) + var(--u)*10.4)!important}' +
      'body.h37 #cp27{left:50%!important;top:calc(var(--st) + var(--u)*6.8)!important;width:min(calc(var(--u)*82),46vw)!important;max-width:480px!important;height:auto!important;transform:translateX(-50%)!important;z-index:6}' +
      'body.h37 #bb{top:calc(var(--st) + var(--u)*17)!important;z-index:6}' +
      'body.h37 #t13{top:calc(var(--st) + var(--u)*16.2)!important;z-index:6}' +
      'body.h37 #feed{top:calc(var(--st) + var(--u)*14)!important;right:calc(var(--sr) + var(--u)*2.2)!important;max-width:min(28vw,280px);z-index:6}' +
      '@media (max-width:760px){body.h37 #cp27{width:min(calc(var(--u)*70),44vw)!important}body.h37 #score,body.h37 #combo,body.h37 #style{left:calc(var(--sl) + clamp(96px,calc(var(--u)*28),136px))!important}body.vgai-playing #a40btn{display:none!important}}' +
      '</style>'
    );
  }

  var state = {
    smoothHdDeg: 0,
    initialized: false,
    t: 0,
    vec: typeof THREE !== 'undefined' ? new THREE.Vector3() : { x: 0, y: 0, z: -1 }
  };

  function resolvePlayerPos() {
    try {
      if (typeof level !== 'undefined') {
        if (level === 14 && typeof L14 !== 'undefined' && L14.inTank && L14.tank) return L14.tank.position;
        if (typeof VEH32 !== 'undefined' && VEH32 && VEH32.in && VEH32.in.g) return VEH32.in.g.position;
      }
      if (typeof P !== 'undefined' && P && P.g) return P.g.position;
      if (typeof cam !== 'undefined' && cam) return cam.position;
    } catch (_) {}
    return { x: 0, y: 0, z: 0 };
  }

  function resolveHeadingDeg(dt) {
    var targetDeg = 0;
    try {
      if (typeof cam !== 'undefined' && cam && typeof cam.getWorldDirection === 'function') {
        cam.getWorldDirection(state.vec);
        if (Math.hypot(state.vec.x, state.vec.z) > 1e-4) {
          targetDeg = headingDegFromDir(state.vec.x, state.vec.z);
        } else if (typeof yaw === 'number') {
          targetDeg = headingDegFromDir(-Math.sin(yaw), -Math.cos(yaw));
        }
      } else if (typeof yaw === 'number') {
        targetDeg = headingDegFromDir(-Math.sin(yaw), -Math.cos(yaw));
      }
    } catch (_) {}

    if (!state.initialized) {
      state.smoothHdDeg = targetDeg;
      state.initialized = true;
    } else {
      var diff = shortestAngleDiffDeg(state.smoothHdDeg, targetDeg);
      var k = Math.min(1, Math.max(0.15, (dt || 0.016) * 20));
      state.smoothHdDeg = normDeg(state.smoothHdDeg + diff * k);
    }
    return state.smoothHdDeg;
  }

  function resolveObjective(pp) {
    try {
      if (typeof L9 !== 'undefined' && L9 && L9.obj) {
        if (Array.isArray(L9.obj) && isFinite(L9.obj[0]) && isFinite(L9.obj[1])) return [L9.obj[0], L9.obj[1]];
        if (isFinite(L9.obj.x) && isFinite(L9.obj.z)) return [L9.obj.x, L9.obj.z];
      }
      if (typeof N19 !== 'undefined' && N19 && N19.obj && isFinite(N19.obj[0])) return N19.obj;
      if (typeof N20 !== 'undefined' && N20 && N20.obj && isFinite(N20.obj[0])) return N20.obj;
      if (typeof OB !== 'undefined' && Array.isArray(OB) && OB.length) {
        var best = null, bd = 1e9;
        for (var i = 0; i < OB.length; i++) {
          var o = OB[i];
          if (!o || o.on) continue;
          var d = Math.hypot(o.x - pp.x, o.z - pp.z);
          if (d < bd) { bd = d; best = [o.x, o.z]; }
        }
        if (best) return best;
      }
      if (typeof enemies !== 'undefined' && Array.isArray(enemies) && enemies.length) {
        var be = null, bde = 1e9;
        for (var j = 0; j < enemies.length; j++) {
          var e = enemies[j];
          if (!e || !e.g || e.hp <= 0) continue;
          var de = Math.hypot(e.g.position.x - pp.x, e.g.position.z - pp.z);
          if (de < bde) { bde = de; be = [e.g.position.x, e.g.position.z]; }
        }
        if (be) return be;
      }
    } catch (_) {}
    return null;
  }

  function collectAllies() {
    var out = [];
    try {
      if (typeof allies !== 'undefined' && Array.isArray(allies)) {
        for (var i = 0; i < allies.length; i++) if (allies[i] && allies[i].g && allies[i].g.visible && allies[i].hp > 0) out.push(allies[i]);
      }
      var pools = [
        typeof L13 !== 'undefined' && L13 && L13.sq,
        typeof L14 !== 'undefined' && L14 && L14.sq,
        typeof N16 !== 'undefined' && N16 && N16.paras,
        typeof N17 !== 'undefined' && N17 && N17.sq,
        typeof N18 !== 'undefined' && N18 && N18.sq,
        typeof N19 !== 'undefined' && N19 && N19.sq,
        typeof N20 !== 'undefined' && N20 && N20.sq
      ];
      for (var p = 0; p < pools.length; p++) {
        var arr = pools[p];
        if (!Array.isArray(arr)) continue;
        for (var k = 0; k < arr.length; k++) {
          var n = arr[k];
          if (n && n.g && n.g.visible && (n.hp === undefined || n.hp > 0) && out.indexOf(n) < 0) out.push(n);
        }
      }
    } catch (_) {}
    return out;
  }

  function drawUnifiedHud(dt) {
    var c = typeof $ === 'function' ? $('mm27') : document.getElementById('mm27');
    var k = typeof $ === 'function' ? $('cp27') : document.getElementById('cp27');
    var dd = typeof $ === 'function' ? $('dist27') : document.getElementById('dist27');
    if (!c || !k || !dd) return;

    var isPlay = typeof playing !== 'undefined' && playing;
    var inCine = typeof L9 !== 'undefined' && L9 && L9.cine;
    var on = isPlay && !inCine;
    document.body.classList.toggle('vgai-playing', isPlay);
    var a40 = document.getElementById('a40btn');
    if (a40) a40.style.visibility = inCine ? 'hidden' : 'visible';
    if (!on) {
      if (c.style.display !== 'none') c.style.display = k.style.display = dd.style.display = 'none';
      return;
    }

    c.style.display = k.style.display = dd.style.display = 'block';
    var arrEl = document.getElementById('arrow');
    if (arrEl && arrEl.style.display !== 'none') arrEl.style.display = 'none';

    state.t += (dt || 0.016);
    var pp = resolvePlayerPos();
    var hdDeg = resolveHeadingDeg(dt || 0.016);
    var hdRad = hdDeg * Math.PI / 180;
    var fx = Math.sin(hdRad), fz = -Math.cos(hdRad);
    var rx = Math.cos(hdRad), rz = Math.sin(hdRad);
    var obj = resolveObjective(pp);

    // 1. MINIMAPA
    {
      var x = c.getContext('2d'), W = 300, C = W / 2, RA = 50, s = C / RA;
      x.setTransform(1, 0, 0, 1, 0, 0);
      x.clearRect(0, 0, W, W);
      x.save();
      x.beginPath();
      x.arc(C, C, C - 2, 0, 6.2832);
      x.clip();

      var gr = x.createRadialGradient(C, C, 10, C, C, C);
      gr.addColorStop(0, 'rgba(46,40,28,0.82)');
      gr.addColorStop(1, 'rgba(16,14,10,0.88)');
      x.fillStyle = gr;
      x.fillRect(0, 0, W, W);

      // Obstáculos en mundo transformado a rumbo jugador
      if (typeof obstB !== 'undefined' && Array.isArray(obstB)) {
        x.setTransform(s * rx, -s * fx, s * rz, -s * fz, C, C);
        x.fillStyle = 'rgba(206,192,150,0.46)';
        var R2 = (RA + 14) * (RA + 14);
        for (var i = 0; i < obstB.length; i++) {
          var o = obstB[i];
          if (!o) continue;
          var dx = o.x - pp.x, dz = o.z - pp.z;
          if (dx * dx + dz * dz > R2 + (o.hw * o.hw + o.hd * o.hd) * 4) continue;
          if (o.hw > 65 || o.hd > 65) continue;
          x.fillRect(dx - o.hw, dz - o.hd, o.hw * 2, o.hd * 2);
        }
        x.setTransform(1, 0, 0, 1, 0, 0);
      }

      var mapPt = function (wx, wz) {
        var dx = wx - pp.x, dz = wz - pp.z;
        return [C + (dx * rx + dz * rz) * s, C - (dx * fx + dz * fz) * s];
      };

      // Anillos de distancia (20m y 40m)
      x.strokeStyle = 'rgba(214,178,96,0.20)';
      x.lineWidth = 1;
      for (var ri = 0; ri < 2; ri++) {
        var rr = ri === 0 ? 20 : 40;
        x.beginPath();
        x.arc(C, C, rr * s, 0, 6.2832);
        x.stroke();
      }

      // Puertas interactivas (AETH.vgai.doors)
      if (root.AETH && root.AETH.vgai && root.AETH.vgai.doors && Array.isArray(root.AETH.vgai.doors.list)) {
        var doors = root.AETH.vgai.doors.list;
        for (var di = 0; di < doors.length; di++) {
          var dr = doors[di];
          if (!dr || dr.level !== (typeof level !== 'undefined' ? level : dr.level)) continue;
          var dd2 = Math.hypot(dr.x - pp.x, dr.z - pp.z);
          if (dd2 > RA) continue;
          var dp = mapPt(dr.x, dr.z);
          x.fillStyle = dr.open ? '#6ec490' : '#f0b84a';
          x.fillRect(dp[0] - 3.5, dp[1] - 3.5, 7, 7);
        }
      }

      // Aliados (verde)
      var al = collectAllies();
      x.fillStyle = '#7cd06a';
      for (var ai = 0; ai < al.length; ai++) {
        var ap = mapPt(al[ai].g.position.x, al[ai].g.position.z);
        x.beginPath();
        x.arc(ap[0], ap[1], 5.5, 0, 6.2832);
        x.fill();
      }

      // Enemigos (rojo) y vehículos enemigos (naranja)
      if (typeof enemies !== 'undefined' && Array.isArray(enemies)) {
        for (var ei = 0; ei < enemies.length; ei++) {
          var e = enemies[ei];
          if (!e || !e.g || e.hp <= 0) continue;
          var edx = e.g.position.x - pp.x, edz = e.g.position.z - pp.z;
          if (edx * edx + edz * edz > RA * RA) continue;
          var ep = mapPt(e.g.position.x, e.g.position.z);
          x.fillStyle = (e.fl27 || 0) > 0 ? '#ffd040' : '#e03a2a';
          x.beginPath();
          x.arc(ep[0], ep[1], 5.5, 0, 6.2832);
          x.fill();
        }
      }
      if (typeof VEH32 !== 'undefined' && VEH32 && Array.isArray(VEH32.list)) {
        for (var vi = 0; vi < VEH32.list.length; vi++) {
          var v = VEH32.list[vi];
          if (!v || !v.g || v.hp <= 0) continue;
          if (Math.hypot(v.g.position.x - pp.x, v.g.position.z - pp.z) > RA) continue;
          var vp = mapPt(v.g.position.x, v.g.position.z);
          x.fillStyle = v.side === 'ally' ? '#68c8f0' : '#ff7a2a';
          x.fillRect(vp[0] - 6, vp[1] - 6, 12, 12);
        }
      }

      // Objetivo principal
      if (obj) {
        var op = mapPt(obj[0], obj[1]);
        var odx = op[0] - C, ody = op[1] - C, od = Math.hypot(odx, ody), lim = C - 18;
        var edge = false;
        if (od > lim) { op[0] = C + odx / od * lim; op[1] = C + ody / od * lim; edge = true; }
        var pu = 1 + Math.sin(state.t * 6) * 0.16;
        x.save();
        x.translate(op[0], op[1]);
        if (edge) {
          x.rotate(Math.atan2(ody, odx) + Math.PI / 2);
          x.fillStyle = '#ffd25a';
          x.beginPath();
          x.moveTo(0, -13 * pu);
          x.lineTo(9, 6);
          x.lineTo(-9, 6);
          x.closePath();
          x.fill();
        } else {
          x.scale(pu, pu);
          x.fillStyle = '#ffd25a';
          x.beginPath();
          for (var si = 0; si < 10; si++) {
            var sr = si % 2 ? 6 : 13, sa = si * Math.PI / 5 - Math.PI / 2;
            x.lineTo(Math.cos(sa) * sr, Math.sin(sa) * sr);
          }
          x.closePath();
          x.fill();
          x.strokeStyle = '#4a3010';
          x.lineWidth = 2;
          x.stroke();
        }
        x.restore();
      }

      // Jugador en el centro
      x.fillStyle = '#ffffff';
      x.strokeStyle = '#000000';
      x.lineWidth = 2;
      x.beginPath();
      x.moveTo(C, C - 12);
      x.lineTo(C + 8.5, C + 9);
      x.lineTo(C, C + 4.5);
      x.lineTo(C - 8.5, C + 9);
      x.closePath();
      x.fill();
      x.stroke();

      // Letra 'N' real proyectada en el borde del minimapa
      var np = mapPt(pp.x, pp.z - 100);
      var ndx = np[0] - C, ndy = np[1] - C, nd = Math.hypot(ndx, ndy) || 1;
      x.font = 'bold 21px Georgia';
      x.textAlign = 'center';
      x.textBaseline = 'middle';
      x.fillStyle = '#ffd268';
      x.fillText('N', C + ndx / nd * (C - 17), C + ndy / nd * (C - 17));
      x.restore();
    }

    // 2. BRÚJULA HORIZONTAL
    {
      var cx = k.getContext('2d'), CW = 880, CH = 68;
      cx.clearRect(0, 0, CW, CH);
      var bg = cx.createLinearGradient(0, 0, CW, 0);
      bg.addColorStop(0, 'rgba(20,16,10,0)');
      bg.addColorStop(0.14, 'rgba(20,16,10,0.68)');
      bg.addColorStop(0.86, 'rgba(20,16,10,0.68)');
      bg.addColorStop(1, 'rgba(20,16,10,0)');
      cx.fillStyle = bg;
      cx.fillRect(0, 8, CW, 46);

      var FOV_DEG = 110;
      var degToX = function (degTarget) {
        var rel = shortestAngleDiffDeg(hdDeg, degTarget);
        if (Math.abs(rel) > FOV_DEG / 2) return null;
        return CW / 2 + (rel / (FOV_DEG / 2)) * (CW / 2 - 36);
      };

      cx.textAlign = 'center';
      cx.textBaseline = 'middle';
      for (var tick = 0; tick < 24; tick++) {
        var deg = tick * 15;
        var tx = degToX(deg);
        if (tx === null) continue;
        var isCard = tick % 3 === 0;
        if (isCard) {
          var lbl = CARDS[tick / 3];
          cx.fillStyle = lbl === 'N' ? '#ffcf66' : '#e8c878';
          cx.font = (tick % 6 === 0 ? 'bold 23px' : '17px') + ' Georgia';
          cx.fillText(lbl, tx, 30);
        } else {
          cx.fillStyle = 'rgba(232,200,120,0.45)';
          cx.fillRect(tx - 1, 22, 2, 13);
        }
      }

      // Indicador central + rumbo exacto en grados
      cx.fillStyle = '#e8c878';
      cx.beginPath();
      cx.moveTo(CW / 2, 51);
      cx.lineTo(CW / 2 - 7, 62);
      cx.lineTo(CW / 2 + 7, 62);
      cx.closePath();
      cx.fill();

      // Enemigos cercanos como puntos discretos en la cinta (< 45m)
      if (typeof enemies !== 'undefined' && Array.isArray(enemies)) {
        cx.fillStyle = '#e04838';
        for (var j = 0; j < Math.min(enemies.length, 60); j++) {
          var en = enemies[j];
          if (!en || !en.g || en.hp <= 0) continue;
          if (Math.hypot(en.g.position.x - pp.x, en.g.position.z - pp.z) > 45) continue;
          var eb = bearingDeg(pp.x, pp.z, en.g.position.x, en.g.position.z);
          var ex = degToX(eb);
          if (ex !== null) {
            cx.beginPath();
            cx.arc(ex, 46, 3.5, 0, 6.2832);
            cx.fill();
          }
        }
      }

      // Objetivo principal en brújula + texto de distancia y rumbo
      var hdRounded = Math.round(hdDeg) % 360;
      var card = cardinalLabel(hdRounded);
      if (obj) {
        var bDeg = bearingDeg(pp.x, pp.z, obj[0], obj[1]);
        var ox = degToX(bDeg);
        var side = 0;
        if (ox === null) {
          var rel = shortestAngleDiffDeg(hdDeg, bDeg);
          side = rel > 0 ? 1 : -1;
          ox = side > 0 ? CW - 24 : 24;
        }
        cx.fillStyle = '#ffd25a';
        cx.save();
        cx.translate(ox, 30);
        if (side) {
          cx.scale(side, 1);
          cx.beginPath();
          cx.moveTo(11, 0);
          cx.lineTo(-4, -10);
          cx.lineTo(-4, 10);
          cx.closePath();
          cx.fill();
        } else {
          var pu2 = 1 + Math.sin(state.t * 6) * 0.14;
          cx.scale(pu2, pu2);
          cx.beginPath();
          for (var si2 = 0; si2 < 10; si2++) {
            var sr2 = si2 % 2 ? 5.5 : 13.5, sa2 = si2 * Math.PI / 5 - Math.PI / 2;
            cx.lineTo(Math.cos(sa2) * sr2, Math.sin(sa2) * sr2);
          }
          cx.closePath();
          cx.fill();
        }
        cx.restore();
        var dist = Math.round(Math.hypot(obj[0] - pp.x, obj[1] - pp.z));
        dd.textContent = 'OBJ · ' + dist + ' m · ' + hdRounded + '° ' + card;
      } else {
        dd.textContent = hdRounded + '° ' + card;
      }
    }
  }

  function installCompassHook() {
    if (typeof window.mm27 === 'function' && !window.mm27._vgai) {
      window.mm27 = drawUnifiedHud;
      window.mm27._vgai = true;
    } else if (typeof window.mm27 !== 'function') {
      window.mm27 = drawUnifiedHud;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installCompassHook);
  } else {
    installCompassHook();
  }
})(typeof window !== 'undefined' ? window : globalThis);
