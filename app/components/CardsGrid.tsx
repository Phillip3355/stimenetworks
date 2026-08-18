'use client';

import { motion, useInView, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import styles from '../styles/cards.module.css';

interface CardProps {
  id: string;
  index: string;
  eyebrow: string;
  title: string;
  description: string;
  image: string;
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
  const fromX = reduceMotion ? 0 : card.direction * 32;

  return (
    <motion.article
      ref={ref}
      className={styles.card}
      data-direction={card.direction < 0 ? 'reverse' : 'forward'}
      initial={reduceMotion ? false : { opacity: 0, x: fromX }}
      animate={inView ? { opacity: 1, x: 0 } : undefined}
      transition={{
        duration: reduceMotion ? 0 : 1.1,
        ease: [0.22, 0.75, 0.2, 1],
      }}
    >
      <div className={styles.imageFrame}>
        <Image
          src={card.image}
          alt={card.title}
          fill
          sizes="(max-width: 760px) 100vw, 50vw"
          className={styles.image}
        />
      </div>
      <div className={styles.copy}>
        <p className={styles.eyebrow}>{card.index} · {card.eyebrow}</p>
        <h3>{card.title}</h3>
        <p className={styles.description}>{card.description}</p>
        <Link href={card.href} className={styles.learnMore}>
          <span>{learnMoreLabel}</span>
          <span aria-hidden="true">↗</span>
        </Link>
      </div>
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
