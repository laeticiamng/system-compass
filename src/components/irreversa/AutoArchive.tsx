// Irreversa Auto Archive - Automatic threshold archival system
import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  Archive, 
  Clock, 
  Settings, 
  AlertTriangle,
  CheckCircle2,
  CalendarDays,
  FileText,
  Download,
  Trash2,
  Info
} from 'lucide-react';
import { differenceInDays, format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

interface Threshold {
  id: string;
  title: string;
  status: 'detected' | 'marked' | 'validated' | 'sealed';
  detection_date: string;
  sealed_at?: string;
  updated_at: string;
}

interface ArchiveConfig {
  enabled: boolean;
  archiveAfterDays: number;
  archiveOnlySealed: boolean;
  exportBeforeArchive: boolean;
  retentionDays: number;
}

interface AutoArchiveProps {
  thresholds: Threshold[];
  config: ArchiveConfig;
  onConfigChange: (config: ArchiveConfig) => void;
  onArchive: (thresholdIds: string[]) => Promise<void>;
  onExport?: (thresholdIds: string[]) => void;
}

export function AutoArchive({
  thresholds,
  config,
  onConfigChange,
  onArchive,
  onExport
}: AutoArchiveProps) {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === 'fr' ? fr : enUS;
  
  const [isArchiving, setIsArchiving] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedThresholds, setSelectedThresholds] = useState<string[]>([]);

  const eligibleForArchive = useMemo(() => {
    const now = new Date();
    return thresholds.filter(threshold => {
      // Only sealed thresholds can be archived if config says so
      if (config.archiveOnlySealed && threshold.status !== 'sealed') {
        return false;
      }

      // Check age
      const referenceDate = threshold.sealed_at || threshold.updated_at;
      const daysSince = differenceInDays(now, new Date(referenceDate));
      return daysSince >= config.archiveAfterDays;
    });
  }, [thresholds, config]);

  const handleArchiveClick = () => {
    setSelectedThresholds(eligibleForArchive.map(t => t.id));
    setShowConfirmDialog(true);
  };

  const handleConfirmArchive = async () => {
    if (selectedThresholds.length === 0) return;

    setIsArchiving(true);
    try {
      if (config.exportBeforeArchive && onExport) {
        onExport(selectedThresholds);
      }

      await onArchive(selectedThresholds);
      
      toast.success(t('irreversa.archive.success', 'Archivage réussi'), {
        description: t('irreversa.archive.successDesc', '{{count}} seuils archivés', { 
          count: selectedThresholds.length 
        })
      });
      
      setShowConfirmDialog(false);
      setSelectedThresholds([]);
    } catch (error) {
      console.error('Archive error:', error);
      toast.error(t('irreversa.archive.error', 'Erreur lors de l\'archivage'));
    } finally {
      setIsArchiving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sealed':
        return <Badge className="bg-purple-500">{t('irreversa.status.sealed', 'Scellé')}</Badge>;
      case 'validated':
        return <Badge className="bg-green-500">{t('irreversa.status.validated', 'Validé')}</Badge>;
      case 'marked':
        return <Badge className="bg-amber-500">{t('irreversa.status.marked', 'Marqué')}</Badge>;
      default:
        return <Badge variant="outline">{t('irreversa.status.detected', 'Détecté')}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Configuration Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {t('irreversa.archive.configTitle', 'Configuration d\'archivage')}
          </CardTitle>
          <CardDescription>
            {t('irreversa.archive.configDesc', 'Paramétrez l\'archivage automatique des seuils anciens')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Enable Auto Archive */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t('irreversa.archive.enable', 'Activer l\'archivage automatique')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('irreversa.archive.enableDesc', 'Archive automatiquement les seuils anciens')}
              </p>
            </div>
            <Switch
              checked={config.enabled}
              onCheckedChange={(enabled) => onConfigChange({ ...config, enabled })}
            />
          </div>

          {/* Archive After Days */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('irreversa.archive.archiveAfter', 'Archiver après (jours)')}</Label>
              <Input
                type="number"
                min={30}
                max={365}
                value={config.archiveAfterDays}
                onChange={(e) => onConfigChange({ 
                  ...config, 
                  archiveAfterDays: parseInt(e.target.value) || 90 
                })}
                disabled={!config.enabled}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('irreversa.archive.retention', 'Rétention archives (jours)')}</Label>
              <Input
                type="number"
                min={30}
                max={3650}
                value={config.retentionDays}
                onChange={(e) => onConfigChange({ 
                  ...config, 
                  retentionDays: parseInt(e.target.value) || 365 
                })}
                disabled={!config.enabled}
              />
            </div>
          </div>

          {/* Archive Only Sealed */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t('irreversa.archive.onlySealed', 'Archiver uniquement les scellés')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('irreversa.archive.onlySealedDesc', 'Ne pas archiver les seuils non finalisés')}
              </p>
            </div>
            <Switch
              checked={config.archiveOnlySealed}
              onCheckedChange={(archiveOnlySealed) => onConfigChange({ ...config, archiveOnlySealed })}
              disabled={!config.enabled}
            />
          </div>

          {/* Export Before Archive */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t('irreversa.archive.exportFirst', 'Exporter avant archivage')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('irreversa.archive.exportFirstDesc', 'Crée une sauvegarde PDF avant archivage')}
              </p>
            </div>
            <Switch
              checked={config.exportBeforeArchive}
              onCheckedChange={(exportBeforeArchive) => onConfigChange({ ...config, exportBeforeArchive })}
              disabled={!config.enabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Eligible for Archive */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Archive className="h-5 w-5" />
              {t('irreversa.archive.eligibleTitle', 'Éligibles à l\'archivage')}
            </CardTitle>
            <Badge variant="outline">
              {eligibleForArchive.length} {t('irreversa.archive.items', 'éléments')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {eligibleForArchive.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
              <CheckCircle2 className="h-8 w-8 mb-2 text-green-500" />
              <p>{t('irreversa.archive.noneEligible', 'Aucun seuil éligible à l\'archivage')}</p>
              <p className="text-sm mt-1">
                {t('irreversa.archive.noneEligibleDesc', 'Tous les seuils sont trop récents')}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {eligibleForArchive.slice(0, 5).map((threshold) => (
                <div 
                  key={threshold.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{threshold.title}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        {format(new Date(threshold.detection_date), 'PP', { locale: dateLocale })}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(threshold.status)}
                </div>
              ))}
              
              {eligibleForArchive.length > 5 && (
                <p className="text-sm text-muted-foreground text-center">
                  {t('irreversa.archive.andMore', 'Et {{count}} autres...', { 
                    count: eligibleForArchive.length - 5 
                  })}
                </p>
              )}

              <div className="pt-4 flex gap-2">
                <Button 
                  onClick={handleArchiveClick}
                  disabled={isArchiving}
                  className="flex-1"
                >
                  <Archive className="h-4 w-4 mr-2" />
                  {t('irreversa.archive.archiveAll', 'Archiver tout')} ({eligibleForArchive.length})
                </Button>
                {onExport && (
                  <Button 
                    variant="outline"
                    onClick={() => onExport(eligibleForArchive.map(t => t.id))}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          {t('irreversa.archive.info', 'Les seuils archivés restent accessibles en lecture seule pendant {{days}} jours avant suppression définitive.', {
            days: config.retentionDays
          })}
        </AlertDescription>
      </Alert>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              {t('irreversa.archive.confirmTitle', 'Confirmer l\'archivage')}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              {t('irreversa.archive.confirmDesc', 'Vous êtes sur le point d\'archiver {{count}} seuils. Cette action:', {
                count: selectedThresholds.length
              })}
            </p>
            <ul className="text-sm space-y-2">
              <li className="flex items-center gap-2">
                <Archive className="h-4 w-4 text-muted-foreground" />
                {t('irreversa.archive.confirmPoint1', 'Déplace les seuils vers les archives')}
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                {t('irreversa.archive.confirmPoint2', 'Conservation pendant {{days}} jours', { days: config.retentionDays })}
              </li>
              {config.exportBeforeArchive && (
                <li className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-muted-foreground" />
                  {t('irreversa.archive.confirmPoint3', 'Export PDF automatique')}
                </li>
              )}
              <li className="flex items-center gap-2 text-amber-600">
                <Trash2 className="h-4 w-4" />
                {t('irreversa.archive.confirmPoint4', 'Suppression automatique après rétention')}
              </li>
            </ul>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              {t('common.cancel', 'Annuler')}
            </Button>
            <Button 
              onClick={handleConfirmArchive}
              disabled={isArchiving}
            >
              {isArchiving ? (
                t('common.processing', 'Traitement...')
              ) : (
                t('irreversa.archive.confirmButton', 'Archiver')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
