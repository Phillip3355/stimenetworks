import type { Metadata } from 'next';
import ManualClient from './ManualClient';

export const metadata: Metadata = {
  title: 'Stime Seasonal War 셋업 매뉴얼',
  description: '관리자·셋업 담당자를 위한 설치, 국가 설정, 초기 배정, 전쟁 운영 안내.',
  robots: { index: false, follow: false },
};

export default function ManualPage() {
  return <ManualClient />;
}
