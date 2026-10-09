'use client';
import Link from 'next/link';
import { brandProfile } from '../shared/serverGroup.mjs';
import { useLanguage } from './LanguageProvider';
import ServerWorlds from './ServerWorlds';
import CrossplayBridge from './CrossplayBridge';
import styles from '../styles/server-detail.module.css';

export default function ServersHub() {
  const { t } = useLanguage();
  return <main><header className={styles.intro}><div className={styles.container}><nav className={styles.breadcrumbs} aria-label={t('현재 위치', 'Breadcrumb')}><Link href="/">StimeMC</Link><span aria-current="page">{t('서버', 'Servers')}</span></nav><p className={styles.eyebrow}>STIMEMC / SERVER GROUP</p><h1>{t('우리의 세계들.', 'Our worlds.')}</h1><p className={styles.lead}>{t(brandProfile.descriptionKo, brandProfile.descriptionEn)}</p><p className={styles.badge}>JAVA × BEDROCK / GEYSER</p></div></header><ServerWorlds /><CrossplayBridge /></main>;
}
