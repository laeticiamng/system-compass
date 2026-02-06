import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Target, Clock, CheckCircle, Zap, Trophy } from 'lucide-react';
import { useChallengeProgress, type ChallengeProgress } from '@/hooks/useChallengeProgress';
import { cn } from '@/lib/utils';

export function ChallengeProgressTracker() {
  const { t } = useTranslation();
  const { 
    challenges, 
    isLoading,
    getActiveChallenges, 
    getCompletedToday 
  } = useChallengeProgress();

  const [expanded, setExpanded] = useState(false);

  const activeChallenges = useMemo(() => getActiveChallenges(), [getActiveChallenges]);
  const completedToday = useMemo(() => getCompletedToday(), [getCompletedToday]);
  const totalXpEarned = useMemo(() => 
    challenges.filter(c => c.completedAt).reduce((acc, c) => acc + c.xpAwarded, 0),
    [challenges]
  );

  if (isLoading) {
    return (
      <Card className="glass-card animate-pulse">
        <CardContent className="p-6 h-32" />
      </Card>
    );
  }

  const displayChallenges = expanded ? activeChallenges : activeChallenges.slice(0, 3);

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="w-5 h-5 text-primary" />
            {t('challenges.active', 'Défis en cours')}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <CheckCircle className="w-3 h-3 text-emerald-500" />
              {t('challenges.completedToday', '{{count}} aujourd\'hui', { count: completedToday })}
            </Badge>
            <Badge className="bg-primary/20 text-primary gap-1">
              <Zap className="w-3 h-3" />
              {totalXpEarned} XP
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayChallenges.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Trophy className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>{t('challenges.noActive', 'Aucun défi actif')}</p>
            <p className="text-sm">{t('challenges.comeBackTomorrow', 'Revenez demain pour de nouveaux défis !')}</p>
          </div>
        ) : (
          displayChallenges.map((challenge: ChallengeProgress) => {
            const progress = (challenge.currentProgress / challenge.targetProgress) * 100;
            const isComplete = progress >= 100;
            
            return (
              <div
                key={challenge.id}
                className={cn(
                  "p-3 rounded-lg border transition-all",
                  isComplete 
                    ? "bg-emerald-500/10 border-emerald-500/30" 
                    : "bg-secondary/30 border-border"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {challenge.challengeType === 'daily' ? (
                      <Clock className="w-4 h-4 text-amber-500" />
                    ) : (
                      <Target className="w-4 h-4 text-blue-500" />
                    )}
                    <span className="font-medium text-sm">{challenge.challengeId}</span>
                    <Badge variant="secondary" className="text-xs">
                      {challenge.challengeType === 'daily' 
                        ? t('challenges.daily', 'Quotidien') 
                        : t('challenges.weekly', 'Hebdo')}
                    </Badge>
                  </div>
                  {isComplete ? (
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      +{challenge.xpAwarded} XP
                    </span>
                  )}
                </div>
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                  <span>{challenge.currentProgress}/{challenge.targetProgress}</span>
                  <span>{progress.toFixed(0)}%</span>
                </div>
              </div>
            );
          })
        )}

        {activeChallenges.length > 3 && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded 
              ? t('challenges.collapse', 'Réduire') 
              : t('challenges.showMore', 'Voir {{count}} autres', { count: activeChallenges.length - 3 })}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
