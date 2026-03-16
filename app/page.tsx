'use client';

import Hero from './components/Hero';
import ScrollSection from './components/ScrollSection';
import CardsGrid from './components/CardsGrid';
import Staff from './components/Staff';
import './styles/main.css';

export default function Home() {
  const serverFeatures = [
    {
      title: '평화로운 야생서버 | Peaceful Survival Server',
      description: '친구들과 함께 마인크래프트 세계를 탐험하고 건축하세요. | Explore and build the Minecraft world together with friends.',
      icon: '',
    },
    {
      title: '안티 엑스레이 | Anti-Xray',
      description: '공정한 게임 플레이를 위해 엑스레이 모드를 차단합니다. | Block X-ray mode for fair gameplay.',
      icon: '',
    },
    {
      title: '지속적인 관리및 업데이트 | Continuous Maintenance and Updates',
      description: '최신 버전과 안정적인 서버 운영을 위해 지속적으로 관리 및 업데이트를 진행합니다. | We continuously maintain and update to ensure the latest version and stable server operation.',
      icon: '',
    },
  ];

  const communityFeatures = [
    {
      title: '활발한 커뮤니티 | Active Community',
      description: '매일 활동하는 수십 명의 플레이어들과 상호작용하세요. | Interact with dozens of active players every day.',
      icon: '',
    },
    {
      title: '정기 이벤트 | Regular Events',
      description: '주기적으로 특별한 이벤트과 대회가 개최됩니다. | Special events and competitions are held regularly.',
      icon: '',
    },
    {
      title: '카카오톡/Whatsapp 커뮤니티 | KakaoTalk/Whatsapp Community',
      description: '카카오톡이나 Whatsapp에서 친구를 만나고 정보를 공유하세요. | Meet friends and share information on KakaoTalk or Whatsapp.',
      icon: '',
    },
  ];

  return (
    <main className="mainContainer">
      {/* 히어로 섹션 */}
      <Hero />

      {/* 서버 소개 */}
      <ScrollSection
        title="서버 소개 | Server Introduction"
        icon=""
        content={
          <div>
            <p>
              Stime Networks는 창의성과 커뮤니티가 중심이 되는 마인크래프트 서버입니다. | Stime Networks is a Minecraft server centered on creativity and community.
            </p>
            <p>
              우리는 모든 플레이어가 자신의 세계를 구축하고, 친구를 만나고, 함께 성장할 수 있는 환경을 제공합니다. | We provide an environment where all players can build their own world, make friends, and grow together.
            </p>
            <p>
              최고의 게임 경험을 위해 지속적으로 서버를 관리하고 업데이트하며, 공정한 플레이를 보장하기 위해 노력합니다. | We continuously manage and update the server for the best gaming experience and strive to ensure fair play.
            </p>
          </div>
        }
      />

      {/* 서버 기능 */}
      <section className="section">
        <h2 className="sectionTitle">서버 기능 | Server Features</h2>
        <CardsGrid cards={serverFeatures} />
      </section>

      {/* 커뮤니티 소개 */}
      <ScrollSection
        title="커뮤니티 소개 | Community Introduction"
        icon=""
        reverse={true}
        content={
          <div>
            <p>
              우리의 커뮤니티는 서로의 창의성을 존중하고 발전해 나아가는 공간입니다. | Our community is a space where we respect and develop each other's creativity.
            </p>
            <p>
              초보자부터 숙련자까지 모든 수준의 플레이어가 환영받으며, 함께 배우고 성장할 수 있습니다. | Players of all skill levels from beginners to veterans are welcome and can learn and grow together.
            </p>
            <p>
              정기적인 이벤트와 활동을 통해 플레이어들 간의 유대감을 강화합니다. | We strengthen bonds between players through regular events and activities.
            </p>
          </div>
        }
      />

      {/* 커뮤니티 기능 */}
      <section className="section">
        <h2 className="sectionTitle">커뮤니티 특징 | Community Features</h2>
        <CardsGrid cards={communityFeatures} />
      </section>

      {/* 관리진 및 개발자 */}
      <Staff />

      {/* 푸터 */}
      <footer className="footer">
        <p>&copy; 2026 Stime Networks. All rights reserved. | 모든 권리 보유</p>
        <p>Contact : +82 10-3752-1614 </p>
      </footer>
    </main>
  );
}
