import { useTranslation } from 'react-i18next';
import { FileText, Download, Calendar, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { toast } from 'sonner';

interface ExportHistoryItem {
  id: string;
  type: 'pdf' | 'json' | 'csv';
  name: string;
  createdAt: string;
  size?: string;
  status: 'completed' | 'pending' | 'failed';
}

interface ExportHistoryWidgetProps {
  exports?: ExportHistoryItem[];
  onExport?: (type: 'pdf' | 'json' | 'csv') => Promise<void>;
  onDownload?: (exportId: string) => void;
  maxVisible?: number;
  className?: string;
}

export function ExportHistoryWidget({
  exports = [],
  onExport,
  onDownload,
  maxVisible = 5,
  className
}: ExportHistoryWidgetProps) {
  const { t } = useTranslation();
  const [exporting, setExporting] = useState<string | null>(null);

  const handleExport = async (type: 'pdf' | 'json' | 'csv') => {
    if (!onExport) return;
    setExporting(type);
    try {
      await onExport(type);
      toast.success(t('export.success', 'Export généré avec succès'));
    } catch (error) {
      toast.error(t('export.error', 'Erreur lors de l\'export'));
    } finally {
      setExporting(null);
    }
  };

  const getStatusBadge = (status: ExportHistoryItem['status']) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 bg-emerald-500/10">
            <CheckCircle className="w-3 h-3 mr-1" />
            {t('export.status.completed', 'Terminé')}
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="text-amber-500 border-amber-500/30 bg-amber-500/10">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            {t('export.status.pending', 'En cours')}
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="outline" className="text-destructive border-destructive/30 bg-destructive/10">
            <AlertTriangle className="w-3 h-3 mr-1" />
            {t('export.status.failed', 'Échoué')}
          </Badge>
        );
    }
  };

  const getTypeIcon = (type: ExportHistoryItem['type']) => {
    const colors = {
      pdf: 'text-red-500 bg-red-500/10',
      json: 'text-blue-500 bg-blue-500/10',
      csv: 'text-emerald-500 bg-emerald-500/10'
    };
    return (
      <div className={cn('p-2 rounded-lg', colors[type])}>
        <FileText className="w-4 h-4" />
      </div>
    );
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Download className="w-5 h-5 text-primary" />
              {t('export.history.title', 'Historique des exports')}
            </CardTitle>
            <CardDescription>
              {t('export.history.description', 'Vos exports récents et options de téléchargement')}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Export Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleExport('pdf')}
            disabled={!!exporting}
            className="gap-2"
          >
            {exporting === 'pdf' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileText className="w-4 h-4 text-red-500" />
            )}
            PDF
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleExport('json')}
            disabled={!!exporting}
            className="gap-2"
          >
            {exporting === 'json' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileText className="w-4 h-4 text-blue-500" />
            )}
            JSON
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleExport('csv')}
            disabled={!!exporting}
            className="gap-2"
          >
            {exporting === 'csv' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileText className="w-4 h-4 text-emerald-500" />
            )}
            CSV
          </Button>
        </div>

        {/* Export History List */}
        {exports.length > 0 ? (
          <div className="space-y-2">
            {exports.slice(0, maxVisible).map((exp) => (
              <div
                key={exp.id}
                className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                {getTypeIcon(exp.type)}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{exp.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {formatDate(exp.createdAt)}
                    {exp.size && <span>• {exp.size}</span>}
                  </div>
                </div>
                {getStatusBadge(exp.status)}
                {exp.status === 'completed' && onDownload && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onDownload(exp.id)}
                    className="h-8 w-8"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{t('export.history.empty', 'Aucun export récent')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
