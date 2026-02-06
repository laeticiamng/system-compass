/**
 * DeleteAccountSection - RGPD Art. 17 compliant account deletion
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Trash2, Loader2 } from 'lucide-react';
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
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function DeleteAccountSection() {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);

  const confirmWord = 'SUPPRIMER';
  const canDelete = confirmText === confirmWord;

  const handleDeleteAccount = async () => {
    if (!user || !canDelete) return;

    setIsDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke('delete-account');

      if (error) {
        throw new Error(error.message);
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Deletion failed');
      }

      toast({
        title: t('account.deleted', 'Compte supprimé'),
        description: t('account.deletedDescription', 'Votre compte et toutes vos données ont été supprimés.'),
      });

      // Sign out and redirect
      await signOut();
      window.location.href = '/';
    } catch (err) {
      console.error('Account deletion failed:', err);
      toast({
        title: t('common.error', 'Erreur'),
        description: t('account.deleteError', 'Impossible de supprimer le compte. Veuillez réessayer.'),
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) return null;

  return (
    <Card className="border-destructive/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <Trash2 className="h-5 w-5" />
          {t('account.deleteTitle', 'Supprimer mon compte')}
        </CardTitle>
        <CardDescription>
          {t('account.deleteWarning', 'Cette action est irréversible. Toutes vos données seront définitivement supprimées conformément au RGPD (Article 17).')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="gap-2">
              <Trash2 className="h-4 w-4" />
              {t('account.deleteButton', 'Supprimer mon compte et mes données')}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                {t('account.confirmTitle', 'Confirmer la suppression')}
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-3">
                <p>{t('account.confirmDescription', 'Vous êtes sur le point de supprimer définitivement votre compte. Cette action va :')}</p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>{t('account.confirmItem1', 'Supprimer votre profil et préférences')}</li>
                  <li>{t('account.confirmItem2', 'Supprimer votre historique et progression')}</li>
                  <li>{t('account.confirmItem3', 'Supprimer vos Exit Keys et comparaisons')}</li>
                  <li>{t('account.confirmItem4', 'Révoquer votre accès Premium le cas échéant')}</li>
                </ul>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-2 py-2">
              <Label htmlFor="delete-confirm">
                {t('account.typeToConfirm', 'Tapez "{{word}}" pour confirmer', { word: confirmWord })}
              </Label>
              <Input
                id="delete-confirm"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={confirmWord}
                className={canDelete ? 'border-destructive focus:ring-destructive' : ''}
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting} onClick={() => setConfirmText('')}>
                {t('common.cancel', 'Annuler')}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAccount}
                disabled={!canDelete || isDeleting}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t('common.processing', 'Traitement...')}
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t('account.confirmDelete', 'Supprimer définitivement')}
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
