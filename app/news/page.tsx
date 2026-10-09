import type { Metadata } from 'next';
import NewsArchive from './NewsArchive';
import { getPublishedReports } from '../server/reports';
import { buildReportSummary } from '../shared/reportPresentation.mjs';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '뉴스',
  description: 'StimeMC에서 발행한 공지, 소식과 보고서를 최신순으로 확인하세요.',
};

export default async function NewsPage() {
  const { data, error } = await getPublishedReports();

  if (error) {
    console.error('Failed to load published reports:', error);
  }

  return (
    <NewsArchive
      reports={(data ?? []).map(buildReportSummary)}
      loadFailed={Boolean(error)}
    />
  );
}
