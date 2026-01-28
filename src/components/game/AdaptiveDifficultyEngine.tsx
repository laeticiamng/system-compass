import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Brain, TrendingUp, TrendingDown, Minus, Zap, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface PlayerMetrics {
  successRate: number;
  averageDecisionTime: number;
  riskTolerance: number;
  consecutiveWins: number;
  consecutiveLosses: number;
  totalTurns: number;
}

interface DifficultySettings {
  level: 'easy' | 'medium' | 'hard' | 'expert';
  eventFrequency: number;
  riskMultiplier: number;
  rewardMultiplier: number;
  aiAggressiveness: number;
}

interface AdaptiveDifficultyEngineProps {
  playerMetrics: PlayerMetrics;
  currentDifficulty: DifficultySettings;
  onDifficultyChange?: (newDifficulty: DifficultySettings) => void;
}

export function AdaptiveDifficultyEngine({
  playerMetrics,
  currentDifficulty
}: AdaptiveDifficultyEngineProps) {
  const { t } = useTranslation();

  const analysis = useMemo(() => {
    const { successRate, consecutiveWins, consecutiveLosses, riskTolerance } = playerMetrics;
    
    let trend: 'increase' | 'decrease' | 'stable' = 'stable';
    let recommendation = '';
    let confidence = 0;

    if (consecutiveWins >= 3 && successRate > 0.7) {
      trend = 'increase';
      recommendation = t('game.difficulty.increaseRec', 'Le joueur maîtrise le niveau actuel. Augmenter la difficulté pour maintenir l\'engagement.');
      confidence = Math.min(95, 60 + consecutiveWins * 5 + successRate * 20);
    } else if (consecutiveLosses >= 3 || successRate < 0.3) {
      trend = 'decrease';
      recommendation = t('game.difficulty.decreaseRec', 'Le joueur rencontre des difficultés. Réduire légèrement pour éviter la frustration.');
      confidence = Math.min(95, 60 + consecutiveLosses * 5 + (1 - successRate) * 20);
    } else {
      recommendation = t('game.difficulty.stableRec', 'Le niveau actuel semble approprié. Continuer l\'observation.');
      confidence = 50 + Math.abs(successRate - 0.5) * 40;
    }

    return { trend, recommendation, confidence, riskProfile: riskTolerance > 0.6 ? 'aggressive' : riskTolerance > 0.4 ? 'balanced' : 'conservative' };
  }, [playerMetrics, t]);

  const difficultyColors = {
    easy: 'bg-green-500/10 text-green-700 border-green-500/30',
    medium: 'bg-blue-500/10 text-blue-700 border-blue-500/30',
    hard: 'bg-amber-500/10 text-amber-700 border-amber-500/30',
    expert: 'bg-red-500/10 text-red-700 border-red-500/30'
  };

  const difficultyLabels = {
    easy: t('game.difficulty.easy', 'Facile'),
    medium: t('game.difficulty.medium', 'Moyen'),
    hard: t('game.difficulty.hard', 'Difficile'),
    expert: t('game.difficulty.expert', 'Expert')
  };

  const TrendIcon = analysis.trend === 'increase' ? TrendingUp : analysis.trend === 'decrease' ? TrendingDown : Minus;
  const trendColor = analysis.trend === 'increase' ? 'text-amber-500' : analysis.trend === 'decrease' ? 'text-green-500' : 'text-muted-foreground';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          {t('game.difficulty.adaptiveTitle', 'Moteur Adaptatif')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Difficulty */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {t('game.difficulty.current', 'Niveau actuel')}
          </span>
          <Badge variant="outline" className={difficultyColors[currentDifficulty.level]}>
            {difficultyLabels[currentDifficulty.level]}
          </Badge>
        </div>

        {/* Player Metrics */}
        <div className="space-y-3 p-3 rounded-lg bg-muted/30">
          <div className="flex items-center justify-between text-sm">
            <span>{t('game.difficulty.successRate', 'Taux de réussite')}</span>
            <span className="font-medium">{Math.round(playerMetrics.successRate * 100)}%</span>
          </div>
          <Progress value={playerMetrics.successRate * 100} className="h-2" />

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="text-center p-2 rounded bg-background">
              <div className="text-lg font-bold text-green-600">{playerMetrics.consecutiveWins}</div>
              <div className="text-xs text-muted-foreground">{t('game.difficulty.wins', 'Victoires consécutives')}</div>
            </div>
            <div className="text-center p-2 rounded bg-background">
              <div className="text-lg font-bold text-red-600">{playerMetrics.consecutiveLosses}</div>
              <div className="text-xs text-muted-foreground">{t('game.difficulty.losses', 'Défaites consécutives')}</div>
            </div>
          </div>
        </div>

        {/* Analysis */}
        <div className="p-3 rounded-lg border">
          <div className="flex items-center gap-2 mb-2">
            <TrendIcon className={`w-5 h-5 ${trendColor}`} />
            <span className="font-medium">
              {analysis.trend === 'increase' 
                ? t('game.difficulty.trendUp', 'Tendance à la hausse')
                : analysis.trend === 'decrease'
                ? t('game.difficulty.trendDown', 'Tendance à la baisse')
                : t('game.difficulty.trendStable', 'Tendance stable')}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{analysis.recommendation}</p>
          <div className="flex items-center gap-2 mt-2">
            <Target className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs">
              {t('game.difficulty.confidence', 'Confiance')}: {Math.round(analysis.confidence)}%
            </span>
          </div>
        </div>

        {/* Difficulty Parameters */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('game.difficulty.eventFreq', 'Fréquence événements')}</span>
            <span>{currentDifficulty.eventFrequency}x</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('game.difficulty.riskMult', 'Multiplicateur risque')}</span>
            <span>{currentDifficulty.riskMultiplier}x</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('game.difficulty.rewardMult', 'Multiplicateur récompense')}</span>
            <span>{currentDifficulty.rewardMultiplier}x</span>
          </div>
        </div>

        {/* Risk Profile */}
        <div className="flex items-center justify-between p-2 rounded bg-muted/50">
          <span className="text-sm flex items-center gap-2">
            <Zap className="w-4 h-4" />
            {t('game.difficulty.riskProfile', 'Profil de risque')}
          </span>
          <Badge variant="secondary">
            {analysis.riskProfile === 'aggressive' 
              ? t('game.difficulty.aggressive', 'Agressif')
              : analysis.riskProfile === 'balanced'
              ? t('game.difficulty.balanced', 'Équilibré')
              : t('game.difficulty.conservative', 'Conservateur')}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
