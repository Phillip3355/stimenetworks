'use client';

import Link from 'next/link';
import { navigationGroups } from '../lib/siteContent.mjs';
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
            <p className="footerTitle">Stime Networks</p>
            <p className="footerText">
              {t(
                'Java와 Bedrock 플레이어가 함께 쌓아가는 평화로운 생존 서버입니다.',
                'A peaceful survival server built together by Java and Bedrock players.',
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
          <span>© 2026 Stime Networks</span>
          <span>{t('실제 서버 월드와 연결되는 디지털 아카이브', 'A digital archive connected to a living server world')}</span>
        </div>
      </div>
    </footer>
  );
}
