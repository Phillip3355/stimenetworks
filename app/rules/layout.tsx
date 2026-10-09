import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = { title: '서버 규칙', description: '기존 공개 규칙과 적용 범위. The Great War와 Survival 별도 규칙은 아직 공개되지 않았습니다.' };

export default function PageLayout({ children }: { children: ReactNode }) { return children; }
