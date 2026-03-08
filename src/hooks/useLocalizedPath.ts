import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/i18n';

const supportedCodes = SUPPORTED_LANGUAGES.map(l => l.code);

export function useLocalizedPath() {
  const { i18n } = useTranslation();
  const lang = i18n.language as SupportedLanguage;

  const localizedPath = useCallback(
    (path: string) => {
      if (supportedCodes.some(c => path.startsWith(`/${c}/`) || path === `/${c}`)) {
        return path;
      }
      const cleanPath = path.startsWith('/') ? path : `/${path}`;
      return `/${lang}${cleanPath}`;
    },
    [lang]
  );

  return { localizedPath, currentLang: lang };
}

export function usePathWithoutLang(): string {
  const location = useLocation();
  const pathname = location.pathname;

  for (const code of supportedCodes) {
    if (pathname.startsWith(`/${code}/`)) {
      return pathname.slice(code.length + 1);
    }
    if (pathname === `/${code}`) {
      return '/';
    }
  }
  return pathname;
}

export function useCanonicalUrl(basePath?: string): string {
  const { i18n } = useTranslation();
  const pathFromUrl = usePathWithoutLang();
  const path = basePath || pathFromUrl;
  return `${SITE_CONFIG.productionUrl}/${i18n.language}${path === '/' ? '' : path}`;
}
