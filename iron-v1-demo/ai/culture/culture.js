/* =========================================================================
   ai/culture/culture.js — etnia, nación, facción, religión, idioma,
   educación, profesión, conocimiento y redes sociales.
   La cultura se aprende; la etnia es población, no personalidad.
   ========================================================================= */
(function (g) {
  'use strict';
  const AETH = g.AETH;
  const U = AETH.util;

  const C = (AETH.culture = {});

  C.DOMAINS = [
    'militar',
    'medico',
    'mecanico',
    'ferroviario',
    'agricola',
    'comercial',
    'religioso',
    'cientifico',
    'politico',
    'geografico',
    'artistico',
    'artesanal',
    'naturalista'
  ];
  C.DOMAIN_LABELS = {
    militar: 'militar',
    medico: 'médico',
    mecanico: 'mecánico',
    ferroviario: 'ferroviario',
    agricola: 'agrícola',
    comercial: 'comercial',
    religioso: 'religioso',
    cientifico: 'científico',
    politico: 'político',
    geografico: 'geográfico',
    artistico: 'artístico',
    artesanal: 'artesanal',
    naturalista: 'naturalista'
  };

  /* ---------------------------- GEOGRAFÍA / ETNIAS ---------------------------- */
  C.ethnicities = {
    montanesa_volskaya: {
      label: 'montañesa volskaya',
      region: 'cordillera_de_las_cuatro_coronas',
      biome: 'cordillera',
      language: 'volskano',
      religion: 'fe_del_hacedor',
      branch: 'ortodoxa',
      genes: { adaptability: { d: 0.06 }, physique: { d: 0.08 }, jointStability: { d: 0.08 }, stature: { d: -0.04 }, metabolism: { d: 0.05 } },
      coldAdapt: 0.55,
      heatAdapt: 0.1,
      altitudeAdapt: 0.65,
      heightDelta: -3,
      buildDelta: 0.06,
      names: {
        male: ['Konrad', 'Emil', 'Vasil', 'Radomir', 'Torvald', 'Anton', 'Karel', 'Dominik', 'Lubos', 'Petr'],
        female: ['Irena', 'Marta', 'Vesna', 'Ludmila', 'Hanna', 'Zofia', 'Elena', 'Katya', 'Milena', 'Ruzena'],
        family: ['Weiss', 'Havel', 'Torvik', 'Petrov', 'Marek', 'Zeleny', 'Novak', 'Dvorak', 'Radek', 'Kovac']
      },
      customs: ['hospitalidad de montaña', 'duelo largo', 'respeto a los mayores', 'desconfianza del llano']
    },
    riberena_borgnon: {
      label: 'ribereña de Borgñon',
      region: 'serevan',
      biome: 'serevan',
      language: 'eisenmarkiano',
      religion: 'fe_del_hacedor',
      branch: 'evangelica',
      genes: { metabolism: { d: -0.03 }, sensoryAcuity: { d: 0.04 }, fineMotor: { d: 0.06 }, stature: { d: 0.03 } },
      coldAdapt: 0.25,
      heatAdapt: 0.25,
      altitudeAdapt: 0.1,
      heightDelta: 2,
      buildDelta: 0.02,
      names: {
        male: ['Friedrich', 'Otto', 'Hans', 'Wilhelm', 'Lukas', 'Matthias', 'Josef', 'Ernst', 'Gustav', 'Bernhard'],
        female: ['Greta', 'Anna', 'Klara', 'Ilse', 'Margarete', 'Elsa', 'Rosa', 'Hedwig', 'Lotte', 'Berta'],
        family: ['Braun', 'Schuster', 'Wagner', 'Keller', 'Vogel', 'Huber', 'Bauer', 'Fischer', 'Mayr', 'Kraus']
      },
      customs: ['feria de domingo', 'café de estación', 'sindicato ferroviario', 'limpieza de fachadas']
    },
    namari_pantanosa: {
      label: 'namarí de las cuencas',
      region: 'namar',
      biome: 'namar',
      language: 'namari',
      religion: 'fe_del_hacedor',
      branch: 'restauracionista',
      genes: { immunity: { d: 0.08 }, adaptability: { d: 0.08 }, pigmentation: { d: 0.12 }, metabolism: { d: -0.05 } },
      coldAdapt: 0.05,
      heatAdapt: 0.6,
      altitudeAdapt: 0.05,
      heightDelta: -4,
      buildDelta: -0.04,
      names: {
        male: ['Osei', 'Bembe', 'Kalu', 'Tam', 'Nuru', 'Ike', 'Ade', 'Mosi', 'Chidi', 'Ebo'],
        female: ['Amara', 'Nia', 'Zuri', 'Ife', 'Sana', 'Lumo', 'Ada', 'Yara', 'Fola', 'Esme'],
        family: ['Okon', 'Balewa', 'Mensa', 'Adeyemi', 'Kone', 'Diara', 'Obi', 'Nkemi', 'Sarr', 'Toure']
      },
      customs: ['medicina de hierbas', 'mercados flotantes', 'culto a los antepasados dentro de la Fe', 'respeto al río']
    },
    varendi_selvatica: {
      label: 'varendi de la selva',
      region: 'varend',
      biome: 'varend',
      language: 'vardenio',
      religion: 'fe_del_hacedor',
      branch: 'evangelica',
      genes: { sensoryAcuity: { d: 0.08 }, adaptability: { d: 0.06 }, immunity: { d: 0.06 }, metabolism: { d: 0.04 } },
      coldAdapt: 0.02,
      heatAdapt: 0.7,
      altitudeAdapt: 0.05,
      heightDelta: -2,
      buildDelta: -0.02,
      names: {
        male: ['Ratu', 'Bima', 'Arif', 'Joko', 'Sena', 'Bayu', 'Damar', 'Gilang', 'Hadi', 'Wira'],
        female: ['Sari', 'Dewi', 'Ayu', 'Lestari', 'Maya', 'Intan', 'Rini', 'Sinta', 'Kemala', 'Bunga'],
        family: ['Sutanto', 'Wijaya', 'Pratama', 'Halim', 'Santoso', 'Kusuma', 'Nugroho', 'Rahman', 'Siregar', 'Lubis']
      },
      customs: ['caza con trampa', 'cantos de trabajo', 'tatuaje de linaje', 'tabú de ciertos árboles']
    },
    ormi_taiga: {
      label: 'ormí de la taiga',
      region: 'orm',
      biome: 'orm',
      language: 'ormiano',
      religion: 'fe_del_hacedor',
      branch: 'ortodoxa',
      genes: { physique: { d: 0.07 }, metabolism: { d: 0.06 }, pigmentation: { d: -0.08 }, stature: { d: 0.04 } },
      coldAdapt: 0.75,
      heatAdapt: 0.02,
      altitudeAdapt: 0.25,
      heightDelta: 4,
      buildDelta: 0.08,
      names: {
        male: ['Ivar', 'Bjorn', 'Rurik', 'Sven', 'Alek', 'Mikhail', 'Oleg', 'Timo', 'Eero', 'Nikolai'],
        female: ['Astrid', 'Ingrid', 'Svetlana', 'Olga', 'Aino', 'Sigrid', 'Tatiana', 'Vera', 'Helmi', 'Nadia'],
        family: ['Karhu', 'Virtanen', 'Ivanov', 'Sokolov', 'Lind', 'Berg', 'Koskinen', 'Rautio', 'Volkov', 'Niemi']
      },
      customs: ['baño de vapor', 'caza de invierno', 'hospitalidad obligada', 'silencios largos']
    },
    serevana_pradera: {
      label: 'serevana de las praderas',
      region: 'serevan',
      biome: 'serevan',
      language: 'eisenmarkiano',
      religion: 'fe_del_hacedor',
      branch: 'apostolica',
      genes: { physique: { d: 0.04 }, orientation: { d: 0.08 }, adaptability: { d: 0.04 } },
      coldAdapt: 0.3,
      heatAdapt: 0.35,
      altitudeAdapt: 0.12,
      heightDelta: 3,
      buildDelta: 0.03,
      names: {
        male: ['Jarek', 'Milos', 'Tomas', 'Andrei', 'Stefan', 'Viktor', 'Pavel', 'Radek', 'Ilya', 'Boris'],
        female: ['Anya', 'Katarina', 'Magda', 'Sofia', 'Nadya', 'Bozena', 'Dana', 'Ivana', 'Lena', 'Petra'],
        family: ['Zeman', 'Horak', 'Dolezal', 'Sokol', 'Marek', 'Kral', 'Benes', 'Fiala', 'Urban', 'Sedlak']
      },
      customs: ['trashumancia', 'fiestas de cosecha', 'hospitalidad rural', 'matrimonios entre aldeas']
    },
    eirhama_costera: {
      label: 'eirhamés de la costa',
      region: 'eirhama',
      biome: 'eirhama',
      language: 'eirhamés',
      religion: 'fe_del_hacedor',
      branch: 'apostolica',
      genes: { sensoryAcuity: { d: 0.04 }, adaptability: { d: 0.05 }, physique: { d: 0.03 } },
      coldAdapt: 0.22,
      heatAdapt: 0.3,
      altitudeAdapt: 0.2,
      heightDelta: 1,
      buildDelta: 0,
      names: {
        male: ['Mateo', 'Alvaro', 'Inigo', 'Beltran', 'Nuno', 'Rui', 'Tiago', 'Joao', 'Duarte', 'Salvador'],
        female: ['Isabel', 'Nerea', 'Lucia', 'Marina', 'Beatriz', 'Ines', 'Clara', 'Alma', 'Rita', 'Sofia'],
        family: ['Costa', 'Marin', 'Ferreira', 'Sierra', 'Vega', 'Rocha', 'Braga', 'Lopes', 'Peral', 'Nunes']
      },
      customs: ['fiestas de santos marineros', 'superstición del faro', 'café de puerto', 'duelo por mar']
    },
    pragense_llanura: {
      label: 'praguense de la llanura',
      region: 'praga',
      biome: 'serevan',
      language: 'praguense',
      religion: 'fe_del_hacedor',
      branch: 'evangelica',
      genes: { fineMotor: { d: 0.06 }, learningWindow: { d: 0.04 }, stature: { d: 0.02 } },
      coldAdapt: 0.3,
      heatAdapt: 0.25,
      altitudeAdapt: 0.08,
      heightDelta: 0,
      buildDelta: 0,
      names: {
        male: ['Zdenek', 'Mirek', 'Vojtech', 'Jiri', 'Ladislav', 'Kamil', 'Ondrej', 'Rostislav', 'Ivan', 'Tomas'],
        female: ['Vera', 'Jitka', 'Milada', 'Eva', 'Hana', 'Dagmar', 'Ivana', 'Kveta', 'Lenka', 'Zdena'],
        family: ['Novotny', 'Svoboda', 'Kucera', 'Vesely', 'Prochazka', 'Kral', 'Jelinek', 'Ruzicka', 'Barto', 'Malik']
      },
      customs: ['obreros organizados', 'fútbol de barrio', 'cervecería', 'desconfianza del ejército']
    },
    zheng_hua: {
      label: 'zheng-hua del este',
      region: 'zheng_hua',
      biome: 'serevan',
      language: 'zheng',
      religion: 'fe_del_hacedor',
      branch: 'restauracionista',
      genes: { learningWindow: { d: 0.07 }, fineMotor: { d: 0.06 }, stature: { d: -0.06 }, boneDensity: { d: 0.04 } },
      coldAdapt: 0.2,
      heatAdapt: 0.35,
      altitudeAdapt: 0.1,
      heightDelta: -6,
      buildDelta: -0.06,
      names: {
        male: ['Wei', 'Jun', 'Hao', 'Ming', 'Lei', 'Tao', 'Bo', 'Feng', 'Qiang', 'Xin'],
        female: ['Mei', 'Lan', 'Xiulan', 'Yan', 'Jing', 'Hui', 'Lian', 'Rou', 'Shan', 'Yue'],
        family: ['Chen', 'Li', 'Zhang', 'Wang', 'Liu', 'Zhao', 'Huang', 'Wu', 'Zhou', 'Lin']
      },
      customs: ['culto doméstico a los santos', 'té de la tarde', 'respeto a la jerarquía', 'escritura vertical']
    },
    durn_karst: {
      label: 'durnés del karst',
      region: 'durn',
      biome: 'cordillera',
      language: 'durnés',
      religion: 'fe_del_hacedor',
      branch: 'ortodoxa',
      genes: { boneDensity: { d: 0.08 }, vibrationSense: { d: 0.08 }, physique: { d: 0.04 }, stature: { d: -0.05 } },
      coldAdapt: 0.4,
      heatAdapt: 0.1,
      altitudeAdapt: 0.45,
      heightDelta: -5,
      buildDelta: 0.05,
      names: {
        male: ['Dorin', 'Balin', 'Grim', 'Thorn', 'Korgan', 'Dwal', 'Brann', 'Hesk', 'Orin', 'Vondal'],
        female: ['Hilda', 'Bruni', 'Dagna', 'Vala', 'Torga', 'Sigrun', 'Vesna', 'Kori', 'Elda', 'Mira'],
        family: ['Stonehelm', 'Ironfoot', 'Deepdelver', 'Barrow', 'Anvil', 'Frostbeard', 'Grimhand', 'Cairn', 'Ember', 'Slate']
      },
      customs: ['canto de mina', 'luto por los derrumbes', 'gremios de canteros', 'desconfianza de forasteros']
    }
  };

  /* ---------------------------- FACCIONES ---------------------------- */
  C.factions = {
    alianza_eisenmark: {
      label: 'Alianza de Eisenmark',
      members: ['Eisenmark', 'Volskaya', 'Argentum', 'Genovar'],
      capital: 'Eisenmark',
      economy: 'industria pesada, ferrocarril, carbón, acero',
      doctrine: 'defensa en profundidad, artillería coordinada, líneas ferroviarias',
      branch: 'ortodoxa',
      relations: { coalicion_praga: -0.7, vardenia: 0.1, caerwyn: 0.2, avar: -0.2 }
    },
    coalicion_praga: {
      label: 'Coalición de Praga',
      members: ['Principado de Praga', 'Veyrn', 'Zheng-Hua'],
      capital: 'Praga',
      economy: 'manufactura ligera, agricultura, comercio oriental',
      doctrine: 'movilidad ferroviaria, infantería numerosa, guerra de frontera',
      branch: 'evangelica',
      relations: { alianza_eisenmark: -0.7, zheng_hua: 0.6, sareth: -0.1 }
    },
    vardenia: { label: 'Vardenia', members: ['Vardenia'], economy: 'madera, especias, navegación fluvial', doctrine: 'guerrilla de selva', branch: 'evangelica', relations: { namar: 0.3 } },
    caerwyn: { label: 'Caerwyn', members: ['Caerwyn'], economy: 'pesca, astilleros, turba', doctrine: 'defensa costera', branch: 'apostolica', relations: { eirhama: 0.4 } },
    avar: { label: 'Avar', members: ['Avar'], economy: 'pastoreo, sal, caravanas', doctrine: 'caballería ligera', branch: 'restauracionista', relations: { volskaya: -0.3 } },
    sareth: { label: 'Sareth', members: ['Sareth'], economy: 'minería, fundición', doctrine: 'fortines y trenes blindados', branch: 'ortodoxa', relations: { durn: 0.2 } },
    nerath: { label: 'Nerath', members: ['Nerath'], economy: 'comercio marítimo', doctrine: 'neutralidad armada', branch: 'apostolica', relations: {} },
    durn: { label: 'Durn', members: ['Durn'], economy: 'canteras, hierro, cerveza', doctrine: 'túneles y explosivos', branch: 'ortodoxa', relations: { sareth: 0.2 } },
    ghar_mor: { label: 'Ghar-Mor', members: ['Ghar-Mor'], economy: 'ganadería de estepa, pieles', doctrine: 'jinetes y exploradores', branch: 'restauracionista', relations: { volskaya: -0.4 } },
    varkh: { label: 'Varkh', members: ['Varkh'], economy: 'pesca de altura, bacalao, ron', doctrine: 'infantería naval', branch: 'evangelica', relations: { caerwyn: 0.2 } }
  };

  /* Estado de Volskaya/Veyrn y la Guerra de Orvek (1921) */
  C.history = {
    orvekWar: {
      year: 1921,
      label: 'Guerra de Orvek',
      summary: 'Conflicto fronterizo entre Volskaya y Veyrn por el corredor de Orvek; ocho meses de trincheras, 40.000 muertos, armisticio sin tratado.',
      scars: ['trincheras', 'pueblo arrasado', 'hermanos perdidos', 'rencor fronterizo']
    },
    year: 1922,
    techNote: 'Industria de 1890 con capacidades selectivas de 1943. Sin informática.'
  };

  /* ---------------------------- RELIGIÓN ---------------------------- */
  C.religion = {
    id: 'fe_del_hacedor',
    label: 'Fe del Hacedor',
    god: 'El Hacedor',
    note: 'Monoteísmo. El Hacedor creó el universo. No existe Jesucristo en Aethrion.',
    branches: {
      ortodoxa: { label: 'ortodoxa', emphasis: 'liturgia, iconos, ayuno, autoridad sinodal', tolerance: 0.35 },
      apostolica: { label: 'apostólica', emphasis: 'sacramentos, santos, peregrinación', tolerance: 0.5 },
      evangelica: { label: 'evangélica', emphasis: 'predicación, conversión personal, himnos', tolerance: 0.6 },
      restauracionista: { label: 'restauracionista', emphasis: 'restauración de la iglesia primitiva, profetas, comunidad', tolerance: 0.45 }
    },
    saints: [
      { id: 'san_veren', label: 'San Veren', patronage: 'viajeros y ferroviarios' },
      { id: 'santa_alda', label: 'Santa Alda', patronage: 'sanación y partos' },
      { id: 'san_corvus', label: 'San Corvus', patronage: 'soldados y heridos' },
      { id: 'santa_ilse', label: 'Santa Ilse', patronage: 'hogar y familia' },
      { id: 'san_bran', label: 'San Bran', patronage: 'herreros y máquinas' },
      { id: 'santa_nerea', label: 'Santa Nerea', patronage: 'marineros y ahogados' },
      { id: 'san_ogmar', label: 'San Ogmar', patronage: 'mineros y derrumbes' },
      { id: 'santa_vesna', label: 'Santa Vesna', patronage: 'cosechas y montañas' }
    ],
    practices: ['oración antes del trabajo', 'ayuno de invierno', 'peregrinación al santuario', 'confesión', 'limosna', 'bendición de herramientas'],
    superstitions: ['no silbar en la mina', 'pan en el umbral', 'sal sobre el hombro', 'no nombrar a los muertos tras el sol'],
    // Valores que modulan emoción y decisión
    values: { family: 0.7, labor: 0.65, charity: 0.55, obedience: 0.5, vengeance: 0.25 }
  };

  /* ---------------------------- PROFESIONES ---------------------------- */
  /* education: 0..1, knowledge: niveles base por dominio, skills: nivel base */
  C.professions = {
    mecanico_ferroviario: {
      label: 'mecánico ferroviario',
      roleProfile: 'mecanico',
      education: 0.6,
      income: 140,
      knowledge: { mecanico: 0.72, ferroviario: 0.66, comercial: 0.2, geografico: 0.3, cientifico: 0.32 },
      skills: { mecanica: 0.66, ferrocarriles: 0.6, mantenimiento: 0.5, soldadura: 0.35 },
      focusTags: ['motor', 'vibracion', 'herramienta', 'ruido_metalico', 'via', 'locomotora'],
      equipment: ['llave inglesa', 'martillo', 'linterna de carburo', 'mono de trabajo'],
      wear: 0.35,
      workPlace: 'taller',
      schedule: { start: 6.5, end: 18, rest: 12 }
    },
    soldado: {
      label: 'soldado de infantería',
      roleProfile: 'fusilero',
      education: 0.4,
      income: 90,
      knowledge: { militar: 0.62, geografico: 0.35, politico: 0.22, religioso: 0.3 },
      skills: { fusil: 0.55, disciplina: 0.55, cobertura: 0.45, orientacion: 0.4 },
      focusTags: ['arma', 'movimiento', 'cobertura', 'uniforme', 'humo'],
      equipment: ['fusil', 'bayoneta', 'mochila', 'cantimplora'],
      wear: 0.5,
      workPlace: 'cuartel',
      schedule: { start: 5.5, end: 20, rest: 13 }
    },
    oficial: {
      label: 'oficial',
      roleProfile: 'oficial',
      education: 0.8,
      income: 260,
      knowledge: { militar: 0.82, politico: 0.56, geografico: 0.6, cientifico: 0.3, religioso: 0.4 },
      skills: { mando: 0.7, tactica: 0.66, fusil: 0.4, oratoria: 0.55 },
      focusTags: ['posicion', 'comunicacion', 'subordinado', 'terreno', 'arma'],
      equipment: ['pistola', 'prismáticos', 'mapa', 'silbato'],
      wear: 0.3,
      workPlace: 'cuartel',
      schedule: { start: 5.5, end: 21, rest: 13 }
    },
    medico: {
      label: 'médico',
      roleProfile: 'medico',
      education: 0.92,
      income: 300,
      knowledge: { medico: 0.88, cientifico: 0.62, religioso: 0.35, naturalista: 0.4, comercial: 0.1 },
      skills: { medicina: 0.8, cirugia: 0.6, diagnostico: 0.72, vendaje: 0.75 },
      focusTags: ['herido', 'sangre', 'sintoma', 'camilla', 'medicamento'],
      equipment: ['maletín de cirugía', 'morfina', 'vendas', 'estetoscopio'],
      wear: 0.15,
      workPlace: 'hospital',
      schedule: { start: 7, end: 20, rest: 12 }
    },
    comerciante: {
      label: 'comerciante',
      roleProfile: 'comerciante',
      education: 0.62,
      income: 210,
      knowledge: { comercial: 0.8, politico: 0.4, geografico: 0.45, artistico: 0.25, religioso: 0.3 },
      skills: { comercio: 0.78, regateo: 0.7, contabilidad: 0.55, idiomas: 0.4 },
      focusTags: ['mercancia', 'cliente', 'moneda', 'competencia', 'riesgo'],
      equipment: ['libro de cuentas', 'balanza', 'caja de caudales'],
      wear: 0.1,
      workPlace: 'mercado',
      schedule: { start: 7, end: 19, rest: 12 }
    },
    cazador: {
      label: 'cazador',
      roleProfile: 'cazador',
      education: 0.3,
      income: 70,
      knowledge: { naturalista: 0.78, geografico: 0.62, agricola: 0.25, militar: 0.2 },
      skills: { rastreo: 0.8, tiro: 0.6, sigilo: 0.72, despiece: 0.65 },
      focusTags: ['huella', 'olor', 'fauna', 'viento', 'rama'],
      equipment: ['rifle de caza', 'cuchillo', 'trampas', 'pieles'],
      wear: 0.55,
      workPlace: 'bosque',
      schedule: { start: 4.5, end: 19, rest: 12 }
    },
    campesino: {
      label: 'campesino',
      roleProfile: 'campesino',
      education: 0.22,
      income: 55,
      knowledge: { agricola: 0.75, naturalista: 0.5, comercial: 0.2, geografico: 0.55, religioso: 0.3 },
      skills: { labranza: 0.72, ganaderia: 0.55, mantenimiento: 0.35 },
      focusTags: ['clima', 'tierra', 'cosecha', 'animal', 'herramienta'],
      equipment: ['azada', 'hoc', 'carro'],
      wear: 0.45,
      workPlace: 'campo',
      schedule: { start: 5, end: 20, rest: 13 }
    },
    sacerdote: {
      label: 'sacerdote del Hacedor',
      roleProfile: 'sacerdote',
      education: 0.85,
      income: 120,
      knowledge: { religioso: 0.9, politico: 0.45, artistico: 0.4, historico: 0.5, medico: 0.15 },
      skills: { liturgia: 0.85, oratoria: 0.72, consejo: 0.6, escritura: 0.65 },
      focusTags: ['feligres', 'ritual', 'simbolo', 'pecado', 'procesion'],
      equipment: ['libro sagrado', 'óleo', 'rosario'],
      wear: 0.05,
      workPlace: 'templo',
      schedule: { start: 5, end: 20, rest: 11 }
    },
    ferroviario: {
      label: 'ferroviario',
      roleProfile: 'ferroviario',
      education: 0.45,
      income: 110,
      knowledge: { ferroviario: 0.7, mecanico: 0.4, geografico: 0.45, comercial: 0.2 },
      skills: { ferrocarriles: 0.72, senales: 0.68, puntualidad: 0.6 },
      focusTags: ['via', 'aguja', 'senal', 'horario', 'locomotora'],
      equipment: ['banderín', 'reloj de bolsillo', 'silbato'],
      wear: 0.3,
      workPlace: 'estacion',
      schedule: { start: 4, end: 20, rest: 14 }
    },
    nino: {
      label: 'niño',
      roleProfile: 'nino',
      education: 0.35,
      income: 0,
      knowledge: { religioso: 0.2, geografico: 0.15, agricola: 0.1 },
      skills: { juego: 0.4, observacion: 0.3 },
      focusTags: ['juego', 'adulto', 'curiosidad', 'animal', 'dulce'],
      equipment: [],
      wear: 0,
      workPlace: 'escuela',
      schedule: { start: 8, end: 17, rest: 12 }
    },
    artesano: {
      label: 'artesano',
      roleProfile: 'artesano',
      education: 0.5,
      income: 130,
      knowledge: { artesanal: 0.8, artistico: 0.55, comercial: 0.35, mecanico: 0.3 },
      skills: { artesania: 0.78, materiales: 0.7, comercio: 0.3 },
      focusTags: ['material', 'textura', 'medida', 'herramienta'],
      equipment: ['formón', 'martillo', 'delantal de cuero'],
      wear: 0.4,
      workPlace: 'taller',
      schedule: { start: 7, end: 19, rest: 12 }
    },
    profesor: {
      label: 'maestro de escuela',
      roleProfile: 'profesor',
      education: 0.88,
      income: 160,
      knowledge: { cientifico: 0.55, politico: 0.4, artistico: 0.5, religioso: 0.35, geografico: 0.5 },
      skills: { ensenanza: 0.75, escritura: 0.7, oratoria: 0.6 },
      focusTags: ['alumno', 'libro', 'error', 'pregunta'],
      equipment: ['libros', 'tiza', 'mapa'],
      wear: 0.05,
      workPlace: 'escuela',
      schedule: { start: 7.5, end: 17, rest: 12 }
    },
    marinero: {
      label: 'marinero',
      roleProfile: 'marinero',
      education: 0.35,
      income: 85,
      knowledge: { naturalista: 0.55, geografico: 0.6, mecanico: 0.3, comercial: 0.25 },
      skills: { navegacion: 0.7, nudos: 0.7, cuerdas: 0.6, natacion: 0.7 },
      focusTags: ['agua', 'viento', 'nube', 'cuerda'],
      equipment: ['cuchillo de mar', 'soga', 'impermeable'],
      wear: 0.45,
      workPlace: 'puerto',
      schedule: { start: 5, end: 21, rest: 8 }
    },
    piloto: {
      label: 'piloto',
      roleProfile: 'piloto',
      education: 0.75,
      income: 280,
      knowledge: { mecanico: 0.5, cientifico: 0.45, geografico: 0.65, militar: 0.4 },
      skills: { pilotaje: 0.72, navegacion: 0.6, mecanica: 0.45 },
      focusTags: ['cielo', 'motor', 'viento', 'aeronave'],
      equipment: ['gafas de vuelo', 'mapa', 'brújula'],
      wear: 0.15,
      workPlace: 'aerodromo',
      schedule: { start: 6, end: 19, rest: 12 }
    },
    minero: {
      label: 'minero',
      roleProfile: 'campesino',
      education: 0.25,
      income: 95,
      knowledge: { mecanico: 0.4, geografico: 0.5, naturalista: 0.35 },
      skills: { picado: 0.7, entibado: 0.6, seguridad: 0.5 },
      focusTags: ['vibracion', 'veta', 'derrumbe', 'herramienta'],
      equipment: ['pico', 'lámpara de mina', 'casco'],
      wear: 0.7,
      workPlace: 'mina',
      schedule: { start: 5, end: 18, rest: 13 }
    },
    tabernero: {
      label: 'tabernero',
      roleProfile: 'comerciante',
      education: 0.45,
      income: 150,
      knowledge: { comercial: 0.6, politico: 0.35, religioso: 0.25 },
      skills: { hosteleria: 0.75, escucha: 0.7, regateo: 0.5 },
      focusTags: ['cliente', 'moneda', 'rumor', 'mercancia'],
      equipment: ['trapo', 'jarras', 'porra'],
      wear: 0.15,
      workPlace: 'posada',
      schedule: { start: 10, end: 24, rest: 14 }
    }
  };

  // Identidad estable de cada profesión (las claves son los ids)
  for (const k of Object.keys(C.professions)) C.professions[k].id = k;
  for (const k of Object.keys(C.ethnicities)) C.ethnicities[k].id = k;
  for (const k of Object.keys(C.factions)) C.factions[k].id = k;

  /* ---------------------------- IDIOMAS ---------------------------- */
  C.languages = {
    eisenmarkiano: { label: 'eisenmarkiano', faction: 'alianza_eisenmark' },
    volskano: { label: 'volskano', faction: 'alianza_eisenmark' },
    argentano: { label: 'argentano', faction: 'alianza_eisenmark' },
    genovar: { label: 'genovar', faction: 'alianza_eisenmark' },
    praguense: { label: 'praguense', faction: 'coalicion_praga' },
    veyrnes: { label: 'veyrnés', faction: 'coalicion_praga' },
    zheng: { label: 'zheng', faction: 'coalicion_praga' },
    ormiano: { label: 'ormiano', faction: 'orm' },
    namari: { label: 'namarí', faction: 'namar' },
    vardenio: { label: 'vardenio', faction: 'vardenia' },
    eirhames: { label: 'eirhamés', faction: 'eirhama' },
    durnes: { label: 'durnés', faction: 'durn' }
  };

  /* ---------------------------- CONOCIMIENTO ---------------------------- */
  C.buildKnowledge = function (rng, spec, profession, education) {
    const domains = {};
    for (const d of C.DOMAINS) domains[d] = 0.05;
    const base = profession.knowledge || {};
    for (const d of Object.keys(base)) {
      domains[d] = U.clamp(base[d] * (0.72 + 0.28 * education) + rng.gauss(0, 0.05), 0.03, 0.98);
    }
    domains.geografico = U.clamp((domains.geografico || 0.1) + (spec.geographicKnowledge || 0), 0.02, 0.98);
    if (spec.conditions && spec.conditions.illiterate) domains.artistico = U.clamp(domains.artistico - 0.1, 0.02, 1);
    return {
      domains: domains,
      facts: C.knowledgeFacts(rng, profession, domains),
      education: education,
      literacy: rng.chance(0.35 + education * 0.6) && !(spec.conditions && spec.conditions.illiterate)
    };
  };

  C.knowledgeFacts = function (rng, profession, domains) {
    const pool = {
      mecanico: [
        ['motor de vapor', 'La presión se regula con la válvula de admisión; un silbido agudo indica fuga.'],
        ['biela', 'Una biela desgastada golpea con ritmo irregular y calienta el cojinete.'],
        ['freno de vacío', 'Si la presión cae por debajo de 4 atmósferas, los frenos no retienen el tren.']
      ],
      ferroviario: [
        ['aguja', 'Una aguja mal engrasada puede desviar el tren; hay que comprobarla a mano.'],
        ['horario', 'El correo de las 6:20 no espera ni a los heridos.'],
        ['señal', 'La señal roja significa vía ocupada, aunque el jefe de estación diga otra cosa.']
      ],
      militar: [
        ['trinchera', 'Asomar la cabeza dos veces por el mismo sitio atrae al tirador.'],
        ['ametralladora', 'Una MG bien emplazada cubre un sector de cien metros.'],
        ['munición', 'Sin munición, un fusil es un palo caro.']
      ],
      medico: [
        ['hemorragia', 'Presión directa y vendaje; el torniquete es el último recurso.'],
        ['infección', 'Una herida con pus y fiebre mata más despacio que la bala, pero mata.'],
        ['shock', 'Piel fría y pulso rápido: sangrado interno o shock.']
      ],
      comercial: [
        ['precio del grano', 'En invierno el grano sube; en cosecha, baja.'],
        ['crédito', 'Un cliente que paga tarde una vez pagará tarde siempre.']
      ],
      religioso: [
        ['san_corvus', 'San Corvus intercede por los soldados heridos; se le reza antes del combate.'],
        ['ayuno', 'El ayuno de invierno dura nueve días y no admite carne ni leche.']
      ],
      agricola: [
        ['helada', 'Si el viento baja del norte en la segunda luna, habrá helada.'],
        ['siembra', 'La cebada se siembra tras la primera luna de primavera.']
      ],
      naturalista: [
        ['huella de ciervo', 'Pezuñas abiertas y paso largo: ciervo macho, hace menos de una hora.'],
        ['pantano', 'El agua quieta y verdosa esconde pozos de fango.']
      ],
      cientifico: [
        ['electricidad', 'La corriente continua de una dinamo basta para el telégrafo, no para una fábrica.'],
        ['radio', 'La radio analógica depende de la ionosfera: de noche alcanza más lejos.']
      ],
      geografico: [
        ['cordillera', 'En la cordillera el aire enrarece a partir de los 2.500 metros.'],
        ['frontera', 'El paso de Orvek está cerrado desde la guerra, salvo para el tren militar.']
      ],
      politico: [
        ['volskaya', 'Volskaya vive de la frontera: el ejército es el mayor empleador.'],
        ['praga', 'La Coalición de Praga depende del carbón de Zheng-Hua.']
      ],
      artesanal: [
        ['madera', 'La madera verde se dobla; la seca se parte.'],
        ['cuero', 'El cuero hay que curtirlo antes de coserlo, o se pudre.']
      ],
      artistico: [
        ['icono', 'Un icono se escribe, no se pinta: cada color tiene su orden.']
      ]
    };
    const facts = [];
    for (const domain of Object.keys(pool)) {
      const level = domains[domain] || 0;
      if (level < 0.35) continue;
      for (const [topic, content] of pool[domain]) {
        if (rng.chance(level * 0.9)) facts.push({ topic: topic, content: content, confidence: U.clamp(level * 0.9 + rng.range(-0.1, 0.05), 0.2, 0.98), domain: domain });
      }
    }
    return facts;
  };

  /* ---------------------------- NOMBRES ---------------------------- */
  C.nameFor = function (rng, ethnicityId, sex) {
    const eth = C.ethnicities[ethnicityId] || C.ethnicities.riberena_borgnon;
    const given = (eth.names[sex === 'female' ? 'female' : 'male'] || eth.names.male).slice();
    const family = eth.names.family;
    return rng.pick(given) + ' ' + rng.pick(family);
  };

  /* ---------------------------- RELIGIOSIDAD ---------------------------- */
  C.buildFaith = function (rng, spec, ethnicity, personality) {
    const branch = spec.branch || ethnicity.branch || 'apostolica';
    const base = C.religion.branches[branch] ? 0.45 : 0.4;
    let devotion = U.clamp(base + rng.range(-0.25, 0.35) + (personality ? personality.get('discipline') * 0.2 : 0), 0.03, 1);
    if (spec.devotion !== undefined) devotion = U.clamp(spec.devotion, 0, 1);
    const saint = rng.pick(C.religion.saints);
    const doubts = rng.chance(0.35) ? rng.range(0.1, 0.6) : rng.range(0, 0.2);
    return {
      id: C.religion.id,
      label: C.religion.label,
      branch: branch,
      devotion: U.round(devotion, 2),
      doubts: U.round(doubts, 2),
      patron: saint.id,
      patronLabel: saint.label,
      patronPatronage: saint.patronage,
      practices: C.religion.practices.slice(0, 1 + Math.floor(devotion * 3)),
      superstition: C.religion.superstitions.slice(0, 1 + Math.floor(rng.range(0, 3))),
      interpretation: rng.pick(['literal', 'tradicional', 'personal', 'comunitaria', 'dubitativa']),
      tension: rng.chance(0.2) ? 'discrepa de su iglesia en un punto' : null
    };
  };

  /* ---------------------------- RED SOCIAL ---------------------------- */
  C.buildSocial = function (rng, spec, ethnicity, profession) {
    const family = [];
    const nFamily = spec.role === 'nino' ? 2 : 1 + Math.floor(rng.range(0, 3));
    const roles = ['madre', 'padre', 'hermano', 'hermana', 'hijo', 'hija', 'esposa', 'esposo', 'tío', 'prima'];
    for (let i = 0; i < nFamily; i++) {
      family.push({
        id: U.uid('rel'),
        name: C.nameFor(rng, spec.ethnicity, rng.chance(0.5) ? 'female' : 'male'),
        relation: roles[i % roles.length],
        alive: rng.chance(0.86),
        closeness: U.round(rng.range(0.4, 0.95), 2),
        dependency: U.round(rng.range(0.1, 0.9), 2),
        notes: rng.chance(0.2) ? 'vive lejos' : ''
      });
    }
    const friends = [];
    for (let i = 0; i < Math.floor(rng.range(0, 3)); i++) {
      friends.push({ id: U.uid('rel'), name: C.nameFor(rng, spec.ethnicity, rng.chance(0.5) ? 'female' : 'male'), trust: U.round(rng.range(0.4, 0.9), 2), shared: rng.pick(['trabajo', 'iglesia', 'taberna', 'regimiento', 'infancia']) });
    }
    const rivals = [];
    if (rng.chance(0.4)) {
      rivals.push({ id: U.uid('rel'), name: C.nameFor(rng, spec.ethnicity, rng.chance(0.5) ? 'female' : 'male'), cause: rng.pick(['deuda', 'rencor de guerra', 'competencia', 'asunto de familia']), intensity: U.round(rng.range(0.3, 0.9), 2) });
    }
    return {
      family: family,
      friends: friends,
      rivals: rivals,
      reputation: U.round(U.clamp(0.5 + rng.gauss(0, 0.12), 0.1, 0.95), 2),
      status: U.round(U.clamp(profession.education * 0.5 + rng.range(0, 0.4), 0.05, 0.95), 2),
      militaryRecord: spec.background && /guerra|regimiento|veterano|frente/i.test(spec.background) ? { served: true, unit: rng.chance(0.5) ? '12.º Regimiento de Infantería' : '4.º Regimiento de Cazadores', war: 'Guerra de Orvek', year: 1921 } : null
    };
  };

  /* Preferencias de idioma: materno + aprendidos según educación y migración. */
  C.buildLanguages = function (rng, spec, ethnicity, education) {
    const maternal = spec.language || ethnicity.language || 'eisenmarkiano';
    const langs = [{ id: maternal, level: 1 }];
    const n = Math.floor(education * 2.4 + rng.range(0, 1.2));
    const pool = Object.keys(C.languages).filter((l) => l !== maternal);
    for (let i = 0; i < n; i++) {
      const l = rng.pick(pool);
      if (langs.some((x) => x.id === l)) continue;
      langs.push({ id: l, level: U.round(rng.range(0.25, 0.8) * education, 2) });
    }
    return langs;
  };

  C.ethnicityOf = function (id) {
    return C.ethnicities[id] || C.ethnicities.riberena_borgnon;
  };
  C.professionOf = function (id) {
    return C.professions[id] || C.professions.campesino;
  };
  C.factionOf = function (id) {
    return C.factions[id] || null;
  };
})(typeof window !== 'undefined' ? window : globalThis);
