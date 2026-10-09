import assert from 'node:assert/strict';
import test from 'node:test';
import { getConnectionPresentation } from '../app/shared/serverGroup.mjs';

import * as interactions from '../app/shared/guideInteractions.mjs';
const published = { lifecycle: 'current', status: 'active', editions: ['Java', 'Bedrock'], connection: { java: { address: 'java.example.test' }, bedrock: { address: 'bedrock.example.test', port: 25000 } } };

test('copy flow conceals planned and preparing values even when addresses were supplied', async () => {
  assert.equal(typeof interactions.copyConnectionValue, 'function');
  for (const server of [{ ...published, lifecycle: 'planned' }, { ...published, status: 'preparing' }]) {
    const presentation = getConnectionPresentation(server, 'Bedrock');
    assert.deepEqual(await interactions.copyConnectionValue(presentation, 'address'), { state: 'unavailable', value: null });
  }
});

test('published Java port is unavailable while address copying succeeds', async () => {
  const presentation = getConnectionPresentation(published, 'Java');
  let actual;
  assert.equal(typeof interactions.copyConnectionValue, 'function');
  assert.deepEqual(await interactions.copyConnectionValue(presentation, 'address', { writeText: async value => { actual = value; } }), { state: 'copied', value: 'java.example.test' });
  assert.equal(actual, 'java.example.test');
  assert.deepEqual(await interactions.copyConnectionValue(presentation, 'port'), { state: 'unavailable', value: null });
});

test('clipboard absence and refusal return the exact Bedrock port for manual copying', async () => {
  assert.equal(typeof interactions.copyConnectionValue, 'function');
  const presentation = getConnectionPresentation(published, 'Bedrock');
  for (const clipboard of [undefined, { writeText: async () => { throw new Error('denied'); } }]) {
    assert.deepEqual(await interactions.copyConnectionValue(presentation, 'port', clipboard), { state: 'manual', value: '25000' });
  }
});

test('document language tracks both transitions without altering persistence', () => {
  assert.equal(typeof interactions.syncDocumentLanguage, 'function');
  const document = { documentElement: { lang: 'ko' } };
  interactions.syncDocumentLanguage(document, 'en');
  assert.equal(document.documentElement.lang, 'en');
  interactions.syncDocumentLanguage(document, 'ko');
  assert.equal(document.documentElement.lang, 'ko');
});
