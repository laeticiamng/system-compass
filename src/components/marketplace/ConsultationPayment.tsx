/**
 * ConsultationPayment - Stripe-integrated payment component for expert consultations
 * Handles payment intent creation and confirmation
 */

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CreditCard, 
  Shield, 
  Lock, 
  CheckCircle, 
  Loader2,
  AlertCircle,
  Euro
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ConsultationPaymentProps {
  expertId: string;
  expertName: string;
  consultationType: 'video' | 'phone' | 'chat';
  durationMinutes: number;
  price: number;
  currency: string;
  scheduledAt: Date;
  subject: string;
  onSuccess?: (paymentId: string) => void;
  onCancel?: () => void;
}

interface PaymentSummaryItem {
  label: string;
  value: string;
  highlight?: boolean;
}

export function ConsultationPayment({
  expertId,
  expertName,
  consultationType,
  durationMinutes,
  price,
  currency,
  scheduledAt,
  subject,
  onSuccess,
  onCancel,
}: ConsultationPaymentProps) {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Platform fee calculation (15%)
  const platformFee = Math.round(price * 0.15);
  const totalAmount = price;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const summaryItems: PaymentSummaryItem[] = [
    { label: 'Consultation avec', value: expertName },
    { label: 'Type', value: consultationType === 'video' ? 'Vidéoconférence' : consultationType === 'phone' ? 'Téléphone' : 'Messagerie' },
    { label: 'Durée', value: `${durationMinutes} minutes` },
    { label: 'Date', value: scheduledAt.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) },
    { label: 'Horaire', value: scheduledAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) },
    { label: 'Sujet', value: subject },
  ];

  const handlePayment = useCallback(async () => {
    if (!user) {
      toast.error('Veuillez vous connecter pour continuer');
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('processing');
    setErrorMessage(null);

    try {
      // For mock experts, simulate payment success
      if (expertId.startsWith('mock-')) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        setPaymentStatus('success');
        toast.success('Paiement effectué avec succès !', {
          description: 'Vous recevrez un email de confirmation.',
        });
        onSuccess?.(`mock-payment-${Date.now()}`);
        return;
      }

      // Call edge function to create payment intent
      const { data, error } = await supabase.functions.invoke('create-consultation-payment', {
        body: {
          expertId,
          expertName,
          consultationType,
          durationMinutes,
          amount: totalAmount,
          currency,
          scheduledAt: scheduledAt.toISOString(),
          subject,
        },
      });

      if (error) {
        throw new Error(error.message || 'Erreur lors de la création du paiement');
      }

      if (data?.paymentUrl) {
        // Redirect to Stripe Checkout
        window.location.href = data.paymentUrl;
      } else if (data?.clientSecret) {
        // Handle embedded payment (if implemented)
        toast.info('Redirection vers le paiement...');
        // For now, show success for demo
        setPaymentStatus('success');
        onSuccess?.(data.paymentIntentId || `payment-${Date.now()}`);
      } else {
        throw new Error('Réponse de paiement invalide');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setPaymentStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Erreur de paiement');
      toast.error('Erreur lors du paiement', {
        description: err instanceof Error ? err.message : 'Veuillez réessayer',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [user, expertId, expertName, consultationType, durationMinutes, totalAmount, currency, scheduledAt, subject, onSuccess]);

  if (paymentStatus === 'success') {
    return (
      <Card className="glass-card border-emerald-500/30">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
          <h3 className="text-xl font-bold mb-2">Paiement confirmé !</h3>
          <p className="text-muted-foreground mb-4">
            Votre consultation avec {expertName} est confirmée.
          </p>
          <div className="p-4 rounded-lg bg-muted text-sm">
            <p><strong>Date:</strong> {scheduledAt.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            <p><strong>Horaire:</strong> {scheduledAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
            <p className="mt-2 text-muted-foreground">
              Un email de confirmation avec les détails de connexion vous a été envoyé.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Paiement sécurisé
          </span>
          <Badge variant="secondary" className="gap-1">
            <Lock className="w-3 h-3" />
            SSL
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        <div className="space-y-3">
          {summaryItems.map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{item.label}</span>
              <span className={cn(item.highlight && "font-semibold")}>{item.value}</span>
            </div>
          ))}
        </div>

        <Separator />

        {/* Pricing breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Consultation ({durationMinutes} min)</span>
            <span>{formatCurrency(price)}</span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Frais de plateforme (15%)</span>
            <span>{formatCurrency(platformFee)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span className="text-primary">{formatCurrency(totalAmount)}</span>
          </div>
        </div>

        {/* Security badges */}
        <div className="flex items-center justify-center gap-4 py-2 border rounded-lg bg-muted/50">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Shield className="w-4 h-4 text-emerald-500" />
            Paiement sécurisé
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Euro className="w-4 h-4" />
            Stripe
          </div>
        </div>

        {/* Error message */}
        {paymentStatus === 'error' && errorMessage && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
            <span className="text-sm text-destructive">{errorMessage}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={onCancel} disabled={isProcessing} className="flex-1">
            Annuler
          </Button>
          <Button 
            onClick={handlePayment} 
            disabled={isProcessing || !user} 
            className="flex-1 gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Traitement...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Payer {formatCurrency(totalAmount)}
              </>
            )}
          </Button>
        </div>

        {/* Login prompt */}
        {!user && (
          <p className="text-xs text-center text-muted-foreground">
            Veuillez vous connecter pour effectuer le paiement
          </p>
        )}

        {/* Terms */}
        <p className="text-xs text-center text-muted-foreground">
          En procédant au paiement, vous acceptez nos{' '}
          <a href="/disclaimer" className="underline hover:text-foreground">conditions générales</a>
          {' '}et notre{' '}
          <a href="/disclaimer" className="underline hover:text-foreground">politique d'annulation</a>.
        </p>
      </CardContent>
    </Card>
  );
}
