'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const Module = require('module');

function runCjsFile(filePath) {
  const abs = path.resolve(__dirname, filePath);
  let code = fs.readFileSync(abs, 'utf8');
  if (code.startsWith('#!')) code = code.replace(/^#![^\n]*\n/, '\n');
  const m = new Module(abs);
  m.filename = abs;
  m.paths = Module._nodeModulePaths(path.dirname(abs));
  const wrapped = `(function(exports, require, module, __filename, __dirname) {\n${code}\n})`;
  const fn = vm.runInThisContext(wrapped, { filename: abs });
  fn(m.exports, Module.createRequire(abs), m, abs, path.dirname(abs));
}

console.log('=== RUNNING iron-v1-demo/tests/engine_tests.js ===');
runCjsFile('../../iron-v1-demo/tests/engine_tests.js');
console.log('\n=== RUNNING v40/tests/v40_tests.js ===');
runCjsFile('../../v40/tests/v40_tests.js');
