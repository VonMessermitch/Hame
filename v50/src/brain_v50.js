/* =========================================================================
   v50/src/brain_v50.js — CEREBRO v50: una sola tubería cognitiva por soldado
   sobre la IA de combate AI33 (src/v33_ai.js), usando la identidad del cerebro
   Aethrion (v40/src/aethrion_soldiers.js) como fuente de personalidad.

     percepción (seeE33/hearE33 de AI33: cono, postura, niebla, LOS, oído)
       → memoria (LKP de AI33 + confianza que decae; rumor de mando acotado)
       → emoción/moral (miedo único: supresión, heridas, bajas, oficial caído,
         aislamiento, personalidad Aethrion, veteranía)
       → decisión sobre los estados de AI33 (clavado a cubierto, dudas, pánico,
         repliegue, rendición, flanqueo) con consecuencias visibles (gritos por
         subtítulo/feed + audio, postura, manos arriba, puntería y ritmo).

   Duplicados que esta capa retira o neutraliza (ver BRAIN50.dedup):
     · V.GAI ai_tactical colgaba percepción/emoción de AI33.seeE33/thinkE33/
       hearE33, que AI33 nunca llama (código muerto): se quitan.
     · V.GAI puso AI33.cfg.rumor=false → en sqTickE33 `time-lkT>false` es
       `>0`: el rumor se disparaba en cada tic (omnisciencia total). Se fija un
       rumor de mando numérico (40 s, ±20 m).
     · findCover/shootSol de V.GAI duplicaban coberturas (devolvían el centro
       del obstáculo) y el chequeo de fuego amigo (contra el jugador aunque el
       blanco fuera un aliado, con asignaciones por disparo). Para soldados
       AI33 se saltan: queda la versión de AI33 (punto de cobertura real y
       chequeo contra el blanco verdadero).
     · El pulso v40 (setInterval, reloj de pared) calculaba un segundo miedo y
       dudas sobre `cd`. Para soldados AI33 el pulso v40 ya no decide: se
       sincroniza desde esta capa (el panel K muestra el mismo miedo).
   No toca src/, v40/ ni vGAI/: sólo envuelve funciones globales.
   ========================================================================= */
(function (W) {
  'use strict';
  if (typeof AI33 === 'undefined' || typeof thinkE33 !== 'function' || typeof sqTickE33 !== 'function') {
    if (W.console) console.warn('[brain_v50] falta AI33: capa inactiva');
    return;
  }

  var BR = {
    version: 'v50.brain.1',
    on: true,
    cfg: {
      lodNear: 40, lodMid: 90,           // m al jugador
      think: [0.3, 0.5, 1.0],             // s entre decisiones por nivel LOD
      emoPerFrame: 12,                    // presupuesto de actualizaciones emocionales por cuadro
      barkGap: 4.5, barkUnitGap: 12, barkRange: 45,
      rumor: 40,                          // s sin contacto antes del aviso de mando
      memTau: 11,                         // s: vida media de la confianza en la LKP
      surMax: 3                           // rendiciones máximas por nivel
    },
    stats: null,
    dedup: [],
    surL: [],
    lv: -1,
    barkT: -99,
    ms: 0, msMax: 0, msSum: 0, frames: 0,
    _emoN: 0, _ms: 0, _farN: 0
  };
  function stats0() {
    return { init: 0, think: 0, emo: 0, emoSkip: 0, hes: 0, pinned: 0, panic: 0, flee: 0, retreat: 0, surrender: 0, captured: 0,
      offDead: 0, newLd: 0, seek: 0, ffAlly: 0, prio: 0, barks: 0, lod: [0, 0, 0], memDrop: 0, rumor: 0 };
  }
  BR.stats = stats0();
  W.BRAIN50 = BR;
  W.AETH = W.AETH || {};
  W.AETH.v50 = W.AETH.v50 || {};
  W.AETH.v50.brain = BR;

  var VET = { RECLUTA: 0, REGULAR: 1, VETERANO: 2, ELITE: 3, 'ÉLITE': 3 };
  var EMPTY = [];
  function cl(v, a, b) { return v < a ? a : v > b ? b : v; }
  function rnd() { return typeof R === 'function' ? R() : Math.random(); }
  function now() { return typeof time === 'number' ? time : 0; }
  function ppos() { return (typeof P !== 'undefined' && P && P.g) ? P.g.position : null; }
  function dP(e) { var q = ppos(), p = e.g.position; return q ? Math.hypot(q.x - p.x, q.z - p.z) : 1e9; }

  /* V.GAI instala sus envoltorios en DOMContentLoaded: esta capa se instala
     después para quedar por fuera (si no, V.GAI volvería a poner rumor=false
     y sus findCover/shootSol envolverían a los nuestros). */
  function install() {
  if (BR._installed) return; BR._installed = true;
  /* ------------------------------------------------------------------ */
  /* 0. Retirar duplicados                                               */
  /* ------------------------------------------------------------------ */
  function dedup() {
    var k = ['seeE33', 'hearE33', 'thinkE33', 'e8T'], gone = [];
    for (var i = 0; i < k.length; i++) if (typeof AI33[k[i]] === 'function') { delete AI33[k[i]]; gone.push(k[i]); }
    if (gone.length) BR.dedup.push('AI33.' + gone.join('/') + ' de V.GAI (nunca invocados por AI33) retirados');
    if (!(typeof AI33.cfg.rumor === 'number' && AI33.cfg.rumor > 0)) {
      BR.dedup.push('AI33.cfg.rumor=' + AI33.cfg.rumor + ' (omnisciencia continua) → ' + BR.cfg.rumor + ' s');
      AI33.cfg.rumor = BR.cfg.rumor;
    }
    if (W.CORE_VGAI && BR.dedup.join().indexOf('findCover') < 0) BR.dedup.push('findCover/shootSol V.GAI saltados para soldados AI33 (cobertura y fuego amigo de AI33)');
  }
  BR.dedupCheck = dedup;

  /* ------------------------------------------------------------------ */
  /* 1. Estado cognitivo por soldado                                     */
  /* ------------------------------------------------------------------ */
  function initB(e, a) {
    var pf = a.pf, bnd = e.__aethBinding, brain = bnd && bnd.brain, pers = brain && brain.personality;
    var vet = VET[String(pf.name || 'REGULAR').split('/')[0]];
    if (vet === undefined) vet = 1;
    var disc, agg, tol;
    try {
      disc = pers ? pers.get('discipline') : NaN; agg = pers ? pers.get('aggression') : NaN; tol = pers ? pers.get('stressTolerance') : NaN;
    } catch (er) { disc = agg = tol = NaN; }
    if (!(disc >= 0)) disc = cl(pf.brave * 0.6, 0, 1);
    if (!(agg >= 0)) agg = cl(pf.adv, 0, 1);
    if (!(tol >= 0)) tol = 0.5;
    /* la veteranía y el rol forman la disciplina de combate (Iron: competencia por rol) */
    disc = cl(disc * 0.7 + vet * 0.08 + (a.role === 'leader' ? 0.12 : 0), 0, 1);
    var b = {
      fear: 0, tgt: 0, mor: 1, disc: disc, agg: agg, tol: tol, vet: vet,
      base: { acc: pf.acc, react: pf.react, cov: pf.cov, adv: pf.adv, brave: pf.brave },
      lastT: now(), conf: 1, lod: 0, hes: 0, pinT: -99, panCD: 0, retU: 0, retCD: 0,
      sur: 0, surT: 0, barkT: -99, offT: -99, cas: 0, iso: 0, lead: 0
    };
    e.b50 = b;
    BR.stats.init++;
    return b;
  }

  function label(e) {
    var n = String(e.k8n || 'un soldado enemigo').replace(/^(a un |a una |al |a )/, '');
    return n.charAt(0).toUpperCase() + n.slice(1);
  }
  function subFree() {
    var s = document.getElementById('sub');
    if (s && +(s.style.opacity || 0) > 0.05) return false;
    if (typeof DLG !== 'undefined' && DLG && DLG.q && DLG.q.length) return false;
    return true;
  }
  var SHOUT = { pin: 'heavy_fire', panic: 'heavy_fire', ret: 'order_regroup', off: 'order_regroup', ld: 'order_fire', sur: 'heavy_fire', flank: 'order_advance' };
  var LINES = {
    pin: ['¡Me tienen clavado!', '¡No puedo asomar!', '¡Nos están barriendo!'],
    hes: ['¡No asomo, nos barren!', '¡Esperá, esperá…!'],
    panic: ['¡No quiero morir acá!', '¡Me voy, me voy!', '¡Nos matan a todos!'],
    ret: ['¡Atrás, repliéguense!', '¡Nos replegamos!', '¡Retrocedan, rápido!'],
    off: ['¡Cayó el oficial!', '¡Mataron al teniente!', '¡Sin mando, sin mando!'],
    ld: ['¡A mí! ¡Mantengan la línea!', '¡Yo tomo el mando, sigan!'],
    sur: ['¡No tiren! ¡Me rindo!', '¡Basta, me rindo!'],
    flank: ['¡Rodéenlos por el flanco!', '¡Por la izquierda, vamos!']
  };
  function bark(e, kind, force) {
    var t = now(), b = e.b50;
    if (!force && t - BR.barkT < BR.cfg.barkGap) return false;
    if (b && !force && t - b.barkT < BR.cfg.barkUnitGap) return false;
    if (dP(e) > BR.cfg.barkRange) return false;
    BR.barkT = t; if (b) b.barkT = t;
    var L = LINES[kind] || LINES.pin, txt = label(e) + ': «' + L[(rnd() * L.length) | 0] + '»';
    try { if (subFree() && typeof say === 'function') say(txt, 1.9); else if (typeof feed === 'function') feed(txt); } catch (er) {}
    try { if (W.AUDIO_VGAI && W.AUDIO_VGAI.shout) W.AUDIO_VGAI.shout(SHOUT[kind] || 'heavy_fire', e.g.position.x, e.g.position.z, true); } catch (er) {}
    BR.stats.barks++;
    return true;
  }
  function allyBark(k, lines) {
    try {
      var L = (typeof L13 !== 'undefined' && L13 && L13.sq) || (typeof allies !== 'undefined' ? allies : null);
      if (!L || !L.length || typeof say33 !== 'function') return;
      var q = ppos(), best = null, bd = 1e9;
      for (var i = 0; i < L.length; i++) { var n = L[i]; if (!n || !n.g || !n.name || n.down29 || n.down17) continue; var d = Math.hypot(n.g.position.x - q.x, n.g.position.z - q.z); if (d < bd) { bd = d; best = n } }
      if (best && bd < 40) say33(best, k, lines, 10);
    } catch (er) {}
  }
  function brainEpisode(e, txt, val) {
    var bnd = e.__aethBinding;
    if (!bnd || !bnd.brain || !bnd.brain.memory) return;
    try { bnd.brain.memory.encodeEpisode({ summary: txt, kind: 'guerra', importance: 0.55, valence: val, intensity: 0.7, time: bnd.brain.clockTime }); } catch (er) {}
  }

  /* ------------------------------------------------------------------ */
  /* 2. Memoria + emoción/moral (una sola fuente de miedo)               */
  /* ------------------------------------------------------------------ */
  function emotion(e, a, b, t) {
    var dtt = cl(t - b.lastT, 0, 2.5); b.lastT = t;
    var p = e.g.position, sq = a.sq, n0 = sq ? Math.max(1, sq.n0) : 1, alive = sq ? sq.m.length : 1;
    var cas = sq ? (n0 - alive) / n0 : 0, lead = 0, near = 0;
    if (sq) {
      for (var i = 0; i < sq.m.length; i++) {
        var o = sq.m[i]; if (o === e || o.hp <= 0) continue;
        var d = Math.hypot(o.g.position.x - p.x, o.g.position.z - p.z);
        if (d < 18) near++;
        if (o === sq.ld && d < 22) lead = 1;
      }
      if (sq.ld === e) lead = 1;
    }
    var iso = (alive <= 1 || near === 0) ? 1 : 0;
    var off = t - b.offT < 12 ? 1 - (t - b.offT) / 12 : 0;
    var hpR = cl((e.hp || 1) / (e.max || 100), 0, 1);
    /* memoria: confianza en la última posición conocida */
    if (a.vis) b.conf = 1;
    else {
      b.conf = Math.exp(-(t - a.lkT) / (BR.cfg.memTau * (0.8 + b.vet * 0.12)));
      if (b.conf < 0.12 && a.know >= 2 && !(sq && t - sq.lkT < 6)) {
        a.know = 1; a.ix = a.lkx + (rnd() - 0.5) * 10; a.iz = a.lkz + (rnd() - 0.5) * 10; a.invT = t; BR.stats.memDrop++;
      }
    }
    var S = Math.min(a.sup, 3) * 0.26 + (1 - hpR) * 0.5 + cas * 0.7 + off * 0.4 + iso * 0.22 +
      (a.vis && a.d < 10 ? 0.12 : 0) - lead * 0.1;
    var mul = 1.3 - b.disc * 0.45 - b.tol * 0.25 - b.vet * 0.07;
    b.tgt = cl(S * mul, 0, 1);
    var rate = b.tgt > b.fear ? 1.6 : 0.1 * (1 + b.vet * 0.35);
    b.fear += (b.tgt - b.fear) * Math.min(1, rate * dtt);
    b.mor = cl(1 - b.fear * 0.75 + b.disc * 0.12 + (lead ? 0.06 : -0.06), 0, 1);
    b.cas = cas; b.iso = iso; b.lead = lead; b.hpR = hpR; b.off = off;
    /* competencia: el miedo degrada puntería y reflejos; la veteranía recupera la supresión */
    var pf = a.pf, f = b.fear, B = b.base;
    pf.acc = B.acc * (1 + f * 0.55);
    pf.react = B.react * (1 + f * 0.6);
    pf.cov = B.cov * (1 + f * 0.8);
    pf.adv = B.adv * (1 - f * 0.7);
    pf.brave = B.brave * (1 - f * 0.4);           // alimenta el pánico y la moral de escuadra de AI33
    if (b.vet > 0 && a.sup > 0) a.sup = Math.max(0, a.sup - dtt * 0.08 * b.vet);
    BR.stats.emo++;
    return dtt;
  }

  /* ------------------------------------------------------------------ */
  /* 3. Decisión sobre los estados de AI33                               */
  /* ------------------------------------------------------------------ */
  function canMove(e) { return !e.hold && !e.keep17 && !e.keep18 && !e.boss9 && !e.boss10; }

  function startSurrender(e, a, b, t) {
    b.sur = 1; b.surT = t; a.cov = null; e.cv = null; a.mx = a.mz = 0;
    setSE33(a, 'PANIC', 99); a.ph = 'hide';
    if (e.sp) e.sp = 0.01;
    BR.surL.push(e); BR.stats.surrender++;
    bark(e, 'sur', true);
    allyBark('sur50', ['¡Se rinde! ¡No le tiren!', '¡Alto el fuego sobre ese, se entrega!']);
    brainEpisode(e, 'se rindió al quedarse solo bajo fuego', -0.6);
  }

  function decide(e, a, b, t, dtt) {
    var s = a.s;
    if (s === 'MELEE' || s === 'GRENADE' || s === 'EVADE') return;
    var p = e.g.position, inCov = a.cov && Math.hypot(p.x - a.cov.x, p.z - a.cov.z) < 2.2;
    var f = b.fear, dp = dP(e);
    /* rendición: solo, aterrado, herido o con la escuadra deshecha y el enemigo encima */
    if (f > 0.88 && b.vet <= 1 && canMove(e) && BR.stats.surrender < BR.cfg.surMax && a.vis && dp < 30 &&
      (b.iso && (b.cas >= 0.5 || b.hpR < 0.6)) && rnd() < 0.5) { startSurrender(e, a, b, t); return; }
    /* pánico */
    if (f > 0.8 && b.disc < 0.6 && b.vet <= 1 && t > b.panCD && rnd() < 0.35) {
      b.panCD = t + 12;
      if (inCov || !canMove(e) || BR._farN >= 1) { setSE33(a, 'PANIC', 2.5 + rnd() * 2); a.ph = 'hide'; BR.stats.panic++; }
      else if (++BR._farN && moveE33(e, a, 'far', 'RETREAT', 3)) { b.retU = t + 5; BR.stats.flee++; BR.stats.panic++; }
      else { setSE33(a, 'PANIC', 2.5); a.ph = 'hide'; BR.stats.panic++; }
      bark(e, 'panic'); brainEpisode(e, 'entró en pánico bajo el fuego', -0.7);
      return;
    }
    /* repliegue individual por moral rota */
    if (b.mor < 0.42 && canMove(e) && (b.cas >= 0.34 || b.hpR < 0.4 || b.off > 0) && t > b.retCD && s !== 'RETREAT' && s !== 'PANIC' && BR._farN < 1) {
      BR._farN++; b.retCD = t + 8;
      if (moveE33(e, a, 'far', 'RETREAT', 3)) {
        b.retU = t + 6 + rnd() * 3; b.retCD = t + 22; BR.stats.retreat++;
        if (!(a.sq && t - (a.sq.retB50 || -99) < 8)) { if (a.sq) a.sq.retB50 = t; bark(e, 'ret'); }
        return;
      }
    }
    /* clavado por la supresión */
    if (inCov && a.sup > 1.2 && f > 0.35 && (s === 'ENGAGE' || s === 'HOLD' || s === 'ALERT' || s === 'SUPPRESS')) {
      a.ph = 'hide'; a.phS = t; a.phT = Math.max(a.phT || 0, t + 0.8 + f * 1.5);
      if (s === 'HOLD' || s === 'SUPPRESS') setSE33(a, 'ENGAGE', 1.2);
      if (t - b.pinT > 3) { b.pinT = t; BR.stats.pinned++; bark(e, 'pin'); }
      return;
    }
    /* expuesto y bajo fuego: buscar cobertura más lejos en vez de quedarse plantado */
    if (!inCov && s === 'HOLD' && a.sup > 0.9 && f > 0.3 && canMove(e) && t > (b.seekT || 0) && BR._farN < 1) {
      b.seekT = t + 10; BR._farN++;
      if (moveE33(e, a, 'far', 'TAKE_COVER', 2)) { BR.stats.seek = (BR.stats.seek || 0) + 1; return; }
    }
    /* dudas: el miedo retrasa el disparo; la disciplina las frena */
    if (f > 0.55 && a.vis && rnd() < (f - 0.5) * (1 - b.disc) * 0.9) {
      a.nx = Math.max(a.nx || 0, t + 0.5 + rnd());
      b.hes++; BR.stats.hes++;
      var bnd = e.__aethBinding; if (bnd) bnd.hesitations++;
      if (rnd() < 0.3) bark(e, 'hes');
      return;
    }
    /* escuadra con moral alta y temperamento agresivo: flanquea antes */
    var sq = a.sq;
    if (sq && b.mor > 0.8 && b.agg > 0.6 && !sq.fl && sq.m.length >= 3 && sq.ld === e && t > sq.flT + 2 && t - a.lkT < 4) {
      sq.flT -= 3;
      if (rnd() < 0.4) bark(e, 'flank');
    }
  }

  function lodTier(e, a) {
    if (a.vis || a.d < BR.cfg.lodNear) return 0;
    var d = dP(e);
    if (d < BR.cfg.lodNear) return 0;
    if (d < BR.cfg.lodMid && e.g.visible) return 1;
    return 2;
  }

  var _think = thinkE33;
  thinkE33 = function (e, a, dt) {
    if (!BR.on || !a || !a.pf) return _think(e, a, dt);
    var t0 = performance.now(), t = now();
    var b = e.b50 || initB(e, a);
    BR.stats.think++;
    if (b.sur) { seeE33(e, a, dt); hearE33(e, a); a.s = 'PANIC'; a.decT = t + 99; a.cov = null; BR._ms += performance.now() - t0; return; }
    if (b.retU) {
      if (t < b.retU) { seeE33(e, a, dt); hearE33(e, a); b.lod = 0; BR._ms += performance.now() - t0; return; }
      b.retU = 0; a.ret = 1;               // AI33 reagrupa con la escuadra en el próximo tic
    }
    var t1 = performance.now();
    _think(e, a, dt);
    t0 += performance.now() - t1;           // sólo se mide el coste propio de la capa
    if (BR._emoN < BR.cfg.emoPerFrame) {
      BR._emoN++;
      var dtt = emotion(e, a, b, t);
      decide(e, a, b, t, dtt);
    } else BR.stats.emoSkip++;
    var tier = lodTier(e, a);
    b.lod = tier; BR.stats.lod[tier]++;
    a.think = BR.cfg.think[tier] * (0.85 + rnd() * 0.3);
    BR._ms += performance.now() - t0;
  };

  /* ------------------------------------------------------------------ */
  /* 4. Escuadra: cohesión, oficial caído, nuevo mando                    */
  /* ------------------------------------------------------------------ */
  var _sq = sqTickE33;
  sqTickE33 = function (sq) {
    if (!BR.on) return _sq(sq);
    var t0 = performance.now(), t = now(), oldLd = sq.ld, lk0 = sq.lkT;
    var rumorDue = sq.know >= 2 && t - sq.lkT > AI33.cfg.rumor;
    var t1 = performance.now();
    _sq(sq);
    t0 += performance.now() - t1;
    if (rumorDue && sq.lkT !== lk0) BR.stats.rumor++;
    if (!sq.m.length) { BR._ms += performance.now() - t0; return; }
    if (oldLd && oldLd !== sq.ld && (oldLd.hp <= 0 || enemies.indexOf(oldLd) < 0) && oldLd.a33 && oldLd.a33.role === 'leader') {
      BR.stats.offDead++;
      for (var i = 0; i < sq.m.length; i++) {
        var o = sq.m[i], ob = o.b50; if (!ob || !o.a33) continue;
        ob.offT = t; o.a33.decT = t + 0.8 + rnd() * 1.4;  // desorganización breve
        brainEpisode(o, 'vio caer a su oficial', -0.85);
      }
      bark(sq.m[0], 'off', true);
      sq.nl50 = t + 5 + rnd() * 2;
    }
    if (sq.nl50 && t > sq.nl50 && sq.ld && sq.ld.b50) {
      sq.nl50 = 0; BR.stats.newLd++;
      var lb = sq.ld.b50, k = 0.08 + lb.vet * 0.04;
      for (var j = 0; j < sq.m.length; j++) { var q = sq.m[j].b50; if (q) { q.fear = Math.max(0, q.fear - k); q.offT = Math.min(q.offT, t - 6); } }
      bark(sq.ld, 'ld', true);
    }
    /* contagio: el miedo de cada uno tiende al de la escuadra */
    var sum = 0, n = 0, ms = 0;
    for (var u = 0; u < sq.m.length; u++) { var ub = sq.m[u].b50; if (ub) { sum += ub.fear; ms += ub.mor; n++; } }
    if (n > 1) {
      var mean = sum / n;
      for (var v = 0; v < sq.m.length; v++) { var vb = sq.m[v].b50; if (vb && !vb.sur) vb.fear += (mean - vb.fear) * 0.12; }
    }
    sq.fear50 = n ? sum / n : 0; sq.mor50 = n ? ms / n : 1;
    BR._ms += performance.now() - t0;
  };

  /* rol por tipo de los niveles XVIII (kind18) */
  if (typeof roleE33 === 'function') {
    var _role = roleE33;
    roleE33 = function (e) {
      var k = e.kind18;
      if (k && !e.kind17) {
        if (k === 'officer') return 'leader';
        if (k === 'mg') return 'mg';
        if (k === 'eng') return 'at';
        if (k === 'gren') return 'grenadier';
        if (k === 'scout') return 'scout';
        if (k === 'storm' || k === 'knight') return 'assault';
      }
      return _role(e);
    };
  }

  /* ------------------------------------------------------------------ */
  /* 5. Cobertura y disparo: una sola versión (la de AI33)                */
  /* ------------------------------------------------------------------ */
  var CV = W.CORE_VGAI;
  if (typeof findCover === 'function') {
    var _fc = findCover;
    findCover = function (e, far) {
      if (!BR.on || !CV || !e || !e.a33) return _fc(e, far);
      var f0 = CV.allocateCoverSlots; CV.allocateCoverSlots = null;
      try { return _fc(e, far); } finally { CV.allocateCoverSlots = f0; }
    };
  }
  if (typeof shootSol === 'function') {
    var _ss = shootSol;
    shootSol = function (e, p) {
      if (!BR.on || !e || !e.a33) return _ss(e, p);
      if (e.b50 && e.b50.sur) return;
      if (!CV) return _ss(e, p);
      var f0 = CV.hasFriendlyFireRisk; CV.hasFriendlyFireRisk = null;
      try { return _ss(e, p); } finally { CV.hasFriendlyFireRisk = f0; }
    };
  }

  /* postura: manos arriba al rendirse, cubrirse la cabeza en pánico */
  if (typeof animE === 'function') {
    var _an = animE;
    animE = function (e, ax, az, dt, crouch) {
      var b = e.b50;
      if (b && b.sur) { ax = az = 0; crouch = false; }
      var r = _an(e, ax, az, dt, crouch);
      if (b && BR.on) {
        var u = e.g.userData;
        if (b.sur && u.aR && u.aL) {
          u.aR.rotation.x = u.aL.rotation.x = -2.9; u.aR.rotation.z = -0.25; u.aL.rotation.z = 0.25;
          if (u.eR) u.eR.rotation.x = -0.2; if (u.eL) u.eL.rotation.x = -0.2;
          e.aim = 0;
        } else if (e.a33 && e.a33.s === 'PANIC' && b.fear > 0.8 && u.aR && u.aL) {
          u.aR.rotation.x = u.aL.rotation.x = -2.3; if (u.eR) u.eR.rotation.x = -1.9; if (u.eL) u.eL.rotation.x = -1.9;
        }
      }
      return r;
    };
  }

  if (typeof hurt === 'function') {
    var _hu = hurt;
    hurt = function (e, d, mode, by) {
      var b = e && e.b50;
      if (b && BR.on && e.hp > 0 && typeof d === 'number') b.fear = cl(b.fear + d / (e.max || 100) * 0.45 * (1.2 - b.disc * 0.5), 0, 1);
      return _hu(e, d, mode, by);
    };
  }

  /* ------------------------------------------------------------------ */
  /* 6. Aliados: prioridad de amenazas y línea de tiro libre de compañeros */
  /* ------------------------------------------------------------------ */
  var ROLEW = { at: -10, leader: -9, mg: -8, grenadier: -4, marksman: -4 };
  if (typeof see33 === 'function' && typeof A33 !== 'undefined' && typeof los33 === 'function' && typeof know33 === 'function' && typeof ang33 === 'function') {
    var _see33 = see33;
    see33 = function (n, quiet) {
      if (!BR.on) return _see33(n, quiet);
      var p = n.g.position, rng = n.wpn === 'p' ? 42 : 75, f = n.g.rotation.y, pp = P.g.position, t = now();
      var c1 = null, c2 = null, c3 = null, s1 = 1e9, s2 = 1e9, s3 = 1e9;
      var F = A33.foes;
      for (var i = 0; i < F.length; i++) {
        var e = F[i], q = e.g.position, dx = q.x - p.x, dz = q.z - p.z, d = Math.hypot(dx, dz);
        if (d > rng) continue;
        var b = e.b50; if (b && b.sur) continue;          // no se dispara al que se rinde
        var heard = e.shot33 && t - e.shot33 < 4;
        if (!heard && !A33.alert && d > 12 && Math.abs(ang33(Math.atan2(dx, dz) - f)) > 2.2) continue;
        var s = d, a = e.a33;
        if (e.active && Math.hypot(q.x - pp.x, q.z - pp.z) < 25) s -= 18;
        if (heard) s -= 8;
        if (e === n.tg) s -= 6;
        var rw = a && ROLEW[a.role]; s += rw || (e.k8 === 'bar' ? -6 : 0);
        if (a && a.vis && t - a.visT < 1.5) s -= 4;          // el que nos está tirando
        if (a && a.s === 'PANIC') s += 6;                      // amenaza baja
        if (s < s1) { c3 = c2; s3 = s2; c2 = c1; s2 = s1; c1 = e; s1 = s; } else if (s < s2) { c3 = c2; s3 = s2; c2 = e; s2 = s; } else if (s < s3) { c3 = e; s3 = s; }
      }
      for (var k = 0; k < 3; k++) {
        var c = k === 0 ? c1 : k === 1 ? c2 : c3; if (!c) continue;
        var cq = c.g.position, v = los33(p.x, p.y + 1.5, p.z, cq.x, cq.y + 1.3, cq.z);
        if (v === 1) { if (c.a33 && ROLEW[c.a33.role] && c !== n.tg) BR.stats.prio++; n.tg = c; n.vis33 = t; know33(c, cq.x, cq.z, true); return c; }
        if (v < 0 && c === n.tg && t - (n.vis33 || -9) < 1.5) return c;
      }
      if (n.tg && (n.tg.hp <= 0 || enemies.indexOf(n.tg) < 0 || (n.tg.b50 && n.tg.b50.sur))) n.tg = null;
      return null;
    };
  }
  function allyLists(cb) {
    try { if (typeof L13 !== 'undefined' && L13 && Array.isArray(L13.sq)) cb(L13.sq); } catch (er) {}
    try { if (typeof allies !== 'undefined' && Array.isArray(allies)) cb(allies); } catch (er) {}
  }
  if (typeof plf33 === 'function') {
    var _plf = plf33, FF = { p: null, q: null, hit: false };
    var ffScan = function (L) {
      if (FF.hit) return;
      var p = FF.p, q = FF.q, dx = q.x - p.x, dz = q.z - p.z, Lg = Math.hypot(dx, dz) || 1, ux = dx / Lg, uz = dz / Lg;
      for (var i = 0; i < L.length; i++) {
        var m = L[i]; if (!m || !m.g || m.g.position === p || m.down29 || m.down17 || (m.down > 0) || m.hp <= 0 || !m.g.visible) continue;
        var wx = m.g.position.x - p.x, wz = m.g.position.z - p.z, tt = wx * ux + wz * uz;
        if (tt < 0.8 || tt > Lg - 0.8) continue;
        if (Math.abs(wx * uz - wz * ux) < 0.8) { FF.hit = true; return; }
      }
    };
    plf33 = function (p, q) {
      if (_plf(p, q)) return true;
      if (!BR.on) return false;
      FF.p = p; FF.q = q; FF.hit = false; allyLists(ffScan);
      if (FF.hit) BR.stats.ffAlly++;
      return FF.hit;
    };
  }

  /* ------------------------------------------------------------------ */
  /* 7. Cerebro Aethrion v40: un solo miedo (sincronizado desde aquí)     */
  /* ------------------------------------------------------------------ */
  var S40 = W.AETH && W.AETH.v40 && W.AETH.v40.soldiers;
  if (S40 && typeof S40.pulse === 'function') {
    var _pulse = S40.pulse, KEEP = [];
    S40.pulse = function (dt) {
      if (!BR.on) return _pulse.call(S40, dt);
      var all = S40.units; KEEP.length = 0;
      for (var i = 0; i < all.length; i++) {
        var bd = all[i], u = bd.unit;
        if (bd.alive && u && u.b50 && u.a33) {
          var b = u.b50;
          bd.fear = b.fear; bd.morale = b.mor;
          if (bd.view) { bd.view.fear = Math.round(b.fear * 1000) / 1000; bd.view.morale = Math.round(b.mor * 1000) / 1000; bd.view.hesitations = bd.hesitations; }
          try { bd.brain.emotions.state.miedo = b.fear; } catch (er) {}
          if (typeof enemies !== 'undefined' && enemies.indexOf(u) < 0) S40.markDead(bd, b.sur ? 'prisionero' : 'retirado del campo');
        } else KEEP.push(bd);
      }
      S40.units = KEEP;
      try { return _pulse.call(S40, dt); } finally { S40.units = all; }
    };
    BR.dedup.push('pulso v40 (miedo/dudas paralelos) excluido para soldados AI33; sincronizado desde BRAIN50');
  }

  /* ------------------------------------------------------------------ */
  /* 8. Cuadro: rendiciones, presupuesto, reinicio por nivel              */
  /* ------------------------------------------------------------------ */
  function capture(e) {
    var nC = typeof corpses !== 'undefined' ? corpses.length : 0;
    e.lastBy = null;
    try { kill(e); } catch (er) {}
    if (typeof corpses !== 'undefined' && corpses.length > nC) {
      var c = corpses.pop();
      var u = c && c.g && c.g.userData;
      if (u && u.l1) { /* prisionero: de rodillas, manos en la nuca */
        try {
          u.l1.position.y = u.l2.position.y = 0.4; u.l1.rotation.x = u.l2.rotation.x = 0.1; u.k1.rotation.x = u.k2.rotation.x = 1.55;
          u.aR.rotation.x = u.aL.rotation.x = -2.6; if (u.eR) u.eR.rotation.x = -1.6; if (u.eL) u.eL.rotation.x = -1.6;
          c.g.position.y = (c.g.position.y || 0) - 0.35;
        } catch (er) {}
      }
    }
    BR.stats.captured++;
    try { feed('★ Un soldado enemigo se rinde y queda prisionero'); } catch (er) {}
  }
  BR.frame = function (dt) {
    var t0 = performance.now(), t = now();
    if (typeof level !== 'undefined' && level !== BR.lv) { BR.lv = level; dedup(); BR.surL.length = 0; BR.stats = stats0(); BR.msSum = 0; BR.frames = 0; BR.msMax = 0; }
    for (var i = BR.surL.length - 1; i >= 0; i--) {
      var e = BR.surL[i];
      if (!e || e.hp <= 0 || enemies.indexOf(e) < 0) { BR.surL.splice(i, 1); continue; }
      if (t - e.b50.surT > 9 || dP(e) < 6) { BR.surL.splice(i, 1); capture(e); }
    }
    var ms = BR._ms + (performance.now() - t0);
    BR._ms = 0; BR._emoN = 0; BR._farN = 0;
    BR.ms += (ms - BR.ms) * 0.05; BR.msSum += ms; BR.frames++; if (ms > BR.msMax) BR.msMax = ms;
  };
  if (typeof update === 'function') {
    var _up = update;
    update = function (dt) {
      var r = _up(dt);
      if (BR.on && typeof playing !== 'undefined' && playing) { try { BR.frame(dt); } catch (er) { if (!BR.err) { BR.err = 1; console.warn('[brain_v50]', er); } } }
      return r;
    };
  }

  BR.metrics = function () {
    var D = AI33.stats(), st = BR.stats, n = 0, f = 0, m = 0;
    for (var i = 0; i < AI33.list.length; i++) { var b = AI33.list[i].b50; if (b) { n++; f += b.fear; m += b.mor; } }
    return { on: BR.on, managed: AI33.list.length, fear: n ? +(f / n).toFixed(2) : 0, mor: n ? +(m / n).toFixed(2) : 1,
      aiMs: D.msAvg, aiMsMax: D.msMax, brainMs: +(BR.msSum / Math.max(1, BR.frames)).toFixed(3), brainMsMax: +BR.msMax.toFixed(2),
      stats: JSON.parse(JSON.stringify(st)), rumorCfg: AI33.cfg.rumor };
  };
  /* QA: forzar estados para pruebas visuales (consola) */
  BR.qa = {
    surrender: function (e) { if (e && e.a33) { var b = e.b50 || initB(e, e.a33); if (!b.sur) startSurrender(e, e.a33, b, now()); return true; } return false; },
    fear: function (e, v) { if (e && e.b50) { e.b50.fear = cl(v, 0, 1); return true; } return false; }
  };
  BR.setOn = function (v) {
    BR.on = !!v;
    if (!BR.on) for (var i = 0; i < AI33.list.length; i++) { var e = AI33.list[i], b = e.b50; if (b && e.a33) { var pf = e.a33.pf, B = b.base; pf.acc = B.acc; pf.react = B.react; pf.cov = B.cov; pf.adv = B.adv; pf.brave = B.brave; } }
    return BR.on;
  };

  /* ------------------------------------------------------------------ */
  /* 9. Depuración: overlay compacto (Mayús+K) y pestaña en el panel K   */
  /* ------------------------------------------------------------------ */
  var OV = null, ovT = 0, ovOn = false;
  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return c === '&' ? '&amp;' : c === '<' ? '&lt;' : '&gt;'; }); }
  function pc(v) { return Math.round(v * 100); }
  function ovHTML() {
    var M = BR.metrics(), st = M.stats, D = AI33.dbg, h = [], lod = [0, 0, 0], L = AI33.list, top = [];
    for (var i = 0; i < L.length; i++) { var b = L[i].b50; if (b) { lod[b.lod]++; top.push(L[i]); } }
    top.sort(function (x, y) { return y.b50.fear - x.b50.fear; });
    h.push('<b>CEREBRO v50</b> ' + (BR.on ? 'activo' : 'apagado') + ' · IA ' + M.aiMs + ' ms (máx ' + M.aiMsMax + ') · capa ' + M.brainMs + ' ms');
    h.push('NPC ' + M.managed + ' · LOD cerca/medio/lejos ' + lod.join('/') + ' · miedo ' + pc(M.fear) + '% · moral ' + pc(M.mor) + '%');
    var ss = []; for (var k in D.st) ss.push(k + ' ' + D.st[k]);
    h.push('<span style="opacity:.75">estados: ' + esc(ss.join(' · ')) + '</span>');
    h.push('clavados ' + st.pinned + ' · dudas ' + st.hes + ' · pánico ' + st.panic + ' · repliegues ' + st.retreat + ' · rendidos ' + st.surrender + '/' + st.captured +
      ' · oficiales caídos ' + st.offDead + ' · FF aliado ' + st.ffAlly + ' · prioridad ' + st.prio + ' · memoria perdida ' + st.memDrop + ' · rumor ' + st.rumor);
    for (var j = 0; j < Math.min(5, top.length); j++) {
      var e = top[j], q = e.b50, a = e.a33;
      h.push('<span style="color:' + (q.fear > 0.7 ? '#ff9a7a' : q.fear > 0.4 ? '#f3d27a' : '#b9e68c') + '">' + esc(label(e).slice(0, 22)) + ' · ' + a.s + ' · ' + a.role +
        ' · miedo ' + pc(q.fear) + ' · moral ' + pc(q.mor) + ' · mem ' + q.conf.toFixed(2) + ' · L' + q.lod + (q.sur ? ' · RENDIDO' : '') + '</span>');
    }
    return h.join('<br>');
  }
  function overlay(v) {
    ovOn = v === undefined ? !ovOn : !!v;
    if (!OV) {
      OV = document.createElement('div'); OV.id = 'br50ov';
      OV.style.cssText = 'position:fixed;left:8px;top:160px;z-index:45;max-width:min(400px,70vw);background:#0b0a08bb;color:#e9dcb8;font:10px/1.3 ui-monospace,Menlo,Consolas,monospace;padding:6px 8px;border:1px solid #8a6a3288;border-radius:4px;pointer-events:none;display:none';
      document.body.appendChild(OV);
    }
    OV.style.display = ovOn ? 'block' : 'none';
    if (ovOn) OV.innerHTML = ovHTML();
    return ovOn;
  }
  BR.overlay = overlay;
  setInterval(function () {
    try {
      if (ovOn && OV) OV.innerHTML = ovHTML();
      var host = document.getElementById('a40-t-v50');
      if (host && host.classList.contains('on')) host.innerHTML = tabHTML();
    } catch (er) {}
  }, 300);
  W.addEventListener('keydown', function (ev) {
    if ((ev.key === 'K' || ev.key === 'k') && ev.shiftKey && !(ev.target && /input|textarea|select/i.test(ev.target.tagName || ''))) {
      overlay(); ev.stopImmediatePropagation(); ev.preventDefault();
    }
  }, true);
  function tabHTML() {
    return '<div class="a40-card"><h4>Cerebro v50 · una tubería por soldado</h4>' +
      '<p class="a40-note">Percepción (cono, postura, niebla, línea de vista y oído de AI33) → memoria de la última posición conocida con confianza que decae → miedo y moral únicos (supresión, heridas, bajas, oficial caído, aislamiento, personalidad Aethrion y veteranía) → decisión: clavarse a cubierto, dudar, flanquear, replegarse, entrar en pánico o rendirse. Overlay compacto: Mayús+K.</p>' +
      '<div style="display:flex;gap:6px;flex-wrap:wrap;margin:6px 0"><button class="pri" data-b50="on" type="button">' + (BR.on ? 'Desactivar cerebro v50' : 'Activar cerebro v50') + '</button>' +
      '<button data-b50="ov" type="button">' + (ovOn ? 'Ocultar overlay' : 'Mostrar overlay') + '</button></div>' +
      '<div style="font:12px/1.4 ui-monospace,Menlo,Consolas,monospace">' + ovHTML() + '</div>' +
      '<p class="a40-note" style="margin-top:6px">Duplicados retirados: ' + esc(BR.dedup.join(' · ')) + '</p></div>';
  }
  function mountTab() {
    var panel = document.getElementById('a40panel');
    if (!panel || document.getElementById('a40-t-v50')) return !!panel;
    var tabs = panel.querySelector('.a40-tabs'), body = panel.querySelector('#a40-t-soldados');
    if (!tabs || !body) return false;
    var btn = document.createElement('button'); btn.type = 'button'; btn.dataset.tab = 'v50'; btn.textContent = 'Cerebro v50';
    tabs.insertBefore(btn, tabs.querySelector('[data-tab="batalla"]'));
    var div = document.createElement('div'); div.className = 'a40-tab'; div.dataset.tab = 'v50'; div.id = 'a40-t-v50';
    body.parentNode.insertBefore(div, body.nextSibling);
    div.addEventListener('click', function (ev) {
      var k = ev.target && ev.target.getAttribute && ev.target.getAttribute('data-b50');
      if (k === 'on') BR.setOn(!BR.on); else if (k === 'ov') overlay();
      div.innerHTML = tabHTML();
    });
    btn.addEventListener('click', function () { setTimeout(function () { div.innerHTML = tabHTML(); }, 0); });
    return true;
  }
  if (!mountTab()) { var tries = 0, iv = setInterval(function () { if (mountTab() || ++tries > 20) clearInterval(iv); }, 500); }

  dedup();
  if (W.console) console.log('[brain_v50] ' + BR.version + ' · ' + BR.dedup.length + ' duplicados retirados');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(install, 0); });
  else install();
})(typeof window !== 'undefined' ? window : globalThis);
