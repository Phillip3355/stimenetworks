'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../components/LanguageProvider';
import { supabase } from '../lib/supabase';
import styles from '../styles/server-mechanism.module.css';

export const dynamic = 'force-dynamic';

interface RoomPageProps {
  params: Promise<{ roomCode?: string }>;
}

export default function DynamicVoiceRoomPage({ params }: RoomPageProps) {
  const unwrappedParams = use(params);
  const rawCode = unwrappedParams?.roomCode || '';
  const roomCode = rawCode.replace(/^voice-/, '');


  const { t } = useLanguage();
  const router = useRouter();

  // 방 상태
  const [roomData, setRoomData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isKicked, setIsKicked] = useState(false);

  // 음성 및 로컬 상태
  const [nickname, setNickname] = useState('');
  const [hasJoined, setHasJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // 오디오 스트림 및 분석용 Ref
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // 모의 참가자 목록 (로컬 사용자 + 임의 동시 접속자 상태 시뮬레이션)
  const [participants, setParticipants] = useState<any[]>([]);

  // 1. 방 유효성 검사 및 실시간 삭제(Auto-Kick) 감지
  useEffect(() => {
    let channel: any = null;

    async function checkRoom() {
      const { data, error } = await supabase
        .from('voice_rooms')
        .select('*')
        .eq('code', roomCode)
        .single();

      if (error || !data) {
        alert(t('존재하지 않거나 삭제된 보이스룸입니다.', 'This voice room does not exist or has been deleted.'));
        router.push('/voice');
        return;
      }

      setRoomData(data);
      setLoading(false);

      // 실시간 삭제(Auto-Kick) 및 상태 구독
      channel = supabase
        .channel(`voice_room_status_${data.id}`)
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'voice_rooms',
            filter: `id=eq.${data.id}`,
          },
          () => {
            setIsKicked(true);
            stopAudioTracks();
            alert(t('🚨 관리자에 의해 보이스룸이 삭제되었습니다. 자동으로 퇴장됩니다.', '🚨 Voice room deleted by admin. You have been disconnected.'));
            router.push('/voice');
          }
        )
        .subscribe();
    }

    checkRoom();

    return () => {
      if (channel) supabase.removeChannel(channel);
      stopAudioTracks();
    };
  }, [roomCode, router, t]);

  // 오디오 트랙 멈춤
  const stopAudioTracks = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  // 2. 마이크 연결 및 음성 볼륨 감지 (Voice Activity Detection)
  const startAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      mediaStreamRef.current = stream;

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        // 음성 감지 문턱값
        setIsSpeaking(average > 15 && !isMuted);

        animFrameRef.current = requestAnimationFrame(checkVolume);
      };

      checkVolume();
    } catch (err) {
      console.warn('마이크 연결 실패 또는 권한 거부:', err);
      alert(t('마이크 접근 권한이 필요합니다.', 'Microphone access is required.'));
    }
  };

  // 방 입장 핸들러
  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;

    setHasJoined(true);
    startAudio();

    // 더미 참가자 예시 및 사용자 본인 등록
    setParticipants([
      { id: 'self', name: nickname.trim(), isSelf: true },
      { id: 'user-2', name: '스티미', avatar: '🎮', isSelf: false },
      { id: 'user-3', name: '마인크래프터', avatar: '⛏️', isSelf: false }
    ]);
  };

  // 마이크 토글
  const toggleMute = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = isMuted;
      });
    }
    setIsMuted(!isMuted);
    if (!isMuted) setIsSpeaking(false);
  };

  // 스피커 헤드셋 토글
  const toggleDeafen = () => {
    setIsDeafened(!isDeafened);
  };

  // 링크 복사
  const handleCopyLink = () => {
    const fullUrl = `https://stimemc.xyz/voice-${roomCode}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  if (loading) {
    return (
      <main className={styles.main} style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--color-mute)', fontSize: '1.1rem' }}>{t('보이스룸 확인 중...', 'Connecting to Voice Room...')}</p>
      </main>
    );
  }

  return (
    <main className={styles.main} style={{ minHeight: '90vh', padding: '40px 20px 120px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* 헤더 바 */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '32px', paddingBottom: '20px', borderBottom: '1px solid var(--color-hairline)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900, color: 'var(--color-ink)' }}>
                🎙️ {roomData.title}
              </h1>
              <span style={{
                fontSize: '0.8rem', padding: '4px 12px', borderRadius: '14px', fontWeight: 800,
                background: roomData.is_public ? '#dcfce7' : '#fef3c7',
                color: roomData.is_public ? '#166534' : '#b45309'
              }}>
                {roomData.is_public ? t('공개 채널', 'Public Channel') : t('🔒 비공개 링크 채널', '🔒 Secret Channel')}
              </span>
            </div>
            <p style={{ margin: '6px 0 0', fontSize: '0.9rem', color: 'var(--color-mute)' }}>
              코드: <code>voice-{roomCode}</code> | 접속 인원: {participants.length} / 10명
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleCopyLink}
              style={{
                padding: '10px 18px', background: '#ffffff', border: '1px solid var(--color-hairline)',
                borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem',
                display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              🔗 {copiedLink ? t('링크 복사됨!', 'Copied Link!') : t('초대 링크 복사', 'Copy Link')}
            </button>
            <button
              onClick={() => router.push('/voice')}
              style={{
                padding: '10px 18px', background: '#fef2f2', border: '1px solid #fee2e2', color: '#ef4444',
                borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem'
              }}
            >
              🚪 {t('나가기', 'Leave')}
            </button>
          </div>
        </div>

        {/* 미입장 상태: 닉네임 설정 게이트 */}
        {!hasJoined ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              maxWidth: '460px', margin: '60px auto', background: '#ffffff',
              border: '1px solid var(--color-hairline)', borderRadius: 'var(--radius-sm)',
              padding: '40px 32px', textAlign: 'center', boxShadow: '0 4px 25px rgba(0,0,0,0.03)'
            }}
          >
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '12px' }}>🎧</span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--color-ink)' }}>
              {t('보이스룸 접속 설정', 'Voice Channel Setup')}
            </h2>
            <p style={{ margin: '8px 0 24px', fontSize: '0.9rem', color: 'var(--color-mute)' }}>
              {t('사용하실 닉네임을 입력하고 마이크를 허용하여 입장하세요.', 'Enter your nickname to join the voice room.')}
            </p>

            <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input
                type="text"
                placeholder={t('닉네임 입력 (예: 스티미_01)', 'Enter Nickname (e.g. Stime_Player)')}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
                style={{
                  padding: '14px 18px', border: '1px solid var(--color-hairline)',
                  borderRadius: 'var(--radius-sm)', fontSize: '1rem', outline: 'none', background: '#faf9f6'
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '14px', background: 'var(--color-primary)', color: '#ffffff',
                  border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 800,
                  fontSize: '1rem', cursor: 'pointer'
                }}
              >
                🎙️ {t('음성 연결 및 입장하기', 'Connect Mic & Join')}
              </button>
            </form>
          </motion.div>
        ) : (
          /* 입장 완료: 10인 그리드 아바타 & 제어 툴바 */
          <div>
            {/* 10인 그리드 카드 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '20px',
              marginBottom: '120px'
            }}>
              {participants.map((p) => {
                const isSelf = p.isSelf;
                const activeSpeaking = isSelf ? isSpeaking : false;
                const activeMuted = isSelf ? isMuted : false;

                return (
                  <motion.div
                    key={p.id}
                    animate={{
                      scale: activeSpeaking ? 1.04 : 1,
                      boxShadow: activeSpeaking
                        ? '0 0 25px rgba(34, 197, 94, 0.45)'
                        : '0 4px 15px rgba(0,0,0,0.02)'
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    style={{
                      background: '#ffffff',
                      border: activeSpeaking
                        ? '2px solid #22c55e'
                        : '1px solid var(--color-hairline)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '28px 20px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      position: 'relative',
                      textAlign: 'center'
                    }}
                  >
                    {/* 발화자 녹색 아우라 링 */}
                    <div style={{
                      width: '72px', height: '72px', borderRadius: '50%',
                      background: activeSpeaking ? '#dcfce7' : '#f1f5f9',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '2rem', marginBottom: '16px', position: 'relative',
                      transition: 'all 0.2s ease'
                    }}>
                      {p.avatar || '🎧'}
                      {activeSpeaking && (
                        <span style={{
                          position: 'absolute', inset: -4, borderRadius: '50%',
                          border: '2px solid #22c55e', animation: 'pulse 1.2s infinite'
                        }} />
                      )}
                    </div>

                    <strong style={{ fontSize: '1.05rem', color: 'var(--color-ink)', fontWeight: 800 }}>
                      {p.name} {isSelf && `(${t('나', 'Me')})`}
                    </strong>

                    <span style={{
                      fontSize: '0.75rem', marginTop: '6px', padding: '2px 8px', borderRadius: '10px',
                      fontWeight: 700,
                      background: activeMuted ? '#fee2e2' : activeSpeaking ? '#dcfce7' : '#f3f4f6',
                      color: activeMuted ? '#ef4444' : activeSpeaking ? '#15803d' : '#6b7280'
                    }}>
                      {activeMuted ? '🔇 음소거됨' : activeSpeaking ? '🎙️ 대화 중...' : '대기 중'}
                    </span>
                  </motion.div>
                );
              })}

              {/* 빈 슬롯 표시 (10명 채우기) */}
              {Array.from({ length: Math.max(0, 10 - participants.length) }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  style={{
                    background: 'rgba(255,255,255,0.4)',
                    border: '1px dashed var(--color-hairline)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '28px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-mute)',
                    opacity: 0.6
                  }}
                >
                  <span style={{ fontSize: '1.5rem', marginBottom: '8px' }}>👤</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{t('빈 자리', 'Empty Slot')}</span>
                </div>
              ))}
            </div>

            {/* 하단 고정 음성 컨트롤 툴바 */}
            <div style={{
              position: 'fixed',
              bottom: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#ffffff',
              border: '1px solid var(--color-hairline)',
              borderRadius: '40px',
              padding: '12px 28px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              zIndex: 100
            }}>
              {/* 마이크 토글 */}
              <button
                onClick={toggleMute}
                style={{
                  padding: '10px 20px',
                  borderRadius: '30px',
                  border: 'none',
                  background: isMuted ? '#ef4444' : '#22c55e',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
              >
                {isMuted ? '🔇 마이크 켜기' : '🎙️ 마이크 끄기 (Mute)'}
              </button>

              {/* 스피커/헤드셋 토글 */}
              <button
                onClick={toggleDeafen}
                style={{
                  padding: '10px 20px',
                  borderRadius: '30px',
                  border: '1px solid var(--color-hairline)',
                  background: isDeafened ? '#fee2e2' : '#f8fafc',
                  color: isDeafened ? '#ef4444' : 'var(--color-ink)',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {isDeafened ? '🔇 헤드셋 켜기' : '🎧 헤드셋 끄기'}
              </button>

              {/* 연결 상태 */}
              <span style={{ fontSize: '0.85rem', color: '#166534', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                🟢 {t('연결됨', 'Connected')}
              </span>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 0.3; }
          100% { transform: scale(1); opacity: 0.8; }
        }
      `}</style>
    </main>
  );
}
