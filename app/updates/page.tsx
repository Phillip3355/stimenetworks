'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { LanguageProvider, useLanguage } from '../components/LanguageProvider';
import LanguageSwitch from '../components/LanguageSwitch';
import styles from '../styles/server-mechanism.module.css';

const updateCards = [
  {
    title: '2026.05.21',
    titleEn: 'May 21, 2026',
    descriptionKo: '• 업데이트 순서 버그 수정\n• 복구 가이드라인 수정\n• 홈페이지 디자인 요소 추가 ',
    descriptionEn: '• Fixed update order bug\n• Updated recovery guidelines\n• Added more design elements to the website',
  },
  {
    title: '2026.05.14',
    titleEn: 'May 14, 2026',
    descriptionKo: '• 홈페이지 버튼 디자인 변경\n• 복구 가이드라인 추가 ',
    descriptionEn: '• Homepage button design update\n• Added recovery guidelines',
  },
  {
    title: '2026.05.07',
    titleEn: 'May 7, 2026',
    descriptionKo: '• 카드 디자인 변경\n• 홈페이지 내용 추가 ',
    descriptionEn: '• Card design update\n• Added more content to the website',
  },
  {
    title: '2026.05.03',
    titleEn: 'May 3, 2026',
    descriptionKo: '• 홈페이지 디자인 변경\n• 홈페이지 내용 추가 ',
    descriptionEn: '• Homepage design update\n• Added more content to the website',
  },

];

function UpdatesContent() {
  const { t } = useLanguage();

  return (
    <main className={styles.main}>
      <LanguageSwitch />

      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <motion.h1
            className={styles.heroTitle}
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {t('업데이트 보기', 'Updates')}
          </motion.h1>

          <motion.p
            className={styles.heroSubtitle}
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {t(
              'Stime Networks의 배포 이력과 최신 개선 사항을 기술 문서 형식으로 제공합니다.',
              'Provides deployment history and recent improvements in a concise update log.'
            )}
          </motion.p>

          <div className={styles.heroActions}>
            <Link href="/" className={styles.buttonOutline}>
              {t('홈으로 돌아가기', 'Back to Home')}
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.sectionCanvas}>
        <div className={styles.sectionContent}>
          <div className={styles.sectionHeader}>
            <p className={styles.eyebrow}>{t('배포 노트', 'Release Notes')}</p>
            <h2 className={styles.sectionHeading}>{t('최근 업데이트', 'Recent Updates')}</h2>
          </div>

          <div className={styles.timelineGrid}>
            {updateCards.map((card, index) => (
              <article key={index} className={styles.timelineCard}>
                <span className={styles.cornerSquare} />
                <p className={styles.timelineDate}>{card.title}</p>
                <h3 className={styles.timelineTitle}>{card.titleEn}</h3>
                <p className={styles.timelineText}>{t(card.descriptionKo, card.descriptionEn)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default function UpdatesPage() {
  return (
    <LanguageProvider>
      <UpdatesContent />
    </LanguageProvider>
  );
}
