'use client';
import Link from 'next/link';
import { useLanguage } from './components/LanguageProvider';

export default function NotFound() {
  const { t } = useLanguage();
  return <main style={{ minHeight: '65svh', padding: 'calc(var(--nav-height) + 80px) 24px 80px', textAlign: 'center' }}><p className="eyebrow">STIMEMC / 404</p><h1 className="sectionHeading">{t('페이지를 찾을 수 없습니다.', 'This page could not be found.')}</h1><div className="homeActionRow" style={{ justifyContent: 'center', marginTop: 32 }}><Link href="/" className="homeActionPrimary">{t('홈으로 이동', 'Back to home')} →</Link><Link href="/news" className="homeActionSecondary">{t('StimeMC 소식', 'StimeMC news')} →</Link></div></main>;
}
