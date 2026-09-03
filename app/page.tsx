'use client';

import { motion, useReducedMotion } from 'framer-motion';
import CardsGrid from './components/CardsGrid';
import Hero from './components/Hero';
import { useLanguage } from './components/LanguageProvider';
import { homeFeatures, homeIntro } from './lib/siteContent.mjs';

export default function Home() {
  const { language, t } = useLanguage();
  const reduceMotion = useReducedMotion();

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

      <motion.section
        className="sectionCanvas"
        aria-labelledby="home-story-title"
        initial={reduceMotion ? false : { opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.45 }}
        transition={{ duration: reduceMotion ? 0 : 0.9, ease: [0.22, 0.75, 0.2, 1] }}
      >
        <div className="sectionContent">
          <h2 id="home-story-title" className="sectionHeading">
            {t(homeIntro.headingKo, homeIntro.headingEn)}
          </h2>
        </div>
      </motion.section>

      <CardsGrid cards={features} learnMoreLabel={t('더 알아보기', 'Learn more')} />
    </main>
  );
}
