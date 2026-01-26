import { z } from 'zod';

// ============================================
// IRREVERSA THRESHOLD VALIDATION SCHEMAS
// Security-first input validation with zod
// ============================================

// Domain validation
export const ThresholdDomainSchema = z.enum([
  'strategic', 
  'financial', 
  'organizational', 
  'legal', 
  'ethical'
]);

// Nature validation
export const ThresholdNatureSchema = z.enum([
  'resource_commitment',
  'contractual',
  'reputational',
  'structural',
  'temporal'
]);

// Detection source validation
export const DetectionSourceSchema = z.enum([
  'compass_analysis',
  'manual',
  'external_signal'
]);

// Validator role validation
export const ValidatorRoleSchema = z.enum([
  'ceo',
  'board',
  'founder',
  'director',
  'comex'
]);

// Status validation
export const ThresholdStatusSchema = z.enum([
  'detected',
  'marked',
  'validated',
  'sealed'
]);

// Witness role validation
export const WitnessRoleSchema = z.enum([
  'executive',
  'board_member',
  'legal_counsel',
  'external_advisor',
  'auditor',
  'stakeholder'
]);

// Create threshold form schema
export const CreateThresholdSchema = z.object({
  title: z.string()
    .min(5, 'Le titre doit contenir au moins 5 caractères')
    .max(200, 'Le titre ne doit pas dépasser 200 caractères')
    .trim(),
  context: z.string()
    .min(20, 'Le contexte doit contenir au moins 20 caractères')
    .max(2000, 'Le contexte ne doit pas dépasser 2000 caractères')
    .trim(),
  domain: ThresholdDomainSchema,
  detection_source: DetectionSourceSchema,
  threshold_nature: ThresholdNatureSchema,
  irreversibility_reason: z.string()
    .min(10, 'La raison d\'irréversibilité doit contenir au moins 10 caractères')
    .max(1000, 'La raison ne doit pas dépasser 1000 caractères')
    .trim(),
  alternatives_before: z.array(z.string().trim()).default([]),
  validated_by: z.string()
    .min(2, 'Le nom du validateur doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne doit pas dépasser 100 caractères')
    .trim(),
  validator_role: ValidatorRoleSchema,
  organization_name: z.string()
    .max(100, 'Le nom de l\'organisation ne doit pas dépasser 100 caractères')
    .trim()
    .optional(),
});

// Add witness schema
export const AddWitnessSchema = z.object({
  witness_name: z.string()
    .min(2, 'Le nom du témoin doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne doit pas dépasser 100 caractères')
    .trim(),
  witness_role: WitnessRoleSchema,
  witness_statement: z.string()
    .max(500, 'La déclaration ne doit pas dépasser 500 caractères')
    .trim()
    .optional(),
});

// Validation statement schema
export const ValidationStatementSchema = z.object({
  actor_name: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne doit pas dépasser 100 caractères')
    .trim(),
  actor_role: ValidatorRoleSchema,
  validation_statement: z.string()
    .min(10, 'La déclaration doit contenir au moins 10 caractères')
    .max(1000, 'La déclaration ne doit pas dépasser 1000 caractères')
    .trim()
    .optional(),
});

// Seal confirmation schema
export const SealConfirmationSchema = z.object({
  actor_name: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne doit pas dépasser 100 caractères')
    .trim(),
  actor_role: ValidatorRoleSchema,
  confirmation_text: z.literal('SCELLER'),
  checklist_completed: z.literal(true),
});

// Type exports
export type CreateThresholdInput = z.infer<typeof CreateThresholdSchema>;
export type AddWitnessInput = z.infer<typeof AddWitnessSchema>;
export type ValidationStatementInput = z.infer<typeof ValidationStatementSchema>;
export type SealConfirmationInput = z.infer<typeof SealConfirmationSchema>;

// Validation helpers
export function validateCreateThreshold(data: unknown): { 
  success: boolean; 
  data?: CreateThresholdInput; 
  errors?: string[] 
} {
  const result = CreateThresholdSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { 
    success: false, 
    errors: result.error.errors.map(e => e.message) 
  };
}

export function validateAddWitness(data: unknown): { 
  success: boolean; 
  data?: AddWitnessInput; 
  errors?: string[] 
} {
  const result = AddWitnessSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { 
    success: false, 
    errors: result.error.errors.map(e => e.message) 
  };
}

// Status transition validation
export function isValidStatusTransition(
  currentStatus: string, 
  newStatus: string
): boolean {
  const statusOrder = ['detected', 'marked', 'validated', 'sealed'];
  const currentIndex = statusOrder.indexOf(currentStatus);
  const newIndex = statusOrder.indexOf(newStatus);
  
  // Can only move to the next status in sequence
  return newIndex === currentIndex + 1;
}

// Check if threshold can be deleted (only non-sealed)
export function canDeleteThreshold(status: string): boolean {
  return status !== 'sealed';
}

// Check if threshold is overdue for action
export function isThresholdOverdue(
  detectionDate: string, 
  status: string, 
  thresholdDays: number = 14
): boolean {
  if (status === 'sealed') return false;
  
  const daysSinceDetection = Math.floor(
    (Date.now() - new Date(detectionDate).getTime()) / (1000 * 60 * 60 * 24)
  );
  
  return daysSinceDetection > thresholdDays;
}

// Duplicate detection helper
export function checkDuplicateTitle(
  newTitle: string, 
  existingTitles: string[]
): boolean {
  const normalizedNew = newTitle.toLowerCase().trim();
  return existingTitles.some(
    title => title.toLowerCase().trim() === normalizedNew
  );
}
