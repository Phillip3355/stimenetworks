'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useLanguage } from '../components/LanguageProvider';
import { supabase } from '../lib/supabase';
import { canAccessGuestInquiry, normalizeInquiryCode } from '../lib/guestInquiry.mjs';
import styles from '../styles/server-mechanism.module.css';

interface Inquiry {
  id: string;
  user_id?: string | null;
  inquiry_code: string;
  status: 'open' | 'replied' | string;
  created_at: string;
  nickname?: string;
}

interface InquiryMessage {
  id: string;
  sender: 'user' | 'admin' | string;
  message: string;
  created_at: string;
}

interface InquiryChatProps {
  inquiry: Inquiry;
  messages: InquiryMessage[];
  newMessage: string;
  onMessageChange: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
  onBack: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  translate: (ko: string, en: string) => string;
}

function InquiryChat({ inquiry, messages, newMessage, onMessageChange, onSubmit, onBack, messagesEndRef, translate }: InquiryChatProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-hairline)', background: 'var(--color-canvas)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <button
            type="button"
            onClick={onBack}
            className={styles.mobileBackButton}
            style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', padding: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, fontSize: '0.9rem' }}
          >
            ← {translate('목록으로', 'Back to List')}
          </button>
          <h4 style={{ margin: 0, fontWeight: 700, color: 'var(--color-ink)' }}>
            {translate('티켓 코드:', 'Ticket code:')} {inquiry.inquiry_code}
          </h4>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--color-mute)' }}>
            {translate('접수 일시:', 'Created:')} {new Date(inquiry.created_at).toLocaleString()}
          </p>
        </div>
      </div>

      <div className={styles.chatFeed} style={{ flexGrow: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {messages.map((msg) => {
          const isMsgAdmin = msg.sender === 'admin';
          return (
            <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMsgAdmin ? 'flex-start' : 'flex-end', width: '100%' }}>
              <div className={isMsgAdmin ? styles.chatBubbleAdmin : styles.chatBubbleUser} style={{
                maxWidth: '70%', padding: '12px 18px', borderRadius: '16px',
                borderTopLeftRadius: isMsgAdmin ? '2px' : '16px', borderTopRightRadius: isMsgAdmin ? '16px' : '2px',
                background: isMsgAdmin ? 'var(--color-primary)' : '#ffffff', color: isMsgAdmin ? '#ffffff' : 'var(--color-ink)',
                border: isMsgAdmin ? 'none' : '1px solid var(--color-hairline)', fontSize: '0.95rem', lineHeight: 1.5,
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)', whiteSpace: 'pre-wrap', wordBreak: 'break-all'
              }}>
                {msg.message}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-mute)', marginTop: '4px', padding: '0 4px' }}>
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form className={styles.chatComposer} onSubmit={onSubmit} style={{ padding: '16px 24px', borderTop: '1px solid var(--color-hairline)', display: 'flex', gap: '12px' }}>
        <input
          type="text" placeholder={translate('추가 메시지를 입력해 주세요...', 'Type your message...')}
          value={newMessage} onChange={(event) => onMessageChange(event.target.value)} required
          style={{ flexGrow: 1, padding: '12px 18px', border: '1px solid var(--color-hairline)', borderRadius: '30px', fontSize: '0.95rem', outline: 'none' }}
        />
        <button type="submit" style={{ background: 'var(--color-ink)', border: 'none', color: 'var(--color-canvas)', padding: '0 24px', borderRadius: '30px', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' }}>
          {translate('전송', 'Send')}
        </button>
      </form>
    </div>
  );
}

// 6자리 랜덤 대문자/숫자 문의 코드 생성 함수
function generateInquiryCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'STM-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default function SupportPage() {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();

  // 상태 관리
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorText, setErrorText] = useState('');

  // 유저 대시보드 상태
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [messages, setMessages] = useState<InquiryMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');

  // 새 문의 작성 폼 상태
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [nickname, setNickname] = useState('');
  const [inquiryType, setInquiryType] = useState('기타');
  const [inquiryContent, setInquiryContent] = useState('');
  const [inquiryPurpose, setInquiryPurpose] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [guestDialog, setGuestDialog] = useState<'menu' | 'create' | 'lookup' | null>(null);
  const [guestLookupCode, setGuestLookupCode] = useState('');
  const [guestCodeNotice, setGuestCodeNotice] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const drawerTransition = reduceMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 320, damping: 30, mass: 0.9 };

  useEffect(() => {
    if (!guestDialog && !guestCodeNotice) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || isSubmitting) return;
      setGuestDialog(null);
      setGuestCodeNotice(null);
    };

    window.addEventListener('keydown', handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [guestDialog, guestCodeNotice, isSubmitting]);

  // 채팅방 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 1. 구글 Auth 세션 및 상태 감지
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const activeUser = session?.user ?? null;
      setUser(activeUser);
      checkAdminStatus(activeUser?.email);
      if (activeUser) {
        const googleName = activeUser.user_metadata?.full_name || activeUser.user_metadata?.name || activeUser.email?.split('@')[0] || '';
        setNickname(googleName);
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const activeUser = session?.user ?? null;
      setUser(activeUser);
      checkAdminStatus(activeUser?.email);
      if (activeUser) {
        const googleName = activeUser.user_metadata?.full_name || activeUser.user_metadata?.name || activeUser.email?.split('@')[0] || '';
        setNickname(googleName);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkAdminStatus = async (email: string | undefined) => {
    if (!email) {
      setIsAdmin(false);
      return;
    }
    const { data, error } = await supabase.rpc('is_support_admin');
    setIsAdmin(!error && data === true);
  };

  // 2. 로그인 완료 시 사용자의 모든 문의 목록 실시간 동기화
  useEffect(() => {
    if (!user || isAdmin) {
      setInquiries([]);
      setSelectedInquiry(null);
      setMessages([]);
      return;
    }
    const userId = user.id;

    async function loadUserInquiries() {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('inquiries')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setInquiries(data || []);
      } catch (err: unknown) {
        console.error('Failed to load inquiries:', err);
        setErrorText(t('문의 내역을 불러오지 못했습니다.', 'Failed to load inquiries.'));
      } finally {
        setIsLoading(false);
      }
    }

    loadUserInquiries();

    // 실시간 방 감지
    const inquiriesChannel = supabase
      .channel(`inquiries_user_${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inquiries', filter: `user_id=eq.${userId}` },
        () => {
          loadUserInquiries();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(inquiriesChannel);
    };
  }, [user, isAdmin, t]);

  // 3. 선택한 문의방의 메시지 로드 & 실시간 구독 설정
  useEffect(() => {
    if (!selectedInquiry) return;
    const inquiryId = selectedInquiry.id;
    const inquiryCode = selectedInquiry.inquiry_code;
    const isGuestInquiry = selectedInquiry.user_id === null;

    // 초기 메시지 로드
    async function loadMessages() {
      const { data, error } = isGuestInquiry
        ? await supabase.rpc('get_guest_inquiry_messages', { p_inquiry_code: inquiryCode })
        : await supabase
          .from('inquiry_messages')
          .select('*')
          .eq('inquiry_id', inquiryId)
          .order('created_at', { ascending: true });
      if (!error && data) {
        setMessages(data);
      }
    }
    loadMessages();

    if (isGuestInquiry) {
      const poll = window.setInterval(loadMessages, 5000);
      return () => window.clearInterval(poll);
    }

    // 실시간 구독 설정
    const channel = supabase
      .channel(`user_chat_${inquiryId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'inquiry_messages',
          filter: `inquiry_id=eq.${inquiryId}`,
        },
        (payload) => {
          setMessages((prev) => {
            if (prev.find(m => m.id === payload.new.id)) return prev;
            return [...prev, payload.new as InquiryMessage];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedInquiry]);

  // 구글 로그인 트리거
  const handleGoogleSignIn = async () => {
    try {
      setErrorText('');
      const redirectUrl = process.env.NODE_ENV === 'development'
        ? 'http://localhost:3000/auth/callback'
        : 'https://stimemc.xyz/auth/callback';
        
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            prompt: 'select_account',
          },
        },
      });
    } catch (err: unknown) {
      console.error(err);
      setErrorText(t('구글 로그인 시도 중 오류가 발생했습니다.', 'Error occurred during Google sign in.'));
    }
  };

  // 구글 로그아웃 트리거
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setInquiries([]);
      setSelectedInquiry(null);
      setMessages([]);
      setIsCreatingNew(false);
    } catch (err) {
      console.error(err);
    }
  };

  // 새로운 문의방 생성 및 초기 메시지 전송
  const handleCreateInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !nickname.trim() || !inquiryContent.trim() || !inquiryPurpose.trim()) return;

    setIsSubmitting(true);
    setErrorText('');
    const code = generateInquiryCode();

    try {
      // 0. 1시간 내 문의 3개 제한 확인
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { count, error: countError } = await supabase
        .from('inquiries')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', oneHourAgo);

      if (countError) throw countError;
      if (count !== null && count >= 3) {
        setErrorText(t('1시간 내에 최대 3개의 문의만 생성할 수 있습니다.', 'You can only create up to 3 inquiries per hour.'));
        setIsSubmitting(false);
        return;
      }

      // 1. 문의방(inquiries) 생성
      const { data: newInquiry, error: inquiryError } = await supabase
        .from('inquiries')
        .insert([{
          user_id: user.id,
          nickname: nickname.trim(),
          inquiry_code: code,
          status: 'open'
        }])
        .select()
        .single();

      if (inquiryError) throw inquiryError;

      if (newInquiry) {
        // 2. 초기 폼 데이터를 포맷팅하여 첫 메시지로 삽입
        const initialMessage = `[문의 유형] ${inquiryType}
[문의 내용]
${inquiryContent.trim()}

[문의 목적]
${inquiryPurpose.trim()}`;

        const { error: msgError } = await supabase
          .from('inquiry_messages')
          .insert([
            {
              inquiry_id: newInquiry.id,
              sender: 'user',
              message: initialMessage,
            },
          ]);

        if (msgError) throw msgError;

        // 성공 시 상태 초기화 및 해당 방 열기
        setInquiryContent('');
        setInquiryPurpose('');
        setIsCreatingNew(false);
        setSelectedInquiry(newInquiry);
        setInquiries(prev => [newInquiry, ...prev]);
      }
    } catch (err: unknown) {
      console.error(err);
      setErrorText(t('문의를 만들지 못했습니다. 잠시 후 다시 시도해 주세요.', 'We could not start your inquiry. Please try again shortly.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuestCreateInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim() || !inquiryContent.trim() || !inquiryPurpose.trim()) return;

    setIsSubmitting(true);
    setErrorText('');

    try {
      const { data: newInquiry, error: inquiryError } = await supabase.rpc('create_guest_inquiry', {
        p_nickname: nickname.trim(),
        p_inquiry_type: inquiryType,
        p_content: inquiryContent.trim(),
        p_purpose: inquiryPurpose.trim(),
      });

      if (inquiryError) throw inquiryError;
      if (!newInquiry) throw new Error('Guest inquiry was not returned.');

      setInquiryContent('');
      setInquiryPurpose('');
      setSelectedInquiry(newInquiry);
      setGuestDialog(null);
      setGuestCodeNotice(newInquiry.inquiry_code);
    } catch (err: unknown) {
      console.error(err);
      setErrorText(t('비회원 문의를 시작하지 못했습니다. 잠시 후 다시 시도해 주세요.', 'We could not start your guest inquiry. Please try again shortly.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuestLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = normalizeInquiryCode(guestLookupCode);
    if (!code) {
      setErrorText(t('STM-으로 시작하는 6~18자리 문의번호를 입력해 주세요.', 'Enter the 6 to 18 character inquiry code beginning with STM-.'));
      return;
    }

    setIsSubmitting(true);
    setErrorText('');
    try {
      const { data, error } = await supabase.rpc('get_guest_inquiry', { p_inquiry_code: code });
      const inquiry = Array.isArray(data) ? data[0] : data;

      if (error) throw error;
      if (!canAccessGuestInquiry(inquiry)) {
        setErrorText(t('일치하는 문의를 찾을 수 없습니다. 문의번호를 다시 확인해 주세요.', 'We could not find that inquiry. Please check the code and try again.'));
        return;
      }

      setSelectedInquiry(inquiry);
      setGuestLookupCode('');
      setGuestDialog(null);
    } catch (err: unknown) {
      console.error(err);
      setErrorText(t('문의 조회 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.', 'We could not look up your inquiry. Please try again shortly.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // 사용자 일반 메시지 전송
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedInquiry) return;

    const msgContent = newMessage.trim();
    setNewMessage(''); // 즉시 청소

    try {
      const { error } = !user && selectedInquiry.user_id === null
        ? await supabase.rpc('send_guest_inquiry_message', {
          p_inquiry_code: selectedInquiry.inquiry_code,
          p_message: msgContent,
        })
        : await supabase
          .from('inquiry_messages')
          .insert([
            {
              inquiry_id: selectedInquiry.id,
              sender: 'user',
              message: msgContent,
            },
          ]);

      if (error) throw error;

      if (user || selectedInquiry.user_id !== null) {
        // 일반 유저가 메시지를 보냈으므로 문의방 상태를 open(대기중)으로 변경
        await supabase
          .from('inquiries')
          .update({ status: 'open' })
          .eq('id', selectedInquiry.id);
      }

    } catch (err: unknown) {
      console.error(err);
      setErrorText(t('메시지 전송 실패', 'Failed to send message'));
    }
  };

  return (
    <main className={styles.main}>
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <motion.h1 className={styles.heroTitle} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            {t('도움이 필요하신가요?', 'Need a hand?')}
          </motion.h1>
          <motion.p className={styles.heroSubtitle} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
            {t(
              '궁금한 점이나 플레이 중 생긴 문제를 남겨주세요. 답변을 확인하고 같은 화면에서 대화를 이어갈 수 있습니다.',
              'Tell us what you are curious about or what went wrong in game, then check the reply and continue the conversation here.'
            )}
          </motion.p>
        </div>
      </section>

      <section className={styles.sectionCanvas}>
        <div className={styles.sectionContent}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-mute)' }}>
              <div style={{
                width: '32px', height: '32px', border: '3px solid var(--color-hairline)', borderTopColor: 'var(--color-primary)',
                borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px'
              }} />
              <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
              <p>{t('데이터 불러오는 중...', 'Loading data...')}</p>
            </div>
          ) : !user && selectedInquiry ? (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className={`${styles.dashboardGrid} ${styles.supportGrid} ${styles.guestSupportGrid} ${styles.activeChat}`}
            >
              <div className={styles.chatPanel}>
                <InquiryChat
                  inquiry={selectedInquiry}
                  messages={messages}
                  newMessage={newMessage}
                  onMessageChange={setNewMessage}
                  onSubmit={handleSendMessage}
                  onBack={() => { setSelectedInquiry(null); setMessages([]); setGuestDialog('menu'); }}
                  messagesEndRef={messagesEndRef}
                  translate={t}
                />
              </div>
            </motion.div>
          ) : !user ? (
            // ================= [구글 비로그인 상태 UI] =================
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className={styles.authChoiceGrid}
            >
              <article className={`${styles.timelineCard} ${styles.authChoiceCard} ${styles.authChoiceCardPrimary}`}>
                <span className={styles.cornerSquare} />
                <div className={styles.authChoiceCopy}>
                  <p className={styles.authChoiceEyebrow}>{t('로그인 문의', 'SIGNED-IN SUPPORT')}</p>
                  <h3 className={styles.timelineTitle}>{t('구글 로그인으로 시작하기', 'Start with Google')}</h3>
                </div>
                <p className={styles.timelineText}>
                  {t(
                    '구글 계정으로 연결하면 1:1 문의를 시작하고, 나중에 돌아와도 이전 대화를 그대로 이어볼 수 있습니다.',
                    'Connect your Google account to start a private conversation and pick up where you left off whenever you return.'
                  )}
                </p>
                <button onClick={handleGoogleSignIn} className={`${styles.authChoiceButton} ${styles.authChoiceButtonPrimary}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                  </svg>
                  {t('구글 로그인으로 시작하기', 'Google Sign In to Start')}
                </button>
              </article>

              <article className={`${styles.timelineCard} ${styles.authChoiceCard} ${styles.authChoiceCardSecondary}`}>
                <span className={styles.cornerSquare} />
                <div className={styles.authChoiceCopy}>
                  <p className={styles.authChoiceEyebrow}>{t('로그인 없이 문의', 'NO ACCOUNT NEEDED')}</p>
                  <h3 className={styles.timelineTitle}>{t('비회원으로 문의하기', 'Continue as a guest')}</h3>
                </div>
                <p className={styles.timelineText}>
                  {t(
                    '로그인 없이 문의를 남기고, 발급받은 고유번호로 나중에 대화를 다시 확인할 수 있습니다.',
                    'Leave a message without signing in and return later with the inquiry code you receive.'
                  )}
                </p>
                <button type="button" onClick={() => setGuestDialog('menu')} className={`${styles.authChoiceButton} ${styles.authChoiceButtonSecondary}`}>
                  {t('비회원 문의하기', 'Guest Inquiry')}
                </button>
              </article>
            </motion.div>
          ) : isAdmin ? (
            // ================= [관리자 계정 경고 배너] =================
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
              <article className={styles.timelineCard} style={{ padding: '36px', textAlign: 'center', borderColor: '#f59e0b' }}>
                <span className={styles.cornerSquare} style={{ backgroundColor: '#f59e0b' }} />
                <h3 className={styles.timelineTitle} style={{ color: '#d97706' }}>{t('관리자 계정 접근 안내', 'Admin Account Detected')}</h3>
                <p className={styles.timelineText} style={{ marginBottom: '24px' }}>
                  {t(
                    '관리자 그룹에 할당된 구글 계정으로 로그인되어 있습니다. 유저 문의 상담 및 답변 관리를 위해 어드민 대시보드 콘솔로 이동해 주세요.',
                    'You are logged in with an administrator account. Please proceed to the Admin Console.'
                  )}
                </p>
                <Link
                  href="/taskboard"
                  className={styles.buttonOutline}
                  style={{ display: 'inline-block', padding: '12px 24px', fontWeight: 700, textDecoration: 'none', color: 'var(--color-canvas)', background: 'var(--color-primary)', border: 'none', borderRadius: 'var(--radius-sm)' }}
                >
                  {t('어드민 콘솔로 이동', 'Go to Admin Console')}
                </Link>
              </article>
            </div>
          ) : (
            // ================= [로그인 완료된 유저 대시보드 스플릿 레이아웃] =================
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className={`${styles.dashboardGrid} ${styles.supportGrid} ${
                (selectedInquiry || isCreatingNew) ? styles.activeChat : ''
              }`}
            >
              {/* 좌측 패널: 티켓 목록 및 내정보 */}
              <div className={styles.listPanel}>
                {/* 사용자 정보 카드 */}
                <div style={{
                  border: '1px solid var(--color-hairline)', borderRadius: 'var(--radius-sm)', background: 'var(--color-surface)', padding: '20px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <strong style={{ fontSize: '1.1rem', color: 'var(--color-ink)' }}>{nickname}</strong>
                    <button onClick={handleSignOut} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                      {t('로그아웃', 'Sign Out')}
                    </button>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-mute)', wordBreak: 'break-all' }}>{user.email}</p>
                </div>

                {/* 내 문의 목록 */}
                <div style={{
                  border: '1px solid var(--color-hairline)', borderRadius: 'var(--radius-sm)', background: 'var(--color-surface)', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexGrow: 1
                }}>
                  <div style={{
                    padding: '16px', borderBottom: '1px solid var(--color-hairline)', background: 'var(--color-canvas)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}>
                    <span style={{ fontWeight: 700, color: 'var(--color-ink)' }}>{t('내 문의 내역', 'My Inquiries')}</span>
                    <button
                      onClick={() => { setIsCreatingNew(true); setSelectedInquiry(null); }}
                      style={{
                        background: 'var(--color-ink)', color: 'var(--color-canvas)', border: 'none', borderRadius: '4px',
                        padding: '6px 12px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer'
                      }}
                    >
                      + {t('새 문의', 'New')}
                    </button>
                  </div>
                  
                  <div style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                    {inquiries.length === 0 ? (
                      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-mute)', fontSize: '0.9rem' }}>
                        {t('등록된 문의가 없습니다.', 'No inquiries found.')}
                      </div>
                    ) : (
                      inquiries.map((item) => {
                        const isSelected = selectedInquiry?.id === item.id && !isCreatingNew;
                        const isReplied = item.status === 'replied';
                        return (
                          <div
                            key={item.id}
                            onClick={() => { setSelectedInquiry(item); setIsCreatingNew(false); }}
                            style={{
                              padding: '16px', borderBottom: '1px solid var(--color-hairline)', cursor: 'pointer',
                              background: isSelected ? 'var(--color-surface-raised)' : 'var(--color-surface)',
                              borderLeft: isSelected ? '4px solid var(--color-primary)' : '4px solid transparent',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                              <strong style={{ fontSize: '0.95rem', color: 'var(--color-ink)' }}>{item.inquiry_code}</strong>
                              <span style={{
                                fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', fontWeight: 700,
                                background: isReplied ? '#e0f2fe' : '#fef3c7',
                                color: isReplied ? '#0284c7' : '#d97706'
                              }}>
                                {isReplied ? t('답변완료', 'Replied') : t('대기중', 'Open')}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-mute)' }}>
                              {new Date(item.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* 우측 패널: 채팅방 또는 새 문의 폼 */}
              <div className={styles.chatPanel}>
                {isCreatingNew ? (
                  // ================= [새 문의 작성 폼] =================
                  <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-hairline)', background: 'var(--color-canvas)' }}>
                      <button
                        type="button"
                        onClick={() => setIsCreatingNew(false)}
                        className={styles.mobileBackButton}
                        style={{
                          background: 'none', border: 'none', color: 'var(--color-primary)',
                          cursor: 'pointer', padding: '0 0 8px 0', display: 'flex', alignItems: 'center',
                          gap: '4px', fontWeight: 600, fontSize: '0.9rem'
                        }}
                      >
                        ← {t('목록으로', 'Back to List')}
                      </button>
                      <h3 style={{ margin: 0, fontWeight: 800 }}>{t('새로운 1:1 문의 접수', 'Submit a New Ticket')}</h3>
                      <p style={{ margin: '8px 0 0', fontSize: '0.9rem', color: 'var(--color-mute)' }}>
                        아래 양식을 작성하면 바로 1:1 대화를 시작할 수 있습니다.
                      </p>
                    </div>
                    
                    <form onSubmit={handleCreateInquiry} style={{ padding: '32px 24px', flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      {/* 마인크래프트 닉네임 작성 */}
                      <div>
                        <label style={{ display: 'block', fontWeight: 700, marginBottom: '8px', color: 'var(--color-ink)' }}>
                          {t('마인크래프트 닉네임', 'Minecraft Nickname')} <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                          type="text"
                          placeholder={t('마인크래프트 닉네임을 입력해 주세요', 'Enter your Minecraft nickname')}
                          value={nickname}
                          onChange={(e) => setNickname(e.target.value)}
                          required
                          style={{
                            width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--color-hairline)', fontSize: '0.95rem', background: '#fff'
                          }}
                        />
                      </div>

                      {/* 문의 유형 선택 */}
                      <div>
                        <label style={{ display: 'block', fontWeight: 700, marginBottom: '8px', color: 'var(--color-ink)' }}>
                          {t('문의 유형', 'Inquiry Type')} <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <select
                          value={inquiryType}
                          onChange={(e) => setInquiryType(e.target.value)}
                          required
                          style={{
                            width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--color-hairline)', fontSize: '0.95rem', background: '#fff'
                          }}
                        >
                          <option value="복구">복구 (Recovery)</option>
                          <option value="신고">신고 (Report)</option>
                          <option value="서버">서버 (Server Issues)</option>
                          <option value="기타">기타 (Others)</option>
                        </select>
                      </div>

                      {/* 문의 내용 작성 */}
                      <div>
                        <label style={{ display: 'block', fontWeight: 700, marginBottom: '8px', color: 'var(--color-ink)' }}>
                          {t('문의 내용', 'Inquiry Content')} <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <textarea
                          placeholder={t('//문의 내용을 입력해주세요!', '// Please enter the details of your inquiry!')}
                          value={inquiryContent}
                          onChange={(e) => setInquiryContent(e.target.value)}
                          required
                          rows={6}
                          style={{
                            width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--color-hairline)', fontSize: '0.95rem', resize: 'vertical'
                          }}
                        />
                      </div>

                      {/* 문의 목적 작성 */}
                      <div>
                        <label style={{ display: 'block', fontWeight: 700, marginBottom: '8px', color: 'var(--color-ink)' }}>
                          {t('문의 목적', 'Expected Resolution')} <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <textarea
                          placeholder={t('//어떤 대응이나 답변을 원하시나요?', '// What kind of resolution or response are you expecting?')}
                          value={inquiryPurpose}
                          onChange={(e) => setInquiryPurpose(e.target.value)}
                          required
                          rows={4}
                          style={{
                            width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--color-hairline)', fontSize: '0.95rem', resize: 'vertical'
                          }}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        style={{
                          marginTop: '16px', padding: '16px', background: 'var(--color-ink)', color: 'var(--color-canvas)',
                          border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 800, fontSize: '1.05rem', cursor: 'pointer'
                        }}
                      >
                        {isSubmitting ? t('처리 중...', 'Processing...') : t('채팅 시작하기', 'Start Chat')}
                      </button>
                    </form>
                  </div>
                ) : selectedInquiry ? (
                  <InquiryChat
                    inquiry={selectedInquiry}
                    messages={messages}
                    newMessage={newMessage}
                    onMessageChange={setNewMessage}
                    onSubmit={handleSendMessage}
                    onBack={() => setSelectedInquiry(null)}
                    messagesEndRef={messagesEndRef}
                    translate={t}
                  />
                ) : (
                  // ================= [빈 화면 (선택 안됨)] =================
                  <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-mute)', flexDirection: 'column', gap: '12px' }}>
                    <span style={{ fontSize: '3rem' }}>💡</span>
                    <p>{t('왼쪽에서 문의 내역을 선택하거나 [새 문의] 버튼을 눌러주세요.', 'Select a ticket or create a new one.')}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {guestDialog && (
              <motion.div
                className={styles.modalBackdrop}
                role="presentation"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.22, ease: 'easeOut' }}
                onMouseDown={() => !isSubmitting && setGuestDialog(null)}
              >
                <motion.section
                  className={styles.modalCard}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="guest-inquiry-title"
                  initial={{ y: reduceMotion ? 0 : '100%', opacity: reduceMotion ? 1 : 0.7 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: reduceMotion ? 0 : '100%', opacity: reduceMotion ? 1 : 0.7 }}
                  transition={drawerTransition}
                  onMouseDown={(event) => event.stopPropagation()}
                >
                  <div className={styles.modalGrip} aria-hidden="true" />
                  <div className={`${styles.modalHeader} ${guestDialog === 'menu' ? styles.modalHeaderMenu : ''}`}>
                    <div>
                      <p className={styles.eyebrow}>{t('비회원 문의', 'Guest inquiry')}</p>
                      <h2 id="guest-inquiry-title" className={styles.modalTitle}>
                        {guestDialog === 'menu' && t('무엇을 도와드릴까요?', 'How can we help?')}
                        {guestDialog === 'create' && t('문의 시작하기', 'Start an inquiry')}
                        {guestDialog === 'lookup' && t('문의 조회하기', 'Find an inquiry')}
                      </h2>
                    </div>
                    <button type="button" onClick={() => setGuestDialog(null)} className={styles.modalClose} aria-label={t('닫기', 'Close')}>×</button>
                  </div>

                  <AnimatePresence mode="wait" initial={false}>
                    {guestDialog === 'menu' && (
                      <motion.div
                        key="guest-menu"
                        className={styles.modalBody}
                        initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: reduceMotion ? 0 : -10 }}
                        transition={{ duration: reduceMotion ? 0 : 0.18 }}
                      >
                        <p className={styles.timelineText}>{t('로그인 없이 문의를 남기거나, 캡처해 둔 문의번호로 이전 대화에 다시 들어갈 수 있습니다.', 'Start without signing in, or use your saved inquiry code to return to an earlier conversation.')}</p>
                        <div className={styles.guestChoiceGrid}>
                          <button type="button" className={styles.guestChoice} onClick={() => setGuestDialog('create')}>
                            <strong>{t('문의 시작하기', 'Start an inquiry')}</strong>
                            <span>{t('새 문의를 작성하고 상담을 시작합니다.', 'Write a new message and begin chatting.')}</span>
                          </button>
                          <button type="button" className={styles.guestChoice} onClick={() => setGuestDialog('lookup')}>
                            <strong>{t('문의 조회하기', 'Find an inquiry')}</strong>
                            <span>{t('캡처한 고유번호로 대화를 다시 엽니다.', 'Use your saved code to reopen a conversation.')}</span>
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {guestDialog === 'create' && (
                      <motion.form
                        key="guest-create"
                        className={styles.modalForm}
                        onSubmit={handleGuestCreateInquiry}
                        initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: reduceMotion ? 0 : -10 }}
                        transition={{ duration: reduceMotion ? 0 : 0.18 }}
                      >
                        <div>
                          <label>{t('마인크래프트 닉네임', 'Minecraft Nickname')} <span aria-hidden="true">*</span></label>
                          <input type="text" value={nickname} onChange={(event) => setNickname(event.target.value)} placeholder={t('마인크래프트 닉네임을 입력해 주세요', 'Enter your Minecraft nickname')} required />
                        </div>
                        <div>
                          <label>{t('문의 유형', 'Inquiry Type')} <span aria-hidden="true">*</span></label>
                          <select value={inquiryType} onChange={(event) => setInquiryType(event.target.value)} required>
                            <option value="복구">복구 (Recovery)</option>
                            <option value="신고">신고 (Report)</option>
                            <option value="서버">서버 (Server Issues)</option>
                            <option value="기타">기타 (Others)</option>
                          </select>
                        </div>
                        <div>
                          <label>{t('문의 내용', 'Inquiry Content')} <span aria-hidden="true">*</span></label>
                          <textarea value={inquiryContent} onChange={(event) => setInquiryContent(event.target.value)} placeholder={t('//문의 내용을 입력해주세요!', '// Please enter the details of your inquiry!')} rows={5} required />
                        </div>
                        <div>
                          <label>{t('문의 목적', 'Expected Resolution')} <span aria-hidden="true">*</span></label>
                          <textarea value={inquiryPurpose} onChange={(event) => setInquiryPurpose(event.target.value)} placeholder={t('//어떤 대응이나 답변을 원하시나요?', '// What kind of resolution or response are you expecting?')} rows={3} required />
                        </div>
                        <button type="submit" className={styles.modalSubmit} disabled={isSubmitting}>
                          {isSubmitting ? t('처리 중...', 'Processing...') : t('문의 전송하기', 'Send inquiry')}
                        </button>
                      </motion.form>
                    )}

                    {guestDialog === 'lookup' && (
                      <motion.form
                        key="guest-lookup"
                        className={styles.modalForm}
                        onSubmit={handleGuestLookup}
                        initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: reduceMotion ? 0 : -10 }}
                        transition={{ duration: reduceMotion ? 0 : 0.18 }}
                      >
                        <p className={styles.timelineText}>{t('문의 접수 후 캡처해 둔 고유번호를 입력해 주세요.', 'Enter the unique code you captured after submitting your inquiry.')}</p>
                        <div>
                          <label>{t('문의 고유번호', 'Inquiry code')}</label>
                          <input type="text" value={guestLookupCode} onChange={(event) => setGuestLookupCode(event.target.value.toUpperCase())} placeholder="STM-ABC123" autoCapitalize="characters" autoCorrect="off" required />
                        </div>
                        <button type="submit" className={styles.modalSubmit} disabled={isSubmitting}>
                          {isSubmitting ? t('조회 중...', 'Looking up...') : t('문의 채팅창 열기', 'Open inquiry chat')}
                        </button>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </motion.section>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {guestCodeNotice && (
              <motion.div
                className={styles.modalBackdrop}
                role="presentation"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.22, ease: 'easeOut' }}
              >
                <motion.section
                  className={styles.codeNotice}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="guest-code-title"
                  initial={{ y: reduceMotion ? 0 : '100%', opacity: reduceMotion ? 1 : 0.7 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: reduceMotion ? 0 : '100%', opacity: reduceMotion ? 1 : 0.7 }}
                  transition={drawerTransition}
                >
                  <div className={styles.modalGrip} aria-hidden="true" />
                  <p className={styles.eyebrow}>{t('문의가 접수되었습니다', 'Inquiry received')}</p>
                  <h2 id="guest-code-title" className={styles.modalTitle}>{t('문의 고유번호', 'Your inquiry code')}</h2>
                  <strong className={styles.guestInquiryCode}>{guestCodeNotice}</strong>
                  <p className={styles.timelineText}>{t('이 번호를 반드시 캡처해 주세요. 로그인하지 않은 상태에서는 이 번호로만 나중에 문의 채팅창에 다시 접속할 수 있습니다.', 'Please capture this code. Without signing in, it is the only way to return to this inquiry chat later.')}</p>
                  <button type="button" className={styles.modalSubmit} onClick={() => setGuestCodeNotice(null)}>
                    {t('확인하고 채팅으로 이동', 'Continue to chat')}
                  </button>
                </motion.section>
              </motion.div>
            )}
          </AnimatePresence>

          {errorText && (
            <div style={{ maxWidth: '600px', margin: '24px auto 0', padding: '16px', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: 'var(--radius-sm)', color: '#ef4444', textAlign: 'center', fontSize: '0.9rem', fontWeight: 500 }}>
              {errorText}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
