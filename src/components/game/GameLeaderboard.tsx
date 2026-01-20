import { useTranslation } from 'react-i18next';
import { useGameLeaderboard, LeaderboardEntry } from '@/hooks/useGameLeaderboard';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Trophy, 
  Medal, 
  Award, 
  RefreshCw, 
  Target, 
  Gamepad2,
  Globe,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface GameLeaderboardProps {
  className?: string;
  compact?: boolean;
}

function getRankIcon(rank: number) {
  switch (rank) {
    case 1:
      return <Trophy className="w-5 h-5 text-yellow-400" />;
    case 2:
      return <Medal className="w-5 h-5 text-slate-300" />;
    case 3:
      return <Award className="w-5 h-5 text-amber-600" />;
    default:
      return <span className="w-5 h-5 flex items-center justify-center text-xs font-bold text-muted-foreground">#{rank}</span>;
  }
}

function LeaderboardRow({ 
  entry, 
  rank, 
  isCurrentUser,
  compact
}: { 
  entry: LeaderboardEntry; 
  rank: number; 
  isCurrentUser: boolean;
  compact: boolean;
}) {
  const { i18n } = useTranslation();

  return (
    <div 
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg transition-colors",
        isCurrentUser 
          ? "bg-primary/10 border border-primary/30" 
          : "hover:bg-muted/50",
        rank <= 3 && "bg-muted/30"
      )}
    >
      <div className="w-8 flex justify-center">
        {getRankIcon(rank)}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn(
            "font-medium truncate",
            isCurrentUser && "text-primary"
          )}>
            {entry.displayName}
          </span>
          {isCurrentUser && (
            <Badge variant="outline" className="text-xs">Vous</Badge>
          )}
        </div>
        {!compact && (
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
            <span className="flex items-center gap-1">
              <Gamepad2 className="w-3 h-3" />
              {entry.totalGamesPlayed}
            </span>
            <span className="flex items-center gap-1">
              <Globe className="w-3 h-3" />
              {entry.countriesVisited}
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {entry.riskSuccessRate}%
            </span>
          </div>
        )}
      </div>

      <div className="text-right">
        <div className="font-bold text-lg text-primary">
          {entry.bestScoreSolo}
        </div>
        {!compact && (
          <div className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(entry.lastGameAt), { 
              addSuffix: true,
              locale: i18n.language === 'fr' ? fr : undefined
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function GameLeaderboard({ className, compact = false }: GameLeaderboardProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { entries, loading, error, refresh } = useGameLeaderboard();

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="w-5 h-5 text-primary" />
            {t('game.leaderboard.title', 'Classement')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <Skeleton className="flex-1 h-10" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="w-5 h-5 text-primary" />
            {t('game.leaderboard.title', 'Classement')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">{t('game.leaderboard.error', 'Impossible de charger le classement')}</p>
            <Button variant="outline" size="sm" onClick={refresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              {t('common.retry', 'Réessayer')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (entries.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="w-5 h-5 text-primary" />
            {t('game.leaderboard.title', 'Classement')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {t('game.leaderboard.empty', 'Aucun score enregistré. Soyez le premier !')}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayEntries = compact ? entries.slice(0, 5) : entries;

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="w-5 h-5 text-primary" />
            {t('game.leaderboard.title', 'Classement')}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={refresh}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className={compact ? "h-[300px]" : "h-[500px]"}>
          <div className="space-y-2">
            {displayEntries.map((entry, index) => (
              <LeaderboardRow
                key={entry.userId}
                entry={entry}
                rank={index + 1}
                isCurrentUser={user?.id === entry.userId}
                compact={compact}
              />
            ))}
          </div>
        </ScrollArea>
        
        {compact && entries.length > 5 && (
          <div className="mt-4 text-center">
            <Button variant="link" size="sm" className="text-xs">
              {t('game.leaderboard.viewAll', 'Voir tout le classement')} →
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
