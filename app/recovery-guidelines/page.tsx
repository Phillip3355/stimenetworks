'use client';

import PolicyScope from '../components/PolicyScope';
import GuideHeader from '../components/GuideHeader';
import DocsLayout from '../components/DocsLayout';
import { useLanguage } from '../components/LanguageProvider';
import styles from '../styles/policy.module.css';

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
    <DocsLayout toc={[{ id: 'scope-recovery', labelKo: '적용 범위', labelEn: 'Policy scope' }, { id: 'recovery-criteria', labelKo: '복구 기준', labelEn: 'Recovery criteria' }, { id: 'recovery-request', labelKo: '요청 절차', labelEn: 'Request process' }]}>
      <GuideHeader eyebrow="STIMEMC / RECOVERY" titleKo="복구 가이드라인" titleEn="Recovery guidelines" descriptionKo="손실을 기록하고 도움을 요청하는 기존 정책입니다. 새로운 서버의 별도 복구 정책은 아직 공개되지 않았습니다." descriptionEn="The existing policy for documenting losses and requesting help. Dedicated recovery policies for the new servers have not been published." />
      <PolicyScope kind="recovery" />

      <section data-scroll-reveal id="recovery-criteria" className={styles.sectionCanvas}>
        <div className={styles.sectionContent}>
          <div className={styles.sectionHeader}>
            <p className={styles.eyebrow}>02 / {t('복구 기준', 'Recovery criteria')}</p>
            <h2 className={styles.sectionHeading}>{t('아이템 및 월드 복구 가이드', 'Item & World Recovery Guide')}</h2>
          </div>

          <div className={`${styles.timelineGrid} ${styles.criteriaGrid}`}>
            {recoveryGuidelines.map((guideline, index) => (
              <article key={index} className={styles.timelineCard}>
                <span className={styles.cornerSquare} />
                <p className={styles.timelineDate}>{String(index + 1).padStart(2, '0')}</p>
                <h3 className={styles.timelineTitle}>{t(guideline.title, guideline.titleEn)}</h3>
                <p className={styles.timelineText}>
                  {language === 'ko' ? guideline.descriptionKo : guideline.descriptionEn}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section data-scroll-reveal id="recovery-request" className={styles.sectionCanvas}>
        <div className={styles.sectionContent}>
          <div className={styles.sectionHeader}>
            <p className={styles.eyebrow}>03 / {t('요청 방법', 'How to request')}</p>
            <h2 className={styles.sectionHeading}>{t('복구 요청 절차', 'Recovery Request Process')}</h2>
          </div>

          <p className={styles.sectionLead}>
            {t(
              '카카오톡 ID "stimemc", 채널 "Stime 161", 또는 @Phillip_0211로 연락하고 발생 시간과 장소, 잃어버린 내용, 영상이나 스크린샷을 함께 보내주세요.',
              'Contact KakaoTalk ID "stimemc", channel "Stime 161", or @Phillip_0211 with the time, location, lost items, and any video or screenshots you have.'
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
              <h3 className={styles.timelineTitle}>{t('복구 요청 보내기', 'Send Your Recovery Request')}</h3>
              <p className={styles.timelineText}>
                {t(
                  '발생 시간과 장소, 상황 설명, 준비한 자료를 한 번에 보내주세요.',
                  'Send the time, location, a short explanation, and your evidence together.'
                )}
              </p>
            </article>
            <article className={styles.timelineCard}>
              <span className={styles.cornerSquare} />
              <p className={styles.timelineDate}>{t('검토 및 처리', 'Review & Processing')}</p>
              <h3 className={styles.timelineTitle}>{t('복구 가능성 평가', 'Recovery Feasibility Assessment')}</h3>
              <p className={styles.timelineText}>
                {t(
                  '접수 후 복구 가능 여부와 다음 단계를 안내받을 수 있습니다.',
                  'After submitting, you will receive an update on recovery availability and the next steps.'
                )}
              </p>
            </article>
          </div>
        </div>
      </section>
    </DocsLayout>
  );
}
