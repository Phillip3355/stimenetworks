'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '../LanguageProvider';
import { clamp, chapterOpacity } from './timeline.mjs';
import type { SceneController } from './scene';
import WorldFallback from './WorldFallback';
import styles from './cinematic-home.module.css';

const chapters = [
  { id: 'stime', label: 'STIME', eyebrow: 'MINECRAFT. REENGINEERED.', title: ['STIME'], ko: '익숙한 세계. 그 아래, 새로운 가능성.', en: 'A familiar world. More underneath.', detailKo: 'Java와 Bedrock, 하나의 StimeMC.', detailEn: 'Java and Bedrock. One StimeMC.' },
  { id: 'enter', label: 'THE WORLD', eyebrow: '01 / STEP INSIDE', title: ['ENTER', 'THE WORLD.'], ko: '블록 하나에서 시작되는, 우리만의 세계.', en: 'Every block is a beginning.', detailKo: '플레이어의 건축으로 계속 달라지는 풍경.', detailEn: 'A landscape continually shaped by its players.' },
  { id: 'editions', label: 'CROSSPLAY', eyebrow: '02 / TWO EDITIONS. ONE DESTINATION.', title: ['JAVA ×', 'BEDROCK.'], ko: '시작은 달라도, 만나는 곳은 하나.', en: 'Different ways in. The same world.', detailKo: 'Geyser와 ViaProxy가 두 에디션을 연결합니다.', detailEn: 'Connected through Geyser and ViaProxy.' },
  { id: 'systems', label: 'SYSTEMS', eyebrow: '03 / UNDER THE SURFACE', title: ['A WORLD.', 'A SYSTEM.'], ko: '보이는 세계를, 보이지 않는 기술로.', en: 'An invisible system. A world of possibilities.', detailKo: 'Geyser의 번역. ViaProxy의 연결. 하나의 Java 서버.', detailEn: 'Geyser translates. ViaProxy connects. One Java server.' },
  { id: 'beyond', label: 'BEYOND', eyebrow: '04 / SERVER-SIDE POSSIBILITIES', title: ['BEYOND', 'VANILLA.'], ko: '서버는 더 새롭게. 접속은 그대로.', en: 'More on the server. Less to install.', detailKo: '서버사이드 모드로 넓어진 플레이. 클라이언트 모드는 필요 없습니다.', detailEn: 'Expanded play through server-side mods. No client mods required.' },
  { id: 'one-world', label: 'ONE WORLD', eyebrow: '05 / BUILT TOGETHER', title: ['ALL OF THIS.', 'ONE WORLD.'], ko: '모든 기술이 향하는 곳. 우리가 만드는 세계.', en: 'All this technology. For the world we build.', detailKo: '서로의 시간과 창작물을 지키며, 함께 만들어갑니다.', detailEn: 'Built together. Protected by respect for every player’s creations.' },
  { id: 'join-stime', label: 'JOIN STIME', eyebrow: '06 / YOUR NEXT CHAPTER', title: ['JOIN', 'STIME.'], ko: '다음 블록은, 당신의 것.', en: 'The next block is yours.', detailKo: 'Java × Bedrock · 별도 모드 설치 없이.', detailEn: 'Java × Bedrock · No client mods required.' },
];
type Mode = 'loading' | 'cinematic' | 'static';

export default function CinematicHome() {
  const { t } = useLanguage();
  const rootRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const controller = useRef<SceneController | null>(null);
  const progressRef = useRef(0);
  const [mode, setMode] = useState<Mode>('loading');
  const [active, setActive] = useState(0);

  useEffect(() => {
    let canceled = false;
    let generation = 0;
    let assetRequest: AbortController | undefined;
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const stop = () => { generation++; assetRequest?.abort(); controller.current?.dispose(); controller.current = null; setMode('static'); };
    const start = async () => {
      const ticket = ++generation;
      assetRequest?.abort();
      const request = new AbortController();
      assetRequest = request;
      if (media.matches) { stop(); return; }
      try {
        const { createScene } = await import('./scene');
        if (canceled || ticket !== generation || media.matches || !hostRef.current) return;
        const scene = await createScene(hostRef.current, () => stop(), request.signal);
        if (canceled || ticket !== generation || media.matches) { scene.dispose(); return; }
        controller.current = scene;
        controller.current.setProgress(progressRef.current);
        setMode('cinematic');
      } catch { if (!canceled && ticket === generation) stop(); }
    };
    const change = () => { stop(); if (!media.matches) void start(); };
    void start();
    media.addEventListener('change', change);
    return () => { canceled = true; generation++; assetRequest?.abort(); media.removeEventListener('change', change); controller.current?.dispose(); controller.current = null; };
  }, []);

  useEffect(() => {
    if (mode !== 'cinematic') return;
    let raf = 0, lastActive = -2;
    const update = () => {
      raf = 0;
      const track = trackRef.current;
      if (!track || !rootRef.current) return;
      const bounds = track.getBoundingClientRect();
      const stage = track.firstElementChild as HTMLElement;
      const progress = clamp(-bounds.top / Math.max(1, track.offsetHeight - stage.offsetHeight));
      progressRef.current = progress;
      controller.current?.setProgress(progress);
      rootRef.current.style.setProperty('--journey', String(progress));
      const nearest = Math.min(6, Math.round(progress * 6));
      const nextActive = chapterOpacity(progress, nearest) > 0 ? nearest : -1;
      if (nextActive !== lastActive) { lastActive = nextActive; setActive(nextActive); }
      const wordmark = rootRef.current.querySelector<HTMLElement>(`.${styles.wordmark}`);
      if (wordmark) wordmark.style.opacity = String(chapterOpacity(progress, 0));
      rootRef.current.querySelectorAll<HTMLElement>('[data-chapter]').forEach((element, i) => {
        element.style.setProperty('--chapter-opacity', String(chapterOpacity(progress, i)));
        element.style.setProperty('--chapter-y', `${Math.max(-24, Math.min(24, (i - progress * 6) * 32))}px`);
      });
    };
    const requestUpdate = () => { if (!raf) raf = requestAnimationFrame(update); };
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate, { passive: true });
    update();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', requestUpdate); window.removeEventListener('resize', requestUpdate); };
  }, [mode]);

  const goToChapter = (index: number) => {
    if (mode !== 'cinematic') { document.getElementById(chapters[index].id)?.scrollIntoView({ behavior: 'instant', block: 'start' }); return; }
    const track = trackRef.current;
    if (!track) return;
    const stage = track.firstElementChild as HTMLElement;
    const top = window.scrollY + track.getBoundingClientRect().top;
    window.scrollTo({ top: top + index / 6 * (track.offsetHeight - stage.offsetHeight), behavior: 'instant' });
  };

  return (
    <main ref={rootRef} className={styles.root} data-mode={mode} data-active={active}>
      <Link className={styles.skip} href="/join">{t('서버 가입으로 바로 이동', 'Skip experience and join')}</Link>
      <h1 className={styles.srOnly}>StimeMC — {t('Java와 Bedrock, 하나의 세계', 'Java and Bedrock, one world')}</h1>
      <div ref={trackRef} className={styles.timeline}>
        <div className={styles.stage} onPointerMove={event => {
          if (event.pointerType !== 'mouse') return;
          controller.current?.setPointer(event.clientX / window.innerWidth * 2 - 1, event.clientY / window.innerHeight * 2 - 1);
        }} onPointerLeave={() => controller.current?.setPointer(0, 0)}>
          <div className={styles.atmosphere} aria-hidden="true" />
          <div className={styles.wordmark} aria-hidden="true" style={{ opacity: mode === 'cinematic' ? undefined : 1 }}>STIME</div>
          <div className={styles.fallback}><WorldFallback /></div>
          <div ref={hostRef} className={styles.scene} aria-hidden="true" />
          <div className={styles.chapters}>
            {chapters.map((chapter, i) => (
              <section key={chapter.id} id={chapter.id} data-chapter={i} className={`${styles.chapter} ${i === 0 ? styles.intro : ''}`} aria-labelledby={`${chapter.id}-title`} aria-hidden={mode === 'cinematic' && active !== i ? true : undefined} inert={mode === 'cinematic' && active !== i}>
                <div className={styles.chapterCopy}>
                  <h2 id={`${chapter.id}-title`} className={styles.title}>{chapter.title.map(line => <span key={line}>{line}</span>)}</h2>
                  <p className={styles.statement}>{t(chapter.ko, chapter.en)}</p>
                  <p className={styles.detail}>{t(chapter.detailKo, chapter.detailEn)}</p>
                  {i === 0 && <a className={styles.action} href="#enter" onClick={event => { if (mode === 'cinematic') { event.preventDefault(); goToChapter(1); } }}>{t('세계 안으로', 'Enter the world')} <span>↘</span></a>}
                  {(i === 2 || i === 3 || i === 4) && <Link className={styles.action} href="/server-mechanism">{t('연결의 구조 알아보기', 'Explore the technology')} <span>↗</span></Link>}
                  {i === 5 && <Link className={styles.action} href="/rules">{t('함께하는 기준', 'What protects our world')} <span>↗</span></Link>}
                  {i === 6 && <Link className={styles.action} href="/join">{t('StimeMC에 합류하기', 'Join StimeMC')} <span>↗</span></Link>}
                </div>

              </section>
            ))}
          </div>
        </div>
      </div>
      <noscript><style>{`.${styles.timeline}{height:auto!important}.${styles.stage}{position:relative!important;height:auto!important}.${styles.chapter}{position:relative!important;opacity:1!important;transform:none!important;min-height:75svh}.${styles.chapters}{position:relative!important}.${styles.transport}{display:none!important}.${styles.chapterCopy}{position:relative!important;top:auto!important;bottom:auto!important;margin:24px 6%!important;width:88%!important;left:0!important}.${styles.chapter}:first-child{padding-top:60svh!important}.${styles.wordmark}{top:115px!important}.${styles.fallback}{top:180px!important;bottom:auto!important;height:350px!important}`}</style></noscript>
    </main>
  );
}
