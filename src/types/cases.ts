import { UserCase } from '@/hooks/useUserCases';

/**
 * Extended case data interface for components that access
 * fields stored in the DB but not part of the base UserCase type.
 * These fields are optional JSON columns on the user_cases table.
 */
export interface ExtendedCaseData extends UserCase {
  market_study?: {
    problemStatement: string;
    valueProposition: string;
    customerSegments: string[];
    payingCustomer: string;
    endUser: string;
    competitors: Array<{
      name: string;
      scope: string;
      implantation: 'local' | 'regional' | 'national' | 'international';
      strengths: string;
    }>;
    differentiation: string;
    timingReason: string;
    regulations: string[];
    constraints: string[];
    goToMarket: string;
    channels: string[];
    unitEconomics: {
      costPerUnit: number;
      pricePerUnit: number;
      marginPercent: number;
      breakeven: string;
    };
    operations: string;
    logistics: string;
    customsNotes: string;
    keyRisks: string[];
    feasibility: 'low' | 'medium' | 'high';
    conditionsToValidate: string[];
    externalStudyBy?: string;
    externalStudySummary?: string;
  };
  actors_map?: Array<{
    id: string;
    name: string;
    type: string;
    status: string;
    role: string;
    dependencyLevel: string;
    reliability: string;
    notes: string;
    proofs: string[];
    isRedFlag: boolean;
  }>;
  risk_register_enhanced?: Array<{
    id: string;
    category: string;
    description: string;
    probability: 'low' | 'medium' | 'high';
    impact: 'low' | 'medium' | 'high';
    status: 'open' | 'mitigated' | 'accepted';
    alertSignals: string[];
    protections: string[];
  }>;
  structural_rules?: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    source: string;
    status: 'unverified' | 'in_progress' | 'verified';
  }>;
}
