import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, Star, Target, Globe, Compass, Shield, 
  Zap, Heart, TrendingUp, Award, Lock
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  condition: (stats: GameStats) => boolean;
  progress: (stats: GameStats) => number;
  maxProgress: number;
  xpReward: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

interface GameStats {
  total_games_played: number;
  total_turns_played: number;
  best_score_solo: number;
  best_score_race: number;
  countries_visited: string[];
  risk_successes: number;
  risk_failures: number;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_game',
    name: 'Premier Pas',
    description: 'Terminer votre première partie',
    icon: <Star className="h-5 w-5" />,
    condition: (s) => s.total_games_played >= 1,
    progress: (s) => Math.min(s.total_games_played, 1),
    maxProgress: 1,
    xpReward: 50,
    tier: 'bronze',
  },
  {
    id: 'explorer_5',
    name: 'Explorateur',
    description: 'Visiter 5 pays différents',
    icon: <Globe className="h-5 w-5" />,
    condition: (s) => s.countries_visited.length >= 5,
    progress: (s) => Math.min(s.countries_visited.length, 5),
    maxProgress: 5,
    xpReward: 100,
    tier: 'bronze',
  },
  {
    id: 'globetrotter',
    name: 'Globe-Trotter',
    description: 'Visiter 20 pays différents',
    icon: <Compass className="h-5 w-5" />,
    condition: (s) => s.countries_visited.length >= 20,
    progress: (s) => Math.min(s.countries_visited.length, 20),
    maxProgress: 20,
    xpReward: 300,
    tier: 'silver',
  },
  {
    id: 'veteran',
    name: 'Vétéran',
    description: 'Jouer 50 parties',
    icon: <Shield className="h-5 w-5" />,
    condition: (s) => s.total_games_played >= 50,
    progress: (s) => Math.min(s.total_games_played, 50),
    maxProgress: 50,
    xpReward: 250,
    tier: 'silver',
  },
  {
    id: 'risk_taker',
    name: 'Preneur de Risques',
    description: 'Réussir 10 événements à risque',
    icon: <Zap className="h-5 w-5" />,
    condition: (s) => s.risk_successes >= 10,
    progress: (s) => Math.min(s.risk_successes, 10),
    maxProgress: 10,
    xpReward: 150,
    tier: 'bronze',
  },
  {
    id: 'survivor',
    name: 'Survivant',
    description: 'Survivre à 20 échecs de risque',
    icon: <Heart className="h-5 w-5" />,
    condition: (s) => s.risk_failures >= 20,
    progress: (s) => Math.min(s.risk_failures, 20),
    maxProgress: 20,
    xpReward: 200,
    tier: 'silver',
  },
  {
    id: 'high_scorer',
    name: 'Champion',
    description: 'Atteindre 10 000 points en solo',
    icon: <Trophy className="h-5 w-5" />,
    condition: (s) => s.best_score_solo >= 10000,
    progress: (s) => Math.min(s.best_score_solo, 10000),
    maxProgress: 10000,
    xpReward: 500,
    tier: 'gold',
  },
  {
    id: 'master',
    name: 'Maître du Jeu',
    description: 'Atteindre 50 000 points en solo',
    icon: <Award className="h-5 w-5" />,
    condition: (s) => s.best_score_solo >= 50000,
    progress: (s) => Math.min(s.best_score_solo, 50000),
    maxProgress: 50000,
    xpReward: 1000,
    tier: 'platinum',
  },
  {
    id: 'endurance',
    name: 'Endurance',
    description: 'Jouer 500 tours au total',
    icon: <TrendingUp className="h-5 w-5" />,
    condition: (s) => s.total_turns_played >= 500,
    progress: (s) => Math.min(s.total_turns_played, 500),
    maxProgress: 500,
    xpReward: 400,
    tier: 'gold',
  },
  {
    id: 'racer',
    name: 'Coureur',
    description: 'Gagner une course avec 5000+ points',
    icon: <Target className="h-5 w-5" />,
    condition: (s) => s.best_score_race >= 5000,
    progress: (s) => Math.min(s.best_score_race, 5000),
    maxProgress: 5000,
    xpReward: 350,
    tier: 'gold',
  },
];

const TIER_COLORS = {
  bronze: 'bg-amber-700/20 text-amber-600 border-amber-600/30',
  silver: 'bg-gray-300/20 text-gray-500 border-gray-400/30',
  gold: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30',
  platinum: 'bg-purple-500/20 text-purple-500 border-purple-500/30',
};

export function GameAchievements() {
  const { user } = useAuth();
  const [stats, setStats] = useState<GameStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStats();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchStats = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('game_statistics')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      setStats(data ? {
        total_games_played: data.total_games_played || 0,
        total_turns_played: data.total_turns_played || 0,
        best_score_solo: data.best_score_solo || 0,
        best_score_race: data.best_score_race || 0,
        countries_visited: data.countries_visited || [],
        risk_successes: data.risk_successes || 0,
        risk_failures: data.risk_failures || 0,
      } : {
        total_games_played: 0,
        total_turns_played: 0,
        best_score_solo: 0,
        best_score_race: 0,
        countries_visited: [],
        risk_successes: 0,
        risk_failures: 0,
      });
    } catch (err) {
      console.error('Failed to fetch game stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const unlockedCount = stats 
    ? ACHIEVEMENTS.filter(a => a.condition(stats)).length 
    : 0;

  const totalXP = stats
    ? ACHIEVEMENTS.filter(a => a.condition(stats)).reduce((sum, a) => sum + a.xpReward, 0)
    : 0;

  if (!user || isLoading) {
    return (
      <Card className="glass-card">
        <CardContent className="py-8 text-center">
          <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {isLoading ? 'Chargement...' : 'Connectez-vous pour voir vos succès'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Succès
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {unlockedCount}/{ACHIEVEMENTS.length}
            </Badge>
            <Badge className="bg-primary/10 text-primary">
              {totalXP} XP
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {ACHIEVEMENTS.map(achievement => {
            const unlocked = stats ? achievement.condition(stats) : false;
            const progress = stats ? achievement.progress(stats) : 0;
            const progressPercent = (progress / achievement.maxProgress) * 100;

            return (
              <div
                key={achievement.id}
                className={`p-3 rounded-lg border transition-all ${
                  unlocked 
                    ? TIER_COLORS[achievement.tier]
                    : 'bg-muted/30 border-border/50 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    unlocked ? 'bg-background/50' : 'bg-muted'
                  }`}>
                    {unlocked ? achievement.icon : <Lock className="h-5 w-5 text-muted-foreground" />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-medium truncate">{achievement.name}</h4>
                      <Badge variant="secondary" className="text-xs shrink-0">
                        +{achievement.xpReward} XP
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {achievement.description}
                    </p>
                    
                    {!unlocked && (
                      <div className="mt-2">
                        <Progress value={progressPercent} className="h-1.5" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {progress.toLocaleString()} / {achievement.maxProgress.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
