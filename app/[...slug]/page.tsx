import { notFound } from 'next/navigation';
import { supabase } from '../lib/supabase';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from '../styles/server-mechanism.module.css';

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

  return (
    <main className={styles.main}>
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>{slugPath}</h1>
          <p className={styles.heroSubtitle}>
            Published on {new Date(report.created_at).toLocaleString()}
          </p>
        </div>
      </section>

      <section className={styles.sectionCanvas}>
        <div className={styles.sectionContent} style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          <div style={{
            background: '#ffffff',
            padding: '40px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-hairline)',
            lineHeight: 1.8,
            fontSize: '1.05rem',
            color: 'var(--color-ink)'
          }}>
            {/* Custom basic styling for markdown elements */}
            <style>{`
              .markdown-content h1, .markdown-content h2, .markdown-content h3 {
                margin-top: 1.5em;
                margin-bottom: 0.5em;
                color: var(--color-ink);
                font-weight: 800;
              }
              .markdown-content h1 { font-size: 2.2rem; }
              .markdown-content h2 { font-size: 1.8rem; }
              .markdown-content h3 { font-size: 1.4rem; }
              .markdown-content p { margin-bottom: 1em; }
              .markdown-content ul, .markdown-content ol {
                margin-left: 1.5em;
                margin-bottom: 1em;
              }
              .markdown-content li { margin-bottom: 0.5em; }
              .markdown-content a { color: var(--color-primary); text-decoration: underline; }
              .markdown-content blockquote {
                border-left: 4px solid var(--color-primary);
                padding-left: 16px;
                color: var(--color-mute);
                margin: 1.5em 0;
                background: var(--color-canvas);
                padding: 16px;
                border-radius: 4px;
              }
              .markdown-content code {
                background: #f1f5f9;
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 0.9em;
                font-family: var(--font-geist-mono);
              }
              .markdown-content pre code {
                display: block;
                padding: 16px;
                overflow-x: auto;
                background: #1e293b;
                color: #f8fafc;
              }
            `}</style>
            <div className="markdown-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {report.content}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
