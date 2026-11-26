import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const coreCtx = { globalThis: {} };
coreCtx.globalThis = coreCtx;
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'vGAI/src/core_vgai.js'), 'utf8'), coreCtx, { filename: 'core_vgai.js' });
const CORE = coreCtx.CORE_VGAI;

const ALL_MODULES = [
  'vGAI/src/core_vgai.js',
  'vGAI/src/registry_vgai.js',
  'vGAI/src/audio_vgai.js',
  'vGAI/src/hud_compass_vgai.js',
  'vGAI/src/doors_vgai.js',
  'vGAI/src/missions_veyrn_vgai.js',
  'vGAI/src/ai_tactical_vgai.js',
  'vGAI/src/levels_arch_vgai.js',
  'vGAI/src/weapons_vgai.js',
  'vGAI/src/vehicles_at_vgai.js',
  'vGAI/src/paratroopers_vgai.js',
  'vGAI/src/battlefield_vgai.js',
  'vGAI/src/perf_vgai.js',
];

test('All 13 V.GAI.1.0 modules exist and parse cleanly in vm.Script', () => {
  for (const rel of ALL_MODULES) {
    const full = path.join(ROOT, rel);
    assert.ok(fs.existsSync(full), `Missing module ${rel}`);
    const code = fs.readFileSync(full, 'utf8');
    new vm.Script(code, { filename: rel });
  }
});

test('1. computeOrientedDoorAABB rotates half-extents around hinge cleanly', () => {
  const closed = CORE.computeOrientedDoorAABB({ x: 10, y: 2, z: -5, ry: 0, angle: 0, width: 1.4, thick: 0.2, height: 2.3 });
  assert.equal(closed.door, true);
  assert.equal(closed.y0, 2);
  assert.ok(closed.hw > closed.hd, 'Closed door along X has larger hw than hd');
  assert.ok(Math.abs(closed.x - 10) < 1e-6);

  const open90 = CORE.computeOrientedDoorAABB({ x: 10, y: 2, z: -5, ry: 0, angle: Math.PI / 2, width: 1.4, thick: 0.2, height: 2.3 });
  assert.ok(open90.hd > open90.hw, '90-degree swung door has larger hd than hw');
  assert.ok(open90.x < 10, 'Hinge-anchored swing shifts leaf center toward hingeX');
});

test('2. computeDoorPinchPushout ejects overlapping actor outside door leaf', () => {
  const door = { x: 0, y: 0, z: 0, ry: 0, angle: 0, width: 1.4, thick: 0.2, height: 2.2 };
  const push = CORE.computeDoorPinchPushout(door, { x: 0.1, z: 0.05 }, 0.42);
  assert.ok(push !== null);
  assert.ok(Math.abs(push.dx) > 0 || Math.abs(push.dz) > 0);
  const clear = CORE.computeDoorPinchPushout(door, { x: 5, z: 5 }, 0.42);
  assert.equal(clear, null);
});

test('3. solveSoldierCollisions separates overlapping soldiers & player while respecting walls', () => {
  const actors = [
    { x: 0, y: 0, z: 0, hp: 100 },
    { x: 0.2, y: 0, z: 0, hp: 100 },
    { x: 0, y: 0, z: 0.1, hp: 0, dead17: true },
  ];
  const player = { x: 0.1, y: 0, z: 0.1 };
  const wallFn = (x) => x > 1.5;
  const res = CORE.solveSoldierCollisions(actors, player, wallFn, { radius: 0.42, playerRadius: 0.44 });
  assert.ok(res.pairsResolved >= 2);
  const d01 = Math.hypot(actors[1].x - actors[0].x, actors[1].z - actors[0].z);
  assert.ok(d01 > 0.2, `Expected actors to separate (dist=${d01})`);
  assert.ok(actors[0].x <= 1.5 && actors[1].x <= 1.5, 'Wall constraint honored');
});

test('4. computePerception enforces cone, prone stealth, fog, LOS, and recent gunfire', () => {
  const obs = { x: 0, z: 0, yaw: 0, visRange: 90, alerted: false, eyeSkill: 1 };
  const aheadStand = { x: 0, z: 30, speed: 3, crouch: false, prone: false };
  const behind = { x: 0, z: -30, speed: 3, crouch: false, prone: false };
  const proneFar = { x: 0, z: 45, speed: 0, crouch: false, prone: true, inCover: true };
  const firing = { x: 0, z: 45, speed: 0, crouch: false, prone: true, firedRecently: true };

  assert.equal(CORE.computePerception(obs, aheadStand, { losClear: true, fogFactor: 1 }).visible, true);
  assert.equal(CORE.computePerception(obs, behind, { losClear: true, fogFactor: 1 }).visible, false);
  assert.equal(CORE.computePerception(obs, aheadStand, { losClear: false, fogFactor: 1 }).visible, false);
  assert.equal(CORE.computePerception(obs, proneFar, { losClear: true, fogFactor: 1 }).visible, false);
  assert.equal(CORE.computePerception(obs, firing, { losClear: true, fogFactor: 1 }).visible, true);
});

test('5. decayMemory maintains confidence while visible and decays over time when unseen', () => {
  const mem = { visible: true, confidence: 0.5, timeSinceSeen: 4, know: 2 };
  CORE.decayMemory(mem, 1.0);
  assert.equal(mem.timeSinceSeen, 0);
  assert.ok(mem.confidence > 0.5);

  mem.visible = false;
  for (let i = 0; i < 20; i++) CORE.decayMemory(mem, 1.0);
  assert.ok(mem.timeSinceSeen >= 19.9);
  assert.ok(mem.confidence < 0.1);
  assert.ok(mem.know <= 1);
});

test('6. computeEmotionPersonality increases fear and coverBias under heavy stress/losses', () => {
  const calm = CORE.computeEmotionPersonality({ brave: 0.85, adv: 0.8, cov: 1.0 }, 0.1, 0);
  const stressed = CORE.computeEmotionPersonality({ brave: 0.55, adv: 0.8, cov: 1.0 }, 2.5, 2);
  assert.ok(stressed.fear > calm.fear);
  assert.ok(stressed.coverBias > calm.coverBias);
  assert.ok(stressed.aggression < calm.aggression);
  assert.equal(stressed.panic, true);
});

test('7. allocateCoverSlots assigns distinct directional cover slots without overlap', () => {
  const squad = [
    { id: 'a', x: 0, z: 0, hp: 100, prefRange: 20 },
    { id: 'b', x: 2, z: 0, hp: 100, prefRange: 20 },
  ];
  const threat = { x: 0, z: 40 };
  const covers = [
    { x: -1, z: 18, ox: -1, oz: 19 },
    { x: 0, z: 18.2, ox: 0, oz: 19.2 }, // within 2.1m of slot 1 -> should skip if slot 1 picked
    { x: 6, z: 18, ox: 6, oz: 19 },
    { x: 10, z: 18, ox: 10, oz: 12 }, // wrong side of obstacle relative to threat -> skipped
  ];
  const assigned = CORE.allocateCoverSlots(squad, threat, covers);
  assert.equal(assigned.length, 2);
  const d = Math.hypot(assigned[0].cover.x - assigned[1].cover.x, assigned[0].cover.z - assigned[1].cover.z);
  assert.ok(d >= 2.1, `Assigned covers must be spaced >=2.1m, got ${d}`);
  assert.notEqual(assigned[0].cover.x, 10);
  assert.notEqual(assigned[1].cover.x, 10);
});

test('8. hasFriendlyFireRisk detects allies inside narrow firing corridor', () => {
  const shooter = { x: 0, z: 0, avoidPlayer: true, laneHalfWidth: 0.85 };
  const target = { x: 0, z: 30 };
  const allyBlocking = [{ x: 0.25, z: 12, hp: 80 }];
  const allyClear = [{ x: 4.5, z: 12, hp: 80 }];
  assert.equal(CORE.hasFriendlyFireRisk(shooter, target, allyBlocking, null), true);
  assert.equal(CORE.hasFriendlyFireRisk(shooter, target, allyClear, null), false);
  assert.equal(CORE.hasFriendlyFireRisk(shooter, target, [], { x: -0.3, z: 10 }), true);
});

test('9. scaleTankSpec applies +18% scale cleanly and checkRouteClearance validates >=6m roads', () => {
  const base = { hw: 1.55, hd: 3.1, h: 2.35, cz: 0.1, zf: 3.2, zb: -3.0 };
  const scaled = CORE.scaleTankSpec(base, 1.18);
  assert.equal(scaled.visualScale, 1.18);
  assert.ok(Math.abs(scaled.hw - 1.55 * 1.18) < 1e-3);
  assert.ok(Math.abs(scaled.h - 2.35 * 1.18) < 1e-3);

  const report = CORE.checkRouteClearance(scaled, [
    { name: 'Varnholt Main Road', width: 7.2 },
    { name: 'Narrow Alley', width: 4.0 },
  ]);
  assert.equal(report[0].ok, true);
  assert.equal(report[1].ok, false);
});

test('10. findSafeLandingSpot avoids blocked cells and stepParatrooperPhysics lands safely', () => {
  const isBlocked = (x, z) => Math.abs(z + 40) < 8.5 || (Math.abs(x - 10) < 3 && Math.abs(z - 10) < 3);
  const floorFn = () => 1.5;

  const safe = CORE.findSafeLandingSpot(0, -40, floorFn, isBlocked, 35);
  assert.equal(safe.adjusted, true);
  assert.equal(isBlocked(safe.x, safe.z), false);

  const para = { x: 0, y: 120, z: -40, vx: 0, vy: -10, vz: 0, open: false, landed: false, autoOpenAlt: 105 };
  for (let i = 0; i < 600 && !para.landed; i++) {
    CORE.stepParatrooperPhysics(para, 0.05, { x: 0.7, z: 0.3 }, floorFn, isBlocked, [para]);
  }
  assert.equal(para.open, true);
  assert.equal(para.landed, true);
  assert.equal(para.y, 1.5);
  assert.equal(isBlocked(para.x, para.z), false);
});

test('11. computeWeaponRestriction enforces Lugy pistol-only in Level 12 Zeppelin', () => {
  const l12Rifle = CORE.computeWeaponRestriction(12, 'rifle');
  assert.equal(l12Rifle.allowed, false);
  assert.equal(l12Rifle.enforcedWeapon, 'revolver');
  assert.equal(l12Rifle.viewmodelKey, 'P');

  const l12Pistol = CORE.computeWeaponRestriction(12, 'revolver');
  assert.equal(l12Pistol.allowed, true);

  const l17Rifle = CORE.computeWeaponRestriction(17, 'rifle');
  assert.equal(l17Rifle.allowed, true);
});

test('12. computeAtRifleDamage scales AP damage against armored targets and distance', () => {
  const closeTank = CORE.computeAtRifleDamage(260, 'tank', 0.45, 50);
  const farTank = CORE.computeAtRifleDamage(260, 'tank', 0.45, 280);
  const carDmg = CORE.computeAtRifleDamage(260, 'car', 0.45, 50);
  assert.ok(closeTank > 250);
  assert.ok(farTank < closeTank);
  assert.ok(carDmg > closeTank);
});

test('13. computeAudioSpatial & canTriggerRateLimited compute attenuation, pan, and cooldowns', () => {
  const rightSound = CORE.computeAudioSpatial(20, 0, 0, 0, 90, false, 0);
  assert.equal(rightSound.audible, true);
  assert.ok(rightSound.pan > 0.8);
  assert.ok(rightSound.gain > 0.5);

  const outOfRange = CORE.computeAudioSpatial(120, 0, 0, 0, 90, true, 0);
  assert.equal(outOfRange.audible, false);
  assert.equal(outOfRange.gain, 0);

  const map = {};
  assert.equal(CORE.canTriggerRateLimited(map, 'shot', 1000, 50), true);
  assert.equal(CORE.canTriggerRateLimited(map, 'shot', 1020, 50), false);
  assert.equal(CORE.canTriggerRateLimited(map, 'shot', 1060, 50), true);
});
