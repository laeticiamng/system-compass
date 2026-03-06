import { useCallback } from 'react';
import { useNavigate, type NavigateOptions } from 'react-router-dom';
import { useLocalizedPath } from '@/hooks/useLocalizedPath';

/**
 * Drop-in replacement for useNavigate() that automatically
 * prefixes the current language to paths.
 * 
 * Usage:
 *   const navigate = useLocalizedNavigate();
 *   navigate('/dashboard'); // → /fr/dashboard
 */
export function useLocalizedNavigate() {
  const navigate = useNavigate();
  const { localizedPath } = useLocalizedPath();

  return useCallback(
    (to: string | number, options?: NavigateOptions) => {
      if (typeof to === 'number') {
        navigate(to);
        return;
      }
      const shouldLocalize = to.startsWith('/') && !to.startsWith('//');
      navigate(shouldLocalize ? localizedPath(to) : to, options);
    },
    [navigate, localizedPath]
  );
}
