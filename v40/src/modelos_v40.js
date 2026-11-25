/* =========================================================================
   v40/src/modelos_v40.js — detalle aditivo de los modelos 3D del juego.

   Qué hace
   --------
   Envuelve los constructores que la v39 usa en TODOS los capítulos y les
   añade piezas pequeñas (correas, cartucheras, cantimploras, bandas de
   culata, abrazaderas, hojas de palmera, contraventanas…) sobre la MISMA
   jerarquía de articulaciones. No reemplaza geometría ni cambia el tamaño,
   la posición, los `userData` (bolt, mag, knob, cyl) ni los nombres de los
   huesos: la animación, la IA, el ragdoll y la fusión de mallas de la v39
   siguen funcionando igual.

   Constructores envueltos
   -----------------------
     human()           infantería, aliados, NPC y el propio jugador (niveles I–IX)
     mkSoldier()       infantería detallada (niveles IX–XVIII)
     mkRifle()         fusil de cerrojo (manos del jugador y enemigos)
     mkSMG()           subfusil (manos del jugador y enemigos)
     mkMG08()          ametralladora de emplazamiento
     palm(), house(), crate(), barrel()   props repetidos en todos los niveles

   Reglas
   ------
     · No usa `R()`: un número aleatorio propio (mulberry32) para no alterar
       la secuencia aleatoria con la que se generan los niveles.
     · Nunca lanza: si un detalle falla, el modelo original queda intacto.
     · `?modelos=0` desactiva toda la capa; `AETH.v40.modelos.estado()` dice
       qué se instaló, cuántos modelos se detallaron y si hubo errores.

   Se inyecta desde v40/tools/build_v40.py después de la capa de assets.
   ========================================================================= */
(function (g) {
  'use strict';

  var AETH = (g.AETH = g.AETH || {});
  var V = (AETH.v40 = AETH.v40 || {});

  var T = g.THREE;
  if (!T || !T.Group) {
    if (g.console) console.warn('[modelos v40] falta THREE: capa desactivada');
    return;
  }

  var consulta = (g.location && g.location.search) || '';
  var activo = !/[?&]modelos=0\b/.test(consulta);

  var registro = {
    activo: false,
    instalados: [],
    detallados: 0,
    armas: 0,
    props: 0,
    errores: []
  };

  /* --------------------------------------------------------------- azar */
  /* PRNG propio: no consume la secuencia `R()` del juego (esa secuencia
     decide posiciones de enemigos y decoración; alterarla cambiaría los
     niveles). */
  var semilla = 0x9e3779b9;
  function azar() {
    semilla = (semilla + 0x6d2b79f5) | 0;
    var t = semilla;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /* ---------------------------------------------------------- materiales */
  var cache = new Map();
  function material(color, em) {
    if (typeof sMat === 'function') return sMat(color, em || 0);
    var clave = color + '|' + (em || 0);
    var m = cache.get(clave);
    if (!m) {
      m = new T.MeshLambertMaterial({ color: color, emissive: em || 0 });
      cache.set(clave, m);
    }
    return m;
  }

  function caja(p, w, h, d, c, x, y, z, rx, ry, rz) {
    var m = new T.Mesh(new T.BoxGeometry(w, h, d), material(c));
    m.position.set(x, y, z);
    if (rx) m.rotation.x = rx;
    if (ry) m.rotation.y = ry;
    if (rz) m.rotation.z = rz;
    p.add(m);
    return m;
  }

  function cil(p, r1, r2, h, c, x, y, z, rx, ry, rz, seg) {
    var m = new T.Mesh(new T.CylinderGeometry(r1, r2, h, seg || 8), material(c));
    m.position.set(x, y, z);
    if (rx) m.rotation.x = rx;
    if (ry) m.rotation.y = ry;
    if (rz) m.rotation.z = rz;
    p.add(m);
    return m;
  }

  function esfera(p, r, c, x, y, z, seg) {
    var m = new T.Mesh(new T.SphereGeometry(r, seg || 6, seg ? seg - 2 : 4), material(c));
    m.position.set(x, y, z);
    p.add(m);
    return m;
  }

  /* ------------------------------------------------------------ infantería */
  /* Piezas comunes a `human()` y `mkSoldier()`: cinturón, cartucheras,
     cantimplora, bandolera, correas de casco y parches. Coordenadas locales
     de cada articulación, medidas sobre los modelos originales. */
  function detallarInfante(g) {
    var u = g && g.userData;
    if (!u || !u.ch || !u.b) return false;
    if (u.__detalle40) return true;
    u.__detalle40 = true;

    var b = u.b, ch = u.ch, hd = u.hd, det = !!u.v16;

    /* cinturón, hebilla y cartucheras */
    caja(b, 0.55, 0.06, 0.4, 0x2a1c10, 0, 0.13, 0);
    caja(b, 0.07, 0.045, 0.02, 0xb8943a, 0, 0.13, 0.203);
    for (var i = -1; i <= 1; i++) {
      caja(b, 0.11, 0.13, 0.085, 0x3a2a18, i * 0.14, 0.185, 0.2);
      caja(b, 0.115, 0.025, 0.09, 0x241a10, i * 0.14, 0.25, 0.2);
    }

    /* cantimplora (derecha) y bolsa de pan (izquierda) */
    cil(b, 0.062, 0.062, 0.16, 0x4a4a38, 0.29, 0.075, -0.03, 0, 0, 1.5708, 10);
    caja(b, 0.03, 0.04, 0.03, 0x2a2a22, 0.29, 0.17, -0.03);
    caja(b, 0.16, 0.19, 0.1, 0x6a5a3c, -0.29, 0.06, -0.02);
    caja(b, 0.17, 0.04, 0.11, 0x4e4230, -0.29, 0.165, -0.02);

    /* manta enrollada sobre la mochila (sólo si el modelo no la trae) */
    if (!det) {
      caja(b, 0.34, 0.11, 0.13, 0x5a5a48, 0, 0.22, -0.26);
      caja(b, 0.05, 0.12, 0.14, 0x3a3a2c, -0.13, 0.22, -0.26);
      caja(b, 0.05, 0.12, 0.14, 0x3a3a2c, 0.13, 0.22, -0.26);
    }

    /* cuello, hombreras y botones */
    caja(ch, 0.34, 0.055, 0.34, 0x2a241c, 0, 0.7, 0);
    for (var s = -1; s <= 1; s += 2) {
      caja(ch, 0.15, 0.03, 0.34, 0x23261f, s * 0.23, 0.7, 0);
      caja(ch, 0.035, 0.02, 0.035, 0xc9a23a, s * 0.25, 0.723, 0.14);
    }
    for (var k = 0; k < 4; k++) caja(ch, 0.03, 0.03, 0.015, 0xb8a060, 0, 0.12 + k * 0.13, 0.204);

    /* bandolera con cartuchos y bolsillo de pecho */
    caja(ch, 0.045, 0.34, 0.02, 0x3a2a18, -0.16, 0.5, 0.199, 0, 0, 0.42);
    for (var r = 0; r < 4; r++) {
      caja(ch, 0.028, 0.06, 0.022, 0xb8943a, -0.2 + r * 0.05, 0.42 + r * 0.05, 0.207, 0, 0, 0.42);
    }
    caja(ch, 0.13, 0.11, 0.02, 0x33362f, 0.19, 0.5, 0.202);
    caja(ch, 0.14, 0.025, 0.025, 0x22251f, 0.19, 0.558, 0.206);

    /* parche de unidad en el brazo izquierdo */
    caja(u.aL, 0.02, 0.09, 0.075, 0x8a2430, 0.105, -0.12, 0.01);
    caja(u.aL, 0.021, 0.03, 0.03, 0xd8c890, 0.106, -0.12, 0.01);

    /* correa de casco y cubrenuca */
    caja(hd, 0.018, 0.14, 0.02, 0x241a10, -0.17, 0.2, 0.05, 0, 0, 0.22);
    caja(hd, 0.018, 0.14, 0.02, 0x241a10, 0.17, 0.2, 0.05, 0, 0, -0.22);
    caja(hd, 0.29, 0.02, 0.02, 0x241a10, 0, 0.09, 0.12);

    if (det) {
      /* infantería detallada: máscara antigás, cuchillo de trinchera y
         cantimplora metálica colgada del cinturón */
      cil(ch, 0.058, 0.058, 0.17, 0x3e4a32, 0.3, 0.42, 0.21, 1.5708, 0, 0, 10);
      caja(ch, 0.03, 0.14, 0.02, 0x2a3324, 0.3, 0.42, 0.19);
      caja(b, 0.05, 0.24, 0.035, 0x6a4a28, -0.19, 0.02, 0.19, 0, 0, 0.16);
      caja(b, 0.07, 0.05, 0.05, 0x2a2a26, -0.19, 0.155, 0.19);
      for (var p = -1; p <= 1; p += 2) {
        caja(u.k1, 0.26, 0.022, 0.29, 0x3a3426, 0, -0.2 - (p > 0 ? 0.05 : 0.02), 0);
        caja(u.k2, 0.26, 0.022, 0.29, 0x3a3426, 0, -0.2 - (p > 0 ? 0.05 : 0.02), 0);
      }
    } else {
      /* human(): vueltas de polaina y bolsillo del muslo */
      caja(u.k1, 0.262, 0.02, 0.285, 0x2f2a1e, 0, -0.23, 0);
      caja(u.k2, 0.262, 0.02, 0.285, 0x2f2a1e, 0, -0.23, 0);
      caja(u.k1, 0.26, 0.02, 0.282, 0x2a2519, 0, -0.3, 0);
      caja(u.k2, 0.26, 0.02, 0.282, 0x2a2519, 0, -0.3, 0);
      caja(u.l1, 0.03, 0.13, 0.1, 0x2f2a1e, 0.13, -0.19, 0.03);
      caja(u.l2, 0.03, 0.13, 0.1, 0x2f2a1e, -0.13, -0.19, 0.03);
    }

    return true;
  }

  /* --------------------------------------------------------------- armas */

  function detallarFusil(w) {
    if (!w || !w.userData || w.userData.__fusil40) return w;
    w.userData.__fusil40 = true;
    /* placa de culata y carrillera */
    caja(w, 0.093, 0.02, 0.18, 0xb8943a, 0, 0.868, -0.09);
    caja(w, 0.088, 0.13, 0.022, 0x6a4426, 0, 0.5, -0.148);
    /* abrazaderas del cañón */
    caja(w, 0.064, 0.02, 0.085, 0x9aa0a6, 0, -0.42, 0);
    caja(w, 0.06, 0.02, 0.08, 0x9aa0a6, 0, -1.02, 0);
    /* alza de hoja y punto de mira protegido */
    caja(w, 0.052, 0.022, 0.045, 0x2a2a2a, 0, -0.06, 0.055);
    caja(w, 0.012, 0.05, 0.018, 0x8a9096, 0, -0.03, 0.055);
    caja(w, 0.034, 0.03, 0.02, 0x9aa0a6, 0, -1.18, 0.048);
    /* baqueta bajo el cañón */
    cil(w, 0.008, 0.008, 0.62, 0x8a9096, 0, -0.82, 0.045, 0, 0, 0, 6);
    /* correa portafusil con hebilla */
    caja(w, 0.014, 0.5, 0.022, 0x4a2f1c, -0.05, 0.24, -0.1, -0.1, 0, 0);
    caja(w, 0.014, 0.3, 0.022, 0x4a2f1c, 0.05, -0.34, -0.02, 0.14, 0, 0);
    caja(w, 0.032, 0.032, 0.026, 0xa08040, -0.05, 0.44, -0.11);
    /* tornillo de la placa de pistola y seguro */
    caja(w, 0.02, 0.02, 0.02, 0x777777, -0.04, -0.03, 0.075);
    caja(w, 0.018, 0.04, 0.02, 0x111111, 0.055, -0.06, 0.06);
    registro.armas++;
    return w;
  }

  function detallarSubfusil(w) {
    if (!w || !w.userData || w.userData.__smg40) return w;
    w.userData.__smg40 = true;
    /* culata plegable de alambre */
    caja(w, 0.02, 0.62, 0.02, 0x2a2a2a, -0.05, 0.5, -0.02);
    caja(w, 0.02, 0.62, 0.02, 0x2a2a2a, 0.05, 0.5, -0.02);
    caja(w, 0.13, 0.055, 0.03, 0x2a2a2a, 0, 0.83, -0.02);
    caja(w, 0.13, 0.05, 0.025, 0x4a2f1c, 0, 0.8, -0.005);
    /* cachas de baquelita */
    caja(w, 0.013, 0.15, 0.055, 0x6a3a20, -0.053, -0.02, 0);
    caja(w, 0.013, 0.15, 0.055, 0x6a3a20, 0.053, -0.02, 0);
    /* boquilla roscada y alza */
    cil(w, 0.036, 0.036, 0.045, 0x222222, 0, -1.16, 0);
    caja(w, 0.042, 0.018, 0.03, 0x2a2a2a, 0, 0.05, 0.07);
    /* correa corta y anilla de portafusil */
    caja(w, 0.012, 0.44, 0.02, 0x4a2f1c, -0.045, 0.22, 0.05, 0, 0, 0.05);
    caja(w, 0.03, 0.03, 0.025, 0x777777, -0.045, 0.44, 0.045);
    /* selector de tiro */
    caja(w, 0.02, 0.045, 0.02, 0x111111, 0.062, -0.05, 0.06);
    registro.armas++;
    return w;
  }

  function detallarRevolver(w) {
    if (!w || w.userData.__rev40) return w;
    w.userData.__rev40 = true;
    caja(w, 0.07, 0.02, 0.11, 0xb8943a, 0, -0.27, 0.03);
    caja(w, 0.02, 0.03, 0.03, 0x8a8f95, 0, -0.14, 0.09);
    caja(w, 0.012, 0.09, 0.02, 0x222222, 0.055, -0.02, 0.02, 0, 0, 0.3);
    registro.armas++;
    return w;
  }

  function detallarSable(w) {
    if (!w || w.userData.__sable40) return w;
    w.userData.__sable40 = true;
    caja(w, 0.024, 0.16, 0.024, 0x2a1a0c, 0, 0.05, 0);
    caja(w, 0.012, 0.09, 0.012, 0xc9a23a, 0.045, 0.05, 0);
    registro.armas++;
    return w;
  }

  function detallarMG(r) {
    if (!r || !r.bar) return;
    var bar = r.bar;
    if (bar.userData.__mg40) return;
    bar.userData.__mg40 = true;
    /* cinta de munición entrando por la izquierda, con cartuchos */
    caja(bar, 0.022, 0.26, 0.07, 0x4a5a2a, -0.2, -0.1, 0.1, 0, 0, 0.18);
    for (var i = 0; i < 7; i++) {
      caja(bar, 0.032, 0.055, 0.03, 0xb8943a, -0.215 - i * 0.012, -0.03 - i * 0.048, 0.1);
    }
    caja(bar, 0.3, 0.2, 0.26, 0x3a4a2a, -0.3, -0.4, 0.05);
    /* manguera de refrigeración y depósito de condensación */
    cil(bar, 0.02, 0.02, 0.5, 0x2a2a22, 0.2, 0.06, 0.72, 0.9, 0, 0.3, 6);
    cil(bar, 0.17, 0.17, 0.2, 0x6a6a62, 0.55, -0.05, 0.5, 0.2, 0, 0, 10);
    /* volante de puntería y culata de pistones */
    cil(bar, 0.11, 0.11, 0.035, 0x2a2a28, -0.42, 0.02, -0.6, 0, 0, 1.5708, 10);
    caja(bar, 0.03, 0.03, 0.14, 0x222222, -0.42, 0.02, -0.58);
    caja(bar, 0.02, 0.1, 0.02, 0x111111, -0.42, 0.02, -0.51);
    for (var s = -1; s <= 1; s += 2) {
      caja(bar, 0.06, 0.13, 0.1, 0x2a1a10, s * 0.09, 0.07, -0.46, -0.2, 0, 0);
    }
    /* escudo y caja de munición a los pies */
    caja(r.g, 0.36, 0.24, 0.3, 0x3a4a2a, -0.55, 0.12, 0.1);
    caja(r.g, 0.38, 0.03, 0.32, 0x2a3a1a, -0.55, 0.25, 0.1);
    registro.armas++;
  }

  /* ------------------------------------------------------- entorno (props) */

  function detallarPalmera(g) {
    if (!g || g.userData.__palm40) return;
    g.userData.__palm40 = true;
    /* localizar la corona: último segmento de tronco */
    var alto = -1e9, x = 0, y = 0;
    for (var i = 0; i < g.children.length; i++) {
      var c = g.children[i];
      if (c.geometry && c.geometry.type === 'CylinderGeometry' && c.position.y > alto) {
        alto = c.position.y;
        x = c.position.x;
        y = c.position.y + 0.95;
      }
    }
    if (alto < -1e8) return;

    /* anillos de la corteza */
    for (var t = 0; t < 4; t++) {
      cil(g, 0.29 - t * 0.02, 0.3 - t * 0.02, 0.05, 0x4e3520, x * (t / 4), 1 + t * 1.85, 0, 0, 0, 0, 7);
    }
    /* fronda seca colgando y racimo de dátiles */
    for (var d = 0; d < 3; d++) {
      var a = d * 2.1 + azar();
      var hoja = cil(g, 0.03, 0.16, 1.6, 0x7a5a2a, x + Math.cos(a) * 0.6, y - 0.5, Math.sin(a) * 0.6, 0, 0, 0, 3);
      hoja.rotation.z = Math.cos(a) * 0.5 + 0.35;
      hoja.rotation.x = Math.sin(a) * 0.5;
    }
    for (var f = 0; f < 5; f++) {
      var b = f / 5 * 6.283 + 0.4;
      esfera(g, 0.1, f % 2 ? 0x5a3a12 : 0x7a4a18, x + Math.cos(b) * 0.3, y - 0.32, Math.sin(b) * 0.3, 5);
    }
    /* dos frondas nuevas altas, más cortas */
    for (var n = 0; n < 2; n++) {
      var ang = n * 3.1 + 0.7;
      var nueva = cil(g, 0.02, 0.2, 2.4, 0x46701f, x + Math.cos(ang) * 0.5, y + 0.5, Math.sin(ang) * 0.5, 0, 0, 0, 3);
      nueva.rotation.z = Math.cos(ang) * 0.9 + 0.6;
      nueva.rotation.x = Math.sin(ang) * 0.9;
    }
    registro.props++;
  }

  function escena() {
    try {
      return typeof scene !== 'undefined' ? scene : null;
    } catch (e) {
      return null;
    }
  }

  function detallarCasa(x, z, w, d, h) {
    var S = escena();
    if (!S) return;
    /* contraventanas, dintel, escalón, cresta de tejado y chimenea */
    for (var s = -1; s <= 1; s += 2) {
      caja(S, 0.06, 1.25, 0.08, 0x4a3a2a, x + s * w * 0.3 - 0.56, h * 0.6, z + d / 2 + 0.06);
      caja(S, 0.06, 1.25, 0.08, 0x4a3a2a, x + s * w * 0.3 + 0.56, h * 0.6, z + d / 2 + 0.06);
    }
    caja(S, 1.5, 0.18, 0.24, 0x6a5238, x, 2.62, z + d / 2 + 0.05);
    caja(S, 1.45, 0.16, 0.5, 0x8a8070, x, 0.08, z + d / 2 + 0.28);
    caja(S, w + 0.5, 0.12, 0.18, 0x8a5e42, x, h + 0.43, z);
    caja(S, 0.5, 1.2, 0.5, 0x6a4a38, x - w * 0.26, h + 0.85, z - d * 0.2);
    caja(S, 0.6, 0.1, 0.6, 0x3a2a20, x - w * 0.26, h + 1.47, z - d * 0.2);
    registro.props++;
  }

  function detallarCaja(x, z) {
    var S = escena();
    if (!S) return;
    caja(S, 1.24, 0.1, 1.24, 0x5a3f26, x, 1.16, z);
    caja(S, 1.24, 0.1, 1.24, 0x5a3f26, x, 0.06, z);
    for (var s = -1; s <= 1; s += 2) {
      caja(S, 0.08, 1.2, 1.2, 0x4a3320, x + s * 0.62, 0.6, z);
    }
    caja(S, 0.3, 0.2, 0.02, 0xd8c890, x, 0.78, z + 0.61);
    registro.props++;
  }

  function detallarBarril(x, z) {
    var S = escena();
    if (!S) return;
    cil(S, 0.468, 0.468, 0.06, 0x2a2a28, x, 0.72, z, 0, 0, 0, 12);
    cil(S, 0.468, 0.468, 0.06, 0x2a2a28, x, 0.3, z, 0, 0, 0, 12);
    cil(S, 0.2, 0.2, 0.02, 0x3a2a18, x, 1.005, z, 0, 0, 0, 10);
    registro.props++;
  }

  /* `palm()` no devuelve su grupo (lo añade directo a la escena): se busca
     por su posición para detallarlo. */
  function detallarPalmeraEn(x, z) {
    var S = escena();
    if (!S) return;
    for (var i = S.children.length - 1; i >= 0; i--) {
      var c = S.children[i];
      if (c && c.type === 'Group' && Math.abs(c.position.x - x) < 0.02 && Math.abs(c.position.z - z) < 0.02) {
        detallarPalmera(c);
        return;
      }
    }
  }

  /* -------------------------------------------------------- envoltura */
  function envolver(nombre, extra) {
    var original = g[nombre];
    if (typeof original !== 'function' || original.__envuelto40) return false;
    var envuelto = function () {
      var r = original.apply(this, arguments);
      try {
        extra(r, arguments);
      } catch (e) {
        if (registro.errores.length < 20) registro.errores.push(nombre + ': ' + (e && e.message));
      }
      return r;
    };
    envuelto.__envuelto40 = true;
    envuelto.__original40 = original;
    g[nombre] = envuelto;
    registro.instalados.push(nombre);
    return true;
  }

  /* Aplica el detalle a actores ya creados antes de cargar esta capa (el
     jugador, la escuadra y el oficial de la v39). */
  function repasarExistentes() {
    var tocados = 0;
    function tocar(figura) {
      if (figura && figura.userData && detallarInfante(figura)) tocados++;
    }
    try {
      /* pW es un const global del script del juego, accesible por nombre */
      if (typeof pW === 'object' && pW) {
        detallarFusil(pW.rifle);
        detallarSubfusil(pW.smg);
        detallarRevolver(pW.rev);
        detallarRevolver(pW.rev2);
        detallarSable(pW.sword);
      }
    } catch (e) {
      registro.errores.push('pW: ' + (e && e.message));
    }
    try {
      if (typeof P === 'object' && P && P.g) tocar(P.g);
    } catch (e) {
      /* P aún en zona muerta */
    }
    try {
      if (typeof allies !== 'undefined' && allies) allies.forEach(function (a) { tocar(a && a.g); });
    } catch (e) { /* sin aliados todavía */ }
    try {
      if (typeof officer !== 'undefined' && officer && officer.g) tocar(officer.g);
    } catch (e) { /* sin oficial */ }
    return tocados;
  }

  function instalar() {
    if (registro.activo || !activo) return registro;
    registro.activo = true;

    envolver('human', function (r) { detallarInfante(r); });
    envolver('mkSoldier', function (r) { detallarInfante(r); });
    envolver('mkRifle', function (r) { detallarFusil(r); });
    envolver('mkSMG', function (r) { detallarSubfusil(r); });
    envolver('mkMG08', function (r) { detallarMG(r); });
    envolver('palm', function (r, args) { detallarPalmeraEn(args[0], args[1]); });
    envolver('house', function (r, args) { detallarCasa(args[0], args[1], args[2], args[3], args[4]); });
    envolver('crate', function (r, args) { detallarCaja(args[0], args[1]); });
    envolver('barrel', function (r, args) { detallarBarril(args[0], args[1]); });

    registro.detallados += repasarExistentes();
    if (g.console && console.info) {
      console.info(
        '[modelos v40] instalados: ' + registro.instalados.join(', ') +
        ' · actores ya presentes: ' + registro.detallados
      );
    }
    return registro;
  }

  function estado() {
    return {
      activo: registro.activo,
      disponibles: activo,
      instalados: registro.instalados.slice(),
      detallados: registro.detallados,
      armas: registro.armas,
      props: registro.props,
      errores: registro.errores.slice()
    };
  }

  V.modelos = {
    version: '1.0.0',
    instalar: instalar,
    estado: estado,
    repasar: function () { return repasarExistentes(); },
    detallarInfante: detallarInfante
  };

  if (activo) {
    try {
      instalar();
    } catch (e) {
      registro.errores.push('instalación: ' + (e && e.message));
      if (g.console) console.warn('[modelos v40] no se pudo instalar:', e);
    }
  }
})(typeof window !== 'undefined' ? window : globalThis);
