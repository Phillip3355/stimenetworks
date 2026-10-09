'use client';

import { motion, useReducedMotion } from 'framer-motion';
import GuideHeader from '../components/GuideHeader';
import { useLanguage } from '../components/LanguageProvider';
import { historyEntries } from '../shared/siteContent.mjs';
import styles from '../styles/history.module.css';

export default function HistoryPage() {
  const { language, t } = useLanguage();
  const isKorean = language === 'ko';
  const reduceMotion = useReducedMotion();

  return (
    <main className={styles.main}>
      <GuideHeader eyebrow="STIMEMC / HISTORY" titleKo="우리가 여기까지 온 시간" titleEn="The time that brought us here" descriptionKo="작은 Bedrock 서버에서 시작한 기존 기록을 그대로 보존합니다. 여러 서버를 잇는 오늘의 방향은 아래 기록과 별도로 안내합니다." descriptionEn="The original record, beginning with a small Bedrock server, is preserved here. Today’s direction across multiple servers is presented separately from these entries." />
      <aside className={styles.direction}><p className={styles.eyebrow}>TODAY / STIMEMC</p><h2>{t('여러 세계, 하나의 Stime.', 'ONE COMMUNITY. MORE WORLDS.')}</h2><p>{t('The Great War는 운영 준비 중이며, Survival은 추가 계획 중입니다. 아래 연혁에 새로운 날짜나 사건을 덧붙이지 않고 서버 그룹의 방향을 별도로 소개합니다.', 'The Great War is preparing to operate, and Survival is planned for later. This server-group direction is presented separately without adding dates or events to the original timeline.')}</p></aside>

      <section className={styles.timelineSection} aria-labelledby="history-title">
        <div className={styles.timelineIntro}>
          <p className={styles.eyebrow}>{t('CHAPTERS', 'CHAPTERS')}</p>
          <h2 id="history-title">{t('서버가 자라온 방식', 'How the server grew')}</h2>
        </div>
        <ol className={styles.timeline}>
          {historyEntries.map((entry, index) => (
            <motion.li
              key={entry.year}
              className={styles.entry}
              initial={reduceMotion ? false : { opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.65, delay: index * 0.05 }}
            >
              <div className={styles.yearColumn}>
                <span className={styles.year}>{entry.year}</span>
                <span className={styles.entryLabel}>{isKorean ? entry.labelKo : entry.labelEn}</span>
              </div>
              <div className={styles.dot} aria-hidden="true" />
              <article className={styles.entryBody}>
                <h3>{isKorean ? entry.titleKo : entry.titleEn}</h3>
                <p>{isKorean ? entry.descriptionKo : entry.descriptionEn}</p>
                <ul>
                  {(isKorean ? entry.pointsKo : entry.pointsEn).map((point) => <li key={point}>{point}</li>)}
                </ul>
              </article>
            </motion.li>
          ))}
        </ol>
      </section>
    </main>
  );
}
