/**
 * Services Layer Tests - Business Logic Validation
 */
import { describe, it, expect } from 'vitest';
import { 
  sanitizeEvent, 
  calculateSessionDuration, 
  generateSessionId, 
  isSessionExpired 
} from '../analytics';
import { 
  calculateCountryScore, 
  getPyramidTypeLabel, 
  filterByRegion 
} from '../country';
import { 
  calculateFeasibility, 
  calculateTimelineScore, 
  calculateExitKeyScore 
} from '../exitKeys';
import { 
  matchProfileToCountry, 
  validateProfileCompleteness 
} from '../profile';
import { 
  sanitizeText, 
  sanitizeEmail, 
  sanitizeUrl, 
  validatePasswordStrength 
} from '../security';

// Analytics Service Tests
describe('Analytics Service', () => {
  describe('sanitizeEvent', () => {
    it('should truncate long category names', () => {
      const event = { category: 'a'.repeat(100), name: 'test' };
      expect(sanitizeEvent(event).category).toHaveLength(50);
    });

    it('should preserve short names', () => {
      const event = { category: 'click', name: 'button' };
      const result = sanitizeEvent(event);
      expect(result.category).toBe('click');
      expect(result.name).toBe('button');
    });
  });

  describe('calculateSessionDuration', () => {
    it('should calculate duration in seconds', () => {
      const start = new Date('2026-01-01T10:00:00');
      const end = new Date('2026-01-01T10:05:30');
      expect(calculateSessionDuration(start, end)).toBe(330);
    });
  });

  describe('generateSessionId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateSessionId();
      const id2 = generateSessionId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('isSessionExpired', () => {
    it('should return true for expired sessions', () => {
      const lastActivity = new Date(Date.now() - 31 * 60 * 1000);
      expect(isSessionExpired(lastActivity)).toBe(true);
    });

    it('should return false for active sessions', () => {
      const lastActivity = new Date(Date.now() - 5 * 60 * 1000);
      expect(isSessionExpired(lastActivity)).toBe(false);
    });
  });
});

// Country Service Tests
describe('Country Service', () => {
  describe('calculateCountryScore', () => {
    it('should calculate overall score', () => {
      const country = {
        id: 'test-country',
        quality_of_life: { overall: 80 },
        cost_of_living: { score: 70 },
        risks: { overall: 20 },
      } as any;
      const result = calculateCountryScore(country);
      expect(result.overallScore).toBeGreaterThan(0);
      expect(result.overallScore).toBeLessThanOrEqual(100);
    });
  });

  describe('getPyramidTypeLabel', () => {
    it('should return French label for known types', () => {
      expect(getPyramidTypeLabel('meritocracy')).toBe('Méritocratie');
      expect(getPyramidTypeLabel('network-based')).toBe('Réseaux');
    });

    it('should return original for unknown types', () => {
      expect(getPyramidTypeLabel('unknown')).toBe('unknown');
    });
  });

  describe('filterByRegion', () => {
    it('should filter countries by region', () => {
      const countries = [
        { id: '1', region: 'europe' },
        { id: '2', region: 'asia' },
        { id: '3', region: 'europe' },
      ] as any[];
      expect(filterByRegion(countries, 'europe')).toHaveLength(2);
    });

    it('should return all for "all" filter', () => {
      const countries = [{ id: '1', region: 'europe' }] as any[];
      expect(filterByRegion(countries, 'all')).toHaveLength(1);
    });
  });
});

// Exit Keys Service Tests
describe('Exit Keys Service', () => {
  describe('calculateFeasibility', () => {
    it('should give high score when budget exceeds requirements', () => {
      const profile = { budget: 100000 } as any;
      const requirements = { minBudget: 50000 };
      expect(calculateFeasibility(profile, requirements)).toBeGreaterThan(80);
    });

    it('should penalize insufficient budget', () => {
      const profile = { budget: 25000, skills: [] } as any;
      const requirements = { minBudget: 50000 };
      expect(calculateFeasibility(profile, requirements)).toBeLessThan(100);
    });
  });

  describe('calculateTimelineScore', () => {
    it('should give 100 when key timeline fits user preference', () => {
      expect(calculateTimelineScore('medium', '6')).toBe(100);
    });

    it('should penalize long timelines for immediate needs', () => {
      expect(calculateTimelineScore('immediate', '24')).toBeLessThan(50);
    });
  });

  describe('calculateExitKeyScore', () => {
    it('should return complete score object', () => {
      const profile = {
        age: 35,
        budget: 80000,
        familySize: 2,
        skills: ['tech'],
        languages: ['en', 'fr'],
        riskTolerance: 'medium' as const,
        timeline: 'medium' as const,
      };
      const key = {
        id: 'test-key',
        minBudget: 50000,
        timeline: '12',
        riskLevel: 'medium',
      };
      const result = calculateExitKeyScore(profile, key);
      expect(result).toHaveProperty('feasibilityScore');
      expect(result).toHaveProperty('overallScore');
      expect(result.overallScore).toBeGreaterThan(0);
    });
  });
});

// Profile Service Tests
describe('Profile Service', () => {
  describe('matchProfileToCountry', () => {
    it('should return match result with scores', () => {
      const profile = {
        id: 'user1',
        incomeLevel: 'high' as const,
        familyStatus: 'couple' as const,
        priorities: ['safety'],
        dealbreakers: [],
      };
      const country = {
        id: 'country1',
        pyramidType: 'meritocracy',
        costOfLiving: 75,
      };
      const result = matchProfileToCountry(profile, country);
      expect(result.countryId).toBe('country1');
      expect(result.matchScore).toBeGreaterThan(0);
    });

    it('should add warning for LGBTQ unfriendly if dealbreaker', () => {
      const profile = {
        id: 'user1',
        priorities: [],
        dealbreakers: ['lgbtq_unfriendly'],
      };
      const country = {
        id: 'country1',
        pyramidType: 'hybrid',
        costOfLiving: 50,
        lgbtqFriendly: false,
      };
      const result = matchProfileToCountry(profile, country);
      expect(result.warnings).toContain('LGBTQ+ rights concerns');
    });
  });

  describe('validateProfileCompleteness', () => {
    it('should return incomplete for missing fields', () => {
      const result = validateProfileCompleteness({ age: 30 });
      expect(result.isComplete).toBe(false);
      expect(result.missingFields).toContain('nationality');
    });

    it('should return 100% for complete profile', () => {
      const result = validateProfileCompleteness({
        age: 30,
        nationality: 'FR',
        profession: 'developer',
        incomeLevel: 'high',
        priorities: ['safety'],
      });
      expect(result.completionPercentage).toBe(100);
    });
  });
});

// Security Service Tests
describe('Security Service', () => {
  describe('sanitizeText', () => {
    it('should escape HTML entities', () => {
      expect(sanitizeText('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
      );
    });
  });

  describe('sanitizeEmail', () => {
    it('should validate and lowercase email', () => {
      expect(sanitizeEmail('Test@Example.COM')).toBe('test@example.com');
    });

    it('should return null for invalid email', () => {
      expect(sanitizeEmail('not-an-email')).toBeNull();
    });
  });

  describe('sanitizeUrl', () => {
    it('should allow relative URLs', () => {
      expect(sanitizeUrl('/dashboard', [])).toBe('/dashboard');
    });

    it('should block protocol-relative URLs', () => {
      expect(sanitizeUrl('//evil.com', [])).toBeNull();
    });

    it('should allow whitelisted domains', () => {
      expect(sanitizeUrl('https://example.com/path', ['example.com'])).toBe(
        'https://example.com/path'
      );
    });
  });

  describe('validatePasswordStrength', () => {
    it('should give low score for weak passwords', () => {
      const result = validatePasswordStrength('weak');
      expect(result.isStrong).toBe(false);
      expect(result.score).toBeLessThan(50);
    });

    it('should give high score for strong passwords', () => {
      const result = validatePasswordStrength('StrongP@ss123');
      expect(result.isStrong).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(75);
    });
  });
});
