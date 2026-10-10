'use client';

import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useLanguage } from './LanguageProvider';
import { formatReportTimestamp } from '../shared/reportDate.mjs';
import styles from '../styles/report.module.css';
import DocsLayout from './DocsLayout';

export default function ReportArticle({ title, content, createdAt }: { title: string; content: string; createdAt: string }) {
  const { language, t } = useLanguage();
  return <DocsLayout toc={[{ id: 'report-heading', labelKo: '보고서 개요', labelEn: 'Report overview' }, { id: 'report-content', labelKo: '본문', labelEn: 'Article' }, { id: 'report-related', labelKo: '다른 소식', labelEn: 'More news' }]}>
      <Link href="/news" className={styles.backButton}><span aria-hidden="true">←</span><span>{t('뉴스 목록으로 돌아가기', 'Back to news')}</span></Link>
      <header id="report-heading" className={styles.header}>
        <span className={styles.badge}>STIMEMC / PUBLISHED REPORT</span><h1 className={styles.title}>{title}</h1>
        <div className={styles.metadata}><span className={styles.author}>StimeMC</span><span className={styles.separator} aria-hidden="true">|</span><time dateTime={createdAt}>{formatReportTimestamp(createdAt, language)}</time><span>{t('한국 시간', 'Asia/Seoul')}</span></div>
      </header>
      <article id="report-content" className={styles.article}><div className={styles.markdown}><ReactMarkdown remarkPlugins={[remarkGfm]} components={{
        pre: ({ children }) => <pre tabIndex={0} aria-label={t('코드 블록', 'Code block')}>{children}</pre>,
        table: ({ children }) => <table tabIndex={0} aria-label={t('본문 데이터 표', 'Article data table')}>{children}</table>,
      }}>{content}</ReactMarkdown></div></article>
      <footer data-scroll-reveal id="report-related" className={styles.articleFooter}><span>STIMEMC / END OF REPORT</span><Link href="/news">{t('다른 소식 보기', 'Explore more news')} <span aria-hidden="true">→</span></Link></footer>
  </DocsLayout>;
}
