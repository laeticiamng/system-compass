import { describe, it, expect } from 'vitest';
import { countriesSeed } from '../countries-data';

describe('countries-data validation', () => {
  it('should have no duplicate country IDs', () => {
    const ids = countriesSeed.map(c => c.id);
    const uniqueIds = new Set(ids);
    
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
    
    expect(duplicates).toEqual([]);
    expect(ids.length).toBe(uniqueIds.size);
  });

  it('should have no duplicate ISO2 codes', () => {
    const iso2s = countriesSeed.map(c => c.iso2);
    const uniqueIso2s = new Set(iso2s);
    
    const duplicates = iso2s.filter((iso, index) => iso2s.indexOf(iso) !== index);
    
    expect(duplicates).toEqual([]);
    expect(iso2s.length).toBe(uniqueIso2s.size);
  });

  it('should have valid pyramid types for all countries', () => {
    const validPyramidTypes = [
      'PROBLEM_RENT',
      'STABILITY_REDIS',
      'COMPETENCE_TRUST',
      'GROWTH_RISK',
      'HYBRID_TRANSITION',
      'RESOURCE_EXTRACTION',
    ];

    countriesSeed.forEach(country => {
      expect(validPyramidTypes).toContain(country.pyramidType);
    });
  });

  it('should have all required fields for each country', () => {
    countriesSeed.forEach(country => {
      expect(country.id).toBeDefined();
      expect(country.name).toBeDefined();
      expect(country.iso2).toBeDefined();
      expect(country.region).toBeDefined();
      expect(country.pyramidType).toBeDefined();
      expect(country.ruleOfGold).toBeDefined();
      expect(country.pyramid).toBeDefined();
      expect(country.risks).toBeDefined();
      expect(country.playbook).toBeDefined();
    });
  });

  it('should have valid risk values (0-100) for all countries', () => {
    countriesSeed.forEach(country => {
      const { risks } = country;
      
      expect(risks.legal).toBeGreaterThanOrEqual(0);
      expect(risks.legal).toBeLessThanOrEqual(100);
      
      expect(risks.safety).toBeGreaterThanOrEqual(0);
      expect(risks.safety).toBeLessThanOrEqual(100);
      
      expect(risks.corruption).toBeGreaterThanOrEqual(0);
      expect(risks.corruption).toBeLessThanOrEqual(100);
      
      expect(risks.volatility).toBeGreaterThanOrEqual(0);
      expect(risks.volatility).toBeLessThanOrEqual(100);
      
      expect(risks.bureaucracy).toBeGreaterThanOrEqual(0);
      expect(risks.bureaucracy).toBeLessThanOrEqual(100);
    });
  });

  it('should have valid ISO2 codes (2 uppercase letters)', () => {
    const iso2Regex = /^[A-Z]{2}$/;
    
    countriesSeed.forEach(country => {
      expect(country.iso2).toMatch(iso2Regex);
    });
  });

  it('should have non-empty arrays in playbook', () => {
    countriesSeed.forEach(country => {
      expect(country.playbook.do.length).toBeGreaterThan(0);
      expect(country.playbook.dont.length).toBeGreaterThan(0);
      expect(country.playbook.plan30Days.length).toBeGreaterThan(0);
      expect(country.playbook.plan12Months.length).toBeGreaterThan(0);
      expect(country.playbook.plan5Years.length).toBeGreaterThan(0);
    });
  });

  it('should have valid LGBTQ safety ratings', () => {
    const validRatings = ['safe', 'caution', 'dangerous'];
    
    countriesSeed.forEach(country => {
      if (country.lgbtqRights) {
        expect(validRatings).toContain(country.lgbtqRights.safetyRating);
      }
    });
  });

  it('should have minimum number of countries', () => {
    expect(countriesSeed.length).toBeGreaterThanOrEqual(10);
  });
});
