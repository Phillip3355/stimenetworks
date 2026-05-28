'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useLanguage } from '../components/LanguageProvider';
import styles from '../styles/server-mechanism.module.css';

export default function JoinServerPage() {
  const { t } = useLanguage();

  return (
    <main className={styles.main}>
      {/* 히어로 섹션 */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <motion.h1
            className={styles.heroTitle}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {t('서버에 가입하기', 'Join the Server')}
          </motion.h1>

          <motion.p
            className={styles.heroSubtitle}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {t(
              'Stime Networks 마인크래프트 서버에 Java 및 Bedrock 플랫폼으로 접속하는 가장 쉽고 세부적인 방법입니다.',
              'The easiest and most detailed instructions to connect to Stime Networks Minecraft server on both Java and Bedrock editions.'
            )}
          </motion.p>
        </div>
      </section>

      {/* 접속 스펙 및 가이드 카드 */}
      <section className={styles.sectionCanvas}>
        <div className={styles.sectionContent}>
          <div className={styles.sectionHeader}>
            <p className={styles.eyebrow}>{t('플랫폼 스펙', 'Platform Specifications')}</p>
            <h2 className={styles.sectionHeading}>{t('어떤 에디션이든 환영합니다', 'All Minecraft Editions Welcome')}</h2>
          </div>

          <div className={styles.timelineGrid}>
            {/* Java 에디션 가이드 */}
            <article className={styles.timelineCard}>
              <span className={styles.cornerSquare} />
              <p className={styles.timelineDate}>Java Edition (PC)</p>
              <h3 className={styles.timelineTitle}>{t('자바 에디션 접속 방법', 'Java Connection')}</h3>
              <p className={styles.timelineText}>
                {t(
                  '• 접속 버전: 26.1.2 버전\n\nPC 마인크래프트를 실행한 뒤 [멀티플레이] -> [서버 추가] 메뉴로 이동하여 부여받은 서버 정보를 등록하고 접속해 주세요.',
                  '• Connection Version: 26.1.2\n\nLaunch your Java Minecraft client, go to [Multiplayer] -> [Add Server], input your assigned server details, and connect.'
                )}
              </p>
            </article>

            {/* Bedrock 에디션 가이드 */}
            <article className={styles.timelineCard}>
              <span className={styles.cornerSquare} />
              <p className={styles.timelineDate}>Bedrock Edition (PE / Win10 / Consoles)</p>
              <h3 className={styles.timelineTitle}>{t('베드락 에디션 접속 방법', 'Bedrock Connection')}</h3>
              <p className={styles.timelineText}>
                {t(
                  '• 기기 조건: 모바일, PC 등 외부 서버 주소 입력이 가능한 환경\n• 권장 버전: 최신 정식 릴리즈 상태\n\n마인크래프트를 켜고 [플레이] -> [서버] 탭 최하단의 [서버 추가]를 클릭하여 부여받은 주소와 포트 정보를 기입하고 접속해 주세요.',
                  '• Requirement: Mobile, PC, or environments allowing external server address input\n• Recommended Version: Latest stable release\n\nStart your client, click [Play] -> [Servers] tab, scroll to the bottom, click [Add Server], and input your assigned address and port.'
                )}
              </p>
            </article>

            {/* 커뮤니티 가입 안내 */}
            <article className={styles.timelineCard}>
              <span className={styles.cornerSquare} />
              <p className={styles.timelineDate}>Community Guide</p>
              <h3 className={styles.timelineTitle}>{t('커뮤니티 가입 안내', 'Community Join Guide')}</h3>
              <p className={styles.timelineText}>
                {t(
                  '• 카카오톡 오픈채팅방 (필수 가입)\n  : Stime Networks (서버 전체 긴급 공지 및 주요 소통을 위해 필수로 참여해야 합니다. 입장 전 닉네임을 마인크래프트 계정과 일치시켜 주세요.)',
                  '• KakaoTalk Open Chat (Mandatory)\n  : Stime Networks (Required to join for server announcements and official communication. Please align your nickname with your Minecraft account.)'
                )}
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* 플레이 전 규칙 안내 섹션 */}
      <section className={styles.sectionCanvas}>
        <div className={styles.sectionContent} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
          <h2 className={styles.sectionHeading} style={{ margin: 0 }}>
            {t('플레이 전 규칙을 꼭 확인해주세요!', 'Please check the rules before playing!')}
          </h2>
          <p className={styles.sectionLead} style={{ maxWidth: '600px', margin: '0 auto' }}>
            {t(
              'Stime Networks는 모두가 평화롭고 공정하게 즐기는 서바이벌 서버를 지향합니다. 불이익을 받지 않도록 접속 전 서버 이용 규칙을 반드시 숙지해 주시기 바랍니다.',
              'Stime Networks aims to provide a peaceful and fair survival environment. Please review our server guidelines carefully before connecting to avoid any penalties.'
            )}
          </p>
          <Link href="/rules" className={styles.buttonOutline} style={{ marginTop: '8px' }}>
            {t('서버 규칙 확인하기', 'View Server Rules')}
          </Link>
        </div>
      </section>
    </main>
  );
}
