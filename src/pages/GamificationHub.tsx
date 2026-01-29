import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Trophy, 
  Star, 
  Target, 
  Flame, 
  Medal,
  Gift,
  TrendingUp,
  Lock,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BADGES, 
  LEVEL_THRESHOLDS, 
  PHASES, 
  DAILY_CHALLENGES,
  WEEKLY_CHALLENGES,
  calculateLevel,
  getXpToNextLevel,
  getRarityColor,
  getRarityBgColor,
  type Badge as BadgeType,
  type UserLevel,
  type UserPhase
} from '@/lib/gamification-system';
import { cn } from '@/lib/utils';

// Mock user progress (in real app, this would come from the database)
const mockUserProgress = {
  userId: 'demo',
  xp: 1250,
  level: 'explorer' as UserLevel,
  badges: ['first-steps', 'curious-mind'],
  phase: 'exploration' as UserPhase,
  achievements: [],
  streak: 5,
  lastActive: new Date().toISOString(),
  createdAt: new Date().toISOString(),
};

function LevelProgress({ xp }: { xp: number }) {
  const level = calculateLevel(xp);
  const levelInfo = LEVEL_THRESHOLDS[level];
  const progress = getXpToNextLevel(xp);
  const nextLevel = Object.entries(LEVEL_THRESHOLDS).find(
    ([, info]) => info.minXp > xp
  );
  
  return (
    <Card className="glass-card overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/5" />
      <CardContent className="relative p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-3xl">
            {levelInfo.icon}
          </div>
          <div>
            <div className="text-2xl font-bold">{levelInfo.title}</div>
            <div className="text-muted-foreground">Niveau actuel</div>
          </div>
          <div className="ml-auto text-right">
            <div className="text-3xl font-bold text-primary">{xp}</div>
            <div className="text-sm text-muted-foreground">XP total</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progression vers {nextLevel?.[1].title || 'Niveau max'}</span>
            <span className="font-medium">{progress.percentage.toFixed(0)}%</span>
          </div>
          <Progress value={progress.percentage} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{progress.current} XP</span>
            <span>{progress.required} XP nécessaires</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PhaseTracker({ currentPhase }: { currentPhase: UserPhase }) {
  const phases = Object.entries(PHASES).sort(([, a], [, b]) => a.order - b.order);
  const currentIndex = phases.findIndex(([key]) => key === currentPhase);
  
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Votre parcours
        </CardTitle>
        <CardDescription>
          Les 4 phases de votre projet d'expatriation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Progress line */}
          <div className="absolute left-7 top-6 bottom-6 w-0.5 bg-muted" />
          <div 
            className="absolute left-7 top-6 w-0.5 bg-primary transition-all duration-500"
            style={{ height: `${(currentIndex / (phases.length - 1)) * 100}%` }}
          />
          
          <div className="space-y-6">
            {phases.map(([key, phase], index) => {
              const isActive = key === currentPhase;
              const isComplete = index < currentIndex;
              
              return (
                <div key={key} className="flex items-start gap-4">
                  <div className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center text-2xl relative z-10 transition-all",
                    isActive ? "bg-primary text-primary-foreground ring-4 ring-primary/30" :
                    isComplete ? "bg-primary/20" : "bg-muted"
                  )}>
                    {isComplete ? <CheckCircle className="w-6 h-6 text-primary" /> : phase.icon}
                  </div>
                  <div className={cn(
                    "flex-1 pt-2",
                    !isActive && !isComplete && "opacity-50"
                  )}>
                    <div className="font-medium">{phase.title}</div>
                    <div className="text-sm text-muted-foreground">{phase.description}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function BadgeCard({ badge, unlocked }: { badge: BadgeType; unlocked: boolean }) {
  return (
    <div className={cn(
      "p-4 rounded-lg border transition-all",
      unlocked 
        ? `${getRarityBgColor(badge.rarity)} border-current` 
        : "bg-muted/30 border-muted opacity-60"
    )}>
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-12 h-12 rounded-lg flex items-center justify-center text-2xl",
          unlocked ? getRarityBgColor(badge.rarity) : "bg-muted"
        )}>
          {unlocked ? badge.icon : <Lock className="w-5 h-5 text-muted-foreground" />}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{badge.name}</span>
            <Badge variant="outline" className={cn("text-xs", getRarityColor(badge.rarity))}>
              {badge.rarity}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{badge.description}</p>
          <div className="flex items-center gap-1 mt-1 text-xs text-primary">
            <Star className="w-3 h-3" />
            <span>+{badge.xpReward} XP</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChallengeCard({ 
  challenge, 
  type 
}: { 
  challenge: typeof DAILY_CHALLENGES[0]; 
  type: 'daily' | 'weekly';
}) {
  const progress = Math.floor(Math.random() * 100); // Mock progress
  const isComplete = progress >= 100;
  
  return (
    <div className={cn(
      "p-4 rounded-lg border transition-all",
      isComplete ? "bg-emerald-500/10 border-emerald-500/30" : "bg-secondary/50 border-border"
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {type === 'daily' ? (
            <Zap className="w-5 h-5 text-amber-400" />
          ) : (
            <Target className="w-5 h-5 text-primary" />
          )}
          <span className="font-medium">{challenge.title}</span>
        </div>
        {isComplete ? (
          <CheckCircle className="w-5 h-5 text-emerald-400" />
        ) : (
          <Badge variant="secondary" className="text-xs">
            +{challenge.xpReward} XP
          </Badge>
        )}
      </div>
      <p className="text-sm text-muted-foreground mb-3">{challenge.description}</p>
      <Progress value={progress} className="h-2" />
    </div>
  );
}

function StreakCard({ streak }: { streak: number }) {
  return (
    <Card className="glass-card bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/30">
      <CardContent className="p-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center">
          <Flame className="w-8 h-8 text-orange-400" />
        </div>
        <div>
          <div className="text-4xl font-bold text-orange-400">{streak}</div>
          <div className="text-sm text-muted-foreground">jours consécutifs</div>
        </div>
        <div className="ml-auto">
          <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
            🔥 En feu !
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

export default function GamificationHub() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  
  const userProgress = mockUserProgress;
  const unlockedBadges = userProgress.badges;
  
  const badgesByCategory = {
    milestone: BADGES.filter(b => b.category === 'milestone'),
    achievement: BADGES.filter(b => b.category === 'achievement'),
    social: BADGES.filter(b => b.category === 'social'),
    rare: BADGES.filter(b => b.category === 'rare'),
  };
  
  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-4 flex items-center justify-center gap-3">
          <Trophy className="w-8 h-8 text-primary" />
          {t('gamification.title', 'Centre de progression')}
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {t('gamification.description', 'Suivez votre avancement, débloquez des badges et relevez des défis pour progresser dans votre projet.')}
        </p>
      </div>
      
      {/* Streak */}
      <StreakCard streak={userProgress.streak} />
      
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6 space-y-6">
        <TabsList className="grid w-full max-w-lg mx-auto grid-cols-3">
          <TabsTrigger value="overview" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Vue d'ensemble
          </TabsTrigger>
          <TabsTrigger value="badges" className="gap-2">
            <Medal className="w-4 h-4" />
            Badges
          </TabsTrigger>
          <TabsTrigger value="challenges" className="gap-2">
            <Target className="w-4 h-4" />
            Défis
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <LevelProgress xp={userProgress.xp} />
            <PhaseTracker currentPhase={userProgress.phase} />
          </div>
          
          {/* Recent badges */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-primary" />
                Badges récents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {BADGES.filter(b => unlockedBadges.includes(b.id))
                  .slice(0, 4)
                  .map(badge => (
                    <BadgeCard key={badge.id} badge={badge} unlocked={true} />
                  ))}
              </div>
              {unlockedBadges.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Medal className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Aucun badge débloqué pour l'instant</p>
                  <p className="text-sm">Explorez la plateforme pour gagner vos premiers badges !</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="badges" className="space-y-6">
          {Object.entries(badgesByCategory).map(([category, badges]) => (
            <Card key={category} className="glass-card">
              <CardHeader>
                <CardTitle className="capitalize">
                  {category === 'milestone' ? '🎯 Jalons' :
                   category === 'achievement' ? '🏆 Accomplissements' :
                   category === 'social' ? '👥 Social' : '✨ Rares'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {badges.map(badge => (
                    <BadgeCard 
                      key={badge.id} 
                      badge={badge} 
                      unlocked={unlockedBadges.includes(badge.id)} 
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="challenges" className="space-y-6">
          {/* Daily */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                Défis quotidiens
              </CardTitle>
              <CardDescription>
                Renouvelés chaque jour à minuit
              </CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              {DAILY_CHALLENGES.map(challenge => (
                <ChallengeCard key={challenge.id} challenge={challenge} type="daily" />
              ))}
            </CardContent>
          </Card>
          
          {/* Weekly */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Défis hebdomadaires
              </CardTitle>
              <CardDescription>
                Renouvelés chaque lundi
              </CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              {WEEKLY_CHALLENGES.map(challenge => (
                <ChallengeCard key={challenge.id} challenge={challenge} type="weekly" />
              ))}
            </CardContent>
          </Card>
          
          {/* CTA */}
          <div className="text-center">
            <Button size="lg" className="gap-2">
              <Zap className="w-5 h-5" />
              Commencer un défi
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
