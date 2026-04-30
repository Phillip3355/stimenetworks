'use client';

import { motion } from 'framer-motion';
import { LanguageProvider, useLanguage } from '../components/LanguageProvider';
import LanguageSwitch from '../components/LanguageSwitch';
import styles from '../styles/server-mechanism.module.css';

function ServerMechanismContent() {
  const { t, language } = useLanguage();

  return (
    <main className={styles.main}>
      <LanguageSwitch />
      <section className={styles.heroSection}>
        <motion.h1
          className={styles.title}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {t('서버 메커니즘', 'Server Mechanism')}
        </motion.h1>

        <motion.p
          className={styles.subtitle}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {t(
            'Stime Networks의 작동 방식을 한눈에 확인하세요',
            'Take a look at how Stime Networks works at a glance'
          )}
        </motion.p>
      </section>

      <section className={styles.imageSection}>
        <div className={styles.imagesContainer}>
          <motion.div
            className={styles.imageContainer}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            <img
              src={language === 'ko' ? '/KR1.png' : '/EN1.png'}
              alt={t('서버 메커니즘 다이어그램 1', 'Server Mechanism Diagram 1')}
              className={styles.mainImage}
            />
          </motion.div>

          <motion.div
            className={styles.imageContainer}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            <img
              src={language === 'ko' ? '/KR2.png' : '/EN2.png'}
              alt={t('서버 메커니즘 다이어그램 2', 'Server Mechanism Diagram 2')}
              className={styles.mainImage}
            />
          </motion.div>
        </div>
      </section>

      <section className={styles.cardsSection}>
        <div className={styles.cardsContainer}>
          <motion.div
            className={styles.explanationCard}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h3 className={styles.cardTitle}>
              {t('크로스플레이 시스템', 'Crossplay System')}
            </h3>
            <p className={styles.cardDescription}>
              {t('Java와 Bedrock 에디션 플레이어들이 하나의 서버에서 함께 플레이할 수 있는 혁신적인 시스템입니다.', 'An innovative system that allows Java and Bedrock Edition players to play together on a single server.')}
            </p>
          </motion.div>

          <motion.div
            className={styles.explanationCard}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <h3 className={styles.cardTitle}>
              {t('안전한 플레이 환경', 'Safe Play Environment')}
            </h3>
            <p className={styles.cardDescription}>
              {t('안티 치트 시스템과 공정한 규칙으로 모든 플레이어가 안전하고 즐겁게 게임을 즐길 수 있습니다.', 'With anti-cheat systems and fair rules, all players can enjoy a safe and fun gaming experience.')}
            </p>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

export default function ServerMechanism() {
  return (
    <LanguageProvider>
      <ServerMechanismContent />
    </LanguageProvider>
  );
}