// TraceOS Decision Timeline - Visual history of decision progression
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  PauseCircle, 
  AlertTriangle,
  GitBranch,
  FileText,
  User,
  Calendar,
  ChevronDown,
  ChevronUp,
  Filter
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface TimelineEvent {
  id: string;
  type: 'created' | 'updated' | 'validated' | 'rejected' | 'paused' | 'archived' | 'branched' | 'merged';
  timestamp: string;
  actor?: string;
  description: string;
  metadata?: Record<string, unknown>;
}

interface Decision {
  id: string;
  title: string;
  status: 'draft' | 'pending' | 'validated' | 'rejected' | 'archived';
  created_at: string;
  updated_at: string;
  events: TimelineEvent[];
}

interface DecisionTimelineProps {
  decisions: Decision[];
  onDecisionClick?: (decisionId: string) => void;
  maxItems?: number;
  showFilters?: boolean;
}

export function DecisionTimeline({
  decisions,
  onDecisionClick,
  maxItems = 50,
  showFilters = true
}: DecisionTimelineProps) {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === 'fr' ? fr : enUS;
  
  const [expandedDecisions, setExpandedDecisions] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const toggleExpanded = (decisionId: string) => {
    const newExpanded = new Set(expandedDecisions);
    if (newExpanded.has(decisionId)) {
      newExpanded.delete(decisionId);
    } else {
      newExpanded.add(decisionId);
    }
    setExpandedDecisions(newExpanded);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'validated':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'draft':
        return <FileText className="h-4 w-4 text-muted-foreground" />;
      case 'archived':
        return <PauseCircle className="h-4 w-4 text-muted-foreground" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'created':
        return <FileText className="h-3 w-3" />;
      case 'updated':
        return <Clock className="h-3 w-3" />;
      case 'validated':
        return <CheckCircle2 className="h-3 w-3 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-3 w-3 text-red-500" />;
      case 'paused':
        return <PauseCircle className="h-3 w-3 text-amber-500" />;
      case 'branched':
        return <GitBranch className="h-3 w-3 text-blue-500" />;
      case 'merged':
        return <GitBranch className="h-3 w-3 text-purple-500" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const getStatusBadgeVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'validated':
        return 'default';
      case 'rejected':
        return 'destructive';
      case 'pending':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const filteredDecisions = decisions
    .filter(d => statusFilter === 'all' || d.status === statusFilter)
    .slice(0, maxItems);

  // Flatten all events for timeline view - kept for future global timeline mode
  void filteredDecisions
    .flatMap(d => d.events.map(e => ({ ...e, decision: d })))
    .filter(e => typeFilter === 'all' || e.type === typeFilter)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {t('traceos.timeline.title', 'Chronologie des décisions')}
          </CardTitle>
          <Badge variant="outline">
            {filteredDecisions.length} {t('traceos.timeline.decisions', 'décisions')}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        {showFilters && (
          <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b">
            <div className="flex items-center gap-1">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {t('traceos.timeline.filters', 'Filtres')}:
              </span>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm border rounded px-2 py-1 bg-background"
            >
              <option value="all">{t('traceos.timeline.allStatuses', 'Tous les statuts')}</option>
              <option value="draft">{t('traceos.status.draft', 'Brouillon')}</option>
              <option value="pending">{t('traceos.status.pending', 'En attente')}</option>
              <option value="validated">{t('traceos.status.validated', 'Validée')}</option>
              <option value="rejected">{t('traceos.status.rejected', 'Rejetée')}</option>
              <option value="archived">{t('traceos.status.archived', 'Archivée')}</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-sm border rounded px-2 py-1 bg-background"
            >
              <option value="all">{t('traceos.timeline.allEvents', 'Tous les événements')}</option>
              <option value="created">{t('traceos.event.created', 'Création')}</option>
              <option value="updated">{t('traceos.event.updated', 'Modification')}</option>
              <option value="validated">{t('traceos.event.validated', 'Validation')}</option>
              <option value="rejected">{t('traceos.event.rejected', 'Rejet')}</option>
            </select>
          </div>
        )}

        <ScrollArea className="h-[400px] pr-4">
          {filteredDecisions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <Clock className="h-8 w-8 mb-2" />
              <p>{t('traceos.timeline.empty', 'Aucune décision à afficher')}</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

              {filteredDecisions.map((decision, index) => {
                const isExpanded = expandedDecisions.has(decision.id);
                
                return (
                  <div key={decision.id} className="relative pl-10 pb-6">
                    {/* Timeline dot */}
                    <div className="absolute left-2 w-5 h-5 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                      {getStatusIcon(decision.status)}
                    </div>

                    <div 
                      className={cn(
                        "p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer",
                        index === 0 && "border-primary/50"
                      )}
                      onClick={() => onDecisionClick?.(decision.id)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium truncate">{decision.title}</h4>
                            <Badge variant={getStatusBadgeVariant(decision.status)}>
                              {t(`traceos.status.${decision.status}`, decision.status)}
                            </Badge>
                          </div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatDistanceToNow(new Date(decision.created_at), { 
                                    addSuffix: true,
                                    locale: dateLocale 
                                  })}
                                </p>
                              </TooltipTrigger>
                              <TooltipContent>
                                {format(new Date(decision.created_at), 'PPpp', { locale: dateLocale })}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        
                        {decision.events.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpanded(decision.id);
                            }}
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                            <span className="ml-1 text-xs">
                              {decision.events.length}
                            </span>
                          </Button>
                        )}
                      </div>

                      {/* Expanded events */}
                      {isExpanded && decision.events.length > 0 && (
                        <div className="mt-3 pt-3 border-t space-y-2">
                          {decision.events.map((event) => (
                            <div 
                              key={event.id}
                              className="flex items-start gap-2 text-sm"
                            >
                              <span className="mt-0.5">{getEventIcon(event.type)}</span>
                              <div className="flex-1">
                                <p className="text-muted-foreground">{event.description}</p>
                                <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                                  {event.actor && (
                                    <span className="flex items-center gap-1">
                                      <User className="h-3 w-3" />
                                      {event.actor}
                                    </span>
                                  )}
                                  <span>
                                    {formatDistanceToNow(new Date(event.timestamp), { 
                                      addSuffix: true,
                                      locale: dateLocale 
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
