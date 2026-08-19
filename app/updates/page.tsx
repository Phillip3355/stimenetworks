'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '../components/LanguageProvider';
import styles from '../styles/server-mechanism.module.css';

const updateCards = [
  {
    title: '2026.05.30',
    titleEn: 'May 30, 2026',
    descriptionKo: '• 모든 페이지에서 글자와 배경을 더 편하게 읽을 수 있도록 개선\n• 어디에서든 가입, 규칙, 문의 페이지로 빠르게 이동할 수 있는 하단 메뉴 추가\n• 화면 전환과 스크롤을 더 가볍고 안정적으로 정리',
    descriptionEn: '• Improved text and background readability across every page\n• Added footer navigation for quick access to joining, rules, and support\n• Made page transitions and scrolling lighter and more stable',
  },
  {
    title: '2026.05.28',
    titleEn: 'May 28, 2026',
    descriptionKo: '• 필요한 메뉴를 스크롤 중에도 바로 열 수 있도록 내비게이션 개선\n• 작은 화면에서 버튼과 내용이 튀거나 잘리는 현상 수정\n• Java·Bedrock 접속 방법과 플레이 전 규칙을 한곳에서 확인할 수 있는 가입 가이드 추가\n• 커뮤니티 참여 방법을 더 명확하게 안내',
    descriptionEn: '• Improved navigation so key pages remain easy to reach while scrolling\n• Fixed shifting and clipped controls on smaller screens\n• Added one join guide for Java, Bedrock, and pre-play rules\n• Made community participation steps clearer',
  },
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

export default function UpdatesPage() {
  const { t } = useLanguage();

  return (
    <main className={styles.main}>
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <motion.h1
            className={styles.heroTitle}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {t('업데이트 보기', 'Updates')}
          </motion.h1>

          <motion.p
            className={styles.heroSubtitle}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {t(
              '새로 추가된 콘텐츠와 달라진 기능을 확인하고, 다음 접속에서 무엇을 경험할 수 있는지 한눈에 살펴보세요.',
              'See what is new, what has changed, and what you can experience the next time you join.'
            )}
          </motion.p>
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
