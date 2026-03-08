import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { SITE_CONFIG } from '@/config/site';
import { useLocalizedNavigate } from '@/hooks/useLocalizedNavigate';
import { PyramidType, PYRAMID_TYPE_INFO } from '@/lib/types';
import { useTestResults } from '@/hooks/useTestResults';
import { useAuth } from '@/hooks/useAuth';
import { motion, useInView } from 'framer-motion';
import { QuickTestResults, determineProfileType, matchCountries } from '@/components/QuickTestResults';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Zap, 
  Briefcase,
  GraduationCap,
  RefreshCcw,
  User,
  DollarSign,
  Bird,
  Shield,
  Heart,
  Timer,
  Wallet,
  Battery,
  Users,
  AlertTriangle,
  Home
} from 'lucide-react';

type Situation = 'employee' | 'freelance' | 'student' | 'transition';
type Priority = 'money' | 'freedom' | 'security' | 'meaning';
type RiskLevel = 'low' | 'medium' | 'high';
type Constraint = 'time' | 'money' | 'energy' | 'family';

interface QuickTestAnswers {
  situation?: Situation;
  priority?: Priority;
  riskTolerance?: RiskLevel;
  mainConstraint?: Constraint;
}

// Mapping from answers to pyramid types
function mapToPyramid(answers: QuickTestAnswers): PyramidType {
  const { situation, priority, riskTolerance } = answers;
  
  if (situation === 'transition') {
    return 'HYBRID_TRANSITION';
  }
  
  if (priority === 'money' && riskTolerance === 'high') {
    return situation === 'freelance' ? 'GROWTH_RISK' : 'RESOURCE_EXTRACTION';
  }
  
  if (priority === 'money' && riskTolerance === 'low') {
    return 'PROBLEM_RENT';
  }
  
  if (priority === 'security') {
    return 'STABILITY_REDIS';
  }
  
  if (priority === 'meaning') {
    return 'COMPETENCE_TRUST';
  }
  
  if (priority === 'freedom' && riskTolerance === 'high') {
    return 'GROWTH_RISK';
  }
  
  if (priority === 'freedom') {
    return 'HYBRID_TRANSITION';
  }
  
  return 'STABILITY_REDIS';
}

// Note: PYRAMID_BLIND_SPOTS and PYRAMID_EXIT_KEYS are kept for future use 
// but currently the QuickTestResults component handles display

// Animated section wrapper
function AnimatedSection({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function QuickTest() {
  const { t } = useTranslation();
  const navigate = useLocalizedNavigate();
  useAuth();
  const { saveResult } = useTestResults();
  const [answers, setAnswers] = useState<QuickTestAnswers>({});
  const [showResults, setShowResults] = useState(false);
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [hasSaved, setHasSaved] = useState(false);
  const [countries, setCountries] = useState<{ id: string; name: string; pyramid_type: string }[]>([]);
  const [calculationError, setCalculationError] = useState(false);

  // Fetch countries for matching
  useEffect(() => {
    const fetchCountries = async () => {
      const { data } = await import('@/integrations/supabase/client').then(m => 
        m.supabase.from('countries').select('id, name, pyramid_type')
      );
      if (data) setCountries(data);
    };
    fetchCountries();
  }, []);

  // Track elapsed time
  useEffect(() => {
    if (showResults) return;
    
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [startTime, showResults]);

  // Auto-show results and save when all 4 questions are answered
  useEffect(() => {
    if (answers.situation && answers.priority && answers.riskTolerance && answers.mainConstraint) {
      try {
        setShowResults(true);
        
        if (!hasSaved) {
          const pyramid = mapToPyramid(answers);
          const profileType = determineProfileType(answers);
          const matched = matchCountries(profileType, pyramid, countries);
          const matchedForSave = matched.map(c => ({ id: c.id, name: c.name, compatibility: c.compatibility }));
          
          saveResult(
            'quick_test', 
            answers as Record<string, unknown>, 
            pyramid, 
            undefined, 
            elapsedTime,
            profileType,
            matchedForSave
          );
          setHasSaved(true);
        }
      } catch (error) {
        console.error('Quick test calculation error:', error);
        setCalculationError(true);
      }
    }
  }, [answers, hasSaved, elapsedTime, saveResult, countries]);

  const answeredCount = Object.values(answers).filter(Boolean).length;
  const pyramidType = showResults ? mapToPyramid(answers) : null;
  const pyramidInfo = pyramidType ? PYRAMID_TYPE_INFO[pyramidType] : null;

  const handleSelect = (key: keyof QuickTestAnswers, value: string) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setAnswers({});
    setShowResults(false);
    setHasSaved(false);
    setCalculationError(false);
  };

  // Fallback UI if calculation fails
  if (calculationError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-lg w-full border-amber-500/20">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-amber-500" />
            </div>
            <CardTitle className="text-xl font-display">
              {t('quickTest.error.title', 'Oops, le calcul a échoué')}
            </CardTitle>
            <p className="text-muted-foreground text-sm mt-2">
              {t('quickTest.error.description', 'Nous n\'avons pas pu calculer votre profil. Veuillez réessayer ou retourner à l\'accueil.')}
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={handleReset} className="w-full">
              <RefreshCcw className="w-4 h-4 mr-2" />
              {t('quickTest.restart', 'Recommencer')}
            </Button>
            <Button onClick={() => navigate('/')} variant="outline" className="w-full">
              <Home className="w-4 h-4 mr-2" />
              {t('common.backToHome', 'Retour à l\'accueil')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showResults && pyramidType && pyramidInfo) {
    return (
      <QuickTestResults
        answers={answers}
        pyramidType={pyramidType}
        pyramidInfo={pyramidInfo}
        elapsedTime={elapsedTime}
        onReset={handleReset}
        countries={countries}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Helmet>
        <title>Test Rapide d'Expatriation en 60 secondes - System Compass</title>
        <meta name="description" content="Découvrez votre profil expatrié en 60 secondes. Test gratuit : situation, priorités, tolérance au risque. Trouvez les pays compatibles avec votre profil." />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Test Rapide d'Expatriation - System Compass" />
        <meta property="og:description" content="Découvrez votre profil expatrié en 60 secondes. Test gratuit et personnalisé." />
        <meta property="og:image" content={SITE_CONFIG.ogImageUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Test Rapide d'Expatriation - System Compass" />
        <meta name="twitter:description" content="Découvrez votre profil expatrié en 60 secondes. Test gratuit et personnalisé." />
        <meta name="twitter:image" content={SITE_CONFIG.ogImageUrl} />
      </Helmet>
      {/* Hero Section */}
      <section className="relative pt-24 sm:pt-32 pb-12 overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0">
          <motion.div 
            className="absolute top-20 right-1/4 w-[400px] h-[400px] rounded-full"
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
        </div>

        <div className="container mx-auto px-4 relative z-10 max-w-2xl text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
          >
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-medium">{t('quickTest.badge', '60 secondes')}</span>
          </motion.div>

          {/* Title */}
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4"
          >
            <span className="block text-foreground">{t('quickTest.heroTitle1', 'Découvre ton')}</span>
            <span className="block bg-gradient-to-r from-primary via-amber-400 to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradient_3s_ease-in-out_infinite]">
              {t('quickTest.heroTitle2', 'profil expatrié.')}
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-muted-foreground mb-8"
          >
            {t('quickTest.subtitle', 'En 60 secondes, découvre le pays qui correspond à ta situation')}
          </motion.p>

          {/* Progress indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-3 mb-8"
          >
            {[1, 2, 3, 4].map((step) => (
              <motion.div
                key={step}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  answeredCount >= step 
                    ? 'bg-primary scale-125 shadow-[0_0_10px_hsl(var(--primary)/0.5)]' 
                    : 'bg-muted'
                }`}
                animate={answeredCount >= step ? { scale: [1, 1.3, 1] } : {}}
              />
            ))}
            <span className="text-sm text-muted-foreground ml-2 font-medium">
              {answeredCount}/4
            </span>
          </motion.div>
        </div>
      </section>

      {/* Questions Section */}
      <section className="pb-16 sm:pb-24">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="space-y-6">
            {/* Question 1: Situation */}
            <AnimatedSection>
              <QuestionBlock
                title={t('quickTest.situation', 'Ta situation actuelle')}
                selected={answers.situation}
                onSelect={(value) => handleSelect('situation', value)}
                options={[
                  { value: 'employee', label: t('quickTest.situations.employee', 'Employé'), icon: <Briefcase className="w-5 h-5" /> },
                  { value: 'freelance', label: t('quickTest.situations.freelance', 'Indépendant'), icon: <User className="w-5 h-5" /> },
                  { value: 'student', label: t('quickTest.situations.student', 'Étudiant'), icon: <GraduationCap className="w-5 h-5" /> },
                  { value: 'transition', label: t('quickTest.situations.transition', 'En transition'), icon: <RefreshCcw className="w-5 h-5" /> }
                ]}
              />
            </AnimatedSection>

            {/* Question 2: Priority */}
            <AnimatedSection>
              <QuestionBlock
                title={t('quickTest.priority', 'Ta priorité principale')}
                selected={answers.priority}
                onSelect={(value) => handleSelect('priority', value)}
                options={[
                  { value: 'money', label: t('quickTest.priorities.money', 'Argent'), icon: <DollarSign className="w-5 h-5" /> },
                  { value: 'freedom', label: t('quickTest.priorities.freedom', 'Liberté'), icon: <Bird className="w-5 h-5" /> },
                  { value: 'security', label: t('quickTest.priorities.security', 'Sécurité'), icon: <Shield className="w-5 h-5" /> },
                  { value: 'meaning', label: t('quickTest.priorities.meaning', 'Sens'), icon: <Heart className="w-5 h-5" /> }
                ]}
              />
            </AnimatedSection>

            {/* Question 3: Risk Tolerance */}
            <AnimatedSection>
              <QuestionBlock
                title={t('quickTest.riskTolerance', 'Ta tolérance au risque')}
                selected={answers.riskTolerance}
                onSelect={(value) => handleSelect('riskTolerance', value)}
                options={[
                  { value: 'low', label: t('quickTest.riskLevels.low', 'Faible'), icon: <Shield className="w-5 h-5" /> },
                  { value: 'medium', label: t('quickTest.riskLevels.medium', 'Moyenne'), icon: <Timer className="w-5 h-5" /> },
                  { value: 'high', label: t('quickTest.riskLevels.high', 'Élevée'), icon: <Zap className="w-5 h-5" /> }
                ]}
              />
            </AnimatedSection>

            {/* Question 4: Main Constraint */}
            <AnimatedSection>
              <QuestionBlock
                title={t('quickTest.mainConstraint', 'Ta contrainte dominante')}
                selected={answers.mainConstraint}
                onSelect={(value) => handleSelect('mainConstraint', value)}
                options={[
                  { value: 'time', label: t('quickTest.constraints.time', 'Temps'), icon: <Timer className="w-5 h-5" /> },
                  { value: 'money', label: t('quickTest.constraints.money', 'Argent'), icon: <Wallet className="w-5 h-5" /> },
                  { value: 'energy', label: t('quickTest.constraints.energy', 'Énergie'), icon: <Battery className="w-5 h-5" /> },
                  { value: 'family', label: t('quickTest.constraints.family', 'Famille'), icon: <Users className="w-5 h-5" /> }
                ]}
              />
            </AnimatedSection>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-center text-muted-foreground/70 mt-12">
            ⚠️ {t('quickTest.disclaimer', 'Simulation ≠ prédiction. Exploration uniquement.')}
          </p>
        </div>
      </section>
    </div>
  );
}

interface QuestionBlockProps {
  title: string;
  selected?: string;
  onSelect: (value: string) => void;
  options: Array<{ value: string; label: string; icon: React.ReactNode }>;
}

function QuestionBlock({ title, selected, onSelect, options }: QuestionBlockProps) {
  return (
    <div className="bg-card border border-border/50 rounded-2xl p-5 sm:p-6 shadow-sm">
      <h3 className="font-medium text-sm sm:text-base mb-4 text-center">{title}</h3>
      <div className={`grid gap-3 ${options.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
        {options.map((option) => (
          <motion.button
            key={option.value}
            onClick={() => onSelect(option.value)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
              selected === option.value
                ? 'bg-primary/10 border-primary text-primary shadow-[0_0_20px_hsl(var(--primary)/0.2)]'
                : 'bg-muted/30 border-transparent hover:bg-muted/50 hover:border-border'
            }`}
          >
            <span className="[&>svg]:w-6 [&>svg]:h-6">{option.icon}</span>
            <span className="text-xs sm:text-sm font-medium text-center leading-tight">{option.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
