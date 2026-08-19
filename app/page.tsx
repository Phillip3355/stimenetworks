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
    imageAlts:
      language === 'ko' ? feature.imageAltsKo : feature.imageAltsEn,
  }));

  return (
    <main className="mainContainer">
      <Hero />

      <section className="sectionCanvas" aria-labelledby="home-story-title">
        <div className="sectionContent">
          <p className="eyebrow">StimeMC · {t('세 가지 차이', 'Three Differences')}</p>
          <h2 id="home-story-title" className="sectionHeading">
            {t(
              '같이 접속하고, 계속 발견하고, 안심하고 플레이합니다.',
              'Connect together, keep discovering, and play with confidence.',
            )}
          </h2>
          <p className="sectionLead">
            {t(
              '에디션의 경계를 없애고, 새로운 건축물과 모드로 월드를 넓히며, 명확한 규칙으로 여러분의 시간과 창작물을 지킵니다.',
              'We remove edition barriers, expand the world with new builds and mods, and protect your time and creations with clear rules.',
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
