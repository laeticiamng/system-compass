import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export type ThresholdDomain = 'strategic' | 'financial' | 'organizational' | 'legal' | 'ethical';
export type ThresholdNature = 'resource_commitment' | 'contractual' | 'reputational' | 'structural' | 'temporal';
export type DetectionSource = 'compass_analysis' | 'manual' | 'external_signal';
export type ValidatorRole = 'ceo' | 'board' | 'founder' | 'director' | 'comex';
export type ThresholdStatus = 'detected' | 'marked' | 'validated' | 'sealed';

export interface IrreversaThreshold {
  id: string;
  user_id: string;
  organization_name: string | null;
  title: string;
  context: string;
  domain: ThresholdDomain;
  detection_date: string;
  detection_source: DetectionSource;
  compass_country_id: string | null;
  threshold_nature: ThresholdNature;
  irreversibility_reason: string;
  alternatives_before: string[];
  validated_by: string;
  validator_role: ValidatorRole;
  validation_date: string | null;
  validation_statement: string | null;
  status: ThresholdStatus;
  sealed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface IrreversaWitness {
  id: string;
  threshold_id: string;
  witness_name: string;
  witness_role: string;
  witness_statement: string | null;
  witnessed_at: string;
  signature_hash: string | null;
}

export interface IrreversaAuditEntry {
  id: string;
  threshold_id: string;
  action: string;
  actor_name: string;
  actor_role: string;
  details: Record<string, unknown>;
  created_at: string;
}

export function useIrreversa() {
  const { user } = useAuth();
  const [thresholds, setThresholds] = useState<IrreversaThreshold[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isLoggedIn = !!user;

  const fetchThresholds = useCallback(async () => {
    if (!user) {
      setThresholds([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('irreversa_thresholds')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setThresholds((data || []) as unknown as IrreversaThreshold[]);
      setError(null);
    } catch (err) {
      setError('Failed to fetch thresholds');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchThresholds();
  }, [fetchThresholds]);

  const createThreshold = async (data: {
    title: string;
    context: string;
    domain: ThresholdDomain;
    detection_source: DetectionSource;
    threshold_nature: ThresholdNature;
    irreversibility_reason: string;
    alternatives_before: string[];
    validated_by: string;
    validator_role: ValidatorRole;
    organization_name?: string;
    compass_country_id?: string;
  }): Promise<IrreversaThreshold | null> => {
    if (!user) return null;

    try {
      const { data: threshold, error } = await supabase
        .from('irreversa_thresholds')
        .insert({
          user_id: user.id,
          ...data,
          status: 'detected'
        })
        .select()
        .single();

      if (error) throw error;

      // Create audit entry
      await supabase.from('irreversa_audit_log').insert({
        threshold_id: threshold.id,
        action: 'created',
        actor_name: data.validated_by,
        actor_role: data.validator_role,
        details: { title: data.title, domain: data.domain }
      });

      const newThreshold = threshold as unknown as IrreversaThreshold;
      setThresholds(prev => [newThreshold, ...prev]);
      return newThreshold;
    } catch (err) {
      toast.error('Erreur lors de la création du seuil');
      return null;
    }
  };

  const markThreshold = async (
    thresholdId: string, 
    actorName: string, 
    actorRole: string
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('irreversa_thresholds')
        .update({ status: 'marked', updated_at: new Date().toISOString() })
        .eq('id', thresholdId)
        .eq('status', 'detected');

      if (error) throw error;

      await supabase.from('irreversa_audit_log').insert({
        threshold_id: thresholdId,
        action: 'marked',
        actor_name: actorName,
        actor_role: actorRole,
        details: { marked_at: new Date().toISOString() }
      });

      setThresholds(prev => prev.map(t => 
        t.id === thresholdId ? { ...t, status: 'marked' as ThresholdStatus } : t
      ));
      return true;
    } catch (err) {
      toast.error('Erreur lors du marquage');
      return false;
    }
  };

  const addWitness = async (
    thresholdId: string,
    witnessName: string,
    witnessRole: string,
    witnessStatement?: string
  ): Promise<IrreversaWitness | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('irreversa_witnesses')
        .insert({
          threshold_id: thresholdId,
          witness_name: witnessName,
          witness_role: witnessRole,
          witness_statement: witnessStatement
        })
        .select()
        .single();

      if (error) throw error;

      await supabase.from('irreversa_audit_log').insert({
        threshold_id: thresholdId,
        action: 'witness_added',
        actor_name: witnessName,
        actor_role: witnessRole,
        details: { witness_statement: witnessStatement }
      });

      return data as unknown as IrreversaWitness;
    } catch (err) {
      toast.error('Erreur lors de l\'ajout du témoin');
      return null;
    }
  };

  const validateThreshold = async (
    thresholdId: string,
    validatorName: string,
    validatorRole: ValidatorRole,
    validationStatement: string
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('irreversa_thresholds')
        .update({ 
          status: 'validated',
          validation_date: new Date().toISOString(),
          validation_statement: validationStatement,
          updated_at: new Date().toISOString()
        })
        .eq('id', thresholdId)
        .eq('status', 'marked');

      if (error) throw error;

      await supabase.from('irreversa_audit_log').insert({
        threshold_id: thresholdId,
        action: 'validated',
        actor_name: validatorName,
        actor_role: validatorRole,
        details: { validation_statement: validationStatement }
      });

      setThresholds(prev => prev.map(t => 
        t.id === thresholdId ? { 
          ...t, 
          status: 'validated' as ThresholdStatus,
          validation_date: new Date().toISOString(),
          validation_statement: validationStatement
        } : t
      ));
      return true;
    } catch (err) {
      toast.error('Erreur lors de la validation');
      return false;
    }
  };

  const sealThreshold = async (
    thresholdId: string,
    actorName: string,
    actorRole: string
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const sealedAt = new Date().toISOString();
      const { error } = await supabase
        .from('irreversa_thresholds')
        .update({ 
          status: 'sealed',
          sealed_at: sealedAt,
          updated_at: sealedAt
        })
        .eq('id', thresholdId)
        .eq('status', 'validated');

      if (error) throw error;

      await supabase.from('irreversa_audit_log').insert({
        threshold_id: thresholdId,
        action: 'sealed',
        actor_name: actorName,
        actor_role: actorRole,
        details: { sealed_at: sealedAt, finality: 'IRREVERSIBLE' }
      });

      setThresholds(prev => prev.map(t => 
        t.id === thresholdId ? { 
          ...t, 
          status: 'sealed' as ThresholdStatus,
          sealed_at: sealedAt
        } : t
      ));
      return true;
    } catch (err) {
      toast.error('Erreur lors du scellement');
      return false;
    }
  };

  const getWitnesses = async (thresholdId: string): Promise<IrreversaWitness[]> => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('irreversa_witnesses')
        .select('*')
        .eq('threshold_id', thresholdId)
        .order('witnessed_at', { ascending: true });

      if (error) throw error;
      return (data || []) as unknown as IrreversaWitness[];
    } catch (err) {
      return [];
    }
  };

  const getAuditLog = async (thresholdId: string): Promise<IrreversaAuditEntry[]> => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('irreversa_audit_log')
        .select('*')
        .eq('threshold_id', thresholdId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data || []) as unknown as IrreversaAuditEntry[];
    } catch (err) {
      return [];
    }
  };

  return {
    thresholds,
    loading,
    error,
    isLoggedIn,
    createThreshold,
    markThreshold,
    addWitness,
    validateThreshold,
    sealThreshold,
    getWitnesses,
    getAuditLog,
    refetch: fetchThresholds
  };
}
