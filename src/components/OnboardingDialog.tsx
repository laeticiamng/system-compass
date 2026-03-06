/**
 * Interactive Onboarding Tour — Guided experience for new users
 * Detects profile type (B2C individual vs B2B professional) and personalizes the flow
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocalizedNavigate } from '@/hooks/useLocalizedNavigate';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import {
  Compass, Target, TrendingUp, Calculator, Globe, Users,
  Building2, ArrowRight, ArrowLeft, Sparkles, CheckCircle2,
  MapPin, Shield, BookOpen, BarChart3, Briefcase, Heart,
  Plane, User
} from 'lucide-react';
import { useDialogCoordinator } from './DialogCoordinator';

// ─── Profile types ───
type ProfilePath = 'b2c' | 'b2b' | null;
type B2CGoal = 'explore' | 'relocate' | 'invest' | 'retire' | null;

interface StepProps {
  onNext: () => void;
  onBack?: () => void;
  onSelect?: (value: string) => void;
}

// ─── Step 1: Welcome ───
function WelcomeStep({ onNext }: StepProps) {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="text-center space-y-6 py-4"
    >
      <div className="relative mx-auto w-20 h-20">
        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
        <div className="relative w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <Compass className="w-10 h-10 text-primary" />
        </div>
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-display font-bold">
          {t('onboarding.welcome.title', 'Bienvenue sur System Compass')}
        </h2>
        <p className="text-muted-foreground max-w-sm mx-auto">
          {t('onboarding.welcome.desc', 'La plateforme d\'intelligence géopolitique qui vous guide dans vos décisions de mobilité internationale.')}
        </p>
      </div>
      <Button onClick={onNext} size="lg" className="gap-2">
        {t('onboarding.welcome.cta', 'Démarrer le tour')}
        <ArrowRight className="w-4 h-4" />
      </Button>
    </motion.div>
  );
}

// ─── Step 2: Profile selection (B2C vs B2B) ───
function ProfileSelectStep({ onSelect }: StepProps & { onSelect: (v: string) => void }) {
  const { t } = useTranslation();
  const options = [
    {
      value: 'b2c',
      icon: User,
      title: t('onboarding.profile.b2c', 'Particulier'),
      desc: t('onboarding.profile.b2cDesc', 'Je prépare un projet d\'expatriation personnel ou familial'),
      features: ['Explorer 72+ pays', 'Simulateur fiscal', 'Budget de vie', 'Journal d\'expatrié'],
    },
    {
      value: 'b2b',
      icon: Building2,
      title: t('onboarding.profile.b2b', 'Professionnel / Institution'),
      desc: t('onboarding.profile.b2bDesc', 'Je pilote des opérations internationales pour mon organisation'),
      features: ['Gouvernance pays', 'Risk Register', 'Due diligence', 'API & webhooks'],
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="space-y-5 py-2"
    >
      <div className="text-center space-y-1">
        <h2 className="text-xl font-display font-bold">
          {t('onboarding.profile.title', 'Quel est votre profil ?')}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t('onboarding.profile.subtitle', 'Nous adapterons votre parcours en fonction de vos besoins')}
        </p>
      </div>
      <div className="grid gap-3">
        {options.map(opt => (
          <Card
            key={opt.value}
            className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all group"
            onClick={() => onSelect(opt.value)}
          >
            <CardContent className="p-4 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                <opt.icon className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold flex items-center gap-2">
                  {opt.title}
                  <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">{opt.desc}</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {opt.features.map(f => (
                    <span key={f} className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      <CheckCircle2 className="w-2.5 h-2.5" /> {f}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Step 3a: B2C Goal selection ───
function B2CGoalStep({ onSelect }: StepProps & { onSelect: (v: string) => void }) {
  const { t } = useTranslation();
  const goals = [
    { value: 'explore', icon: Globe, label: t('onboarding.goal.explore', 'Explorer les pays'), desc: 'Comparer, comprendre, découvrir' },
    { value: 'relocate', icon: Plane, label: t('onboarding.goal.relocate', 'Préparer un déménagement'), desc: 'Visa, budget, checklist' },
    { value: 'invest', icon: TrendingUp, label: t('onboarding.goal.invest', 'Optimiser ma fiscalité'), desc: 'Simulateur, régimes spéciaux' },
    { value: 'retire', icon: Heart, label: t('onboarding.goal.retire', 'Préparer ma retraite'), desc: 'Coût de vie, santé, sécurité' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="space-y-5 py-2"
    >
      <div className="text-center space-y-1">
        <h2 className="text-xl font-display font-bold">
          {t('onboarding.goal.title', 'Quel est votre objectif ?')}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t('onboarding.goal.subtitle', 'Nous vous guiderons vers les outils les plus pertinents')}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {goals.map(g => (
          <Card
            key={g.value}
            className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all text-center"
            onClick={() => onSelect(g.value)}
          >
            <CardContent className="p-4 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
                <g.icon className="w-5 h-5 text-primary" />
              </div>
              <p className="font-semibold text-sm">{g.label}</p>
              <p className="text-[10px] text-muted-foreground">{g.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Step 3b: B2B features tour ───
function B2BFeaturesStep({ onNext }: StepProps) {
  const { t } = useTranslation();
  const features = [
    { icon: Shield, label: 'Governance Intel', desc: 'Analyse des acteurs, partenaires, délais réglementaires par pays', link: '/b2b' },
    { icon: BarChart3, label: 'Risk Register', desc: 'Cartographiez et suivez les risques de vos opérations internationales', link: '/latent' },
    { icon: BookOpen, label: 'Dossiers de cas', desc: 'Constituez des dossiers structurés avec preuve d\'audit', link: '/irreversa' },
    { icon: Briefcase, label: 'API & Intégrations', desc: 'Connectez System Compass à vos outils via API REST', link: '/api' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="space-y-5 py-2"
    >
      <div className="text-center space-y-1">
        <h2 className="text-xl font-display font-bold">
          {t('onboarding.b2b.title', 'Vos outils professionnels')}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t('onboarding.b2b.subtitle', 'Voici les modules conçus pour les organisations')}
        </p>
      </div>
      <div className="space-y-2">
        {features.map((f, i) => (
          <motion.div
            key={f.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <f.icon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm">{f.label}</p>
              <p className="text-xs text-muted-foreground">{f.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
      <Button onClick={onNext} className="w-full gap-2">
        {t('common.next', 'Suivant')} <ArrowRight className="w-4 h-4" />
      </Button>
    </motion.div>
  );
}

// ─── Step 4: Feature highlights (B2C, personalized) ───
function FeatureHighlightsStep({ onNext, goal }: StepProps & { goal: B2CGoal }) {
  const { t } = useTranslation();

  const featuresByGoal: Record<string, { icon: React.ElementType; label: string; desc: string }[]> = {
    explore: [
      { icon: Globe, label: 'Carte interactive', desc: '72+ pays avec profils complets et intelligence culturelle' },
      { icon: Target, label: 'Country Matcher', desc: 'Trouvez le pays idéal selon votre profil' },
      { icon: BarChart3, label: 'Comparateur', desc: 'Comparez jusqu\'à 4 pays côte à côte' },
      { icon: BookOpen, label: 'Retours d\'expatriés', desc: 'Avis vérifiés de la communauté' },
    ],
    relocate: [
      { icon: CheckCircle2, label: 'Checklist admin', desc: 'Toutes les démarches, étape par étape' },
      { icon: Calculator, label: 'Simulateur budget', desc: 'Projetez votre budget mensuel dans le pays cible' },
      { icon: MapPin, label: 'Timeline', desc: 'Chronologie des démarches sur 12 mois' },
      { icon: Users, label: 'Espace famille', desc: 'Planifiez à plusieurs avec vote et consensus' },
    ],
    invest: [
      { icon: Calculator, label: 'Simulateur fiscal', desc: 'Calcul d\'impôt dans 50+ juridictions' },
      { icon: TrendingUp, label: 'Avant/Après', desc: 'Comparaison visuelle France vs destination' },
      { icon: Shield, label: 'Régimes spéciaux', desc: 'NHR, Beckham, Non-Dom... tous les régimes' },
      { icon: BarChart3, label: 'Financial Intel', desc: 'Analyse des risques financiers par pays' },
    ],
    retire: [
      { icon: Heart, label: 'Qualité de vie', desc: 'Santé, sécurité, climat, coût de vie' },
      { icon: Calculator, label: 'Budget de vie', desc: 'Projection détaillée poste par poste' },
      { icon: Globe, label: 'Visa retraite', desc: 'Options de visa pour retraités par pays' },
      { icon: Users, label: 'Communauté', desc: 'Échangez avec d\'autres retraités expatriés' },
    ],
  };

  const features = featuresByGoal[goal || 'explore'] || featuresByGoal.explore;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="space-y-5 py-2"
    >
      <div className="text-center space-y-1">
        <h2 className="text-xl font-display font-bold">
          {t('onboarding.features.title', 'Vos outils recommandés')}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t('onboarding.features.subtitle', 'Basés sur votre objectif, voici par où commencer')}
        </p>
      </div>
      <div className="space-y-2">
        {features.map((f, i) => (
          <motion.div
            key={f.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
          >
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <f.icon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm">{f.label}</p>
              <p className="text-xs text-muted-foreground">{f.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
      <Button onClick={onNext} className="w-full gap-2">
        {t('common.next', 'Suivant')} <ArrowRight className="w-4 h-4" />
      </Button>
    </motion.div>
  );
}

// ─── Step 5: Quick actions to get started ───
function GetStartedStep({ onComplete, profilePath, goal }: { onComplete: () => void; profilePath: ProfilePath; goal: B2CGoal }) {
  const { t } = useTranslation();
  const navigate = useLocalizedNavigate();

  const b2cActions: Record<string, { link: string; label: string; icon: React.ElementType }[]> = {
    explore: [
      { link: '/world-map', label: 'Explorer la carte', icon: Globe },
      { link: '/profile-matcher', label: 'Trouver mon pays', icon: Target },
      { link: '/countries', label: 'Voir tous les pays', icon: MapPin },
    ],
    relocate: [
      { link: '/quick-test', label: 'Faire le test rapide', icon: Target },
      { link: '/life-simulator', label: 'Simuler mon budget', icon: Calculator },
      { link: '/checklist', label: 'Ma checklist', icon: CheckCircle2 },
    ],
    invest: [
      { link: '/fiscal-calculator', label: 'Simulateur fiscal', icon: Calculator },
      { link: '/fiscal-before-after', label: 'Comparer avant/après', icon: TrendingUp },
      { link: '/fiscal/special-regimes', label: 'Régimes spéciaux', icon: Shield },
    ],
    retire: [
      { link: '/life-simulator', label: 'Budget de vie', icon: Calculator },
      { link: '/countries', label: 'Explorer les pays', icon: Globe },
      { link: '/expat-reviews', label: 'Lire les avis', icon: BookOpen },
    ],
  };

  const b2bActions = [
    { link: '/b2b', label: 'Solutions B2B', icon: Building2 },
    { link: '/institutions', label: 'Pour les institutions', icon: Briefcase },
    { link: '/api', label: 'Documentation API', icon: BookOpen },
  ];

  const actions = profilePath === 'b2b' ? b2bActions : (b2cActions[goal || 'explore'] || b2cActions.explore);

  const handleAction = (link: string) => {
    onComplete();
    navigate(link);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="space-y-5 py-2"
    >
      <div className="text-center space-y-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto"
        >
          <Sparkles className="w-8 h-8 text-primary" />
        </motion.div>
        <h2 className="text-xl font-display font-bold">
          {t('onboarding.start.title', 'Vous êtes prêt !')}
        </h2>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          {t('onboarding.start.subtitle', 'Votre parcours personnalisé vous attend. Par quoi souhaitez-vous commencer ?')}
        </p>
      </div>

      <div className="space-y-2">
        {actions.map((action, i) => (
          <motion.div
            key={action.link}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
          >
            <Button
              variant={i === 0 ? 'default' : 'outline'}
              className="w-full justify-start gap-3 h-12"
              onClick={() => handleAction(action.link)}
            >
              <action.icon className="w-5 h-5" />
              {action.label}
              <ArrowRight className="w-4 h-4 ml-auto" />
            </Button>
          </motion.div>
        ))}
      </div>

      <Button variant="ghost" className="w-full text-muted-foreground" onClick={onComplete}>
        {t('onboarding.start.later', 'Explorer librement')}
      </Button>
    </motion.div>
  );
}

// ─── Main Onboarding Dialog ───
export function OnboardingDialog() {
  const { t } = useTranslation();
  const { shouldShowOnboarding, completeOnboarding } = useDialogCoordinator();
  const [step, setStep] = useState(0);
  const [profilePath, setProfilePath] = useState<ProfilePath>(null);
  const [b2cGoal, setB2cGoal] = useState<B2CGoal>(null);

  // Dynamic step count based on path
  const totalSteps = profilePath === 'b2b' ? 4 : profilePath === 'b2c' ? 5 : 2;
  const progress = ((step + 1) / totalSteps) * 100;

  const handleProfileSelect = (value: string) => {
    setProfilePath(value as ProfilePath);
    setStep(2);
  };

  const handleGoalSelect = (value: string) => {
    setB2cGoal(value as B2CGoal);
    setStep(3);
  };

  const handleComplete = () => {
    completeOnboarding();
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return <WelcomeStep onNext={() => setStep(1)} />;
      case 1:
        return <ProfileSelectStep onNext={() => {}} onSelect={handleProfileSelect} />;
      case 2:
        if (profilePath === 'b2c') {
          return <B2CGoalStep onNext={() => {}} onSelect={handleGoalSelect} />;
        }
        return <B2BFeaturesStep onNext={() => setStep(3)} />;
      case 3:
        if (profilePath === 'b2c') {
          return <FeatureHighlightsStep onNext={() => setStep(4)} goal={b2cGoal} />;
        }
        return <GetStartedStep onComplete={handleComplete} profilePath={profilePath} goal={b2cGoal} />;
      case 4:
        return <GetStartedStep onComplete={handleComplete} profilePath={profilePath} goal={b2cGoal} />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={shouldShowOnboarding} onOpenChange={handleSkip}>
      <DialogContent className="sm:max-w-md p-6 gap-0">
        {/* Progress */}
        {step > 0 && (
          <div className="mb-4 space-y-1">
            <Progress value={progress} className="h-1.5" />
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">
                Étape {step + 1}/{totalSteps}
              </span>
              {step > 0 && step < totalSteps - 1 && (
                <button
                  onClick={handleSkip}
                  className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('common.skip', 'Passer')}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Back button */}
        {step > 0 && step < totalSteps - 1 && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-4 top-4 gap-1 text-xs text-muted-foreground"
            onClick={() => setStep(s => Math.max(0, s - 1))}
          >
            <ArrowLeft className="w-3 h-3" /> Retour
          </Button>
        )}

        <AnimatePresence mode="wait">
          <div key={step}>
            {renderStep()}
          </div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
