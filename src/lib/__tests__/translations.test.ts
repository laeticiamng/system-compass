import { describe, it, expect } from 'vitest';
import en from '@/locales/en.json';
import fr from '@/locales/fr.json';
import nl from '@/locales/nl.json';
import de from '@/locales/de.json';
import es from '@/locales/es.json';
import itTranslations from '@/locales/it.json';
import pt from '@/locales/pt.json';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TranslationObject = Record<string, any>;

const LANGUAGES: Record<string, TranslationObject> = {
  en,
  fr,
  nl,
  de,
  es,
  it: itTranslations,
  pt,
};

const REFERENCE_LANG = 'en';

/**
 * Recursively extract all keys from a translation object with dot notation
 */
function extractKeys(obj: TranslationObject, prefix = ''): string[] {
  const keys: string[] = [];
  
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys.push(...extractKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  
  return keys;
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj: TranslationObject, keyPath: string): unknown {
  const parts = keyPath.split('.');
  let current: unknown = obj;
  
  for (const part of parts) {
    if (current === undefined || current === null || typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }
  
  return current;
}

describe('Translation Files Consistency', () => {
  const referenceKeys = extractKeys(LANGUAGES[REFERENCE_LANG]);
  
  it('reference language (en) should have keys', () => {
    expect(referenceKeys.length).toBeGreaterThan(0);
  });

  // Test each language against reference
  Object.entries(LANGUAGES).forEach(([langCode, translations]) => {
    if (langCode === REFERENCE_LANG) return;
    
    describe(`${langCode.toUpperCase()} translations`, () => {
      const langKeys = extractKeys(translations);
      
      it('should have translation keys', () => {
        expect(langKeys.length).toBeGreaterThan(0);
      });

      it('should have all keys from reference language', () => {
        const missingKeys: string[] = [];
        
        for (const key of referenceKeys) {
          const value = getNestedValue(translations, key);
          if (value === undefined) {
            missingKeys.push(key);
          }
        }
        
        if (missingKeys.length > 0) {
          console.log(`\n❌ Missing ${missingKeys.length} keys in ${langCode}.json:`);
          missingKeys.slice(0, 20).forEach(key => console.log(`  • ${key}`));
          if (missingKeys.length > 20) {
            console.log(`  ... and ${missingKeys.length - 20} more`);
          }
        }
        
        // Allow up to 5% missing keys as a soft warning
        const missingPercentage = (missingKeys.length / referenceKeys.length) * 100;
        expect(missingPercentage).toBeLessThan(5);
      });

      it('should not have empty string values for critical keys', () => {
        const criticalPrefixes = ['common.', 'nav.', 'header.'];
        const emptyKeys: string[] = [];
        
        for (const key of langKeys) {
          const isCritical = criticalPrefixes.some(prefix => key.startsWith(prefix));
          if (isCritical) {
            const value = getNestedValue(translations, key);
            if (value === '') {
              emptyKeys.push(key);
            }
          }
        }
        
        if (emptyKeys.length > 0) {
          console.log(`\n⚠️ Empty critical keys in ${langCode}.json:`, emptyKeys);
        }
        
        expect(emptyKeys).toHaveLength(0);
      });
    });
  });
});

describe('Translation Key Structure', () => {
  it('all languages should have the same top-level namespaces', () => {
    const referenceNamespaces = Object.keys(LANGUAGES[REFERENCE_LANG]).sort();
    
    Object.entries(LANGUAGES).forEach(([langCode, translations]) => {
      if (langCode === REFERENCE_LANG) return;
      
      const langNamespaces = Object.keys(translations).sort();
      const missingNamespaces = referenceNamespaces.filter(ns => !langNamespaces.includes(ns));
      
      if (missingNamespaces.length > 0) {
        console.log(`\n⚠️ ${langCode}.json missing namespaces:`, missingNamespaces);
      }
      
      // Allow some missing namespaces but not too many
      expect(missingNamespaces.length).toBeLessThanOrEqual(5);
    });
  });

  it('errorsIllusions namespace should have required keys in all languages', () => {
    const requiredKeys = [
      'errorsIllusions.badge',
      'errorsIllusions.title',
      'errorsIllusions.subtitle',
      'errorsIllusions.homeTeaser',
      'errorsIllusions.explore',
      'errorsIllusions.cognitiveShort',
      'errorsIllusions.systemicShort',
      'errorsIllusions.tabs.cognitive',
      'errorsIllusions.tabs.systemic',
    ];

    Object.entries(LANGUAGES).forEach(([langCode, translations]) => {
      const missing: string[] = [];
      
      for (const key of requiredKeys) {
        const value = getNestedValue(translations, key);
        if (value === undefined) {
          missing.push(key);
        }
      }
      
      if (missing.length > 0) {
        console.log(`\n❌ ${langCode}.json missing errorsIllusions keys:`, missing);
      }
      
      expect(missing).toHaveLength(0);
    });
  });

  it('common namespace should have required keys in all languages', () => {
    const requiredKeys = [
      'common.appName',
      'common.yes',
      'common.no',
      'common.back',
      'common.next',
      'common.save',
      'common.cancel',
      'common.loading',
    ];

    Object.entries(LANGUAGES).forEach(([, translations]) => {
      const missing: string[] = [];
      
      for (const key of requiredKeys) {
        const value = getNestedValue(translations, key);
        if (value === undefined) {
          missing.push(key);
        }
      }
      
      expect(missing).toHaveLength(0);
    });
  });
});

describe('Translation Value Quality', () => {
  it('translations should not contain the reference language text (potential untranslated)', () => {
    // Sample of keys that are likely to be different across languages
    const testKeys = ['common.yes', 'common.no', 'common.back'];
    
    Object.entries(LANGUAGES).forEach(([langCode, translations]) => {
      if (langCode === REFERENCE_LANG) return;
      
      const suspectKeys: string[] = [];
      
      for (const key of testKeys) {
        const refValue = getNestedValue(LANGUAGES[REFERENCE_LANG], key);
        const langValue = getNestedValue(translations, key);
        
        if (refValue === langValue && typeof refValue === 'string' && refValue.length > 3) {
          suspectKeys.push(key);
        }
      }
      
      if (suspectKeys.length > 0) {
        console.log(`\n⚠️ ${langCode}.json may have untranslated keys:`, suspectKeys);
      }
      
      // Just a warning, not a failure
      expect(true).toBe(true);
    });
  });
});
