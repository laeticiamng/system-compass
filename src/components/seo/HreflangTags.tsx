import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const BASE_URL = 'https://system-compass.app';

export function HreflangTags() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <Helmet>
      <link rel="alternate" hrefLang="fr" href={`${BASE_URL}${currentPath}`} />
      <link rel="alternate" hrefLang="x-default" href={`${BASE_URL}${currentPath}`} />
    </Helmet>
  );
}
