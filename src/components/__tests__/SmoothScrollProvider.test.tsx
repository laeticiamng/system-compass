/**
 * Verifies that the global SmoothScrollProvider correctly pauses Lenis when
 * Radix-style overlays lock the body, and resumes when they close.
 *
 * Lenis is mocked so we can assert stop()/start() calls deterministically.
 */
import { render, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const stop = vi.fn();
const start = vi.fn();
const destroy = vi.fn();
const raf = vi.fn();
const scrollTo = vi.fn();

vi.mock('lenis', () => ({
  default: function MockLenis() {
    return { stop, start, destroy, raf, scrollTo };
  },
}));

import { SmoothScrollProvider } from '@/components/SmoothScrollProvider';

// Force a non-touch, motion-allowed environment so Lenis activates.
beforeEach(() => {
  stop.mockClear();
  start.mockClear();
  destroy.mockClear();
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (q: string) => ({
      matches: false,
      media: q,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
      onchange: null,
    }),
  });
  Object.defineProperty(navigator, 'maxTouchPoints', { value: 0, configurable: true });
  delete (window as unknown as { ontouchstart?: unknown }).ontouchstart;
  document.body.removeAttribute('data-scroll-locked');
  document.body.style.pointerEvents = '';
  document.body.innerHTML = '';
});

const flush = () => new Promise((r) => setTimeout(r, 20));

describe('SmoothScrollProvider — Lenis pause/resume on overlays', () => {
  it('stops Lenis when body gets data-scroll-locked, resumes when removed', async () => {
    render(
      <SmoothScrollProvider>
        <div>app</div>
      </SmoothScrollProvider>
    );
    await flush();

    act(() => {
      document.body.setAttribute('data-scroll-locked', '1');
    });
    await flush();
    expect(stop).toHaveBeenCalled();

    start.mockClear();
    act(() => {
      document.body.removeAttribute('data-scroll-locked');
    });
    await flush();
    expect(start).toHaveBeenCalled();
  });

  it('stops Lenis when a Radix focus guard appears in the DOM', async () => {
    render(
      <SmoothScrollProvider>
        <div>app</div>
      </SmoothScrollProvider>
    );
    await flush();

    const guard = document.createElement('span');
    guard.setAttribute('data-radix-focus-guard', '');
    act(() => {
      document.body.appendChild(guard);
    });
    await flush();
    expect(stop).toHaveBeenCalled();

    start.mockClear();
    act(() => {
      guard.remove();
    });
    await flush();
    expect(start).toHaveBeenCalled();
  });

  it('stops Lenis when body.pointer-events is set to none (Radix dropdown)', async () => {
    render(
      <SmoothScrollProvider>
        <div>app</div>
      </SmoothScrollProvider>
    );
    await flush();

    act(() => {
      document.body.style.pointerEvents = 'none';
    });
    await flush();
    expect(stop).toHaveBeenCalled();
  });
});
