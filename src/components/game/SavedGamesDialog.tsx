import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useSavedGames, SavedGame } from '@/hooks/useSavedGames';
import { useAuth } from '@/hooks/useAuth';
import { Save, Trash2, Play, Clock, Users, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SavedGamesDialogProps {
  onLoadGame: (game: SavedGame) => void;
  trigger?: React.ReactNode;
}

export default function SavedGamesDialog({ onLoadGame, trigger }: SavedGamesDialogProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { savedGames, loading, error, fetchSavedGames, deleteGame } = useSavedGames();
  const [open, setOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (open && user) {
      fetchSavedGames();
    }
  }, [open, user, fetchSavedGames]);

  const handleDelete = async (gameId: string) => {
    setDeletingId(gameId);
    await deleteGame(gameId);
    setDeletingId(null);
  };

  const handleLoad = (game: SavedGame) => {
    onLoadGame(game);
    setOpen(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getGameModeLabel = (mode: string) => {
    switch (mode) {
      case 'race': return t('gameModes.race.title');
      case 'points_duel': return t('gameModes.pointsDuel.title');
      case 'cooperative': return t('gameModes.cooperative.title');
      default: return t('gameModes.solo.title');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Save className="w-4 h-4" />
            {t('savedGames.myGames')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="w-5 h-5" />
            {t('savedGames.title')}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {loading && savedGames.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : savedGames.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Save className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{t('savedGames.noGames')}</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {savedGames.map((game) => (
                <div
                  key={game.id}
                  className={cn(
                    "glass-card rounded-lg p-4 transition-all",
                    game.is_finished && "opacity-60"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{game.game_name}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {game.player_count}
                        </span>
                        <span>{getGameModeLabel(game.game_mode)}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(game.updated_at)}
                        </span>
                      </div>
                      {game.is_finished && (
                        <span className="inline-block mt-2 text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                          {t('savedGames.finished')}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleLoad(game)}
                        disabled={game.is_finished}
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(game.id)}
                        disabled={deletingId === game.id}
                      >
                        {deletingId === game.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive mt-4 text-center">{error}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
