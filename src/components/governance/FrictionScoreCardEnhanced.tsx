import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle2, Info, Zap } from 'lucide-react';

interface FrictionScore {
  administrative: number;
  regulatory: number;
  network: number;
  overall: number;
}

interface FrictionScoreCardEnhancedProps {
  countryName: string;
  scores?: FrictionScore;
  recommendations?: string[];
}

const DEFAULT_SCORES: FrictionScore = {
  administrative: 55,
  regulatory: 60,
  network: 45,
  overall: 53,
};

export function FrictionScoreCardEnhanced({ 
  countryName, 
  scores = DEFAULT_SCORES,
  recommendations = [
    'Anticiper les délais administratifs (3-6 mois)',
    'Faire appel à un facilitateur local',
    'Préparer tous les documents à l\'avance',
  ]
}: FrictionScoreCardEnhancedProps) {
  const getScoreLevel = (score: number) => {
    if (score >= 70) return { label: 'Élevé', variant: 'destructive' as const, icon: AlertTriangle };
    if (score >= 40) return { label: 'Modéré', variant: 'secondary' as const, icon: Info };
    return { label: 'Faible', variant: 'default' as const, icon: CheckCircle2 };
  };

  const overall = getScoreLevel(scores.overall);
  const OverallIcon = overall.icon;

  const factors = [
    { label: 'Administratif', score: scores.administrative, desc: 'Complexité des démarches' },
    { label: 'Réglementaire', score: scores.regulatory, desc: 'Barrières légales' },
    { label: 'Réseau', score: scores.network, desc: 'Importance des connexions' },
  ];

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Score de friction
          </div>
          <Badge variant={overall.variant} className="flex items-center gap-1">
            <OverallIcon className="h-3 w-3" />
            {overall.label}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center p-4 rounded-lg bg-muted/50">
          <p className="text-4xl font-bold">{scores.overall}</p>
          <p className="text-sm text-muted-foreground">Score global de friction pour {countryName}</p>
        </div>

        <div className="space-y-3">
          {factors.map((factor) => {
            const level = getScoreLevel(factor.score);
            return (
              <div key={factor.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{factor.label}</span>
                  <span className={
                    level.variant === 'destructive' ? 'text-red-500' :
                    level.variant === 'secondary' ? 'text-amber-500' : 'text-emerald-500'
                  }>
                    {factor.score}/100
                  </span>
                </div>
                <Progress value={factor.score} className="h-2" />
                <p className="text-xs text-muted-foreground mt-0.5">{factor.desc}</p>
              </div>
            );
          })}
        </div>

        {recommendations.length > 0 && (
          <div className="pt-3 border-t space-y-2">
            <p className="text-sm font-medium">Recommandations</p>
            <ul className="space-y-1">
              {recommendations.map((rec, idx) => (
                <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                  <CheckCircle2 className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
