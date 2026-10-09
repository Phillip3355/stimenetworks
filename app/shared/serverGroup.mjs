export const brandProfile = {
  name: 'StimeMC',
  label: 'MINECRAFT SERVER GROUP',
  headingEn: 'ONE COMMUNITY. MORE WORLDS.',
  headingKo: '여러 세계, 하나의 Stime.',
  descriptionKo: 'StimeMC는 여러 Minecraft 서버를 운영하는 커뮤니티입니다. 현재 The Great War를 준비하며, Survival을 별도로 계획하고 있습니다.',
  descriptionEn: 'StimeMC is a community of Minecraft servers. The Great War is in preparation, with Survival planned as a separate world.',
  crossplayKo: '모든 StimeMC 서버는 Geyser를 통한 Java × Bedrock 동시 접속을 운영 방향으로 공유합니다. Survival은 추가 계획 중입니다.',
  crossplayEn: 'Every StimeMC server shares Geyser-powered Java × Bedrock crossplay as its direction. Survival is planned for later.',
};

export const servers = [
  {
    id: 'the-great-war',
    slug: 'the-great-war',
    name: 'THE GREAT WAR',
    lifecycle: 'current',
    status: 'preparing',
    type: 'War',
    descriptionKo: 'StimeMC가 현재 개발 및 운영 준비 중인 전쟁 중심 서버입니다.',
    descriptionEn: 'The war-focused server StimeMC is currently developing and preparing to operate.',
    directionKo: ['한 시즌의 전쟁 중심 플레이를 준비합니다.', '세부 시스템과 별도 규정은 공개 전입니다.'],
    directionEn: ['Preparing a single season of war-focused play.', 'Detailed systems and dedicated rules have not been published.'],
    editions: ['Java', 'Bedrock'],
    crossplay: 'Geyser',
    clientModRequired: false,
    href: '/servers/the-great-war',
    connection: null,
    release: null,
    version: null,
  },
  {
    id: 'survival',
    slug: 'survival',
    name: 'SURVIVAL',
    lifecycle: 'planned',
    status: 'planned',
    type: 'Vanilla / Vanilla+',
    descriptionKo: 'Minecraft 기본 야생 경험을 중심으로 별도 추가를 계획하는 서버입니다. 출시 일정과 버전은 미정입니다.',
    descriptionEn: 'A separate server planned around Minecraft’s core survival experience. Its release date and version are undecided.',
    directionKo: ['Vanilla / Vanilla+ 중심의 야생 플레이를 계획합니다.', '필요한 서버사이드 모드와 데이터팩을 검토합니다.', '별도 클라이언트 모드 없이 플레이하는 방향입니다.'],
    directionEn: ['Planning survival play with a Vanilla / Vanilla+ focus.', 'Considering server-side mods and datapacks where needed.', 'Designed for play without separate client mods.'],
    editions: ['Java', 'Bedrock'],
    crossplay: 'Geyser',
    clientModRequired: false,
    href: '/servers/survival',
    connection: null,
    release: null,
    version: null,
  },
];

export function getServerBySlug(slug) {
  return servers.find((server) => server.slug === slug);
}

// Future published data uses connection.java / connection.bedrock objects.
// Lifecycle and operation status take precedence over any supplied addresses.
export function getConnectionPresentation(server, edition, language = 'ko') {
  // The result is language-neutral; callers translate the returned state.
  void language;
  const unavailable = (state) => ({ state, address: null, port: null, canCopy: false });
  if (server?.lifecycle === 'planned') return unavailable('planned');
  if (server?.lifecycle === 'current' && server.status === 'preparing') return unavailable('preparing');
  if (!server || server.lifecycle !== 'current' || server.status !== 'active') return unavailable('unpublished');
  if (!['Java', 'Bedrock'].includes(edition) || !server.editions?.includes(edition)) return unavailable('unsupported');

  const connection = server.connection?.[edition.toLowerCase()];
  const address = typeof connection?.address === 'string' ? connection.address.trim() : '';
  if (!address) return unavailable('unpublished');
  if (edition === 'Bedrock' && (!Number.isInteger(connection.port) || connection.port < 1 || connection.port > 65535)) return unavailable('unpublished');

  return { state: 'ready', address, port: edition === 'Bedrock' ? connection.port : null, canCopy: true };
}
