'use client';

import { useLanguage } from '../components/LanguageProvider';
import styles from '../styles/server-mechanism.module.css';

export default function ServerMechanism() {
  const { t } = useLanguage();

  return (
    <main className={styles.main}>
      <section className={styles.sectionCanvas}>
        <div className={styles.sectionContent}>
          <div className={styles.sectionHeader}>
            <p className={styles.eyebrow}>{t('서버 메커니즘', 'Server Mechanism')}</p>
            <h1 className={styles.sectionHeading}>
              {t('Java와 Bedrock, 같은 월드로', 'Java and Bedrock, One Shared World')}
            </h1>
          </div>

          <p className={styles.sectionLead}>
            {t(
              'GeyserMC 덕분에 평소 사용하던 Java 또는 Bedrock 에디션으로 같은 월드에 접속할 수 있습니다. 별도 클라이언트 모드 설치 없이 친구들과 바로 만나보세요.',
              'GeyserMC lets you enter the same world with the Java or Bedrock edition you already use. Meet your friends without installing client-side mods.',
            )}
          </p>

          <div className={styles.timelineGrid}>
            <article className={styles.timelineCard}>
              <span className={styles.cornerSquare} />
              <p className={styles.timelineDate}>{t('크로스플레이', 'Crossplay')}</p>
              <h2 className={styles.timelineTitle}>{t('서로 다른 에디션에서도 함께 플레이', 'Play Together Across Editions')}</h2>
              <p className={styles.timelineText}>
                {t(
                  'Bedrock으로 접속해도 이동, 건축, 탐험이 Java 월드와 자연스럽게 이어집니다. 에디션이 다른 친구와 같은 공간에서 플레이할 수 있습니다.',
                  'Movement, building, and exploration from Bedrock connect naturally to the Java world, so friends on different editions can play together.',
                )}
              </p>
            </article>

            <article className={styles.timelineCard}>
              <span className={styles.cornerSquare} />
              <p className={styles.timelineDate}>{t('별도 설치 없음', 'Nothing Extra to Install')}</p>
              <h2 className={styles.timelineTitle}>{t('평소 쓰던 게임 그대로 접속', 'Join With the Game You Already Use')}</h2>
              <p className={styles.timelineText}>
                {t(
                  '확장 기능은 서버 안에서 작동하므로 여러분은 런처나 모바일 앱에 모드를 추가할 필요가 없습니다. 안내된 주소로 평소처럼 접속하면 됩니다.',
                  'Expanded features run on the server, so you do not need to modify your launcher or mobile app. Connect normally with the provided address.',
                )}
              </p>
            </article>

            <article className={styles.timelineCard}>
              <span className={styles.cornerSquare} />
              <p className={styles.timelineDate}>{t('알아두기', 'Good to Know')}</p>
              <h2 className={styles.timelineTitle}>{t('에디션별 차이가 보일 때', 'When Editions Behave Differently')}</h2>
              <p className={styles.timelineText}>
                {t(
                  '전투, 레드스톤, 리소스팩은 에디션에 따라 조금 다르게 보이거나 작동할 수 있습니다. 자세한 차이와 제한 사항은 Geyser 공식 매뉴얼을 참고하세요.',
                  'Combat, redstone, and resource packs can look or behave slightly differently between editions. Refer to the official Geyser manual for known differences and limitations.',
                )}
              </p>
              <a
                className={styles.manualLink}
                href="https://geysermc.org/wiki/geyser/current-limitations/"
                target="_blank"
                rel="noreferrer"
              >
                {t('Geyser 공식 매뉴얼 보기 ↗', 'Open the official Geyser manual ↗')}
              </a>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
