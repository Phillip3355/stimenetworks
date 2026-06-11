'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useLanguage } from './LanguageProvider';
import styles from '../styles/hero.module.css';

export default function Hero() {
  const { t } = useLanguage();

  return (
    <section className={styles.heroSection}>
      {/* 배경 이미지 (Next.js Image 컴포넌트 & WebP 최적화) */}
      <Image
        className={styles.heroBackgroundImage}
        src="/NEW2.webp"
        alt="Minecraft background"
        fill
        priority
        sizes="100vw"
        style={{ objectFit: 'cover' }}
      />

      {/* 배경 오버레이 */}
      <div className={styles.overlay}></div>

      {/* 컨텐츠 */}
      <div className={styles.heroContent}>
        {/* 제목 */}
        <motion.h1
          className={styles.title}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {t('Stime Networks', 'Stime Networks')}
        </motion.h1>

        {/* 부제목 */}
        <motion.p
          className={styles.subtitle}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {t(
            '다중 플랫폼 플레이어를 위한 엔지니어링 중심의 평화로운 서바이벌 마인크래프트 서버',
            'An engineering-first, peaceful survival Minecraft server for multi-platform players.'
          )}
        </motion.p>

        {/* 미니멀 버튼 그룹 */}
        <motion.div
          className={styles.buttonGroup}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Link href="/support" className={styles.primaryBtn}>
            {t('문의/업무하기', 'Support / Taskboard')}
          </Link>
          <Link href="/join" className={styles.secondaryBtn}>
            {t('서버에 가입하기', 'Join Server')}
          </Link>
        </motion.div>
      </div>

      {/* 스크롤 인디케이터 */}
      <motion.div
        className={styles.scrollIndicator}
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span className={styles.scrollArrow}>↓</span>
      </motion.div>
    </section>
  );
}
