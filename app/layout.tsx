import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "./components/LanguageProvider";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  title: "StimeMC - 마인크래프트 서버",
  description: "Java와 Bedrock에서 별도 모드 설치 없이 즐기는 개방형 서버사이드 모드 서버 StimeMC입니다.",
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
          <Navbar />
          <div className="siteContent">{children}</div>
          <Footer />
          <SpeedInsights />
          <Analytics />
        </LanguageProvider>
      </body>
    </html>
  );
}
