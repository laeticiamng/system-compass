import React from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { useLocalizedPath } from '@/hooks/useLocalizedPath';

interface LocalizedLinkProps extends Omit<LinkProps, 'to'> {
  to: string;
}

/**
 * Drop-in replacement for react-router <Link> that automatically
 * prefixes the current language to the path.
 * 
 * <LocalizedLink to="/about" /> renders as <Link to="/fr/about" />
 */
export const LocalizedLink = React.forwardRef<HTMLAnchorElement, LocalizedLinkProps>(
  ({ to, ...props }, ref) => {
    const { localizedPath } = useLocalizedPath();
    
    // Don't localize external links, hash links, or already-localized paths
    const shouldLocalize = typeof to === 'string' && to.startsWith('/') && !to.startsWith('//');
    const finalTo = shouldLocalize ? localizedPath(to) : to;

    return <Link ref={ref} to={finalTo} {...props} />;
  }
);

LocalizedLink.displayName = 'LocalizedLink';
