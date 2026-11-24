#!/usr/bin/env node
'use strict';
/* Informe de rendimiento del motor cognitivo (sin navegador).
   Uso: node tests/benchmark.js */
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
for (const f of FILES) vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f });
const AETH = globalThis.AETH;
const U = AETH.util;

function ms(fn) {
  const t = U.now();
  const r = fn();
  return { ms: U.now() - t, r };
}

console.log('IRON V1 · informe de rendimiento (Node ' + process.version + ')\n');

// Generación
const gen = ms(() => {
  const out = [];
  for (let i = 0; i < 300; i++) {
    out.push(
      AETH.NPCFactory.create(
        {
          profession: Object.keys(AETH.culture.professions)[i % 16],
          ethnicity: Object.keys(AETH.culture.ethnicities)[i % 10],
          age: 8 + (i % 70)
        },
        { rng: new U.RNG(9000 + i) }
      )
    );
  }
  return out;
});
console.log('Generación de 300 NPC: ' + gen.ms.toFixed(0) + ' ms (' + (gen.ms / 300).toFixed(2) + ' ms/NPC)');

// Simulación a distintas escalas
function simulate(count, frames, timeScale) {
  const w = AETH.world.createBorgnonWorld({ seed: 4242, timeScale: timeScale, budgetMs: 4.5 });
  for (let i = 0; i < count; i++) {
    w.spawn({ profession: Object.keys(AETH.culture.professions)[i % 16], age: 10 + (i % 66) });
  }
  w.update(0.5, { x: 0, z: 0 });
  const run = ms(() => {
    for (let f = 0; f < frames; f++) w.update(0.05, { x: 0, z: 0 });
  });
  return { w: w, ms: run.ms, perFrame: run.ms / frames, npcs: count };
}

for (const cfg of [
  { n: 40, frames: 300, scale: 300 },
  { n: 120, frames: 180, scale: 300 },
  { n: 120, frames: 180, scale: 1800 },
  { n: 300, frames: 120, scale: 300 }
]) {
  const r = simulate(cfg.n, cfg.frames, cfg.scale);
  console.log(
    'Simulación ' + String(cfg.n).padStart(3) + ' NPC · x' + String(cfg.scale).padEnd(4) +
    ' ' + r.perFrame.toFixed(2) + ' ms/frame (' + Math.round(1000 / Math.max(0.01, r.perFrame)) + ' fps de IA) · LOD ' +
    r.w.lodCounts[1] + '/' + r.w.lodCounts[2] + '/' + r.w.lodCounts[3]
  );
}

// Coste cognitivo por individuo
const one = AETH.NPCFactory.create({ profession: 'mecanico_ferroviario', age: 47, conditions: { kneeInjury: true } }, { rng: new U.RNG(1) });
const w1 = AETH.world.createBorgnonWorld({ seed: 2 });
w1.spawn({ profession: 'soldado', age: 30 });
const t0 = U.now();
for (let i = 0; i < 400; i++) one.tick(0.5, w1);
const msTick = (U.now() - t0) / 400;
console.log('Ciclo cognitivo individual (' + Math.round(400 * 0.5) + ' s simulados): ' + msTick.toFixed(2) + ' ms por llamada');

// Serialización (mundo ya simulado varios minutos)
const big = simulate(120, 240, 300).w;
const save = ms(() => JSON.stringify(big.save()));
console.log('Guardado del mundo (120 NPC): ' + (save.ms).toFixed(1) + ' ms · ' + (save.r.length / 1024).toFixed(0) + ' KB');

// Insight: número de recuerdos y decisiones
const sample = big.brains.filter((b) => b.alive !== false).slice(0, 20);
const actions = sample.reduce((a, b) => a + b.stats.actions, 0);
const thoughts = sample.reduce((a, b) => a + b.stats.thoughts, 0);
const goals = sample.filter((b) => b.intent.goal).length;
const mem = sample.reduce((a, b) => a + b.memory.episodic.length, 0);
console.log('\nMuestra de 20 individuos: ' + actions + ' acciones, ' + thoughts + ' ciclos de pensamiento, ' + mem + ' recuerdos, ' + goals + ' con objetivo activo.');
console.log('Eventos del mundo: ' + big.events.length + ' · diálogos registrados: ' + big.dialogueFeed.length);
