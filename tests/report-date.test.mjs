import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { formatReportDate, formatReportTimestamp } from '../app/shared/reportDate.mjs';

test('bilingual report timestamps avoid ICU-specific day periods at midnight, morning, noon and afternoon', () => {
  const cases = [
    ['2026-10-01T15:00:00Z', '2026년 10월 2일 00:00', 'Oct 2, 2026, 00:00'],
    ['2026-08-19T00:00:00Z', '2026년 8월 19일 09:00', 'Aug 19, 2026, 09:00'],
    ['2026-08-19T03:00:00Z', '2026년 8월 19일 12:00', 'Aug 19, 2026, 12:00'],
    ['2026-08-19T07:29:15.546424+00:00', '2026년 8월 19일 16:29', 'Aug 19, 2026, 16:29'],
  ];
  for (const [value, ko, en] of cases) {
    assert.equal(formatReportTimestamp(value, 'ko'), ko, value);
    assert.equal(formatReportTimestamp(value, 'en'), en, value);
  }
});

test('report timestamps preserve the Seoul date through midnight and year boundaries', () => {
  assert.equal(formatReportTimestamp('2026-10-01T14:59:59Z', 'en'), 'Oct 1, 2026, 23:59');
  assert.equal(formatReportTimestamp('2026-10-01T15:00:00Z', 'en'), 'Oct 2, 2026, 00:00');
  assert.equal(formatReportTimestamp('2026-12-31T15:00:00Z', 'ko'), '2027년 1월 1일 00:00');
  assert.equal(formatReportTimestamp('2027-01-01T00:00:00+09:00', 'en'), 'Jan 1, 2027, 00:00');
});

test('server and visitor host zones produce identical bilingual report timestamps', () => {
  const formatterUrl = new URL('../app/shared/reportDate.mjs', import.meta.url).href;
  for (const zone of ['UTC', 'America/Los_Angeles', 'Asia/Seoul']) {
    const result = spawnSync(process.execPath, ['--input-type=module', '-e', `
      import { formatReportTimestamp } from ${JSON.stringify(formatterUrl)};
      console.log(JSON.stringify(['ko', 'en'].map(language => formatReportTimestamp('2026-08-19T07:29:15.546424+00:00', language))));
    `], { env: { TZ: zone }, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(JSON.parse(result.stdout), ['2026년 8월 19일 16:29', 'Aug 19, 2026, 16:29'], zone);
  }
});

test('report dates cross midnight according to the community time zone', () => {
  assert.equal(formatReportDate('2026-10-01T14:59:59Z', 'en'), 'Oct 1, 2026');
  assert.equal(formatReportDate('2026-10-01T15:00:00Z', 'en'), 'Oct 2, 2026');
  assert.equal(formatReportDate('2026-10-01T16:00:00Z', 'ko'), '2026년 10월 2일');
});

test('server and visitor host zones produce identical bilingual report dates', () => {
  const formatterUrl = new URL('../app/shared/reportDate.mjs', import.meta.url).href;
  for (const zone of ['UTC', 'America/Los_Angeles', 'Asia/Seoul']) {
    const result = spawnSync(process.execPath, ['--input-type=module', '-e', `
      import { formatReportDate } from ${JSON.stringify(formatterUrl)};
      console.log(JSON.stringify(['ko', 'en'].map(language => formatReportDate('2026-10-01T16:00:00Z', language))));
    `], { env: { TZ: zone }, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(JSON.parse(result.stdout), ['2026년 10월 2일', 'Oct 2, 2026'], zone);
  }
});

test('invalid report timestamps keep the bilingual unavailable state', () => {
  assert.equal(formatReportDate('not-a-date', 'ko'), '날짜 미상');
  assert.equal(formatReportDate('', 'en'), 'Date unavailable');
  assert.equal(formatReportTimestamp('bad-date', 'ko'), '날짜 미상');
  assert.equal(formatReportTimestamp('', 'en'), 'Date unavailable');
});
