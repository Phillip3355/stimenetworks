'use client';

import Link from 'next/link';
import { useLanguage } from './LanguageProvider';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="footer">
      <div className="footerInner">
        <div>
          <p className="footerTitle">{t('Stime Networks', 'Stime Networks')}</p>
          <p className="footerText">{t('엔지니어링 방식으로 구성된 Minecraft 서버 경험.', 'An engineering-led Minecraft server experience.')}</p>
        </div>
        <div>
          <p className="footerTitle">{t('탐색', 'Explore')}</p>
          <Link className="footerLink" href="/">{t('홈', 'Home')}</Link>
          <Link className="footerLink" href="/server-mechanism">{t('서버 메커니즘', 'Server Mechanism')}</Link>
          <Link className="footerLink" href="/rules">{t('규칙 보기', 'Rules')}</Link>
          <Link className="footerLink" href="/recovery-guidelines">{t('복구 가이드라인', 'Recovery Guidelines')}</Link>
          <Link className="footerLink" href="/updates">{t('업데이트 보기', 'Updates')}</Link>
        </div>
        <div>
          <p className="footerTitle">{t('지원', 'Support')}</p>
          <a className="footerLink" href="mailto:stimemc@example.com">{t('문의', 'Contact')}</a>
        </div>
        <div>
          <p className="footerTitle">{t('법적', 'Legal')}</p>
          <p className="footerText">{t('© 2026 Stime Networks. All rights reserved.', '© 2026 Stime Networks. All rights reserved.')}</p>
        </div>
      </div>
    </footer>
  );
}
