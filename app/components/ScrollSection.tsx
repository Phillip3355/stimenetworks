'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import styles from '../styles/scrollSection.module.css';

interface ScrollSectionProps {
  title: string;
  content: React.ReactNode;
  icon?: string;
  reverse?: boolean;
}

export default function ScrollSection({
  title,
  content,
  icon,
  reverse = false,
}: ScrollSectionProps) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: reverse ? 50 : -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8 } },
  };

  return (
    <motion.section
      ref={ref}
      className={`${styles.scrollSection} ${reverse ? styles.reverse : ''}`}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={containerVariants}
    >
      <motion.div className={styles.content} variants={itemVariants}>
        {icon && <div className={styles.icon}>{icon}</div>}
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.body}>{content}</div>
      </motion.div>
    </motion.section>
  );
}
