'use client';

import { motion } from 'framer-motion';
import styles from '../styles/hero.module.css';

export default function Hero() {
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
          Stime Networks
        </motion.h1>

        {/* 부제목 */}
        <motion.p
          className={styles.subtitle}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Java Minecraft Server for Everyone
        </motion.p>
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
