import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  BarChart3, 
  Zap, 
  FileText, 
  Bot, 
  Download,
  AlertTriangle,
  CheckCircle,
  Loader2,
  TrendingUp,
  Clock,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAiUsage } from '@/hooks/useAiUsage';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { cn } from '@/lib/utils';

export default function Usage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { tier } = useSubscription();
  const { 
    usage, 
    activityLog, 
    loading, 
    usagePercentage, 
    isNearLimit, 
    isAtLimit, 
    stats 
  } = useAiUsage();
  
  const currentLocale = i18n.language;

  if (!user) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">{t('usage.loginRequired', 'Connexion requise')}</h1>
          <p className="text-muted-foreground mb-6">
            {t('usage.loginDescription', 'Connectez-vous pour voir votre consommation.')}
          </p>
          <Link to="/auth">
            <Button>{t('auth.login', 'Se connecter')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4" />
            {t('common.back', 'Retour')}
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold">
                {t('usage.title', 'Consommation')}
              </h1>
              <p className="text-muted-foreground">
                {t('usage.subtitle', 'Suivi de votre utilisation IA et ressources')}
              </p>
            </div>
          </div>
        </div>

        {/* Alert Banner */}
        {isNearLimit && !isAtLimit && (
          <div className="mb-6 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <div>
                <p className="font-medium text-amber-700">
                  {t('usage.nearLimit', 'Vous approchez de votre limite')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t('usage.nearLimitDesc', 'Vous avez utilisé {percent}% de votre quota mensuel.', { percent: usagePercentage })}
                </p>
              </div>
              <Link to="/pricing" className="ml-auto">
                <Button size="sm" variant="outline">
                  {t('usage.upgrade', 'Augmenter')}
                </Button>
              </Link>
            </div>
          </div>
        )}

        {isAtLimit && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/30">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <div>
                <p className="font-medium text-destructive">
                  {t('usage.atLimit', 'Limite atteinte')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t('usage.atLimitDesc', 'Les actions IA sont temporairement bloquées. Rechargez votre compte.')}
                </p>
              </div>
              <Link to="/pricing" className="ml-auto">
                <Button size="sm">
                  {t('usage.topUp', 'Recharger')}
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Main Usage Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              {t('usage.currentPeriod', 'Période en cours')}
            </CardTitle>
            <CardDescription>
              {usage?.period_start 
                ? `${new Date(usage.period_start).toLocaleDateString('fr-FR')} - ${new Date(usage.period_end).toLocaleDateString('fr-FR')}`
                : t('usage.noData', 'Aucune donnée')
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  {t('usage.caseUnits', 'Unités Case')}
                </span>
                <span className="text-sm text-muted-foreground">
                  {stats.caseUnits} / {stats.quotaLimit}
                </span>
              </div>
              <Progress 
                value={usagePercentage} 
                className={cn(
                  "h-3",
                  isAtLimit && "[&>div]:bg-destructive",
                  isNearLimit && !isAtLimit && "[&>div]:bg-amber-500"
                )}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                icon={<Zap className="w-4 h-4" />}
                label={t('usage.aiActions', 'Actions IA')}
                value={stats.aiActions}
              />
              <StatCard
                icon={<Bot className="w-4 h-4" />}
                label={t('usage.agentRuns', 'Agents exécutés')}
                value={stats.agentRuns}
              />
              <StatCard
                icon={<FileText className="w-4 h-4" />}
                label={t('usage.dossiers', 'Dossiers')}
                value={stats.dossiers}
              />
              <StatCard
                icon={<Download className="w-4 h-4" />}
                label={t('usage.exports', 'Exports')}
                value={stats.exports}
              />
            </div>

            <Separator className="my-6" />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{t('usage.tokensUsed', 'Tokens utilisés')}</p>
                <p className="text-2xl font-bold">{stats.tokensUsed.toLocaleString()}</p>
              </div>
              <Badge variant={tier === 'pro' ? 'default' : tier === 'premium' ? 'secondary' : 'outline'}>
                {tier.toUpperCase()}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Activity Log */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              {t('usage.activityLog', 'Historique d\'activité')}
            </CardTitle>
            <CardDescription>
              {t('usage.activityLogDesc', 'Vos 50 dernières actions IA')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activityLog.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {t('usage.noActivity', 'Aucune activité IA enregistrée')}
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {activityLog.map((entry) => (
                    <div 
                      key={entry.id} 
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-full",
                          entry.status === 'completed' ? "bg-green-500/10" : "bg-muted"
                        )}>
                          {entry.status === 'completed' 
                            ? <CheckCircle className="w-4 h-4 text-green-500" />
                            : <Zap className="w-4 h-4 text-muted-foreground" />
                          }
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {formatActionType(entry.action_type, t)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {entry.module} • {formatDate(entry.created_at, currentLocale)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {entry.user_decision && (
                          <Badge variant={
                            entry.user_decision === 'accepted' ? 'default' :
                            entry.user_decision === 'rejected' ? 'destructive' : 'secondary'
                          } className="text-xs">
                            {entry.user_decision}
                          </Badge>
                        )}
                        {entry.tokens_used && (
                          <span className="text-xs text-muted-foreground">
                            {entry.tokens_used} tokens
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="p-4 rounded-lg bg-muted/30">
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function formatActionType(type: string, t: (key: string, fallback: string) => string): string {
  const map: Record<string, string> = {
    'clarify-objective': t('usage.actions.clarifyObjective', 'Clarification objectif'),
    'propose-trajectories': t('usage.actions.proposeTrajectories', 'Proposition trajectoires'),
    'generate-checklist': t('usage.actions.generateChecklist', 'Génération checklist'),
    'generate-synthesis': t('usage.actions.generateSynthesis', 'Synthèse exportable'),
    'compare-countries': t('usage.actions.compareCountries', 'Comparaison pays'),
    'summarize-country': t('usage.actions.summarizeCountry', 'Résumé pays'),
    'identify-risks': t('usage.actions.identifyRisks', 'Identification risques'),
    'suggest-next-step': t('usage.actions.suggestNextStep', 'Prochain pas'),
    'plan-timeline': t('usage.actions.planTimeline', 'Planification'),
    'suggest-reminders': t('usage.actions.suggestReminders', 'Rappels suggérés'),
    'build-report': t('usage.actions.buildReport', 'Rapport B2B'),
  };
  return map[type] || type;
}

function formatDate(dateStr: string, locale: string): string {
  const localeMap: Record<string, string> = {
    'fr': 'fr-FR',
    'en': 'en-US',
    'de': 'de-DE',
    'es': 'es-ES',
    'it': 'it-IT',
    'nl': 'nl-NL',
    'pt': 'pt-PT',
  };
  return new Date(dateStr).toLocaleString(localeMap[locale] || 'fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}
