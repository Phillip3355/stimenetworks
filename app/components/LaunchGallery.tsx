'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { launchGallery } from '../lib/siteContent.mjs';
import { useLanguage } from './LanguageProvider';
import styles from '../styles/launch-gallery.module.css';

export default function LaunchGallery() {
  const { language, t } = useLanguage();

  return (
    <section id="launch-gallery" className={styles.section} aria-labelledby="launch-gallery-title">
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>STIMEMC · OPENING EXHIBITION</p>
          <h2 id="launch-gallery-title" className={styles.title}>
            {t('곧 여러분이 만나게 될 월드', 'The world you will enter next')}
          </h2>
        </div>
        <p className={styles.description}>
          {t(
            '타이머가 0이 되는 순간, 이 장면들은 더 이상 전시가 아니라 여러분의 모험이 됩니다.',
            'When the timer reaches zero, these scenes stop being an exhibition and become your adventure.',
          )}
        </p>
      </div>

      <div className={styles.gallery}>
        {launchGallery.map((artwork, index) => (
          <motion.figure
            className={styles.artwork}
            key={artwork.id}
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.18 }}
            transition={{
              duration: 0.82,
              delay: index * 0.09,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <Image
              src={artwork.src}
              alt={language === 'ko' ? artwork.altKo : artwork.altEn}
              fill
              loading="eager"
              unoptimized
              sizes="(max-width: 620px) 100vw, 33vw"
              className={styles.image}
            />
            <div className={styles.imageShade} aria-hidden="true" />
            <figcaption className={styles.caption}>
              <span>{artwork.index}</span>
              <strong>{language === 'ko' ? artwork.titleKo : artwork.titleEn}</strong>
            </figcaption>
          </motion.figure>
        ))}
      </div>

      <div className={styles.indexLine} aria-hidden="true">
        <span>WORLD CAPTURES / 003</span>
        <span>STIMEMC · 2026</span>
      </div>
    </section>
  );
}
