/* ============================================================================
   V.GAI.1.0 · NÚCLEO DE LÓGICA PURA Y DETERMINISTA (CORE_VGAI)
   Módulo UMD (CommonJS para `node:test` + Global `window.CORE_VGAI`).
   Contiene matemáticas y reglas puras de:
   1. Puertas orientadas (AABB por giro real + empuje anti-atrapamiento)
   2. Colisiones globales soldado-soldado y jugador-soldado seguras con muros
   3. Percepción realista (conos, sigilo, niebla), memoria LKP, emoción/moral,
      asignación de slots de cobertura y prevención de fuego amigo
   4. Escala +18% de tanques y verificación de holgura en rutas/puentes
   5. Física y aterrizaje seguro de paracaidistas (Taijin)
   6. Restricción de armamento en Zepelín (solo pistola) y penetración AT
   7. Espacialización 3D de audio y limitador por frecuencia
   ============================================================================ */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }
  if (root) {
    root.CORE_VGAI = api;
    root.AETH = root.AETH || {};
    root.AETH.vgai = root.AETH.vgai || {};
    root.AETH.vgai.core = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this), function () {
  'use strict';

  function clamp(v, lo, hi) {
    return v < lo ? lo : (v > hi ? hi : v);
  }

  function normRad(a) {
    while (a > Math.PI) a -= Math.PI * 2;
    while (a < -Math.PI) a += Math.PI * 2;
    return a;
  }

  // -------------------------------------------------------------------------
  // 1. PUERTAS: AABB ORIENTADO POR BISAGRA Y ANTI-ATRAPAMIENTO
  // -------------------------------------------------------------------------
  function computeOrientedDoorAABB(door) {
    var w = door.width || 1.32;
    var th = door.thick || 0.18;
    var h = door.height || 2.25;
    var ry = door.ry || 0;
    var angle = door.angle || 0;
    var totalAng = ry + angle;

    var ux = Math.cos(ry);
    var uz = -Math.sin(ry);
    var hingeX = door.x - ux * (w * 0.5);
    var hingeZ = door.z - uz * (w * 0.5);

    var lx = Math.cos(totalAng);
    var lz = -Math.sin(totalAng);
    var cx = hingeX + lx * (w * 0.5);
    var cz = hingeZ + lz * (w * 0.5);

    var c = Math.abs(lx);
    var s = Math.abs(lz);
    var hw = Math.max(0.12, (w * 0.5) * c + (th * 0.5) * s);
    var hd = Math.max(0.12, (w * 0.5) * s + (th * 0.5) * c);

    return {
      x: cx,
      z: cz,
      hw: hw,
      hd: hd,
      h: h,
      y0: door.y || 0,
      door: true
    };
  }

  function computeDoorPinchPushout(door, actorPos, radius) {
    if (!door || !actorPos) return null;
    var r = radius || 0.42;
    var box = computeOrientedDoorAABB(door);
    var dx = actorPos.x - box.x;
    var dz = actorPos.z - box.z;
    var ox = (box.hw + r) - Math.abs(dx);
    var oz = (box.hd + r) - Math.abs(dz);
    if (ox <= 0 || oz <= 0) return null;
    if (ox < oz) {
      return { dx: (dx >= 0 ? 1 : -1) * (ox + 0.04), dz: 0 };
    }
    return { dx: 0, dz: (dz >= 0 ? 1 : -1) * (oz + 0.04) };
  }

  // -------------------------------------------------------------------------
  // 2. COLISIONES GLOBALES SOLDADO-SOLDADO Y JUGADOR-SOLDADO
  // -------------------------------------------------------------------------
  function getActorRadius(actor, defaultR) {
    if (!actor) return defaultR;
    if (actor.down17 || actor.down29 || actor.act === 'lie' || actor.act === 'gdead') return defaultR * 0.58;
    if (actor.cr17 || actor.cr || actor.act === 'crouch' || actor.act === 'crouchaim' || actor.act === 'ghide') return defaultR * 0.85;
    return defaultR;
  }

  function tryMoveWithWallCheck(x, z, dx, dz, r, isBlockedFn) {
    if (typeof isBlockedFn !== 'function') return { x: x + dx, z: z + dz };
    if (!isBlockedFn(x + dx, z + dz, r)) return { x: x + dx, z: z + dz };
    if (!isBlockedFn(x + dx, z, r)) return { x: x + dx, z: z };
    if (!isBlockedFn(x, z + dz, r)) return { x: x, z: z + dz };
    return { x: x, z: z };
  }

  function solveSoldierCollisions(actors, playerPos, isBlockedFn, opts) {
    opts = opts || {};
    var baseR = opts.radius || 0.42;
    var playerR = opts.playerRadius || 0.44;
    var stiffness = opts.stiffness || 0.65;
    var pushPlayer = !!opts.pushPlayer;
    var maxPairs = 0;

    if (!Array.isArray(actors)) return { pairsResolved: 0, playerAdjusted: false };

    var n = actors.length;
    var playerAdjusted = false;

    for (var i = 0; i < n; i++) {
      var a = actors[i];
      if (!a || a.hp <= 0 || a.dead17) continue;
      var ax = a.x, az = a.z;
      var ar = getActorRadius(a, baseR);

      // Colisión entre soldados
      for (var j = i + 1; j < n; j++) {
        var b = actors[j];
        if (!b || b.hp <= 0 || b.dead17) continue;
        if (Math.abs((a.y || 0) - (b.y || 0)) > 1.65) continue;
        var br = getActorRadius(b, baseR);
        var minDist = ar + br;
        var dx = b.x - a.x;
        var dz = b.z - a.z;
        var d2 = dx * dx + dz * dz;
        if (d2 >= minDist * minDist) continue;

        var dist = Math.sqrt(d2);
        var nx, nz;
        if (dist < 1e-4) {
          var ang = ((i * 7 + j * 13) % 16) * (Math.PI / 8);
          nx = Math.cos(ang);
          nz = Math.sin(ang);
          dist = 0.001;
        } else {
          nx = dx / dist;
          nz = dz / dist;
        }
        var overlap = (minDist - dist) * stiffness;
        var wa = a.pinned ? 0 : (b.pinned ? 1.0 : 0.5);
        var wb = b.pinned ? 0 : (a.pinned ? 1.0 : 0.5);

        if (wa > 0) {
          var pa = tryMoveWithWallCheck(a.x, a.z, -nx * overlap * wa, -nz * overlap * wa, ar * 0.85, isBlockedFn);
          a.x = pa.x;
          a.z = pa.z;
        }
        if (wb > 0) {
          var pb = tryMoveWithWallCheck(b.x, b.z, nx * overlap * wb, nz * overlap * wb, br * 0.85, isBlockedFn);
          b.x = pb.x;
          b.z = pb.z;
        }
        maxPairs++;
      }

      // Colisión Soldado vs Jugador
      if (playerPos && Math.abs((a.y || 0) - (playerPos.y || 0)) <= 1.65) {
        var pdx = a.x - playerPos.x;
        var pdz = a.z - playerPos.z;
        var pMin = ar + playerR;
        var pd2 = pdx * pdx + pdz * pdz;
        if (pd2 < pMin * pMin) {
          var pd = Math.sqrt(pd2);
          var pnx, pnz;
          if (pd < 1e-4) {
            pnx = 1;
            pnz = 0;
          } else {
            pnx = pdx / pd;
            pnz = pdz / pd;
          }
          var pov = (pMin - pd) * 0.78;
          if (!a.pinned) {
            var nextA = tryMoveWithWallCheck(a.x, a.z, pnx * pov, pnz * pov, ar * 0.85, isBlockedFn);
            a.x = nextA.x;
            a.z = nextA.z;
          } else if (pushPlayer) {
            var nextP = tryMoveWithWallCheck(playerPos.x, playerPos.z, -pnx * pov, -pnz * pov, playerR * 0.85, isBlockedFn);
            playerPos.x = nextP.x;
            playerPos.z = nextP.z;
            playerAdjusted = true;
          }
          maxPairs++;
        }
      }
    }

    return { pairsResolved: maxPairs, playerAdjusted: playerAdjusted };
  }

  // -------------------------------------------------------------------------
  // 3. CEREBRO TÁCTICO (INSPIRACIÓN IRON MOD ADAPTADA SIN TELEPATÍA)
  // -------------------------------------------------------------------------
  function computePerception(observer, target, env) {
    env = env || {};
    var dx = target.x - observer.x;
    var dz = target.z - observer.z;
    var dist = Math.hypot(dx, dz);
    var baseRange = observer.visRange || 95;
    var fogMul = clamp(env.fogFactor != null ? env.fogFactor : 1, 0.25, 1.25);

    var stanceMul = target.prone ? 0.42 : (target.crouch ? 0.64 : 1.0);
    if (target.inCover && (target.crouch || target.prone)) stanceMul *= 0.78;
    if (target.speed > 5.5) stanceMul *= 1.28;
    else if (target.speed < 0.4) stanceMul *= 0.86;
    if (target.firedRecently) stanceMul = Math.max(stanceMul, 1.55);

    var effRange = baseRange * fogMul * (observer.eyeSkill || 1) * clamp(stanceMul, 0.3, 1.35);
    if (dist > effRange) {
      return { visible: false, dist: dist, score: 0, inCone: false };
    }

    var angToTarget = Math.atan2(dx, dz);
    var relAng = Math.abs(normRad(angToTarget - (observer.yaw || 0)));
    var fovealCone = observer.alerted ? 1.15 : 0.85;
    var periphCone = observer.alerted ? 1.85 : 1.35;

    var inCone = dist <= 3.2 || relAng <= periphCone;
    if (!inCone) {
      return { visible: false, dist: dist, score: 0, inCone: false };
    }

    var coneMul = relAng <= fovealCone ? 1.0 : 0.52;
    var hasLos = env.losClear != null ? !!env.losClear : true;
    if (!hasLos) {
      return { visible: false, dist: dist, score: 0, inCone: true };
    }

    var distFactor = clamp(1.15 - dist / Math.max(10, effRange), 0.12, 1.0);
    return {
      visible: true,
      dist: dist,
      inCone: true,
      foveal: relAng <= fovealCone,
      score: clamp(distFactor * coneMul * stanceMul, 0, 1.5)
    };
  }

  function decayMemory(mem, dt) {
    if (!mem) return mem;
    var d = Math.max(0, dt || 0);
    mem.timeSinceSeen = (mem.timeSinceSeen || 0) + d;
    if (mem.visible) {
      mem.confidence = clamp((mem.confidence || 0.5) + d * 1.4, 0, 1);
      mem.timeSinceSeen = 0;
    } else {
      var decayRate = mem.timeSinceSeen > 12 ? 0.14 : 0.055;
      mem.confidence = Math.max(0, (mem.confidence || 0) - decayRate * d);
      if (mem.confidence <= 0.08) {
        mem.know = Math.min(mem.know || 0, 1);
      }
    }
    return mem;
  }

  function computeEmotionPersonality(profile, stress, alliesDown) {
    profile = profile || {};
    var st = clamp(stress || 0, 0, 4);
    var losses = Math.max(0, alliesDown || 0);
    var bravery = clamp(profile.brave != null ? profile.brave : 0.8, 0.3, 1.3);
    var fear = clamp((st * 0.32 + losses * 0.22) / bravery, 0, 1);
    var aggression = clamp((profile.adv != null ? profile.adv : 0.65) * (1 - fear * 0.55), 0.15, 1.4);
    var coverBias = clamp((profile.cov != null ? profile.cov : 1.0) * (1 + fear * 0.6), 0.5, 1.9);
    var spreadMul = 1 + fear * 0.48;
    var panic = fear >= 0.82 && bravery < 0.9;
    return {
      fear: fear,
      aggression: aggression,
      coverBias: coverBias,
      spreadMul: spreadMul,
      panic: panic
    };
  }

  function allocateCoverSlots(squad, threatPos, covers) {
    if (!Array.isArray(squad) || !Array.isArray(covers) || !threatPos) return [];
    var used = [];
    var assignments = [];
    for (var i = 0; i < squad.length; i++) {
      var u = squad[i];
      if (!u || u.hp <= 0) continue;
      var best = null;
      var bestScore = 1e9;
      for (var c = 0; c < covers.length; c++) {
        var cv = covers[c];
        if (!cv) continue;
        // Evitar solape de slots entre miembros
        var clash = false;
        for (var k = 0; k < used.length; k++) {
          if (Math.hypot(cv.x - used[k].x, cv.z - used[k].z) < 2.1) {
            clash = true;
            break;
          }
        }
        if (clash) continue;
        // Verificar que la cobertura realmente interpone obstáculo hacia la amenaza
        if (cv.ox != null && cv.oz != null) {
          var bx = cv.ox - cv.x, bz = cv.oz - cv.z;
          var ux = threatPos.x - cv.x, uz = threatPos.z - cv.z;
          if (bx * ux + bz * uz <= 0) continue;
        }
        var dSelf = Math.hypot(cv.x - u.x, cv.z - u.z);
        var dThreat = Math.hypot(cv.x - threatPos.x, cv.z - threatPos.z);
        if (dThreat < 6) continue;
        var s = dSelf + Math.abs(dThreat - (u.prefRange || 22)) * 0.45;
        if (s < bestScore) {
          bestScore = s;
          best = cv;
        }
      }
      if (best) {
        used.push(best);
        assignments.push({ unitId: u.id != null ? u.id : i, cover: best });
      }
    }
    return assignments;
  }

  function hasFriendlyFireRisk(shooter, targetPos, allies, playerPos) {
    if (!shooter || !targetPos) return false;
    var dx = targetPos.x - shooter.x;
    var dz = targetPos.z - shooter.z;
    var dist = Math.hypot(dx, dz);
    if (dist < 1.2) return false;
    var ux = dx / dist;
    var uz = dz / dist;
    var laneW = shooter.laneHalfWidth || 0.85;

    function checkActor(act) {
      if (!act || act === shooter || (act.hp != null && act.hp <= 0)) return false;
      var qx = act.x - shooter.x;
      var qz = act.z - shooter.z;
      var proj = qx * ux + qz * uz;
      if (proj < 0.75 || proj > dist - 0.8) return false;
      var perp = Math.abs(qx * uz - qz * ux);
      return perp < laneW;
    }

    if (Array.isArray(allies)) {
      for (var i = 0; i < allies.length; i++) {
        if (checkActor(allies[i])) return true;
      }
    }
    if (playerPos && shooter.avoidPlayer && checkActor(playerPos)) return true;
    return false;
  }

  // -------------------------------------------------------------------------
  // 4. ESCALA DE TANQUES +18% Y VERIFICACIÓN DE HOLGURA EN RUTAS
  // -------------------------------------------------------------------------
  function scaleTankSpec(spec, factor) {
    var s = factor != null ? factor : 1.18;
    var out = Object.assign({}, spec);
    out.hw = +(spec.hw * s).toFixed(4);
    out.hd = +(spec.hd * s).toFixed(4);
    out.h = +(spec.h * s).toFixed(4);
    out.cz = +((spec.cz || 0) * s).toFixed(4);
    if (spec.zf != null) out.zf = +(spec.zf * s).toFixed(4);
    if (spec.zb != null) out.zb = +(spec.zb * s).toFixed(4);
    out.visualScale = s;
    return out;
  }

  function checkRouteClearance(spec, corridors) {
    var fullWidth = (spec.hw || 1) * 2;
    var report = [];
    for (var i = 0; i < corridors.length; i++) {
      var c = corridors[i];
      var margin = c.width - fullWidth;
      report.push({
        name: c.name,
        corridorWidth: c.width,
        vehicleWidth: +fullWidth.toFixed(3),
        margin: +margin.toFixed(3),
        ok: margin >= 1.0
      });
    }
    return report;
  }

  // -------------------------------------------------------------------------
  // 5. FÍSICA DE PARACAIDISTAS (TAIJIN) Y ATERRIZAJE SEGURO
  // -------------------------------------------------------------------------
  function findSafeLandingSpot(x, z, floorFn, isBlockedFn, maxR) {
    var limit = maxR || 48;
    var y0 = typeof floorFn === 'function' ? floorFn(x, z) : 0;
    var blk0 = typeof isBlockedFn === 'function' ? isBlockedFn(x, z, 0.65) : false;
    if (!blk0 && isFinite(y0)) return { x: x, z: z, y: y0, adjusted: false };
    for (var r = 2.5; r <= limit; r += 2.5) {
      for (var a = 0; a < Math.PI * 2; a += Math.PI / 6) {
        var nx = x + Math.cos(a) * r;
        var nz = z + Math.sin(a) * r;
        var ny = typeof floorFn === 'function' ? floorFn(nx, nz) : 0;
        var blk = typeof isBlockedFn === 'function' ? isBlockedFn(nx, nz, 0.65) : false;
        if (!blk && isFinite(ny)) {
          return { x: nx, z: nz, y: ny, adjusted: true };
        }
      }
    }
    return { x: x, z: z, y: isFinite(y0) ? y0 : 0, adjusted: false };
  }

  function stepParatrooperPhysics(p, dt, wind, floorFn, isBlockedFn, peers) {
    var d = Math.min(0.05, Math.max(0.001, dt || 0.016));
    wind = wind || { x: 0.75, z: -0.25 };
    p.phaseTime = (p.phaseTime || 0) + d;

    if (!p.open && (p.requestOpen || p.y <= (p.autoOpenAlt || 105))) {
      p.open = true;
      p.inflation = p.inflation || 0.05;
    }

    if (p.open) {
      p.inflation = Math.min(1, (p.inflation || 0) + d * 1.45);
    } else {
      p.inflation = 0;
    }

    var targetVy = p.open ? (-30 + 24.6 * p.inflation) : -28;
    if (p.open && p.braking && p.y < 14) targetVy = Math.min(-3.0, targetVy + 1.8);
    p.vy += (targetVy - (p.vy || 0)) * Math.min(1, d * (p.open ? 3.2 : 1.1));

    var ctrlX = (p.steerX || 0) * (p.open ? 5.8 : 3.2);
    var ctrlZ = (p.steerZ || 0) * (p.open ? 5.8 : 3.2);
    var sepX = 0, sepZ = 0;

    if (Array.isArray(peers)) {
      for (var i = 0; i < peers.length; i++) {
        var o = peers[i];
        if (!o || o === p || o.landed) continue;
        var dx = p.x - o.x;
        var dz = p.z - o.z;
        var dist = Math.hypot(dx, dz);
        if (dist > 0.01 && dist < 4.5 && Math.abs((p.y || 0) - (o.y || 0)) < 8) {
          var f = (4.5 - dist) * 1.4;
          sepX += (dx / dist) * f;
          sepZ += (dz / dist) * f;
        }
      }
    }

    var avoidX = 0, avoidZ = 0;
    if (p.y < 28 && typeof isBlockedFn === 'function' && isBlockedFn(p.x, p.z, 1.1)) {
      var safe = findSafeLandingSpot(p.x, p.z, floorFn, isBlockedFn, 28);
      var adx = safe.x - p.x;
      var adz = safe.z - p.z;
      var ad = Math.hypot(adx, adz);
      if (ad > 0.1) {
        avoidX = (adx / ad) * 6.5;
        avoidZ = (adz / ad) * 6.5;
      }
    }

    var desVx = ctrlX + wind.x * (p.open ? 0.9 : 0.35) + sepX + avoidX;
    var desVz = ctrlZ + wind.z * (p.open ? 0.9 : 0.35) + sepZ + avoidZ;
    p.vx = (p.vx || 0) + (desVx - (p.vx || 0)) * Math.min(1, d * 2.2);
    p.vz = (p.vz || 0) + (desVz - (p.vz || 0)) * Math.min(1, d * 2.2);

    p.x += p.vx * d;
    p.z += p.vz * d;
    p.y += p.vy * d;

    p.swayRoll = p.open ? Math.sin(p.phaseTime * 2.1 + (p.seed || 0)) * 0.08 + clamp(p.vx * 0.015, -0.18, 0.18) : 0;
    p.swayPitch = p.open ? Math.cos(p.phaseTime * 1.7 + (p.seed || 0)) * 0.06 - clamp(p.vz * 0.015, -0.16, 0.16) : 0;

    var groundY = typeof floorFn === 'function' ? floorFn(p.x, p.z) : 0;
    if (!isFinite(groundY)) groundY = 0;
    if (p.y <= groundY) {
      var spot = findSafeLandingSpot(p.x, p.z, floorFn, isBlockedFn, 40);
      p.x = spot.x;
      p.z = spot.z;
      p.y = spot.y;
      p.vy = 0;
      p.landed = true;
    }
    return p;
  }

  // -------------------------------------------------------------------------
  // 6. ARMAMENTO: ZEPELÍN SOLO PISTOLA & FUSIL ANTITANQUE
  // -------------------------------------------------------------------------
  function computeWeaponRestriction(levelId, requestedWeapon) {
    if (levelId === 12) {
      return {
        allowed: requestedWeapon === 'revolver',
        enforcedWeapon: 'revolver',
        viewmodelKey: 'P',
        hudLabel: 'PISTOLA LUGY 7,65 mm'
      };
    }
    return {
      allowed: true,
      enforcedWeapon: requestedWeapon,
      viewmodelKey: null,
      hudLabel: null
    };
  }

  function computeAtRifleDamage(baseDmg, targetType, armorFactor, dist) {
    var dmg = baseDmg || 260;
    var rangeFalloff = dist > 140 ? clamp(1 - (dist - 140) / 220, 0.45, 1) : 1;
    var arm = clamp(armorFactor != null ? armorFactor : 0.35, 0.05, 1);
    var typeMul = targetType === 'tank' ? 1.15 : (targetType === 'car' ? 1.45 : (targetType === 'gun' ? 1.3 : 1.0));
    return Math.round(dmg * rangeFalloff * typeMul * (0.55 + arm * 0.9));
  }

  // -------------------------------------------------------------------------
  // 7. AUDIO ESPACIAL Y LIMITACIÓN DE FRECUENCIA
  // -------------------------------------------------------------------------
  function computeAudioSpatial(srcX, srcZ, listenerX, listenerZ, maxDist, indoor, yaw) {
    var dx = srcX - listenerX;
    var dz = srcZ - listenerZ;
    var dist = Math.hypot(dx, dz);
    var lim = maxDist || 90;
    if (dist >= lim) return { audible: false, gain: 0, pan: 0, lowpassHz: 800, dist: dist };
    var atten = Math.pow(Math.max(0, 1 - dist / lim), 1.35);
    var pan = 0;
    if (dist > 0.4 && typeof yaw === 'number') {
      var rx = Math.cos(yaw), rz = -Math.sin(yaw);
      pan = clamp((dx * rx + dz * rz) / dist, -0.9, 0.9);
    }
    var baseCutoff = indoor ? 1850 : 4200;
    var lowpassHz = Math.max(620, baseCutoff - dist * 26);
    return {
      audible: atten > 0.015,
      gain: atten,
      pan: pan,
      lowpassHz: Math.round(lowpassHz),
      dist: dist
    };
  }

  function canTriggerRateLimited(lastMap, key, nowMs, gapMs) {
    if (!lastMap || !key) return true;
    var prev = lastMap[key] || 0;
    if (nowMs - prev < (gapMs || 0)) return false;
    lastMap[key] = nowMs;
    return true;
  }

  return {
    version: 'V.GAI.1.0',
    computeOrientedDoorAABB: computeOrientedDoorAABB,
    computeDoorPinchPushout: computeDoorPinchPushout,
    solveSoldierCollisions: solveSoldierCollisions,
    computePerception: computePerception,
    decayMemory: decayMemory,
    computeEmotionPersonality: computeEmotionPersonality,
    allocateCoverSlots: allocateCoverSlots,
    hasFriendlyFireRisk: hasFriendlyFireRisk,
    scaleTankSpec: scaleTankSpec,
    checkRouteClearance: checkRouteClearance,
    findSafeLandingSpot: findSafeLandingSpot,
    stepParatrooperPhysics: stepParatrooperPhysics,
    computeWeaponRestriction: computeWeaponRestriction,
    computeAtRifleDamage: computeAtRifleDamage,
    computeAudioSpatial: computeAudioSpatial,
    canTriggerRateLimited: canTriggerRateLimited
  };
});
