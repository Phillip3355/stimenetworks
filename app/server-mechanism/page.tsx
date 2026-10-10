'use client';

import CrossplayBridge from '../components/CrossplayBridge';
import GuideHeader from '../components/GuideHeader';
import DocsLayout from '../components/DocsLayout';
import { useLanguage } from '../components/LanguageProvider';
import { serverMechanismFlow } from '../shared/siteContent.mjs';
import styles from '../styles/server-mechanism.module.css';

export default function ServerMechanism() {
  const { language, t } = useLanguage();
  const isKorean = language === 'ko';
  const { nodes } = serverMechanismFlow;

  return (
    <DocsLayout toc={[{ id: 'crossplay-title', labelKo: 'Java × Bedrock', labelEn: 'Java × Bedrock' }, { id: 'connection-flow-title', labelKo: '기존 서버의 접속 구조', labelEn: 'Existing connection flow' }, ...nodes.map((node) => ({ id: `connection-${node.id}`, labelKo: node.eyebrowKo, labelEn: node.eyebrowEn }))]}>
      <GuideHeader eyebrow="STIMEMC / TECHNOLOGY" titleKo="두 에디션, 함께하는 플레이" titleEn="Two editions. Shared play." descriptionKo="모든 StimeMC 서버는 Geyser를 통한 Java × Bedrock 동시 접속을 공유하는 방향입니다. Survival은 추가 계획 중입니다." descriptionEn="Every StimeMC server shares Geyser-powered Java × Bedrock crossplay as its direction. Survival is planned for later." />
      <CrossplayBridge compact />
      <section className={styles.technologySection} aria-labelledby="connection-flow-title">
          <header data-scroll-reveal className={styles.technologyIntro}>
            <div><p className={styles.editorialLabel}>{t('기존 공개 구현', 'DOCUMENTED IMPLEMENTATION')}</p>
            <h2 id="connection-flow-title" className={styles.editorialHeading}>{t('기존 서버의 접속 구조', 'The existing server’s connection flow')}</h2></div>
            <span className={styles.implementationTag}>VIAPROXY + GEYSER</span>
          </header>
          <div className={styles.implementationNote}><span className={styles.editorialLabel}>ARCHIVE / JAVA 1.21.1</span><p>{t('아래는 기존에 문서화된 ViaProxy · Geyser · Java 1.21.1 구현입니다. 새 서버 그룹의 프록시 라우팅 구조나 각 서버의 확정 버전으로 해석하지 마세요.', 'The following is the documented existing ViaProxy · Geyser · Java 1.21.1 implementation. It does not confirm proxy routing for the new server group or versions for its servers.')}</p></div>

          <ol className={styles.technologyFlow} aria-label={t('StimeMC 접속 흐름', 'StimeMC connection flow')}>
            {nodes.map((node) => (
              <li data-scroll-reveal className={styles.technologyNode} key={node.id} id={`connection-${node.id}`}>
                <article className={styles.technologyBody}>
                  <div className={styles.technologyCopy}>
                    <p className={styles.editorialLabel}>{node.index} / {isKorean ? node.eyebrowKo : node.eyebrowEn}</p>
                    <h3>{isKorean ? node.titleKo : node.titleEn}</h3>
                    <p>{isKorean ? node.descriptionKo : node.descriptionEn}</p>
                  </div>
                  <ul className={styles.technologyPoints}>
                    {(isKorean ? node.pointsKo : node.pointsEn).map((point) => <li key={point}>{point}</li>)}
                    {node.href ? <li><a href={node.href} target="_blank" rel="noreferrer">{t('Geyser 공식 제한 사항 보기 ↗', 'Read official Geyser limitations ↗')}</a></li> : null}
                  </ul>
                </article>
              </li>
            ))}
          </ol>
      </section>
    </DocsLayout>
  );
}
