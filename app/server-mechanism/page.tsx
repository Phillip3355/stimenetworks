'use client';

import CrossplayBridge from '../components/CrossplayBridge';
import GuideHeader from '../components/GuideHeader';
import { useLanguage } from '../components/LanguageProvider';
import { serverMechanismFlow } from '../shared/siteContent.mjs';
import styles from '../styles/server-mechanism.module.css';

export default function ServerMechanism() {
  const { language, t } = useLanguage();
  const isKorean = language === 'ko';
  const { nodes } = serverMechanismFlow;

  return (
    <main className={styles.main}>
      <GuideHeader eyebrow="STIMEMC / TECHNOLOGY" titleKo="두 에디션, 함께하는 플레이" titleEn="Two editions. Shared play." descriptionKo="모든 StimeMC 서버는 Geyser를 통한 Java × Bedrock 동시 접속을 공유하는 방향입니다. Survival은 추가 계획 중입니다." descriptionEn="Every StimeMC server shares Geyser-powered Java × Bedrock crossplay as its direction. Survival is planned for later." />
      <CrossplayBridge />
      <section className={styles.sectionCanvas}>
        <div className={styles.sectionContent}>
          <header className={styles.mechanismHeader}>
            <p className={styles.eyebrow}>{t('기존 공개 구현 · VIAPROXY + GEYSER', 'Documented existing implementation · VIAPROXY + GEYSER')}</p>
            <h2 className={styles.sectionHeading}>{t('기존 서버의 접속 구조', 'The existing server’s connection flow')}</h2>
          </header>
          <p className={styles.sectionLead}>{t('아래는 기존에 문서화된 ViaProxy · Geyser · Java 1.21.1 구현입니다. 새 서버 그룹의 프록시 라우팅 구조나 각 서버의 확정 버전으로 해석하지 마세요.', 'The following is the documented existing ViaProxy · Geyser · Java 1.21.1 implementation. It does not confirm proxy routing for the new server group or versions for its servers.')}</p>

          <ol className={styles.mechanismTree} aria-label={t('StimeMC 접속 흐름', 'StimeMC connection flow')}>
            {nodes.map((node) => (
              <li className={styles.mechanismNode} key={node.id}>
                <div className={styles.nodeMarker} aria-hidden="true"><span>{node.index}</span></div>
                <article className={styles.nodeBody}>
                  <div className={styles.nodeCopy}>
                    <p className={styles.nodeEyebrow}>{isKorean ? node.eyebrowKo : node.eyebrowEn}</p>
                    <h2 className={styles.nodeTitle}>{isKorean ? node.titleKo : node.titleEn}</h2>
                    <p className={styles.nodeDescription}>{isKorean ? node.descriptionKo : node.descriptionEn}</p>
                  </div>
                  <ul className={styles.nodePoints}>
                    {(isKorean ? node.pointsKo : node.pointsEn).map((point) => <li key={point}>{point}</li>)}
                    {node.href ? <li><a href={node.href} target="_blank" rel="noreferrer" className={styles.manualLink}>{t('Geyser 공식 제한 사항 보기 ↗', 'Read official Geyser limitations ↗')}</a></li> : null}
                  </ul>
                </article>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </main>
  );
}
