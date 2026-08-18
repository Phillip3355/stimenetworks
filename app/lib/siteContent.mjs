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
    id: 'cross-platform',
    index: '01',
    eyebrowKo: '하나의 세계',
    eyebrowEn: 'One World',
    titleKo: 'Java와 Bedrock이 함께 만나는 서버',
    titleEn: 'Java and Bedrock, together in one world',
    descriptionKo:
      '플랫폼은 달라도 같은 월드에서 건축하고 탐험할 수 있습니다. 기기별 접속 정보도 명확하게 안내합니다.',
    descriptionEn:
      'Build and explore in the same world across platforms, with clear connection guides for every device.',
    image: '/minecraft.webp',
    href: '/join',
    direction: 1,
  },
  {
    id: 'peaceful-survival',
    index: '02',
    eyebrowKo: '평화로운 생존',
    eyebrowEn: 'Peaceful Survival',
    titleKo: '서두르지 않아도 되는 커뮤니티 중심의 플레이',
    titleEn: 'Community-first survival at your own pace',
    descriptionKo:
      '건축과 교류가 중심이 되는 생존 환경을 운영하며, 공정한 플레이를 위한 서버 보호 시스템을 유지합니다.',
    descriptionEn:
      'A survival world centered on building and community, protected by systems that keep play fair.',
    image: '/minecraft2.webp',
    href: '/server-mechanism',
    direction: -1,
  },
  {
    id: 'connected-support',
    index: '03',
    eyebrowKo: '이어지는 지원',
    eyebrowEn: 'Connected Support',
    titleKo: 'STAGE와 실시간 문의로 운영진과 연결됩니다',
    titleEn: 'Stay connected through STAGE and realtime support',
    descriptionKo:
      '공개 STAGE 채널과 로그인 기반 1:1 문의를 통해 공지, 대화, 문제 해결이 하나의 경험으로 이어집니다.',
    descriptionEn:
      'Public STAGE channels and signed-in support connect announcements, conversation, and problem solving.',
    image: '/NEW2.webp',
    href: '/support',
    direction: 1,
  },
];
