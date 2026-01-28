/**
 * Confirmation Dialog - Reusable confirmation dialog for destructive actions
 */
import { ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
} from './alert-dialog';
import { Input } from './input';
import { Label } from './label';
import { cn } from '@/lib/utils';
import { AlertTriangle, Trash2, Loader2 } from 'lucide-react';

interface ConfirmationDialogProps {
  trigger: ReactNode;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'destructive';
  onConfirm: () => void | Promise<void>;
  requireTypedConfirmation?: string;
  children?: ReactNode;
}

export function ConfirmationDialog({
  trigger,
  title,
  description,
  confirmLabel,
  cancelLabel,
  variant = 'default',
  onConfirm,
  requireTypedConfirmation,
  children,
}: ConfirmationDialogProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [typedValue, setTypedValue] = useState('');

  const canConfirm = requireTypedConfirmation
    ? typedValue.toLowerCase() === requireTypedConfirmation.toLowerCase()
    : true;

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      setOpen(false);
      setTypedValue('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {variant === 'destructive' && (
              <AlertTriangle className="w-5 h-5 text-destructive" />
            )}
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        {children}

        {requireTypedConfirmation && (
          <div className="space-y-2 py-2">
            <Label htmlFor="confirm-input">
              {t('common.typeToConfirm', 'Tapez "{{text}}" pour confirmer', {
                text: requireTypedConfirmation,
              })}
            </Label>
            <Input
              id="confirm-input"
              value={typedValue}
              onChange={(e) => setTypedValue(e.target.value)}
              placeholder={requireTypedConfirmation}
              className={cn(
                canConfirm && typedValue && 'border-green-500 focus:ring-green-500'
              )}
            />
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {cancelLabel || t('common.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!canConfirm || isLoading}
            className={cn(
              variant === 'destructive' &&
                'bg-destructive hover:bg-destructive/90 text-destructive-foreground'
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('common.processing')}
              </>
            ) : (
              <>
                {variant === 'destructive' && <Trash2 className="w-4 h-4 mr-2" />}
                {confirmLabel || t('common.confirm')}
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * Delete Confirmation Dialog - Specialized for delete actions
 */
export function DeleteConfirmationDialog({
  trigger,
  itemName,
  itemType,
  onDelete,
  requireTypedConfirmation = false,
}: {
  trigger: ReactNode;
  itemName: string;
  itemType: string;
  onDelete: () => void | Promise<void>;
  requireTypedConfirmation?: boolean;
}) {
  const { t } = useTranslation();

  return (
    <ConfirmationDialog
      trigger={trigger}
      title={t('common.deleteTitle', 'Supprimer {{type}}', { type: itemType })}
      description={t(
        'common.deleteDescription',
        'Êtes-vous sûr de vouloir supprimer "{{name}}" ? Cette action est irréversible.',
        { name: itemName }
      )}
      confirmLabel={t('common.delete')}
      variant="destructive"
      onConfirm={onDelete}
      requireTypedConfirmation={requireTypedConfirmation ? itemName : undefined}
    />
  );
}
