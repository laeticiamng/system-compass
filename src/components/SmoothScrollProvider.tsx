/**
 * SmoothScrollProvider - Global Lenis-based smooth scroll
 * - Awwwards-grade scroll finish
 * - Respects prefers-reduced-motion
 * - Disables smoothing on touch devices (native iOS/Android scroll feels better)
 * - Auto-pauses when Radix dialogs/dropdowns/sheets lock the body
 * - Exposes a singleton via getLenis() for consistent scroll-to with offset
 */
import { useEffect } from 'react';
import Lenis from 'lenis';

let lenisInstance: Lenis | null = null;

export function getLenis(): Lenis | null {
  return lenisInstance;
}

/**
 * Smooth scroll to an element or selector with a consistent header offset.
 * Falls back to native scrollIntoView when Lenis is not active (touch / reduced motion).
 */
export function scrollToAnchor(target: string | HTMLElement, offset = -88) {
  const el =
    typeof target === 'string'
      ? (document.querySelector(target.startsWith('#') ? target : `#${target}`) as HTMLElement | null)
      : target;
  if (!el) return;
  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(el, { offset, duration: 1.1 });
  } else {
    const y = el.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
}

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Touch / coarse pointer → keep native scroll (fights less, no rubber-band issues on iOS)
    const isTouch =
      window.matchMedia('(pointer: coarse)').matches ||
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0;

    if (reduce || isTouch) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      // touch left native — only here as a safety in hybrid devices
      touchMultiplier: 1.5,
      syncTouch: false,
    });
    lenisInstance = lenis;

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    // Anchor click interception (consistent offset)
    const onAnchor = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('a[href^="#"]') as HTMLAnchorElement | null;
      if (!target) return;
      const id = target.getAttribute('href');
      if (!id || id === '#') return;
      const el = document.querySelector(id);
      if (el) {
        e.preventDefault();
        lenis.scrollTo(el as HTMLElement, { offset: -88 });
      }
    };
    document.addEventListener('click', onAnchor);

    // Pause Lenis when Radix locks the body (dialogs, sheets, dropdowns, popovers)
    // Radix sets data-scroll-locked on <body> while a modal layer is open.
    const body = document.body;
    const syncLockState = () => {
      const locked =
        body.hasAttribute('data-scroll-locked') ||
        body.style.pointerEvents === 'none' ||
        document.querySelector('[data-radix-focus-guard]') !== null;
      if (locked) lenis.stop();
      else lenis.start();
    };
    const observer = new MutationObserver(syncLockState);
    observer.observe(body, {
      attributes: true,
      attributeFilter: ['data-scroll-locked', 'style', 'class'],
    });
    // Also watch for Radix portals being added/removed
    const portalObserver = new MutationObserver(syncLockState);
    portalObserver.observe(document.body, { childList: true, subtree: false });

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener('click', onAnchor);
      observer.disconnect();
      portalObserver.disconnect();
      lenis.destroy();
      lenisInstance = null;
    };
  }, []);

  return <>{children}</>;
}
