import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Target, CheckCircle, Circle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Goal {
  id: string;
  title: string;
  progress: number;
  target: number;
  unit?: string;
}

interface GoalsProgressWidgetProps {
  goals?: Goal[];
}

export function GoalsProgressWidget({ goals }: GoalsProgressWidgetProps) {
  const { t } = useTranslation();

  // Default demo goals if none provided
  const displayGoals: Goal[] = goals || [
    { id: '1', title: t('goals.completeProfile', 'Compléter le profil'), progress: 80, target: 100, unit: '%' },
    { id: '2', title: t('goals.exploreCountries', 'Explorer 10 pays'), progress: 6, target: 10 },
    { id: '3', title: t('goals.saveExitKeys', 'Sauvegarder 5 clés'), progress: 3, target: 5 },
    { id: '4', title: t('goals.runSimulations', 'Lancer 3 simulations'), progress: 1, target: 3 },
  ];

  const completedGoals = displayGoals.filter(g => g.progress >= g.target).length;
  const totalProgress = Math.round((completedGoals / displayGoals.length) * 100);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="w-5 h-5 text-primary" />
            {t('dashboard.myGoals', 'Mes objectifs')}
          </CardTitle>
          <span className="text-sm font-medium text-primary">
            {completedGoals}/{displayGoals.length}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('dashboard.overallProgress', 'Progression globale')}</span>
            <span className="font-medium">{totalProgress}%</span>
          </div>
          <Progress value={totalProgress} className="h-2" />
        </div>

        {/* Individual goals */}
        <div className="space-y-3 pt-2">
          {displayGoals.map((goal) => {
            const percentage = Math.min(Math.round((goal.progress / goal.target) * 100), 100);
            const isComplete = goal.progress >= goal.target;
            
            return (
              <div key={goal.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {isComplete ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className={isComplete ? 'text-muted-foreground line-through' : ''}>
                      {goal.title}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {goal.progress}/{goal.target}{goal.unit || ''}
                  </span>
                </div>
                <Progress 
                  value={percentage} 
                  className="h-1.5" 
                />
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <Link to="/exit-keys">
          <Button variant="outline" size="sm" className="w-full gap-2 mt-2">
            {t('dashboard.continueJourney', 'Continuer mon parcours')}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
