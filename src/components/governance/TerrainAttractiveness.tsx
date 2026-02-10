import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Users, Briefcase, Zap, BarChart3 } from 'lucide-react';
import { useCountryGovernance } from '@/hooks/useCountryGovernance';

interface TerrainAttractivenessProps {
  countryId: string;
  countryName: string;
  projectType?: string;
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

export function TerrainAttractiveness({ countryId, countryName }: TerrainAttractivenessProps) {
  const { t } = useTranslation();
  const { governance } = useCountryGovernance(countryId);

  // Get attractiveness data from governance or use defaults
  const attractiveness = governance?.attractiveness as {
    demand?: number;
    easeOfDoing?: number;
    marketAccess?: number;
    localDynamics?: number;
    signals?: string[];
  } | undefined;

  const metrics = [
    {
      id: 'demand',
      label: t('governance.attractiveness.demand', 'Demande locale'),
      score: attractiveness?.demand || 3,
      signal: t('governance.attractiveness.demandSignal', 'Marché en croissance, demande identifiable'),
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      id: 'ease',
      label: t('governance.attractiveness.ease', 'Facilité de faire'),
      score: attractiveness?.easeOfDoing || 3,
      signal: t('governance.attractiveness.easeSignal', 'Bureaucratie moyenne, prévoir des délais'),
      icon: <Briefcase className="w-4 h-4" />,
    },
    {
      id: 'access',
      label: t('governance.attractiveness.access', 'Accès marché'),
      score: attractiveness?.marketAccess || 3,
      signal: t('governance.attractiveness.accessSignal', 'Possible avec bon réseau local'),
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: 'dynamism',
      label: t('governance.attractiveness.dynamism', 'Dynamique locale'),
      score: attractiveness?.localDynamics || 3,
      signal: t('governance.attractiveness.dynamismSignal', 'Écosystème actif, opportunités visibles'),
      icon: <Zap className="w-4 h-4" />,
    },
  ];

  const averageScore = metrics.reduce((acc, m) => acc + m.score, 0) / metrics.length;

  return (
    <Card className="border-green-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="w-5 h-5 text-green-600" />
            {t('governance.attractiveness.title', 'Attractivité / Climat commercial')}
          </CardTitle>
          <div className="text-right">
            <div className={`text-2xl font-bold ${getScoreColor(averageScore)}`}>
              {averageScore.toFixed(1)}/5
            </div>
            <Badge variant="outline" className={getScoreColor(averageScore)}>
              {getScoreLabel(averageScore)}
            </Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {t('governance.attractiveness.description', 'Signaux terrain pour')} {countryName}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {metrics.map(metric => (
          <div key={metric.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{metric.icon}</span>
                <span className="font-medium text-sm">{metric.label}</span>
              </div>
              <span className={`font-bold ${getScoreColor(metric.score)}`}>
                {metric.score}/5
              </span>
            </div>
            <Progress value={metric.score * 20} className="h-2" />
            <p className="text-xs text-muted-foreground italic">
              → {metric.signal}
            </p>
          </div>
        ))}

        {/* Custom signals from governance data */}
        {attractiveness?.signals && attractiveness.signals.length > 0 && (
          <div className="mt-4 p-3 bg-green-500/10 rounded-lg">
            <h4 className="font-medium text-sm mb-2">
              {t('governance.attractiveness.signals', 'Signaux terrain')}
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {attractiveness.signals.map((signal, i) => (
                <li key={i}>• {signal}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium text-sm mb-2">
            {t('governance.attractiveness.interpretation', 'Interprétation')}
          </h4>
          <p className="text-sm text-muted-foreground">
            {averageScore >= 3.5 
              ? t('governance.attractiveness.positive', 'Climat globalement favorable. Points de vigilance sur l\'accès réseau.')
              : averageScore >= 2.5
                ? t('governance.attractiveness.moderate', 'Conditions mixtes. Nécessite préparation approfondie et contacts locaux solides.')
                : t('governance.attractiveness.difficult', 'Conditions difficiles. Recommandation : POC minimal avant engagement.')
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
