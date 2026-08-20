import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildReportSummary,
  extractReportTitleAndContent,
} from '../app/lib/reportPresentation.mjs';

test('builds a single-line news item without exposing report body content', () => {
  assert.deepEqual(
    buildReportSummary({
      id: 'report-1',
      slug: 'news/launch-day',
      content: '# 메인 서버 오픈\n\n**Java와 Bedrock** 플레이어가 같은 월드에서 만납니다.\n\n- 새로운 건축물 공개',
      created_at: '2026-08-20T04:00:00.000Z',
    }),
    {
      id: 'report-1',
      slug: 'news/launch-day',
      title: '메인 서버 오픈',
      createdAt: '2026-08-20T04:00:00.000Z',
    },
  );
});

test('uses a readable slug title when a report has no Markdown heading', () => {
  assert.deepEqual(
    extractReportTitleAndContent('서버 점검이 완료되었습니다.', 'server/maintenance-complete'),
    {
      title: 'Server / Maintenance Complete',
      content: '서버 점검이 완료되었습니다.',
    },
  );
});
