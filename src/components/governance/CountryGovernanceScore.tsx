import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Scale, TrendingUp, Users, Shield, Briefcase } from 'lucide-react';
import { useCountryGovernance } from '@/hooks/useCountryGovernance';

interface CountryGovernanceScoreProps {
  countryId: string;
  countryName: string;
  snapshot?: { corruptionIndex?: number; freedomIndex?: number };
}

const getScoreColor = (score: number): string => {
  if (score >= 4) return 'text-green-600';
  if (score >= 3) return 'text-amber-600';
  return 'text-red-600';
};

const getScoreLabel = (score: number): string => {
  if (score >= 4) return 'Favorable';
  if (score >= 3) return 'Modéré';
  if (score >= 2) return 'Difficile';
  return 'Très difficile';
};

export function CountryGovernanceScore({ countryId, countryName, snapshot }: CountryGovernanceScoreProps) {
  const { t } = useTranslation();
  const { governance, isLoading, averageScore } = useCountryGovernance(countryId);

  const variables = [
    {
      id: 'stability',
      label: t('governance.score.stability', 'Stabilité / Prévisibilité'),
      score: governance?.stability_score || 3,
      lowIndices: t('governance.score.stabilityLow', 'Changements fréquents, règles floues'),
      highIndices: t('governance.score.stabilityHigh', 'Transitions ordonnées, cadre stable'),
      icon: <Scale className="w-4 h-4" />,
    },
    {
      id: 'friction',
      label: t('governance.score.friction', 'Friction non-officielle'),
      score: governance?.friction_score || 2,
      lowIndices: t('governance.score.frictionLow', 'Opacité élevée, intermédiaires requis'),
      highIndices: t('governance.score.frictionHigh', 'Processus transparents, accès direct'),
      icon: <Shield className="w-4 h-4" />,
    },
    {
      id: 'operational',
      label: t('governance.score.operational', 'Facilité opérationnelle'),
      score: governance?.operational_score || 3,
      lowIndices: t('governance.score.operationalLow', 'Admin lente, fiscalité complexe'),
      highIndices: t('governance.score.operationalHigh', 'Processus fluides, fiscalité claire'),
      icon: <Briefcase className="w-4 h-4" />,
    },
    {
      id: 'capture',
      label: t('governance.score.capture', 'Risque de capture'),
      score: governance?.capture_risk_score || 2,
      lowIndices: t('governance.score.captureLow', 'Dépendance forte, exit difficile'),
      highIndices: t('governance.score.captureHigh', 'Alternatives multiples, exit facile'),
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      id: 'ecosystem',
      label: t('governance.score.ecosystem', 'Écosystème partenaires'),
      score: governance?.ecosystem_score || 4,
      lowIndices: t('governance.score.ecosystemLow', 'Peu d\'acteurs fiables'),
      highIndices: t('governance.score.ecosystemHigh', 'Réseau dense et vérifiable'),
      icon: <Users className="w-4 h-4" />,
    },
  ];

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {t('governance.score.title', 'Score Gouvernance')} - {countryName}
          </CardTitle>
          <div className="text-right">
            <div className={`text-3xl font-bold ${getScoreColor(averageScore)}`}>
              {averageScore.toFixed(1)}/5
            </div>
            <Badge variant="outline" className={getScoreColor(averageScore)}>
              {getScoreLabel(averageScore)}
            </Badge>
          </div>
        </div>
        {snapshot && (
          <div className="flex gap-4 text-xs text-muted-foreground mt-2">
            {snapshot.corruptionIndex && (
              <span>TI Corruption: {100 - snapshot.corruptionIndex}/100</span>
            )}
            {snapshot.freedomIndex && (
              <span>Liberté: {snapshot.freedomIndex}/100</span>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {variables.map(v => (
          <div key={v.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{v.icon}</span>
                <span className="font-medium text-sm">{v.label}</span>
              </div>
              <Badge variant="outline" className={getScoreColor(v.score)}>
                {v.score}/5
              </Badge>
            </div>
            <Progress value={v.score * 20} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1: {v.lowIndices}</span>
              <span>5: {v.highIndices}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
