import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Lock, 
  Clock, 
  User, 
  FileText, 
  AlertTriangle,
  CheckCircle2,
  Eye,
  Users,
  History,
  XCircle,
  Download,
  Loader2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  IrreversaThreshold, 
  IrreversaWitness, 
  IrreversaAuditEntry,
  useIrreversa 
} from '@/hooks/useIrreversa';
import { CriticalityScore } from './CriticalityScore';
import { generateIrreversaCertificate } from './IrreversaPdfExport';
import { TraceOSLink } from './TraceOSLink';
import { toast } from 'sonner';

interface ThresholdDetailDialogProps {
  threshold: IrreversaThreshold | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ThresholdDetailDialog({ threshold, isOpen, onClose }: ThresholdDetailDialogProps) {
  const { t } = useTranslation();
  const { getWitnesses, getAuditLog } = useIrreversa();
  const [witnesses, setWitnesses] = useState<IrreversaWitness[]>([]);
  const [auditLog, setAuditLog] = useState<IrreversaAuditEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (isOpen && threshold) {
      setLoading(true);
      Promise.all([
        getWitnesses(threshold.id),
        getAuditLog(threshold.id)
      ]).then(([w, a]) => {
        setWitnesses(w);
        setAuditLog(a);
        setLoading(false);
      });
    }
  }, [isOpen, threshold]);

  if (!threshold) return null;

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      await generateIrreversaCertificate(threshold, witnesses, auditLog);
      toast.success(t('irreversa.export.success', 'Certificat PDF généré avec succès'));
    } catch (err) {
      toast.error(t('irreversa.export.error', 'Erreur lors de la génération du PDF'));
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'detected': return <Eye className="w-4 h-4 text-amber-500" />;
      case 'marked': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'validated': return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
      case 'sealed': return <Lock className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {threshold.status === 'sealed' ? (
                <div className="p-2 rounded-full bg-destructive/10">
                  <Lock className="w-5 h-5 text-destructive" />
                </div>
              ) : (
                getStatusIcon(threshold.status)
              )}
              <Badge variant="outline" className="text-xs">
                {t(`irreversa.status.${threshold.status}`)}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {t(`irreversa.domain.${threshold.domain}`)}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <TraceOSLink threshold={threshold} />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExportPdf}
                disabled={isExporting}
              >
                {isExporting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span className="ml-1 hidden sm:inline">PDF</span>
              </Button>
            </div>
          </div>
          <DialogTitle className="text-xl pr-8">
            {threshold.title}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="mt-4">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="details">
              <FileText className="w-4 h-4 mr-1" />
              {t('irreversa.tabs.details')}
            </TabsTrigger>
            <TabsTrigger value="witnesses">
              <Users className="w-4 h-4 mr-1" />
              {t('irreversa.tabs.witnesses')} ({witnesses.length})
            </TabsTrigger>
            <TabsTrigger value="audit">
              <History className="w-4 h-4 mr-1" />
              {t('irreversa.tabs.audit')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            {/* Criticality Score */}
            <CriticalityScore threshold={{
              id: threshold.id,
              title: threshold.title,
              status: threshold.status,
              threshold_nature: threshold.threshold_nature,
              domain: threshold.domain,
              detection_date: threshold.detection_date,
              validated_by: threshold.validated_by,
              alternatives_before: threshold.alternatives_before,
              irreversibility_reason: threshold.irreversibility_reason,
            }} />

            {/* Context */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">
                {t('irreversa.fields.context')}
              </h4>
              <p className="text-sm p-3 rounded-lg bg-muted/50">{threshold.context}</p>
            </div>

            {/* Irreversibility reason */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">
                {t('irreversa.fields.irreversibilityReason')}
              </h4>
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
                <p className="text-sm text-red-800 dark:text-red-200">
                  {threshold.irreversibility_reason}
                </p>
              </div>
            </div>

            {/* Frozen alternatives */}
            {threshold.alternatives_before.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  {t('irreversa.fields.frozenAlternatives')}
                </h4>
                <div className="space-y-2">
                  {threshold.alternatives_before.map((alt, i) => (
                    <div 
                      key={i} 
                      className="flex items-center gap-2 p-2 rounded bg-muted/30 text-sm"
                    >
                      <XCircle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="line-through text-muted-foreground">{alt}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">{t('irreversa.fields.detectionDate')}</p>
                  <p className="font-medium">{new Date(threshold.detection_date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">{t('irreversa.fields.validator')}</p>
                  <p className="font-medium">{threshold.validated_by}</p>
                  <p className="text-xs text-muted-foreground">
                    {t(`irreversa.role.${threshold.validator_role}`)}
                  </p>
                </div>
              </div>
            </div>

            {/* Validation statement */}
            {threshold.validation_statement && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  {t('irreversa.fields.validationStatement')}
                </h4>
                <blockquote className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500 italic text-sm">
                  "{threshold.validation_statement}"
                </blockquote>
              </div>
            )}

            {/* Sealed notice */}
            {threshold.status === 'sealed' && threshold.sealed_at && (
              <div className="p-4 rounded-lg bg-red-100 dark:bg-red-950 border border-red-300 dark:border-red-800">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="w-5 h-5 text-red-600" />
                  <span className="font-bold text-red-700 dark:text-red-400">
                    {t('irreversa.sealed.title')}
                  </span>
                </div>
                <p className="text-sm text-red-700 dark:text-red-300">
                  {t('irreversa.sealed.description')}
                </p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                  {t('irreversa.sealed.timestamp')}: {new Date(threshold.sealed_at).toLocaleString()}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="witnesses" className="mt-4">
            {loading ? (
              <p className="text-center text-muted-foreground py-8">
                {t('common.loading')}...
              </p>
            ) : witnesses.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {t('irreversa.witnesses.empty')}
              </p>
            ) : (
              <div className="space-y-3">
                {witnesses.map(witness => (
                  <div 
                    key={witness.id}
                    className="p-3 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{witness.witness_name}</span>
                      <Badge variant="outline" className="text-xs">
                        {witness.witness_role}
                      </Badge>
                    </div>
                    {witness.witness_statement && (
                      <p className="text-sm text-muted-foreground italic pl-6">
                        "{witness.witness_statement}"
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground pl-6 mt-1">
                      {new Date(witness.witnessed_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="audit" className="mt-4">
            {loading ? (
              <p className="text-center text-muted-foreground py-8">
                {t('common.loading')}...
              </p>
            ) : auditLog.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {t('irreversa.audit.empty')}
              </p>
            ) : (
              <div className="space-y-2">
                {auditLog.map((entry, index) => (
                  <div 
                    key={entry.id}
                    className="flex items-start gap-3 relative"
                  >
                    {index < auditLog.length - 1 && (
                      <div className="absolute left-[11px] top-6 w-0.5 h-full bg-border" />
                    )}
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center z-10">
                      {entry.action === 'sealed' ? (
                        <Lock className="w-3 h-3 text-red-500" />
                      ) : entry.action === 'validated' ? (
                        <CheckCircle2 className="w-3 h-3 text-blue-500" />
                      ) : (
                        <Clock className="w-3 h-3 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {t(`irreversa.audit.action.${entry.action}`)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {entry.actor_name} ({entry.actor_role})
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(entry.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
