'use client';
import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion,useScroll,useTransform } from 'framer-motion';
import useMotionPreference from './useMotionPreference';
import { brandProfile,getServerGroupPresentation } from '../shared/serverGroup.mjs';
import { useLanguage } from './LanguageProvider';
import styles from '../styles/hero.module.css';

export default function Hero() {
  const { t } = useLanguage();
  const group = getServerGroupPresentation();
  const scene = useRef<HTMLElement>(null);
  const reduced = useMotionPreference();
  const { scrollYProgress } = useScroll({ target: scene, offset: ['start start','end start'] });
  const scale = useTransform(scrollYProgress,[0,.7],[1.07,1]);
  const y = useTransform(scrollYProgress,[0,.7],[0,-24]);
  return <section ref={scene} className={styles.heroSection} aria-labelledby="home-title">
    <div className={styles.content}>
      <div className={styles.intro}>
        <p className={styles.eyebrow}><span aria-hidden="true" />StimeMC / {brandProfile.label}</p>
        <h1 id="home-title" lang="en">ONE COMMUNITY.<br />MORE WORLDS.</h1>
        <p className={styles.subtitle}>{t(brandProfile.headingKo,'Many worlds, one Stime.')}</p>
        <div className={styles.actions}><Link href="/servers" className={styles.action}>{t('서버 살펴보기','Explore servers')} <span aria-hidden="true">↗</span></Link><Link href="/join" className={styles.secondary}>{t('접속 안내','Connection guide')} <span aria-hidden="true">→</span></Link></div>
      </div>
      <motion.figure className={styles.worldFrame} style={reduced ? undefined : { y }}>
        <div className={styles.worldWindow}>
          <motion.div className={styles.world} style={reduced ? undefined : { scale }}><Image src="/image copy 10.png" alt={t('기존 StimeMC 서버 기록: 마을과 농장이 이어지는 Minecraft 풍경','StimeMC archive: a Minecraft landscape of villages and farms')} fill priority sizes="(max-width: 767px) calc(100vw - 32px), (max-width: 1344px) calc(100vw - 64px), 1280px" /></motion.div>
          <div className={styles.imageLabel}><span>STIMEMC ARCHIVE</span><span>{t('배경 · 기존 StimeMC 서버 기록','Background · Previous StimeMC world')}</span></div>
        </div>
        <figcaption className={styles.meta}><div><span>JAVA × BEDROCK</span><p>{group.hasActive ? t('서로 다른 세계, 함께하는 플레이','Different worlds. Play together.') : t('현재의 준비, 다음 세계의 계획','Preparing today. Planning what follows.')}</p></div><a href="#worlds-title" aria-label={t('서버 소개로 이동','Scroll to our servers')}>{t('세계 만나보기','DISCOVER WORLDS')} <span aria-hidden="true">↓</span></a></figcaption>
      </motion.figure>
    </div>
  </section>;
}
