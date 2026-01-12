import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Brain, 
  FileText, 
  Download,
  TrendingUp,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { useAiUsage } from '@/hooks/useAiUsage';
import { cn } from '@/lib/utils';

interface AiUsageStatsProps {
  compact?: boolean;
  showActivity?: boolean;
}

export function AiUsageStats({ compact = false, showActivity = false }: AiUsageStatsProps) {
  const { t } = useTranslation();
  const { 
    stats, 
    usagePercentage, 
    isNearLimit, 
    isAtLimit, 
    activityLog,
    loading,
    isLoggedIn
  } = useAiUsage();

  // Don't render if not logged in
  if (!isLoggedIn) {
    return null;
  }

  // Show empty state message if no usage data yet
  const hasNoUsage = !stats.aiActions && !stats.tokensUsed && !stats.dossiers && !stats.exports;

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-24 bg-muted rounded-lg" />
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
        <Brain className="w-5 h-5 text-primary" />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">
              {t('ai.usage.credits', 'Crédits AI')}
            </span>
            <span className={cn(
              "text-sm font-bold",
              isAtLimit && "text-red-500",
              isNearLimit && !isAtLimit && "text-amber-500"
            )}>
              {stats.caseUnits}/{stats.quotaLimit}
            </span>
          </div>
          <Progress 
            value={usagePercentage} 
            className={cn(
              "h-2",
              isAtLimit && "[&>div]:bg-red-500",
              isNearLimit && !isAtLimit && "[&>div]:bg-amber-500"
            )}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Usage Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              {t('ai.usage.title', 'Utilisation AI')}
            </div>
            {hasNoUsage && (
              <Badge variant="secondary" className="gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {t('ai.usage.ready', 'Prêt à utiliser')}
              </Badge>
            )}
            {!hasNoUsage && isAtLimit && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="w-3 h-3" />
                {t('ai.usage.limitReached', 'Limite atteinte')}
              </Badge>
            )}
            {!hasNoUsage && isNearLimit && !isAtLimit && (
              <Badge variant="secondary" className="gap-1 text-amber-600 border-amber-500/30">
                <TrendingUp className="w-3 h-3" />
                {t('ai.usage.nearLimit', 'Proche de la limite')}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Empty state message */}
          {hasNoUsage && (
            <div className="text-center py-4 text-muted-foreground">
              <Brain className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">{t('ai.usage.noUsageYet', "Vous n'avez pas encore utilisé les fonctionnalités AI.")}</p>
              <p className="text-xs mt-1">{t('ai.usage.startUsing', 'Commencez à utiliser les outils AI pour voir vos statistiques.')}</p>
            </div>
          )}
          
          {/* Progress bar - only show if has usage */}
          {!hasNoUsage && (
            <>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    {t('ai.usage.period', 'Période actuelle')}
                  </span>
                  <span className="text-sm font-medium">
                    {stats.caseUnits} / {stats.quotaLimit} {t('ai.usage.units', 'unités')}
                  </span>
                </div>
                <Progress 
                  value={usagePercentage} 
                  className={cn(
                    "h-3",
                    isAtLimit && "[&>div]:bg-red-500",
                    isNearLimit && !isAtLimit && "[&>div]:bg-amber-500"
                  )}
                />
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  {usagePercentage}% {t('ai.usage.used', 'utilisé')}
                </p>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatItem 
                  icon={<Zap className="w-4 h-4" />}
                  label={t('ai.usage.actions', 'Actions AI')}
                  value={stats.aiActions}
                />
                <StatItem 
                  icon={<Brain className="w-4 h-4" />}
                  label={t('ai.usage.tokens', 'Tokens')}
                  value={stats.tokensUsed.toLocaleString()}
                />
                <StatItem 
                  icon={<FileText className="w-4 h-4" />}
                  label={t('ai.usage.dossiers', 'Dossiers')}
                  value={stats.dossiers}
                />
                <StatItem 
                  icon={<Download className="w-4 h-4" />}
                  label={t('ai.usage.exports', 'Exports')}
                  value={stats.exports}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Activity Log */}
      {showActivity && activityLog.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              {t('ai.activity.title', 'Activité récente')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {activityLog.slice(0, 10).map((entry) => (
                <div 
                  key={entry.id}
                  className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 text-sm"
                >
                  <div className={cn(
                    "p-1.5 rounded-full",
                    entry.status === 'completed' && "bg-green-500/20 text-green-600",
                    entry.status === 'error' && "bg-red-500/20 text-red-600",
                    entry.status === 'pending' && "bg-amber-500/20 text-amber-600"
                  )}>
                    {entry.status === 'completed' ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : entry.status === 'error' ? (
                      <AlertTriangle className="w-3 h-3" />
                    ) : (
                      <Zap className="w-3 h-3" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{entry.action_type}</p>
                    <p className="text-xs text-muted-foreground">
                      {entry.module} • {entry.tokens_used || 0} tokens
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(entry.created_at).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatItem({ 
  icon, 
  label, 
  value 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string | number;
}) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
      <div className="text-muted-foreground">{icon}</div>
      <div>
        <p className="text-lg font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
