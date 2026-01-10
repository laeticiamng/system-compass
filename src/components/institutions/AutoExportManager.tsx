import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Archive, 
  Download, 
  Trash2, 
  Clock, 
  Calendar,
  RefreshCw,
  FileJson,
  HardDrive
} from 'lucide-react';
import { useTraceOSExportSchedule } from '@/hooks/useTraceOSExportSchedule';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const frequencyLabels: Record<string, string> = {
  daily: 'Quotidien',
  weekly: 'Hebdomadaire',
  monthly: 'Mensuel',
};

export function AutoExportManager() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const {
    schedule,
    exports,
    loading,
    exporting,
    createOrUpdateSchedule,
    toggleSchedule,
    triggerManualExport,
    downloadExport,
    deleteExport,
    refreshExports,
  } = useTraceOSExportSchedule();

  const [selectedFrequency, setSelectedFrequency] = useState<string>(
    schedule?.frequency || 'weekly'
  );

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <p>{t('traceOS.export.loginRequired', 'Connectez-vous pour gérer les exports')}</p>
        </CardContent>
      </Card>
    );
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Schedule Configuration */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4" />
            {t('traceOS.autoExport.schedule', 'Planification d\'export')}
          </CardTitle>
          <CardDescription>
            {t('traceOS.autoExport.scheduleDesc', 'Archivez automatiquement vos décisions')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>{t('traceOS.autoExport.autoExport', 'Export automatique')}</Label>
              <p className="text-xs text-muted-foreground">
                {schedule?.is_active 
                  ? `${t('traceOS.autoExport.nextExport', 'Prochain export')}: ${schedule.next_export_at ? format(new Date(schedule.next_export_at), 'PPP', { locale: fr }) : t('traceOS.autoExport.notScheduled', 'Non planifié')}`
                  : t('traceOS.autoExport.disabled', 'Désactivé')}
              </p>
            </div>
            <Switch
              checked={schedule?.is_active || false}
              onCheckedChange={() => {
                if (schedule) {
                  toggleSchedule();
                } else {
                  createOrUpdateSchedule(selectedFrequency as any);
                }
              }}
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1 space-y-2">
              <Label>{t('traceOS.autoExport.frequency', 'Fréquence')}</Label>
              <Select
                value={selectedFrequency}
                onValueChange={(value) => {
                  setSelectedFrequency(value);
                  if (schedule?.is_active) {
                    createOrUpdateSchedule(value as any);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">{t('traceOS.autoExport.daily', 'Quotidien')}</SelectItem>
                  <SelectItem value="weekly">{t('traceOS.autoExport.weekly', 'Hebdomadaire')}</SelectItem>
                  <SelectItem value="monthly">{t('traceOS.autoExport.monthly', 'Mensuel')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-6">
              <Button
                onClick={triggerManualExport}
                disabled={exporting}
                variant="outline"
                className="gap-2"
              >
                {exporting ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Archive className="h-4 w-4" />
                )}
                {t('traceOS.autoExport.exportNow', 'Exporter maintenant')}
              </Button>
            </div>
          </div>

          {schedule?.last_export_at && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {t('traceOS.autoExport.lastExport', 'Dernier export')}: {format(new Date(schedule.last_export_at), 'PPpp', { locale: fr })}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Export History */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <HardDrive className="h-4 w-4" />
              {t('traceOS.autoExport.history', 'Archives disponibles')}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={refreshExports}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : exports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Archive className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="text-sm">{t('traceOS.autoExport.noExports', 'Aucun export disponible')}</p>
              <p className="text-xs mt-1">{t('traceOS.autoExport.noExportsHint', 'Cliquez sur "Exporter maintenant" pour créer votre premier export')}</p>
            </div>
          ) : (
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {exports.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileJson className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium truncate max-w-[200px]">
                          {file.name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {file.created_at && (
                            <span>{format(new Date(file.created_at), 'Pp', { locale: fr })}</span>
                          )}
                          {file.size > 0 && (
                            <>
                              <span>•</span>
                              <span>{formatFileSize(file.size)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => downloadExport(file.name)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteExport(file.name)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Storage Info */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <HardDrive className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium">{t('traceOS.autoExport.secureStorage', 'Stockage sécurisé')}</p>
              <p className="text-xs mt-1">
                {t('traceOS.autoExport.secureStorageDesc', 'Vos exports sont stockés de manière sécurisée et ne sont accessibles qu\'à vous.')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
