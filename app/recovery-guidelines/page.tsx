'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '../components/LanguageProvider';
import styles from '../styles/server-mechanism.module.css';

const recoveryGuidelines = [
  {
    title: '아이템 복구 기준',
    titleEn: 'Item Recovery Criteria',
    descriptionKo: '아이템 복구는 플레이어의 과실이 아닌 비정상적인 서버의 핑, 작동, 버그등에 의한 손실에 한해 검토됩니다.',
    descriptionEn: "Item recovery is considered only for losses due to abnormal server ping, operation, or bugs that are not the player's fault.",
  },
  {
    title: '월드 복구 기준',
    titleEn: 'World Recovery Criteria',
    descriptionKo: '건축물등 월드에 심각한 손상이나 테러가 발생해서 복구를 원하시는 경우 최대 6시간전 백업으로 복구가 검토됩니다.',
    descriptionEn: 'World recovery may be considered for severe damage or griefing, with restoration to a backup from up to 6 hours prior.',
  },
  {
    title: '복구 제한 사항',
    titleEn: 'Recovery Limitations',
    descriptionKo: '의도적 파괴, 버그 악용, 오래된 손실, 플레이어 실수등의 경우 복구가 제한될 수 있습니다.',
    descriptionEn: 'Recovery may be limited for intentional destruction, exploit abuse, old losses, or player mistakes.',
  },
  {
    title: '권장 내용',
    titleEn: 'Recommended Practices',
    descriptionKo: '리플레이나 녹화가 가능한 Medal을 설치하거나 다른 녹화 프로그램을 사용하여 플레이 영상을 기록하는 것을 권장드립니다.',
    descriptionEn: 'It is recommended to install Medal or other recording programs to capture gameplay footage.',
  },
];

export default function RecoveryGuidelines() {
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
            {t('복구 가이드라인', 'Recovery Guidelines')}
          </motion.h1>

          <motion.p
            className={styles.heroSubtitle}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {t(
              '아이템 분실 및 월드 복구에 대한 명확한 절차와 가이드라인입니다.',
              'Clear procedures and guidelines for item loss and world recovery.'
            )}
          </motion.p>
        </div>
      </section>

      <section className={styles.sectionCanvas}>
        <div className={styles.sectionContent}>
          <div className={styles.sectionHeader}>
            <p className={styles.eyebrow}>{t('복구 절차', 'Recovery Process')}</p>
            <h2 className={styles.sectionHeading}>{t('아이템 및 월드 복구 가이드', 'Item & World Recovery Guide')}</h2>
          </div>

          <div className={styles.timelineGrid}>
            {recoveryGuidelines.map((guideline, index) => (
              <article key={index} className={styles.timelineCard}>
                <span className={styles.cornerSquare} />
                <h3 className={styles.timelineTitle}>{t(guideline.title, guideline.titleEn)}</h3>
                <p className={styles.timelineText}>
                  {language === 'ko' ? guideline.descriptionKo : guideline.descriptionEn}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.sectionCanvas}>
        <div className={styles.sectionContent}>
          <div className={styles.sectionHeader}>
            <p className={styles.eyebrow}>{t('요청 방법', 'How to Request')}</p>
            <h2 className={styles.sectionHeading}>{t('복구 요청 절차', 'Recovery Request Process')}</h2>
          </div>

          <p className={styles.sectionLead}>
            {t(
              '복구 요청은 카카오톡 ID "stimemc", 채널 "Stime 161", 또는 @Phillip_0211로 진행합니다. 요청 시 가능한 많은 정보를 제공해 주시기 바랍니다.',
              'Recovery requests can be made via KakaoTalk ID "stimemc", channel "Stime 161", or @Phillip_0211. Please provide as much information as possible.'
            )}
          </p>

          <div className={styles.timelineGrid}>
            <article className={styles.timelineCard}>
              <span className={styles.cornerSquare} />
              <p className={styles.timelineDate}>{t('정보 수집', 'Information Gathering')}</p>
              <h3 className={styles.timelineTitle}>{t('필요한 정보 준비', 'Prepare Required Information')}</h3>
              <p className={styles.timelineText}>
                {t(
                  'Medal, Nvidia Replay, OBS등으로 녹화된 영상이나 기타 명확한 증거 자료를 준비해주세요.',
                  'Please prepare recorded footage from Medal, Nvidia Replay, OBS, or other clear evidence.'
                )}
              </p>
            </article>
            <article className={styles.timelineCard}>
              <span className={styles.cornerSquare} />
              <p className={styles.timelineDate}>{t('요청 접수', 'Request Submission')}</p>
              <h3 className={styles.timelineTitle}>{t('운영진에게 연락', 'Contact Staff')}</h3>
              <p className={styles.timelineText}>
                {t(
                  '준비된 정보를 운영진에게 전달합니다.',
                  'Send prepared information to staff.'
                )}
              </p>
            </article>
            <article className={styles.timelineCard}>
              <span className={styles.cornerSquare} />
              <p className={styles.timelineDate}>{t('검토 및 처리', 'Review & Processing')}</p>
              <h3 className={styles.timelineTitle}>{t('복구 가능성 평가', 'Recovery Feasibility Assessment')}</h3>
              <p className={styles.timelineText}>
                {t(
                  '서버 과실 여부및 여려가지 상황을 검토하여 복구 여부를 평가합니다.',
                  'Evaluate recovery feasibility by reviewing server fault and various circumstances.'
                )}
              </p>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
