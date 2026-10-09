import type { Metadata } from 'next';
import ServerDetail from '../../components/ServerDetail';
import { getServerBySlug, getServerMetadata } from '../../shared/serverGroup.mjs';
export const metadata: Metadata = getServerMetadata(getServerBySlug('survival'), { title: 'Survival — Coming later', description: 'Vanilla / Vanilla+ 중심의 별도 야생 서버 계획. Survival은 추가 계획 중이며 출시 일정과 버전은 미정입니다. Geyser 크로스플레이를 운영 방향으로 공유합니다.' });
export default function SurvivalPage() { return <ServerDetail server={getServerBySlug('survival')!} />; }
