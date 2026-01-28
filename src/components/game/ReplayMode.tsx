// Life Game Replay Mode - Review and replay past games
import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  FastForward,
  Rewind,
  Clock,
  MapPin,
  Heart,
  Wallet,
  Trophy,
  Star,
  AlertTriangle,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface GameTurn {
  turn: number;
  country: string;
  action: string;
  result: 'success' | 'failure' | 'neutral';
  healthChange: number;
  moneyChange: number;
  event?: string;
  decision?: string;
}

interface SavedGame {
  id: string;
  name: string;
  archetype: string;
  startCountry: string;
  endCountry: string;
  finalScore: number;
  totalTurns: number;
  healthHistory: number[];
  moneyHistory: number[];
  turns: GameTurn[];
  playedAt: string;
  duration: number;
}

interface ReplayModeProps {
  game: SavedGame;
  onClose?: () => void;
  onRestart?: () => void;
}

export function ReplayMode({ game, onClose, onRestart }: ReplayModeProps) {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === 'fr' ? fr : enUS;
  
  const [currentTurn, setCurrentTurn] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const currentTurnData = useMemo(() => {
    return game.turns[currentTurn] || null;
  }, [game.turns, currentTurn]);

  const currentHealth = useMemo(() => {
    return game.healthHistory[currentTurn] || 100;
  }, [game.healthHistory, currentTurn]);

  const currentMoney = useMemo(() => {
    return game.moneyHistory[currentTurn] || 0;
  }, [game.moneyHistory, currentTurn]);

  // Auto-play effect
  useState(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTurn(prev => {
        if (prev >= game.totalTurns - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 2000 / playbackSpeed);

    return () => clearInterval(interval);
  });

  const handleSliderChange = (value: number[]) => {
    setCurrentTurn(value[0]);
    setIsPlaying(false);
  };

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failure':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'success':
        return 'bg-green-500/10 border-green-500/20';
      case 'failure':
        return 'bg-red-500/10 border-red-500/20';
      default:
        return 'bg-muted';
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* Game Header */}
      <Card className="border-primary/20">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                {game.name}
              </CardTitle>
              <CardDescription>
                {format(new Date(game.playedAt), 'PPp', { locale: dateLocale })} • 
                {formatDuration(game.duration)}
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-lg px-3 py-1">
              <Star className="h-4 w-4 mr-1 text-amber-500" />
              {game.finalScore}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">{t('game.replay.archetype', 'Archétype')}</p>
              <p className="font-medium">{game.archetype}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">{t('game.replay.start', 'Départ')}</p>
              <p className="font-medium">{game.startCountry}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">{t('game.replay.end', 'Arrivée')}</p>
              <p className="font-medium">{game.endCountry}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">{t('game.replay.turns', 'Tours')}</p>
              <p className="font-medium">{game.totalTurns}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current State Display */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Heart className="h-5 w-5 text-red-500" />
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span>{t('game.replay.health', 'Santé')}</span>
                  <span className="font-medium">{currentHealth}%</span>
                </div>
                <Progress value={currentHealth} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Wallet className="h-5 w-5 text-green-500" />
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span>{t('game.replay.money', 'Argent')}</span>
                  <span className="font-medium">{currentMoney.toLocaleString()}€</span>
                </div>
                <Progress value={Math.min(100, currentMoney / 1000)} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Playback Controls */}
      <Card>
        <CardContent className="pt-4">
          <div className="space-y-4">
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{t('game.replay.turn', 'Tour')} {currentTurn + 1}</span>
                <span>{game.totalTurns} {t('game.replay.total', 'total')}</span>
              </div>
              <Slider
                value={[currentTurn]}
                onValueChange={handleSliderChange}
                max={game.totalTurns - 1}
                step={1}
                className="cursor-pointer"
              />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentTurn(0)}
                disabled={currentTurn === 0}
              >
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentTurn(Math.max(0, currentTurn - 1))}
                disabled={currentTurn === 0}
              >
                <Rewind className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                onClick={() => setIsPlaying(!isPlaying)}
                className="h-12 w-12"
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6" />
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentTurn(Math.min(game.totalTurns - 1, currentTurn + 1))}
                disabled={currentTurn === game.totalTurns - 1}
              >
                <FastForward className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentTurn(game.totalTurns - 1)}
                disabled={currentTurn === game.totalTurns - 1}
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>

            {/* Speed Control */}
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm text-muted-foreground">{t('game.replay.speed', 'Vitesse')}:</span>
              {[0.5, 1, 2, 4].map(speed => (
                <Button
                  key={speed}
                  variant={playbackSpeed === speed ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPlaybackSpeed(speed)}
                >
                  {speed}x
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Turn Details */}
      {currentTurnData && (
        <Card className={cn("transition-all", getResultColor(currentTurnData.result))}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              {getResultIcon(currentTurnData.result)}
              {t('game.replay.turn', 'Tour')} {currentTurnData.turn}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{currentTurnData.country}</span>
              </div>
              
              <p className="font-medium">{currentTurnData.action}</p>
              
              {currentTurnData.event && (
                <div className="p-2 rounded bg-muted/50 text-sm">
                  <span className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {currentTurnData.event}
                  </span>
                </div>
              )}

              {currentTurnData.decision && (
                <div className="p-2 rounded bg-primary/10 text-sm">
                  <span className="text-primary">{currentTurnData.decision}</span>
                </div>
              )}

              <div className="flex gap-4 text-sm">
                <span className={cn(
                  "flex items-center gap-1",
                  currentTurnData.healthChange > 0 ? 'text-green-500' : 
                  currentTurnData.healthChange < 0 ? 'text-red-500' : 'text-muted-foreground'
                )}>
                  <Heart className="h-3 w-3" />
                  {currentTurnData.healthChange > 0 ? '+' : ''}{currentTurnData.healthChange}
                </span>
                <span className={cn(
                  "flex items-center gap-1",
                  currentTurnData.moneyChange > 0 ? 'text-green-500' : 
                  currentTurnData.moneyChange < 0 ? 'text-red-500' : 'text-muted-foreground'
                )}>
                  <Wallet className="h-3 w-3" />
                  {currentTurnData.moneyChange > 0 ? '+' : ''}{currentTurnData.moneyChange}€
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Turn History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{t('game.replay.history', 'Historique des tours')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px]">
            <div className="space-y-2">
              {game.turns.map((turn, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTurn(index)}
                  className={cn(
                    "w-full text-left p-2 rounded-lg border transition-all",
                    index === currentTurn ? 'border-primary bg-primary/10' : 'border-transparent hover:bg-muted/50'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getResultIcon(turn.result)}
                      <span className="text-sm font-medium">T{turn.turn}</span>
                      <span className="text-sm text-muted-foreground">{turn.country}</span>
                    </div>
                    <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                      {turn.action}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-2">
        {onRestart && (
          <Button onClick={onRestart} className="flex-1">
            <Play className="h-4 w-4 mr-2" />
            {t('game.replay.restart', 'Rejouer')}
          </Button>
        )}
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            {t('common.close', 'Fermer')}
          </Button>
        )}
      </div>
    </div>
  );
}
