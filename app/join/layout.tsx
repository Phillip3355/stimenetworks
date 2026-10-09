import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { getServerGroupPresentation } from '../shared/serverGroup.mjs';

const group = getServerGroupPresentation();
export const metadata: Metadata = { title: '참여 안내', description: group.hasActive ? `${group.descriptionKo} Java × Bedrock 접속 안내와 기존 공개 가이드.` : 'The Great War 운영 준비와 Survival 추가 계획, Java × Bedrock 접속 안내와 기존 공개 가이드.' };

export default function PageLayout({ children }: { children: ReactNode }) { return children; }
