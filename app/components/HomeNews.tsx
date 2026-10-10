'use client';
import Link from 'next/link';
import { useLanguage } from './LanguageProvider';
import { formatReportDate } from '../shared/reportDate.mjs';
import styles from '../styles/home-sections.module.css';

interface ReportSummary { id: string; slug: string; title: string; createdAt: string }
export default function HomeNews({ reports, loadFailed }: { reports: ReportSummary[]; loadFailed: boolean }) {
  const { language, t } = useLanguage();
  return (
    <section data-scroll-reveal className={styles.section} aria-labelledby="home-news-title">
      <div className={styles.container}>
        <header className={styles.header}><p className={styles.eyebrow}>STIMEMC NEWS</p><h2 id="home-news-title">{t('커뮤니티의 최근 소식.', 'From the community.')}</h2></header>
        {loadFailed ? <p className={styles.newsState} role="status">{t('최근 소식을 불러오지 못했습니다. 뉴스 페이지에서 다시 확인해주세요.', 'Recent news could not be loaded. Please try again on the news page.')}</p> : reports.length === 0 ? <p className={styles.newsState}>{t('아직 발행된 뉴스가 없습니다.', 'No news has been published yet.')}</p> : <div className={styles.newsList}>{reports.map((report) => <Link key={report.id} href={`/${report.slug}`} className={styles.newsRow}><h3>{report.title}</h3><time dateTime={report.createdAt}>{formatReportDate(report.createdAt, language)}</time><span aria-hidden="true">↗</span></Link>)}</div>}
        <Link className={styles.textLink} href="/news">{t('모든 뉴스 보기', 'All news')} <span aria-hidden="true">↗</span></Link>
      </div>
    </section>
  );
}
