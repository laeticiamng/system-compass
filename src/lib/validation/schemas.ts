/**
 * Centralized Zod Validation Schemas
 * Used across forms and API calls for type-safe validation
 */

import { z } from 'zod';

// =============================================================================
// Common Validators
// =============================================================================

export const uuidSchema = z.string().uuid('ID invalide');

export const emailSchema = z
  .string()
  .trim()
  .email('Email invalide')
  .max(255, 'Email trop long');

export const passwordSchema = z
  .string()
  .min(8, 'Minimum 8 caractères')
  .max(72, 'Maximum 72 caractères')
  .regex(/[A-Z]/, 'Au moins une majuscule requise')
  .regex(/[a-z]/, 'Au moins une minuscule requise')
  .regex(/[0-9]/, 'Au moins un chiffre requis');

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9\s\-()]{8,20}$/, 'Numéro de téléphone invalide')
  .optional();

export const urlSchema = z
  .string()
  .trim()
  .url('URL invalide')
  .max(2048, 'URL trop longue')
  .optional();

export const countryCodeSchema = z
  .string()
  .length(2, 'Code pays invalide (2 lettres)')
  .toUpperCase();

// =============================================================================
// Auth Schemas
// =============================================================================

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Mot de passe requis'),
  rememberMe: z.boolean().optional().default(false),
});

export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  displayName: z
    .string()
    .trim()
    .min(2, 'Minimum 2 caractères')
    .max(50, 'Maximum 50 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s\-']+$/, 'Caractères non autorisés'),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'Vous devez accepter les CGU' }),
  }),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

// =============================================================================
// Profile Schemas
// =============================================================================

export const profileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, 'Minimum 2 caractères')
    .max(50, 'Maximum 50 caractères')
    .optional(),
  bio: z
    .string()
    .trim()
    .max(500, 'Maximum 500 caractères')
    .optional(),
  location: z
    .string()
    .trim()
    .max(100, 'Maximum 100 caractères')
    .optional(),
  website: urlSchema,
  phone: phoneSchema,
  currentCountry: countryCodeSchema.optional(),
  targetCountries: z.array(countryCodeSchema).max(5, 'Maximum 5 pays').optional(),
});

// =============================================================================
// Profile Test Schemas
// =============================================================================

export const profileTestAnswerSchema = z.object({
  questionId: z.string(),
  answer: z.union([
    z.string(),
    z.number(),
    z.array(z.string()),
  ]),
});

export const profileTestResultsSchema = z.object({
  answers: z.array(profileTestAnswerSchema),
  completedAt: z.string().datetime(),
  version: z.string().optional(),
});

// =============================================================================
// Contact/Feedback Schemas
// =============================================================================

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Minimum 2 caractères')
    .max(100, 'Maximum 100 caractères'),
  email: emailSchema,
  subject: z
    .string()
    .trim()
    .min(5, 'Minimum 5 caractères')
    .max(200, 'Maximum 200 caractères'),
  message: z
    .string()
    .trim()
    .min(20, 'Minimum 20 caractères')
    .max(2000, 'Maximum 2000 caractères'),
  category: z.enum(['general', 'support', 'partnership', 'press', 'other']).optional(),
});

export const feedbackSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z
    .string()
    .trim()
    .max(1000, 'Maximum 1000 caractères')
    .optional(),
  pageUrl: z.string().optional(),
  features: z.array(z.string()).optional(),
});

// =============================================================================
// Newsletter Schemas
// =============================================================================

export const newsletterSchema = z.object({
  email: emailSchema,
  topics: z.array(z.string()).optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly']).optional().default('weekly'),
});

// =============================================================================
// Event Registration Schemas
// =============================================================================

export const eventRegistrationSchema = z.object({
  eventId: z.string().min(1, 'Event ID requis'),
  eventTitle: z.string().min(1, 'Titre requis'),
  eventDate: z.string().datetime(),
  eventType: z.enum(['webinar', 'meetup', 'workshop', 'ama']),
  guestName: z
    .string()
    .trim()
    .min(2, 'Minimum 2 caractères')
    .max(100, 'Maximum 100 caractères')
    .optional(),
  guestEmail: emailSchema.optional(),
  notes: z
    .string()
    .trim()
    .max(500, 'Maximum 500 caractères')
    .optional(),
});

// =============================================================================
// Expert Review Schemas
// =============================================================================

export const expertReviewSchema = z.object({
  expertId: uuidSchema,
  title: z
    .string()
    .trim()
    .min(5, 'Minimum 5 caractères')
    .max(200, 'Maximum 200 caractères'),
  content: z
    .string()
    .trim()
    .min(50, 'Minimum 50 caractères')
    .max(2000, 'Maximum 2000 caractères'),
  rating: z.number().int().min(1).max(5),
  tags: z.array(z.string().max(30)).max(5).optional(),
});

// =============================================================================
// B2B/Case Schemas
// =============================================================================

export const caseCreationSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, 'Minimum 5 caractères')
    .max(200, 'Maximum 200 caractères'),
  description: z
    .string()
    .trim()
    .max(2000, 'Maximum 2000 caractères')
    .optional(),
  countryId: countryCodeSchema,
  sector: z.string().max(100).optional(),
  projectType: z.enum(['relocation', 'investment', 'business', 'retirement', 'study', 'other']),
  budget: z
    .object({
      min: z.number().nonnegative().optional(),
      max: z.number().nonnegative().optional(),
      currency: z.string().length(3).toUpperCase().optional(),
    })
    .optional(),
  timeline: z
    .object({
      start: z.string().datetime().optional(),
      end: z.string().datetime().optional(),
    })
    .optional(),
});

// =============================================================================
// Latent Zone Schemas
// =============================================================================

export const latentZoneSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, 'Minimum 5 caractères')
    .max(200, 'Maximum 200 caractères'),
  domain: z.enum(['fiscal', 'legal', 'admin', 'cultural', 'economic', 'personal']),
  description: z
    .string()
    .trim()
    .min(20, 'Minimum 20 caractères')
    .max(2000, 'Maximum 2000 caractères'),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional().default('medium'),
  targetDate: z.string().datetime().optional(),
});

export const tensionSchema = z.object({
  zoneId: uuidSchema,
  tensionType: z.enum(['financial', 'regulatory', 'relational', 'operational']),
  content: z
    .string()
    .trim()
    .min(10, 'Minimum 10 caractères')
    .max(1000, 'Maximum 1000 caractères'),
});

// =============================================================================
// Irreversa Schemas
// =============================================================================

export const irreversaThresholdSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, 'Minimum 5 caractères')
    .max(200, 'Maximum 200 caractères'),
  domain: z.enum(['fiscal', 'legal', 'admin', 'cultural', 'economic', 'personal']),
  thresholdNature: z.string().min(5).max(500),
  irreversibilityReason: z.string().min(20).max(2000),
  context: z.string().min(20).max(2000),
  detectionSource: z.string().min(5).max(200),
  validatedBy: z.string().min(2).max(100),
  validatorRole: z.string().min(2).max(100),
  alternativesBefore: z.array(z.string().max(500)).max(10).optional(),
  compassCountryId: countryCodeSchema.optional(),
});

// =============================================================================
// Fiscal Calculator Schemas
// =============================================================================

export const fiscalCalculatorSchema = z.object({
  grossIncome: z.number().positive('Revenu doit être positif'),
  currency: z.string().length(3).toUpperCase().default('EUR'),
  countryFrom: countryCodeSchema,
  countryTo: countryCodeSchema,
  incomeType: z.enum(['salary', 'freelance', 'capital_gains', 'dividends', 'rental', 'pension']),
  familyStatus: z.enum(['single', 'married', 'married_2_incomes', 'single_parent']).optional(),
  dependents: z.number().int().nonnegative().max(10).optional(),
  includeHealthcare: z.boolean().optional().default(true),
  includePension: z.boolean().optional().default(true),
});

// =============================================================================
// Notification Settings Schemas
// =============================================================================

export const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean().default(true),
  pushNotifications: z.boolean().default(false),
  countryAlerts: z.boolean().default(true),
  weeklyDigest: z.boolean().default(true),
  marketingEmails: z.boolean().default(false),
  alertThreshold: z.enum(['all', 'important', 'critical']).default('important'),
  quietHoursStart: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  quietHoursEnd: z.string().regex(/^\d{2}:\d{2}$/).optional(),
});

// =============================================================================
// Type Exports
// =============================================================================

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type NewsletterInput = z.infer<typeof newsletterSchema>;
export type EventRegistrationInput = z.infer<typeof eventRegistrationSchema>;
export type ExpertReviewInput = z.infer<typeof expertReviewSchema>;
export type CaseCreationInput = z.infer<typeof caseCreationSchema>;
export type LatentZoneInput = z.infer<typeof latentZoneSchema>;
export type TensionInput = z.infer<typeof tensionSchema>;
export type IrreversaThresholdInput = z.infer<typeof irreversaThresholdSchema>;
export type FiscalCalculatorInput = z.infer<typeof fiscalCalculatorSchema>;
export type NotificationSettingsInput = z.infer<typeof notificationSettingsSchema>;
