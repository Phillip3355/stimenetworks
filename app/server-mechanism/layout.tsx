import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = { title: '기술과 크로스플레이', description: '공유 Geyser Java × Bedrock 방향과 기존 ViaProxy · Java 1.21.1 구현 기록.' };

export default function PageLayout({ children }: { children: ReactNode }) { return children; }
