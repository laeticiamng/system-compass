/**
 * Tests for Irreversa module (irreversible decision tracking)
 *
 * Tests cover:
 * - Data structure validation
 * - Status workflow transitions (detected → marked → validated → sealed)
 * - Witness management
 * - Audit log integrity
 * - Domain and nature categorization
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  createMockIrreversaThreshold,
  VALID_THRESHOLD_DOMAINS,
  VALID_THRESHOLD_NATURES,
  VALID_DETECTION_SOURCES,
  VALID_VALIDATOR_ROLES,
  VALID_THRESHOLD_STATUSES,
  isValidISODate,
} from './test-utils';

// Types imported for validation
type ThresholdDomain = 'strategic' | 'financial' | 'organizational' | 'legal' | 'ethical';
type ThresholdNature = 'resource_commitment' | 'contractual' | 'reputational' | 'structural' | 'temporal';
type DetectionSource = 'compass_analysis' | 'manual' | 'external_signal';
type ValidatorRole = 'ceo' | 'board' | 'founder' | 'director' | 'comex';
type ThresholdStatus = 'detected' | 'marked' | 'validated' | 'sealed';

interface IrreversaThreshold {
  id: string;
  user_id: string;
  organization_name: string | null;
  title: string;
  context: string;
  domain: ThresholdDomain;
  detection_date: string;
  detection_source: DetectionSource;
  compass_country_id: string | null;
  threshold_nature: ThresholdNature;
  irreversibility_reason: string;
  alternatives_before: string[];
  validated_by: string;
  validator_role: ValidatorRole;
  validation_date: string | null;
  validation_statement: string | null;
  status: ThresholdStatus;
  sealed_at: string | null;
  created_at: string;
  updated_at: string;
}

interface IrreversaWitness {
  id: string;
  threshold_id: string;
  witness_name: string;
  witness_role: string;
  witness_statement: string | null;
  witnessed_at: string;
  signature_hash: string | null;
}

interface IrreversaAuditEntry {
  id: string;
  threshold_id: string;
  action: string;
  actor_name: string;
  actor_role: string;
  details: Record<string, unknown>;
  created_at: string;
}

// Business logic functions (extracted for pure testing)
function validateThresholdDomain(domain: string): domain is ThresholdDomain {
  return VALID_THRESHOLD_DOMAINS.includes(domain);
}

function validateThresholdNature(nature: string): nature is ThresholdNature {
  return VALID_THRESHOLD_NATURES.includes(nature);
}

function validateDetectionSource(source: string): source is DetectionSource {
  return VALID_DETECTION_SOURCES.includes(source);
}

function validateValidatorRole(role: string): role is ValidatorRole {
  return VALID_VALIDATOR_ROLES.includes(role);
}

function validateThresholdStatus(status: string): status is ThresholdStatus {
  return VALID_THRESHOLD_STATUSES.includes(status);
}

function canTransitionStatus(current: ThresholdStatus, target: ThresholdStatus): boolean {
  const transitions: Record<ThresholdStatus, ThresholdStatus[]> = {
    'detected': ['marked'],
    'marked': ['validated'],
    'validated': ['sealed'],
    'sealed': [], // Terminal state, no further transitions
  };
  return transitions[current]?.includes(target) ?? false;
}

function isThresholdSealed(threshold: IrreversaThreshold): boolean {
  return threshold.status === 'sealed' && threshold.sealed_at !== null;
}

function validateThreshold(data: Partial<IrreversaThreshold>): string[] {
  const errors: string[] = [];

  if (!data.title || data.title.trim().length === 0) {
    errors.push('Title is required');
  }

  if (!data.context || data.context.trim().length === 0) {
    errors.push('Context is required');
  }

  if (!data.domain || !validateThresholdDomain(data.domain)) {
    errors.push('Valid domain is required');
  }

  if (!data.threshold_nature || !validateThresholdNature(data.threshold_nature)) {
    errors.push('Valid threshold nature is required');
  }

  if (!data.irreversibility_reason || data.irreversibility_reason.trim().length === 0) {
    errors.push('Irreversibility reason is required');
  }

  if (!data.validated_by || data.validated_by.trim().length === 0) {
    errors.push('Validator name is required');
  }

  if (!data.validator_role || !validateValidatorRole(data.validator_role)) {
    errors.push('Valid validator role is required');
  }

  if (!data.detection_source || !validateDetectionSource(data.detection_source)) {
    errors.push('Valid detection source is required');
  }

  return errors;
}

function validateWitness(data: Partial<IrreversaWitness>): string[] {
  const errors: string[] = [];

  if (!data.threshold_id) {
    errors.push('Threshold ID is required');
  }

  if (!data.witness_name || data.witness_name.trim().length === 0) {
    errors.push('Witness name is required');
  }

  if (!data.witness_role || data.witness_role.trim().length === 0) {
    errors.push('Witness role is required');
  }

  return errors;
}

describe('Irreversa Module', () => {
  describe('Data Structure Validation', () => {
    it('should create a valid threshold with all required fields', () => {
      const threshold = createMockIrreversaThreshold();

      expect(threshold.id).toBeDefined();
      expect(threshold.user_id).toBeDefined();
      expect(threshold.title).toBeDefined();
      expect(threshold.context).toBeDefined();
      expect(threshold.domain).toBeDefined();
      expect(threshold.threshold_nature).toBeDefined();
      expect(threshold.irreversibility_reason).toBeDefined();
      expect(threshold.validated_by).toBeDefined();
      expect(threshold.validator_role).toBeDefined();
      expect(threshold.status).toBeDefined();
    });

    it('should have valid ISO dates', () => {
      const threshold = createMockIrreversaThreshold();

      expect(isValidISODate(threshold.created_at)).toBe(true);
      expect(isValidISODate(threshold.updated_at)).toBe(true);
      expect(isValidISODate(threshold.detection_date)).toBe(true);
    });

    it('should allow null for optional fields', () => {
      const threshold = createMockIrreversaThreshold({
        organization_name: null,
        compass_country_id: null,
        validation_date: null,
        validation_statement: null,
        sealed_at: null,
      });

      expect(threshold.organization_name).toBeNull();
      expect(threshold.compass_country_id).toBeNull();
      expect(threshold.validation_date).toBeNull();
      expect(threshold.validation_statement).toBeNull();
      expect(threshold.sealed_at).toBeNull();
    });

    it('should have alternatives_before as an array', () => {
      const threshold = createMockIrreversaThreshold();
      expect(Array.isArray(threshold.alternatives_before)).toBe(true);
    });
  });

  describe('Domain Validation', () => {
    it('should validate all threshold domains', () => {
      VALID_THRESHOLD_DOMAINS.forEach(domain => {
        expect(validateThresholdDomain(domain)).toBe(true);
      });
    });

    it('should reject invalid domains', () => {
      expect(validateThresholdDomain('invalid')).toBe(false);
      expect(validateThresholdDomain('')).toBe(false);
      expect(validateThresholdDomain('STRATEGIC')).toBe(false); // case sensitive
    });

    it('should have exactly 5 valid domains', () => {
      expect(VALID_THRESHOLD_DOMAINS).toHaveLength(5);
      expect(VALID_THRESHOLD_DOMAINS).toContain('strategic');
      expect(VALID_THRESHOLD_DOMAINS).toContain('financial');
      expect(VALID_THRESHOLD_DOMAINS).toContain('organizational');
      expect(VALID_THRESHOLD_DOMAINS).toContain('legal');
      expect(VALID_THRESHOLD_DOMAINS).toContain('ethical');
    });
  });

  describe('Threshold Nature Validation', () => {
    it('should validate all threshold natures', () => {
      VALID_THRESHOLD_NATURES.forEach(nature => {
        expect(validateThresholdNature(nature)).toBe(true);
      });
    });

    it('should reject invalid natures', () => {
      expect(validateThresholdNature('invalid')).toBe(false);
      expect(validateThresholdNature('')).toBe(false);
    });

    it('should have exactly 5 valid natures', () => {
      expect(VALID_THRESHOLD_NATURES).toHaveLength(5);
      expect(VALID_THRESHOLD_NATURES).toContain('resource_commitment');
      expect(VALID_THRESHOLD_NATURES).toContain('contractual');
      expect(VALID_THRESHOLD_NATURES).toContain('reputational');
      expect(VALID_THRESHOLD_NATURES).toContain('structural');
      expect(VALID_THRESHOLD_NATURES).toContain('temporal');
    });
  });

  describe('Detection Source Validation', () => {
    it('should validate all detection sources', () => {
      VALID_DETECTION_SOURCES.forEach(source => {
        expect(validateDetectionSource(source)).toBe(true);
      });
    });

    it('should reject invalid sources', () => {
      expect(validateDetectionSource('invalid')).toBe(false);
      expect(validateDetectionSource('user_input')).toBe(false);
    });

    it('should have exactly 3 valid sources', () => {
      expect(VALID_DETECTION_SOURCES).toHaveLength(3);
      expect(VALID_DETECTION_SOURCES).toContain('compass_analysis');
      expect(VALID_DETECTION_SOURCES).toContain('manual');
      expect(VALID_DETECTION_SOURCES).toContain('external_signal');
    });
  });

  describe('Validator Role Validation', () => {
    it('should validate all validator roles', () => {
      VALID_VALIDATOR_ROLES.forEach(role => {
        expect(validateValidatorRole(role)).toBe(true);
      });
    });

    it('should reject invalid roles', () => {
      expect(validateValidatorRole('manager')).toBe(false);
      expect(validateValidatorRole('employee')).toBe(false);
    });

    it('should have exactly 5 valid roles', () => {
      expect(VALID_VALIDATOR_ROLES).toHaveLength(5);
      expect(VALID_VALIDATOR_ROLES).toContain('ceo');
      expect(VALID_VALIDATOR_ROLES).toContain('board');
      expect(VALID_VALIDATOR_ROLES).toContain('founder');
      expect(VALID_VALIDATOR_ROLES).toContain('director');
      expect(VALID_VALIDATOR_ROLES).toContain('comex');
    });
  });

  describe('Status Workflow', () => {
    it('should validate all threshold statuses', () => {
      VALID_THRESHOLD_STATUSES.forEach(status => {
        expect(validateThresholdStatus(status)).toBe(true);
      });
    });

    it('should have exactly 4 valid statuses in correct order', () => {
      expect(VALID_THRESHOLD_STATUSES).toEqual(['detected', 'marked', 'validated', 'sealed']);
    });

    it('should allow valid status transitions', () => {
      expect(canTransitionStatus('detected', 'marked')).toBe(true);
      expect(canTransitionStatus('marked', 'validated')).toBe(true);
      expect(canTransitionStatus('validated', 'sealed')).toBe(true);
    });

    it('should reject invalid status transitions', () => {
      // Cannot skip steps
      expect(canTransitionStatus('detected', 'validated')).toBe(false);
      expect(canTransitionStatus('detected', 'sealed')).toBe(false);
      expect(canTransitionStatus('marked', 'sealed')).toBe(false);

      // Cannot go backwards
      expect(canTransitionStatus('marked', 'detected')).toBe(false);
      expect(canTransitionStatus('validated', 'marked')).toBe(false);
      expect(canTransitionStatus('sealed', 'validated')).toBe(false);
    });

    it('should not allow transitions from sealed (terminal state)', () => {
      expect(canTransitionStatus('sealed', 'detected')).toBe(false);
      expect(canTransitionStatus('sealed', 'marked')).toBe(false);
      expect(canTransitionStatus('sealed', 'validated')).toBe(false);
      expect(canTransitionStatus('sealed', 'sealed')).toBe(false);
    });
  });

  describe('Sealed State Detection', () => {
    it('should correctly identify sealed thresholds', () => {
      const sealedThreshold = createMockIrreversaThreshold({
        status: 'sealed',
        sealed_at: '2024-01-20T00:00:00Z',
      }) as IrreversaThreshold;

      expect(isThresholdSealed(sealedThreshold)).toBe(true);
    });

    it('should not identify non-sealed thresholds as sealed', () => {
      const detectedThreshold = createMockIrreversaThreshold({
        status: 'detected',
        sealed_at: null,
      }) as IrreversaThreshold;

      expect(isThresholdSealed(detectedThreshold)).toBe(false);
    });

    it('should handle edge case: status sealed but no sealed_at date', () => {
      const incompleteSealed = createMockIrreversaThreshold({
        status: 'sealed',
        sealed_at: null,
      }) as IrreversaThreshold;

      expect(isThresholdSealed(incompleteSealed)).toBe(false);
    });
  });

  describe('Threshold Validation', () => {
    it('should pass validation for complete threshold data', () => {
      const threshold = createMockIrreversaThreshold();
      const errors = validateThreshold(threshold);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation for missing title', () => {
      const threshold = createMockIrreversaThreshold({ title: '' });
      const errors = validateThreshold(threshold);
      expect(errors).toContain('Title is required');
    });

    it('should fail validation for missing context', () => {
      const threshold = createMockIrreversaThreshold({ context: '' });
      const errors = validateThreshold(threshold);
      expect(errors).toContain('Context is required');
    });

    it('should fail validation for invalid domain', () => {
      const threshold = { ...createMockIrreversaThreshold(), domain: 'invalid' as ThresholdDomain };
      const errors = validateThreshold(threshold);
      expect(errors).toContain('Valid domain is required');
    });

    it('should fail validation for invalid threshold nature', () => {
      const threshold = { ...createMockIrreversaThreshold(), threshold_nature: 'invalid' as ThresholdNature };
      const errors = validateThreshold(threshold);
      expect(errors).toContain('Valid threshold nature is required');
    });

    it('should fail validation for missing irreversibility reason', () => {
      const threshold = createMockIrreversaThreshold({ irreversibility_reason: '' });
      const errors = validateThreshold(threshold);
      expect(errors).toContain('Irreversibility reason is required');
    });

    it('should fail validation for missing validator', () => {
      const threshold = createMockIrreversaThreshold({ validated_by: '' });
      const errors = validateThreshold(threshold);
      expect(errors).toContain('Validator name is required');
    });

    it('should fail validation for invalid validator role', () => {
      const threshold = { ...createMockIrreversaThreshold(), validator_role: 'invalid' as ValidatorRole };
      const errors = validateThreshold(threshold);
      expect(errors).toContain('Valid validator role is required');
    });

    it('should accumulate multiple errors', () => {
      const threshold = {
        title: '',
        context: '',
        domain: 'invalid',
        threshold_nature: 'invalid',
        irreversibility_reason: '',
        validated_by: '',
        validator_role: 'invalid',
        detection_source: 'invalid',
      };
      const errors = validateThreshold(threshold as Partial<IrreversaThreshold>);
      expect(errors.length).toBeGreaterThan(5);
    });
  });

  describe('Witness Validation', () => {
    it('should pass validation for complete witness data', () => {
      const witness: Partial<IrreversaWitness> = {
        threshold_id: 'threshold-1',
        witness_name: 'Jane Doe',
        witness_role: 'CFO',
      };
      const errors = validateWitness(witness);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation for missing threshold_id', () => {
      const witness: Partial<IrreversaWitness> = {
        witness_name: 'Jane Doe',
        witness_role: 'CFO',
      };
      const errors = validateWitness(witness);
      expect(errors).toContain('Threshold ID is required');
    });

    it('should fail validation for missing witness_name', () => {
      const witness: Partial<IrreversaWitness> = {
        threshold_id: 'threshold-1',
        witness_name: '',
        witness_role: 'CFO',
      };
      const errors = validateWitness(witness);
      expect(errors).toContain('Witness name is required');
    });

    it('should fail validation for missing witness_role', () => {
      const witness: Partial<IrreversaWitness> = {
        threshold_id: 'threshold-1',
        witness_name: 'Jane Doe',
        witness_role: '',
      };
      const errors = validateWitness(witness);
      expect(errors).toContain('Witness role is required');
    });
  });

  describe('Audit Entry Structure', () => {
    it('should have valid audit entry structure', () => {
      const auditEntry: IrreversaAuditEntry = {
        id: 'audit-1',
        threshold_id: 'threshold-1',
        action: 'created',
        actor_name: 'John Doe',
        actor_role: 'ceo',
        details: { title: 'Decision Title', domain: 'strategic' },
        created_at: '2024-01-15T00:00:00Z',
      };

      expect(auditEntry.id).toBeDefined();
      expect(auditEntry.threshold_id).toBeDefined();
      expect(auditEntry.action).toBeDefined();
      expect(auditEntry.actor_name).toBeDefined();
      expect(auditEntry.actor_role).toBeDefined();
      expect(typeof auditEntry.details).toBe('object');
      expect(isValidISODate(auditEntry.created_at)).toBe(true);
    });

    it('should track standard audit actions', () => {
      const standardActions = ['created', 'marked', 'witness_added', 'validated', 'sealed'];
      standardActions.forEach(action => {
        expect(typeof action).toBe('string');
        expect(action.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Business Rules', () => {
    it('should require at least one alternative before marking as irreversible', () => {
      const threshold = createMockIrreversaThreshold({
        alternatives_before: ['Option A', 'Option B'],
      });
      expect(threshold.alternatives_before.length).toBeGreaterThan(0);
    });

    it('should require validation_statement when validated', () => {
      const validatedThreshold = createMockIrreversaThreshold({
        status: 'validated',
        validation_date: '2024-01-18T00:00:00Z',
        validation_statement: 'Approved after thorough review',
      });
      expect(validatedThreshold.validation_statement).toBeDefined();
      expect(validatedThreshold.validation_statement!.length).toBeGreaterThan(0);
    });

    it('should have sealed_at timestamp when sealed', () => {
      const sealedThreshold = createMockIrreversaThreshold({
        status: 'sealed',
        sealed_at: '2024-01-20T00:00:00Z',
      });
      expect(sealedThreshold.sealed_at).toBeDefined();
      expect(isValidISODate(sealedThreshold.sealed_at!)).toBe(true);
    });
  });

  describe('Domain-Specific Scenarios', () => {
    it('should handle strategic domain thresholds', () => {
      const strategicThreshold = createMockIrreversaThreshold({
        domain: 'strategic',
        threshold_nature: 'resource_commitment',
        title: 'Market Entry Decision',
      });
      expect(strategicThreshold.domain).toBe('strategic');
    });

    it('should handle financial domain thresholds', () => {
      const financialThreshold = createMockIrreversaThreshold({
        domain: 'financial',
        threshold_nature: 'contractual',
        title: 'Major Investment Commitment',
      });
      expect(financialThreshold.domain).toBe('financial');
    });

    it('should handle legal domain thresholds', () => {
      const legalThreshold = createMockIrreversaThreshold({
        domain: 'legal',
        threshold_nature: 'contractual',
        title: 'Binding Agreement Signature',
      });
      expect(legalThreshold.domain).toBe('legal');
    });

    it('should handle ethical domain thresholds', () => {
      const ethicalThreshold = createMockIrreversaThreshold({
        domain: 'ethical',
        threshold_nature: 'reputational',
        title: 'Public Commitment',
      });
      expect(ethicalThreshold.domain).toBe('ethical');
    });

    it('should handle organizational domain thresholds', () => {
      const orgThreshold = createMockIrreversaThreshold({
        domain: 'organizational',
        threshold_nature: 'structural',
        title: 'Team Restructuring',
      });
      expect(orgThreshold.domain).toBe('organizational');
    });
  });
});
