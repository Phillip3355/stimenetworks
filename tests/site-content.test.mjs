import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const rulesPageSource = await readFile(new URL('../app/rules/page.tsx', import.meta.url), 'utf8');

import {
  getRuleDetail,
  navigationGroups,
  requiredNavigationPaths,
  ruleMindMap,
  serverMechanismFlow,
  serverProfile,
  joinConnectionGuide,
} from '../app/shared/siteContent.mjs';

test('server profile exposes the player-facing crossplay mod experience', () => {
  assert.deepEqual(serverProfile.editions, ['Java', 'Bedrock']);
  assert.equal(serverProfile.modScope, 'server-side');
  assert.equal(serverProfile.clientModRequired, false);
  assert.equal(serverProfile.accessModel, 'open');
  assert.ok(serverProfile.playerPromiseKo.includes('별도 모드 설치 없이'));
  assert.ok(serverProfile.playerPromiseEn.includes('without installing client mods'));
});

test('server mechanism flow explains ViaProxy and Geyser as the connection bridge', () => {
  assert.deepEqual(
    serverMechanismFlow.nodes.map(({ id }) => id),
    ['java', 'bedrock', 'viaproxy', 'geyser', 'notes'],
  );
  assert.match(serverMechanismFlow.root.descriptionKo, /ViaProxy/);
  assert.match(serverMechanismFlow.nodes.find(({ id }) => id === 'geyser').descriptionKo, /번역/);
  assert.match(serverMechanismFlow.nodes.find(({ id }) => id === 'notes').descriptionKo, /UDP/);
});

test('join connection guide points Java players to version 1.21.1 and a server address', () => {
  assert.match(joinConnectionGuide.javaKo, /접속 버전: 1\.21\.1 버전/);
  assert.match(joinConnectionGuide.javaKo, /서버 주소/);
  assert.doesNotMatch(joinConnectionGuide.javaKo, /부여받은 서버 정보/);
});

test('navigation preserves every documented public and operational route', () => {
  assert.deepEqual(navigationGroups.map(({ labelEn }) => labelEn), ['Servers', 'News', 'Guide', 'About', 'Join']);
  assert.equal(navigationGroups.flatMap((group) => group.links).some(({ href }) => href === '/taskboard'), false);
  assert.deepEqual(requiredNavigationPaths, [
    '/',
    '/servers',
    '/servers/the-great-war',
    '/servers/survival',
    '/join',
    '/support',
    '/server-mechanism',
    '/rules',
    '/recovery-guidelines',
    '/updates',
    '/news',
    '/history',
  ]);

  const renderedPaths = navigationGroups.flatMap((group) =>
    group.links.map((link) => link.href),
  );

  for (const path of requiredNavigationPaths) {
    assert.ok(renderedPaths.includes(path), `navigation is missing ${path}`);
  }
  assert.ok(navigationGroups.find(({ id }) => id === 'guide').links.some(({ href }) => href === '/support'));
  assert.ok(navigationGroups.find(({ id }) => id === 'about').links.some(({ href }) => href === '/history'));
});

test('property theft rule explains ownership signs, villager trading, and village limits', () => {
  const detail = getRuleDetail('property-theft', 'ko');

  assert.match(detail.description, /닉네임.*표지판/);
  assert.match(detail.description, /허락 없이.*주민과 거래/);
  assert.match(detail.description, /주민마을 전체/);
});

test('severe violation appeals point players to the support page', () => {
  assert.match(rulesPageSource, /이의신청은 문의 페이지/);
  assert.doesNotMatch(rulesPageSource, /이의신청은 @Phillip_0211/);
});

test('rule mind map exposes clickable branches with detailed examples', () => {
  assert.equal(ruleMindMap.root.titleKo, 'StimeMC 서버 규칙');
  assert.ok(ruleMindMap.nodes.length >= 7);

  const detail = getRuleDetail('player-interference', 'ko');
  assert.equal(detail.title, '다른 플레이어의 플레이 방해 금지');
  assert.match(detail.description, /동의 없이/);
  assert.ok(detail.examples.includes('허락 없는 살인 또는 데미지 입히기'));

  const fallback = getRuleDetail('unknown-rule', 'en');
  assert.equal(fallback.id, ruleMindMap.nodes[0].id);
});
