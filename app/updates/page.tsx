'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useLanguage } from '../components/LanguageProvider';
import styles from '../styles/server-mechanism.module.css';

const updateCards = [
  {
    title: '2026.05.28',
    titleEn: 'May 28, 2026',
    descriptionKo: '• 전체 디자인 미니멀 라이트 테마 전면 적용\n• 상단 고정형 블러 글래스모피즘 네비게이션 헤더 구축\n• 위에서 스윽 내려오는 3열 오프캔버스 전체 메뉴 패널 탑재\n• 마이크로 레이아웃 쉬프트(화면 튕김) 결함 해결\n• 신규 서버 가입 가이드(/join) 및 플레이 전 규칙 권장 CTA 추가\n• 카카오톡 커뮤니티(필수) 및 디스코드(선택) 가입 요건 명시\n• Vercel Analytics 및 Speed Insights 성능 분석 이식',
    descriptionEn: '• Applied premium minimalist light theme across all pages\n• Added sticky frosted-glass navigation header\n• Integrated elegant top-down offcanvas full menu panel\n• Resolved scrollbar layout shift jumping glitches\n• Created Join Server guide page (/join) with View Rules CTA\n• Specified KakaoTalk (mandatory) and Discord (optional) community guides\n• Integrated Vercel Analytics and Speed Insights tracking',
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
              'Stime Networks의 배포 이력과 최신 개선 사항을 기술 문서 형식으로 제공합니다.',
              'Provides deployment history and recent improvements in a concise update log.'
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
