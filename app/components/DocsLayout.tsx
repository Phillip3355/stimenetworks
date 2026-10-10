'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from './LanguageProvider';
import AnimatedDisclosure from './AnimatedDisclosure';
import styles from '../styles/docs-layout.module.css';

const destinations = [
  { href: '/join', ko: '접속 안내', en: 'Connection guide', group: 'GUIDE' },
  { href: '/rules', ko: '서버 규칙', en: 'Rules', group: 'GUIDE' },
  { href: '/recovery-guidelines', ko: '복구 가이드', en: 'Recovery', group: 'GUIDE' },
  { href: '/support', ko: '1:1 문의', en: 'Support', group: 'GUIDE' },
  { href: '/servers', ko: '서버 살펴보기', en: 'Our servers', group: 'STIMEMC' },
  { href: '/news', ko: 'StimeMC 소식', en: 'News', group: 'STIMEMC' },
  { href: '/updates', ko: '홈페이지 업데이트', en: 'Website updates', group: 'STIMEMC' },
  { href: '/server-mechanism', ko: '서버 메커니즘', en: 'Technology', group: 'STIMEMC' },
  { href: '/history', ko: '서버의 역사', en: 'History', group: 'STIMEMC' },
];
export type TocItem = { id: string; labelKo: string; labelEn: string };

export default function DocsLayout({ children, toc = [] }: { children: ReactNode; toc?: TocItem[] }) {
  const { t } = useLanguage();
  const pathname = usePathname();
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState('');
  const matches = destinations.filter(item => `${item.ko} ${item.en}`.toLowerCase().includes(query.toLowerCase()));
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) setActiveId(entry.target.id);
    }, { rootMargin: '-80px 0px -55% 0px' });
    toc.forEach(item => { const element = document.getElementById(item.id); if (element) observer.observe(element); });
    return () => observer.disconnect();
  }, [toc]);

  const routeLinks = (filter = false) => <>
    {['GUIDE', 'STIMEMC'].map(group => <div key={group} className={styles.navGroup}>
      <p>{group === 'GUIDE' ? t('플레이 가이드', 'PLAY GUIDE') : 'STIMEMC'}</p>
      {(filter ? matches : destinations).filter(item => item.group === group).map(item => <Link key={item.href} href={item.href} className={pathname === item.href ? styles.active : undefined} aria-current={pathname === item.href ? 'page' : undefined}>{t(item.ko, item.en)}</Link>)}
    </div>)}
    {filter && !matches.length && <p className={styles.noMatch} role="status">{t('일치하는 페이지가 없습니다.', 'No matching pages.')}</p>}
  </>;

  return <main className={styles.layout}>
    <aside className={styles.sidebar} aria-label={t('페이지 안내', 'Guide navigation')}>
      <label className={styles.search}><span aria-hidden="true">⌕</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={t('페이지 찾기', 'Find a page')} aria-label={t('안내 페이지 찾기', 'Find a guide page')} /></label>
      <nav>{routeLinks(true)}</nav>
      <Link href="/servers" className={styles.sidebarNote}><span>JAVA × BEDROCK</span><strong>{t('여러 세계, 하나의 Stime.', 'Many worlds, one Stime.')}</strong><span>{t('서버 그룹 살펴보기', 'Explore the server group')} ↗</span></Link>
    </aside>
    <div className={styles.content}>
      <AnimatedDisclosure className={styles.mobileNav} summary={<>{t('안내 페이지', 'Guide navigation')} <span aria-hidden="true">⌄</span></>}><nav>{routeLinks()}</nav></AnimatedDisclosure>
      {toc.length > 0 && <AnimatedDisclosure className={styles.mobileToc} summary={<>{t('이 페이지에서', 'On this page')} <span aria-hidden="true">⌄</span></>}><nav>{toc.map(item => <a key={item.id} href={`#${item.id}`}>{t(item.labelKo, item.labelEn)}</a>)}</nav></AnimatedDisclosure>}
      {children}
    </div>
    <aside className={styles.toc} aria-label={t('페이지 목차', 'Table of contents')}>
      {toc.length > 0 && <><p>{t('이 페이지에서', 'On this page')}</p><nav>{toc.map(item => <a key={item.id} href={`#${item.id}`} className={activeId === item.id ? styles.tocActive : undefined}>{t(item.labelKo, item.labelEn)}</a>)}</nav></>}
    </aside>
  </main>;
}
