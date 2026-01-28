import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, RefreshCw, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';

interface DataSource {
  name: string;
  lastUpdated: Date;
  reliability: 'official' | 'verified' | 'community' | 'ai_generated';
}

interface DataFreshnessIndicatorProps {
  countryName?: string;
  lastUpdated?: Date;
  dataVersion?: number;
  sources?: DataSource[];
  compact?: boolean;
}

export function DataFreshnessIndicator({
  countryName: _countryName,
  lastUpdated = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Default 7 days ago
  dataVersion = 1,
  sources,
  compact = false
}: DataFreshnessIndicatorProps) {
  const { t } = useTranslation();
  void _countryName; // Reserved for future use

  const freshnessAnalysis = useMemo(() => {
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24));
    
    let status: 'fresh' | 'recent' | 'stale' | 'outdated';
    let score: number;
    let color: string;
    let Icon: typeof CheckCircle2;

    if (diffDays <= 7) {
      status = 'fresh';
      score = 100;
      color = 'text-green-500';
      Icon = CheckCircle2;
    } else if (diffDays <= 30) {
      status = 'recent';
      score = 80 - (diffDays - 7) * 2;
      color = 'text-blue-500';
      Icon = Clock;
    } else if (diffDays <= 90) {
      status = 'stale';
      score = 50 - (diffDays - 30);
      color = 'text-amber-500';
      Icon = AlertTriangle;
    } else {
      status = 'outdated';
      score = Math.max(10, 20 - (diffDays - 90) / 10);
      color = 'text-red-500';
      Icon = XCircle;
    }

    return { status, score, color, Icon, diffDays };
  }, [lastUpdated]);

  const statusLabels = {
    fresh: t('country.freshness.fresh', 'Données à jour'),
    recent: t('country.freshness.recent', 'Données récentes'),
    stale: t('country.freshness.stale', 'Données vieillissantes'),
    outdated: t('country.freshness.outdated', 'Données obsolètes')
  };

  // Reserved for future tooltip display
  void {
    official: t('country.freshness.official', 'Source officielle'),
    verified: t('country.freshness.verified', 'Vérifié'),
    community: t('country.freshness.community', 'Communauté'),
    ai_generated: t('country.freshness.aiGenerated', 'Généré par IA')
  };

  const reliabilityColors = {
    official: 'bg-green-500/10 text-green-700 border-green-500/30',
    verified: 'bg-blue-500/10 text-blue-700 border-blue-500/30',
    community: 'bg-purple-500/10 text-purple-700 border-purple-500/30',
    ai_generated: 'bg-amber-500/10 text-amber-700 border-amber-500/30'
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const { Icon, color, status, score, diffDays } = freshnessAnalysis;

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`flex items-center gap-1.5 cursor-help ${color}`}>
              <Icon className="w-4 h-4" />
              <span className="text-xs">{score}%</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-medium">{statusLabels[status]}</p>
            <p className="text-xs text-muted-foreground">
              {t('country.freshness.lastUpdate', 'Dernière mise à jour')}: {formatDate(lastUpdated)}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Card>
      <CardContent className="pt-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className={`w-5 h-5 ${color}`} />
            <span className="font-medium">{statusLabels[status]}</span>
          </div>
          <Badge variant="outline">v{dataVersion}</Badge>
        </div>

        {/* Freshness Score */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {t('country.freshness.score', 'Score de fraîcheur')}
            </span>
            <span className="font-medium">{Math.round(score)}%</span>
          </div>
          <Progress value={score} className="h-2" />
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="p-2 rounded bg-muted/50">
            <p className="text-muted-foreground text-xs">
              {t('country.freshness.lastUpdate', 'Dernière MAJ')}
            </p>
            <p className="font-medium">{formatDate(lastUpdated)}</p>
          </div>
          <div className="p-2 rounded bg-muted/50">
            <p className="text-muted-foreground text-xs">
              {t('country.freshness.age', 'Âge des données')}
            </p>
            <p className="font-medium">
              {diffDays} {t('common.days', 'jours')}
            </p>
          </div>
        </div>

        {/* Sources */}
        {sources && sources.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">{t('country.freshness.sources', 'Sources')}</p>
            <div className="flex flex-wrap gap-2">
              {sources.map((source, i) => (
                <Badge 
                  key={i} 
                  variant="outline" 
                  className={reliabilityColors[source.reliability]}
                >
                  {source.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Refresh indicator */}
        <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <RefreshCw className="w-3 h-3" />
            {t('country.freshness.autoRefresh', 'Actualisation automatique')}
          </span>
          <span>{t('country.freshness.monthly', 'Mensuelle')}</span>
        </div>
      </CardContent>
    </Card>
  );
}
