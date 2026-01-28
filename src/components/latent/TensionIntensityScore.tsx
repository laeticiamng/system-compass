// Tension Intensity Scoring Component for Latent Module
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  AlertTriangle,
  Clock,
  Eye,
  Zap
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { differenceInDays } from 'date-fns';

interface TensionFactor {
  id: string;
  name: string;
  weight: number;
  score: number;
  trend: 'up' | 'down' | 'stable';
  lastUpdated: Date;
}

interface TensionIntensityScoreProps {
  zoneName: string;
  factors?: TensionFactor[];
  onFactorClick?: (factorId: string) => void;
}

export function TensionIntensityScore({
  zoneName,
  factors: externalFactors,
  onFactorClick
}: TensionIntensityScoreProps) {
  const { t } = useTranslation();

  // Default factors if none provided
  const defaultFactors: TensionFactor[] = [
    {
      id: 'frequency',
      name: t('latent.factors.frequency', 'Fréquence des signaux'),
      weight: 25,
      score: 70,
      trend: 'up',
      lastUpdated: new Date(Date.now() - 86400000),
    },
    {
      id: 'intensity',
      name: t('latent.factors.intensity', 'Intensité émotionnelle'),
      weight: 30,
      score: 55,
      trend: 'stable',
      lastUpdated: new Date(Date.now() - 172800000),
    },
    {
      id: 'spread',
      name: t('latent.factors.spread', 'Propagation'),
      weight: 20,
      score: 40,
      trend: 'down',
      lastUpdated: new Date(Date.now() - 259200000),
    },
    {
      id: 'stakeholders',
      name: t('latent.factors.stakeholders', 'Parties prenantes impactées'),
      weight: 15,
      score: 65,
      trend: 'up',
      lastUpdated: new Date(Date.now() - 86400000 * 5),
    },
    {
      id: 'reversibility',
      name: t('latent.factors.reversibility', 'Irréversibilité potentielle'),
      weight: 10,
      score: 80,
      trend: 'up',
      lastUpdated: new Date(Date.now() - 3600000),
    },
  ];

  const factors = externalFactors || defaultFactors;

  // Calculate weighted score
  const overallScore = useMemo(() => {
    const totalWeight = factors.reduce((sum, f) => sum + f.weight, 0);
    const weightedSum = factors.reduce((sum, f) => sum + (f.score * f.weight), 0);
    return Math.round(weightedSum / totalWeight);
  }, [factors]);

  // Determine risk level
  const riskLevel = useMemo(() => {
    if (overallScore >= 80) return { label: t('latent.risk.critical', 'Critique'), color: 'bg-red-500', textColor: 'text-red-500' };
    if (overallScore >= 60) return { label: t('latent.risk.high', 'Élevé'), color: 'bg-orange-500', textColor: 'text-orange-500' };
    if (overallScore >= 40) return { label: t('latent.risk.medium', 'Modéré'), color: 'bg-yellow-500', textColor: 'text-yellow-500' };
    if (overallScore >= 20) return { label: t('latent.risk.low', 'Faible'), color: 'bg-green-500', textColor: 'text-green-500' };
    return { label: t('latent.risk.minimal', 'Minimal'), color: 'bg-blue-500', textColor: 'text-blue-500' };
  }, [overallScore, t]);

  // Check for trend alerts
  const trendAlerts = useMemo(() => {
    return factors.filter(f => f.trend === 'up' && f.score >= 60);
  }, [factors]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-green-500" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-500';
    if (score >= 60) return 'text-orange-500';
    if (score >= 40) return 'text-yellow-600';
    return 'text-green-500';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            {t('latent.intensityScore.title', 'Score d\'Intensité')}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{zoneName}</p>
        </div>
        <div className="text-right">
          <div className={`text-3xl font-bold ${riskLevel.textColor}`}>
            {overallScore}/100
          </div>
          <Badge className={riskLevel.color}>{riskLevel.label}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Trend Alerts */}
        {trendAlerts.length > 0 && (
          <div className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-orange-500 shrink-0" />
            <div className="text-sm">
              <span className="font-medium text-orange-700 dark:text-orange-400">
                {t('latent.intensityScore.trendAlert', 'Tendance haussière')}:
              </span>
              <span className="ml-1 text-orange-600 dark:text-orange-300">
                {trendAlerts.map(f => f.name).join(', ')}
              </span>
            </div>
          </div>
        )}

        {/* Main Progress */}
        <div className="space-y-2">
          <Progress value={overallScore} className="h-4" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{t('latent.intensityScore.minimal', 'Minimal')}</span>
            <span>{t('latent.intensityScore.critical', 'Critique')}</span>
          </div>
        </div>

        {/* Factor Breakdown */}
        <div className="space-y-3 pt-4 border-t">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Eye className="h-4 w-4" />
            {t('latent.intensityScore.factors', 'Facteurs contributifs')}
          </h4>
          
          {factors.map((factor) => (
            <TooltipProvider key={factor.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className="space-y-1 cursor-pointer hover:bg-accent/50 p-2 rounded-lg transition-colors"
                    onClick={() => onFactorClick?.(factor.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{factor.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {factor.weight}%
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${getScoreColor(factor.score)}`}>
                          {factor.score}
                        </span>
                        {getTrendIcon(factor.trend)}
                      </div>
                    </div>
                    <Progress value={factor.score} className="h-1.5" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1">
                    <p className="font-medium">{factor.name}</p>
                    <p className="text-xs flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Mis à jour il y a {differenceInDays(new Date(), factor.lastUpdated)} jours
                    </p>
                    <p className="text-xs flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      Contribution: {Math.round((factor.score * factor.weight) / 100)}%
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>

        {/* Recommendation */}
        <div className="pt-4 border-t">
          <div className="flex items-start gap-2 text-sm">
            <Zap className={`h-4 w-4 mt-0.5 shrink-0 ${riskLevel.textColor}`} />
            <p className="text-muted-foreground">
              {overallScore >= 70 
                ? t('latent.intensityScore.recommendHigh', 'Action immédiate recommandée. Envisagez une escalade vers TraceOS.')
                : overallScore >= 40
                ? t('latent.intensityScore.recommendMedium', 'Surveillance active requise. Documentez les signaux observés.')
                : t('latent.intensityScore.recommendLow', 'Situation stable. Continuez la veille périodique.')
              }
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
