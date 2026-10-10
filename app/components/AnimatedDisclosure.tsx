'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import useMotionPreference from './useMotionPreference';

/** Native disclosure semantics, with a reversible expand/collapse transition. */
export default function AnimatedDisclosure({ summary, children, className }: {
  summary: ReactNode; children: ReactNode; className?: string;
}) {
  const reduceMotion = useMotionPreference();
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<Animation | null>(null);
  const desiredOpen = useRef(false);

  useEffect(() => {
    const details = detailsRef.current;
    const content = contentRef.current;
    return () => {
      const animation = animationRef.current;
      if (!animation) return;
      animation.cancel();
      animationRef.current = null;
      if (details) details.open = desiredOpen.current;
      if (content) content.inert = false;
    };
  }, [reduceMotion]);

  const toggle = (event: React.MouseEvent<HTMLElement>) => {
    const details = detailsRef.current;
    const content = contentRef.current;
    if (!details || !content || reduceMotion || typeof content.animate !== 'function') return;
    event.preventDefault();
    const startHeight = details.open ? content.getBoundingClientRect().height : 0;
    const startOpacity = details.open ? Number(getComputedStyle(content).opacity) : 0;
    desiredOpen.current = animationRef.current ? !desiredOpen.current : !details.open;
    animationRef.current?.cancel();
    if (!desiredOpen.current && content.contains(document.activeElement)) details.querySelector('summary')?.focus({ preventScroll: true });
    content.inert = !desiredOpen.current;
    details.open = true;
    const endHeight = desiredOpen.current ? content.scrollHeight : 0;
    const animation = content.animate([
      { height: `${startHeight}px`, opacity: startOpacity, overflow: 'hidden' },
      { height: `${endHeight}px`, opacity: desiredOpen.current ? 1 : 0, overflow: 'hidden' },
    ], { duration: desiredOpen.current ? 280 : 220, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'both' });
    animationRef.current = animation;
    animation.onfinish = () => {
      if (animationRef.current !== animation) return;
      details.open = desiredOpen.current;
      content.inert = false;
      animation.cancel();
      animationRef.current = null;
    };
  };

  return <details ref={detailsRef} className={className} data-animated-disclosure>
    <summary onClick={toggle}>{summary}</summary>
    <div ref={contentRef} data-disclosure-content onFocusCapture={() => {
      const animation = animationRef.current;
      if (!animation || !desiredOpen.current) return;
      animation.cancel();
      animationRef.current = null;
    }}>{children}</div>
  </details>;
}
