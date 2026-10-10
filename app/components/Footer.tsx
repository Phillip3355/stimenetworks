'use client';
import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import { navigationGroups } from '../shared/siteContent.mjs';
import { brandProfile } from '../shared/serverGroup.mjs';
import { useLanguage } from './LanguageProvider';
import AnimatedDisclosure from './AnimatedDisclosure';

const subscribe = (callback: () => void) => {
  const media = window.matchMedia('(min-width: 768px)');
  media.addEventListener('change', callback);
  return () => media.removeEventListener('change', callback);
};
const desktopSnapshot = () => window.matchMedia('(min-width: 768px)').matches;
const serverSnapshot = () => true;

export default function Footer() {
  const { language, t } = useLanguage();
  const desktop = useSyncExternalStore(subscribe, desktopSnapshot, serverSnapshot);
  const labelFor = (item: { labelKo: string; labelEn: string }) => language === 'ko' ? item.labelKo : item.labelEn;
  return <footer className="footer" data-menu-background>
    <div className="footerInner">
      <div className="footerBrand">
        <div className="footerIdentity">
          <p className="footerTitle">StimeMC<span style={{ color: 'var(--color-brand-green-deep)' }}>.</span></p>
          <p className="footerText">{t(brandProfile.descriptionKo,brandProfile.descriptionEn)}</p>
          <p className="footerText">{t(brandProfile.crossplayKo,brandProfile.crossplayEn)}</p>
        </div>
        {navigationGroups.map(group => {
          const links = <nav aria-label={labelFor(group)}>{group.links.map(link => <Link key={link.href} href={link.href} className="footerLink">{labelFor(link)}</Link>)}</nav>;
          return desktop
            ? <div key={group.id} className="footerGroup"><h2 className="footerTitle">{labelFor(group)}</h2>{links}</div>
            : <AnimatedDisclosure key={group.id} className="footerGroup" summary={<>{labelFor(group)}<span aria-hidden="true">⌄</span></>}>{links}</AnimatedDisclosure>;
        })}
      </div>
      <div className="footerBottom"><span>© 2026 StimeMC</span><span>{t(brandProfile.headingKo,brandProfile.headingEn)}</span></div>
    </div>
  </footer>;
}
