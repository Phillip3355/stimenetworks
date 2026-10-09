import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = { title: '홈페이지 업데이트', description: 'StimeMC 홈페이지의 실제 변경 기록.' };

export default function PageLayout({ children }: { children: ReactNode }) { return children; }
