/**
 * Country Matcher AI - 10-question questionnaire with radar chart
 * Route: /tools/matcher
 *
 * Scoring engine matches user preferences to 51 countries
 * Results: Top 5 with compatibility %, radar chart per criterion
 */
import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { LocalizedLink as Link } from '@/components/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useCountries } from '@/lib/countries-data';
import { SimulationDisclaimer } from '@/components/SimulationDisclaimer';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, ArrowLeft, ArrowRight, Trophy, MapPin, ChevronRight,
  Sun, DollarSign, Languages, Shield, HeartPulse, GraduationCap,
  Scale, Wifi, TreePine, Users
} from 'lucide-react';

// ============================================================
// TYPES
// ============================================================

interface QuizQuestion {
  id: string;
  icon: typeof Sun;
  titleKey: string;
  titleDefault: string;
  descriptionKey: string;
  descriptionDefault: string;
  options: {
    value: string;
    labelKey: string;
    labelDefault: string;
  }[];
  criterion: string;
}

interface MatchResult {
  countryId: string;
  countryName: string;
  iso2: string;
  score: number;
  criteriaScores: Record<string, number>;
}

// ============================================================
// QUIZ QUESTIONS (10)
// ============================================================

const QUESTIONS: QuizQuestion[] = [
  {
    id: 'climate',
    icon: Sun,
    titleKey: 'matcher.q1.title',
    titleDefault: 'Quel climat préférez-vous ?',
    descriptionKey: 'matcher.q1.desc',
    descriptionDefault: 'Le climat influence votre qualité de vie quotidienne.',
    criterion: 'climate',
    options: [
      { value: 'tropical', labelKey: 'matcher.q1.tropical', labelDefault: 'Tropical / Chaud toute l\'année' },
      { value: 'mediterranean', labelKey: 'matcher.q1.mediterranean', labelDefault: 'Méditerranéen / Doux et ensoleillé' },
      { value: 'temperate', labelKey: 'matcher.q1.temperate', labelDefault: 'Tempéré / 4 saisons distinctes' },
      { value: 'any', labelKey: 'matcher.q1.any', labelDefault: 'Peu importe' },
    ],
  },
  {
    id: 'budget',
    icon: DollarSign,
    titleKey: 'matcher.q2.title',
    titleDefault: 'Quel est votre budget mensuel ?',
    descriptionKey: 'matcher.q2.desc',
    descriptionDefault: 'Budget pour une personne seule, hors loyer.',
    criterion: 'budget',
    options: [
      { value: 'low', labelKey: 'matcher.q2.low', labelDefault: 'Moins de 1 000 €/mois' },
      { value: 'medium', labelKey: 'matcher.q2.medium', labelDefault: '1 000 - 2 500 €/mois' },
      { value: 'high', labelKey: 'matcher.q2.high', labelDefault: '2 500 - 5 000 €/mois' },
      { value: 'unlimited', labelKey: 'matcher.q2.unlimited', labelDefault: 'Plus de 5 000 €/mois' },
    ],
  },
  {
    id: 'language',
    icon: Languages,
    titleKey: 'matcher.q3.title',
    titleDefault: 'Quelle(s) langue(s) parlez-vous ?',
    descriptionKey: 'matcher.q3.desc',
    descriptionDefault: 'La langue facilite l\'intégration et les démarches.',
    criterion: 'language',
    options: [
      { value: 'french', labelKey: 'matcher.q3.french', labelDefault: 'Français uniquement' },
      { value: 'english', labelKey: 'matcher.q3.english', labelDefault: 'Français + Anglais' },
      { value: 'multilingual', labelKey: 'matcher.q3.multilingual', labelDefault: 'Polyglotte (3+ langues)' },
      { value: 'willing', labelKey: 'matcher.q3.willing', labelDefault: 'Prêt à apprendre une nouvelle langue' },
    ],
  },
  {
    id: 'safety',
    icon: Shield,
    titleKey: 'matcher.q4.title',
    titleDefault: 'Quelle importance pour la sécurité ?',
    descriptionKey: 'matcher.q4.desc',
    descriptionDefault: 'Stabilité politique, criminalité, sécurité au quotidien.',
    criterion: 'safety',
    options: [
      { value: 'critical', labelKey: 'matcher.q4.critical', labelDefault: 'Priorité absolue' },
      { value: 'important', labelKey: 'matcher.q4.important', labelDefault: 'Très important' },
      { value: 'moderate', labelKey: 'matcher.q4.moderate', labelDefault: 'Modérément important' },
      { value: 'flexible', labelKey: 'matcher.q4.flexible', labelDefault: 'Je m\'adapte' },
    ],
  },
  {
    id: 'healthcare',
    icon: HeartPulse,
    titleKey: 'matcher.q5.title',
    titleDefault: 'Qualité du système de santé ?',
    descriptionKey: 'matcher.q5.desc',
    descriptionDefault: 'Accès aux soins, qualité des hôpitaux, coût.',
    criterion: 'healthcare',
    options: [
      { value: 'excellent', labelKey: 'matcher.q5.excellent', labelDefault: 'Système de santé excellent requis' },
      { value: 'good', labelKey: 'matcher.q5.good', labelDefault: 'Bon système suffisant' },
      { value: 'basic', labelKey: 'matcher.q5.basic', labelDefault: 'Soins de base suffisants' },
      { value: 'flexible', labelKey: 'matcher.q5.flexible', labelDefault: 'J\'ai une assurance privée' },
    ],
  },
  {
    id: 'education',
    icon: GraduationCap,
    titleKey: 'matcher.q6.title',
    titleDefault: 'Importance de l\'éducation ?',
    descriptionKey: 'matcher.q6.desc',
    descriptionDefault: 'Écoles internationales, universités, formation continue.',
    criterion: 'education',
    options: [
      { value: 'critical', labelKey: 'matcher.q6.critical', labelDefault: 'J\'ai des enfants à scolariser' },
      { value: 'important', labelKey: 'matcher.q6.important', labelDefault: 'Important pour ma carrière' },
      { value: 'moderate', labelKey: 'matcher.q6.moderate', labelDefault: 'Pas prioritaire' },
      { value: 'none', labelKey: 'matcher.q6.none', labelDefault: 'Pas concerné' },
    ],
  },
  {
    id: 'fiscal',
    icon: Scale,
    titleKey: 'matcher.q7.title',
    titleDefault: 'Priorité fiscale ?',
    descriptionKey: 'matcher.q7.desc',
    descriptionDefault: 'Optimisation fiscale et charges sociales.',
    criterion: 'fiscal',
    options: [
      { value: 'low_tax', labelKey: 'matcher.q7.lowTax', labelDefault: 'Fiscalité la plus basse possible' },
      { value: 'balanced', labelKey: 'matcher.q7.balanced', labelDefault: 'Équilibre fiscalité / services publics' },
      { value: 'services', labelKey: 'matcher.q7.services', labelDefault: 'Je préfère payer plus pour de bons services' },
      { value: 'flexible', labelKey: 'matcher.q7.flexible', labelDefault: 'Pas ma priorité principale' },
    ],
  },
  {
    id: 'connectivity',
    icon: Wifi,
    titleKey: 'matcher.q8.title',
    titleDefault: 'Besoin de connectivité ?',
    descriptionKey: 'matcher.q8.desc',
    descriptionDefault: 'Internet, coworking, écosystème digital nomade.',
    criterion: 'connectivity',
    options: [
      { value: 'essential', labelKey: 'matcher.q8.essential', labelDefault: 'Essentiel — je travaille en remote' },
      { value: 'important', labelKey: 'matcher.q8.important', labelDefault: 'Important pour le quotidien' },
      { value: 'moderate', labelKey: 'matcher.q8.moderate', labelDefault: 'Accès basique suffisant' },
      { value: 'minimal', labelKey: 'matcher.q8.minimal', labelDefault: 'Je cherche à déconnecter' },
    ],
  },
  {
    id: 'nature',
    icon: TreePine,
    titleKey: 'matcher.q9.title',
    titleDefault: 'Environnement naturel ?',
    descriptionKey: 'matcher.q9.desc',
    descriptionDefault: 'Accès à la nature, qualité de l\'air, espaces verts.',
    criterion: 'nature',
    options: [
      { value: 'essential', labelKey: 'matcher.q9.essential', labelDefault: 'Nature et grands espaces essentiels' },
      { value: 'important', labelKey: 'matcher.q9.important', labelDefault: 'J\'aime avoir la nature accessible' },
      { value: 'urban', labelKey: 'matcher.q9.urban', labelDefault: 'Je préfère la ville' },
      { value: 'flexible', labelKey: 'matcher.q9.flexible', labelDefault: 'Peu importe' },
    ],
  },
  {
    id: 'community',
    icon: Users,
    titleKey: 'matcher.q10.title',
    titleDefault: 'Communauté expatriée ?',
    descriptionKey: 'matcher.q10.desc',
    descriptionDefault: 'Présence de francophones, communauté internationale.',
    criterion: 'community',
    options: [
      { value: 'essential', labelKey: 'matcher.q10.essential', labelDefault: 'Grande communauté francophone requise' },
      { value: 'international', labelKey: 'matcher.q10.international', labelDefault: 'Communauté internationale suffit' },
      { value: 'local', labelKey: 'matcher.q10.local', labelDefault: 'Je préfère m\'intégrer localement' },
      { value: 'flexible', labelKey: 'matcher.q10.flexible', labelDefault: 'Pas important' },
    ],
  },
];

// ============================================================
// COUNTRY SCORING DATA (realistic mock based on country attributes)
// ============================================================

const COUNTRY_CLIMATE_MAP: Record<string, string> = {
  cameroon: 'tropical', france: 'temperate', usa: 'temperate', canada: 'temperate',
  germany: 'temperate', switzerland: 'temperate', netherlands: 'temperate',
  portugal: 'mediterranean', spain: 'mediterranean', greece: 'mediterranean',
  italy: 'mediterranean', turkey: 'mediterranean', morocco: 'mediterranean',
  japan: 'temperate', singapore: 'tropical', uae: 'tropical',
  qatar: 'tropical', australia: 'mediterranean', brazil: 'tropical',
  argentina: 'temperate', chile: 'temperate', colombia: 'tropical',
  'costa-rica': 'tropical', ecuador: 'tropical', peru: 'tropical',
  panama: 'tropical', mexico: 'tropical', india: 'tropical',
  vietnam: 'tropical', cambodia: 'tropical', laos: 'tropical',
  myanmar: 'tropical', 'sri-lanka': 'tropical', nepal: 'tropical',
  philippines: 'tropical', indonesia: 'tropical', malaysia: 'tropical',
  mauritius: 'tropical', kenya: 'tropical', ghana: 'tropical',
  nigeria: 'tropical', tanzania: 'tropical', rwanda: 'tropical',
  egypt: 'mediterranean', saudi: 'tropical', south_korea: 'temperate',
  norway: 'temperate', ireland: 'temperate', poland: 'temperate',
  russia: 'temperate', new_zealand: 'temperate', venezuela: 'tropical',
  'saudi-arabia': 'tropical',
};

const FRENCH_SPEAKING: string[] = [
  'france', 'cameroon', 'morocco', 'switzerland', 'canada', 'mauritius', 'rwanda',
];

const ENGLISH_SPEAKING: string[] = [
  'usa', 'canada', 'australia', 'new_zealand', 'ireland', 'singapore',
  'india', 'philippines', 'kenya', 'ghana', 'nigeria', 'tanzania', 'rwanda',
  'south_korea', 'uae', 'qatar', 'malaysia',
];

// ============================================================
// SCORING ENGINE
// ============================================================

function scoreCountry(
  answers: Record<string, string>,
  country: { id: string; costOfLiving: { index: number }; qualityOfLife: { safetyIndex: number; healthcareRank: number; educationIndex: number; internetSpeed: number; environmentIndex: number }; snapshot: { freedomIndex: number } }
): { total: number; criteria: Record<string, number> } {
  const criteria: Record<string, number> = {};
  let totalWeight = 0;
  let totalScore = 0;

  // Climate (weight: 15)
  const climate = answers.climate;
  const countryClimate = COUNTRY_CLIMATE_MAP[country.id] || 'temperate';
  if (climate === 'any') {
    criteria.climate = 80;
  } else if (climate === countryClimate) {
    criteria.climate = 100;
  } else if ((climate === 'mediterranean' && countryClimate === 'tropical') || (climate === 'tropical' && countryClimate === 'mediterranean')) {
    criteria.climate = 60;
  } else {
    criteria.climate = 30;
  }
  totalScore += criteria.climate * 15;
  totalWeight += 15;

  // Budget (weight: 15)
  const budget = answers.budget;
  const colIndex = country.costOfLiving.index;
  if (budget === 'low') {
    criteria.budget = colIndex <= 35 ? 100 : colIndex <= 50 ? 60 : colIndex <= 70 ? 30 : 10;
  } else if (budget === 'medium') {
    criteria.budget = colIndex <= 55 ? 100 : colIndex <= 75 ? 70 : 40;
  } else if (budget === 'high') {
    criteria.budget = colIndex <= 80 ? 100 : 70;
  } else {
    criteria.budget = 90;
  }
  totalScore += criteria.budget * 15;
  totalWeight += 15;

  // Language (weight: 10)
  const lang = answers.language;
  const isFrench = FRENCH_SPEAKING.includes(country.id);
  const isEnglish = ENGLISH_SPEAKING.includes(country.id);
  if (lang === 'french') {
    criteria.language = isFrench ? 100 : isEnglish ? 30 : 10;
  } else if (lang === 'english') {
    criteria.language = (isFrench || isEnglish) ? 100 : 40;
  } else if (lang === 'multilingual') {
    criteria.language = 80;
  } else {
    criteria.language = 70;
  }
  totalScore += criteria.language * 10;
  totalWeight += 10;

  // Safety (weight: 12)
  const safety = answers.safety;
  const safetyScore = country.qualityOfLife.safetyIndex;
  if (safety === 'critical') {
    criteria.safety = safetyScore >= 80 ? 100 : safetyScore >= 60 ? 60 : safetyScore >= 40 ? 30 : 10;
  } else if (safety === 'important') {
    criteria.safety = safetyScore >= 60 ? 100 : safetyScore >= 40 ? 60 : 30;
  } else if (safety === 'moderate') {
    criteria.safety = safetyScore >= 40 ? 90 : 50;
  } else {
    criteria.safety = 70;
  }
  totalScore += criteria.safety * 12;
  totalWeight += 12;

  // Healthcare (weight: 10)
  const hc = answers.healthcare;
  const hcRank = country.qualityOfLife.healthcareRank;
  if (hc === 'excellent') {
    criteria.healthcare = hcRank <= 20 ? 100 : hcRank <= 40 ? 70 : hcRank <= 80 ? 40 : 15;
  } else if (hc === 'good') {
    criteria.healthcare = hcRank <= 50 ? 100 : hcRank <= 100 ? 60 : 30;
  } else if (hc === 'basic') {
    criteria.healthcare = hcRank <= 120 ? 90 : 50;
  } else {
    criteria.healthcare = 75;
  }
  totalScore += criteria.healthcare * 10;
  totalWeight += 10;

  // Education (weight: 8)
  const edu = answers.education;
  const eduIndex = country.qualityOfLife.educationIndex;
  if (edu === 'critical') {
    criteria.education = eduIndex >= 0.8 ? 100 : eduIndex >= 0.6 ? 60 : 25;
  } else if (edu === 'important') {
    criteria.education = eduIndex >= 0.6 ? 100 : eduIndex >= 0.4 ? 60 : 30;
  } else if (edu === 'moderate') {
    criteria.education = 70;
  } else {
    criteria.education = 80;
  }
  totalScore += criteria.education * 8;
  totalWeight += 8;

  // Fiscal (weight: 12)
  const fiscal = answers.fiscal;
  const freedomIdx = country.snapshot.freedomIndex;
  const colIdx = country.costOfLiving.index;
  if (fiscal === 'low_tax') {
    // Low CoL + high freedom = likely low tax
    const taxScore = (100 - colIdx) * 0.5 + freedomIdx * 0.5;
    criteria.fiscal = Math.min(100, Math.round(taxScore));
  } else if (fiscal === 'balanced') {
    criteria.fiscal = Math.min(100, Math.round(freedomIdx * 0.7 + (100 - colIdx) * 0.3));
  } else if (fiscal === 'services') {
    // Higher CoL usually means better services
    criteria.fiscal = Math.min(100, Math.round(colIdx * 0.6 + freedomIdx * 0.4));
  } else {
    criteria.fiscal = 70;
  }
  totalScore += criteria.fiscal * 12;
  totalWeight += 12;

  // Connectivity (weight: 8)
  const conn = answers.connectivity;
  const netSpeed = country.qualityOfLife.internetSpeed;
  if (conn === 'essential') {
    criteria.connectivity = netSpeed >= 100 ? 100 : netSpeed >= 50 ? 70 : netSpeed >= 25 ? 40 : 15;
  } else if (conn === 'important') {
    criteria.connectivity = netSpeed >= 50 ? 100 : netSpeed >= 20 ? 70 : 40;
  } else if (conn === 'moderate') {
    criteria.connectivity = netSpeed >= 10 ? 80 : 50;
  } else {
    criteria.connectivity = 80;
  }
  totalScore += criteria.connectivity * 8;
  totalWeight += 8;

  // Nature / Environment (weight: 5)
  const nature = answers.nature;
  const envIndex = country.qualityOfLife.environmentIndex;
  if (nature === 'essential') {
    criteria.nature = envIndex >= 70 ? 100 : envIndex >= 50 ? 60 : 30;
  } else if (nature === 'important') {
    criteria.nature = envIndex >= 50 ? 90 : 50;
  } else if (nature === 'urban') {
    // Urban preference: higher CoL often means more urbanized
    criteria.nature = colIdx >= 50 ? 80 : 60;
  } else {
    criteria.nature = 75;
  }
  totalScore += criteria.nature * 5;
  totalWeight += 5;

  // Community (weight: 5)
  const community = answers.community;
  if (community === 'essential') {
    criteria.community = FRENCH_SPEAKING.includes(country.id) ? 100 : 20;
  } else if (community === 'international') {
    criteria.community = (ENGLISH_SPEAKING.includes(country.id) || FRENCH_SPEAKING.includes(country.id)) ? 90 : 50;
  } else if (community === 'local') {
    criteria.community = 80;
  } else {
    criteria.community = 75;
  }
  totalScore += criteria.community * 5;
  totalWeight += 5;

  const total = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
  return { total, criteria };
}

// ============================================================
// FLAG HELPER
// ============================================================

function getFlagEmoji(iso2: string): string {
  if (!iso2 || iso2.length !== 2) return '🏳️';
  const codePoints = iso2.toUpperCase().split('').map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

// ============================================================
// RADAR CHART CRITERIA LABELS
// ============================================================

const CRITERIA_LABELS: Record<string, { key: string; default: string }> = {
  climate: { key: 'matcher.criteria.climate', default: 'Climat' },
  budget: { key: 'matcher.criteria.budget', default: 'Budget' },
  language: { key: 'matcher.criteria.language', default: 'Langue' },
  safety: { key: 'matcher.criteria.safety', default: 'Sécurité' },
  healthcare: { key: 'matcher.criteria.healthcare', default: 'Santé' },
  education: { key: 'matcher.criteria.education', default: 'Éducation' },
  fiscal: { key: 'matcher.criteria.fiscal', default: 'Fiscalité' },
  connectivity: { key: 'matcher.criteria.connectivity', default: 'Connectivité' },
  nature: { key: 'matcher.criteria.nature', default: 'Nature' },
  community: { key: 'matcher.criteria.community', default: 'Communauté' },
};

// ============================================================
// COMPONENT
// ============================================================

export default function CountryMatcherPage() {
  const { t } = useTranslation();
  const { countries } = useCountries();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [selectedResult, setSelectedResult] = useState<number>(0);

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (showResults) {
      setShowResults(false);
    } else if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setCurrentQuestion(0);
    setShowResults(false);
    setSelectedResult(0);
  };

  // Calculate results
  const results: MatchResult[] = useMemo(() => {
    if (!showResults || Object.keys(answers).length < QUESTIONS.length) return [];

    const scored = countries.map(country => {
      const { total, criteria } = scoreCountry(answers, country);
      return {
        countryId: country.id,
        countryName: country.name,
        iso2: country.iso2,
        score: total,
        criteriaScores: criteria,
      };
    });

    return scored.sort((a, b) => b.score - a.score).slice(0, 5);
  }, [showResults, answers, countries]);

  // Radar chart data for selected result
  const radarData = useMemo(() => {
    if (results.length === 0) return [];
    const result = results[selectedResult] || results[0];
    return Object.entries(result.criteriaScores).map(([key, value]) => ({
      criterion: t(CRITERIA_LABELS[key]?.key, CRITERIA_LABELS[key]?.default || key),
      value,
      fullMark: 100,
    }));
  }, [results, selectedResult, t]);

  const currentQ = QUESTIONS[currentQuestion];
  const isAnswered = currentQ && answers[currentQ.id];
  const progress = showResults ? 100 : ((currentQuestion + (isAnswered ? 1 : 0)) / QUESTIONS.length) * 100;

  return (
    <div className="container max-w-3xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="p-4 rounded-full bg-primary/10">
            <Globe className="w-8 h-8 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-2">
          {t('matcher.headline', 'Matcher Pays IA')}
        </h1>
        <p className="text-muted-foreground">
          {t('matcher.subheadline', 'Répondez à 10 questions pour trouver votre destination idéale')}
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
          <span>
            {showResults
              ? t('matcher.resultsReady', 'Résultats')
              : t('matcher.questionOf', `Question ${currentQuestion + 1} / ${QUESTIONS.length}`)
            }
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <AnimatePresence mode="wait">
        {!showResults ? (
          /* Question Card */
          <motion.div
            key={`q-${currentQuestion}`}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="glass-card">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  {currentQ && <currentQ.icon className="w-6 h-6 text-primary" />}
                  <Badge variant="outline">
                    {currentQuestion + 1}/{QUESTIONS.length}
                  </Badge>
                </div>
                <CardTitle className="text-xl">
                  {currentQ && t(currentQ.titleKey, currentQ.titleDefault)}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {currentQ && t(currentQ.descriptionKey, currentQ.descriptionDefault)}
                </p>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={answers[currentQ?.id] || ''}
                  onValueChange={(value) => currentQ && handleAnswer(currentQ.id, value)}
                  className="space-y-3"
                >
                  {currentQ?.options.map((option) => (
                    <div
                      key={option.value}
                      className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors cursor-pointer ${
                        answers[currentQ.id] === option.value
                          ? 'bg-primary/10 border-primary/50'
                          : 'hover:bg-accent/50 border-border'
                      }`}
                      onClick={() => handleAnswer(currentQ.id, option.value)}
                    >
                      <RadioGroupItem value={option.value} id={`${currentQ.id}-${option.value}`} />
                      <Label htmlFor={`${currentQ.id}-${option.value}`} className="cursor-pointer flex-1">
                        {t(option.labelKey, option.labelDefault)}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                <div className="flex justify-between mt-8">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t('matcher.previous', 'Précédent')}
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={!isAnswered}
                  >
                    {currentQuestion === QUESTIONS.length - 1
                      ? t('matcher.seeResults', 'Voir les résultats')
                      : t('matcher.next', 'Suivant')
                    }
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          /* Results */
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Top 5 Ranking */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  {t('matcher.results.title', 'Votre top 5 destinations')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {results.map((result, index) => (
                  <motion.div
                    key={result.countryId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-colors ${
                      selectedResult === index
                        ? 'bg-primary/10 border border-primary/30'
                        : 'hover:bg-accent/50 border border-transparent'
                    }`}
                    onClick={() => setSelectedResult(index)}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      index === 0 ? 'bg-yellow-500/20 text-yellow-600' :
                      index === 1 ? 'bg-gray-300/20 text-gray-600' :
                      index === 2 ? 'bg-orange-500/20 text-orange-600' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {index + 1}
                    </div>

                    <span className="text-3xl">{getFlagEmoji(result.iso2)}</span>

                    <div className="flex-1">
                      <h4 className="font-semibold">{result.countryName}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={result.score} className="h-2 flex-1 max-w-[200px]" />
                        <span className="text-sm font-bold text-primary">{result.score}%</span>
                      </div>
                    </div>

                    <Link to={`/country/${result.countryId}`}>
                      <Button variant="ghost" size="sm">
                        <MapPin className="w-4 h-4 mr-1" />
                        {t('matcher.results.viewCountry', 'Voir')}
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Radar Chart */}
            {results.length > 0 && (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {getFlagEmoji(results[selectedResult]?.iso2 || '')} {results[selectedResult]?.countryName} — {t('matcher.results.radarTitle', 'Analyse par critère')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis
                        dataKey="criterion"
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} />
                      <Radar
                        name={results[selectedResult]?.countryName}
                        dataKey="value"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.3}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        formatter={(value: number) => [`${value}%`, 'Score']}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" onClick={handlePrevious}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('matcher.results.modifyAnswers', 'Modifier mes réponses')}
              </Button>
              <Button variant="outline" onClick={handleReset}>
                {t('matcher.results.restart', 'Recommencer')}
              </Button>
              <Link to="/compare" className="flex-1">
                <Button className="w-full">
                  {t('matcher.results.compareCountries', 'Comparer ces pays')}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Disclaimer */}
            <SimulationDisclaimer variant="contextual" context="results" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
