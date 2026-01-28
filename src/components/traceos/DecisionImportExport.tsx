// TraceOS Decision Import/Export - Backup and restore decisions
import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  Download, 
  Upload, 
  FileJson, 
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Shield,
  
  Archive
} from 'lucide-react';
import { format } from 'date-fns';

interface Decision {
  id: string;
  title: string;
  context?: string;
  status: string;
  hypotheses?: string[];
  alternatives?: string[];
  constraints?: string[];
  created_at: string;
  updated_at: string;
}

interface DecisionImportExportProps {
  decisions: Decision[];
  onImport?: (decisions: Decision[]) => Promise<void>;
  exportFormats?: ('json' | 'csv')[];
}

interface ImportResult {
  success: number;
  failed: number;
  skipped: number;
  errors: string[];
}

export function DecisionImportExport({
  decisions,
  onImport,
  exportFormats = ['json', 'csv']
}: DecisionImportExportProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [selectedDecisions, setSelectedDecisions] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedDecisions(new Set(decisions.map(d => d.id)));
    } else {
      setSelectedDecisions(new Set());
    }
  };

  // Selection handler kept for future per-item selection UI
  void ((_id: string, _checked: boolean) => {
    // Placeholder for individual selection
  });

  const exportToJson = async () => {
    setIsExporting(true);
    try {
      const dataToExport = selectedDecisions.size > 0
        ? decisions.filter(d => selectedDecisions.has(d.id))
        : decisions;

      const exportData = {
        version: '1.0',
        exported_at: new Date().toISOString(),
        count: dataToExport.length,
        decisions: dataToExport.map(d => ({
          ...d,
          _exportMeta: {
            source: 'TraceOS',
            exportedAt: new Date().toISOString()
          }
        }))
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `traceos-decisions-${format(new Date(), 'yyyy-MM-dd-HHmm')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(t('traceos.export.success', 'Export réussi'), {
        description: t('traceos.export.successDesc', '{{count}} décisions exportées', { count: dataToExport.length })
      });
    } catch (error) {
      console.error('Export error:', error);
      toast.error(t('traceos.export.error', 'Erreur lors de l\'export'));
    } finally {
      setIsExporting(false);
    }
  };

  const exportToCsv = async () => {
    setIsExporting(true);
    try {
      const dataToExport = selectedDecisions.size > 0
        ? decisions.filter(d => selectedDecisions.has(d.id))
        : decisions;

      const headers = ['ID', 'Titre', 'Contexte', 'Statut', 'Hypothèses', 'Alternatives', 'Contraintes', 'Créé le', 'Modifié le'];
      const rows = dataToExport.map(d => [
        d.id,
        `"${(d.title || '').replace(/"/g, '""')}"`,
        `"${(d.context || '').replace(/"/g, '""')}"`,
        d.status,
        `"${(d.hypotheses || []).join('; ').replace(/"/g, '""')}"`,
        `"${(d.alternatives || []).join('; ').replace(/"/g, '""')}"`,
        `"${(d.constraints || []).join('; ').replace(/"/g, '""')}"`,
        d.created_at,
        d.updated_at
      ]);

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `traceos-decisions-${format(new Date(), 'yyyy-MM-dd-HHmm')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(t('traceos.export.success', 'Export réussi'));
    } catch (error) {
      console.error('Export CSV error:', error);
      toast.error(t('traceos.export.error', 'Erreur lors de l\'export'));
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportProgress(0);
    setImportResult(null);

    try {
      const text = await file.text();
      let importData: { decisions: Decision[] };

      if (file.name.endsWith('.json')) {
        importData = JSON.parse(text);
      } else {
        toast.error(t('traceos.import.unsupportedFormat', 'Format non supporté'));
        return;
      }

      if (!importData.decisions || !Array.isArray(importData.decisions)) {
        throw new Error('Invalid file format');
      }

      const result: ImportResult = {
        success: 0,
        failed: 0,
        skipped: 0,
        errors: []
      };

      const totalDecisions = importData.decisions.length;
      const validDecisions: Decision[] = [];

      for (let i = 0; i < totalDecisions; i++) {
        const decision = importData.decisions[i];
        setImportProgress(Math.round(((i + 1) / totalDecisions) * 100));

        // Validate decision structure
        if (!decision.title || !decision.id) {
          result.failed++;
          result.errors.push(`Decision ${i + 1}: Missing required fields`);
          continue;
        }

        // Check for duplicates
        if (decisions.some(d => d.id === decision.id)) {
          result.skipped++;
          continue;
        }

        validDecisions.push({
          ...decision,
          id: decision.id || crypto.randomUUID(),
          created_at: decision.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        result.success++;
      }

      if (onImport && validDecisions.length > 0) {
        await onImport(validDecisions);
      }

      setImportResult(result);
      
      if (result.success > 0) {
        toast.success(t('traceos.import.success', 'Import réussi'), {
          description: t('traceos.import.successDesc', '{{count}} décisions importées', { count: result.success })
        });
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error(t('traceos.import.error', 'Erreur lors de l\'import'));
      setImportResult({
        success: 0,
        failed: 1,
        skipped: 0,
        errors: [(error as Error).message]
      });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            {t('traceos.export.title', 'Exporter les décisions')}
          </CardTitle>
          <CardDescription>
            {t('traceos.export.description', 'Sauvegardez vos décisions en local pour archivage ou transfert')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {decisions.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="selectAll" 
                  checked={selectAll}
                  onCheckedChange={handleSelectAll}
                />
                <Label htmlFor="selectAll" className="text-sm">
                  {t('traceos.export.selectAll', 'Tout sélectionner')} ({decisions.length})
                </Label>
              </div>
              
              {selectedDecisions.size > 0 && (
                <Badge variant="secondary">
                  {selectedDecisions.size} {t('traceos.export.selected', 'sélectionnées')}
                </Badge>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {exportFormats.includes('json') && (
              <Button 
                onClick={exportToJson} 
                disabled={isExporting || decisions.length === 0}
                variant="outline"
              >
                {isExporting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FileJson className="h-4 w-4 mr-2" />
                )}
                {t('traceos.export.json', 'Exporter JSON')}
              </Button>
            )}
            {exportFormats.includes('csv') && (
              <Button 
                onClick={exportToCsv} 
                disabled={isExporting || decisions.length === 0}
                variant="outline"
              >
                {isExporting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                )}
                {t('traceos.export.csv', 'Exporter CSV')}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Archive className="h-4 w-4" />
            <span>{t('traceos.export.hint', 'Les exports incluent toutes les métadonnées')}</span>
          </div>
        </CardContent>
      </Card>

      {/* Import Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            {t('traceos.import.title', 'Importer des décisions')}
          </CardTitle>
          <CardDescription>
            {t('traceos.import.description', 'Restaurez des décisions depuis un fichier JSON')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="hidden"
          />

          <Button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting || !onImport}
            variant="outline"
            className="w-full"
          >
            {isImporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            {t('traceos.import.selectFile', 'Sélectionner un fichier')}
          </Button>

          {isImporting && (
            <div className="space-y-2">
              <Progress value={importProgress} />
              <p className="text-sm text-muted-foreground text-center">
                {t('traceos.import.progress', 'Import en cours...')} {importProgress}%
              </p>
            </div>
          )}

          {importResult && (
            <Alert variant={importResult.failed > 0 ? 'destructive' : 'default'}>
              <div className="flex items-start gap-2">
                {importResult.failed > 0 ? (
                  <AlertCircle className="h-4 w-4" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
                <AlertDescription>
                  <div className="space-y-1">
                    <p>
                      {t('traceos.import.result', 'Résultat')}: {importResult.success} {t('traceos.import.imported', 'importées')}, 
                      {importResult.skipped} {t('traceos.import.skipped', 'ignorées')}, 
                      {importResult.failed} {t('traceos.import.failed', 'échouées')}
                    </p>
                    {importResult.errors.length > 0 && (
                      <ul className="text-xs mt-2">
                        {importResult.errors.slice(0, 3).map((err, i) => (
                          <li key={i}>• {err}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </AlertDescription>
              </div>
            </Alert>
          )}

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>{t('traceos.import.hint', 'Les doublons sont automatiquement détectés')}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
