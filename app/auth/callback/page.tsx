'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../client/supabase';
import { useLanguage } from '../../components/LanguageProvider';
import styles from './auth.module.css';

export default function AuthCallback() {
  return (
    <Suspense fallback={<AuthStatus />}>
      <AuthCallbackContent />
    </Suspense>
  );
}

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedNext = searchParams.get('next');
  const adminDestination = /^\/taskboard\?inquiry=[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestedNext ?? '')
    ? requestedNext ?? '/taskboard'
    : '/taskboard';

  useEffect(() => {
    let cancelled = false;
    let revision = 0;
    let work: ReturnType<typeof setTimeout> | undefined;
    const fallback = setTimeout(() => { if (!cancelled) router.replace('/'); }, 15000);
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const current = ++revision;
      clearTimeout(work);
      if (!session) return;
      // Leave the auth callback before making another Supabase request.
      work = setTimeout(async () => {
        const { data, error } = await supabase.rpc('is_support_admin');
        if (!cancelled && current === revision) {
          clearTimeout(fallback);
          router.replace(!error && data === true ? adminDestination : '/support');
        }
      }, 0);
    });
    return () => {
      cancelled = true;
      clearTimeout(work);
      clearTimeout(fallback);
      subscription.unsubscribe();
    };
  }, [adminDestination, router]);

  return <AuthStatus />;
}

function AuthStatus() {
  const { t } = useLanguage();
  return (
    <main className={styles.main}>
      <section className={styles.status} aria-live="polite" aria-busy="true">
        <p className={styles.brand}>STIMEMC / AUTHENTICATION</p>
        <div className={styles.spinner} aria-hidden="true" />
        <h1 className={styles.title}>{t('로그인 연결 중', 'Connecting your account')}</h1>
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
