/* ============================================================================
   V.GAI.1.0 · CEREBRO TÁCTICO DE NPC Y COLISIONES GLOBALES DE SOLDADOS
   - Elimina omnisciencia AI33.cfg.rumor (percepción visual + oído real + radio local)
   - Memoria LKP con decaimiento temporal, personalidades/emociones estilo Iron Mod
   - Slots de cobertura distribuidos, recarga protegida y prevención de fuego amigo
   - Resolución global de colisiones entre soldados y jugador sin asignaciones por frame
   ============================================================================ */
(function (root) {
  'use strict';

  var api = {
    version: 'V.GAI.1.0',
    stats: { perceptionChecks: 0, coverAllocated: 0, ffHeld: 0, colSolves: 0 }
  };

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    root.AI_TACTICAL_VGAI = api;
    return;
  }

  // Estructuras reutilizables (cero GC por frame)
  var UNIT_POOL = [];
  var ALLY_SCRATCH = [];
  var COVER_USED = Object.create(null);
  var COVER_CAND = [];
  var SQUAD_SCRATCH = [{ id: 0, x: 0, z: 0, hp: 100, prefRange: 22 }];
  var OBS_DESC = { x: 0, z: 0, yaw: 0, visRange: 95, alerted: false, eyeSkill: 1 };
  var TGT_DESC = { x: 0, z: 0, crouch: false, prone: false, speed: 2.0, inCover: false, firedRecently: false };
  var ENV_DESC = { losClear: true, fogFactor: 1.0 };
  var PLAYER_POS = { x: 0, y: 0, z: 0 };
  var COL_OPTS = { radius: 0.48, playerRadius: 0.52, stiffness: 0.65, pushPlayer: true };
  var MAX_POOL = 240;

  function ensureUnitTraits(e) {
    if (!e || e._vgaiTraits) return e && e._vgaiTraits;
    var seed = ((e.g && e.g.id) || 1) * 1.618;
    var r1 = (Math.sin(seed * 12.9898) * 43758.5453) % 1;
    var r2 = (Math.cos(seed * 78.233) * 24634.6345) % 1;
    if (r1 < 0) r1 += 1;
    if (r2 < 0) r2 += 1;
    e._vgaiTraits = {
      brave: 0.45 + r1 * 0.65,
      adv: 0.45 + r2 * 0.55,
      cov: 0.85 + ((1 - r1) * 0.4)
    };
    e._vgaiEmo = { fear: 0, aggression: 0.65, coverBias: 1.0, spreadMul: 1.0, panic: false };
    e._vgaiMem = { visible: false, confidence: e.unaware ? 0.0 : 0.7, timeSinceSeen: e.unaware ? 99 : 0, know: e.unaware ? 0 : 2, lkpX: null, lkpZ: null };
    if (e.sp && !e._vgaiBaseSp) e._vgaiBaseSp = e.sp;
    return e._vgaiTraits;
  }

  function currentFogFactor() {
    if (typeof scene !== 'undefined' && scene && scene.fog && scene.fog.far) {
      return Math.max(0.35, Math.min(1.15, scene.fog.far / 150));
    }
    return 1.0;
  }

  function isWallBlockedForCol(nx, nz, rad) {
    if (typeof blockedAt !== 'function') return false;
    var py = (typeof P !== 'undefined' && P && P.g) ? (P.g.position.y || 0) : 0;
    return !!blockedAt(nx, nz, py);
  }

  function installTacticalAI() {
    if (api._installed) return;
    api._installed = true;

    if (typeof AI33 !== 'undefined' && AI33) {
      // Eliminar omnisciencia global
      if (AI33.cfg) {
        AI33.cfg.rumor = false;
        AI33.cfg.mem = 8.5;
        AI33.cfg.peek = 2.2;
        AI33.cfg.relocate = 1.6;
      }

      // Percepción realista con cono visual, sigilo postural, niebla y memoria LKP
      var _see = AI33.seeE33;
      AI33.seeE33 = function (e, dt) {
        if (!e || !e.g) return _see ? _see.apply(this, arguments) : false;
        if (!root.CORE_VGAI || typeof root.CORE_VGAI.computePerception !== 'function') {
          return _see ? _see.apply(this, arguments) : true;
        }
        api.stats.perceptionChecks++;
        ensureUnitTraits(e);
        var mem = e._vgaiMem;

        var tgt = typeof AI33.e8T === 'function' ? AI33.e8T(e) : null;
        var tPos = tgt && tgt.p ? tgt.p : (typeof P !== 'undefined' && P && P.g ? P.g.position : null);
        if (!tPos) return false;

        var tObj = tgt ? tgt.t : (typeof P !== 'undefined' ? P : null);
        TGT_DESC.x = tPos.x;
        TGT_DESC.z = tPos.z;
        if (typeof P !== 'undefined' && P && tObj === P) {
          TGT_DESC.crouch = !!P.cr;
          TGT_DESC.prone = !!P.pr;
          TGT_DESC.speed = Math.hypot(P.mvx || 0, P.mvz || 0);
          TGT_DESC.inCover = !!P.cov;
          TGT_DESC.firedRecently = (typeof P.fireCd === 'number' && P.fireCd > 0) || (typeof firing !== 'undefined' && !!firing);
        } else if (tObj) {
          TGT_DESC.crouch = tObj.st === 'hide' || tObj.act === 'crouch';
          TGT_DESC.prone = !!tObj.pr;
          TGT_DESC.speed = Math.hypot(tObj.vx || 0, tObj.vz || 0);
          TGT_DESC.inCover = !!tObj.cv;
          TGT_DESC.firedRecently = false;
        } else {
          TGT_DESC.crouch = false;
          TGT_DESC.prone = false;
          TGT_DESC.speed = 2.0;
          TGT_DESC.inCover = false;
          TGT_DESC.firedRecently = false;
        }

        var eyeY = (e.g.position.y || 0) + 1.55 * (e.s || 1);
        var tgtY = (tPos.y || 0) + (TGT_DESC.prone ? 0.45 : (TGT_DESC.crouch ? 0.9 : 1.45));
        ENV_DESC.losClear = typeof losClear === 'function' ? !!losClear(e.g.position.x, eyeY, e.g.position.z, tPos.x, tgtY, tPos.z) : true;
        ENV_DESC.fogFactor = currentFogFactor();

        OBS_DESC.x = e.g.position.x;
        OBS_DESC.z = e.g.position.z;
        OBS_DESC.yaw = e.g.rotation.y || 0;
        OBS_DESC.visRange = (typeof level !== 'undefined' && (level === 16 || level === 18)) ? 85 : 105;
        OBS_DESC.alerted = !e.unaware;
        OBS_DESC.eyeSkill = (e._vgaiTraits && e._vgaiTraits.brave > 0.85) ? 1.08 : 1.0;

        var res = root.CORE_VGAI.computePerception(OBS_DESC, TGT_DESC, ENV_DESC);
        mem.visible = !!res.visible;
        if (res.visible) {
          mem.lkpX = tPos.x;
          mem.lkpZ = tPos.z;
          mem.know = 2;
          e.unaware = false;
          e.lkpX = tPos.x;
          e.lkpZ = tPos.z;
          e.sus = Math.min(1, (e.sus || 0) + 0.5);
        }
        root.CORE_VGAI.decayMemory(mem, dt || 0.05);
        if (!res.visible && mem.confidence <= 0.08 && e.sus > 0) {
          e.sus = Math.max(0, e.sus - (dt || 0.05) * 0.25);
        }
        return !!res.visible;
      };

      // Oído contextual (sin telepatía global; solo alerta a escuadra cercana por radio/grito)
      var _hear = AI33.hearE33;
      AI33.hearE33 = function (x, z, r, src) {
        if (typeof enemies === 'undefined' || !Array.isArray(enemies)) {
          return _hear ? _hear.apply(this, arguments) : undefined;
        }
        var rad = Math.max(12, r || 35);
        for (var i = 0; i < enemies.length; i++) {
          var e = enemies[i];
          if (!e || e.hp <= 0 || !e.g) continue;
          var d = Math.hypot(e.g.position.x - x, e.g.position.z - z);
          if (d <= rad) {
            ensureUnitTraits(e);
            e._vgaiMem.lkpX = x;
            e._vgaiMem.lkpZ = z;
            e._vgaiMem.timeSinceSeen = 0;
            e._vgaiMem.confidence = Math.max(e._vgaiMem.confidence || 0, 0.55);
            e.lkpX = x;
            e.lkpZ = z;
            if (d < rad * 0.72) {
              e.unaware = false;
              e.active = true;
            } else {
              e.sus = Math.max(e.sus || 0, 0.55);
            }
          }
        }
        void src;
      };

      // Pensamiento táctico con emociones Iron Mod, slots de cobertura y supresión
      var _think = AI33.thinkE33;
      AI33.thinkE33 = function (e, dt) {
        if (!e || !e.g) return _think ? _think.apply(this, arguments) : undefined;
        var traits = ensureUnitTraits(e);
        var alliesDown = 0;
        if (e.sq && Array.isArray(e.sq)) {
          for (var s = 0; s < e.sq.length; s++) if (e.sq[s] && e.sq[s].hp <= 0) alliesDown++;
        }
        var hpRatio = Math.max(0, Math.min(1, (e.hp || 1) / (e.max || 1)));
        var underFire = (e.flash || 0) > 0 || (e.stun || 0) > 0;
        var stress = (1 - hpRatio) * 2.1 + (underFire ? 1.2 : 0);

        if (root.CORE_VGAI && typeof root.CORE_VGAI.computeEmotionPersonality === 'function') {
          var emo = root.CORE_VGAI.computeEmotionPersonality(traits, stress, alliesDown);
          e._vgaiEmo = emo;
          if (e._vgaiBaseSp) {
            e.sp = e._vgaiBaseSp * (0.88 + emo.aggression * 0.2 - emo.fear * 0.14);
          }
          if (emo.panic && e.cv && e.st === 'adv') {
            e.st = 'cover';
            e.tm = Math.max(e.tm || 0, 1.5);
          }
        }

        // Recarga protegida si munición baja
        if (e.mag !== undefined && e.mag <= 1 && e.st !== 'hide' && e.cv) {
          e.st = 'cover';
          e.tm = Math.max(e.tm || 0, 1.5);
        }

        return _think ? _think.apply(this, arguments) : undefined;
      };
    }

    // Asignación de cobertura sin amontonamiento
    if (typeof window.findCover === 'function' && !window.findCover._vgaiCov) {
      var _fc = window.findCover;
      window.findCover = function (e, away) {
        if (!e || !e.g || typeof covers === 'undefined' || !Array.isArray(covers) || !root.CORE_VGAI || typeof root.CORE_VGAI.allocateCoverSlots !== 'function') {
          return _fc.apply(this, arguments);
        }
        var tgtPos = typeof P !== 'undefined' && P && P.g ? P.g.position : e.g.position;
        var gx = e.g.position.x, gz = e.g.position.z;
        COVER_CAND.length = 0;
        for (var k in COVER_USED) delete COVER_USED[k];
        if (typeof enemies !== 'undefined') {
          for (var j = 0; j < enemies.length; j++) {
            var o = enemies[j];
            if (o && o !== e && o.hp > 0 && o.cv) {
              COVER_USED[Math.round(o.cv.x * 2) + ',' + Math.round(o.cv.z * 2)] = true;
            }
          }
        }
        for (var i = 0; i < covers.length && COVER_CAND.length < 24; i++) {
          var c = covers[i];
          if (!c) continue;
          if (COVER_USED[Math.round(c.x * 2) + ',' + Math.round(c.z * 2)]) continue;
          var d = Math.hypot(c.x - gx, c.z - gz);
          if (d < 34 && d > 1.2) COVER_CAND.push(c);
        }
        if (!COVER_CAND.length) return _fc.apply(this, arguments);

        SQUAD_SCRATCH[0].id = (e.g && e.g.id) || 0;
        SQUAD_SCRATCH[0].x = gx;
        SQUAD_SCRATCH[0].z = gz;
        SQUAD_SCRATCH[0].hp = e.hp || 100;
        SQUAD_SCRATCH[0].prefRange = away ? 28 : 20;

        var slots = root.CORE_VGAI.allocateCoverSlots(SQUAD_SCRATCH, tgtPos, COVER_CAND);
        if (slots && slots.length && slots[0] && slots[0].cover) {
          api.stats.coverAllocated++;
          return slots[0].cover;
        }
        return _fc.apply(this, arguments);
      };
      window.findCover._vgaiCov = true;
    }

    // Prevención de fuego amigo en shootSol
    if (typeof window.shootSol === 'function' && !window.shootSol._vgaiFF) {
      var _ss = window.shootSol;
      window.shootSol = function (e, p) {
        if (e && p && root.CORE_VGAI && typeof root.CORE_VGAI.hasFriendlyFireRisk === 'function' && typeof enemies !== 'undefined') {
          var tgt = typeof P !== 'undefined' && P && P.g ? P.g.position : null;
          if (tgt) {
            ALLY_SCRATCH.length = 0;
            for (var i = 0; i < enemies.length; i++) {
              var o = enemies[i];
              if (o && o !== e && o.hp > 0 && o.g) {
                ALLY_SCRATCH.push({ x: o.g.position.x, z: o.g.position.z, hp: o.hp });
              }
            }
            if (root.CORE_VGAI.hasFriendlyFireRisk({ x: p.x, z: p.z, laneHalfWidth: 0.85 }, tgt, ALLY_SCRATCH, null)) {
              api.stats.ffHeld++;
              e.cd = 0.25;
              var dx = tgt.x - p.x, dz = tgt.z - p.z, l = Math.hypot(dx, dz) || 1;
              p.x += (-dz / l) * 0.22;
              p.z += (dx / l) * 0.22;
              return;
            }
          }
        }
        return _ss.apply(this, arguments);
      };
      window.shootSol._vgaiFF = true;
    }

    // (Colisiones de soldados dejadas al motor vanilla original para máxima fluidez y naturalidad)
  }

  function pushActorToPool(u) {
    if (!u || !u.g || !u.g.visible || UNIT_POOL.length >= MAX_POOL) return;
    if (u.hp !== undefined && u.hp <= 0) return;
    if (u.seated || u.down29 || u.down17 || u.desc) return;
    if (u.aaC && u.aaC.st === 'op') return;
    UNIT_POOL.push({
      pos: u.g.position,
      x: u.g.position.x,
      z: u.g.position.z,
      y: u.g.position.y || 0,
      hp: u.hp !== undefined ? u.hp : 100,
      cr: !!(u.pr || u.cr || u.st === 'hide' || u.act === 'crouch'),
      pinned: !!(u.mg || u.gun17)
    });
  }

  function solveAllSoldierCollisions() {
    UNIT_POOL.length = 0;

    var sources = [];
    if (typeof enemies !== 'undefined') sources.push(enemies);
    if (typeof allies !== 'undefined') sources.push(allies);
    if (typeof NPC11 !== 'undefined') sources.push(NPC11);
    if (typeof GAR !== 'undefined') sources.push(GAR);
    if (typeof G17 !== 'undefined' && G17 && G17.L) sources.push(G17.L);
    if (typeof N16 !== 'undefined' && N16 && N16.sq) sources.push(N16.sq);
    if (typeof N17 !== 'undefined' && N17 && N17.all) sources.push(N17.all);
    if (typeof N18 !== 'undefined' && N18 && N18.all) sources.push(N18.all);
    if (typeof N19 !== 'undefined' && N19 && N19.sq) sources.push(N19.sq);
    if (typeof N20 !== 'undefined' && N20 && N20.sq) sources.push(N20.sq);

    for (var s = 0; s < sources.length; s++) {
      var arr = sources[s];
      if (!Array.isArray(arr)) continue;
      for (var i = 0; i < arr.length; i++) {
        pushActorToPool(arr[i]);
      }
    }

    if (UNIT_POOL.length < 1) return;
    var pPos = null;
    if (typeof P !== 'undefined' && P && P.g && !P.veh && !P.mg && !(typeof L12 !== 'undefined' && L12.sit)) {
      PLAYER_POS.x = P.g.position.x;
      PLAYER_POS.y = P.g.position.y || 0;
      PLAYER_POS.z = P.g.position.z;
      pPos = PLAYER_POS;
    }

    COL_OPTS.pushPlayer = !!pPos;
    var res = root.CORE_VGAI.solveSoldierCollisions(UNIT_POOL, pPos, isWallBlockedForCol, COL_OPTS);

    for (var k = 0; k < UNIT_POOL.length; k++) {
      var u = UNIT_POOL[k];
      if (!u.pinned) {
        u.pos.x = u.x;
        u.pos.z = u.z;
        if (typeof resolve === 'function') resolve(u.pos, 0.45, u.y);
      }
    }
    if (pPos && res && res.playerAdjusted && typeof P !== 'undefined' && P && P.g) {
      P.g.position.x = pPos.x;
      P.g.position.z = pPos.z;
      if (typeof resolve === 'function') resolve(P.g.position, 0.48, pPos.y);
    }
    api.stats.colSolves++;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installTacticalAI);
  } else {
    installTacticalAI();
  }

  api.solveAllSoldierCollisions = solveAllSoldierCollisions;
  window.AI_TACTICAL_VGAI = api;
  window.AETH = window.AETH || {};
  window.AETH.vgai = window.AETH.vgai || {};
  window.AETH.vgai.ai = api;
})(typeof window !== 'undefined' ? window : globalThis);
