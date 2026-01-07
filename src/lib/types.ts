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
  lgbtqRights: LGBTQRights;
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

// Life Trajectory Types
export type LifeMotorProfile = 
  | 'LOTTERY'
  | 'COMFORT'
  | 'BUILDER'
  | 'SAFE_WEALTH'
  | 'NOMAD'
  | 'PURPOSE'
  | 'STATUS'
  | 'RECOVERY';

export type TrajectoryPlan = 'SAFE' | 'HYBRID' | 'AMBITIOUS';

export type LifePriority = 'freedom' | 'money' | 'meaning' | 'status' | 'family' | 'calm';

export interface LifeTrajectoryProfile {
  motorProfile: LifeMotorProfile;
  riskTolerance: 'low' | 'medium' | 'high';
  timeHorizon: 'short' | 'medium' | 'long';
  energyCapacity: 'low' | 'medium' | 'high';
  geographicFreedom: boolean;
  priority: LifePriority;
  avoidsLongStudies: boolean;
  canSell: boolean;
  wantsToContribute: boolean;
  prefersAutonomy: boolean;
  lgbtq: boolean;
}

export interface TrajectoryRecommendation {
  plan: TrajectoryPlan;
  title: string;
  description: string;
  duration: string;
  paths: string[];
  skills: string[];
  risks: string[];
  firstSteps: string[];
}

export interface LGBTQRights {
  index: number; // 0-100, higher is better
  sameSecMarriage: boolean;
  civilUnion: boolean;
  employmentProtection: boolean;
  safetyRating: 'safe' | 'caution' | 'dangerous';
  notes?: string;
}

export const LIFE_MOTOR_PROFILES: Record<LifeMotorProfile, {
  label: string;
  description: string;
  icon: string;
  workRelation: string;
  riskRelation: string;
  whatWorks: string;
  trap: string;
  color: string;
}> = {
  LOTTERY: {
    label: 'lifeProfiles.lottery.label',
    description: 'lifeProfiles.lottery.description',
    icon: '🎰',
    workRelation: 'lifeProfiles.lottery.workRelation',
    riskRelation: 'lifeProfiles.lottery.riskRelation',
    whatWorks: 'lifeProfiles.lottery.whatWorks',
    trap: 'lifeProfiles.lottery.trap',
    color: 'text-yellow-500',
  },
  COMFORT: {
    label: 'lifeProfiles.comfort.label',
    description: 'lifeProfiles.comfort.description',
    icon: '🛋️',
    workRelation: 'lifeProfiles.comfort.workRelation',
    riskRelation: 'lifeProfiles.comfort.riskRelation',
    whatWorks: 'lifeProfiles.comfort.whatWorks',
    trap: 'lifeProfiles.comfort.trap',
    color: 'text-blue-400',
  },
  BUILDER: {
    label: 'lifeProfiles.builder.label',
    description: 'lifeProfiles.builder.description',
    icon: '🏗️',
    workRelation: 'lifeProfiles.builder.workRelation',
    riskRelation: 'lifeProfiles.builder.riskRelation',
    whatWorks: 'lifeProfiles.builder.whatWorks',
    trap: 'lifeProfiles.builder.trap',
    color: 'text-emerald-500',
  },
  SAFE_WEALTH: {
    label: 'lifeProfiles.safeWealth.label',
    description: 'lifeProfiles.safeWealth.description',
    icon: '🏦',
    workRelation: 'lifeProfiles.safeWealth.workRelation',
    riskRelation: 'lifeProfiles.safeWealth.riskRelation',
    whatWorks: 'lifeProfiles.safeWealth.whatWorks',
    trap: 'lifeProfiles.safeWealth.trap',
    color: 'text-amber-500',
  },
  NOMAD: {
    label: 'lifeProfiles.nomad.label',
    description: 'lifeProfiles.nomad.description',
    icon: '🌍',
    workRelation: 'lifeProfiles.nomad.workRelation',
    riskRelation: 'lifeProfiles.nomad.riskRelation',
    whatWorks: 'lifeProfiles.nomad.whatWorks',
    trap: 'lifeProfiles.nomad.trap',
    color: 'text-cyan-500',
  },
  PURPOSE: {
    label: 'lifeProfiles.purpose.label',
    description: 'lifeProfiles.purpose.description',
    icon: '💝',
    workRelation: 'lifeProfiles.purpose.workRelation',
    riskRelation: 'lifeProfiles.purpose.riskRelation',
    whatWorks: 'lifeProfiles.purpose.whatWorks',
    trap: 'lifeProfiles.purpose.trap',
    color: 'text-pink-500',
  },
  STATUS: {
    label: 'lifeProfiles.status.label',
    description: 'lifeProfiles.status.description',
    icon: '👔',
    workRelation: 'lifeProfiles.status.workRelation',
    riskRelation: 'lifeProfiles.status.riskRelation',
    whatWorks: 'lifeProfiles.status.whatWorks',
    trap: 'lifeProfiles.status.trap',
    color: 'text-purple-500',
  },
  RECOVERY: {
    label: 'lifeProfiles.recovery.label',
    description: 'lifeProfiles.recovery.description',
    icon: '🔄',
    workRelation: 'lifeProfiles.recovery.workRelation',
    riskRelation: 'lifeProfiles.recovery.riskRelation',
    whatWorks: 'lifeProfiles.recovery.whatWorks',
    trap: 'lifeProfiles.recovery.trap',
    color: 'text-teal-500',
  },
};
