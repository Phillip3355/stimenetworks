'use client';

import { useLanguage } from '../components/LanguageProvider';
import { motion } from 'framer-motion';
import { serverMechanismFlow } from '../lib/siteContent.mjs';
import styles from '../styles/server-mechanism.module.css';

export default function ServerMechanism() {
  const { language, t } = useLanguage();
  const isKorean = language === 'ko';
  const { root, nodes } = serverMechanismFlow;

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
            {isKorean ? root.titleKo : root.titleEn}
          </motion.h1>
          <motion.p
            className={styles.heroSubtitle}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {isKorean ? root.descriptionKo : root.descriptionEn}
          </motion.p>
        </div>
      </section>
      <section className={styles.sectionCanvas}>
        <div className={styles.sectionContent}>
          <header className={styles.mechanismHeader}>
            <p className={styles.eyebrow}>{isKorean ? root.eyebrowKo : root.eyebrowEn}</p>
            <h2 className={styles.sectionHeading}>{t('접속이 이어지는 방식', 'How the connection comes together')}</h2>
          </header>

          <ol className={styles.mechanismTree} aria-label={t('StimeMC 접속 흐름', 'StimeMC connection flow')}>
            {nodes.map((node) => (
              <li className={styles.mechanismNode} key={node.id}>
                <div className={styles.nodeMarker} aria-hidden="true"><span>{node.index}</span></div>
                <article className={styles.nodeBody}>
                  <div className={styles.nodeCopy}>
                    <p className={styles.nodeEyebrow}>{isKorean ? node.eyebrowKo : node.eyebrowEn}</p>
                    <h2 className={styles.nodeTitle}>{isKorean ? node.titleKo : node.titleEn}</h2>
                    <p className={styles.nodeDescription}>{isKorean ? node.descriptionKo : node.descriptionEn}</p>
                  </div>
                  <ul className={styles.nodePoints}>
                    {(isKorean ? node.pointsKo : node.pointsEn).map((point) => <li key={point}>{point}</li>)}
                    {node.href ? <li><a href={node.href} target="_blank" rel="noreferrer" className={styles.manualLink}>{t('Geyser 공식 제한 사항 보기 ↗', 'Read official Geyser limitations ↗')}</a></li> : null}
                  </ul>
                </article>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </main>
  );
}
