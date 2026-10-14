import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import { copyText, formatCommandTarget, hasPlaceholder, resolveCommand, splitPlaceholders } from '../app/shared/manualCommands.mjs';
import { normalizeReportSlug } from '../app/shared/inputPolicy.mjs';

test('command targets are quoted and escaped only when needed', () => {
  assert.equal(formatCommandTarget('Steve_1', 'PlayerA'), 'Steve_1');
  assert.equal(formatCommandTarget('My Name', 'PlayerA'), '"My Name"');
  assert.equal(formatCommandTarget('a"b\\c', 'PlayerA'), String.raw`"a\"b\\c"`);
  assert.equal(formatCommandTarget('line\nbreak', 'PlayerA'), 'linebreak');
});

test('empty player names stay templates', () => {
  const cmd = resolveCommand('/seasonadmin leader a {PlayerA}', { PlayerA: '  ' });
  assert.equal(cmd, '/seasonadmin leader a <PlayerA>');
  assert.equal(hasPlaceholder(cmd), true);
  assert.equal(hasPlaceholder(resolveCommand('/seasonadmin leader a {PlayerA}', { PlayerA: 'Kim' })), false);
  assert.deepEqual(splitPlaceholders('/x <id> y').map(p => p.placeholder), [false, true, false]);
});

test('copy failure is reported, not faked', async () => {
  assert.equal(await copyText('x', { navigator: { clipboard: { writeText: async () => { throw new Error('denied'); } } } }), false);
  assert.equal(await copyText('x', { navigator: { clipboard: { writeText: async () => {} } } }), true);
});

test('manual is reserved as a report path', () => {
  assert.equal(normalizeReportSlug('manual'), null);
});

test('no site link points at /manual', () => {
  const hits = [];
  const walk = dir => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) { if (name !== 'manual') walk(path); continue; }
      if (/\.(tsx?|mjs)$/.test(name) && /['"`]\/manual['"`#/]/.test(readFileSync(path, 'utf8'))) hits.push(path);
    }
  };
  walk('app');
  assert.deepEqual(hits.filter(p => !p.endsWith('inputPolicy.mjs')), []);
});
