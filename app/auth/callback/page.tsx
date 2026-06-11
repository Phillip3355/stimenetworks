'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function AuthCallback() {
  const router = useRouter();

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
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      flexDirection: 'column',
      gap: '20px',
      color: 'var(--color-ink)',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '3px solid var(--color-hairline)',
        borderTopColor: 'var(--color-primary)',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <p style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--color-mute)' }}>
        구글 로그인 세션을 처리하는 중입니다. 잠시만 기다려 주세요...
      </p>
    </div>
  );
}
