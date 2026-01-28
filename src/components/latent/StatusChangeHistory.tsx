import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { History, ArrowRight, Calendar, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';

interface HistoryEntry {
  id: string;
  action: string;
  previous_status: string | null;
  new_status: string | null;
  notes: string | null;
  created_at: string;
}

interface StatusChangeHistoryProps {
  zoneId: string;
  zoneName: string;
}

export function StatusChangeHistory({ zoneId, zoneName }: StatusChangeHistoryProps) {
  const { t } = useTranslation();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('latent_zone_history')
          .select('*')
          .eq('zone_id', zoneId)
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) throw error;
        setHistory(data || []);
      } catch (error) {
        console.error('Error fetching zone history:', error);
      } finally {
        setLoading(false);
      }
    };

    if (zoneId) {
      fetchHistory();
    }
  }, [zoneId]);

  const statusColors: Record<string, string> = {
    dormant: 'bg-muted text-muted-foreground',
    emerging: 'bg-blue-500/10 text-blue-700 border-blue-500/30',
    active: 'bg-green-500/10 text-green-700 border-green-500/30',
    critical: 'bg-red-500/10 text-red-700 border-red-500/30',
    resolved: 'bg-purple-500/10 text-purple-700 border-purple-500/30'
  };

  const statusLabels: Record<string, string> = {
    dormant: t('latent.status.dormant', 'Dormant'),
    emerging: t('latent.status.emerging', 'Émergent'),
    active: t('latent.status.active', 'Actif'),
    critical: t('latent.status.critical', 'Critique'),
    resolved: t('latent.status.resolved', 'Résolu')
  };

  const actionLabels: Record<string, string> = {
    created: t('latent.history.created', 'Création'),
    status_change: t('latent.history.statusChange', 'Changement de statut'),
    updated: t('latent.history.updated', 'Mise à jour'),
    tension_added: t('latent.history.tensionAdded', 'Tension ajoutée'),
    archived: t('latent.history.archived', 'Archivé')
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5" />
          {t('latent.history.title', 'Historique')} - {zoneName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[350px] pr-4">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-border" />

            <div className="space-y-4">
              {history.map((entry) => (
                <div key={entry.id} className="relative pl-8">
                  {/* Timeline dot */}
                  <div className="absolute left-0 w-6 h-6 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>

                  <div className="p-3 rounded-lg border bg-card">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">
                        {actionLabels[entry.action] || entry.action}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(entry.created_at)}
                      </span>
                    </div>

                    {entry.action === 'status_change' && entry.previous_status && entry.new_status && (
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className={statusColors[entry.previous_status] || ''}>
                          {statusLabels[entry.previous_status] || entry.previous_status}
                        </Badge>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        <Badge variant="outline" className={statusColors[entry.new_status] || ''}>
                          {statusLabels[entry.new_status] || entry.new_status}
                        </Badge>
                      </div>
                    )}

                    {entry.notes && (
                      <p className="text-sm text-muted-foreground mt-2 italic">
                        "{entry.notes}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {history.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>{t('latent.history.empty', 'Aucun historique disponible')}</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
