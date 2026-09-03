import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getFeatureMotion,
  getHeroRevealTransition,
} from '../app/lib/homeMotion.mjs';

test('hero content reveals in reading order without delaying reduced-motion users', () => {
  assert.deepEqual(
    [0, 1, 2, 3].map((index) => getHeroRevealTransition(index, false).delay),
    [0.12, 0.24, 0.36, 0.48],
  );
  assert.deepEqual(getHeroRevealTransition(3, true), {
    duration: 0,
    delay: 0,
  });
});

test('feature sections use three distinct restrained entrances', () => {
  const motions = [0, 1, 2].map((index) => getFeatureMotion(index, false));

  assert.deepEqual(motions.map(({ kind }) => kind), [
    'clip-reveal',
    'depth-rise',
    'split-drift',
  ]);
  assert.deepEqual(motions.map(({ image }) => image), [
    { opacity: 0.72, scale: 1.07, clipPath: 'inset(0 0 100% 0)' },
    { opacity: 0.68, scale: 1.095, y: 28 },
    { opacity: 0.7, scale: 1.045, x: 34 },
  ]);
});

test('reduced motion keeps every feature visible and stationary', () => {
  for (const index of [0, 1, 2]) {
    assert.deepEqual(getFeatureMotion(index, true), {
      kind: 'reduced',
      image: false,
      copy: false,
    });
  }
});
