'use client';
import Link from 'next/link';
import { getServerPresentation, servers } from '../shared/serverGroup.mjs';
import { useLanguage } from './LanguageProvider';
import styles from '../styles/home-sections.module.css';

export default function ServerDirections() {
  const { language, t } = useLanguage();
  return (
    <section className={styles.section} aria-labelledby="directions-title">
      <div className={styles.container}>
        <header className={styles.header}><p className={styles.eyebrow}>TWO DIRECTIONS / ONE STIME</p><h2 id="directions-title">{t('서로 다른 플레이의 방향.', 'Different ways to play.')}</h2></header>
        <div className={styles.directions}>
          {servers.map((server) => (
            <article key={server.id}>
              <p className={styles.eyebrow}>{getServerPresentation(server).label}</p>
              <h3>{server.name}</h3>
              <ul>{(language === 'ko' ? server.directionKo : server.directionEn).map((point) => <li key={point}>{point}</li>)}</ul>
              <Link className={styles.textLink} href={server.href}>{t('방향 자세히 보기', 'Read the direction')} <span aria-hidden="true">↗</span></Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
