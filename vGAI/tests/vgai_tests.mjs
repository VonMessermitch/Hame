import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  PASS  ${name}`);
  } catch (err) {
    failed++;
    console.error(`  FAIL  ${name}: ${err.message}`);
  }
}

console.log('=== V.GAI.1.0 Automated Test Suite ===');

// 1. Cargar módulo de brújula en contexto Node
const compassCtx = { globalThis: {} };
compassCtx.globalThis = compassCtx;
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'vGAI/src/hud_compass_vgai.js'), 'utf8'), compassCtx);
const C = compassCtx.COMPASS_VGAI;

test('Compass cardinal headings (-Z=N=0°, +X=E=90°, +Z=S=180°, -X=O=270°)', () => {
  assert.equal(Math.round(C.headingDegFromDir(0, -1)), 0);
  assert.equal(Math.round(C.headingDegFromDir(1, 0)), 90);
  assert.equal(Math.round(C.headingDegFromDir(0, 1)), 180);
  assert.equal(Math.round(C.headingDegFromDir(-1, 0)), 270);
  assert.equal(C.cardinalLabel(0), 'N');
  assert.equal(C.cardinalLabel(90), 'E');
  assert.equal(C.cardinalLabel(180), 'S');
  assert.equal(C.cardinalLabel(270), 'O');
});

test('Compass shortest-angle wraparound across 0°/360° prevents jumps', () => {
  assert.equal(C.shortestAngleDiffDeg(355, 5), 10);
  assert.equal(C.shortestAngleDiffDeg(5, 355), -10);
  assert.equal(C.shortestAngleDiffDeg(180, 180), 0);
  assert.equal(Math.round(C.bearingDeg(0, 0, 100, -100)), 45);
  assert.equal(Math.round(C.relativeBearingDeg(350, 10)), 20);
});

// 2. Audio Manifest & processed OGG/MP3 files on disk
test('Audio manifest lists 53 clips and every OGG + MP3 + original exists on disk', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/audio/manifest.json'), 'utf8'));
  assert.equal(manifest.count, 53);
  assert.equal(manifest.clips.length, 53);
  for (const clip of manifest.clips) {
    assert.equal(clip.sampleRate, 44100, `${clip.id} sampleRate`);
    for (const rel of [clip.originalName, clip.processedOgg, clip.processedMp3]) {
      const full = path.join(ROOT, rel);
      assert.ok(fs.existsSync(full), `Missing audio file: ${rel}`);
      assert.ok(fs.statSync(full).size > 100, `Empty audio file: ${rel}`);
    }
  }
});

// 3. Catalogs & 10 categories
test('Model & Texture catalogs cover all 10 categories, 21 models, 10 textures, 20 levels', () => {
  const cat = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/catalog/model_catalog.json'), 'utf8'));
  const reg = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/catalog/resource_registry.json'), 'utf8'));
  assert.equal(cat.categories.length, 10);
  assert.equal(cat.models.length, 21);
  assert.equal(cat.textures.length, 10);
  assert.equal(reg.summary.levels, 20);
  assert.equal(reg.summary.audioClips, 53);
  for (const c of cat.categories) {
    assert.ok(fs.existsSync(path.join(ROOT, 'assets/models', c)));
    assert.ok(fs.existsSync(path.join(ROOT, 'assets/textures', c)));
  }
  for (const m of cat.models) assert.ok(fs.existsSync(path.join(ROOT, m.path)));
  for (const t of cat.textures) assert.ok(fs.existsSync(path.join(ROOT, t.path)));
});

// 4. Doors dynamic collider toggling & NV invalidation
const doorCtx = { globalThis: {} };
doorCtx.globalThis = doorCtx;
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'vGAI/src/doors_vgai.js'), 'utf8'), doorCtx);
const D = doorCtx.DOORS_VGAI;

test('Door dynamic collider updates obstB and invalidates NV.sig when closed/opened', () => {
  const obstB = [];
  const NV = { sig: 'cached_grid_sig' };
  const door = { x: 10, z: -20, ry: 0, width: 1.3, thick: 0.18, height: 2.2, open: false, angle: 0 };

  assert.equal(D.toggleDoorCollider(door, obstB, NV), true);
  assert.equal(obstB.length, 1);
  assert.equal(NV.sig, '');

  NV.sig = 'recomputed';
  door.open = true;
  door.angle = 1.62;
  assert.equal(D.toggleDoorCollider(door, obstB, NV), true);
  assert.equal(obstB.length, 0);
  assert.equal(NV.sig, '');
});

// 5. Built HTML V.GAI.1.0 integrity, script syntax, and preservation of v39/v41
test('All 6 V.GAI.1.0 JS modules parse cleanly with vm.Script', () => {
  const mods = [
    'vGAI/src/registry_vgai.js',
    'vGAI/src/audio_vgai.js',
    'vGAI/src/hud_compass_vgai.js',
    'vGAI/src/doors_vgai.js',
    'vGAI/src/missions_veyrn_vgai.js',
    'vGAI/src/perf_vgai.js',
  ];
  for (const m of mods) {
    const code = fs.readFileSync(path.join(ROOT, m), 'utf8');
    new vm.Script(code, { filename: m });
  }
});

test('Built V.GAI.1.0 HTML exists in root and V.GAI.1.0/, contains Levels 1..20 & preserves v39/v41', () => {
  const rootHtmlPath = path.join(ROOT, 'Sombras_sobre_el_Nilo_1909_V.GAI.1.0.html');
  const distHtmlPath = path.join(ROOT, 'V.GAI.1.0/Sombras_sobre_el_Nilo_1909_V.GAI.1.0.html');
  assert.ok(fs.existsSync(rootHtmlPath));
  assert.ok(fs.existsSync(distHtmlPath));
  const a = fs.readFileSync(rootHtmlPath, 'utf8');
  const b = fs.readFileSync(distHtmlPath, 'utf8');
  assert.equal(a, b);
  for (const token of [
    'startLevel17',
    'startLevel18',
    'startLevel19',
    'startLevel20',
    'data-vgai-module="vGAI/src/audio_vgai.js"',
    'data-vgai-module="vGAI/src/hud_compass_vgai.js"',
    'data-vgai-module="vGAI/src/doors_vgai.js"',
    'data-vgai-module="vGAI/src/missions_veyrn_vgai.js"',
    'opt_vgai_19',
    'opt_vgai_20',
  ]) {
    assert.ok(a.includes(token), `Missing token in built HTML: ${token}`);
  }
  assert.ok(fs.existsSync(path.join(ROOT, 'Sombras_sobre_el_Nilo_1909_v39.html')));
  assert.ok(fs.existsSync(path.join(ROOT, 'Sombras_sobre_el_Nilo_1909_v41.html')));
});

console.log(`\nSummary: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
