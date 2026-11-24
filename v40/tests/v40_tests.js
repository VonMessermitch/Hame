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
  const grief = w.brains.filter((b) => b.alive !== false && b.memory.episodic.some((m) => /vio morir|ha perdido/i.test(m.summary || '')));
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

log('\nAethrion v40 — pruebas del núcleo');
log('=================================');
for (const r of results) log(r);
log('---------------------------------');
log('Resultado: ' + pass + '/' + results.length + ' correctas · ' + (Date.now() - t0) + ' ms');
if (pass !== results.length) process.exit(1);
