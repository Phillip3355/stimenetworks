import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ReportArticle from '../components/ReportArticle';
import { getPublishedReport } from '../server/reports';
import { extractReportTitleAndContent } from '../shared/reportPresentation.mjs';

export const revalidate = 0; // SSR to fetch reports instantly

interface ReportPageProps {
  params: Promise<{
    slug: string[];
  }>;
}

export default async function ReportPage({ params }: ReportPageProps) {
  // Await the params before using its properties
  const resolvedParams = await params;
  
  if (!resolvedParams || !resolvedParams.slug) {
    notFound();
  }

  const slugPath = resolvedParams.slug.join('/');

  // Prevent matching static folders or known routes if somehow caught
  if (slugPath.startsWith('_next') || slugPath.startsWith('api')) {
    notFound();
  }

  const { data: report, error } = await getPublishedReport(slugPath);

  if (error || !report) {
    notFound();
  }

  const { title, content } = extractReportTitleAndContent(report.content, slugPath);

  return <ReportArticle title={title} content={content} createdAt={report.created_at} />;
}

export async function generateMetadata({ params }: ReportPageProps): Promise<Metadata> {
  const { slug } = await params;
  const slugPath = slug.join('/');
  if (slugPath.startsWith('_next') || slugPath.startsWith('api')) return { title: 'Report' };
  const { data: report } = await getPublishedReport(slugPath);
  if (!report) return { title: 'Report' };
  const { title } = extractReportTitleAndContent(report.content, slugPath);
  return { title, description: 'StimeMC에서 발행한 보고서. Published StimeMC report.' };
}
