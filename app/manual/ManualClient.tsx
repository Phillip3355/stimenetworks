'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import styles from '../styles/manual.module.css';
import { copyText, hasPlaceholder, joinCommands, resolveCommand, splitPlaceholders } from '../shared/manualCommands.mjs';
import {
  backupNotes, coreLevels, coreRules, refAdmin, refAdminNote, refPlayers, refPlayersNote, refVanilla, refWar,
  step2Cmds, step3Cmds, step4Cmds, step4Verify, step5Cmds, step5Core, step6Cmds, step7Normal, step7Test,
  toc, troubles, type Cmd, type CmdGroup,
} from './manualData';

type Names = Record<'PlayerA' | 'PlayerB' | 'PlayerC', string>;
type CopyState = 'idle' | 'ok' | 'fail';

function CopyButton({ text, label, onFail, children }: { text: string; label: string; onFail?: () => void; children?: ReactNode }) {
  const [state, setState] = useState<CopyState>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const run = async () => {
    const ok = await copyText(text);
    setState(ok ? 'ok' : 'fail');
    if (!ok) onFail?.();
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState('idle'), ok ? 1600 : 6000);
  };
  return <span className={styles.copyWrap}>
    <button type="button" className={`${styles.copyButton} ${state === 'ok' ? styles.copyOk : ''} ${state === 'fail' ? styles.copyFail : ''}`} onClick={run} aria-label={label}>{children ?? '복사'}</button>
    <span className={styles.copyStatus} role="status" aria-live="polite">
      {state === 'ok' && '복사됨'}
      {state === 'fail' && '복사 실패 · 직접 선택해 복사하세요'}
    </span>
  </span>;
}

function CommandText({ text }: { text: string }) {
  return <>{splitPlaceholders(text).map((part: { text: string; placeholder: boolean }, index: number) => part.placeholder ? <mark key={index} className={styles.placeholder}>{part.text}</mark> : <span key={index}>{part.text}</span>)}</>;
}

function CmdRow({ item, names }: { item: Cmd; names: Names }) {
  const command = resolveCommand(item.cmd, names);
  const template = hasPlaceholder(command);
  const codeRef = useRef<HTMLElement>(null);
  const selectCode = () => {
    const node = codeRef.current;
    const selection = window.getSelection();
    if (!node || !selection) return;
    const range = document.createRange();
    range.selectNodeContents(node);
    selection.removeAllRanges();
    selection.addRange(range);
  };
  return <li className={`${styles.cmdRow} ${item.danger ? styles.danger : ''}`}>
    <div className={styles.cmdMeta}>
      <span className={`${styles.badge} ${styles.roleBadge}`}>{item.role}</span>
      <span className={`${styles.badge} ${template ? styles.templateBadge : styles.exampleBadge}`}>{template ? '템플릿' : '실행 가능'}</span>
      <span className={styles.cmdDesc}>{item.desc}</span>
    </div>
    <div className={styles.cmdLine}>
      <code ref={codeRef} className={styles.code}><CommandText text={command} /></code>
      <CopyButton text={command} label={`명령어 복사: ${command}`} onFail={selectCode} />
    </div>
    {item.danger && <p className={styles.dangerResult}>{item.danger}</p>}
  </li>;
}

function CmdList({ cmds, names, copyAll = true, allLabel = '이 단계 명령어 모두 복사' }: { cmds: Cmd[]; names: Names; copyAll?: boolean; allLabel?: string }) {
  const [manual, setManual] = useState(false);
  const joined = joinCommands(cmds.map(c => resolveCommand(c.cmd, names)));
  const areaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { if (manual) areaRef.current?.select(); }, [manual]);
  return <div className={styles.cmdBlock}>
    <ul className={styles.cmdList}>{cmds.map(c => <CmdRow key={c.cmd + c.desc} item={c} names={names} />)}</ul>
    {copyAll && cmds.length > 1 && <div className={styles.copyAll}>
      <CopyButton text={joined} label={allLabel} onFail={() => setManual(true)}>{allLabel}</CopyButton>
      <p>여러 줄 복사는 메모용입니다. Minecraft 채팅에서는 명령을 한 줄씩 실행하세요.</p>
    </div>}
    {manual && <textarea ref={areaRef} className={styles.manualArea} readOnly value={joined} rows={Math.min(cmds.length + 1, 10)} aria-label="직접 복사용 명령어" onFocus={event => event.currentTarget.select()} />}
  </div>;
}

function Step({ id, n, title, goal, children, verify }: { id: string; n: number; title: string; goal: string; children: ReactNode; verify: string }) {
  return <section id={id} className={styles.step} aria-labelledby={`${id}-title`}>
    <div className={styles.stepHead}><span className={styles.stepNo}>{n}</span><div><h2 id={`${id}-title`}>{title}</h2><p className={styles.goal}>{goal}</p></div></div>
    <div className={styles.stepBody}>{children}</div>
    <p className={styles.verify}><strong>완료 확인</strong> {verify}</p>
  </section>;
}

function Fold({ id, title, hint, children }: { id: string; title: string; hint: string; children: ReactNode }) {
  return <details id={id} className={styles.fold}>
    <summary><span><strong>{title}</strong><small>{hint}</small></span><span className={styles.chev} aria-hidden="true">⌄</span></summary>
    <div className={styles.foldBody}>{children}</div>
  </details>;
}

function Groups({ groups, names }: { groups: CmdGroup[]; names: Names }) {
  return <>{groups.map(g => <div key={g.title} className={styles.group}>
    <h4>{g.title}</h4>{g.note && <p className={styles.note}>{g.note}</p>}
    <CmdList cmds={g.cmds} names={names} copyAll={false} />
  </div>)}</>;
}

export default function ManualClient() {
  const [names, setNames] = useState<Names>({ PlayerA: '', PlayerB: '', PlayerC: '' });
  const setName = (key: keyof Names, value: string) => setNames(prev => ({ ...prev, [key]: value.replace(/[\u0000-\u001f\u007f]/g, '') }));

  const openFromHash = useCallback(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;
    const el = document.getElementById(id);
    if (el instanceof HTMLDetailsElement) {
      el.open = true;
      requestAnimationFrame(() => el.scrollIntoView());
    }
  }, []);
  useEffect(() => {
    openFromHash();
    window.addEventListener('hashchange', openFromHash);
    return () => window.removeEventListener('hashchange', openFromHash);
  }, [openFromHash]);

  const nameInputs = <div className={styles.names}>
    <p>예시 이름을 실제 플레이어 이름으로 바꿀 수 있습니다. 비워 두면 <mark className={styles.placeholder}>&lt;PlayerA&gt;</mark>처럼 템플릿으로 남습니다.</p>
    <div className={styles.nameGrid}>
      {(['PlayerA', 'PlayerB', 'PlayerC'] as const).map(key => <label key={key}>{key}
        <input value={names[key]} onChange={event => setName(key, event.target.value)} placeholder={key} maxLength={64} autoComplete="off" spellCheck={false} />
      </label>)}
    </div>
  </div>;

  return <main className={styles.page}>
    <header className={styles.hero}>
      <p className={styles.eyebrow}>STIMEMC / MANUAL</p>
      <h1>Stime Seasonal War 셋업 매뉴얼</h1>
      <p className={styles.lead}>관리자·셋업 담당자를 위한 설치, 국가 설정, 초기 배정, 전쟁 운영 안내</p>
      <ul className={styles.facts} aria-label="환경 정보">
        {['Minecraft 26.3', 'Fabric', 'Java 25', '서버 전용', '월드 4000×4000', '국가 1000×1000'].map(f => <li key={f}>{f}</li>)}
      </ul>
      <p className={styles.small}>이 모드는 기존 길드·경제 모드와 별개입니다. 이 페이지의 복사 버튼은 클립보드에 복사만 하며, 서버에서 명령을 실행하지 않습니다. Minecraft 채팅에서는 명령을 한 줄씩 실행하세요.</p>
      <nav className={styles.toc} aria-label="매뉴얼 목차">
        {toc.map(item => <a key={item.id} href={`#${item.id}`}>{item.label}</a>)}
      </nav>
    </header>

    <Step id="step-1" n={1} title="서버 설치·첫 실행" goal="모드를 올리고 서버를 한 번 켜서 설정·상태 파일을 만든다." verify="서버가 정상 시작되고 /war status 가 실행된다.">
      <ul className={styles.bullets}>
        <li>Minecraft <b>26.3</b>, Java <b>25</b>, Fabric Loader <b>0.19.5</b>, Fabric API <b>0.162.0+26.3</b>을 준비한다.</li>
        <li>서버 <code>mods/</code>에 Fabric API와 <code>stime-seasonal-war-1.0.0.jar</code>를 넣는다. <code>-sources.jar</code>는 설치 파일이 아니다.</li>
        <li>플레이어는 클라이언트 설치가 필요 없다. Bedrock은 별도 Geyser/Floodgate 구성을 쓰며, 26.3 지원 여부는 담당자가 확인한다.</li>
        <li>국가 기본 등록 수는 <b>0개</b>다. 다음 단계에서 만든다.</li>
      </ul>
      <div className={styles.refBox}><p>파일 위치</p><pre>{`서버 모드: mods/stime-seasonal-war-1.0.0.jar
설정: config/stime-seasonal-war.json
시즌 상태: <world>/data/stime-seasonal-war/state.json`}</pre></div>
      <CmdList names={names} cmds={[{ cmd: '/war status', desc: '서버 시작 후 실행 가능한지 확인', role: '일반 플레이어' }]} />
    </Step>

    <Step id="step-2" n={2} title="월드·영토·스폰 준비" goal="월드는 4000×4000, 국가 영토는 1000×1000으로 나누고 지형을 준비한다." verify="국가별 좌표표가 있고, 국가 스폰·중립 스폰·Core 자리의 지형이 준비되었다.">
      <ul className={styles.bullets}>
        <li>월드 경계는 중심 <code>0 0</code>, 크기 <code>4000</code> → X/Z <b>-2000 ~ 1999</b>. 국가 영토는 각각 <b>1000×1000</b> 블록이며 서로 겹치지 않는다.</li>
        <li>지형·안전구역 건물은 관리자가 직접 만든다. 이 모드는 월드나 기지를 자동 건설하지 않는다.</li>
        <li>안전구역은 <b>16×16 청크 하나 + 지정 Y 범위</b>만 보호한다(Y 양끝 포함, 최소 3칸). 바닥과 서 있을 빈 공간이 필요하다.</li>
        <li>청크 좌표 = <code>floor(블록 좌표 / 16)</code>. 음수는 내림이다. 예: 블록 X <code>-1</code> → 청크 <code>-1</code>.</li>
        <li>Core는 영토 중앙 근처, 안전구역 밖에 자동 배치된다. 단단한 3×3 바닥, 빈 3×3×3 공간, 열린 하늘이 필요하다.</li>
        <li><b>중립 스폰은 모든 국가 영토 밖</b>에 둔다. <code>setworldspawn</code>(바닐라)과 <code>neutralspawn</code>(이벤트 무소속)은 별개다.</li>
      </ul>
      <h3 className={styles.sub}>3개국 예시 배치 (모서리 3곳, 남동쪽은 비워 둠)</h3>
      <p className={styles.warn}>예시 좌표입니다. 실제 지형에 맞게 바꾸되, 각 영토가 1000×1000인지와 중립 스폰이 영토 밖인지 확인하세요.</p>
      <div className={styles.tableWrap}><table className={styles.table}>
        <thead><tr><th>ID</th><th>영토 X</th><th>영토 Z</th><th>안전 청크</th><th>보호 Y</th></tr></thead>
        <tbody>{[['a (북서)', '-2000 ~ -1001', '-2000 ~ -1001', '-113, -113', '64~70'], ['b (북동)', '1000 ~ 1999', '-2000 ~ -1001', '112, -113', '64~70'], ['c (남서)', '-2000 ~ -1001', '1000 ~ 1999', '-113, 112', '64~70'], ['중립 스폰', '0', '0', '-', '(0, 65, 0)']].map(r => <tr key={r[0]}>{r.map((c, i) => <td key={i}>{c}</td>)}</tr>)}</tbody>
      </table></div>
      <CmdList names={names} cmds={step2Cmds} />
    </Step>

    <Step id="step-3" n={3} title="국가 생성" goal="준비한 좌표로 국가를 만들고 Core 배치를 확인한다." verify="모든 국가가 ACTIVE이고 진단에 Core·스폰 오류가 없다. 같은 ID로 다시 만들어도 초기화되지 않는다.">
      <ul className={styles.bullets}>
        <li>인자 순서: <code>id 이름 minX maxX minZ maxZ chunkX chunkZ minY maxY</code>. 영토는 <b>블록 좌표</b>, 안전구역은 <b>청크 좌표</b>이며 min/max 양끝 포함이다.</li>
        <li>ID는 영문 소문자·숫자·<code>_</code>·<code>-</code> 1~32자. 공백이 있는 이름은 따옴표로 감싼다.</li>
        <li><code>Core 생성 대기</code>가 나오면 지면·하늘·공간을 정리한 뒤 <code>/seasonadmin respawncore &lt;id&gt;</code> 후 진단한다.</li>
      </ul>
      <CmdList names={names} cmds={step3Cmds} />
    </Step>

    <Step id="step-4" n={4} title="초기 플레이어 배정" goal="관리자가 첫 인원을 국가에 나눈다." verify="/seasonadmin player, /seasonadmin nation 으로 배정과 인원을 확인했다.">
      {nameInputs}
      <ul className={styles.bullets}>
        <li><code>assign</code>은 인원 균형을 무시한다. 이후 일반 가입(<code>/nation join &lt;id&gt;</code>)은 국가 간 인원 차이가 <b>1 이하</b>일 때만 가능하므로, 처음부터 0~1 차이로 맞춘다.</li>
        <li>이미 소속된 플레이어는 국가를 바꿀 수 없고, WAR 중 일반 가입은 금지다.</li>
        <li>대상은 서버에 표시되는 이름 또는 전체 UUID(오프라인은 UUID).</li>
      </ul>
      <CmdList names={names} cmds={step4Cmds} />
      <h3 className={styles.sub}>확인</h3>
      <CmdList names={names} cmds={step4Verify} copyAll={false} />
    </Step>

    <Step id="step-5" n={5} title="국가장 지정" goal="각 국가 구성원 한 명을 국가장으로 지정한다." verify="/nation members 에 국가장이 맞게 표시되고 /nation core status 가 나온다.">
      {nameInputs}
      <ul className={styles.bullets}>
        <li>해당 국가 구성원만 지정할 수 있고, 자동 선출은 없다. 공석이면 관리자가 지정한다.</li>
        <li>Core 이전·강화는 <b>국가장 본인이</b> NORMAL/PREPARATION에서 실행한다. <code>upgrade</code>는 인벤토리의 낱개 다이아몬드로 즉시 결제한다.</li>
      </ul>
      <CmdList names={names} cmds={step5Cmds} />
      <h3 className={styles.sub}>국가장·구성원이 직접 실행</h3>
      <CmdList names={names} cmds={step5Core} allLabel="이 블록 명령어 모두 복사" />
    </Step>

    <Step id="step-6" n={6} title="시작 전 최종 점검" goal="전쟁 전에 진단하고 백업한다." verify="진단 오류가 없고, OP 아닌 서바이벌 계정으로 진입·가입·Core를 확인했으며 백업이 있다.">
      <ul className={styles.bullets}>
        <li>ACTIVE 국가 <b>2개 이상</b>, 각 Core·국가 스폰·중립 스폰이 정상이어야 한다. 건축 후에는 다시 진단한다.</li>
        <li>보호·가입 테스트는 <b>OP가 아닌 계정</b>으로 한다. OP는 보호를 우회한다.</li>
        <li>정상 종료 후 월드·설정·밴 목록을 같은 시점으로 백업하고 다시 시작한다.</li>
      </ul>
      <CmdList names={names} cmds={step6Cmds} />
    </Step>

    <Step id="step-7" n={7} title="준비·전쟁 예약" goal="준비 시작과 전쟁 시작을 각각 예약한다." verify="/war status 의 예약 시각이 의도와 같다.">
      <ul className={styles.bullets}>
        <li>두 시간 모두 <b>명령 실행 시점부터</b>의 상대 시간이다. 둘 다 지정해야 하며, 준비가 전쟁보다 앞서야 한다. 재시작해도 유지된다.</li>
        <li><b>PREPARATION</b>: 타국 영토 진입 금지(지하·상공 포함). <b>WAR</b>: 국가원 본국 이동, 가입·Core 이전·강화 잠금, 적 Core 전투 시작.</li>
        <li><b>Core 첫 파괴로 한 국가만 탈락하며 그 WAR는 즉시 종료.</b> 2개국 이상 남으면 NORMAL, 하나 남으면 SEASON_END. 다음 전쟁은 직접 다시 예약한다.</li>
      </ul>
      <div className={styles.choice}>
        <div className={styles.choiceCard}>
          <h3>정상 운영 예약</h3><p>48시간 뒤 전쟁, 24시간 뒤 준비 시작</p>
          <CmdList names={names} cmds={step7Normal} />
        </div>
        <div className={`${styles.choiceCard} ${styles.testCard}`}>
          <h3>빠른 시험용</h3><p>동작 확인용 짧은 예약. 정상 예약과 섞어 쓰지 마세요.</p>
          <CmdList names={names} cmds={step7Test} />
        </div>
      </div>
    </Step>

    <h2 className={styles.refHeading}>참고 자료 <small>필요할 때 펼쳐 보세요</small></h2>

    <Fold id="ref-commands" title="전체 명령어" hint="실행자별 전체 명령어와 복사 버튼">
      <p className={styles.note}>Minecraft 채팅에서는 <code>/</code>를 포함해 입력하고, 서버 콘솔에서는 맨 앞 <code>/</code>를 생략합니다. 플레이어 전용 명령은 콘솔에서 실행하지 않습니다. <code>&lt;...&gt;</code>는 교체할 인자입니다.</p>
      <Groups groups={refAdmin} names={names} />
      <div className={styles.infoBox}><strong>상태 제한 안내</strong><ul>{refAdminNote.map(n => <li key={n}>{n}</li>)}</ul></div>
      <Groups groups={refWar} names={names} />
      <div className={styles.group}><h4>일반 플레이어·국가장</h4><CmdList cmds={refPlayers} names={names} copyAll={false} /><p className={styles.note}>{refPlayersNote}</p></div>
      <div className={styles.group}><h4>바닐라 운영 보조</h4><CmdList cmds={refVanilla} names={names} copyAll={false} /></div>
    </Fold>

    <Fold id="ref-rules" title="Core·게임 규칙" hint="Core 레벨, 피해, 보호 범위">
      <div className={styles.tableWrap}><table className={styles.table}>
        <thead><tr><th>Core 레벨</th><th>기본 최대 HP</th><th>해당 단계 추가 비용</th></tr></thead>
        <tbody>{coreLevels.map(r => <tr key={r[0]}>{r.map((c, i) => <td key={i}>{c}</td>)}</tr>)}</tbody>
      </table></div>
      <ul className={styles.bullets}>{coreRules.map(r => <li key={r}>{r}</li>)}</ul>
    </Fold>

    <Fold id="ref-trouble" title="문제 해결·백업" hint="증상별 첫 대응과 백업 주의">
      <div className={styles.tableWrap}><table className={`${styles.table} ${styles.troubleTable}`}>
        <thead><tr><th>증상</th><th>먼저 할 일</th></tr></thead>
        <tbody>{troubles.map(r => <tr key={r[0]}><th scope="row">{r[0]}</th><td>{r[1]}</td></tr>)}</tbody>
      </table></div>
      <div className={styles.infoBox}><strong>백업·설정 주의</strong><ul>{backupNotes.map(n => <li key={n}>{n}</li>)}</ul></div>
    </Fold>
  </main>;
}
