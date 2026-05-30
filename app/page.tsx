'use client';

import Link from 'next/link';
import Hero from './components/Hero';
import CardsGrid from './components/CardsGrid';
import { useLanguage } from './components/LanguageProvider';

export default function Home() {
  const { t } = useLanguage();

  const serverFeatures = [
    {
      title: t('평화로운 서바이벌 서버', 'Peaceful Survival Server'),
      image: '/minecraft1.webp',
      description: t('자바/베드락 플레이어 모두에게 안정적인 생존 환경을 제공합니다.', 'Provides stable survival gameplay for both Java and Bedrock players.'),
    },
    {
      title: t('안티 엑스레이 시스템', 'Anti-Xray system'),
      image: '/minecraft2.webp',
      description: t('공정한 경쟁을 위해 엑스레이와 부정행위를 방지하는 서버 보안 레이어.', 'A server security layer that blocks X-ray and unfair play for honest competition.'),
    },
    {
      title: t('지속적 운영 & 업데이트', 'Continuous Operations & Updates'),
      image: '/minecraft3.webp',
      description: t('서버 안정성과 콘텐츠 신선도를 유지하기 위해 정기적으로 운영합니다.', 'Regular operations keep the server stable and content fresh.'),
    },
  ];

  const communityFeatures = [
    {
      title: t('정기 이벤트', 'Regular Events'),
      image: '/minecraft4.webp',
      description: t('정기적으로 다양한 건축콘테스트, PVP 아레나등의 이벤트를 진행합니다.', 'Regular events including building competitions and PVP arenas are held on schedule.'),
    },
    {
      title: t('글로벌 연결', 'Global Community'),
      image: '/minecraft1.webp',
      description: t('한국어와 영어 커뮤니티가 함께 성장하는 협업 중심 공간.', 'A collaboration-first community for Korean and English players.'),
    },
  ];

  return (
    <main className="mainContainer">
      <Hero />

      <section className="sectionCanvas">
        <div className="sectionContent">
          <p className="eyebrow">{t('서버 아키텍처', 'Server Architecture')}</p>
          <h2 className="sectionHeading">
            {t(
              'Stime Networks는 다중 플랫폼 플레이어를 위한 엔지니어링 중심 Minecraft 서버입니다.',
              'Stime Networks is an engineering-first Minecraft server for multi-platform players.'
            )}
          </h2>
          <p className="sectionLead">
            {t(
              '두가지 플랫폼, 하나의 서버, 하나의 커뮤니티. Stime Networks는 최고의 기술력과 관리를 제공하기 위해 노력합니다.',
              'Two platforms, one server, one community. Stime Networks strives to deliver top-tier engineering and management.'
            )}
          </p>
        </div>
      </section>

      <section className="sectionCanvas">
        <div className="sectionContent">
          <div className="sectionHeader">
            <div>
              <p className="eyebrow">{t('핵심 기능', 'Core Capabilities')}</p>
              <h3 className="sectionTitle">{t('서버 기능', 'Server Features')}</h3>
            </div>
          </div>
          <CardsGrid cards={serverFeatures} />
        </div>
      </section>

      <section className="sectionCanvas">
        <div className="sectionContent">
          <div className="sectionHeader">
            <div>
              <p className="eyebrow">{t('커뮤니티 설계', 'Community Design')}</p>
              <h3 className="sectionTitle">{t('커뮤니티 특징', 'Community Features')}</h3>
            </div>
          </div>
          <CardsGrid cards={communityFeatures} />
        </div>
      </section>

    </main>
  );
}
