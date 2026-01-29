import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { History, Clock, User, ChevronDown, ChevronUp, RotateCcw, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

export interface VersionEntry {
  id: string;
  version: number;
  timestamp: Date;
  author?: string;
  changes: string[];
  type: 'create' | 'update' | 'seal' | 'archive';
  data?: any; // Snapshot of data at this version
}

interface VersionHistoryProps {
  entries: VersionEntry[];
  currentVersion: number;
  onRestore?: (entry: VersionEntry) => void;
  onPreview?: (entry: VersionEntry) => void;
  maxHeight?: string;
  className?: string;
}

const typeConfig = {
  create: { label: 'version.type.create', color: 'bg-green-500/10 text-green-500 border-green-500/30' },
  update: { label: 'version.type.update', color: 'bg-blue-500/10 text-blue-500 border-blue-500/30' },
  seal: { label: 'version.type.seal', color: 'bg-amber-500/10 text-amber-500 border-amber-500/30' },
  archive: { label: 'version.type.archive', color: 'bg-purple-500/10 text-purple-500 border-purple-500/30' },
};

export function VersionHistory({
  entries,
  currentVersion,
  onRestore,
  onPreview,
  maxHeight = '400px',
  className,
}: VersionHistoryProps) {
  const { t } = useTranslation();
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());

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

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('version.justNow', 'À l\'instant');
    if (diffMins < 60) return t('version.minutesAgo', { count: diffMins });
    if (diffHours < 24) return t('version.hoursAgo', { count: diffHours });
    if (diffDays < 7) return t('version.daysAgo', { count: diffDays });
    
    return date.toLocaleDateString();
  };

  if (entries.length === 0) {
    return (
      <Card className={cn('border-dashed', className)}>
        <CardContent className="py-8 text-center text-muted-foreground">
          <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">{t('version.noHistory', 'Aucun historique disponible')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <History className="w-4 h-4" />
          {t('version.title', 'Historique des versions')}
          <Badge variant="outline" className="ml-auto">
            v{currentVersion}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea style={{ maxHeight }} className="pr-4">
          <div className="space-y-2">
            {entries.map((entry) => {
              const config = typeConfig[entry.type];
              const isExpanded = expandedEntries.has(entry.id);
              const isCurrent = entry.version === currentVersion;

              return (
                <Collapsible key={entry.id} open={isExpanded} onOpenChange={() => toggleExpanded(entry.id)}>
                  <div className={cn(
                    'rounded-lg border p-3 transition-colors',
                    isCurrent && 'border-primary/50 bg-primary/5',
                  )}>
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={config.color}>
                          v{entry.version}
                        </Badge>
                        {isCurrent && (
                          <Badge variant="secondary" className="text-xs">
                            {t('version.current', 'Actuel')}
                          </Badge>
                        )}
                      </div>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimestamp(entry.timestamp)}
                      </span>
                      {entry.author && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {entry.author}
                        </span>
                      )}
                    </div>

                    {/* Expanded content */}
                    <CollapsibleContent>
                      <div className="mt-3 pt-3 border-t space-y-3">
                        {/* Changes list */}
                        {entry.changes.length > 0 && (
                          <div>
                            <p className="text-xs font-medium mb-1">{t('version.changes', 'Modifications')}:</p>
                            <ul className="text-xs text-muted-foreground space-y-1">
                              {entry.changes.map((change, idx) => (
                                <li key={idx} className="flex items-start gap-1">
                                  <span className="text-primary">•</span>
                                  {change}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2">
                          {onPreview && entry.data && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onPreview(entry)}
                              className="gap-1 text-xs h-7"
                            >
                              <Eye className="w-3 h-3" />
                              {t('version.preview', 'Aperçu')}
                            </Button>
                          )}
                          {onRestore && !isCurrent && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onRestore(entry)}
                              className="gap-1 text-xs h-7"
                            >
                              <RotateCcw className="w-3 h-3" />
                              {t('version.restore', 'Restaurer')}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
