'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useLanguage } from '../components/LanguageProvider';
import { supabase } from '../lib/supabase';
import styles from '../styles/server-mechanism.module.css';

export default function VoiceRoomsListPage() {
  const { t } = useLanguage();
  const router = useRouter();

  const [publicRooms, setPublicRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [directCode, setDirectCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // 1. 공개 보이스룸 목록 조회 & 실시간 동기화
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

  // 비공개 / 직링크 방 코드 즉시 입장
  const handleDirectJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directCode.trim()) return;

    let cleanCode = directCode.trim();
    // URL 형태로 입력했을 경우 (e.g. stimemc.xyz/voice-code or /voice-code or voice-code)
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
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span className={styles.eyebrow}>STIME NETWORKS VOICE CHAT</span>
            <h1 className={styles.title} style={{ fontSize: '2.5rem', fontWeight: 900, marginTop: '8px' }}>
              🎙️ {t('실시간 보이스룸', 'Live Voice Rooms')}
            </h1>
            <p className={styles.lead} style={{ maxWidth: '600px', margin: '16px auto 0' }}>
              {t(
                '서버원들과 함께 보이스로 대화하세요. 공개방에 자유롭게 입장하거나 비공개 코드로 직링크에 접속할 수 있습니다.',
                'Voice chat with server members in real-time. Join public rooms or enter a private code to connect.'
              )}
            </p>
          </div>

          {/* 비공개 방 코드 직접 입력 검색 박스 */}
          <div style={{
            background: '#ffffff',
            border: '1px solid var(--color-hairline)',
            borderRadius: 'var(--radius-sm)',
            padding: '28px',
            marginBottom: '48px',
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

          {/* 공개 보이스룸 목록 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--color-ink)' }}>
                🟢 {t('공개 보이스룸 목록', 'Public Voice Rooms')}
              </h2>
              <span style={{ fontSize: '0.9rem', color: 'var(--color-mute)', fontWeight: 600 }}>
                {publicRooms.length} {t('개의 공개방 활성화됨', 'public rooms active')}
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
                  {t('관리자가 보이스룸을 개설하면 이곳에 자동으로 노출됩니다.', 'Newly created public rooms by admins will appear here automatically.')}
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '20px'
              }}>
                {publicRooms.map((room) => (
                  <motion.div
                    key={room.id}
                    whileHover={{ y: -4 }}
                    style={{
                      background: '#ffffff',
                      border: '1px solid var(--color-hairline)',
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
                          background: '#dcfce7', color: '#166534'
                        }}>
                          🟢 ONLINE
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
                        background: 'var(--color-primary)',
                        color: '#ffffff',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: 800,
                        textDecoration: 'none',
                        fontSize: '0.95rem'
                      }}
                    >
                      🎙️ {t('보이스룸 입장하기', 'Enter Voice Room')}
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </main>
  );
}
