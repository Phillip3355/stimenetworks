'use client';

import Link from 'next/link';
import GuideHeader from '../components/GuideHeader';
import DocsLayout from '../components/DocsLayout';
import { useLanguage } from '../components/LanguageProvider';
import { historyEntries } from '../shared/siteContent.mjs';
import styles from '../styles/history.module.css';

export default function HistoryPage() {
  const { language, t } = useLanguage();
  const isKorean = language === 'ko';

  return (
    <DocsLayout toc={[...historyEntries.map((entry) => ({ id: `history-${entry.year.replace('.', '-')}`, labelKo: `${entry.year} · ${entry.labelKo}`, labelEn: `${entry.year} · ${entry.labelEn}` })), { id: 'history-today', labelKo: '지금의 StimeMC', labelEn: 'StimeMC today' }]}>
      <GuideHeader eyebrow="STIMEMC / HISTORY" titleKo="우리가 여기까지 온 시간" titleEn="The time that brought us here" descriptionKo="작은 Bedrock 서버에서 시작한 기존 기록을 그대로 보존합니다. 여러 서버를 잇는 오늘의 방향은 아래 기록과 별도로 안내합니다." descriptionEn="The original record, beginning with a small Bedrock server, is preserved here. Today’s direction across multiple servers is presented separately from these entries." />
      <div className={styles.historyIndex}><span>{t('서버가 자라온 방식', 'How the server grew')}</span><span>2023.04 — 2026.08</span></div>
      <div className={styles.chapters}>
        {historyEntries.map((entry) => (
          <section data-scroll-reveal key={entry.year} id={`history-${entry.year.replace('.', '-')}`} className={styles.chapter} aria-labelledby={`title-${entry.year.replace('.', '-')}`}>
            <div className={styles.chapterMeta}><time dateTime={entry.year.replace('.', '-')}>{entry.year}</time><span>{isKorean ? entry.labelKo : entry.labelEn}</span></div>
            <h2 id={`title-${entry.year.replace('.', '-')}`}>{isKorean ? entry.titleKo : entry.titleEn}</h2>
            <p>{isKorean ? entry.descriptionKo : entry.descriptionEn}</p>
            <ul className={styles.facts}>{(isKorean ? entry.pointsKo : entry.pointsEn).map((point) => <li key={point}>{point}</li>)}</ul>
          </section>
        ))}
      </div>
      <section data-scroll-reveal id="history-today" className={styles.direction} aria-labelledby="today-title">
        <p className={styles.eyebrow}>TODAY / STIMEMC</p>
        <h2 id="today-title">{t('여러 세계, 하나의 Stime.', 'ONE COMMUNITY. MORE WORLDS.')}</h2>
        <p>{t('The Great War는 운영 준비 중이며, Survival은 추가 계획 중입니다. 아래 연혁에 새로운 날짜나 사건을 덧붙이지 않고 서버 그룹의 방향을 별도로 소개합니다.', 'The Great War is preparing to operate, and Survival is planned for later. This server-group direction is presented separately without adding dates or events to the original timeline.')}</p>
        <Link href="/servers">{t('지금의 서버 그룹 보기', 'Explore the server group')} <span aria-hidden="true">→</span></Link>
      </section>
    </DocsLayout>
  );
}
