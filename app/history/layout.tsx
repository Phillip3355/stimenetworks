import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = { title: '연혁', description: '기존 서버의 원래 기록과 별도로 소개하는 StimeMC 서버 그룹의 방향.' };

export default function PageLayout({ children }: { children: ReactNode }) { return children; }
