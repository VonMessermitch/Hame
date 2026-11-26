/* ============================================================================
   V.GAI.1.0 · MODO BATTLEFIELD CON SOLUCIÓN ROBUSTA DE PESTAÑA APARTE
   - Botón dedicado "MODO BATTLEFIELD" en el menú principal (#menu)
   - Ventana modal táctica con flujo completo: Mapa (17/18), Facción (Volkskaya/Veyrn), 9 Clases y Zonas de Spawn (Base/Banderas A,B,C)
   - Corrección de scroll táctil en opciones y menús
   ============================================================================ */
(function (root) {
  'use strict';

  var api = {
    version: 'V.GAI.1.0',
    selectedMap: 17,
    selectedFaction: 'volkskaya',
    selectedClass: 'assault',
    selectedSpawn: 'base',
    inBattlefield: false
  };

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    root.BATTLEFIELD_VGAI = api;
    return;
  }

  var CLASSES = [
    { id: 'assault', name: 'Asalto', desc: 'Fusil AT-18 & 5 Granadas AT' },
    { id: 'support', name: 'Soporte', desc: 'Ametralladora MG08/MG15 & Cinta de munición' },
    { id: 'medic', name: 'Médico', desc: 'Revólver Lugy & Botiquín de campaña' },
    { id: 'recon', name: 'Reconocimiento', desc: 'Fusil de cerrojo con mira & Prismáticos' },
    { id: 'at', name: 'Especialista AT', desc: 'Fusil Antitanque pesado & Cargas de demolición' },
    { id: 'zapador', name: 'Zapador', desc: 'Minas antitanque, alicates & MP38' },
    { id: 'cabo', name: 'Cabo', desc: 'Subfusil MP38 & Bengalas' },
    { id: 'teniente', name: 'Teniente', desc: 'Pistola de oficial & Ordenanza' },
    { id: 'fusilero', name: 'Fusilero', desc: 'Fusil estándar con bayoneta' }
  ];

  function injectBattlefieldTabAndModal() {
    if (document.getElementById('bf_menu_btn')) return;
    var menu = document.getElementById('menu');
    if (!menu) return;

    if (!document.getElementById('css_bf_robust')) {
      document.head.insertAdjacentHTML('beforeend',
        '<style id="css_bf_robust">' +
        '#menu{overflow-y:auto!important;max-height:100vh!important;padding-bottom:120px!important;-webkit-overflow-scrolling:touch}' +
        '#bf_menu_btn{background:linear-gradient(180deg,#c09235,#7a5518)!important;color:#fff6dc!important;border:1px solid #e0b050!important;margin-top:10px!important}' +
        '#bf_modal{position:fixed;inset:0;background:rgba(12,9,6,0.92);display:none;align-items:center;justify-content:center;z-index:100;padding:20px;box-sizing:border-box}' +
        '.bf-card{background:linear-gradient(180deg,#241a10,#140f08);border:2px solid #d4af37;border-radius:8px;padding:24px;width:100%;max-width:560px;text-align:left;font-family:Georgia,serif;color:#f3e6c4;box-shadow:0 10px 40px rgba(0,0,0,0.9)}' +
        '.bf-field{margin-bottom:14px}' +
        '.bf-lbl{font-size:12px;color:#e0b050;letter-spacing:1px;display:block;margin-bottom:5px;font-weight:bold}' +
        '.bf-sel{width:100%;background:#302417;color:#f3e6c4;padding:11px;border:1px solid #a77b35;border-radius:4px;font:13px Georgia,serif}' +
        '</style>'
      );
    }

    // 1. Botón en el menú principal (#menu)
    var btn = document.createElement('button');
    btn.id = 'bf_menu_btn';
    btn.type = 'button';
    btn.textContent = '⬢ MODO BATTLEFIELD (CONQUISTA)';
    
    var goBtn = document.getElementById('go');
    if (goBtn && goBtn.parentNode) {
      goBtn.parentNode.insertBefore(btn, goBtn);
    } else {
      menu.appendChild(btn);
    }

    // 2. Ventana Modal de Configuración Battlefield
    var modal = document.createElement('div');
    modal.id = 'bf_modal';
    
    var classOptions = '';
    for (var i = 0; i < CLASSES.length; i++) {
      classOptions += '<option value="' + CLASSES[i].id + '"' + (i === 0 ? ' selected' : '') + '>' + CLASSES[i].name + ' — ' + CLASSES[i].desc + '</option>';
    }

    modal.innerHTML = 
      '<div class="bf-card">' +
        '<h2 style="color:#ffd54a;margin-top:0;font-size:18px;letter-spacing:2px;border-bottom:1px solid #a77b35;padding-bottom:8px">CONFIGURACIÓN MODO BATTLEFIELD</h2>' +
        
        '<div class="bf-field">' +
          '<label class="bf-lbl">ZONA DE OPERACIONES (MAPA)</label>' +
          '<select id="bf_mod_map" class="bf-sel">' +
            '<option value="17" selected>Nivel 17 · Karsk (Golfo y Las Tres Cruces)</option>' +
            '<option value="18">Nivel 18 · Varnholt (Distrito y Martillo de Hierro)</option>' +
          '</select>' +
        '</div>' +

        '<div class="bf-field">' +
          '<label class="bf-lbl">FACCIÓN ENFRENTADA</label>' +
          '<select id="bf_mod_faction" class="bf-sel">' +
            '<option value="volkskaya" selected>República de Volkskaya (Defensa Nacional)</option>' +
            '<option value="veyrn">Imperio Veyrn (Fuerzas Expedicionarias)</option>' +
          '</select>' +
        '</div>' +

        '<div class="bf-field">' +
          '<label class="bf-lbl">CLASE DE SOLDADO</label>' +
          '<select id="bf_mod_class" class="bf-sel">' + classOptions + '</select>' +
        '</div>' +

        '<div class="bf-field">' +
          '<label class="bf-lbl">PUNTO DE DESPLIEGUE (CHECKPOINT)</label>' +
          '<select id="bf_mod_spawn" class="bf-sel">' +
            '<option value="base" selected>Base Principal (Retaguardia)</option>' +
            '<option value="flagA">Bandera Alfa (A) - Zona Central</option>' +
            '<option value="flagB">Bandera Bravo (B) - Avanzada</option>' +
            '<option value="flagC">Bandera Charlie (C) - Frente de Estación</option>' +
          '</select>' +
        '</div>' +

        '<div style="display:flex;gap:10px;margin-top:18px">' +
          '<button id="bf_mod_go" type="button" style="flex:2;background:linear-gradient(180deg,#e0b050,#9b7222);color:#120c06;font:bold 14px Georgia,serif;padding:12px;border:0;border-radius:4px;cursor:pointer;letter-spacing:1px">DESPLEGAR</button>' +
          '<button id="bf_mod_cancel" type="button" style="flex:1;background:#3a2c1a;color:#d8c48a;font:bold 13px Georgia,serif;padding:12px;border:0;border-radius:4px;cursor:pointer">CANCELAR</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(modal);

    btn.addEventListener('click', function () {
      modal.style.display = 'flex';
    });

    var cancelBtn = document.getElementById('bf_mod_cancel');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', function () {
        modal.style.display = 'none';
      });
    }

    var deployBtn = document.getElementById('bf_mod_go');
    if (deployBtn) {
      deployBtn.addEventListener('click', function () {
        var mSel = document.getElementById('bf_mod_map');
        var fSel = document.getElementById('bf_mod_faction');
        var cSel = document.getElementById('bf_mod_class');
        var sSel = document.getElementById('bf_mod_spawn');

        api.selectedMap = mSel ? parseInt(mSel.value, 10) : 17;
        api.selectedFaction = fSel ? fSel.value : 'volkskaya';
        api.selectedClass = cSel ? cSel.value : 'assault';
        api.selectedSpawn = sSel ? sSel.value : 'base';
        api.inBattlefield = true;

        modal.style.display = 'none';

        var lvSel = document.getElementById('lvsel');
        if (lvSel) {
          lvSel.value = String(api.selectedMap);
          lvSel.dispatchEvent(new Event('change', { bubbles: true }));
        }

        if (goBtn) goBtn.click();
        setTimeout(applyBattlefieldSpawnAndLoadout, 500);
      });
    }
  }

  function applyBattlefieldSpawnAndLoadout() {
    if (!api.inBattlefield) return;
    try {
      if (typeof P !== 'undefined' && P) {
        var cl = api.selectedClass;
        if (cl === 'assault' || cl === 'at') {
          P.cur = 'atrifle';
          if (window.WEAPONS_VGAI && typeof window.WEAPONS_VGAI.giveAtRifle === 'function') {
            window.WEAPONS_VGAI.giveAtRifle();
          }
          P.grenades = 5;
        } else if (cl === 'support') {
          P.cur = 'mg';
          P.mg = true;
        } else if (cl === 'medic' || cl === 'teniente') {
          P.cur = 'revolver';
          P.hp = 140;
        } else if (cl === 'recon' || cl === 'fusilero') {
          P.cur = 'rifle';
        } else if (cl === 'zapador' || cl === 'cabo') {
          P.cur = 'smg';
        }
      }

      if (typeof P !== 'undefined' && P && P.g) {
        var Xbase = api.selectedMap === 17 ? 160000 : 200000;
        if (api.selectedSpawn === 'flagA') {
          P.g.position.set(Xbase + 30, 2, -380);
        } else if (api.selectedSpawn === 'flagB') {
          P.g.position.set(Xbase + 70, 2, -460);
        } else if (api.selectedSpawn === 'flagC') {
          P.g.position.set(Xbase + 120, 2, -520);
        } else {
          P.g.position.set(Xbase + 15, 2, -20);
        }
      }
    } catch (_) {}
  }

  function init() {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      injectBattlefieldTabAndModal();
    } else {
      document.addEventListener('DOMContentLoaded', injectBattlefieldTabAndModal);
    }

    var _s17 = window.startLevel17;
    if (_s17 && !_s17._vgaiBfR) {
      window.startLevel17 = function () {
        var r = _s17.apply(this, arguments);
        if (api.inBattlefield) applyBattlefieldSpawnAndLoadout();
        return r;
      };
      window.startLevel17._vgaiBfR = true;
    }

    var _s18 = window.startLevel18;
    if (_s18 && !_s18._vgaiBfR) {
      window.startLevel18 = function () {
        var r = _s18.apply(this, arguments);
        if (api.inBattlefield) applyBattlefieldSpawnAndLoadout();
        return r;
      };
      window.startLevel18._vgaiBfR = true;
    }
  }

  init();

  root.BATTLEFIELD_VGAI = api;
  root.AETH = root.AETH || {};
  root.AETH.vgai = root.AETH.vgai || {};
  root.AETH.vgai.battlefield = api;
})(typeof window !== 'undefined' ? window : globalThis);
