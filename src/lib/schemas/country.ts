import { z } from 'zod';
import { PyramidType } from '../types';

// Enum pour les types de pyramides
const PyramidTypeEnum = z.enum([
  'PROBLEM_RENT',
  'STABILITY_REDIS', 
  'COMPETENCE_TRUST',
  'GROWTH_RISK',
  'HYBRID_TRANSITION',
  'RESOURCE_EXTRACTION'
]);

// Schéma pour les risques d'un pays
export const CountryRisksSchema = z.object({
  political: z.number().min(0).max(100),
  economic: z.number().min(0).max(100),
  social: z.number().min(0).max(100),
  environmental: z.number().min(0).max(100).optional(),
  health: z.number().min(0).max(100).optional(),
});

// Schéma pour la pyramide d'un pays
export const CountryPyramidSchema = z.object({
  type: PyramidTypeEnum,
  rigidity: z.number().min(0).max(100).optional(),
  mobility: z.number().min(0).max(100).optional(),
  transparency: z.number().min(0).max(100).optional(),
});

// Schéma pour les informations visa
export const CountryVisaInfoSchema = z.object({
  freeAccess: z.array(z.string()).optional(),
  workVisaDifficulty: z.enum(['easy', 'moderate', 'hard', 'very_hard']).optional(),
  pathToCitizenship: z.number().min(0).max(20).optional(),
  languageRequirement: z.enum(['none', 'basic', 'intermediate', 'advanced', 'native']).optional(),
});

// Schéma pour le coût de la vie
export const CountryCostOfLivingSchema = z.object({
  index: z.number().min(0).max(200).optional(),
  rent: z.number().min(0).optional(),
  groceries: z.number().min(0).optional(),
  utilities: z.number().min(0).optional(),
  transportation: z.number().min(0).optional(),
});

// Schéma pour la qualité de vie
export const CountryQualityOfLifeSchema = z.object({
  overall: z.number().min(0).max(100),
  healthcare: z.number().min(0).max(100).optional(),
  education: z.number().min(0).max(100).optional(),
  safety: z.number().min(0).max(100).optional(),
  environment: z.number().min(0).max(100).optional(),
});

// Schéma pour les droits LGBTQ+
export const LGBTQRightsSchema = z.object({
  score: z.number().min(0).max(100),
  marriage: z.boolean().optional(),
  civilUnion: z.boolean().optional(),
  adoption: z.boolean().optional(),
  discrimination: z.boolean().optional(),
  notes: z.string().optional(),
});

// Schéma principal pour un pays
export const CountrySchema = z.object({
  id: z.string(),
  name: z.string(),
  iso2: z.string().length(2),
  region: z.string().optional(),
  
  // Type de pyramide
  pyramidType: PyramidTypeEnum,
  
  // Données optionnelles
  risks: CountryRisksSchema.optional(),
  pyramid: CountryPyramidSchema.optional(),
  visa: CountryVisaInfoSchema.optional(),
  costOfLiving: CountryCostOfLivingSchema.optional(),
  qualityOfLife: CountryQualityOfLifeSchema.optional(),
  lgbtqRights: LGBTQRightsSchema.optional(),
  
  // Metadata
  lastUpdated: z.string().datetime().optional(),
  dataVersion: z.string().optional(),
});

export type ValidatedCountry = z.infer<typeof CountrySchema>;

// Validation helpers
export function validateCountry(data: unknown): ValidatedCountry {
  return CountrySchema.parse(data);
}

export function validateCountries(data: unknown[]): ValidatedCountry[] {
  return z.array(CountrySchema).parse(data);
}

// Safe validation (returns result instead of throwing)
export function safeValidateCountry(data: unknown) {
  return CountrySchema.safeParse(data);
}

export function safeValidateCountries(data: unknown[]) {
  return z.array(CountrySchema).safeParse(data);
}

// Validation avec rapport d'erreurs détaillé
export function validateCountryWithReport(data: unknown): {
  success: boolean;
  data?: ValidatedCountry;
  errors?: string[];
} {
  const result = CountrySchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors = result.error.errors.map(err => 
    `${err.path.join('.')}: ${err.message}`
  );
  return { success: false, errors };
}
