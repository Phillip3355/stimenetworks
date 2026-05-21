'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useLanguage } from './LanguageProvider';
import styles from '../styles/hero.module.css';

export default function Hero() {
  const { t } = useLanguage();
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);
  const [expandedSubmenu, setExpandedSubmenu] = useState<string | null>(null);

  const toggleMenu = () => {
    setIsMenuExpanded(!isMenuExpanded);
    if (!isMenuExpanded) {
      setExpandedSubmenu(null); // 메뉴를 닫을 때 서브메뉴도 닫기
    }
  };

  const toggleSubmenu = (submenu: string) => {
    setExpandedSubmenu(expandedSubmenu === submenu ? null : submenu);
  };

  return (
    <section className={styles.heroSection}>
      {/* 배경 비디오 */}
      <video
        className={styles.heroBackgroundVideo}
        src="/vichouse.mp4"
        autoPlay
        muted
        loop
        playsInline
      />

      {/* 배경 오버레이 */}
      <div className={styles.overlay}></div>

      {/* 애니메이션 배경 요소들 */}
      <motion.div className={styles.bgElement1} />
      <motion.div className={styles.bgElement2} />
      <motion.div className={styles.bgElement3} />

      {/* 컨텐츠 */}
      <div className={styles.heroContent}>
        {/* 제목 */}
        <motion.h1
          className={styles.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {t('Stime Networks', 'Stime Networks')}
        </motion.h1>

        {/* 부제목 */}
        <motion.p
          className={styles.subtitle}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {t(
            'Java / Bedrock 크로스플레이 마인크래프트 서버',
            'Java / Bedrock Crossplay Minecraft Server for Everyone'
          )}
        </motion.p>

        <motion.div
          className={styles.heroMenuCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className={styles.menuHeader}>
            <p className={styles.menuLabel}>{t('빠른 탐색', 'Quick Navigation')}</p>
            <button
              className={styles.expandButton}
              onClick={toggleMenu}
              aria-expanded={isMenuExpanded}
            >
              {t('메뉴 확장하기', 'Expand Menu')}
              <motion.span
                className={styles.expandIcon}
                animate={{ rotate: isMenuExpanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                ▼
              </motion.span>
            </button>
          </div>
          <p className={styles.heroHelperText}>
            {t(
              '메커니즘 · 규칙 · 업데이트를 한 곳에서 빠르게 확인할 수 있습니다.',
              'Open Mechanism, Rules, and Updates from one place.'
            )}
          </p>

          <AnimatePresence>
            {isMenuExpanded && (
              <motion.div
                className={styles.expandedMenu}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className={styles.submenuContainer}>
                  <button
                    className={styles.submenuButton}
                    onClick={() => toggleSubmenu('about')}
                    aria-expanded={expandedSubmenu === 'about'}
                  >
                    <span>{t('서버에 대해 알아보기', 'Learn About Server')}</span>
                    <motion.span
                      className={styles.submenuIcon}
                      animate={{ rotate: expandedSubmenu === 'about' ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      ▶
                    </motion.span>
                  </button>
                  <AnimatePresence>
                    {expandedSubmenu === 'about' && (
                      <motion.div
                        className={styles.submenuItems}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Link href="/server-mechanism" className={styles.ctaButton}>
                          {t('메커니즘', 'Mechanism')}
                        </Link>
                        <Link href="/updates" className={styles.ctaButton}>
                          {t('업데이트', 'Updates')}
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className={styles.submenuContainer}>
                  <button
                    className={styles.submenuButton}
                    onClick={() => toggleSubmenu('rules')}
                    aria-expanded={expandedSubmenu === 'rules'}
                  >
                    <span>{t('가이드라인 및 규칙', 'Guidelines & Rules')}</span>
                    <motion.span
                      className={styles.submenuIcon}
                      animate={{ rotate: expandedSubmenu === 'rules' ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      ▶
                    </motion.span>
                  </button>
                  <AnimatePresence>
                    {expandedSubmenu === 'rules' && (
                      <motion.div
                        className={styles.submenuItems}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Link href="/rules" className={styles.ctaButton}>
                          {t('규칙', 'Rules')}
                        </Link>
                        <Link href="/recovery-guidelines" className={styles.ctaButton}>
                          {t('복구 가이드라인', 'Recovery Guidelines')}
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* 스크롤 인디케이터 */}
      <motion.div
        className={styles.scrollIndicator}
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className={styles.scrollArrow}>↓</div>
      </motion.div>
    </section>
  );
}
