/**
 * Password Reset Dialog
 * Allows users to reset their password via email
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Mail, CheckCircle, KeyRound } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.string().email();

interface PasswordResetDialogProps {
  trigger?: React.ReactNode;
}

export function PasswordResetDialog({ trigger }: PasswordResetDialogProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate email
    try {
      emailSchema.parse(email);
    } catch {
      setError(t('auth.errors.invalidEmail', 'Adresse email invalide'));
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      });
      
      if (error) {
        // Don't reveal if email exists or not for security
        console.error('Password reset error:', error);
      }
      
      // Always show success message for security (don't reveal if email exists)
      setIsSent(true);
      toast.success(t('auth.passwordReset.sent', 'Email de réinitialisation envoyé'));
    } catch (err) {
      setError(t('auth.errors.generic', 'Une erreur est survenue'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    // Reset state after close animation
    setTimeout(() => {
      setEmail('');
      setIsSent(false);
      setError(null);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <button
            type="button"
            className="text-sm text-primary hover:underline"
          >
            {t('auth.forgotPassword', 'Mot de passe oublié ?')}
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-primary" />
            {t('auth.passwordReset.title', 'Réinitialiser le mot de passe')}
          </DialogTitle>
          <DialogDescription>
            {t('auth.passwordReset.description', 'Entrez votre email pour recevoir un lien de réinitialisation.')}
          </DialogDescription>
        </DialogHeader>

        {isSent ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <div>
              <h3 className="font-medium text-lg">
                {t('auth.passwordReset.checkEmail', 'Vérifiez votre email')}
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                {t('auth.passwordReset.sentTo', 'Si un compte existe avec cette adresse, vous recevrez un email de réinitialisation.')}
              </p>
            </div>
            <Button onClick={handleClose} variant="outline" className="mt-4">
              {t('common.close', 'Fermer')}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">
                {t('auth.email', 'Email')}
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1"
              >
                {t('common.cancel', 'Annuler')}
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !email}
                className="flex-1"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  t('auth.passwordReset.send', 'Envoyer')
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
