/**
 * Validation Schemas - Zod schemas for form validation
 * 
 * Central location for all validation schemas used across the app.
 * Ensures consistent validation rules and error messages.
 */

import { z } from 'zod';

// ============ Common Patterns ============

export const emailSchema = z
  .string()
  .trim()
  .email({ message: 'Adresse email invalide' })
  .max(255, { message: 'Email trop long (max 255 caractères)' });

export const passwordSchema = z
  .string()
  .min(8, { message: 'Mot de passe trop court (min 8 caractères)' })
  .max(128, { message: 'Mot de passe trop long (max 128 caractères)' })
  .regex(/[A-Z]/, { message: 'Doit contenir au moins une majuscule' })
  .regex(/[a-z]/, { message: 'Doit contenir au moins une minuscule' })
  .regex(/[0-9]/, { message: 'Doit contenir au moins un chiffre' });

export const nameSchema = z
  .string()
  .trim()
  .min(1, { message: 'Ce champ est requis' })
  .max(100, { message: 'Nom trop long (max 100 caractères)' });

export const urlSchema = z
  .string()
  .trim()
  .url({ message: 'URL invalide' })
  .or(z.literal(''))
  .optional();

export const textAreaSchema = z
  .string()
  .trim()
  .max(2000, { message: 'Texte trop long (max 2000 caractères)' });

// ============ Auth Schemas ============

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: 'Mot de passe requis' }),
});

export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  displayName: nameSchema.optional(),
});

export const resetPasswordSchema = z.object({
  email: emailSchema,
});

// ============ Profile Schemas ============

export const profileSchema = z.object({
  display_name: nameSchema.optional(),
  birth_country: z.string().optional(),
  current_country: z.string().optional(),
  nationality: z.string().optional(),
  secondary_nationality: z.string().optional(),
  profession: z.string().optional(),
  education_level: z.enum(['high_school', 'bachelor', 'master', 'doctorate', 'other']).optional(),
  age: z.number().min(16).max(120).optional(),
  risk_tolerance: z.enum(['low', 'medium', 'high']).optional(),
});

// ============ Case/Dossier Schemas ============

export const caseSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, { message: 'Titre trop court (min 3 caractères)' })
    .max(200, { message: 'Titre trop long (max 200 caractères)' }),
  description: textAreaSchema.optional(),
  intention: z.enum(['relocation', 'business', 'investment', 'retirement', 'study', 'other']),
  target_country: z.string().min(2, { message: 'Pays cible requis' }),
  budget_range: z.string().optional(),
  timeline_months: z.number().min(1).max(120).optional(),
});

// ============ TraceOS Schemas ============

export const decisionSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, { message: 'Titre trop court (min 3 caractères)' })
    .max(300, { message: 'Titre trop long (max 300 caractères)' }),
  context: textAreaSchema,
  decision_type: z.enum(['strategic', 'operational', 'tactical', 'emergency']),
  stakeholders: z.array(z.string()).optional(),
  alternatives_considered: z.array(z.string()).optional(),
  expected_outcome: textAreaSchema.optional(),
  actual_outcome: textAreaSchema.optional(),
});

// ============ Latent Zone Schemas ============

export const latentZoneSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, { message: 'Titre trop court (min 2 caractères)' })
    .max(150, { message: 'Titre trop long (max 150 caractères)' }),
  description: textAreaSchema.optional(),
  status: z.enum(['dormant', 'emergent', 'fragile', 'blocked']).default('dormant'),
});

export const tensionSchema = z.object({
  content: z
    .string()
    .trim()
    .min(5, { message: 'Description trop courte (min 5 caractères)' })
    .max(500, { message: 'Description trop longue (max 500 caractères)' }),
  tension_type: z.enum(['relational', 'financial', 'professional', 'health', 'identity', 'other']),
});

// ============ Irreversa Schemas ============

export const thresholdSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, { message: 'Titre trop court (min 5 caractères)' })
    .max(200, { message: 'Titre trop long (max 200 caractères)' }),
  domain: z.enum(['financial', 'relational', 'health', 'legal', 'professional', 'other']),
  threshold_nature: z.enum(['point_of_no_return', 'commitment', 'legal_deadline', 'natural_evolution']),
  context: textAreaSchema.min(10, { message: 'Contexte trop court (min 10 caractères)' }),
  irreversibility_reason: textAreaSchema.min(10, { message: 'Raison trop courte (min 10 caractères)' }),
  detection_source: z.string().min(2, { message: 'Source requise' }),
  validated_by: nameSchema,
  validator_role: z.string().min(2, { message: 'Rôle requis' }),
});

// ============ Partner Application Schema ============

export const partnerApplicationSchema = z.object({
  partner_type: z.enum(['ambassador', 'b2b_partner']),
  motivation: z
    .string()
    .trim()
    .min(50, { message: 'Motivation trop courte (min 50 caractères)' })
    .max(1500, { message: 'Motivation trop longue (max 1500 caractères)' }),
  professional_profile: textAreaSchema.optional(),
  platform_experience: textAreaSchema.optional(),
  company_name: z.string().max(200).optional(),
  ethics_charter_accepted: z.literal(true, {
    errorMap: () => ({ message: 'Vous devez accepter la charte éthique' }),
  }),
});

// ============ Contact/Feedback Schema ============

export const contactSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  subject: z
    .string()
    .trim()
    .min(5, { message: 'Sujet trop court (min 5 caractères)' })
    .max(200, { message: 'Sujet trop long (max 200 caractères)' }),
  message: z
    .string()
    .trim()
    .min(20, { message: 'Message trop court (min 20 caractères)' })
    .max(5000, { message: 'Message trop long (max 5000 caractères)' }),
});

// ============ Utility Functions ============

/**
 * Safely validate data against a schema
 * Returns { success: true, data } or { success: false, errors }
 */
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors: Record<string, string> = {};
  result.error.errors.forEach((err) => {
    const path = err.path.join('.');
    if (!errors[path]) {
      errors[path] = err.message;
    }
  });
  
  return { success: false, errors };
}

/**
 * Get first error message for a field
 */
export function getFieldError(
  errors: Record<string, string> | undefined,
  field: string
): string | undefined {
  return errors?.[field];
}

// ============ Sanitization Functions ============

/**
 * Sanitize HTML to prevent XSS attacks
 */
export function sanitizeHtml(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Build safe URL with properly encoded parameters
 */
export function buildSafeUrl(baseUrl: string, params: Record<string, string>): string {
  const url = new URL(baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, encodeURIComponent(value));
  });
  return url.toString();
}

// ============ Webhook URL Schemas ============

export const webhookUrlSchema = z
  .string()
  .trim()
  .url({ message: 'URL invalide' })
  .refine((url) => url.startsWith('https://'), {
    message: 'L\'URL doit utiliser HTTPS',
  })
  .refine((url) => !url.includes('localhost') && !url.includes('127.0.0.1'), {
    message: 'Les URLs localhost ne sont pas autorisées en production',
  });

export const slackWebhookSchema = z
  .string()
  .trim()
  .url({ message: 'URL invalide' })
  .refine((url) => url.startsWith('https://hooks.slack.com/'), {
    message: 'L\'URL doit être un webhook Slack valide (https://hooks.slack.com/...)',
  });
