'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { LanguageProvider, useLanguage } from '../components/LanguageProvider';
import LanguageSwitch from '../components/LanguageSwitch';
import styles from '../styles/server-mechanism.module.css';

const ruleCards = [
  {
    title: '플레이 방해 금지',
    titleEn: 'No Griefing',
    descriptionKo: '살인, 불토깨기, 가두기 등 다른 플레이어를 방해하는 행위는 금지됩니다. 상대방이 정당한 이유로 하지 말라고 하면 반드시 멈춰야 합니다.',
    descriptionEn: 'Killing, breaking blocks, and imprisoning are prohibited. Stop immediately if a player asks you to.',
  },
  {
    title: '소유물 보호',
    titleEn: 'Property Protection',
    descriptionKo: '건축물 파괴, 도둑질, 공장 기믹 파괴 등 타인의 소유물을 건드리는 행위는 금지됩니다.',
    descriptionEn: 'Destroying buildings, stealing, and sabotaging factories are prohibited. Mob and mechanism damage is also treated as property damage.',
  },
  {
    title: '불쾌한 언행 금지',
    titleEn: 'Respectful Communication',
    descriptionKo: '욕설, 비방, 저격, 싸움, 정치, 도배 등은 금지됩니다. 존댓말 사용 및 실명 언급 금지.',
    descriptionEn: 'Profanity, insults, targeting, politics, and spam are prohibited. Use polite language and avoid mentioning real names.',
  },
  {
    title: '부정행위 금지',
    titleEn: 'Anti-Cheat Policy',
    descriptionKo: '핵, 엑스레이, 복제, 버그 악용, 과도한 엔티티 소환 금지. 핵 사용 언행도 테러 위협으로 간주됩니다.',
    descriptionEn: 'Hacks, X-ray, duplication, exploits, and entity spam are prohibited. Threatening to use hacks is also punishable.',
  },
  {
    title: '타게임·타서버 권유 금지',
    titleEn: 'No External Solicitation',
    descriptionKo: '다른 게임이나 다른 서버로의 플레이 권유는 금지됩니다.',
    descriptionEn: 'Soliciting players to other games or servers is prohibited.',
  },
  {
    title: '신고 및 처벌',
    titleEn: 'Reporting & Consequences',
    descriptionKo: '신고는 카카오톡 ID "stimemc", 채널 Stime 161, @Phillip_0211로 진행합니다. 규칙 위반 시 경고 후 임시/영구 차단될 수 있습니다.',
    descriptionEn: 'Report violations via KakaoTalk ID "stimemc", channel Stime 161, or @Phillip_0211. Violations may result in warnings or temporary/permanent bans.',
  },
];


function RulesContent() {
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
            {t('규칙 보기', 'Rules')}
          </motion.h1>

          <motion.p
            className={styles.heroSubtitle}
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {t(
              'Stime Networks의 플레이 규칙을 명확한 기술 문서처럼 정리합니다.',
              'A precise technical summary of Stime Networks play policies.'
            )}
          </motion.p>

          <div className={styles.heroActions}>
            <Link href="/" className={styles.buttonOutline}>
              {t('홈으로 돌아가기', 'Back to Home')}
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.sectionCanvas}>
        <div className={styles.sectionContent}>
          <div className={styles.sectionHeader}>
            <p className={styles.eyebrow}>{t('규칙 체계', 'Policy Framework')}</p>
            <h2 className={styles.sectionHeading}>{t('서버 규칙 구조', 'Server Rule Structure')}</h2>
          </div>

          <div className={styles.featureGrid}>
            {ruleCards.map((card, index) => (
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
            <p className={styles.eyebrow}>{t('신고 방법', 'How to Report')}</p>
            <h2 className={styles.sectionHeading}>{t('규칙 위반 신고 및 처벌 절차', 'Reporting Violations & Enforcement Process')}</h2>
          </div>

          <p className={styles.sectionLead}>
            {t(
              '신고는 카카오톡 ID "stimemc", 카카오톡 채널 "Stime 161", 또는 @Phillip_0211로 진행합니다. 커뮤니티 채팅에서의 신고는 분쟁유도로 간주되므로, 반드시 개인 연락을 통해 신고해 주시기 바랍니다.',
              'Report violations via KakaoTalk ID "stimemc", channel "Stime 161", or @Phillip_0211. Do NOT report in the community chat as it may be considered stirring up conflict.'
            )}
          </p>

          <div className={styles.timelineGrid}>
            <article className={styles.timelineCard}>
              <span className={styles.cornerSquare} />
              <p className={styles.timelineDate}>{t('경고', 'Warning')}</p>
              <h3 className={styles.timelineTitle}>{t('최초 위반', 'First Violation')}</h3>
              <p className={styles.timelineText}>
                {t(
                  '처음 위반한 경우 경고를 부여하며, 재발 시 추가 조치가 이어집니다.',
                  'First-time violations receive warnings; repeated offenses trigger escalation.'
                )}
              </p>
            </article>
            <article className={styles.timelineCard}>
              <span className={styles.cornerSquare} />
              <p className={styles.timelineDate}>{t('임시 정지', 'Temporary Suspension')}</p>
              <h3 className={styles.timelineTitle}>{t('중대 위반', 'Serious Violation')}</h3>
              <p className={styles.timelineText}>
                {t(
                  '고의적 비매너, 버그 악용, 반복 위반 시 일단 추방되며, 이후 관리진 회의를 통해 처벌 기간을 결정합니다.',
                  'Intentional misconduct, exploits, or repeated violations result in immediate removal; punishment duration is decided by staff meeting.'
                )}
              </p>
            </article>
            <article className={styles.timelineCard}>
              <span className={styles.cornerSquare} />
              <p className={styles.timelineDate}>{t('영구 차단', 'Permanent Ban')}</p>
              <h3 className={styles.timelineTitle}>{t('치명적 위반', 'Severe Violation')}</h3>
              <p className={styles.timelineText}>
                {t(
                  '중대한 핵 사용, 테러, 복구 불가능한 피해 발생 시 영구 차단됩니다. 이의신청은 @Phillip_0211로 가능하며, 말도 안 되는 신청은 가중처벌됩니다.',
                  'Severe cheating, griefing, or irreversible damage results in permanent ban. Appeals can be submitted to @Phillip_0211, but frivolous appeals may result in harsher penalties.'
                )}
              </p>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function RulesPage() {
  return (
    <LanguageProvider>
      <RulesContent />
    </LanguageProvider>
  );
}
