import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from '../styles/report.module.css';

export const revalidate = 0; // SSR to fetch reports instantly

interface ReportPageProps {
  params: Promise<{
    slug: string[];
  }>;
}

function extractTitleAndContent(markdown: string, fallbackTitle: string) {
  const match = markdown.match(/^\s*#\s+(.+)$/m);
  if (match) {
    const title = match[1].trim();
    const cleanedContent = markdown.replace(match[0], '').trim();
    return { title, content: cleanedContent };
  }
  // Formatted fallback title
  const formattedFallback = fallbackTitle
    .split('/')
    .map(part => part.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()))
    .join(' / ');
  return { title: formattedFallback, content: markdown };
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

  const { title, content } = extractTitleAndContent(report.content, slugPath);

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
        <Link href="/support" className={styles.backButton}>
          <span>←</span>
          <span>지원 페이지로 돌아가기</span>
        </Link>

        <header className={styles.header}>
          <span className={styles.badge}>Stime Report</span>
          <h1 className={styles.title}>{title}</h1>
          <div className={styles.metadata}>
            <span className={styles.author}>Stime Networks</span>
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
