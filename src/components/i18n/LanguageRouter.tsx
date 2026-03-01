import { useEffect } from 'react';
import { Outlet, useParams, Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '@/i18n';

const supportedCodes = SUPPORTED_LANGUAGES.map(l => l.code) as string[];

export function LanguageRouter() {
  const { lang } = useParams<{ lang: string }>();
  const { i18n } = useTranslation();
  const location = useLocation();

  const isValidLang = lang && supportedCodes.includes(lang);

  // Sync i18next with URL (only runs when lang is valid)
  useEffect(() => {
    if (isValidLang && i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
    if (isValidLang) {
      document.documentElement.lang = lang;
      const langConfig = SUPPORTED_LANGUAGES.find(l => l.code === lang);
      document.documentElement.dir = langConfig && 'dir' in langConfig && langConfig.dir === 'rtl' ? 'rtl' : 'ltr';
    }
  }, [lang, i18n, isValidLang]);

  if (!isValidLang) {
    const detectedLang = i18n.language || 'en';
    return <Navigate to={`/${detectedLang}${location.pathname}`} replace />;
  }

  return <Outlet />;
}

export function RedirectToLanguage() {
  const { i18n } = useTranslation();
  const location = useLocation();
  const lang = i18n.language || 'en';
  return <Navigate to={`/${lang}/${location.search}${location.hash}`} replace />;
}

export function LegacyRedirect() {
  const { i18n } = useTranslation();
  const location = useLocation();
  const lang = i18n.language || 'en';
  return <Navigate to={`/${lang}${location.pathname}${location.search}${location.hash}`} replace />;
}
