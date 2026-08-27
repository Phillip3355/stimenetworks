export const requiredNavigationPaths = [
  '/',
  '/join',
  '/support',
  '/server-mechanism',
  '/rules',
  '/recovery-guidelines',
  '/updates',
  '/news',
  '/history',
];

export const historyEntries = [
  {
    year: '2023.04',
    labelKo: '첫 번째 서버',
    labelEn: 'The first server',
    titleKo: '작은 Bedrock 서버로 시작했습니다',
    titleEn: 'It began as a small Bedrock server',
    descriptionKo:
      'Synology DS718+에서 네 명이 처음으로 함께한 소규모 Bedrock 서버였습니다. 연말에 서버는 사실상 문을 닫았지만, 직접 호스팅하고 운영하며 쌓은 경험은 다음 서버를 만들 출발점이 되었습니다.',
    descriptionEn:
      'Four players shared a small Bedrock server running on a Synology DS718+. The server effectively closed at the end of the year, but the hands-on hosting experience became the foundation for everything that followed.',
    pointsKo: ['Synology DS718+', '4명의 초기 멤버', '서버 호스팅을 배우기 시작한 시기'],
    pointsEn: ['Synology DS718+', 'Four founding players', 'The beginning of our hosting experience'],
  },
  {
    year: '2024.03',
    labelKo: '새로운 시작',
    labelEn: 'A new beginning',
    titleKo: 'Java 서버로 다음 장을 열었습니다',
    titleEn: 'The next chapter opened with Java',
    descriptionKo:
      '새로운 다섯 명과 Java 서버를 시작했습니다. 이때의 멤버들이 훗날 Stime 161에 합류했고, 초기에는 지인만 초대하는 폐쇄적인 운영 방식을 택했습니다.',
    descriptionEn:
      'A new Java server started with five players. Many of those early members later joined Stime 161, while the server itself remained deliberately closed to friends and invited guests.',
    pointsKo: ['새로운 5인 구성', '초기 멤버 다수 합류', '지인 중심의 폐쇄적 운영'],
    pointsEn: ['A new group of five', 'Many early members joined later', 'A private, invite-only community'],
  },
  {
    year: '2024.08',
    labelKo: 'Stime 161',
    labelEn: 'Stime 161',
    titleKo: '첫 번째 이름을 얻었습니다',
    titleEn: 'The project found its first name',
    descriptionKo:
      '당시 운영하던 스튜디오 이름 Stime과 2023년 서버 IP의 일부였던 161을 합쳐 Stime 161이 출범했습니다. Fabric과 DS718+를 유지한 Java 전용 서버였고, 처음으로 면접을 통해 새로운 플레이어를 받기 시작했습니다.',
    descriptionEn:
      'Stime 161 combined the name of the studio we were running with “161”, part of the 2024 server address. It remained a Java-only Fabric server on the DS718+, but introduced interviews for new players.',
    pointsKo: ['Stime + IP 일부 161', 'Fabric 기반 Java 서버', '면접을 통한 멤버 합류'],
    pointsEn: ['Stime + “161” from the old address', 'Fabric-based Java server', 'Interviews for new members'],
  },
  {
    year: '2026.03',
    labelKo: 'Stime Networks',
    labelEn: 'Stime Networks',
    titleKo: '닫힌 서버에서 열린 네트워크로',
    titleEn: 'From a closed server to an open network',
    descriptionKo:
      '더 개방적인 운영을 위해 Stime Networks로 이름을 바꾸고, Paper 서버에 Geyser를 더해 Bedrock 동시접속을 처음 지원했습니다. DS718+에서 HP i7 시스템으로 이전해 성능도 높였지만, 초기 Geyser 연결은 자주 끊겨 안정성이라는 과제를 남겼습니다.',
    descriptionEn:
      'The name became Stime Networks to mark a more open way of operating. Paper and Geyser enabled our first Java–Bedrock crossplay, while a move from the DS718+ to an HP i7 system improved performance. Early Geyser connections, however, still challenged stability.',
    pointsKo: ['Paper + Geyser 도입', '최초의 Java·Bedrock 동시접속', 'HP i7 시스템으로 이전'],
    pointsEn: ['Paper + Geyser introduced', 'First Java–Bedrock crossplay', 'Upgraded to an HP i7 system'],
  },
  {
    year: '2026.08',
    labelKo: 'StimeMC',
    labelEn: 'StimeMC',
    titleKo: '더 오래, 더 많은 플레이를 위해',
    titleEn: 'Built for longer, richer play',
    descriptionKo:
      '오리지널 Stime과 Minecraft의 MC를 합쳐 StimeMC가 출범했습니다. Fabric 서버에 ViaProxy를 연결하고 다양한 서버사이드 모드를 도입해 콘텐츠가 쉽게 고갈되지 않도록 했습니다. ViaProxy 전환으로 Java·Bedrock 동시접속의 안정성을 높이고, 더 개방적인 커뮤니티를 만들어가고 있습니다.',
    descriptionEn:
      'StimeMC combines the original Stime identity with Minecraft’s “MC”. ViaProxy now fronts a Fabric server filled with server-side mods, creating a world with more room to keep discovering. The new connection layer brings a much more stable crossplay experience as the community opens further.',
    pointsKo: ['Fabric + ViaProxy 구조', '확장되는 서버사이드 콘텐츠', '안정적인 Java·Bedrock 접속'],
    pointsEn: ['Fabric + ViaProxy architecture', 'Growing server-side content', 'Stable Java–Bedrock access'],
  },
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

export const homeIntro = {
  headingKo: '같이 접속하고, 즐길 수 있습니다.',
  headingEn: 'Connect and enjoy it together.',
};

export const serverMechanismFlow = {
  root: {
    eyebrowKo: 'VIAPROXY + GEYSER',
    eyebrowEn: 'VIAPROXY + GEYSER',
    titleKo: '한 번의 접속, 하나의 월드',
    titleEn: 'One connection, one shared world',
    descriptionKo:
      'StimeMC는 ViaProxy 위에서 Geyser를 실행해 Java와 Bedrock 접속을 하나의 Java 서버로 이어줍니다.',
    descriptionEn:
      'StimeMC runs Geyser on ViaProxy to connect Java and Bedrock players to one Java server.',
  },
  nodes: [
    {
      id: 'java',
      index: '01',
      eyebrowKo: 'JAVA EDITION',
      eyebrowEn: 'JAVA EDITION',
      titleKo: 'Java 플레이어는 평소처럼 접속합니다',
      titleEn: 'Java players connect as usual',
      descriptionKo:
        'PC Java 클라이언트의 연결은 ViaProxy를 거쳐 StimeMC의 Java 1.21.1 서버로 전달됩니다.',
      descriptionEn:
        'A PC Java client passes through ViaProxy and reaches StimeMC’s Java 1.21.1 server.',
      pointsKo: ['PC 멀티플레이에서 서버 추가', '접속 버전 1.21.1', '관리자에게 받은 서버 주소 사용'],
      pointsEn: ['Add a server from PC Multiplayer', 'Use version 1.21.1', 'Use the server address provided by an admin'],
    },
    {
      id: 'bedrock',
      index: '02',
      eyebrowKo: 'BEDROCK EDITION',
      eyebrowEn: 'BEDROCK EDITION',
      titleKo: 'Bedrock 접속은 Geyser로 들어옵니다',
      titleEn: 'Bedrock connections enter through Geyser',
      descriptionKo:
        '모바일·Windows·콘솔의 Bedrock 연결은 UDP로 ViaProxy에 도착하고, Geyser가 Java 서버가 이해할 수 있는 흐름으로 바꿉니다.',
      descriptionEn:
        'Bedrock connections from mobile, Windows, or consoles arrive at ViaProxy over UDP, then Geyser translates the flow for the Java server.',
      pointsKo: ['Bedrock 서버 추가 화면에서 주소와 포트 입력', '클라이언트에 별도 모드 설치 불필요', 'Java 플레이어와 같은 월드에서 플레이'],
      pointsEn: ['Enter the address and port in Add Server', 'No client-side mod installation', 'Play in the same world as Java players'],
    },
    {
      id: 'viaproxy',
      index: '03',
      eyebrowKo: 'THE PROXY LAYER',
      eyebrowEn: 'THE PROXY LAYER',
      titleKo: 'ViaProxy가 앞단에서 연결을 정리합니다',
      titleEn: 'ViaProxy organizes the connection at the edge',
      descriptionKo:
        'ViaProxy는 플레이어와 실제 서버 사이에 서서 서로 다른 연결 버전을 중계합니다. 덕분에 StimeMC의 서버사이드 모드와 Java 1.21.1 월드는 그대로 유지됩니다.',
      descriptionEn:
        'ViaProxy sits between players and the backend to relay different connection versions, while StimeMC keeps its server-side mods and Java 1.21.1 world intact.',
      pointsKo: ['플레이어 → ViaProxy → Java 서버', '서버사이드 모드는 서버에서만 작동', '접속 경로를 한 곳에서 관리'],
      pointsEn: ['Player → ViaProxy → Java server', 'Server-side mods run on the server', 'One managed connection path'],
    },
    {
      id: 'geyser',
      index: '04',
      eyebrowKo: 'THE TRANSLATOR',
      eyebrowEn: 'THE TRANSLATOR',
      titleKo: 'Geyser가 두 언어를 실시간으로 번역합니다',
      titleEn: 'Geyser translates both game languages in real time',
      descriptionKo:
        'Geyser는 Bedrock의 데이터를 Java 서버가 이해하는 형식으로 번역하고, 서버에서 돌아오는 데이터를 다시 Bedrock에 맞춰 전달하는 브리지입니다.',
      descriptionEn:
        'Geyser is the bridge that translates Bedrock data into a format the Java server understands, then sends the server response back to Bedrock.',
      pointsKo: ['이동·블록·엔티티 데이터를 양방향 변환', 'Java 서버 기능을 Bedrock 플레이어에게 전달', '두 에디션의 연결 차이를 흡수'],
      pointsEn: ['Translate movement, blocks, and entities both ways', 'Deliver Java server features to Bedrock players', 'Absorb protocol differences between editions'],
    },
    {
      id: 'notes',
      index: '05',
      eyebrowKo: 'KEEP IN MIND',
      eyebrowEn: 'KEEP IN MIND',
      titleKo: '같아도, 아주 조금 다를 수 있습니다',
      titleEn: 'The world is shared, but a few details can differ',
      descriptionKo:
        '전투·레드스톤·리소스팩처럼 에디션 고유 동작은 다르게 보일 수 있습니다. Bedrock 접속은 UDP 포트를 사용하므로 안내받은 포트 정보를 정확히 입력해 주세요.',
      descriptionEn:
        'Edition-specific behavior such as combat, redstone, and resource packs can look different. Bedrock uses a UDP port, so enter the port supplied with your connection details.',
      pointsKo: ['문제가 보이면 먼저 공식 제한 사항 확인', 'Bedrock 주소와 포트는 한 쌍으로 입력', '필요할 때 관리자에게 문의'],
      pointsEn: ['Check the official limitations first', 'Enter the Bedrock address and port together', 'Contact an admin when you still need help'],
      href: 'https://geysermc.org/wiki/geyser/current-limitations/',
    },
  ],
};

export const joinConnectionGuide = {
  javaKo:
    '• 접속 버전: 1.21.1 버전\n\nPC 마인크래프트를 실행한 뒤 [멀티플레이] -> [서버 추가] 메뉴로 이동하여 부여받은 서버 주소를 등록하고 접속해 주세요.',
  javaEn:
    '• Connection Version: 1.21.1\n\nLaunch your Java Minecraft client, go to [Multiplayer] -> [Add Server], input the server address provided by an admin, and connect.',
};

export const navigationGroups = [
  {
    id: 'guide',
    labelKo: '안내',
    labelEn: 'Guide',
    links: [
      { href: '/', labelKo: '홈', labelEn: 'Home' },
      { href: '/rules', labelKo: '서버 규칙', labelEn: 'Rules' },
      { href: '/recovery-guidelines', labelKo: '복구 가이드', labelEn: 'Recovery Guide' },
      { href: '/updates', labelKo: '업데이트', labelEn: 'Updates' },
      { href: '/news', labelKo: '뉴스 보기', labelEn: 'News' },
    ],
  },
  {
    id: 'player',
    labelKo: '유저',
    labelEn: 'Players',
    links: [
      { href: '/join', labelKo: '서버 가입', labelEn: 'Join Server' },
      { href: '/support', labelKo: '1:1 문의', labelEn: 'Support' },
    ],
  },
  {
    id: 'technology',
    labelKo: '기술',
    labelEn: 'Technology',
    links: [
      { href: '/server-mechanism', labelKo: '서버 메커니즘', labelEn: 'Server Mechanism' },
      { href: '/history', labelKo: '서버의 역사', labelEn: 'History' },
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

export const homeWorldShowcase = [
  {
    id: 'world-gateway',
    index: '00',
    src: '/image copy 6.png',
    altKo: 'StimeMC 월드의 분위기와 건축물을 넓게 담은 서버 전경',
    altEn: 'A wide server view showing the atmosphere and builds of the StimeMC world',
  },
  {
    id: 'monument',
    index: '01',
    src: '/image copy 7.png',
    altKo: '노을과 별빛 아래 붉게 빛나는 StimeMC의 거대한 성채',
    altEn: 'A monumental StimeMC citadel glowing red beneath the dusk sky',
  },
  {
    id: 'settlement',
    index: '02',
    src: '/image copy 8.png',
    altKo: '숲 위에 세워진 청록색 지붕의 StimeMC 대형 목조 건축물',
    altEn: 'A large StimeMC timber settlement with teal roofs above the forest',
  },
  {
    id: 'sky-realm',
    index: '03',
    src: '/image copy 9.png',
    altKo: '부유섬 사이에서 빛나는 StimeMC의 거대한 공중 구조물',
    altEn: 'A luminous StimeMC structure suspended among shadowy floating islands',
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
