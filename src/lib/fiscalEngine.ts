/**
 * Fiscal Engine - Tax calculation logic
 */

import type { TaxBracket, FiscalRule } from '@/hooks/useFiscalData';

export interface TaxProfile {
  status: 'single' | 'married' | 'pacs';
  children: number;
  incomeType: 'salary' | 'self_employed' | 'mixed' | 'retired';
  grossIncome: number;
  netWealth?: number;
}

export interface TaxBracketResult {
  min: number;
  max: number | null;
  rate: number;
  taxableInBracket: number;
  taxForBracket: number;
}

export interface TaxCalculationResult {
  countryId: string;
  countryName: string;
  currency: string;
  grossIncome: number;
  incomeTax: number;
  incomeTaxBrackets: TaxBracketResult[];
  socialContributions: number;
  wealthTax: number;
  totalTax: number;
  netIncome: number;
  effectiveRate: number;
  marginalRate: number;
  hasSpecialRegimes: boolean;
}

/**
 * Calculate tax for a single bracket
 */
function calculateBracketTax(income: number, bracket: TaxBracket): TaxBracketResult {
  const min = bracket.min;
  const max = bracket.max ?? Infinity;
  
  if (income <= min) {
    return {
      ...bracket,
      taxableInBracket: 0,
      taxForBracket: 0,
    };
  }
  
  const taxableInBracket = Math.min(income, max) - min;
  const taxForBracket = taxableInBracket * bracket.rate;
  
  return {
    ...bracket,
    taxableInBracket,
    taxForBracket,
  };
}

/**
 * Calculate progressive income tax
 */
function calculateProgressiveTax(income: number, brackets: TaxBracket[]): {
  total: number;
  details: TaxBracketResult[];
  marginalRate: number;
} {
  // Sort brackets by min value
  const sortedBrackets = [...brackets].sort((a, b) => a.min - b.min);
  
  let total = 0;
  let marginalRate = 0;
  const details: TaxBracketResult[] = [];
  
  for (const bracket of sortedBrackets) {
    const result = calculateBracketTax(income, bracket);
    total += result.taxForBracket;
    details.push(result);
    
    // Track marginal rate (highest bracket with income)
    if (result.taxableInBracket > 0) {
      marginalRate = bracket.rate;
    }
  }
  
  return { total, details, marginalRate };
}

/**
 * Get quotient familial for France-style systems
 */
function getQuotientFamilial(profile: TaxProfile): number {
  let parts = 1;
  
  if (profile.status === 'married' || profile.status === 'pacs') {
    parts = 2;
  }
  
  // Children add parts (0.5 for first two, 1 for third+)
  if (profile.children >= 1) parts += 0.5;
  if (profile.children >= 2) parts += 0.5;
  if (profile.children >= 3) parts += profile.children - 2;
  
  return parts;
}

/**
 * Calculate taxes for a country
 */
export function calculateCountryTax(
  profile: TaxProfile,
  rules: FiscalRule[],
  countryId: string,
  countryName: string
): TaxCalculationResult {
  const currency = rules[0]?.currency || 'EUR';
  
  // Find income tax rule
  const incomeTaxRule = rules.find(r => r.rule_type === 'income_tax');
  const socialRule = rules.find(r => r.rule_type === 'social_contributions');
  const wealthRule = rules.find(r => r.rule_type === 'wealth_tax');
  
  // Apply quotient familial for France-style calculation
  const quotient = countryId === 'france' ? getQuotientFamilial(profile) : 1;
  const taxableIncomePerPart = profile.grossIncome / quotient;
  
  // Calculate income tax
  let incomeTax = 0;
  let incomeTaxBrackets: TaxBracketResult[] = [];
  let marginalRate = 0;
  
  if (incomeTaxRule && incomeTaxRule.brackets.length > 0) {
    const result = calculateProgressiveTax(taxableIncomePerPart, incomeTaxRule.brackets);
    // Multiply back by quotient for France
    incomeTax = result.total * quotient;
    incomeTaxBrackets = result.details;
    marginalRate = result.marginalRate;
  }
  
  // Calculate social contributions
  let socialContributions = 0;
  if (socialRule && socialRule.brackets.length > 0) {
    // Usually flat rate
    const rate = socialRule.brackets[0]?.rate || 0;
    socialContributions = profile.grossIncome * rate;
  }
  
  // Calculate wealth tax
  let wealthTax = 0;
  if (wealthRule && profile.netWealth && wealthRule.brackets.length > 0) {
    const result = calculateProgressiveTax(profile.netWealth, wealthRule.brackets);
    wealthTax = result.total;
  }
  
  const totalTax = incomeTax + socialContributions + wealthTax;
  const netIncome = profile.grossIncome - totalTax;
  const effectiveRate = profile.grossIncome > 0 ? (totalTax / profile.grossIncome) * 100 : 0;
  
  return {
    countryId,
    countryName,
    currency,
    grossIncome: profile.grossIncome,
    incomeTax,
    incomeTaxBrackets,
    socialContributions,
    wealthTax,
    totalTax,
    netIncome,
    effectiveRate,
    marginalRate: marginalRate * 100,
    hasSpecialRegimes: false, // Will be updated by caller
  };
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format percentage
 */
export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Default tax rules for countries without data
 */
export const DEFAULT_TAX_RULES: Record<string, { incomeTax: TaxBracket[], socialRate: number }> = {
  france: {
    incomeTax: [
      { min: 0, max: 11294, rate: 0 },
      { min: 11295, max: 28797, rate: 0.11 },
      { min: 28798, max: 82341, rate: 0.30 },
      { min: 82342, max: 177106, rate: 0.41 },
      { min: 177107, max: null, rate: 0.45 },
    ],
    socialRate: 0.22,
  },
  portugal: {
    incomeTax: [
      { min: 0, max: 7703, rate: 0.1325 },
      { min: 7704, max: 11623, rate: 0.18 },
      { min: 11624, max: 16472, rate: 0.23 },
      { min: 16473, max: 21321, rate: 0.26 },
      { min: 21322, max: 27146, rate: 0.3275 },
      { min: 27147, max: 39791, rate: 0.37 },
      { min: 39792, max: 51997, rate: 0.435 },
      { min: 51998, max: 81199, rate: 0.45 },
      { min: 81200, max: null, rate: 0.48 },
    ],
    socialRate: 0.11,
  },
  spain: {
    incomeTax: [
      { min: 0, max: 12450, rate: 0.19 },
      { min: 12451, max: 20200, rate: 0.24 },
      { min: 20201, max: 35200, rate: 0.30 },
      { min: 35201, max: 60000, rate: 0.37 },
      { min: 60001, max: 300000, rate: 0.45 },
      { min: 300001, max: null, rate: 0.47 },
    ],
    socialRate: 0.065,
  },
  switzerland: {
    incomeTax: [
      { min: 0, max: 14500, rate: 0 },
      { min: 14501, max: 31600, rate: 0.0077 },
      { min: 31601, max: 41400, rate: 0.0088 },
      { min: 41401, max: 55200, rate: 0.0264 },
      { min: 55201, max: 72500, rate: 0.0297 },
      { min: 72501, max: 78100, rate: 0.055 },
      { min: 78101, max: 103600, rate: 0.066 },
      { min: 103601, max: 134600, rate: 0.088 },
      { min: 134601, max: 176000, rate: 0.099 },
      { min: 176001, max: 755200, rate: 0.11 },
      { min: 755201, max: null, rate: 0.115 },
    ],
    socialRate: 0.063,
  },
  germany: {
    incomeTax: [
      { min: 0, max: 11604, rate: 0 },
      { min: 11605, max: 17005, rate: 0.14 },
      { min: 17006, max: 66760, rate: 0.2397 },
      { min: 66761, max: 277825, rate: 0.42 },
      { min: 277826, max: null, rate: 0.45 },
    ],
    socialRate: 0.205,
  },
  usa: {
    incomeTax: [
      { min: 0, max: 11600, rate: 0.10 },
      { min: 11601, max: 47150, rate: 0.12 },
      { min: 47151, max: 100525, rate: 0.22 },
      { min: 100526, max: 191950, rate: 0.24 },
      { min: 191951, max: 243725, rate: 0.32 },
      { min: 243726, max: 609350, rate: 0.35 },
      { min: 609351, max: null, rate: 0.37 },
    ],
    socialRate: 0.0765,
  },
  canada: {
    incomeTax: [
      { min: 0, max: 15705, rate: 0 },
      { min: 15706, max: 55867, rate: 0.15 },
      { min: 55868, max: 111733, rate: 0.205 },
      { min: 111734, max: 154906, rate: 0.26 },
      { min: 154907, max: 220000, rate: 0.29 },
      { min: 220001, max: null, rate: 0.33 },
    ],
    socialRate: 0.073,
  },
  uae: {
    incomeTax: [
      { min: 0, max: null, rate: 0 },
    ],
    socialRate: 0.05,
  },
  singapore: {
    incomeTax: [
      { min: 0, max: 20000, rate: 0 },
      { min: 20001, max: 30000, rate: 0.02 },
      { min: 30001, max: 40000, rate: 0.035 },
      { min: 40001, max: 80000, rate: 0.07 },
      { min: 80001, max: 120000, rate: 0.115 },
      { min: 120001, max: 160000, rate: 0.15 },
      { min: 160001, max: 200000, rate: 0.18 },
      { min: 200001, max: 240000, rate: 0.19 },
      { min: 240001, max: 280000, rate: 0.195 },
      { min: 280001, max: 320000, rate: 0.20 },
      { min: 320001, max: null, rate: 0.22 },
    ],
    socialRate: 0.20,
  },
  japan: {
    incomeTax: [
      { min: 0, max: 1950000, rate: 0.05 },
      { min: 1950001, max: 3300000, rate: 0.10 },
      { min: 3300001, max: 6950000, rate: 0.20 },
      { min: 6950001, max: 9000000, rate: 0.23 },
      { min: 9000001, max: 18000000, rate: 0.33 },
      { min: 18000001, max: 40000000, rate: 0.40 },
      { min: 40000001, max: null, rate: 0.45 },
    ],
    socialRate: 0.15,
  },
  australia: {
    incomeTax: [
      { min: 0, max: 18200, rate: 0 },
      { min: 18201, max: 45000, rate: 0.19 },
      { min: 45001, max: 120000, rate: 0.325 },
      { min: 120001, max: 180000, rate: 0.37 },
      { min: 180001, max: null, rate: 0.45 },
    ],
    socialRate: 0.02,
  },
  morocco: {
    incomeTax: [
      { min: 0, max: 30000, rate: 0 },
      { min: 30001, max: 50000, rate: 0.10 },
      { min: 50001, max: 60000, rate: 0.20 },
      { min: 60001, max: 80000, rate: 0.30 },
      { min: 80001, max: 180000, rate: 0.34 },
      { min: 180001, max: null, rate: 0.38 },
    ],
    socialRate: 0.065,
  },
  brazil: {
    incomeTax: [
      { min: 0, max: 24511, rate: 0 },
      { min: 24512, max: 33919, rate: 0.075 },
      { min: 33920, max: 45012, rate: 0.15 },
      { min: 45013, max: 55976, rate: 0.225 },
      { min: 55977, max: null, rate: 0.275 },
    ],
    socialRate: 0.11,
  },
  netherlands: {
    incomeTax: [
      { min: 0, max: 75518, rate: 0.3693 },
      { min: 75519, max: null, rate: 0.4950 },
    ],
    socialRate: 0.2765,
  },
  ireland: {
    incomeTax: [
      { min: 0, max: 42000, rate: 0.20 },
      { min: 42001, max: null, rate: 0.40 },
    ],
    socialRate: 0.04,
  },
  qatar: {
    incomeTax: [
      { min: 0, max: null, rate: 0 },
    ],
    socialRate: 0,
  },
  norway: {
    incomeTax: [
      { min: 0, max: 198350, rate: 0 },
      { min: 198351, max: 279150, rate: 0.017 },
      { min: 279151, max: 642950, rate: 0.04 },
      { min: 642951, max: 926800, rate: 0.136 },
      { min: 926801, max: 1500000, rate: 0.166 },
      { min: 1500001, max: null, rate: 0.176 },
    ],
    socialRate: 0.082,
  },
  turkey: {
    incomeTax: [
      { min: 0, max: 110000, rate: 0.15 },
      { min: 110001, max: 230000, rate: 0.20 },
      { min: 230001, max: 870000, rate: 0.27 },
      { min: 870001, max: 3000000, rate: 0.35 },
      { min: 3000001, max: null, rate: 0.40 },
    ],
    socialRate: 0.15,
  },
  india: {
    incomeTax: [
      { min: 0, max: 300000, rate: 0 },
      { min: 300001, max: 700000, rate: 0.05 },
      { min: 700001, max: 1000000, rate: 0.10 },
      { min: 1000001, max: 1200000, rate: 0.15 },
      { min: 1200001, max: 1500000, rate: 0.20 },
      { min: 1500001, max: null, rate: 0.30 },
    ],
    socialRate: 0.12,
  },
  poland: {
    incomeTax: [
      { min: 0, max: 30000, rate: 0 },
      { min: 30001, max: 120000, rate: 0.12 },
      { min: 120001, max: null, rate: 0.32 },
    ],
    socialRate: 0.139,
  },
  greece: {
    incomeTax: [
      { min: 0, max: 10000, rate: 0.09 },
      { min: 10001, max: 20000, rate: 0.22 },
      { min: 20001, max: 30000, rate: 0.28 },
      { min: 30001, max: 40000, rate: 0.36 },
      { min: 40001, max: null, rate: 0.44 },
    ],
    socialRate: 0.141,
  },
};
