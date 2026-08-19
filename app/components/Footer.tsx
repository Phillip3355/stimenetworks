'use client';

import Link from 'next/link';
import { navigationGroups, serverProfile } from '../lib/siteContent.mjs';
import { useLanguage } from './LanguageProvider';

export default function Footer() {
  const { language, t } = useLanguage();
  const labelFor = (item: { labelKo: string; labelEn: string }) =>
    language === 'ko' ? item.labelKo : item.labelEn;

  return (
    <footer className="footer">
      <div className="footerInner">
        <div className="footerBrand">
          <div>
            <p className="footerTitle">StimeMC</p>
            <p className="footerText">
              {t(
                serverProfile.playerPromiseKo,
                serverProfile.playerPromiseEn,
              )}
            </p>
          </div>

          {navigationGroups.map((group) => (
            <div key={group.id}>
              <p className="footerTitle">{labelFor(group)}</p>
              {group.links.map((link) => (
                <Link key={link.href} className="footerLink" href={link.href}>
                  {labelFor(link)}
                </Link>
              ))}
            </div>
          ))}
        </div>

        <div className="footerBottom">
          <span>© 2026 StimeMC</span>
          <span>{t('접속 전에도 월드와 새 콘텐츠를 둘러볼 수 있는 공간', 'A place to explore the world and new content before you join')}</span>
        </div>
      </div>
    </footer>
  );
}
