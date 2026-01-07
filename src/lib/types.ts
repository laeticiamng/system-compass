export type PyramidType = 'PROBLEM_RENT' | 'STABILITY_REDIS' | 'COMPETENCE_TRUST' | 'GROWTH_RISK';

export interface CountryRisks {
  legal: number;
  safety: number;
  corruption: number;
  volatility: number;
  bureaucracy: number;
}

export interface CountryPyramid {
  top: string;
  institutions: string;
  gatekeepers: string;
  valueCreators: string;
  base: string;
  realAsset: string;
}

export interface CountryPlaybook {
  do: string[];
  dont: string[];
  plan30Days: string[];
  plan12Months: string[];
  plan5Years: string[];
  planB: string;
}

export interface CountryVisaInfo {
  workVisa: 'easy' | 'moderate' | 'difficult';
  startupVisa: boolean;
  digitalNomadVisa: boolean;
  investmentVisa: boolean;
  investmentMinimum?: number;
  citizenshipYears: number;
  notes?: string;
}

export interface CountryCostOfLiving {
  index: number; // 0-100, relative to NYC (100)
  rentIndex: number;
  groceriesIndex: number;
  monthlyBudgetSingle: number;
  monthlyBudgetFamily: number;
}

export interface CountryQualityOfLife {
  healthcareRank: number;
  educationIndex: number;
  safetyIndex: number;
  environmentIndex: number;
  workLifeBalance: number; // 1-10
  internetSpeed: number; // Mbps average
}

export interface Country {
  id: string;
  name: string;
  nameLocal: string;
  iso2: string;
  region: string;
  pyramidType: PyramidType;
  ruleOfGold: string;
  pyramid: CountryPyramid;
  risks: CountryRisks;
  whoWins: string[];
  whoLoses: string[];
  playbook: CountryPlaybook;
  snapshot: {
    gdpPerCapita: number;
    population: number;
    passportRank: number;
    corruptionIndex: number;
    freedomIndex: number;
  };
  visa: CountryVisaInfo;
  costOfLiving: CountryCostOfLiving;
  qualityOfLife: CountryQualityOfLife;
  lastUpdated: string;
  sources: string[];
}

export interface UserProfile {
  ambition: number;
  meritNeed: number;
  riskTolerance: number;
  securityNeed: number;
  bureaucracyTolerance: number;
  innovationDrive: number;
  discretionPreference: number;
  mobility: 'low' | 'medium' | 'high';
}

export interface ProfileResult {
  archetype: string;
  description: string;
  strengths: string[];
  vulnerabilities: string[];
  compatibleTypes: PyramidType[];
  redFlags: string[];
}

export const PYRAMID_TYPE_INFO: Record<PyramidType, { label: string; description: string; color: string }> = {
  PROBLEM_RENT: {
    label: 'Problem Rent',
    description: 'The dysfunction is the asset. Solving problems puts you at risk.',
    color: 'pyramid-rent',
  },
  STABILITY_REDIS: {
    label: 'Stability Redistribution',
    description: 'The system rewards stability, protection, and redistribution.',
    color: 'pyramid-stability',
  },
  COMPETENCE_TRUST: {
    label: 'Competence Trust',
    description: 'The solution is the asset. Rigor and competence are rewarded.',
    color: 'pyramid-competence',
  },
  GROWTH_RISK: {
    label: 'Growth Risk',
    description: 'Growth is the asset. Speed, scalability, and capital are rewarded.',
    color: 'pyramid-growth',
  },
};
