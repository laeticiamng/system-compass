import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Target, CheckCircle, Circle, ArrowRight } from 'lucide-react';
import { LocalizedLink as Link } from '@/components/i18n';
import { useDashboardProgress } from '@/hooks/useDashboardProgress';
import { useExitKeysProfile } from '@/hooks/useExitKeysProfile';
import { useGamification } from '@/hooks/useGamification';
import { EXIT_KEYS } from '@/lib/exit-keys-engine';

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

export function GoalsProgressWidget({ goals: propGoals }: GoalsProgressWidgetProps) {
  const { t } = useTranslation();
  const { profile } = useExitKeysProfile();
  const { progress } = useDashboardProgress();
  const { progress: gamificationProgress } = useGamification();

  // Calculate real goals based on actual user data
  const computedGoals: Goal[] = [];

  // Goal 1: Complete profile
  const profileFields = profile ? [
    profile.motorProfile,
    profile.riskTolerance,
    profile.timeHorizon,
    profile.hasCapital !== undefined,
    profile.hasCredentials !== undefined,
  ].filter(Boolean).length : 0;
  computedGoals.push({
    id: 'profile',
    title: t('goals.completeProfile', 'Compléter le profil'),
    progress: Math.round((profileFields / 5) * 100),
    target: 100,
    unit: '%'
  });

  // Goal 2: Start an Exit Key trajectory
  const hasExitKey = !!progress?.exitKeyId;
  computedGoals.push({
    id: 'exitkey',
    title: t('goals.startTrajectory', 'Démarrer une trajectoire'),
    progress: hasExitKey ? 1 : 0,
    target: 1
  });

  // Goal 3: Complete Exit Key steps
  const selectedKey = progress?.exitKeyId ? EXIT_KEYS.find(k => k.id === progress.exitKeyId) : null;
  const totalSteps = selectedKey?.steps.reduce((acc, phase) => acc + phase.actions.length, 0) || 0;
  const completedSteps = progress?.stepsProgress?.filter(s => s.completed).length || 0;
  if (totalSteps > 0) {
    computedGoals.push({
      id: 'steps',
      title: t('goals.completeSteps', 'Compléter les étapes'),
      progress: completedSteps,
      target: totalSteps
    });
  } else {
    computedGoals.push({
      id: 'steps',
      title: t('goals.completeSteps', 'Compléter les étapes'),
      progress: 0,
      target: 10
    });
  }

  // Goal 4: Earn XP
  const currentXP = gamificationProgress?.xp || 0;
  const xpTarget = 500;
  computedGoals.push({
    id: 'xp',
    title: t('goals.earnXP', 'Gagner de l\'XP'),
    progress: Math.min(currentXP, xpTarget),
    target: xpTarget
  });

  // Goal 5: Maintain streak
  const streak = gamificationProgress?.streak || 0;
  computedGoals.push({
    id: 'streak',
    title: t('goals.maintainStreak', 'Maintenir une série'),
    progress: Math.min(streak, 7),
    target: 7,
    unit: 'j'
  });

  const displayGoals = propGoals || computedGoals;
  const completedGoals = displayGoals.filter(g => g.progress >= g.target).length;
  const totalProgress = displayGoals.length > 0 
    ? Math.round((completedGoals / displayGoals.length) * 100) 
    : 0;

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
                      <CheckCircle className="w-4 h-4 text-risk-low" />
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
