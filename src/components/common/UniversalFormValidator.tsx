/**
 * UniversalFormValidator - Centralized form validation with security
 * Addresses: "Input validation + XSS" from audit requirements
 */

import { z } from 'zod';

// ============================================
// COMMON VALIDATION SCHEMAS
// ============================================

// Email validation with strict pattern
export const emailSchema = z
  .string()
  .min(1, 'L\'email est requis')
  .max(255, 'Email trop long')
  .email('Format d\'email invalide')
  .trim()
  .toLowerCase();

// Password validation with strength requirements
export const passwordSchema = z
  .string()
  .min(8, 'Minimum 8 caractères')
  .max(128, 'Maximum 128 caractères')
  .regex(/[a-z]/, 'Au moins une minuscule')
  .regex(/[A-Z]/, 'Au moins une majuscule')
  .regex(/[0-9]/, 'Au moins un chiffre');

// Display name validation (XSS safe)
export const displayNameSchema = z
  .string()
  .min(2, 'Minimum 2 caractères')
  .max(50, 'Maximum 50 caractères')
  .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Caractères non autorisés')
  .trim();

// Phone number validation
export const phoneSchema = z
  .string()
  .regex(/^\+?[0-9\s\-().]{6,20}$/, 'Format de téléphone invalide')
  .optional();

// URL validation
export const urlSchema = z
  .string()
  .url('URL invalide')
  .max(2048, 'URL trop longue')
  .refine(
    (url) => url.startsWith('https://') || url.startsWith('http://'),
    'L\'URL doit commencer par http:// ou https://'
  )
  .optional();

// UUID validation
export const uuidSchema = z
  .string()
  .uuid('Format UUID invalide');

// Numeric ID validation
export const numericIdSchema = z
  .number()
  .int('Doit être un entier')
  .positive('Doit être positif')
  .max(Number.MAX_SAFE_INTEGER, 'Valeur trop grande');

// Safe text input (prevents XSS)
export const safeTextSchema = z
  .string()
  .max(1000, 'Texte trop long')
  .trim()
  .transform(sanitizeHtml);

// Rich text (longer, with more sanitization)
export const richTextSchema = z
  .string()
  .max(10000, 'Texte trop long')
  .trim()
  .transform(sanitizeHtml);

// Date string validation
export const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)')
  .refine((date) => !isNaN(Date.parse(date)), 'Date invalide');

// Country ISO2 code
export const countryCodeSchema = z
  .string()
  .length(2, 'Code pays doit être 2 caractères')
  .toUpperCase()
  .regex(/^[A-Z]{2}$/, 'Code pays invalide');

// Money/currency validation
export const moneySchema = z
  .number()
  .min(0, 'Montant ne peut pas être négatif')
  .max(999999999, 'Montant trop élevé')
  .transform((val) => Math.round(val * 100) / 100); // Round to 2 decimals

// ============================================
// SANITIZATION FUNCTIONS
// ============================================

/**
 * Sanitize HTML to prevent XSS attacks
 */
export function sanitizeHtml(input: string): string {
  if (!input) return '';
  
  // Remove script tags and their content
  let clean = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers
  clean = clean.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  clean = clean.replace(/\s*on\w+\s*=\s*[^\s>]+/gi, '');
  
  // Remove javascript: and data: URLs
  clean = clean.replace(/javascript:/gi, '');
  clean = clean.replace(/data:text\/html/gi, '');
  
  // Remove style tags
  clean = clean.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  
  // Remove potentially dangerous tags
  const dangerousTags = ['iframe', 'object', 'embed', 'form', 'input', 'button', 'meta', 'link'];
  dangerousTags.forEach(tag => {
    const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi');
    clean = clean.replace(regex, '');
    clean = clean.replace(new RegExp(`<${tag}[^>]*\\/?>`, 'gi'), '');
  });
  
  return clean.trim();
}

/**
 * Escape HTML entities for safe display
 */
export function escapeHtml(input: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };
  
  return input.replace(/[&<>"'`=/]/g, char => htmlEntities[char] || char);
}

/**
 * Remove all HTML tags for plain text
 */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '').trim();
}

/**
 * Sanitize filename for safe file operations
 */
export function sanitizeFilename(filename: string): string {
  // Remove path traversal attempts
  let safe = filename.replace(/\.\./g, '');
  
  // Remove special characters except alphanumeric, dash, underscore, dot
  safe = safe.replace(/[^a-zA-Z0-9\-_.]/g, '_');
  
  // Limit length
  if (safe.length > 255) {
    const ext = safe.split('.').pop() || '';
    const name = safe.slice(0, 250 - ext.length);
    safe = `${name}.${ext}`;
  }
  
  return safe;
}

// ============================================
// VALIDATION UTILITIES
// ============================================

export type ValidationResult<T> = 
  | { success: true; data: T; errors: null }
  | { success: false; data: null; errors: string[] };

/**
 * Validate data against a Zod schema
 */
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data, errors: null };
  }
  
  const errors = result.error.errors.map(e => 
    e.path.length > 0 ? `${e.path.join('.')}: ${e.message}` : e.message
  );
  
  return { success: false, data: null, errors };
}

/**
 * Create a validated form submission handler
 */
export function createValidatedHandler<T>(
  schema: z.ZodSchema<T>,
  onSuccess: (data: T) => void | Promise<void>,
  onError?: (errors: string[]) => void
) {
  return async (formData: unknown) => {
    const result = validateData(schema, formData);
    
    if (result.success) {
      await onSuccess(result.data);
    } else {
      onError?.(result.errors);
    }
    
    return result;
  };
}

// ============================================
// COMMON FORM SCHEMAS
// ============================================

// Contact form schema
export const contactFormSchema = z.object({
  name: displayNameSchema,
  email: emailSchema,
  subject: z.string().min(3, 'Sujet trop court').max(100, 'Sujet trop long').trim(),
  message: z.string().min(10, 'Message trop court (min 10 caractères)').max(10000, 'Message trop long').trim().transform(sanitizeHtml),
});

// Login form schema
export const loginFormSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Mot de passe requis'),
  rememberMe: z.boolean().optional().default(false),
});

// Signup form schema
export const signupFormSchema = z.object({
  displayName: displayNameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'Vous devez accepter les conditions' }),
  }),
}).refine(
  (data) => data.password === data.confirmPassword,
  { message: 'Les mots de passe ne correspondent pas', path: ['confirmPassword'] }
);

// Profile update schema
export const profileUpdateSchema = z.object({
  displayName: displayNameSchema.optional(),
  bio: z.string().max(500, 'Bio trop longue').trim().transform(sanitizeHtml).optional(),
  website: urlSchema,
  phone: phoneSchema,
});

// Search query schema (prevents injection)
export const searchQuerySchema = z
  .string()
  .max(200, 'Recherche trop longue')
  .transform((q) => q.replace(/[<>'"`;]/g, '').trim());

export type ContactFormData = z.infer<typeof contactFormSchema>;
export type LoginFormData = z.infer<typeof loginFormSchema>;
export type SignupFormData = z.infer<typeof signupFormSchema>;
export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;
