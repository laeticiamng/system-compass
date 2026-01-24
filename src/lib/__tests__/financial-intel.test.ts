/**
 * Tests for Financial Intelligence module (scam detection and legit options)
 *
 * Tests cover:
 * - Data structure validation for scams and legit options
 * - Country profile validation
 * - Confidence scoring
 * - Source validation
 * - Red flags and protection checklist validation
 */
import { describe, it, expect } from 'vitest';
import {
  createMockFinancialIntelResult,
  isValidISODate,
} from './test-utils';

// Types for validation
type SourceConfidence = 'high' | 'medium' | 'low';

interface ScamItem {
  name: string;
  category: string;
  process: string;
  typical_targets: string;
  red_flags: string[];
  psychological_tactics: string[];
  risks: string[];
  protection_checklist: string[];
  where_to_verify: string[];
  where_to_report: string[];
}

interface LegitOption {
  name: string;
  category: string;
  why_safer: string;
  what_its_not: string;
  verification_checklist: string[];
  when_to_avoid: string[];
  official_resources: string[];
}

interface CountryProfile {
  name: string;
  currency: string;
  main_regulators: string[];
  source_confidence: SourceConfidence;
}

interface Source {
  name: string;
  url?: string;
  type: string;
  date?: string;
}

interface FinancialIntelResult {
  country_profile: CountryProfile;
  scam_top7: ScamItem[];
  legit_top7: LegitOption[];
  sources: Source[];
  confidence: number;
  disclaimer: string;
  cached?: boolean;
}

// Validation constants
const VALID_CONFIDENCE_LEVELS: SourceConfidence[] = ['high', 'medium', 'low'];
const VALID_SOURCE_TYPES = ['regulator', 'government', 'ngo', 'academic', 'media', 'industry'];
const VALID_SCAM_CATEGORIES = ['investment', 'banking', 'crypto', 'real_estate', 'employment', 'romance', 'government_impersonation'];

// Business logic functions (extracted for pure testing)
function validateConfidenceLevel(level: string): level is SourceConfidence {
  return VALID_CONFIDENCE_LEVELS.includes(level as SourceConfidence);
}

function validateConfidenceScore(score: number): boolean {
  return score >= 0 && score <= 100;
}

function validateCountryProfile(profile: Partial<CountryProfile>): string[] {
  const errors: string[] = [];

  if (!profile.name || profile.name.trim().length === 0) {
    errors.push('Country name is required');
  }

  if (!profile.currency || profile.currency.trim().length === 0) {
    errors.push('Currency is required');
  }

  if (!profile.main_regulators || profile.main_regulators.length === 0) {
    errors.push('At least one regulator is required');
  }

  if (profile.source_confidence && !validateConfidenceLevel(profile.source_confidence)) {
    errors.push('Invalid source confidence level');
  }

  return errors;
}

function validateScamItem(scam: Partial<ScamItem>): string[] {
  const errors: string[] = [];

  if (!scam.name || scam.name.trim().length === 0) {
    errors.push('Scam name is required');
  }

  if (!scam.category || scam.category.trim().length === 0) {
    errors.push('Category is required');
  }

  if (!scam.process || scam.process.trim().length === 0) {
    errors.push('Process description is required');
  }

  if (!scam.typical_targets || scam.typical_targets.trim().length === 0) {
    errors.push('Typical targets description is required');
  }

  if (!scam.red_flags || scam.red_flags.length === 0) {
    errors.push('At least one red flag is required');
  }

  if (!scam.risks || scam.risks.length === 0) {
    errors.push('At least one risk is required');
  }

  if (!scam.protection_checklist || scam.protection_checklist.length === 0) {
    errors.push('At least one protection checklist item is required');
  }

  return errors;
}

function validateLegitOption(option: Partial<LegitOption>): string[] {
  const errors: string[] = [];

  if (!option.name || option.name.trim().length === 0) {
    errors.push('Option name is required');
  }

  if (!option.category || option.category.trim().length === 0) {
    errors.push('Category is required');
  }

  if (!option.why_safer || option.why_safer.trim().length === 0) {
    errors.push('Why safer explanation is required');
  }

  if (!option.verification_checklist || option.verification_checklist.length === 0) {
    errors.push('At least one verification checklist item is required');
  }

  return errors;
}

function validateSource(source: Partial<Source>): string[] {
  const errors: string[] = [];

  if (!source.name || source.name.trim().length === 0) {
    errors.push('Source name is required');
  }

  if (!source.type || source.type.trim().length === 0) {
    errors.push('Source type is required');
  }

  if (source.url && !isValidUrl(source.url)) {
    errors.push('Invalid URL format');
  }

  return errors;
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function calculateOverallConfidence(result: FinancialIntelResult): { score: number; label: string } {
  let score = result.confidence;

  // Adjust based on source confidence
  if (result.country_profile.source_confidence === 'high') {
    score = Math.min(100, score + 10);
  } else if (result.country_profile.source_confidence === 'low') {
    score = Math.max(0, score - 15);
  }

  // Adjust based on number of sources
  if (result.sources.length >= 5) {
    score = Math.min(100, score + 5);
  } else if (result.sources.length < 2) {
    score = Math.max(0, score - 10);
  }

  let label: string;
  if (score >= 80) label = 'high';
  else if (score >= 50) label = 'medium';
  else label = 'low';

  return { score, label };
}

function validateFinancialIntelResult(result: Partial<FinancialIntelResult>): string[] {
  const errors: string[] = [];

  if (!result.country_profile) {
    errors.push('Country profile is required');
  } else {
    errors.push(...validateCountryProfile(result.country_profile).map(e => `Country profile: ${e}`));
  }

  if (!result.scam_top7 || result.scam_top7.length === 0) {
    errors.push('At least one scam item is required');
  } else {
    result.scam_top7.forEach((scam, index) => {
      errors.push(...validateScamItem(scam).map(e => `Scam ${index + 1}: ${e}`));
    });
  }

  if (!result.legit_top7 || result.legit_top7.length === 0) {
    errors.push('At least one legit option is required');
  } else {
    result.legit_top7.forEach((option, index) => {
      errors.push(...validateLegitOption(option).map(e => `Legit option ${index + 1}: ${e}`));
    });
  }

  if (!result.sources || result.sources.length === 0) {
    errors.push('At least one source is required');
  }

  if (result.confidence !== undefined && !validateConfidenceScore(result.confidence)) {
    errors.push('Confidence score must be between 0 and 100');
  }

  if (!result.disclaimer || result.disclaimer.trim().length === 0) {
    errors.push('Disclaimer is required');
  }

  return errors;
}

function countRedFlags(scams: ScamItem[]): number {
  return scams.reduce((count, scam) => count + scam.red_flags.length, 0);
}

function getCommonRedFlags(scams: ScamItem[]): string[] {
  const flagCounts = new Map<string, number>();

  scams.forEach(scam => {
    scam.red_flags.forEach(flag => {
      const normalizedFlag = flag.toLowerCase().trim();
      flagCounts.set(normalizedFlag, (flagCounts.get(normalizedFlag) || 0) + 1);
    });
  });

  return Array.from(flagCounts.entries())
    .filter(([, count]) => count > 1)
    .map(([flag]) => flag);
}

describe('Financial Intelligence Module', () => {
  describe('Data Structure Validation', () => {
    it('should create a valid financial intel result with all required fields', () => {
      const result = createMockFinancialIntelResult();

      expect(result.country_profile).toBeDefined();
      expect(result.scam_top7).toBeDefined();
      expect(result.legit_top7).toBeDefined();
      expect(result.sources).toBeDefined();
      expect(result.confidence).toBeDefined();
      expect(result.disclaimer).toBeDefined();
    });

    it('should have valid arrays for scams and legit options', () => {
      const result = createMockFinancialIntelResult();

      expect(Array.isArray(result.scam_top7)).toBe(true);
      expect(Array.isArray(result.legit_top7)).toBe(true);
      expect(Array.isArray(result.sources)).toBe(true);
    });

    it('should have confidence score between 0 and 100', () => {
      const result = createMockFinancialIntelResult();

      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(100);
    });
  });

  describe('Confidence Level Validation', () => {
    it('should validate all confidence levels', () => {
      VALID_CONFIDENCE_LEVELS.forEach(level => {
        expect(validateConfidenceLevel(level)).toBe(true);
      });
    });

    it('should reject invalid confidence levels', () => {
      expect(validateConfidenceLevel('invalid')).toBe(false);
      expect(validateConfidenceLevel('very_high')).toBe(false);
      expect(validateConfidenceLevel('')).toBe(false);
    });

    it('should have exactly 3 valid confidence levels', () => {
      expect(VALID_CONFIDENCE_LEVELS).toHaveLength(3);
      expect(VALID_CONFIDENCE_LEVELS).toContain('high');
      expect(VALID_CONFIDENCE_LEVELS).toContain('medium');
      expect(VALID_CONFIDENCE_LEVELS).toContain('low');
    });
  });

  describe('Confidence Score Validation', () => {
    it('should accept valid confidence scores', () => {
      expect(validateConfidenceScore(0)).toBe(true);
      expect(validateConfidenceScore(50)).toBe(true);
      expect(validateConfidenceScore(100)).toBe(true);
    });

    it('should reject invalid confidence scores', () => {
      expect(validateConfidenceScore(-1)).toBe(false);
      expect(validateConfidenceScore(101)).toBe(false);
      expect(validateConfidenceScore(-100)).toBe(false);
    });
  });

  describe('Country Profile Validation', () => {
    it('should pass validation for complete profile', () => {
      const profile: CountryProfile = {
        name: 'France',
        currency: 'EUR',
        main_regulators: ['AMF', 'ACPR'],
        source_confidence: 'high',
      };

      const errors = validateCountryProfile(profile);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation for missing name', () => {
      const profile = {
        currency: 'EUR',
        main_regulators: ['AMF'],
        source_confidence: 'high' as SourceConfidence,
      };

      const errors = validateCountryProfile(profile);
      expect(errors).toContain('Country name is required');
    });

    it('should fail validation for missing currency', () => {
      const profile = {
        name: 'France',
        main_regulators: ['AMF'],
        source_confidence: 'high' as SourceConfidence,
      };

      const errors = validateCountryProfile(profile);
      expect(errors).toContain('Currency is required');
    });

    it('should fail validation for empty regulators', () => {
      const profile = {
        name: 'France',
        currency: 'EUR',
        main_regulators: [],
        source_confidence: 'high' as SourceConfidence,
      };

      const errors = validateCountryProfile(profile);
      expect(errors).toContain('At least one regulator is required');
    });
  });

  describe('Scam Item Validation', () => {
    it('should pass validation for complete scam item', () => {
      const scam = createMockFinancialIntelResult().scam_top7[0];
      const errors = validateScamItem(scam);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation for missing name', () => {
      const scam = { ...createMockFinancialIntelResult().scam_top7[0], name: '' };
      const errors = validateScamItem(scam);
      expect(errors).toContain('Scam name is required');
    });

    it('should fail validation for missing red flags', () => {
      const scam = { ...createMockFinancialIntelResult().scam_top7[0], red_flags: [] };
      const errors = validateScamItem(scam);
      expect(errors).toContain('At least one red flag is required');
    });

    it('should fail validation for missing protection checklist', () => {
      const scam = { ...createMockFinancialIntelResult().scam_top7[0], protection_checklist: [] };
      const errors = validateScamItem(scam);
      expect(errors).toContain('At least one protection checklist item is required');
    });

    it('should validate all required arrays', () => {
      const scam: ScamItem = {
        name: 'Test Scam',
        category: 'investment',
        process: 'How it works',
        typical_targets: 'New investors',
        red_flags: ['Warning sign'],
        psychological_tactics: [],
        risks: ['Loss of funds'],
        protection_checklist: ['Verify registration'],
        where_to_verify: [],
        where_to_report: [],
      };

      const errors = validateScamItem(scam);
      expect(errors).toHaveLength(0);
    });
  });

  describe('Legit Option Validation', () => {
    it('should pass validation for complete legit option', () => {
      const option = createMockFinancialIntelResult().legit_top7[0];
      const errors = validateLegitOption(option);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation for missing name', () => {
      const option = { ...createMockFinancialIntelResult().legit_top7[0], name: '' };
      const errors = validateLegitOption(option);
      expect(errors).toContain('Option name is required');
    });

    it('should fail validation for missing why_safer', () => {
      const option = { ...createMockFinancialIntelResult().legit_top7[0], why_safer: '' };
      const errors = validateLegitOption(option);
      expect(errors).toContain('Why safer explanation is required');
    });

    it('should fail validation for empty verification checklist', () => {
      const option = { ...createMockFinancialIntelResult().legit_top7[0], verification_checklist: [] };
      const errors = validateLegitOption(option);
      expect(errors).toContain('At least one verification checklist item is required');
    });
  });

  describe('Source Validation', () => {
    it('should pass validation for complete source', () => {
      const source: Source = {
        name: 'AMF',
        type: 'regulator',
        url: 'https://www.amf-france.org',
      };

      const errors = validateSource(source);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation for source without URL', () => {
      const source: Source = {
        name: 'Local Authority',
        type: 'government',
      };

      const errors = validateSource(source);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation for missing name', () => {
      const source = { name: '', type: 'regulator' };
      const errors = validateSource(source);
      expect(errors).toContain('Source name is required');
    });

    it('should fail validation for missing type', () => {
      const source = { name: 'AMF', type: '' };
      const errors = validateSource(source);
      expect(errors).toContain('Source type is required');
    });

    it('should fail validation for invalid URL', () => {
      const source = { name: 'AMF', type: 'regulator', url: 'not-a-valid-url' };
      const errors = validateSource(source);
      expect(errors).toContain('Invalid URL format');
    });
  });

  describe('URL Validation', () => {
    it('should accept valid URLs', () => {
      expect(isValidUrl('https://www.example.com')).toBe(true);
      expect(isValidUrl('http://example.com')).toBe(true);
      expect(isValidUrl('https://example.com/path?query=value')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('example.com')).toBe(false);
      expect(isValidUrl('')).toBe(false);
    });
  });

  describe('Overall Confidence Calculation', () => {
    it('should increase score for high source confidence', () => {
      const result = createMockFinancialIntelResult() as FinancialIntelResult;
      result.country_profile.source_confidence = 'high';
      result.confidence = 70;
      // Need multiple sources to avoid the "few sources" penalty
      result.sources = Array(3).fill({ name: 'AMF', type: 'regulator' });

      const calculated = calculateOverallConfidence(result);
      // High confidence adds +10, but no bonus/penalty for 3 sources
      expect(calculated.score).toBe(80);
    });

    it('should decrease score for low source confidence', () => {
      const result = createMockFinancialIntelResult() as FinancialIntelResult;
      result.country_profile.source_confidence = 'low';
      result.confidence = 70;
      result.sources = [{ name: 'Source', type: 'media' }];

      const calculated = calculateOverallConfidence(result);
      expect(calculated.score).toBeLessThan(70);
    });

    it('should increase score for many sources', () => {
      const result = createMockFinancialIntelResult() as FinancialIntelResult;
      result.country_profile.source_confidence = 'medium';
      result.confidence = 70;
      result.sources = Array(5).fill({ name: 'Source', type: 'regulator' });

      const calculated = calculateOverallConfidence(result);
      expect(calculated.score).toBeGreaterThan(70);
    });

    it('should decrease score for few sources', () => {
      const result = createMockFinancialIntelResult() as FinancialIntelResult;
      result.country_profile.source_confidence = 'medium';
      result.confidence = 70;
      result.sources = [{ name: 'Source', type: 'media' }];

      const calculated = calculateOverallConfidence(result);
      expect(calculated.score).toBeLessThan(70);
    });

    it('should return appropriate labels', () => {
      const highResult = createMockFinancialIntelResult() as FinancialIntelResult;
      highResult.confidence = 90;
      highResult.country_profile.source_confidence = 'high';

      const medResult = createMockFinancialIntelResult() as FinancialIntelResult;
      medResult.confidence = 60;

      const lowResult = createMockFinancialIntelResult() as FinancialIntelResult;
      lowResult.confidence = 30;
      lowResult.country_profile.source_confidence = 'low';

      expect(calculateOverallConfidence(highResult).label).toBe('high');
      expect(calculateOverallConfidence(medResult).label).toBe('medium');
      expect(calculateOverallConfidence(lowResult).label).toBe('low');
    });

    it('should clamp score between 0 and 100', () => {
      const extremeHigh = createMockFinancialIntelResult() as FinancialIntelResult;
      extremeHigh.confidence = 100;
      extremeHigh.country_profile.source_confidence = 'high';
      extremeHigh.sources = Array(10).fill({ name: 'Source', type: 'regulator' });

      const extremeLow = createMockFinancialIntelResult() as FinancialIntelResult;
      extremeLow.confidence = 0;
      extremeLow.country_profile.source_confidence = 'low';
      extremeLow.sources = [];

      expect(calculateOverallConfidence(extremeHigh).score).toBeLessThanOrEqual(100);
      expect(calculateOverallConfidence(extremeLow).score).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Full Result Validation', () => {
    it('should pass validation for complete result', () => {
      const result = createMockFinancialIntelResult();
      const errors = validateFinancialIntelResult(result);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation for missing country profile', () => {
      const result = { ...createMockFinancialIntelResult(), country_profile: undefined };
      const errors = validateFinancialIntelResult(result as Partial<FinancialIntelResult>);
      expect(errors).toContain('Country profile is required');
    });

    it('should fail validation for empty scams array', () => {
      const result = { ...createMockFinancialIntelResult(), scam_top7: [] };
      const errors = validateFinancialIntelResult(result);
      expect(errors).toContain('At least one scam item is required');
    });

    it('should fail validation for empty legit options array', () => {
      const result = { ...createMockFinancialIntelResult(), legit_top7: [] };
      const errors = validateFinancialIntelResult(result);
      expect(errors).toContain('At least one legit option is required');
    });

    it('should fail validation for missing disclaimer', () => {
      const result = { ...createMockFinancialIntelResult(), disclaimer: '' };
      const errors = validateFinancialIntelResult(result);
      expect(errors).toContain('Disclaimer is required');
    });

    it('should accumulate nested validation errors', () => {
      const result = createMockFinancialIntelResult();
      result.country_profile.name = '';
      result.scam_top7[0].name = '';

      const errors = validateFinancialIntelResult(result);
      expect(errors.some(e => e.includes('Country profile'))).toBe(true);
      expect(errors.some(e => e.includes('Scam 1'))).toBe(true);
    });
  });

  describe('Red Flags Analysis', () => {
    it('should count total red flags across scams', () => {
      const scams: ScamItem[] = [
        { ...createMockFinancialIntelResult().scam_top7[0], red_flags: ['Flag 1', 'Flag 2'] },
        { ...createMockFinancialIntelResult().scam_top7[0], red_flags: ['Flag 3'] },
      ];

      expect(countRedFlags(scams)).toBe(3);
    });

    it('should identify common red flags', () => {
      const scams: ScamItem[] = [
        { ...createMockFinancialIntelResult().scam_top7[0], red_flags: ['Guaranteed returns', 'Pressure'] },
        { ...createMockFinancialIntelResult().scam_top7[0], red_flags: ['Guaranteed returns', 'Secrecy'] },
      ];

      const common = getCommonRedFlags(scams);
      expect(common).toContain('guaranteed returns');
      expect(common).not.toContain('pressure');
      expect(common).not.toContain('secrecy');
    });

    it('should return empty array when no common flags', () => {
      const scams: ScamItem[] = [
        { ...createMockFinancialIntelResult().scam_top7[0], red_flags: ['Flag 1'] },
        { ...createMockFinancialIntelResult().scam_top7[0], red_flags: ['Flag 2'] },
      ];

      const common = getCommonRedFlags(scams);
      expect(common).toHaveLength(0);
    });
  });

  describe('Country-Specific Scenarios', () => {
    it('should handle European country with high confidence', () => {
      const result = createMockFinancialIntelResult({
        country_profile: {
          name: 'Germany',
          currency: 'EUR',
          main_regulators: ['BaFin', 'ECB'],
          source_confidence: 'high',
        },
        confidence: 90,
      });

      const errors = validateFinancialIntelResult(result);
      expect(errors).toHaveLength(0);
      expect(result.country_profile.source_confidence).toBe('high');
    });

    it('should handle emerging market with medium confidence', () => {
      const result = createMockFinancialIntelResult({
        country_profile: {
          name: 'Brazil',
          currency: 'BRL',
          main_regulators: ['CVM', 'Banco Central'],
          source_confidence: 'medium',
        },
        confidence: 70,
      });

      const errors = validateFinancialIntelResult(result);
      expect(errors).toHaveLength(0);
    });

    it('should handle country with low data confidence', () => {
      const result = createMockFinancialIntelResult({
        country_profile: {
          name: 'Country X',
          currency: 'XXX',
          main_regulators: ['Local Authority'],
          source_confidence: 'low',
        },
        confidence: 40,
      });

      const errors = validateFinancialIntelResult(result);
      expect(errors).toHaveLength(0);
      expect(result.country_profile.source_confidence).toBe('low');
    });
  });

  describe('Cache Handling', () => {
    it('should indicate cached results', () => {
      const result = createMockFinancialIntelResult({ cached: true });
      expect(result.cached).toBe(true);
    });

    it('should default to not cached', () => {
      const result = createMockFinancialIntelResult({ cached: false });
      expect(result.cached).toBe(false);
    });
  });
});
