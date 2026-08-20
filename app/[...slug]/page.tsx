import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { extractReportTitleAndContent } from '../lib/reportPresentation.mjs';
import styles from '../styles/report.module.css';

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

  const { data: report, error } = await supabase
    .from('reports')
    .select('*')
    .eq('slug', slugPath)
    .single();

  if (error || !report) {
    notFound();
  }

  const { title, content } = extractReportTitleAndContent(report.content, slugPath);

  const formattedDate = new Date(report.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        {/* Navigation back button */}
        <Link href="/news" className={styles.backButton}>
          <span>←</span>
          <span>뉴스 목록으로 돌아가기</span>
        </Link>

        <header className={styles.header}>
          <span className={styles.badge}>Stime Report</span>
          <h1 className={styles.title}>{title}</h1>
          <div className={styles.metadata}>
            <span className={styles.author}>StimeMC</span>
            <span className={styles.separator}>|</span>
            <time dateTime={report.created_at}>{formattedDate}</time>
          </div>
        </header>

        <article className={styles.card}>
          <div className={styles.markdown}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </div>
        </article>
      </div>
    </main>
  );
}
