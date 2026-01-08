/**
 * FISCAL DATA - Taxes, Social Charges, Net Salary Calculator
 * 
 * Complete fiscal framework for comparing countries realistically
 * Including: Income tax, social contributions, healthcare costs, pension
 */

export interface TaxBracket {
  min: number;
  max: number | null; // null = unlimited
  rate: number; // Percentage
}

export interface CountryFiscalSystem {
  countryId: string;
  currency: string;
  exchangeToEUR: number; // 1 local currency = X EUR
  
  // Income Tax
  incomeTax: {
    brackets: TaxBracket[];
    personalAllowance: number; // Tax-free amount
    additionalDeductions?: string[];
  };
  
  // Social Contributions (employee side)
  socialContributions: {
    healthInsurance: number; // % of gross
    pension: number; // % of gross
    unemployment: number; // % of gross
    other: number; // % of gross
    total: number; // Total % of gross
    cap?: number; // Maximum salary subject to contributions
  };
  
  // Employer Contributions (for context)
  employerContributions: {
    total: number; // % of gross
    notes?: string;
  };
  
  // Healthcare costs beyond contributions
  healthcareCosts: {
    publicCoverage: 'full' | 'partial' | 'none';
    privateInsuranceNeeded: boolean;
    avgMonthlyPremium: number; // EUR
    outOfPocketEstimate: number; // EUR per year
    qualityNote: string;
  };
  
  // Other mandatory costs
  mandatoryCosts: {
    socialHousing?: number; // % of gross
    transportTax?: number;
    otherTaxes: { name: string; amount: number }[];
  };
  
  // Cost of Living Adjustments
  costOfLivingMultiplier: number; // 1.0 = baseline (France)
  
  // Notes
  notes: string[];
}

export interface NetSalaryResult {
  grossAnnual: number;
  grossMonthly: number;
  
  // Deductions
  incomeTax: number;
  socialContributions: number;
  healthInsurance: number;
  pension: number;
  otherDeductions: number;
  
  // Net
  netAnnual: number;
  netMonthly: number;
  
  // Effective rates
  effectiveTaxRate: number;
  effectiveTotalRate: number; // Tax + social
  
  // Purchasing power adjusted
  purchasingPowerAdjusted: number; // Monthly net adjusted for cost of living
  
  // Healthcare true cost
  totalHealthcareCost: number; // Annual
  
  // Detailed breakdown
  breakdown: {
    label: string;
    amount: number;
    percentage: number;
  }[];
}

// Fiscal systems by country
export const FISCAL_SYSTEMS: Record<string, CountryFiscalSystem> = {
  france: {
    countryId: 'france',
    currency: 'EUR',
    exchangeToEUR: 1,
    incomeTax: {
      brackets: [
        { min: 0, max: 11294, rate: 0 },
        { min: 11294, max: 28797, rate: 11 },
        { min: 28797, max: 82341, rate: 30 },
        { min: 82341, max: 177106, rate: 41 },
        { min: 177106, max: null, rate: 45 },
      ],
      personalAllowance: 11294,
      additionalDeductions: ['10% frais professionnels', 'Parts familiales'],
    },
    socialContributions: {
      healthInsurance: 0.4, // Contribution complémentaire
      pension: 11.31, // Retraite base + complémentaire
      unemployment: 0, // Supprimé pour salariés
      other: 10.59, // CSG/CRDS + autres
      total: 22.3,
    },
    employerContributions: {
      total: 45,
      notes: 'Charges patronales très élevées',
    },
    healthcareCosts: {
      publicCoverage: 'full',
      privateInsuranceNeeded: false,
      avgMonthlyPremium: 50, // Mutuelle complémentaire moyenne
      outOfPocketEstimate: 400,
      qualityNote: 'Excellent système public, mutuelle recommandée pour confort',
    },
    mandatoryCosts: {
      otherTaxes: [
        { name: 'Taxe habitation (si applicable)', amount: 0 },
      ],
    },
    costOfLivingMultiplier: 1.0,
    notes: [
      'Système redistributif avec forte protection sociale',
      'Impôt sur le revenu progressif',
      'CSG/CRDS prélevées sur tous revenus',
      'Mutuelle entreprise obligatoire',
    ],
  },
  
  germany: {
    countryId: 'germany',
    currency: 'EUR',
    exchangeToEUR: 1,
    incomeTax: {
      brackets: [
        { min: 0, max: 11604, rate: 0 },
        { min: 11604, max: 17005, rate: 14 },
        { min: 17005, max: 66760, rate: 24 }, // Progressive zone
        { min: 66760, max: 277826, rate: 42 },
        { min: 277826, max: null, rate: 45 },
      ],
      personalAllowance: 11604,
    },
    socialContributions: {
      healthInsurance: 7.3,
      pension: 9.3,
      unemployment: 1.3,
      other: 2.5, // Pflegeversicherung + autres
      total: 20.4,
      cap: 90600, // Beitragsbemessungsgrenze
    },
    employerContributions: {
      total: 20.4,
      notes: 'Partage 50/50 employeur/employé',
    },
    healthcareCosts: {
      publicCoverage: 'full',
      privateInsuranceNeeded: false,
      avgMonthlyPremium: 0, // Inclus dans contributions
      outOfPocketEstimate: 300,
      qualityNote: 'Excellent système, choix public/privé selon revenu',
    },
    mandatoryCosts: {
      otherTaxes: [
        { name: 'Solidaritätszuschlag (si applicable)', amount: 0 },
        { name: 'Kirchensteuer (si membre église)', amount: 0 },
      ],
    },
    costOfLivingMultiplier: 0.95,
    notes: [
      'Salaires bruts élevés mais charges importantes',
      'Système de santé dual (public/privé)',
      'Impôt église optionnel (8-9%)',
    ],
  },
  
  switzerland: {
    countryId: 'switzerland',
    currency: 'CHF',
    exchangeToEUR: 1.04, // 1 CHF = 1.04 EUR
    incomeTax: {
      brackets: [
        { min: 0, max: 17800, rate: 0 },
        { min: 17800, max: 31600, rate: 0.77 },
        { min: 31600, max: 41400, rate: 0.88 },
        { min: 41400, max: 55200, rate: 2.64 },
        { min: 55200, max: 72500, rate: 2.97 },
        { min: 72500, max: 119500, rate: 5.94 },
        { min: 119500, max: 166200, rate: 6.60 },
        { min: 166200, max: 755200, rate: 8.80 },
        { min: 755200, max: null, rate: 11.50 },
      ],
      personalAllowance: 17800,
      additionalDeductions: ['Impôt cantonal variable (10-35%)', 'Impôt communal'],
    },
    socialContributions: {
      healthInsurance: 0, // Payé séparément
      pension: 5.3, // AVS/AI/APG
      unemployment: 1.1,
      other: 0.5,
      total: 6.9,
    },
    employerContributions: {
      total: 6.9,
      notes: 'Charges patronales les plus basses d\'Europe',
    },
    healthcareCosts: {
      publicCoverage: 'none',
      privateInsuranceNeeded: true,
      avgMonthlyPremium: 380, // Assurance maladie obligatoire
      outOfPocketEstimate: 2000, // Franchise + quote-part
      qualityNote: 'Excellent mais très cher, assurance obligatoire privée',
    },
    mandatoryCosts: {
      otherTaxes: [
        { name: 'Impôt cantonal (moyenne)', amount: 0 },
      ],
    },
    costOfLivingMultiplier: 1.8,
    notes: [
      'Impôts fédéraux bas mais cantonaux significatifs',
      'Assurance maladie obligatoire et chère (300-500 CHF/mois)',
      'Coût de vie très élevé (1.5-2x France)',
      'Salaires très élevés compensent partiellement',
    ],
  },
  
  usa: {
    countryId: 'usa',
    currency: 'USD',
    exchangeToEUR: 0.92,
    incomeTax: {
      brackets: [
        { min: 0, max: 11600, rate: 10 },
        { min: 11600, max: 47150, rate: 12 },
        { min: 47150, max: 100525, rate: 22 },
        { min: 100525, max: 191950, rate: 24 },
        { min: 191950, max: 243725, rate: 32 },
        { min: 243725, max: 609350, rate: 35 },
        { min: 609350, max: null, rate: 37 },
      ],
      personalAllowance: 14600, // Standard deduction
      additionalDeductions: ['State tax (0-13% selon état)'],
    },
    socialContributions: {
      healthInsurance: 0, // Payé séparément
      pension: 6.2, // Social Security
      unemployment: 0,
      other: 1.45, // Medicare
      total: 7.65,
      cap: 168600, // Social Security cap
    },
    employerContributions: {
      total: 7.65,
      notes: 'Charges patronales très basses',
    },
    healthcareCosts: {
      publicCoverage: 'none',
      privateInsuranceNeeded: true,
      avgMonthlyPremium: 450, // Si employeur ne paie pas
      outOfPocketEstimate: 4000, // Deductibles + copays
      qualityNote: 'Qualité excellente mais accès très inégal, coûts énormes',
    },
    mandatoryCosts: {
      otherTaxes: [
        { name: 'State income tax (moyenne)', amount: 0 },
      ],
    },
    costOfLivingMultiplier: 1.1,
    notes: [
      'Impôts fédéraux + state tax (0-13%)',
      'Assurance santé souvent liée à l\'emploi',
      'Pas d\'assurance = risque financier majeur',
      'Retraite personnelle (401k) recommandée',
    ],
  },
  
  uk: {
    countryId: 'uk',
    currency: 'GBP',
    exchangeToEUR: 1.17,
    incomeTax: {
      brackets: [
        { min: 0, max: 12570, rate: 0 },
        { min: 12570, max: 50270, rate: 20 },
        { min: 50270, max: 125140, rate: 40 },
        { min: 125140, max: null, rate: 45 },
      ],
      personalAllowance: 12570,
    },
    socialContributions: {
      healthInsurance: 0, // NHS funded by NI
      pension: 0, // Part of NI
      unemployment: 0,
      other: 12, // National Insurance
      total: 12,
      cap: 50270, // Reduced rate above
    },
    employerContributions: {
      total: 13.8,
    },
    healthcareCosts: {
      publicCoverage: 'full',
      privateInsuranceNeeded: false,
      avgMonthlyPremium: 0,
      outOfPocketEstimate: 200,
      qualityNote: 'NHS gratuit mais listes d\'attente, privé optionnel',
    },
    mandatoryCosts: {
      otherTaxes: [
        { name: 'Council Tax', amount: 1800 },
      ],
    },
    costOfLivingMultiplier: 1.15,
    notes: [
      'NHS gratuit pour tous résidents',
      'National Insurance finance santé + retraite',
      'Council Tax significative',
    ],
  },
  
  uae: {
    countryId: 'uae',
    currency: 'AED',
    exchangeToEUR: 0.25,
    incomeTax: {
      brackets: [
        { min: 0, max: null, rate: 0 }, // Pas d'impôt sur le revenu
      ],
      personalAllowance: 0,
    },
    socialContributions: {
      healthInsurance: 0,
      pension: 5, // Pour Émiratis uniquement
      unemployment: 0,
      other: 0,
      total: 0, // 0 pour expats
    },
    employerContributions: {
      total: 12.5, // Pour Émiratis uniquement
      notes: 'Expats: pas de contributions sociales',
    },
    healthcareCosts: {
      publicCoverage: 'none',
      privateInsuranceNeeded: true,
      avgMonthlyPremium: 300, // Obligatoire
      outOfPocketEstimate: 1000,
      qualityNote: 'Qualité excellente mais privé obligatoire, employeur paie souvent',
    },
    mandatoryCosts: {
      otherTaxes: [
        { name: 'TVA 5%', amount: 0 },
      ],
    },
    costOfLivingMultiplier: 1.3,
    notes: [
      'AUCUN impôt sur le revenu',
      'Assurance santé obligatoire (souvent payée employeur)',
      'Pas de retraite publique pour expats',
      'Planifier sa propre retraite est essentiel',
    ],
  },
  
  singapore: {
    countryId: 'singapore',
    currency: 'SGD',
    exchangeToEUR: 0.68,
    incomeTax: {
      brackets: [
        { min: 0, max: 20000, rate: 0 },
        { min: 20000, max: 30000, rate: 2 },
        { min: 30000, max: 40000, rate: 3.5 },
        { min: 40000, max: 80000, rate: 7 },
        { min: 80000, max: 120000, rate: 11.5 },
        { min: 120000, max: 160000, rate: 15 },
        { min: 160000, max: 200000, rate: 18 },
        { min: 200000, max: 240000, rate: 19 },
        { min: 240000, max: 280000, rate: 19.5 },
        { min: 280000, max: 320000, rate: 20 },
        { min: 320000, max: 500000, rate: 22 },
        { min: 500000, max: 1000000, rate: 23 },
        { min: 1000000, max: null, rate: 24 },
      ],
      personalAllowance: 20000,
    },
    socialContributions: {
      healthInsurance: 0,
      pension: 20, // CPF pour citoyens/PR
      unemployment: 0,
      other: 0,
      total: 0, // 0 pour étrangers
    },
    employerContributions: {
      total: 17, // Pour citoyens/PR uniquement
    },
    healthcareCosts: {
      publicCoverage: 'partial',
      privateInsuranceNeeded: true,
      avgMonthlyPremium: 200,
      outOfPocketEstimate: 800,
      qualityNote: 'Système mixte excellent, Medisave pour locaux',
    },
    mandatoryCosts: {
      otherTaxes: [],
    },
    costOfLivingMultiplier: 1.4,
    notes: [
      'Impôts très bas',
      'CPF pour citoyens uniquement',
      'Expats: prévoir sa propre retraite et assurance',
      'Coût logement très élevé',
    ],
  },
  
  canada: {
    countryId: 'canada',
    currency: 'CAD',
    exchangeToEUR: 0.68,
    incomeTax: {
      brackets: [
        { min: 0, max: 55867, rate: 15 },
        { min: 55867, max: 111733, rate: 20.5 },
        { min: 111733, max: 173205, rate: 26 },
        { min: 173205, max: 246752, rate: 29 },
        { min: 246752, max: null, rate: 33 },
      ],
      personalAllowance: 15705,
      additionalDeductions: ['Impôt provincial (5-25%)'],
    },
    socialContributions: {
      healthInsurance: 0,
      pension: 5.95, // CPP
      unemployment: 1.63, // EI
      other: 0,
      total: 7.58,
    },
    employerContributions: {
      total: 7.58,
    },
    healthcareCosts: {
      publicCoverage: 'full',
      privateInsuranceNeeded: false,
      avgMonthlyPremium: 50, // Complémentaire optionnelle
      outOfPocketEstimate: 500,
      qualityNote: 'Santé publique mais listes d\'attente, médicaments non couverts',
    },
    mandatoryCosts: {
      otherTaxes: [
        { name: 'Impôt provincial (moyenne)', amount: 0 },
      ],
    },
    costOfLivingMultiplier: 1.0,
    notes: [
      'Impôts fédéraux + provinciaux significatifs',
      'Santé publique mais médicaments payants',
      'Hivers rigoureux = coûts chauffage',
    ],
  },
  
  cameroon: {
    countryId: 'cameroon',
    currency: 'XAF',
    exchangeToEUR: 0.00152,
    incomeTax: {
      brackets: [
        { min: 0, max: 2000000, rate: 10 },
        { min: 2000000, max: 3000000, rate: 15 },
        { min: 3000000, max: 5000000, rate: 25 },
        { min: 5000000, max: null, rate: 35 },
      ],
      personalAllowance: 500000,
    },
    socialContributions: {
      healthInsurance: 0,
      pension: 4.2, // CNPS
      unemployment: 0,
      other: 0,
      total: 4.2,
    },
    employerContributions: {
      total: 16.2,
    },
    healthcareCosts: {
      publicCoverage: 'none',
      privateInsuranceNeeded: true,
      avgMonthlyPremium: 50,
      outOfPocketEstimate: 300,
      qualityNote: 'Système limité, évacuation médicale recommandée pour urgences',
    },
    mandatoryCosts: {
      otherTaxes: [],
    },
    costOfLivingMultiplier: 0.25,
    notes: [
      'Impôts officiels mais économie informelle importante',
      'Pas de vrai système de santé public',
      'Prévoir assurance évacuation médicale',
    ],
  },
  
  japan: {
    countryId: 'japan',
    currency: 'JPY',
    exchangeToEUR: 0.0062,
    incomeTax: {
      brackets: [
        { min: 0, max: 1950000, rate: 5 },
        { min: 1950000, max: 3300000, rate: 10 },
        { min: 3300000, max: 6950000, rate: 20 },
        { min: 6950000, max: 9000000, rate: 23 },
        { min: 9000000, max: 18000000, rate: 33 },
        { min: 18000000, max: 40000000, rate: 40 },
        { min: 40000000, max: null, rate: 45 },
      ],
      personalAllowance: 480000,
      additionalDeductions: ['Residence tax (~10%)'],
    },
    socialContributions: {
      healthInsurance: 5,
      pension: 9.15,
      unemployment: 0.6,
      other: 0,
      total: 14.75,
    },
    employerContributions: {
      total: 15.5,
    },
    healthcareCosts: {
      publicCoverage: 'partial',
      privateInsuranceNeeded: false,
      avgMonthlyPremium: 0,
      outOfPocketEstimate: 800, // 30% copay
      qualityNote: 'Excellent système, 30% de franchise',
    },
    mandatoryCosts: {
      otherTaxes: [
        { name: 'Residence Tax', amount: 0 },
      ],
    },
    costOfLivingMultiplier: 1.2,
    notes: [
      'Impôt national + residence tax locale',
      'Santé: 30% à charge du patient',
      'Séismes fréquents - assurance habitation importante',
    ],
  },
};

// Additional countries - Spain, Portugal, Italy, Morocco, Netherlands
export const FISCAL_SYSTEMS_EXTENDED: Record<string, CountryFiscalSystem> = {
  ...FISCAL_SYSTEMS,
  
  spain: {
    countryId: 'spain',
    currency: 'EUR',
    exchangeToEUR: 1,
    incomeTax: {
      brackets: [
        { min: 0, max: 12450, rate: 19 },
        { min: 12450, max: 20200, rate: 24 },
        { min: 20200, max: 35200, rate: 30 },
        { min: 35200, max: 60000, rate: 37 },
        { min: 60000, max: 300000, rate: 45 },
        { min: 300000, max: null, rate: 47 },
      ],
      personalAllowance: 5550,
      additionalDeductions: ['Impôt régional variable (+0-4%)'],
    },
    socialContributions: {
      healthInsurance: 0,
      pension: 4.7,
      unemployment: 1.55,
      other: 0.1,
      total: 6.35,
      cap: 56844,
    },
    employerContributions: {
      total: 29.9,
      notes: 'Charges patronales élevées',
    },
    healthcareCosts: {
      publicCoverage: 'full',
      privateInsuranceNeeded: false,
      avgMonthlyPremium: 0,
      outOfPocketEstimate: 200,
      qualityNote: 'Excellent système public, temps d\'attente moyens',
    },
    mandatoryCosts: {
      otherTaxes: [],
    },
    costOfLivingMultiplier: 0.75,
    notes: [
      'Impôts modérés + charges sociales basses (employé)',
      'Système de santé public de qualité',
      'Coût de vie attractif hors grandes villes',
      'Régime beckham pour expats (flat tax 24%)',
    ],
  },
  
  portugal: {
    countryId: 'portugal',
    currency: 'EUR',
    exchangeToEUR: 1,
    incomeTax: {
      brackets: [
        { min: 0, max: 7703, rate: 14.5 },
        { min: 7703, max: 11623, rate: 21 },
        { min: 11623, max: 16472, rate: 26.5 },
        { min: 16472, max: 21321, rate: 28.5 },
        { min: 21321, max: 27146, rate: 35 },
        { min: 27146, max: 39791, rate: 37 },
        { min: 39791, max: 51997, rate: 43.5 },
        { min: 51997, max: 81199, rate: 45 },
        { min: 81199, max: null, rate: 48 },
      ],
      personalAllowance: 4104,
      additionalDeductions: ['NHR régime (flat 20% pour professions qualifiées)'],
    },
    socialContributions: {
      healthInsurance: 0,
      pension: 11,
      unemployment: 0,
      other: 0,
      total: 11,
    },
    employerContributions: {
      total: 23.75,
    },
    healthcareCosts: {
      publicCoverage: 'full',
      privateInsuranceNeeded: false,
      avgMonthlyPremium: 40,
      outOfPocketEstimate: 300,
      qualityNote: 'Système public correct, privé abordable et recommandé',
    },
    mandatoryCosts: {
      otherTaxes: [],
    },
    costOfLivingMultiplier: 0.65,
    notes: [
      'Régime NHR très avantageux (20% flat pour qualifiés)',
      'Coût de vie bas comparé à Europe occidentale',
      'Retraites étrangères exonérées 10 ans (NHR)',
      'Lisbonne/Porto plus chers que reste du pays',
    ],
  },
  
  italy: {
    countryId: 'italy',
    currency: 'EUR',
    exchangeToEUR: 1,
    incomeTax: {
      brackets: [
        { min: 0, max: 15000, rate: 23 },
        { min: 15000, max: 28000, rate: 25 },
        { min: 28000, max: 50000, rate: 35 },
        { min: 50000, max: null, rate: 43 },
      ],
      personalAllowance: 0,
      additionalDeductions: ['Additionnel régional (1-3%)', 'Additionnel communal (0-0.9%)'],
    },
    socialContributions: {
      healthInsurance: 0,
      pension: 9.19,
      unemployment: 0,
      other: 0.3,
      total: 9.49,
      cap: 113520,
    },
    employerContributions: {
      total: 30,
    },
    healthcareCosts: {
      publicCoverage: 'full',
      privateInsuranceNeeded: false,
      avgMonthlyPremium: 0,
      outOfPocketEstimate: 250,
      qualityNote: 'Système public de qualité, variable selon régions (Nord > Sud)',
    },
    mandatoryCosts: {
      otherTaxes: [],
    },
    costOfLivingMultiplier: 0.85,
    notes: [
      'Impôts élevés mais système social complet',
      'Nord plus développé et plus cher',
      'Régime impatrié (-70% sur revenus étrangers)',
      'Bureaucratie lourde',
    ],
  },
  
  morocco: {
    countryId: 'morocco',
    currency: 'MAD',
    exchangeToEUR: 0.092,
    incomeTax: {
      brackets: [
        { min: 0, max: 30000, rate: 0 },
        { min: 30000, max: 50000, rate: 10 },
        { min: 50000, max: 60000, rate: 20 },
        { min: 60000, max: 80000, rate: 30 },
        { min: 80000, max: 180000, rate: 34 },
        { min: 180000, max: null, rate: 38 },
      ],
      personalAllowance: 30000,
    },
    socialContributions: {
      healthInsurance: 2.26,
      pension: 3.96,
      unemployment: 0,
      other: 0.57,
      total: 6.79,
    },
    employerContributions: {
      total: 18.5,
    },
    healthcareCosts: {
      publicCoverage: 'partial',
      privateInsuranceNeeded: true,
      avgMonthlyPremium: 80,
      outOfPocketEstimate: 500,
      qualityNote: 'Cliniques privées de qualité à Casablanca/Rabat, public limité',
    },
    mandatoryCosts: {
      otherTaxes: [],
    },
    costOfLivingMultiplier: 0.35,
    notes: [
      'Impôts modérés pour les salariés',
      'Coût de vie très bas',
      'Système de santé dual (privé recommandé)',
      'Proche de l\'Europe, facile d\'accès',
    ],
  },
  
  netherlands: {
    countryId: 'netherlands',
    currency: 'EUR',
    exchangeToEUR: 1,
    incomeTax: {
      brackets: [
        { min: 0, max: 73031, rate: 36.93 },
        { min: 73031, max: null, rate: 49.5 },
      ],
      personalAllowance: 0,
      additionalDeductions: ['30% ruling pour expats (exonération 30% du salaire)'],
    },
    socialContributions: {
      healthInsurance: 0,
      pension: 17.9,
      unemployment: 0,
      other: 9.65,
      total: 27.55,
      cap: 66956,
    },
    employerContributions: {
      total: 18,
    },
    healthcareCosts: {
      publicCoverage: 'partial',
      privateInsuranceNeeded: true,
      avgMonthlyPremium: 130,
      outOfPocketEstimate: 385,
      qualityNote: 'Assurance obligatoire privée, excellent système',
    },
    mandatoryCosts: {
      otherTaxes: [],
    },
    costOfLivingMultiplier: 1.1,
    notes: [
      '30% ruling très avantageux pour expats qualifiés',
      'Assurance santé privée obligatoire',
      'Impôts élevés mais infrastructures excellentes',
      'Amsterdam très cher, autres villes plus abordables',
    ],
  },

  senegal: {
    countryId: 'senegal',
    currency: 'XOF',
    exchangeToEUR: 0.00152,
    incomeTax: {
      brackets: [
        { min: 0, max: 630000, rate: 0 },
        { min: 630000, max: 1500000, rate: 20 },
        { min: 1500000, max: 4000000, rate: 30 },
        { min: 4000000, max: 8000000, rate: 35 },
        { min: 8000000, max: 13500000, rate: 37 },
        { min: 13500000, max: null, rate: 40 },
      ],
      personalAllowance: 630000,
    },
    socialContributions: {
      healthInsurance: 0,
      pension: 5.6,
      unemployment: 0,
      other: 3,
      total: 8.6,
    },
    employerContributions: {
      total: 17.5,
    },
    healthcareCosts: {
      publicCoverage: 'partial',
      privateInsuranceNeeded: true,
      avgMonthlyPremium: 60,
      outOfPocketEstimate: 400,
      qualityNote: 'Bonnes cliniques privées à Dakar, évacuation médicale conseillée',
    },
    mandatoryCosts: {
      otherTaxes: [],
    },
    costOfLivingMultiplier: 0.30,
    notes: [
      'Fiscalité modérée pour l\'Afrique',
      'Hub économique ouest-africain',
      'Dakar relativement cher pour la région',
      'Teranga (hospitalité) légendaire',
    ],
  },

  cote_divoire: {
    countryId: 'cote_divoire',
    currency: 'XOF',
    exchangeToEUR: 0.00152,
    incomeTax: {
      brackets: [
        { min: 0, max: 300000, rate: 0 },
        { min: 300000, max: 548000, rate: 10 },
        { min: 548000, max: 979000, rate: 15 },
        { min: 979000, max: 1519000, rate: 20 },
        { min: 1519000, max: 2644000, rate: 25 },
        { min: 2644000, max: 4669000, rate: 35 },
        { min: 4669000, max: 10106000, rate: 45 },
        { min: 10106000, max: null, rate: 60 },
      ],
      personalAllowance: 300000,
    },
    socialContributions: {
      healthInsurance: 0,
      pension: 6.3,
      unemployment: 0,
      other: 2.8,
      total: 9.1,
    },
    employerContributions: {
      total: 15.75,
    },
    healthcareCosts: {
      publicCoverage: 'partial',
      privateInsuranceNeeded: true,
      avgMonthlyPremium: 70,
      outOfPocketEstimate: 450,
      qualityNote: 'Abidjan a de bonnes cliniques privées',
    },
    mandatoryCosts: {
      otherTaxes: [],
    },
    costOfLivingMultiplier: 0.32,
    notes: [
      'Économie la plus dynamique d\'Afrique francophone',
      'Impôts élevés sur hauts revenus',
      'Abidjan = hub régional',
      'Coût de vie modéré',
    ],
  },
};

/**
 * Calculate net salary with full breakdown
 * Uses FISCAL_SYSTEMS_EXTENDED for more countries
 */
export function calculateNetSalary(
  countryId: string,
  grossAnnualSalary: number,
  includeHealthcare: boolean = true
): NetSalaryResult | null {
  const fiscal = FISCAL_SYSTEMS_EXTENDED[countryId] || FISCAL_SYSTEMS[countryId];
  if (!fiscal) return null;
  
  const grossAnnual = grossAnnualSalary;
  const grossMonthly = grossAnnual / 12;
  
  // Calculate income tax
  let incomeTax = 0;
  let remainingIncome = Math.max(0, grossAnnual - fiscal.incomeTax.personalAllowance);
  
  for (const bracket of fiscal.incomeTax.brackets) {
    if (remainingIncome <= 0) break;
    
    const bracketMax = bracket.max ?? Infinity;
    const bracketMin = bracket.min;
    const taxableInBracket = Math.min(
      remainingIncome,
      Math.max(0, bracketMax - bracketMin)
    );
    
    incomeTax += taxableInBracket * (bracket.rate / 100);
    remainingIncome -= taxableInBracket;
  }
  
  // Calculate social contributions
  const socialContributionBase = fiscal.socialContributions.cap 
    ? Math.min(grossAnnual, fiscal.socialContributions.cap)
    : grossAnnual;
  
  const healthInsurance = socialContributionBase * (fiscal.socialContributions.healthInsurance / 100);
  const pension = socialContributionBase * (fiscal.socialContributions.pension / 100);
  const otherSocial = socialContributionBase * (fiscal.socialContributions.other / 100);
  const unemployment = socialContributionBase * (fiscal.socialContributions.unemployment / 100);
  
  const totalSocialContributions = healthInsurance + pension + otherSocial + unemployment;
  
  // Calculate other deductions
  const otherDeductions = fiscal.mandatoryCosts.otherTaxes.reduce((sum, t) => sum + t.amount, 0);
  
  // Healthcare costs
  const healthcareCost = includeHealthcare && fiscal.healthcareCosts.privateInsuranceNeeded
    ? (fiscal.healthcareCosts.avgMonthlyPremium * 12) + fiscal.healthcareCosts.outOfPocketEstimate
    : fiscal.healthcareCosts.outOfPocketEstimate;
  
  // Net calculations
  const totalDeductions = incomeTax + totalSocialContributions + otherDeductions;
  const netAnnual = grossAnnual - totalDeductions;
  const netMonthly = netAnnual / 12;
  
  // Effective rates
  const effectiveTaxRate = (incomeTax / grossAnnual) * 100;
  const effectiveTotalRate = (totalDeductions / grossAnnual) * 100;
  
  // Purchasing power adjusted
  const purchasingPowerAdjusted = netMonthly / fiscal.costOfLivingMultiplier;
  
  // Build breakdown
  const breakdown = [
    { label: 'Salaire brut', amount: grossMonthly, percentage: 100 },
    { label: 'Impôt sur le revenu', amount: -(incomeTax / 12), percentage: -effectiveTaxRate },
    { label: 'Cotisations sociales', amount: -(totalSocialContributions / 12), percentage: -(totalSocialContributions / grossAnnual) * 100 },
  ];
  
  if (fiscal.healthcareCosts.privateInsuranceNeeded && includeHealthcare) {
    breakdown.push({ 
      label: 'Assurance santé', 
      amount: -(fiscal.healthcareCosts.avgMonthlyPremium), 
      percentage: -(fiscal.healthcareCosts.avgMonthlyPremium * 12 / grossAnnual) * 100 
    });
  }
  
  breakdown.push({ 
    label: 'Net mensuel', 
    amount: netMonthly, 
    percentage: (netMonthly / grossMonthly) * 100 
  });
  
  return {
    grossAnnual,
    grossMonthly,
    incomeTax,
    socialContributions: totalSocialContributions,
    healthInsurance,
    pension,
    otherDeductions,
    netAnnual,
    netMonthly,
    effectiveTaxRate,
    effectiveTotalRate,
    purchasingPowerAdjusted,
    totalHealthcareCost: healthcareCost,
    breakdown,
  };
}

/**
 * Compare salaries between two countries
 */
export function compareSalaries(
  country1Id: string,
  grossSalary1: number,
  country2Id: string,
  grossSalary2: number
): {
  country1: NetSalaryResult | null;
  country2: NetSalaryResult | null;
  netDifference: number;
  purchasingPowerDifference: number;
  winner: string;
  analysis: string[];
} {
  const result1 = calculateNetSalary(country1Id, grossSalary1);
  const result2 = calculateNetSalary(country2Id, grossSalary2);
  
  if (!result1 || !result2) {
    return {
      country1: result1,
      country2: result2,
      netDifference: 0,
      purchasingPowerDifference: 0,
      winner: 'unknown',
      analysis: ['Données fiscales manquantes pour un des pays'],
    };
  }
  
  const netDifference = result2.netMonthly - result1.netMonthly;
  const purchasingPowerDifference = result2.purchasingPowerAdjusted - result1.purchasingPowerAdjusted;
  
  const analysis: string[] = [];
  
  // Compare effective rates
  if (result2.effectiveTotalRate < result1.effectiveTotalRate) {
    analysis.push(`Prélèvements plus bas: ${result2.effectiveTotalRate.toFixed(1)}% vs ${result1.effectiveTotalRate.toFixed(1)}%`);
  } else if (result2.effectiveTotalRate > result1.effectiveTotalRate) {
    analysis.push(`Prélèvements plus élevés: ${result2.effectiveTotalRate.toFixed(1)}% vs ${result1.effectiveTotalRate.toFixed(1)}%`);
  }
  
  // Compare purchasing power
  if (purchasingPowerDifference > 0) {
    analysis.push(`Pouvoir d'achat supérieur de ${purchasingPowerDifference.toFixed(0)}€/mois`);
  } else if (purchasingPowerDifference < 0) {
    analysis.push(`Pouvoir d'achat inférieur de ${Math.abs(purchasingPowerDifference).toFixed(0)}€/mois`);
  }
  
  // Healthcare comparison
  const fiscal1 = FISCAL_SYSTEMS_EXTENDED[country1Id] || FISCAL_SYSTEMS[country1Id];
  const fiscal2 = FISCAL_SYSTEMS_EXTENDED[country2Id] || FISCAL_SYSTEMS[country2Id];
  
  if (fiscal1 && fiscal2) {
    if (fiscal2.healthcareCosts.privateInsuranceNeeded && !fiscal1.healthcareCosts.privateInsuranceNeeded) {
      analysis.push(`⚠️ Assurance privée obligatoire (${fiscal2.healthcareCosts.avgMonthlyPremium}€/mois)`);
    }
    if (!fiscal2.healthcareCosts.privateInsuranceNeeded && fiscal1.healthcareCosts.privateInsuranceNeeded) {
      analysis.push(`✅ Couverture santé publique incluse`);
    }
  }
  
  const winner = purchasingPowerDifference > 0 ? country2Id : country1Id;
  
  return {
    country1: result1,
    country2: result2,
    netDifference,
    purchasingPowerDifference,
    winner,
    analysis,
  };
}

/**
 * Get fiscal summary for a country
 */
export function getFiscalSummary(countryId: string): string[] {
  const fiscal = FISCAL_SYSTEMS_EXTENDED[countryId] || FISCAL_SYSTEMS[countryId];
  if (!fiscal) return ['Données fiscales non disponibles'];
  
  const summary: string[] = [];
  
  // Tax level
  const topRate = fiscal.incomeTax.brackets[fiscal.incomeTax.brackets.length - 1].rate;
  if (topRate === 0) {
    summary.push('🎉 Pas d\'impôt sur le revenu');
  } else if (topRate < 25) {
    summary.push(`✅ Impôts faibles (max ${topRate}%)`);
  } else if (topRate < 40) {
    summary.push(`🟡 Impôts modérés (max ${topRate}%)`);
  } else {
    summary.push(`🔴 Impôts élevés (max ${topRate}%)`);
  }
  
  // Social contributions
  if (fiscal.socialContributions.total < 10) {
    summary.push(`✅ Charges sociales basses (${fiscal.socialContributions.total}%)`);
  } else if (fiscal.socialContributions.total < 20) {
    summary.push(`🟡 Charges sociales modérées (${fiscal.socialContributions.total}%)`);
  } else {
    summary.push(`🔴 Charges sociales élevées (${fiscal.socialContributions.total}%)`);
  }
  
  // Healthcare
  if (fiscal.healthcareCosts.publicCoverage === 'full') {
    summary.push('✅ Couverture santé publique complète');
  } else if (fiscal.healthcareCosts.privateInsuranceNeeded) {
    summary.push(`⚠️ Assurance privée obligatoire (~${fiscal.healthcareCosts.avgMonthlyPremium}€/mois)`);
  }
  
  // Cost of living
  if (fiscal.costOfLivingMultiplier > 1.5) {
    summary.push('🔴 Coût de la vie très élevé');
  } else if (fiscal.costOfLivingMultiplier > 1.2) {
    summary.push('🟡 Coût de la vie élevé');
  } else if (fiscal.costOfLivingMultiplier < 0.5) {
    summary.push('✅ Coût de la vie très bas');
  }
  
  return summary;
}
