'use client';

import Link from 'next/link';
import { navigationGroups } from '../shared/siteContent.mjs';
import { brandProfile } from '../shared/serverGroup.mjs';
import { useLanguage } from './LanguageProvider';

export default function Footer() {
  const { language, t } = useLanguage();
  const labelFor = (item: { labelKo: string; labelEn: string }) =>
    language === 'ko' ? item.labelKo : item.labelEn;

  return (
    <footer className="footer" data-menu-background>
      <div className="footerInner">
        <div className="footerBrand">
          <div>
            <p className="footerTitle">StimeMC</p>
            <p className="footerText">
              {t(
                brandProfile.descriptionKo,
                brandProfile.descriptionEn,
              )}
            </p>
            <p className="footerText">{t(brandProfile.crossplayKo, brandProfile.crossplayEn)}</p>
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
          <span>{t(brandProfile.headingKo, brandProfile.headingEn)}</span>
        </div>
      </div>
    </footer>
  );
}
