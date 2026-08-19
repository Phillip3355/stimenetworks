'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '../components/LanguageProvider';
import RuleMindMap from '../components/RuleMindMap';
import styles from '../styles/server-mechanism.module.css';

export default function RulesPage() {
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
            {t('서버 규칙을 한눈에', 'Server Rules at a Glance')}
          </motion.h1>

          <motion.p
            className={styles.heroSubtitle}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {t(
              '함께 플레이할 때 필요한 기준을 빠르게 확인하고, 서로의 건축물과 경험을 존중하며 자유롭게 즐겨보세요.',
              'Quickly check the shared expectations, respect other players and their builds, and enjoy the server freely.'
            )}
          </motion.p>
        </div>
      </section>

      <section className={styles.sectionCanvas}>
        <div className={styles.sectionContent}>
          <div className={styles.sectionHeader}>
            <p className={styles.eyebrow}>{t('함께 플레이하기', 'Playing Together')}</p>
            <h2 className={styles.sectionHeading}>{t('규칙을 선택해 자세히 살펴보세요', 'Choose a Rule to Explore')}</h2>
          </div>

          <RuleMindMap language={language} />
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
                  '고의적 비매너, 버그 악용, 반복 위반 시 즉시 퇴장되고 일정 기간 접속이 제한될 수 있으며, 적용 기간을 별도로 안내받게 됩니다.',
                  'Intentional misconduct, exploits, or repeated violations can lead to immediate removal and a timed suspension, with the duration shared directly with you.'
                )}
              </p>
            </article>
            <article className={styles.timelineCard}>
              <span className={styles.cornerSquare} />
              <p className={styles.timelineDate}>{t('영구 차단', 'Permanent Ban')}</p>
              <h3 className={styles.timelineTitle}>{t('치명적 위반', 'Severe Violation')}</h3>
              <p className={styles.timelineText}>
                {t(
                  '중대한 핵 사용, 테러, 복구 불가능한 피해 발생 시 영구 차단됩니다. 이의신청은 @Phillip_0211로 가능하며, 부적절한 신청은 가중 처벌됩니다.',
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
