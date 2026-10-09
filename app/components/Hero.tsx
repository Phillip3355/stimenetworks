'use client';
import Image from 'next/image';
import Link from 'next/link';
import { brandProfile, getServerGroupPresentation } from '../shared/serverGroup.mjs';
import { useLanguage } from './LanguageProvider';
import styles from '../styles/hero.module.css';

export default function Hero() {
  const { t } = useLanguage();
  const group = getServerGroupPresentation();
  return (
    <section className={styles.heroSection} aria-labelledby="home-title">
      <div className={styles.content}>
        <div className={styles.brandLine}>
          <h1 id="home-title">StimeMC<span className={styles.brandDot}>.</span></h1>
          <p>{brandProfile.label}</p>
        </div>
        <div className={styles.composition}>
          <div className={styles.statement}>
            <p className={styles.message} lang="en">ONE COMMUNITY.<br />MORE WORLDS.</p>
            <p className={styles.subtitle}>{t(brandProfile.headingKo, 'Many worlds, one Stime.')}</p>
            <Link href="/servers" className={styles.action}>{t('서버 살펴보기', 'Explore servers')} <span aria-hidden="true">↗</span></Link>
          </div>
          <figure className={styles.imageWindow}>
            <div className={styles.imageFrame}>
              <Image src="/image copy 10.png" alt={t('기존 StimeMC 서버 기록: 마을과 농장', 'StimeMC archive: village and farms')} fill priority sizes="(max-width: 760px) calc(100vw - 40px), (max-width: 1440px) 52vw, 728px" />
            </div>
            <figcaption><span>STIMEMC ARCHIVE</span><span>{t('기존 서버 기록', 'Previous server record')}</span></figcaption>
          </figure>
        </div>
        <div className={styles.meta}><span>JAVA × BEDROCK / GEYSER</span><span>{group.hasActive ? t('서로 다른 세계, 함께하는 플레이', 'Different worlds. Play together.') : t('현재의 준비, 다음 세계의 계획', 'Preparing today. Planning what follows.')}</span></div>
      </div>
    </section>
  );
}
