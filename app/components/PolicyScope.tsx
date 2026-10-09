'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from './LanguageProvider';
import { servers } from '../shared/serverGroup.mjs';
import styles from '../styles/guide.module.css';

export default function PolicyScope({ kind }: { kind: 'rules' | 'recovery' }) {
  const { t } = useLanguage();
  const [scope, setScope] = useState('legacy');
  const server = servers.find(server => server.id === scope);
  return <aside className={styles.scope} aria-label={t('정책 적용 범위', 'Policy scope')}>
    <label className={styles.eyebrow} htmlFor={`policy-scope-${kind}`}>{t('정책 적용 범위', 'Policy scope')}</label>
    <select id={`policy-scope-${kind}`} value={scope} onChange={event => setScope(event.target.value)}>
      <option value="legacy">{t('기존 공개 정책', 'Existing published policy')}</option>
      {servers.map(server => <option key={server.id} value={server.id}>{server.name}</option>)}
    </select>
    <div aria-live="polite">
      {scope === 'legacy' ? <p>{t('아래는 기존 서버에 공개된 정책 원문입니다. 새로운 서버의 별도 정책은 공개 후 구분하여 안내합니다.', 'The original policies below were published for the existing server. Dedicated policies for the new servers will be identified separately when published.')}</p> : <p>
        <strong>{server?.name} · {server?.lifecycle === 'planned' ? 'PLANNED / COMING LATER' : 'CURRENT / PREPARING'}</strong><br />
        {kind === 'rules' ? t('별도 서버 규칙은 아직 공개되지 않았습니다. 아래 기존 규칙을 전쟁 또는 Survival의 확정 규칙으로 적용하지 마세요.', 'Dedicated server rules have not been published. The existing rules below are not confirmed war or Survival rules.') : t('별도 복구 정책은 아직 공개되지 않았습니다. 아래 기존 정책을 새 서버의 확정 정책으로 적용하지 마세요.', 'Dedicated recovery policies have not been published. The existing policies below are not confirmed policies for the new server.')}
      </p>}
    </div>
    {server ? <Link href={server.href}>{t('서버 준비 현황 보기 →', 'View server status →')}</Link> : null}
  </aside>;
}
