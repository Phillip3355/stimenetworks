'use client';

import Link from 'next/link';
import Hero from './components/Hero';
import CardsGrid from './components/CardsGrid';
import Staff from './components/Staff';
import LanguageSwitch from './components/LanguageSwitch';
import { LanguageProvider, useLanguage } from './components/LanguageProvider';

function HomeContent() {
  const { t } = useLanguage();

  const serverFeatures = [
    {
      title: t('평화로운 서바이벌 서버', 'Peaceful Survival Server'),
      image: '/minecraft1.png',
      description: t('자바/베드락 플레이어 모두에게 안정적인 생존 환경을 제공합니다.', 'Provides stable survival gameplay for both Java and Bedrock players.'),
    },
    {
      title: t('안티 엑스레이 보호', 'Anti-Xray Protection'),
      image: '/minecraft2.png',
      description: t('공정한 경쟁을 위해 엑스레이와 부정행위를 방지하는 서버 보안 레이어.', 'A server security layer that blocks X-ray and unfair play for honest competition.'),
    },
    {
      title: t('지속적 운영 & 업데이트', 'Continuous Operations & Updates'),
      image: '/minecraft3.png',
      description: t('서버 안정성과 콘텐츠 신선도를 유지하기 위해 정기적으로 운영합니다.', 'Regular operations keep the server stable and content fresh.'),
    },
  ];

  const communityFeatures = [
    {
      title: t('정기 이벤트', 'Regular Events'),
      image: '/minecraft4.png',
      description: t('매월 일정한 시간에 경쟁 및 창작 이벤트를 개최합니다.', 'Monthly competitive and creative events are hosted on schedule.'),
    },
    {
      title: t('글로벌 연결', 'Global Community'),
      image: '/minecraft1.png',
      description: t('한국어와 영어 커뮤니티가 함께 성장하는 협업 중심 공간.', 'A collaboration-first community for Korean and English players.'),
    },
  ];

  return (
    <main className="mainContainer">
      <LanguageSwitch />
      <Hero />

      <section className="sectionCanvas">
        <div className="sectionContent">
          <p className="eyebrow">{t('서버 아키텍처', 'Server Architecture')}</p>
          <h2 className="sectionHeading">
            {t(
              'Stime Networks는 다중 플랫폼 플레이어를 위한 엔지니어링 중심 Minecraft 서버입니다.',
              'Stime Networks is an engineering-first Minecraft server for multi-platform players.'
            )}
          </h2>
          <p className="sectionLead">
            {t(
              '한 가지 색상, 한 가지 리듬, 한 가지 목표: 평등하고 예민하게 관리된 게임 경험.',
              'One color, one rhythm, one purpose: a finely tuned, fair gameplay experience.'
            )}
          </p>
        </div>
      </section>

      <section className="sectionCanvas">
        <div className="sectionContent">
          <div className="sectionHeader">
            <p className="eyebrow">{t('핵심 기능', 'Core Capabilities')}</p>
            <h3 className="sectionTitle">{t('서버 기능', 'Server Features')}</h3>
          </div>
          <CardsGrid cards={serverFeatures} />
        </div>
      </section>

      <section className="sectionCanvas">
        <div className="sectionContent">
          <div className="sectionHeader">
            <p className="eyebrow">{t('커뮤니티 설계', 'Community Design')}</p>
            <h3 className="sectionTitle">{t('커뮤니티 특징', 'Community Features')}</h3>
          </div>
          <CardsGrid cards={communityFeatures} />
        </div>
      </section>

      <Staff />

      <footer className="footer">
        <div className="footerInner">
          <div>
            <p className="footerTitle">{t('Stime Networks', 'Stime Networks')}</p>
            <p className="footerText">{t('엔지니어링 방식으로 구성된 Minecraft 서버 경험.', 'An engineering-led Minecraft server experience.')}</p>
          </div>
          <div>
            <p className="footerTitle">{t('탐색', 'Explore')}</p>
            <Link className="footerLink" href="/">{t('홈', 'Home')}</Link>
            <Link className="footerLink" href="/server-mechanism">{t('서버 메커니즘', 'Server Mechanism')}</Link>
            <Link className="footerLink" href="/rules">{t('규칙 보기', 'Rules')}</Link>
            <Link className="footerLink" href="/updates">{t('업데이트 보기', 'Updates')}</Link>
          </div>
          <div>
            <p className="footerTitle">{t('지원', 'Support')}</p>
            <a className="footerLink" href="mailto:stimemc@example.com">{t('문의', 'Contact')}</a>
            <a className="footerLink" href="https://discord.gg/stimenetworks">Discord</a>
          </div>
          <div>
            <p className="footerTitle">{t('법적', 'Legal')}</p>
            <p className="footerText">{t('© 2026 Stime Networks. All rights reserved.', '© 2026 Stime Networks. All rights reserved.')}</p>
          </div>
        </div>
      </footer>
    </main>
  );
}

export default function Home() {
  return (
    <LanguageProvider>
      <HomeContent />
    </LanguageProvider>
  );
}
