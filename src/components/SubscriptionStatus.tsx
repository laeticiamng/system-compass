import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Crown, Sparkles, CreditCard, Settings, AlertTriangle, RefreshCcw } from 'lucide-react';
import { useSubscription, SUBSCRIPTION_TIERS } from '@/hooks/useSubscription';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface SubscriptionStatusProps {
  isLoggedIn: boolean;
}

const formatDisplayDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
};

export function SubscriptionStatus({ isLoggedIn }: SubscriptionStatusProps) {
  const { t } = useTranslation();
  const {
    tier,
    subscribed,
    subscriptionEnd,
    loading,
    error,
    openCustomerPortal,
    checkSubscription,
  } = useSubscription();

  const tierConfig = SUBSCRIPTION_TIERS[tier];

  const expirationLabel = useMemo(() => {
    if (!subscribed) {
      return t('dashboard.subscriptionNone', 'Aucun abonnement actif');
    }

    if (!subscriptionEnd) {
      return t('dashboard.subscriptionAutoRenew', 'Renouvellement automatique');
    }

    return t('dashboard.subscriptionExpires', 'Expire le {{date}}', {
      date: formatDisplayDate(subscriptionEnd),
    });
  }, [subscribed, subscriptionEnd, t]);

  if (!isLoggedIn) {
    return null;
  }

  return (
    <Card className="mb-6 border-purple-500/20">
      <CardContent className="p-6 space-y-4">
        {error && (
          <Alert variant="destructive" className="flex flex-col gap-2">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>
              {t('dashboard.subscriptionErrorTitle', 'Impossible de vérifier votre abonnement')}
            </AlertTitle>
            <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span>
                {t('dashboard.subscriptionErrorBody', "Nous n'avons pas réussi à récupérer votre statut. Essayez à nouveau.")}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => checkSubscription()}
                disabled={loading}
                className="gap-2"
              >
                <RefreshCcw className="h-4 w-4" />
                {t('dashboard.subscriptionRetry', 'Réessayer')}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div
            className={`p-3 rounded-full ${tier === 'pro' ? 'bg-purple-500/10' : tier === 'premium' ? 'bg-amber-500/10' : 'bg-muted'}`}
          >
            {tier === 'pro' ? (
              <Crown className="w-6 h-6 text-purple-500" />
            ) : tier === 'premium' ? (
              <Sparkles className="w-6 h-6 text-amber-500" />
            ) : (
              <CreditCard className="w-6 h-6 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">
              {t('dashboard.subscriptionTitle', 'Mon abonnement')}: {tierConfig.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {subscribed
                ? t('dashboard.subscriptionActive', 'Votre abonnement est actif')
                : t('dashboard.subscriptionFree', 'Passez à Premium pour débloquer plus de fonctionnalités')}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {loading
                ? t('dashboard.subscriptionLoading', 'Mise à jour en cours...')
                : expirationLabel}
            </p>
          </div>
          <div className="flex gap-2">
            {subscribed ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => openCustomerPortal()}
                disabled={loading}
              >
                <Settings className="w-4 h-4 mr-2" />
                {t('dashboard.manageSubscription', 'Gérer mon abonnement')}
              </Button>
            ) : (
              <Link to="/pricing">
                <Button size="sm">
                  <Sparkles className="w-4 h-4 mr-2" />
                  {t('dashboard.upgradePlan', 'Passer à Premium')}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
