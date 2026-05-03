'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useLanguage } from './LanguageProvider';
import styles from '../styles/staff.module.css';

interface StaffMember {
  name: string;
  role: string;
  description: string;
  image?: string;
}

const staffMembers: StaffMember[] = [
  {
    name: 'Phillip_0211',
    role: 'Owner & Lead Developer',
    description: 'He made Project Stime on 2021. he is working on this server since 2024.',
    image: '/minecraft4.png',
  },
  {
    name: 'Vicgamingyay',
    role: 'KR/Global Community Manager',
    description: 'He is managing Server and Community since 2024.',
    image: '/minecraft3.png',
  },
  {
    name: 'Jadeindeepwater',
    role: 'Beta Tester',
    description: 'He is testing new features and providing feedback since 2024.',
    image: '/minecraft2.png',
  },
];

export default function Staff() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.12,
  });
  const { t } = useLanguage();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <section className={styles.staffSection}>
      <motion.h2
        className={styles.sectionTitle}
        initial={{ opacity: 0, y: -30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        {t('운영진 & 개발자 소개', 'Staff & Developers')}
      </motion.h2>

      <motion.div
        ref={ref}
        className={styles.staffGrid}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        variants={containerVariants}
      >
        {staffMembers.map((member, index) => (
          <motion.article
            key={index}
            className={styles.staffCard}
            variants={itemVariants}
          >
            <span className={styles.cornerSquare} />
            <div className={styles.profileImageContainer}>
              <img
                src={member.image || '/profile-placeholder.png'}
                alt={member.name}
                className={styles.profileImage}
              />
            </div>
            <div className={styles.staffInfo}>
              <h3 className={styles.staffName}>{member.name}</h3>
              <p className={styles.staffRole}>{member.role}</p>
              <p className={styles.staffDescription}>{member.description}</p>
            </div>
          </motion.article>
        ))}
      </motion.div>
    </section>
  );
}
