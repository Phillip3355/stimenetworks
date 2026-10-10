'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import useMotionPreference from './useMotionPreference';

/** Progressive enhancement: server/initial content stays visible and readable. */
export default function ScrollReveals() {
  const pathname = usePathname();
  const reduceMotion = useMotionPreference();
  useEffect(() => {
    if (reduceMotion || typeof IntersectionObserver === 'undefined') return;
    const observed = new Set<HTMLElement>();
    const pending = new Set<HTMLElement>();
    const animations = new Map<HTMLElement, Animation>();
    const distance = window.matchMedia('(max-width: 767px)').matches ? 12 : 20;
    const reset = (node: HTMLElement) => {
      node.style.removeProperty('opacity');
      node.style.removeProperty('transform');
      node.dataset.revealState = 'visible';
    };
    const reveal = (node: HTMLElement, immediate = false) => {
      pending.delete(node);
      observer.unobserve(node);
      animations.get(node)?.cancel();
      if (immediate || typeof node.animate !== 'function') { reset(node); return; }
      node.dataset.revealState = 'entering';
      const animation = node.animate([
        { opacity: 0, transform: `translateY(${distance}px)` },
        { opacity: 1, transform: 'translateY(0)' },
      ], { duration: distance === 12 ? 360 : 460, easing: 'cubic-bezier(.22,1,.36,1)' });
      animations.set(node, animation);
      reset(node);
      node.dataset.revealState = 'entering';
      animation.onfinish = () => { animations.delete(node); node.dataset.revealState = 'visible'; };
    };
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) reveal(entry.target as HTMLElement); });
    }, { rootMargin: '0px 0px -24px 0px', threshold: 0.01 });
    const prepare = () => {
      document.querySelectorAll<HTMLElement>('main [data-scroll-reveal]').forEach(node => {
        if (observed.has(node) || node.closest('dialog') || node.parentElement?.closest('[data-scroll-reveal]')) return;
        observed.add(node);
        const bounds = node.getBoundingClientRect();
        if (bounds.top < window.innerHeight + 24 || node.contains(document.activeElement)) { reset(node); return; }
        node.style.opacity = '0';
        node.style.transform = `translateY(${distance}px)`;
        node.dataset.revealState = 'pending';
        pending.add(node);
        observer.observe(node);
      });
    };
    prepare();
    const mutations = new MutationObserver(prepare);
    const main = document.querySelector('main');
    if (main) mutations.observe(main, { childList: true, subtree: true });
    const onFocus = (event: FocusEvent) => {
      if (!(event.target instanceof Element)) return;
      const node = event.target.closest<HTMLElement>('[data-scroll-reveal]');
      if (node && (pending.has(node) || animations.has(node))) reveal(node, true);
    };
    document.addEventListener('focusin', onFocus);
    return () => {
      observer.disconnect();
      mutations.disconnect();
      document.removeEventListener('focusin', onFocus);
      animations.forEach(animation => animation.cancel());
      observed.forEach(node => { node.style.removeProperty('opacity'); node.style.removeProperty('transform'); delete node.dataset.revealState; });
    };
  }, [pathname, reduceMotion]);
  return null;
}
