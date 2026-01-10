import { useTranslation } from "react-i18next";
import { Check, Sparkles, Crown, Zap, X, Building2, Users, Shield, HelpCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useSubscription, SUBSCRIPTION_TIERS } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const Pricing = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tier, createCheckout, openCustomerPortal, loading } = useSubscription();

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
      limitations: [
        t('pricing.limitations.noVariants', 'Pas de variantes pays'),
        t('pricing.limitations.noProfiles', 'Pas de profils qui réussissent'),
        t('pricing.limitations.noAnalysis', 'Pas d\'analyse projet'),
      ],
      buttonText: t('pricing.currentPlan', 'Plan actuel'),
      highlighted: false,
      color: 'slate',
    },
    {
      id: 'premium' as const,
      name: t('pricing.premiumName', 'Premium'),
      price: '7,99€',
      period: t('pricing.perMonth', '/ mois'),
      description: t('pricing.premiumDescription', 'Accès aux variantes pays spécifiques'),
      icon: Sparkles,
      features: SUBSCRIPTION_TIERS.premium.features,
      limitations: [
        t('pricing.limitations.noLatent', 'Pas d\'accès module Latent'),
        t('pricing.limitations.noIrreversa', 'Pas d\'accès module Irreversa'),
        t('pricing.limitations.noTraceOS', 'Pas d\'accès TraceOS'),
      ],
      buttonText: t('pricing.subscribe', "S'abonner"),
      highlighted: true,
      color: 'amber',
    },
    {
      id: 'pro' as const,
      name: t('pricing.proName', 'Pro'),
      price: '19,99€',
      period: t('pricing.perMonth', '/ mois'),
      description: t('pricing.proDescription', 'Analyse projet personnalisée'),
      icon: Crown,
      features: SUBSCRIPTION_TIERS.pro.features,
      limitations: [],
      buttonText: t('pricing.subscribe', "S'abonner"),
      highlighted: false,
      color: 'purple',
    },
  ];

  const enterpriseFeatures = [
    t('pricing.enterprise.multiUser', 'Accès multi-utilisateurs'),
    t('pricing.enterprise.customAnalysis', 'Analyses personnalisées'),
    t('pricing.enterprise.apiAccess', 'Accès API'),
    t('pricing.enterprise.dedicatedSupport', 'Support dédié'),
    t('pricing.enterprise.sla', 'SLA garantis'),
    t('pricing.enterprise.whiteLabel', 'White-label possible'),
  ];

  const faqs = [
    {
      question: t('pricing.faq.cancel.q', 'Puis-je annuler à tout moment ?'),
      answer: t('pricing.faq.cancel.a', 'Oui, vous pouvez annuler votre abonnement à tout moment. Vous conserverez l\'accès jusqu\'à la fin de votre période de facturation.'),
    },
    {
      question: t('pricing.faq.payment.q', 'Quels moyens de paiement acceptez-vous ?'),
      answer: t('pricing.faq.payment.a', 'Nous acceptons les cartes bancaires (Visa, Mastercard, American Express) via Stripe. Le paiement est sécurisé et crypté.'),
    },
    {
      question: t('pricing.faq.upgrade.q', 'Puis-je changer de plan ?'),
      answer: t('pricing.faq.upgrade.a', 'Oui, vous pouvez passer à un plan supérieur à tout moment. La différence sera calculée au prorata. Pour passer à un plan inférieur, attendez la fin de votre période de facturation.'),
    },
    {
      question: t('pricing.faq.refund.q', 'Y a-t-il une garantie satisfait ou remboursé ?'),
      answer: t('pricing.faq.refund.a', 'Nous offrons une garantie de remboursement de 14 jours si vous n\'êtes pas satisfait. Contactez-nous pour en bénéficier.'),
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
      {/* Hero Section */}
      <div className="text-center mb-16">
        <Badge className="mb-4 px-4 py-1.5">
          {t('pricing.badge', 'Tarification transparente')}
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          {t('pricing.title', 'Choisissez votre plan')}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t('pricing.subtitle', 'Débloquez des analyses plus profondes et des recommandations personnalisées')}
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isCurrent = isCurrentPlan(plan.id);
          const showUpgrade = canUpgrade(plan.id);

          return (
            <Card
              key={plan.id}
              className={cn(
                "relative flex flex-col",
                plan.highlighted && "border-primary shadow-xl scale-105 z-10",
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

                {/* Features */}
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Limitations */}
                {plan.limitations.length > 0 && (
                  <ul className="space-y-2 pt-4 border-t border-dashed">
                    {plan.limitations.map((limitation, index) => (
                      <li key={index} className="flex items-start gap-2 text-muted-foreground">
                        <X className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{limitation}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>

              <CardFooter>
                {isCurrent ? (
                  <Button variant="outline" className="w-full" onClick={() => openCustomerPortal()}>
                    {t('pricing.managePlan', 'Gérer mon abonnement')}
                  </Button>
                ) : showUpgrade ? (
                  <Button
                    className="w-full gap-2"
                    variant={plan.highlighted ? "default" : "outline"}
                    onClick={() => handleSubscribe(plan.id as 'premium' | 'pro')}
                    disabled={loading}
                  >
                    {plan.buttonText}
                    <ArrowRight className="w-4 h-4" />
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

      {/* Enterprise Section */}
      <div className="max-w-4xl mx-auto mb-16">
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-full bg-white/10">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{t('pricing.enterprise.title', 'Enterprise')}</h3>
                    <p className="text-slate-300">{t('pricing.enterprise.subtitle', 'Pour les grandes organisations')}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {enterpriseFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-slate-200">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Link to="/b2b">
                  <Button size="lg" variant="secondary" className="w-full gap-2">
                    <Users className="w-4 h-4" />
                    {t('pricing.enterprise.cta', 'Nous contacter')}
                  </Button>
                </Link>
                <p className="text-xs text-slate-400 text-center">
                  {t('pricing.enterprise.customPricing', 'Tarification sur mesure')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Table */}
      <div className="max-w-4xl mx-auto mb-16">
        <h2 className="text-2xl font-bold text-center mb-8">
          {t('pricing.comparison.title', 'Comparer les fonctionnalités')}
        </h2>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-4 px-4">{t('pricing.comparison.feature', 'Fonctionnalité')}</th>
                <th className="text-center py-4 px-4">Gratuit</th>
                <th className="text-center py-4 px-4 bg-primary/5">Premium</th>
                <th className="text-center py-4 px-4">Pro</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: t('pricing.feature.basicCountries', 'Fiches pays basiques'), free: true, premium: true, pro: true },
                { name: t('pricing.feature.riskIndicators', 'Indicateurs de risque'), free: true, premium: true, pro: true },
                { name: t('pricing.feature.pyramidCommon', 'Tronc commun pyramide'), free: true, premium: true, pro: true },
                { name: t('pricing.feature.countryVariants', 'Variantes pays spécifiques'), free: false, premium: true, pro: true },
                { name: t('pricing.feature.profilesSuccess', 'Profils qui réussissent'), free: false, premium: true, pro: true },
                { name: t('pricing.feature.surprises', 'Ce qui surprend les nouveaux'), free: false, premium: true, pro: true },
                { name: t('pricing.feature.projectAnalysis', 'Analyse projet personnalisée'), free: false, premium: false, pro: true },
                { name: t('pricing.feature.blindSpots', 'Points aveugles spécifiques'), free: false, premium: false, pro: true },
                { name: t('pricing.feature.latentModule', 'Module Latent'), free: false, premium: false, pro: true },
                { name: t('pricing.feature.irreversaModule', 'Module Irreversa'), free: false, premium: false, pro: true },
                { name: t('pricing.feature.traceOS', 'TraceOS'), free: false, premium: false, pro: true },
              ].map((row, index) => (
                <tr key={index} className="border-b hover:bg-muted/30">
                  <td className="py-3 px-4 text-sm">{row.name}</td>
                  <td className="py-3 px-4 text-center">
                    {row.free ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-muted-foreground/50 mx-auto" />}
                  </td>
                  <td className="py-3 px-4 text-center bg-primary/5">
                    {row.premium ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-muted-foreground/50 mx-auto" />}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {row.pro ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-muted-foreground/50 mx-auto" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-2xl mx-auto mb-16">
        <div className="text-center mb-8">
          <HelpCircle className="w-10 h-10 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold">
            {t('pricing.faq.title', 'Questions fréquentes')}
          </h2>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`faq-${index}`}>
              <AccordionTrigger className="text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Trust Badges */}
      <div className="text-center">
        <div className="flex flex-wrap justify-center gap-6 mb-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Shield className="w-5 h-5" />
            <span className="text-sm">{t('pricing.trust.secure', 'Paiement sécurisé')}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Check className="w-5 h-5" />
            <span className="text-sm">{t('pricing.trust.noCommitment', 'Sans engagement')}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Zap className="w-5 h-5" />
            <span className="text-sm">{t('pricing.trust.instantAccess', 'Accès immédiat')}</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {t('pricing.guarantee', 'Annulation possible à tout moment. Pas d\'engagement.')}
        </p>
      </div>
    </div>
  );
};

export default Pricing;
