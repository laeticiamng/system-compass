import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface AiUsageData {
  id: string;
  user_id: string;
  period_start: string;
  period_end: string;
  ai_actions_count: number | null;
  ai_tokens_used: number | null;
  agent_runs_count: number | null;
  dossiers_created: number | null;
  dossier_items_added: number | null;
  exports_generated: number | null;
  total_case_units: number | null;
  quota_limit: number | null;
  alert_70_sent: boolean | null;
  alert_90_sent: boolean | null;
  alert_100_sent: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface AiActivityEntry {
  id: string;
  action_type: string;
  module: string;
  status: string;
  user_decision: string | null;
  tokens_used: number | null;
  processing_time_ms: number | null;
  created_at: string;
}

export function useAiUsage() {
  const { user } = useAuth();
  const [usage, setUsage] = useState<AiUsageData | null>(null);
  const [activityLog, setActivityLog] = useState<AiActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsage = useCallback(async () => {
    if (!user) {
      setUsage(null);
      setActivityLog([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Fetch current period usage
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

      const { data: usageData } = await supabase
        .from('ai_usage_metering')
        .select('*')
        .eq('user_id', user.id)
        .gte('period_start', startOfMonth)
        .lte('period_end', endOfMonth)
        .maybeSingle();

      setUsage(usageData as AiUsageData | null);

      // Fetch recent activity log
      const { data: logData } = await supabase
        .from('ai_activity_log')
        .select('id, action_type, module, status, user_decision, tokens_used, processing_time_ms, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      setActivityLog((logData || []) as AiActivityEntry[]);
    } catch (err) {
      console.error('Error fetching AI usage:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  // Calculate usage percentages
  const usagePercentage = usage?.quota_limit && usage?.total_case_units
    ? Math.round((usage.total_case_units / usage.quota_limit) * 100)
    : 0;

  const isNearLimit = usagePercentage >= 70;
  const isAtLimit = usagePercentage >= 100;

  // Get usage stats
  const stats = {
    aiActions: usage?.ai_actions_count || 0,
    tokensUsed: usage?.ai_tokens_used || 0,
    agentRuns: usage?.agent_runs_count || 0,
    dossiers: usage?.dossiers_created || 0,
    exports: usage?.exports_generated || 0,
    caseUnits: usage?.total_case_units || 0,
    quotaLimit: usage?.quota_limit || 100,
  };

  return {
    usage,
    activityLog,
    loading,
    usagePercentage,
    isNearLimit,
    isAtLimit,
    stats,
    refetch: fetchUsage,
    isLoggedIn: !!user,
  };
}
