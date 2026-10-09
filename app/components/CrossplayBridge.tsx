'use client';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { servers } from '../shared/serverGroup.mjs';
import { useLanguage } from './LanguageProvider';
import styles from '../styles/crossplay-bridge.module.css';

export default function CrossplayBridge() {
  const { t } = useLanguage();
  const reduced = useReducedMotion();
  return (
    <section className={styles.section} aria-labelledby="crossplay-title">
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
              <motion.div key={edition} className={styles.edition} initial={reduced ? false : { x: index ? 12 : -12 }} whileInView={{ x: 0 }} viewport={{ once: true, amount: .5 }} transition={{ duration: .65 }}>
                <span className={styles.editionMark} aria-hidden="true">{index ? 'B' : 'J'}</span><h3>{edition}</h3>
                <p>{index ? t('Geyser로 에디션을 연결', 'Edition bridge through Geyser') : t('Java 플레이어는 평소처럼', 'Java players connect as usual')}</p>
              </motion.div>
            ))}
          </div>
          <motion.div aria-hidden="true" className={styles.convergence} initial={reduced ? false : { scaleX: .35 }} whileInView={{ scaleX: 1 }} viewport={{ once: true, amount: .8 }} transition={{ duration: .7 }} />
          <div className={styles.bridge}><span>GEYSER</span><p>{t('Java × Bedrock 에디션 브리지', 'Java × Bedrock edition bridge')}</p></div>
          <div className={styles.stem} aria-hidden="true" />
          <p className={styles.group}>STIMEMC / {t('모든 서버의 공통 특징', 'Shared by every server')}</p>
          <div className={styles.worlds}>{servers.map((server) => <Link key={server.id} href={server.href}><strong>{server.name}</strong><span>{server.lifecycle === 'planned' ? t('PLANNED · 추가 계획 중', 'PLANNED · Coming later') : t('CURRENT · 운영 준비 중', 'CURRENT · Preparing')}</span></Link>)}</div>
        </div>
        <div className={styles.note}><p>{t('지원 에디션과 서버 그룹을 나타내는 개념도입니다. Survival의 크로스플레이는 계획된 운영 방향입니다.', 'A concept diagram of supported editions and the server group. Crossplay for Survival is a planned direction.')}</p><Link href="/server-mechanism">{t('접속 기술 알아보기', 'Explore the connection technology')} <span aria-hidden="true">↗</span></Link></div>
      </div>
    </section>
  );
}
