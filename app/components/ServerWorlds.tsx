'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { getServerPresentation, getServerGroupPresentation, servers } from '../shared/serverGroup.mjs';
import { useLanguage } from './LanguageProvider';
import styles from '../styles/server-worlds.module.css';

export default function ServerWorlds({ reveal = false }: { reveal?: boolean }) {
  const { t } = useLanguage();
  const group = getServerGroupPresentation();
  const reduced = useReducedMotion();
  const scene = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: scene, offset: ['start end', 'end start'] });
  const first = useTransform(scrollYProgress, [0, .45], [12, 0]);
  const second = useTransform(scrollYProgress, [0, .45], [-12, 0]);
  return (
    <section ref={scene} className={`${styles.scene} ${reveal ? styles.reveal : ''}`} aria-labelledby="worlds-title">
      <div className={styles.stage}>
        <header className={styles.heading}>
          <p className={styles.eyebrow}>STIMEMC / OUR SERVERS</p>
          <h2 id="worlds-title">{t('하나의 커뮤니티, 두 세계.', 'One community. Two worlds.')}</h2>
          <p>{t(group.worldsKo, group.worldsEn)}</p>
        </header>
        <div className={styles.brandRail} aria-hidden="true"><span>StimeMC.</span></div>
        <div className={styles.grid}>
          {servers.map((server, index) => {
            const presentation = getServerPresentation(server);
            return (
            <motion.article key={server.id} className={`${styles.panel} ${server.lifecycle === 'planned' ? styles.survival : styles.war}`} style={reveal && !reduced ? { x: index === 0 ? first : second } : undefined}>
              <div className={styles.panelTop}><span>0{index + 1} / {server.type}</span><span className={styles.status}>{server.lifecycle === 'planned' ? 'PLANNED / COMING LATER' : 'CURRENT'}</span></div>
              <div className={styles.graphic} aria-hidden="true"><span>{index === 0 ? 'W' : 'S'}</span><i /><i /><i /></div>
              <div className={styles.panelCopy}>
                <p className={styles.state}>{t(presentation.statusKo, presentation.statusEn)}</p>
                <h3>{server.name}</h3>
                <p className={styles.description}>{t(server.descriptionKo, server.descriptionEn)}</p>
                <p className={styles.badge}>JAVA × BEDROCK / {server.crossplay}</p>
                <Link className={styles.link} href={server.href}>{server.lifecycle === 'planned' ? t('계획 살펴보기', 'Explore the plan') : t('서버 알아보기', 'Explore the server')} <span aria-hidden="true">↗</span></Link>
              </div>
            </motion.article>
          ); })}
        </div>
      </div>
    </section>
  );
}
