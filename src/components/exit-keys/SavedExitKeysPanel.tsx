import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  Key, Bookmark, Clock, Trash2, ChevronRight, 
  CheckCircle, Play, StickyNote, X 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from '@/components/ui/dialog';
import { useExitKeysHistory, ExitKeyStatus, ExitKeyHistoryEntry } from '@/hooks/useExitKeysHistory';
import { EXIT_KEYS } from '@/lib/exit-keys-engine';
import { toast } from 'sonner';

const statusConfig: Record<ExitKeyStatus, { label: string; color: string; icon: React.ReactNode }> = {
  explored: { label: 'Explorée', color: 'bg-blue-500/10 text-blue-500', icon: <Clock className="w-3 h-3" /> },
  saved: { label: 'Sauvegardée', color: 'bg-amber-500/10 text-amber-500', icon: <Bookmark className="w-3 h-3" /> },
  in_progress: { label: 'En cours', color: 'bg-emerald-500/10 text-emerald-500', icon: <Play className="w-3 h-3" /> },
  dismissed: { label: 'Écartée', color: 'bg-muted text-muted-foreground', icon: <X className="w-3 h-3" /> },
};

export function SavedExitKeysPanel() {
  const { t } = useTranslation();
  const { 
    history, 
    loading, 
    getSavedKeys, 
    getInProgressKeys, 
    updateStatus, 
    addNotes, 
    removeEntry,
    isLoggedIn 
  } = useExitKeysHistory();
  
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<ExitKeyHistoryEntry | null>(null);
  const [notesText, setNotesText] = useState('');

  const savedKeys = getSavedKeys();
  const inProgressKeys = getInProgressKeys();

  const getExitKeyData = (keyId: string) => {
    return EXIT_KEYS.find(k => k.id === keyId);
  };

  const handleStatusChange = async (entry: ExitKeyHistoryEntry, newStatus: ExitKeyStatus) => {
    const success = await updateStatus(entry.id, newStatus);
    if (success) {
      toast.success(t('exitKeys.statusUpdated', 'Statut mis à jour'));
    }
  };

  const handleOpenNotes = (entry: ExitKeyHistoryEntry) => {
    setSelectedEntry(entry);
    setNotesText(entry.notes || '');
    setNotesDialogOpen(true);
  };

  const handleSaveNotes = async () => {
    if (!selectedEntry) return;
    const success = await addNotes(selectedEntry.id, notesText);
    if (success) {
      toast.success(t('exitKeys.notesSaved', 'Notes sauvegardées'));
      setNotesDialogOpen(false);
    }
  };

  const handleRemove = async (entryId: string) => {
    const success = await removeEntry(entryId);
    if (success) {
      toast.success(t('exitKeys.entryRemoved', 'Entrée supprimée'));
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="glass-card rounded-xl p-6 text-center">
        <Bookmark className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
        <h3 className="font-semibold mb-2">{t('exitKeys.savedKeys.loginRequired', 'Connexion requise')}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {t('exitKeys.savedKeys.loginPrompt', 'Connectez-vous pour sauvegarder et suivre vos stratégies')}
        </p>
        <Link to="/auth">
          <Button variant="outline">{t('auth.login', 'Se connecter')}</Button>
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="glass-card rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3" />
          <div className="h-20 bg-muted rounded" />
          <div className="h-20 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* In Progress */}
      {inProgressKeys.length > 0 && (
        <div className="glass-card rounded-xl p-6 border-2 border-emerald-500/30">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Play className="w-5 h-5 text-emerald-500" />
            {t('exitKeys.savedKeys.inProgress', 'En cours')} ({inProgressKeys.length})
          </h3>
          <div className="space-y-3">
            {inProgressKeys.map(entry => {
              const keyData = getExitKeyData(entry.exit_key_id);
              if (!keyData) return null;
              return (
                <ExitKeyHistoryCard
                  key={entry.id}
                  entry={entry}
                  keyData={keyData}
                  onStatusChange={handleStatusChange}
                  onOpenNotes={handleOpenNotes}
                  onRemove={handleRemove}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Saved */}
      {savedKeys.length > 0 && (
        <div className="glass-card rounded-xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-amber-500" />
            {t('exitKeys.savedKeys.saved', 'Sauvegardées')} ({savedKeys.length})
          </h3>
          <div className="space-y-3">
            {savedKeys.map(entry => {
              const keyData = getExitKeyData(entry.exit_key_id);
              if (!keyData) return null;
              return (
                <ExitKeyHistoryCard
                  key={entry.id}
                  entry={entry}
                  keyData={keyData}
                  onStatusChange={handleStatusChange}
                  onOpenNotes={handleOpenNotes}
                  onRemove={handleRemove}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Recent History */}
      {history.length > 0 && (
        <div className="glass-card rounded-xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-muted-foreground" />
            {t('exitKeys.savedKeys.recentlyExplored', 'Récemment explorées')}
          </h3>
          <div className="space-y-2">
            {history.slice(0, 5).map(entry => {
              const keyData = getExitKeyData(entry.exit_key_id);
              if (!keyData) return null;
              return (
                <div 
                  key={entry.id} 
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Key className="w-4 h-4 text-primary" />
                    <span className="font-medium text-sm">{keyData.name}</span>
                    <Badge variant="secondary" className={statusConfig[entry.status].color}>
                      {statusConfig[entry.status].icon}
                      <span className="ml-1">{statusConfig[entry.status].label}</span>
                    </Badge>
                  </div>
                  {entry.compatibility_score && (
                    <span className="text-xs text-muted-foreground">
                      {entry.compatibility_score}%
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {history.length === 0 && (
        <div className="glass-card rounded-xl p-8 text-center">
          <Key className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="font-semibold mb-2">{t('exitKeys.savedKeys.noKeys', 'Aucune clé explorée')}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {t('exitKeys.savedKeys.explorePrompt', 'Explorez les stratégies pour les sauvegarder ici')}
          </p>
          <Link to="/exit-keys">
            <Button className="gap-2">
              <Key className="w-4 h-4" />
              {t('exitKeys.exploreKeys', 'Explorer les clés')}
            </Button>
          </Link>
        </div>
      )}

      {/* Notes Dialog */}
      <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <StickyNote className="w-5 h-5" />
              {t('exitKeys.notes.title', 'Notes personnelles')}
            </DialogTitle>
          </DialogHeader>
          <Textarea
            value={notesText}
            onChange={(e) => setNotesText(e.target.value)}
            placeholder={t('exitKeys.notes.placeholder', 'Ajoutez vos notes ici...')}
            className="min-h-[150px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setNotesDialogOpen(false)}>
              {t('common.cancel', 'Annuler')}
            </Button>
            <Button onClick={handleSaveNotes}>
              {t('common.save', 'Sauvegarder')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ExitKeyHistoryCard({
  entry,
  keyData,
  onStatusChange,
  onOpenNotes,
  onRemove,
}: {
  entry: ExitKeyHistoryEntry;
  keyData: { id: string; name: string; icon: string; difficulty: string; timeframe: string };
  onStatusChange: (entry: ExitKeyHistoryEntry, status: ExitKeyStatus) => void;
  onOpenNotes: (entry: ExitKeyHistoryEntry) => void;
  onRemove: (id: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{keyData.icon}</span>
          <div>
            <h4 className="font-medium">{keyData.name}</h4>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{keyData.timeframe}</span>
              {entry.compatibility_score && (
                <>
                  <span>•</span>
                  <span className="text-primary font-medium">{entry.compatibility_score}%</span>
                </>
              )}
            </div>
          </div>
        </div>
        <Badge variant="secondary" className={statusConfig[entry.status].color}>
          {statusConfig[entry.status].icon}
          <span className="ml-1">{statusConfig[entry.status].label}</span>
        </Badge>
      </div>

      {entry.notes && (
        <p className="text-sm text-muted-foreground mb-3 p-2 bg-background/50 rounded border-l-2 border-primary/30">
          {entry.notes}
        </p>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        {entry.status !== 'in_progress' && (
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => onStatusChange(entry, 'in_progress')}
            className="gap-1"
          >
            <Play className="w-3 h-3" />
            {t('exitKeys.startTracking', 'Démarrer')}
          </Button>
        )}
        {entry.status === 'in_progress' && (
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onStatusChange(entry, 'saved')}
            className="gap-1"
          >
            <CheckCircle className="w-3 h-3" />
            {t('exitKeys.markDone', 'Terminé')}
          </Button>
        )}
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={() => onOpenNotes(entry)}
          className="gap-1"
        >
          <StickyNote className="w-3 h-3" />
          {t('exitKeys.notes.add', 'Notes')}
        </Button>
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={() => onRemove(entry.id)}
          className="gap-1 text-destructive hover:text-destructive"
        >
          <Trash2 className="w-3 h-3" />
        </Button>
        <Link to={`/exit-keys?key=${keyData.id}`} className="ml-auto">
          <Button size="sm" variant="link" className="gap-1">
            {t('exitKeys.viewDetails', 'Détails')}
            <ChevronRight className="w-3 h-3" />
          </Button>
        </Link>
      </div>
    </div>
  );
}