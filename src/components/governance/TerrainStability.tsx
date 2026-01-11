import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Scale, 
  TrendingUp, 
  AlertTriangle, 
  Users, 
  Landmark,
  FileText
} from 'lucide-react';

interface StabilityIndicator {
  id: string;
  label: string;
  score: number; // 1-5
  note: string;
  icon: React.ReactNode;
}

interface TerrainStabilityProps {
  countryId: string;
  countryName: string;
  snapshot?: {
    corruptionIndex?: number;
    freedomIndex?: number;
  };
}

const getStabilityColor = (score: number): string => {
  if (score >= 4) return 'text-green-600';
  if (score >= 3) return 'text-amber-600';
  return 'text-red-600';
};

export function TerrainStability({ countryId, countryName, snapshot }: TerrainStabilityProps) {
  const { t } = useTranslation();

  const indicators: StabilityIndicator[] = [
    {
      id: 'political',
      label: t('governance.stability.political', 'Stabilité politique'),
      score: 3,
      note: 'Transitions régulières mais prévisibles',
      icon: <Landmark className="w-4 h-4" />,
    },
    {
      id: 'economic',
      label: t('governance.stability.economic', 'Stabilité économique'),
      score: 4,
      note: 'Croissance modérée, inflation contenue',
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      id: 'social',
      label: t('governance.stability.social', 'Climat social'),
      score: 3,
      note: 'Tensions sectorielles occasionnelles',
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: 'regulatory',
      label: t('governance.stability.regulatory', 'Prévisibilité réglementaire'),
      score: 3,
      note: 'Changements possibles mais généralement annoncés',
      icon: <FileText className="w-4 h-4" />,
    },
  ];

  const averageScore = indicators.reduce((acc, i) => acc + i.score, 0) / indicators.length;

  const getGlobalAssessment = (score: number) => {
    if (score >= 4) return {
      label: t('governance.stability.assessmentHigh', 'Stabilité élevée'),
      description: t('governance.stability.assessmentHighDesc', 'Environnement prévisible, risque de rupture faible'),
      color: 'bg-green-500/20 text-green-700 border-green-500/30',
    };
    if (score >= 3) return {
      label: t('governance.stability.assessmentMedium', 'Stabilité modérée'),
      description: t('governance.stability.assessmentMediumDesc', 'Prévoir des ajustements, surveiller les signaux'),
      color: 'bg-amber-500/20 text-amber-700 border-amber-500/30',
    };
    return {
      label: t('governance.stability.assessmentLow', 'Stabilité faible'),
      description: t('governance.stability.assessmentLowDesc', 'Risque de rupture élevé, plan B indispensable'),
      color: 'bg-red-500/20 text-red-700 border-red-500/30',
    };
  };

  const assessment = getGlobalAssessment(averageScore);

  return (
    <Card className="border-blue-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Scale className="w-5 h-5 text-blue-600" />
            {t('governance.stability.title', 'Stabilité / Tensions / Prévisibilité')}
          </CardTitle>
          <Badge className={assessment.color}>
            {assessment.label}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {countryName}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Indicators */}
        <div className="space-y-4">
          {indicators.map(indicator => (
            <div key={indicator.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{indicator.icon}</span>
                  <span className="font-medium text-sm">{indicator.label}</span>
                </div>
                <span className={`font-bold ${getStabilityColor(indicator.score)}`}>
                  {indicator.score}/5
                </span>
              </div>
              <Progress value={indicator.score * 20} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {indicator.note}
              </p>
            </div>
          ))}
        </div>

        {/* External Indices */}
        {snapshot && (
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            {snapshot.corruptionIndex && (
              <div>
                <div className="text-xs text-muted-foreground mb-1">Indice Corruption (TI)</div>
                <div className="text-lg font-bold">{100 - snapshot.corruptionIndex}/100</div>
              </div>
            )}
            {snapshot.freedomIndex && (
              <div>
                <div className="text-xs text-muted-foreground mb-1">Indice Liberté</div>
                <div className="text-lg font-bold">{snapshot.freedomIndex}/100</div>
              </div>
            )}
          </div>
        )}

        {/* Risk Assessment */}
        <div className="p-4 bg-blue-500/10 rounded-lg">
          <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            {t('governance.stability.riskOfChange', 'Risque de changement de règles')}
          </h4>
          <p className="text-sm text-muted-foreground">
            {assessment.description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
