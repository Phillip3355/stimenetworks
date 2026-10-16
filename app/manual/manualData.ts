export type Role = '관리자' | '국가장' | '구성원' | '일반 플레이어';
export type Cmd = { cmd: string; desc: string; role: Role; danger?: string };
export type CmdGroup = { title: string; note?: string; cmds: Cmd[] };

const A: Role = '관리자';
const L: Role = '국가장';
const M: Role = '구성원';
const P: Role = '일반 플레이어';

export const toc = [
  { id: 'patch', label: '이번 패치 핵심' },
  { id: 'step-1', label: '1. 설치' },
  { id: 'step-2', label: '2. 지형·로비' },
  { id: 'step-3', label: '3. 국가 생성' },
  { id: 'step-4', label: '4. 초기 배정' },
  { id: 'step-5', label: '5. 국가장·스폰' },
  { id: 'step-6', label: '6. 점검·백업' },
  { id: 'step-7', label: '7. 전쟁 예약' },
  { id: 'ref-gimmick', label: '스폰·로비 기믹' },
  { id: 'ref-commands', label: '전체 명령어' },
  { id: 'ref-rules', label: 'Core·승패' },
  { id: 'ref-trouble', label: '문제 해결·전환' },
  { id: 'ref-checklist', label: '개장 체크리스트' },
  { id: 'ref-testbed', label: '베타 시험장' },
];

export const patchCards = [
  { title: '안전지대 삭제', body: '영토·국가 스폰 청크 모두 이 모드의 지역 보호가 없습니다. 건축·파괴·상자 약탈·PvP·TNT가 가능합니다.' },
  { title: '국가 스폰 지정', body: '한 블록의 X/Y/Z를 지정합니다. 그 블록이 속한 16×16 청크 전체가 모든 높이에서 스폰 청크입니다.' },
  { title: '10초 스폰 보호', body: '조건에 맞게 집으로 스폰된 국가원에게 주는 개인 피해 보호입니다. 지역 보호가 아닙니다.' },
  { title: '무소속 로비', body: '일반 무소속은 중립 스폰 주변에서 가입을 기다립니다. 가입하면 해제되며 WAR 중에도 가입할 수 있고, SEASON_END만 불가합니다.' },
  { title: 'Core와 스폰 간격', body: '모든 ACTIVE 국가의 스폰 청크와 모든 ACTIVE Core 몸체 사이에 온전한 청크 하나 이상을 띄워야 합니다.' },
];

export const step1Cmds: Cmd[] = [
  { cmd: '/war status', desc: '서버 시작 후 실행 가능한지 확인', role: P },
];

export const step2Cmds: Cmd[] = [
  { cmd: '/worldborder center <x> <z>', desc: '월드 경계 중심', role: A },
  { cmd: '/worldborder set <크기>', desc: '월드 경계 크기', role: A },
  { cmd: '/setworldspawn <x> <y> <z>', desc: '바닐라 월드 스폰', role: A },
  { cmd: '/seasonadmin neutralspawn <x> <y> <z>', desc: '이벤트 중립 스폰 탐색 기준', role: A },
];

export const step3Template: Cmd = { cmd: '/seasonadmin create <id> <이름> <minX> <maxX> <minZ> <maxZ> <spawnX> <spawnY> <spawnZ>', desc: '국가 생성 템플릿 (인자 순서)', role: A };
export const step3Cmds: Cmd[] = [
  { cmd: '/seasonadmin create a "A국" 0 127 0 127 8 65 8', desc: 'A국 생성 예시', role: A },
  { cmd: '/seasonadmin create b "B국" 160 287 0 127 168 65 8', desc: 'B국 생성 예시', role: A },
  { cmd: '/seasonadmin create c "C국" 320 447 0 127 328 65 8', desc: 'C국 생성 예시', role: A },
  { cmd: '/war diagnostics', desc: '국가·Core·스폰 진단', role: A },
];
export const step3Table = [
  ['a', '0~127', '0~127', '8, 65, 8', '0, 0'],
  ['b', '160~287', '0~127', '168, 65, 8', '10, 0'],
  ['c', '320~447', '0~127', '328, 65, 8', '20, 0'],
];

export const step4Cmds: Cmd[] = [
  { cmd: '/seasonadmin assign {PlayerA} a', desc: 'PlayerA를 a국에 배정', role: A },
  { cmd: '/seasonadmin assign {PlayerB} b', desc: 'PlayerB를 b국에 배정', role: A },
  { cmd: '/seasonadmin assign {PlayerC} c', desc: 'PlayerC를 c국에 배정', role: A },
];
export const step4Verify: Cmd[] = [
  { cmd: '/seasonadmin player {PlayerA}', desc: '소속·역할·가입 가능 상태 확인', role: A },
  { cmd: '/seasonadmin nation a', desc: 'a국 상세·인원 확인', role: A },
];

export const step5Leader: Cmd[] = [
  { cmd: '/seasonadmin leader a {PlayerA}', desc: 'a국 국가장 지정', role: A },
  { cmd: '/seasonadmin leader b {PlayerB}', desc: 'b국 국가장 지정', role: A },
  { cmd: '/seasonadmin leader c {PlayerC}', desc: 'c국 국가장 지정', role: A },
];
export const step5Own: Cmd[] = [
  { cmd: '/nation spawn', desc: '서 있는 발 위치 블록을 국가 스폰으로 지정', role: L },
  { cmd: '/nation core status', desc: '레벨·HP·좌표·다음 강화 비용', role: M },
];
export const step5Admin: Cmd[] = [
  { cmd: '/seasonadmin spawn a 8 65 8', desc: 'a국 스폰 지정·수정', role: A },
  { cmd: '/seasonadmin spawn b 168 65 8', desc: 'b국 스폰 지정·수정', role: A },
  { cmd: '/seasonadmin spawn c 328 65 8', desc: 'c국 스폰 지정·수정', role: A },
];

export const step6Cmds: Cmd[] = [
  { cmd: '/war status', desc: '상태·예약·남은 시간', role: P },
  { cmd: '/war diagnostics', desc: 'Core 배치·스폰·로비·인원·예약 진단', role: A },
];

export const step7Normal: Cmd[] = [
  { cmd: '/war prepare 24h', desc: '지금부터 24시간 뒤 준비 시작 예약', role: A },
  { cmd: '/war start 48h', desc: '지금부터 48시간 뒤 전쟁 시작 예약', role: A },
  { cmd: '/war status', desc: '저장된 예약 시각 확인', role: P },
];
export const step7Test: Cmd[] = [
  { cmd: '/war prepare 30s', desc: '30초 뒤 준비 시작 (시험용)', role: A },
  { cmd: '/war start 90s', desc: '90초 뒤 전쟁 시작 (시험용)', role: A },
];

export const protectionRows = [
  ['국가원의 사망 후 이벤트 리스폰', '부여'],
  ['WAR 시작·WAR 중 국가원 로그인', '부여'],
  ['WAR 중 로비에서 국가 가입', '본국 이동 후 부여'],
  ['실패했던 필수 본국 귀환 재시도가 성공', '부여'],
  ['일반적인 NORMAL/PREPARATION 로그인', '새로 부여하지 않음'],
  ['PREPARATION 퇴거·관리자 강제 배정', '새로 부여하지 않음'],
  ['무소속 리스폰', '부여하지 않음'],
];
export const protectionNotes = [
  '보호는 로딩 대기 중에도 적용되고, 클라이언트 로딩을 확인한 첫 틱부터 200틱을 센다. 정상 20 TPS에서 약 10초다.',
  '실제로 도착한 청크를 기준으로 하며 같은 청크 안에서는 높이가 달라져도 유지된다. 청크 밖이나 다른 차원으로 나가면 종료되고, 돌아와도 다시 생기지 않는다.',
  '개체 근접 공격 시도, 또는 피해 원인의 공격자가 본인으로 식별된 화살·폭발 등의 공격으로 즉시 종료한다. 피해를 받는 것, 자기 자신에게 가한 피해, 길들인 동물의 공격은 본인의 보호를 해제하지 않는다.',
  '일반 피해를 막는 기능이다. /kill·공허 같은 무적 무시 피해는 예외이며, 폭발 밀쳐내기나 비피해 상태 효과까지 막지는 않는다.',
  '남은 시간·해제 이유는 액션바로 안내한다. 재시작 후 남은 보호 시간을 복원하지 않는다.',
  '건물·상자·다른 사람을 보호하지 않는다. 별도 보호 켜기/끄기 명령은 없다.',
];
export const spawnFallback = [
  '지정 블록·지정 높이 주변부터 스폰 청크의 ±16 Y 범위.',
  '스폰 청크의 나머지 모든 높이.',
  '스폰 청크에서 3청크 범위의 자국 영토 지표면.',
  '전부 실패하면 중립 스폰으로 대피하고, 필요한 본국 귀환은 재시도.',
];
export const spawnFallbackNote = '발판을 자동 생성하지 않으며 매번 지정 좌표에 정확히 서는 것도 아니다. 보호를 부여하는 필수 귀환 중 중립 스폰으로 대피해도 실제 도착 청크에서 개인 스폰 보호를 받는다. WAR에서 미완료 귀환은 해당 WAR 동안 재시도하고, 실패 재시도 간격은 최대 약 30초까지 늘어난다. 다른 상태의 필수 귀환은 600틱 후 실패를 안내할 수 있다. 중립 대피를 본국 귀환 완료로 설명하지 않는다.';
export const lobbyText = 'SEASON_END 전 무소속 비관리자는 중립 스폰 주변에서 국가를 선택한다. 잠긴 동안 받는 피해도 차단되며, 이는 200틱 개인 스폰 보호와 별개다. 움직임·공격·사용 제한은 플레이어 상태에 적용하며 로비 건물을 보호하는 구역 기능이 아니다. OP와 SEASON_END는 로비 잠금 예외다. 가입·배정 해제·탈락·밴 해제 이후 소속을 확인한다.';

export const refAdmin: CmdGroup[] = [{
  title: '관리자: 국가·스폰·플레이어',
  cmds: [
    { cmd: '/seasonadmin', desc: '관리자 상자 메뉴; 플레이어 전용', role: A },
    { cmd: '/seasonadmin gui', desc: '관리자 상자 메뉴 (위와 동일)', role: A },
    { cmd: '/seasonadmin create <id> <이름> <minX> <maxX> <minZ> <maxZ> <spawnX> <spawnY> <spawnZ>', desc: '국가 생성·스폰 저장·Core 자동 배치 시도', role: A },
    { cmd: '/seasonadmin rename <id> <이름...>', desc: '표시 이름 변경; ID 변경 아님', role: A },
    { cmd: '/seasonadmin territory <id> <minX> <maxX> <minZ> <maxZ>', desc: '영토 변경; 기존 스폰 청크·Core 조건 유지 필요', role: A },
    { cmd: '/seasonadmin spawn <id>', desc: '내 위치를 해당 국가 스폰으로 지정; 플레이어 전용', role: A },
    { cmd: '/seasonadmin spawn <id> <x> <y> <z>', desc: '국가 스폰 블록 좌표 지정', role: A },
    { cmd: '/seasonadmin leader <id> <대상>', desc: '해당 국가 구성원을 국가장 지정', role: A },
    { cmd: '/seasonadmin assign <대상> <id>', desc: '균형 무시 배정; 온라인은 본국 이동·새 보호 없음', role: A },
    { cmd: '/seasonadmin reset <대상>', desc: '소속·국가장 해제; 온라인은 중립 이동·로비 대상', role: A, danger: '결과: 소속과 국가장 직위가 사라집니다. 서버 밴은 해제되지 않습니다.' },
    { cmd: '/seasonadmin player <대상>', desc: '소속·역할·가입 가능 상태 조회', role: A },
    { cmd: '/seasonadmin nation <id>', desc: '국가·영토·국가 스폰 좌표·Core 상세 조회', role: A },
    { cmd: '/seasonadmin respawncore <id>', desc: 'ACTIVE Core 개체 복구; 저장 HP·레벨·좌표 유지', role: A },
    { cmd: '/seasonadmin tpcore <id>', desc: '활성 Core 저장 위치로 이동; 플레이어 전용', role: A },
    { cmd: '/seasonadmin neutralspawn', desc: '내 위치를 중립 스폰 탐색 기준으로 설정; 플레이어 전용', role: A },
    { cmd: '/seasonadmin neutralspawn <x> <y> <z>', desc: '중립 기준 좌표 설정; ACTIVE 영토 밖', role: A },
    { cmd: '/seasonadmin diagnostics', desc: '종합 진단; /war diagnostics와 같음', role: A },
  ],
}];
export const refAdminNote = [
  '생성·이름·영토·스폰·국가장·중립 스폰·수동 탈락은 NORMAL/PREPARATION에서 수행한다.',
  '강제 배정은 WAR 가능, SEASON_END 불가. 소속 reset·ACTIVE Core 복구는 WAR에서도 가능하다.',
  '스폰·영토 좌표는 정수 블록 좌표, 중립 좌표는 소수 사용 가능.',
  '생성·중립 좌표는 실행 차원 기준, 좌표형 국가 스폰은 해당 국가 차원 기준. 일반 서버 콘솔의 생성은 기본 오버월드.',
  '생성 이름은 공백 포함 시 따옴표로 감싸고, rename은 뒤의 나머지 문자열을 그대로 이름으로 쓴다.',
  '복구는 지형 수리·Core 최대 HP 회복·탈락국 부활 기능이 아니다.',
];

export const refWar: CmdGroup[] = [{
  title: '관리자: 전쟁',
  note: '기간은 양수 한 값과 단위 s/m/h/d: 30s, 5m, 2h, 1d.',
  cmds: [
    { cmd: '/war prepare', desc: 'NORMAL에서 준비 즉시 시작', role: A },
    { cmd: '/war prepare <기간>', desc: '지금부터 해당 기간 뒤 준비 예약; NORMAL에서 설정', role: A },
    { cmd: '/war start', desc: 'NORMAL/PREPARATION에서 Core·스폰·간격 검사 후 WAR 즉시 시작', role: A },
    { cmd: '/war start <기간>', desc: 'NORMAL/PREPARATION에서 지금부터 해당 기간 뒤 WAR 예약', role: A },
    { cmd: '/war cancel', desc: '예약만 취소, 현재 단계 유지', role: A, danger: '결과: 예약만 지워지고 현재 단계는 그대로 유지됩니다.' },
    { cmd: '/war end', desc: 'NORMAL 복귀·생존 Core 회복·예약 취소; SEASON_END에서는 거절', role: A, danger: '결과: NORMAL로 돌아가고 예약이 취소되며 생존 Core가 회복됩니다.' },
    { cmd: '/war diagnostics', desc: 'Core 배치·스폰·중립 로비·인원·국가장·예약 진단', role: A },
  ],
}];

export const refDanger: CmdGroup = {
  title: '고급·위험 명령 (추방·탈락·강제 상태 전환)',
  note: '시즌 리셋 기능이 아닙니다. 결과를 확인하고 백업이 있을 때만 사용하세요.',
  cmds: [
    { cmd: '/seasonadmin deactivate <id>', desc: '국가 영구 탈락; 같은 시즌 재활성화 불가', role: A, danger: '결과: 해당 국가는 이번 시즌에서 영구 탈락하며 되돌릴 수 없습니다.' },
    { cmd: '/nation expel <대상> confirm', desc: '자국 다른 국가원 영구 서버 UUID 밴 + 소속 제거', role: L, danger: '결과: 대상이 서버에서 영구 밴되고 소속도 제거됩니다. 국가에서만 내보내는 명령이 아닙니다.' },
    { cmd: '/war state NORMAL', desc: '명시적 NORMAL 전환; 탈락국 복구 아님', role: A, danger: '결과: 단계만 NORMAL로 바뀌며 탈락한 국가는 복구되지 않습니다.' },
    { cmd: '/war state PREPARATION', desc: '일반 준비 시작 규칙으로 전환', role: A, danger: '결과: 준비 단계가 시작되어 타국 영토 진입 제한이 적용됩니다.' },
    { cmd: '/war state WAR', desc: '일반 WAR 시작 검증을 거쳐 전환', role: A, danger: '결과: 검증 통과 시 전쟁이 시작되어 Core 전투가 열립니다.' },
    { cmd: '/war state SEASON_END', desc: '종료 단계 강제 지정; 자동 우승 판정 명령 아님', role: A, danger: '결과: 시즌 종료 단계로 고정되며 우승 판정은 하지 않습니다. 가입도 종료됩니다.' },
  ],
};

export const refPlayers: Cmd[] = [
  { cmd: '/nation', desc: '국가 메뉴', role: P },
  { cmd: '/nation status', desc: '소속·게임 상태', role: P },
  { cmd: '/nation join', desc: '가입 메뉴·확인/취소', role: P },
  { cmd: '/nation join <id>', desc: '즉시 가입; NORMAL/PREPARATION/WAR, 균형 검사', role: P },
  { cmd: '/nation members', desc: '국가장·구성원·UUID', role: M },
  { cmd: '/nation core', desc: 'Core 메뉴·국가 스폰 지정 버튼', role: M },
  { cmd: '/nation core status', desc: 'HP·레벨·좌표·다음 비용', role: M },
  { cmd: '/war', desc: '상태·예약·남은 시간', role: P },
  { cmd: '/war status', desc: '상태·예약·남은 시간 (위와 동일)', role: P },
  { cmd: '/nation spawn', desc: '현재 발 위치 블록으로 국가 스폰 지정', role: L },
  { cmd: '/nation core relocate', desc: '현재 위치로 Core 이전', role: L },
  { cmd: '/nation core upgrade', desc: '실제 다이아몬드로 다음 단계 즉시 결제', role: L },
  { cmd: '/nation expel', desc: '추방 메뉴', role: L },
  { cmd: '/nation expel <대상>', desc: '경고만 표시; 아직 추방하지 않음', role: L },
];
export const refPlayersNote = '스폰 지정·이전·강화는 NORMAL/PREPARATION만 가능합니다. 추방은 WAR/SEASON_END에도 가능하고 자기 자신·타국원은 불가합니다. /nation join <id>와 /nation core upgrade 명령은 즉시 처리하며 GUI는 확인을 거칩니다. 추방 확정 명령은 위 "고급·위험 명령"에 있습니다. 관리자 /pardon 후 복귀해도 소속은 무소속이며 인벤토리·발전과제는 삭제되지 않습니다.';

export const refVanilla: Cmd[] = [
  { cmd: '/op <대상>', desc: '관리자 권한 부여', role: A },
  { cmd: '/deop <대상>', desc: '권한 해제; 일반 계정 시험 전 수행', role: A },
  { cmd: '/gamemode survival <대상>', desc: '일반 참가자 시험 모드', role: A },
  { cmd: '/tp <대상> <x> <y> <z>', desc: '위치 이동', role: A },
  { cmd: '/give <대상> minecraft:diamond <수량>', desc: '강화 시험 비용 지급', role: A },
  { cmd: '/worldborder center <x> <z>', desc: '월드 경계 중심', role: A },
  { cmd: '/worldborder set <크기>', desc: '월드 경계 크기', role: A },
  { cmd: '/setworldspawn <x> <y> <z>', desc: '바닐라 월드 스폰', role: A },
  { cmd: '/pardon <이름>', desc: '서버 밴 해제; 국가 소속은 복구 안 됨', role: A },
  { cmd: '/stop', desc: '정상 종료·백업 전 사용', role: A, danger: '결과: 서버가 종료됩니다.' },
];

export const coreLevels = [
  ['0', '800', '없음'],
  ['1', '1200', '64'],
  ['2', '1600', '추가 128'],
  ['3', '2000', '추가 192'],
];
export const coreRules = [
  '총 강화 비용 384개. 낱개 다이아를 국가장 인벤토리에서 결제한다. 다이아 블록·셜커 내부는 계산하지 않는다. 수치는 설정으로 변경 가능.',
  'Core는 고정된 바닐라 철 골렘이며 HP·레벨·위치는 모드 데이터가 기준이다. 개체 소실은 탈락이 아니며 /kill로 Core 파괴 시험을 하지 않는다.',
  'NORMAL/PREPARATION Core 피해 불가. WAR 중 적 근접·화살·TNT 등 적용. 알려진 자국 공격은 기본 차단하지만 귀속 없는 폭발·몹 등 환경 피해는 별도 허용한다.',
  '첫 정당한 Core 파괴로 해당 국가만 탈락, 구성원 무소속·강화 제거, 생존 Core 회복·레벨 유지. 2개 이상 남으면 NORMAL에서 재가입 가능, 하나 남아 SEASON_END면 가입 종료.',
  '빈 국가도 ACTIVE면 인원 균형·전쟁·승패 계산에 포함된다. 국가장 공석도 자동 탈락 사유가 아니다.',
  '국가원 리스폰은 이벤트 목적지를 사용한다. 침대는 전진 리스폰 우회 수단이 아니다.',
  '영토 전환은 액션바로 안내하고 타국원 침입 시 소유 국가에 알림을 준다. 안내가 지역 보호를 뜻하지는 않는다.',
  '추방은 서버 영구 밴이다. 관리자 밴 해제 후 무소속으로 복귀하며 기존 인벤토리·발전과제는 삭제하지 않는다.',
  '금고(Vault), 경제·상점·동맹, 자동 반복 전쟁·시즌/월드 초기화는 없다. 차원 차단·TNT 제작 제한·농장 관리도 이 모드 담당이 아니다.',
];
export const backupNotes = [
  '설정과 시즌 상태는 별개다. config의 국가 목록은 최초 생성용이며 이미 저장된 국가 운영은 명령으로 한다. 전용 reload·국가 부활·전체 시즌 reset 명령은 없다.',
  '직접 JSON 수정·백업 복원은 서버 정상 종료 후 수행한다. 월드·설정·밴은 같은 시점으로 보관한다.',
  '모드 상태·인벤토리·밴의 크래시 동시 저장은 보장되지 않는다.',
];

export const troubles = [
  ['무소속이 움직이거나 조작할 수 없음', '정상 로비 제한. /nation으로 가입하거나 관리자 assign. OP는 예외'],
  ['가입 거절', 'SEASON_END 여부, 기존 소속, ACTIVE 인원 차이. 심한 불균형은 관리자 조정'],
  ['스폰에서 적의 건축·약탈이 가능', '현재 규칙상 정상. 스폰 청크에 지역 보호 없음'],
  ['스폰 보호가 없음', '실제 부여 조건·클라이언트 로딩·실제 착지 청크 이탈·공격·200틱 경과 확인'],
  ['Core 생성 대기', '자기 영토·하늘·단단한 바닥·빈 공간·모든 스폰 청크와 간격 점검 후 /seasonadmin respawncore <id>'],
  ['Core/스폰 간격 오류', 'Core 중심만 보지 말고 3×3 몸체가 닿는 청크까지 확인. Core 또는 국가 스폰 이동'],
  ['본국 스폰이 다른 곳으로 잡힘', '지정 지점 훼손 시 같은 청크 다른 위치·높이, 이후 주변 자국 영토로 대체 가능'],
  ['중립 대피 뒤 아직 본국에 안 감', '본국·주변 영토 착지 지점 수리 후 재시도 대기. WAR 중 의무는 WAR 종료까지 유지'],
  ['전쟁 시작 실패', '/war diagnostics로 Core 존재·배치·간격·국가 스폰 확인. 중립 로비도 운영상 별도 점검'],
  ['예약 시간이 지났는데 WAR 아님', '/war status와 로그 확인. 검증 실패로 취소됐다면 수리 후 다시 예약. 저장·런타임 오류는 재시도될 수 있음'],
  ['저장됐지만 후속 실패 메시지', '조회로 현재 저장 상태부터 확인. 생성·결제 무작정 반복 금지'],
  ['추방 후 접속 불가', '관리자 /pardon <이름>. reset은 밴 해제 명령이 아님'],
  ['탈락국 복구를 원함', '동일 시즌 재활성화 불가. 사전 백업 복원 또는 새 시즌 데이터 준비'],
];

export const migration = [
  '서버 종료 후 월드·config·밴 목록 백업.',
  '새 모드로 시작하면 기존 safeZone은 같은 청크의 국가 스폰으로 자동 변환되고 경고가 남는다. 위치는 청크 중앙 X/Z와 예전 minY 기준이므로 실제 발판을 확인한다.',
  '예전 지역 보호는 사라진다. 기존 건물·상자는 누구나 공격·약탈할 수 있음을 운영진에게 안내한다.',
  'Core가 스폰 바로 옆 청크에 있으면 새 간격 규칙 위반. 기존 월드는 로드되지만 진단에 간격 오류가 표시되고 다음 WAR 시작이 거절될 수 있다.',
  'NORMAL/PREPARATION에서 국가장이 /nation spawn 또는 /nation core relocate로 조정하거나, 관리자가 /seasonadmin spawn으로 조정한 뒤 다시 진단한다. WAR 중에는 해당 설정 변경이 잠긴다.',
  '변환됐다고 지형·Core 간격까지 자동 수정되는 것은 아니다. 오래된 안전구역 시험 기록을 현행 버전 통과 근거로 쓰지 않는다.',
];

export const checklist = [
  '비OP 무소속 로비 제한 → 가입 성공 → 잠금 해제. 인원 차이 2 이상 가입 거절.',
  'NORMAL/PREPARATION 가입은 제자리 해제, WAR 가입은 본국 이동·보호, SEASON_END 가입 거절.',
  '국가장만 /nation spawn, 지정 청크 전체가 영토 안, Core와 간격 유지. WAR에서 변경 거절.',
  '스폰 청크 출입·상자·설치·파괴·PvP가 가능. 옛 지역 보호가 남아 있다고 기대하지 않기.',
  'PREPARATION에 타국 영토의 상공·지하까지 진입 제한.',
  '국가원 리스폰·WAR 시작/로그인에서 로딩 후 10초 보호. 청크 이탈·공격하면 종료, 돌아와도 미복원.',
  '스폰 지점 일부가 막혀도 대체 착지, 완전히 부적합하면 주변 자국 영토·최종 중립 대피 확인.',
  'Core Lv.0/800 → 64/128/192 순차 결제 → Lv.3/2000. WAR 중 강화·이전 거절.',
  'Core 첫 파괴 → 한 국가만 탈락 → 생존 HP 회복. 최종 한 국가면 SEASON_END.',
  '정상 재시작 뒤 소속·스폰·Core·예약 유지. Java·Bedrock 각각 메뉴·명령·Core 공격·리스폰·UUID 확인.',
];

export const testbed: { title: string; note?: string; cmds: string[] }[] = [
  { title: '1. 시험장 청크 임시 로드', note: '범위 248청크로 한 번의 256청크 제한 안입니다.', cmds: ['/forceload query', '/forceload add -48 0 447 127'] },
  { title: '2. 로드 확인', note: '몇 초 기다린 뒤 실행. 출력이나 /fill이 로드 실패면 기다린 뒤 해당 명령부터 재시도합니다. 등록만으로 로드 완료로 판단하지 않습니다.', cmds: [
    '/execute if loaded 0 64 0 run say A_start_loaded', '/execute if loaded 127 64 127 run say A_end_loaded',
    '/execute if loaded 160 64 0 run say B_start_loaded', '/execute if loaded 287 64 127 run say B_end_loaded',
    '/execute if loaded 320 64 0 run say C_start_loaded', '/execute if loaded 447 64 127 run say C_end_loaded',
    '/execute if loaded -40 64 0 run say neutral_start_loaded', '/execute if loaded -25 64 15 run say neutral_end_loaded'] },
  { title: '3. 지형 준비', note: '바닥 Y64·발 Y65·Core 상공 Y319 기준. 이후 3단계의 국가 생성 명령을 실행합니다. 스폰 주변을 비우는 것은 착지 공간을 만드는 작업이며 Y65~71을 보호 구간으로 설정하는 작업이 아닙니다.', cmds: [
    '/worldborder center 224 64', '/worldborder set 1024',
    '/fill 0 64 0 127 64 127 minecraft:stone', '/fill 160 64 0 287 64 127 minecraft:stone', '/fill 320 64 0 447 64 127 minecraft:stone',
    '/fill -40 64 0 -25 64 15 minecraft:stone', '/fill -40 64 7 447 64 9 minecraft:stone',
    '/fill 0 65 0 15 71 15 minecraft:air', '/fill 160 65 0 175 71 15 minecraft:air', '/fill 320 65 0 335 71 15 minecraft:air', '/fill -40 65 0 -25 71 15 minecraft:air',
    '/fill 60 65 60 66 319 66 minecraft:air', '/fill 220 65 60 226 319 66 minecraft:air', '/fill 380 65 60 386 319 66 minecraft:air',
    '/setworldspawn -32 65 8', '/seasonadmin neutralspawn -32 65 8'] },
  { title: '4. 임시 로드 해제', note: '국가 생성·Core·스폰 점검을 마친 후 이번에 추가한 임시 로드만 해제합니다. 기존 강제 로드가 있던 월드라면 겹치는 기존 청크를 해제하지 않도록 구분하세요.', cmds: ['/forceload remove -48 0 447 127'] },
];
