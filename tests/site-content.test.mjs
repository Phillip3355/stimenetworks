import assert from 'node:assert/strict';
import test from 'node:test';
import * as siteContent from '../app/lib/siteContent.mjs';

import {
  getRuleDetail,
  homeFeatures,
  navigationGroups,
  requiredNavigationPaths,
  ruleMindMap,
  serverProfile,
} from '../app/lib/siteContent.mjs';

test('server profile exposes the player-facing crossplay mod experience', () => {
  assert.deepEqual(serverProfile.editions, ['Java', 'Bedrock']);
  assert.equal(serverProfile.modScope, 'server-side');
  assert.equal(serverProfile.clientModRequired, false);
  assert.equal(serverProfile.accessModel, 'open');
  assert.ok(serverProfile.playerPromiseKo.includes('별도 모드 설치 없이'));
  assert.ok(serverProfile.playerPromiseEn.includes('without installing client mods'));
});

test('navigation preserves every documented public and operational route', () => {
  assert.deepEqual(requiredNavigationPaths, [
    '/',
    '/join',
    '/support',
    '/taskboard',
    '/voice',
    '/server-mechanism',
    '/rules',
    '/recovery-guidelines',
    '/updates',
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

test('launch gallery presents copy 7, 8, and 9 in exhibition order', () => {
  assert.deepEqual(
    siteContent.launchGallery?.map(({ src }) => src),
    ['/image copy 7.png', '/image copy 8.png', '/image copy 9.png'],
  );

  for (const artwork of siteContent.launchGallery ?? []) {
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
