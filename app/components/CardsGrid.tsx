'use client';

import { motion, useInView, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { getFeatureMotion } from '../lib/homeMotion.mjs';
import styles from '../styles/cards.module.css';

interface CardProps {
  id: string;
  index: string;
  eyebrow: string;
  title: string;
  description: string;
  images: string[];
  imageAlts: string[];
  href: string;
  direction: number;
}

function FeatureCard({
  card,
  learnMoreLabel,
}: {
  card: CardProps;
  learnMoreLabel: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.22 });
  const reduceMotion = useReducedMotion();
  const featureMotion = getFeatureMotion(Number(card.index) - 1, Boolean(reduceMotion));

  return (
    <motion.article
      ref={ref}
      className={styles.card}
      data-direction={card.direction < 0 ? 'reverse' : 'forward'}
      initial={reduceMotion ? false : { opacity: 0.92 }}
      animate={inView ? { opacity: 1 } : undefined}
      transition={{
        duration: reduceMotion ? 0 : 1.1,
        ease: [0.22, 0.75, 0.2, 1],
      }}
    >
      <motion.div
        className={styles.imageFrame}
        data-image-count={card.images.length}
        data-motion={featureMotion.kind}
        initial={featureMotion.image}
        animate={inView ? { opacity: 1, scale: 1, x: 0, y: 0, clipPath: 'inset(0 0 0% 0)' } : undefined}
        transition={{ duration: reduceMotion ? 0 : 1.15, ease: [0.22, 0.75, 0.2, 1] }}
      >
        <div className={styles.primaryImage}>
          <Image
            src={card.images[0]}
            alt={card.imageAlts[0]}
            fill
            sizes="(max-width: 820px) 100vw, 58vw"
            className={styles.image}
          />
        </div>
        {card.images[1] ? (
          <div className={styles.secondaryImage}>
            <Image
              src={card.images[1]}
              alt={card.imageAlts[1]}
              fill
              sizes="(max-width: 820px) 48vw, 26vw"
              className={styles.image}
            />
          </div>
        ) : null}
      </motion.div>
      <motion.div
        className={styles.copy}
        initial={featureMotion.copy}
        animate={inView ? { opacity: 1, x: 0, y: 0 } : undefined}
        transition={{ duration: reduceMotion ? 0 : 0.88, delay: reduceMotion ? 0 : 0.12, ease: [0.22, 0.75, 0.2, 1] }}
      >
        <p className={styles.eyebrow}>{card.index} · {card.eyebrow}</p>
        <h3>{card.title}</h3>
        <p className={styles.description}>{card.description}</p>
        {card.images[2] ? (
          <figure className={styles.modScene}>
            <div className={styles.modSceneImage}>
              <Image
                src={card.images[2]}
                alt={card.imageAlts[2]}
                fill
                loading="eager"
                sizes="(max-width: 820px) 100vw, 34vw"
                className={styles.image}
              />
            </div>
            <figcaption>SERVER-SIDE MOD SCENE</figcaption>
          </figure>
        ) : null}
        <Link href={card.href} className={styles.learnMore}>
          <span>{learnMoreLabel}</span>
          <span aria-hidden="true">↗</span>
        </Link>
      </motion.div>
    </motion.article>
  );
}

export default function CardsGrid({
  cards,
  learnMoreLabel,
}: {
  cards: CardProps[];
  learnMoreLabel: string;
}) {
  return (
    <section className={styles.story} aria-label={learnMoreLabel}>
      <div className={styles.storyInner}>
        {cards.map((card) => (
          <FeatureCard key={card.id} card={card} learnMoreLabel={learnMoreLabel} />
        ))}
      </div>
    </section>
  );
}
