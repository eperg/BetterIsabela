#!/usr/bin/env node
/**
 * The Next app serves its own copy of the legacy stylesheets from
 * react-app/public/assets/css/. They are meant to mirror the root ones — when
 * they drift, app pages silently lose styling that the static site still has.
 * That is exactly how the Price Watch page ended up rendering as raw text.
 *
 *   node scripts/check-css-sync.js         report drift
 *   node scripts/check-css-sync.js --fix   copy root -> app
 */
'use strict';
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const from = path.join(root, 'assets', 'css');
const to = path.join(root, 'react-app', 'public', 'assets', 'css');
const fix = process.argv.includes('--fix');

if (!fs.existsSync(to)) {
  console.log('No react-app stylesheet directory; nothing to check.');
  process.exit(0);
}

let drifted = 0;
for (const file of fs.readdirSync(from).filter((f) => f.endsWith('.css'))) {
  const a = path.join(from, file);
  const b = path.join(to, file);
  const source = fs.readFileSync(a, 'utf8');
  const target = fs.existsSync(b) ? fs.readFileSync(b, 'utf8') : null;

  if (target === source) continue;
  drifted += 1;
  if (fix) {
    fs.writeFileSync(b, source);
    console.log(`  synced ${file}`);
  } else {
    const delta = target === null ? 'missing' : `${Math.abs(source.split('\n').length - target.split('\n').length)} line(s) apart`;
    console.error(`  ${file}: out of sync (${delta})`);
  }
}

if (!drifted) {
  console.log('Stylesheets are in sync.');
} else if (!fix) {
  console.error(`\n${drifted} stylesheet(s) have drifted. Run: node scripts/check-css-sync.js --fix`);
  process.exitCode = 1;
}
