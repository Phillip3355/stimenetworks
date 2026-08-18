import assert from 'node:assert/strict';
import test from 'node:test';

import {
  homeFeatures,
  navigationGroups,
  requiredNavigationPaths,
} from '../app/lib/siteContent.mjs';

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
    ['/join', '/server-mechanism', '/support'],
  );
});

test('home features have bilingual copy and real server imagery', () => {
  for (const feature of homeFeatures) {
    assert.ok(feature.titleKo && feature.titleEn);
    assert.ok(feature.descriptionKo && feature.descriptionEn);
    assert.match(feature.image, /^\/(?:NEW\d|minecraft\d*)\.webp$/);
  }
});
