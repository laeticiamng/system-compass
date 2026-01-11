import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Scale, TrendingUp, Users, Shield, Briefcase } from 'lucide-react';

interface CountryScoreVariable {
  id: string;
  label: string;
  score: number;
  lowIndices: string;
  highIndices: string;
  icon: React.ReactNode;
}

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

export function CountryGovernanceScore({ countryId, countryName, snapshot }: CountryGovernanceScoreProps) {
  const { t } = useTranslation();

  const variables: CountryScoreVariable[] = [
    {
      id: 'stability',
      label: 'Stabilité / Prévisibilité',
      score: 3,
      lowIndices: 'Changements fréquents, règles floues',
      highIndices: 'Transitions ordonnées, cadre stable',
      icon: <Scale className="w-4 h-4" />,
    },
    {
      id: 'friction',
      label: 'Friction non-officielle',
      score: 2,
      lowIndices: 'Opacité élevée, intermédiaires requis',
      highIndices: 'Processus transparents, accès direct',
      icon: <Shield className="w-4 h-4" />,
    },
    {
      id: 'operational',
      label: 'Facilité opérationnelle',
      score: 3,
      lowIndices: 'Admin lente, fiscalité complexe',
      highIndices: 'Processus fluides, fiscalité claire',
      icon: <Briefcase className="w-4 h-4" />,
    },
    {
      id: 'capture',
      label: 'Risque de capture',
      score: 2,
      lowIndices: 'Dépendance forte, exit difficile',
      highIndices: 'Alternatives multiples, exit facile',
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      id: 'ecosystem',
      label: 'Écosystème partenaires',
      score: 4,
      lowIndices: 'Peu d\'acteurs fiables',
      highIndices: 'Réseau dense et vérifiable',
      icon: <Users className="w-4 h-4" />,
    },
  ];

  const averageScore = variables.reduce((acc, v) => acc + v.score, 0) / variables.length;

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Score Gouvernance - {countryName}</CardTitle>
          <div className="text-right">
            <div className={`text-3xl font-bold ${getScoreColor(averageScore)}`}>
              {averageScore.toFixed(1)}/5
            </div>
          </div>
        </div>
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
