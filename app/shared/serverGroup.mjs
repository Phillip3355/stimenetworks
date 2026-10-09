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

// Lifecycle identifies the world; operation status is a published registry
// statement, never live telemetry. Publication still requires its own gate.
export function getServerPresentation(server) {
  const planned = server?.lifecycle === 'planned';
  const active = server?.lifecycle === 'current' && server.status === 'active';
  const preparing = server?.lifecycle === 'current' && server.status === 'preparing';
  const label = planned ? 'PLANNED / COMING LATER' : active ? 'CURRENT / ACTIVE' : preparing ? 'CURRENT / PREPARING' : 'STATUS UNPUBLISHED';
  const statusKo = planned ? '추가 계획 중 · 출시 일정과 버전 미정' : active ? '운영 중' : preparing ? '운영 준비 중' : '운영 현황 미공개';
  const statusEn = planned ? 'Planned · Release date and version undecided' : active ? 'Active' : preparing ? 'Preparing to operate' : 'Operation status unpublished';
  const connectionPublished = ['Java', 'Bedrock'].some(edition => getConnectionPresentation(server, edition).canCopy);
  const connectionKo = connectionPublished ? '접속 정보 공개' : '접속 정보 미공개';
  const connectionEn = connectionPublished ? 'Connection information published' : 'Connection information unpublished';
  const confirmed = value => active && typeof value === 'string' && value.trim() ? value.trim() : null;
  const version = confirmed(server?.version);
  const release = confirmed(server?.release);
  return {
    planned, active, preparing, label, statusKo, statusEn, connectionPublished,
    connectionKo, connectionEn, version, release,
    detailStateKo: planned ? statusKo : `${statusKo} · ${connectionKo}`,
    detailStateEn: planned ? statusEn : `${statusEn} · ${connectionEn}`,
    guidanceKo: planned ? '출시 일정, 버전, 접속 정보는 아직 확정되지 않았습니다. 계획이 공개되면 StimeMC 소식에서 확인할 수 있습니다.' : preparing ? 'CURRENT는 StimeMC의 현재 서버를 뜻하며, 온라인 상태를 나타내지 않습니다. 서버의 접속 정보와 버전은 아직 공개되지 않았습니다.' : `CURRENT는 StimeMC의 현재 서버를 뜻하며, 온라인 상태를 나타내지 않습니다. ${connectionKo}. ${version ? `버전: ${version}` : '버전 미공개'}. ${release ? `출시: ${release}` : '출시 일정 미정'}.`,
    guidanceEn: planned ? 'Release date, version and connection information have not been confirmed. Follow StimeMC news for published plans.' : preparing ? 'CURRENT identifies StimeMC’s current server; it does not indicate an online status. Connection information and version have not been published.' : `CURRENT identifies StimeMC’s current server; it does not indicate an online status. ${connectionEn}. ${version ? `Version: ${version}` : 'Version unpublished'}. ${release ? `Release: ${release}` : 'Release date undecided'}.`,
  };
}

export function getServerGroupPresentation(records = servers) {
  const hasActive = records.some(server => getServerPresentation(server).active);
  const summaryKo = records.map(server => `${server.name} · ${getServerPresentation(server).statusKo}`).join(' / ');
  const summaryEn = records.map(server => `${server.name} · ${getServerPresentation(server).statusEn}`).join(' / ');
  return {
    hasActive,
    descriptionKo: hasActive ? `StimeMC는 여러 Minecraft 서버를 운영하는 커뮤니티입니다. ${summaryKo}.` : brandProfile.descriptionKo,
    descriptionEn: hasActive ? `StimeMC is a community of Minecraft servers. ${summaryEn}.` : brandProfile.descriptionEn,
    worldsKo: hasActive ? 'StimeMC의 서버와 각 세계의 운영 현황을 만나보세요.' : '지금 준비하는 세계와 앞으로 더해질 세계를 만나보세요.',
    worldsEn: hasActive ? 'Explore StimeMC’s worlds and each server’s operation status.' : 'Meet the world in preparation and the world planned to follow.',
    joinTitleKo: hasActive ? '같이할 세계를 만나보세요' : '같이할 세계를 준비합니다',
    joinTitleEn: hasActive ? 'Find your next world' : 'Your next world is in preparation',
    joinDescriptionKo: hasActive ? `${summaryKo}. 서버 현황과 에디션별 안내를 먼저 확인하세요.` : 'The Great War는 운영 준비 중이며 Survival은 추가 계획 중입니다. 서버 현황과 에디션별 안내를 먼저 확인하세요.',
    joinDescriptionEn: hasActive ? `${summaryEn}. Check each server’s status and edition guide first.` : 'The Great War is preparing to operate; Survival is planned for later. Check each server’s status and edition guide first.',
  };
}

export function getServerMetadata(server, fallback) {
  const presentation = getServerPresentation(server);
  if (!presentation.active) return fallback;
  return {
    title: server.name,
    description: `${server.descriptionKo} ${presentation.detailStateKo}. Geyser 기반 Java × Bedrock 크로스플레이. ${presentation.version ? `버전: ${presentation.version}.` : '버전 미공개.'} ${presentation.release ? `출시: ${presentation.release}.` : '출시 일정 미정.'}`,
  };
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
