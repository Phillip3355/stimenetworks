'use client';

import { useSyncExternalStore } from 'react';

const subscribe = (callback: () => void) => {
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  media.addEventListener('change', callback);
  return () => media.removeEventListener('change', callback);
};
const clientSnapshot = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const serverSnapshot = () => true;

// Server markup and the first client render both show stationary, complete
// content. Motion starts only after hydration and respects the user's setting.
export default function useMotionPreference() {
  return useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
}
