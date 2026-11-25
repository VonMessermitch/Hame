/* =========================================================================
   ai/planning/goap.js — biblioteca de acciones y planificador GOAP.
   Planificación sobre hechos, con coste, riesgo, capacidades y utilidad.
   ========================================================================= */
(function (g) {
  'use strict';
  const AETH = g.AETH;
  const U = AETH.util;

  const GO = (AETH.goap = {});

  function act(id, label, cfg) {
    return Object.assign(
      {
        id: id,
        label: label,
        pre: [],
        add: [],
        del: [],
        durationMin: 20,
        risk: 0.05,
        needs: {}, // necesidad: cantidad satisfecha (0..1)
        strain: {}, // necesidad: cantidad añadida
        requires: {}, // {skill:{id,level}, knowledge:{domain,level}, tool:'tag', armed:true, money:n}
        place: [], // tipos de lugar donde se ejecuta
        tags: [],
        reward: 0.2,
        social: false
      },
      cfg
    );
  }

  GO.ACTIONS = [
    act('trabajar', 'trabajar en su oficio', {
      pre: ['empleo_activo'],
      add: ['salario_pendiente', 'cansado'],
      durationMin: 240,
      risk: 0.04,
      needs: { economia: 0.35, desarrollo: 0.1, pertenencia: 0.1 },
      strain: { descanso: 0.22, alimentacion: 0.08 },
      place: ['taller', 'estacion', 'cuartel', 'hospital', 'mercado', 'campo', 'escuela', 'bosque', 'mina', 'puerto', 'posada', 'templo'],
      tags: ['trabajo'],
      reward: 0.35
    }),
    act('cobrar_salario', 'cobrar el salario', {
      pre: ['salario_pendiente'],
      add: ['dinero_disponible', 'dinero_suficiente'],
      del: ['salario_pendiente'],
      durationMin: 10,
      needs: { economia: 0.25 },
      place: ['taller', 'estacion', 'cuartel', 'mercado', 'mina'],
      tags: ['dinero'],
      reward: 0.3
    }),
    act('buscar_trabajo', 'buscar trabajo', {
      pre: [],
      add: ['empleo_activo'],
      durationMin: 90,
      risk: 0.25,
      needs: { economia: 0.25, prestigio: 0.05 },
      place: ['mercado', 'taller', 'estacion', 'posada'],
      tags: ['dinero'],
      reward: 0.3
    }),
    act('comprar_comida', 'comprar comida', {
      pre: ['dinero_disponible'],
      add: ['comida_disponible'],
      del: ['dinero_disponible'],
      durationMin: 15,
      needs: { alimentacion: 0.3 },
      place: ['mercado', 'posada'],
      tags: ['comida', 'dinero'],
      reward: 0.25
    }),
    act('cazar', 'cazar o recolectar', {
      pre: [],
      add: ['comida_disponible'],
      durationMin: 120,
      risk: 0.3,
      needs: { alimentacion: 0.2, curiosidad: 0.1 },
      strain: { descanso: 0.12 },
      requires: { skill: { id: 'rastreo', level: 0.25 } },
      place: ['bosque', 'campo', 'pantano'],
      tags: ['comida', 'fauna'],
      reward: 0.3
    }),
    act('comer', 'comer', {
      pre: ['comida_disponible'],
      add: ['alimentado'],
      del: ['comida_disponible'],
      durationMin: 30,
      needs: { alimentacion: 0.9, descanso: 0.1 },
      place: ['casa', 'posada', 'taller', 'cuartel'],
      tags: ['comida'],
      reward: 0.6
    }),
    act('beber_agua', 'beber agua', {
      pre: [],
      add: ['hidratado'],
      durationMin: 5,
      needs: { hidratacion: 0.95 },
      place: ['casa', 'posada', 'fuente', 'taller', 'campo', 'cuartel'],
      tags: ['agua'],
      reward: 0.5
    }),
    act('descansar', 'descansar un momento', {
      pre: [],
      add: ['descansado'],
      durationMin: 45,
      needs: { descanso: 0.35 },
      place: ['casa', 'posada', 'taller', 'cuartel', 'hospital', 'templo'],
      tags: ['descanso'],
      reward: 0.3
    }),
    act('ir_a_refugio', 'ir a su casa o refugio', {
      pre: [],
      add: ['en_refugio'],
      durationMin: 20,
      needs: { refugio: 0.8, seguridad: 0.2 },
      place: ['casa', 'cuartel', 'posada'],
      tags: ['refugio'],
      reward: 0.3
    }),
    act('dormir', 'dormir', {
      pre: ['en_refugio'],
      add: ['descansado'],
      durationMin: 480,
      needs: { descanso: 0.95, salud: 0.1, relaciones: 0.05 },
      strain: { hidratacion: 0.12, alimentacion: 0.1 },
      place: ['casa', 'cuartel', 'posada'],
      tags: ['descanso'],
      reward: 0.6
    }),
    act('tratar_heridas', 'tratar sus heridas', {
      pre: ['botiquin_disponible'],
      add: ['heridas_tratadas'],
      durationMin: 25,
      needs: { salud: 0.6, seguridad: 0.1 },
      requires: { tool: 'botiquin' },
      place: ['casa', 'cuartel', 'hospital', 'templo'],
      tags: ['herido'],
      reward: 0.5
    }),
    act('visitar_medico', 'ir al médico', {
      pre: [],
      add: ['heridas_tratadas'],
      durationMin: 90,
      needs: { salud: 0.8 },
      place: ['hospital'],
      tags: ['herido'],
      reward: 0.6
    }),
    act('conversar', 'conversar con alguien', {
      pre: [],
      add: ['contacto_social'],
      durationMin: 25,
      needs: { relaciones: 0.55, pertenencia: 0.2, curiosidad: 0.1 },
      place: ['posada', 'mercado', 'taller', 'estacion', 'templo', 'plaza', 'cuartel'],
      tags: ['social'],
      social: true,
      reward: 0.35
    }),
    act('reunirse', 'reunirse con los suyos', {
      pre: [],
      add: ['contacto_grupo'],
      durationMin: 60,
      needs: { pertenencia: 0.6, relaciones: 0.2, lealtad: 0.2 },
      place: ['posada', 'templo', 'plaza', 'cuartel'],
      tags: ['social', 'grupo'],
      reward: 0.4
    }),
    act('visitar_familia', 'visitar a su familia', {
      pre: [],
      add: ['familia_visitada'],
      durationMin: 120,
      needs: { familia: 0.8, relaciones: 0.2 },
      place: ['casa', 'plaza', 'campo'],
      tags: ['familia'],
      reward: 0.5
    }),
    act('atender_familia', 'atender a su familia', {
      pre: [],
      add: ['familia_estable', 'familia_visitada'],
      durationMin: 180,
      needs: { familia: 0.9, lealtad: 0.2 },
      strain: { economia: 0.1 },
      place: ['casa', 'mercado'],
      tags: ['familia'],
      reward: 0.6
    }),
    act('orar', 'orar', {
      pre: [],
      add: ['deber_religioso'],
      durationMin: 30,
      needs: { religion: 0.8, tranquilidad: 0.1 },
      place: ['templo', 'casa'],
      tags: ['fe'],
      reward: 0.45
    }),
    act('peregrinar', 'peregrinar al santuario', {
      pre: [],
      add: ['deber_religioso', 'novedad_explorada'],
      durationMin: 480,
      risk: 0.2,
      needs: { religion: 1.0, esperanza: 0.1 },
      strain: { descanso: 0.25 },
      place: ['templo'],
      tags: ['fe'],
      reward: 0.6
    }),
    act('explorar', 'explorar los alrededores', {
      pre: [],
      add: ['novedad_explorada'],
      durationMin: 60,
      risk: 0.2,
      needs: { curiosidad: 0.7, desarrollo: 0.1 },
      place: ['bosque', 'campo', 'plaza', 'estacion', 'pantano'],
      tags: ['novedad'],
      reward: 0.35
    }),
    act('practicar', 'practicar su oficio', {
      pre: [],
      add: ['habilidad_util'],
      durationMin: 90,
      needs: { desarrollo: 0.6, ambicion: 0.1 },
      strain: { descanso: 0.1 },
      place: ['taller', 'campo', 'cuartel', 'hospital', 'estacion', 'mina'],
      tags: ['aprender'],
      reward: 0.35
    }),
    act('leer', 'leer o estudiar', {
      pre: [],
      add: ['habilidad_util', 'novedad_explorada'],
      durationMin: 60,
      needs: { desarrollo: 0.5, curiosidad: 0.4, religion: 0.1 },
      requires: { knowledge: { domain: 'artistico', level: 0.2 } },
      place: ['casa', 'templo', 'escuela'],
      tags: ['aprender'],
      reward: 0.3
    }),
    act('ayudar', 'ayudar a alguien', {
      pre: [],
      add: ['reputacion_alta'],
      durationMin: 45,
      needs: { pertenencia: 0.4, prestigio: 0.4, familia: 0.1 },
      place: ['plaza', 'mercado', 'templo', 'hospital', 'cuartel', 'taller'],
      tags: ['social', 'grupo'],
      reward: 0.45
    }),
    act('cuidar_herido', 'cuidar a un herido', {
      pre: ['otro_herido'],
      add: ['reputacion_alta'],
      durationMin: 60,
      needs: { prestigio: 0.4, pertenencia: 0.3, salud: 0.2 },
      requires: { skill: { id: 'medicina', level: 0.15 } },
      place: ['hospital', 'cuartel', 'casa'],
      tags: ['social', 'herido'],
      reward: 0.6
    }),
    act('patrullar', 'patrullar', {
      pre: ['empleo_activo'],
      add: ['deber_cumplido', 'cansado'],
      durationMin: 180,
      risk: 0.2,
      needs: { deber: 0.5, lealtad: 0.3, seguridad: 0.2 },
      strain: { descanso: 0.2 },
      place: ['cuartel', 'estacion', 'plaza', 'campo'],
      tags: ['deber', 'militar'],
      reward: 0.3
    }),
    act('obedecer', 'cumplir una orden', {
      pre: [],
      add: ['deber_cumplido'],
      durationMin: 60,
      needs: { deber: 0.5, lealtad: 0.3 },
      place: ['cuartel', 'taller', 'estacion', 'plaza'],
      tags: ['deber'],
      reward: 0.3
    }),
    act('cubrirse', 'buscar cobertura', {
      pre: [],
      add: ['a_salvo', 'cubierto'],
      durationMin: 15,
      risk: 0.1,
      needs: { seguridad: 0.6 },
      place: ['cuartel', 'campo', 'calle', 'estacion', 'plaza'],
      tags: ['peligro', 'militar'],
      reward: 0.5
    }),
    act('huir', 'huir del peligro', {
      pre: [],
      add: ['a_salvo'],
      durationMin: 20,
      risk: 0.2,
      needs: { seguridad: 0.7, supervivencia: 0.4 },
      strain: { descanso: 0.1 },
      place: ['calle', 'campo', 'bosque', 'casa'],
      tags: ['peligro'],
      reward: 0.5
    }),
    act('vigilar', 'vigilar el entorno', {
      pre: [],
      add: ['a_salvo'],
      durationMin: 30,
      risk: 0.05,
      needs: { seguridad: 0.4, deber: 0.2 },
      place: ['cuartel', 'estacion', 'plaza', 'campo'],
      tags: ['deber'],
      reward: 0.25
    }),
    act('disparar', 'abrir fuego', {
      pre: ['arma_lista', 'con_municion'],
      add: ['amenaza_neutralizada'],
      del: ['con_municion'],
      durationMin: 5,
      risk: 0.45,
      needs: { seguridad: 0.4, deber: 0.3 },
      requires: { armed: true },
      place: ['cuartel', 'calle', 'campo', 'estacion'],
      tags: ['militar', 'arma'],
      reward: 0.3
    }),
    act('recargar', 'recargar el arma', {
      pre: ['arma_lista'],
      add: ['con_municion'],
      durationMin: 2,
      risk: 0.1,
      requires: { armed: true },
      place: ['cuartel', 'calle', 'campo'],
      tags: ['militar', 'arma'],
      reward: 0.1
    }),
    act('saquear', 'saquear', {
      pre: [],
      add: ['dinero_disponible', 'comida_disponible'],
      durationMin: 40,
      risk: 0.6,
      needs: { economia: 0.6, alimentacion: 0.2 },
      strain: { prestigio: 0.3 },
      place: ['mercado', 'calle', 'estacion'],
      tags: ['dinero'],
      reward: 0.35
    }),
    act('beber_alcohol', 'beber en la taberna', {
      pre: ['dinero_disponible'],
      add: ['contacto_social'],
      del: ['dinero_disponible'],
      durationMin: 60,
      risk: 0.1,
      needs: { descanso: 0.2, relaciones: 0.3, frustracion: 0.4 },
      strain: { salud: 0.06, economia: 0.05 },
      place: ['posada'],
      tags: ['social'],
      reward: 0.3
    }),
    act('confrontar', 'ajustar cuentas', {
      pre: ['rival_disponible'],
      add: ['venganza_cumplida'],
      durationMin: 20,
      risk: 0.55,
      needs: { venganza: 0.9, prestigio: 0.2 },
      place: ['calle', 'posada', 'plaza', 'cuartel'],
      tags: ['rencor'],
      reward: 0.3
    }),
    act('ascender', 'pedir el ascenso', {
      pre: ['reputacion_alta'],
      add: ['prestigio_alto'],
      durationMin: 30,
      risk: 0.15,
      needs: { ambicion: 0.8, prestigio: 0.3 },
      place: ['cuartel', 'taller', 'estacion'],
      tags: ['ascenso'],
      reward: 0.4
    }),
    act('entrenar', 'entrenar', {
      pre: [],
      add: ['habilidad_util', 'cansado'],
      durationMin: 90,
      needs: { desarrollo: 0.4, deber: 0.2 },
      strain: { descanso: 0.18 },
      place: ['cuartel', 'campo', 'plaza'],
      tags: ['aprender', 'militar'],
      reward: 0.3
    })
  ];

  GO.BY_ID = {};
  for (const a of GO.ACTIONS) GO.BY_ID[a.id] = a;

  /* Hechos iniciales del mundo del NPC. */
  GO.factsFor = function (brain) {
    const f = new Set();
    const inv = brain.inventory || [];
    const has = (tag) => inv.some((i) => i.tags && i.tags.indexOf(tag) >= 0);
    if (brain.economy && brain.economy.employment) f.add('empleo_activo');
    if (brain.economy && brain.economy.money >= 2) f.add('dinero_disponible');
    if (has('comida')) f.add('comida_disponible');
    if (has('botiquin')) f.add('botiquin_disponible');
    if (has('arma')) f.add('arma_lista');
    if (has('municion')) f.add('con_municion');
    const ph = brain.physiology.state;
    if (ph.fatigue < 0.35 && ph.sleepDebt < 0.35) f.add('descansado');
    if (brain.emotions.get('tranquilidad') > 0.5) f.add('a_salvo');
    if (brain.social && brain.social.rivals && brain.social.rivals.length) f.add('rival_disponible');
    if (brain.social && brain.social.family && brain.social.family.length) f.add('familia_cerca');
    if (brain.worldWoundedNear) f.add('otro_herido');
    if (brain.location && brain.location.type === 'casa') f.add('en_refugio');
    // Competencias operativas: no son adorno, son hechos que el planificador usa.
    if (AETH.competence && brain.culture) {
      const CMP = AETH.competence;
      // Se calcula una vez por decisión: el coste de viaje de cada acción lo reutiliza.
      // Se reutiliza el objeto para no generar basura en cada decisión.
      const comp = brain._comp || (brain._comp = { numeracy: 0, geography: 0 });
      const numeracy = (comp.numeracy = CMP.numeracy(brain));
      const geography = (comp.geography = CMP.geography(brain));
      if (geography >= 0.45) f.add('sabe_orientarse');
      if (numeracy >= 0.55) f.add('cuenta_bien');
      if (brain.culture.literacy) f.add('sabe_leer');
    }
    if (brain.achievedFacts) {
      const now = brain.clockTime || 0;
      for (const k of Object.keys(brain.achievedFacts)) {
        if (brain.achievedFacts[k] >= now) f.add(k);
        else delete brain.achievedFacts[k];
      }
    }
    return f;
  };

  GO.describeAction = function (a) {
    return {
      id: a.id,
      label: a.label,
      duracion: a.durationMin + ' min',
      riesgo: a.risk,
      lugar: a.place.join('/') || 'cualquiera',
      satisface: Object.keys(a.needs).map((k) => (AETH.needs.DEFS[k] ? AETH.needs.DEFS[k].label : k) + ' +' + a.needs[k]),
      requiere: a.requires
    };
  };

  /* ¿Puede el individuo ejecutar la acción con sus capacidades y recursos? */
  GO.applicable = function (action, brain) {
    const req = action.requires || {};
    if (req.skill) {
      const lvl = brain.memory.skill(req.skill.id);
      if (lvl < req.skill.level) return { ok: false, reason: 'falta pericia en ' + req.skill.id + ' (' + U.round(lvl, 2) + ')' };
    }
    if (req.knowledge) {
      const dom = brain.culture.knowledge.domains[req.knowledge.domain] || 0;
      if (dom < req.knowledge.level) return { ok: false, reason: 'no tiene conocimientos de ' + req.knowledge.domain };
    }
    if (AETH.competence) {
      const comp = AETH.competence;
      if (req.numeracy && comp.numeracy(brain) < req.numeracy) {
        return { ok: false, reason: 'no sabe calcular lo que exige ' + (action.label || action.id) };
      }
      if (req.geography) {
        const g = comp.geography(brain);
        if (g < req.geography) return { ok: false, reason: 'no conoce el terreno para ' + (action.label || action.id) };
        const reach = comp.canReach(brain, (action.place || [])[0], null);
        if (!reach.ok) return { ok: false, reason: reach.reason };
      }
    }
    if (req.tool) {
      const has = (brain.inventory || []).some((i) => i.tags && i.tags.indexOf(req.tool) >= 0);
      if (!has) return { ok: false, reason: 'le falta ' + req.tool };
    }
    if (req.armed && !(brain.inventory || []).some((i) => i.tags && i.tags.indexOf('arma') >= 0)) {
      return { ok: false, reason: 'no va armado' };
    }
    if (req.money && (!brain.economy || brain.economy.money < req.money)) return { ok: false, reason: 'no tiene dinero suficiente' };
    // La moralidad no es un módulo aparte: surge de personalidad, necesidad y contexto.
    // Un respiro breve no cura el agotamiento: quien está extenuado necesita dormir.
    if (action.id === 'descansar' && brain.physiology && brain.physiology.state.fatigue > 0.62) {
      return { ok: false, reason: 'está demasiado agotado para descansar de pie' };
    }
    if (action.id === 'saquear') {
      const desperate = brain.needs && (brain.needs.get('alimentacion') > 0.9 || brain.needs.get('economia') > 0.9);
      const willing =
        brain.personality.get('discipline') < 0.35 &&
        brain.personality.get('empathy') < 0.3 &&
        brain.personality.get('aggression') > 0.7 &&
        brain.needs &&
        brain.needs.urgency('economia') > 0.55;
      if (!willing && !desperate) return { ok: false, reason: 'no está dispuesto a robar' };
    }
    return { ok: true };
  };

  GO.costOf = function (action, brain) {
    let cost = action.durationMin;
    if (action.place && action.place.length && (!brain.location || action.place.indexOf(brain.location.type) < 0)) {
      cost += AETH.competence ? AETH.competence.travelMinutes(brain, action, brain._comp && brain._comp.geography) : 12;
    }
    const mods = brain._physMods || (brain.physiology ? brain.physiology.cognitiveModifiers() : null);
    const riskAversion = mods ? mods.riskAversion : 0.3;
    cost += action.risk * 120 * (1 + riskAversion);
    const fatigue = brain.physiology ? brain.physiology.state.fatigue : 0;
    cost *= 1 + fatigue * 0.4;
    return U.round(cost, 1);
  };

  function applyFacts(facts, action) {
    const next = new Set(facts);
    for (const d of action.del) next.delete(d);
    for (const a of action.add) next.add(a);
    return next;
  }

  function satisfied(facts, required) {
    for (const r of required) if (!facts.has(r)) return false;
    return true;
  }

  /* Planificador A*. Devuelve {plan, cost, ok, reason, blocked}. */
  class Planner {
    constructor(actions) {
      this.actions = actions || GO.ACTIONS;
      this.lastStats = { expanded: 0, plans: 0, failures: 0 };
    }

    plan(facts, required, brain, opts) {
      opts = opts || {};
      const maxDepth = opts.maxDepth || 5;
      const maxNodes = opts.maxNodes || 320;
      // Poda por relevancia: solo acciones que producen hechos necesarios (encadenadas hacia atrás).
      const relevant = new Set();
      const needed = new Set(required);
      let grew = true;
      while (grew) {
        grew = false;
        for (const a of this.actions) {
          if (relevant.has(a.id)) continue;
          if (!a.add.some((f) => needed.has(f))) continue;
          relevant.add(a.id);
          grew = true;
          for (const p of a.pre) {
            if (!needed.has(p)) {
              needed.add(p);
              grew = true;
            }
          }
        }
      }
      const candidates = this.actions.filter((a) => relevant.has(a.id));
      const applicableCache = new Map();
      const capOf = (action) => {
        if (applicableCache.has(action.id)) return applicableCache.get(action.id);
        const r = GO.applicable(action, brain);
        applicableCache.set(action.id, r);
        return r;
      };
      const start = new Set(facts);
      if (satisfied(start, required)) return { ok: true, plan: [], cost: 0, reason: 'ya cumplido' };
      const open = [{ facts: start, plan: [], g: 0, h: required.filter((r) => !start.has(r)).length, f: required.filter((r) => !start.has(r)).length }];
      const seen = new Set();
      const blocked = [];
      let expanded = 0;
      while (open.length && expanded < maxNodes) {
        open.sort((a, b) => a.f - b.f);
        const node = open.shift();
        const key = Array.from(node.facts).sort().join('|');
        if (seen.has(key)) continue;
        seen.add(key);
        expanded++;
        if (node.plan.length >= maxDepth) continue;
        for (const action of candidates) {
          if (node.plan.some((p) => p.id === action.id)) continue;
          if (!satisfied(node.facts, action.pre)) continue;
          const app = capOf(action);
          if (!app.ok) {
            if (blocked.length < 8) blocked.push({ action: action.label, reason: app.reason });
            continue;
          }
          const nextFacts = applyFacts(node.facts, action);
          const stepCost = GO.costOf(action, brain);
          const plan = node.plan.concat([action]);
          const g = node.g + stepCost;
          if (satisfied(nextFacts, required)) {
            this.lastStats.expanded = expanded;
            this.lastStats.plans++;
            return {
              ok: true,
              plan: plan,
              cost: U.round(g, 1),
              reason: plan.map((p) => p.label).join(' → '),
              blocked: blocked.slice(0, 4)
            };
          }
          const h = required.filter((r) => !nextFacts.has(r)).length;
          open.push({ facts: nextFacts, plan: plan, g: g, h: h, f: g + h * 30 });
        }
      }
      this.lastStats.expanded = expanded;
      this.lastStats.failures++;
      return {
        ok: false,
        plan: [],
        cost: Infinity,
        reason: blocked.length ? 'no puede: ' + blocked[0].reason : 'no encuentra un plan viable',
        blocked: blocked.slice(0, 6)
      };
    }
  }

  GO.Planner = Planner;
})(typeof window !== 'undefined' ? window : globalThis);
