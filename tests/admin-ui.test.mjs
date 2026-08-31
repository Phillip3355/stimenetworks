import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const taskboardPage = await readFile(new URL('../app/taskboard/page.tsx', import.meta.url), 'utf8');
const supportPage = await readFile(new URL('../app/support/page.tsx', import.meta.url), 'utf8');
const adminStyles = await readFile(new URL('../app/styles/server-mechanism.module.css', import.meta.url), 'utf8');
const joinStyles = await readFile(new URL('../app/styles/join-admin.module.css', import.meta.url), 'utf8');

test('admin taskboard exposes dark theme surfaces for chat and report actions', () => {
  assert.match(taskboardPage, /styles\.adminPanelHeader/);
  assert.match(taskboardPage, /styles\.adminAccountBar/);
  assert.match(taskboardPage, /styles\.chatMessages/);
  assert.match(taskboardPage, /styles\.chatSendButton/);
  assert.match(taskboardPage, /styles\.reportViewButton/);
  assert.match(taskboardPage, /styles\.reportDeleteButton/);
  assert.match(adminStyles, /\.adminPanelHeader\s*\{[\s\S]*background:\s*var\(--color-surface\)/);
  assert.match(adminStyles, /\.chatMessages\s*\{[\s\S]*background:\s*var\(--color-surface-soft\)/);
  assert.match(adminStyles, /\.chatSendButton\s*\{[\s\S]*background:\s*var\(--color-surface-raised\)/);
  assert.match(adminStyles, /\.reportViewButton\s*\{[\s\S]*display:\s*inline-flex[\s\S]*align-items:\s*center[\s\S]*justify-content:\s*center/);
  assert.match(adminStyles, /\.reportDeleteButton\s*\{[\s\S]*background:\s*transparent/);
});

test('admin controls stay usable on narrow screens', () => {
  assert.match(adminStyles, /\.adminTabList\s*\{[\s\S]*display:\s*flex/);
  assert.match(adminStyles, /\.adminAccountBar\s*\{[\s\S]*display:\s*flex/);
  assert.match(adminStyles, /@media\s*\(max-width:\s*760px\)[\s\S]*\.adminTabList\s*\{[\s\S]*overflow-x:\s*auto/);
  assert.match(adminStyles, /@media\s*\(max-width:\s*760px\)[\s\S]*\.adminAccountBar\s*\{[\s\S]*flex-direction:\s*column/);
  assert.match(joinStyles, /@media\s*\(max-width:\s*520px\)[\s\S]*\.actions button\s*\{[\s\S]*width:\s*100%/);
});

test('support admin console CTA uses the shared dark action treatment', () => {
  assert.match(supportPage, /styles\.adminConsoleButton/);
  assert.match(adminStyles, /\.adminConsoleButton\s*\{[\s\S]*background:\s*var\(--color-surface-raised\)/);
  assert.match(adminStyles, /\.adminConsoleButton\s*\{[\s\S]*display:\s*inline-flex[\s\S]*align-items:\s*center[\s\S]*justify-content:\s*center/);
});
