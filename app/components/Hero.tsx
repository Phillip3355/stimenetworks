'use client';

import { motion } from 'framer-motion';
import { useLanguage } from './LanguageProvider';
import styles from '../styles/hero.module.css';

export default function Hero() {
  const { t } = useLanguage();

  return (
    <section className={styles.heroSection}>
      {/* 배경 오버레이 */}
      <div className={styles.overlay}></div>

      {/* 애니메이션 배경 요소들 */}
      <motion.div className={styles.bgElement1} />
      <motion.div className={styles.bgElement2} />
      <motion.div className={styles.bgElement3} />

      {/* 컨텐츠 */}
      <div className={styles.heroContent}>
        {/* 제목 */}
        <motion.h1
          className={styles.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {t('Stime Networks', 'Stime Networks')}
        </motion.h1>

        {/* 부제목 */}
        <motion.p
          className={styles.subtitle}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {t(
            'Java / Bedrock 크로스플레이 마인크래프트 서버',
            'Java / Bedrock Crossplay Minecraft Server for Everyone'
          )}
        </motion.p>

        {/* 버튼 */}
        <motion.button
          className={styles.ctaButton}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.location.href = '/server-mechanism'}
        >
          {t('서버 메커니즘 보기', 'View Server Mechanism')}
        </motion.button>
      </div>

      {/* 스크롤 인디케이터 */}
      <motion.div
        className={styles.scrollIndicator}
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className={styles.scrollArrow}>↓</div>
      </motion.div>
    </section>
  );
}
