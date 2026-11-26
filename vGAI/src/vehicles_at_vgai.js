/* ============================================================================
   V.GAI.1.0 · ESCALA DE TANQUES (+18%), CAÑONES AT Y DOTACIONES SIN SOLAPAMIENTO
   - Carros Sokol y Vrak escalados a 1.18x (tripulantes en torreta compensados 1/1.18)
   - Spec de dimensiones/colisiones multiplicada vía CORE_VGAI.scaleTankSpec
   - Cañón AT de 37 mm ampliado a 1.15x con retroceso y anillo de onda expansiva
   - Dotaciones AT y MG (gSpawn17, gAtUpd17, gMg17, vgcSpawn37, vgcAnim37):
     fusil colgado en diagonal a la espalda (`slingRif`) ocultando el fusil en mano
     (`n.rif`) mientras sirven la pieza o alimentan la ametralladora.
   ============================================================================ */
(function (root) {
  'use strict';

  var api = {
    version: 'V.GAI.1.0',
    tankScale: 1.475,
    atScale: 1.15
  };

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    root.VEHICLES_AT_VGAI = api;
    return;
  }

  function counterScaleCrewHeads(g, scaleFactor) {
    if (!g || !scaleFactor) return;
    var inv = 1 / scaleFactor;
    g.traverse(function (o) {
      if (o && o.name === 'crew') {
        o.scale.multiplyScalar(inv);
        o.position.y -= 0.06;
      }
    });
  }

  function applyScaleToTemplate(tpl, factor) {
    if (!tpl || !tpl.g || tpl._vgaiScaled) return tpl;
    tpl._vgaiScaled = true;
    tpl.g.scale.multiplyScalar(factor);
    counterScaleCrewHeads(tpl.g, factor);
    if (tpl.spec && root.CORE_VGAI && typeof root.CORE_VGAI.scaleTankSpec === 'function') {
      tpl.spec = root.CORE_VGAI.scaleTankSpec(tpl.spec, factor);
    }
    return tpl;
  }

  function attachBackSlingRifle(n) {
    if (!n || !n.g || !n.g.userData || !n.g.userData.ch || n.slingRif) return;
    if (typeof mkEwR9 !== 'function' && typeof mkRifle !== 'function') return;
    var r = typeof mkEwR9 === 'function' ? mkEwR9(false) : mkRifle(0x4a3420);
    r.position.set(-0.04, 0.34, -0.17);
    r.rotation.set(0.22, 0.08, -0.58);
    r.visible = false;
    n.g.userData.ch.add(r);
    n.slingRif = r;
  }

  function setServingWeaponState(n, servingPiece) {
    if (!n) return;
    attachBackSlingRifle(n);
    if (n.rif) n.rif.visible = !servingPiece;
    if (n.slingRif) n.slingRif.visible = !!servingPiece;
  }

  function spawnShockwaveRing(x, y, z, col) {
    if (typeof scene === 'undefined' || typeof THREE === 'undefined') return;
    var ring = new THREE.Mesh(
      new THREE.RingGeometry(0.3, 0.85, 16),
      new THREE.MeshBasicMaterial({ color: col || 0xeadcb8, transparent: true, opacity: 0.72, side: THREE.DoubleSide, depthWrite: false })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(x, (y || 0) + 0.14, z);
    scene.add(ring);
    var life = 0.28;
    var iv = setInterval(function () {
      life -= 0.03;
      if (life <= 0) {
        clearInterval(iv);
        if (ring.parent) scene.remove(ring);
        if (ring.geometry) ring.geometry.dispose();
        if (ring.material) ring.material.dispose();
      } else {
        ring.scale.addScalar(0.32);
        ring.material.opacity = Math.max(0, life * 2.5);
      }
    }, 30);
  }

  function installHooks() {
    if (api._installed) return;
    api._installed = true;

    // Invalidar cache previo de plantillas si existiera antes de reescalar
    if (typeof VEH32 !== 'undefined' && VEH32 && VEH32.tpl) {
      for (var tk in VEH32.tpl) {
        if (tk.indexOf('tank_') === 0) applyScaleToTemplate(VEH32.tpl[tk], api.tankScale);
        else if (tk.indexOf('atgun') === 0) applyScaleToTemplate(VEH32.tpl[tk], api.atScale);
      }
    }

    if (typeof window.vhTplLight32 === 'function' && !window.vhTplLight32._vgaiScale) {
      var _tl = window.vhTplLight32;
      window.vhTplLight32 = function () { return applyScaleToTemplate(_tl.apply(this, arguments), api.tankScale); };
      window.vhTplLight32._vgaiScale = true;
    }
    if (typeof window.vhTplMedium32 === 'function' && !window.vhTplMedium32._vgaiScale) {
      var _tm = window.vhTplMedium32;
      window.vhTplMedium32 = function () { return applyScaleToTemplate(_tm.apply(this, arguments), api.tankScale); };
      window.vhTplMedium32._vgaiScale = true;
    }
    if (typeof window.vhTplAT32 === 'function' && !window.vhTplAT32._vgaiScale) {
      var _ta = window.vhTplAT32;
      window.vhTplAT32 = function () { return applyScaleToTemplate(_ta.apply(this, arguments), api.atScale); };
      window.vhTplAT32._vgaiScale = true;
    }

    // Dotaciones AT / MG de Karsk (v32_golfo.js)
    if (typeof window.gSpawn17 === 'function' && !window.gSpawn17._vgaiCrew) {
      var _gs = window.gSpawn17;
      window.gSpawn17 = function () {
        var n = _gs.apply(this, arguments);
        if (n) attachBackSlingRifle(n);
        return n;
      };
      window.gSpawn17._vgaiCrew = true;
    }

    if (typeof window.gAtUpd17 === 'function' && !window.gAtUpd17._vgaiCrew) {
      var _gau = window.gAtUpd17;
      window.gAtUpd17 = function (dt) {
        var r = _gau.apply(this, arguments);
        if (typeof G17 !== 'undefined' && G17 && Array.isArray(G17.L)) {
          for (var i = 0; i < G17.L.length; i++) {
            var n = G17.L[i];
            if (!n || !n.g || !n.g.visible) continue;
            if (n.gst === 'at') {
              var rifleActive = n.act === 'gcaim' || n.act === 'greload';
              setServingWeaponState(n, !rifleActive);
            } else if (n.gst === 'mg' && (n.act === 'mgload' || n.act === 'ghide')) {
              setServingWeaponState(n, true);
            } else if (n.rif) {
              setServingWeaponState(n, false);
            }
          }
        }
        return r;
      };
      window.gAtUpd17._vgaiCrew = true;
    }

    // Dotaciones vgcSpawn37 / gunCrew32 (Veyrn / vehículos genéricos)
    if (typeof window.vgcSpawn37 === 'function' && !window.vgcSpawn37._vgaiCrew) {
      var _vcs = window.vgcSpawn37;
      window.vgcSpawn37 = function () {
        var c = _vcs.apply(this, arguments);
        if (Array.isArray(c)) {
          for (var i = 0; i < c.length; i++) {
            if (c[i]) setServingWeaponState(c[i], true);
          }
        }
        return c;
      };
      window.vgcSpawn37._vgaiCrew = true;
    }

    if (typeof window.vgcAnim37 === 'function' && !window.vgcAnim37._vgaiCrew) {
      var _vca = window.vgcAnim37;
      window.vgcAnim37 = function (n) {
        if (n) {
          var serving = !!(n.aaC && n.aaC.st === 'op');
          setServingWeaponState(n, serving);
        }
        return _vca.apply(this, arguments);
      };
      window.vgcAnim37._vgaiCrew = true;
    }

    // Shockwave FX en disparo AT 37mm y cañón de vehículo
    if (typeof window.gAtFire17 === 'function' && !window.gAtFire17._vgaiFx) {
      var _gaf = window.gAtFire17;
      window.gAtFire17 = function (p) {
        var r = _gaf.apply(this, arguments);
        try {
          if (p) {
            var x = (typeof X17 !== 'undefined' ? X17 : 160000) + (p.x || 0);
            spawnShockwaveRing(x, 0, p.z || 0, 0xead8b0);
            if (window.AUDIO_VGAI && typeof window.AUDIO_VGAI.playWeaponProfile === 'function') {
              window.AUDIO_VGAI.playWeaponProfile('atgun', x, p.z || 0);
            }
          }
        } catch (_) {}
        return r;
      };
      window.gAtFire17._vgaiFx = true;
    }

    if (typeof window.vhFireGun32 === 'function' && !window.vhFireGun32._vgaiFx) {
      var _vfg = window.vhFireGun32;
      window.vhFireGun32 = function (v, m) {
        var r = _vfg.apply(this, arguments);
        try {
          if (v && v.g && m && (m.kind === 'gun' || m.kind === 'at')) {
            spawnShockwaveRing(v.g.position.x, v.g.position.y, v.g.position.z, 0xd8c8a0);
          }
        } catch (_) {}
        return r;
      };
      window.vhFireGun32._vgaiFx = true;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installHooks);
  } else {
    installHooks();
  }

  api.applyScaleToTemplate = applyScaleToTemplate;
  api.setServingWeaponState = setServingWeaponState;
  window.VEHICLES_AT_VGAI = api;
  window.AETH = window.AETH || {};
  window.AETH.vgai = window.AETH.vgai || {};
  window.AETH.vgai.vehiclesAt = api;
})(typeof window !== 'undefined' ? window : globalThis);
