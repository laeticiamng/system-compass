import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useSubscription, SUBSCRIPTION_TIERS } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Crown, Sparkles, ArrowRight, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface PremiumPaywallProps {
  title: string;
  description: string;
  tier: 'premium' | 'pro';
}

export function PremiumPaywall({ title, description, tier }: PremiumPaywallProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { createCheckout, loading } = useSubscription();
  const navigate = useNavigate();

  const tierConfig = SUBSCRIPTION_TIERS[tier];
  const isProTier = tier === 'pro';

  const handleSubscribe = async () => {
    if (!user) {
      toast.info(t('auth.loginRequired', 'Connectez-vous pour vous abonner'));
      navigate('/auth');
      return;
    }

    try {
      await createCheckout(tier);
    } catch (err) {
      toast.error(t('subscription.checkoutError', 'Erreur lors de la création du paiement'));
    }
  };

  return (
    <Card className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="text-center pb-2">
        <div className="flex justify-center mb-4">
          <div className="p-4 rounded-full bg-primary/10">
            {isProTier ? (
              <Crown className="w-8 h-8 text-primary" />
            ) : (
              <Sparkles className="w-8 h-8 text-primary" />
            )}
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
        <div className="py-2">
          <span className="text-3xl font-bold">{tierConfig.price}€</span>
          <span className="text-muted-foreground">/mois</span>
        </div>

        {/* CTA */}
        <Button
          size="lg"
          onClick={handleSubscribe}
          disabled={loading}
          className="gap-2"
        >
          {isProTier ? <Crown className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
          {t('subscription.unlockAccess', 'Débloquer l\'accès')}
          <ArrowRight className="w-4 h-4" />
        </Button>

        {/* Teaser text */}
        <p className="text-xs text-muted-foreground">
          {t('subscription.cancelAnytime', 'Sans engagement • Annulable à tout moment')}
        </p>
      </CardContent>
    </Card>
  );
}
