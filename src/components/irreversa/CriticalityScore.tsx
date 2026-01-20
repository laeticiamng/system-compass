import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Gauge,
  AlertTriangle,
  Clock,
  Users,
  Zap,
  Shield,
  TrendingUp,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ThresholdStatus } from '@/hooks/useIrreversa';

interface Threshold {
  id: string;
  title: string;
  status: ThresholdStatus;
  threshold_nature: string;
  domain: string;
  detection_date: string;
  validated_by?: string;
  alternatives_before?: string[];
  irreversibility_reason?: string;
}

interface CriticalityScoreProps {
  threshold: Threshold;
}

interface ScoreFactor {
  id: string;
  label: string;
  icon: typeof Gauge;
  score: number; // 0-20
  maxScore: number;
  reasoning: string;
}

export function CriticalityScore({ threshold }: CriticalityScoreProps) {
  const { t } = useTranslation();

  // Calculate criticality factors
  const factors = useMemo<ScoreFactor[]>(() => {
    const result: ScoreFactor[] = [];

    // Factor 1: Nature of threshold (strategic = higher)
    const natureScores: Record<string, number> = {
      strategic: 20,
      organizational: 15,
      operational: 10,
      personal: 8,
    };
    result.push({
      id: 'nature',
      label: t('irreversa.criticality.nature', 'Nature du seuil'),
      icon: Shield,
      score: natureScores[threshold.threshold_nature] || 10,
      maxScore: 20,
      reasoning: t(`irreversa.criticality.nature.${threshold.threshold_nature}`, threshold.threshold_nature),
    });

    // Factor 2: Status progression (sealed = highest impact)
    const statusScores: Record<ThresholdStatus, number> = {
      detected: 5,
      marked: 10,
      validated: 15,
      sealed: 20,
    };
    result.push({
      id: 'status',
      label: t('irreversa.criticality.status', 'Niveau de validation'),
      icon: TrendingUp,
      score: statusScores[threshold.status],
      maxScore: 20,
      reasoning: t(`irreversa.status.${threshold.status}`),
    });

    // Factor 3: Time since detection (longer = more critical if unresolved)
    const daysSinceDetection = Math.floor(
      (Date.now() - new Date(threshold.detection_date).getTime()) / (1000 * 60 * 60 * 24)
    );
    const timeScore = threshold.status === 'sealed' 
      ? 10 // Sealed thresholds have fixed time criticality
      : Math.min(20, Math.floor(daysSinceDetection / 7) * 5);
    result.push({
      id: 'time',
      label: t('irreversa.criticality.time', 'Ancienneté'),
      icon: Clock,
      score: timeScore,
      maxScore: 20,
      reasoning: `${daysSinceDetection} ${t('common.days', 'jours')}`,
    });

    // Factor 4: Domain impact
    const domainScores: Record<string, number> = {
      finance: 18,
      hr: 16,
      operations: 14,
      legal: 17,
      strategy: 19,
      technology: 12,
      external: 15,
    };
    result.push({
      id: 'domain',
      label: t('irreversa.criticality.domain', 'Domaine impacté'),
      icon: Zap,
      score: domainScores[threshold.domain] || 12,
      maxScore: 20,
      reasoning: t(`irreversa.domain.${threshold.domain}`, threshold.domain),
    });

    // Factor 5: Alternatives exhausted
    const alternativesCount = (threshold.alternatives_before || []).length;
    const alternativesScore = alternativesCount === 0 ? 20 : Math.max(5, 20 - alternativesCount * 3);
    result.push({
      id: 'alternatives',
      label: t('irreversa.criticality.alternatives', 'Alternatives épuisées'),
      icon: FileText,
      score: alternativesScore,
      maxScore: 20,
      reasoning: alternativesCount === 0 
        ? t('irreversa.criticality.noAlternatives', 'Aucune alternative documentée')
        : t('irreversa.criticality.alternativesCount', '{{count}} alternatives considérées', { count: alternativesCount }),
    });

    return result;
  }, [threshold, t]);

  const totalScore = factors.reduce((sum, f) => sum + f.score, 0);
  const maxTotalScore = factors.reduce((sum, f) => sum + f.maxScore, 0);
  const percentage = Math.round((totalScore / maxTotalScore) * 100);

  const getCriticalityLevel = (percent: number) => {
    if (percent >= 80) return { level: 'extreme', color: 'text-red-600', bg: 'bg-red-500/20', label: t('irreversa.criticality.extreme', 'Extrême') };
    if (percent >= 60) return { level: 'high', color: 'text-orange-600', bg: 'bg-orange-500/20', label: t('irreversa.criticality.high', 'Élevée') };
    if (percent >= 40) return { level: 'moderate', color: 'text-amber-600', bg: 'bg-amber-500/20', label: t('irreversa.criticality.moderate', 'Modérée') };
    return { level: 'low', color: 'text-blue-600', bg: 'bg-blue-500/20', label: t('irreversa.criticality.low', 'Faible') };
  };

  const criticality = getCriticalityLevel(percentage);

  return (
    <Card className="border-red-500/20">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Gauge className="w-5 h-5 text-red-600" />
          {t('irreversa.criticality.title', 'Score de criticité')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main score display */}
        <div className={`p-4 rounded-xl ${criticality.bg} text-center`}>
          <div className={`text-4xl font-bold ${criticality.color}`}>
            {percentage}%
          </div>
          <Badge variant="outline" className={`mt-2 ${criticality.color}`}>
            <AlertTriangle className="w-3 h-3 mr-1" />
            {criticality.label}
          </Badge>
        </div>

        <Separator />

        {/* Factor breakdown */}
        <div className="space-y-3">
          {factors.map(factor => {
            const Icon = factor.icon;
            const factorPercent = (factor.score / factor.maxScore) * 100;
            
            return (
              <div key={factor.id} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                    {factor.label}
                  </span>
                  <span className="font-medium">{factor.score}/{factor.maxScore}</span>
                </div>
                <Progress value={factorPercent} className="h-1.5" />
                <p className="text-xs text-muted-foreground">{factor.reasoning}</p>
              </div>
            );
          })}
        </div>

        {/* Interpretation */}
        <div className="p-3 rounded-lg bg-muted/30">
          <h4 className="font-medium text-sm mb-1 flex items-center gap-2">
            <Users className="w-4 h-4" />
            {t('irreversa.criticality.interpretation', 'Interprétation')}
          </h4>
          <p className="text-xs text-muted-foreground">
            {percentage >= 80 
              ? t('irreversa.criticality.interpretExtreme', 'Ce seuil représente un point de non-retour majeur. Documentation et validation formelle essentielles.')
              : percentage >= 60 
                ? t('irreversa.criticality.interpretHigh', 'Impact significatif. Assurez-vous que toutes les parties prenantes sont informées.')
                : percentage >= 40
                  ? t('irreversa.criticality.interpretModerate', 'Impact modéré mais mesurable. Suivi recommandé.')
                  : t('irreversa.criticality.interpretLow', 'Impact limité. Peut évoluer si la situation change.')
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
