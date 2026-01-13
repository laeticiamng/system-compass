import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { GameResources, ResourceType } from '@/lib/game-data';
import { PyramidType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Target, Trophy, Star, Zap, ChevronDown, ChevronUp } from 'lucide-react';

export interface Quest {
  id: string;
  type: 'turn' | 'game' | 'milestone';
  title: string;
  description: string;
  icon: string;
  condition: (context: QuestContext) => boolean;
  progress: (context: QuestContext) => { current: number; target: number };
  reward: {
    resources?: Partial<GameResources>;
    pyramidPoints?: Partial<Record<PyramidType, number>>;
    bonus?: string;
  };
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
}

interface QuestContext {
  turnNumber: number;
  resources: GameResources;
  pyramidScores: Record<PyramidType, number>;
  countriesVisited: string[];
  actionsCompleted: number;
  risksSucceeded: number;
  risksFailed: number;
  moneyEarned: number;
  previousResources?: GameResources;
}

// Quêtes générées dynamiquement
export function generateTurnQuests(context: QuestContext): Quest[] {
  const quests: Quest[] = [];
  
  // Quête de survie si ressources basses
  if (context.resources.health <= 3) {
    quests.push({
      id: 'survive_health',
      type: 'turn',
      title: 'Survivant',
      description: 'Terminer le tour avec au moins 3 de santé',
      icon: '❤️',
      condition: (ctx) => ctx.resources.health >= 3,
      progress: (ctx) => ({ current: ctx.resources.health, target: 3 }),
      reward: { resources: { health: 1 } },
      difficulty: 'medium',
    });
  }

  // Quête d'enrichissement
  if (context.turnNumber % 3 === 0) {
    quests.push({
      id: 'earn_money',
      type: 'turn',
      title: 'Opportuniste',
      description: 'Gagner au moins 2 points d\'argent ce tour',
      icon: '💰',
      condition: (ctx) => {
        const prev = ctx.previousResources?.money || ctx.resources.money;
        return ctx.resources.money - prev >= 2;
      },
      progress: (ctx) => {
        const prev = ctx.previousResources?.money || 0;
        return { current: Math.max(0, ctx.resources.money - prev), target: 2 };
      },
      reward: { resources: { network: 1 } },
      difficulty: 'easy',
    });
  }

  // Quête de réseau
  if (context.resources.network <= 2) {
    quests.push({
      id: 'build_network',
      type: 'turn',
      title: 'Connecté',
      description: 'Atteindre 4 points de réseau',
      icon: '🤝',
      condition: (ctx) => ctx.resources.network >= 4,
      progress: (ctx) => ({ current: ctx.resources.network, target: 4 }),
      reward: { resources: { skills: 1 } },
      difficulty: 'medium',
    });
  }

  // Quête de compétences
  if (context.turnNumber >= 5 && context.resources.skills < 5) {
    quests.push({
      id: 'skill_up',
      type: 'turn',
      title: 'Autodidacte',
      description: 'Atteindre 5 points de compétences',
      icon: '🎓',
      condition: (ctx) => ctx.resources.skills >= 5,
      progress: (ctx) => ({ current: ctx.resources.skills, target: 5 }),
      reward: { resources: { money: 2 } },
      difficulty: 'hard',
    });
  }

  return quests.slice(0, 3); // Maximum 3 quêtes par tour
}

export function generateGameQuests(turnNumber: number): Quest[] {
  const quests: Quest[] = [
    {
      id: 'first_5_turns',
      type: 'milestone',
      title: 'Démarrage',
      description: 'Survivre 5 tours',
      icon: '🏁',
      condition: (ctx) => ctx.turnNumber >= 5,
      progress: (ctx) => ({ current: ctx.turnNumber, target: 5 }),
      reward: { bonus: 'Débloque actions avancées' },
      difficulty: 'easy',
    },
    {
      id: 'balanced_resources',
      type: 'game',
      title: 'Équilibriste',
      description: 'Avoir toutes les ressources à 4+',
      icon: '⚖️',
      condition: (ctx) => Object.values(ctx.resources).every(v => v >= 4),
      progress: (ctx) => {
        const above4 = Object.values(ctx.resources).filter(v => v >= 4).length;
        return { current: above4, target: 7 };
      },
      reward: { pyramidPoints: { STABILITY_REDIS: 2 } },
      difficulty: 'hard',
    },
    {
      id: 'risk_master',
      type: 'game',
      title: 'Maître du risque',
      description: 'Réussir 5 événements risqués',
      icon: '🎲',
      condition: (ctx) => ctx.risksSucceeded >= 5,
      progress: (ctx) => ({ current: ctx.risksSucceeded, target: 5 }),
      reward: { resources: { money: 3 } },
      difficulty: 'medium',
    },
    {
      id: 'wealthy',
      type: 'milestone',
      title: 'Prospère',
      description: 'Accumuler 8+ d\'argent',
      icon: '💎',
      condition: (ctx) => ctx.resources.money >= 8,
      progress: (ctx) => ({ current: ctx.resources.money, target: 8 }),
      reward: { pyramidPoints: { GROWTH_RISK: 3 } },
      difficulty: 'legendary',
    },
  ];

  return quests;
}

interface QuestTrackerProps {
  context: QuestContext;
  onQuestComplete?: (quest: Quest) => void;
  compact?: boolean;
}

export default function QuestTracker({ context, onQuestComplete, compact = false }: QuestTrackerProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(!compact);

  const turnQuests = useMemo(() => generateTurnQuests(context), [context.turnNumber, context.resources]);
  const gameQuests = useMemo(() => generateGameQuests(context.turnNumber), [context.turnNumber]);

  const allQuests = [...turnQuests, ...gameQuests];
  const completedCount = allQuests.filter(q => q.condition(context)).length;

  const difficultyColors = {
    easy: 'border-emerald-500/30 bg-emerald-500/5',
    medium: 'border-amber-500/30 bg-amber-500/5',
    hard: 'border-rose-500/30 bg-rose-500/5',
    legendary: 'border-purple-500/30 bg-purple-500/5',
  };

  const difficultyBadge = {
    easy: { label: 'Facile', color: 'bg-emerald-500/20 text-emerald-400' },
    medium: { label: 'Moyen', color: 'bg-amber-500/20 text-amber-400' },
    hard: { label: 'Difficile', color: 'bg-rose-500/20 text-rose-400' },
    legendary: { label: 'Légendaire', color: 'bg-purple-500/20 text-purple-400' },
  };

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      {/* Header */}
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-primary/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          <span className="font-semibold">Objectifs</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
            {completedCount}/{allQuests.length}
          </span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {/* Content */}
      {expanded && (
        <div className="p-4 pt-0 space-y-4">
          {/* Quêtes du tour */}
          {turnQuests.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
                <Zap className="w-3 h-3" /> Ce tour
              </h4>
              <div className="space-y-2">
                {turnQuests.map(quest => {
                  const isComplete = quest.condition(context);
                  const prog = quest.progress(context);
                  
                  return (
                    <div
                      key={quest.id}
                      className={cn(
                        "p-3 rounded-lg border-2 transition-all",
                        isComplete 
                          ? "border-emerald-500/50 bg-emerald-500/10" 
                          : difficultyColors[quest.difficulty]
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <span className={cn(
                          "text-xl",
                          isComplete && "animate-bounce"
                        )}>
                          {isComplete ? '✓' : quest.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={cn(
                              "font-medium text-sm",
                              isComplete && "line-through text-muted-foreground"
                            )}>
                              {quest.title}
                            </span>
                            <span className={cn("text-xs px-1.5 py-0.5 rounded-full", difficultyBadge[quest.difficulty].color)}>
                              {difficultyBadge[quest.difficulty].label}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">{quest.description}</p>
                          
                          {/* Barre de progression */}
                          {!isComplete && (
                            <div className="mt-2">
                              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary rounded-full transition-all"
                                  style={{ width: `${(prog.current / prog.target) * 100}%` }}
                                />
                              </div>
                              <div className="text-xs text-right mt-0.5 text-muted-foreground">
                                {prog.current}/{prog.target}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quêtes de partie */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
              <Trophy className="w-3 h-3" /> Objectifs de partie
            </h4>
            <div className="space-y-2">
              {gameQuests.slice(0, 3).map(quest => {
                const isComplete = quest.condition(context);
                const prog = quest.progress(context);
                
                return (
                  <div
                    key={quest.id}
                    className={cn(
                      "p-3 rounded-lg border transition-all",
                      isComplete 
                        ? "border-amber-500/50 bg-amber-500/10" 
                        : "border-border/50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{quest.icon}</span>
                      <div className="flex-1">
                        <span className="font-medium text-sm">{quest.title}</span>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={cn(
                                "h-full rounded-full transition-all",
                                isComplete ? "bg-amber-500" : "bg-primary/60"
                              )}
                              style={{ width: `${Math.min((prog.current / prog.target) * 100, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {prog.current}/{prog.target}
                          </span>
                        </div>
                      </div>
                      {isComplete && <Star className="w-4 h-4 text-amber-400" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}