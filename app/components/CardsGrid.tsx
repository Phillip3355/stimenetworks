'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import styles from '../styles/cards.module.css';

interface CardProps {
  title: string;
  image: string;
  description: string;
}

const Card = ({ title, image, description, index }: CardProps & { index: number }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const isImageLeft = index % 2 === 0;

  return (
    <motion.div
      ref={ref}
      className={styles.card}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6 }}
      whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}
    >
      <div className={`${styles.cardContent} ${isImageLeft ? styles.imageLeft : styles.imageRight}`}>
        <img src={image} alt={title} className={styles.cardImage} />
        <div className={styles.cardText}>
          <h3 className={styles.cardTitle}>{title}</h3>
          <p className={styles.cardDescription}>{description}</p>
        </div>
      </div>
    </motion.div>
  );
};

interface CardsGridProps {
  cards: CardProps[];
}

export default function CardsGrid({ cards }: CardsGridProps) {
  return (
    <div className={styles.cardsGrid}>
      {cards.map((card, index) => (
        <Card key={index} {...card} index={index} />
      ))}
    </div>
  );
}
