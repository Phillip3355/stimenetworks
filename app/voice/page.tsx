'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useLanguage } from '../components/LanguageProvider';
import { supabase } from '../lib/supabase';
import { filterStageRooms } from '../lib/voiceRoomPolicy.mjs';
import styles from '../styles/server-mechanism.module.css';

interface StageRoom {
  id: string | number;
  code: string;
  title: string;
  room_type?: string;
  is_public?: boolean;
}

export default function VoiceRoomsListPage() {
  const { t } = useLanguage();
  const router = useRouter();

  const [stageRooms, setStageRooms] = useState<StageRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [directCode, setDirectCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // 공개 STAGE 채널 목록 조회 & 실시간 동기화
  useEffect(() => {
    async function loadStageRooms() {
      const { data, error } = await supabase
        .from('voice_rooms')
        .select('*')
        .eq('is_public', true)
        .eq('room_type', 'stage')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setStageRooms(filterStageRooms(data));
      }
      setLoading(false);
    }

    loadStageRooms();

    // 실시간 변경 감지
    const channel = supabase
      .channel('public_voice_rooms_feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'voice_rooms' }, () => {
        loadStageRooms();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // STAGE 채널 코드 직접 입장
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
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className={styles.sectionCanvas}
      >
        <div className={styles.sectionContent}>
          <header className={styles.voiceIntro}>
            <span className={styles.eyebrow}>StimeMC · Live</span>
            <h1 className={styles.title}>
              {t('실시간 STAGE 채널', 'Live STAGE channels')}
            </h1>
            <p className={styles.lead}>
              {t(
                '열려 있는 STAGE에 입장해 새 소식과 커뮤니티 방송을 바로 듣고, 함께하는 순간을 놓치지 마세요.',
                'Join an open STAGE to hear server news and community broadcasts live as they happen.'
              )}
            </p>
          </header>

          <section className={styles.directJoin} aria-labelledby="direct-join-title">
            <div className={styles.directJoinCopy}>
              <span className={styles.eyebrow}>DIRECT ACCESS</span>
              <h2 id="direct-join-title">
                {t('채널 코드로 바로 입장', 'Join with a channel code')}
              </h2>
            </div>
            <form onSubmit={handleDirectJoin} className={styles.directJoinForm}>
              <div className={styles.directJoinField}>
                <input
                  type="text"
                  placeholder={t('STAGE 채널 코드 입력 (예: event-2026)', 'Enter STAGE channel code (e.g. event-2026)')}
                  value={directCode}
                  onChange={(e) => {
                    setDirectCode(e.target.value);
                    setErrorMsg('');
                  }}
                  aria-label={t('STAGE 채널 코드', 'STAGE channel code')}
                />
              </div>
              <button type="submit" className={styles.roomAction}>
                {t('입장하기', 'Join channel')}
              </button>
            </form>
            {errorMsg && <p className={styles.formError}>{errorMsg}</p>}
          </section>

          <section className={styles.voiceDirectory} aria-labelledby="active-stage-title">
            <div className={styles.roomHeader}>
              <h2 id="active-stage-title">
                {t('활성화된 STAGE 채널', 'Active STAGE channels')}
              </h2>
              <span>
                {stageRooms.length} {t('개의 채널', 'active channels')}
              </span>
            </div>

            {loading ? (
              <div className={styles.emptyState} aria-live="polite">
                {t('STAGE 채널 목록을 불러오는 중...', 'Loading STAGE channels...')}
              </div>
            ) : stageRooms.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.statusDot} aria-hidden="true" />
                <p>
                  {t('현재 활성화된 STAGE 채널이 없습니다.', 'No active STAGE channels currently available.')}
                </p>
                <small>
                  {t('새 STAGE가 열리면 이곳에서 바로 입장할 수 있습니다.', 'When a new STAGE opens, you can join it right here.')}
                </small>
              </div>
            ) : (
              <div className={styles.roomGrid}>
                {stageRooms.map((room, index) => (
                  <motion.article
                    key={room.id}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -28 : 28 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 1.1, delay: Math.min(index * 0.12, 0.36), ease: [0.22, 1, 0.36, 1] }}
                    className={styles.roomCard}
                  >
                    <div>
                      <div className={styles.roomMeta}>
                        <span className={styles.roomBadge}>
                          <span className={styles.liveDot} aria-hidden="true" />
                          STAGE · LIVE
                        </span>
                        <span className={styles.roomCode}>CODE {room.code}</span>
                      </div>
                      <h3>{room.title}</h3>
                      <p>stimemc.xyz/voice-{room.code}</p>
                    </div>

                    <Link href={`/voice-${room.code}`} className={styles.roomAction}>
                      {t('STAGE 입장', 'Enter STAGE')}
                    </Link>
                  </motion.article>
                ))}
              </div>
            )}
          </section>
        </div>
      </motion.section>
    </main>
  );
}
