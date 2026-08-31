'use client';

import Link from 'next/link';
import CardsGrid from './components/CardsGrid';
import Hero from './components/Hero';
import { useLanguage } from './components/LanguageProvider';
import { homeFeatures, homeIntro } from './lib/siteContent.mjs';

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
          <h2 id="home-story-title" className="sectionHeading">
            {t(homeIntro.headingKo, homeIntro.headingEn)}
          </h2>
        </div>
      </section>

      <CardsGrid cards={features} learnMoreLabel={t('더 알아보기', 'Learn more')} />

      <section className="sectionCanvas" aria-labelledby="home-next-title">
        <div className="sectionContent">
          <div className="sectionHeader">
            <h2 id="home-next-title" className="sectionTitle">
              {t('서버 안으로 들어올 준비가 되셨나요?', 'Ready to step into the server?')}
            </h2>
          </div>
          <div className="homeActionRow">
            <Link href="/join" className="homeActionPrimary">
              {t('서버 가입', 'Join Server')}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
