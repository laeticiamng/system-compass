/**
 * Advanced Game Statistics Component
 * Displays detailed game performance metrics
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Target, 
  Flame, 
  Globe, 
  TrendingUp,
  Gamepad2,
  Award,
  Star
} from 'lucide-react';
import { useGameStatistics } from '@/hooks/useGameStatistics';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subValue?: string;
  color?: string;
}

function StatCard({ icon, label, value, subValue, color = 'text-primary' }: StatCardProps) {
  return (
    <div className="p-4 rounded-lg bg-secondary/50 space-y-2">
      <div className="flex items-center gap-2">
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center bg-primary/10', color)}>
          {icon}
        </div>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <div className="space-y-1">
        <p className={cn('text-2xl font-bold', color)}>{value}</p>
        {subValue && <p className="text-xs text-muted-foreground">{subValue}</p>}
      </div>
    </div>
  );
}

export function AdvancedGameStats() {
  const { stats, loading } = useGameStatistics();

  if (loading || !stats) {
    return null;
  }

  const averageScore = stats.bestScoreSolo 
    ? Math.round((stats.bestScoreSolo + (stats.bestScoreRace || 0)) / 2)
    : 0;

  const riskRewardRatio = stats.totalRiskEvents && stats.totalRiskEvents > 0
    ? ((stats.riskSuccesses || 0) / stats.totalRiskEvents * 100).toFixed(0)
    : '0';

  const countriesVisited = stats.countriesVisited?.length || 0;
  const averageTurnsPerGame = stats.totalGamesPlayed > 0 
    ? Math.round(stats.totalTurnsPlayed / stats.totalGamesPlayed)
    : 0;

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gamepad2 className="w-5 h-5 text-primary" />
          Statistiques avancées
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={<Trophy className="w-4 h-4" />}
            label="Meilleur score"
            value={stats.bestScoreSolo || 0}
            subValue="Mode Solo"
            color="text-amber-400"
          />
          <StatCard
            icon={<Target className="w-4 h-4" />}
            label="Parties jouées"
            value={stats.totalGamesPlayed}
            subValue={`${averageTurnsPerGame} tours/partie`}
          />
          <StatCard
            icon={<Globe className="w-4 h-4" />}
            label="Pays explorés"
            value={countriesVisited}
            subValue="différents systèmes"
            color="text-cyan-400"
          />
          <StatCard
            icon={<Flame className="w-4 h-4" />}
            label="Taux de risque"
            value={`${riskRewardRatio}%`}
            subValue="réussite des paris"
            color="text-rose-400"
          />
        </div>

        {/* Performance Indicators */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground">Performance globale</h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                Score moyen
              </span>
              <span className="font-medium">{averageScore}</span>
            </div>
            <Progress value={Math.min(averageScore / 10, 100)} className="h-2" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Progression
              </span>
              <span className="font-medium">{stats.totalTurnsPlayed} tours</span>
            </div>
            <Progress value={Math.min(stats.totalTurnsPlayed / 100, 100)} className="h-2" />
          </div>
        </div>

        {/* Archetype Usage */}
        {stats.archetypesUsed && Object.keys(stats.archetypesUsed).length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">Archétypes favoris</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.archetypesUsed)
                .sort((a, b) => Number(b[1]) - Number(a[1]))
                .slice(0, 5)
                .map(([archetype, count]) => (
                  <Badge key={archetype} variant="secondary" className="gap-1">
                    <Star className="w-3 h-3" />
                    {archetype}: {Number(count)}x
                  </Badge>
                ))}
            </div>
          </div>
        )}

        {/* Countries Visited */}
        {stats.countriesVisited && stats.countriesVisited.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">Pays visités</h4>
            <div className="flex flex-wrap gap-2">
              {stats.countriesVisited.slice(0, 8).map((country) => (
                <Badge key={country} variant="outline">
                  {country}
                </Badge>
              ))}
              {stats.countriesVisited.length > 8 && (
                <Badge variant="outline">
                  +{stats.countriesVisited.length - 8} autres
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
