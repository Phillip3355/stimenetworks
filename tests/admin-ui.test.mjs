import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const taskboardPage = await readFile(new URL('../app/taskboard/page.tsx', import.meta.url), 'utf8');
const supportPage = await readFile(new URL('../app/support/page.tsx', import.meta.url), 'utf8');
const adminStyles = await readFile(new URL('../app/styles/functional.module.css', import.meta.url), 'utf8');

test('admin taskboard exposes usable chat and report actions', () => {
  assert.match(taskboardPage, /styles\.adminPanelHeader/);
  assert.match(taskboardPage, /styles\.adminAccountBar/);
  assert.match(taskboardPage, /styles\.chatMessages/);
  assert.match(taskboardPage, /className=\{styles\.chatComposer\}[\s\S]*onSubmit=\{handleSendReply\}/);
  assert.match(taskboardPage, /type="submit"[\s\S]*disabled=\{isSubmittingReply\}/);
  assert.match(taskboardPage, /styles\.reportViewButton/);
  assert.match(taskboardPage, /styles\.reportDeleteButton/);
  assert.match(adminStyles, /\.chatComposer\s*>\s*input\s*\{[^}]*min-width:\s*0/);
  assert.match(adminStyles, /\.chatComposer\s*>\s*button\s*\{[^}]*background:\s*var\(--color-primary\)[^}]*color:\s*var\(--color-on-primary\)/);
  assert.match(adminStyles, /\.reportViewButton,\s*\.reportDeleteButton\s*\{[^}]*display:\s*inline-flex[^}]*align-items:\s*center[^}]*justify-content:\s*center[^}]*min-height:\s*44px/);
});

test('admin controls stay usable on narrow screens', () => {
  assert.match(taskboardPage, /className=\{styles\.adminTabList\}[^\n]*flexWrap:\s*'wrap'/);
  assert.match(adminStyles, /\.adminAccountBar\s*\{[^}]*display:\s*flex[^}]*flex-wrap:\s*wrap/);
  assert.match(adminStyles, /@media\s*\(max-width:\s*1100px\)[\s\S]*\.adminPanelHeader\s*\{[^}]*grid-template-columns:\s*1fr/);
  assert.match(adminStyles, /@media\s*\(max-width:\s*430px\)[\s\S]*\.adminAccountBar\s*\{[^}]*flex-direction:\s*column/);
  assert.match(adminStyles, /@media\s*\(max-width:\s*430px\)[\s\S]*\.chatComposer\s*\{[^}]*grid-template-columns:\s*1fr/);
});

test('support admin console CTA uses the shared primary action treatment', () => {
  assert.match(supportPage, /styles\.adminConsoleButton/);
  assert.match(supportPage, /href="\/taskboard"[\s\S]*styles\.adminConsoleButton/);
  assert.match(adminStyles, /\.adminConsoleButton,\s*\.adminGateButton\s*\{[^}]*display:\s*inline-flex[^}]*align-items:\s*center[^}]*justify-content:\s*center[^}]*min-height:\s*44px/);
  assert.match(adminStyles, /\.adminConsoleButton,\s*\.adminGateButton\s*\{[^}]*background:\s*var\(--color-primary\)[^}]*color:\s*var\(--color-on-primary\)/);
});
