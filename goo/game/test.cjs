'use strict';
const { execFileSync } = require('node:child_process');
const checks = [
  'puzzles-check.cjs',
  'combat-check.cjs',
  'combat-integration-check.cjs',
  'v3-integration-check.cjs',
  'v3-forward-check.cjs',
  'v3-return-check.cjs',
  'balance-check.cjs',
  'ui-v3-check.cjs',
  'graphics-check.cjs',
  'mobile-update-check.cjs',
  'combat-phase-check.cjs',
  'combat-playthrough-check.cjs',
  'chapters-check.cjs',
  'chapter-route-qa.cjs'
];
for (const file of checks) {
  console.log('\n' + file);
  execFileSync(process.execPath, [file], { cwd: __dirname, stdio: 'inherit' });
}
console.log('\nAll ' + checks.length + ' checks passed.');
