import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LanguageProvider } from "./components/LanguageProvider";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import MotionProvider from "./components/MotionProvider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import { getServerGroupPresentation } from "./shared/serverGroup.mjs";

const group = getServerGroupPresentation();
export const metadata: Metadata = {
  title: {
    default: "StimeMC — Minecraft Server Group",
    template: "%s | StimeMC",
  },
  description: group.hasActive ? group.descriptionKo : "여러 세계, 하나의 Stime. Geyser 기반 Java × Bedrock 크로스플레이를 공유하는 서버 그룹. The Great War는 운영 준비 중이며 Survival은 추가 계획 중입니다.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#071013",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body suppressHydrationWarning>

        <LanguageProvider>
          <MotionProvider>
            <a href="#site-content" className="skipLink" data-menu-background>본문으로 건너뛰기 / Skip to content</a>
            <Navbar />
            <div id="site-content" className="siteContent" tabIndex={-1} data-menu-background>{children}</div>
            <Footer />
          </MotionProvider>
          <SpeedInsights />
          <Analytics />
        </LanguageProvider>
      </body>
    </html>
  );
}
