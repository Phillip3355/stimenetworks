'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import styles from '../styles/cards.module.css';

interface CardProps {
  title: string;
  image: string;
  description: string;
}

interface CardProps {
  title: string;
  image: string;
  description: string;
}

interface CardItemProps extends CardProps {
  index: number;
}

const Card = ({ title, image, description, index }: CardItemProps) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  return (
    <motion.article
      ref={ref}
      className={styles.card}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6 }}
    >
      <span className={styles.cardIndex}>{index + 1}</span>
      <span className={styles.cornerSquare} />
      <div className={styles.cardImageWrapper}>
        <img src={image} alt={title} className={styles.cardImage} />
      </div>
      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{title}</h3>
        <p className={styles.cardDescription}>{description}</p>
      </div>
    </motion.article>
  );
};

interface CardsGridProps {
  cards: CardProps[];
}

export default function CardsGrid({ cards }: CardsGridProps) {
  return (
    <div className={styles.cardsGrid}>
      {cards.map((card, index) => (
        <Card key={index} index={index} {...card} />
      ))}
    </div>
  );
}
