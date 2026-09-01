'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import AdminJoinRequests from '../components/AdminJoinRequests';
import { useLanguage } from '../components/LanguageProvider';
import { supabase } from '../lib/supabase';
import { buildStageRoomPayload } from '../lib/voiceRoomPolicy.mjs';
import styles from '../styles/server-mechanism.module.css';

interface Inquiry {
  id: string;
  inquiry_code: string;
  nickname: string;
  status: 'open' | 'replied' | string;
  created_at: string;
}

interface InquiryMessage {
  id: string;
  sender: 'user' | 'admin' | string;
  message: string;
  created_at: string;
}

interface ReportRecord {
  id: string;
  slug: string;
  created_at: string;
}

interface StageRoom {
  id: string;
  code: string;
  title: string;
  room_type?: string;
  is_public?: boolean;
}

const inquiryIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default function TaskboardPage() {
  return (
    <Suspense fallback={null}>
      <TaskboardContent />
    </Suspense>
  );
}

function TaskboardContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const inquiryIdFromUrl = searchParams.get('inquiry');
  const requestedInquiryId = inquiryIdPattern.test(inquiryIdFromUrl ?? '') ? inquiryIdFromUrl : null;

  // 상태 관리
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 어드민 데이터 상태
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [messages, setMessages] = useState<InquiryMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // 탭 및 보고서 관리 상태
  const [activeTab, setActiveTab] = useState<'support' | 'join' | 'report'>('support');
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [reportSlug, setReportSlug] = useState('');
  const [reportContent, setReportContent] = useState('');
  const [isPublishingReport, setIsPublishingReport] = useState(false);
  const [reportFeedback, setReportFeedback] = useState('');

  const [voiceRooms, setVoiceRooms] = useState<StageRoom[]>([]);
  const [newRoomCode, setNewRoomCode] = useState('');
  const [newRoomTitle, setNewRoomTitle] = useState('');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState('');




  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 1. 구글 로그인 세션 & 상태 감지
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const activeUser = session?.user ?? null;
      setUser(activeUser);
      checkAdminStatus(activeUser?.email);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const activeUser = session?.user ?? null;
      setUser(activeUser);
      checkAdminStatus(activeUser?.email);
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

  // 2. 어드민 인증이 완료되었을 때 모든 문의 목록 실시간 동기화
  useEffect(() => {
    if (!user || !isAdmin) return;

    // 초기 문의방 목록 조회
    async function loadInquiries() {
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        setInquiries(data);
        const requestedInquiry = data.find((inquiry) => inquiry.id === requestedInquiryId);
        if (requestedInquiry) setSelectedInquiry(requestedInquiry);
      }
    }
    loadInquiries();

    // 실시간 방 등록/변경 감지
    const inquiriesChannel = supabase
      .channel('inquiries_admin_feed')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inquiries' },
        () => {
          loadInquiries();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(inquiriesChannel);
    };
  }, [user, isAdmin, requestedInquiryId]);

  // 2.5. 어드민 인증이 완료되었을 때 보고서 목록 동기화
  useEffect(() => {
    if (!user || !isAdmin) return;

    async function loadReports() {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        setReports(data);
      }
    }
    loadReports();

    const reportsChannel = supabase
      .channel('reports_admin_feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, () => {
        loadReports();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(reportsChannel);
    };
  }, [user, isAdmin]);

  // 3. 선택한 특정 문의의 대화 내역 실시간 동기화
  useEffect(() => {
    if (!selectedInquiry) return;
    const inquiryId = selectedInquiry.id;

    // 초기 메시지 로드
    async function loadMessages() {
      const { data, error } = await supabase
        .from('inquiry_messages')
        .select('*')
        .eq('inquiry_id', inquiryId)
        .order('created_at', { ascending: true });
      if (!error && data) {
        setMessages(data);
      }
    }
    loadMessages();

    // 실시간 메시지 유입 감지
    const messagesChannel = supabase
      .channel(`admin_chat_${inquiryId}`)
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
      supabase.removeChannel(messagesChannel);
    };
  }, [selectedInquiry]);

  // 구글 로그인 트리거
  const handleGoogleSignIn = async () => {
    try {
      const taskboardPath = requestedInquiryId
        ? `/taskboard?inquiry=${encodeURIComponent(requestedInquiryId)}`
        : '/taskboard';
      const redirectUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(taskboardPath)}`;

      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            prompt: 'select_account',
          },
        },
      });
    } catch (err) {
      console.error(err);
    }
  };

  // 구글 로그아웃
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setIsAdmin(false);
      setSelectedInquiry(null);
      setMessages([]);
    } catch (err) {
      console.error(err);
    }
  };

  // 관리자 답장 전송 (복수의 어드민이 작성해도 'admin' 단일 아이덴티티로 전송)
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedInquiry) return;

    const currentText = replyText.trim();
    setReplyText(''); // 즉시 청소
    setIsSubmittingReply(true);

    try {
      const { error: msgError } = await supabase
        .from('inquiry_messages')
        .insert([
          {
            inquiry_id: selectedInquiry.id,
            sender: 'admin',
            message: currentText,
          },
        ]);
      
      if (msgError) throw msgError;

      // 관리자가 답장을 보냈으므로 상태를 replied(답변완료)로 갱신
      await supabase
        .from('inquiries')
        .update({ status: 'replied' })
        .eq('id', selectedInquiry.id);

    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // 대화 종료 및 삭제
  const handleDeleteInquiry = async () => {
    if (!selectedInquiry) return;
    const confirmDelete = window.confirm(t('정말로 이 대화를 종료하고 삭제하시겠습니까? 모든 대화 내역이 완전히 삭제됩니다.', 'Are you sure you want to end and delete this chat? All logs will be permanently deleted.'));
    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase.from('inquiries').delete().eq('id', selectedInquiry.id);
      if (error) throw error;
      
      setInquiries((prev) => prev.filter((i) => i.id !== selectedInquiry.id));
      setSelectedInquiry(null);
      setMessages([]);
    } catch (err) {
      console.error('Failed to delete inquiry:', err);
      alert(t('삭제에 실패했습니다.', 'Failed to delete.'));
    } finally {
      setIsDeleting(false);
    }
  };

  // 보고서 발행 처리
  const handlePublishReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportSlug.trim() || !reportContent.trim()) {
      setReportFeedback(t('URL 경로와 내용을 모두 입력해주세요.', 'Please enter both URL path and content.'));
      return;
    }
    setIsPublishingReport(true);
    setReportFeedback('');

    const formattedSlug = reportSlug.trim().replace(/^\/+/, '');

    try {
      const { error } = await supabase.from('reports').insert([
        {
          slug: formattedSlug,
          content: reportContent,
        }
      ]);

      if (error) {
        if (error.code === '23505') {
          throw new Error(t('이미 존재하는 URL 경로입니다.', 'This URL path already exists.'));
        }
        throw error;
      }

      setReportSlug('');
      setReportContent('');
      setReportFeedback(t('보고서가 성공적으로 발행되었습니다!', 'Report published successfully!'));
      
      setTimeout(() => setReportFeedback(''), 3000);
    } catch (err: unknown) {
      console.error(err);
      setReportFeedback(err instanceof Error ? err.message : t('보고서 발행 중 오류가 발생했습니다.', 'Error occurred while publishing.'));
    } finally {
      setIsPublishingReport(false);
    }
  };

  // 보고서 삭제 처리
  const handleDeleteReport = async (id: string) => {
    const confirmDelete = window.confirm(t('정말로 이 보고서를 삭제하시겠습니까?', 'Are you sure you want to delete this report?'));
    if (!confirmDelete) return;

    try {
      const { error } = await supabase.from('reports').delete().eq('id', id);
      if (error) throw error;
      setReports((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error('Failed to delete report:', err);
      alert(t('삭제에 실패했습니다.', 'Failed to delete.'));
    }
  };

  // STAGE 채널 생성 처리
  const handleCreateVoiceRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomCode.trim() || !newRoomTitle.trim()) {
      setVoiceFeedback(t('방 코드와 방 제목을 모두 입력해주세요.', 'Please enter both room code and title.'));
      return;
    }
    setIsCreatingRoom(true);
    setVoiceFeedback('');

    const formattedCode = newRoomCode.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');

    try {
      const { error } = await supabase.from('voice_rooms').insert([
        buildStageRoomPayload({ code: formattedCode, title: newRoomTitle.trim() })
      ]);



      if (error) {
        if (error.code === '23505') {
          throw new Error(t('이미 존재하는 방 코드입니다.', 'Room code already exists.'));
        }
        throw error;
      }

      setNewRoomCode('');
      setNewRoomTitle('');
      setVoiceFeedback(t('STAGE 채널이 성공적으로 생성되었습니다!', 'STAGE channel created successfully!'));

      setTimeout(() => setVoiceFeedback(''), 3000);
    } catch (err: unknown) {
      console.error(err);
      setVoiceFeedback(err instanceof Error ? err.message : t('STAGE 채널 생성 중 오류가 발생했습니다.', 'Error creating STAGE channel.'));
    } finally {
      setIsCreatingRoom(false);
    }
  };

  // STAGE 채널 수동 삭제 (삭제 시 해당 방 모든 유저 튕김)
  const handleDeleteVoiceRoom = async (id: string, title: string) => {
    const confirmDelete = window.confirm(
      t(
        `정말로 STAGE 채널 [${title}]을 삭제하시겠습니까?\n삭제 즉시 해당 채널에 있던 모든 유저가 강제 퇴장(튕김)됩니다.`,
        `Are you sure you want to delete STAGE channel [${title}]?\nAll users currently in this channel will be kicked immediately.`
      )
    );
    if (!confirmDelete) return;

    try {
      const { error } = await supabase.from('voice_rooms').delete().eq('id', id);
      if (error) throw error;
      setVoiceRooms((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error('Failed to delete STAGE channel:', err);
      alert(t('삭제에 실패했습니다.', 'Failed to delete.'));
    }
  };
  return (
    <main className={styles.main}>
      <AnimatePresence mode="wait">
        {isLoading ? (
          // 로딩 중 UI
          <div style={{
            minHeight: '80vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-mute)'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              border: '3px solid var(--color-hairline)',
              borderTopColor: 'var(--color-primary)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        ) : !user ? (
          // ================= [화면 1: 어드민 로그인 유도창] =================
          <motion.div
            key="login-gate"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            style={{
              minHeight: '80vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
            }}
          >
            <div
              className={styles.adminGateCard}
              style={{
                width: '100%',
                maxWidth: '440px',
                border: '1px solid var(--color-hairline)',
                borderRadius: 'var(--radius-sm)',
                background: '#ffffff',
                padding: '48px 36px',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: '28px',
                textAlign: 'center'
              }}
            >
              <div>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: 'var(--color-primary)'
                }}>
                  StimeMC Admin Platform
                </span>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '8px 0 0', color: 'var(--color-ink)' }}>
                  Taskboard Auth
                </h2>
              </div>

              <p style={{ fontSize: '0.9rem', color: 'var(--color-mute)', lineHeight: 1.6 }}>
                {t(
                  '문의 상담 대시보드 접근을 위해 어드민으로 허가된 구글 계정으로 로그인해 주시기 바랍니다.',
                  'To access the support console, please sign in with an authorized administrator Google account.'
                )}
              </p>

              <button
                onClick={handleGoogleSignIn}
                className={`${styles.buttonOutline} ${styles.adminGateButton}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  background: 'var(--color-primary)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 700,
                  padding: '14px',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#ffffff"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#ffffff" opacity="0.8"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#ffffff" opacity="0.8"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#ffffff" opacity="0.8"/>
                </svg>
                {t('구글 로그인으로 어드민 접속', 'Google Sign In for Admin')}
              </button>
            </div>
          </motion.div>
        ) : !isAdmin ? (
          // ================= [화면 2: 관리자 권한 없는 경우의 차단창] =================
          <motion.div
            key="access-denied"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            style={{
              minHeight: '80vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
            }}
          >
            <div
              className={styles.adminAccessCard}
              style={{
                width: '100%',
                maxWidth: '460px',
                border: '1px solid #fee2e2',
                borderRadius: 'var(--radius-sm)',
                background: '#ffffff',
                padding: '48px 36px',
                boxShadow: '0 4px 30px rgba(239, 68, 68, 0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
                textAlign: 'center'
              }}
            >
              <div>
                <span style={{ fontSize: '3rem' }}>🚫</span>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '12px 0 0', color: '#ef4444' }}>
                  Access Denied
                </h2>
              </div>

              <p style={{ fontSize: '0.9rem', color: 'var(--color-mute)', lineHeight: 1.6 }}>
                로그인하신 구글 계정(<code>{user.email}</code>)은 등록된 관리자 목록에 존재하지 않습니다. 어드민 권한이 있는 계정으로 다시 접속해 주세요.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  onClick={handleLogout}
                  className={`${styles.buttonOutline} ${styles.adminGateButton}`}
                  style={{
                    cursor: 'pointer',
                    background: 'var(--color-primary)',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 700,
                    padding: '12px'
                  }}
                >
                  {t('다른 계정으로 로그인', 'Switch Account')}
                </button>
                <Link
                  href="/"
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--color-mute)',
                    textDecoration: 'underline'
                  }}
                >
                  {t('메인 페이지로 돌아가기', 'Return to Main')}
                </Link>
              </div>
            </div>
          </motion.div>
        ) : (
          // ================= [화면 3: 어드민 실시간 상담 콘솔] =================
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.sectionCanvas}
            style={{ padding: '40px 0' }}
          >
            <div className={styles.sectionContent}>
              {/* 대시보드 타이틀 헤더 */}
              <div className={styles.adminPanelHeader} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '32px',
                borderBottom: '1px solid var(--color-hairline)',
                paddingBottom: '20px'
              }}>
                <div>
                  <p className={styles.eyebrow}>StimeMC Admin Platform</p>
                  <div className={styles.adminTabList} style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginTop: '12px' }}>
                    <button
                      onClick={() => setActiveTab('support')}
                      className={`${styles.adminTab} ${activeTab === 'support' ? styles.adminTabActive : ''}`}
                      style={{
                        padding: '10px 20px', border: 'none', background: activeTab === 'support' ? 'var(--color-primary)' : 'transparent',
                        color: activeTab === 'support' ? '#fff' : 'var(--color-mute)', borderRadius: '30px', fontWeight: 800, cursor: 'pointer',
                        fontSize: '1.05rem', transition: 'all 0.2s ease'
                      }}
                    >
                      {t('문의 관리', 'Support Console')}
                    </button>
                    <button
                      onClick={() => setActiveTab('join')}
                      className={`${styles.adminTab} ${activeTab === 'join' ? styles.adminTabActive : ''}`}
                    >
                      {t('가입 요청', 'Join Requests')}
                    </button>
                    <button
                      onClick={() => setActiveTab('report')}
                      className={`${styles.adminTab} ${activeTab === 'report' ? styles.adminTabActive : ''}`}
                      style={{
                        padding: '10px 20px', border: 'none', background: activeTab === 'report' ? 'var(--color-primary)' : 'transparent',
                        color: activeTab === 'report' ? '#fff' : 'var(--color-mute)', borderRadius: '30px', fontWeight: 800, cursor: 'pointer',
                        fontSize: '1.05rem', transition: 'all 0.2s ease'
                      }}
                    >
                      {t('보고서 발행', 'Publish Report')}
                    </button>
                  </div>

                </div>
                <div className={styles.adminAccountBar} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span className={styles.adminAccountEmail} style={{ fontSize: '0.85rem', color: 'var(--color-mute)' }}>
                    Admin: <strong>{user.email}</strong>
                  </span>
                  <button
                    onClick={handleLogout}
                    className={styles.adminLogoutButton}
                    style={{
                      background: 'transparent',
                      border: '1px solid #ef4444',
                      color: '#ef4444',
                      padding: '10px 20px',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {t('로그아웃', 'Logout')}
                  </button>
                </div>
              </div>

              {/* 2열 스플릿 레이아웃 (좌: 문의 리스트 / 우: 상세 채팅) */}
              {activeTab === 'support' && (
                <div className={`${styles.dashboardGrid} ${styles.taskboardGrid} ${
                  selectedInquiry ? styles.activeChat : ''
                }`}>
                {/* 2-1. 좌측: 유저 문의 리스트 */}
                <div className={styles.listPanelBox}>
                  <div className={styles.panelSectionHeader} style={{
                    padding: '20px',
                    borderBottom: '1px solid var(--color-hairline)',
                    background: 'var(--color-canvas)',
                    fontWeight: 700,
                    color: 'var(--color-ink)'
                  }}>
                    {t('전체 티켓 목록', 'Active Support Tickets')} ({inquiries.length})
                  </div>
                  <div style={{
                    flexGrow: 1,
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    {inquiries.length === 0 ? (
                      <p style={{ padding: '24px', color: 'var(--color-mute)', textAlign: 'center', fontSize: '0.9rem' }}>
                        {t('접수된 문의 내역이 없습니다.', 'No tickets found.')}
                      </p>
                    ) : (
                      inquiries.map((item) => {
                        const isSelected = selectedInquiry?.id === item.id;
                        const isPending = item.status === 'open';
                        return (
                          <div
                            key={item.id}
                            onClick={() => setSelectedInquiry(item)}
                            className={`${styles.inquiryListItem} ${isSelected ? styles.inquiryListItemSelected : ''}`}
                            style={{
                              padding: '20px',
                              borderBottom: '1px solid var(--color-hairline)',
                              cursor: 'pointer',
                              background: isSelected ? 'rgba(30, 58, 138, 0.04)' : '#ffffff',
                              transition: 'background 0.2s ease',
                              borderLeft: isSelected ? '4px solid var(--color-primary)' : '4px solid transparent',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '6px'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <strong style={{ color: 'var(--color-ink)', fontSize: '0.95rem' }}>{item.nickname}</strong>
                              <span style={{
                                fontSize: '0.75rem',
                                padding: '4px 8px',
                                borderRadius: '12px',
                                fontWeight: 700,
                                background: isPending ? '#fef3c7' : '#e0f2fe',
                                color: isPending ? '#d97706' : '#0284c7'
                              }}>
                                {isPending ? t('대기중', 'Open') : t('답변완료', 'Replied')}
                              </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-mute)' }}>
                              <span>Code: {item.inquiry_code}</span>
                              <span>{new Date(item.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* 2-2. 우측: 상세 실시간 채팅 창 */}
                <div className={styles.chatPanel}>
                  {selectedInquiry ? (
                    <>
                      {/* 상세 창 헤더 */}
                      <div className={`${styles.chatFeed} ${styles.adminChatHeader}`} style={{
                        padding: '20px 24px',
                        borderBottom: '1px solid var(--color-hairline)',
                        background: 'var(--color-canvas)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <div>
                          <button
                            type="button"
                            onClick={() => setSelectedInquiry(null)}
                            className={styles.mobileBackButton}
                            style={{
                              background: 'none', border: 'none', color: 'var(--color-primary)',
                              cursor: 'pointer', padding: '0 0 8px 0', display: 'flex', alignItems: 'center',
                              gap: '4px', fontWeight: 600, fontSize: '0.9rem'
                            }}
                          >
                            ← {t('목록으로', 'Back to List')}
                          </button>
                          <h4 style={{ margin: 0, color: 'var(--color-ink)', fontWeight: 800 }}>
                            {selectedInquiry.nickname} ({selectedInquiry.inquiry_code})
                          </h4>
                          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--color-mute)' }}>
                            {t('접수 일시 : ', 'Created : ')} {new Date(selectedInquiry.created_at).toLocaleString()}
                          </p>
                        </div>
                        <button
                          onClick={handleDeleteInquiry}
                          disabled={isDeleting}
                          style={{
                            background: '#fef2f2', border: '1px solid #fee2e2', color: '#ef4444',
                            padding: '8px 16px', borderRadius: 'var(--radius-sm)', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem'
                          }}
                        >
                          {isDeleting ? t('삭제중...', 'Deleting...') : t('대화 종료 (삭제)', 'End & Delete Chat')}
                        </button>
                      </div>

                      {/* 대화 피드 */}
                      <div className={styles.chatMessages} style={{
                        flexGrow: 1,
                        padding: '24px',
                        overflowY: 'auto',
                        background: '#faf9f6',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px'
                      }}>
                        {messages.map((msg) => {
                          const isMsgAdmin = msg.sender === 'admin';
                          return (
                            <div
                              key={msg.id}
                              className={styles.chatMessageRow}
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: isMsgAdmin ? 'flex-end' : 'flex-start',
                                width: '100%'
                              }}
                            >
                              <div className={isMsgAdmin ? styles.chatBubbleAdmin : styles.chatBubbleUser} style={{
                                maxWidth: '70%',
                                padding: '12px 18px',
                                borderRadius: '16px',
                                borderTopLeftRadius: isMsgAdmin ? '16px' : '2px',
                                borderTopRightRadius: isMsgAdmin ? '2px' : '16px',
                                background: isMsgAdmin ? 'var(--color-primary)' : '#ffffff',
                                color: isMsgAdmin ? '#ffffff' : 'var(--color-ink)',
                                border: isMsgAdmin ? 'none' : '1px solid var(--color-hairline)',
                                fontSize: '0.95rem',
                                lineHeight: 1.5,
                                boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-all'
                              }}>
                                {msg.message}
                              </div>
                              <span style={{
                                fontSize: '0.75rem',
                                color: 'var(--color-mute)',
                                marginTop: '4px',
                                padding: '0 4px'
                              }}>
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>

                      {/* 관리자 답장 입력란 */}
                      <form
                        className={styles.chatComposer}
                        onSubmit={handleSendReply}
                        style={{
                          padding: '16px 24px',
                          borderTop: '1px solid var(--color-hairline)',
                          display: 'flex',
                          gap: '12px',
                          background: 'var(--color-surface)'
                        }}
                      >
                        <input
                          type="text"
                          className={styles.chatReplyInput}
                          placeholder={t('답장을 작성해 주세요...', 'Type your reply...')}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          required
                          style={{
                            flexGrow: 1,
                            padding: '12px 18px',
                            border: '1px solid var(--color-hairline)',
                            borderRadius: '30px',
                            fontSize: '0.95rem',
                            background: '#ffffff',
                            color: 'var(--color-ink)',
                            outline: 'none'
                          }}
                        />
                        <button
                          type="submit"
                          disabled={isSubmittingReply}
                          className={styles.chatSendButton}
                          style={{
                            background: 'var(--color-ink)',
                            border: 'none',
                            color: 'var(--color-canvas)',
                            padding: '0 24px',
                            borderRadius: '30px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            fontSize: '0.95rem'
                          }}
                        >
                          {isSubmittingReply ? t('전송중', 'Sending') : t('답장', 'Reply')}
                        </button>
                      </form>
                    </>
                  ) : (
                    <div style={{
                      flexGrow: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--color-mute)',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      <span style={{ fontSize: '2rem' }}>💬</span>
                      <p>{t('조회할 문의 티켓을 왼쪽 목록에서 선택해 주세요.', 'Select a support ticket from the list to view.')}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

              {activeTab === 'join' && <AdminJoinRequests />}

              {activeTab === 'report' && (
                <div className={styles.dashboardGrid} style={{ gridTemplateColumns: '1fr', gap: '32px' }}>
                  <div className={styles.reportSurface} style={{
                    border: '1px solid var(--color-hairline)', borderRadius: 'var(--radius-sm)', background: '#ffffff',
                    padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px'
                  }}>
                    <h3 style={{ margin: 0, fontWeight: 800 }}>{t('새 보고서 발행', 'Publish New Report')}</h3>
                    <form onSubmit={handlePublishReport} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div>
                        <label style={{ display: 'block', fontWeight: 700, marginBottom: '8px', color: 'var(--color-ink)' }}>
                          {t('게시될 URL 경로 (Slug)', 'URL Path (Slug)')}
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: 'var(--color-mute)', fontWeight: 600 }}>stimemc.xyz/</span>
                          <input
                            type="text"
                            placeholder="예: report/june-update 또는 notice"
                            value={reportSlug}
                            onChange={(e) => setReportSlug(e.target.value)}
                            required
                            style={{
                              flexGrow: 1, padding: '12px 16px', borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--color-hairline)', fontSize: '0.95rem', background: '#fff'
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontWeight: 700, marginBottom: '8px', color: 'var(--color-ink)' }}>
                          {t('보고서 본문 (Markdown 지원)', 'Report Content (Markdown)')}
                        </label>
                        <textarea
                          placeholder={t('여기에 보고서 내용을 입력하세요. 마크다운 문법을 지원합니다.', 'Enter your report content here. Markdown is supported.')}
                          value={reportContent}
                          onChange={(e) => setReportContent(e.target.value)}
                          required
                          rows={12}
                          style={{
                            width: '100%', padding: '16px', borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--color-hairline)', fontSize: '0.95rem', resize: 'vertical'
                          }}
                        />
                      </div>
                      {reportFeedback && (
                        <div style={{
                          padding: '12px', borderRadius: 'var(--radius-sm)', fontWeight: 600,
                          background: reportFeedback.includes('오류') || reportFeedback.includes('실패') || reportFeedback.includes('입력') || reportFeedback.includes('존재') ? '#fef2f2' : '#ecfdf5',
                          color: reportFeedback.includes('오류') || reportFeedback.includes('실패') || reportFeedback.includes('입력') || reportFeedback.includes('존재') ? '#ef4444' : '#10b981'
                        }}>
                          {reportFeedback}
                        </div>
                      )}
                      <button
                        type="submit"
                        disabled={isPublishingReport}
                        className={styles.reportPublishButton}
                        style={{
                          padding: '16px',
                          border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 800, fontSize: '1.05rem', cursor: 'pointer'
                        }}
                      >
                        {isPublishingReport ? t('발행 중...', 'Publishing...') : t('즉시 발행하기', 'Publish Now')}
                      </button>
                    </form>
                  </div>

                  {/* 기발행된 보고서 목록 */}
                  <div className={`${styles.reportSurface} ${styles.reportList}`} style={{
                    border: '1px solid var(--color-hairline)', borderRadius: 'var(--radius-sm)', background: '#ffffff',
                    display: 'flex', flexDirection: 'column', overflow: 'hidden'
                  }}>
                    <div style={{ padding: '20px', borderBottom: '1px solid var(--color-hairline)', background: 'var(--color-canvas)', fontWeight: 700 }}>
                      {t('기발행된 보고서 목록', 'Published Reports')} ({reports.length})
                    </div>
                    <div className={styles.reportListItems} style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                      {reports.length === 0 ? (
                        <p style={{ padding: '24px', color: 'var(--color-mute)', textAlign: 'center', fontSize: '0.9rem' }}>
                          {t('발행된 보고서가 없습니다.', 'No published reports.')}
                        </p>
                      ) : (
                        reports.map((item) => (
                          <div key={item.id} className={styles.reportListItem} style={{ padding: '20px', borderBottom: '1px solid var(--color-hairline)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <strong style={{ display: 'block', color: 'var(--color-ink)', fontSize: '1.05rem', marginBottom: '4px' }}>
                                /{item.slug}
                              </strong>
                              <span style={{ fontSize: '0.85rem', color: 'var(--color-mute)' }}>
                                {new Date(item.created_at).toLocaleString()}
                              </span>
                            </div>
                            <div className={styles.reportActions} style={{ display: 'flex', gap: '8px' }}>
                              <a href={`/${item.slug}`} target="_blank" rel="noreferrer" className={styles.reportViewButton} style={{
                                padding: '6px 12px', background: '#f1f5f9', color: '#475569', borderRadius: 'var(--radius-sm)', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem'
                              }}>
                                {t('보기', 'View')}
                              </a>
                              <button onClick={() => handleDeleteReport(item.id)} className={styles.reportDeleteButton} style={{
                                padding: '6px 12px', background: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem'
                              }}>
                                {t('삭제', 'Delete')}
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 3. STAGE 채널 관리 탭 */}
              {false && (
                <div className={styles.dashboardGrid} style={{ gridTemplateColumns: '1fr', gap: '32px' }}>
                  {/* 방 생성 폼 */}
                  <div style={{
                    border: '1px solid var(--color-hairline)', borderRadius: 'var(--radius-sm)', background: '#ffffff',
                    padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px'
                  }}>
                    <h3 style={{ margin: 0, fontWeight: 800 }}>🎙️ {t('새 STAGE 채널 생성', 'Create New STAGE Channel')}</h3>
                    <form onSubmit={handleCreateVoiceRoom} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                          <label style={{ display: 'block', fontWeight: 700, marginBottom: '8px', color: 'var(--color-ink)' }}>
                            {t('방 제목', 'Room Title')}
                          </label>
                          <input
                            type="text"
                            placeholder={t('예: 자유 수다방', 'e.g. Lounge 1')}
                            value={newRoomTitle}
                            onChange={(e) => setNewRoomTitle(e.target.value)}
                            required
                            style={{
                              width: '100%', padding: '12px 16px', border: '1px solid var(--color-hairline)',
                              borderRadius: 'var(--radius-sm)', fontSize: '0.95rem'
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontWeight: 700, marginBottom: '8px', color: 'var(--color-ink)' }}>
                            {t('방 코드 (URL 경로)', 'Room Code (URL Path)')}
                          </label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.9rem', color: 'var(--color-mute)', fontWeight: 600 }}>stimemc.xyz/voice-</span>
                            <input
                              type="text"
                              placeholder={t('예: lobby-1', 'e.g. lobby-1')}
                              value={newRoomCode}
                              onChange={(e) => setNewRoomCode(e.target.value)}
                              required
                              style={{
                                flexGrow: 1, padding: '12px 16px', border: '1px solid var(--color-hairline)',
                                borderRadius: 'var(--radius-sm)', fontSize: '0.95rem'
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-sm)', background: '#eff6ff', color: '#1e40af', fontSize: '0.9rem', fontWeight: 700 }}>
                        🎙️ {t('STAGE 채널은 항상 공개되며 관리자만 생성·삭제할 수 있습니다.', 'STAGE channels are always public and can only be created or deleted by administrators.')}
                      </div>

                      {voiceFeedback && (
                        <div style={{
                          padding: '12px 16px', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', fontWeight: 600,
                          background: voiceFeedback.includes('성공') || voiceFeedback.includes('successfully') ? '#f0fdf4' : '#fef2f2',
                          color: voiceFeedback.includes('성공') || voiceFeedback.includes('successfully') ? '#16a34a' : '#dc2626'
                        }}>
                          {voiceFeedback}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isCreatingRoom}
                        style={{
                          alignSelf: 'flex-start', padding: '12px 28px', background: 'var(--color-primary)', color: '#ffffff',
                          border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 700, cursor: 'pointer'
                        }}
                      >
                        {isCreatingRoom ? t('생성 중...', 'Creating...') : t('STAGE 채널 생성하기', 'Create STAGE Channel')}
                      </button>
                    </form>
                  </div>

                  {/* 활성화된 STAGE 채널 목록 및 삭제 제어 */}
                  <div style={{
                    border: '1px solid var(--color-hairline)', borderRadius: 'var(--radius-sm)', background: '#ffffff',
                    padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px'
                  }}>
                    <h3 style={{ margin: 0, fontWeight: 800 }}>{t('활성화된 STAGE 채널 목록', 'Active STAGE Channels')} ({voiceRooms.length})</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {voiceRooms.length === 0 ? (
                        <p style={{ color: 'var(--color-mute)', fontSize: '0.9rem' }}>{t('활성화된 STAGE 채널이 없습니다.', 'No active STAGE channels found.')}</p>
                      ) : (
                        voiceRooms.map((room) => (
                          <div key={room.id} style={{
                            padding: '16px 20px', border: '1px solid var(--color-hairline)', borderRadius: 'var(--radius-sm)',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#faf9f6'
                          }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <strong style={{ fontSize: '1.05rem', color: 'var(--color-ink)' }}>{room.title}</strong>
                                <span style={{
                                  fontSize: '0.75rem', padding: '3px 8px', borderRadius: '12px', fontWeight: 700,
                                  background: '#dbeafe', color: '#1e40af'
                                }}>
                                  🎙️ STAGE · {t('공개', 'Public')}
                                </span>
                              </div>
                              <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--color-mute)' }}>
                                URL: <code>stimemc.xyz/voice-{room.code}</code>
                              </p>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <a
                                href={`/voice-${room.code}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  padding: '6px 12px', background: '#f1f5f9', color: '#475569',
                                  borderRadius: 'var(--radius-sm)', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem'
                                }}
                              >
                                {t('입장', 'Enter')}
                              </a>
                              <button
                                onClick={() => handleDeleteVoiceRoom(room.id, room.title)}
                                style={{
                                  padding: '6px 12px', background: '#fef2f2', color: '#ef4444', border: 'none',
                                  borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem'
                                }}
                              >
                                {t('삭제 (전원 튕김)', 'Delete (Kick All)')}
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </main>
  );
}
