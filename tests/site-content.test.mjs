import assert from 'node:assert/strict';
import test from 'node:test';
import * as siteContent from '../app/lib/siteContent.mjs';

import {
  getRuleDetail,
  homeIntro,
  homeFeatures,
  navigationGroups,
  requiredNavigationPaths,
  ruleMindMap,
  serverMechanismFlow,
  serverProfile,
  joinConnectionGuide,
} from '../app/lib/siteContent.mjs';

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
  assert.deepEqual(navigationGroups.map(({ labelKo }) => labelKo), ['안내', '유저', '기술']);
  assert.equal(navigationGroups.flatMap((group) => group.links).some(({ href }) => href === '/taskboard'), false);
  assert.deepEqual(navigationGroups[1].links.map(({ href }) => href), ['/join', '/support']);
  assert.deepEqual(navigationGroups[2].links.map(({ href }) => href), ['/server-mechanism', '/history']);
  assert.deepEqual(requiredNavigationPaths, [
    '/',
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
});

test('home feature learn-more links target the documented services', () => {
  assert.deepEqual(
    homeFeatures.map(({ href }) => href),
    ['/server-mechanism', '/server-mechanism', '/rules'],
  );
});

test('home introduction uses concise player-facing copy', () => {
  assert.equal(homeIntro.headingKo, '같이 접속하고, 즐길 수 있습니다.');
  assert.equal(homeIntro.headingEn, 'Connect and enjoy it together.');
});

test('home differentiators use every newly supplied server screenshot', () => {
  const usedImages = homeFeatures.flatMap((feature) => feature.images);

  assert.deepEqual(usedImages, [
    '/image.png',
    '/image copy.png',
    '/image copy 3.png',
    '/image copy 2.png',
    '/image copy 5.png',
    '/image copy 4.png',
  ]);

  for (const feature of homeFeatures) {
    assert.ok(feature.titleKo && feature.titleEn);
    assert.ok(feature.descriptionKo && feature.descriptionEn);
    assert.ok(feature.images.length > 0);
    assert.equal(feature.imageAltsKo.length, feature.images.length);
    assert.equal(feature.imageAltsEn.length, feature.images.length);
    assert.ok(feature.imageAltsKo.every((alt) => alt.length >= 10));
    assert.ok(feature.imageAltsEn.every((alt) => alt.length >= 10));
  }

  assert.deepEqual(
    homeFeatures.map(({ id }) => id),
    ['cross-edition', 'evolving-world', 'peaceful-rules'],
  );

  assert.equal(
    homeFeatures.filter((feature) =>
      feature.images.includes('/image copy 5.png'),
    ).length,
    1,
  );
  assert.equal(
    homeFeatures.find((feature) =>
      feature.images.includes('/image copy 5.png'),
    ).id,
    'evolving-world',
  );
});

test('home introduction presents copy 6 through 9 in world order', () => {
  assert.deepEqual(
    siteContent.homeWorldShowcase?.map(({ src }) => src),
    [
      '/image copy 6.png',
      '/image copy 7.png',
      '/image copy 8.png',
      '/image copy 9.png',
    ],
  );

  for (const artwork of siteContent.homeWorldShowcase ?? []) {
    assert.ok(artwork.altKo.length >= 10);
    assert.ok(artwork.altEn.length >= 10);
  }
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
