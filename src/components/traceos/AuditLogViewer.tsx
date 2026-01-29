import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Calendar, 
  User, 
  FileText, 
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Download
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AuditLogEntry {
  id: string;
  timestamp: Date;
  action: string;
  actor: string;
  actorRole: string;
  module: string;
  details: string;
  status: 'success' | 'warning' | 'error';
  metadata?: Record<string, unknown>;
}

interface AuditLogViewerProps {
  entries: AuditLogEntry[];
  onExport?: (entries: AuditLogEntry[]) => void;
}

export function AuditLogViewer({ entries, onExport }: AuditLogViewerProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const modules = useMemo(() => {
    const uniqueModules = new Set(entries.map(e => e.module));
    return Array.from(uniqueModules);
  }, [entries]);

  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      const matchesSearch = !searchQuery || 
        entry.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.details.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesModule = !selectedModule || entry.module === selectedModule;
      
      return matchesSearch && matchesModule;
    });
  }, [entries, searchQuery, selectedModule]);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getStatusIcon = (status: AuditLogEntry['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
  };

  const handleExport = () => {
    if (onExport) {
      onExport(filteredEntries);
    } else {
      // Default CSV export
      const csv = [
        ['Timestamp', 'Action', 'Actor', 'Role', 'Module', 'Status', 'Details'].join(','),
        ...filteredEntries.map(e => [
          e.timestamp.toISOString(),
          `"${e.action}"`,
          `"${e.actor}"`,
          `"${e.actorRole}"`,
          e.module,
          e.status,
          `"${e.details.replace(/"/g, '""')}"`
        ].join(','))
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-log-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {t('audit.title', 'Journal d\'Audit')}
            </CardTitle>
            <CardDescription>
              {t('audit.description', 'Historique des actions et décisions')}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
            <Download className="w-4 h-4" />
            {t('audit.export', 'Exporter')}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('audit.search', 'Rechercher...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedModule === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedModule(null)}
            >
              {t('audit.all', 'Tous')}
            </Button>
            {modules.slice(0, 4).map(module => (
              <Button
                key={module}
                variant={selectedModule === module ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedModule(module)}
              >
                {module}
              </Button>
            ))}
          </div>
        </div>

        {/* Entries */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredEntries.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {t('audit.noEntries', 'Aucune entrée trouvée')}
            </p>
          ) : (
            filteredEntries.map(entry => (
              <div
                key={entry.id}
                className="p-3 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors"
              >
                <div 
                  className="flex items-start justify-between cursor-pointer"
                  onClick={() => toggleExpand(entry.id)}
                >
                  <div className="flex items-start gap-3">
                    {getStatusIcon(entry.status)}
                    <div className="min-w-0">
                      <p className="font-medium text-sm">{entry.action}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <User className="w-3 h-3" />
                        <span>{entry.actor}</span>
                        <span>•</span>
                        <Calendar className="w-3 h-3" />
                        <span>{format(entry.timestamp, 'dd MMM yyyy HH:mm', { locale: fr })}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {entry.module}
                    </Badge>
                    {expandedIds.has(entry.id) ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
                
                {expandedIds.has(entry.id) && (
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <p className="text-sm text-muted-foreground">{entry.details}</p>
                    {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                      <div className="mt-2 p-2 rounded bg-muted/50 text-xs font-mono">
                        {JSON.stringify(entry.metadata, null, 2)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center">
          {t('audit.showing', 'Affichage de {{count}} entrées', { count: filteredEntries.length })}
        </p>
      </CardContent>
    </Card>
  );
}
