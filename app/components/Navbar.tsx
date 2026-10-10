'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll, useMotionValueEvent } from 'framer-motion';
import useMotionPreference from './useMotionPreference';
import { navigationGroups } from '../shared/siteContent.mjs';
import { brandProfile } from '../shared/serverGroup.mjs';
import styles from '../styles/navbar.module.css';
import { useLanguage } from './LanguageProvider';

export default function Navbar() {
  const pathname = usePathname();
  const reduceMotion = useMotionPreference();
  const { language, toggleLanguage } = useLanguage();
  const [menuState, setMenuState] = useState({ open: false, pathname });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const isOpen = menuState.open && menuState.pathname === pathname;
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, 'change', (value) => setScrolled(value > 32));

  const desktopLinks = navigationGroups.filter((group) => group.id !== 'join');

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const trigger = triggerRef.current;
    document.body.style.overflow = 'hidden';
    const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled])',
    );
    focusable?.[0]?.focus();
    const background = [headerRef.current, ...document.querySelectorAll<HTMLElement>('[data-menu-background]')]
      .filter((element): element is HTMLElement => element !== null);
    const previousBackground = background.map((element) => ({
      element, inert: element.inert, ariaHidden: element.getAttribute('aria-hidden'),
    }));
    background.forEach((element) => {
      element.inert = true;
      element.setAttribute('aria-hidden', 'true');
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuState({ open: false, pathname });
        return;
      }

      if (event.key !== 'Tab' || !focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!panelRef.current?.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
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
      previousBackground.forEach(({ element, inert, ariaHidden }) => {
        element.inert = inert;
        if (ariaHidden === null) element.removeAttribute('aria-hidden');
        else element.setAttribute('aria-hidden', ariaHidden);
      });
      trigger?.focus();
    };
  }, [isOpen, pathname]);

  const labelFor = (item: { labelKo: string; labelEn: string }) =>
    language === 'ko' ? item.labelKo : item.labelEn;

  const closeMenu = () => {
    setMenuState({ open: false, pathname });
  };

  return (
    <>
      <header ref={headerRef} className={`${styles.header} ${scrolled || pathname !== '/' ? styles.solid : ''}`}>
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
                  aria-current={pathname === link.href ? 'page' : undefined}
                >
                  {labelFor(link)}
                </Link>
              ))}
            </nav>

            <Link href="/join" className={styles.joinLink} aria-current={pathname === '/join' ? 'page' : undefined}>
              {labelFor({ labelKo: '접속', labelEn: 'Join' })}
            </Link>

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
            exit={{ opacity: 0, pointerEvents: 'none' }}
            transition={{ duration: reduceMotion ? 0 : 0.18 }}
          >
            <motion.div
              ref={panelRef}
              id="site-menu"
              className={styles.menuPanel}
              role="dialog"
              aria-modal="true"
              aria-label={labelFor({ labelKo: '전체 메뉴', labelEn: 'Site menu' })}
              onPointerDown={(event) => event.stopPropagation()}
              initial={reduceMotion ? false : 'closed'}
              animate="open"
              exit="closed"
              variants={{ closed: { y: reduceMotion ? 0 : -48, opacity: reduceMotion ? 1 : 0 }, open: { y: 0, opacity: 1 } }}
              transition={{ duration: reduceMotion ? 0 : 0.34, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className={styles.menuTopline}>
                <span>StimeMC</span>
                <button type="button" onClick={toggleLanguage} className={styles.closeButton} aria-label={language === 'ko' ? 'Switch to English' : '한국어로 전환'}>
                  KO / EN
                </button>
                <button type="button" onClick={closeMenu} className={styles.closeButton}>
                  {labelFor({ labelKo: '닫기', labelEn: 'Close' })}
                </button>
              </div>

              <div className={styles.menuGrid}>
                {navigationGroups.map((group, groupIndex) => (
                  <motion.section key={group.id} className={styles.menuGroup}
                    variants={{ closed: { y: reduceMotion ? 0 : -8, opacity: reduceMotion ? 1 : 0, transition: { duration: reduceMotion ? 0 : 0.12 } }, open: { y: 0, opacity: 1, transition: { duration: reduceMotion ? 0 : 0.22, delay: reduceMotion ? 0 : 0.04 + groupIndex * 0.025 } } }}>
                    <p>{String(groupIndex + 1).padStart(2, '0')} · {labelFor(group)}</p>
                    <div>
                      {group.links.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={(event) => {
                            event.stopPropagation();
                            closeMenu();
                          }}
                          className={pathname === link.href ? styles.menuLinkActive : undefined}
                          aria-current={pathname === link.href ? 'page' : undefined}
                        >
                          {labelFor(link)}
                        </Link>
                      ))}
                    </div>
                  </motion.section>
                ))}
              </div>

              <p className={styles.menuFootnote}>
                {labelFor({
                  labelKo: brandProfile.crossplayKo,
                  labelEn: brandProfile.crossplayEn,
                })}
              </p>
            </motion.div>
            <button className={styles.backdrop} onClick={closeMenu} tabIndex={-1} aria-label={labelFor({ labelKo: '메뉴 닫기', labelEn: 'Close menu' })} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
