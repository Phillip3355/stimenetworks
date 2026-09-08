import { memo } from 'react';
import Image from 'next/image';

// The same reconstructed model, captured once: no GPU needed for static visitors.
export default memo(function WorldFallback() {
  return <Image src="/home/minecraft/settlement-poster.webp" alt="" width={1050} height={1050} sizes="(max-width: 760px) 90vw, 65vw" priority unoptimized />;
});
