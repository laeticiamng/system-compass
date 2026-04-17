import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useNavigationContext, setModuleContext, getModuleContext, clearModuleContext } from '../navigationStore';

describe('navigationStore', () => {
  beforeEach(() => {
    sessionStorage.clear();
    useNavigationContext.setState({ context: null });
  });

  it('stores and retrieves a module context', () => {
    setModuleContext({ sourceModule: 'a', targetModule: 'b', data: { x: 1 } });
    const ctx = getModuleContext();
    expect(ctx?.sourceModule).toBe('a');
    expect(ctx?.targetModule).toBe('b');
    expect(ctx?.data).toEqual({ x: 1 });
    expect(typeof ctx?.timestamp).toBe('number');
  });

  it('clears context on demand', () => {
    setModuleContext({ sourceModule: 'a', targetModule: 'b', data: {} });
    clearModuleContext();
    expect(getModuleContext()).toBeNull();
  });

  it('expires context after TTL (30 min)', () => {
    vi.useFakeTimers();
    setModuleContext({ sourceModule: 'a', targetModule: 'b', data: {} });
    vi.advanceTimersByTime(31 * 60 * 1000);
    expect(getModuleContext()).toBeNull();
    vi.useRealTimers();
  });

  it('persists context to sessionStorage', () => {
    setModuleContext({ sourceModule: 'src', targetModule: 'tgt', data: { v: 42 } });
    const raw = sessionStorage.getItem('pyramid_module_context');
    expect(raw).toBeTruthy();
    expect(raw).toContain('src');
  });
});
