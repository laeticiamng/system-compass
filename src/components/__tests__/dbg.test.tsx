import { render } from '@testing-library/react';
import { describe, it, vi } from 'vitest';

const stop = vi.fn();
vi.mock('lenis', () => ({
  default: vi.fn().mockImplementation(() => {
    console.log('LENIS CONSTRUCTOR CALLED');
    return { stop, start: vi.fn(), destroy: vi.fn(), raf: vi.fn(), scrollTo: vi.fn() };
  }),
}));

import { SmoothScrollProvider, getLenis } from '@/components/SmoothScrollProvider';

describe('debug', () => {
  it('checks instantiation', async () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true, value: () => ({ matches: false, media: '', addEventListener: ()=>{}, removeEventListener: ()=>{}, addListener: ()=>{}, removeListener: ()=>{}, dispatchEvent: ()=>false, onchange: null }),
    });
    delete (window as any).ontouchstart;
    Object.defineProperty(navigator, 'maxTouchPoints', { value: 0, configurable: true });
    render(<SmoothScrollProvider><div /></SmoothScrollProvider>);
    await new Promise(r => setTimeout(r, 50));
    console.log('LENIS INSTANCE:', getLenis());
    console.log('ontouchstart in window:', 'ontouchstart' in window);
    console.log('maxTouchPoints:', navigator.maxTouchPoints);
  });
});
