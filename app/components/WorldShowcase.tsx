'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { homeWorldShowcase } from '../lib/siteContent.mjs';
import styles from '../styles/world-showcase.module.css';
import { useLanguage } from './LanguageProvider';

export default function WorldShowcase() {
  const { language, t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const [leadImage, ...supportingImages] = homeWorldShowcase;

  const getAlt = (altKo: string, altEn: string) =>
    language === 'ko' ? altKo : altEn;

  return (
    <div
      className={styles.showcase}
      aria-label={t('StimeMC 서버 전경', 'Views of the StimeMC server')}
        >
      <motion.figure
        className={styles.lead}
        initial={reduceMotion ? false : { opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{
          duration: reduceMotion ? 0 : 0.85,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <Image
          src={leadImage.src}
          alt={getAlt(leadImage.altKo, leadImage.altEn)}
          fill
          priority
          unoptimized
          sizes="(max-width: 820px) 100vw, 1360px"
          className={styles.image}
        />
      </motion.figure>

      <div className={styles.grid}>
        {supportingImages.map((artwork, index) => (
          <motion.figure
            className={styles.artwork}
            key={artwork.id}
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.18 }}
            transition={{
              duration: reduceMotion ? 0 : 0.72,
              delay: reduceMotion ? 0 : index * 0.08,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <Image
              src={artwork.src}
              alt={getAlt(artwork.altKo, artwork.altEn)}
              fill
              unoptimized
              sizes="(max-width: 820px) 100vw, 33vw"
              className={styles.image}
            />
          </motion.figure>
        ))}
      </div>
    </div>
  );
}
