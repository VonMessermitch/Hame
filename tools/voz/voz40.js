/* voz40.js — reproductor de voces pregrabadas (Kokoro en local) para el HTML único.
 *
 * Aditivo: si no hay VOZ40.datos, no hace nada. Usa el AudioContext y el bus
 * maestro del juego (ac / AB()) si existen; si no, crea el suyo.
 *
 *   VOZ40.decir('koller_01')      -> reproduce ese clip
 *   VOZ40.porTexto('¡Vamos, recluta! ...') -> id o null
 *   VOZ40.engancharTalk()         -> engancha el reproductor a talk() y say() sin tocar subtítulos
 *
 * Integración: el build (v40/tools/build_v40.py) inyecta este archivo y
 * v40/data/voces_v40.js antes del arranque y llama a VOZ40.engancharTalk()
 * dentro de un try. No hace falta editar el HTML a mano.
 */
(function () {
  'use strict';
  var VOZ = window.VOZ40 || (window.VOZ40 = {});
  var cache = {}, ctx = null, ganancia = null, activo = null;

  function normalizar(t) {
    return String(t || '')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[«»¡!¿?.,;:"'()\[\]—–-]/g, ' ')
      .toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function audio() {
    var ac = window.ac;
    if (ac && ac.decodeAudioData) return ac;
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    return ctx;
  }

  function destino(ac) {
    var bus = null;
    try { if (typeof window.AB === 'function') bus = AB(); } catch (e) { bus = null; }
    if (!bus) { if (!ganancia) { ganancia = ac.createGain(); ganancia.gain.value = 1; ganancia.connect(ac.destination); } bus = ganancia; }
    return bus;
  }

  function b64aBytes(b64) {
    var bin = atob(b64), n = bin.length, out = new Uint8Array(n);
    for (var i = 0; i < n; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  function decodificar(id, cb) {
    if (cache[id]) { cb(null, cache[id]); return; }
    var b64 = VOZ.datos && VOZ.datos[id];
    if (!b64) { cb(new Error('sin clip: ' + id)); return; }
    var ac = audio();
    if (!ac) { cb(new Error('sin AudioContext')); return; }
    ac.decodeAudioData(b64aBytes(b64).buffer, function (buf) { cache[id] = buf; cb(null, buf); }, function () { cb(new Error('no se pudo decodificar: ' + id)); });
  }

  VOZ.porTexto = function (texto) {
    if (!VOZ.texto) return null;
    return VOZ.texto[normalizar(texto)] || null;
  };

  VOZ.decir = function (id, volumen) {
    decodificar(id, function (err, buf) {
      if (err) return;
      var ac = audio(), src, g;
      if (!ac) return;
      try { if (ac.state === 'suspended' && ac.resume) ac.resume(); } catch (e) {}
      src = ac.createBufferSource(); g = ac.createGain();
      src.buffer = buf;
      g.gain.value = volumen == null ? 1 : volumen;
      src.connect(g); g.connect(destino(ac));
      try { if (activo) activo.stop(); } catch (e) {}
      activo = src;
      src.onended = function () { if (activo === src) activo = null; };
      src.start();
    });
  };

  /* Extrae el texto hablado de una línea de subtítulo. Acepta
     [hablante, texto, dur], {text}, o una cadena "Hablante: «texto»". */
  function textoDe(l) {
    if (typeof l === 'string') {
      var m = l.match(/«([^»]*)»/);
      return m ? m[1] : l;
    }
    if (Array.isArray(l)) return String(l[1] == null ? '' : l[1]);
    if (l && typeof l === 'object' && l.text != null) return String(l.text);
    return '';
  }

  /* Un clip por frase y ventana de 250 ms: evita que un mismo texto suene
     dos veces si el juego lo muestra por dos canales distintos. */
  VOZ._ultimo = null;
  function sonarTexto(texto) {
    var id = VOZ.porTexto(texto);
    if (!id) return false;
    var ahora = Date.now();
    if (VOZ._ultimo && VOZ._ultimo.id === id && ahora - VOZ._ultimo.t < 250) return false;
    VOZ._ultimo = { id: id, t: ahora };
    VOZ.decir(id);
    return true;
  }
  VOZ.sonarTexto = sonarTexto;
  VOZ.textoDe = textoDe;

  /* Engancha talk() (subtítulos de nivel) y say() (subtítulos de cinemática,
     que sayN13 compone como "Hablante: «texto»"). Nunca toca lo que se ve. */
  VOZ.engancharTalk = function () {
    if (VOZ._enganchado) return false;
    var enganchado = false;

    if (typeof window.talk === 'function' && !window.talk._voz40) {
      var talkOriginal = window.talk;
      window.talk = function () {
        try {
          var lineas = arguments[0];
          if (lineas && lineas.forEach) lineas.forEach(function (l) { sonarTexto(textoDe(l)); });
        } catch (e) {}
        return talkOriginal.apply(this, arguments);
      };
      window.talk._voz40 = true;
      enganchado = true;
    }

    if (typeof window.say === 'function' && !window.say._voz40) {
      var sayOriginal = window.say;
      window.say = function () {
        try {
          for (var i = 0; i < arguments.length; i++) {
            if (typeof arguments[i] === 'string' && sonarTexto(textoDe(arguments[i]))) break;
          }
        } catch (e) {}
        return sayOriginal.apply(this, arguments);
      };
      window.say._voz40 = true;
      enganchado = true;
    }

    VOZ._enganchado = enganchado;
    return enganchado;
  };

  VOZ.normalizar = normalizar;
})();
