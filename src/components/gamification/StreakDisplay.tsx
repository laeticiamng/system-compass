import { motion } from 'framer-motion';
import { Flame, Calendar, Trophy } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StreakDisplayProps {
  streak: number;
  lastActiveDate?: string;
  compact?: boolean;
}

const STREAK_MILESTONES = [
  { days: 7, label: '1 semaine', icon: '🔥' },
  { days: 14, label: '2 semaines', icon: '💪' },
  { days: 30, label: '1 mois', icon: '🏆' },
  { days: 60, label: '2 mois', icon: '⭐' },
  { days: 90, label: '3 mois', icon: '👑' },
  { days: 180, label: '6 mois', icon: '💎' },
  { days: 365, label: '1 an', icon: '🎯' },
];

function getStreakLevel(streak: number): { color: string; label: string; gradient: string } {
  if (streak >= 365) return { 
    color: 'text-purple-500', 
    label: 'Légendaire', 
    gradient: 'from-purple-500 to-pink-500' 
  };
  if (streak >= 90) return { 
    color: 'text-amber-500', 
    label: 'Épique', 
    gradient: 'from-amber-500 to-orange-500' 
  };
  if (streak >= 30) return { 
    color: 'text-blue-500', 
    label: 'Rare', 
    gradient: 'from-blue-500 to-cyan-500' 
  };
  if (streak >= 7) return { 
    color: 'text-emerald-500', 
    label: 'Régulier', 
    gradient: 'from-emerald-500 to-green-500' 
  };
  return { 
    color: 'text-orange-500', 
    label: 'Débutant', 
    gradient: 'from-orange-400 to-red-500' 
  };
}

function getNextMilestone(streak: number) {
  return STREAK_MILESTONES.find(m => m.days > streak);
}

export function StreakDisplay({ streak, lastActiveDate, compact = false }: StreakDisplayProps) {
  const streakLevel = getStreakLevel(streak);
  const nextMilestone = getNextMilestone(streak);
  const progressToNext = nextMilestone 
    ? (streak / nextMilestone.days) * 100 
    : 100;

  if (compact) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full",
          "bg-gradient-to-r",
          streakLevel.gradient,
          "text-white shadow-lg"
        )}
      >
        <Flame className="w-4 h-4" />
        <span className="font-bold">{streak}</span>
        <span className="text-xs opacity-90">jours</span>
      </motion.div>
    );
  }

  return (
    <Card className="glass-card overflow-hidden">
      <div className={cn(
        "absolute inset-0 opacity-10 bg-gradient-to-br",
        streakLevel.gradient
      )} />
      
      <CardContent className="relative p-6">
        <div className="flex items-center gap-4">
          {/* Flame icon with animation */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [-2, 2, -2],
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center",
              "bg-gradient-to-br",
              streakLevel.gradient
            )}
          >
            <Flame className="w-8 h-8 text-white" />
          </motion.div>

          {/* Stats */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn("text-4xl font-bold", streakLevel.color)}>
                {streak}
              </span>
              <span className="text-lg text-muted-foreground">jours</span>
              <Badge className={cn("bg-gradient-to-r text-white border-0", streakLevel.gradient)}>
                {streakLevel.label}
              </Badge>
            </div>
            
            {lastActiveDate && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="w-3 h-3" />
                Dernière activité: {new Date(lastActiveDate).toLocaleDateString('fr-FR')}
              </div>
            )}
          </div>

          {/* Trophy for high streaks */}
          {streak >= 30 && (
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', delay: 0.3 }}
            >
              <Trophy className={cn("w-10 h-10", streakLevel.color)} />
            </motion.div>
          )}
        </div>

        {/* Progress to next milestone */}
        {nextMilestone && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">
                Prochain jalon: {nextMilestone.label}
              </span>
              <span className="font-medium flex items-center gap-1">
                {nextMilestone.icon} {nextMilestone.days - streak} jours restants
              </span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressToNext}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={cn("h-full rounded-full bg-gradient-to-r", streakLevel.gradient)}
              />
            </div>
          </div>
        )}

        {/* Achieved milestones */}
        {streak >= 7 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {STREAK_MILESTONES.filter(m => m.days <= streak).map((milestone) => (
              <Badge key={milestone.days} variant="secondary" className="gap-1">
                {milestone.icon} {milestone.label}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
