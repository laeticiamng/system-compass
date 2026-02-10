import { describe, it, expect } from 'vitest';
import { 
  validateCountry, 
  safeValidateCountry, 
  validateCountryWithReport 
} from '../schemas/country';

describe('Country Schema Validation', () => {
  const validCountry = {
    id: 'france',
    name: 'France',
    iso2: 'FR',
    region: 'Europe',
    pyramidType: 'STABILITY_REDIS',
    risks: {
      political: 25,
      economic: 35,
      social: 30,
    },
    pyramid: {
      type: 'STABILITY_REDIS',
      rigidity: 65,
      mobility: 45,
      transparency: 70,
    },
    qualityOfLife: {
      overall: 78,
      healthcare: 90,
      education: 82,
      safety: 75,
    },
    lgbtqRights: {
      score: 82,
      marriage: true,
      civilUnion: true,
      adoption: true,
      discrimination: true,
    },
    lastUpdated: '2024-01-15T00:00:00Z',
    dataVersion: '1.0.0',
  };

  describe('validateCountry', () => {
    it('should validate a correct country object', () => {
      expect(() => validateCountry(validCountry)).not.toThrow();
    });

    it('should return the validated data', () => {
      const result = validateCountry(validCountry);
      expect(result.id).toBe('france');
      expect(result.name).toBe('France');
      expect(result.pyramidType).toBe('STABILITY_REDIS');
    });

    it('should throw for invalid data', () => {
      expect(() => validateCountry({ id: 'test' })).toThrow();
    });
  });

  describe('safeValidateCountry', () => {
    it('should return success true for valid data', () => {
      const result = safeValidateCountry(validCountry);
      expect(result.success).toBe(true);
    });

    it('should return success false for invalid data', () => {
      const result = safeValidateCountry({ id: 'test' });
      expect(result.success).toBe(false);
    });

    it('should reject invalid country code length', () => {
      const invalid = { ...validCountry, iso2: 'FRA' };
      const result = safeValidateCountry(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject risks out of range', () => {
      const invalid = {
        ...validCountry,
        risks: { political: 150, economic: 35, social: 30 },
      };
      const result = safeValidateCountry(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject invalid pyramid type', () => {
      const invalid = {
        ...validCountry,
        pyramidType: 'INVALID_TYPE',
      };
      const result = safeValidateCountry(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('validateCountryWithReport', () => {
    it('should return success with data for valid input', () => {
      const result = validateCountryWithReport(validCountry);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.errors).toBeUndefined();
    });

    it('should return errors for invalid input', () => {
      const result = validateCountryWithReport({ id: 'test' });
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(Array.isArray(result.errors)).toBe(true);
      expect(result.errors!.length).toBeGreaterThan(0);
    });

    it('should provide readable error messages', () => {
      const result = validateCountryWithReport({ id: 'test', name: 123 });
      expect(result.success).toBe(false);
      expect(result.errors!.some(e => e.includes('name'))).toBe(true);
    });
  });

  describe('pyramid type validation', () => {
    const pyramidTypes = [
      'PROBLEM_RENT',
      'STABILITY_REDIS',
      'COMPETENCE_TRUST',
      'GROWTH_RISK',
      'HYBRID_TRANSITION',
      'RESOURCE_EXTRACTION',
    ];

    it('should accept all valid pyramid types', () => {
      pyramidTypes.forEach(type => {
        const country = { ...validCountry, pyramidType: type };
        const result = safeValidateCountry(country);
        expect(result.success).toBe(true);
      });
    });

    it('should reject unknown pyramid types', () => {
      const country = { ...validCountry, pyramidType: 'UNKNOWN' };
      const result = safeValidateCountry(country);
      expect(result.success).toBe(false);
    });
  });

  describe('optional fields', () => {
    it('should validate minimal country object', () => {
      const minimalCountry = {
        id: 'test',
        name: 'Test Country',
        iso2: 'TC',
        pyramidType: 'STABILITY_REDIS',
      };
      const result = safeValidateCountry(minimalCountry);
      expect(result.success).toBe(true);
    });

    it('should allow omitting optional nested objects', () => {
      const country = {
        id: 'test',
        name: 'Test Country',
        iso2: 'TC',
        pyramidType: 'STABILITY_REDIS',
        // No risks, pyramid, visa, etc.
      };
      const result = safeValidateCountry(country);
      expect(result.success).toBe(true);
    });
  });

  describe('LGBTQ rights validation', () => {
    it('should validate complete LGBTQ rights object', () => {
      const country = {
        ...validCountry,
        lgbtqRights: {
          score: 85,
          marriage: true,
          civilUnion: true,
          adoption: true,
          discrimination: true,
          notes: 'Progressive laws since 2013',
        },
      };
      const result = safeValidateCountry(country);
      expect(result.success).toBe(true);
    });

    it('should reject LGBTQ score out of range', () => {
      const country = {
        ...validCountry,
        lgbtqRights: { score: 150 },
      };
      const result = safeValidateCountry(country);
      expect(result.success).toBe(false);
    });
  });
});
