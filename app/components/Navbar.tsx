'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { navigationGroups, serverProfile } from '../lib/siteContent.mjs';
import styles from '../styles/navbar.module.css';
import { useLanguage } from './LanguageProvider';

const desktopPaths = new Set(['/join', '/voice', '/server-mechanism', '/support']);

export default function Navbar() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const { language, toggleLanguage } = useLanguage();
  const [menuState, setMenuState] = useState({ open: false, pathname });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const isOpen = menuState.open && menuState.pathname === pathname;

  const desktopLinks = useMemo(
    () =>
      navigationGroups
        .flatMap((group) => group.links)
        .filter((link) => desktopPaths.has(link.href)),
    [],
  );

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled])',
    );
    focusable?.[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuState({ open: false, pathname });
        requestAnimationFrame(() => triggerRef.current?.focus());
        return;
      }

      if (event.key !== 'Tab' || !focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, pathname]);

  const labelFor = (item: { labelKo: string; labelEn: string }) =>
    language === 'ko' ? item.labelKo : item.labelEn;

  const closeMenu = () => {
    setMenuState({ open: false, pathname });
    requestAnimationFrame(() => triggerRef.current?.focus());
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.brand} aria-label="StimeMC home">
            <span className={styles.brandMark} aria-hidden="true" />
            <span className={styles.brandName}>StimeMC</span>
          </Link>

          <div className={styles.desktopActions}>
            <nav className={styles.desktopLinks} aria-label="Primary navigation">
              {desktopLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={pathname === link.href ? styles.activeLink : undefined}
                >
                  {labelFor(link)}
                </Link>
              ))}
            </nav>

            <button
              type="button"
              className={styles.locale}
              onClick={toggleLanguage}
              aria-label={language === 'ko' ? 'Switch to English' : '한국어로 전환'}
            >
              <span className={language === 'ko' ? styles.localeActive : undefined}>KO</span>
              <span className={language === 'en' ? styles.localeActive : undefined}>EN</span>
            </button>

            <button
              ref={triggerRef}
              type="button"
              className={styles.menuButton}
              onClick={() => setMenuState({ open: !isOpen, pathname })}
              aria-expanded={isOpen}
              aria-controls="site-menu"
              aria-label={isOpen ? labelFor({ labelKo: '메뉴 닫기', labelEn: 'Close menu' }) : labelFor({ labelKo: '메뉴 열기', labelEn: 'Open menu' })}
            >
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.menuLayer}
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.24 }}
          >
            <motion.div
              ref={panelRef}
              id="site-menu"
              className={styles.menuPanel}
              role="dialog"
              aria-modal="true"
              aria-label={labelFor({ labelKo: '전체 메뉴', labelEn: 'Site menu' })}
              initial={reduceMotion ? false : { y: -24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.42, ease: [0.22, 0.75, 0.2, 1] }}
            >
              <div className={styles.menuTopline}>
                <span>StimeMC</span>
                <button type="button" onClick={closeMenu} className={styles.closeButton}>
                  {labelFor({ labelKo: '닫기', labelEn: 'Close' })}
                </button>
              </div>

              <div className={styles.menuGrid}>
                {navigationGroups.map((group, groupIndex) => (
                  <section key={group.id} className={styles.menuGroup}>
                    <p>{String(groupIndex + 1).padStart(2, '0')} · {labelFor(group)}</p>
                    <div>
                      {group.links.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={closeMenu}
                          className={pathname === link.href ? styles.menuLinkActive : undefined}
                        >
                          {labelFor(link)}
                        </Link>
                      ))}
                    </div>
                  </section>
                ))}
              </div>

              <p className={styles.menuFootnote}>
                {labelFor({
                  labelKo: serverProfile.playerPromiseKo,
                  labelEn: serverProfile.playerPromiseEn,
                })}
              </p>
            </motion.div>
            <button className={styles.backdrop} onClick={closeMenu} aria-label="Close menu" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
