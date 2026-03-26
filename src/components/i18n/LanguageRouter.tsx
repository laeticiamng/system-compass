import { useEffect } from 'react';
import { Outlet, useParams, Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '@/i18n';

const supportedCodes = SUPPORTED_LANGUAGES.map(l => l.code) as string[];
const defaultLang = 'fr';

function normalizeLang(lang?: string | null): string {
  if (!lang) return defaultLang;
  const baseLang = lang.toLowerCase().split('-')[0];
  return supportedCodes.includes(baseLang) ? baseLang : defaultLang;
}

export function LanguageRouter() {
  const { lang } = useParams<{ lang: string }>();
  const { i18n } = useTranslation();
  const location = useLocation();

   const normalizedUrlLang = normalizeLang(lang);
   const isValidLang = !!lang && supportedCodes.includes(lang);

  // Sync i18next with URL (only runs when lang is valid)
  useEffect(() => {
    if (isValidLang && i18n.language !== normalizedUrlLang) {
      i18n.changeLanguage(normalizedUrlLang);
    }
    if (isValidLang) {
      document.documentElement.lang = normalizedUrlLang;
      const langConfig = SUPPORTED_LANGUAGES.find(l => l.code === normalizedUrlLang);
      document.documentElement.dir = langConfig && 'dir' in langConfig && langConfig.dir === 'rtl' ? 'rtl' : 'ltr';
    }
  }, [i18n, isValidLang, normalizedUrlLang]);

  if (!isValidLang) {
    const detectedLang = normalizeLang(i18n.language);
    return <Navigate to={`/${detectedLang}${location.pathname}${location.search}${location.hash}`} replace />;
  }

  return <Outlet />;
}

export function RedirectToLanguage() {
  const { i18n } = useTranslation();
  const location = useLocation();
  const lang = normalizeLang(i18n.language);
  return <Navigate to={`/${lang}${location.search}${location.hash}`} replace />;
}

export function LegacyRedirect() {
  const { i18n } = useTranslation();
  const location = useLocation();
  const lang = normalizeLang(i18n.language);
  return <Navigate to={`/${lang}${location.pathname}${location.search}${location.hash}`} replace />;
}
