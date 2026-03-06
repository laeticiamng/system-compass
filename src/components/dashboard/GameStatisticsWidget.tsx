import { useTranslation } from 'react-i18next';
import { useGameStatistics } from '@/hooks/useGameStatistics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { LocalizedLink as Link } from '@/components/i18n';
import { 
  Gamepad2, 
  AlertTriangle,
  Play,
  Star
} from 'lucide-react';

export function GameStatisticsWidget() {
  const { t } = useTranslation();
  const { stats, loading, riskSuccessRate, topActions } = useGameStatistics();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (stats.totalGamesPlayed === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5" />
            {t('dashboard.gameStats.title', 'Statistiques de jeu')}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <Gamepad2 className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            {t('dashboard.gameStats.noGames', "Vous n'avez pas encore joué. Découvrez le Jeu de la Vie !")}
          </p>
          <Link to="/pyramid-quiz">
            <Button className="gap-2">
              <Play className="w-4 h-4" />
              {t('dashboard.gameStats.play', 'Jouer maintenant')}
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Gamepad2 className="w-5 h-5" />
          {t('dashboard.gameStats.title', 'Statistiques de jeu')}
        </CardTitle>
        <Link to="/pyramid-quiz">
          <Button variant="ghost" size="sm" className="gap-1">
            <Play className="w-3 h-3" />
            {t('dashboard.gameStats.play', 'Jouer')}
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main stats grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-primary">{stats.totalGamesPlayed}</div>
            <div className="text-xs text-muted-foreground">{t('dashboard.gameStats.gamesPlayed', 'Parties')}</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-amber-500">{stats.totalTurnsPlayed}</div>
            <div className="text-xs text-muted-foreground">{t('dashboard.gameStats.turns', 'Tours')}</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-emerald-500">
              {Math.max(stats.bestScoreSolo, stats.bestScoreRace)}
            </div>
            <div className="text-xs text-muted-foreground">{t('dashboard.gameStats.bestScore', 'Meilleur')}</div>
          </div>
        </div>

        {/* Risk success rate */}
        {stats.totalRiskEvents > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-500" />
                {t('dashboard.gameStats.riskSuccess', 'Taux de réussite risques')}
              </span>
              <span className="font-medium">{riskSuccessRate.toFixed(0)}%</span>
            </div>
            <Progress value={riskSuccessRate} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{stats.riskSuccesses} {t('dashboard.gameStats.successes', 'réussites')}</span>
              <span>{stats.riskFailures} {t('dashboard.gameStats.failures', 'échecs')}</span>
            </div>
          </div>
        )}

        {/* Top actions */}
        {topActions.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-500" />
              {t('dashboard.gameStats.topActions', 'Actions favorites')}
            </div>
            <div className="flex flex-wrap gap-1">
              {topActions.slice(0, 3).map((item) => (
                <span 
                  key={item.action} 
                  className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full"
                >
                  {item.action}: {item.count}×
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Countries visited */}
        {stats.countriesVisited.length > 0 && (
          <div className="text-xs text-muted-foreground">
            {t('dashboard.gameStats.countriesVisited', '{{count}} pays visités', { count: stats.countriesVisited.length })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
