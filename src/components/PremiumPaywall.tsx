import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocalizedNavigate } from '@/hooks/useLocalizedNavigate';
import { useSubscription, SUBSCRIPTION_TIERS } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Sparkles, ArrowRight, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface PremiumPaywallProps {
  title: string;
  description: string;
  tier?: 'premium' | 'pro';
  /** Optional blurred preview content to show behind the paywall */
  children?: ReactNode;
  /** Custom class for the wrapper */
  className?: string;
}

export function PremiumPaywall({ 
  title, 
  description, 
  tier = 'premium',
  children,
  className 
}: PremiumPaywallProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { createCheckout, loading } = useSubscription();
  const navigate = useLocalizedNavigate();

  const tierConfig = SUBSCRIPTION_TIERS[tier];

  const handleSubscribe = async () => {
    if (!user) {
      toast.info(t('auth.loginRequired', 'Connectez-vous pour vous abonner'));
      navigate('/auth');
      return;
    }

    if (tier === 'pro') {
      // Pro is contact-only
      navigate('/b2b');
      return;
    }

    try {
      await createCheckout('premium');
    } catch (err) {
      toast.error(t('subscription.checkoutError', 'Erreur lors de la création du paiement'));
    }
  };

  return (
    <div className={cn("relative", className)}>
      {/* Blurred preview content */}
      {children && (
        <div className="relative">
          <div className="blur-sm opacity-50 pointer-events-none select-none" aria-hidden="true">
            {children}
          </div>
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        </div>
      )}

      {/* Paywall card */}
      <Card className={cn(
        "border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-transparent",
        children && "absolute inset-x-4 bottom-8 sm:inset-x-8 md:relative md:inset-auto md:mt-4"
      )}>
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-primary/10">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="flex items-center justify-center gap-2">
            <Lock className="w-5 h-5 text-muted-foreground" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground max-w-md mx-auto">
            {description}
          </p>

          {/* Features list */}
          <div className="bg-background/50 rounded-lg p-4 max-w-sm mx-auto">
            <p className="text-sm font-medium mb-2">
              {t('subscription.includedWith', 'Inclus avec')} {tierConfig.name}:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 text-left">
              {tierConfig.features.slice(0, 4).map((feature, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Price */}
          {tierConfig.price !== null ? (
            <div className="py-2">
              <span className="text-3xl font-bold">{tierConfig.price.toFixed(2).replace('.', ',')}€</span>
              <span className="text-muted-foreground"> / {t('pricing.month', 'mois')}</span>
            </div>
          ) : (
            <div className="py-2">
              <span className="text-xl font-semibold text-muted-foreground">
                {t('pricing.contactUs', 'Sur devis')}
              </span>
            </div>
          )}

          {/* CTA */}
          <Button
            size="lg"
            onClick={handleSubscribe}
            disabled={loading}
            className="gap-2"
          >
            <Sparkles className="w-5 h-5" />
            {tier === 'pro' 
              ? t('pricing.contactUs', 'Nous contacter')
              : t('subscription.unlockAccess', 'Débloquer l\'accès')
            }
            <ArrowRight className="w-4 h-4" />
          </Button>

          {/* Teaser text */}
          <p className="text-xs text-muted-foreground">
            {t('subscription.cancelAnytime', 'Sans engagement • Annulable à tout moment')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
