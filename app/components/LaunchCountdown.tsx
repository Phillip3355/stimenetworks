'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from './LanguageProvider';
import {
  formatCountdown,
  getCountdownParts,
  MAIN_SERVER_OPEN_AT,
} from '../lib/countdown.mjs';
import styles from '../styles/launch-countdown.module.css';

const unitLabels = [
  ['일', 'Days'],
  ['시간', 'Hours'],
  ['분', 'Minutes'],
  ['초', 'Seconds'],
];

export default function LaunchCountdown() {
  const { t } = useLanguage();
  const targetTime = useMemo(() => Date.parse(MAIN_SERVER_OPEN_AT), []);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const initialTickId = window.setTimeout(() => setNow(Date.now()), 0);
    const intervalId = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      window.clearTimeout(initialTickId);
      window.clearInterval(intervalId);
    };
  }, []);

  const parts = now === null ? null : getCountdownParts(targetTime, now);
  const formatted = parts ? formatCountdown(parts) : '--:--:--:--';
  const units = formatted.split(':');

  return (
    <section className={styles.section} aria-labelledby="launch-countdown-title">
      <Image
        src="/image copy 6.png"
        alt=""
        fill
        sizes="100vw"
        className={styles.backdrop}
      />
      <div className={styles.veil} />
      <div className={styles.scanline} aria-hidden="true" />

      <motion.div
        className={styles.content}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.28 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className={styles.topline}>
          <p>STIMEMC · MAIN SERVER LAUNCH</p>
          <p>2026.08.22 · SAT · 14:00 KST</p>
        </div>

        <div className={styles.headlineBlock}>
          <p className={styles.preTitle}>{t('월드가 열립니다', 'THE WORLD OPENS')}</p>
          <h2 id="launch-countdown-title" className={styles.title}>
            {t('메인 서버 오픈까지', 'Until the main server opens')}
          </h2>
        </div>

        <div
          id="launch-timer"
          className={styles.timer}
          role="timer"
          aria-label={`${t('메인 서버 오픈까지', 'Until the main server opens')} ${formatted}`}
        >
          {units.map((value, index) => (
            <div className={styles.unit} key={unitLabels[index][1]}>
              <span className={styles.value}>{value}</span>
              <span className={styles.unitLabel}>
                {t(unitLabels[index][0], unitLabels[index][1])}
              </span>
            </div>
          ))}
        </div>

        <div className={styles.footerLine}>
          <span>{t('모든 플레이어에게 열리는 첫 번째 순간', 'THE FIRST MOMENT, OPEN TO EVERY PLAYER')}</span>
          <span aria-hidden="true">STIMEMC / 0822</span>
        </div>
      </motion.div>
    </section>
  );
}
