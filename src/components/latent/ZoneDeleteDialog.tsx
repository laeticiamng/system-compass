import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { LatentZone } from '@/hooks/useLatentZones';

interface ZoneDeleteDialogProps {
  zone: LatentZone;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (zoneId: string) => Promise<boolean>;
}

export function ZoneDeleteDialog({ zone, isOpen, onClose, onConfirm }: ZoneDeleteDialogProps) {
  const { t } = useTranslation();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    const success = await onConfirm(zone.id);
    setIsDeleting(false);
    
    if (success) {
      onClose();
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            {t('latent.delete.title')}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>{t('latent.delete.description')}</p>
            <p className="font-medium text-foreground">
              "{zone.title}"
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            {t('latent.delete.confirm')}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
