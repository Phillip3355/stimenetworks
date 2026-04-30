'use client';

import { motion } from 'framer-motion';
import { useLanguage } from './LanguageProvider';
import styles from '../styles/language-switch.module.css';

export default function LanguageSwitch() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <motion.button
      className={styles.languageSwitch}
      onClick={toggleLanguage}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <span className={language === 'ko' ? styles.active : styles.inactive}>KR</span>
      <span className={styles.divider}>/</span>
      <span className={language === 'en' ? styles.active : styles.inactive}>EN</span>
    </motion.button>
  );
}