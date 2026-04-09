'use client';

import Hero from './components/Hero';
import ScrollSection from './components/ScrollSection';
import CardsGrid from './components/CardsGrid';

export default function Home() {
  const serverFeatures = [
    {
      title: '평화로운 서바이벌 서버 | Peaceful Survival Server',
      image: '/minecraft1.png',
      description: '플레이어가 건축과 탐험에 집중할 수 있는 평화로운 서바이벌 서버입니다. | A peaceful survival server where players can focus on building and exploring.',
    },
    {
      title: '자바 / 베드락 크로스플레이 | Java & Bedrock Crossplay',
      image: '/minecraft2.png',
      description: '자바와 베드락 플레이어가 모두 서버에 접속할 수 있는 환경입니다. | A server environment that supports both Java and Bedrock players.',
    },
    {
      title: '안정적이고 공정한 운영 | Fair and Stable Operation',
      image: '/minecraft3.png',
      description: '안티 엑스레이와 공정한 규칙으로 모두가 안전하게 즐길 수 있는 서버 환경을 제공합니다. | We provide a safe server environment with anti-xray protection and fair rules.',
    },
  ];

  const communityFeatures = [
    {
      title: '정기적인 이벤트 | Regular Events',
      image: '/minecraft1.png',
      description: '정기적으로 다양한 이벤트가 열리는 커뮤니티로, 플레이어들이 함께 즐길 수 있는 특별한 경험을 제공합니다. | A community with regular events that offers special experiences for players to enjoy together.',
    },
    {
      title: '글로벌 연결 | Global Community',
      image: '/minecraft2.png',
      description: '한국어와 영어 사용자가 함께 즐기는 커뮤니티로, 창작과 소통이 활발한 공간입니다. | A vibrant space for both Korean and English speakers to create and communicate together.',
    },
  ];

  return (
    <main className="mainContainer">
      <Hero />

      <ScrollSection
        title="Stime Networks"
        content={
          <div>
            <p>
              Stime Networks는 자바와 베드락에서 동시에 플레이가 가능한 서버입니다. | Stime Networks is a server where both Java and Bedrock players can play together.
            </p>
            <p>
              모두가 평화롭게 건축과 탐험을 즐기는 환경을 제공합니다. | We provide an environment where everyone can peacefully enjoy building and exploring.
            </p>
          </div>
        }
      />

      <section className="section">
        <h2 className="sectionTitle">서버 기능</h2>
        <CardsGrid cards={serverFeatures} />
      </section>

      <ScrollSection
        title="커뮤니티"
        reverse={true}
        content={
          <div>
            <p>
              누구나 쉽게 접근해서 다른 플레이어와 소통하며 이벤트에 참여할 수 있도록 합니다. | We make it easy for anyone to connect with other players and join events.
            </p>
          </div>
        }
      />

      <section className="section">
        <h2 className="sectionTitle">커뮤니티 기능</h2>
        <CardsGrid cards={communityFeatures} />
      </section>

      <footer className="footer">
        <p>&copy; 2026 Stime Networks. All rights reserved.</p>
        <p>문의 : KakaoTalk ID [stimemc]
        </p>
      </footer>
    </main>
  );
}
