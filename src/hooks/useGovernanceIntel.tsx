import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

// Types
export interface GovernanceActor {
  id: string;
  case_id: string;
  country_code: string;
  sector?: string;
  label: string;
  actor_type: string;
  power_types: string[];
  formality_level: string;
  reliability_status: string;
  notes?: string;
  sources: { url: string; title: string; type: string; date?: string }[];
  confidence_score: number;
  is_ai_generated: boolean;
  created_at: string;
  updated_at: string;
}

export interface IntermediationPattern {
  id: string;
  case_id: string;
  pattern_type: string;
  description_neutral: string;
  risk_level: string;
  signals: string[];
  protections: string[];
  sources: { url: string; title: string; type: string; date?: string }[];
  confidence_score: number;
  is_ai_generated: boolean;
  created_at: string;
  updated_at: string;
}

export interface GovernancePartner {
  id: string;
  case_id: string;
  partner_type: string;
  description?: string;
  is_mandatory: boolean;
  risk_flags: string[];
  due_diligence_checklist: string[];
  notes?: string;
  sources: { url: string; title: string; type: string; date?: string }[];
  confidence_score: number;
  is_ai_generated: boolean;
  created_at: string;
  updated_at: string;
}

export interface DelayReality {
  id: string;
  case_id: string;
  process_name: string;
  official_timeframe?: string;
  optimistic_timeframe?: string;
  realistic_timeframe?: string;
  pessimistic_timeframe?: string;
  delay_risk_signals: string[];
  cashflow_implications?: string;
  sources: { url: string; title: string; type: string; date?: string }[];
  confidence_score: number;
  is_ai_generated: boolean;
  created_at: string;
  updated_at: string;
}

export interface GovIntelRun {
  id: string;
  case_id: string;
  user_id: string;
  country_code: string;
  sector?: string;
  project_type?: string;
  intention?: string;
  status: string;
  actors_count: number;
  patterns_count: number;
  partners_count: number;
  delays_count: number;
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

interface GovernanceIntelData {
  actors: GovernanceActor[];
  patterns: IntermediationPattern[];
  partners: GovernancePartner[];
  delays: DelayReality[];
  lastRun?: GovIntelRun;
}

export function useGovernanceIntel(caseId: string) {
  const { t } = useTranslation();
  const [data, setData] = useState<GovernanceIntelData>({
    actors: [],
    patterns: [],
    partners: [],
    delays: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch all governance intel data for a case
  const fetchData = useCallback(async () => {
    if (!caseId) return;
    
    setIsLoading(true);
    try {
      const [actorsRes, patternsRes, partnersRes, delaysRes, runsRes] = await Promise.all([
        supabase.from('case_governance_actors').select('*').eq('case_id', caseId).order('created_at', { ascending: false }),
        supabase.from('case_intermediation_patterns').select('*').eq('case_id', caseId).order('created_at', { ascending: false }),
        supabase.from('case_governance_partners').select('*').eq('case_id', caseId).order('created_at', { ascending: false }),
        supabase.from('case_delays_reality').select('*').eq('case_id', caseId).order('created_at', { ascending: false }),
        supabase.from('gov_intel_runs').select('*').eq('case_id', caseId).order('created_at', { ascending: false }).limit(1),
      ]);

      setData({
        actors: (actorsRes.data || []) as unknown as GovernanceActor[],
        patterns: (patternsRes.data || []) as unknown as IntermediationPattern[],
        partners: (partnersRes.data || []) as unknown as GovernancePartner[],
        delays: (delaysRes.data || []) as unknown as DelayReality[],
        lastRun: (runsRes.data?.[0] || undefined) as unknown as GovIntelRun | undefined,
      });
    } catch (error) {
      console.error('Error fetching governance intel:', error);
    } finally {
      setIsLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Generate governance intel via AI
  const generateIntel = async (params: {
    country_code: string;
    country_name?: string;
    sector?: string;
    project_type?: string;
    intention?: 'relocation' | 'entrepreneurship';
    constraints?: string;
  }) => {
    setIsGenerating(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('gov-intel-generate', {
        body: {
          case_id: caseId,
          ...params
        }
      });

      if (error) throw error;
      
      if (result.error) {
        if (result.error === 'rate_limited') {
          toast.error(t('governance.errors.rateLimited', 'Trop de requêtes. Réessayez dans quelques instants.'));
        } else if (result.error === 'payment_required') {
          toast.error(t('governance.errors.creditsRequired', 'Crédits IA insuffisants.'));
        } else {
          throw new Error(result.message || result.error);
        }
        return null;
      }

      toast.success(t('governance.generated', 'Analyse de gouvernance générée avec succès'));
      await fetchData();
      return result;
    } catch (error) {
      console.error('Error generating governance intel:', error);
      toast.error(t('governance.errors.generateFailed', 'Erreur lors de la génération'));
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  // Clear all AI-generated data for this case
  const clearAIData = async () => {
    try {
      await Promise.all([
        supabase.from('case_governance_actors').delete().eq('case_id', caseId).eq('is_ai_generated', true),
        supabase.from('case_intermediation_patterns').delete().eq('case_id', caseId).eq('is_ai_generated', true),
        supabase.from('case_governance_partners').delete().eq('case_id', caseId).eq('is_ai_generated', true),
        supabase.from('case_delays_reality').delete().eq('case_id', caseId).eq('is_ai_generated', true),
      ]);
      toast.success(t('governance.cleared', 'Données IA supprimées'));
      await fetchData();
    } catch (error) {
      console.error('Error clearing AI data:', error);
      toast.error(t('governance.errors.clearFailed', 'Erreur lors de la suppression'));
    }
  };

  // CRUD operations for manual entries
  const addActor = async (actor: Partial<GovernanceActor>) => {
    const insertData = {
      case_id: caseId,
      country_code: actor.country_code || '',
      label: actor.label || '',
      actor_type: actor.actor_type || 'other',
      power_types: actor.power_types || [],
      formality_level: actor.formality_level || 'formal',
      reliability_status: actor.reliability_status || 'unverified',
      notes: actor.notes,
      sources: actor.sources || [],
      confidence_score: actor.confidence_score || 50,
      is_ai_generated: false
    };
    
    const { data: result, error } = await supabase
      .from('case_governance_actors')
      .insert(insertData)
      .select()
      .single();
    
    if (error) {
      toast.error(t('governance.errors.addFailed', 'Erreur lors de l\'ajout'));
      return null;
    }
    
    await fetchData();
    return result;
  };

  const updateActor = async (id: string, updates: Partial<GovernanceActor>) => {
    const { error } = await supabase
      .from('case_governance_actors')
      .update(updates)
      .eq('id', id);
    
    if (error) {
      toast.error(t('governance.errors.updateFailed', 'Erreur lors de la mise à jour'));
      return false;
    }
    
    await fetchData();
    return true;
  };

  const deleteActor = async (id: string) => {
    const { error } = await supabase
      .from('case_governance_actors')
      .delete()
      .eq('id', id);
    
    if (error) {
      toast.error(t('governance.errors.deleteFailed', 'Erreur lors de la suppression'));
      return false;
    }
    
    await fetchData();
    return true;
  };

  const addPattern = async (pattern: Partial<IntermediationPattern>) => {
    const insertData = {
      case_id: caseId,
      pattern_type: pattern.pattern_type || 'access_chain',
      description_neutral: pattern.description_neutral || '',
      risk_level: pattern.risk_level || 'medium',
      signals: pattern.signals || [],
      protections: pattern.protections || [],
      sources: pattern.sources || [],
      confidence_score: pattern.confidence_score || 50,
      is_ai_generated: false
    };
    
    const { data: result, error } = await supabase
      .from('case_intermediation_patterns')
      .insert(insertData)
      .select()
      .single();
    
    if (error) {
      toast.error(t('governance.errors.addFailed', 'Erreur lors de l\'ajout'));
      return null;
    }
    
    await fetchData();
    return result;
  };

  const updatePattern = async (id: string, updates: Partial<IntermediationPattern>) => {
    const { error } = await supabase
      .from('case_intermediation_patterns')
      .update(updates)
      .eq('id', id);
    
    if (!error) await fetchData();
    return !error;
  };

  const deletePattern = async (id: string) => {
    const { error } = await supabase
      .from('case_intermediation_patterns')
      .delete()
      .eq('id', id);
    
    if (!error) await fetchData();
    return !error;
  };

  const addPartner = async (partner: Partial<GovernancePartner>) => {
    const insertData = {
      case_id: caseId,
      partner_type: partner.partner_type || 'commercial_partner',
      description: partner.description,
      is_mandatory: partner.is_mandatory || false,
      risk_flags: partner.risk_flags || [],
      due_diligence_checklist: partner.due_diligence_checklist || [],
      notes: partner.notes,
      sources: partner.sources || [],
      confidence_score: partner.confidence_score || 50,
      is_ai_generated: false
    };
    
    const { data: result, error } = await supabase
      .from('case_governance_partners')
      .insert(insertData)
      .select()
      .single();
    
    if (!error) await fetchData();
    return error ? null : result;
  };

  const updatePartner = async (id: string, updates: Partial<GovernancePartner>) => {
    const { error } = await supabase
      .from('case_governance_partners')
      .update(updates)
      .eq('id', id);
    
    if (!error) await fetchData();
    return !error;
  };

  const deletePartner = async (id: string) => {
    const { error } = await supabase
      .from('case_governance_partners')
      .delete()
      .eq('id', id);
    
    if (!error) await fetchData();
    return !error;
  };

  const addDelay = async (delay: Partial<DelayReality>) => {
    const insertData = {
      case_id: caseId,
      process_name: delay.process_name || '',
      official_timeframe: delay.official_timeframe,
      optimistic_timeframe: delay.optimistic_timeframe,
      realistic_timeframe: delay.realistic_timeframe,
      pessimistic_timeframe: delay.pessimistic_timeframe,
      delay_risk_signals: delay.delay_risk_signals || [],
      cashflow_implications: delay.cashflow_implications,
      sources: delay.sources || [],
      confidence_score: delay.confidence_score || 50,
      is_ai_generated: false
    };
    
    const { data: result, error } = await supabase
      .from('case_delays_reality')
      .insert(insertData)
      .select()
      .single();
    
    if (!error) await fetchData();
    return error ? null : result;
  };

  const updateDelay = async (id: string, updates: Partial<DelayReality>) => {
    const { error } = await supabase
      .from('case_delays_reality')
      .update(updates)
      .eq('id', id);
    
    if (!error) await fetchData();
    return !error;
  };

  const deleteDelay = async (id: string) => {
    const { error } = await supabase
      .from('case_delays_reality')
      .delete()
      .eq('id', id);
    
    if (!error) await fetchData();
    return !error;
  };

  return {
    ...data,
    isLoading,
    isGenerating,
    generateIntel,
    clearAIData,
    refetch: fetchData,
    // CRUD
    addActor,
    updateActor,
    deleteActor,
    addPattern,
    updatePattern,
    deletePattern,
    addPartner,
    updatePartner,
    deletePartner,
    addDelay,
    updateDelay,
    deleteDelay,
  };
}