import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckCircle, Sparkles, Crown, ArrowRight, Key, Map, BarChart3, BookOpen, Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSubscription, SUBSCRIPTION_TIERS } from "@/hooks/useSubscription";

// Simple confetti effect
function triggerConfetti() {
  // Create colorful particles
  const colors = ['#FFD700', '#FFA500', '#FF6347', '#9370DB', '#3CB371'];
  const particleCount = 50;
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.style.cssText = `
      position: fixed;
      width: 10px;
      height: 10px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      left: ${50 + (Math.random() - 0.5) * 40}%;
      top: -10px;
      animation: confetti-fall ${2 + Math.random() * 2}s ease-out forwards;
    `;
    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 4000);
  }
}

const SubscriptionSuccess = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { checkSubscription, tier, loading } = useSubscription();
  const [hasTriggeredConfetti, setHasTriggeredConfetti] = useState(false);

  useEffect(() => {
    // Refresh subscription status after successful checkout
    checkSubscription();
  }, [checkSubscription]);

  useEffect(() => {
    // Trigger confetti only once when tier changes from free
    if (!loading && tier !== 'free' && !hasTriggeredConfetti) {
      triggerConfetti();
      setHasTriggeredConfetti(true);
    }
  }, [tier, loading, hasTriggeredConfetti]);

  const tierConfig = SUBSCRIPTION_TIERS[tier] || SUBSCRIPTION_TIERS.premium;

  const nextSteps = [
    {
      icon: Map,
      title: t("subscription.nextSteps.countries", "Explorer les pays"),
      description: t("subscription.nextSteps.countriesDesc", "Découvrez les variantes pays maintenant débloquées"),
      href: "/countries",
      color: "text-blue-500"
    },
    {
      icon: Key,
      title: t("subscription.nextSteps.exitKeys", "Stratégies"),
      description: t("subscription.nextSteps.exitKeysDesc", "Trouvez les stratégies adaptées à votre profil"),
      href: "/exit-keys",
      color: "text-amber-500"
    },
    {
      icon: BarChart3,
      title: t("subscription.nextSteps.dashboard", "Tableau de bord"),
      description: t("subscription.nextSteps.dashboardDesc", "Suivez votre progression et vos objectifs"),
      href: "/dashboard",
      color: "text-green-500"
    },
    {
      icon: BookOpen,
      title: t("subscription.nextSteps.learn", "Guide de lecture"),
      description: t("subscription.nextSteps.learnDesc", "Apprenez à interpréter les données"),
      href: "/how-to-read",
      color: "text-purple-500"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 pt-24">
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
      
      <div className="max-w-2xl w-full">
        {/* Success Card */}
        <Card className="text-center mb-8 border-primary/30 bg-gradient-to-b from-primary/5 to-transparent">
          <CardHeader className="space-y-4 pb-2">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 animate-pulse">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl md:text-3xl mb-2">
                {t("subscription.successTitle", "Abonnement activé !")}
              </CardTitle>
              <CardDescription className="text-base">
                {t("subscription.successSubtitle", "Bienvenue dans l'expérience complète")}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Tier Badge */}
            <div className="flex items-center justify-center gap-3">
              <Badge className={`px-4 py-2 text-base gap-2 ${
                tier === 'pro' 
                  ? 'bg-purple-500/20 text-purple-500 border-purple-500/30' 
                  : 'bg-amber-500/20 text-amber-500 border-amber-500/30'
              }`}>
                {tier === 'pro' ? <Crown className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                {tierConfig.name}
              </Badge>
            </div>
            
            {/* Features unlocked */}
            <div className="bg-muted/30 rounded-xl p-4">
              <h4 className="font-medium text-sm mb-3 text-muted-foreground">
                {t("subscription.featuresUnlocked", "Fonctionnalités débloquées")}
              </h4>
              <ul className="space-y-2">
                {tierConfig.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-muted-foreground text-sm">
              {t("subscription.successDescription", "Merci pour votre confiance ! Vous avez maintenant accès à toutes les fonctionnalités premium.")}
            </p>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <div className="mb-8">
          <h3 className="font-semibold text-lg mb-4 text-center">
            {t("subscription.whatNext", "Et maintenant ?")}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {nextSteps.map((step) => (
              <Link key={step.href} to={step.href}>
                <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group">
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className={`p-2 rounded-lg bg-muted ${step.color}`}>
                      <step.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm group-hover:text-primary transition-colors">
                        {step.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {step.description}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors mt-1" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Main CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            size="lg"
            onClick={() => navigate("/exit-keys")} 
            className="gap-2"
          >
            <Key className="w-5 h-5" />
            {t("subscription.startAnalysis", "Commencer l'analyse")}
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => navigate("/dashboard")} 
            className="gap-2"
          >
            <BarChart3 className="w-5 h-5" />
            {t("subscription.goToDashboard", "Aller au tableau de bord")}
          </Button>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-center text-muted-foreground mt-8 flex items-center justify-center gap-1">
          <Shield className="w-3 h-3" />
          {t("subscription.disclaimer", "Votre abonnement est sécurisé et peut être annulé à tout moment depuis votre tableau de bord.")}
        </p>
      </div>
    </div>
  );
};

export default SubscriptionSuccess;
