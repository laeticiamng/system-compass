import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import en from './locales/en.json';
import fr from './locales/fr.json';
import nl from './locales/nl.json';
import de from './locales/de.json';
import es from './locales/es.json';
import it from './locales/it.json';
import pt from './locales/pt.json';

// Supported languages with metadata
export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧', name: 'English' },
  { code: 'fr', label: 'Français', flag: '🇫🇷', name: 'Français' },
  { code: 'nl', label: 'Nederlands', flag: '🇳🇱', name: 'Nederlands' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪', name: 'Deutsch' },
  { code: 'es', label: 'Español', flag: '🇪🇸', name: 'Español' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹', name: 'Italiano' },
  { code: 'pt', label: 'Português', flag: '🇵🇹', name: 'Português' },
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
    supportedLngs: SUPPORTED_LANGUAGES.map(l => l.code),
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['customLocalStorage', 'customNavigator', 'navigator'],
      caches: [],
    },
    // Dev mode: warn about missing keys
    saveMissing: import.meta.env.DEV,
    missingKeyHandler: (_lngs, _ns, key) => {
      if (import.meta.env.DEV) {
        console.warn(`🌍 Missing translation key: ${key}`);
      }
    },
  });

export default i18n;
