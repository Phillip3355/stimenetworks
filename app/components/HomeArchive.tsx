'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from './LanguageProvider';
import styles from '../styles/home-sections.module.css';

const images = [
  { src: '/image.png', ko: '여러 건축물이 보이는 항공 전경', en: 'An aerial view of player-built structures' },
  { src: '/image copy.png', ko: '여러 지형과 건축 구역이 이어진 항공 전경', en: 'Connected biomes and building districts from above' },
  { src: '/image copy 8.png', ko: '숲 위 청록색 지붕의 목조 건축물', en: 'Timber buildings with teal roofs above the forest' },
  { src: '/image copy 9.png', ko: '부유섬 사이에서 빛나는 공중 구조물', en: 'A luminous structure among floating islands' },
  { src: '/image copy 5.png', ko: '밤하늘 아래 빛나는 건축물과 연결 구조', en: 'Illuminated structures beneath the night sky' },
  { src: '/image copy 4.png', ko: '노을 아래 이어진 건축물과 농장', en: 'Player builds and farms at sunset' },
  { src: '/image copy 10.png', ko: '마을과 농장이 이어지는 풍경', en: 'A landscape of villages and farms' },
];

export default function HomeArchive() {
  const { t } = useLanguage();
  return (
    <section className={styles.section} aria-labelledby="archive-title">
      <div className={styles.container}>
        <header data-scroll-reveal className={styles.header}>
          <p className={styles.eyebrow}>STIMEMC ARCHIVE</p>
          <h2 id="archive-title">{t('함께 쌓아온 장면들.', 'Scenes we built together.')}</h2>
          <p>{t('기존 StimeMC 서버의 실제 기록입니다. The Great War와 Survival의 화면이 아닙니다.', 'Real records from previous StimeMC servers. These are not screenshots of The Great War or Survival.')}</p>
        </header>
        <div className={styles.archiveGrid}>
          {images.map((image, index) => (
            <figure data-scroll-reveal key={image.src} className={index === 0 ? styles.archiveLead : ''}>
              <div className={styles.archiveImage}>
                <Image src={image.src} alt={t(`기존 StimeMC 서버 기록: ${image.ko}`, `StimeMC archive: ${image.en}`)} fill sizes={index === 0 ? '(max-width: 760px) calc(100vw - 40px), (max-width: 1100px) calc(100vw - 40px), (max-width: 1440px) 48vw, 690px' : '(max-width: 600px) calc(100vw - 40px), (max-width: 1100px) 46vw, (max-width: 1440px) 23vw, 335px'} />
              </div>
              <figcaption><span>ARCHIVE / 0{index + 1}</span><span>{t('기존 서버 기록', 'Previous server record')}</span></figcaption>
            </figure>
          ))}
        </div>
        <Link href="/history" className={styles.textLink}>{t('StimeMC의 역사', 'The story of StimeMC')} <span aria-hidden="true">↗</span></Link>
      </div>
    </section>
  );
}
