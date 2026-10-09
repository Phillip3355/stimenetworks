import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { formatReportDate } from '../app/shared/reportDate.mjs';

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
});
