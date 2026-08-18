'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../components/LanguageProvider';
import styles from './auth.module.css';

export default function AuthCallback() {
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    // Supabase Auth 상태 변화를 감지하여 세션이 성공적으로 처리되면 리다이렉트합니다.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        const email = session.user?.email;
        const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
          .split(',')
          .map((e) => e.trim().toLowerCase());

        if (email && adminEmails.includes(email.toLowerCase())) {
          // 관리자 리다이렉트
          router.replace('/taskboard');
        } else {
          // 일반 사용자 리다이렉트
          router.replace('/support');
        }
      } else {
        // 세션 로드에 일정 시간 이상 실패하면 메인 페이지로 이동
        const timer = setTimeout(() => {
          router.replace('/');
        }, 3000);
        return () => clearTimeout(timer);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  return (
    <main className={styles.main}>
      <section className={styles.status} aria-live="polite" aria-busy="true">
        <p className={styles.brand}>Stime Networks · Authentication</p>
        <div className={styles.spinner} aria-hidden="true" />
        <p className={styles.message}>
          {t(
            'Google 로그인 세션을 처리하고 있습니다. 잠시만 기다려 주세요.',
            'We are processing your Google sign-in session. Please wait a moment.',
          )}
        </p>
      </section>
    </main>
  );
}
