import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { PyramidType, PYRAMID_TYPE_INFO } from '@/lib/types';
import { useTestResults } from '@/hooks/useTestResults';
import { useAuth } from '@/hooks/useAuth';
import { OVISuggestionsWidget } from '@/components/ovi/OVISuggestionsWidget';
import { motion, useInView } from 'framer-motion';
import { 
  Zap, 
  ArrowRight,
  Clock, 
  Eye, 
  Key, 
  GitCompare,
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
  AlertTriangle
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

// Blind spots per pyramid type
const PYRAMID_BLIND_SPOTS: Record<PyramidType, string[]> = {
  STABILITY_REDIS: [
    'quickTest.blindSpots.stability.slow',
    'quickTest.blindSpots.stability.mobility',
    'quickTest.blindSpots.stability.rulesChange'
  ],
  GROWTH_RISK: [
    'quickTest.blindSpots.growth.safetyNet',
    'quickTest.blindSpots.growth.survivors',
    'quickTest.blindSpots.growth.capital'
  ],
  PROBLEM_RENT: [
    'quickTest.blindSpots.rent.dysfunction',
    'quickTest.blindSpots.rent.network',
    'quickTest.blindSpots.rent.reform'
  ],
  COMPETENCE_TRUST: [
    'quickTest.blindSpots.competence.credentials',
    'quickTest.blindSpots.competence.slow',
    'quickTest.blindSpots.competence.outsider'
  ],
  HYBRID_TRANSITION: [
    'quickTest.blindSpots.hybrid.rules',
    'quickTest.blindSpots.hybrid.contradictions',
    'quickTest.blindSpots.hybrid.timing'
  ],
  RESOURCE_EXTRACTION: [
    'quickTest.blindSpots.resource.temporary',
    'quickTest.blindSpots.resource.volatility',
    'quickTest.blindSpots.resource.dependency'
  ]
};

// Exit keys per pyramid type
const PYRAMID_EXIT_KEYS: Record<PyramidType, string> = {
  STABILITY_REDIS: 'quickTest.exitKeys.stability',
  GROWTH_RISK: 'quickTest.exitKeys.growth',
  PROBLEM_RENT: 'quickTest.exitKeys.rent',
  COMPETENCE_TRUST: 'quickTest.exitKeys.competence',
  HYBRID_TRANSITION: 'quickTest.exitKeys.hybrid',
  RESOURCE_EXTRACTION: 'quickTest.exitKeys.resource'
};

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
  const navigate = useNavigate();
  const { t } = useTranslation();
  useAuth();
  const { saveResult } = useTestResults();
  const [answers, setAnswers] = useState<QuickTestAnswers>({});
  const [showResults, setShowResults] = useState(false);
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [hasSaved, setHasSaved] = useState(false);

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
      setShowResults(true);
      
      if (!hasSaved) {
        const pyramid = mapToPyramid(answers);
        saveResult('quick_test', answers as Record<string, unknown>, pyramid, undefined, elapsedTime);
        setHasSaved(true);
      }
    }
  }, [answers, hasSaved, elapsedTime, saveResult]);

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
  };

  if (showResults && pyramidType && pyramidInfo) {
    const blindSpots = PYRAMID_BLIND_SPOTS[pyramidType];
    const exitKey = pyramidType ? PYRAMID_EXIT_KEYS[pyramidType] : null;

    return (
      <div className="min-h-screen bg-background overflow-x-hidden">
        {/* Results Hero */}
        <section className="relative pt-24 sm:pt-32 pb-16 overflow-hidden">
          {/* Animated gradient background */}
          <div className="absolute inset-0">
            <motion.div 
              className="absolute top-20 left-1/3 w-[500px] h-[500px] rounded-full"
              style={{
                background: 'radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 70%)',
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

          <div className="container mx-auto px-4 relative z-10 max-w-2xl">
            {/* Timer badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex justify-center mb-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 font-medium">
                <Clock className="w-4 h-4" />
                {elapsedTime} {t('common.seconds', 'secondes')}
              </div>
            </motion.div>

            {/* Main result card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card border border-border/50 rounded-3xl p-6 sm:p-10 mb-8 shadow-[0_0_60px_hsl(var(--primary)/0.1)]"
            >
              <p className="text-sm text-muted-foreground mb-4 text-center">
                {t('quickTest.result.systemLooksLike', 'Le système ressemble souvent à...')}
              </p>
              
              <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 mb-8">
                <div className="flex items-center gap-4 justify-center">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Eye className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-center sm:text-left">
                    <h2 className="font-display text-2xl sm:text-3xl font-bold">{pyramidInfo.label}</h2>
                    <p className="text-sm text-muted-foreground">{pyramidInfo.description}</p>
                  </div>
                </div>
              </div>

              {/* Blind spots */}
              <div className="mb-8">
                <h3 className="font-semibold mb-4 flex items-center justify-center gap-2 text-lg">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  {t('quickTest.result.blindSpots', '3 points aveugles fréquents')}
                </h3>
                <ul className="space-y-3">
                  {blindSpots.map((spotKey, index) => (
                    <motion.li 
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20"
                    >
                      <span className="w-2 h-2 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                      <span className="text-sm">{t(spotKey)}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Exit key */}
              <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20">
                <h3 className="font-semibold mb-3 flex items-center justify-center gap-2 text-lg">
                  <Key className="w-5 h-5 text-primary" />
                  {t('quickTest.result.exitKey', '1 clé de sortie à considérer')}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 text-center">
                  {exitKey && t(exitKey)}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/exit-keys')}
                  className="w-full text-primary hover:text-primary/80 gap-2"
                >
                  {t('quickTest.result.viewExitKeys', 'Voir les clés de sortie')}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 mb-8"
            >
              <Button
                size="lg"
                onClick={() => navigate('/prevention-filter', { 
                  state: { 
                    prefill: { 
                      riskTolerance: answers.riskTolerance,
                      priority: answers.priority 
                    } 
                  } 
                })}
                className="flex-1 gap-2 h-14 rounded-full shadow-[0_0_30px_hsl(var(--primary)/0.3)]"
              >
                <Eye className="w-5 h-5" />
                {t('quickTest.result.deepDive', 'Approfondir')}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/compare?mode=multi')}
                className="flex-1 gap-2 h-14 rounded-full"
              >
                <GitCompare className="w-5 h-5" />
                {t('quickTest.result.compareScenarios', 'Comparer des scénarios')}
              </Button>
            </motion.div>

            {/* Restart */}
            <div className="text-center mb-8">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="gap-2 text-muted-foreground"
              >
                <RefreshCcw className="w-4 h-4" />
                {t('quickTest.restart', 'Recommencer')}
              </Button>
            </div>

            {/* OVI Suggestions */}
            <OVISuggestionsWidget 
              simulationType="matching" 
              context={{ riskLevel: answers.riskTolerance as 'low' | 'medium' | 'high' }}
              className="mb-8"
            />

            {/* Disclaimer */}
            <p className="text-xs text-center text-muted-foreground/70">
              ⚠️ {t('quickTest.disclaimer', 'Simulation ≠ prédiction. Exploration uniquement.')}
            </p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
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
              {t('quickTest.heroTitle2', 'système dominant.')}
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-muted-foreground mb-8"
          >
            {t('quickTest.subtitle', 'En 60 secondes, découvre le système qui ressemble à ta situation')}
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
