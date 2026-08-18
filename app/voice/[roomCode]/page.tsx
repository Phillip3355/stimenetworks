'use client';

import { useState, useEffect, useRef, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { useLanguage } from '../../components/LanguageProvider';
import { supabase } from '../../lib/supabase';
import styles from '../../styles/server-mechanism.module.css';

export const dynamic = 'force-dynamic';

interface RoomPageProps {
  params: Promise<{ roomCode?: string }>;
}

interface StageRoom {
  id: string;
  title: string;
  code: string;
}

interface Participant {
  id: string;
  name: string;
  isMuted: boolean;
  isSpeaking: boolean;
  isScreenSharing: boolean;
  isSpeaker: boolean;
  isSelf: boolean;
}

export default function DynamicVoiceRoomPage({ params }: RoomPageProps) {
  const unwrappedParams = use(params);
  const rawCode = unwrappedParams?.roomCode || '';
  const roomCode = rawCode.replace(/^voice-/, '');

  const { t } = useLanguage();
  const router = useRouter();

  // 브라우저 세션당 고유 클라이언트 ID
  const myClientIdRef = useRef<string>('');

  // 어드민 & 유저 상태
  const [isAdmin, setIsAdmin] = useState(false);

  // 방 상태 및 룸 정보
  const [roomData, setRoomData] = useState<StageRoom | null>(null);
  const [loading, setLoading] = useState(true);

  // 로컬 유저 상태
  const [nickname, setNickname] = useState('');
  const [hasJoined, setHasJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [, setIsSpeaking] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false); // 스테이지 채널 발언권 여부
  const [copiedLink, setCopiedLink] = useState(false);
  const [audioBlocked, setAudioBlocked] = useState(false);

  // 선택된/포커스된 화면 공유 정보
  const [focusedStreamer, setFocusedStreamer] = useState<{
    id: string;
    name: string;
    stream: MediaStream | null;
    isSelf: boolean;
  } | null>(null);

  // 어드민용 선택 참가자 팝업 메뉴
  const [selectedAdminTarget, setSelectedAdminTarget] = useState<Participant | null>(null);

  // 실시간 접속자 목록 (DB & Realtime Sync)
  const [participants, setParticipants] = useState<Participant[]>([]);

  // 오디오, 비디오 & WebRTC 연결 관리 Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const heartbeatTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const peerConnectionsRef = useRef<{ [peerId: string]: RTCPeerConnection }>({});
  const remoteAudioElementsRef = useRef<{ [peerId: string]: HTMLAudioElement }>({});
  const remoteVideoStreamsRef = useRef<{ [peerId: string]: MediaStream }>({});
  const broadcastChannelRef = useRef<RealtimeChannel | null>(null);
  const videoPlayerRef = useRef<HTMLVideoElement | null>(null);
  const currentTimeRef = useRef(0);

  useEffect(() => {
    if (!myClientIdRef.current) {
      myClientIdRef.current = `client_${crypto.randomUUID().slice(0, 7)}`;
    }
    const updateCurrentTime = () => {
      currentTimeRef.current = Date.now();
    };
    updateCurrentTime();
    const clockTimer = window.setInterval(updateCurrentTime, 1000);
    return () => window.clearInterval(clockTimer);
  }, []);

  // 0. 구글 로그인 어드민 상태 체크
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const activeUser = session?.user ?? null;
      if (activeUser?.email) {
        const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
          .split(',')
          .map((e) => e.trim().toLowerCase());
        setIsAdmin(adminEmails.includes(activeUser.email.toLowerCase()));
      }
    });
  }, []);

  // 자원 해제 및 DB에서 본인 제거
  const cleanUpConnections = useCallback(async () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
    }
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      await audioContextRef.current.close();
      audioContextRef.current = null;
    }
    Object.values(peerConnectionsRef.current).forEach((pc) => pc.close());
    peerConnectionsRef.current = {};
    Object.values(remoteAudioElementsRef.current).forEach((el) => el.remove());
    remoteAudioElementsRef.current = {};
    remoteVideoStreamsRef.current = {};

    if (myClientIdRef.current && roomCode) {
      try {
        await supabase
          .from('voice_room_members')
          .delete()
          .eq('client_id', myClientIdRef.current);
      } catch (err) {
        console.error(err);
      }
    }
  }, [roomCode]);

  // 1. 방 유효성 검사 및 실시간 삭제(Auto-Kick) 감지
  useEffect(() => {
    let statusChannel: RealtimeChannel | null = null;

    async function checkRoom() {
      if (!roomCode) return;

      const { data, error } = await supabase
        .from('voice_rooms')
        .select('*')
        .eq('code', roomCode)
        .eq('room_type', 'stage')
        .eq('is_public', true)
        .single();

      if (error || !data) {
        alert(t('존재하지 않거나 삭제된 STAGE 채널입니다.', 'This STAGE channel does not exist or has been deleted.'));
        router.push('/voice');
        return;
      }

      setRoomData(data);
      setLoading(false);

      // 관리자가 방 삭제 시 실시간 자동 강제 퇴장 (Auto-Kick)
      statusChannel = supabase
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
            cleanUpConnections();
            alert(t('🚨 관리자에 의해 STAGE 채널이 삭제되었습니다. 자동으로 퇴장됩니다.', '🚨 STAGE channel deleted by admin. You have been disconnected.'));
            router.push('/voice');
          }
        )
        .subscribe();
    }

    checkRoom();

    return () => {
      if (statusChannel) supabase.removeChannel(statusChannel);
      cleanUpConnections();
    };
  }, [cleanUpConnections, roomCode, router, t]);

  // 브라우저 자동재생 잠금 해제 (Autoplay Unlock)
  const unlockAudioPlayback = () => {
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    Object.values(remoteAudioElementsRef.current).forEach((audio) => {
      audio.play().then(() => setAudioBlocked(false)).catch(() => setAudioBlocked(true));
    });
  };

  // 2. 마이크 캡처 및 Voice Activity Detection (음성 크기 감지)
  const startAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });
      mediaStreamRef.current = stream;

      const AudioContextConstructor = window.AudioContext ?? (window as unknown as {
        webkitAudioContext?: typeof AudioContext;
      }).webkitAudioContext;
      if (!AudioContextConstructor) {
        throw new Error('Web Audio API is not supported in this browser.');
      }
      const audioCtx = new AudioContextConstructor();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      let prevSpeaking = false;
      const checkVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const speakingNow = average > 12 && !isMuted;
        setIsSpeaking(speakingNow);

        // 발화 상태 변경 시 DB 상태 업데이트
        if (speakingNow !== prevSpeaking && myClientIdRef.current) {
          prevSpeaking = speakingNow;
          supabase
            .from('voice_room_members')
            .update({
              is_speaking: speakingNow,
              updated_at: new Date().toISOString(),
            })
            .eq('client_id', myClientIdRef.current)
            .then();
        }

        animFrameRef.current = requestAnimationFrame(checkVolume);
      };

      checkVolume();
      return stream;
    } catch (err) {
      console.warn('마이크 접근 오류:', err);
      alert(t('마이크 접근 권한이 필요합니다.', 'Microphone access is required.'));
      return null;
    }
  };

  // 3. 1080p 30fps 화면 공유 시작 핸들러
  const startScreenShare = async () => {
    // STAGE 채널에서는 관리자이거나 지정된 발언자만 화면 공유 가능
    const canShare = isAdmin || isSpeaker;

    if (!canShare) {
      alert(t('STAGE 채널에서는 호스트(관리자) 및 승인된 발언자만 화면을 공유할 수 있습니다.', 'Only host or speakers can share screen in STAGE channel.'));
      return;
    }

    try {
      unlockAudioPlayback();
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 },
          frameRate: { ideal: 30, max: 30 },
        },
        audio: true,
      });

      screenStreamRef.current = screenStream;
      setIsScreenSharing(true);

      // DB 상태 업뎃 (화면 공유 시작 알림)
      if (myClientIdRef.current) {
        await supabase
          .from('voice_room_members')
          .update({
            is_screen_sharing: true,
            updated_at: new Date().toISOString(),
          })
          .eq('client_id', myClientIdRef.current);
      }

      // 연결된 모든 WebRTC 피어들에 비디오 트랙 추가 및 재연결 요청
      const videoTrack = screenStream.getVideoTracks()[0];
      if (videoTrack) {
        Object.keys(peerConnectionsRef.current).forEach((targetClientId) => {
          const pc = peerConnectionsRef.current[targetClientId];
          pc.addTrack(videoTrack, screenStream);
          pc.createOffer().then((offer) => {
            pc.setLocalDescription(offer);
            if (broadcastChannelRef.current) {
              broadcastChannelRef.current.send({
                type: 'broadcast',
                event: 'webrtc-offer',
                payload: {
                  from: myClientIdRef.current,
                  to: targetClientId,
                  offer: offer,
                },
              });
            }
          });
        });

        videoTrack.onended = () => {
          stopScreenShare();
        };
      }

      setFocusedStreamer({
        id: myClientIdRef.current,
        name: nickname.trim(),
        stream: screenStream,
        isSelf: true,
      });

    } catch (err) {
      console.warn('화면 공유 취소 또는 실패:', err);
    }
  };

  // 화면 공유 중단
  const stopScreenShare = async () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
    }
    setIsScreenSharing(false);

    if (focusedStreamer?.isSelf) {
      setFocusedStreamer(null);
    }

    if (myClientIdRef.current) {
      await supabase
        .from('voice_room_members')
        .update({
          is_screen_sharing: false,
          updated_at: new Date().toISOString(),
        })
        .eq('client_id', myClientIdRef.current);
    }
  };

  // WebRTC P2P 피어 연결 생성 및 오디오/비디오 트랙 수신
  const createPeerConnection = (targetClientId: string, stream: MediaStream | null) => {
    if (peerConnectionsRef.current[targetClientId]) {
      return peerConnectionsRef.current[targetClientId];
    }

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
      ],
    });

    if (stream) {
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => pc.addTrack(track, screenStreamRef.current!));
    }

    // 원격 음성 및 비디오 트랙 수신
    pc.ontrack = (event) => {
      const track = event.track;

      if (track.kind === 'audio') {
        let audioEl = remoteAudioElementsRef.current[targetClientId];
        if (!audioEl) {
          audioEl = document.createElement('audio');
          audioEl.autoplay = true;
          audioEl.setAttribute('playsinline', 'true');
          audioEl.style.display = 'none';
          remoteAudioElementsRef.current[targetClientId] = audioEl;
          document.body.appendChild(audioEl);
        }
        audioEl.srcObject = event.streams[0];
        audioEl.play().then(() => setAudioBlocked(false)).catch(() => setAudioBlocked(true));
      } else if (track.kind === 'video') {
        remoteVideoStreamsRef.current[targetClientId] = event.streams[0];

        if (focusedStreamer?.id === targetClientId && videoPlayerRef.current) {
          videoPlayerRef.current.srcObject = event.streams[0];
        }
      }
    };

    // ICE Candidate 시그널 전송
    pc.onicecandidate = (event) => {
      if (event.candidate && broadcastChannelRef.current) {
        broadcastChannelRef.current.send({
          type: 'broadcast',
          event: 'webrtc-candidate',
          payload: {
            from: myClientIdRef.current,
            to: targetClientId,
            candidate: event.candidate,
          },
        });
      }
    };

    peerConnectionsRef.current[targetClientId] = pc;
    return pc;
  };

  // 4. 참가자 목록 불러오기 & WebRTC Offer 전송
  const loadRoomParticipants = async () => {
    const activeCutoff = new Date(currentTimeRef.current - 15000).toISOString();
    const { data, error } = await supabase
      .from('voice_room_members')
      .select('*')
      .eq('room_code', roomCode)
      .gt('updated_at', activeCutoff)
      .order('updated_at', { ascending: true });

    if (!error && data) {
      const formatted = data.map((m) => {
        const isSelf = m.client_id === myClientIdRef.current;
        if (isSelf) {
          setIsSpeaker(m.is_speaker || false);
        }
        return {
          id: m.client_id,
          name: m.nickname,
          isMuted: m.is_muted,
          isSpeaking: m.is_speaking,
          isScreenSharing: m.is_screen_sharing,
          isSpeaker: m.is_speaker,
          isSelf: isSelf,
        };
      });

      setParticipants(formatted);

      // 본인 이외의 유저에게 WebRTC SDP Offer 생성 및 발송
      data.forEach((member) => {
        if (member.client_id !== myClientIdRef.current && !peerConnectionsRef.current[member.client_id]) {
          const pc = createPeerConnection(member.client_id, mediaStreamRef.current);
          pc.createOffer().then((offer) => {
            pc.setLocalDescription(offer);
            if (broadcastChannelRef.current) {
              broadcastChannelRef.current.send({
                type: 'broadcast',
                event: 'webrtc-offer',
                payload: {
                  from: myClientIdRef.current,
                  to: member.client_id,
                  offer: offer,
                },
              });
            }
          });
        }
      });
    }
  };

  // 어드민 전용: 특정 사용자를 발언자로 승격(초대)
  const handlePromoteSpeaker = async (targetClientId: string) => {
    try {
      await supabase
        .from('voice_room_members')
        .update({
          is_speaker: true,
          is_muted: false,
          updated_at: new Date().toISOString(),
        })
        .eq('client_id', targetClientId);

      setSelectedAdminTarget(null);
      await loadRoomParticipants();
    } catch (err) {
      console.error(err);
    }
  };

  // 어드민 전용: 특정 발언자를 시청자로 강등 (내려버리기)
  const handleDemoteSpeaker = async (targetClientId: string) => {
    try {
      await supabase
        .from('voice_room_members')
        .update({
          is_speaker: false,
          is_muted: true,
          is_speaking: false,
          is_screen_sharing: false,
          updated_at: new Date().toISOString(),
        })
        .eq('client_id', targetClientId);

      setSelectedAdminTarget(null);
      await loadRoomParticipants();
    } catch (err) {
      console.error(err);
    }
  };

  // 프로필 카드 클릭 시 처리 (어드민 제어 또는 화면 시청)
  const handleSelectParticipant = (p: Participant) => {
    unlockAudioPlayback();

    // 어드민이고 타겟 유저가 본인이 아닌 경우 어드민 관리 팝업 켬
    if (isAdmin && !p.isSelf) {
      setSelectedAdminTarget(p);
      return;
    }

    if (p.isSelf && isScreenSharing && screenStreamRef.current) {
      setFocusedStreamer({
        id: myClientIdRef.current,
        name: p.name,
        stream: screenStreamRef.current,
        isSelf: true,
      });
    } else if (p.isScreenSharing) {
      const remoteStream = remoteVideoStreamsRef.current[p.id] || null;
      setFocusedStreamer({
        id: p.id,
        name: p.name,
        stream: remoteStream,
        isSelf: false,
      });
    } else {
      alert(t(`${p.name}님은 현재 화면을 공유하고 있지 않거나 시청자 상태입니다.`, `${p.name} is not sharing screen right now.`));
    }
  };

  // 포커스된 비디오 뷰어 바인딩
  useEffect(() => {
    if (focusedStreamer && videoPlayerRef.current) {
      videoPlayerRef.current.srcObject = focusedStreamer.stream;
      videoPlayerRef.current.play().catch(console.warn);
    }
  }, [focusedStreamer]);

  // 방 입장 처리
  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;

    // STAGE 채널 입장 시: 관리자는 기본 발언자(Speaker), 일반 유저는 시청자(Muted Listener)
    const initialSpeaker = isAdmin;
    const initialMute = !isAdmin;

    setHasJoined(true);
    setIsSpeaker(initialSpeaker);
    setIsMuted(initialMute);

    const stream = await startAudio();

    // 1) Broadcast 시그널링 채널 먼저 생성 및 대기
    const membersChannel = supabase.channel(`members_channel_${roomCode}`);
    broadcastChannelRef.current = membersChannel;

    membersChannel.on('broadcast', { event: 'webrtc-offer' }, async ({ payload }) => {
      if (payload.to === myClientIdRef.current) {
        const pc = createPeerConnection(payload.from, stream);
        await pc.setRemoteDescription(new RTCSessionDescription(payload.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        membersChannel.send({
          type: 'broadcast',
          event: 'webrtc-answer',
          payload: {
            from: myClientIdRef.current,
            to: payload.from,
            answer: answer,
          },
        });
      }
    });

    membersChannel.on('broadcast', { event: 'webrtc-answer' }, async ({ payload }) => {
      if (payload.to === myClientIdRef.current) {
        const pc = peerConnectionsRef.current[payload.from];
        if (pc) {
          await pc.setRemoteDescription(new RTCSessionDescription(payload.answer));
        }
      }
    });

    membersChannel.on('broadcast', { event: 'webrtc-candidate' }, async ({ payload }) => {
      if (payload.to === myClientIdRef.current) {
        const pc = peerConnectionsRef.current[payload.from];
        if (pc && payload.candidate) {
          await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
        }
      }
    });

    // Postgres Changes 실시간 참가자 및 발언권 이벤트 바인딩
    membersChannel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'voice_room_members',
        filter: `room_code=eq.${roomCode}`,
      },
      () => {
        loadRoomParticipants();
      }
    );

    // 2) 채널 구독 시작 후 DB 등록 및 참가자 불러오기
    membersChannel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await supabase.from('voice_room_members').upsert(
          [
            {
              room_code: roomCode,
              client_id: myClientIdRef.current,
              nickname: nickname.trim(),
              is_muted: initialMute,
              is_speaking: false,
              is_screen_sharing: false,
              is_speaker: initialSpeaker,
              updated_at: new Date().toISOString(),
            },
          ],
          { onConflict: 'client_id' }
        );

        await loadRoomParticipants();
      }
    });

    // 3) 5초 간격 하트비트
    heartbeatTimerRef.current = setInterval(async () => {
      if (myClientIdRef.current) {
        await supabase
          .from('voice_room_members')
          .update({ updated_at: new Date().toISOString() })
          .eq('client_id', myClientIdRef.current);
      }
    }, 5000);
  };

  // 마이크 음소거 토글 (스테이지 채널 발언권 제약)
  const toggleMute = async () => {
    unlockAudioPlayback();
    const canSpeak = isAdmin || isSpeaker;

    if (!canSpeak) {
      alert(t('STAGE 채널에서는 호스트(관리자) 및 초대된 발언자만 마이크를 펼 수 있습니다.', 'Only host or invited speakers can turn on mic in STAGE.'));
      return;
    }

    const nextMute = !isMuted;
    setIsMuted(nextMute);

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !nextMute;
      });
    }
    if (nextMute) setIsSpeaking(false);

    if (myClientIdRef.current) {
      await supabase
        .from('voice_room_members')
        .update({
          is_muted: nextMute,
          is_speaking: false,
          updated_at: new Date().toISOString(),
        })
        .eq('client_id', myClientIdRef.current);
    }
  };

  // 스피커 헤드셋 토글
  const toggleDeafen = () => {
    unlockAudioPlayback();
    const nextDeafen = !isDeafened;
    setIsDeafened(nextDeafen);
    Object.values(remoteAudioElementsRef.current).forEach((audio) => {
      audio.muted = nextDeafen;
    });
  };

  // 초대 링크 복사
  const handleCopyLink = () => {
    const fullUrl = `https://stimemc.xyz/voice-${roomCode}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  if (loading) {
    return (
      <main className={styles.main} style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--color-mute)', fontSize: '1.1rem' }}>{t('STAGE 채널 확인 중...', 'Connecting to STAGE Channel...')}</p>
      </main>
    );
  }

  const canSpeak = isAdmin || isSpeaker;

  return (
    <main
      className={styles.main}
      onClick={unlockAudioPlayback}
      style={{ minHeight: '90vh', padding: '40px 20px 120px' }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* 브라우저 사운드 자동재생 차단 해제 배너 */}
        {audioBlocked && (
          <div style={{
            background: '#fef3c7', border: '1px solid #fde047', color: '#854d0e',
            padding: '12px 20px', borderRadius: 'var(--radius-sm)', marginBottom: '24px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 700
          }}>
            <span>🔊 브라우저 보안으로 인해 오디오/화면 재생이 일시 차단되었습니다. 화면 클릭 시 재생됩니다!</span>
            <button
              onClick={unlockAudioPlayback}
              style={{
                padding: '6px 14px', background: '#b45309', color: '#fff', border: 'none',
                borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 800
              }}
            >
              음성 및 미디어 재생 켜기
            </button>
          </div>
        )}

        {/* 상단 헤더 영역 */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '28px', paddingBottom: '20px', borderBottom: '1px solid var(--color-hairline)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900, color: 'var(--color-ink)' }}>
                🎙️ [STAGE 무대] {roomData?.title || roomCode}
              </h1>
              <span style={{
                fontSize: '0.8rem', padding: '4px 12px', borderRadius: '14px', fontWeight: 800,
                background: '#dbeafe',
                color: '#1e40af'
              }}>
                {t('🎙️ STAGE 방송 채널', '🎙️ STAGE Broadcast Channel')}
              </span>
            </div>
            <p style={{ margin: '6px 0 0', fontSize: '0.9rem', color: 'var(--color-mute)' }}>
              코드: <code>voice-{roomCode}</code> | 실시간 접속 인원: <strong style={{ color: 'var(--color-primary)' }}>{participants.length} / 10명</strong>
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
              onClick={async () => {
                await cleanUpConnections();
                router.push('/voice');
              }}
              style={{
                padding: '10px 18px', background: '#fef2f2', border: '1px solid #fee2e2', color: '#ef4444',
                borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem'
              }}
            >
              🚪 {t('나가기', 'Leave')}
            </button>
          </div>
        </div>

        {/* 📺 프로필 클릭 시 시청하는 1080p 메인 화면 공유 스테이지 / 플레이어 */}
        <AnimatePresence>
          {focusedStreamer && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                background: '#09090b',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '32px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                color: '#ffffff',
                position: 'relative'
              }}
            >
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: '16px', borderBottom: '1px solid #27272a', paddingBottom: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    fontSize: '0.8rem', padding: '4px 10px', borderRadius: '12px', fontWeight: 800,
                    background: '#ef4444', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px'
                  }}>
                    🔴 1080p 30fps LIVE
                  </span>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
                    {focusedStreamer.name} {t('님의 화면 라이브', "'s Live Screen")}
                  </h3>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => {
                      if (videoPlayerRef.current) {
                        if (videoPlayerRef.current.requestFullscreen) {
                          videoPlayerRef.current.requestFullscreen();
                        }
                      }
                    }}
                    style={{
                      padding: '8px 16px', background: '#27272a', border: 'none', color: '#fff',
                      borderRadius: 'var(--radius-sm)', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem'
                    }}
                  >
                    ⛶ {t('전체화면', 'Fullscreen')}
                  </button>
                  <button
                    onClick={() => setFocusedStreamer(null)}
                    style={{
                      padding: '8px 16px', background: '#3f3f46', border: 'none', color: '#fff',
                      borderRadius: 'var(--radius-sm)', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem'
                    }}
                  >
                    ✕ {t('닫기', 'Close Viewer')}
                  </button>
                </div>
              </div>

              <div style={{
                width: '100%',
                maxHeight: '620px',
                aspectRatio: '16/9',
                background: '#000000',
                borderRadius: '12px',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <video
                  ref={videoPlayerRef}
                  autoPlay
                  playsInline
                  controls
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 👑 어드민 전용: 시청자 발언권 승격/강등 오버레이 팝업 모달 */}
        <AnimatePresence>
          {selectedAdminTarget && (
            <div style={{
              position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
            }}>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSelectedAdminTarget(null)}
                style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                style={{
                  position: 'relative', background: '#ffffff', borderRadius: 'var(--radius-sm)',
                  padding: '32px', width: '100%', maxWidth: '400px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                  textAlign: 'center'
                }}
              >
                <h3 style={{ margin: '0 0 12px', fontSize: '1.3rem', fontWeight: 800 }}>
                  👑 어드민 시청자 제어
                </h3>
                <p style={{ margin: '0 0 24px', fontSize: '0.95rem', color: 'var(--color-ink)', fontWeight: 700 }}>
                  [{selectedAdminTarget.name}] 님 권한 설정
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {!selectedAdminTarget.isSpeaker ? (
                    <button
                      onClick={() => handlePromoteSpeaker(selectedAdminTarget.id)}
                      style={{
                        padding: '14px', background: '#16a34a', color: '#ffffff', border: 'none',
                        borderRadius: 'var(--radius-sm)', fontWeight: 800, fontSize: '1rem', cursor: 'pointer'
                      }}
                    >
                      👑 발언자로 초대 (발언권 부여)
                    </button>
                  ) : (
                    <button
                      onClick={() => handleDemoteSpeaker(selectedAdminTarget.id)}
                      style={{
                        padding: '14px', background: '#dc2626', color: '#ffffff', border: 'none',
                        borderRadius: 'var(--radius-sm)', fontWeight: 800, fontSize: '1rem', cursor: 'pointer'
                      }}
                    >
                      ⬇️ 시청자로 강등 (내려버리기)
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedAdminTarget(null)}
                    style={{
                      padding: '12px', background: '#f3f4f6', color: '#4b5563', border: 'none',
                      borderRadius: 'var(--radius-sm)', fontWeight: 700, cursor: 'pointer'
                    }}
                  >
                    취소
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

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
              🎙️ {t('STAGE 방송 무대 입장', 'Enter STAGE Broadcast')}
            </h2>
            <p style={{ margin: '8px 0 24px', fontSize: '0.9rem', color: 'var(--color-mute)' }}>
              {t('STAGE 무대에 시청자로 연결됩니다. (호스트가 발언자로 지정 시 대화 가능)', 'You will join the STAGE as a listener. (The host can grant speaking access.)')}
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
                  padding: '14px', background: '#2563eb', color: '#ffffff',
                  border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 800,
                  fontSize: '1rem', cursor: 'pointer'
                }}
              >
                🎙️ {t('STAGE 무대 연결', 'Connect to STAGE')}
              </button>
            </form>
          </motion.div>
        ) : (
          /* 입장 완료: 10인 그리드 아바타 & 제어 툴바 */
          <div>
            {/* STAGE 설명 안내 띠 */}
            {(
              <div style={{
                background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af',
                padding: '14px 20px', borderRadius: 'var(--radius-sm)', marginBottom: '24px',
                fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <span>🎙️ <strong>STAGE 무대 채널</strong> : 호스트(관리자) 및 초대된 발언자만 마이크 및 화면 공유가 가능합니다.</span>
                {isAdmin && <span style={{ color: '#2563eb' }}>👑 관리자 권한 활성화 (프로필 클릭하여 발언자 지명 가능)</span>}
              </div>
            )}

            {/* 10인 그리드 카드 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '20px',
              marginBottom: '120px'
            }}>
              {participants.map((p) => {
                const isSelf = p.isSelf;
                const activeSpeaking = p.isSpeaking;
                const activeMuted = p.isMuted;
                const isSharingScreen = isSelf ? isScreenSharing : p.isScreenSharing;
                const isSpeakerRole = isSelf ? isSpeaker : p.isSpeaker;

                return (
                  <motion.div
                    key={p.id}
                    onClick={() => handleSelectParticipant(p)}
                    whileHover={{ scale: 1.02 }}
                    animate={{
                      boxShadow: activeSpeaking
                        ? '0 0 25px rgba(34, 197, 94, 0.45)'
                        : '0 4px 15px rgba(0,0,0,0.02)'
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    style={{
                      background: '#ffffff',
                      border: isSharingScreen
                        ? '2px solid #ef4444'
                        : isSpeakerRole
                        ? '2px solid #3b82f6'
                        : activeSpeaking
                        ? '2px solid #22c55e'
                        : '1px solid var(--color-hairline)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '24px 18px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      position: 'relative',
                      textAlign: 'center',
                      cursor: (isAdmin && !isSelf) || isSharingScreen ? 'pointer' : 'default'
                    }}
                  >
                    {/* 화면 공유 중 뱃지 */}
                    {isSharingScreen && (
                      <span style={{
                        position: 'absolute', top: '10px', right: '10px',
                        background: '#ef4444', color: '#ffffff', fontSize: '0.7rem',
                        fontWeight: 800, padding: '3px 8px', borderRadius: '10px',
                        boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)',
                        animation: 'pulse 1.2s infinite'
                      }}>
                        🔴 LIVE
                      </span>
                    )}

                    {/* 발화자 / 발언자 아우라 링 */}
                    <div style={{
                      width: '72px', height: '72px', borderRadius: '50%',
                      background: isSharingScreen ? '#fee2e2' : isSpeakerRole ? '#dbeafe' : activeSpeaking ? '#dcfce7' : '#f1f5f9',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '2rem', marginBottom: '14px', position: 'relative',
                      transition: 'all 0.2s ease'
                    }}>
                      {isSharingScreen ? '🖥️' : isSpeakerRole ? '🎙️' : '🎧'}
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

                    <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                      <span style={{
                        fontSize: '0.75rem', padding: '2px 8px', borderRadius: '10px', fontWeight: 800,
                        background: isSpeakerRole ? '#dbeafe' : '#f3f4f6',
                        color: isSpeakerRole ? '#1e40af' : '#6b7280'
                      }}>
                        {isSpeakerRole ? '👑 발언자' : '👁️ 시청자'}
                      </span>

                      <span style={{
                        fontSize: '0.75rem', padding: '2px 8px', borderRadius: '10px',
                        fontWeight: 700,
                        background: activeMuted ? '#fee2e2' : activeSpeaking ? '#dcfce7' : '#f3f4f6',
                        color: activeMuted ? '#ef4444' : activeSpeaking ? '#15803d' : '#6b7280'
                      }}>
                        {activeMuted ? '🔇 음소거' : activeSpeaking ? '🎙️ 대화 중' : '대기 중'}
                      </span>

                      {isSharingScreen && (
                        <span style={{
                          fontSize: '0.75rem', padding: '2px 8px', borderRadius: '10px',
                          fontWeight: 700, background: '#fef2f2', color: '#ef4444'
                        }}>
                          🖥️ 클릭 시 시청
                        </span>
                      )}
                    </div>
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
                    padding: '24px 18px',
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

            {/* 하단 고정 음성 및 미디어 컨트롤 툴바 */}
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
              gap: '14px',
              zIndex: 100
            }}>
              {/* 마이크 토글 */}
              <button
                onClick={toggleMute}
                disabled={!canSpeak}
                style={{
                  padding: '10px 20px',
                  borderRadius: '30px',
                  border: 'none',
                  background: !canSpeak ? '#9ca3af' : isMuted ? '#ef4444' : '#22c55e',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  cursor: !canSpeak ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                  opacity: !canSpeak ? 0.7 : 1
                }}
              >
                {!canSpeak ? '🔒 마이크 차단됨 (시청 전용)' : isMuted ? '🔇 마이크 켜기' : '🎙️ 마이크 끄기 (Mute)'}
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

              {/* 🖥️ 1080p 30fps 화면 공유 토글 버튼 */}
              <button
                onClick={isScreenSharing ? stopScreenShare : startScreenShare}
                disabled={!canSpeak}
                style={{
                  padding: '10px 20px',
                  borderRadius: '30px',
                  border: 'none',
                  background: !canSpeak ? '#9ca3af' : isScreenSharing ? '#dc2626' : 'var(--color-primary)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  cursor: !canSpeak ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                  opacity: !canSpeak ? 0.7 : 1
                }}
              >
                {isScreenSharing ? '🔴 화면 공유 중단' : '🖥️ 화면 공유 (1080p)'}
              </button>

              {/* 연결 상태 */}
              <span style={{ fontSize: '0.85rem', color: '#166534', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                🟢 {t('실시간 연결됨', 'Realtime Connected')}
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
