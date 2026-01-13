import { useTranslation } from 'react-i18next';
import { useGameStatistics } from '@/hooks/useGameStatistics';
import { useUserCases } from '@/hooks/useUserCases';
import { useLatentZones } from '@/hooks/useLatentZones';
import { useIrreversa } from '@/hooks/useIrreversa';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  ArrowRight,
  Target,
  Zap,
  Award,
  Gamepad2,
  Briefcase,
  Layers,
  Lock
} from 'lucide-react';

export function AnalyticsDashboardWidget() {
  const { t } = useTranslation();
  const { stats, loading: statsLoading } = useGameStatistics();
  const { cases, isLoading: casesLoading } = useUserCases();
  const { zones, loading: zonesLoading } = useLatentZones();
  const { thresholds, loading: thresholdsLoading } = useIrreversa();

  const loading = statsLoading || casesLoading || zonesLoading || thresholdsLoading;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  const totalModules = 8;
  const completedModules = [
    stats?.totalGamesPlayed && stats.totalGamesPlayed > 0,
    cases && cases.length > 0,
    zones && zones.length > 0,
    thresholds && thresholds.length > 0,
    stats?.countriesVisited && stats.countriesVisited.length > 0,
    stats?.archetypesUsed && stats.archetypesUsed.length > 0,
  ].filter(Boolean).length;

  const completionPercentage = Math.round((completedModules / totalModules) * 100);

  // Calculate activity score
  const activityScore = Math.min(100, 
    (stats?.totalGamesPlayed || 0) * 5 +
    (cases?.length || 0) * 10 +
    (zones?.length || 0) * 5 +
    (thresholds?.length || 0) * 5
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          {t('dashboard.analytics.title', 'Votre Progression')}
        </CardTitle>
        <Link to="/usage">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowRight className="w-3 h-3" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              {t('dashboard.analytics.modulesExplored', 'Modules explorés')}
            </span>
            <span className="text-sm text-muted-foreground">
              {completedModules}/{totalModules}
            </span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>

        {/* Activity Score */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              {t('dashboard.analytics.activityScore', 'Score d\'activité')}
            </span>
            <span className="text-sm text-muted-foreground">{activityScore}%</span>
          </div>
          <Progress value={activityScore} className="h-2" />
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <div className="p-2 rounded-lg bg-primary/10 text-center">
            <div className="flex items-center justify-center gap-1 text-lg font-bold text-primary">
              <Gamepad2 className="w-4 h-4" />
              {stats?.totalGamesPlayed || 0}
            </div>
            <div className="text-xs text-muted-foreground">
              {t('dashboard.analytics.gamesPlayed', 'Parties')}
            </div>
          </div>
          <div className="p-2 rounded-lg bg-emerald-500/10 text-center">
            <div className="flex items-center justify-center gap-1 text-lg font-bold text-emerald-500">
              <Briefcase className="w-4 h-4" />
              {cases?.length || 0}
            </div>
            <div className="text-xs text-muted-foreground">
              {t('dashboard.analytics.cases', 'Cas créés')}
            </div>
          </div>
        </div>

        {/* Achievement Hint */}
        {completionPercentage < 100 && (
          <div className="flex items-start gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <Award className="w-4 h-4 text-amber-500 mt-0.5" />
            <div className="text-xs text-muted-foreground">
              <span className="font-medium text-amber-500">
                {t('dashboard.analytics.hint', 'Conseil:')}
              </span>{' '}
              {t('dashboard.analytics.exploreMore', 'Explorez plus de modules pour débloquer des achievements !')}
            </div>
          </div>
        )}

        {completionPercentage === 100 && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <Award className="w-4 h-4 text-emerald-500" />
            <span className="text-xs text-emerald-400 font-medium">
              {t('dashboard.analytics.allExplored', 'Vous avez exploré tous les modules ! 🎉')}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
