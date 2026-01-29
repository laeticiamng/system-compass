/**
 * useSidebarPreference - Hook to manage user's sidebar visibility preference
 */

import { useState, useEffect, useCallback } from 'react';

const SIDEBAR_PREFERENCE_KEY = 'sidebar-preference';

export function useSidebarPreference() {
  const [isEnabled, setIsEnabled] = useState(() => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem(SIDEBAR_PREFERENCE_KEY);
    return stored === 'true';
  });

  useEffect(() => {
    localStorage.setItem(SIDEBAR_PREFERENCE_KEY, String(isEnabled));
  }, [isEnabled]);

  const toggle = useCallback(() => {
    setIsEnabled(prev => !prev);
  }, []);

  const enable = useCallback(() => {
    setIsEnabled(true);
  }, []);

  const disable = useCallback(() => {
    setIsEnabled(false);
  }, []);

  return {
    isEnabled,
    toggle,
    enable,
    disable,
  };
}
