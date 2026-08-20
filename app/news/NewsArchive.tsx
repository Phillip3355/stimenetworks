'use client';

import Link from 'next/link';
import { useLanguage } from '../components/LanguageProvider';
import styles from '../styles/news.module.css';

interface ReportSummary {
  id: string;
  slug: string;
  title: string;
  createdAt: string;
}

interface NewsArchiveProps {
  reports: ReportSummary[];
  loadFailed: boolean;
}

export default function NewsArchive({ reports, loadFailed }: NewsArchiveProps) {
  const { language, t } = useLanguage();

  const formatDate = (date: string) => new Intl.DateTimeFormat(
    language === 'ko' ? 'ko-KR' : 'en-US',
    { year: 'numeric', month: '2-digit', day: '2-digit' },
  ).format(new Date(date));

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>{t('뉴스 보기', 'News')}</h1>
        </header>

        {loadFailed ? (
          <section className={styles.state} role="alert">
            <p>{t('뉴스를 불러오지 못했습니다. 잠시 후 새로고침해주세요.', 'The news archive could not be loaded. Please refresh shortly.')}</p>
          </section>
        ) : reports.length === 0 ? (
          <section className={styles.state}>
            <p>{t('아직 발행된 뉴스가 없습니다.', 'No news has been published yet.')}</p>
          </section>
        ) : (
          <section className={styles.list} aria-label={t('발행된 뉴스', 'Published news')}>
            {reports.map((report) => (
              <Link key={report.id} href={`/${report.slug}`} className={styles.row}>
                <h2>{report.title}</h2>
                <time dateTime={report.createdAt}>{formatDate(report.createdAt)}</time>
              </Link>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
