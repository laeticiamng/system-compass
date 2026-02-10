import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Lock, Zap, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FinancialIntelQuotaProps {
  onQuotaExceeded?: () => void;
  className?: string;
}

export function FinancialIntelQuota({ className }: FinancialIntelQuotaProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { tier } = useSubscription();
  const [usageCount, setUsageCount] = useState(0);

  const FREE_QUOTA = 1;
  const PRO_QUOTA = 50;
  const maxQuota = tier === 'premium' ? PRO_QUOTA : FREE_QUOTA;
  const isPro = tier === 'premium';

  useEffect(() => {
    const fetchUsage = async () => {
      if (!user) return;

      try {
        // Get current month's generation runs
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { count, error } = await supabase
          .from('financial_intel_generation_runs')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', startOfMonth.toISOString())
          .eq('status', 'completed');

        if (error) throw error;
        setUsageCount(count || 0);
      } catch (error) {
        console.error('Error fetching usage:', error);
      }
    };

    fetchUsage();
  }, [user]);

  const quotaExceeded = usageCount >= maxQuota;
  const usagePercentage = Math.min((usageCount / maxQuota) * 100, 100);

  if (!user) {
    return (
      <Alert className="bg-muted/50 border-muted">
        <Lock className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span className="text-sm">
            {t('financialIntel.loginRequired', 'Connectez-vous pour générer des rapports')}
          </span>
          <Button asChild size="sm" variant="outline">
            <Link to="/auth">{t('auth.login', 'Connexion')}</Link>
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (quotaExceeded && !isPro) {
    return (
      <Alert className="bg-amber-500/10 border-amber-500/30">
        <Crown className="h-4 w-4 text-amber-400" />
        <AlertDescription className="space-y-2">
          <p className="text-sm text-amber-200">
            {t('financialIntel.quotaExceeded', 'Quota mensuel atteint ({{used}}/{{max}})', { used: usageCount, max: maxQuota })}
          </p>
          <div className="flex items-center gap-2">
            <Progress value={100} className="flex-1 h-2" />
            <Button asChild size="sm" className="gap-1">
              <Link to="/pricing">
                <Zap className="h-3 w-3" />
                {t('pricing.upgrade', 'Passer Pro')}
              </Link>
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`flex items-center gap-3 p-3 bg-muted/30 rounded-lg ${className || ''}`}>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground">
            {t('financialIntel.monthlyUsage', 'Utilisation mensuelle')}
          </span>
          <span className="text-xs font-medium">
            {usageCount}/{maxQuota}
          </span>
        </div>
        <Progress value={usagePercentage} className="h-1.5" />
      </div>
      {isPro && (
        <Crown className="h-4 w-4 text-amber-400" />
      )}
    </div>
  );
}

export function useFinancialIntelQuota() {
  const { user } = useAuth();
  const { tier } = useSubscription();
  const [usageCount, setUsageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const FREE_QUOTA = 1;
  const PRO_QUOTA = 50;
  const maxQuota = tier === 'premium' ? PRO_QUOTA : FREE_QUOTA;
  const isPro = tier === 'premium';

  useEffect(() => {
    const fetchUsage = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { count, error } = await supabase
          .from('financial_intel_generation_runs')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', startOfMonth.toISOString())
          .eq('status', 'completed');

        if (error) throw error;
        setUsageCount(count || 0);
      } catch (error) {
        console.error('Error fetching usage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsage();
  }, [user]);

  const quotaExceeded = usageCount >= maxQuota;
  const remaining = Math.max(0, maxQuota - usageCount);

  return {
    usageCount,
    maxQuota,
    remaining,
    quotaExceeded,
    isPro,
    isLoading
  };
}
