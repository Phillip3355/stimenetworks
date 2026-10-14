'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import styles from '../styles/manual.module.css';
import { copyText, hasPlaceholder, joinCommands, resolveCommand, splitPlaceholders } from '../shared/manualCommands.mjs';
import {
  backupNotes, coreLevels, coreRules, refAdmin, refAdminNote, refPlayers, refPlayersNote, refVanilla, refWar,
  step2Cmds, step3Cmds, step3Template, step4Cmds, step4Verify, step5Cmds, step5Core, step6Cmds, step7Normal, step7Test,
  testbed, toc, troubles, type Cmd, type CmdGroup,
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

function RawList({ cmds, role = '관리자' as Cmd['role'], descs }: { cmds: string[]; role?: Cmd['role']; descs?: string[] }) {
  return <CmdList names={{ PlayerA: '', PlayerB: '', PlayerC: '' }} cmds={cmds.map((cmd, i) => ({ cmd, desc: descs?.[i] ?? '', role }))} allLabel="이 블록 명령어 모두 복사" />;
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
        {['Minecraft 26.3', 'Fabric', 'Java 25', '서버 전용'].map(f => <li key={f}>{f}</li>)}
      </ul>
      <p className={styles.small}>이 모드는 기존 길드·경제 모드와 별개입니다. 이 페이지의 복사 버튼은 클립보드에 복사만 하며, 서버에서 명령을 실행하지 않습니다. Minecraft 채팅에서는 명령을 한 줄씩 실행하세요.</p>
      <nav className={styles.toc} aria-label="매뉴얼 목차">
        {toc.map(item => <a key={item.id} href={`#${item.id}`}>{item.label}</a>)}
      </nav>
    </header>

    <Step id="step-1" n={1} title="서버 설치·첫 실행" goal="서버에 모드를 올리고 첫 실행으로 설정·상태 파일을 만든다." verify="서버가 정상 시작되고 /war status 를 실행할 수 있다.">
      <ul className={styles.bullets}>
        <li>Minecraft <b>26.3</b>, Java <b>25</b>, Fabric Loader <b>0.19.5</b>, Fabric API <b>0.162.0+26.3</b> 환경을 준비한다.</li>
        <li>서버 <code>mods/</code>에 Fabric API와 <code>stime-seasonal-war-1.0.0.jar</code>를 넣는다. <code>-sources.jar</code>는 설치 파일이 아니다.</li>
        <li>Java·Bedrock 플레이어에게 이 모드의 클라이언트 설치를 요구하지 않는다. Bedrock은 별도로 준비한 Geyser/Floodgate 서버 구성을 사용한다.</li>
        <li>첫 실행 시 설정·상태 파일이 생성된다. 국가 기본 등록 수는 <b>0개</b>이므로 다음 단계에서 만든다.</li>
        <li>Geyser의 실제 배포 버전이 26.3 백엔드를 지원하는지 담당자가 확인한다. Bedrock 실접속 검증은 이 페이지가 보증하지 않는다.</li>
      </ul>
      <div className={styles.refBox}><p>파일 위치</p><pre>{`서버 모드: mods/stime-seasonal-war-1.0.0.jar
설정: config/stime-seasonal-war.json
시즌 상태: <world>/data/stime-seasonal-war/state.json`}</pre></div>
      <CmdList names={names} cmds={[{ cmd: '/war status', desc: '서버 시작 후 실행 가능한지 확인', role: '일반 플레이어' }]} />
    </Step>

    <Step id="step-2" n={2} title="월드·영토·스폰 준비" goal="국가 영토, 안전 청크, 중립 스폰, Core 자리를 먼저 지형으로 준비한다." verify="국가·안전구역 좌표표가 있고, 안전한 국가 스폰·중립 스폰·Core 자리가 확보되었다.">
      <ul className={styles.bullets}>
        <li>지형·안전구역 건물·월드 경계는 관리자가 준비한다. 이 모드가 월드나 국가 기지를 자동 건설하지 않는다.</li>
        <li>국가마다 겹치지 않는 X/Z 사각형 영토와 그 안의 안전 청크 하나를 정한다. 국가 수는 고정 3개가 아니다.</li>
        <li>안전구역은 <b>16×16 청크 하나 + 지정 Y 범위만</b> 보호한다. Y 양끝 포함, 최소 3칸 높이. 건물의 실제 사용 높이에 맞춘다.</li>
        <li><code>chunkX = floor(블록 X / 16)</code>, <code>chunkZ = floor(블록 Z / 16)</code>. 예: 청크 <code>(10,0)</code>은 X <code>160~175</code>, Z <code>0~15</code>. 음수는 내림이므로 블록 X <code>-1</code>은 청크 <code>-1</code>이다.</li>
        <li>안전구역에는 단단한 바닥과 플레이어가 설 빈 공간을 준비한다. <b>중립 스폰은 모든 ACTIVE 국가 영토 밖</b>에 둔다.</li>
        <li>Core용으로 자기 영토 안의 안전구역 밖에 단단한 3×3 바닥, 빈 3×3×3 몸체 공간, 완전히 열린 하늘을 확보한다. 기반암 바닥·지하·경계에 붙은 위치는 쓸 수 없다.</li>
        <li><code>setworldspawn</code>은 바닐라 월드 스폰, <code>neutralspawn</code>은 이벤트 무소속 스폰 기준으로 <b>별개</b>다. 좌표 없는 <code>/seasonadmin neutralspawn</code>은 실행 중인 플레이어의 현재 위치를 쓴다.</li>
      </ul>
      <CmdList names={names} cmds={step2Cmds} />
    </Step>

    <Step id="step-3" n={3} title="국가 생성" goal="준비한 좌표로 국가를 만들고 Core 자동 배치를 확인한다." verify="원하는 국가가 모두 ACTIVE이고 Core 존재·배치, 국가 스폰, 중립 스폰에 오류가 없다. 기존 ID로 다시 생성해도 초기화되지 않는다.">
      <ul className={styles.bullets}>
        <li>ID는 영문 소문자·숫자·<code>_</code>·<code>-</code>, 1~32자. 표시 이름과 ID는 다르다. 공백이 있는 이름은 따옴표로 감싼다.</li>
        <li>X/Z는 <b>블록 좌표</b>, 안전구역 X/Z는 <b>청크 좌표</b>다. min/max는 양끝 포함이다.</li>
        <li>안전 청크 전체가 자기 영토 안에 있어야 한다. 좌표 명령은 해당 월드에서 실행한다. 일반 서버 콘솔은 기본적으로 오버월드 기준이다.</li>
        <li>생성 시 영토 중앙 주변에 Core 자동 배치를 시도한다. <code>Core 생성 대기</code>가 나오면 지면·하늘·공간을 준비한 뒤 복구하고 진단한다.</li>
      </ul>
      <h3 className={styles.sub}>인자 순서 (템플릿)</h3>
      <CmdList names={names} cmds={[step3Template]} />
      <h3 className={styles.sub}>작은 3개국 예시</h3>
      <p className={styles.warn}>아래는 예시입니다. 운영 월드 좌표로 반드시 교체하고, 영토 크기 128×128 지형을 먼저 준비해야 합니다.</p>
      <div className={styles.tableWrap}><table className={styles.table}>
        <thead><tr><th>ID</th><th>영토 X</th><th>영토 Z</th><th>안전 청크</th><th>보호 Y</th></tr></thead>
        <tbody>{[['a', '0~127', '0~127', '0,0', '64~70'], ['b', '160~287', '0~127', '10,0', '64~70'], ['c', '320~447', '0~127', '20,0', '64~70']].map(r => <tr key={r[0]}>{r.map((c, i) => <td key={i}>{c}</td>)}</tr>)}</tbody>
      </table></div>
      <CmdList names={names} cmds={step3Cmds} />
    </Step>

    <Step id="step-4" n={4} title="초기 플레이어 배정" goal="관리자가 첫 인원을 국가에 나눠 넣는다." verify="/seasonadmin player <대상>, /seasonadmin nation <id>로 배정과 인원을 확인했다.">
      {nameInputs}
      <ul className={styles.bullets}>
        <li><code>assign</code>은 인원 균형을 우회한다. 여러 명을 같은 국가에 배정할 수도 있다. 온라인 대상은 본국으로 이동한다.</li>
        <li><b>밸런스를 나중에 켜는 별도 버튼·명령은 없다.</b> 처음엔 관리자 배정, 이후엔 일반 플레이어 가입을 사용하면 된다.</li>
        <li>이후 <code>/nation join &lt;id&gt;</code>는 가입 후 ACTIVE 국가 최대·최소 인원 차이가 <b>1 이하</b>여야 한다. 오프라인 등록 인원도 포함한다.</li>
        <li>초기 배정을 심하게 불균형하게 하면 모든 일반 가입이 막힐 수 있다. 가능하면 차이를 0~1로 맞춘다.</li>
        <li>이미 소속된 플레이어는 자유롭게 국가를 바꿀 수 없다. WAR 중 일반 가입은 금지다.</li>
        <li>대상은 온라인 서버 이름 또는 전체 서버 UUID. 오프라인 대상은 전체 UUID를 쓴다. Bedrock·프록시는 Fabric 서버에 실제 표시되는 이름·UUID를 사용한다.</li>
      </ul>
      <CmdList names={names} cmds={step4Cmds} />
      <h3 className={styles.sub}>확인</h3>
      <CmdList names={names} cmds={step4Verify} copyAll={false} />
    </Step>

    <Step id="step-5" n={5} title="국가장 지정" goal="각 국가의 구성원 한 명을 국가장으로 지정한다." verify="/nation members에 국가장·구성원이 맞게 표시되고, /nation core status에 좌표·HP·레벨이 나온다.">
      {nameInputs}
      <ul className={styles.bullets}>
        <li>배정한 <b>해당 국가 구성원</b>만 국가장으로 지정할 수 있다. 국가장은 자동 선출되지 않으며, 공석이면 관리자가 직접 지정한다.</li>
        <li>Core 이전·강화는 <b>국가장 본인이</b> NORMAL/PREPARATION에서 실행한다. 관리자에게 같은 명령을 입력하게 하지 않는다.</li>
        <li><code>relocate</code>는 국가장의 현재 위치로 이전하며 배치 검사를 한다. <code>upgrade</code>는 인벤토리의 낱개 다이아몬드로 한 단계 즉시 결제한다.</li>
      </ul>
      <CmdList names={names} cmds={step5Cmds} />
      <h3 className={styles.sub}>국가장·구성원이 직접 실행</h3>
      <CmdList names={names} cmds={step5Core} allLabel="이 블록 명령어 모두 복사" />
    </Step>

    <Step id="step-6" n={6} title="시작 전 최종 점검" goal="전쟁 전에 진단·보호 테스트·백업을 마친다." verify="진단 오류가 없고, 테스트 계정으로 진입·가입·Core를 확인했으며, 백업을 확보했다.">
      <ul className={styles.bullets}>
        <li>ACTIVE 국가 <b>2개 이상</b>, 각 국가 Core 존재·배치와 안전 스폰·중립 스폰이 정상인지 확인한다.</li>
        <li>보호·가입 테스트는 <b>OP가 아닌 서바이벌 계정</b>으로 한다. OP는 진입·직접 조작 보호를 우회한다.</li>
        <li>서버를 정상 종료한 뒤 월드·설정·밴 목록을 같은 시점으로 백업하고, 다시 시작한다.</li>
        <li>Core 위 지붕이나 스폰 훼손은 전쟁 시작 검증을 실패하게 할 수 있다. 장식·건축 후에는 다시 진단한다.</li>
      </ul>
      <CmdList names={names} cmds={step6Cmds} />
    </Step>

    <Step id="step-7" n={7} title="준비·전쟁 예약" goal="준비와 전쟁 시작 시각을 각각 예약한다." verify="/war status의 저장된 예약 시각이 의도와 같다.">
      <ul className={styles.bullets}>
        <li>두 시간 모두 <b>명령 실행 시점부터</b>의 상대 시간이다. <code>24h</code>를 하루 전으로 자동 계산하지 않는다. 두 예약을 연속 실행하면 대략 24시간의 준비 기간이 된다.</li>
        <li>전쟁만 예약해도 24시간 전 준비가 자동 예약되지 않는다. 둘 다 지정한다. 준비 시작은 전쟁 시작보다 앞서야 한다.</li>
        <li>기본 표시 시간대는 Asia/Seoul. 예약은 실제 시각으로 저장되어 재시작해도 유지된다.</li>
        <li><b>PREPARATION</b>: 타국 ACTIVE 영토 진입 금지(지하·상공 포함). 이미 안에 있거나 재접속한 외부인은 퇴거 대상. 무소속도 모든 ACTIVE 영토에서 제한된다.</li>
        <li><b>WAR</b>: 온라인 국가원 본국 이동, 일반 가입·Core 이전·강화 잠금, 적 Core 전투 시작. WAR 중 국가원 재접속도 본국 이동.</li>
        <li><b>Core 첫 파괴로 한 국가만 탈락하며 해당 WAR 즉시 종료.</b> 생존 Core는 최대 HP 회복·강화 유지. 2개 이상 남으면 NORMAL, 하나 남으면 SEASON_END. 다음 전쟁은 관리자가 다시 예약한다.</li>
      </ul>
      <div className={styles.choice}>
        <div className={styles.choiceCard}>
          <h3>정상 운영 예약</h3><p>지금부터 48시간 뒤 전쟁, 그 하루 전(24시간 뒤) 준비 시작</p>
          <CmdList names={names} cmds={step7Normal} />
        </div>
        <div className={`${styles.choiceCard} ${styles.testCard}`}>
          <h3>빠른 시험용</h3><p>동작 확인용 짧은 예약입니다. 정상 운영 예약과 섞어 쓰지 마세요.</p>
          <CmdList names={names} cmds={step7Test} />
        </div>
      </div>
    </Step>

    <h2 className={styles.refHeading}>참고 자료 <small>필요할 때 펼쳐 보세요</small></h2>

    <Fold id="ref-commands" title="전체 명령어" hint="실행자별 전체 명령어와 복사 버튼">
      <p className={styles.note}>Minecraft 채팅에서는 <code>/</code>를 포함해 입력하고, 일반 서버 콘솔에서는 맨 앞 <code>/</code>를 생략합니다. GUI·Core 이전/강화 같은 플레이어 전용 명령은 콘솔에서 실행하지 않습니다. <code>&lt;...&gt;</code>는 교체할 인자입니다.</p>
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

    <Fold id="ref-testbed" title="선택: 베타용 작은 시험장 준비" hint="새 베타 월드 전용 · 운영 셋업에 필수 아님">
      <p className={styles.warnStrong}>새 베타 월드 전용: 아래 <code>/fill</code>이 지정 지형을 덮어씁니다. 운영 월드에는 그대로 적용하지 마세요.</p>
      <p className={styles.note}>위 3단계의 a/b/c 예시 좌표와 오버월드 기본 높이에서만 쓰는 명령입니다. 아래 순서대로 실행하세요. 높이 Y383이나 국경 밖 중립 스폰을 준비하지 않은 예시로 바꾸지 마세요.</p>
      {testbed.map(block => <div key={block.title} className={styles.group}>
        <h4>{block.title}</h4>{block.note && <p className={styles.note}>{block.note}</p>}
        <RawList cmds={block.cmds} />
      </div>)}
    </Fold>
  </main>;
}
