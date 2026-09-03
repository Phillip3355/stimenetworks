'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from './LanguageProvider';
import { serverProfile } from '../lib/siteContent.mjs';
import { getHeroRevealTransition } from '../lib/homeMotion.mjs';
import styles from '../styles/hero.module.css';

export default function Hero() {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();

  const reveal = (index: number) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: {
      ...getHeroRevealTransition(index, Boolean(reduceMotion)),
      ease: [0.22, 0.75, 0.2, 1] as [number, number, number, number],
    },
  });

  return (
    <section className={styles.heroSection} aria-labelledby="home-title">
      <motion.div
        className={styles.imageFrame}
        initial={reduceMotion ? false : { scale: 1.02, x: '-0.8%' }}
        animate={reduceMotion ? undefined : { scale: 1.085, x: '0.8%' }}
        transition={{ duration: reduceMotion ? 0 : 18, ease: [0.2, 0.6, 0.2, 1] }}
      >
        <Image
          className={styles.heroImage}
          src="/image copy 10.png"
          alt={t('마을과 농장이 이어지는 StimeMC 서버 월드', 'The StimeMC server world with connected villages and farms')}
          fill
          priority
          sizes="100vw"
        />
      </motion.div>
      <div className={styles.overlay} />

      <div className={styles.content}>
        <motion.p className={styles.kicker} {...reveal(0)}>
          {t(serverProfile.kickerKo, serverProfile.kickerEn)}
        </motion.p>
        <motion.h1 id="home-title" className={styles.title} {...reveal(1)}>
          StimeMC
        </motion.h1>
        <motion.p className={styles.description} {...reveal(2)}>
          {t(
            serverProfile.playerPromiseKo,
            serverProfile.playerPromiseEn,
          )}
        </motion.p>
        <motion.div className={styles.actions} {...reveal(3)}>
          <Link href="/join" className={styles.primaryAction}>
            {t('서버에 가입하기', 'Join the server')}
          </Link>
        </motion.div>
      </div>

    </section>
  );
}
