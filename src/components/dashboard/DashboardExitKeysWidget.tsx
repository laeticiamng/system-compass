import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Key, Bookmark, Play, Eye, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useExitKeysHistory, ExitKeyStatus } from '@/hooks/useExitKeysHistory';
import { EXIT_KEYS } from '@/lib/exit-keys-engine';

export function DashboardExitKeysWidget() {
  const { t } = useTranslation();
  const { history, loading, getSavedKeys, getInProgressKeys, isLoggedIn } = useExitKeysHistory();

  const statusConfig: Record<ExitKeyStatus, { label: string; color: string; icon: React.ReactNode }> = {
    explored: { label: t('exitKeys.status.explored', 'Explorée'), color: 'bg-blue-500/10 text-blue-500', icon: <Eye className="w-3 h-3" /> },
    saved: { label: t('exitKeys.status.saved', 'Sauvegardée'), color: 'bg-amber-500/10 text-amber-500', icon: <Bookmark className="w-3 h-3" /> },
    in_progress: { label: t('exitKeys.status.inProgress', 'En cours'), color: 'bg-emerald-500/10 text-emerald-500', icon: <Play className="w-3 h-3" /> },
    dismissed: { label: t('exitKeys.status.dismissed', 'Écartée'), color: 'bg-muted text-muted-foreground', icon: null },
  };

  if (!isLoggedIn) {
    return null;
  }

  const savedKeys = getSavedKeys();
  const inProgressKeys = getInProgressKeys();
  const recentKeys = history.slice(0, 3);

  const getExitKeyData = (keyId: string) => {
    return EXIT_KEYS.find(k => k.id === keyId);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            {t('dashboard.exitKeys.title', 'Mes Clés de Sortie')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-12 bg-muted rounded" />
            <div className="h-12 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            {t('dashboard.exitKeys.title', 'Mes Clés de Sortie')}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <Key className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-sm text-muted-foreground mb-4">
            {t('dashboard.exitKeys.empty', "Vous n'avez pas encore exploré de clés de sortie")}
          </p>
          <Link to="/exit-keys">
            <Button size="sm" className="gap-2">
              <Key className="w-4 h-4" />
              {t('dashboard.exitKeys.explore', 'Explorer les clés')}
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Key className="w-5 h-5 text-primary" />
          {t('dashboard.exitKeys.title', 'Mes Clés de Sortie')}
        </CardTitle>
        <Link to="/exit-keys">
          <Button variant="ghost" size="sm" className="gap-1">
            {t('common.seeAll', 'Voir tout')}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-2xl font-bold text-primary">{history.length}</p>
            <p className="text-xs text-muted-foreground">{t('dashboard.exitKeys.explored', 'Explorées')}</p>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-lg">
            <p className="text-2xl font-bold text-amber-500">{savedKeys.length}</p>
            <p className="text-xs text-muted-foreground">{t('dashboard.exitKeys.saved', 'Sauvegardées')}</p>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-lg">
            <p className="text-2xl font-bold text-emerald-500">{inProgressKeys.length}</p>
            <p className="text-xs text-muted-foreground">{t('dashboard.exitKeys.inProgress', 'En cours')}</p>
          </div>
        </div>

        {/* In Progress Keys */}
        {inProgressKeys.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <Play className="w-3 h-3 text-emerald-500" />
              {t('dashboard.exitKeys.activeKeys', 'Clés actives')}
            </p>
            <div className="space-y-2">
              {inProgressKeys.slice(0, 2).map(entry => {
                const keyData = getExitKeyData(entry.exit_key_id);
                if (!keyData) return null;
                return (
                  <div key={entry.id} className="flex items-center justify-between p-2 bg-emerald-500/5 rounded-lg border border-emerald-500/20">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{keyData.icon}</span>
                      <span className="text-sm font-medium">{keyData.name}</span>
                    </div>
                    {entry.compatibility_score && (
                      <Badge variant="secondary">{entry.compatibility_score}%</Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Keys */}
        {recentKeys.length > 0 && inProgressKeys.length === 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">
              {t('dashboard.exitKeys.recent', 'Récemment explorées')}
            </p>
            <div className="space-y-2">
              {recentKeys.map(entry => {
                const keyData = getExitKeyData(entry.exit_key_id);
                if (!keyData) return null;
                return (
                  <div key={entry.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{keyData.icon}</span>
                      <span className="text-sm">{keyData.name}</span>
                    </div>
                    <Badge variant="secondary" className={statusConfig[entry.status].color}>
                      {statusConfig[entry.status].icon}
                      <span className="ml-1">{statusConfig[entry.status].label}</span>
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
