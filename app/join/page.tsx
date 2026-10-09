'use client';

import Link from 'next/link';
import ConnectionGuide from '../components/ConnectionGuide';
import GuideHeader from '../components/GuideHeader';
import { useLanguage } from '../components/LanguageProvider';
import { joinConnectionGuide } from '../shared/siteContent.mjs';
import { getServerGroupPresentation } from '../shared/serverGroup.mjs';
import styles from '../styles/server-mechanism.module.css';

export default function JoinServerPage() {
  const { t } = useLanguage();
  const group = getServerGroupPresentation();

  return (
    <main className={styles.main}>
      {/* 히어로 섹션 */}
      <GuideHeader eyebrow="STIMEMC / JOIN" titleKo={group.joinTitleKo} titleEn={group.joinTitleEn} descriptionKo={group.joinDescriptionKo} descriptionEn={group.joinDescriptionEn} />
      <ConnectionGuide />

      {/* 접속 스펙 및 가이드 카드 */}
      <section className={styles.sectionCanvas}>
        <div className={styles.sectionContent}>
          <div className={styles.sectionHeader}>
            <p className={styles.eyebrow}>{t('기존 공개 가이드 · 아카이브', 'Previously published guide · Archive')}</p>
            <h2 className={styles.sectionHeading}>{t('기존 서버 접속 안내', 'Existing server connection guide')}</h2>
          </div>

          <p className={styles.sectionLead}>{t('아래 1.21.1 버전과 커뮤니티 안내는 기존 공개 가이드입니다. The Great War 또는 Survival의 확정 접속 버전이나 주소가 아닙니다.', 'The 1.21.1 version and community instructions below are the previously published guide. They are not confirmed connection versions or addresses for The Great War or Survival.')}</p>
          <div className={styles.timelineGrid}>
            {/* Java 에디션 가이드 */}
            <article className={styles.timelineCard}>
              <span className={styles.cornerSquare} />
              <p className={styles.timelineDate}>Java Edition (PC)</p>
              <h3 className={styles.timelineTitle}>{t('자바 에디션 접속 방법', 'Java Connection')}</h3>
              <p className={styles.timelineText}>
                {t(
                  joinConnectionGuide.javaKo,
                  joinConnectionGuide.javaEn
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
                  '• 카카오톡 오픈채팅방 (필수 가입)\n  : StimeMC (서버 전체 긴급 공지 및 주요 소통을 위해 필수로 참여해야 합니다. 입장 전 닉네임을 마인크래프트 계정과 일치시켜 주세요.)',
                  '• KakaoTalk Open Chat (Mandatory)\n  : StimeMC (Required to join for server announcements and official communication. Please align your nickname with your Minecraft account.)'
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
              '누구나 편하게 참여하고 원하는 방식으로 플레이할 수 있도록 몇 가지 기본 규칙만 함께 지켜주세요. 기존 공개 규칙의 적용 범위를 확인하고, 새 서버의 별도 규칙 공개를 기다려 주세요.',
              'A few shared rules keep the server open and comfortable for everyone. Check the scope of the existing published rules and wait for dedicated rules for the new servers.'
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
