/* =========================================================================
   ai/debug/inspector.js — inspector visual de NPC y controles de simulación.
   Muestra por qué un individuo tomó una decisión. Solo DOM, sin dependencias.
   ========================================================================= */
(function (g) {
  'use strict';
  const AETH = g.AETH;
  const U = AETH.util;

  const I = (AETH.inspector = {});

  const TABS = [
    { id: 'ficha', label: 'Ficha' },
    { id: 'mente', label: 'Mente' },
    { id: 'cuerpo', label: 'Cuerpo' },
    { id: 'memoria', label: 'Memoria' },
    { id: 'social', label: 'Social' },
    { id: 'registro', label: 'Registro' }
  ];

  function pct(v, max) {
    return Math.round(U.clamp((v || 0) / (max || 1), 0, 1) * 100);
  }
  function bar(label, value, max, cls) {
    return '<div class="ins-row"><span class="ins-label">' + esc(label) + '</span><span class="ins-bar ' + (cls || '') + '"><i style="width:' + pct(value, max) + '%"></i></span><span class="ins-val">' + U.round(value || 0, 2) + '</span></div>';
  }
  function kv(label, value) {
    return '<div class="ins-kv"><span>' + esc(label) + '</span><b>' + esc(value === undefined || value === null ? '—' : String(value)) + '</b></div>';
  }
  function esc(s) {
    return String(s === undefined || s === null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  class Inspector {
    constructor(world, opts) {
      this.world = world;
      this.opts = opts || {};
      this.selectedId = null;
      this.tab = 'ficha';
      this.mounted = false;
      this.throttle = 0;
      this.el = null;
      this.visible = true;
      this.logFilter = null;
    }

    mount(container) {
      if (this.mounted) return this;
      const root = document.createElement('div');
      root.className = 'ins';
      root.innerHTML =
        '<div class="ins-head"><span class="ins-title">INSPECTOR COGNITIVO</span><span class="ins-close" title="Ocultar">×</span></div>' +
        '<div class="ins-toolbar">' +
        '<button data-act="gen">+ Generar NPC</button>' +
        '<button data-act="desc">+ Por descripción</button>' +
        '<button data-act="pause">Pausa</button>' +
        '<button data-act="step">+1 min</button>' +
        '</div>' +
        '<div class="ins-lod"><span id="ins-lod"></span></div>' +
        '<div class="ins-body">' +
        '<div class="ins-list" id="ins-list"></div>' +
        '<div class="ins-detail">' +
        '<div class="ins-tabs" id="ins-tabs">' +
        TABS.map((t) => '<button data-tab="' + t.id + '">' + t.label + '</button>').join('') +
        '</div>' +
        '<div class="ins-content" id="ins-content"><p class="ins-empty">Selecciona un habitante.</p></div>' +
        '</div></div>' +
        '<div class="ins-foot">' +
        '<span class="ins-hint">Eventos:</span>' +
        '<button data-ev="bombardeo">Bombardeo</button>' +
        '<button data-ev="sermon">Sermón</button>' +
        '<button data-ev="feria">Feria</button>' +
        '<button data-ev="rumor">Rumor</button>' +
        '<button data-ev="ataque">Ataque</button>' +
        '<button data-ev="accidente">Accidente</button>' +
        '<button data-ev="arcano">Arcano</button>' +
        '<button data-act="save">Exportar</button>' +
        '</div>' +
        '<div class="ins-desc" id="ins-desc" style="display:none">' +
        '<textarea id="ins-desc-text" placeholder="Ej.: Anciana médica de Namar, religiosa, viuda, experta en medicina tradicional y desconfiada de los militares."></textarea>' +
        '<button data-act="desc-create">Crear individuo</button>' +
        '</div>';
      (container || document.body).appendChild(root);
      this.el = root;
      this.mounted = true;

      root.querySelector('.ins-close').addEventListener('click', () => this.toggle(false));
      root.querySelector('.ins-toolbar').addEventListener('click', (e) => {
        const act = e.target.getAttribute('data-act');
        if (!act) return;
        if (act === 'gen') this.generateRandom();
        if (act === 'desc') this.toggleDescription();
        if (act === 'pause') this.togglePause(e.target);
        if (act === 'step') this.world.advanceStep ? this.world.advanceStep(60) : (this.world.clock.advance(60), this.world.timeScale = 1);
        if (act === 'save') this.exportState();
        if (act === 'desc-create') this.createFromText();
      });
      root.querySelector('.ins-foot').addEventListener('click', (e) => {
        const ev = e.target.getAttribute('data-ev');
        if (ev) {
          if (ev === 'rumor') this.world.injectEvent('rumor', { text: 'Dicen que cierran el paso de Orvek.' });
          else this.world.injectEvent(ev);
        }
      });
      root.querySelector('#ins-tabs').addEventListener('click', (e) => {
        const tab = e.target.getAttribute('data-tab');
        if (!tab) return;
        this.tab = tab;
        this.refresh(true);
      });
      root.querySelector('#ins-list').addEventListener('click', (e) => {
        const id = e.target.closest('[data-id]') && e.target.closest('[data-id]').getAttribute('data-id');
        if (id) this.select(id);
      });
      this.renderList();
      this.renderTabs();
      return this;
    }

    toggle(show) {
      this.visible = show === undefined ? !this.visible : show;
      if (this.el) this.el.style.display = this.visible ? 'flex' : 'none';
      if (this.opts.onToggle) this.opts.onToggle(this.visible);
    }

    toggleDescription() {
      const d = this.el.querySelector('#ins-desc');
      d.style.display = d.style.display === 'none' ? 'block' : 'none';
      if (d.style.display === 'block') this.el.querySelector('#ins-desc-text').focus();
    }

    createFromText() {
      const ta = this.el.querySelector('#ins-desc-text');
      const text = ta.value.trim();
      if (!text) return;
      const brain = this.world.spawn({ description: text });
      if (brain) {
        this.select(brain.id);
        ta.value = '';
        this.el.querySelector('#ins-desc').style.display = 'none';
      }
    }

    generateRandom() {
      const rng = this.world.rng;
      const profs = Object.keys(AETH.culture.professions);
      const eths = Object.keys(AETH.culture.ethnicities);
      const traits = ['desconfiado', 'perseverante', 'reservado', 'curioso', 'prudente', 'impulsivo', 'leal', 'ambicioso', 'religioso', 'sociable'];
      const b = this.world.spawn({
        profession: rng.pick(profs),
        ethnicity: rng.pick(eths),
        age: rng.int(8, 72),
        personality: [rng.pick(traits), rng.pick(traits)],
        conditions: rng.chance(0.2) ? { kneeInjury: true } : {}
      });
      if (b) this.select(b.id);
      this.renderList();
    }

    togglePause(btn) {
      if (this.world.timeScale > 0) {
        this.world._savedScale = this.world.timeScale;
        this.world.timeScale = 0;
        if (btn) btn.textContent = 'Reanudar';
      } else {
        this.world.timeScale = this.world._savedScale || 300;
        if (btn) btn.textContent = 'Pausa';
      }
    }

    exportState() {
      const data = JSON.stringify(this.world.save());
      const blob = new Blob([data], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'aethrion_iron_v1_estado.json';
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    }

    select(id) {
      this.selectedId = id;
      this.refresh(true);
      this.renderList();
    }

    renderTabs() {
      const tabs = this.el.querySelector('#ins-tabs');
      tabs.innerHTML = TABS.map((t) => '<button data-tab="' + t.id + '" class="' + (t.id === this.tab ? 'on' : '') + '">' + t.label + '</button>').join('');
    }

    renderList() {
      if (!this.mounted) return;
      const list = this.el.querySelector('#ins-list');
      const npcs = this.world.brains
        .filter((b) => b.alive !== false)
        .slice()
        .sort((a, b) => (a._distFocus || 0) - (b._distFocus || 0))
        .slice(0, 40);
      list.innerHTML =
        '<div class="ins-list-head">HABITANTES <span>' + this.world.brains.filter((b) => b.alive !== false).length + '</span></div>' +
        npcs
          .map((b) => {
            const active = b.id === this.selectedId ? ' on' : '';
            const act = b.activity || b.intent.action;
            return (
              '<div class="ins-item' + active + '" data-id="' + b.id + '">' +
              '<b>' + esc(b.identity.name) + '</b>' +
              '<span>' + esc(b.identity.professionLabel) + ' · ' + Math.round(b.identity.age) + '</span>' +
              '<em>' + esc(act) + '</em>' +
              '</div>'
            );
          })
          .join('');
    }

    refresh(force) {
      if (!this.mounted || !this.visible) return;
      const now = U.now();
      if (!force && now - this.throttle < 240) return;
      this.throttle = now;
      const b = this.world.byId[this.selectedId];
      const lod = this.world.lodCounts;
      const lodEl = this.el.querySelector('#ins-lod');
      if (lodEl) lodEl.textContent = 'LOD 1: ' + lod[1] + ' · LOD 2: ' + lod[2] + ' · LOD 3: ' + lod[3] + ' · ' + this.world.clock.label + ' · ' + this.world.speedLabel;
      if (!b) {
        this.el.querySelector('#ins-content').innerHTML = '<p class="ins-empty">Selecciona un habitante de la lista o haz clic en el mundo.</p>';
        return;
      }
      this.el.querySelector('#ins-content').innerHTML = this.renderTab(b);
      if (this.tab === 'registro') this.renderList();
    }

    renderTab(b) {
      const s = b.getState(this.world);
      if (this.tab === 'ficha') {
        const p = s.personality.summary;
        return (
          '<h3>' + esc(s.identity.name) + '</h3>' +
          '<p class="ins-sub">' + esc(s.identity.professionLabel) + ' · ' + Math.round(s.identity.age) + ' años · ' + esc(s.identity.ethnicityLabel) + '</p>' +
          kv('Facción', s.culture.faction) +
          kv('Nacionalidad', s.culture.nationality) +
          kv('Origen', s.identity.origin) +
          kv('Residencia', s.culture.residence) +
          kv('Religión', 'Fe del Hacedor (' + s.culture.religion.branch + ', devoción ' + s.culture.religion.devotion + ')') +
          kv('Idiomas', s.culture.language.map((l) => l.id + ' ' + l.level).join(', ')) +
          kv('Alfabetizado', s.culture.literacy ? 'sí' : 'no') +
          kv('Clase', b.culture.socialClass) +
          '<div class="ins-sep"></div>' +
          '<p class="ins-flavour">' + esc(s.identity.background || 'Sin historia declarada.') + '</p>' +
          '<div class="ins-chips">' + p.descriptors.map((d) => '<span>' + esc(d) + '</span>').join('') + '</div>' +
          (p.contradictions.length ? '<p class="ins-note">Contradicciones: ' + p.contradictions.map((c) => esc(c.a + '/' + c.b)).join(', ') + '</p>' : '') +
          '<div class="ins-sep"></div>' +
          '<h4>Estado actual</h4>' +
          kv('Actividad', s.currentState.activity) +
          kv('Lugar', s.currentState.location ? s.currentState.location.name : '—') +
          kv('Decisión', s.currentState.intent.action) +
          kv('Motivo', s.currentState.intent.reason) +
          kv('Objetivo', s.currentState.intent.goal || '—') +
          kv('Plan', s.currentState.plan.join(' → ') || s.currentState.planReason) +
          kv('Emoción dominante', s.currentState.intent.goal ? b.emotions.dominant().name : b.emotions.dominant().name) +
          kv('LOD', s.currentState.lod) +
          '<p class="ins-quote">«' + esc(b.speak({ context: 'conversar' }).text) + '»</p>' +
          '<div class="ins-sep"></div>' +
          '<h4>Necesidades</h4>' +
          Object.keys(s.needs)
            .slice(0, 10)
            .map((k) => bar(k, s.needs[k], 1.2, s.needs[k] > 0.8 ? 'warn' : ''))
            .join('')
        );
      }
      if (this.tab === 'mente') {
        const em = s.cognition.emotion;
        return (
          '<h3>Mente y decisión</h3>' +
          kv('Foco atencional', s.cognition.attention.foco.join(' · ') || 'nada relevante') +
          kv('Memoria de trabajo', s.cognition.attention.capacidad + ' elementos') +
          kv('Cambios de foco', s.cognition.attention.switches) +
          kv('Amenaza percibida', s.currentState.threatLevel) +
          kv('Luz / lugar', s.cognition.perception.luz + ' / ' + (s.cognition.perception.lugar || '—')) +
          kv('Vistos / oídos / arcano', s.cognition.perception.vistos + ' / ' + s.cognition.perception.sonidos + ' / ' + s.cognition.perception.arcano) +
          '<div class="ins-sep"></div>' +
          '<h4>Emociones</h4>' +
          Object.keys(em)
            .filter((k) => em[k] > 0.03)
            .sort((a, b2) => em[b2] - em[a])
            .map((k) => bar(k, em[k], 1, 'emo'))
            .join('') +
          '<div class="ins-sep"></div>' +
          '<h4>Razonamiento</h4>' +
          kv('Plan', s.currentState.plan.join(' → ') || 'sin plan') +
          kv('Por qué', s.currentState.planReason) +
          kv('Última acción', s.currentState.lastResult ? s.currentState.lastResult.action + ' (' + (s.currentState.lastResult.success ? 'éxito' : 'fallo') + ')' : '—') +
          kv('Aprendizaje', s.cognition.reasoning.accionesAprendidas + ' acciones valoradas') +
          kv('Confianza en el plan', s.cognition.reasoning.confianza) +
          (s.cognition.reasoning.bloqueos.length ? '<p class="ins-note">No puede: ' + s.cognition.reasoning.bloqueos.map(esc).join('; ') + '</p>' : '') +
          '<div class="ins-sep"></div>' +
          '<h4>Objetivos</h4>' +
          s.goals.activos
            .map((g2) => '<div class="ins-goal"><b>' + esc(g2.label) + '</b><span>' + esc(g2.horizonte) + ' · utilidad ' + g2.utilidad + (g2.fallos ? ' · fallos ' + g2.fallos : '') + '</span><em>' + esc(g2.motivo || '') + '</em></div>')
            .join('') +
          '<p class="ins-note">Motivación última: ' + esc(s.goals.seleccion ? s.goals.seleccion.label : '—') + '</p>' +
          '<div class="ins-sep"></div>' +
          '<h4>Personalidad</h4>' +
          Object.keys(s.personality.dims)
            .map((k) => bar(k, s.personality.dims[k], 1, 'pers'))
            .join('')
        );
      }
      if (this.tab === 'cuerpo') {
        const ph = s.biology.physiology;
        return (
          '<h3>Cuerpo y biología</h3>' +
          kv('Altura / peso', s.biology.phenotype.altura + ' cm / ' + s.biology.phenotype.peso + ' kg') +
          kv('Componentes (Dún/Rhûn/Elfo/Enano)', Object.keys(s.biology.phenotype.componentes).map((k) => U.round(s.biology.phenotype.componentes[k], 2)).join(' / ')) +
          kv('Longevidad estimada', s.biology.phenotype.longevidad + ' años') +
          kv('Alerta cognitiva', U.round(s.biology.nervousSystem.alertness, 2) + ' · reacción ' + s.biology.nervousSystem.reactionTimeMs + ' ms') +
          '<div class="ins-sep"></div>' +
          '<h4>Fisiología</h4>' +
          Object.keys(ph)
            .map((k) => {
              const v = ph[k];
              if (typeof v !== 'number') return kv(k, v);
              const max = /pulso/.test(k) ? 190 : /respiracion/.test(k) ? 40 : /temperatura/.test(k) ? 42 : /sangre/.test(k) ? 1 : 1;
              return bar(k, v, max, /dolor|adrenalina|fatiga/.test(k) ? 'warn' : '');
            })
            .join('') +
          '<div class="ins-sep"></div>' +
          '<h4>Sentidos</h4>' +
          Object.keys(s.biology.senses).map((k) => kv(k, s.biology.senses[k])).join('') +
          '<div class="ins-sep"></div>' +
          '<h4>Articulaciones y lesiones</h4>' +
          Object.keys(s.biology.anatomy.articulaciones)
            .filter((k) => k === 'kneeL' || k === 'kneeR' || k === 'spine' || k === 'hipL' || k === 'hipR')
            .map((k) => bar(k, s.biology.anatomy.articulaciones[k].integridad, 1, s.biology.anatomy.articulaciones[k].integridad < 0.5 ? 'warn' : ''))
            .join('') +
          (s.biology.anatomy.lesiones.length ? '<p class="ins-note">' + s.biology.anatomy.lesiones.map((l) => esc(l.label) + ' (' + l.severidad + ')').join(' · ') + '</p>' : '<p class="ins-note">Sin lesiones activas.</p>') +
          '<div class="ins-sep"></div>' +
          kv('Equipo', s.equipment.map((i) => i.name).join(', ') || 'nada')
        );
      }
      if (this.tab === 'memoria') {
        const m = s.memory;
        return (
          '<h3>Memoria</h3>' +
          kv('Episodios', s.cognition.memory.episodios) +
          kv('Hechos', s.cognition.memory.hechos) +
          kv('Habilidades', s.cognition.memory.habilidades) +
          kv('Lugares', s.cognition.memory.lugares) +
          kv('Personas', s.cognition.memory.personas) +
          kv('Olvidados', s.cognition.memory.olvidados) +
          '<div class="ins-sep"></div>' +
          '<h4>Recuerdos recientes</h4>' +
          (m.recentEpisodic.length
            ? m.recentEpisodic.map((e) => '<div class="ins-mem"><b>' + esc(e.summary) + '</b><span>importancia ' + e.importance + ' · confianza ' + e.confidence + '</span></div>').join('')
            : '<p class="ins-empty">Sin recuerdos codificados.</p>') +
          '<div class="ins-sep"></div>' +
          '<h4>Personas conocidas</h4>' +
          (m.people.length ? m.people.map((p2) => kv(p2.name, 'confianza ' + p2.trust + ' · familiaridad ' + p2.familiarity)).join('') : '<p class="ins-empty">Nadie.</p>') +
          '<div class="ins-sep"></div>' +
          '<h4>Habilidades</h4>' +
          (Object.keys(s.skills).length ? Object.keys(s.skills).map((k) => bar(k, s.skills[k], 1, 'skill')).join('') : '<p class="ins-empty">Sin habilidades registradas.</p>')
        );
      }
      if (this.tab === 'social') {
        return (
          '<h3>Vida social</h3>' +
          kv('Reputación', s.social.reputation) +
          kv('Estatus', s.social.status) +
          kv('Familia', s.social.family.map((f) => f.name + ' (' + f.relation + (f.alive ? '' : ', †') + ')').join(', ') || '—') +
          kv('Amistades', s.social.friends.map((f) => f.name).join(', ') || '—') +
          kv('Rivales', s.social.rivals.map((f) => f.name + ' — ' + f.cause).join(', ') || '—') +
          kv('Registro militar', s.social.militaryRecord ? s.social.militaryRecord.unit + ', ' + s.social.militaryRecord.war : '—') +
          '<div class="ins-sep"></div>' +
          '<h4>Conocimiento</h4>' +
          Object.keys(s.culture.knowledge.domains)
            .map((k) => bar(k, s.culture.knowledge.domains[k], 1, 'know'))
            .join('') +
          '<div class="ins-sep"></div>' +
          kv('Costumbres', s.culture.customs.join(' · ')) +
          kv('Fe', s.culture.religion.patronLabel + ' (' + s.culture.religion.patronPatronage + ')') +
          kv('Prácticas', s.culture.religion.practices.join(', '))
        );
      }
      // Registro
      return (
        '<h3>Registro de decisiones</h3>' +
        '<p class="ins-sub">' + esc(this.world.clock.label) + ' · ' + esc(this.world.clock.seasonLabel) + '</p>' +
        '<h4>Últimas acciones</h4>' +
        (s.history.length
          ? s.history
              .map((h) => '<div class="ins-mem"><b>' + esc(h.action) + '</b><span>' + (h.result === 'ok' ? '✓' : '✕') + (h.goal ? ' · ' + esc(h.goal) : '') + '</span></div>')
              .join('')
          : '<p class="ins-empty">Sin historial.</p>') +
        '<div class="ins-sep"></div>' +
        '<h4>Conversaciones</h4>' +
        (s.dialogue.length ? s.dialogue.map((d) => '<p class="ins-quote">«' + esc(d.text) + '» <small>' + esc(d.tone) + '</small></p>').join('') : '<p class="ins-empty">—</p>') +
        '<div class="ins-sep"></div>' +
        '<h4>Mundo</h4>' +
        this.world.events
          .slice(-5)
          .reverse()
          .map((e) => '<div class="ins-mem"><b>' + esc(e.label) + '</b><span>' + esc(e.at) + '</span></div>')
          .join('') +
        '<div class="ins-sep"></div>' +
        '<h4>Diálogos del mundo</h4>' +
        this.world.dialogueFeed
          .slice(-5)
          .reverse()
          .map((d) => '<p class="ins-quote">' + esc(d.a) + ' → ' + esc(d.b) + ': «' + esc(d.text) + '»</p>')
          .join('')
      );
    }

    update() {
      if (!this.mounted || !this.visible) return;
      const now = U.now();
      if (now - this.throttle < 260) return;
      this.refresh();
      this.renderList();
    }
  }

  I.Inspector = Inspector;
  I.create = function (world, container, opts) {
    const ins = new Inspector(world, opts);
    ins.mount(container);
    return ins;
  };
})(typeof window !== 'undefined' ? window : globalThis);
