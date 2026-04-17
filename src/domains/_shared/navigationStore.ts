/**
 * Cross-domain navigation context store.
 * Replaces the legacy `GlobalConnector` sessionStorage helpers with a
 * reactive, typed Zustand store. Persistence layer = sessionStorage to keep
 * the previous TTL semantics (cleared on tab close).
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ModuleContext } from './types';

const TTL_MS = 30 * 60 * 1000; // 30 minutes

interface NavigationState {
  context: ModuleContext | null;
  setContext: (ctx: Omit<ModuleContext, 'timestamp'>) => void;
  getContext: () => ModuleContext | null;
  clearContext: () => void;
}

export const useNavigationContext = create<NavigationState>()(
  persist(
    (set, get) => ({
      context: null,
      setContext: (ctx) =>
        set({ context: { ...ctx, timestamp: Date.now() } }),
      getContext: () => {
        const current = get().context;
        if (!current) return null;
        if (Date.now() - current.timestamp > TTL_MS) {
          set({ context: null });
          return null;
        }
        return current;
      },
      clearContext: () => set({ context: null }),
    }),
    {
      name: 'pyramid_module_context',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ context: state.context }),
    }
  )
);

// Imperative helpers (kept for compatibility with non-React call sites)
export const setModuleContext = (
  ctx: Omit<ModuleContext, 'timestamp'>
): void => useNavigationContext.getState().setContext(ctx);

export const getModuleContext = (): ModuleContext | null =>
  useNavigationContext.getState().getContext();

export const clearModuleContext = (): void =>
  useNavigationContext.getState().clearContext();
