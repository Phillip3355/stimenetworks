import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = { title: '로그인 연결', description: 'StimeMC 로그인 연결 상태.' };

export default function PageLayout({ children }: { children: ReactNode }) { return children; }
