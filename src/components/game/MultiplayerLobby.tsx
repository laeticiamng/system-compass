/**
 * Multiplayer Lobby - Real-time lobby for Life Game multiplayer mode
 * Uses Supabase Realtime for live updates
 */
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  Crown, 
  Copy, 
  Check, 
  Loader2, 
  Play, 
  Globe,
  Clock,
  Zap,
  UserPlus
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface Player {
  id: string;
  displayName: string;
  avatar?: string;
  isReady: boolean;
  isHost: boolean;
  archetype?: string;
  joinedAt: Date;
}

interface LobbySettings {
  maxPlayers: number;
  turnTimeLimit: number;
  gameMode: 'classic' | 'race' | 'coop';
  difficulty: 'easy' | 'normal' | 'hard';
}

interface MultiplayerLobbyProps {
  lobbyCode?: string;
  onGameStart?: (lobbyId: string, players: Player[]) => void;
  onLeave?: () => void;
}

// Generate random lobby code
function generateLobbyCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export function MultiplayerLobby({ lobbyCode, onGameStart, onLeave }: MultiplayerLobbyProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const [code, setCode] = useState(lobbyCode || '');
  const [inputCode, setInputCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [copied, setCopied] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [settings] = useState<LobbySettings>({
    maxPlayers: 4,
    turnTimeLimit: 60,
    gameMode: 'classic',
    difficulty: 'normal',
  });

  const displayName = user?.email?.split('@')[0] || 'Joueur';

  // Create a new lobby
  const handleCreateLobby = useCallback(async () => {
    if (!user) {
      toast.error(t('auth.required', 'Connexion requise'));
      return;
    }

    setIsCreating(true);
    const newCode = generateLobbyCode();
    
    try {
      // In production: create lobby in database
      // For now, simulate with local state
      setCode(newCode);
      setIsHost(true);
      setPlayers([{
        id: user.id,
        displayName,
        isReady: false,
        isHost: true,
        joinedAt: new Date(),
      }]);
      
      toast.success(t('multiplayer.lobbyCreated', 'Lobby créé !'), {
        description: `Code: ${newCode}`,
      });
    } catch (error) {
      console.error('Error creating lobby:', error);
      toast.error(t('errors.generic', 'Une erreur est survenue'));
    } finally {
      setIsCreating(false);
    }
  }, [user, displayName, t]);

  // Join existing lobby
  const handleJoinLobby = useCallback(async () => {
    if (!user) {
      toast.error(t('auth.required', 'Connexion requise'));
      return;
    }

    if (!inputCode || inputCode.length !== 6) {
      toast.error(t('multiplayer.invalidCode', 'Code invalide'));
      return;
    }

    setIsJoining(true);
    
    try {
      // In production: validate and join lobby via database
      setCode(inputCode.toUpperCase());
      setIsHost(false);
      
      // Simulate other players
      setPlayers([
        {
          id: 'host-1',
          displayName: 'HostPlayer',
          isReady: true,
          isHost: true,
          archetype: 'entrepreneur',
          joinedAt: new Date(Date.now() - 60000),
        },
        {
          id: user.id,
          displayName,
          isReady: false,
          isHost: false,
          joinedAt: new Date(),
        },
      ]);
      
      toast.success(t('multiplayer.joined', 'Rejoint !'));
    } catch (error) {
      console.error('Error joining lobby:', error);
      toast.error(t('multiplayer.lobbyNotFound', 'Lobby introuvable'));
    } finally {
      setIsJoining(false);
    }
  }, [user, inputCode, displayName, t]);

  // Toggle ready status
  const handleToggleReady = useCallback(() => {
    setIsReady(prev => !prev);
    setPlayers(prev => prev.map(p => 
      p.id === user?.id ? { ...p, isReady: !p.isReady } : p
    ));
  }, [user?.id]);

  // Copy lobby code
  const handleCopyCode = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success(t('common.copied', 'Copié !'));
  }, [code, t]);

  // Start game (host only)
  const handleStartGame = useCallback(() => {
    const allReady = players.every(p => p.isReady || p.isHost);
    if (!allReady) {
      toast.error(t('multiplayer.notAllReady', 'Tous les joueurs ne sont pas prêts'));
      return;
    }
    
    onGameStart?.(code, players);
  }, [players, code, onGameStart, t]);

  // Leave lobby
  const handleLeaveLobby = useCallback(() => {
    setCode('');
    setPlayers([]);
    setIsReady(false);
    setIsHost(false);
    onLeave?.();
  }, [onLeave]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!code) return;

    // In production: subscribe to lobby channel for real-time player updates
    // const channel = supabase.channel(`lobby:${code}`)
    //   .on('presence', { event: 'sync' }, () => {...})
    //   .subscribe();

    // Simulate player joining after 3 seconds
    if (isHost && players.length === 1) {
      const timer = setTimeout(() => {
        setPlayers(prev => [
          ...prev,
          {
            id: 'player-2',
            displayName: 'ExpatExplorer',
            isReady: false,
            isHost: false,
            archetype: 'digital_nomad',
            joinedAt: new Date(),
          },
        ]);
        toast.info('ExpatExplorer a rejoint le lobby');
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [code, isHost, players.length]);

  // No lobby yet - show join/create options
  if (!code) {
    return (
      <Card className="glass-card max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            {t('multiplayer.title', 'Mode Multijoueur')}
          </CardTitle>
          <CardDescription>
            {t('multiplayer.subtitle', 'Jouez avec vos amis en temps réel')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Create lobby */}
          <div className="space-y-3">
            <Button 
              onClick={handleCreateLobby} 
              className="w-full gap-2" 
              size="lg"
              disabled={isCreating || !user}
            >
              {isCreating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Crown className="h-4 w-4" />
              )}
              {t('multiplayer.create', 'Créer une partie')}
            </Button>
          </div>

          <div className="relative">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
              {t('common.or', 'ou')}
            </span>
          </div>

          {/* Join lobby */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="CODE DU LOBBY"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase().slice(0, 6))}
                className="text-center text-lg font-mono tracking-widest"
                maxLength={6}
              />
              <Button 
                onClick={handleJoinLobby}
                disabled={isJoining || inputCode.length !== 6 || !user}
              >
                {isJoining ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {!user && (
            <p className="text-center text-sm text-muted-foreground">
              {t('multiplayer.loginRequired', 'Connectez-vous pour jouer en multijoueur')}
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  // Lobby view
  return (
    <Card className="glass-card max-w-lg mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            {t('multiplayer.lobby', 'Lobby')}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-lg tracking-widest">
              {code}
            </Badge>
            <Button variant="ghost" size="icon" onClick={handleCopyCode}>
              {copied ? (
                <Check className="h-4 w-4 text-emerald-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        <CardDescription>
          {t('multiplayer.shareCode', 'Partagez ce code pour inviter vos amis')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Settings (host only) */}
        {isHost && (
          <div className="grid grid-cols-2 gap-3 p-4 rounded-lg bg-muted/30">
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{settings.maxPlayers} joueurs max</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{settings.turnTimeLimit}s/tour</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <span className="capitalize">{settings.gameMode}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="capitalize">{settings.difficulty}</span>
            </div>
          </div>
        )}

        {/* Players list */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            {t('multiplayer.players', 'Joueurs')} ({players.length}/{settings.maxPlayers})
          </h4>
          
          <div className="space-y-2">
            {players.map((player) => (
              <div 
                key={player.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg",
                  player.id === user?.id ? "bg-primary/10 border border-primary/30" : "bg-muted/30"
                )}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {player.displayName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{player.displayName}</span>
                      {player.isHost && (
                        <Crown className="h-4 w-4 text-amber-500" />
                      )}
                    </div>
                    {player.archetype && (
                      <p className="text-xs text-muted-foreground capitalize">
                        {player.archetype.replace('_', ' ')}
                      </p>
                    )}
                  </div>
                </div>
                <Badge variant={player.isReady ? 'default' : 'secondary'}>
                  {player.isReady 
                    ? t('multiplayer.ready', 'Prêt') 
                    : t('multiplayer.waiting', 'En attente')
                  }
                </Badge>
              </div>
            ))}
            
            {/* Empty slots */}
            {Array.from({ length: settings.maxPlayers - players.length }).map((_, i) => (
              <div 
                key={`empty-${i}`}
                className="flex items-center justify-center p-3 rounded-lg border-2 border-dashed border-muted"
              >
                <span className="text-sm text-muted-foreground">
                  {t('multiplayer.waitingPlayer', 'En attente d\'un joueur...')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleLeaveLobby} className="flex-1">
            {t('multiplayer.leave', 'Quitter')}
          </Button>
          
          {isHost ? (
            <Button 
              onClick={handleStartGame}
              className="flex-1 gap-2"
              disabled={players.length < 2}
            >
              <Play className="h-4 w-4" />
              {t('multiplayer.start', 'Lancer la partie')}
            </Button>
          ) : (
            <Button 
              onClick={handleToggleReady}
              variant={isReady ? 'secondary' : 'default'}
              className="flex-1"
            >
              {isReady 
                ? t('multiplayer.notReady', 'Pas prêt') 
                : t('multiplayer.ready', 'Prêt !')
              }
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default MultiplayerLobby;
