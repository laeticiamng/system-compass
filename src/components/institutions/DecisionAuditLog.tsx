import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  History, 
  Plus, 
  Edit, 
  CheckCircle, 
  XCircle, 
  ArrowRight,
  ChevronDown,
  ChevronRight,
  User,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface HistoryEntry {
  id: string;
  decision_id: string;
  user_id: string;
  author_name: string;
  action: string;
  changes: Record<string, { old: unknown; new: unknown }>;
  created_at: string;
}

interface DecisionAuditLogProps {
  decisionId: string;
  decisionTitle?: string;
}

const actionIcons: Record<string, React.ReactNode> = {
  created: <Plus className="h-4 w-4 text-green-500" />,
  updated: <Edit className="h-4 w-4 text-blue-500" />,
  status_changed: <CheckCircle className="h-4 w-4 text-amber-500" />,
  deleted: <XCircle className="h-4 w-4 text-red-500" />,
};

const actionLabels: Record<string, string> = {
  created: 'Création',
  updated: 'Modification',
  status_changed: 'Changement de statut',
  deleted: 'Suppression',
};

const actionColors: Record<string, string> = {
  created: 'bg-green-500/10 text-green-700 border-green-500/30',
  updated: 'bg-blue-500/10 text-blue-700 border-blue-500/30',
  status_changed: 'bg-amber-500/10 text-amber-700 border-amber-500/30',
  deleted: 'bg-red-500/10 text-red-700 border-red-500/30',
};

const fieldLabels: Record<string, string> = {
  title: 'Titre',
  context: 'Contexte',
  mainHypothesis: 'Hypothèse principale',
  main_hypothesis: 'Hypothèse principale',
  decision: 'Décision',
  status: 'Statut',
  author: 'Auteur',
  scope: 'Périmètre',
  constraints: 'Contraintes',
  alternativeHypotheses: 'Hypothèses alternatives',
  alternative_hypotheses: 'Hypothèses alternatives',
  abandonedBranches: 'Branches abandonnées',
  abandoned_branches: 'Branches abandonnées',
};

const statusLabels: Record<string, string> = {
  pending: 'En attente',
  validated: 'Validé',
  abandoned: 'Abandonné',
};

export function DecisionAuditLog({ decisionId, decisionTitle }: DecisionAuditLogProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());

  const fetchHistory = async () => {
    if (!user || !decisionId) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('traceos_decision_history')
      .select('*')
      .eq('decision_id', decisionId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setHistory(data as HistoryEntry[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHistory();
  }, [user, decisionId]);

  const toggleExpanded = (id: string) => {
    setExpandedEntries(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return '(vide)';
    if (typeof value === 'boolean') return value ? 'Oui' : 'Non';
    if (Array.isArray(value)) {
      if (value.length === 0) return '(aucun)';
      return value.map(v => typeof v === 'object' ? JSON.stringify(v) : String(v)).join(', ');
    }
    if (typeof value === 'object') return JSON.stringify(value);
    // Check if it's a status value
    if (typeof value === 'string' && statusLabels[value]) {
      return statusLabels[value];
    }
    return String(value);
  };

  const renderDiffLine = (field: string, oldValue: unknown, newValue: unknown) => {
    const label = fieldLabels[field] || field;
    const oldFormatted = formatValue(oldValue);
    const newFormatted = formatValue(newValue);
    const isLongText = oldFormatted.length > 50 || newFormatted.length > 50;

    if (isLongText) {
      return (
        <div key={field} className="space-y-2 p-3 bg-muted/30 rounded-lg">
          <p className="font-medium text-sm">{label}</p>
          <div className="grid gap-2">
            <div className="p-2 rounded bg-red-500/5 border border-red-500/20">
              <span className="text-xs text-red-600 font-medium">Avant:</span>
              <p className="text-sm mt-1 line-through text-muted-foreground">{oldFormatted}</p>
            </div>
            <div className="p-2 rounded bg-green-500/5 border border-green-500/20">
              <span className="text-xs text-green-600 font-medium">Après:</span>
              <p className="text-sm mt-1">{newFormatted}</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div key={field} className="flex items-start gap-2 p-2 bg-muted/30 rounded">
        <span className="font-medium text-sm min-w-[120px]">{label}:</span>
        <span className="line-through text-muted-foreground text-sm">{oldFormatted}</span>
        <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
        <span className="text-primary text-sm font-medium">{newFormatted}</span>
      </div>
    );
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <p>{t('traceos.history.loginRequired', 'Connectez-vous pour voir l\'historique')}</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <History className="h-4 w-4" />
            {t('traceos.history.title', 'Historique des modifications')}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={fetchHistory}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        {decisionTitle && (
          <p className="text-sm text-muted-foreground truncate">{decisionTitle}</p>
        )}
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          {history.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="text-sm">{t('traceos.history.empty', 'Aucune modification enregistrée')}</p>
              <p className="text-xs mt-1">Les modifications futures seront tracées ici</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-border" />
              
              <div className="space-y-4">
                {history.map((entry) => {
                  const isExpanded = expandedEntries.has(entry.id);
                  const hasChanges = Object.keys(entry.changes).length > 0;
                  
                  return (
                    <div key={entry.id} className="relative pl-8">
                      {/* Timeline dot */}
                      <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-2 bg-background flex items-center justify-center ${
                        entry.action === 'created' ? 'border-green-500' :
                        entry.action === 'updated' ? 'border-blue-500' :
                        entry.action === 'status_changed' ? 'border-amber-500' :
                        'border-red-500'
                      }`}>
                        {actionIcons[entry.action] || <Edit className="h-3 w-3" />}
                      </div>

                      <Collapsible open={isExpanded} onOpenChange={() => hasChanges && toggleExpanded(entry.id)}>
                        <div className={`p-3 rounded-lg border ${actionColors[entry.action] || 'bg-muted'}`}>
                          <CollapsibleTrigger asChild disabled={!hasChanges}>
                            <div className={`flex items-start justify-between ${hasChanges ? 'cursor-pointer' : ''}`}>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {actionLabels[entry.action] || entry.action}
                                  </Badge>
                                  {hasChanges && (
                                    <Badge variant="secondary" className="text-xs">
                                      {Object.keys(entry.changes).length} champ(s)
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    {entry.author_name}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {format(new Date(entry.created_at), 'PPp', { locale: fr })}
                                  </span>
                                </div>
                              </div>
                              {hasChanges && (
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                  {isExpanded ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </Button>
                              )}
                            </div>
                          </CollapsibleTrigger>

                          <CollapsibleContent>
                            {hasChanges && (
                              <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                                {Object.entries(entry.changes).map(([field, { old: oldValue, new: newValue }]) => 
                                  renderDiffLine(field, oldValue, newValue)
                                )}
                              </div>
                            )}
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// Utility function to record history entries
export async function recordDecisionHistory(
  decisionId: string,
  userId: string,
  authorName: string,
  action: string,
  changes: Record<string, { old: unknown; new: unknown }> = {}
) {
  const { error } = await supabase
    .from('traceos_decision_history')
    .insert([{
      decision_id: decisionId,
      user_id: userId,
      author_name: authorName,
      action,
      changes: JSON.parse(JSON.stringify(changes)),
    }]);

  if (error) {
    console.error('Error recording history:', error);
  }
}
