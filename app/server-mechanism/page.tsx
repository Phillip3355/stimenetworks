'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useLanguage } from '../components/LanguageProvider';
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
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <motion.h1
            className={styles.heroTitle}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {t('서버 메커니즘', 'Server Mechanism')}
          </motion.h1>

          <motion.p
            className={styles.heroSubtitle}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {t(
              'Stime Networks가 동작하는 방식, 크로스플레이 연결, 공정성, 최신 배포 흐름을 기술 문서처럼 정리합니다.',
              'A concise technical overview of how Stime Networks operates: cross-play sync, fairness enforcement, and continuous deployment.'
            )}
          </motion.p>
        </div>
      </section>

      <section className={styles.sectionCanvas}>
        <div className={styles.sectionContent}>
          <div className={styles.sectionHeader}>
            <p className={styles.eyebrow}>{t('핵심 메커니즘', 'Core Mechanism')}</p>
            <h2 className={styles.sectionHeading}>{t('Stime 플랫폼의 구조', 'The Stime Platform Architecture')}</h2>
          </div>

          <div className={styles.timelineGrid}>
            {featureCards.map((card, index) => (
              <article key={index} className={styles.timelineCard}>
                <span className={styles.cornerSquare} />
                <h3 className={styles.timelineTitle}>{t(card.title, card.titleEn)}</h3>
                <p className={styles.timelineText}>
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
            <p className={styles.eyebrow}>{t('기술 스택', 'Technology Stack')}</p>
            <h2 className={styles.sectionHeading}>{t('GeyserMC: Java와 Bedrock의 다리', 'GeyserMC: Bridging Java and Bedrock')}</h2>
          </div>

          <p className={styles.sectionLead}>
            {t(
              'GeyserMC는 Java Edition 서버에 Bedrock Edition 유저가 접속할 수 있게 해주는 프로토콜 번역 프록시입니다. 서로 다른 언어를 사용하는 두 사람 사이에서 실시간으로 통역해주는 통역사 역할을 합니다.',
              'GeyserMC is a protocol translation proxy that allows Bedrock Edition players to connect to Java Edition servers. It acts as a real-time interpreter between two different platforms.'
            )}
          </p>

          <div className={styles.timelineGrid}>
            <article className={styles.timelineCard}>
              <span className={styles.cornerSquare} />
              <p className={styles.timelineDate}>{t('프로토콜 번역', 'Protocol Translation')}</p>
              <h3 className={styles.timelineTitle}>{t('패킷 변환 및 데이터 매핑', 'Packet Conversion & Data Mapping')}</h3>
              <p className={styles.timelineText}>
                {t(
                  'Bedrock 클라이언트의 신호를 Java 서버가 이해할 수 있는 패킷으로 즉시 변환합니다. 자바 에디션에만 있는 아이템이나 블록을 베드락에서 가장 유사한 것으로 자동 매칭하여 자연스러운 플레이 경험을 제공합니다.',
                  'Translates Bedrock client signals into Java-compatible packets in real-time. Automatically maps Java-exclusive items and blocks to their Bedrock equivalents for seamless gameplay.'
                )}
              </p>
            </article>
            <article className={styles.timelineCard}>
              <span className={styles.cornerSquare} />
              <p className={styles.timelineDate}>{t('구동 방식', 'Deployment Methods')}</p>
              <h3 className={styles.timelineTitle}>{t('플러그인 / 스탠드얼론 / Floodgate', 'Plugin / Standalone / Floodgate')}</h3>
              <p className={styles.timelineText}>
                {t(
                  'Geyser는 플러그인(Paper, Spigot 등), 스탠드얼론 독립 프로그램, 또는 Floodgate와 함께 구동되어 Bedrock 유저가 Java 계정 없이도 접속할 수 있게 합니다. 서버 환경에 맞는 방식을 선택하여 최적 성능을 실현합니다.',
                  'Geyser runs as a plugin on servers like Paper and Spigot, as a standalone program, or with Floodgate to allow Bedrock players to connect without Java accounts. Choose the deployment method that fits your server infrastructure.'
                )}
              </p>
            </article>
            <article className={styles.timelineCard}>
              <span className={styles.cornerSquare} />
              <p className={styles.timelineDate}>{t('기술적 특징', 'Technical Characteristics')}</p>
              <h3 className={styles.timelineTitle}>{t('전투, 레드스톤, 리소스팩 호환성', 'Combat, Redstone & Resource Pack Compatibility')}</h3>
              <p className={styles.timelineText}>
                {t(
                  '두 에디션의 근본적 차이로 인해 전투 쿨타임, 레드스톤 작동 방식, 리소스팩 호환성에서 미묘한 차이가 발생할 수 있습니다. 그러나 Geyser의 지속적 업데이트와 호환성 개선으로 대부분의 차이는 최소화됩니다.',
                  'Due to fundamental differences between editions, combat cooldown, redstone mechanics, and resource packs may behave slightly differently. However, continuous updates to Geyser minimize these gaps for a unified experience.'
                )}
              </p>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}