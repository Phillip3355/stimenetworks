import type { Metadata } from 'next';
import ServerDetail from '../../components/ServerDetail';
import { getServerBySlug, getServerMetadata } from '../../shared/serverGroup.mjs';
export const metadata: Metadata = getServerMetadata(getServerBySlug('the-great-war'), { title: 'The Great War', description: 'StimeMC가 개발 및 운영 준비 중인 전쟁 중심 서버. Geyser 기반 Java × Bedrock 크로스플레이를 공유하며, 접속 정보와 별도 규정은 미공개입니다.' });
export default function GreatWarPage() { return <ServerDetail server={getServerBySlug('the-great-war')!} />; }
