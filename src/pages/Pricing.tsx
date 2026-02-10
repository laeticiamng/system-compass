import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { Check, Sparkles, Zap, X, Building2, Users, HelpCircle, ArrowRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useSubscription, SUBSCRIPTION_TIERS } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion, useInView } from "framer-motion";

// Animated section wrapper
function AnimatedSection({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

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
      description: t('pricing.freeDescription', 'Découvrez le concept'),
      subtitle: t('pricing.freeSubtitle', 'Pas de carte bancaire requise'),
      icon: Zap,
      features: SUBSCRIPTION_TIERS.free.features,
      limitations: [
        t('pricing.limitations.limitedCountries', 'Limité à 3 pays'),
        t('pricing.limitations.noExitKeys', 'Pas de recommandations personnalisées'),
        t('pricing.limitations.noExport', 'Pas d\'export PDF'),
      ],
      buttonText: t('pricing.startFree', 'Commencer gratuitement'),
      highlighted: false,
      recommended: true,
      color: 'slate',
    },
    {
      id: 'premium' as const,
      name: t('pricing.premiumName', 'Premium'),
      price: '9,90€',
      period: t('pricing.perMonth', '/ mois'),
      description: t('pricing.premiumDescription', 'Accès complet pour particuliers'),
      icon: Sparkles,
      features: SUBSCRIPTION_TIERS.premium.features,
      limitations: [],
      buttonText: t('pricing.subscribe', "S'abonner"),
      highlighted: true,
      color: 'amber',
    },
    {
      id: 'pro' as const,
      name: t('pricing.proName', 'Pro / B2B'),
      price: t('pricing.proPrice', 'Sur devis'),
      period: '',
      description: t('pricing.proDescription', 'Pour les équipes et organisations'),
      icon: Building2,
      features: SUBSCRIPTION_TIERS.pro.features,
      limitations: [],
      buttonText: t('pricing.contactUs', 'Nous contacter'),
      highlighted: false,
      color: 'slate',
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
    if (tier === 'pro' || tier === 'premium') return false;
    return planId === 'premium';
  };

  return (
    <>
      <Helmet>
        <title>Tarifs - Pyramid Compass | Gratuit, Premium et Enterprise</title>
        <meta name="description" content="Découvrez les offres Pyramid Compass : gratuit pour découvrir, Premium pour un accès complet aux 44 pays, et Enterprise pour les organisations. Tarification transparente." />
        <meta property="og:title" content="Tarifs - Pyramid Compass" />
        <meta property="og:description" content="Gratuit pour découvrir, Premium pour un accès complet. Tarification transparente sans frais cachés." />
        <meta property="og:url" content="https://world-alignment.lovable.app/pricing" />
        <meta name="twitter:title" content="Tarifs - Pyramid Compass" />
        <meta name="twitter:description" content="Gratuit pour découvrir, Premium pour un accès complet. Tarification transparente." />
        <link rel="canonical" href="https://world-alignment.lovable.app/pricing" />
      </Helmet>
      <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-24 overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0">
          <motion.div 
            className="absolute top-20 right-1/4 w-[500px] h-[500px] rounded-full"
            style={{
              background: 'radial-gradient(circle, hsl(var(--primary) / 0.1) 0%, transparent 70%)',
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full"
            style={{
              background: 'radial-gradient(circle, hsl(45 90% 55% / 0.08) 0%, transparent 70%)',
            }}
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-medium">{t('pricing.badge', 'Tarification transparente')}</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
          >
            <span className="block text-foreground">{t('pricing.heroTitle1', 'Choisissez votre')}</span>
            <span className="block bg-gradient-to-r from-primary via-amber-400 to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradient_3s_ease-in-out_infinite]">
              {t('pricing.heroTitle2', 'niveau d\'accès.')}
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            {t('pricing.subtitle', 'Débloquez des analyses plus profondes et des recommandations personnalisées')}
          </motion.p>
        </div>
      </section>

      {/* Plans Grid */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => {
              const Icon = plan.icon;
              const isCurrent = isCurrentPlan(plan.id);
              const showUpgrade = canUpgrade(plan.id);

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                >
                  <Card
                    className={cn(
                      "relative flex flex-col h-full transition-all duration-300 hover:shadow-[0_0_40px_hsl(var(--primary)/0.1)]",
                      plan.highlighted && "border-primary shadow-xl scale-105 z-10 bg-gradient-to-b from-primary/5 to-background",
                      isCurrent && "ring-2 ring-primary"
                    )}
                  >
                    {plan.recommended && !plan.highlighted && (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 px-4">
                        {t('pricing.recommended', 'Recommandé pour commencer')}
                      </Badge>
                    )}
                    {plan.highlighted && (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary px-4">
                        {t('pricing.popular', 'Populaire')}
                      </Badge>
                    )}
                    {isCurrent && (
                      <Badge className="absolute -top-3 right-4 bg-green-500 px-3">
                        {t('subscription.yourPlan', 'Votre plan')}
                      </Badge>
                    )}

                    <CardHeader className="text-center pb-2">
                      <div className={cn(
                        "mx-auto p-4 rounded-2xl mb-4",
                        plan.id === 'free' && "bg-muted",
                        plan.id === 'premium' && "bg-amber-500/10",
                        plan.id === 'pro' && "bg-primary/10"
                      )}>
                        <Icon className={cn(
                          "w-7 h-7",
                          plan.id === 'free' && "text-muted-foreground",
                          plan.id === 'premium' && "text-amber-500",
                          plan.id === 'pro' && "text-primary"
                        )} />
                      </div>
                      <CardTitle className="text-xl font-display">{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                      {plan.subtitle && (
                        <p className="text-xs text-emerald-500 font-medium mt-1 flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          {plan.subtitle}
                        </p>
                      )}
                    </CardHeader>

                    <CardContent className="flex-1">
                      <div className="text-center mb-6">
                        <span className="text-4xl sm:text-5xl font-bold">{plan.price}</span>
                        <span className="text-muted-foreground ml-2">{plan.period}</span>
                      </div>

                      {/* Features */}
                      <ul className="space-y-3 mb-6">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Limitations */}
                      {plan.limitations.length > 0 && (
                        <ul className="space-y-2 pt-4 border-t border-dashed">
                          {plan.limitations.map((limitation, i) => (
                            <li key={i} className="flex items-start gap-3 text-muted-foreground">
                              <X className="w-4 h-4 flex-shrink-0 mt-0.5" />
                              <span className="text-sm">{limitation}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </CardContent>

                    <CardFooter>
                      {isCurrent ? (
                        <Button variant="outline" className="w-full rounded-full" onClick={() => openCustomerPortal()}>
                          {t('pricing.managePlan', 'Gérer mon abonnement')}
                        </Button>
                      ) : plan.id === 'pro' ? (
                        <Button
                          variant="outline"
                          className="w-full gap-2 rounded-full"
                          onClick={() => navigate('/b2b')}
                        >
                          {plan.buttonText}
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      ) : showUpgrade ? (
                        <Button
                          className={cn(
                            "w-full gap-2 rounded-full",
                            plan.highlighted && "shadow-[0_0_20px_hsl(var(--primary)/0.3)]"
                          )}
                          variant={plan.highlighted ? "default" : "outline"}
                          onClick={() => handleSubscribe('premium')}
                          disabled={loading}
                        >
                          {plan.buttonText}
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      ) : plan.id === 'free' && !isCurrent ? (
                        <Button className="w-full rounded-full gap-2" onClick={() => navigate('/auth')}>
                          {plan.buttonText}
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button variant="outline" className="w-full rounded-full" disabled>
                          {plan.id === 'free' ? t('pricing.includedInYourPlan', 'Inclus') : t('pricing.currentPlan', 'Plan actuel')}
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Enterprise Section */}
      <section className="py-16 sm:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="max-w-4xl mx-auto">
              <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none overflow-hidden">
                <CardContent className="p-8 sm:p-12">
                  <div className="flex flex-col md:flex-row md:items-center gap-8">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="p-4 rounded-2xl bg-white/10">
                          <Building2 className="w-8 h-8" />
                        </div>
                        <div>
                          <h3 className="text-2xl sm:text-3xl font-bold font-display">{t('pricing.enterprise.title', 'Enterprise')}</h3>
                          <p className="text-slate-300">{t('pricing.enterprise.subtitle', 'Pour les grandes organisations')}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        {enterpriseFeatures.map((feature, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-400" />
                            <span className="text-sm text-slate-200">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-4">
                      <Link to="/b2b">
                        <Button size="lg" variant="secondary" className="w-full gap-2 rounded-full">
                          <Users className="w-5 h-5" />
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
          </AnimatedSection>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="max-w-4xl mx-auto">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-center mb-12">
                {t('pricing.comparison.title', 'Comparer les fonctionnalités')}
              </h2>
              
              <div className="overflow-x-auto rounded-2xl border border-border/50">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left py-4 px-6">{t('pricing.comparison.feature', 'Fonctionnalité')}</th>
                      <th className="text-center py-4 px-4">Gratuit</th>
                      <th className="text-center py-4 px-4 bg-primary/5">Premium</th>
                      <th className="text-center py-4 px-4">Pro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: t('pricing.feature.basicCountries', 'Fiches pays basiques'), free: true, premium: true, pro: true },
                      { name: t('pricing.feature.riskIndicators', 'Indicateurs de risque'), free: true, premium: true, pro: true },
                      { name: t('pricing.feature.pyramidCommon', 'Analyse de base'), free: true, premium: true, pro: true },
                      { name: t('pricing.feature.countryVariants', 'Détails par pays'), free: true, premium: true, pro: true },
                      { name: t('pricing.feature.profilesSuccess', 'Profils qui réussissent'), free: true, premium: true, pro: true },
                      { name: t('pricing.feature.surprises', 'Ce qui surprend les nouveaux'), free: true, premium: true, pro: true },
                      { name: t('pricing.feature.systemAnalysis', 'Analyse système'), free: false, premium: true, pro: true },
                      { name: t('pricing.feature.governance', 'Gouvernance & Terrain'), free: false, premium: true, pro: true },
                      { name: t('pricing.feature.projectAnalysis', 'Analyse projet personnalisée'), free: false, premium: false, pro: true },
                      { name: t('pricing.feature.blindSpots', 'Points aveugles spécifiques'), free: false, premium: false, pro: true },
                      { name: t('pricing.feature.latentModule', 'Analyse des risques cachés'), free: false, premium: false, pro: true },
                      { name: t('pricing.feature.irreversaModule', 'Points de non-retour'), free: false, premium: false, pro: true },
                      { name: t('pricing.feature.traceOS', 'Suivi institutionnel'), free: false, premium: false, pro: true },
                    ].map((row, i) => (
                      <tr key={i} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="py-4 px-6 text-sm">{row.name}</td>
                        <td className="py-4 px-4 text-center">
                          {row.free ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-muted-foreground/30 mx-auto" />}
                        </td>
                        <td className="py-4 px-4 text-center bg-primary/5">
                          {row.premium ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-muted-foreground/30 mx-auto" />}
                        </td>
                        <td className="py-4 px-4 text-center">
                          {row.pro ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-muted-foreground/30 mx-auto" />}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
                  <HelpCircle className="w-8 h-8 text-primary" />
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold">
                  {t('pricing.faq.title', 'Questions fréquentes')}
                </h2>
              </div>

              <Accordion type="single" collapsible className="w-full space-y-4">
                {faqs.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`} className="border rounded-xl px-6 bg-background">
                    <AccordionTrigger className="text-left py-5 hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-5">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 text-center">
          <AnimatedSection>
            <div className="flex flex-wrap justify-center gap-8 mb-8">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Shield className="w-6 h-6" />
                <span className="text-sm font-medium">{t('pricing.trust.secure', 'Paiement sécurisé')}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Check className="w-6 h-6" />
                <span className="text-sm font-medium">{t('pricing.trust.noCommitment', 'Sans engagement')}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Zap className="w-6 h-6" />
                <span className="text-sm font-medium">{t('pricing.trust.instantAccess', 'Accès immédiat')}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('pricing.guarantee', 'Annulation possible à tout moment. Pas d\'engagement.')}
            </p>
          </AnimatedSection>
        </div>
      </section>
      </div>
    </>
  );
};

export default Pricing;
