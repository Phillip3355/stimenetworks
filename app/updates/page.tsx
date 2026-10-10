'use client';

import GuideHeader from '../components/GuideHeader';
import DocsLayout from '../components/DocsLayout';
import { useLanguage } from '../components/LanguageProvider';
import styles from '../styles/server-mechanism.module.css';

const updateCards = [
  {
    title: '2026.05.30',
    titleEn: 'May 30, 2026',
    descriptionKo: '• 모든 페이지에서 글자와 배경을 더 편하게 읽을 수 있도록 개선\n• 어디에서든 가입, 규칙, 문의 페이지로 빠르게 이동할 수 있는 하단 메뉴 추가\n• 화면 전환과 스크롤을 더 가볍고 안정적으로 정리',
    descriptionEn: '• Improved text and background readability across every page\n• Added footer navigation for quick access to joining, rules, and support\n• Made page transitions and scrolling lighter and more stable',
  },
  {
    title: '2026.05.28',
    titleEn: 'May 28, 2026',
    descriptionKo: '• 필요한 메뉴를 스크롤 중에도 바로 열 수 있도록 내비게이션 개선\n• 작은 화면에서 버튼과 내용이 튀거나 잘리는 현상 수정\n• Java·Bedrock 접속 방법과 플레이 전 규칙을 한곳에서 확인할 수 있는 가입 가이드 추가\n• 커뮤니티 참여 방법을 더 명확하게 안내',
    descriptionEn: '• Improved navigation so key pages remain easy to reach while scrolling\n• Fixed shifting and clipped controls on smaller screens\n• Added one join guide for Java, Bedrock, and pre-play rules\n• Made community participation steps clearer',
  },
  {
    title: '2026.05.21',
    titleEn: 'May 21, 2026',
    descriptionKo: '• 업데이트 순서 버그 수정\n• 복구 가이드라인 수정\n• 홈페이지 디자인 요소 추가 ',
    descriptionEn: '• Fixed update order bug\n• Updated recovery guidelines\n• Added more design elements to the website',
  },
  {
    title: '2026.05.14',
    titleEn: 'May 14, 2026',
    descriptionKo: '• 홈페이지 버튼 디자인 변경\n• 복구 가이드라인 추가 ',
    descriptionEn: '• Homepage button design update\n• Added recovery guidelines',
  },
  {
    title: '2026.05.07',
    titleEn: 'May 7, 2026',
    descriptionKo: '• 카드 디자인 변경\n• 홈페이지 내용 추가 ',
    descriptionEn: '• Card design update\n• Added more content to the website',
  },
  {
    title: '2026.05.03',
    titleEn: 'May 3, 2026',
    descriptionKo: '• 홈페이지 디자인 변경\n• 홈페이지 내용 추가 ',
    descriptionEn: '• Homepage design update\n• Added more content to the website',
  },
];

export default function UpdatesPage() {
  const { t } = useLanguage();

  return (
    <DocsLayout toc={updateCards.map((card) => ({ id: `update-${card.title.replaceAll('.', '-')}`, labelKo: card.title, labelEn: card.titleEn }))}>
      <GuideHeader eyebrow="STIMEMC / WEBSITE UPDATES" titleKo="홈페이지 업데이트" titleEn="Website updates" descriptionKo="StimeMC 홈페이지의 변경 기록입니다. 게임 서버의 출시 일정이나 콘텐츠 업데이트를 뜻하지 않습니다." descriptionEn="A record of changes to the StimeMC website. These entries describe website changes, separate from game server releases and content updates." />

      <section className={styles.journalSection} aria-labelledby="updates-title">
        <div className={styles.journalIntro}>
          <div>
            <p className={styles.editorialLabel}>WEBSITE CHANGE LOG</p>
            <h2 id="updates-title" className={styles.editorialHeading}>{t('홈페이지 업데이트 기록', 'Website update records')}</h2>
          </div>
          <span className={styles.journalCount}>{String(updateCards.length).padStart(2, '0')} / {t('기록', 'ENTRIES')}</span>
        </div>

        <ol className={styles.journalLog}>
          {updateCards.map((card) => (
            <li data-scroll-reveal key={card.title} id={`update-${card.title.replaceAll('.', '-')}`} className={styles.journalEntry}>
              <div className={styles.journalMeta}>
                <time className={styles.journalDate} dateTime={card.title.replaceAll('.', '-')}>{card.title}</time>
              </div>
              <article className={styles.journalBody}>
                <h3>{card.titleEn}</h3>
                <ul>{t(card.descriptionKo, card.descriptionEn).split('\n').map((line) => <li key={line}>{line.replace(/^•\s*/, '').trim()}</li>)}</ul>
              </article>
            </li>
          ))}
        </ol>
      </section>
    </DocsLayout>
  );
}
