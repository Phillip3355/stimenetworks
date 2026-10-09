import type { Metadata } from 'next';
import ServersHub from '../components/ServersHub';
export const metadata: Metadata = { title: 'Servers', description: 'StimeMC의 현재 서버 The Great War와 추가 계획 중인 Survival. 모든 서버가 Geyser 기반 Java × Bedrock 크로스플레이를 공유합니다.' };
export default function ServersPage() { return <ServersHub />; }
