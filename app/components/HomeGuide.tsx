'use client';
import Link from 'next/link';
import { useLanguage } from './LanguageProvider';
import { getServerGroupPresentation } from '../shared/serverGroup.mjs';
import styles from '../styles/home-sections.module.css';

export default function HomeGuide() {
  const { t } = useLanguage();
  const group = getServerGroupPresentation();
  return <section data-scroll-reveal className={`${styles.section} ${styles.guide}`} aria-labelledby="home-guide-title"><div className={styles.container}><p className={styles.eyebrow}>YOUR NEXT WORLD</p><h2 id="home-guide-title">{t(group.hasActive ? '같이할 세계를 만나보세요.' : '다음 세계를 함께 준비하세요.', 'Be part of what comes next.')}</h2><p>{group.hasActive ? t(group.joinDescriptionKo, group.joinDescriptionEn) : t('The Great War는 운영 준비 중이며 Survival은 추가 계획 중입니다. 서버 상태와 공개된 안내를 먼저 확인하세요.', 'The Great War is preparing to operate, and Survival is planned for later. Start with the server status and published guidance.')}</p><div className={styles.actions}><Link href="/servers/the-great-war" className={styles.primary}>{t('현재 서버 살펴보기', 'Explore the current server')} <span aria-hidden="true">↗</span></Link><Link href="/join" className={styles.secondary}>{t('접속 안내 확인', 'Read the connection guide')} <span aria-hidden="true">↗</span></Link></div></div></section>;
}
