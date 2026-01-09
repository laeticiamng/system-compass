import { useTranslation } from "react-i18next";
import { Check, Sparkles, Crown, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSubscription, SUBSCRIPTION_TIERS } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const Pricing = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tier, createCheckout, loading } = useSubscription();

  const handleSubscribe = async (planTier: 'premium' | 'pro') => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    try {
      await createCheckout(planTier);
    } catch (error) {
      console.error('Checkout failed:', error);
    }
  };

  const plans = [
    {
      id: 'free' as const,
      name: t('pricing.freeName', 'Gratuit'),
      price: '0€',
      period: t('pricing.forever', 'pour toujours'),
      description: t('pricing.freeDescription', 'Accès aux fonctionnalités de base'),
      icon: Zap,
      features: SUBSCRIPTION_TIERS.free.features,
      buttonText: t('pricing.currentPlan', 'Plan actuel'),
      highlighted: false,
    },
    {
      id: 'premium' as const,
      name: t('pricing.premiumName', 'Premium'),
      price: '7,99€',
      period: t('pricing.perMonth', '/ mois'),
      description: t('pricing.premiumDescription', 'Accès aux variantes pays spécifiques'),
      icon: Sparkles,
      features: SUBSCRIPTION_TIERS.premium.features,
      buttonText: t('pricing.subscribe', "S'abonner"),
      highlighted: true,
    },
    {
      id: 'pro' as const,
      name: t('pricing.proName', 'Pro'),
      price: '19,99€',
      period: t('pricing.perMonth', '/ mois'),
      description: t('pricing.proDescription', 'Analyse projet personnalisée'),
      icon: Crown,
      features: SUBSCRIPTION_TIERS.pro.features,
      buttonText: t('pricing.subscribe', "S'abonner"),
      highlighted: false,
    },
  ];

  const isCurrentPlan = (planId: string) => tier === planId;
  const canUpgrade = (planId: string) => {
    if (tier === 'pro') return false;
    if (tier === 'premium' && planId === 'free') return false;
    if (tier === 'premium' && planId === 'premium') return false;
    return planId !== 'free';
  };

  return (
    <div className="container mx-auto px-4 py-24">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          {t('pricing.title', 'Choisissez votre plan')}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t('pricing.subtitle', 'Débloquez des analyses plus profondes et des recommandations personnalisées')}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isCurrent = isCurrentPlan(plan.id);
          const showUpgrade = canUpgrade(plan.id);

          return (
            <Card
              key={plan.id}
              className={cn(
                "relative flex flex-col",
                plan.highlighted && "border-primary shadow-lg scale-105",
                isCurrent && "ring-2 ring-primary"
              )}
            >
              {plan.highlighted && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                  {t('pricing.popular', 'Populaire')}
                </Badge>
              )}
              {isCurrent && (
                <Badge className="absolute -top-3 right-4 bg-green-500">
                  {t('subscription.yourPlan', 'Votre plan')}
                </Badge>
              )}

              <CardHeader className="text-center pb-2">
                <div className={cn(
                  "mx-auto p-3 rounded-full mb-4",
                  plan.id === 'free' && "bg-muted",
                  plan.id === 'premium' && "bg-amber-500/10",
                  plan.id === 'pro' && "bg-purple-500/10"
                )}>
                  <Icon className={cn(
                    "w-6 h-6",
                    plan.id === 'free' && "text-muted-foreground",
                    plan.id === 'premium' && "text-amber-500",
                    plan.id === 'pro' && "text-purple-500"
                  )} />
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="flex-1">
                <div className="text-center mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground ml-1">{plan.period}</span>
                </div>

                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                {isCurrent ? (
                  <Button variant="outline" className="w-full" disabled>
                    {t('pricing.currentPlan', 'Plan actuel')}
                  </Button>
                ) : showUpgrade ? (
                  <Button
                    className="w-full"
                    variant={plan.highlighted ? "default" : "outline"}
                    onClick={() => handleSubscribe(plan.id as 'premium' | 'pro')}
                    disabled={loading}
                  >
                    {plan.buttonText}
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full" disabled>
                    {plan.id === 'free' ? t('pricing.includedInYourPlan', 'Inclus') : t('pricing.currentPlan', 'Plan actuel')}
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <div className="mt-12 text-center text-sm text-muted-foreground">
        <p>{t('pricing.guarantee', 'Annulation possible à tout moment. Pas d\'engagement.')}</p>
      </div>
    </div>
  );
};

export default Pricing;
