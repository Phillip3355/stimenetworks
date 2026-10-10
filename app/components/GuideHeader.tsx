'use client';

import Link from 'next/link';
import { useLanguage } from './LanguageProvider';
import styles from '../styles/guide.module.css';

export default function GuideHeader({ eyebrow, titleKo, titleEn, descriptionKo, descriptionEn }: { eyebrow: string; titleKo: string; titleEn: string; descriptionKo: string; descriptionEn: string }) {
  const { t } = useLanguage();
  return <header className={styles.header}>
    <div className={styles.container}>
      <div className={styles.topline}><Link href="/">StimeMC</Link><span aria-hidden="true">/</span><p className={styles.eyebrow}>{eyebrow.replace(/^STIMEMC\s*\/\s*/, '')}</p></div>
      <div className={styles.intro}><h1>{t(titleKo, titleEn)}</h1><p className={styles.lead}>{t(descriptionKo, descriptionEn)}</p></div>
    </div>
  </header>;
}
