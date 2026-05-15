/**
 * SmoothScrollProvider - Global Lenis-based smooth scroll
 * - Adaptive header offset (measures real header height, responsive)
 * - Focus management on anchor scroll (no jump, just programmatic focus)
 * - Auto-pauses on Radix dialogs/sheets/dropdowns/popovers
 * - Disables on touch / reduced motion (native scroll feels better)
 */
import { useEffect } from 'react';
import Lenis from 'lenis';

let lenisInstance: Lenis | null = null;

export function getLenis(): Lenis | null {
  return lenisInstance;
}

/** Measure the real header height (responsive, banners, etc.) + breathing room. */
export function getHeaderOffset(): number {
  if (typeof document === 'undefined') return 80;
  const header = document.querySelector('[data-app-header]') as HTMLElement | null;
  const h = header?.getBoundingClientRect().height ?? 64;
  return Math.round(h + 12);
}

/**
 * Smooth scroll to an element/selector with adaptive header offset and
 * accessible focus handoff (the target receives focus without visual jump).
 */
export function scrollToAnchor(target: string | HTMLElement, opts: { focus?: boolean; offset?: number } = {}) {
  const el =
    typeof target === 'string'
      ? (document.querySelector(target.startsWith('#') ? target : `#${target}`) as HTMLElement | null)
      : target;
  if (!el) return;
  const offset = -(opts.offset ?? getHeaderOffset());
  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(el, { offset, duration: 1.1 });
  } else {
    const y = el.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
  // Accessible focus handoff (no visual jump — preventScroll)
  if (opts.focus !== false) {
    const isFocusable = el.matches('a,button,input,select,textarea,[tabindex]');
    if (!isFocusable && !el.hasAttribute('tabindex')) {
      el.setAttribute('tabindex', '-1');
    }
    // Defer focus until after scroll starts so screen readers announce in context
    window.setTimeout(() => {
      try { el.focus({ preventScroll: true }); } catch { /* noop */ }
    }, 50);
  }
}

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch =
      window.matchMedia('(pointer: coarse)').matches ||
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0;

    // Even when Lenis is off, anchor clicks should still use the adaptive offset.
    const onAnchor = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('a[href^="#"]') as HTMLAnchorElement | null;
      if (!target) return;
      const id = target.getAttribute('href');
      if (!id || id === '#') return;
      const el = document.querySelector(id) as HTMLElement | null;
      if (!el) return;
      e.preventDefault();
      scrollToAnchor(el);
    };

    if (reduce || isTouch) {
      document.addEventListener('click', onAnchor);
      return () => document.removeEventListener('click', onAnchor);
    }

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
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

    document.addEventListener('click', onAnchor);

    // Pause Lenis when Radix layers lock the body (Dialog, Sheet, Dropdown, Popover, Select)
    const body = document.body;
    const syncLockState = () => {
      const locked =
        body.hasAttribute('data-scroll-locked') ||
        body.style.pointerEvents === 'none' ||
        document.querySelector('[data-radix-focus-guard]') !== null;
      if (locked) lenis.stop();
      else lenis.start();
    };
    const attrObserver = new MutationObserver(syncLockState);
    attrObserver.observe(body, {
      attributes: true,
      attributeFilter: ['data-scroll-locked', 'style', 'class'],
    });
    const portalObserver = new MutationObserver(syncLockState);
    portalObserver.observe(document.body, { childList: true, subtree: false });

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener('click', onAnchor);
      attrObserver.disconnect();
      portalObserver.disconnect();
      lenis.destroy();
      lenisInstance = null;
    };
  }, []);

  return <>{children}</>;
}
