import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, Trash2, ExternalLink, Clock } from 'lucide-react';
import { useTerrainHistory } from '@/hooks/useTerrainHistory';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

interface TerrainHistoryPanelProps {
  currentCountryId?: string;
  onSelectCountry?: (countryId: string) => void;
}

export function TerrainHistoryPanel({ currentCountryId, onSelectCountry }: TerrainHistoryPanelProps) {
  const { t, i18n } = useTranslation();
  const { history, removeFromHistory, clearHistory } = useTerrainHistory();

  const locale = i18n.language === 'fr' ? fr : enUS;

  if (history.length === 0) {
    return (
      <Card className="bg-card/30 border-muted">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <History className="h-4 w-4" />
            {t('terrainRealities.recentConsultations')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t('terrainRealities.noRecentConsultations')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/30 border-muted">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm flex items-center gap-2">
          <History className="h-4 w-4" />
          {t('terrainRealities.recentConsultations')}
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearHistory}
          className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-3 w-3 mr-1" />
          {t('terrainRealities.clearHistory')}
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px]">
          <div className="space-y-2">
            {history.map((entry) => (
              <div
                key={entry.countryId}
                className={`flex items-center justify-between p-2 rounded-md transition-colors ${
                  entry.countryId === currentCountryId
                    ? 'bg-primary/10 border border-primary/30'
                    : 'bg-muted/30 hover:bg-muted/50'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">
                      {entry.countryName}
                    </span>
                    {entry.riskLevel && (
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          entry.riskLevel === 'high'
                            ? 'bg-red-500/20 text-red-300 border-red-500/30'
                            : entry.riskLevel === 'medium'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-green-500/20 text-green-300 border-green-500/30'
                        }`}
                      >
                        {t(`terrainRealities.risk${entry.riskLevel.charAt(0).toUpperCase() + entry.riskLevel.slice(1)}`)}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(entry.consultedAt), {
                      addSuffix: true,
                      locale
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {entry.countryId !== currentCountryId && (
                    onSelectCountry ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSelectCountry(entry.countryId)}
                        className="h-7 w-7 p-0"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="h-7 w-7 p-0"
                      >
                        <Link to={`/terrain-realities/${entry.countryId}`}>
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </Button>
                    )
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFromHistory(entry.countryId)}
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
