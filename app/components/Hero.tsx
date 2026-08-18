'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from './LanguageProvider';
import styles from '../styles/hero.module.css';

export default function Hero() {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();

  const reveal = (delay: number) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: reduceMotion ? 0 : 0.68,
      delay: reduceMotion ? 0 : delay,
      ease: [0.22, 0.75, 0.2, 1] as [number, number, number, number],
    },
  });

  return (
    <section className={styles.heroSection} aria-labelledby="home-title">
      <motion.div
        className={styles.imageFrame}
        initial={reduceMotion ? false : { scale: 1.035 }}
        animate={{ scale: 1 }}
        transition={{ duration: reduceMotion ? 0 : 8, ease: [0.2, 0.6, 0.2, 1] }}
      >
        <Image
          className={styles.heroImage}
          src="/NEW2.webp"
          alt={t('구름 위에서 바라본 Stime Networks 서버 월드', 'The Stime Networks server world viewed above the clouds')}
          fill
          priority
          sizes="100vw"
        />
      </motion.div>
      <div className={styles.overlay} />

      <div className={styles.content}>
        <motion.p className={styles.kicker} {...reveal(0.08)}>
          {t('실제 서버 월드 · 운영 중', 'Live server world · Online')}
        </motion.p>
        <motion.h1 id="home-title" className={styles.title} {...reveal(0.16)}>
          Stime Networks
        </motion.h1>
        <motion.p className={styles.description} {...reveal(0.24)}>
          {t(
            'Java와 Bedrock 플레이어가 함께 쌓아가는 평화로운 생존 서버입니다.',
            'A peaceful survival server built together by Java and Bedrock players.',
          )}
        </motion.p>
        <motion.div className={styles.actions} {...reveal(0.32)}>
          <Link href="/join" className={styles.primaryAction}>
            {t('서버에 가입하기', 'Join the server')}
          </Link>
          <Link href="/voice" className={styles.secondaryAction}>
            {t('STAGE 입장', 'Enter STAGE')}
          </Link>
        </motion.div>
      </div>

      <div className={styles.archiveIndex} aria-hidden="true">
        <span>01</span>
        <span>Living Server Archive</span>
        <span>2026</span>
      </div>
    </section>
  );
}
