/* =========================================================================
   ai/interfaces/factory.js — API universal de creación de NPC.
   create(spec) completa campos omitidos con reglas coherentes.
   createFromDescription(texto) convierte una descripción en un individuo.
   Sin API externa, sin modelos de lenguaje en tiempo de ejecución.
   ========================================================================= */
(function (g) {
  'use strict';
  const AETH = g.AETH;
  const U = AETH.util;
  const C = AETH.culture;

  const F = (AETH.NPCFactory = {});

  /* --------------------------- tablas semánticas --------------------------- */
  const PROFESSION_WORDS = [
    [/mec[aá]nic[oa]\s+ferroviari|ferroviari[oa]\s+mec[aá]nic/i, 'mecanico_ferroviario'],
    [/mec[aá]nic/i, 'mecanico_ferroviario'],
    [/ferroviari|maquinista|guardagujas/i, 'ferroviario'],
    [/m[eé]dic|doctor|sanitar|curandera|enfermer/i, 'medico'],
    [/oficial|teniente|capit[aá]n|comandante/i, 'oficial'],
    [/francotirador|tirador|sniper|explorador|batidor/i, 'soldado'],
    [/soldado|sargento|cabo|soldad|infante|veterano/i, 'soldado'],
    [/comerciant|mercader|tendero|vendedor/i, 'comerciante'],
    [/cazador|trampero|rastreador/i, 'cazador'],
    [/campesin|granjer|labrador|agricultor/i, 'campesino'],
    [/sacerdote|p[aá]rroco|cl[eé]rigo|monja|presb[ií]ter|predicador/i, 'sacerdote'],
    [/maestr|profesor|ense[nñ]ante/i, 'profesor'],
    [/mariner|marino|pescador/i, 'marinero'],
    [/piloto|aviador/i, 'piloto'],
    [/miner|picador/i, 'minero'],
    [/artesan|ebanista|herreros?|carpinter|cosedera/i, 'artesano'],
    [/taberner|posader|cantiner/i, 'tabernero'],
    [/ni[nñ][oa]|muchach|chaval|hu[eé]rfano/i, 'nino']
  ];

  const ETHNICITY_WORDS = [
    [/volskay|monta[nñ]|cordillera|cuatro coronas/i, 'montanesa_volskaya'],
    [/borg[nñ][oó]n|ribere|serevan|llanura del r[ií]o/i, 'riberena_borgnon'],
    [/namar|pantano|cuenca|marisma/i, 'namari_pantanosa'],
    [/varend|selva|tropical/i, 'varendi_selvatica'],
    [/orm|taiga|con[ií]fera|bosque fr[ií]o/i, 'ormi_taiga'],
    [/pradera|serevan[ao]|trashumante|pastor/i, 'serevana_pradera'],
    [/eirhama|acantilado|costa|isla volc[aá]nica/i, 'eirhama_costera'],
    [/praga|llanura industrial|praguense/i, 'pragense_llanura'],
    [/zheng|hua|este lejano/i, 'zheng_hua'],
    [/durn|karst|mina profunda|cantera/i, 'durn_karst']
  ];

  const FACTION_WORDS = [
    [/volskay|eisenmark|argentum|genovar|alianza/i, 'alianza_eisenmark'],
    [/praga|veyrn|zheng|coalici[oó]n/i, 'coalicion_praga'],
    [/vardenia/i, 'vardenia'],
    [/caerwyn|eirhama/i, 'caerwyn'],
    [/avar/i, 'avar'],
    [/sareth/i, 'sareth'],
    [/nerath/i, 'nerath'],
    [/durn/i, 'durn'],
    [/ghar|mor/i, 'ghar_mor'],
    [/varkh/i, 'varkh']
  ];

  const NATIONALITY_WORDS = [
    [/volskay/i, 'volskaya'],
    [/eisenmark/i, 'eisenmark'],
    [/argentum/i, 'argentum'],
    [/genovar/i, 'genovar'],
    [/praga/i, 'praga'],
    [/veyrn/i, 'veyrn'],
    [/zheng|hua/i, 'zheng_hua'],
    [/vardenia|varend/i, 'vardenia'],
    [/namar/i, 'namar'],
    [/caerwyn/i, 'caerwyn'],
    [/eirhama/i, 'eirhama'],
    [/durn/i, 'durn'],
    [/orm/i, 'orm'],
    [/serevan/i, 'serevan'],
    [/sareth/i, 'sareth'],
    [/ghar|mor/i, 'ghar_mor'],
    [/varkh/i, 'varkh']
  ];

  const CONDITION_WORDS = [
    [/rodilla/i, 'kneeInjury'],
    [/coj[eo]|muleta|movilidad reducida/i, 'kneeInjury'],
    [/tuert|cieg|vista cansada|miop|anteojos/i, 'myopia'],
    [/sord|o[ií]do|tapones/i, 'hearingLoss'],
    [/herid|metralla|bala/i, 'oldWound'],
    [/enferm|fiebre|tos cr[oó]nica|pulmones/i, 'chronicIllness'],
    [/insomnio|no duerme|pesadillas/i, 'insomnia'],
    [/analfabet|no sabe leer/i, 'illiterate'],
    [/sin trabajo|parado|despedid/i, 'unemployed']
  ];

  const GOAL_WORDS = [
    [/mantener a (su|la) familia|sostener a (su|la) familia|mantener a los suyos/i, { label: 'mantener a su familia', conditions: ['familia_estable'], utility: 0.85, tags: ['familia'] }],
    [/ahorrar|dinero|deuda|pagar/i, { label: 'conseguir dinero', conditions: ['dinero_suficiente'], utility: 0.75, tags: ['dinero'] }],
    [/venganza|vengar|ajustar cuentas|rencor/i, { label: 'ajustar cuentas', conditions: ['venganza_cumplida'], utility: 0.7, tags: ['rencor'] }],
    [/ascender|ascenso|prestigio|medrar/i, { label: 'ascender', conditions: ['prestigio_alto'], utility: 0.6, tags: ['ascenso'] }],
    [/aprender|estudiar|maestr[ií]a/i, { label: 'aprender un oficio', conditions: ['habilidad_util'], utility: 0.55, tags: ['aprender'] }],
    [/fe|religios|reza|peregrin/i, { label: 'cumplir con la Fe', conditions: ['deber_religioso'], utility: 0.55, tags: ['fe'] }],
    [/sobrevivir|no morir|volver a casa/i, { label: 'sobrevivir', conditions: ['a_salvo'], utility: 0.9, tags: ['peligro'] }]
  ];

  const SEX_WORDS = [
    [/mujer|anciana|viuda|madre|hermana|hija|muchacha|ni[nñ]a|se[nñ]ora|curandera|monja/i, 'female'],
    [/hombre|anciano|viudo|padre|hermano|hijo|muchacho|ni[nñ]o|se[nñ]or|soldado|veterano/i, 'male']
  ];

  function firstMatch(text, table) {
    for (const [re, val] of table) if (re.test(text)) return val;
    return null;
  }

  /* --------------------------- parseo de descripción --------------------------- */
  F.parseDescription = function (text) {
    const raw = String(text || '');
    const t = raw
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    const spec = { background: raw.trim(), source: 'descripcion' };

    const ageMatch = t.match(/(\d{1,3})\s*(anos|años)/);
    if (ageMatch) spec.age = U.clamp(parseInt(ageMatch[1], 10), 1, 110);
    else if (/ancian|abuel|viejo|vieja/.test(t)) spec.age = 72;
    else if (/ni[nñ]|muchach|chaval|huerfan/.test(t)) spec.age = 10;
    else if (/joven|adolescente/.test(t)) spec.age = 19;
    else if (/mediana edad|madur/.test(t)) spec.age = 46;

    spec.sex = firstMatch(t, SEX_WORDS) || undefined;
    spec.profession = firstMatch(t, PROFESSION_WORDS) || undefined;
    spec.ethnicity = firstMatch(t, ETHNICITY_WORDS) || undefined;
    spec.nationality = firstMatch(t, NATIONALITY_WORDS) || undefined;
    spec.faction = firstMatch(t, FACTION_WORDS) || undefined;

    // Religión
    if (/fe del hacedor|hacedor|religios|devot|piados|cura|sacerdote|monja|reza/.test(t)) {
      spec.religion = 'fe_del_hacedor';
      spec.devotion = /devot|fanatic|fervient/.test(t) ? 0.92 : /duda|esc[eé]ptic/.test(t) ? 0.25 : 0.7;
    }
    if (/ortodox/.test(t)) spec.branch = 'ortodoxa';
    else if (/evangel/.test(t)) spec.branch = 'evangelica';
    else if (/restauracion/.test(t)) spec.branch = 'restauracionista';
    else if (/apostol/.test(t)) spec.branch = 'apostolica';

    // Condiciones físicas
    spec.conditions = {};
    for (const [re, key] of CONDITION_WORDS) if (re.test(t)) spec.conditions[key] = true;

    // Personalidad: adjetivos del léxico
    const traits = [];
    for (const word of Object.keys(AETH.personality.TRAIT_LEXICON)) {
      const re = new RegExp('\\b' + word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b');
      if (re.test(t) && traits.indexOf(word) < 0) traits.push(word);
    }
    // Rasgos con género gramatical
    const genderTraits = [
      [/desconfiad/, 'desconfiado'],
      [/reservad|callad/, 'reservado'],
      [/perseverante|tenaz/, 'perseverante'],
      [/religios|devot/, 'religioso'],
      [/prudent|caut/, 'prudente'],
      [/impulsiv/, 'impulsivo'],
      [/solitari|solo/, 'solitario'],
      [/amable|bondados/, 'amable'],
      [/agresiv|violento/, 'agresivo'],
      [/astut|sagaz/, 'astuto'],
      [/melanc|triste/, 'melancolico']
    ];
    for (const [re, word] of genderTraits) {
      if (re.test(t) && traits.indexOf(word) < 0) traits.push(word);
    }
    spec.personality = traits;

    // Objetivos explícitos o implícitos
    spec.personalGoals = [];
    for (const [re, goal] of GOAL_WORDS) if (re.test(t)) spec.personalGoals.push(U.clone(goal));
    if (/familia|hijos|hijas|mantener/.test(t)) spec.familyBurden = true;
    if (/pobre|miseria|deuda|sin dinero|necesita dinero/.test(t)) spec.poverty = true;
    if (/vengan|rencor|odio/.test(t)) spec.vengeance = true;
    if (/ascenso|ambici|medrar/.test(t)) spec.ambition = 0.8;
    if (/experta|experto|veteran|maestr|a[nñ]os de oficio|antiguo/.test(t)) spec.veteran = true;
    if (/viud/.test(t)) {
      spec.conditions.widowed = true;
      spec.familyBurden = spec.familyBurden === undefined ? true : spec.familyBurden;
    }

    // Lugar de origen y residencia
    const originMatch = t.match(/(?:de|oriundo de|originario de|nacido en)\s+([a-zñ\s]{4,28})/);
    if (originMatch) spec.origin = originMatch[1].trim();
    const residenceMatch = t.match(/(?:en|residente en|afincado en)\s+(borgnon|borgñon|volskaya|praga|veyrn|namar|varend|orm|eirhama|durn)/);
    if (residenceMatch) spec.residence = residenceMatch[1].replace('ñ', 'n');

    // Oficio militar concreto
    if (/ametrallador/.test(t)) spec.militaryRole = 'ametrallador';
    else if (/granader/.test(t)) spec.militaryRole = 'granadero';
    else if (/explorador/.test(t)) spec.militaryRole = 'explorador';
    else if (/artiller/.test(t)) spec.militaryRole = 'artillero';
    else if (/piloto|aviador/.test(t)) spec.militaryRole = 'piloto';
    else if (/medico|sanitario/.test(t)) spec.militaryRole = 'medico';

    // Guerra de Orvek
    if (/orvek|guerra|frente|regimiento|trinchera/.test(t)) {
      spec.background = raw.trim();
      spec.militaryRecord = { served: true, war: 'Guerra de Orvek', year: 1921 };
    }
    if (/hermano|hermana/.test(t) && /perdi|murio|murió|cayo/.test(t)) {
      spec.conditions.lostSibling = true;
      spec.vengeance = spec.vengeance === undefined ? true : spec.vengeance;
    }
    return spec;
  };

  /* --------------------------- completar campos --------------------------- */
  F.complete = function (spec) {
    spec = U.clone(spec || {});
    // Con semilla explícita el individuo es reproducible; sin ella se mezcla el
    // reloj para que dos NPC genéricos nunca salgan idénticos.
    const rng = new U.RNG(
      U.hashString(JSON.stringify({ n: spec.name || '', b: spec.background || '', s: spec.seed === undefined ? 0 : spec.seed, t: spec.seed === undefined ? Date.now() % 100000 : 0 }))
    );
    const profession = C.professionOf(spec.profession || spec.role || 'campesino');
    spec.profession = profession.id;

    if (!spec.sex) spec.sex = rng.chance(0.5) ? 'female' : 'male';
    if (!spec.age) {
      if (profession.id === 'nino') spec.age = rng.int(6, 13);
      else if (profession.id === 'soldado') spec.age = rng.int(19, 38);
      else if (profession.id === 'oficial') spec.age = rng.int(30, 55);
      else spec.age = rng.int(19, 64);
    }
    if (!spec.ethnicity) {
      const fromNat = {
        volskaya: 'montanesa_volskaya',
        eisenmark: 'riberena_borgnon',
        serevan: 'serevana_pradera',
        praga: 'pragense_llanura',
        zheng_hua: 'zheng_hua',
        namar: 'namari_pantanosa',
        vardenia: 'varendi_selvatica',
        orm: 'ormi_taiga',
        eirhama: 'eirhama_costera',
        durn: 'durn_karst'
      };
      spec.ethnicity = fromNat[spec.nationality] || rng.pick(Object.keys(C.ethnicities));
    }
    const eth = C.ethnicityOf(spec.ethnicity);
    if (!spec.nationality) {
      const natFromEth = {
        montanesa_volskaya: 'volskaya',
        riberena_borgnon: 'eisenmark',
        namari_pantanosa: 'namar',
        varendi_selvatica: 'vardenia',
        ormi_taiga: 'orm',
        serevana_pradera: 'serevan',
        eirhama_costera: 'eirhama',
        pragense_llanura: 'praga',
        zheng_hua: 'zheng_hua',
        durn_karst: 'durn'
      };
      spec.nationality = natFromEth[spec.ethnicity] || 'eisenmark';
    }
    if (!spec.faction) {
      const fmap = {
        volskaya: 'alianza_eisenmark',
        eisenmark: 'alianza_eisenmark',
        argentum: 'alianza_eisenmark',
        genovar: 'alianza_eisenmark',
        serevan: 'alianza_eisenmark',
        praga: 'coalicion_praga',
        veyrn: 'coalicion_praga',
        zheng_hua: 'coalicion_praga',
        namar: 'vardenia',
        vardenia: 'vardenia',
        eirhama: 'caerwyn',
        orm: 'ghar_mor',
        durn: 'durn'
      };
      spec.faction = fmap[spec.nationality] || 'alianza_eisenmark';
    }
    if (!spec.residence) spec.residence = spec.nationality === 'volskaya' ? 'borgnon' : spec.nationality;
    if (!spec.origin) spec.origin = eth.region;
    if (!spec.religion) spec.religion = 'fe_del_hacedor';
    if (!spec.branch) spec.branch = eth.branch;
    if (spec.conditions === undefined) spec.conditions = {};
    if (spec.conditions.kneeInjury === undefined && /rodilla/.test(spec.background || '')) spec.conditions.kneeInjury = true;
    if (spec.conditions.widowed && spec.personalGoals) {
      spec.personalGoals = spec.personalGoals.filter((g) => g.label !== 'mantener a su familia');
    }
    if (!spec.education) spec.education = U.clamp(profession.education + (spec.veteran ? 0.04 : 0) + rng.range(-0.08, 0.06), 0, 1);
    if (!spec.name) spec.name = C.nameFor(rng, spec.ethnicity, spec.sex);
    if (!spec.id) spec.id = U.uid('npc', rng);
    if (!spec.personalGoals) spec.personalGoals = [];
    if (spec.conditions.widowed && !spec.personalGoals.some((g) => g.tags && g.tags.indexOf('luto') >= 0)) {
      spec.personalGoals.push({ label: 'sobrellevar el luto', conditions: ['deber_religioso'], utility: 0.5, tags: ['fe', 'luto'] });
    }
    spec.seed = spec.seed === undefined ? U.hashString(spec.id + spec.name) : spec.seed;
    return spec;
  };

  /* --------------------------- creación --------------------------- */
  F.create = function (spec, opts) {
    const completed = F.complete(spec);
    const brain = new AETH.brain.Brain(completed, opts);
    if (completed.personalGoals && completed.personalGoals.length) {
      for (const pg of completed.personalGoals) {
        brain.setGoal(
          new AETH.goals.Goal({
            label: pg.label,
            horizon: 'largo',
            conditions: pg.conditions || [],
            utility: pg.utility === undefined ? 0.6 : pg.utility,
            tags: pg.tags || [],
            source: 'identidad',
            motivation: 'objetivo personal declarado',
            created: 0
          })
        );
      }
      brain.plan = { ok: false, plan: [], index: 0, goal: null, reason: 'objetivos personales cargados' };
    }
    if (completed.conditions && completed.conditions.lostSibling) {
      brain.memory.encodeEpisode({
        summary: 'perdió a su hermano en la Guerra de Orvek',
        kind: 'perdida',
        location: 'orvek',
        importance: 1,
        valence: -1,
        intensity: 1,
        time: -3 * 365.25 * 86400
      });
    }
    AETH.debug.log('nacimiento', completed.name + ' (' + completed.profession + ', ' + completed.age + ')');
    return brain;
  };

  F.createFromDescription = function (text, opts) {
    const parsed = F.parseDescription(text);
    const merged = Object.assign({}, parsed, opts && opts.overrides ? opts.overrides : {});
    return F.create(merged, opts);
  };

  /* API corta para el juego / otros proyectos */
  AETH.createNPC = function (spec, opts) {
    return F.create(spec, opts);
  };
  AETH.createNPCFromDescription = function (text, opts) {
    return F.createFromDescription(text, opts);
  };

  /* Personajes de ejemplo del canon de Aethrion */
  F.presets = {
    konrad: function () {
      return {
        role: 'mecanico_ferroviario',
        name: 'Konrad Weiss',
        age: 47,
        ethnicity: 'montanesa_volskaya',
        nationality: 'volskaya',
        faction: 'alianza_eisenmark',
        origin: 'cordillera_de_las_cuatro_coronas',
        residence: 'borgnon',
        religion: 'fe_del_hacedor',
        branch: 'ortodoxa',
        background: 'Veterano de la Guerra de Orvek, 12.º Regimiento de Infantería. Mecánico ferroviario en Borgñon. Perdió a su hermano en Orvek.',
        personality: ['desconfiado', 'perseverante', 'reservado'],
        abilities: ['mecanica', 'ferrocarriles', 'mantenimiento'],
        conditions: { kneeInjury: true, lostSibling: true },
        personalGoals: [
          { label: 'mantener a su familia', conditions: ['familia_estable'], utility: 0.85, tags: ['familia'] },
          { label: 'conseguir dinero', conditions: ['dinero_suficiente'], utility: 0.75, tags: ['dinero'] }
        ]
      };
    },
    doctora: function () {
      return {
        role: 'medico',
        name: 'Amara Okon',
        age: 68,
        sex: 'female',
        ethnicity: 'namari_pantanosa',
        nationality: 'namar',
        faction: 'vardenia',
        origin: 'namar',
        residence: 'borgnon',
        religion: 'fe_del_hacedor',
        branch: 'restauracionista',
        background: 'Médica tradicional de Namar, viuda, desconfía de los militares. Treinta años atendiendo pantanos y heridas de bala.',
        personality: ['religioso', 'desconfiado', 'paciente', 'empatico'],
        conditions: { widow: true },
        personalGoals: [{ label: 'cumplir con la Fe', conditions: ['deber_religioso'], utility: 0.6, tags: ['fe'] }]
      };
    },
    oficial: function () {
      return {
        role: 'oficial',
        name: 'Viktor Havel',
        age: 41,
        ethnicity: 'montanesa_volskaya',
        nationality: 'volskaya',
        faction: 'alianza_eisenmark',
        origin: 'cordillera_de_las_cuatro_coronas',
        residence: 'borgnon',
        militaryRole: 'teniente',
        rank: 'teniente',
        background: 'Oficial del 12.º Regimiento, condecorado en Orvek, ahora instructor de la guarnición de Borgñon.',
        personality: ['disciplinado', 'orgulloso', 'prudente'],
        conditions: { oldWound: true }
      };
    },
    soldado: function () {
      return {
        role: 'soldado',
        name: 'Emil Novák',
        age: 22,
        ethnicity: 'montanesa_volskaya',
        nationality: 'volskaya',
        faction: 'alianza_eisenmark',
        origin: 'cordillera_de_las_cuatro_coronas',
        residence: 'borgnon',
        militaryRole: 'fusilero',
        background: 'Recluta del reemplazo de 1922; nunca ha disparado a un hombre.',
        personality: ['nervioso', 'leal'],
        conditions: { unemployed: false }
      };
    },
    comerciante: function () {
      return {
        role: 'comerciante',
        name: 'Greta Schuster',
        age: 53,
        sex: 'female',
        ethnicity: 'riberena_borgnon',
        nationality: 'eisenmark',
        faction: 'alianza_eisenmark',
        residence: 'borgnon',
        background: 'Regenta el mercado cubierto. Sufrió un fraude hace diez años y no se fía de los vendedores nuevos.',
        personality: ['astuto', 'tacano', 'sociable']
      };
    },
    nino: function () {
      return {
        role: 'nino',
        name: 'Lukas Bauer',
        age: 9,
        ethnicity: 'riberena_borgnon',
        nationality: 'eisenmark',
        faction: 'alianza_eisenmark',
        residence: 'borgnon',
        background: 'Hijo de un ferroviario; pasa el día entre las vías y la plaza.',
        personality: ['curioso', 'alegre']
      };
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
