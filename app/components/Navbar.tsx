'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from './LanguageProvider';
import { supabase } from '../lib/supabase';
import styles from '../styles/navbar.module.css';

export default function Navbar() {
  const { t, language, toggleLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false); // 전체 메뉴 열림 상태
  const pathname = usePathname();

  // 구글 로그인 상태 관리
  const [user, setUser] = useState<any | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // 1. 초기 세션 조회
    supabase.auth.getSession().then(({ data: { session } }) => {
      const activeUser = session?.user ?? null;
      setUser(activeUser);
      checkAdmin(activeUser?.email);
    });

    // 2. 인증 상태 리스너 등록
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const activeUser = session?.user ?? null;
      setUser(activeUser);
      checkAdmin(activeUser?.email);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkAdmin = (email: string | undefined) => {
    if (!email) {
      setIsAdmin(false);
      return;
    }
    const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
      .split(',')
      .map((e) => e.trim().toLowerCase());
    setIsAdmin(adminEmails.includes(email.toLowerCase()));
  };

  const handleSignIn = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            prompt: 'select_account',
          },
        },
      });
    } catch (err) {
      console.error('Sign in error:', err);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setIsAdmin(false);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  // 페이지 이동 시 전체 메뉴 닫기
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);



  const categories = [
    {
      id: 'about',
      labelKo: '소개 (About)',
      labelEn: 'About Server',
      links: [
        { href: '/server-mechanism', labelKo: '서버 메커니즘', labelEn: 'Server Mechanism' },
        { href: '/updates', labelKo: '업데이트 보기', labelEn: 'Updates' },
      ],
    },
    {
      id: 'guides',
      labelKo: '가이드 & 규칙 (Guides)',
      labelEn: 'Guides & Rules',
      links: [
        { href: '/rules', labelKo: '규칙 보기', labelEn: 'Rules' },
        { href: '/recovery-guidelines', labelKo: '복구 가이드라인', labelEn: 'Recovery Guidelines' },
      ],
    },
  ];

  return (
    <>
      <header className={styles.header}>
        <div className={styles.container}>
          {/* 로고 */}
          <Link href="/" className={styles.logo}>
            Stime <span className={styles.logoLight}>Networks</span>
          </Link>

          {/* 우측 네비게이션 트리거 및 언어 토글 */}
          <div className={styles.actions}>
            {/* 구글 로그인 / 로그아웃 버튼 */}
            {user ? (
              <button
                onClick={handleSignOut}
                className={styles.authBtnOut}
                title={user.email}
              >
                {t('로그아웃', 'Sign Out')}
              </button>
            ) : (
              <button
                onClick={handleSignIn}
                className={styles.authBtn}
              >
                {t('구글 로그인', 'Google Sign In')}
              </button>
            )}

            {/* 언어 스위치 버튼 */}
            <button
              onClick={toggleLanguage}
              className={styles.langBtn}
              aria-label="Change Language"
            >
              {language === 'ko' ? 'EN' : 'KO'}
            </button>

            {/* 전체 메뉴 트리거 버튼 (PC & 모바일 공용) */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`${styles.menuTriggerBtn} ${isOpen ? styles.menuTriggerActive : ''}`}
              aria-label="Toggle Menu"
            >
              <span className={styles.menuTriggerText}>
                {isOpen ? t('닫기', 'Close') : t('메뉴', 'Menu')}
              </span>
              <div className={`${styles.hamburger} ${isOpen ? styles.hamburgerActive : ''}`}>
                <span className={styles.hamburgerBar}></span>
                <span className={styles.hamburgerBar}></span>
                <span className={styles.hamburgerBar}></span>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* 상단 슬라이드 다운 전체 메뉴 패널 */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* 블러링 뒷배경 오버레이 */}
            <motion.div
              className={styles.overlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* 위에서 스윽 내려오는 전체 메뉴 패널 */}
            <motion.div
              className={styles.topPanel}
              initial={{ y: '-100%' }}
              animate={{ y: 0 }}
              exit={{ y: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 180 }}
            >
              <div className={styles.panelContent}>
                <div className={styles.panelGrid}>
                  {/* 단일 링크 컬럼 (홈 & 메인) */}
                  <div className={styles.panelColumn}>
                    <p className={styles.columnHeader}>{t('시작하기', 'Getting Started')}</p>
                    <Link
                      href="/"
                      className={`${styles.panelLink} ${pathname === '/' ? styles.panelLinkActive : ''}`}
                    >
                      {t('홈 화면', 'Home Page')}
                    </Link>
                    <Link
                      href="/join"
                      className={`${styles.panelLink} ${pathname === '/join' ? styles.panelLinkActive : ''}`}
                    >
                      {t('서버에 가입하기', 'Join Server')}
                    </Link>
                    <Link
                      href="/support"
                      className={`${styles.panelLink} ${pathname === '/support' ? styles.panelLinkActive : ''}`}
                    >
                      {t('1:1 문의하기', 'Support Chat')}
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/taskboard"
                        className={`${styles.panelLink} ${pathname === '/taskboard' ? styles.panelLinkActive : ''}`}
                      >
                        {t('어드민 대시보드', 'Admin Console')}
                      </Link>
                    )}
                  </div>

                  {/* 카테고리별 동적 링크 컬럼 */}
                  {categories.map((category) => (
                    <div key={category.id} className={styles.panelColumn}>
                      <p className={styles.columnHeader}>
                        {language === 'ko' ? category.labelKo : category.labelEn}
                      </p>
                      {category.links.map((link) => {
                        const isLinkActive = pathname === link.href;
                        return (
                          <Link
                            key={link.href}
                            href={link.href}
                            className={`${styles.panelLink} ${
                              isLinkActive ? styles.panelLinkActive : ''
                            }`}
                          >
                            {language === 'ko' ? link.labelKo : link.labelEn}
                          </Link>
                        );
                      })}
                    </div>
                  ))}
                </div>

                {/* 패널 하단 푸터 영역 */}
                <div className={styles.panelFooter}>
                  <div className={styles.footerInfo}>
                    <span className={styles.footerBrand}>Stime Networks MC</span>
                    <span className={styles.footerMute}>{t('엔지니어링 중심의 게임 플레이 경험', 'Engineering-led Minecraft Server Experience.')}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
