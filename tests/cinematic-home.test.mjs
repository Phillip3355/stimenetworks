import assert from 'node:assert/strict';
import test from 'node:test';
import { sampleTimeline, chooseQuality, qualitySettings, adaptQuality } from '../app/components/home/timeline.mjs';

test('overscroll and malformed progress cannot move the camera outside the journey', () => {
  assert.deepEqual(sampleTimeline(-1, false), sampleTimeline(0, false));
  assert.deepEqual(sampleTimeline(2, false), sampleTimeline(1, false));
  assert.deepEqual(sampleTimeline(NaN, false), sampleTimeline(0, false));
});

test('the camera has no cuts at chapter boundaries and all poses stay finite', () => {
  for (const mobile of [false, true]) {
    for (let n = 0; n <= 600; n++) {
      const pose = sampleTimeline(n / 600, mobile);
      assert.ok(Object.values(pose).flat().every(Number.isFinite));
    }
    for (let n = 1; n < 6; n++) {
      const before = sampleTimeline(n / 6 - 0.000001, mobile);
      const after = sampleTimeline(n / 6 + 0.000001, mobile);
      assert.ok(Math.abs(before.camera[0] - after.camera[0]) < 0.01);
      assert.ok(Math.abs(before.network - after.network) < 0.01);
    }
  }
  assert.notDeepEqual(sampleTimeline(0, true).camera, sampleTimeline(0, false).camera);
});

test('limited or unknown hardware starts conservatively and save-data wins', () => {
  assert.equal(chooseQuality({}), 'balanced');
  assert.equal(chooseQuality({ cores: 2, memory: 8 }), 'low');
  assert.equal(chooseQuality({ cores: 16, memory: 2 }), 'low');
  assert.equal(chooseQuality({ cores: 16, memory: 16, saveData: true }), 'low');
  assert.equal(chooseQuality({ cores: 16, memory: 16, mobile: true }), 'balanced');
  assert.equal(chooseQuality({ cores: 16, memory: 16 }), 'high');
});

test('high-density and ultrawide displays cannot exceed the framebuffer budget', () => {
  for (const level of ['low', 'balanced', 'high']) {
    for (const [width, height] of [[360, 800], [1440, 900], [5120, 2160]]) {
      const quality = qualitySettings(level, 3, width, height);
      assert.ok(width * height * quality.dpr ** 2 <= 2400001);
      assert.ok(quality.dpr <= (level === 'low' ? 1 : level === 'balanced' ? 1.25 : 1.5));
    }
  }
});

test('quality drops only after sustained load, never below low or upward on its own', () => {
  assert.equal(adaptQuality('high', Array(10).fill(45)), 'high');
  assert.equal(adaptQuality('high', Array(60).fill(40)), 'balanced');
  assert.equal(adaptQuality('balanced', Array(60).fill(45)), 'low');
  assert.equal(adaptQuality('low', Array(60).fill(80)), 'low');
  assert.equal(adaptQuality('balanced', Array(60).fill(3)), 'balanced');
  assert.equal(adaptQuality('high', [...Array(59).fill(5), 200]), 'high');
});
