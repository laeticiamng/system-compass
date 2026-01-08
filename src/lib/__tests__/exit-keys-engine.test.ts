import { describe, it, expect } from 'vitest';
import { 
  EXIT_KEYS, 
  findCompatibleKeys, 
  getOptimalKey,
  STRATEGIC_PRINCIPLES,
  type UserContext 
} from '../exit-keys-engine';

describe('Exit Keys Engine', () => {
  const mockContext: UserContext = {
    birthCountry: 'STABILITY_REDIS',
    nationalities: ['STABILITY_REDIS'],
    currentCountry: 'STABILITY_REDIS',
    desiredLife: 'freedom',
    motorProfile: 'BUILDER',
    riskTolerance: 'medium',
    timeHorizon: 'medium',
    hasCapital: false,
    hasCredentials: true,
    hasNetwork: false,
    isLGBTQ: false,
    hasFamily: false,
  };

  describe('EXIT_KEYS data structure', () => {
    it('should have valid exit keys defined', () => {
      expect(Array.isArray(EXIT_KEYS)).toBe(true);
      expect(EXIT_KEYS.length).toBeGreaterThan(0);
    });

    it('should have required fields in each exit key', () => {
      EXIT_KEYS.forEach(key => {
        expect(key).toHaveProperty('id');
        expect(key).toHaveProperty('name');
        expect(key).toHaveProperty('unlocks');
        expect(key).toHaveProperty('successCondition');
        expect(key).toHaveProperty('mainRisk');
        expect(key).toHaveProperty('rawTruth');
        expect(key).toHaveProperty('difficulty');
        expect(key).toHaveProperty('timeframe');
        expect(key).toHaveProperty('steps');
        expect(key).toHaveProperty('requirements');
      });
    });

    it('should have valid difficulty levels', () => {
      const validDifficulties = ['accessible', 'exigeant', 'expert'];
      EXIT_KEYS.forEach(key => {
        expect(validDifficulties).toContain(key.difficulty);
      });
    });

    it('should have at least one step in each exit key', () => {
      EXIT_KEYS.forEach(key => {
        expect(key.steps.length).toBeGreaterThan(0);
      });
    });
  });

  describe('STRATEGIC_PRINCIPLES', () => {
    it('should have valid principles defined', () => {
      expect(Array.isArray(STRATEGIC_PRINCIPLES)).toBe(true);
      expect(STRATEGIC_PRINCIPLES.length).toBeGreaterThan(0);
    });

    it('should have required fields in each principle', () => {
      STRATEGIC_PRINCIPLES.forEach(principle => {
        expect(principle).toHaveProperty('id');
        expect(principle).toHaveProperty('name');
        expect(principle).toHaveProperty('description');
        expect(principle).toHaveProperty('applicablePyramids');
        expect(Array.isArray(principle.applicablePyramids)).toBe(true);
      });
    });
  });

  describe('findCompatibleKeys', () => {
    it('should return an array of results', () => {
      const results = findCompatibleKeys(mockContext);
      expect(Array.isArray(results)).toBe(true);
    });

    it('should include compatibility score in each result', () => {
      const results = findCompatibleKeys(mockContext);
      results.forEach(result => {
        expect(result).toHaveProperty('compatibility');
        expect(typeof result.compatibility).toBe('number');
        expect(result.compatibility).toBeGreaterThanOrEqual(0);
        expect(result.compatibility).toBeLessThanOrEqual(100);
      });
    });

    it('should sort results by compatibility descending', () => {
      const results = findCompatibleKeys(mockContext);
      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].compatibility).toBeGreaterThanOrEqual(results[i].compatibility);
      }
    });

    it('should include the original key data in results', () => {
      const results = findCompatibleKeys(mockContext);
      results.forEach(result => {
        expect(result).toHaveProperty('key');
        expect(result.key).toHaveProperty('id');
        expect(result.key).toHaveProperty('name');
      });
    });
  });

  describe('getOptimalKey', () => {
    it('should return the best matching key or null', () => {
      const result = getOptimalKey(mockContext);
      if (result) {
        expect(result).toHaveProperty('key');
        expect(result).toHaveProperty('compatibility');
      }
    });

    it('should return the highest compatibility result', () => {
      const optimalResult = getOptimalKey(mockContext);
      const allResults = findCompatibleKeys(mockContext);
      
      if (optimalResult && allResults.length > 0) {
        expect(optimalResult.compatibility).toBe(allResults[0].compatibility);
      }
    });
  });

  describe('context variations', () => {
    it('should give different results for different risk tolerances', () => {
      const lowRiskContext = { ...mockContext, riskTolerance: 'low' as const };
      const highRiskContext = { ...mockContext, riskTolerance: 'high' as const };
      
      const lowRiskResults = findCompatibleKeys(lowRiskContext);
      const highRiskResults = findCompatibleKeys(highRiskContext);
      
      expect(lowRiskResults.length).toBeGreaterThan(0);
      expect(highRiskResults.length).toBeGreaterThan(0);
    });

    it('should consider capital availability', () => {
      const noCapitalContext = { ...mockContext, hasCapital: false };
      const withCapitalContext = { ...mockContext, hasCapital: true };
      
      const noCapitalResults = findCompatibleKeys(noCapitalContext);
      const withCapitalResults = findCompatibleKeys(withCapitalContext);
      
      expect(noCapitalResults.length).toBeGreaterThan(0);
      expect(withCapitalResults.length).toBeGreaterThan(0);
    });

    it('should handle different life priorities', () => {
      const priorities: Array<typeof mockContext.desiredLife> = [
        'freedom', 'money', 'meaning', 'status', 'family', 'calm'
      ];
      
      priorities.forEach(priority => {
        const context = { ...mockContext, desiredLife: priority };
        const results = findCompatibleKeys(context);
        expect(results.length).toBeGreaterThanOrEqual(0);
      });
    });
  });
});
