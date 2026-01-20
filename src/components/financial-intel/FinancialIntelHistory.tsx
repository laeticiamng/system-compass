import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, Clock, MapPin, Eye, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { FinancialIntelResult } from '@/hooks/useFinancialIntel';
import type { Json } from '@/integrations/supabase/types';

interface HistoryItem {
  id: string;
  country: string;
  sector_focus: string;
  audience: string;
  created_at: string;
  confidence: number;
  scam_top7_json: Json;
  legit_top7_json: Json;
  sources_json: Json;
  country_profile: Json;
  disclaimer: string;
}

interface FinancialIntelHistoryProps {
  onLoadSnapshot: (result: FinancialIntelResult) => void;
}

export function FinancialIntelHistory({ onLoadSnapshot }: FinancialIntelHistoryProps) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const fetchHistory = async () => {
    if (!user) return;
    
    try {
      // Fetch user's own generation runs and their associated snapshots
      const { data: runs, error: runsError } = await supabase
        .from('financial_intel_generation_runs')
        .select('snapshot_id, country, created_at')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(20);

      if (runsError) throw runsError;

      if (!runs || runs.length === 0) {
        setHistory([]);
        setIsLoading(false);
        return;
      }

      // Get unique snapshot IDs
      const snapshotIds = [...new Set(runs.map(r => r.snapshot_id).filter(Boolean))] as string[];
      
      if (snapshotIds.length === 0) {
        setHistory([]);
        setIsLoading(false);
        return;
      }

      const { data: snapshots, error: snapshotsError } = await supabase
        .from('financial_intel_country_snapshots')
        .select('*')
        .in('id', snapshotIds);

      if (snapshotsError) throw snapshotsError;
      
      // Match snapshots with runs to get correct order
      const orderedHistory = runs
        .map(run => snapshots?.find(s => s.id === run.snapshot_id))
        .filter(Boolean) as HistoryItem[];

      setHistory(orderedHistory);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const handleLoadSnapshot = (item: HistoryItem) => {
    setLoadingId(item.id);
    
    const result: FinancialIntelResult = {
      country_profile: item.country_profile as any,
      scam_top7: item.scam_top7_json as any,
      legit_top7: item.legit_top7_json as any,
      sources: item.sources_json as any,
      confidence: item.confidence || 0.5,
      disclaimer: item.disclaimer,
      cached: true
    };
    
    onLoadSnapshot(result);
    setLoadingId(null);
    toast.success(t('financialIntel.snapshotLoaded', 'Rapport chargé'));
  };

  if (!user) {
    return (
      <Card className="bg-card/30">
        <CardContent className="py-6 text-center text-muted-foreground">
          <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">{t('financialIntel.loginForHistory', 'Connectez-vous pour voir l\'historique')}</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="bg-card/30">
        <CardContent className="py-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card className="bg-card/30">
        <CardContent className="py-6 text-center text-muted-foreground">
          <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">{t('financialIntel.noHistory', 'Aucun rapport généré')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <History className="h-4 w-4" />
          {t('financialIntel.history', 'Historique des rapports')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px]">
          <div className="space-y-2">
            {history.map((item) => (
              <div 
                key={item.id}
                className="flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate capitalize">{item.country}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>
                        {formatDistanceToNow(new Date(item.created_at), { 
                          addSuffix: true, 
                          locale: i18n.language === 'fr' ? fr : undefined 
                        })}
                      </span>
                      {item.sector_focus && (
                        <Badge variant="outline" className="text-xs py-0">
                          {item.sector_focus}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0 gap-1"
                  onClick={() => handleLoadSnapshot(item)}
                  disabled={loadingId === item.id}
                >
                  {loadingId === item.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">{t('common.view', 'Voir')}</span>
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
