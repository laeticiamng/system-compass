import { useTranslation } from 'react-i18next';
import { useLocalizedNavigate } from '@/hooks/useLocalizedNavigate';
import { History, Globe, GitCompare, Play, Key, Trash2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useUserHistory } from '@/hooks/useUserHistory';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const TYPE_ICONS = {
  country_view: Globe,
  comparison: GitCompare,
  simulation: Play,
  exit_key: Key,
};

const TYPE_COLORS = {
  country_view: 'bg-blue-500/10 text-blue-500',
  comparison: 'bg-purple-500/10 text-purple-500',
  simulation: 'bg-amber-500/10 text-amber-500',
  exit_key: 'bg-emerald-500/10 text-emerald-500',
};

const TYPE_LABELS = {
  country_view: 'Pays',
  comparison: 'Comparaison',
  simulation: 'Simulation',
  exit_key: 'Clé de sortie',
};

export function UserHistoryPanel() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { history, clearHistory, getMostViewedCountries } = useUserHistory();

  const handleItemClick = (entry: any) => {
    switch (entry.type) {
      case 'country_view':
        navigate(`/country/${entry.id}`);
        break;
      case 'comparison':
        if (entry.metadata?.countryIds) {
          navigate(`/compare?countries=${entry.metadata.countryIds.join(',')}`);
        }
        break;
      case 'exit_key':
        navigate(`/exit-keys/${entry.id}`);
        break;
    }
  };

  const mostViewed = getMostViewedCountries(5);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <History className="w-5 h-5" />
          {history.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-[10px] rounded-full flex items-center justify-center text-white">
              {history.length > 99 ? '99+' : history.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            {t('history.title', 'Historique')}
          </SheetTitle>
          <SheetDescription>
            {t('history.description', 'Vos dernières consultations et simulations')}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Most viewed */}
          {mostViewed.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                {t('history.mostViewed', 'Pays les plus consultés')}
              </h4>
              <div className="flex flex-wrap gap-2">
                {mostViewed.map(item => (
                  <Badge
                    key={item.id}
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary/20"
                    onClick={() => navigate(`/country/${item.id}`)}
                  >
                    {item.label}
                    <span className="ml-1 text-muted-foreground">({item.count})</span>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Recent activity */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {t('history.recent', 'Activité récente')}
              </h4>
              {history.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearHistory}
                  className="text-xs text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  {t('history.clear', 'Effacer')}
                </Button>
              )}
            </div>

            <ScrollArea className="h-[400px]">
              {history.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <History className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>{t('history.empty', 'Aucune activité récente')}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {history.map((entry, index) => {
                    const Icon = TYPE_ICONS[entry.type];
                    return (
                      <div
                        key={`${entry.type}-${entry.id}-${index}`}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => handleItemClick(entry)}
                      >
                        <div className={`p-2 rounded-lg ${TYPE_COLORS[entry.type]}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{entry.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {TYPE_LABELS[entry.type]} • {formatDistanceToNow(entry.timestamp, {
                              addSuffix: true,
                              locale: i18n.language === 'fr' ? fr : undefined,
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
