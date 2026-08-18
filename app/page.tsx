'use client';

import Link from 'next/link';
import CardsGrid from './components/CardsGrid';
import Hero from './components/Hero';
import { useLanguage } from './components/LanguageProvider';
import { homeFeatures } from './lib/siteContent.mjs';

export default function Home() {
  const { language, t } = useLanguage();

  const features = homeFeatures.map((feature) => ({
    ...feature,
    eyebrow: language === 'ko' ? feature.eyebrowKo : feature.eyebrowEn,
    title: language === 'ko' ? feature.titleKo : feature.titleEn,
    description:
      language === 'ko' ? feature.descriptionKo : feature.descriptionEn,
  }));

  return (
    <main className="mainContainer">
      <Hero />

      <section className="sectionCanvas" aria-labelledby="home-story-title">
        <div className="sectionContent">
          <p className="eyebrow">Stime Networks · {t('서버 아카이브', 'Server Archive')}</p>
          <h2 id="home-story-title" className="sectionHeading">
            {t(
              '아래로 스크롤할수록 우리 서버의 모습이 이어집니다.',
              'Scroll down and the world of our server unfolds.',
            )}
          </h2>
          <p className="sectionLead">
            {t(
              '실제 월드의 풍경과 플레이 방식, 그리고 운영진과 연결되는 서비스를 한 장면씩 살펴보세요.',
              'Explore the real world, the way we play, and the services that connect you with the team—one scene at a time.',
            )}
          </p>
        </div>
      </section>

      <CardsGrid cards={features} learnMoreLabel={t('더 알아보기', 'Learn more')} />

      <section className="sectionCanvas" aria-labelledby="home-next-title">
        <div className="sectionContent">
          <div className="sectionHeader">
            <p className="eyebrow">{t('다음 장면', 'Next Scene')}</p>
            <h2 id="home-next-title" className="sectionTitle">
              {t('서버 안으로 들어올 준비가 되셨나요?', 'Ready to step into the server?')}
            </h2>
          </div>
          <div className="homeActionRow">
            <Link href="/join" className="homeActionPrimary">
              {t('서버 가입', 'Join Server')}
            </Link>
            <Link href="/voice" className="homeActionSecondary">
              {t('STAGE 채널 보기', 'View STAGE Channels')}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
