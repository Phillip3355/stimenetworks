import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = { title: '관리', description: '권한이 있는 관리자를 위한 기존 문의 및 보고서 관리.' };

export default function PageLayout({ children }: { children: ReactNode }) { return children; }
