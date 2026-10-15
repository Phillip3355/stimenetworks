export type Role = '관리자' | '국가장' | '구성원' | '일반 플레이어';
export type Cmd = { cmd: string; desc: string; role: Role; danger?: string };
export type CmdGroup = { title: string; note?: string; cmds: Cmd[] };

const A: Role = '관리자';
const L: Role = '국가장';
const M: Role = '구성원';
const P: Role = '일반 플레이어';

export const toc = [
  { id: 'step-1', label: '1. 설치·첫 실행' },
  { id: 'step-2', label: '2. 월드·영토·스폰' },
  { id: 'step-3', label: '3. 국가 생성' },
  { id: 'step-4', label: '4. 초기 배정' },
  { id: 'step-5', label: '5. 국가장 지정' },
  { id: 'step-6', label: '6. 최종 점검' },
  { id: 'step-7', label: '7. 준비·전쟁 예약' },
  { id: 'ref-commands', label: '전체 명령어' },
  { id: 'ref-rules', label: 'Core·게임 규칙' },
  { id: 'ref-trouble', label: '문제 해결·백업' },
];

export const step2Cmds: Cmd[] = [
  { cmd: '/worldborder center 0 0', desc: '월드 경계 중심', role: A },
  { cmd: '/worldborder set 4000', desc: '월드 경계 크기 4000×4000', role: A },
  { cmd: '/setworldspawn 0 65 0', desc: '바닐라 월드 스폰 (월드 중앙)', role: A },
  { cmd: '/seasonadmin neutralspawn 0 65 0', desc: '이벤트 무소속 스폰 기준 (월드 중앙, 영토 밖)', role: A },
];

export const step3Cmds: Cmd[] = [
  { cmd: '/seasonadmin create a "A국" -2000 -1001 -2000 -1001 -113 -113 64 70', desc: 'A국 생성 (북서 모서리)', role: A },
  { cmd: '/seasonadmin create b "B국" 1000 1999 -2000 -1001 112 -113 64 70', desc: 'B국 생성 (북동 모서리)', role: A },
  { cmd: '/seasonadmin create c "C국" -2000 -1001 1000 1999 -113 112 64 70', desc: 'C국 생성 (남서 모서리)', role: A },
  { cmd: '/war diagnostics', desc: '국가·Core·스폰 진단', role: A },
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

export const step5Cmds: Cmd[] = [
  { cmd: '/seasonadmin leader a {PlayerA}', desc: 'a국 국가장 지정', role: A },
  { cmd: '/seasonadmin leader b {PlayerB}', desc: 'b국 국가장 지정', role: A },
  { cmd: '/seasonadmin leader c {PlayerC}', desc: 'c국 국가장 지정', role: A },
];
export const step5Core: Cmd[] = [
  { cmd: '/nation core status', desc: '레벨·HP·좌표·다음 강화 비용', role: M },
  { cmd: '/nation core relocate', desc: '현재 위치로 Core 이전 (배치 검사)', role: L },
  { cmd: '/nation core upgrade', desc: '낱개 다이아몬드로 한 단계 즉시 결제', role: L },
];

export const step6Cmds: Cmd[] = [
  { cmd: '/war status', desc: '상태·예약·남은 시간', role: P },
  { cmd: '/war diagnostics', desc: '국가·Core 배치·스폰·예약 진단', role: A },
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

export const refAdmin: CmdGroup[] = [{
  title: '관리자: 국가·플레이어·Core',
  cmds: [
    { cmd: '/seasonadmin', desc: '관리자 상자 메뉴; 플레이어 접속 상태에서 사용', role: A },
    { cmd: '/seasonadmin gui', desc: '관리자 상자 메뉴 (위와 동일)', role: A },
    { cmd: '/seasonadmin create <id> <이름> <minX> <maxX> <minZ> <maxZ> <chunkX> <chunkZ> <minY> <maxY>', desc: '국가 생성·Core 자동 배치 시도', role: A },
    { cmd: '/seasonadmin rename <id> <이름...>', desc: '표시 이름 변경; ID 변경 아님', role: A },
    { cmd: '/seasonadmin territory <id> <minX> <maxX> <minZ> <maxZ>', desc: '영토 변경; 기존 안전 청크·Core 배치 유지 필요', role: A },
    { cmd: '/seasonadmin safezone <id> <chunkX> <chunkZ> <minY> <maxY>', desc: '안전구역 변경; 기본 설정에서는 Core 몸체와 겹칠 수 없음', role: A },
    { cmd: '/seasonadmin leader <id> <대상>', desc: '해당 국가 구성원을 국가장 지정', role: A },
    { cmd: '/seasonadmin assign <대상> <id>', desc: '균형 무시 강제 배정', role: A },
    { cmd: '/seasonadmin reset <대상>', desc: '소속·국가장 해제; 온라인이면 중립 이동', role: A, danger: '결과: 소속과 국가장 직위가 사라집니다. 서버 밴은 해제되지 않습니다.' },
    { cmd: '/seasonadmin player <대상>', desc: '소속·역할·가입 가능 상태 확인', role: A },
    { cmd: '/seasonadmin nation <id>', desc: '국가·영토·안전구역·Core 상세 확인', role: A },
    { cmd: '/seasonadmin respawncore <id>', desc: 'ACTIVE Core 개체 복구; 저장 HP·레벨·좌표 유지', role: A },
    { cmd: '/seasonadmin tpcore <id>', desc: '저장된 활성 Core 위치로 이동; 플레이어 전용', role: A },
    { cmd: '/seasonadmin neutralspawn', desc: '현재 플레이어 위치를 중립 스폰 기준으로 설정', role: A },
    { cmd: '/seasonadmin neutralspawn <x> <y> <z>', desc: '지정 좌표로 중립 스폰 기준 설정', role: A },
    { cmd: '/seasonadmin diagnostics', desc: '종합 진단; /war diagnostics와 같음', role: A },
    { cmd: '/seasonadmin deactivate <id>', desc: '국가 영구 탈락; 같은 시즌 재활성화 불가', role: A, danger: '결과: 해당 국가는 이번 시즌에서 영구 탈락하며 되돌릴 수 없습니다.' },
  ],
}];

export const refAdminNote = [
  '생성·이름·영토·안전구역·국가장·중립 스폰·수동 탈락은 NORMAL/PREPARATION에서 수행한다.',
  '강제 배정은 WAR에서도 가능하지만 SEASON_END에서는 불가. 소속 reset·ACTIVE Core 복구는 WAR에서도 가능하므로 전쟁 중에는 결과를 확인하며 사용한다.',
  'respawncore는 지형을 수리하거나 HP를 최대치로 바꾸는 명령이 아니다. 탈락국을 살리지 않는다.',
];

export const refWar: CmdGroup[] = [{
  title: '관리자: 전쟁',
  note: '기간 예: 30s, 5m, 2h, 1d. 현재 시간부터 계산한다.',
  cmds: [
    { cmd: '/war prepare', desc: 'NORMAL에서 준비 즉시 시작', role: A },
    { cmd: '/war prepare <기간>', desc: '지금부터 해당 기간 뒤 준비 예약; NORMAL에서 설정', role: A },
    { cmd: '/war start', desc: 'Core·스폰 검사 후 전쟁 즉시 시작', role: A },
    { cmd: '/war start <기간>', desc: '지금부터 해당 기간 뒤 전쟁 예약', role: A },
    { cmd: '/war cancel', desc: '준비·전쟁 예약만 취소; 현재 단계 유지', role: A, danger: '결과: 예약만 지워지고 현재 단계는 그대로 유지됩니다.' },
    { cmd: '/war end', desc: 'NORMAL 복귀·예약 취소·생존 Core 회복; SEASON_END에서는 거절', role: A, danger: '결과: NORMAL로 돌아가고 예약이 취소되며 생존 Core가 회복됩니다.' },
    { cmd: '/war diagnostics', desc: '국가·Core 배치·스폰·예약 진단', role: A },
  ],
}, {
  title: '고급: 상태 강제 전환',
  note: '시즌 리셋 버튼이 아닙니다. 평소 운영에는 /war prepare, /war start를 사용하세요.',
  cmds: [
    { cmd: '/war state NORMAL', desc: '관리자 NORMAL 전환; 탈락국 복구 아님', role: A, danger: '결과: 단계만 NORMAL로 바뀌며 탈락한 국가는 복구되지 않습니다.' },
    { cmd: '/war state PREPARATION', desc: '일반 준비 시작 규칙으로 전환', role: A, danger: '결과: 준비 단계가 시작되어 타국 영토 진입 제한이 적용됩니다.' },
    { cmd: '/war state WAR', desc: '일반 전쟁 시작 검증을 거쳐 전환; 검증 우회 아님', role: A, danger: '결과: 검증 통과 시 전쟁이 시작되어 Core 전투가 열립니다.' },
    { cmd: '/war state SEASON_END', desc: '종료 단계 강제 지정; 자동 우승 판정 명령 아님', role: A, danger: '결과: 시즌 종료 단계로 고정되며 우승 판정은 하지 않습니다.' },
  ],
}];

export const refPlayers: Cmd[] = [
  { cmd: '/nation', desc: '국가 메뉴', role: P },
  { cmd: '/nation status', desc: '내 국가·게임 상태', role: P },
  { cmd: '/nation join', desc: '가입 메뉴·확인/취소', role: P },
  { cmd: '/nation join <id>', desc: '즉시 가입; NORMAL/PREPARATION·인원 균형 검사', role: P },
  { cmd: '/nation members', desc: '구성원·UUID·국가장 확인', role: M },
  { cmd: '/nation core', desc: 'Core 메뉴', role: M },
  { cmd: '/nation core status', desc: '레벨·HP·좌표·다음 강화 비용', role: M },
  { cmd: '/war', desc: '상태·예약·남은 시간', role: P },
  { cmd: '/war status', desc: '상태·예약·남은 시간 (위와 동일)', role: P },
  { cmd: '/nation core relocate', desc: '현재 위치로 Core 이전', role: L },
  { cmd: '/nation core upgrade', desc: '낱개 다이아몬드로 다음 단계 즉시 결제', role: L },
  { cmd: '/nation expel', desc: '추방 메뉴', role: L },
  { cmd: '/nation expel <대상>', desc: '영구 밴 경고만 표시; 아직 추방 안 함', role: L },
  { cmd: '/nation expel <대상> confirm', desc: '자국 다른 구성원 영구 서버 UUID 밴 + 소속 제거', role: L, danger: '결과: 대상이 서버에서 영구 밴되고 소속도 제거됩니다. 국가에서만 내보내는 명령이 아닙니다.' },
];
export const refPlayersNote = '추방은 WAR/SEASON_END에도 가능하다. 자기 자신·타국원은 추방 불가. 관리자 /pardon <이름>으로 밴 해제 후 복귀해도 소속은 무소속이며, 인벤토리·발전과제는 추방으로 삭제되지 않는다.';

export const refVanilla: Cmd[] = [
  { cmd: '/op <대상>', desc: '관리자 권한 부여', role: A },
  { cmd: '/deop <대상>', desc: '권한 해제; 일반 보호 테스트 전 수행', role: A },
  { cmd: '/gamemode survival <대상>', desc: '일반 참가자 테스트 모드', role: A },
  { cmd: '/tp <대상> <x> <y> <z>', desc: '위치 이동', role: A },
  { cmd: '/give <대상> minecraft:diamond <수량>', desc: '강화 시험용 다이아 지급', role: A },
  { cmd: '/worldborder center <x> <z>', desc: '월드 경계 중심', role: A },
  { cmd: '/worldborder set <크기>', desc: '월드 경계 크기', role: A },
  { cmd: '/setworldspawn <x> <y> <z>', desc: '바닐라 월드 스폰', role: A },
  { cmd: '/pardon <이름>', desc: '서버 밴 해제; 국가 소속 복구 아님', role: A },
  { cmd: '/stop', desc: '정상 종료·재시작/백업 전 사용', role: A, danger: '결과: 서버가 종료됩니다.' },
];

export const coreLevels = [
  ['0', '800', '없음'],
  ['1', '1200', '다이아 64개'],
  ['2', '1600', '추가 128개'],
  ['3', '2000', '추가 192개'],
];
export const coreRules = [
  '전체 강화 비용 384개. 강화 시 새 최대 HP로 회복. 다이아 블록·셜커 내부는 계산하지 않는다. 설정으로 HP·비용 변경 가능.',
  'Core는 움직이지 않는 바닐라 철 골렘. 실제 승패 HP는 모드 저장값이며 바닐라 체력이나 개체 소실로 탈락하지 않는다. /kill로 Core 파괴 시험을 하지 않는다.',
  'NORMAL/PREPARATION에서는 Core HP 피해 불가. WAR에서 적 플레이어 근접·투사체·폭발 피해 가능. 기본 자국 Core 직접 피해는 차단된다. 귀속되지 않는 폭발·몹 등 환경 피해는 별도로 허용된다.',
  'Core 기본 몸체는 모든 ACTIVE 안전구역 밖이어야 한다. allowCoreInSafeZone=false 기본값을 유지한다. allowOwnCoreDamage=false가 기본이다.',
  '안전구역 보호는 국가가 ACTIVE인 동안 WAR에도 유지되며, 탈락 즉시 해제된다.',
  'NORMAL과 WAR의 일반 영토는 PvP·상자 열기·약탈·파괴·설치·TNT가 허용된다. 영토 전체가 보호되는 시스템이 아니다.',
  '리스폰은 국가 안전구역 또는 무소속 중립 스폰이다. 침대 등으로 이벤트 리스폰을 우회할 수 없다.',
  '자동 다음 전쟁, 전체 시즌 리셋, 월드 재생성, 금고(Vault), 경제·상점·동맹은 없다. Nether/End 차단·TNT 제작 제한·농장 관리도 이 모드 담당이 아니다.',
];

export const troubles = [
  ['Core 생성 대기/없음', '/seasonadmin nation <id> → 자기 영토·하늘·바닥·공간 점검 → /seasonadmin respawncore <id> → 진단'],
  ['전쟁 시작 실패', '/war diagnostics → ACTIVE 수·Core 배치·국가/중립 스폰 점검'],
  ['예정 시간이 지났는데 전쟁 안 시작', '/war status와 서버 로그 확인. 배치·스폰 검증 실패로 예약이 취소됐다면 원인을 고친 뒤 다시 예약. 저장·런타임 장애는 예약 유지/재시도될 수 있음'],
  ['가입 거절', '게임 단계·기존 소속·ACTIVE 인원 차이 확인. 심한 불균형은 관리자 배정으로 조정'],
  ['보호가 안 보임', '테스트 계정 OP 여부, 정확한 월드·청크·발 Y, 국가 ACTIVE 여부 확인'],
  ['국가장 기능 거절', '실제 국가장 UUID, 현재 소속, NORMAL/PREPARATION 여부 확인'],
  ['귀환/리스폰이 중립으로 감', '본국 안전 스폰의 바닥·빈 공간·점유 확인. WAR 중 필수 본국 귀환은 본국이 안전해지면 재시도하므로 즉시 실패로 단정하지 않기'],
  ['저장됐지만 후속 작업 실패 안내', '조회 명령으로 현재 저장 상태부터 확인. 생성·결제 명령을 무작정 반복하지 않기'],
  ['추방 후 접속 불가', '/pardon <이름>으로 서버 밴 해제. reset은 밴 해제 아님'],
  ['탈락국을 다시 쓰고 싶음', '같은 시즌 재활성화·같은 ID 재생성 불가. 정상 종료 후 사전 백업 복원 또는 새 운영 월드/새 시즌 데이터 준비'],
];
export const backupNotes = [
  '실행 중인 JSON을 직접 편집하지 않는다. 정상 종료 후 백업하고 수정·복원한다.',
  '월드, config/stime-seasonal-war.json, 밴 목록은 같은 시점으로 보관한다. 모드 상태·인벤토리·밴은 별도 저장소여서 크래시 시 완전한 동시 저장이 보장되지는 않는다.',
  '설정 파일의 국가 목록은 최초 시즌 상태 생성용이다. 이미 저장된 시즌의 국가 운영은 명령어를 사용한다. 전용 설정 reload·시즌 reset·국가 부활 명령은 없다.',
  'HP 설정을 낮출 때는 기존 저장 HP와 충돌할 수 있으므로 백업 후 데이터를 확인한다. Bedrock 이름·UUID 연속성, 메뉴 클릭·Core 공격은 실제 배포 스택에서 확인한다.',
];

