import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export type CaseAIAction = 
  | 'generate-market-study'
  | 'generate-actors-map'
  | 'generate-risk-register'
  | 'generate-structural-rules'
  | 'generate-poc-plan'
  | 'generate-complete-case';

interface AIContext {
  countryName: string;
  countryContext?: {
    pyramidType?: string;
    region?: string;
    governanceScores?: Record<string, number>;
  };
  intention: 'relocation' | 'entrepreneurship';
  projectType?: string;
  projectDescription?: string;
  sector?: string;
  budget?: string;
  timeline?: string;
  profile?: {
    birthCountry?: string;
    nationalities?: string[];
    currentCountry?: string;
    motorProfile?: string;
    riskTolerance?: string;
  };
  existingData?: any;
}

interface AIResult<T> {
  success: boolean;
  action: string;
  result: T;
  policyWarnings?: string[];
  meta?: {
    processingTime: number;
    tokensUsed: number;
  };
}

export function useCaseAI() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateContent = async <T = any>(
    action: CaseAIAction,
    context: AIContext
  ): Promise<T | null> => {
    if (!user) {
      toast.error(t('common.pleaseLogin', 'Veuillez vous connecter'));
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('ai-assist', {
        body: {
          action,
          context: {
            ...context,
            module: 'cases',
          },
          userId: user.id,
          sessionId: crypto.randomUUID(),
        },
      });

      if (fnError) {
        throw fnError;
      }

      if (!data.success) {
        throw new Error(data.error || 'Erreur de génération');
      }

      const result = data as AIResult<T>;

      // Show policy warnings if any
      if (result.policyWarnings && result.policyWarnings.length > 0) {
        console.warn('AI Policy warnings:', result.policyWarnings);
      }

      toast.success(t('ai.generationSuccess', 'Contenu généré avec succès'));
      return result.result;
    } catch (err: any) {
      const errorMessage = err.message || 'Erreur lors de la génération';
      setError(errorMessage);
      
      // Handle specific errors
      if (err.status === 429) {
        toast.error(t('ai.rateLimitError', 'Limite de requêtes atteinte. Réessayez dans quelques instants.'));
      } else if (err.status === 402) {
        toast.error(t('ai.creditsError', 'Crédits IA insuffisants. Veuillez recharger votre compte.'));
      } else {
        toast.error(errorMessage);
      }
      
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Specific generators
  const generateMarketStudy = async (context: AIContext) => {
    return generateContent<{
      problemStatement: string;
      valueProposition: string;
      customerSegments: string[];
      payingCustomer: string;
      endUser: string;
      competitors: Array<{ name: string; scope: string; implantation: string; strengths: string }>;
      differentiation: string;
      timingReason: string;
      regulations: string[];
      constraints: string[];
      goToMarket: string;
      channels: string[];
      keyRisks: string[];
      feasibility: 'low' | 'medium' | 'high';
      conditionsToValidate: string[];
    }>('generate-market-study', context);
  };

  const generateActorsMap = async (context: AIContext) => {
    return generateContent<{
      actors: Array<{
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
      warnings: string[];
      mitigations: string[];
    }>('generate-actors-map', context);
  };

  const generateRiskRegister = async (context: AIContext) => {
    return generateContent<{
      risks: Array<{
        id: string;
        category: string;
        description: string;
        probability: string;
        impact: string[];
        alertSignals: string[];
        protections: string[];
        status: string;
        notes: string;
      }>;
      summary: {
        highRisks: number;
        mediumRisks: number;
        lowRisks: number;
        mainThreats: string[];
      };
      recommendations: string[];
    }>('generate-risk-register', context);
  };

  const generateStructuralRules = async (context: AIContext) => {
    return generateContent<{
      rules: Array<{
        id: string;
        type: string;
        title: string;
        description: string;
        source: string;
        status: string;
        notes: string;
      }>;
      officialSources: string[];
      professionalContacts: string[];
    }>('generate-structural-rules', context);
  };

  const generatePOCPlan = async (context: AIContext) => {
    return generateContent<{
      hypothesis: string;
      scope: string;
      budget: number;
      duration: string;
      successCriteria: string[];
      stopCriteria: string[];
      milestones: Array<{ title: string; deadline: string; type: string }>;
      risks: string[];
      nextSteps: string[];
    }>('generate-poc-plan', context);
  };

  const generateCompleteCase = async (context: AIContext) => {
    return generateContent<{
      summary: {
        feasibility: 'low' | 'medium' | 'high';
        mainOpportunities: string[];
        mainRisks: string[];
        keyActions: string[];
      };
      marketStudy: any;
      actors: any[];
      risks: any[];
      rules: any[];
      poc: any;
      milestones: any[];
    }>('generate-complete-case', context);
  };

  return {
    isLoading,
    error,
    generateMarketStudy,
    generateActorsMap,
    generateRiskRegister,
    generateStructuralRules,
    generatePOCPlan,
    generateCompleteCase,
  };
}
