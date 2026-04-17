import { forwardRef } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { useLocalizedPath } from '@/hooks/useLocalizedPath';

/**
 * Drop-in replacement for react-router-dom's <Link> that automatically
 * prefixes absolute paths with the current locale.
 *
 *   <LocalizedLink to="/dashboard"> → renders <a href="/fr/dashboard">
 *
 * Locale-free paths (like "/auth"), full URLs, and "#hash" links pass through.
 */
export const LocalizedLink = forwardRef<HTMLAnchorElement, LinkProps>(
  function LocalizedLink({ to, ...rest }, ref) {
    const { localizedPath } = useLocalizedPath();

    let resolved = to;
    if (typeof to === 'string') {
      const isAbsolute = to.startsWith('/') && !to.startsWith('//');
      const isAuth = /^\/(auth|api)\b/.test(to);
      if (isAbsolute && !isAuth) {
        resolved = localizedPath(to);
      }
    }

    return <Link ref={ref} to={resolved} {...rest} />;
  }
);
