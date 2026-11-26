/* ============================================================================
   V.GAI.1.0 · PARACAIDISTAS DE TAIJIN (NIVEL 16 — v30_taikin.js)
   - Física realista con viento, apertura gradual de campana y amortiguación pendular
   - Evasión de canal (|z+40|<8.5) y obstáculos (obstB) + separación entre paracaidistas
   - Aterrizaje seguro sobre floorAt mediante CORE_VGAI.findSafeLandingSpot
   ============================================================================ */
(function (root) {
  'use strict';

  var api = {
    version: 'V.GAI.1.0',
    wind: { x: -1.8, z: 0.9 }
  };

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    root.PARATROOPERS_VGAI = api;
    return;
  }

  function isBlockedAtTaijin(nx, nz) {
    if (Math.abs(nz + 40) < 8.5) return true;
    if (typeof blockedAt === 'function' && blockedAt(nx, nz, 0.2)) return true;
    return false;
  }

  function floorAtTaijin(nx, nz) {
    return typeof floorAt === 'function' ? (floorAt({ x: nx, y: 0.5, z: nz }) || 0) : 0;
  }

  function stepEntityDescent(st, dt, isPlayer, peers) {
    if (!root.CORE_VGAI || typeof root.CORE_VGAI.stepParatrooperPhysics !== 'function') return st;
    var steerX = 0, steerZ = 0;
    if (isPlayer && typeof yaw !== 'undefined' && typeof keys !== 'undefined') {
      var fx = -Math.sin(yaw), fz = -Math.cos(yaw), rx = Math.cos(yaw), rz = -Math.sin(yaw);
      var mf = (keys.KeyW ? 1 : 0) - (keys.KeyS ? 1 : 0);
      var mr = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0);
      steerX = fx * mf + rx * mr;
      steerZ = fz * mf + rz * mr;
      var sl = Math.hypot(steerX, steerZ);
      if (sl > 1) { steerX /= sl; steerZ /= sl; }
    } else if (st.target) {
      var tx = st.target.x - st.x, tz = st.target.z - st.z, td = Math.hypot(tx, tz) || 1;
      if (td > 2) { steerX = tx / td * 0.7; steerZ = tz / td * 0.7; }
    }

    // Evitar caer al canal de Taikin en descenso automático
    if (Math.abs(st.z + 40) < 12) {
      steerZ += (st.z >= -40 ? 0.9 : -0.9);
    }

    st.steerX = steerX;
    st.steerZ = steerZ;
    return root.CORE_VGAI.stepParatrooperPhysics(
      st,
      dt || 0.016,
      api.wind,
      floorAtTaijin,
      isBlockedAtTaijin,
      peers || []
    );
  }

  function installParatrooperHooks() {
    if (api._installed) return;
    api._installed = true;

    if (typeof window.startDescent16 === 'function' && !window.startDescent16._vgaiPara) {
      var _sd16 = window.startDescent16;
      window.startDescent16 = function () {
        var r = _sd16.apply(this, arguments);
        if (typeof N16 !== 'undefined' && N16 && N16.desc) {
          N16.desc.inflate = 0.25;
          N16.desc.swingX = 0;
          N16.desc.swingZ = 0;
        }
        return r;
      };
      window.startDescent16._vgaiPara = true;
    }

    if (typeof window.descentUpd16 === 'function' && !window.descentUpd16._vgaiPara) {
      var _du16 = window.descentUpd16;
      window.descentUpd16 = function (dt) {
        if (typeof N16 !== 'undefined' && N16 && N16.desc && typeof P !== 'undefined' && P && P.g && N16.desc.open) {
          var d = N16.desc;
          var st = {
            x: P.g.position.x,
            y: P.g.position.y,
            z: P.g.position.z,
            vx: d.vx || 0,
            vy: d.vy || -4.5,
            vz: d.vz || 0,
            open: !!d.open,
            inflation: d.inflate !== undefined ? d.inflate : 1,
            phaseTime: d.phaseTime || 0,
            swayPitch: d.swingX || 0,
            swayRoll: d.swingZ || 0
          };
          var res = stepEntityDescent(st, dt, true, null);
          if (res) {
            d.vx = st.vx; d.vy = st.vy; d.vz = st.vz;
            d.inflate = st.inflation; d.phaseTime = st.phaseTime;
            d.swingX = st.swayPitch || 0; d.swingZ = st.swayRoll || 0;
            if (d.can && d.can.rotation) {
              d.can.rotation.x = d.swingX;
              d.can.rotation.z = -d.swingZ;
              var sc = 0.65 + 0.35 * d.inflate;
              d.can.scale.set(sc, 0.8 + 0.2 * d.inflate, sc);
            }
          }
        }
        return _du16.apply(this, arguments);
      };
      window.descentUpd16._vgaiPara = true;
    }

    if (typeof window.land16 === 'function' && !window.land16._vgaiPara) {
      var _la16 = window.land16;
      window.land16 = function () {
        var r = _la16.apply(this, arguments);
        if (typeof P !== 'undefined' && P && P.g && root.CORE_VGAI && typeof root.CORE_VGAI.findSafeLandingSpot === 'function') {
          var spot = root.CORE_VGAI.findSafeLandingSpot(P.g.position.x, P.g.position.z, floorAtTaijin, isBlockedAtTaijin, 40);
          P.g.position.x = spot.x;
          P.g.position.z = spot.z;
          P.g.position.y = spot.y;
        }
        return r;
      };
      window.land16._vgaiPara = true;
    }

    if (typeof window.reinfUpd16 === 'function' && !window.reinfUpd16._vgaiPara) {
      var _rf16 = window.reinfUpd16;
      window.reinfUpd16 = function (dt) {
        var r = _rf16.apply(this, arguments);
        if (typeof N16 !== 'undefined' && N16 && Array.isArray(N16.rf)) {
          var peers = [];
          for (var i = 0; i < N16.rf.length; i++) {
            var rf = N16.rf[i];
            if (rf && rf.desc && rf.g) peers.push({ x: rf.g.position.x, y: rf.g.position.y, z: rf.g.position.z, landed: false });
          }
          for (var j = 0; j < N16.rf.length; j++) {
            var n = N16.rf[j];
            if (!n || !n.g) continue;
            if (n.desc) {
              var st = {
                x: n.g.position.x,
                y: n.g.position.y,
                z: n.g.position.z,
                vx: n.vx || 0,
                vy: n.vy || -5.0,
                vz: n.vz || 0,
                open: true,
                inflation: n.inflate !== undefined ? n.inflate : 0.85,
                phaseTime: n.phaseTime || 0,
                seed: j * 1.7,
                target: typeof P !== 'undefined' && P && P.g ? P.g.position : null
              };
              stepEntityDescent(st, dt, false, peers);
              n.vx = st.vx; n.vy = st.vy; n.vz = st.vz;
              n.inflate = st.inflation; n.phaseTime = st.phaseTime;
              n.swingX = st.swayPitch || 0; n.swingZ = st.swayRoll || 0;
              n.g.position.x = st.x;
              n.g.position.z = st.z;
              if (n.can && n.can.rotation) {
                n.can.rotation.x = n.swingX * 0.8;
                n.can.rotation.z = -n.swingZ * 0.8;
              }
            } else if (!n._vgaiSafeLanded && root.CORE_VGAI && typeof root.CORE_VGAI.findSafeLandingSpot === 'function') {
              n._vgaiSafeLanded = true;
              var safe = root.CORE_VGAI.findSafeLandingSpot(n.g.position.x, n.g.position.z, floorAtTaijin, isBlockedAtTaijin, 40);
              n.g.position.x = safe.x;
              n.g.position.z = safe.z;
              n.g.position.y = safe.y;
              if (n.can) n.can.visible = false;
            }
          }
        }
        return r;
      };
      window.reinfUpd16._vgaiPara = true;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installParatrooperHooks);
  } else {
    installParatrooperHooks();
  }

  window.PARATROOPERS_VGAI = api;
  window.AETH = window.AETH || {};
  window.AETH.vgai = window.AETH.vgai || {};
  window.AETH.vgai.paratroopers = api;
})(typeof window !== 'undefined' ? window : globalThis);
