'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '../LanguageProvider';
import { clamp } from './timeline.mjs';
import type { Quality, SceneController } from './scene';
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
  const [motionEnabled, setMotionEnabled] = useState(true);
  const [active, setActive] = useState(0);
  const [quality, setQuality] = useState<Quality>('auto');
  const qualityRef = useRef<Quality>('auto');
  const [attempt, setAttempt] = useState(0);
  const [staticReason, setStaticReason] = useState('');

  useEffect(() => {
    let canceled = false;
    let generation = 0;
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const stop = (reason = 'webgl') => { generation++; controller.current?.dispose(); controller.current = null; setStaticReason(reason); setMode('static'); };
    const start = async () => {
      const ticket = ++generation;
      if (media.matches || !motionEnabled) { stop(media.matches ? 'reduced' : 'manual'); return; }
      try {
        const { createScene } = await import('./scene');
        if (canceled || ticket !== generation || media.matches || !motionEnabled || !hostRef.current) return;
        controller.current = createScene(hostRef.current, () => stop());
        controller.current.setQuality(qualityRef.current);
        controller.current.setProgress(progressRef.current);
        setMode('cinematic');
      } catch { if (!canceled && ticket === generation) stop(); }
    };
    const change = () => { stop(media.matches ? 'reduced' : 'manual'); if (!media.matches && motionEnabled) void start(); };
    void start();
    media.addEventListener('change', change);
    return () => { canceled = true; generation++; media.removeEventListener('change', change); controller.current?.dispose(); controller.current = null; };
  }, [motionEnabled, attempt]);

  useEffect(() => {
    if (mode !== 'cinematic') return;
    let raf = 0, lastActive = -1;
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
      const nextActive = Math.min(6, Math.round(progress * 6));
      if (nextActive !== lastActive) { lastActive = nextActive; setActive(nextActive); }
      rootRef.current.querySelectorAll<HTMLElement>('[data-chapter]').forEach((element, i) => {
        const distance = Math.abs(progress * 6 - i);
        element.style.setProperty('--chapter-opacity', String(clamp((.66 - distance) / .28)));
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
          <div className={styles.wordmark} aria-hidden="true">STIME<span>MC</span></div>
          <div className={styles.fallback}><WorldFallback /></div>
          <div ref={hostRef} className={styles.scene} aria-hidden="true" />
          <div className={styles.topline} aria-hidden="true"><span><i /> A WORLD WITH MORE UNDERNEATH</span><span>JAVA + BEDROCK / STIMEMC</span></div>
          <div className={styles.quickControls}>
            {mode === 'cinematic' && <label><span className={styles.srOnly}>{t('3D 화질', '3D quality')}</span><select aria-label={t('3D 화질', '3D quality')} value={quality} onChange={event => { const value = event.target.value as Quality; qualityRef.current = value; setQuality(value); controller.current?.setQuality(value); }}><option value="auto">AUTO</option><option value="low">LOW</option><option value="balanced">BALANCED</option><option value="high">HIGH</option></select></label>}
            {staticReason === 'reduced' && mode === 'static' ? <span>{t('모션 줄이기 적용됨', 'REDUCED MOTION')}</span> : <button onClick={() => { setMotionEnabled(mode !== 'cinematic'); if (mode !== 'cinematic') setAttempt(value => value + 1); window.scrollTo({ top: 0, behavior: 'instant' }); }} aria-pressed={mode === 'cinematic'}>{mode === 'cinematic' ? t('모션 끄기', 'MOTION OFF') : t('3D 켜기', 'ENABLE 3D')} <span>{mode === 'cinematic' ? '◉' : '○'}</span></button>}
          </div>
          <div className={styles.sceneCaption} aria-hidden="true"><span>WORLD / 01</span><span>THE SURFACE IS ONLY THE BEGINNING.</span></div>
          <div className={styles.chapters}>
            {chapters.map((chapter, i) => (
              <section key={chapter.id} id={chapter.id} data-chapter={i} className={`${styles.chapter} ${i === 0 ? styles.intro : ''}`} aria-labelledby={`${chapter.id}-title`} aria-hidden={mode === 'cinematic' && active !== i ? true : undefined} inert={mode === 'cinematic' && active !== i}>
                <div className={styles.chapterCopy}>
                  <p className={styles.eyebrow}><span>{chapter.eyebrow}</span></p>
                  <h2 id={`${chapter.id}-title`} className={styles.title}>{chapter.title.map(line => <span key={line}>{line}</span>)}</h2>
                  <p className={styles.statement}>{t(chapter.ko, chapter.en)}</p>
                  <p className={styles.detail}>{t(chapter.detailKo, chapter.detailEn)}</p>
                  {i === 0 && <a className={styles.enter} href="#enter" onClick={event => { if (mode === 'cinematic') { event.preventDefault(); goToChapter(1); } }}>{t('세계 안으로', 'Enter the world')} <span>↘</span></a>}
                  {(i === 2 || i === 3 || i === 4) && <Link className={styles.textLink} href="/server-mechanism">{t('연결의 구조 알아보기', 'Explore the technology')} <span>↗</span></Link>}
                  {i === 5 && <Link className={styles.textLink} href="/rules">{t('함께하는 기준', 'What protects our world')} <span>↗</span></Link>}
                  {i === 6 && <Link className={styles.joinAction} href="/join">{t('StimeMC에 합류하기', 'Join StimeMC')} <span>↗</span></Link>}
                </div>
                {i === 2 && <div className={styles.editionLabels} aria-hidden="true"><span>JAVA <b>01</b></span><i>ONE WORLD</i><span>BEDROCK <b>02</b></span></div>}
                {i === 3 && <div className={styles.systemLabels} aria-hidden="true"><span>GEYSER <small>TRANSLATE</small></span><span>VIAPROXY <small>CONNECT</small></span><span>JAVA SERVER <small>CREATE</small></span></div>}
                {i === 4 && <div className={styles.noMods} aria-hidden="true"><span>SERVER-SIDE</span><strong>100<span>%</span></strong><span>CLIENT MODS REQUIRED <b>0</b></span></div>}
                {i === 5 && <figure className={styles.worldImage}>
                  <Image src="/image copy 8.png" alt={t('StimeMC 실제 월드의 숲 위 목조 건축물', 'Timber builds above the forest in the actual StimeMC world')} fill sizes="(max-width: 759px) 88vw, 48vw" />
                  <figcaption><span>INSIDE STIMEMC</span><span>{t('실제 서버 월드', 'ACTUAL SERVER WORLD')} ↗</span></figcaption>
                </figure>}
              </section>
            ))}
          </div>
          <nav className={styles.chapterNav} aria-label={t('월드 여정', 'World journey')}>
            {chapters.map((chapter, i) => <button key={chapter.id} onClick={() => goToChapter(i)} aria-label={`${i + 1}. ${chapter.label}`} aria-current={active === i ? 'step' : undefined}><span>{chapter.label}</span><i /><b>{String(i).padStart(2, '0')}</b></button>)}
          </nav>
          <div className={styles.transport}>
            <button className={styles.scrollCue} onClick={() => goToChapter(Math.min(6, active + 1))}><span>↓</span> {t('스크롤하여 탐험하기', 'SCROLL TO EXPLORE')}</button>
            <span className={styles.transportIndex}>{String(active).padStart(2, '0')} <i>/</i> 06</span>
            <Link href="/join" className={styles.persistentJoin}>JOIN STIME <span>↗</span></Link>
            <div className={styles.progress} aria-hidden="true"><span /></div>
          </div>
        </div>
      </div>
      <div className={styles.experienceControls}>
        <span>STIMEMC / {t('당신의 기기에 맞춘 경험', 'AN EXPERIENCE AT YOUR PACE')}</span>
        <span>JAVA × BEDROCK · {t('하나의 세계', 'ONE WORLD')}</span>
      </div>
      <noscript><style>{`.${styles.timeline}{height:auto!important}.${styles.stage}{position:relative!important;height:auto!important}.${styles.chapter}{position:relative!important;opacity:1!important;transform:none!important;min-height:90svh}.${styles.chapters}{position:relative!important}.${styles.chapterNav},.${styles.transport},.${styles.quickControls}{display:none!important}.${styles.wordmark}{top:145px!important}.${styles.fallback}{top:200px!important;bottom:auto!important;height:450px!important}@media(max-width:759px){.${styles.fallback}{top:225px!important;height:300px!important}}`}</style></noscript>
    </main>
  );
}
