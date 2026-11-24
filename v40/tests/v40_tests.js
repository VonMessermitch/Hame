/* =========================================================================
   v40/tests/v40_tests.js — pruebas del núcleo de la edición Aethrion v40.
   Se ejecutan sin navegador: cargan los módulos AETH y la capa v40 con vm.

   Uso: node v40/tests/v40_tests.js
   ========================================================================= */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..', '..');
const ORDER = [
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

const log = console.log;
console.log = () => {};
for (const rel of ORDER) {
  const code = fs.readFileSync(path.join(ROOT, 'iron-v1-demo', rel), 'utf8');
  vm.runInThisContext(code, { filename: rel });
}
vm.runInThisContext(fs.readFileSync(path.join(ROOT, 'v40', 'src', 'aethrion_v40.js'), 'utf8'), { filename: 'aethrion_v40.js' });
vm.runInThisContext(fs.readFileSync(path.join(ROOT, 'v40', 'src', 'aethrion_soldiers.js'), 'utf8'), { filename: 'aethrion_soldiers.js' });
console.log = log;

const AETH = globalThis.AETH;
const V = AETH.v40;

let pass = 0;
const results = [];
function ok(name, fn) {
  try {
    const extra = fn();
    pass++;
    results.push('  ✓ ' + name + (extra ? ' — ' + extra : ''));
  } catch (e) {
    results.push('  ✗ ' + name + ' — ' + e.message);
  }
}
function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}
function finiteNumbers(obj, where, depth) {
  depth = depth || 0;
  if (depth > 5) return;
  if (typeof obj === 'number') {
    assert(isFinite(obj), 'número no finito en ' + where);
    return;
  }
  if (!obj || typeof obj !== 'object') return;
  for (const k of Object.keys(obj)) finiteNumbers(obj[k], where + '.' + k, depth + 1);
}

/* ------------------------------------------------------------------ */
const t0 = Date.now();
const session = V.createSession({ population: 28, seed: 77192 });
// El planificador LOD reparte la CPU por presupuesto de tiempo real: en las
// pruebas se procesa toda la población en cada paso para que el resultado sea
// reproducible (en el juego se mantiene el presupuesto normal).
session.world.budgetMs = 1e9;

ok('1. El teatro reproduce los seis capítulos de la v39', () => {
  assert(V.SECTORS.length === 6, 'se esperaban 6 sectores');
  const w = session.world;
  for (const s of V.SECTORS) {
    const loc = w.locationById(s.id);
    assert(loc && loc.sector, 'falta el sector ' + s.id);
    assert(loc.owner === s.owner, 'propietario incorrecto en ' + s.id);
  }
  return V.SECTORS.map((s) => s.name).join(' · ');
});

ok('2. La población nace con cerebros completos y dos facciones', () => {
  const bs = session.world.brains;
  assert(bs.length === 28, 'población ' + bs.length);
  const ids = new Set(bs.map((b) => b.id));
  assert(ids.size === 28, 'ids duplicados');
  const fac = session.world.populationByFaction();
  assert(Object.keys(fac).length >= 2, 'una sola facción: ' + JSON.stringify(fac));
  for (const b of bs) {
    assert(b.identity && b.identity.name, 'sin identidad');
    assert(b.physiology && b.physiology.state, 'sin fisiología');
    assert(b.memory && Array.isArray(b.memory.episodic), 'sin memoria episódica');
    assert(b.personality && typeof b.personality.get === 'function', 'sin personalidad');
  }
  return Object.keys(fac).map((k) => k + ': ' + fac[k]).join(', ');
});

ok('3. Crear por descripción: veterano de Volskaya con rodilla y venganza', () => {
  const b = session.create(
    'Soldado veterano de Volskaya, 34 años, originario de una región montañosa, desconfiado, buen tirador, casado, religioso, con experiencia en artillería, miedo a los dragones y la rodilla lesionada'
  );
  assert(b.identity.age === 34, 'edad ' + b.identity.age);
  assert(/soldado/i.test(b.identity.profession), 'oficio ' + b.identity.profession);
  assert(b.identity.ethnicity === 'montanesa_volskaya', 'etnia ' + b.identity.ethnicity);
  assert(/rodilla|knee/i.test(JSON.stringify(b.body.injuries)), 'sin lesión de rodilla');
  assert(b.memory.skill('fusil') > 0.2, 'sin habilidad de fusil');
  assert(b.memory.episodic.length > 0, 'sin recuerdos iniciales');
  return b.identity.name + ' · ' + b.identity.profession + ' · ' + b.identity.ethnicity;
});

ok('4. Simulación de una hora sin NaN y con decisiones', () => {
  const w = session.world;
  for (let i = 0; i < 240; i++) session.step(0.25);
  const d = w.describe();
  assert(d.poblacion > 20, 'población ' + d.poblacion);
  assert(w.stats.actions > 0, 'sin acciones ejecutadas');
  assert(w.stats.updates > 0, 'sin actualizaciones');
  finiteNumbers(w.lodCounts, 'lod');
  finiteNumbers(w.clock.toJSON(), 'clock');
  for (const b of w.brains) {
    assert(isFinite(b.position.x) && isFinite(b.position.z), 'posición no finita en ' + b.identity.name);
    assert(isFinite(b.emotions.get('miedo')), 'miedo no finito en ' + b.identity.name);
  }
  return d.fecha + ' · ' + d.poblacion + ' vivos · ' + w.stats.actions + ' acciones · ' + w.dialogueFeed.length + ' diálogos';
});

ok('5. Acontecimiento de bombardeo: el miedo sube y se recuerda', () => {
  const w = session.world;
  const b = w.brains.find((x) => x.alive !== false);
  w.focus = { x: b.position.x, z: b.position.z };
  const before = b.emotions.get('miedo');
  w.injectEvent('bombardeo', { severity: 0.8 });
  const after = b.emotions.get('miedo');
  assert(after >= before, 'el miedo no subió (' + before + ' → ' + after + ')');
  const mem = b.memory.episodic.some((m) => /bombardeo/i.test(m.summary));
  assert(mem, 'no se registró el recuerdo');
  return 'miedo ' + before.toFixed(2) + ' → ' + after.toFixed(2);
});

ok('6. Guardar y cargar preserva el mundo y los recuerdos', () => {
  const before = session.world.brains.map((b) => b.identity.name).sort();
  const beforeCount = before.length;
  const episodeSample = session.world.brains[0].memory.episodic.length;
  const json = JSON.parse(JSON.stringify(session.save()));
  const s2 = V.createSession({ population: 1 });
  s2.load(json);
  const after = s2.world.brains.map((b) => b.identity.name).sort();
  assert(after.length === beforeCount, 'población ' + after.length + ' ≠ ' + beforeCount);
  assert(JSON.stringify(after) === JSON.stringify(before), 'nombres distintos tras cargar');
  assert(s2.world.brains[0].memory.episodic.length === episodeSample, 'memoria no restaurada');
  s2.step(0.25);
  assert(s2.world.stats.updates > 0, 'el mundo cargado no corre');
  return beforeCount + ' habitantes restaurados y simulación viva';
});

ok('7. Batalla por sectores: escuadras, capturas y bajas', () => {
  const bf = session.battle;
  bf.start();
  const owners0 = bf.sectors.map((s) => s.owner).join(',');
  for (let i = 0; i < 900; i++) bf.tick(1);
  const st = bf.status();
  assert(st.squads.length > 0, 'sin escuadras vivas');
  const owners1 = st.sectors.map((s) => s.owner).join(',');
  assert(owners0 !== owners1, 'ningún sector cambió de manos');
  const total = st.casualties.alianza_eisenmark + st.casualties.coalicion_praga;
  assert(total > 0, 'sin bajas registradas');
  finiteNumbers(st.sectors, 'sectores');
  for (const q of st.squads) {
    assert(isFinite(q.strength) && q.strength >= 0, 'fuerza inválida');
    assert(q.morale >= 0 && q.morale <= 1, 'moral fuera de rango');
  }
  return 't+' + st.time + ' s · ' + total + ' bajas · frente ' + owners1;
});

ok('8. Las bajas de la batalla llegan al cerebro (memoria y duelo)', () => {
  const w = session.world;
  const deaths = w.deaths.length;
  assert(deaths > 0, 'la batalla no mató a ningún cerebro');
  // El duelo queda en la memoria del testigo, viva o no: un sector puede
  // quedar arrasado y sus muertos conservan el recuerdo.
  const grief = w.brains.filter((b) => b.memory.episodic.some((m) => /vio morir|ha perdido/i.test(m.summary || '')));
  assert(grief.length > 0, 'nadie registró la muerte de un compañero');
  return deaths + ' muertes · ' + grief.length + ' cerebros con duelo';
});

ok('9. Determinismo de la batalla desde el mismo estado', () => {
  const snapshot = JSON.parse(JSON.stringify(session.save()));
  const run = () => {
    const s = V.createSession({ population: 1 });
    s.load(JSON.parse(JSON.stringify(snapshot)));
    s.battle = new V.Battlefield({ world: s.world, seed: 4242 });
    s.battle.start();
    for (let i = 0; i < 120; i++) s.battle.tick(1);
    return s.battle.status();
  };
  const a = run();
  const b = run();
  assert(JSON.stringify(a.sectors) === JSON.stringify(b.sectors), 'sectores divergentes');
  assert(JSON.stringify(a.casualties) === JSON.stringify(b.casualties), 'bajas divergentes');
  return 'dos ejecuciones idénticas desde el mismo guardado';
});

ok('10. Rendimiento del núcleo', () => {
  const s = V.createSession({ population: 60, seed: 5 });
  s.battle.start();
  const t = Date.now();
  for (let i = 0; i < 400; i++) s.step(0.05);
  const ms = Date.now() - t;
  const per = ms / 400;
  assert(per < 8, 'demasiado lento: ' + per.toFixed(2) + ' ms/paso');
  return '60 NPC · 400 pasos en ' + ms + ' ms (' + per.toFixed(2) + ' ms/paso)';
});

ok('11. La interfaz no se monta sin navegador y no rompe Node', () => {
  assert(typeof document === 'undefined', 'document existe en Node');
  assert(V._mounted === undefined, 'se montó el panel sin DOM');
  assert(typeof V.bootstrap === 'function', 'falta bootstrap');
  return 'capa headless correcta';
});

/* ====================== soldados con cerebro ====================== */
const S = V.soldiers;

ok('12. Cada soldado enganchado nace con un cerebro completo', () => {
  assert(S, 'falta la capa de soldados');
  const unit = { name: '', hp: 45, g: { position: { x: 12, z: 3 } } };
  const b = S.bind(unit, { side: 'enemy', level: 3, type: 'sol' });
  assert(b && b.brain, 'no se creó el cerebro');
  assert(unit.aeth === b.view, 'la unidad no expone su estado cognitivo');
  assert(unit.aethBrain === b.brain, 'la unidad no guarda su cerebro');
  assert(b.brain.identity.name === b.name, 'identidad incoherente');
  assert(b.brain.personality && b.brain.memory && b.brain.emotions, 'cerebro incompleto');
  assert(b.brain.memory.episodic.length > 0, 'sin memoria inicial');
  assert(b.level === 3 && b.side === 'enemy', 'nivel o bando incorrectos');
  return b.name + ' · ' + b.brain.identity.professionLabel + ' · nivel ' + b.level;
});

ok('13. El pulso cognitivo responde a la amenaza cercana', () => {
  globalThis.P = { g: { position: { x: 0, z: 0 } } };
  globalThis.enemies = [];
  globalThis.allies = [];
  globalThis.playing = true;
  globalThis.level = 2;
  const unit = { hp: 60, cd: 2, sp: 3, g: { position: { x: 3, z: 0 } } };
  const b = S.bind(unit, { side: 'enemy', level: 2, type: 'sol' });
  const before = b.fear;
  S.pulse(6);
  assert(b.fear > before, 'el miedo no subió ante una amenaza a 3 m (' + before + ' → ' + b.fear + ')');
  assert(b.fear >= 0 && b.fear <= 1, 'miedo fuera de rango');
  assert(typeof unit.aeth.fear === 'number', 'la unidad no recibe el miedo');
  return 'miedo ' + before.toFixed(2) + ' → ' + b.fear.toFixed(2) + ' con el jugador a 3 m';
});

ok('14. Las bajas cercanas contagian miedo a los compañeros', () => {
  const allies = [];
  for (let i = 0; i < 3; i++) {
    const u = { hp: 100, g: { position: { x: i * 4, z: 0 } } };
    allies.push(S.bind(u, { side: 'ally', level: 2, type: 'soldado' }));
  }
  globalThis.allies = allies.map((b) => b.unit);
  const before = allies.map((b) => b.fear);
  const touched = S.shock('ally', { x: 0, z: 0 }, 0.9);
  assert(touched >= 2, 'sólo ' + touched + ' compañeros reaccionaron');
  const after = allies.map((b) => b.fear);
  assert(after.some((f, i) => f > before[i]), 'ningún compañero registró miedo');
  return touched + ' compañeros afectados · miedo medio ' + (after.reduce((a, v) => a + v, 0) / after.length).toFixed(2);
});

ok('15. Los enganches de la v39 dan cerebro a la infantería y no a las bestias', () => {
  let killed = null;
  globalThis.spawnE = function (type, x, z) {
    return { type: type, hp: 45, max: 45, cd: 1, sp: 3.4, g: { position: { x: x, z: z } } };
  };
  globalThis.hurt = function (e, d) {
    e.hp -= d;
  };
  globalThis.kill = function (e) {
    killed = e;
  };
  globalThis.assignBots = function () {};
  globalThis.gar9 = function () {
    return [];
  };
  const installed = S.install();
  assert(installed.indexOf('spawnE') >= 0, 'spawnE no enganchado');
  assert(installed.indexOf('assignBots') >= 0, 'assignBots no enganchado');
  assert(installed.indexOf('hurt') >= 0 && installed.indexOf('kill') >= 0, 'daño/muerte sin enganchar');
  const soldier = spawnE('sol', 10, 10);
  const beast = spawnE('plaga', 10, 10);
  assert(soldier.aethBrain, 'el fusilero no recibió cerebro');
  assert(!beast.aethBrain, 'la plaga no debería recibir cerebro de infantería');
  hurt(soldier, 999);
  const b = soldier.__aethBinding;
  assert(!b.alive, 'la baja no se propagó al cerebro');
  assert(S.stats.deaths > 0, 'no se contabilizó la muerte');
  return 'infantería enganchada · bestias excluidas · baja registrada';
});

ok('16. Guardar y cargar incluye el registro de soldados', () => {
  const data = JSON.parse(JSON.stringify(session.save()));
  assert(data.soldiers && data.soldiers.units, 'el guardado no incluye soldados');
  assert(data.soldiers.units.length === S.units.length, 'snapshot incompleto');
  const s3 = V.createSession({ population: 1 });
  s3.load(data);
  assert(S.lastRestore && S.lastRestore.units === S.units.length, 'la restauración no registró el histórico');
  return data.soldiers.units.length + ' soldados en el JSON · histórico restaurado';
});

ok('17. Rendimiento del pulso con 120 soldados', () => {
  for (let i = 0; i < 120; i++) {
    S.bind({ hp: 50, cd: 1, sp: 3, g: { position: { x: (i % 20) * 3, z: Math.floor(i / 20) * 5 } } }, { side: i % 2 ? 'ally' : 'enemy', level: 6 });
  }
  const t = Date.now();
  for (let i = 0; i < 20; i++) S.pulse(1);
  const ms = Date.now() - t;
  assert(ms < 600, 'demasiado lento: ' + ms + ' ms');
  assert(S.stats.lastPulseMs < 80, 'pulso individual lento: ' + S.stats.lastPulseMs + ' ms');
  return S.units.length + ' cerebros · 20 pulsos en ' + ms + ' ms (' + S.stats.lastPulseMs + ' ms/pulso)';
});

ok('18. El miedo del cerebro modula la cadencia de disparo', () => {
  globalThis.playing = true;
  globalThis.level = 6;
  const unit = { hp: 50, cd: 0.2, sp: 3, g: { position: { x: 0, z: 0 } } };
  const b = S.bind(unit, { side: 'enemy', level: 6, type: 'sol' });
  for (let i = 0; i < 6; i++) b.brain.emotions.appraise({ type: 'amenaza', intensity: 0.6 });
  b.fear = b.brain.emotions.get('miedo');
  assert(b.fear > 0.8, 'el miedo no llegó al umbral: ' + b.fear.toFixed(2));
  const before = unit.cd;
  const realRandom = Math.random;
  Math.random = () => 0;
  try {
    for (let i = 0; i < 8 && b.hesitations === 0; i++) {
      unit.cd = before;
      S.pulse(1);
    }
  } finally {
    Math.random = realRandom;
  }
  assert(b.hesitations > 0, 'el miedo no produjo ninguna duda');
  assert(unit.cd > before, 'la cadencia no cambió (' + before + ' → ' + unit.cd + ')');
  return 'miedo ' + b.fear.toFixed(2) + ' · cd ' + before.toFixed(2) + ' → ' + unit.cd.toFixed(2) + ' · ' + b.hesitations + ' dudas';
});

ok('19. Las fábricas aliadas de los capítulos IX–XVIII reciben cerebro', () => {
  globalThis.level = 18;
  globalThis.playing = true;
  globalThis.P = { g: { position: { x: 0, z: 0 } } };
  globalThis.enemies = [];
  globalThis.allies = [];
  const unit = (name) => ({ name: name, hp: 100, g: { position: { x: 2, z: 0 } } });
  globalThis.mkGar = function (i, kind) { return { name: 'Gefr. Garantía', hp: 125, kind: kind, g: { position: { x: 1, z: 1 } } }; };
  globalThis.gMk17 = function () { return unit('Ametrallador Tres Cruces'); };
  globalThis.ally17 = function () { return unit('Cabo de Volskaya'); };
  globalThis.ally18 = function () { return unit('Fusilero del 12.º'); };
  globalThis.surv13 = function () { return unit('Superviviente de la finca'); };
  globalThis.inf14 = function () { return unit('Infante del bastión'); };
  globalThis.sailor28 = function (x, z, o) { return Object.assign(unit('Marinero de Eisenmark'), { w: o && o.w }); };
  const installed = S.install();
  for (const name of ['mkGar', 'gMk17', 'ally17', 'ally18', 'surv13', 'inf14', 'sailor28']) {
    assert(installed.indexOf(name) >= 0, name + ' no enganchado');
  }
  const gar = mkGar(0, 'mg');
  const units = [gMk17(1, 2), ally17(3, 4), ally18(5, 6), surv13(7, 8), inf14(9, 10), sailor28(0, 0, { w: 'r' }), sailor28(0, 0, {})];
  assert(gar.aethBrain, 'la guarnición no recibió cerebro');
  for (const u of units.slice(0, 6)) assert(u.aethBrain, u.name + ' sin cerebro');
  assert(units[6].aethBrain === undefined, 'un marinero sin arma no debería tener cerebro de combate');
  assert(S.stats.lateBound >= 7, 'contador de aliados tardíos: ' + S.stats.lateBound);
  const b = units[3].__aethBinding;
  units[3].down17 = 1;
  units[3].down29 = 1;
  S.pulse(1);
  assert(b.wounded, 'la herida de la escuadra XVIII no llegó al cerebro');
  units[3].dead17 = 1;
  S.pulse(1);
  assert(!b.alive, 'la muerte de la escuadra XVIII no llegó al cerebro');
  return 'guarnición, XVII, XVIII, XIII, XIV y marineros armados · ' + S.stats.lateBound + ' cerebros tardíos';
});

ok('20. El miedo también modula la cadencia `ft` de las escuadras XVIII', () => {
  globalThis.level = 18;
  globalThis.playing = true;
  const u = { hp: 100, ft: 0.2, g: { position: { x: 0, z: 0 } } };
  const b = S.bind(u, { side: 'ally', level: 18, type: 'soldado', late: true });
  for (let i = 0; i < 8; i++) b.brain.emotions.appraise({ type: 'amenaza', intensity: 0.6 });
  b.fear = b.brain.emotions.get('miedo');
  assert(b.fear > 0.78, 'el miedo no llegó al umbral: ' + b.fear.toFixed(2));
  const realRandom = Math.random;
  Math.random = () => 0;
  try {
    for (let i = 0; i < 8 && b.hesitations === 0; i++) {
      u.ft = 0.2;
      S.pulse(1);
    }
  } finally {
    Math.random = realRandom;
  }
  assert(b.hesitations > 0, 'el miedo no produjo ninguna duda');
  assert(u.ft > 0.9, 'la cadencia ft no cambió (' + u.ft + ')');
  return 'miedo ' + b.fear.toFixed(2) + ' · ft 0,20 → ' + u.ft.toFixed(2) + ' · ' + b.hesitations + ' dudas';
});

log('\nAethrion v40 — pruebas del núcleo');
log('=================================');
for (const r of results) log(r);
log('---------------------------------');
log('Resultado: ' + pass + '/' + results.length + ' correctas · ' + (Date.now() - t0) + ' ms');
if (pass !== results.length) process.exit(1);
