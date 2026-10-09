import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = { title: '문의', description: '회원 및 비회원 1:1 문의, 기존 문의 조회와 답변.' };

export default function PageLayout({ children }: { children: ReactNode }) { return children; }
