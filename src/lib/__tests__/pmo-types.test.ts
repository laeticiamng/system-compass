import { describe, it, expect } from 'vitest';
import {
  calculateRiskScore,
  getRiskSeverity,
  formatBudgetAmount,
  calculateRunway,
  RISK_CATEGORY_LABELS,
  BUDGET_CATEGORY_LABELS,
  PRIORITY_LABELS,
  OBJECTIVE_STATUS_LABELS,
  INITIATIVE_STATUS_LABELS,
  MILESTONE_STATUS_LABELS,
  RISK_STATUS_LABELS,
  SCENARIO_TYPE_LABELS,
} from '../pmo-types';

// ============================================
// UTILITY FUNCTION TESTS
// ============================================

describe('pmo-types utility functions', () => {
  describe('calculateRiskScore', () => {
    it('should return correct score for impact * probability', () => {
      expect(calculateRiskScore(1, 1)).toBe(1);
      expect(calculateRiskScore(5, 5)).toBe(25);
      expect(calculateRiskScore(3, 4)).toBe(12);
      expect(calculateRiskScore(2, 2)).toBe(4);
    });

    it('should handle edge cases', () => {
      expect(calculateRiskScore(0, 5)).toBe(0);
      expect(calculateRiskScore(5, 0)).toBe(0);
      expect(calculateRiskScore(0, 0)).toBe(0);
    });
  });

  describe('getRiskSeverity', () => {
    it('should return "low" for scores 1-4', () => {
      expect(getRiskSeverity(1)).toBe('low');
      expect(getRiskSeverity(2)).toBe('low');
      expect(getRiskSeverity(3)).toBe('low');
      expect(getRiskSeverity(4)).toBe('low');
    });

    it('should return "medium" for scores 5-9', () => {
      expect(getRiskSeverity(5)).toBe('medium');
      expect(getRiskSeverity(6)).toBe('medium');
      expect(getRiskSeverity(9)).toBe('medium');
    });

    it('should return "high" for scores 10-16', () => {
      expect(getRiskSeverity(10)).toBe('high');
      expect(getRiskSeverity(12)).toBe('high');
      expect(getRiskSeverity(16)).toBe('high');
    });

    it('should return "critical" for scores > 16', () => {
      expect(getRiskSeverity(17)).toBe('critical');
      expect(getRiskSeverity(20)).toBe('critical');
      expect(getRiskSeverity(25)).toBe('critical');
    });

    it('should handle boundary values correctly', () => {
      expect(getRiskSeverity(4)).toBe('low');
      expect(getRiskSeverity(5)).toBe('medium');
      expect(getRiskSeverity(9)).toBe('medium');
      expect(getRiskSeverity(10)).toBe('high');
      expect(getRiskSeverity(16)).toBe('high');
      expect(getRiskSeverity(17)).toBe('critical');
    });
  });

  describe('formatBudgetAmount', () => {
    it('should format EUR amounts correctly', () => {
      const result = formatBudgetAmount(1000);
      expect(result).toMatch(/1[\s\u202F]?000/); // Handle different space types
      expect(result).toContain('€');
    });

    it('should format zero correctly', () => {
      const result = formatBudgetAmount(0);
      expect(result).toContain('0');
      expect(result).toContain('€');
    });

    it('should format large amounts correctly', () => {
      const result = formatBudgetAmount(1000000);
      expect(result).toMatch(/1[\s\u202F]?000[\s\u202F]?000/);
    });

    it('should support different currencies', () => {
      const usdResult = formatBudgetAmount(1000, 'USD');
      expect(usdResult).toContain('$');
    });

    it('should round to integers (no decimals)', () => {
      const result = formatBudgetAmount(1234.56);
      expect(result).toMatch(/1[\s\u202F]?235/); // Should round
    });
  });

  describe('calculateRunway', () => {
    it('should calculate correct runway in months', () => {
      expect(calculateRunway(100000, 10000)).toBe(10);
      expect(calculateRunway(50000, 10000)).toBe(5);
      expect(calculateRunway(25000, 5000)).toBe(5);
    });

    it('should return 999 for zero or negative burn rate', () => {
      expect(calculateRunway(100000, 0)).toBe(999);
      expect(calculateRunway(100000, -1)).toBe(999);
    });

    it('should floor the result', () => {
      expect(calculateRunway(15000, 4000)).toBe(3); // 3.75 -> 3
      expect(calculateRunway(22000, 3000)).toBe(7); // 7.33 -> 7
    });

    it('should handle edge case of no cash', () => {
      expect(calculateRunway(0, 10000)).toBe(0);
    });
  });
});

// ============================================
// LABEL COMPLETENESS TESTS
// ============================================

describe('pmo-types labels', () => {
  describe('RISK_CATEGORY_LABELS', () => {
    const expectedCategories = [
      'strategy', 'finance', 'technical', 'product',
      'legal', 'security', 'operational', 'hr_vendors'
    ];

    it('should have all expected categories', () => {
      expectedCategories.forEach(cat => {
        expect(RISK_CATEGORY_LABELS).toHaveProperty(cat);
      });
    });

    it('should have fr and en translations for each category', () => {
      Object.values(RISK_CATEGORY_LABELS).forEach(label => {
        expect(label).toHaveProperty('fr');
        expect(label).toHaveProperty('en');
        expect(typeof label.fr).toBe('string');
        expect(typeof label.en).toBe('string');
        expect(label.fr.length).toBeGreaterThan(0);
        expect(label.en.length).toBeGreaterThan(0);
      });
    });
  });

  describe('BUDGET_CATEGORY_LABELS', () => {
    const expectedCategories = [
      'hr', 'contractors', 'cloud', 'compliance',
      'marketing', 'legal', 'office', 'travel', 'tools', 'other'
    ];

    it('should have all expected categories', () => {
      expectedCategories.forEach(cat => {
        expect(BUDGET_CATEGORY_LABELS).toHaveProperty(cat);
      });
    });

    it('should have fr and en translations for each category', () => {
      Object.values(BUDGET_CATEGORY_LABELS).forEach(label => {
        expect(label).toHaveProperty('fr');
        expect(label).toHaveProperty('en');
        expect(typeof label.fr).toBe('string');
        expect(typeof label.en).toBe('string');
      });
    });
  });

  describe('PRIORITY_LABELS', () => {
    const expectedPriorities = ['low', 'medium', 'high', 'critical'];

    it('should have all expected priorities', () => {
      expectedPriorities.forEach(p => {
        expect(PRIORITY_LABELS).toHaveProperty(p);
      });
    });

    it('should have fr, en, and color for each priority', () => {
      Object.values(PRIORITY_LABELS).forEach(label => {
        expect(label).toHaveProperty('fr');
        expect(label).toHaveProperty('en');
        expect(label).toHaveProperty('color');
        expect(typeof label.color).toBe('string');
        expect(label.color.length).toBeGreaterThan(0);
      });
    });
  });

  describe('OBJECTIVE_STATUS_LABELS', () => {
    const expectedStatuses = ['draft', 'active', 'completed', 'cancelled'];

    it('should have all expected statuses', () => {
      expectedStatuses.forEach(s => {
        expect(OBJECTIVE_STATUS_LABELS).toHaveProperty(s);
      });
    });
  });

  describe('INITIATIVE_STATUS_LABELS', () => {
    const expectedStatuses = ['todo', 'in_progress', 'blocked', 'done', 'cancelled'];

    it('should have all expected statuses', () => {
      expectedStatuses.forEach(s => {
        expect(INITIATIVE_STATUS_LABELS).toHaveProperty(s);
      });
    });
  });

  describe('MILESTONE_STATUS_LABELS', () => {
    const expectedStatuses = ['pending', 'in_progress', 'completed', 'missed'];

    it('should have all expected statuses', () => {
      expectedStatuses.forEach(s => {
        expect(MILESTONE_STATUS_LABELS).toHaveProperty(s);
      });
    });
  });

  describe('RISK_STATUS_LABELS', () => {
    const expectedStatuses = ['identified', 'analyzing', 'mitigating', 'monitoring', 'closed', 'escalated'];

    it('should have all expected statuses', () => {
      expectedStatuses.forEach(s => {
        expect(RISK_STATUS_LABELS).toHaveProperty(s);
      });
    });
  });

  describe('SCENARIO_TYPE_LABELS', () => {
    const expectedTypes = ['base', 'optimistic', 'constrained'];

    it('should have all expected scenario types', () => {
      expectedTypes.forEach(t => {
        expect(SCENARIO_TYPE_LABELS).toHaveProperty(t);
      });
    });
  });
});

// ============================================
// TYPE SAFETY EDGE CASE TESTS
// ============================================

describe('pmo-types edge cases and robustness', () => {
  describe('getRiskSeverity edge cases', () => {
    it('should handle 0 score', () => {
      expect(getRiskSeverity(0)).toBe('low');
    });

    it('should handle negative scores (defensive)', () => {
      expect(getRiskSeverity(-1)).toBe('low');
    });

    it('should handle very large scores', () => {
      expect(getRiskSeverity(100)).toBe('critical');
    });
  });

  describe('formatBudgetAmount edge cases', () => {
    it('should handle negative amounts', () => {
      const result = formatBudgetAmount(-5000);
      expect(result).toContain('-');
    });

    it('should handle very large amounts', () => {
      const result = formatBudgetAmount(999999999);
      expect(result).toBeTruthy();
    });
  });

  describe('calculateRunway edge cases', () => {
    it('should handle very large available cash', () => {
      expect(calculateRunway(1000000000, 10000)).toBe(100000);
    });

    it('should handle fractional burn rates', () => {
      expect(calculateRunway(10000, 3333)).toBe(3);
    });
  });
});
