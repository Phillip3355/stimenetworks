'use client';
import Link from 'next/link';
import Image from 'next/image';
import { getServerGroupPresentation } from '../shared/serverGroup.mjs';
import { useLanguage } from './LanguageProvider';
import ServerWorlds from './ServerWorlds';
import CrossplayBridge from './CrossplayBridge';
import styles from '../styles/server-detail.module.css';

export default function ServersHub() {
  const { t } = useLanguage();
  const group = getServerGroupPresentation();
  return <main>
    <header className={styles.hubIntro}>
      <div className={styles.container}>
        <nav className={styles.breadcrumbs} aria-label={t('현재 위치','Breadcrumb')}><Link href="/">StimeMC</Link><span aria-current="page">{t('서버','Servers')}</span></nav>
        <div className={styles.hubCopy}><div><p className={styles.eyebrow}>STIMEMC / SERVER GROUP</p><h1>{t('우리의 세계들.','Our worlds.')}</h1></div><div><p className={styles.lead}>{t(group.descriptionKo,group.descriptionEn)}</p><p className={styles.badge}>JAVA × BEDROCK / GEYSER</p></div></div>
        <figure className={styles.hubVisual}><Image src="/image copy 4.png" alt={t('노을 아래 기존 StimeMC 서버의 건축물','Player builds at sunset in a previous StimeMC world')} fill priority sizes="(max-width: 767px) calc(100vw - 32px), (max-width: 1344px) calc(100vw - 64px), 1280px" /><figcaption>{t('배경 · 기존 StimeMC 서버 기록','Background · Previous StimeMC world')}</figcaption></figure>
      </div>
    </header>
    <ServerWorlds /><CrossplayBridge />
  </main>;
}
