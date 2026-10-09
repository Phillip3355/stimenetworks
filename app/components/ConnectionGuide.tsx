'use client';

import { useRef, useState } from 'react';
import { useLanguage } from './LanguageProvider';
import { getConnectionPresentation, getServerPresentation, getServerGroupPresentation, servers } from '../shared/serverGroup.mjs';
import { copyConnectionValue } from '../shared/guideInteractions.mjs';
import styles from '../styles/guide.module.css';

type Edition = 'Java' | 'Bedrock';
type Feedback = { state: string; value: string | null };

function CopyValue({ presentation, field }: { presentation: ReturnType<typeof getConnectionPresentation>; field: 'address' | 'port' }) {
  const { t } = useLanguage();
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const label = field === 'address' ? t('서버 주소', 'Server address') : t('포트', 'Port');
  if (!presentation.canCopy || presentation[field] == null) return null;
  return <div className={styles.copyValue}>
    <span>{label}</span><code>{presentation[field]}</code>
    <button type="button" onClick={async () => setFeedback(await copyConnectionValue(presentation, field, navigator.clipboard))}>{t(`${label} 복사`, `Copy ${label.toLowerCase()}`)}</button>
    <div role="status">{feedback?.state === 'copied' ? t(`${label}를 복사했습니다.`, `${label} copied.`) : feedback?.state === 'manual' ? <label>{t('자동 복사를 사용할 수 없습니다. 아래 값을 선택하여 직접 복사하세요.', 'Automatic copy is unavailable. Select the value below and copy it manually.')}<input aria-label={t(`${label} 직접 복사`, `Manually copy ${label.toLowerCase()}`)} readOnly value={feedback.value ?? ''} onFocus={event => event.currentTarget.select()} /></label> : null}</div>
  </div>;
}

export default function ConnectionGuide() {
  const { t } = useLanguage();
  const [edition, setEdition] = useState<Edition>('Java');
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const group = getServerGroupPresentation();
  return <section className={styles.container}>
    <div className={styles.sectionIntro}><p className={styles.eyebrow}>01 / SERVER STATUS</p><h2>{t(group.hasActive ? '먼저 서버 현황을 확인하세요' : '먼저 서버 준비 현황을 확인하세요', 'Start with server status')}</h2><p>{t('Java × Bedrock · Geyser는 모든 StimeMC 서버가 공유하는 접속 방향입니다.', 'Java × Bedrock · Geyser is the shared connection direction across StimeMC servers.')}</p></div>
    <div className={styles.tabs} role="tablist" aria-label={t('Minecraft 에디션', 'Minecraft edition')}>
      {(['Java', 'Bedrock'] as Edition[]).map((value, index) => <button key={value} ref={element => { tabs.current[index] = element; }} id={`edition-${value}`} type="button" role="tab" aria-selected={edition === value} aria-controls="edition-panel" tabIndex={edition === value ? 0 : -1} onClick={() => setEdition(value)} onKeyDown={event => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? 1 : 1 - index;
        setEdition(next === 0 ? 'Java' : 'Bedrock'); tabs.current[next]?.focus();
      }}>{value} Edition</button>)}
    </div>
    <div id="edition-panel" role="tabpanel" aria-labelledby={`edition-${edition}`} tabIndex={0} className={styles.serverGrid}>
      {servers.map(server => {
        const presentation = getConnectionPresentation(server, edition);
        return <article className={styles.serverPanel} key={server.id}>
          <p className={styles.eyebrow}>{getServerPresentation(server).label}</p><h3>{server.name}</h3><p>{t(server.descriptionKo, server.descriptionEn)}</p>
          {presentation.canCopy ? <div key={`${server.id}-${edition}`}><CopyValue presentation={presentation} field="address" /><CopyValue presentation={presentation} field="port" /></div> : <p className={styles.notice}>{presentation.state === 'planned' ? t('추가 계획 중 · 출시 일정과 버전 미정. 접속 정보는 아직 공개되지 않았습니다.', 'Planned for later · Release date and version undecided. Connection details have not been published.') : presentation.state === 'preparing' ? t('운영 준비 중 · 접속 주소와 버전은 아직 공개되지 않았습니다.', 'Preparing to operate · The address and version have not been published.') : t('이 에디션의 접속 정보는 아직 공개되지 않았습니다.', 'Connection details for this edition have not been published.')}</p>}
        </article>;
      })}
    </div>
  </section>;
}
