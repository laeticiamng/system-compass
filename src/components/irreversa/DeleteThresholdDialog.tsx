import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { IrreversaThreshold } from '@/hooks/useIrreversa';

interface DeleteThresholdDialogProps {
  threshold: IrreversaThreshold;
  onDelete: (id: string) => Promise<boolean>;
  disabled?: boolean;
}

export function DeleteThresholdDialog({ 
  threshold, 
  onDelete, 
  disabled 
}: DeleteThresholdDialogProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Can only delete non-sealed thresholds
  const canDelete = threshold.status !== 'sealed';
  const confirmRequired = 'SUPPRIMER';
  const isConfirmed = confirmText === confirmRequired;

  const handleDelete = async () => {
    if (!isConfirmed || !canDelete) return;
    
    setIsDeleting(true);
    const success = await onDelete(threshold.id);
    setIsDeleting(false);
    
    if (success) {
      setOpen(false);
      setConfirmText('');
    }
  };

  if (!canDelete) {
    return (
      <Button variant="ghost" size="sm" disabled className="gap-2 text-muted-foreground">
        <Trash2 className="w-4 h-4" />
        {t('irreversa.delete.sealed', 'Impossible (scellé)')}
      </Button>
    );
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
          disabled={disabled}
        >
          <Trash2 className="w-4 h-4" />
          {t('common.delete', 'Supprimer')}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            {t('irreversa.delete.title', 'Supprimer ce seuil ?')}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>
                {t('irreversa.delete.warning', 'Cette action est irréversible. Le seuil suivant sera définitivement supprimé :')}
              </p>
              
              <div className="p-3 rounded-lg bg-muted/50 border">
                <p className="font-semibold">{threshold.title}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {t(`irreversa.status.${threshold.status}`)} • {t(`irreversa.domain.${threshold.domain}`)}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-delete">
                  {t('irreversa.delete.confirm', 'Tapez "SUPPRIMER" pour confirmer :')}
                </Label>
                <Input
                  id="confirm-delete"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                  placeholder={confirmRequired}
                  className="font-mono"
                />
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setConfirmText('')}>
            {t('common.cancel', 'Annuler')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={!isConfirmed || isDeleting}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {t('common.delete', 'Supprimer')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
