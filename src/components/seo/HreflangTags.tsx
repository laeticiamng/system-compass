import { Helmet } from 'react-helmet-async';
import { usePathWithoutLang } from '@/hooks/useLocalizedPath';
import { SUPPORTED_LANGUAGES } from '@/i18n';
import { SITE_CONFIG } from '@/config/site';

const BASE_URL = SITE_CONFIG.productionUrl;

export function HreflangTags() {
  const currentPath = usePathWithoutLang();
  const pathSuffix = currentPath === '/' ? '' : currentPath;

  return (
    <Helmet>
      {SUPPORTED_LANGUAGES.map((lang) => (
        <link
          key={lang.code}
          rel="alternate"
          hrefLang={lang.code}
          href={`${BASE_URL}/${lang.code}${pathSuffix}`}
        />
      ))}
      <link rel="alternate" hrefLang="x-default" href={`${BASE_URL}/en${pathSuffix}`} />
    </Helmet>
  );
}
