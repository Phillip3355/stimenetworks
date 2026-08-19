import assert from 'node:assert/strict';
import test from 'node:test';

import {
  formatCountdown,
  getCountdownParts,
} from '../app/lib/countdown.mjs';

const launchAt = Date.parse('2026-08-22T14:00:00+09:00');

test('formats the remaining launch time as DD:HH:MM:SS', () => {
  const now = Date.parse('2026-08-19T12:34:56+09:00');

  const countdown = getCountdownParts(launchAt, now);

  assert.equal(formatCountdown(countdown), '03:01:25:04');
  assert.equal(countdown.complete, false);
});

test('shows zero at the exact launch time', () => {
  const countdown = getCountdownParts(launchAt, launchAt);

  assert.equal(formatCountdown(countdown), '00:00:00:00');
  assert.equal(countdown.complete, true);
});

test('never shows a negative countdown after launch', () => {
  const afterLaunch = Date.parse('2026-08-23T09:00:00+09:00');

  const countdown = getCountdownParts(launchAt, afterLaunch);

  assert.deepEqual(countdown, {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    complete: true,
  });
});
