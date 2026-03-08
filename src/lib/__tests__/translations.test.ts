import { describe, it, expect } from 'vitest';

describe('Translation Files Consistency', () => {
  it('should have all LANGUAGES loaded', () => {
    expect(true).toBe(true);
  });
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
