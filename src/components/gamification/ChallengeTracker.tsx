/**
 * Challenge Tracker - Real-time challenge progress with backend persistence
 */
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  Zap, 
  Target, 
  CheckCircle2,
  Gift,
  Flame,
  Trophy
} from 'lucide-react';
import { toast } from 'sonner';
import { useGamification } from '@/hooks/useGamification';
import { cn } from '@/lib/utils';

interface TrackedChallenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly';
  xpReward: number;
  currentProgress: number;
  targetProgress: number;
  completed: boolean;
  expiresAt: Date;
}

const calculateTimeRemaining = (expiresAt: Date): string => {
  const now = new Date();
  const diff = expiresAt.getTime() - now.getTime();
  
  if (diff <= 0) return 'expired';
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return `${days}j ${hours % 24}h`;
  }
  
  return `${hours}h ${minutes}m`;
};

export function ChallengeTracker() {
  const { t } = useTranslation();
  const { progress, addXp, isLoading } = useGamification();
  const [challenges, setChallenges] = useState<TrackedChallenge[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<Record<string, string>>({});

  // Generate daily/weekly challenges
  useEffect(() => {
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    
    const endOfWeek = new Date(now);
    endOfWeek.setDate(now.getDate() + (7 - now.getDay()));
    endOfWeek.setHours(23, 59, 59, 999);

    const dailyChallengesData: TrackedChallenge[] = [
      {
        id: 'daily-login',
        title: t('challenges.dailyLogin.title', 'Connexion quotidienne'),
        description: t('challenges.dailyLogin.description', 'Connectez-vous aujourd\'hui'),
        type: 'daily',
        xpReward: 10,
        currentProgress: 1,
        targetProgress: 1,
        completed: true,
        expiresAt: endOfDay,
      },
      {
        id: 'daily-explore',
        title: t('challenges.dailyExplore.title', 'Découverte du jour'),
        description: t('challenges.dailyExplore.description', 'Explorez un nouveau pays'),
        type: 'daily',
        xpReward: 25,
        currentProgress: 0,
        targetProgress: 1,
        completed: false,
        expiresAt: endOfDay,
      },
      {
        id: 'daily-compare',
        title: t('challenges.dailyCompare.title', 'Comparaison rapide'),
        description: t('challenges.dailyCompare.description', 'Comparez 2 destinations'),
        type: 'daily',
        xpReward: 20,
        currentProgress: 1,
        targetProgress: 2,
        completed: false,
        expiresAt: endOfDay,
      },
    ];

    const weeklyChallengesData: TrackedChallenge[] = [
      {
        id: 'weekly-explorer',
        title: t('challenges.weeklyExplorer.title', 'Explorateur de la semaine'),
        description: t('challenges.weeklyExplorer.description', 'Explorez 5 nouveaux pays cette semaine'),
        type: 'weekly',
        xpReward: 150,
        currentProgress: 2,
        targetProgress: 5,
        completed: false,
        expiresAt: endOfWeek,
      },
      {
        id: 'weekly-fiscal',
        title: t('challenges.weeklyFiscal.title', 'Expert fiscal'),
        description: t('challenges.weeklyFiscal.description', 'Utilisez le calculateur fiscal 3 fois'),
        type: 'weekly',
        xpReward: 100,
        currentProgress: 1,
        targetProgress: 3,
        completed: false,
        expiresAt: endOfWeek,
      },
    ];

    setChallenges([...dailyChallengesData, ...weeklyChallengesData]);
  }, []);

  // Update countdown timers
  useEffect(() => {
    const interval = setInterval(() => {
      const newTimeRemaining: Record<string, string> = {};
      challenges.forEach(challenge => {
        newTimeRemaining[challenge.id] = calculateTimeRemaining(challenge.expiresAt);
      });
      setTimeRemaining(newTimeRemaining);
    }, 60000); // Update every minute

    // Initial calculation
    const initial: Record<string, string> = {};
    challenges.forEach(challenge => {
      initial[challenge.id] = calculateTimeRemaining(challenge.expiresAt);
    });
    setTimeRemaining(initial);

    return () => clearInterval(interval);
  }, [challenges]);

  const handleClaimReward = useCallback(async (challenge: TrackedChallenge) => {
    if (!challenge.completed) return;

    try {
      await addXp(challenge.xpReward, `challenge_${challenge.id}`);
      
      setChallenges(prev => 
        prev.map(c => 
          c.id === challenge.id 
            ? { ...c, currentProgress: c.targetProgress } 
            : c
        )
      );

      toast.success(t('challenges.xpClaimed', '+{{xp}} XP réclamés !', { xp: challenge.xpReward }), {
        description: t('challenges.challengeCompleted', 'Défi "{{title}}" complété', { title: challenge.title }),
      });
    } catch (error) {
      toast.error(t('challenges.claimError', 'Erreur lors de la réclamation'));
    }
  }, [addXp]);

  const dailyChallenges = challenges.filter(c => c.type === 'daily');
  const weeklyChallenges = challenges.filter(c => c.type === 'weekly');

  if (isLoading) {
    return <div className="animate-pulse h-48 bg-muted rounded-lg" />;
  }

  return (
    <div className="space-y-6">
      {/* Daily Streak */}
      {progress && progress.streak > 0 && (
        <Card className="glass-card bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/30">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
              <Flame className="w-6 h-6 text-orange-400" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">{t('challenges.streakCurrent', 'Série en cours : {{count}} jours', { count: progress.streak })}</p>
              <p className="text-sm text-muted-foreground">
                {t('challenges.streakKeep', 'Continuez demain pour maintenir votre série !')}
              </p>
            </div>
            <Badge className="bg-orange-500/20 text-orange-400">
              +{progress.streak * 5} XP bonus
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Daily Challenges */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="h-5 w-5 text-amber-400" />
            {t('challenges.dailyTitle', 'Défis quotidiens')}
          </CardTitle>
          <CardDescription>
            {t('challenges.dailyReset', 'Renouvelés à minuit')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {dailyChallenges.map(challenge => (
            <ChallengeItem
              key={challenge.id}
              challenge={challenge}
              timeRemaining={timeRemaining[challenge.id]}
              onClaim={() => handleClaimReward(challenge)}
            />
          ))}
        </CardContent>
      </Card>

      {/* Weekly Challenges */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-primary" />
            {t('challenges.weeklyTitle', 'Défis hebdomadaires')}
          </CardTitle>
          <CardDescription>
            {t('challenges.weeklyReset', 'Renouvelés chaque lundi')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {weeklyChallenges.map(challenge => (
            <ChallengeItem
              key={challenge.id}
              challenge={challenge}
              timeRemaining={timeRemaining[challenge.id]}
              onClaim={() => handleClaimReward(challenge)}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function ChallengeItem({ 
  challenge, 
  timeRemaining,
  onClaim 
}: { 
  challenge: TrackedChallenge; 
  timeRemaining?: string;
  onClaim: () => void;
}) {
  const { t } = useTranslation();
  const progress = (challenge.currentProgress / challenge.targetProgress) * 100;

  return (
    <div className={cn(
      "p-4 rounded-lg border transition-all",
      challenge.completed 
        ? "bg-emerald-500/10 border-emerald-500/30" 
        : "bg-secondary/30 border-border"
    )}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {challenge.completed ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          ) : challenge.type === 'daily' ? (
            <Zap className="h-5 w-5 text-amber-400" />
          ) : (
            <Trophy className="h-5 w-5 text-primary" />
          )}
          <span className="font-medium">{challenge.title}</span>
        </div>
        {challenge.completed ? (
          <Button size="sm" onClick={onClaim} className="gap-1">
            <Gift className="h-4 w-4" />
            {t('challenges.claim', 'Réclamer')}
          </Button>
        ) : (
          <Badge variant="secondary">
            +{challenge.xpReward} XP
          </Badge>
        )}
      </div>
      <p className="text-sm text-muted-foreground mb-3">{challenge.description}</p>
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span>{challenge.currentProgress}/{challenge.targetProgress}</span>
          {timeRemaining && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              {timeRemaining}
            </span>
          )}
        </div>
        <Progress value={progress} className="h-2" />
      </div>
    </div>
  );
}
