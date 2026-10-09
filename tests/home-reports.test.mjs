import assert from 'node:assert/strict';
import test from 'node:test';
import { loadHomeReports } from '../app/server/homeReports.mjs';

test('home news preserves real titles, dates and case-sensitive report slugs', async () => {
  const state = await loadHomeReports(async () => ({ data: [{ id: '1', slug: 'News', content: '# Original report\nBody', created_at: '2026-10-01' }], error: null }));
  assert.deepEqual(state, { reports: [{ id: '1', slug: 'News', title: 'Original report', createdAt: '2026-10-01' }], loadFailed: false });
});

test('empty successful home news remains distinct from failed news', async () => {
  assert.deepEqual(await loadHomeReports(async () => ({ data: [], error: null })), { reports: [], loadFailed: false });
  assert.deepEqual(await loadHomeReports(async () => ({ data: null, error: { message: 'unavailable' } })), { reports: [], loadFailed: true });
  assert.deepEqual(await loadHomeReports(async () => { throw new Error('offline'); }), { reports: [], loadFailed: true });
});

test('a stalled home query has a bounded wait and aborts its request', async () => {
  let signal;
  const state = await loadHomeReports((requestSignal) => {
    signal = requestSignal;
    return new Promise(() => {});
  }, 10);
  assert.deepEqual(state, { reports: [], loadFailed: true });
  assert.equal(signal.aborted, true);
});
