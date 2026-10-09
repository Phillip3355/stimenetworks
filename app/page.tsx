import type { Metadata } from 'next';
import Hero from './components/Hero';
import ServerWorlds from './components/ServerWorlds';
import ServerDirections from './components/ServerDirections';
import CrossplayBridge from './components/CrossplayBridge';
import HomeArchive from './components/HomeArchive';
import HomeNews from './components/HomeNews';
import HomeGuide from './components/HomeGuide';
import { getPublishedReports } from './server/reports';
import { loadHomeReports } from './server/homeReports.mjs';
import { getServerGroupPresentation } from './shared/serverGroup.mjs';

export const dynamic = 'force-dynamic';
const group = getServerGroupPresentation();
export const metadata: Metadata = {
  title: 'StimeMC — One community. More worlds.',
  description: group.hasActive ? group.descriptionKo : '여러 세계, 하나의 Stime. The Great War는 운영 준비 중, Survival은 추가 계획 중인 Geyser 크로스플레이 서버 그룹입니다.',
};

export default async function Home() {
  const news = await loadHomeReports((signal: AbortSignal) =>
    getPublishedReports().limit(3).abortSignal(signal));
  return (
    <main>
      <Hero />
      <ServerWorlds reveal />
      <ServerDirections />
      <CrossplayBridge />
      <HomeArchive />
      <HomeNews {...news} />
      <HomeGuide />
    </main>
  );
}
