import type { Metadata } from 'next';
import NewsArchive from './NewsArchive';
import { supabase } from '../lib/supabase';
import { buildReportSummary } from '../lib/reportPresentation.mjs';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '뉴스 | StimeMC',
  description: 'StimeMC에서 발행한 공지, 소식과 보고서를 최신순으로 확인하세요.',
};

export default async function NewsPage() {
  const { data, error } = await supabase
    .from('reports')
    .select('id, slug, content, created_at')
    .order('created_at', { ascending: false });

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
