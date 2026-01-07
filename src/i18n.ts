import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import fr from './locales/fr.json';
import nl from './locales/nl.json';
import de from './locales/de.json';
import es from './locales/es.json';
import it from './locales/it.json';
import pt from './locales/pt.json';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'nl', label: 'Nederlands', flag: '🇳🇱' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', label: 'Português', flag: '🇵🇹' },
] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number]['code'];

const resources = {
  en: { translation: en },
  fr: { translation: fr },
  nl: { translation: nl },
  de: { translation: de },
  es: { translation: es },
  it: { translation: it },
  pt: { translation: pt },
};

// Custom language detector that checks localStorage first
const customLanguageDetector = {
  name: 'customLocalStorage',
  lookup: () => {
    const storedLang = localStorage.getItem('app_lang');
    if (storedLang) {
      // Map region codes to base language (fr-FR -> fr)
      const baseLang = storedLang.split('-')[0];
      const supported = SUPPORTED_LANGUAGES.map(l => l.code);
      if (supported.includes(baseLang as SupportedLanguage)) {
        return baseLang;
      }
    }
    return undefined;
  },
  cacheUserLanguage: (lng: string) => {
    localStorage.setItem('app_lang', lng);
  },
};

// Custom detector for browser language that maps region codes
const customNavigatorDetector = {
  name: 'customNavigator',
  lookup: () => {
    const browserLangs = navigator.languages || [navigator.language];
    const supported = SUPPORTED_LANGUAGES.map(l => l.code);
    
    for (const lang of browserLangs) {
      // Map region codes to base language (fr-FR -> fr)
      const baseLang = lang.split('-')[0];
      if (supported.includes(baseLang as SupportedLanguage)) {
        return baseLang;
      }
    }
    return undefined;
  },
};

const languageDetector = new LanguageDetector();
languageDetector.addDetector(customLanguageDetector);
languageDetector.addDetector(customNavigatorDetector);

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      // Priority order: localStorage first, then browser detection
      order: ['customLocalStorage', 'customNavigator', 'navigator'],
      caches: [], // We handle caching manually
    },
  });

export default i18n;
