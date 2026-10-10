'use client';
import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion,useScroll,useTransform } from 'framer-motion';
import useMotionPreference from './useMotionPreference';
import { getServerPresentation,getServerGroupPresentation,servers } from '../shared/serverGroup.mjs';
import { useLanguage } from './LanguageProvider';
import styles from '../styles/server-worlds.module.css';

export default function ServerWorlds({ reveal = false }: { reveal?: boolean }) {
  const { t } = useLanguage();
  const group = getServerGroupPresentation();
  const scene = useRef<HTMLElement>(null);
  const reduced = useMotionPreference();
  const { scrollYProgress } = useScroll({ target: scene,offset: ['start end','end start'] });
  const first = useTransform(scrollYProgress,[0,.35],[28,0]);
  const second = useTransform(scrollYProgress,[0,.5],[48,0]);
  return <section ref={scene} className={styles.scene} aria-labelledby="worlds-title">
    <div className={styles.stage}>
      <header className={styles.heading}><p className={styles.eyebrow}>STIMEMC / OUR SERVERS</p><h2 id="worlds-title">{t('하나의 커뮤니티, 두 세계.','One community. Two worlds.')}</h2><p>{t(group.worldsKo,group.worldsEn)}</p></header>
      <div className={styles.brandRail}><span>StimeMC</span><span>MINECRAFT SERVER GROUP</span></div>
      <div className={styles.worldList}>{servers.map((server,index) => {
        const presentation = getServerPresentation(server);
        return <motion.article key={server.id} className={styles.panel} style={reveal && !reduced ? { y: index === 0 ? first : second } : undefined}>
          <figure className={styles.visual}><Image src={index === 0 ? '/image copy 9.png' : '/image copy 8.png'} alt={t('기존 StimeMC 서버의 아카이브 이미지 · 이 서버의 실제 맵이 아닙니다','StimeMC archive image · not this server’s actual map')} fill sizes="(max-width: 767px) calc(100vw - 32px), (max-width: 1344px) 58vw, 780px" /><figcaption>{t('이미지 · 기존 StimeMC 기록 / 실제 서버 맵 아님','Image · StimeMC archive / not the actual server map')}</figcaption></figure>
          <div className={styles.panelCopy}><div className={styles.panelTop}><span>0{index + 1} / {server.type}</span><span className={styles.status}>{server.lifecycle === 'planned' ? 'PLANNED / COMING LATER' : 'CURRENT'}</span></div><h3>{server.name}</h3><p className={styles.state}>{t(presentation.statusKo,presentation.statusEn)}</p><p className={styles.description}>{t(server.descriptionKo,server.descriptionEn)}</p><p className={styles.badge}>JAVA × BEDROCK / {server.crossplay}</p><Link href={server.href} className={styles.link}>{server.lifecycle === 'planned' ? t('계획 살펴보기','Explore the plan') : t('서버 알아보기','Explore the server')} <span aria-hidden="true">↗</span></Link></div>
        </motion.article>;
      })}</div>
    </div>
  </section>;
}
