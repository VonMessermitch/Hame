#!/usr/bin/env node
'use strict';
/* =========================================================================
   tests/engine_tests.js — pruebas del motor cognitivo sin navegador.
   Ejecutar: node tests/engine_tests.js
   ========================================================================= */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const FILES = [
  'ai/core/util.js',
  'ai/biology/species.js',
  'ai/biology/anatomy.js',
  'ai/biology/senses.js',
  'ai/cognition/memory.js',
  'ai/cognition/emotion.js',
  'ai/cognition/perception.js',
  'ai/personality/personality.js',
  'ai/culture/culture.js',
  'ai/environment/astronomy.js',
  'ai/environment/climate.js',
  'ai/planning/needs_goals.js',
  'ai/planning/goap.js',
  'ai/cognition/reasoning.js',
  'ai/simulation/combat.js',
  'ai/core/brain.js',
  'ai/simulation/world.js',
  'ai/interfaces/factory.js'
];

for (const f of FILES) {
  const code = fs.readFileSync(path.join(ROOT, f), 'utf8');
  vm.runInThisContext(code, { filename: f });
}
global.AETH = globalThis.AETH;
const AETH = globalThis.AETH;
const U = AETH.util;

let passed = 0;
let failed = 0;
const failures = [];
function test(name, fn) {
  try {
    const r = fn();
    if (r === false) throw new Error('devolvió false');
    passed++;
    console.log('  ✓ ' + name);
  } catch (e) {
    failed++;
    failures.push(name + ': ' + e.message);
    console.log('  ✗ ' + name + ' — ' + e.message);
  }
}
function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'aserción fallida');
}
function approx(a, b, eps, msg) {
  assert(Math.abs(a - b) <= (eps || 0.01), msg || a + ' ≉ ' + b);
}
function finiteNumbers(obj, pathStr) {
  pathStr = pathStr || '';
  if (typeof obj === 'number') assert(isFinite(obj), 'NaN/Infinity en ' + pathStr);
  else if (Array.isArray(obj)) obj.forEach((v, i) => finiteNumbers(v, pathStr + '[' + i + ']'));
  else if (obj && typeof obj === 'object') for (const k of Object.keys(obj)) finiteNumbers(obj[k], pathStr + '.' + k);
}

const stubWorld = AETH.brain.NULL_WORLD;

console.log('\n== Aethrion cognitive engine · pruebas ==\n');

/* 1. Genética determinista y cuatro componentes */
test('genoma determinista y cuatro componentes', () => {
  const rng = new U.RNG(4242);
  const g1 = AETH.species.generateGenome(rng, {});
  const g2 = AETH.species.generateGenome(new U.RNG(4242), {});
  assert(JSON.stringify(g1.genes) === JSON.stringify(g2.genes), 'el genoma no es determinista');
  const p = AETH.species.express(g1, { age: 34, sex: 'female' });
  for (const c of ['dunedain', 'rhun', 'elfblood', 'dwarf']) {
    assert(p.components[c] > 0, 'componente ' + c + ' ausente');
  }
  assert(p.heightCm > 120 && p.heightCm < 220, 'altura irreal: ' + p.heightCm);
  assert(p.senses.visionAcuity > 0 && p.cognition.workingMemorySlots >= 2);
});

/* 2. Lesión de rodilla limita la movilidad */
test('lesión de rodilla reduce movilidad y aumenta dolor', () => {
  const sano = AETH.NPCFactory.create({ profession: 'soldado', age: 30, conditions: {} }, { rng: new U.RNG(1) });
  const cojo = AETH.NPCFactory.create({ profession: 'soldado', age: 30, conditions: { kneeInjury: true } }, { rng: new U.RNG(2) });
  const ms = AETH.anatomy.mobility(sano.body);
  const mc = AETH.anatomy.mobility(cojo.body);
  assert(mc < ms, 'la rodilla lesionada no reduce la movilidad (' + mc + ' vs ' + ms + ')');
  assert(AETH.anatomy.totalPain(cojo.body) > AETH.anatomy.totalPain(sano.body), 'no hay dolor asociado');
  assert(cojo.physiology.cognitiveModifiers().speedMul < sano.physiology.cognitiveModifiers().speedMul, 'la velocidad no baja');
});

/* 3. Fisiología: fatiga, estrés y sueño */
test('fisiología responde a esfuerzo y sueño', () => {
  const b = AETH.NPCFactory.create({ profession: 'campesino', age: 28 }, { rng: new U.RNG(3) });
  const f0 = b.physiology.state.fatigue;
  b.physiology.update(6 * 3600, { temperatureC: 34, humidity: 0.8, exertion: 0.9, sleepDebt: 0 });
  assert(b.physiology.state.fatigue > f0 + 0.2, 'la fatiga no sube con el esfuerzo');
  const hr = b.physiology.state.heartRate;
  assert(hr > 70, 'el pulso no responde al esfuerzo: ' + hr);
  b.physiology.sleepRestore(8);
  b.physiology.update(7 * 3600, { temperatureC: 15, exertion: 0, asleep: true });
  assert(b.physiology.state.fatigue < 0.6, 'dormir no recupera: ' + b.physiology.state.fatigue);
  const m = b.physiology.cognitiveModifiers();
  assert(m.reactionTimeMs > 150 && m.workingMemorySlots >= 2, 'modificadores cognitivos inválidos');
});

/* 4. Visión: oscuridad y campo visual */
test('la visión depende de luz, distancia y campo visual', () => {
  const b = AETH.NPCFactory.create({ profession: 'centinela', age: 25 }, { rng: new U.RNG(4) });
  const obs = { x: 0, z: 0, facing: 0 };
  const target = { x: 0, z: 20, size: 0.6, moving: true, contrast: 0.8 };
  const day = AETH.senses.vision(b.organs, obs, target, { light: 0.9, weather: {} });
  const night = AETH.senses.vision(b.organs, obs, target, { light: 0.05, weather: { fog: 0.6 } });
  assert(day.visible && day.confidence > night.confidence, 'la oscuridad no reduce la percepción');
  const behind = AETH.senses.vision(b.organs, obs, { x: 0, z: -20, size: 0.6 }, { light: 0.9, weather: {} });
  assert(behind.visible === false, 've detrás de la cabeza');
});

/* 5. Memoria: codificación, olvido, distorsión y consolidación */
test('memoria episódica: recuerdo, olvido y consolidación', () => {
  const b = AETH.NPCFactory.create({ profession: 'soldado', age: 40 }, { rng: new U.RNG(5) });
  b.memory.encodeEpisode({ summary: 'amboscada en el camino de Orvek con barro y disparos', kind: 'guerra', importance: 0.9, valence: -0.9, intensity: 1, time: 0 });
  const found = b.memory.recall('emboscada Orvek barro', 3);
  assert(found.length > 0, 'no recupera un recuerdo relevante');
  const before = b.memory.episodic.length;
  for (let i = 0; i < 400; i++) b.memory.encodeEpisode({ summary: 'rutina ' + i + ' en la estación', kind: 'rutina', importance: 0.05, valence: 0, time: i });
  assert(b.memory.episodic.length <= b.memory.episodicCap, 'la memoria crece sin límite');
  assert(b.memory.episodic.length < before + 400, 'no olvida nada');
  b.memory.update(400, b.personality);
  const cons = b.memory.consolidate(8);
  assert(cons.consolidated > 0, 'no consolida');
  assert(b.memory.semantic['fe del hacedor'] || Object.keys(b.memory.semantic).length, 'sin memoria semántica');
});

/* 6. Emoción y personalidad */
test('emociones modulan y personalidad se mantiene coherente', () => {
  const b = AETH.NPCFactory.create({ profession: 'soldado', age: 30, personality: ['valiente', 'prudente'] }, { rng: new U.RNG(6) });
  const fear0 = b.emotions.get('miedo');
  b.emotions.appraise({ type: 'amenaza', intensity: 0.9 });
  assert(b.emotions.get('miedo') > fear0, 'la amenaza no produce miedo');
  assert(b.emotions.modifiers().riskTolerance < 1, 'el miedo no reduce la tolerancia al riesgo');
  const before = b.personality.get('confidence');
  b.personality.drift({ type: 'exito', intensity: 1, time: 0 });
  assert(b.personality.get('confidence') >= before, 'la deriva no es coherente');
  assert(b.personality.contradictions !== undefined, 'sin contradicciones modeladas');
});

/* 7. GOAP: plan encadenado para comer */
test('GOAP planifica trabajar → cobrar → comprar → comer', () => {
  const b = AETH.NPCFactory.create({ profession: 'mecanico_ferroviario', age: 47, conditions: {} }, { rng: new U.RNG(7) });
  b.economy.employment = true;
  b.economy.money = 0;
  b.inventory = [];
  const planner = new AETH.goap.Planner();
  const facts = AETH.goap.factsFor(b);
  const res = planner.plan(facts, ['alimentado'], b, { maxDepth: 6 });
  assert(res.ok, 'no encontró plan: ' + res.reason);
  const ids = res.plan.map((a) => a.id);
  assert(ids.indexOf('trabajar') >= 0, 'falta trabajar en el plan: ' + ids.join(','));
  assert(ids[ids.length - 1] === 'comer', 'el plan no termina comiendo: ' + ids.join(','));
});

/* 8. Plan imposible reconocido */
test('reconoce un objetivo imposible en vez de fingir', () => {
  const b = AETH.NPCFactory.create({ profession: 'nino', age: 9 }, { rng: new U.RNG(8) });
  b.inventory = [];
  b.economy.money = 0;
  const planner = new AETH.goap.Planner();
  const res = planner.plan(AETH.goap.factsFor(b), ['alimentado'], b);
  assert(typeof res.ok === 'boolean', 'sin resultado');
  assert(!res.ok ? res.reason && res.reason.length > 0 : true, 'sin explicación del fallo');
  const impossible = planner.plan(new Set(), ['condicion_inexistente'], b, { maxNodes: 200 });
  assert(!impossible.ok, 'declara posible lo imposible');
  assert(impossible.reason.indexOf('no') >= 0, 'sin razón');
});

/* 9. Descripción → individuo */
test('createFromDescription: veterano mecánico de Volskaya', () => {
  const b = AETH.NPCFactory.createFromDescription(
    'Genera un veterano de Volskaya de 47 años, originario de una región montañosa, antiguo soldado del 12.º Regimiento de Infantería, actualmente mecánico ferroviario en Borgñon. Es desconfiado, religioso, tiene problemas en una rodilla, perdió a su hermano durante la Guerra de Orvek y necesita dinero para mantener a su familia.'
  );
  assert(b.identity.age === 47, 'edad mal parseada: ' + b.identity.age);
  assert(b.identity.profession === 'mecanico_ferroviario', 'oficio mal parseado: ' + b.identity.profession);
  assert(b.identity.ethnicity === 'montanesa_volskaya', 'etnia mal parseada: ' + b.identity.ethnicity);
  assert(b.body.joints.kneeR.integrity < 0.8, 'no aplicó la lesión de rodilla');
  assert(b.identity.vengeance === true, 'no infirió el móvil de venganza');
  assert(b.memory.recall('hermano Orvek', 3).length > 0 || b.memory.episodic.some((e) => /hermano/i.test(e.summary)), 'sin memoria del hermano');
  assert(b.goals.list.some((g) => /familia|dinero/i.test(g.label)), 'sin objetivos personales');
  assert(b.personality.get('prudence') > 0.4, 'personalidad no refleja desconfianza');
});

/* 10. Descripción médica de Namar */
test('createFromDescription: anciana médica de Namar', () => {
  const b = AETH.NPCFactory.createFromDescription('Anciana médica de Namar, religiosa, viuda, experta en medicina tradicional y desconfiada de los militares.');
  assert(b.identity.sex === 'female', 'sexo incorrecto');
  assert(b.identity.profession === 'medico', 'oficio incorrecto: ' + b.identity.profession);
  assert(b.identity.ethnicity === 'namari_pantanosa', 'etnia incorrecta: ' + b.identity.ethnicity);
  assert(b.identity.age >= 60, 'no infirió la edad');
  assert(b.culture.faith.devotion > 0.5, 'religiosidad no aplicada');
  assert(b.emotions !== undefined && b.needs !== undefined);
});

/* 11. Variedad individual */
test('100 NPC comparten oficio/edad/región pero no son clones', () => {
  const traits = new Set();
  for (let i = 0; i < 100; i++) {
    const b = AETH.NPCFactory.create({ profession: 'soldado', age: 24, ethnicity: 'montanesa_volskaya', residence: 'borgnon' }, { rng: new U.RNG(1000 + i) });
    traits.add([b.personality.get('aggression'), b.personality.get('empathy'), b.phenotype.heightCm, b.memory.skill('fusil'), b.culture.faith.devotion].map((v) => U.round(v, 1)).join('|'));
  }
  assert(traits.size > 20, 'demasiada poca diversidad: ' + traits.size);
});

/* 12. Simulación autónoma de 3 días */
test('simulación autónoma: 40 NPC durante 3 días sin NaN', () => {
  const w = AETH.world.createBorgnonWorld({ timeScale: 3600, seed: 99 });
  for (let i = 0; i < 40; i++) {
    w.spawn({ profession: i % 2 ? 'soldado' : 'campesino', age: 20 + (i % 40), ethnicity: 'riberena_borgnon' });
  }
  for (let s = 0; s < 120; s++) w.update(1, { x: 0, z: 0 });
  const alive = w.brains.filter((b) => b.alive !== false);
  assert(alive.length > 0, 'todos muertos');
  const acted = alive.filter((b) => b.stats.actions > 0).length;
  assert(acted > alive.length * 0.25, 'casi nadie actuó: ' + acted + '/' + alive.length);
  const withGoals = alive.filter((b) => b.intent.goal).length;
  assert(withGoals > 0, 'nadie tiene objetivos');
  for (const b of alive) {
    finiteNumbers(b.physiology.state, b.identity.name + '.physiology');
    finiteNumbers(b.emotions.state, b.identity.name + '.emotions');
    finiteNumbers(b.needs.state, b.identity.name + '.needs');
    assert(b.position.x === b.position.x && b.position.z === b.position.z, 'posición NaN');
  }
  assert(w.clock.day > 1, 'el reloj no avanzó');
});

/* 13. Aprendizaje por experiencia */
test('aprende de la experiencia: Q-values y habilidades', () => {
  const b = AETH.NPCFactory.create({ profession: 'mecanico_ferroviario', age: 40 }, { rng: new U.RNG(13) });
  const skill0 = b.memory.skill('mecanica');
  const action = AETH.goap.BY_ID['trabajar'];
  for (let i = 0; i < 12; i++) b.onActionComplete(action, { success: true, quality: 0.9 }, stubWorld);
  assert(b.memory.skill('mecanica') > skill0, 'no mejora la habilidad con la práctica');
  assert(Object.keys(b.reasoner.q).length > 0, 'sin aprendizaje por refuerzo');
  const q = b.reasoner.qValue('trabajar', 'trabajo');
  assert(typeof q === 'number' && isFinite(q), 'Q inválido');
});

/* 14. Persistencia */
test('serialización y restauración conservan el individuo', () => {
  const b = AETH.NPCFactory.create({ profession: 'oficial', age: 44, conditions: { oldWound: true } }, { rng: new U.RNG(14) });
  b.emotions.appraise({ type: 'perdida', intensity: 0.8 });
  b.memory.encodeEpisode({ summary: 'perdió un subordinado en el paso de Orvek', kind: 'guerra', importance: 0.9, valence: -1, time: 100 });
  const data = b.save();
  const json = JSON.stringify(data);
  assert(json.length > 1000, 'serialización vacía');
  const b2 = AETH.NPCFactory.create({ profession: 'oficial', age: 44, id: b.id }, { rng: new U.RNG(15) });
  b2.load(JSON.parse(json));
  assert(b2.identity.name === b.identity.name, 'no conserva el nombre');
  assert(b2.memory.episodic.length === b.memory.episodic.length, 'no conserva la memoria');
  approx(b2.emotions.get('tristeza'), b.emotions.get('tristeza'), 0.01, 'no conserva emociones');
  finiteNumbers(b2.getState(stubWorld), 'estado restaurado');
});

/* 15. Combate: moral y cobertura */
test('combate: un herido con moral baja se repliega', () => {
  const b = AETH.NPCFactory.create({ profession: 'soldado', age: 22, militaryRole: 'fusilero', faction: 'alianza_eisenmark', nationality: 'volskaya', ethnicity: 'montanesa_volskaya', personality: ['nervioso'] }, { rng: new U.RNG(16) });
  b.physiology.state.pain = 0.9;
  b.physiology.state.fatigue = 0.9;
  b.emotions.appraise({ type: 'amenaza', intensity: 1 });
  b.tactics.morale = 0.15;
  const d = b.tactics.decide([{ kind: 'humanoid', id: 'enemy', distance: 30, tags: ['arma'], confidence: 0.9, entity: { faction: 'coalicion_praga' } }], { clock: { timeSeconds: 0 } });
  assert(d.action === 'huir' || d.action === 'replegarse_con_camaradas' || d.action === 'buscar_cobertura', 'no reacciona racionalmente: ' + d.action);
  assert(d.reason && d.reason.length > 3, 'sin razón táctica');
});

/* 16. LOD y presupuesto */
test('LOD asigna niveles y respeta el presupuesto de CPU', () => {
  const w = AETH.world.createBorgnonWorld({ seed: 7, budgetMs: 4 });
  for (let i = 0; i < 120; i++) w.spawn({ profession: 'campesino', age: 30 });
  const t0 = U.now();
  for (let i = 0; i < 30; i++) w.update(0.016, { x: 0, z: 0 });
  const ms = U.now() - t0;
  assert(w.lodCounts[1] <= 12, 'demasiados LOD1: ' + w.lodCounts[1]);
  assert(w.lodCounts[2] > 0 || w.lodCounts[3] > 0, 'no distribuye LOD');
  assert(ms < 3000, 'demasiado lento: ' + Math.round(ms) + ' ms para 30 frames');
  assert(w.brains[0].lod >= 1 && w.brains[0].lod <= 3);
});

/* 17. Eventos del mundo afectan a los individuos */
test('un bombardeo cambia emociones y memoria de los cercanos', () => {
  const w = AETH.world.createBorgnonWorld({ seed: 21 });
  const b = w.spawn({ profession: 'comerciante', age: 50 });
  w.clock.timeSeconds = 300;
  b.clockTime = 300;
  const fear0 = b.emotions.get('miedo');
  const mem0 = b.memory.episodic.length;
  w.injectEvent('bombardeo', { severity: 0.8 });
  assert(b.emotions.get('miedo') > fear0, 'el bombardeo no produce miedo');
  assert(b.memory.episodic.length > mem0, 'no codifica el acontecimiento');
  assert(w.events.length > 0, 'sin registro del evento');
});

/* 18. Estado completo del NPC */
test('getState devuelve el esquema completo sin NaN', () => {
  const b = AETH.NPCFactory.createFromDescription('Mecánico ferroviario de 47 años, desconfiado, con problemas de rodilla.');
  b.tick(60, stubWorld);
  const s = b.getState(stubWorld);
  for (const k of ['identity', 'biology', 'cognition', 'personality', 'culture', 'social', 'needs', 'goals', 'skills', 'equipment', 'health', 'environment', 'currentState', 'memory', 'history']) {
    assert(s[k] !== undefined, 'falta ' + k);
  }
  finiteNumbers(s, 'state');
  assert(s.cognition.attention.capacidad >= 2);
  assert(s.biology.physiology.pulso > 30 && s.biology.physiology.pulso < 220);
});

/* 19. Rendimiento de generación */
test('genera 300 individuos en menos de 3 s', () => {
  const t0 = U.now();
  const arr = [];
  for (let i = 0; i < 300; i++) arr.push(AETH.NPCFactory.create({ profession: 'campesino', age: 20 + (i % 50), ethnicity: 'riberena_borgnon' }, { rng: new U.RNG(5000 + i) }));
  const ms = U.now() - t0;
  assert(arr.length === 300, 'no generó todos');
  assert(ms < 3000, 'demasiado lento: ' + Math.round(ms) + ' ms');
  console.log('    · ' + Math.round(ms) + ' ms / 300 NPC (' + Math.round(ms / 300 * 100) / 100 + ' ms por individuo)');
});

/* 20. Astronomía y clima */
test('astronomía de Aethrion: 2 soles, 2 lunas, 410 días, 25 h', () => {
  const AST = AETH.astronomy;
  assert(AST.STARS.length === 2 && AST.MOONS.length === 2, 'estrellas o lunas incorrectas');
  assert(AST.MOONS[0].period / AST.MOONS[1].period === 2, 'la resonancia no es 2:1');
  assert(AST.YEAR_DAYS === 410 && AST.DAY_HOURS === 25 && AST.AXIAL_TILT === 23.5);
  const noon = AST.illumination(10, 13);
  const midnight = AST.illumination(10, 2);
  assert(noon.light > midnight.light, 'el mediodía no ilumina más que la noche');
  assert(noon.sun > 0.4, 'sin luz solar al mediodía');
  const w = AETH.climate.dayWeather('cordillera', 340, 3);
  assert(w.tempHighC < AETH.climate.dayWeather('namar', 340, 3).tempHighC, 'la cordillera no es más fría que Namar');
  const env = AETH.climate.environmentAt({ id: 'x', biome: 'orm' }, 10, 2);
  assert(env.light < 0.2, 'la noche no es oscura');
  assert(env.moons.length === 2, 'sin datos de las dos lunas');
});

console.log('\n----------------------------------------');
console.log('Resultado: ' + passed + ' correctas, ' + failed + ' fallidas');
if (failed) {
  console.log('\nFallos:');
  for (const f of failures) console.log(' - ' + f);
  process.exit(1);
}
console.log('Todas las pruebas pasaron.\n');
