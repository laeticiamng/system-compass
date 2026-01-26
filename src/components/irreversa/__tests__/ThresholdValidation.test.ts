import { describe, it, expect } from 'vitest';
import { 
  CreateThresholdSchema, 
  AddWitnessSchema,
  validateCreateThreshold,
  validateAddWitness,
  isValidStatusTransition,
  canDeleteThreshold,
  isThresholdOverdue,
  checkDuplicateTitle
} from '../ThresholdValidation';

// ============================================
// THRESHOLD VALIDATION TESTS
// Security-critical input validation
// ============================================

describe('CreateThresholdSchema', () => {
  it('should validate a complete valid threshold', () => {
    const validData = {
      title: 'Décision stratégique importante',
      context: 'Cette décision a été prise dans le cadre de la restructuration',
      domain: 'strategic',
      detection_source: 'manual',
      threshold_nature: 'resource_commitment',
      irreversibility_reason: 'Contrat signé et engagements pris',
      alternatives_before: ['Option A', 'Option B'],
      validated_by: 'Jean Dupont',
      validator_role: 'ceo',
      organization_name: 'Acme Corp'
    };

    const result = CreateThresholdSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject title shorter than 5 characters', () => {
    const invalidData = {
      title: 'Test',
      context: 'Cette décision a été prise dans le cadre',
      domain: 'strategic',
      detection_source: 'manual',
      threshold_nature: 'resource_commitment',
      irreversibility_reason: 'Contrat signé',
      alternatives_before: [],
      validated_by: 'Jean',
      validator_role: 'ceo'
    };

    const result = CreateThresholdSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject context shorter than 20 characters', () => {
    const invalidData = {
      title: 'Titre valide',
      context: 'Contexte court',
      domain: 'strategic',
      detection_source: 'manual',
      threshold_nature: 'resource_commitment',
      irreversibility_reason: 'Raison valide ici',
      alternatives_before: [],
      validated_by: 'Jean Dupont',
      validator_role: 'ceo'
    };

    const result = CreateThresholdSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject invalid domain', () => {
    const invalidData = {
      title: 'Titre valide ici',
      context: 'Contexte suffisamment long pour valider',
      domain: 'invalid_domain',
      detection_source: 'manual',
      threshold_nature: 'resource_commitment',
      irreversibility_reason: 'Raison valide',
      alternatives_before: [],
      validated_by: 'Jean Dupont',
      validator_role: 'ceo'
    };

    const result = CreateThresholdSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should accept optional organization_name', () => {
    const validData = {
      title: 'Décision stratégique importante',
      context: 'Cette décision a été prise dans le cadre de la restructuration',
      domain: 'strategic',
      detection_source: 'manual',
      threshold_nature: 'resource_commitment',
      irreversibility_reason: 'Contrat signé et engagements pris',
      alternatives_before: [],
      validated_by: 'Jean Dupont',
      validator_role: 'ceo'
    };

    const result = CreateThresholdSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});

describe('AddWitnessSchema', () => {
  it('should validate a complete witness', () => {
    const validData = {
      witness_name: 'Marie Martin',
      witness_role: 'executive',
      witness_statement: 'Je confirme cette décision'
    };

    const result = AddWitnessSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should accept witness without statement', () => {
    const validData = {
      witness_name: 'Marie Martin',
      witness_role: 'board_member'
    };

    const result = AddWitnessSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject witness with short name', () => {
    const invalidData = {
      witness_name: 'A',
      witness_role: 'executive'
    };

    const result = AddWitnessSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe('validateCreateThreshold', () => {
  it('should return success with valid data', () => {
    const result = validateCreateThreshold({
      title: 'Décision stratégique importante',
      context: 'Cette décision a été prise dans le cadre de la restructuration',
      domain: 'strategic',
      detection_source: 'manual',
      threshold_nature: 'resource_commitment',
      irreversibility_reason: 'Contrat signé et engagements pris',
      alternatives_before: [],
      validated_by: 'Jean Dupont',
      validator_role: 'ceo'
    });

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });

  it('should return errors with invalid data', () => {
    const result = validateCreateThreshold({
      title: 'X',
      context: 'Short',
      domain: 'invalid',
      validated_by: 'A'
    });

    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors!.length).toBeGreaterThan(0);
  });
});

describe('validateAddWitness', () => {
  it('should return success with valid data', () => {
    const result = validateAddWitness({
      witness_name: 'Marie Martin',
      witness_role: 'executive'
    });

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });

  it('should return errors with invalid role', () => {
    const result = validateAddWitness({
      witness_name: 'Marie Martin',
      witness_role: 'invalid_role'
    });

    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
  });
});

describe('isValidStatusTransition', () => {
  it('should allow detected -> marked', () => {
    expect(isValidStatusTransition('detected', 'marked')).toBe(true);
  });

  it('should allow marked -> validated', () => {
    expect(isValidStatusTransition('marked', 'validated')).toBe(true);
  });

  it('should allow validated -> sealed', () => {
    expect(isValidStatusTransition('validated', 'sealed')).toBe(true);
  });

  it('should not allow skipping steps', () => {
    expect(isValidStatusTransition('detected', 'validated')).toBe(false);
    expect(isValidStatusTransition('detected', 'sealed')).toBe(false);
    expect(isValidStatusTransition('marked', 'sealed')).toBe(false);
  });

  it('should not allow backwards transitions', () => {
    expect(isValidStatusTransition('sealed', 'validated')).toBe(false);
    expect(isValidStatusTransition('validated', 'marked')).toBe(false);
  });
});

describe('canDeleteThreshold', () => {
  it('should allow deletion of non-sealed thresholds', () => {
    expect(canDeleteThreshold('detected')).toBe(true);
    expect(canDeleteThreshold('marked')).toBe(true);
    expect(canDeleteThreshold('validated')).toBe(true);
  });

  it('should not allow deletion of sealed thresholds', () => {
    expect(canDeleteThreshold('sealed')).toBe(false);
  });
});

describe('isThresholdOverdue', () => {
  it('should return false for sealed thresholds', () => {
    const recentDate = new Date().toISOString();
    expect(isThresholdOverdue(recentDate, 'sealed', 14)).toBe(false);
  });

  it('should return false for recent thresholds', () => {
    const recentDate = new Date().toISOString();
    expect(isThresholdOverdue(recentDate, 'detected', 14)).toBe(false);
  });

  it('should return true for old thresholds', () => {
    const oldDate = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString();
    expect(isThresholdOverdue(oldDate, 'detected', 14)).toBe(true);
  });
});

describe('checkDuplicateTitle', () => {
  const existingTitles = [
    'Décision de fermeture',
    'Restructuration RH',
    'Cession filiale'
  ];

  it('should detect exact duplicates (case insensitive)', () => {
    expect(checkDuplicateTitle('Décision de fermeture', existingTitles)).toBe(true);
    expect(checkDuplicateTitle('DÉCISION DE FERMETURE', existingTitles)).toBe(true);
  });

  it('should return false for unique titles', () => {
    expect(checkDuplicateTitle('Nouveau projet', existingTitles)).toBe(false);
  });

  it('should handle whitespace', () => {
    expect(checkDuplicateTitle('  Décision de fermeture  ', existingTitles)).toBe(true);
  });
});
