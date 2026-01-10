import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGameStatistics } from '@/hooks/useGameStatistics';
import {
  ACHIEVEMENTS,
  Achievement,
  getUnlockedAchievements,
  getLockedAchievements,
  getRarityColor,
  getCategoryLabel,
} from '@/lib/achievements';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Lock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AchievementsPanel() {
  const { t } = useTranslation();
  const { stats, loading } = useGameStatistics();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse text-muted-foreground text-center">
            {t('common.loading', 'Loading...')}
          </div>
        </CardContent>
      </Card>
    );
  }

  const unlockedAchievements = getUnlockedAchievements(stats);
  const lockedAchievements = getLockedAchievements(stats);
  const totalAchievements = ACHIEVEMENTS.length;
  const progressPercent = Math.round((unlockedAchievements.length / totalAchievements) * 100);

  const categories = ['all', 'exploration', 'risk', 'mastery', 'special'];

  const filterByCategory = (achievements: Achievement[]) => {
    if (selectedCategory === 'all') return achievements;
    return achievements.filter(a => a.category === selectedCategory);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              {t('achievements.title', 'Succès')}
            </CardTitle>
            <CardDescription>
              {unlockedAchievements.length}/{totalAchievements} {t('achievements.unlocked', 'débloqués')}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{progressPercent}%</div>
          </div>
        </div>
        <Progress value={progressPercent} className="h-2 mt-2" />
      </CardHeader>
      <CardContent>
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map(cat => (
            <Badge
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === 'all' ? t('common.all', 'All') : getCategoryLabel(cat as Achievement['category'])}
            </Badge>
          ))}
        </div>

        <Tabs defaultValue="unlocked">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="unlocked" className="gap-2">
              <CheckCircle2 className="w-4 h-4" />
              {t('achievements.unlocked', 'Unlocked')} ({filterByCategory(unlockedAchievements).length})
            </TabsTrigger>
            <TabsTrigger value="locked" className="gap-2">
              <Lock className="w-4 h-4" />
              {t('achievements.locked', 'Locked')} ({filterByCategory(lockedAchievements).length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="unlocked">
            <div className="grid gap-3">
              {filterByCategory(unlockedAchievements).length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  {t('achievements.noneInCategory', 'No achievements unlocked in this category')}
                </div>
              ) : (
                filterByCategory(unlockedAchievements).map(achievement => (
                  <AchievementCard 
                    key={achievement.id} 
                    achievement={achievement} 
                    unlocked 
                    stats={stats}
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="locked">
            <div className="grid gap-3">
              {filterByCategory(lockedAchievements).length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  {t('achievements.allUnlocked', 'All achievements in this category are unlocked! 🎉')}
                </div>
              ) : (
                filterByCategory(lockedAchievements).map(achievement => (
                  <AchievementCard 
                    key={achievement.id} 
                    achievement={achievement} 
                    unlocked={false}
                    stats={stats}
                  />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function AchievementCard({ 
  achievement, 
  unlocked,
  stats,
}: { 
  achievement: Achievement; 
  unlocked: boolean;
  stats: ReturnType<typeof useGameStatistics>['stats'];
}) {
  const { t } = useTranslation();
  const progress = achievement.progress?.(stats);

  return (
    <div
      className={cn(
        "p-4 rounded-lg border transition-all",
        unlocked 
          ? getRarityColor(achievement.rarity)
          : "bg-muted/50 border-border opacity-70"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "text-3xl",
          !unlocked && "grayscale opacity-50"
        )}>
          {achievement.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold">{achievement.name}</h4>
            {unlocked && (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            {achievement.description}
          </p>
            {progress && !unlocked && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{t('achievements.progress', 'Progress')}</span>
                <span>{progress.current}/{progress.target}</span>
              </div>
              <Progress 
                value={(progress.current / progress.target) * 100} 
                className="h-1.5" 
              />
            </div>
          )}
        </div>
        <Badge 
          variant="outline" 
          className={cn(
            "text-xs capitalize",
            unlocked && getRarityColor(achievement.rarity)
          )}
        >
          {achievement.rarity}
        </Badge>
      </div>
    </div>
  );
}