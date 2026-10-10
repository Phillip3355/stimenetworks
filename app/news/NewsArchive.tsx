'use client';

import GuideHeader from '../components/GuideHeader';
import DocsLayout from '../components/DocsLayout';
import { formatReportDate } from '../shared/reportDate.mjs';
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

  return (
    <DocsLayout toc={[{ id: 'published-archive', labelKo: '발행 기록', labelEn: 'Published archive' }, { id: 'website-journal', labelKo: '웹사이트 기록', labelEn: 'Website journal' }]}>
      <GuideHeader eyebrow="STIMEMC / NEWS" titleKo="StimeMC 소식" titleEn="StimeMC news" descriptionKo="실제로 발행된 공지와 보고서를 최신순으로 확인하세요." descriptionEn="Published notices and reports, newest first." />
      <section id="published-archive" className={styles.archive} aria-labelledby="archive-heading">
        <div className={styles.archiveHeader}>
          <h2 id="archive-heading">{t('발행 기록', 'Published archive')}</h2>
          <span className={styles.archiveCount}>{loadFailed ? '—' : String(reports.length).padStart(2, '0')} {t('개의 기록', 'RECORDS')}</span>
        </div>
          <div className={styles.archiveBody}>
            {loadFailed ? (
              <section className={styles.state} role="alert">
                <h3>{t('뉴스를 불러올 수 없습니다', 'The archive is temporarily unavailable')}</h3>
                <p>{t('뉴스를 불러오지 못했습니다. 잠시 후 새로고침해주세요.', 'The news archive could not be loaded. Please refresh shortly.')}</p>
                <button type="button" onClick={() => window.location.reload()} className={styles.refreshButton}>{t('다시 불러오기', 'Try again')} <span aria-hidden="true">↻</span></button>
              </section>
            ) : reports.length === 0 ? (
              <section className={styles.state}>
                <h3>{t('다음 소식을 기다리는 공간', 'Room for the next story')}</h3>
                <p>{t('아직 발행된 뉴스가 없습니다.', 'No news has been published yet.')}</p>
              </section>
            ) : (
              <section className={styles.list} aria-label={t('발행된 뉴스', 'Published news')}>
                {reports.map((report) => (
                  <Link key={report.id} href={`/${report.slug}`} className={styles.row}>
                    <div className={styles.rowCopy}>
                      <span className={styles.rowLabel}>STIMEMC / REPORT</span>
                      <h3>{report.title}</h3>
                    </div>
                    <time dateTime={report.createdAt}>{formatReportDate(report.createdAt, language)}</time>
                    <span className={styles.rowArrow} aria-hidden="true">↗</span>
                  </Link>
                ))}
              </section>
            )}
          </div>
      </section>
      <section id="website-journal" className={styles.journal} aria-labelledby="journal-heading">
            <p className={styles.eyebrow}>{t('웹사이트 기록', 'WEBSITE JOURNAL')}</p>
            <h2 id="journal-heading">{t('홈페이지는 계속 바뀝니다', 'The website keeps evolving')}</h2>
            <p>{t('홈페이지의 디자인과 기능 변경 기록은 업데이트 페이지에서 확인할 수 있습니다.', 'Design and feature changes to the website are recorded in the update journal.')}</p>
            <Link href="/updates">{t('업데이트 기록 보기', 'View website updates')} <span aria-hidden="true">↗</span></Link>
      </section>
    </DocsLayout>
  );
}
