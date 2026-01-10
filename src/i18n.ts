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

// Import positive points translations
import countriesPositivePointsFr from './locales/countries-positive-points-fr.json';
import countriesPositivePointsEn from './locales/countries-positive-points-en.json';
import countriesPositivePointsDe from './locales/countries-positive-points-de.json';
import countriesPositivePointsEs from './locales/countries-positive-points-es.json';
import countriesPositivePointsIt from './locales/countries-positive-points-it.json';
import countriesPositivePointsNl from './locales/countries-positive-points-nl.json';
import countriesPositivePointsPt from './locales/countries-positive-points-pt.json';

// Merge function for deep merging objects
function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge((result[key] || {}) as Record<string, unknown>, source[key] as Record<string, unknown>);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

// Merge positive points translations into main translations
const mergedFr = deepMerge(fr as Record<string, unknown>, countriesPositivePointsFr as Record<string, unknown>) as typeof fr;
const mergedEn = deepMerge(en as Record<string, unknown>, countriesPositivePointsEn as Record<string, unknown>) as typeof en;
const mergedDe = deepMerge(de as Record<string, unknown>, countriesPositivePointsDe as Record<string, unknown>) as typeof de;
const mergedEs = deepMerge(es as Record<string, unknown>, countriesPositivePointsEs as Record<string, unknown>) as typeof es;
const mergedIt = deepMerge(it as Record<string, unknown>, countriesPositivePointsIt as Record<string, unknown>) as typeof it;
const mergedNl = deepMerge(nl as Record<string, unknown>, countriesPositivePointsNl as Record<string, unknown>) as typeof nl;
const mergedPt = deepMerge(pt as Record<string, unknown>, countriesPositivePointsPt as Record<string, unknown>) as typeof pt;

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
  en: { translation: mergedEn },
  fr: { translation: mergedFr },
  nl: { translation: mergedNl },
  de: { translation: mergedDe },
  es: { translation: mergedEs },
  it: { translation: mergedIt },
  pt: { translation: mergedPt },
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
