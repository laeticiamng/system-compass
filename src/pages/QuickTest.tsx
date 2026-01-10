import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { PyramidType, PYRAMID_TYPE_INFO } from '@/lib/types';
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
  
  // Transition situation → always HYBRID_TRANSITION
  if (situation === 'transition') {
    return 'HYBRID_TRANSITION';
  }
  
  // Money priority + high risk → RESOURCE_EXTRACTION or GROWTH_RISK
  if (priority === 'money' && riskTolerance === 'high') {
    return situation === 'freelance' ? 'GROWTH_RISK' : 'RESOURCE_EXTRACTION';
  }
  
  // Money priority + low risk → PROBLEM_RENT (rentier/safe approach)
  if (priority === 'money' && riskTolerance === 'low') {
    return 'PROBLEM_RENT';
  }
  
  // Security priority → STABILITY_REDIS
  if (priority === 'security') {
    return 'STABILITY_REDIS';
  }
  
  // Meaning priority → COMPETENCE_TRUST
  if (priority === 'meaning') {
    return 'COMPETENCE_TRUST';
  }
  
  // Freedom priority + high risk → GROWTH_RISK
  if (priority === 'freedom' && riskTolerance === 'high') {
    return 'GROWTH_RISK';
  }
  
  // Freedom priority + other → HYBRID_TRANSITION
  if (priority === 'freedom') {
    return 'HYBRID_TRANSITION';
  }
  
  // Default fallback
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

export default function QuickTest() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [answers, setAnswers] = useState<QuickTestAnswers>({});
  const [showResults, setShowResults] = useState(false);
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);

  // Track elapsed time
  useEffect(() => {
    if (showResults) return;
    
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [startTime, showResults]);

  // Auto-show results when all 4 questions are answered
  useEffect(() => {
    if (answers.situation && answers.priority && answers.riskTolerance && answers.mainConstraint) {
      setShowResults(true);
    }
  }, [answers]);

  const answeredCount = Object.values(answers).filter(Boolean).length;
  const pyramidType = showResults ? mapToPyramid(answers) : null;
  const pyramidInfo = pyramidType ? PYRAMID_TYPE_INFO[pyramidType] : null;

  const handleSelect = (key: keyof QuickTestAnswers, value: string) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setAnswers({});
    setShowResults(false);
  };

  if (showResults && pyramidType && pyramidInfo) {
    const blindSpots = PYRAMID_BLIND_SPOTS[pyramidType];
    const exitKey = pyramidType ? PYRAMID_EXIT_KEYS[pyramidType] : null;

    return (
      <div className="min-h-screen pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Timer badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Clock className="w-4 h-4" />
              {elapsedTime} {t('common.seconds', 'secondes')}
            </div>
          </div>

          {/* Main result card */}
          <div className="glass-card rounded-2xl p-6 md:p-8 mb-6">
            <p className="text-sm text-muted-foreground mb-3">
              {t('quickTest.result.systemLooksLike', 'Le système ressemble souvent à...')}
            </p>
            
            <div className={`p-4 rounded-xl bg-${pyramidInfo.color}/10 border border-${pyramidInfo.color}/30 mb-6`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-${pyramidInfo.color}/20`}>
                  <Eye className={`w-6 h-6 text-${pyramidInfo.color}`} />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold">{pyramidInfo.label}</h2>
                  <p className="text-sm text-muted-foreground">{pyramidInfo.description}</p>
                </div>
              </div>
            </div>

            {/* Blind spots */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                {t('quickTest.result.blindSpots', '3 points aveugles fréquents')}
              </h3>
              <ul className="space-y-2">
                {blindSpots.map((spotKey, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                    {t(spotKey)}
                  </li>
                ))}
              </ul>
            </div>

            {/* Exit key */}
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Key className="w-4 h-4 text-primary" />
                {t('quickTest.result.exitKey', '1 clé de sortie à considérer')}
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                {exitKey && t(exitKey)}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/exit-keys')}
                className="text-primary hover:text-primary/80 gap-1 p-0 h-auto"
              >
                {t('quickTest.result.viewExitKeys', 'Voir les clés de sortie')}
                <ArrowRight className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <Button
              onClick={() => navigate('/prevention-filter', { 
                state: { 
                  prefill: { 
                    riskTolerance: answers.riskTolerance,
                    priority: answers.priority 
                  } 
                } 
              })}
              className="flex-1 gap-2"
            >
              <Eye className="w-4 h-4" />
              {t('quickTest.result.deepDive', 'Approfondir')}
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/multi-compare')}
              className="flex-1 gap-2"
            >
              <GitCompare className="w-4 h-4" />
              {t('quickTest.result.compareScenarios', 'Comparer 2 scénarios')}
            </Button>
          </div>

          {/* Restart */}
          <div className="text-center mb-6">
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

          {/* Disclaimer */}
          <p className="text-xs text-center text-muted-foreground/70 px-4">
            ⚠️ {t('quickTest.disclaimer', 'Simulation ≠ prédiction. Exploration uniquement.')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Zap className="w-4 h-4" />
            {t('quickTest.badge', '60 secondes')}
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold mb-2">
            {t('quickTest.title', 'Test rapide')}
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            {t('quickTest.subtitle', 'En 60 secondes, découvre le système qui ressemble à ta situation')}
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`w-3 h-3 rounded-full transition-colors ${
                answeredCount >= step ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
          <span className="text-xs text-muted-foreground ml-2">
            {answeredCount}/4
          </span>
        </div>

        {/* Questions - all visible at once for speed */}
        <div className="space-y-6">
          {/* Question 1: Situation */}
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

          {/* Question 2: Priority */}
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

          {/* Question 3: Risk Tolerance */}
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

          {/* Question 4: Main Constraint */}
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
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-center text-muted-foreground/70 mt-8 px-4">
          ⚠️ {t('quickTest.disclaimer', 'Simulation ≠ prédiction. Exploration uniquement.')}
        </p>
      </div>
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
    <div className="glass-card rounded-xl p-4">
      <h3 className="font-medium text-sm mb-3">{title}</h3>
      <div className={`grid gap-2 ${options.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'}`}>
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onSelect(option.value)}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all ${
              selected === option.value
                ? 'bg-primary/10 border-primary text-primary'
                : 'bg-muted/30 border-border/50 hover:bg-muted/50 hover:border-border'
            }`}
          >
            {option.icon}
            <span className="text-xs font-medium">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
