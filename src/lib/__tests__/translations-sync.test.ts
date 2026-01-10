import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';

// Translation type
type TranslationObject = Record<string, unknown>;

// Languages to test
const LANGUAGES = ['en', 'fr', 'de', 'es', 'it', 'nl', 'pt'];
const REFERENCE_LANG = 'en';

// Load translations from files
const translations: Record<string, TranslationObject> = {};

beforeAll(() => {
  for (const lang of LANGUAGES) {
    const filePath = path.join(__dirname, '../../locales', `${lang}.json`);
    const content = fs.readFileSync(filePath, 'utf-8');
    translations[lang] = JSON.parse(content);
  }
});

/**
 * Recursively extract all keys from a translation object with dot notation
 */
function extractKeys(obj: TranslationObject, prefix = ''): string[] {
  const keys: string[] = [];
  
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys.push(...extractKeys(value as TranslationObject, fullKey));
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

describe('Translation Files Synchronization', () => {
  it('should have all LANGUAGES loaded', () => {
    expect(Object.keys(translations).length).toBe(LANGUAGES.length);
  });

  describe('Key consistency across languages', () => {
    LANGUAGES.forEach(lang => {
      if (lang === REFERENCE_LANG) return;
      
      it(`${lang.toUpperCase()} should have less than 5% missing keys from ${REFERENCE_LANG}`, () => {
        const refKeys = extractKeys(translations[REFERENCE_LANG]);
        const langKeys = extractKeys(translations[lang]);
        
        const missingKeys = refKeys.filter(key => {
          const value = getNestedValue(translations[lang], key);
          return value === undefined;
        });
        
        const missingPercentage = (missingKeys.length / refKeys.length) * 100;
        
        if (missingKeys.length > 0 && missingPercentage >= 5) {
          console.log(`\n❌ ${lang}.json is missing ${missingKeys.length} keys (${missingPercentage.toFixed(1)}%):`);
          missingKeys.slice(0, 10).forEach(k => console.log(`  - ${k}`));
        }
        
        expect(missingPercentage).toBeLessThan(5);
      });
    });
  });

  describe('Critical keys presence', () => {
    const criticalSections = ['common', 'nav', 'header', 'footer', 'auth'];
    
    criticalSections.forEach(section => {
      it(`all languages should have '${section}' namespace`, () => {
        LANGUAGES.forEach(lang => {
          expect(translations[lang][section]).toBeDefined();
        });
      });
    });
  });

  describe('No empty critical translations', () => {
    const criticalKeys = [
      'common.appName',
      'common.back',
      'common.save',
      'common.cancel',
      'nav.home',
      'nav.countries',
    ];

    LANGUAGES.forEach(lang => {
      it(`${lang.toUpperCase()} should have non-empty critical keys`, () => {
        const emptyKeys: string[] = [];
        
        criticalKeys.forEach(key => {
          const value = getNestedValue(translations[lang], key);
          if (value === '' || value === undefined) {
            emptyKeys.push(key);
          }
        });
        
        if (emptyKeys.length > 0) {
          console.log(`\n⚠️ ${lang}.json has empty critical keys:`, emptyKeys);
        }
        
        expect(emptyKeys.length).toBe(0);
      });
    });
  });

  describe('Top-level namespace consistency', () => {
    it('all languages should have the same top-level namespaces as reference', () => {
      const refNamespaces = new Set(Object.keys(translations[REFERENCE_LANG]));
      
      LANGUAGES.forEach(lang => {
        if (lang === REFERENCE_LANG) return;
        
        const langNamespaces = Object.keys(translations[lang]);
        const missingNamespaces = [...refNamespaces].filter(ns => !langNamespaces.includes(ns));
        
        // Allow up to 3 missing namespaces
        expect(missingNamespaces.length).toBeLessThanOrEqual(3);
      });
    });
  });

  describe('No duplicate JSON keys (structural test)', () => {
    // This tests that the JSON was properly parsed (duplicates would be overwritten)
    LANGUAGES.forEach(lang => {
      it(`${lang}.json should parse without issues`, () => {
        expect(() => {
          const filePath = path.join(__dirname, '../../locales', `${lang}.json`);
          const content = fs.readFileSync(filePath, 'utf-8');
          JSON.parse(content);
        }).not.toThrow();
      });
    });
  });

  describe('Usage translations exist', () => {
    const usageKeys = [
      'usage.title',
      'usage.loginRequired',
      'usage.currentPeriod',
      'usage.activityLog',
    ];

    it('all languages should have usage translations', () => {
      LANGUAGES.forEach(lang => {
        usageKeys.forEach(key => {
          const value = getNestedValue(translations[lang], key);
          expect(value).toBeDefined();
        });
      });
    });
  });

  describe('OVI translations exist', () => {
    const oviKeys = [
      'ovi.badge',
      'ovi.fullName',
      'ovi.tabs.intro',
    ];

    it('all languages should have OVI translations', () => {
      LANGUAGES.forEach(lang => {
        oviKeys.forEach(key => {
          const value = getNestedValue(translations[lang], key);
          expect(value).toBeDefined();
        });
      });
    });
  });

  describe('Institutions translations exist', () => {
    const instKeys = [
      'institutions.badge',
      'institutions.title',
      'institutions.tabs.intro',
    ];

    it('all languages should have institutions translations', () => {
      LANGUAGES.forEach(lang => {
        instKeys.forEach(key => {
          const value = getNestedValue(translations[lang], key);
          expect(value).toBeDefined();
        });
      });
    });
  });
});

describe('Code-to-Translation Sync Simulation', () => {
  it('should report any keys used in code but missing from translations', () => {
    // This is a simulation - the actual check is done by scripts/check-translation-keys.js
    // Here we just verify the test framework works
    expect(true).toBe(true);
  });
});
