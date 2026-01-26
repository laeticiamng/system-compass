import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, FileArchive, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { IrreversaThreshold, IrreversaWitness, IrreversaAuditEntry } from '@/hooks/useIrreversa';
import { generateIrreversaCertificate } from './IrreversaPdfExport';
import { toast } from 'sonner';

interface BatchExportDialogProps {
  thresholds: IrreversaThreshold[];
  getWitnesses: (id: string) => Promise<IrreversaWitness[]>;
  getAuditLog: (id: string) => Promise<IrreversaAuditEntry[]>;
}

export function BatchExportDialog({ 
  thresholds, 
  getWitnesses, 
  getAuditLog 
}: BatchExportDialogProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [exportedCount, setExportedCount] = useState(0);

  // Only sealed thresholds can be batch exported
  const sealedThresholds = thresholds.filter(t => t.status === 'sealed');

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedIds(newSelection);
  };

  const selectAll = () => {
    if (selectedIds.size === sealedThresholds.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sealedThresholds.map(t => t.id)));
    }
  };

  const handleExport = async () => {
    if (selectedIds.size === 0) return;

    setIsExporting(true);
    setProgress(0);
    setExportedCount(0);

    const selectedThresholds = sealedThresholds.filter(t => selectedIds.has(t.id));
    const total = selectedThresholds.length;
    let completed = 0;

    for (const threshold of selectedThresholds) {
      try {
        const [witnesses, auditLog] = await Promise.all([
          getWitnesses(threshold.id),
          getAuditLog(threshold.id)
        ]);
        
        await generateIrreversaCertificate(threshold, witnesses, auditLog);
        
        completed++;
        setExportedCount(completed);
        setProgress((completed / total) * 100);
        
        // Small delay between exports to avoid overwhelming the browser
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (err) {
        console.error(`Failed to export ${threshold.title}:`, err);
      }
    }

    setIsExporting(false);
    toast.success(t('irreversa.batchExport.success', '{{count}} certificats exportés', { count: completed }));
    
    if (completed === total) {
      setOpen(false);
      setSelectedIds(new Set());
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" disabled={sealedThresholds.length === 0}>
          <FileArchive className="w-4 h-4" />
          {t('irreversa.batchExport.trigger', 'Export groupé')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileArchive className="w-5 h-5" />
            {t('irreversa.batchExport.title', 'Export groupé des certificats')}
          </DialogTitle>
          <DialogDescription>
            {t('irreversa.batchExport.description', 'Sélectionnez les seuils scellés à exporter en PDF.')}
          </DialogDescription>
        </DialogHeader>

        {sealedThresholds.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            {t('irreversa.batchExport.noSealed', 'Aucun seuil scellé à exporter.')}
          </div>
        ) : (
          <div className="space-y-4 max-h-[300px] overflow-y-auto">
            {/* Select all */}
            <div className="flex items-center gap-2 pb-2 border-b">
              <Checkbox
                id="select-all"
                checked={selectedIds.size === sealedThresholds.length}
                onCheckedChange={selectAll}
              />
              <Label htmlFor="select-all" className="font-medium cursor-pointer">
                {t('common.selectAll', 'Tout sélectionner')} ({sealedThresholds.length})
              </Label>
            </div>

            {/* Threshold list */}
            {sealedThresholds.map(threshold => (
              <div 
                key={threshold.id}
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                onClick={() => toggleSelection(threshold.id)}
              >
                <Checkbox
                  checked={selectedIds.has(threshold.id)}
                  onCheckedChange={() => toggleSelection(threshold.id)}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{threshold.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {t(`irreversa.domain.${threshold.domain}`)} • 
                    {threshold.sealed_at && ` ${new Date(threshold.sealed_at).toLocaleDateString()}`}
                  </p>
                </div>
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
              </div>
            ))}
          </div>
        )}

        {/* Progress */}
        {isExporting && (
          <div className="space-y-2">
            <Progress value={progress} />
            <p className="text-sm text-center text-muted-foreground">
              {t('irreversa.batchExport.progress', 'Export en cours... {{count}}/{{total}}', { 
                count: exportedCount, 
                total: selectedIds.size 
              })}
            </p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isExporting}>
            {t('common.cancel', 'Annuler')}
          </Button>
          <Button 
            onClick={handleExport} 
            disabled={selectedIds.size === 0 || isExporting}
            className="gap-2"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {t('irreversa.batchExport.export', 'Exporter {{count}} PDF', { count: selectedIds.size })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
