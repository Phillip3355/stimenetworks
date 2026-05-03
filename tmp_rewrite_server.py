from pathlib import Path

content = ''''use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { LanguageProvider, useLanguage } from '../components/LanguageProvider';
import LanguageSwitch from '../components/LanguageSwitch';
import styles from '../styles/server-mechanism.module.css';

const featureCards = [
  {
    title: '크로스플레이 엔진',
    titleEn: 'Crossplay Engine',
    descriptionKo: 'Java와 Bedrock 플레이어를 하나의 동기화된 세션으로 연결합니다.',
    descriptionEn: 'Connects Java and Bedrock players into a single synchronized session.',
  },
  {
    title: '안전한 룰 엔포스먼트',
    titleEn: 'Rule Enforcement',
    descriptionKo: '자동 감지와 운영진 검토로 불공정한 플레이를 방지합니다.',
    descriptionEn: 'Prevents unfair play with auto-detection and moderation review.',
  },
  {
    title: '실시간 상태 모니터링',
    titleEn: 'Real-Time Monitoring',
    descriptionKo: '서버 상태와 접속 품질을 실시간으로 수집하여 안정성을 유지합니다.',
    descriptionEn: 'Collects server state and connection quality in real time to keep stability.',
  },
  {
    title: '지속적 업데이트 파이프라인',
    titleEn: 'Continuous Update Pipeline',
    descriptionKo: '정기 패치와 기능 배포를 통해 서버 콘텐츠를 항상 신선하게 유지합니다.',
    descriptionEn: 'Keeps server content fresh with regular patches and feature deployments.',
  },
];

export default function ServerMechanism() {
  const { t, language } = useLanguage();

  return (
    <main className={styles.main}>
      <LanguageSwitch />

      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <motion.h1
            className={styles.heroTitle}
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {t('서버 메커니즘', 'Server Mechanism')}
          </motion.h1>

          <motion.p
            className={styles.heroSubtitle}
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {t(
              'Stime Networks가 동작하는 방식, 크로스플레이 연결, 공정성, 최신 배포 흐름을 기술 문서처럼 정리합니다.',
              'A concise technical overview of how Stime Networks operates: cross-play sync, fairness enforcement, and continuous deployment.'
            )}
          </motion.p>

          <div className={styles.heroActions}>
            <Link href="/rules" className={styles.buttonPrimary}>
              {t('규칙 보기', 'View Rules')}
            </Link>
            <Link href="/updates" className={styles.buttonOutline}>
              {t('업데이트 보기', 'View Updates')}
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.sectionCanvas}>
        <div className={styles.sectionContent}>
          <div className={styles.sectionHeader}>
            <p className={styles.eyebrow}>{t('핵심 메커니즘', 'Core Mechanism')}</p>
            <h2 className={styles.sectionHeading}>{t('Stime 플랫폼의 구조', 'The Stime Platform Architecture')}</h2>
          </div>

          <div className={styles.featureGrid}>
            {featureCards.map((card, index) => (
              <article key={index} className={styles.featureCard}>
                <span className={styles.cornerSquare} />
                <h3 className={styles.featureTitle}>{t(card.title, card.titleEn)}</h3>
                <p className={styles.featureDescription}>
                  {language === 'ko' ? card.descriptionKo : card.descriptionEn}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.sectionCanvas}>
        <div className={styles.sectionContent}>
          <div className={styles.sectionHeader}>
            <p className={styles.eyebrow}>{t('작동 흐름', 'How it Works')}</p>
            <h2 className={styles.sectionHeading}>{t('서버가 준비되는 과정', 'How the Server comes online')}</h2>
          </div>

          <div className={styles.timelineGrid}>
            <article className={styles.timelineCard}>
              <span className={styles.cornerSquare} />
              <p className={styles.timelineDate}>{t('실시간 세션 동기화', 'Real-Time Session Sync')}</p>
              <h3 className={styles.timelineTitle}>{t('Java ↔ Bedrock 큐레이팅', 'Java ↔ Bedrock Curation')}</h3>
              <p className={styles.timelineText}>
                {t(
                  '두 클라이언트 입력을 하나의 서버 세션으로 통합해 지연과 충돌을 최소화합니다.',
                  'Merges inputs from both clients into one server session with minimal latency and conflict.'
                )}
              </p>
            </article>
            <article className={styles.timelineCard}>
              <span className={styles.cornerSquare} />
              <p className={styles.timelineDate}>{t('규칙 검증', 'Rules Verification')}</p>
              <h3 className={styles.timelineTitle}>{t('자동 감지 + 수동 검토', 'Auto detection + manual review')}</h3>
              <p className={styles.timelineText}>
                {t(
                  '행동 패턴을 실시간 분석하고 의심스러운 플레이를 운영진이 검토합니다.',
                  'Analyzes behavior patterns in real time and escalates suspicious play to moderation.'
                )}
              </p>
            </article>
            <article className={styles.timelineCard}>
              <span className={styles.cornerSquare} />
              <p className={styles.timelineDate}>{t('배포 사이클', 'Deployment Cycle')}</p>
              <h3 className={styles.timelineTitle}>{t('정기 업데이트 관리', 'Managed periodic rollout')}</h3>
              <p className={styles.timelineText}>
                {t(
                  '새 기능과 서버 패치가 순차적으로 도입되어 안정성과 콘텐츠가 함께 개선됩니다.',
                  'New features and server patches roll out sequentially, improving stability and content simultaneously.'
                )}
              </p>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function ServerMechanism() {
  return (
    <LanguageProvider>
      <ServerMechanismContent />
    </LanguageProvider>
  );
}
'''

Path('app/server-mechanism/page.tsx').write_text(content, encoding='utf-8')
