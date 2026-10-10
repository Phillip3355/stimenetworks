'use client';
import Link from 'next/link';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import useMotionPreference from './useMotionPreference';
import { getServerPresentation, servers } from '../shared/serverGroup.mjs';
import { useLanguage } from './LanguageProvider';
import styles from '../styles/crossplay-bridge.module.css';

export default function CrossplayBridge({ compact = false }: { compact?: boolean }) {
  const { t } = useLanguage();
  const reduced = useMotionPreference();
  const scene = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: scene, offset: ['start end', 'end start'] });
  const javaX = useTransform(scrollYProgress, [0, .3], [-24, 0]);
  const bedrockX = useTransform(scrollYProgress, [0, .3], [24, 0]);
  const bridgeScale = useTransform(scrollYProgress, [0, .3], [.65, 1]);
  const survivalPlanned = servers.some(server => server.id === 'survival' && getServerPresentation(server).planned);
  return (
    <section ref={scene} className={compact ? `${styles.section} ${styles.compact}` : styles.section} aria-labelledby="crossplay-title">
      <div className={styles.container}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>A SHARED STIMEMC FEATURE</p>
          <h2 id="crossplay-title">JAVA <span>×</span> BEDROCK</h2>
          <p className={styles.promise}>{t('기기가 달라도, 함께 플레이.', 'Different devices. Play together.')}</p>
          <p className={styles.description}>{t('StimeMC의 모든 서버는 Geyser를 통해 Java와 Bedrock 플레이어를 연결합니다.', 'Every StimeMC server connects Java and Bedrock players through Geyser.')}</p>
        </header>
        <div className={styles.diagram} aria-label={t('StimeMC 공통 크로스플레이 개념', 'Shared StimeMC crossplay concept')}>
          <div className={styles.editions}>
            {['Java', 'Bedrock'].map((edition, index) => (
              <motion.div key={edition} className={styles.edition} style={reduced ? undefined : { x: index ? bedrockX : javaX }}>
                <span className={styles.editionMark} aria-hidden="true">{index ? 'B' : 'J'}</span><h3>{edition}</h3>
                <p>{index ? t('Geyser로 에디션을 연결', 'Edition bridge through Geyser') : t('Java 플레이어는 평소처럼', 'Java players connect as usual')}</p>
              </motion.div>
            ))}
          </div>
          <motion.div aria-hidden="true" className={styles.convergence} style={reduced ? undefined : { scaleX: bridgeScale }} />
          <div className={styles.bridge}><span>GEYSER</span><p>{t('Java × Bedrock 에디션 브리지', 'Java × Bedrock edition bridge')}</p></div>
          <div className={styles.stem} aria-hidden="true" />
          <p className={styles.group}>STIMEMC / {t('모든 서버의 공통 특징', 'Shared by every server')}</p>
          <div className={styles.worlds}>{servers.map((server) => {
            const presentation = getServerPresentation(server);
            return <Link key={server.id} href={server.href}><strong>{server.name}</strong><span>{presentation.planned ? t('PLANNED · 추가 계획 중', 'PLANNED · Coming later') : presentation.preparing ? t('CURRENT · 운영 준비 중', 'CURRENT · Preparing') : `${presentation.active ? 'CURRENT' : 'STATUS'} · ${t(presentation.statusKo, presentation.statusEn)}`}</span></Link>;
          })}</div>
        </div>
        <div className={styles.note}><p>{survivalPlanned ? t('지원 에디션과 서버 그룹을 나타내는 개념도입니다. Survival의 크로스플레이는 계획된 운영 방향입니다.', 'A concept diagram of supported editions and the server group. Crossplay for Survival is a planned direction.') : t('지원 에디션과 서버 그룹을 나타내는 개념도입니다.', 'A concept diagram of supported editions and the server group.')}</p><Link href="/server-mechanism">{t('접속 기술 알아보기', 'Explore the connection technology')} <span aria-hidden="true">↗</span></Link></div>
      </div>
    </section>
  );
}
