import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  CharacterCard, 
  GameResources, 
  RESOURCE_INFO,
  ResourceType,
  CharacterAspiration 
} from '@/lib/game-data';
import { PyramidType, PYRAMID_TYPE_INFO } from '@/lib/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { 
  Trophy, 
  Target, 
  Heart, 
  Star,
  Award,
  RotateCcw,
  Share2,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

interface PlayerEndState {
  id: number;
  name: string;
  character?: CharacterCard;
  resources: GameResources;
  scores: Record<PyramidType, number>;
  position: number;
}

interface GameStats {
  risksTaken: number;
  risksSucceeded: number;
  risksFailed: number;
  risksCatastrophic: number;
  actionsCompleted: number;
  actionsFailed: number;
  countriesVisited: string[];
  totalMoneyEarned: number;
  totalMoneyLost: number;
  healthLost: number;
}

interface GameEndSummaryProps {
  players: PlayerEndState[];
  turnCount: number;
  gameMode: 'solo' | 'race' | 'points_duel' | 'cooperative';
  gameStats?: GameStats;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
}

interface AspirationResult {
  aspiration: CharacterAspiration;
  achieved: boolean;
  score: number;
  maxScore: number;
  progress: number;
}

function evaluateAspirations(
  player: PlayerEndState,
  scores: Record<PyramidType, number>
): AspirationResult[] {
  if (!player.character) return [];
  
  const results: AspirationResult[] = [];
  const allAspirations = [
    ...player.character.majorAspirations,
    player.character.minorAspiration
  ];

  allAspirations.forEach(asp => {
    let totalScore = 0;
    let maxPossible = 0;
    
    asp.targetPyramids.forEach(pyramid => {
      totalScore += scores[pyramid] || 0;
      maxPossible += 20; // Arbitrary max per pyramid
    });
    
    const progress = maxPossible > 0 ? (totalScore / maxPossible) * 100 : 0;
    const achieved = progress >= 60; // 60% threshold for success
    
    results.push({
      aspiration: asp,
      achieved,
      score: totalScore,
      maxScore: maxPossible,
      progress: Math.min(100, progress)
    });
  });

  return results;
}

function calculateLifeScore(player: PlayerEndState): {
  total: number;
  breakdown: { category: string; score: number; max: number; icon: string }[];
  verdict: 'exceptional' | 'successful' | 'average' | 'struggling' | 'critical';
} {
  const breakdown: { category: string; score: number; max: number; icon: string }[] = [];
  
  // Resources score (max 60)
  const resourceTotal = Object.values(player.resources).reduce((a, b) => a + b, 0);
  const resourceMax = 60;
  breakdown.push({ 
    category: 'gameEnd.finalResources', 
    score: resourceTotal, 
    max: resourceMax,
    icon: '💎'
  });

  // Pyramid diversity (max 30)
  const nonZeroPyramids = Object.values(player.scores).filter(s => s > 0).length;
  const pyramidDiversity = nonZeroPyramids * 5;
  breakdown.push({ 
    category: 'gameEnd.experienceDiversity', 
    score: pyramidDiversity, 
    max: 30,
    icon: '🌍'
  });

  // Aspirations (max 40)
  const aspirationResults = evaluateAspirations(player, player.scores);
  const aspirationScore = aspirationResults.filter(a => a.achieved).length * 
    (40 / Math.max(1, aspirationResults.length));
  breakdown.push({ 
    category: 'gameEnd.goalsAchieved', 
    score: Math.round(aspirationScore), 
    max: 40,
    icon: '🎯'
  });

  // Health bonus (max 20)
  const healthScore = player.resources.health * 2;
  breakdown.push({ 
    category: 'gameEnd.healthPreserved', 
    score: healthScore, 
    max: 20,
    icon: '❤️'
  });

  // Network bonus (max 20)
  const networkScore = player.resources.network * 2;
  breakdown.push({ 
    category: 'gameEnd.networkDeveloped', 
    score: networkScore, 
    max: 20,
    icon: '🤝'
  });

  const total = breakdown.reduce((sum, b) => sum + b.score, 0);
  const maxTotal = breakdown.reduce((sum, b) => sum + b.max, 0);
  const percentage = (total / maxTotal) * 100;

  let verdict: 'exceptional' | 'successful' | 'average' | 'struggling' | 'critical';
  if (percentage >= 80) verdict = 'exceptional';
  else if (percentage >= 60) verdict = 'successful';
  else if (percentage >= 40) verdict = 'average';
  else if (percentage >= 20) verdict = 'struggling';
  else verdict = 'critical';

  return { total, breakdown, verdict };
}

const VERDICT_ICONS = {
  exceptional: '🌟',
  successful: '✨',
  average: '🏠',
  struggling: '💪',
  critical: '🔥'
};

const VERDICT_COLORS = {
  exceptional: { color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  successful: { color: 'text-blue-400', bg: 'bg-blue-500/20' },
  average: { color: 'text-amber-400', bg: 'bg-amber-500/20' },
  struggling: { color: 'text-orange-400', bg: 'bg-orange-500/20' },
  critical: { color: 'text-red-400', bg: 'bg-red-500/20' }
};

export default function GameEndSummary({
  players,
  turnCount,
  gameMode,
  gameStats,
  onPlayAgain,
  onBackToMenu
}: GameEndSummaryProps) {
  const { t } = useTranslation();

  // Calculate results for all players
  const playerResults = useMemo(() => {
    return players.map(player => ({
      player,
      lifeScore: calculateLifeScore(player),
      aspirations: evaluateAspirations(player, player.scores)
    }));
  }, [players]);

  // Sort by total score for ranking
  const rankedResults = [...playerResults].sort(
    (a, b) => b.lifeScore.total - a.lifeScore.total
  );

  const winner = rankedResults[0];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary mb-6">
            <Trophy className="w-10 h-10" />
          </div>
          <h1 className="font-display text-4xl font-bold mb-4">
            {t('gameEnd.title')}
          </h1>
          <p className="text-xl text-muted-foreground">
            {t('gameEnd.yearsSimulated', { count: turnCount })}
          </p>
        </div>

        {/* Winner announcement for multiplayer */}
        {players.length > 1 && gameMode !== 'cooperative' && (
          <div className="glass-card rounded-2xl p-8 mb-8 text-center animate-scale-in border-2 border-primary/50">
            <div className="text-4xl mb-4">👑</div>
            <h2 className="font-display text-2xl font-bold mb-2">
              {t('gameEnd.victory', { name: winner.player.name })}
            </h2>
            <p className="text-muted-foreground">
              {t('gameEnd.lifeScore', { score: winner.lifeScore.total })}
            </p>
          </div>
        )}

        {/* Player Results */}
        <div className="space-y-8">
          {rankedResults.map((result, index) => {
            const { player, lifeScore, aspirations } = result;
            const verdictColors = VERDICT_COLORS[lifeScore.verdict];

            return (
              <div
                key={player.id}
                className={cn(
                  "glass-card rounded-2xl overflow-hidden animate-fade-in",
                  index === 0 && players.length > 1 && "ring-2 ring-primary"
                )}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Player Header */}
                <div className={cn("p-6", verdictColors.bg)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {players.length > 1 && (
                        <div className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl",
                          index === 0 ? "bg-primary text-primary-foreground" : "bg-muted"
                        )}>
                          #{index + 1}
                        </div>
                      )}
                      <div>
                        <h3 className="font-display text-xl font-bold">{player.name}</h3>
                        {player.character && (
                          <p className="text-sm text-muted-foreground">
                            {player.character.birthCountry}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl mb-1">{VERDICT_ICONS[lifeScore.verdict]}</div>
                      <p className={cn("font-bold", verdictColors.color)}>
                        {t(`gameEnd.verdicts.${lifeScore.verdict}.label`)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-8">
                  {/* Verdict */}
                  <div className="text-center p-6 rounded-xl bg-muted/30 space-y-3">
                    <p className="text-lg">{t(`gameEnd.verdicts.${lifeScore.verdict}.description`)}</p>
                    <p className="text-xs text-muted-foreground italic">
                      {t('gameEnd.verdicts.disclaimer')}
                    </p>
                  </div>

                  {/* Score Breakdown */}
                  <div>
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <Award className="w-5 h-5 text-primary" />
                      {t('gameEnd.lifeReport')}
                    </h4>
                    <div className="space-y-3">
                      {lifeScore.breakdown.map(item => (
                        <div key={item.category} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2">
                              <span>{item.icon}</span>
                              {t(item.category)}
                            </span>
                            <span className="font-mono">{item.score}/{item.max}</span>
                          </div>
                          <Progress 
                            value={(item.score / item.max) * 100} 
                            className="h-2" 
                          />
                        </div>
                      ))}
                      <div className="pt-3 border-t flex items-center justify-between font-bold">
                        <span>{t('gameEnd.totalScore')}</span>
                        <span className="text-xl text-primary">{lifeScore.total}</span>
                      </div>
                    </div>
                  </div>

                  {/* Aspirations */}
                  {aspirations.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5 text-primary" />
                        {t('gameEnd.lifeGoals')}
                      </h4>
                      <div className="grid gap-3">
                        {aspirations.map(asp => (
                          <div 
                            key={asp.aspiration.id}
                            className={cn(
                              "p-4 rounded-lg border flex items-center gap-4",
                              asp.achieved 
                                ? "bg-emerald-500/10 border-emerald-500/30"
                                : "bg-muted/30 border-border"
                            )}
                          >
                            <div className="text-2xl">{asp.aspiration.icon}</div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {t(asp.aspiration.label)}
                                </span>
                                {asp.achieved ? (
                                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-muted-foreground" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {t(asp.aspiration.description)}
                              </p>
                            </div>
                            <div className="text-right">
                              <Progress 
                                value={asp.progress} 
                                className="w-20 h-2" 
                              />
                              <span className="text-xs text-muted-foreground">
                                {Math.round(asp.progress)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Final Resources */}
                  <div>
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <Heart className="w-5 h-5 text-primary" />
                      {t('gameEnd.finalState')}
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                      {(Object.entries(player.resources) as [ResourceType, number][]).map(([res, val]) => {
                        const info = RESOURCE_INFO[res];
                        const level = val >= 7 ? 'high' : val >= 4 ? 'medium' : 'low';
                        return (
                          <div 
                            key={res}
                            className={cn(
                              "p-3 rounded-lg text-center",
                              level === 'high' && "bg-emerald-500/10",
                              level === 'medium' && "bg-amber-500/10",
                              level === 'low' && "bg-red-500/10"
                            )}
                          >
                            <div className="text-2xl mb-1">{info.icon}</div>
                            <div className="text-xs text-muted-foreground mb-1">
                              {t(info.label)}
                            </div>
                            <div className={cn(
                              "font-bold",
                              level === 'high' && "text-emerald-400",
                              level === 'medium' && "text-amber-400",
                              level === 'low' && "text-red-400"
                            )}>
                              {val}/10
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Pyramid Scores */}
                  <div>
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <Star className="w-5 h-5 text-primary" />
                      {t('gameEnd.experiencesBySystem')}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {(Object.entries(player.scores) as [PyramidType, number][])
                        .sort(([, a], [, b]) => b - a)
                        .map(([pyramid, score]) => {
                          const info = PYRAMID_TYPE_INFO[pyramid];
                          return (
                            <div 
                              key={pyramid}
                              className="p-3 rounded-lg bg-muted/30 flex items-center gap-2"
                            >
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: info.color }}
                              />
                              <span className="text-xs flex-1 truncate">
                                {info.label}
                              </span>
                              <span className="font-mono text-sm font-bold">
                                {score}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Game Statistics */}
        {gameStats && (gameStats.risksTaken > 0 || gameStats.actionsCompleted > 0) && (
          <div className="glass-card rounded-2xl p-6 mt-8 animate-fade-in">
            <h3 className="font-display text-xl font-bold mb-6 flex items-center gap-2">
              📊 {t('gameEnd.statistics')}
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Risks */}
              {gameStats.risksTaken > 0 && (
                <>
                  <div className="p-4 rounded-lg bg-red-500/10 text-center">
                    <div className="text-2xl mb-1">⚠️</div>
                    <div className="text-2xl font-bold text-red-400">{gameStats.risksTaken}</div>
                    <div className="text-xs text-muted-foreground">{t('gameEnd.risksTaken')}</div>
                  </div>
                  <div className="p-4 rounded-lg bg-emerald-500/10 text-center">
                    <div className="text-2xl mb-1">✅</div>
                    <div className="text-2xl font-bold text-emerald-400">{gameStats.risksSucceeded}</div>
                    <div className="text-xs text-muted-foreground">{t('gameEnd.risksSucceeded')}</div>
                  </div>
                  <div className="p-4 rounded-lg bg-amber-500/10 text-center">
                    <div className="text-2xl mb-1">❌</div>
                    <div className="text-2xl font-bold text-amber-400">{gameStats.risksFailed}</div>
                    <div className="text-xs text-muted-foreground">{t('gameEnd.risksFailed')}</div>
                  </div>
                  <div className="p-4 rounded-lg bg-red-500/10 text-center">
                    <div className="text-2xl mb-1">💀</div>
                    <div className="text-2xl font-bold text-red-400">{gameStats.risksCatastrophic}</div>
                    <div className="text-xs text-muted-foreground">{t('gameEnd.risksCatastrophic')}</div>
                  </div>
                </>
              )}
              
              {/* Actions */}
              <div className="p-4 rounded-lg bg-blue-500/10 text-center">
                <div className="text-2xl mb-1">🎯</div>
                <div className="text-2xl font-bold text-blue-400">{gameStats.actionsCompleted}</div>
                <div className="text-xs text-muted-foreground">{t('gameEnd.actionsCompleted')}</div>
              </div>
              <div className="p-4 rounded-lg bg-orange-500/10 text-center">
                <div className="text-2xl mb-1">💸</div>
                <div className="text-2xl font-bold text-orange-400">{gameStats.totalMoneyLost}</div>
                <div className="text-xs text-muted-foreground">{t('gameEnd.moneyLost')}</div>
              </div>
              <div className="p-4 rounded-lg bg-rose-500/10 text-center">
                <div className="text-2xl mb-1">💔</div>
                <div className="text-2xl font-bold text-rose-400">{gameStats.healthLost}</div>
                <div className="text-xs text-muted-foreground">{t('gameEnd.healthLost')}</div>
              </div>
              
              {/* Countries visited */}
              {gameStats.countriesVisited.length > 0 && (
                <div className="p-4 rounded-lg bg-purple-500/10 text-center col-span-2 md:col-span-1">
                  <div className="text-2xl mb-1">🌍</div>
                  <div className="text-2xl font-bold text-purple-400">{gameStats.countriesVisited.length}</div>
                  <div className="text-xs text-muted-foreground">{t('gameEnd.countriesVisited')}</div>
                </div>
              )}
            </div>

            {/* Risk Analysis */}
            {gameStats.risksTaken > 0 && (
              <div className="mt-6 p-4 rounded-lg bg-muted/30">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  {t('gameEnd.riskAnalysis')}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {gameStats.risksTaken === 0 
                    ? t('gameEnd.prudentPlay')
                    : gameStats.risksSucceeded > gameStats.risksFailed 
                      ? t('gameEnd.luckyRisks')
                      : gameStats.risksCatastrophic > 0
                        ? t('gameEnd.catastrophicRisks')
                        : t('gameEnd.riskyConsequences')
                  }
                </p>
              </div>
            )}
          </div>
        )}

        {/* Strategic Insights */}
        <div className="glass-card rounded-2xl p-6 mt-8 animate-fade-in">
          <h3 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
            💡 {t('gameEnd.insights', 'Ce que le jeu révèle')}
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <h4 className="font-semibold text-sm mb-2">{t('gameEnd.insightRisk', 'Votre rapport au risque')}</h4>
              <p className="text-sm text-muted-foreground">
                {gameStats && gameStats.risksTaken > 5 
                  ? t('gameEnd.riskTakerProfile', 'Vous n\'hésitez pas à prendre des risques - attention à ne pas confondre audace et précipitation.')
                  : t('gameEnd.cautionProfile', 'Vous préférez la prudence - parfois, un risque calculé ouvre des opportunités.')}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <h4 className="font-semibold text-sm mb-2">{t('gameEnd.insightSystem', 'Votre navigation systémique')}</h4>
              <p className="text-sm text-muted-foreground">
                {(rankedResults[0]?.lifeScore.breakdown.find(b => b.category === 'gameEnd.experienceDiversity')?.score ?? 0) >= 20
                  ? t('gameEnd.diverseProfile', 'Vous avez su naviguer entre différents systèmes - une compétence précieuse.')
                  : t('gameEnd.focusedProfile', 'Vous êtes resté dans votre zone - explorer d\'autres pyramides pourrait élargir vos options.')}
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4 italic text-center">
            {t('gameEnd.insightDisclaimer', 'Ce jeu est un outil de réflexion, pas une prédiction. La vraie vie offre toujours plus de nuances.')}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 mt-12 justify-center">
          <Button variant="outline" onClick={onBackToMenu} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            {t('gameEnd.mainMenu')}
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => {
            const shareText = `🎮 J'ai joué à System Compass et obtenu un score de ${rankedResults[0]?.lifeScore.total || 0}! Verdict: ${t(`gameEnd.verdicts.${rankedResults[0]?.lifeScore.verdict}.label`)}`;
            if (navigator.share) {
              navigator.share({ text: shareText, url: window.location.origin + '/life-game' });
            } else {
              navigator.clipboard.writeText(shareText);
              toast.success(t('common.copied', 'Copié !'));
            }
          }}>
            <Share2 className="w-4 h-4" />
            {t('gameEnd.share', 'Partager')}
          </Button>
          <Button onClick={onPlayAgain} className="gap-2">
            <Trophy className="w-4 h-4" />
            {t('gameEnd.playAgain')}
          </Button>
        </div>
      </div>
    </div>
  );
}