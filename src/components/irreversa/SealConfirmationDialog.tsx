import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Lock, AlertTriangle, Shield, CheckCircle2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { SignaturePad } from './SignaturePad';
import { IrreversaThreshold } from '@/hooks/useIrreversa';

interface SealConfirmationDialogProps {
  threshold: IrreversaThreshold | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (signatureData?: string) => void;
  isLoading?: boolean;
}

export function SealConfirmationDialog({
  threshold,
  isOpen,
  onClose,
  onConfirm,
  isLoading
}: SealConfirmationDialogProps) {
  const { t } = useTranslation();
  const [confirmText, setConfirmText] = useState('');
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [checklist, setChecklist] = useState({
    understood: false,
    reviewed: false,
    noReturn: false,
  });

  const expectedText = 'SCELLER';
  const isConfirmTextValid = confirmText.toUpperCase() === expectedText;
  const isChecklistComplete = checklist.understood && checklist.reviewed && checklist.noReturn;
  const hasSignature = !!signatureData;
  const canConfirm = isConfirmTextValid && isChecklistComplete && hasSignature && !isLoading;

  const handleClose = () => {
    setConfirmText('');
    setSignatureData(null);
    setChecklist({ understood: false, reviewed: false, noReturn: false });
    onClose();
  };

  const handleConfirm = () => {
    if (canConfirm) {
      onConfirm(signatureData || undefined);
    }
  };

  if (!threshold) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <Lock className="w-5 h-5" />
            {t('irreversa.seal.confirm.title', 'Sceller définitivement ce seuil ?')}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              {/* Warning box */}
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-destructive mb-1">
                      {t('irreversa.seal.confirm.warning', 'Action irréversible')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t('irreversa.seal.confirm.warningText', 'Une fois scellé, ce seuil ne pourra plus être modifié, annulé ou supprimé. Cette action est définitive.')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Threshold summary */}
              <div className="p-3 rounded-lg bg-muted/50 border">
                <p className="font-medium text-sm mb-1">{threshold.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {threshold.context}
                </p>
              </div>

              {/* Checklist */}
              <div className="space-y-3">
                <p className="font-medium text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  {t('irreversa.seal.confirm.checklist', 'Confirmations requises')}
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="understood"
                      checked={checklist.understood}
                      onCheckedChange={(checked) => 
                        setChecklist(prev => ({ ...prev, understood: !!checked }))
                      }
                    />
                    <label htmlFor="understood" className="text-sm cursor-pointer">
                      {t('irreversa.seal.confirm.check1', 'Je comprends que cette action est irréversible')}
                    </label>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="reviewed"
                      checked={checklist.reviewed}
                      onCheckedChange={(checked) => 
                        setChecklist(prev => ({ ...prev, reviewed: !!checked }))
                      }
                    />
                    <label htmlFor="reviewed" className="text-sm cursor-pointer">
                      {t('irreversa.seal.confirm.check2', 'J\'ai vérifié toutes les informations du seuil')}
                    </label>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="noReturn"
                      checked={checklist.noReturn}
                      onCheckedChange={(checked) => 
                        setChecklist(prev => ({ ...prev, noReturn: !!checked }))
                      }
                    />
                    <label htmlFor="noReturn" className="text-sm cursor-pointer">
                      {t('irreversa.seal.confirm.check3', 'J\'accepte qu\'aucun retour en arrière n\'est possible')}
                    </label>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Electronic Signature */}
              <SignaturePad 
                onSignatureChange={setSignatureData}
                disabled={isLoading}
              />

              <Separator />

              {/* Confirmation input */}
              <div className="space-y-2">
                <Label htmlFor="confirm-text" className="text-sm">
                  {t('irreversa.seal.confirm.typeText', 'Tapez "SCELLER" pour confirmer')}
                </Label>
                <Input
                  id="confirm-text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="SCELLER"
                  className={confirmText && !isConfirmTextValid ? 'border-destructive' : ''}
                />
              </div>

              {/* Validation status */}
              <div className="flex flex-wrap gap-2 text-xs">
                <span className={`px-2 py-1 rounded ${isChecklistComplete ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  ✓ Checklist
                </span>
                <span className={`px-2 py-1 rounded ${hasSignature ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  ✓ Signature
                </span>
                <span className={`px-2 py-1 rounded ${isConfirmTextValid ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  ✓ Confirmation
                </span>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleClose} disabled={isLoading}>
            {t('common.cancel', 'Annuler')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="bg-destructive hover:bg-destructive/90"
          >
            {canConfirm && <CheckCircle2 className="w-4 h-4 mr-2" />}
            <Lock className="w-4 h-4 mr-2" />
            {t('irreversa.actions.sealDefinitively', 'Sceller définitivement')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
