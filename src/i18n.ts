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
import zh from './locales/zh.json';
import hi from './locales/hi.json';
import ar from './locales/ar.json';
import bn from './locales/bn.json';
import ru from './locales/ru.json';
import ur from './locales/ur.json';

// Import toast translations
import toastsEn from './locales/toasts-en.json';
import toastsFr from './locales/toasts-fr.json';
import toastsDe from './locales/toasts-de.json';
import toastsEs from './locales/toasts-es.json';
import toastsIt from './locales/toasts-it.json';
import toastsNl from './locales/toasts-nl.json';
import toastsPt from './locales/toasts-pt.json';
import toastsZh from './locales/toasts-zh.json';
import toastsHi from './locales/toasts-hi.json';
import toastsAr from './locales/toasts-ar.json';
import toastsBn from './locales/toasts-bn.json';
import toastsRu from './locales/toasts-ru.json';
import toastsUr from './locales/toasts-ur.json';

// Import positive points translations
import countriesPositivePointsFr from './locales/countries-positive-points-fr.json';
import countriesPositivePointsEn from './locales/countries-positive-points-en.json';
import countriesPositivePointsDe from './locales/countries-positive-points-de.json';
import countriesPositivePointsEs from './locales/countries-positive-points-es.json';
import countriesPositivePointsIt from './locales/countries-positive-points-it.json';
import countriesPositivePointsNl from './locales/countries-positive-points-nl.json';
import countriesPositivePointsPt from './locales/countries-positive-points-pt.json';
import countriesPositivePointsZh from './locales/countries-positive-points-zh.json';
import countriesPositivePointsAr from './locales/countries-positive-points-ar.json';
import countriesPositivePointsRu from './locales/countries-positive-points-ru.json';
import countriesPositivePointsHi from './locales/countries-positive-points-hi.json';
import countriesPositivePointsBn from './locales/countries-positive-points-bn.json';
import countriesPositivePointsUr from './locales/countries-positive-points-ur.json';

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

// Merge positive points and toast translations into main translations
const mergedFr = deepMerge(deepMerge(fr as Record<string, unknown>, countriesPositivePointsFr as Record<string, unknown>), toastsFr as Record<string, unknown>) as typeof fr;
const mergedEn = deepMerge(deepMerge(en as Record<string, unknown>, countriesPositivePointsEn as Record<string, unknown>), toastsEn as Record<string, unknown>) as typeof en;
const mergedDe = deepMerge(deepMerge(de as Record<string, unknown>, countriesPositivePointsDe as Record<string, unknown>), toastsDe as Record<string, unknown>) as typeof de;
const mergedEs = deepMerge(deepMerge(es as Record<string, unknown>, countriesPositivePointsEs as Record<string, unknown>), toastsEs as Record<string, unknown>) as typeof es;
const mergedIt = deepMerge(deepMerge(it as Record<string, unknown>, countriesPositivePointsIt as Record<string, unknown>), toastsIt as Record<string, unknown>) as typeof it;
const mergedNl = deepMerge(deepMerge(nl as Record<string, unknown>, countriesPositivePointsNl as Record<string, unknown>), toastsNl as Record<string, unknown>) as typeof nl;
const mergedPt = deepMerge(deepMerge(pt as Record<string, unknown>, countriesPositivePointsPt as Record<string, unknown>), toastsPt as Record<string, unknown>) as typeof pt;
const mergedZh = deepMerge(deepMerge(zh as Record<string, unknown>, countriesPositivePointsZh as Record<string, unknown>), toastsZh as Record<string, unknown>) as typeof zh;
const mergedHi = deepMerge(deepMerge(hi as Record<string, unknown>, countriesPositivePointsHi as Record<string, unknown>), toastsHi as Record<string, unknown>) as typeof hi;
const mergedAr = deepMerge(deepMerge(ar as Record<string, unknown>, countriesPositivePointsAr as Record<string, unknown>), toastsAr as Record<string, unknown>) as typeof ar;
const mergedBn = deepMerge(deepMerge(bn as Record<string, unknown>, countriesPositivePointsBn as Record<string, unknown>), toastsBn as Record<string, unknown>) as typeof bn;
const mergedRu = deepMerge(deepMerge(ru as Record<string, unknown>, countriesPositivePointsRu as Record<string, unknown>), toastsRu as Record<string, unknown>) as typeof ru;
const mergedUr = deepMerge(deepMerge(ur as Record<string, unknown>, countriesPositivePointsUr as Record<string, unknown>), toastsUr as Record<string, unknown>) as typeof ur;

// Supported languages with metadata
export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧', name: 'English' },
  { code: 'zh', label: '中文', flag: '🇨🇳', name: '中文 (Mandarin)' },
  { code: 'hi', label: 'हिंदी', flag: '🇮🇳', name: 'हिंदी (Hindi)' },
  { code: 'es', label: 'Español', flag: '🇪🇸', name: 'Español' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦', name: 'العربية (Arabic)', dir: 'rtl' },
  { code: 'fr', label: 'Français', flag: '🇫🇷', name: 'Français' },
  { code: 'bn', label: 'বাংলা', flag: '🇧🇩', name: 'বাংলা (Bengali)' },
  { code: 'pt', label: 'Português', flag: '🇧🇷', name: 'Português' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺', name: 'Русский' },
  { code: 'ur', label: 'اردو', flag: '🇵🇰', name: 'اردو (Urdu)', dir: 'rtl' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪', name: 'Deutsch' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹', name: 'Italiano' },
  { code: 'nl', label: 'Nederlands', flag: '🇳🇱', name: 'Nederlands' },
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
  zh: { translation: mergedZh },
  hi: { translation: mergedHi },
  ar: { translation: mergedAr },
  bn: { translation: mergedBn },
  ru: { translation: mergedRu },
  ur: { translation: mergedUr },
};

// Custom language detector that checks URL path first, then localStorage
const customPathDetector = {
  name: 'customPath',
  lookup: () => {
    const pathSegments = window.location.pathname.split('/');
    const firstSegment = pathSegments[1]; // e.g. 'fr' from '/fr/about'
    const supported = SUPPORTED_LANGUAGES.map(l => l.code);
    if (firstSegment && supported.includes(firstSegment as SupportedLanguage)) {
      return firstSegment;
    }
    return undefined;
  },
};

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
languageDetector.addDetector(customPathDetector);
languageDetector.addDetector(customLanguageDetector);
languageDetector.addDetector(customNavigatorDetector);

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr',
    supportedLngs: SUPPORTED_LANGUAGES.map(l => l.code),
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['customPath', 'customLocalStorage', 'customNavigator', 'navigator'],
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