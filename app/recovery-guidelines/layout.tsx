import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = { title: '복구 가이드라인', description: '기존 아이템과 월드 복구 정책, 최대 6시간 전 백업의 의미와 요청 절차.' };

export default function PageLayout({ children }: { children: ReactNode }) { return children; }
