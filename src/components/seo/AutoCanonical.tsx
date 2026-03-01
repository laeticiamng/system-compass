import { Helmet } from 'react-helmet-async';
import { useCanonicalUrl } from '@/hooks/useLocalizedPath';

/**
 * Automatically sets canonical URL and og:url based on current route + language.
 * Placed in AppLayout so all pages get correct SEO URLs without manual configuration.
 */
export function AutoCanonical() {
  const canonicalUrl = useCanonicalUrl();

  return (
    <Helmet>
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:url" content={canonicalUrl} />
    </Helmet>
  );
}
