export const requiredNavigationPaths = [
  '/',
  '/join',
  '/support',
  '/taskboard',
  '/voice',
  '/server-mechanism',
  '/rules',
  '/recovery-guidelines',
  '/updates',
];

export const serverProfile = {
  editions: ['Java', 'Bedrock'],
  modScope: 'server-side',
  clientModRequired: false,
  accessModel: 'open',
  kickerKo: 'Java · Bedrock · 클라이언트 모드 불필요',
  kickerEn: 'Java · Bedrock · No client mods required',
  playerPromiseKo:
    '별도 모드 설치 없이 Java와 Bedrock 어디서든 접속해, 확장된 콘텐츠를 자유롭게 즐길 수 있습니다.',
  playerPromiseEn:
    'Join from Java or Bedrock without installing client mods, then explore expanded content your way.',
};

export const navigationGroups = [
  {
    id: 'start',
    labelKo: '시작하기',
    labelEn: 'Start',
    links: [
      { href: '/', labelKo: '홈', labelEn: 'Home' },
      { href: '/join', labelKo: '서버 가입', labelEn: 'Join Server' },
      { href: '/support', labelKo: '1:1 문의', labelEn: 'Support' },
      { href: '/taskboard', labelKo: '관리자', labelEn: 'Admin' },
    ],
  },
  {
    id: 'live',
    labelKo: '라이브',
    labelEn: 'Live',
    links: [
      { href: '/voice', labelKo: 'STAGE 채널', labelEn: 'STAGE Channels' },
    ],
  },
  {
    id: 'discover',
    labelKo: '서버 안내',
    labelEn: 'Discover',
    links: [
      {
        href: '/server-mechanism',
        labelKo: '서버 메커니즘',
        labelEn: 'Server Mechanism',
      },
      { href: '/rules', labelKo: '서버 규칙', labelEn: 'Rules' },
      {
        href: '/recovery-guidelines',
        labelKo: '복구 가이드',
        labelEn: 'Recovery Guide',
      },
      { href: '/updates', labelKo: '업데이트', labelEn: 'Updates' },
    ],
  },
];

export const homeFeatures = [
  {
    id: 'cross-edition',
    index: '01',
    eyebrowKo: '하나의 월드 · 두 개의 에디션',
    eyebrowEn: 'One World · Two Editions',
    titleKo: 'Java와 Bedrock이 한곳에서 만납니다',
    titleEn: 'Java and Bedrock meet in one world',
    descriptionKo:
      'PC의 Java 에디션과 모바일·콘솔의 Bedrock 에디션이 같은 월드에 접속합니다. 사용하는 기기가 달라도 친구와 만나 함께 건축하고 탐험할 수 있습니다.',
    descriptionEn:
      'Java players on PC and Bedrock players on mobile or console share the same world, so different devices never keep friends apart.',
    images: ['/image.png', '/image copy.png'],
    imageAltsKo: [
      '구름 위에서 내려다본 StimeMC 월드와 다양한 건축물 전경',
      '여러 생물군계와 건축 구역이 이어진 StimeMC 월드의 항공 전경',
    ],
    imageAltsEn: [
      'An aerial view of the StimeMC world and its many player-built structures',
      'A wide aerial view of connected biomes and building districts in StimeMC',
    ],
    href: '/server-mechanism',
    direction: 1,
  },
  {
    id: 'evolving-world',
    index: '02',
    eyebrowKo: '계속 변화하는 월드',
    eyebrowEn: 'An Evolving World',
    titleKo: '새로운 건축물, 새로운 모드',
    titleEn: 'New builds, new ways to play',
    descriptionKo:
      '플레이어가 만든 건축물로 월드의 풍경이 계속 바뀌고, 서버사이드 모드가 새로운 기능과 발견을 더합니다. 별도 설치 없이 접속할 때마다 달라진 장면을 만나보세요.',
    descriptionEn:
      'Player-built landmarks keep reshaping the world while server-side mods add fresh discoveries, all without installing anything extra.',
    images: ['/image copy 3.png', '/image copy 2.png', '/image copy 5.png'],
    imageAltsKo: [
      '분수와 농장, 주택이 모여 있는 StimeMC 생활 구역',
      '네더 블록과 불길로 꾸며진 StimeMC의 새로운 체험 구역',
      '밤하늘 아래 빛나는 서버사이드 모드 건축물과 연결 구조',
    ],
    imageAltsEn: [
      'A StimeMC neighborhood filled with a fountain, farms, and player homes',
      'A new StimeMC discovery area built with Nether blocks and fire',
      'Illuminated server-side mod structures and connections beneath the night sky',
    ],
    href: '/server-mechanism',
    direction: -1,
  },
  {
    id: 'peaceful-rules',
    index: '03',
    eyebrowKo: '평화로운 플레이',
    eyebrowEn: 'Peaceful Play',
    titleKo: '체계적인 규칙이 자유로운 플레이를 지킵니다',
    titleEn: 'Clear rules protect the way you play',
    descriptionKo:
      '플레이 방해, 테러, 건축물 파괴와 핵 사용을 명확하게 제한합니다. 서로의 시간과 창작물을 존중하는 기준 안에서 안심하고 오래 머물 수 있습니다.',
    descriptionEn:
      'Clear limits on disruption, griefing, build destruction, and cheats protect every player’s time and creations.',
    images: ['/image copy 4.png'],
    imageAltsKo: [
      '노을 아래 플레이어 건축물과 농장이 이어지는 StimeMC 월드',
    ],
    imageAltsEn: [
      'Player builds and farms stretching across the StimeMC world at sunset',
    ],
    href: '/rules',
    direction: 1,
  },
];

export const ruleMindMap = {
  root: {
    titleKo: 'StimeMC 서버 규칙',
    titleEn: 'StimeMC Server Rules',
    descriptionKo: '규칙을 선택하면 자세한 기준과 예시를 확인할 수 있습니다.',
    descriptionEn: 'Select a rule to see its full guidance and examples.',
  },
  nodes: [
    {
      id: 'player-interference',
      index: '01',
      titleKo: '다른 플레이어의 플레이 방해 금지',
      titleEn: 'Do Not Disrupt Other Players',
      descriptionKo:
        '상대의 동의 없이 플레이에 직접 개입하거나 진행을 방해할 수 없습니다. 그만해 달라는 요청을 받으면 즉시 행동을 멈춰야 합니다.',
      descriptionEn:
        'Do not interfere with another player or block their progress without consent. Stop immediately when someone asks you to stop.',
      examplesKo: [
        '허락 없는 살인 또는 데미지 입히기',
        '불토깨기, 길막, 가두기',
        '이동 수단이나 진행 경로를 고의로 파괴하기',
      ],
      examplesEn: [
        'Killing or damaging another player without permission',
        'Breaking blocks, blocking paths, or trapping players',
        'Intentionally destroying transport or progression routes',
      ],
    },
    {
      id: 'terrorism',
      index: '02',
      titleKo: '테러 금지',
      titleEn: 'No Griefing or Terrorism',
      descriptionKo:
        '월드나 다른 플레이어에게 광범위한 피해를 주려는 행위와 위협은 실제 피해 발생 여부와 관계없이 금지됩니다.',
      descriptionEn:
        'Actions or threats intended to cause widespread damage to the world or its players are prohibited, even if no damage occurs.',
      examplesKo: [
        '용암·불·폭발물을 이용한 대규모 훼손',
        '핵이나 테러를 예고하며 플레이어를 위협하기',
        '서버 시설을 의도적으로 마비시키기',
      ],
      examplesEn: [
        'Large-scale damage using lava, fire, or explosives',
        'Threatening players with hacks or a planned attack',
        'Intentionally disabling shared server facilities',
      ],
    },
    {
      id: 'build-damage',
      index: '03',
      titleKo: '건축물 파괴 금지',
      titleEn: 'Do Not Damage Builds',
      descriptionKo:
        '허락 없이 다른 플레이어의 건축물과 장식, 공장 구조를 수정하거나 제거할 수 없습니다.',
      descriptionEn:
        'Never alter or remove another player’s builds, decoration, or factory structures without permission.',
      examplesKo: [
        '벽·바닥·장식 블록을 허락 없이 제거하기',
        '공장 배선이나 레드스톤 구조를 망가뜨리기',
        '미완성 건축물도 주인 허락 없이 변경하기',
      ],
      examplesEn: [
        'Removing walls, floors, or decoration without permission',
        'Breaking factory wiring or redstone mechanisms',
        'Changing an unfinished build without its owner’s consent',
      ],
    },
    {
      id: 'property-theft',
      index: '04',
      titleKo: '도둑질·소유물 침해 금지',
      titleEn: 'Respect Player Property',
      descriptionKo:
        '상자 속 아이템뿐 아니라 주민, 가축, 엔티티와 생산 시설도 플레이어의 소유물로 보호됩니다.',
      descriptionEn:
        'Player property includes stored items as well as villagers, animals, entities, and production facilities.',
      examplesKo: [
        '상자·배럴·셜커 상자에서 물건 가져가기',
        '주민이나 가축을 허락 없이 이동·처치하기',
        '농장과 공장의 생산물을 무단으로 가져가기',
      ],
      examplesEn: [
        'Taking items from chests, barrels, or shulker boxes',
        'Moving or killing villagers and animals without permission',
        'Taking farm or factory output without consent',
      ],
    },
    {
      id: 'cheating',
      index: '05',
      titleKo: '핵·엑스레이 사용 금지',
      titleEn: 'No Hacks or X-Ray',
      descriptionKo:
        '다른 플레이어보다 부당한 이점을 얻는 외부 프로그램, 변조 클라이언트와 리소스팩은 사용할 수 없습니다.',
      descriptionEn:
        'External tools, modified clients, and resource packs that provide an unfair advantage are not allowed.',
      examplesKo: [
        '비행·자동 공격·이동 속도 핵 사용',
        '광물 위치를 보여주는 엑스레이 사용',
        '핵 클라이언트 설치·공유·사용 권유',
      ],
      examplesEn: [
        'Using flight, combat, or movement hacks',
        'Using X-ray to reveal ore locations',
        'Installing, sharing, or promoting hacked clients',
      ],
    },
    {
      id: 'exploitation',
      index: '06',
      titleKo: '버그·복제 악용 금지',
      titleEn: 'Do Not Exploit Bugs',
      descriptionKo:
        '의도하지 않은 작동을 반복해서 자원이나 이득을 얻지 말고, 발견한 문제는 1:1 문의로 알려주세요.',
      descriptionEn:
        'Do not repeat unintended behavior to gain resources or an advantage. Report discoveries through private support.',
      examplesKo: [
        '아이템·화폐·엔티티 복제',
        '알려진 버그를 반복해 자원 얻기',
        '과도한 엔티티를 소환해 서버에 부담 주기',
      ],
      examplesEn: [
        'Duplicating items, currency, or entities',
        'Repeatedly using a known bug to gain resources',
        'Spawning excessive entities that harm server performance',
      ],
    },
    {
      id: 'communication',
      index: '07',
      titleKo: '불쾌한 언행 금지',
      titleEn: 'Keep Communication Respectful',
      descriptionKo:
        '누구나 편하게 대화할 수 있도록 공격적인 언행과 분쟁을 유도하는 주제를 피해야 합니다.',
      descriptionEn:
        'Avoid aggressive language and topics intended to provoke conflict so everyone can communicate comfortably.',
      examplesKo: [
        '욕설·비방·저격·도배',
        '정치 이야기나 반복적인 싸움 유도',
        '동의 없이 다른 사람의 실명 언급',
      ],
      examplesEn: [
        'Profanity, insults, targeting, or spam',
        'Political arguments or repeatedly provoking fights',
        'Sharing another person’s real name without consent',
      ],
    },
    {
      id: 'solicitation',
      index: '08',
      titleKo: '타게임·타서버 권유 금지',
      titleEn: 'No External Solicitation',
      descriptionKo:
        'StimeMC 커뮤니티에서 다른 게임이나 서버로 사람을 모집하거나 반복적으로 이동을 권유할 수 없습니다.',
      descriptionEn:
        'Do not recruit StimeMC members for other games or servers, or repeatedly pressure them to leave.',
      examplesKo: [
        '다른 서버 주소나 초대 링크 반복 공유',
        '플레이 중인 사람에게 다른 서버 이동 권유',
        '커뮤니티 채팅을 외부 모집에 사용하기',
      ],
      examplesEn: [
        'Repeatedly sharing another server address or invite link',
        'Pressuring active players to move to another server',
        'Using community chat for outside recruitment',
      ],
    },
  ],
};

export function getRuleDetail(ruleId, language = 'ko') {
  const node =
    ruleMindMap.nodes.find((rule) => rule.id === ruleId) ??
    ruleMindMap.nodes[0];
  const isKorean = language === 'ko';

  return {
    id: node.id,
    index: node.index,
    title: isKorean ? node.titleKo : node.titleEn,
    description: isKorean ? node.descriptionKo : node.descriptionEn,
    examples: isKorean ? node.examplesKo : node.examplesEn,
  };
}
