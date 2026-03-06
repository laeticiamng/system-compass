import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { History, Trash2, ExternalLink } from 'lucide-react';
import { useTerrainHistory } from '@/hooks/useTerrainHistory';
import { LocalizedLink as Link } from '@/components/i18n';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

interface TerrainHistoryPanelProps {
  currentCountryId?: string;
  onSelectCountry?: (countryId: string) => void;
  isLoading?: boolean;
}

export function TerrainHistoryPanel({ currentCountryId, onSelectCountry, isLoading }: TerrainHistoryPanelProps) {
  const { t, i18n } = useTranslation();
  const { history, removeFromHistory, clearHistory } = useTerrainHistory();

  const getRiskColor = (level?: 'high' | 'medium' | 'low') => {
    switch (level) {
      case 'high': return 'bg-red-500/20 text-red-300';
      case 'medium': return 'bg-amber-500/20 text-amber-300';
      case 'low': return 'bg-green-500/20 text-green-300';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getDateLocale = () => {
    return i18n.language === 'fr' ? fr : enUS;
  };

  // Show skeleton when loading
  if (isLoading) {
    return (
      <Card className="bg-card/30 border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <History className="h-4 w-4" />
            {t('terrainRealities.recentConsultations')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/30 border-primary/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <History className="h-4 w-4" />
            {t('terrainRealities.recentConsultations')}
          </CardTitle>
          {history.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs text-muted-foreground hover:text-destructive"
              onClick={clearHistory}
            >
              {t('terrainRealities.clearHistory')}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            {t('terrainRealities.noRecentConsultations')}
          </p>
        ) : (
          <ScrollArea className="h-64">
            <div className="space-y-2 pr-2">
              {history.map((entry) => (
                <div 
                  key={entry.countryId}
                  className={`flex items-center justify-between p-2 rounded transition-colors ${
                    entry.countryId === currentCountryId 
                      ? 'bg-primary/10 border border-primary/20' 
                      : 'bg-muted/30 hover:bg-muted/50'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    {onSelectCountry ? (
                      <button
                        onClick={() => onSelectCountry(entry.countryId)}
                        className="text-sm font-medium text-left hover:text-primary truncate block w-full"
                      >
                        {entry.countryName}
                      </button>
                    ) : (
                      <Link
                        to={`/country/${entry.countryId}/terrain-realities`}
                        className="text-sm font-medium hover:text-primary truncate flex items-center gap-1"
                      >
                        {entry.countryName}
                        {entry.countryId !== currentCountryId && (
                          <ExternalLink className="h-3 w-3 opacity-50" />
                        )}
                      </Link>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(entry.consultedAt), { 
                        addSuffix: true, 
                        locale: getDateLocale() 
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    {entry.riskLevel && (
                      <Badge variant="outline" className={`text-xs ${getRiskColor(entry.riskLevel)}`}>
                        {t(`terrainRealities.risk${entry.riskLevel.charAt(0).toUpperCase() + entry.riskLevel.slice(1)}`)}
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeFromHistory(entry.countryId);
                      }}
                    >
                      <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
