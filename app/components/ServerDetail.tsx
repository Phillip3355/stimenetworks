'use client';
import Link from 'next/link';
import { servers } from '../shared/serverGroup.mjs';
import { useLanguage } from './LanguageProvider';
import styles from '../styles/server-detail.module.css';

type Server = (typeof servers)[number];
export default function ServerDetail({ server }: { server: Server }) {
  const { language, t } = useLanguage();
  const planned = server.lifecycle === 'planned';
  return (
    <main className={styles.main}>
      <header className={`${styles.intro} ${planned ? styles.survival : styles.war}`}>
        <div className={styles.container}>
          <nav className={styles.breadcrumbs} aria-label={t('현재 위치', 'Breadcrumb')}><Link href="/">StimeMC</Link><Link href="/servers">{t('서버', 'Servers')}</Link><span aria-current="page">{server.name}</span></nav>
          <p className={styles.eyebrow}>STIMEMC / {planned ? 'PLANNED / COMING LATER' : 'CURRENT'}</p>
          <h1>{server.name}</h1>
          <p className={styles.state}>{planned ? t('추가 계획 중 · 출시 일정과 버전 미정', 'Planned · Release date and version undecided') : t('운영 준비 중 · 접속 정보 미공개', 'Preparing to operate · Connection information unpublished')}</p>
          <p className={styles.lead}>{t(server.descriptionKo, server.descriptionEn)}</p>
          <p className={styles.badge}>JAVA × BEDROCK / {server.crossplay}</p>
        </div>
      </header>
      <div className={styles.container}>
        <section className={styles.section} aria-labelledby="server-direction-title">
          <p className={styles.eyebrow}>{server.type}</p><h2 id="server-direction-title">{t('이 세계의 방향.', 'The direction of this world.')}</h2>
          <ul className={styles.directionList}>{(language === 'ko' ? server.directionKo : server.directionEn).map((point) => <li key={point}>{point}</li>)}</ul>
        </section>
        <section className={styles.section} aria-labelledby="server-crossplay-title">
          <p className={styles.eyebrow}>SHARED BY EVERY STIMEMC SERVER</p><h2 id="server-crossplay-title">Java × Bedrock / Geyser</h2>
          <p>{t('모든 StimeMC 서버가 Geyser 기반 크로스플레이를 공유합니다. Java는 평소처럼 접속하고, Bedrock은 Geyser를 통해 Java 플레이어와 연결됩니다.', 'Every StimeMC server shares Geyser-powered crossplay. Java players connect as usual; Geyser connects Bedrock players with Java players.')}</p>
          {planned && <p>{t('Survival의 크로스플레이와 별도 클라이언트 모드 없는 플레이는 계획된 운영 방향입니다.', 'Crossplay and play without separate client mods are planned directions for Survival.')}</p>}
          <Link href="/server-mechanism" className={styles.textLink}>{t('기술 및 에디션 안내', 'Technology and edition guidance')} <span aria-hidden="true">↗</span></Link>
        </section>
        <section className={styles.section} aria-labelledby="server-guide-title">
          <h2 id="server-guide-title">{t('공개된 안내부터 확인하세요.', 'Start with the published guidance.')}</h2>
          <p>{planned ? t('출시 일정, 버전, 접속 정보는 아직 확정되지 않았습니다. 계획이 공개되면 StimeMC 소식에서 확인할 수 있습니다.', 'Release date, version and connection information have not been confirmed. Follow StimeMC news for published plans.') : t('CURRENT는 StimeMC의 현재 서버를 뜻하며, 온라인 상태를 나타내지 않습니다. 서버의 접속 정보와 버전은 아직 공개되지 않았습니다.', 'CURRENT identifies StimeMC’s current server; it does not indicate an online status. Connection information and version have not been published.')}</p>
          <p>{t('기존 공개 규정은 계속 확인할 수 있습니다. The Great War의 별도 규정과 Survival 규정은 미공개이며, 기존 규정의 서버별 적용은 별도 안내가 필요합니다.', 'The existing published rules remain accessible. Dedicated rules for The Great War and Survival are unpublished; their server-specific applicability needs separate guidance.')}</p>
          <div className={styles.actions}><Link href="/join">{t('접속 안내', 'Connection guide')} ↗</Link><Link href="/rules">{t('기존 공개 규정', 'Existing published rules')} ↗</Link><Link href="/news">{t('StimeMC 소식', 'StimeMC news')} ↗</Link><Link href="/support">{t('문의하기', 'Contact support')} ↗</Link></div>
        </section>
      </div>
    </main>
  );
}
