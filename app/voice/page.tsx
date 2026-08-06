'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../components/LanguageProvider';
import { supabase } from '../lib/supabase';
import styles from '../styles/server-mechanism.module.css';

export default function VoiceRoomsListPage() {
  const { t } = useLanguage();
  const router = useRouter();

  const [user, setUser] = useState<any | null>(null);
  const [publicRooms, setPublicRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [directCode, setDirectCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // 로그인 유저 룸 생성 모달 상태
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newIsPublic, setNewIsPublic] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');


  // 1. 유저 인증 상태 감지
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 2. 공개 보이스룸 목록 조회 & 실시간 동기화
  useEffect(() => {
    async function loadPublicRooms() {
      const { data, error } = await supabase
        .from('voice_rooms')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setPublicRooms(data);
      }
      setLoading(false);
    }

    loadPublicRooms();

    // 실시간 변경 감지
    const channel = supabase
      .channel('public_voice_rooms_feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'voice_rooms' }, () => {
        loadPublicRooms();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 구글 로그인 처리
  const handleGoogleSignIn = async () => {
    try {
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
    } catch (err) {
      console.error(err);
    }
  };

  // 일반 보이스룸 생성 핸들러 (로그인된 모든 구글 계정 가능)
  const handleCreateGeneralRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCode.trim()) {
      setCreateError(t('방 제목과 방 코드를 입력해주세요.', 'Please enter title and room code.'));
      return;
    }
    setIsCreating(true);
    setCreateError('');

    const formattedCode = newCode.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');

    try {
      const { error } = await supabase.from('voice_rooms').insert([
        {
          code: formattedCode,
          title: newTitle.trim(),
          is_public: newIsPublic,
          room_type: 'general', // 일반 보이스룸 (0명 시 자동 삭제)
        },
      ]);


      if (error) {
        if (error.code === '23505') {
          throw new Error(t('이미 존재하는 방 코드입니다.', 'Room code already exists.'));
        }
        throw error;
      }

      setShowCreateModal(false);
      setNewTitle('');
      setNewCode('');
      router.push(`/voice-${formattedCode}`);
    } catch (err: any) {
      console.error(err);
      setCreateError(err.message || t('방 생성 중 오류가 발생했습니다.', 'Error creating room.'));
    } finally {
      setIsCreating(false);
    }
  };

  // 비공개 / 직링크 방 코드 즉시 입장
  const handleDirectJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directCode.trim()) return;

    let cleanCode = directCode.trim();
    cleanCode = cleanCode.replace(/^https?:\/\/[^\/]+\//, '');
    cleanCode = cleanCode.replace(/^voice-/, '');
    cleanCode = cleanCode.replace(/^voice\//, '');

    if (!cleanCode) {
      setErrorMsg(t('올바른 방 코드를 입력해 주세요.', 'Please enter a valid room code.'));
      return;
    }

    router.push(`/voice-${cleanCode}`);
  };

  return (
    <main className={styles.main}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={styles.sectionCanvas}
        style={{ padding: '60px 0 100px' }}
      >
        <div className={styles.sectionContent} style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px' }}>
          {/* 헤더 타이틀 */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span className={styles.eyebrow}>STIME NETWORKS VOICE CHAT</span>
            <h1 className={styles.title} style={{ fontSize: '2.5rem', fontWeight: 900, marginTop: '8px' }}>
              🎙️ {t('실시간 보이스룸 & 스테이지', 'Live Voice Rooms & Stage')}
            </h1>
            <p className={styles.lead} style={{ maxWidth: '640px', margin: '16px auto 0' }}>
              {t(
                '구글 로그인 유저라면 누구나 자유롭게 일반 보이스룸을 개설할 수 있습니다. (0명이 되면 자동 삭제)',
                'Any Google user can create general voice rooms. Auto-deletes when 0 members remain.'
              )}
            </p>

            {/* 방 만들기 또는 구글 로그인 버튼 */}
            <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'center', gap: '12px' }}>
              {user ? (
                <button
                  onClick={() => setShowCreateModal(true)}
                  style={{
                    padding: '14px 28px', background: 'var(--color-primary)', color: '#ffffff',
                    border: 'none', borderRadius: '30px', fontWeight: 800, fontSize: '1rem', cursor: 'pointer',
                    boxShadow: '0 4px 20px rgba(30, 58, 138, 0.25)'
                  }}
                >
                  ➕ {t('새 보이스룸 만들기', 'Create New Voice Room')}
                </button>
              ) : (
                <button
                  onClick={handleGoogleSignIn}
                  style={{
                    padding: '14px 28px', background: 'var(--color-primary)', color: '#ffffff',
                    border: 'none', borderRadius: '30px', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '8px'
                  }}
                >
                  🔑 {t('구글 로그인하고 방 만들기', 'Sign in with Google to Create Room')}
                </button>
              )}
            </div>
          </div>

          {/* 비공개 방 코드 직접 입력 검색 박스 */}
          <div style={{
            background: '#ffffff',
            border: '1px solid var(--color-hairline)',
            borderRadius: 'var(--radius-sm)',
            padding: '24px 28px',
            marginBottom: '40px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
          }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-ink)' }}>
              🔑 {t('비공개 방 코드로 직접 입장', 'Join via Secret Room Code')}
            </h3>
            <form onSubmit={handleDirectJoin} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ flexGrow: 1, position: 'relative' }}>
                <input
                  type="text"
                  placeholder={t('방 코드 입력 (예: secret-room 또는 voice-1234)', 'Enter room code (e.g. secret-room)')}
                  value={directCode}
                  onChange={(e) => {
                    setDirectCode(e.target.value);
                    setErrorMsg('');
                  }}
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    border: '1px solid var(--color-hairline)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '1rem',
                    background: '#faf9f6',
                    outline: 'none'
                  }}
                />
              </div>
              <button
                type="submit"
                style={{
                  padding: '14px 28px',
                  background: 'var(--color-primary)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  cursor: 'pointer'
                }}
              >
                {t('입장하기', 'Join Room')}
              </button>
            </form>
            {errorMsg && <p style={{ color: '#ef4444', fontSize: '0.85rem', margin: '8px 0 0', fontWeight: 600 }}>{errorMsg}</p>}
          </div>

          {/* 보이스룸 목록 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--color-ink)' }}>
                🟢 {t('활성화된 채널 목록', 'Active Voice Channels')}
              </h2>
              <span style={{ fontSize: '0.9rem', color: 'var(--color-mute)', fontWeight: 600 }}>
                {publicRooms.length} {t('개의 공개 채널', 'active channels')}
              </span>
            </div>

            {loading ? (
              <div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-mute)' }}>
                {t('보이스룸 목록을 불러오는 중...', 'Loading voice rooms...')}
              </div>
            ) : publicRooms.length === 0 ? (
              <div style={{
                background: '#ffffff',
                border: '1px dashed var(--color-hairline)',
                borderRadius: 'var(--radius-sm)',
                padding: '60px 24px',
                textAlign: 'center',
                color: 'var(--color-mute)'
              }}>
                <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '12px' }}>🔈</span>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '1.05rem', color: 'var(--color-ink)' }}>
                  {t('현재 개설된 공개 보이스룸이 없습니다.', 'No public voice rooms currently active.')}
                </p>
                <p style={{ margin: '8px 0 0', fontSize: '0.9rem' }}>
                  {t('상단의 [새 보이스룸 만들기] 버튼을 눌러 첫 번째 보이스방을 만들어보세요!', 'Click [Create New Voice Room] button above to make a room!')}
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '20px'
              }}>
                {publicRooms.map((room) => {
                  const isStage = room.room_type === 'stage';
                  return (
                    <motion.div
                      key={room.id}
                      whileHover={{ y: -4 }}
                      style={{
                        background: '#ffffff',
                        border: isStage ? '2px solid #3b82f6' : '1px solid var(--color-hairline)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
                        gap: '16px'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{
                            fontSize: '0.75rem', padding: '4px 10px', borderRadius: '12px', fontWeight: 800,
                            background: isStage ? '#dbeafe' : '#dcfce7',
                            color: isStage ? '#1e40af' : '#166534'
                          }}>
                            {isStage ? '🎙️ STAGE (관리자 방송)' : '🟢 일반 보이스룸'}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--color-mute)', fontWeight: 600 }}>
                            Code: {room.code}
                          </span>
                        </div>
                        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-ink)' }}>
                          {room.title}
                        </h3>
                        <p style={{ margin: '8px 0 0', fontSize: '0.85rem', color: 'var(--color-mute)' }}>
                          <code>stimemc.xyz/voice-{room.code}</code>
                        </p>
                      </div>

                      <Link
                        href={`/voice-${room.code}`}
                        style={{
                          display: 'block',
                          textAlign: 'center',
                          padding: '12px',
                          background: isStage ? '#2563eb' : 'var(--color-primary)',
                          color: '#ffffff',
                          borderRadius: 'var(--radius-sm)',
                          fontWeight: 800,
                          textDecoration: 'none',
                          fontSize: '0.95rem'
                        }}
                      >
                        {isStage ? '🎙️ STAGE 무대 입장' : '🎧 보이스룸 입장하기'}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* 보이스룸 생성 모달 (로그인 유저 전용) */}
      <AnimatePresence>
        {showCreateModal && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
          }}>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              style={{
                position: 'relative', background: '#ffffff', borderRadius: 'var(--radius-sm)',
                padding: '36px', width: '100%', maxWidth: '440px', boxShadow: '0 10px 40px rgba(0,0,0,0.15)'
              }}
            >
              <h3 style={{ margin: '0 0 8px', fontSize: '1.4rem', fontWeight: 800 }}>➕ {t('일반 보이스룸 생성', 'Create General Voice Room')}</h3>
              <p style={{ margin: '0 0 24px', fontSize: '0.85rem', color: 'var(--color-mute)' }}>
                {t('방 안의 접속자가 0명이 되면 자동으로 삭제됩니다.', 'Auto-deletes when 0 members remain.')}
              </p>

              <form onSubmit={handleCreateGeneralRoom} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px', fontSize: '0.9rem' }}>
                    {t('방 제목', 'Room Title')}
                  </label>
                  <input
                    type="text"
                    placeholder={t('예: 야간 야생 수다방', 'e.g. Night Chat Room')}
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                    style={{
                      width: '100%', padding: '12px 14px', border: '1px solid var(--color-hairline)',
                      borderRadius: 'var(--radius-sm)', fontSize: '0.95rem', outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px', fontSize: '0.9rem' }}>
                    {t('방 코드 (URL 경로)', 'Room Code')}
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-mute)', fontWeight: 600 }}>voice-</span>
                    <input
                      type="text"
                      placeholder={t('예: chat-101', 'e.g. chat-101')}
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value)}
                      required
                      style={{
                        flexGrow: 1, padding: '12px 14px', border: '1px solid var(--color-hairline)',
                        borderRadius: 'var(--radius-sm)', fontSize: '0.95rem', outline: 'none'
                      }}
                    />
                  </div>
                </div>

                {/* 공개/비공개 선택 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{t('공개 여부:', 'Visibility:')}</span>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input
                      type="radio"
                      name="general_is_public"
                      checked={newIsPublic === true}
                      onChange={() => setNewIsPublic(true)}
                    />
                    🟢 {t('공개 (목록에 노출)', 'Public (Listed)')}
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input
                      type="radio"
                      name="general_is_public"
                      checked={newIsPublic === false}
                      onChange={() => setNewIsPublic(false)}
                    />
                    🔒 {t('비공개 (링크로만 접속)', 'Private (Link Only)')}
                  </label>
                </div>

                {createError && (
                  <p style={{ color: '#ef4444', fontSize: '0.85rem', margin: 0, fontWeight: 600 }}>{createError}</p>
                )}


                <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    style={{
                      flexGrow: 1, padding: '12px', background: '#f3f4f6', color: '#4b5563', border: 'none',
                      borderRadius: 'var(--radius-sm)', fontWeight: 700, cursor: 'pointer'
                    }}
                  >
                    {t('취소', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    style={{
                      flexGrow: 1, padding: '12px', background: 'var(--color-primary)', color: '#ffffff', border: 'none',
                      borderRadius: 'var(--radius-sm)', fontWeight: 700, cursor: 'pointer'
                    }}
                  >
                    {isCreating ? t('생성 중...', 'Creating...') : t('생성하고 입장', 'Create & Join')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
