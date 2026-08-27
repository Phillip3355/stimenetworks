'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '../components/LanguageProvider';
import { historyEntries } from '../lib/siteContent.mjs';
import styles from '../styles/history.module.css';

export default function HistoryPage() {
  const { language, t } = useLanguage();
  const isKorean = language === 'ko';

  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>{t('STIMEMC ARCHIVE · 2023—2026', 'STIMEMC ARCHIVE · 2023—2026')}</p>
          <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }}>
            {t('우리가 여기까지 온 시간', 'The time that brought us here')}
          </motion.h1>
          <motion.p className={styles.heroLead} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.1 }}>
            {t('작은 Bedrock 서버에서 시작해, 더 열린 StimeMC를 만들기까지의 기록입니다.', 'From a small Bedrock server to a more open StimeMC — this is our record.')}
          </motion.p>
        </div>
      </section>

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
              initial={{ opacity: 0, y: 28 }}
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
