'use client';

import { MotionConfig } from 'framer-motion';
import useMotionPreference from './useMotionPreference';

export default function MotionProvider({ children }: { children: React.ReactNode }) {
  const reduceMotion = useMotionPreference();
  return <MotionConfig reducedMotion={reduceMotion ? 'always' : 'never'}>{children}</MotionConfig>;
}
