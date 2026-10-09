'use client';

import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useLanguage } from './LanguageProvider';
import { formatReportTimestamp } from '../shared/reportDate.mjs';
import styles from '../styles/report.module.css';

export default function ReportArticle({ title, content, createdAt }: { title: string; content: string; createdAt: string }) {
  const { language, t } = useLanguage();
  return <main className={styles.main}>
    <div className={styles.container}>
      <Link href="/news" className={styles.backButton}><span aria-hidden="true">←</span><span>{t('뉴스 목록으로 돌아가기', 'Back to news')}</span></Link>
      <header className={styles.header}>
        <span className={styles.badge}>STIMEMC / REPORT</span><h1 className={styles.title}>{title}</h1>
        <div className={styles.metadata}><span className={styles.author}>StimeMC</span><span className={styles.separator} aria-hidden="true">|</span><time dateTime={createdAt}>{formatReportTimestamp(createdAt, language)}</time><span>{t('한국 시간', 'Asia/Seoul')}</span></div>
      </header>
      <article className={styles.card}><div className={styles.markdown}><ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown></div></article>
    </div>
  </main>;
}
