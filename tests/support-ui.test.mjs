import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const supportStyles = await readFile(new URL('../app/styles/server-mechanism.module.css', import.meta.url), 'utf8');

test('support entry presents sign-in and guest inquiry cards responsively', () => {
  assert.match(supportStyles, /\.authChoiceGrid\s*\{[\s\S]*grid-template-columns:\s*repeat\(2/);
  assert.match(supportStyles, /\.authChoiceCard\s*\{/);
  assert.match(supportStyles, /\.authChoiceButton\s*\{/);
  assert.match(supportStyles, /@media\s*\(max-width:\s*760px\)[\s\S]*\.authChoiceGrid\s*\{[\s\S]*grid-template-columns:\s*1fr/);
});

test('guest choice hover keeps its label readable instead of inverting to low contrast', () => {
  assert.match(
    supportStyles,
    /\.guestChoice:hover\s*\{[\s\S]*background:\s*var\(--color-surface-soft\);[\s\S]*color:\s*var\(--color-ink\)\s*!important;/,
  );
  assert.match(supportStyles, /\.guestChoice:hover\s+strong,[\s\S]*\.guestChoice:hover\s+span/);
});

test('guest inquiry surfaces use bottom drawer presentation styles', () => {
  assert.match(supportStyles, /\.modalBackdrop\s*\{[\s\S]*align-items:\s*flex-end;/);
  assert.match(supportStyles, /\.modalCard,\s*\.codeNotice\s*\{[\s\S]*border-radius:\s*var\(--radius-sm\)\s+var\(--radius-sm\)\s+0\s+0/);
});

test('desktop guest menu centers its title while keeping the close control reachable', () => {
  assert.match(supportStyles, /\.modalHeaderMenu\s*\{/);
  assert.match(supportStyles, /\.modalBackdrop\s*\{[\s\S]*align-items:\s*center/);
  assert.match(supportStyles, /@media\s*\(min-width:\s*761px\)[\s\S]*\.modalHeaderMenu\s*\{[\s\S]*justify-content:\s*center/);
  assert.match(supportStyles, /\.modalHeaderMenu \.modalClose\s*\{[\s\S]*position:\s*absolute/);
  assert.match(supportStyles, /@media\s*\(max-width:\s*760px\)[\s\S]*\.modalBackdrop\s*\{[\s\S]*align-items:\s*flex-end/);
});
