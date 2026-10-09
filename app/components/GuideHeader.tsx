'use client';

import { useLanguage } from './LanguageProvider';
import styles from '../styles/guide.module.css';

export default function GuideHeader({ eyebrow, titleKo, titleEn, descriptionKo, descriptionEn }: { eyebrow: string; titleKo: string; titleEn: string; descriptionKo: string; descriptionEn: string }) {
  const { t } = useLanguage();
  return <header className={styles.header}>
    <div className={styles.container}>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h1>{t(titleKo, titleEn)}</h1>
      <p className={styles.lead}>{t(descriptionKo, descriptionEn)}</p>
    </div>
  </header>;
}
