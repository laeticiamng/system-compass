import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Key, Compass, Target, Zap, 
  ChevronRight, MapPin, Heart, Shield,
  AlertTriangle, CheckCircle, Save, RefreshCw,
  Filter, Clock, Scale, Flag, Globe, Plane, Map,
  GraduationCap, Briefcase, Sparkles, Check
} from 'lucide-react';
import { usePyramidTranslations } from '@/hooks/usePyramidTranslations';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useCountries } from '@/lib/countries-data';
import { PyramidType, PYRAMID_TYPE_INFO, LifeMotorProfile, LifePriority, LIFE_MOTOR_PROFILES, type Country } from '@/lib/types';
import { findCompatibleKeys, UserContext, STRATEGIC_PRINCIPLES } from '@/lib/exit-keys-engine';
import { getNationalityAdvantages, getPassportStrengthLabel, REGIONAL_BLOCS, getRecommendedDestinations, DestinationRecommendation } from '@/lib/nationality-advantages';
import { EDUCATION_LEVELS, PROFESSIONS, PROFESSION_CATEGORY_LABELS, getProfession, type EducationLevel, type ProfessionCategory } from '@/lib/profession-data';
import ExitKeyCard from '@/components/ExitKeyCard';
import { cn } from '@/lib/utils';
import { useExitKeysProfile } from '@/hooks/useExitKeysProfile';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/useAnalytics';
import { DestinationMap } from '@/components/DestinationMap';
import { DestinationCompare } from '@/components/DestinationCompare';
import { VacationRecommendations } from '@/components/exit-keys/VacationRecommendations';
import { RiskContextsSection } from '@/components/exit-keys/RiskContextsSection';
import { RiskPrevention } from '@/components/RiskPrevention';
import { SalaryCalculator } from '@/components/SalaryCalculator';
import { JourneyProgressBar, getJourneyPhase } from '@/components/JourneyProgressBar';
import { SimulationDisclaimer } from '@/components/SimulationDisclaimer';
import { AiHelpButton } from '@/components/ai/AiHelpButton';
import { AiAction, AiContext } from '@/components/ai/AiSidePanel';

const STEPS = ['origin', 'current', 'profile', 'goals', 'results'] as const;
type Step = typeof STEPS[number];

const priorityOptions: { value: LifePriority; labelKey: string; icon: string }[] = [
  { value: 'freedom', labelKey: 'exitKeys.priorities.freedom', icon: '🦅' },
  { value: 'money', labelKey: 'exitKeys.priorities.money', icon: '💰' },
  { value: 'meaning', labelKey: 'exitKeys.priorities.meaning', icon: '💫' },
  { value: 'status', labelKey: 'exitKeys.priorities.status', icon: '👔' },
  { value: 'family', labelKey: 'exitKeys.priorities.family', icon: '👨‍👩‍👧' },
  { value: 'calm', labelKey: 'exitKeys.priorities.calm', icon: '🧘' },
];

const riskOptions = [
  { value: 'low', labelKey: 'exitKeys.risk.prudent', descKey: 'exitKeys.risk.prudentDesc' },
  { value: 'medium', labelKey: 'exitKeys.risk.balanced', descKey: 'exitKeys.risk.balancedDesc' },
  { value: 'high', labelKey: 'exitKeys.risk.bold', descKey: 'exitKeys.risk.boldDesc' },
];

const timeOptions = [
  { value: 'short', labelKey: 'exitKeys.time.short', descKey: 'exitKeys.time.shortDesc' },
  { value: 'medium', labelKey: 'exitKeys.time.medium', descKey: 'exitKeys.time.mediumDesc' },
  { value: 'long', labelKey: 'exitKeys.time.long', descKey: 'exitKeys.time.longDesc' },
];

export default function ExitKeys() {
  const { t } = useTranslation();
  const { getPyramidLabel } = usePyramidTranslations();
  const { user } = useAuth();
  const { profile: savedProfile, saveProfile, loading: profileLoading } = useExitKeysProfile();
  const { countries } = useCountries();
  const [currentStep, setCurrentStep] = useState<Step>('origin');
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Filters
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [durationFilter, setDurationFilter] = useState<string>('all');
  
  // User inputs
  const [birthCountryId, setBirthCountryId] = useState<string>('');
  const [nationalityIds, setNationalityIds] = useState<string[]>([]);
  const [currentCountryId, setCurrentCountryId] = useState<string>('');
  const [motorProfile, setMotorProfile] = useState<LifeMotorProfile>('BUILDER');
  const [desiredLife, setDesiredLife] = useState<LifePriority>('freedom');
  const [riskTolerance, setRiskTolerance] = useState<'low' | 'medium' | 'high'>('medium');
  const [timeHorizon, setTimeHorizon] = useState<'short' | 'medium' | 'long'>('medium');
  const [hasCapital, setHasCapital] = useState(false);
  const [hasCredentials, setHasCredentials] = useState(false);
  const [hasNetwork, setHasNetwork] = useState(false);
  const [isLGBTQ, setIsLGBTQ] = useState(false);
  const [hasFamily, setHasFamily] = useState(false);
  const [educationLevel, setEducationLevel] = useState<EducationLevel | undefined>();
  const [professionId, setProfessionId] = useState<string | undefined>();

  // Load saved profile on mount
  useEffect(() => {
    if (savedProfile && !profileLoading) {
      setBirthCountryId(savedProfile.birthCountryId);
      // Handle migration from old nationalityId to new nationalityIds
      const savedNationalities = savedProfile.nationalityIds || 
        (savedProfile as any).nationalityId ? [(savedProfile as any).nationalityId] : 
        [savedProfile.birthCountryId];
      setNationalityIds(savedNationalities.filter(Boolean));
      setCurrentCountryId(savedProfile.currentCountryId);
      setMotorProfile(savedProfile.motorProfile);
      setDesiredLife(savedProfile.desiredLife);
      setRiskTolerance(savedProfile.riskTolerance);
      setTimeHorizon(savedProfile.timeHorizon);
      setHasCapital(savedProfile.hasCapital);
      setHasCredentials(savedProfile.hasCredentials);
      setHasNetwork(savedProfile.hasNetwork);
      setIsLGBTQ(savedProfile.isLGBTQ);
      setHasFamily(savedProfile.hasFamily);
      setEducationLevel(savedProfile.educationLevel);
      setProfessionId(savedProfile.professionId);
      // If profile is complete, go to results
      if (savedProfile.birthCountryId && savedProfile.currentCountryId) {
        setCurrentStep('results');
      }
    }
  }, [savedProfile, profileLoading]);

  // Save profile when reaching results
  const handleSaveProfile = () => {
    saveProfile({
      birthCountryId,
      nationalityIds,
      currentCountryId,
      motorProfile,
      desiredLife,
      riskTolerance,
      timeHorizon,
      hasCapital,
      hasCredentials,
      hasNetwork,
      isLGBTQ,
      hasFamily,
      educationLevel,
      professionId,
    });
  };

  // Derived data
  const birthCountry = countries.find(c => c.id === birthCountryId);
  const nationalityCountries = nationalityIds
    .map(id => countries.find(c => c.id === id))
    .filter(Boolean) as Country[];
  const currentCountry = countries.find(c => c.id === currentCountryId);

  const userContext: UserContext | null = useMemo(() => {
    if (!currentCountry) return null;
    const nationalities = nationalityCountries.length > 0 
      ? nationalityCountries.map(c => c.pyramidType)
      : [birthCountry?.pyramidType || currentCountry.pyramidType];
    return {
      birthCountry: birthCountry?.pyramidType || currentCountry.pyramidType,
      nationalities,
      currentCountry: currentCountry.pyramidType,
      desiredLife,
      motorProfile,
      riskTolerance,
      timeHorizon,
      hasCapital,
      hasCredentials,
      hasNetwork,
      isLGBTQ,
      hasFamily,
    };
  }, [birthCountry, nationalityCountries, currentCountry, desiredLife, motorProfile, riskTolerance, timeHorizon, hasCapital, hasCredentials, hasNetwork, isLGBTQ, hasFamily]);

  const exitKeyResults = useMemo(() => {
    if (!userContext) return [];
    let results = findCompatibleKeys(userContext);
    
    // Filter by profession compatibility
    if (professionId) {
      const profession = getProfession(professionId);
      if (profession && profession.compatibleExitKeys.length > 0) {
        results = results.filter(r => 
          profession.compatibleExitKeys.includes(r.key.id)
        );
      }
    }
    
    return results;
  }, [userContext, professionId]);

  // Nationality advantages
  const nationalityAdvantages = useMemo(() => {
    return getNationalityAdvantages(nationalityIds);
  }, [nationalityIds]);

  // Destination recommendations based on nationalities + aspiration
  const destinationRecommendations = useMemo(() => {
    return getRecommendedDestinations(nationalityIds, desiredLife, currentCountryId);
  }, [nationalityIds, desiredLife, currentCountryId]);

  // Filtered results
  const filteredResults = useMemo(() => {
    return exitKeyResults.filter(result => {
      // Difficulty filter
      if (difficultyFilter !== 'all' && result.key.difficulty !== difficultyFilter) {
        return false;
      }
      
      // Duration filter
      if (durationFilter !== 'all') {
        const timeMatch = result.key.timeframe.match(/(\d+)-?(\d+)?/);
        const maxYears = timeMatch ? parseInt(timeMatch[2] || timeMatch[1]) : 5;
        
        if (durationFilter === 'short' && maxYears > 3) return false;
        if (durationFilter === 'medium' && (maxYears <= 3 || maxYears > 7)) return false;
        if (durationFilter === 'long' && maxYears <= 7) return false;
      }
      
      return true;
    });
  }, [exitKeyResults, difficultyFilter, durationFilter]);

  const stepIndex = STEPS.indexOf(currentStep);
  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  const canProceed = () => {
    switch (currentStep) {
      case 'origin': return !!birthCountryId && nationalityIds.length > 0;
      case 'current': return !!currentCountryId;
      case 'profile': return true;
      case 'goals': return true;
      default: return false;
    }
  };

  const nextStep = () => {
    const nextIndex = stepIndex + 1;
    if (nextIndex < STEPS.length) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(STEPS[nextIndex]);
        setIsTransitioning(false);
        // Auto-save when reaching results
        if (STEPS[nextIndex] === 'results') {
          handleSaveProfile();
        }
      }, 200);
    }
  };

  const prevStep = () => {
    const prevIndex = stepIndex - 1;
    if (prevIndex >= 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(STEPS[prevIndex]);
        setIsTransitioning(false);
      }, 200);
    }
  };

  const getFlagEmoji = (iso2: string) => {
    return iso2
      .toUpperCase()
      .split('')
      .map(char => String.fromCodePoint(127397 + char.charCodeAt(0)))
      .join('');
  };

  return (
    <main className="min-h-screen bg-background pt-24 pb-16">
      {/* Animated Background Gradient */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-radial from-primary/5 via-transparent to-transparent animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-radial from-amber-500/5 via-transparent to-transparent animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
      </div>

      {/* Sticky Journey Progress Bar */}
      <div className="sticky top-16 z-40 bg-background/80 backdrop-blur-xl border-b border-border/30 py-4 mb-8 shadow-sm">
        <div className="container mx-auto px-4 max-w-5xl">
          <JourneyProgressBar currentPhase={getJourneyPhase(currentStep)} />
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-5xl">
        {/* Hero Header */}
        <div className="mb-10">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            {t('common.back', 'Retour')}
          </Link>
          
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-background to-amber-500/10 border border-primary/20 p-8 mb-8">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-radial from-primary/20 to-transparent blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-radial from-amber-500/20 to-transparent blur-3xl" />
            
            <div className="relative flex flex-col md:flex-row items-start gap-6">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
                <Key className="w-10 h-10 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h1 className="font-display text-3xl md:text-5xl font-bold bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent mb-3">
                  {t('exitKeys.title', 'Trouvez Votre Clé de Sortie')}
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl">
                  {t('exitKeys.subtitle', 'Simulez et analysez les stratégies adaptées à votre situation')}
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-sm font-medium">
                    <Sparkles className="w-4 h-4" />
                    {t('exitKeys.badge.personalized', 'Analyse personnalisée')}
                  </span>
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-500 text-sm font-medium">
                    <Globe className="w-4 h-4" />
                    {t('exitKeys.badge.global', '190+ pays analysés')}
                  </span>
                </div>
              </div>
              {currentStep === 'results' && userContext && (
                <AiHelpButton
                  title={t('ai.exitKeysAssistant', 'Assistant Clés de Sortie')}
                  actions={[
                    { id: 'clarify_objective', label: t('ai.actions.clarifyObjective', 'Clarifier mon objectif'), description: t('ai.actions.clarifyObjectiveDesc', 'Reformuler votre objectif en version claire avec critères implicites') },
                    { id: 'suggest_trajectories', label: t('ai.actions.suggestTrajectories', 'Proposer 3 trajectoires'), description: t('ai.actions.suggestTrajectoriesDesc', 'Générer trois options structurées avec avantages/risques/coûts') },
                    { id: 'execution_checklist', label: t('ai.actions.executionChecklist', 'Check-list d\'exécution'), description: t('ai.actions.executionChecklistDesc', 'Convertir une trajectoire en étapes concrètes ordonnées') },
                    { id: 'exportable_summary', label: t('ai.actions.exportableSummary', 'Synthèse exportable'), description: t('ai.actions.exportableSummaryDesc', 'Produire une synthèse courte basée sur vos données') },
                  ]}
                  context={{
                    module: 'exit-keys',
                    profile: {
                      birthCountry: birthCountry?.name,
                      nationalities: nationalityCountries.map(c => c.name),
                      currentCountry: currentCountry?.name,
                      motorProfile: motorProfile,
                      desiredLife: desiredLife,
                      riskTolerance: riskTolerance,
                      timeHorizon: timeHorizon,
                      hasCapital,
                      hasCredentials,
                      hasNetwork,
                      isLGBTQ,
                      hasFamily,
                      educationLevel,
                      professionId,
                    },
                    trajectory: {
                      topResults: filteredResults.slice(0, 5).map(r => ({ name: r.key.name, compatibility: r.compatibility })),
                    },
                  }}
                  variant="secondary"
                  size="default"
                />
              )}
            </div>
            <SimulationDisclaimer variant="compact" className="mt-6" />
          </div>

          {/* Philosophy Banner */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-500/5 via-primary/5 to-emerald-500/5 border border-border/50 p-5 mb-6">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS1vcGFjaXR5PSIuMDUiLz48L2c+PC9zdmc+')] opacity-50" />
            <div className="relative flex items-center gap-4">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Shield className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">{t('exitKeys.reminder', 'Rappel')} :</strong> {t('exitKeys.lucidityMessage', 'Pyramid Compass structure la lucidité. Si l\'analyse révèle que votre option est trop risquée ou irréaliste, nous vous aiderons à explorer des alternatives : rester et entreprendre, migrer autrement, se former d\'abord, ou changer d\'objectif.')}
              </p>
            </div>
          </div>

          {/* Step progress indicator */}
          {currentStep !== 'results' && (
            <div className="p-4 rounded-xl bg-card/50 backdrop-blur border border-border/50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-foreground">
                  {t('exitKeys.steps.substep', 'Sous-étape')} {stepIndex + 1} {t('exitKeys.steps.of', 'sur')} {STEPS.length - 1}
                </span>
                <span className="text-sm font-bold text-primary">{Math.round(progress)}%</span>
              </div>
              <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Step Content */}
        <div className={cn(
          "min-h-[400px] transition-all duration-300",
          isTransitioning && "opacity-50 translate-y-2"
        )}>
          {/* Step 1: Origin Country */}
          {currentStep === 'origin' && (
            <div className="space-y-8 animate-fade-in">
              {/* Birth Country */}
              <div className="space-y-4">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 mb-6">
                    <MapPin className="w-10 h-10 text-primary" />
                  </div>
                  <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    {t('exitKeys.origin.title', "D'où venez-vous ?")}
                  </h2>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    {t('exitKeys.origin.subtitle', 'Votre pays de naissance influence votre point de départ dans le système')}
                  </p>
                </div>

                <div className="relative">
                  <Label className="text-sm font-medium flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-primary" />
                    {t('exitKeys.origin.birthCountry', 'Pays de naissance')}
                  </Label>
                  <Select value={birthCountryId} onValueChange={(v) => {
                    setBirthCountryId(v);
                    if (nationalityIds.length === 0) setNationalityIds([v]);
                  }}>
                    <SelectTrigger className="w-full h-16 text-lg bg-card/50 backdrop-blur border-2 border-border hover:border-primary/50 transition-colors rounded-xl">
                      <SelectValue placeholder={t('exitKeys.origin.selectBirthCountry', 'Sélectionnez votre pays de naissance')} />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {countries.map(country => (
                        <SelectItem key={country.id} value={country.id}>
                          <span className="flex items-center gap-3">
                            <span className="text-xl">{getFlagEmoji(country.iso2)}</span>
                            <span>{country.name}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              {getPyramidLabel(country.pyramidType)}
                            </span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Nationalities - Multi-select */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Flag className="w-5 h-5 text-primary" />
                  <Label className="text-sm font-medium">{t('exitKeys.origin.nationality', 'Nationalité(s)')}</Label>
                  <span className="text-xs text-muted-foreground">{t('exitKeys.origin.multiNationalitySupported', '(multi-nationalité supportée)')}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('exitKeys.origin.nationalityExplain', 'Vos nationalités déterminent les visas et opportunités accessibles')}
                </p>
                
                {/* Selected nationalities */}
                {nationalityIds.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {nationalityIds.map(natId => {
                      const natCountry = countries.find(c => c.id === natId);
                      if (!natCountry) return null;
                      return (
                        <div 
                          key={natId}
                          className="flex items-center gap-2 px-3 py-2 bg-primary/10 border border-primary/20 rounded-lg"
                        >
                          <span className="text-lg">{getFlagEmoji(natCountry.iso2)}</span>
                          <span className="text-sm font-medium">{natCountry.name}</span>
                          <button
                            onClick={() => setNationalityIds(nationalityIds.filter(id => id !== natId))}
                            className="ml-1 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Add nationality */}
                <Select 
                  value="" 
                  onValueChange={(v) => {
                    if (v && !nationalityIds.includes(v)) {
                      setNationalityIds([...nationalityIds, v]);
                    }
                  }}
                >
                  <SelectTrigger className="w-full h-14 text-lg">
                    <SelectValue placeholder={nationalityIds.length > 0 ? t('exitKeys.origin.addNationality', 'Ajouter une autre nationalité') : t('exitKeys.origin.selectNationality', 'Sélectionnez votre nationalité')} />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {countries.filter(c => !nationalityIds.includes(c.id)).map(country => (
                      <SelectItem key={country.id} value={country.id}>
                        <span className="flex items-center gap-3">
                          <span className="text-xl">{getFlagEmoji(country.iso2)}</span>
                          <span>{country.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {birthCountryId && !nationalityIds.includes(birthCountryId) && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setNationalityIds([...nationalityIds, birthCountryId])}
                  >
                    Ajouter nationalité du pays de naissance
                  </Button>
                )}
              </div>

              {/* Country Info Cards */}
              {(birthCountry || nationalityCountries.length > 0) && (
                <div className="space-y-4">
                  {birthCountry && (
                    <div className="glass-card rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Pays de naissance</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getFlagEmoji(birthCountry.iso2)}</span>
                        <div>
                          <h3 className="font-bold">{birthCountry.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {PYRAMID_TYPE_INFO[birthCountry.pyramidType].label}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {nationalityCountries.length > 0 && nationalityCountries.some(nc => nc.id !== birthCountryId) && (
                    <div className="glass-card rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Flag className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Nationalité(s)</span>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {nationalityCountries.filter(nc => nc.id !== birthCountryId).map(nc => (
                          <div key={nc.id} className="flex items-center gap-2">
                            <span className="text-xl">{getFlagEmoji(nc.iso2)}</span>
                            <span className="text-sm font-medium">{nc.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Current Country */}
          {currentStep === 'current' && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/20 mb-6">
                  <Compass className="w-10 h-10 text-blue-500" />
                </div>
                <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  {t('exitKeys.current.title', 'Où êtes-vous maintenant ?')}
                </h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {t('exitKeys.current.subtitle', 'Votre pays actuel détermine les contraintes et opportunités disponibles')}
                </p>
              </div>

              <div className="space-y-4">
                <Select value={currentCountryId} onValueChange={setCurrentCountryId}>
                  <SelectTrigger className="w-full h-16 text-lg bg-card/50 backdrop-blur border-2 border-border hover:border-blue-500/50 transition-colors rounded-xl">
                    <SelectValue placeholder={t('exitKeys.current.selectCountry', 'Sélectionnez votre pays actuel')} />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {countries.map(country => (
                      <SelectItem key={country.id} value={country.id}>
                        <span className="flex items-center gap-3">
                          <span className="text-xl">{getFlagEmoji(country.iso2)}</span>
                          <span>{country.name}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {PYRAMID_TYPE_INFO[country.pyramidType].label}
                          </span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button 
                  variant="outline" 
                  className="w-full h-12 border-dashed border-2 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all" 
                  onClick={() => setCurrentCountryId(birthCountryId)}
                  disabled={!birthCountryId}
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  {t('exitKeys.current.sameAsBirth', 'Même pays que naissance')}
                </Button>
              </div>

              {currentCountry && (
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/5 via-card to-card border-2 border-blue-500/20 p-6 mt-6">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-blue-500/10 to-transparent blur-2xl" />
                  <div className="relative">
                    <div className="flex items-center gap-4 mb-6">
                      <span className="text-4xl">{getFlagEmoji(currentCountry.iso2)}</span>
                      <div>
                        <h3 className="text-xl font-bold">{currentCountry.name}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                          {PYRAMID_TYPE_INFO[currentCountry.pyramidType].label}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                        <p className="text-xs font-medium text-emerald-500 mb-3 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          {t('exitKeys.current.whoWins', 'Qui gagne ici')}
                        </p>
                        <ul className="text-sm space-y-2">
                          {currentCountry.whoWins.slice(0, 2).map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                              <span className="text-foreground/80">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20">
                        <p className="text-xs font-medium text-destructive mb-3 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          {t('exitKeys.current.whoLoses', 'Qui perd ici')}
                        </p>
                        <ul className="text-sm space-y-2">
                          {currentCountry.whoLoses.slice(0, 2).map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-destructive mt-1.5 shrink-0" />
                              <span className="text-foreground/80">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Profile */}
          {currentStep === 'profile' && (
            <div className="space-y-8 animate-fade-in">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-rose-500/20 to-rose-500/5 border border-rose-500/20 mb-6">
                  <Heart className="w-10 h-10 text-rose-500" />
                </div>
                <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  {t('exitKeys.profile.title', 'Quel est votre profil ?')}
                </h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {t('exitKeys.profile.subtitle', 'Votre formation et métier déterminent les stratégies accessibles')}
                </p>
              </div>

              {/* Education & Profession Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Education Level */}
                <div className="p-5 rounded-2xl bg-card/50 backdrop-blur border border-border/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-500/5">
                      <GraduationCap className="w-5 h-5 text-amber-500" />
                    </div>
                    <Label className="text-sm font-semibold">Niveau d'études</Label>
                  </div>
                  <Select value={educationLevel} onValueChange={(v) => setEducationLevel(v as EducationLevel)}>
                    <SelectTrigger className="w-full h-14 bg-background/50 border-2 hover:border-amber-500/50 transition-colors rounded-xl">
                      <SelectValue placeholder="Sélectionnez votre niveau" />
                    </SelectTrigger>
                    <SelectContent>
                      {EDUCATION_LEVELS.map(level => (
                        <SelectItem key={level.id} value={level.id}>
                          <span className="flex items-center gap-2">
                            <span>{level.icon}</span>
                            <span>{level.label}</span>
                            <span className="text-xs text-muted-foreground ml-2">({level.yearsOfStudy})</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Profession */}
                <div className="p-5 rounded-2xl bg-card/50 backdrop-blur border border-border/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-500/5">
                      <Briefcase className="w-5 h-5 text-blue-500" />
                    </div>
                    <Label className="text-sm font-semibold">Métier actuel</Label>
                  </div>
                  <Select value={professionId} onValueChange={setProfessionId}>
                    <SelectTrigger className="w-full h-14 bg-background/50 border-2 hover:border-blue-500/50 transition-colors rounded-xl">
                      <SelectValue placeholder="Sélectionnez votre métier" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {Object.entries(
                        PROFESSIONS.reduce((acc, prof) => {
                          if (!acc[prof.category]) acc[prof.category] = [];
                          acc[prof.category].push(prof);
                          return acc;
                        }, {} as Record<ProfessionCategory, typeof PROFESSIONS>)
                      ).map(([category, profs]) => (
                        <SelectGroup key={category}>
                          <SelectLabel className="text-primary font-semibold">
                            {PROFESSION_CATEGORY_LABELS[category as ProfessionCategory].icon} {PROFESSION_CATEGORY_LABELS[category as ProfessionCategory].label}
                          </SelectLabel>
                          {profs.map(prof => (
                            <SelectItem key={prof.id} value={prof.id}>
                              <span className="flex items-center gap-2">
                                <span>{prof.name}</span>
                                {prof.remoteWorkPossible && (
                                  <span className="text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">Remote</span>
                                )}
                                {prof.internationalDemand === 'very_high' && (
                                  <span className="text-xs bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">🌍</span>
                                )}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>
                  {professionId && (
                    <p className="text-xs text-emerald-500 mt-2 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      {(() => {
                        const prof = getProfession(professionId);
                        return prof ? `${prof.compatibleExitKeys.length} stratégies compatibles` : '';
                      })()}
                    </p>
                  )}
                </div>
              </div>

              {/* Motor Profile */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/5 via-card to-card border border-border/50">
                <Label className="text-sm font-semibold mb-4 block flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Votre moteur de vie
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(LIFE_MOTOR_PROFILES).map(([key, profile]) => (
                    <button
                      key={key}
                      onClick={() => setMotorProfile(key as LifeMotorProfile)}
                      className={cn(
                        "group relative p-4 rounded-xl border-2 text-center transition-all duration-300",
                        motorProfile === key 
                          ? "border-primary bg-primary/10 shadow-lg shadow-primary/10" 
                          : "border-border/50 hover:border-primary/30 hover:bg-primary/5"
                      )}
                    >
                      <span className="text-3xl block mb-2 transition-transform group-hover:scale-110">{profile.icon}</span>
                      <span className="text-xs font-medium">{t(profile.label)}</span>
                      {motorProfile === key && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Risk & Time Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Risk Tolerance */}
                <div className="p-5 rounded-2xl bg-card/50 backdrop-blur border border-border/50">
                  <Label className="text-sm font-semibold mb-4 block flex items-center gap-2">
                    <Shield className="w-4 h-4 text-amber-500" />
                    {t('exitKeys.profile.riskTolerance', 'Tolérance au risque')}
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {riskOptions.map(option => (
                      <button
                        key={option.value}
                        onClick={() => setRiskTolerance(option.value as 'low' | 'medium' | 'high')}
                        className={cn(
                          "p-3 rounded-xl border-2 text-center transition-all",
                          riskTolerance === option.value 
                            ? "border-amber-500 bg-amber-500/10" 
                            : "border-border/50 hover:border-amber-500/30"
                        )}
                      >
                        <span className="font-medium block text-sm">{t(option.labelKey)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Horizon */}
                <div className="p-5 rounded-2xl bg-card/50 backdrop-blur border border-border/50">
                  <Label className="text-sm font-semibold mb-4 block flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-500" />
                    {t('exitKeys.profile.timeHorizon', 'Horizon temporel')}
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {timeOptions.map(option => (
                      <button
                        key={option.value}
                        onClick={() => setTimeHorizon(option.value as 'short' | 'medium' | 'long')}
                        className={cn(
                          "p-3 rounded-xl border-2 text-center transition-all",
                          timeHorizon === option.value 
                            ? "border-emerald-500 bg-emerald-500/10" 
                            : "border-border/50 hover:border-emerald-500/30"
                        )}
                      >
                        <span className="font-medium block text-sm">{t(option.labelKey)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Toggles */}
              <div className="p-6 rounded-2xl bg-card/50 backdrop-blur border border-border/50 space-y-4">
                <Label className="text-sm font-semibold mb-2 block">Ressources & Situation</Label>
                {[
                  { id: 'capital', label: t('exitKeys.profile.hasCapital', "J'ai du capital disponible (> 50k€)"), checked: hasCapital, onChange: setHasCapital },
                  { id: 'credentials', label: t('exitKeys.profile.hasCredentials', "J'ai des diplômes/certifications reconnus"), checked: hasCredentials, onChange: setHasCredentials },
                  { id: 'network', label: t('exitKeys.profile.hasNetwork', "J'ai un réseau professionnel solide"), checked: hasNetwork, onChange: setHasNetwork },
                  { id: 'family', label: t('exitKeys.profile.hasFamily', "J'ai une famille à considérer"), checked: hasFamily, onChange: setHasFamily },
                  { id: 'lgbtq', label: t('exitKeys.profile.isLGBTQ', 'Je suis LGBTQ+'), checked: isLGBTQ, onChange: setIsLGBTQ },
                ].map(toggle => (
                  <div key={toggle.id} className="flex items-center justify-between p-3 rounded-xl bg-background/50 hover:bg-background transition-colors">
                    <Label htmlFor={toggle.id} className="cursor-pointer">{toggle.label}</Label>
                    <Switch id={toggle.id} checked={toggle.checked} onCheckedChange={toggle.onChange} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Goals */}
          {currentStep === 'goals' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <Target className="w-12 h-12 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">{t('exitKeys.goals.title', 'Que recherchez-vous ?')}</h2>
                <p className="text-muted-foreground">
                  {t('exitKeys.goals.subtitle', 'Votre priorité de vie oriente la destination idéale')}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {priorityOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => setDesiredLife(option.value)}
                    className={cn(
                      "p-6 rounded-xl border text-center transition-all",
                      desiredLife === option.value 
                        ? "border-primary bg-primary/10 ring-2 ring-primary/20" 
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <span className="text-4xl block mb-2">{option.icon}</span>
                    <span className="font-medium">{t(option.labelKey)}</span>
                  </button>
                ))}
              </div>

              {/* Summary */}
              <div className="glass-card rounded-xl p-6 mt-8">
                <h3 className="font-semibold mb-4">{t('exitKeys.summary.title', 'Résumé de votre profil')}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">{t('exitKeys.summary.origin', 'Origine')}:</span>
                    <span className="ml-2 font-medium">{birthCountry?.name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t('exitKeys.summary.current', 'Actuel')}:</span>
                    <span className="ml-2 font-medium">{currentCountry?.name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t('exitKeys.summary.profile', 'Profil')}:</span>
                    <span className="ml-2 font-medium">{LIFE_MOTOR_PROFILES[motorProfile].icon}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t('exitKeys.summary.priority', 'Priorité')}:</span>
                    <span className="ml-2 font-medium">{priorityOptions.find(p => p.value === desiredLife)?.icon}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Results */}
          {currentStep === 'results' && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <Zap className="w-12 h-12 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">{t('exitKeys.results.title', 'Vos Clés de Sortie')}</h2>
                <p className="text-muted-foreground">
                  {t('exitKeys.results.strategiesFound', '{{count}} stratégies identifiées pour votre situation', { count: exitKeyResults.length })}
                </p>
              </div>

              {/* Context Summary */}
              <div className="glass-card rounded-xl p-6 bg-primary/5">
                <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{birthCountry && getFlagEmoji(birthCountry.iso2)}</span>
                    <span>{birthCountry?.name}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{currentCountry && getFlagEmoji(currentCountry.iso2)}</span>
                    <span>{currentCountry?.name}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{priorityOptions.find(p => p.value === desiredLife)?.icon}</span>
                    <span>{t(priorityOptions.find(p => p.value === desiredLife)?.labelKey || '')}</span>
                  </div>
                </div>
              </div>

              {/* Nationality Advantages */}
              {nationalityAdvantages.uniqueAdvantages.length > 0 && (
                <div className="glass-card rounded-xl p-6 border-2 border-primary/20">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary" />
                    {t('exitKeys.results.nationalityAdvantages', 'Avantages de vos Nationalités')}
                    {nationalityAdvantages.strongestPassport && (
                      <span className={cn(
                        "text-xs px-2 py-1 rounded-full bg-primary/10",
                        getPassportStrengthLabel(nationalityAdvantages.strongestPassport.passportStrength).color
                      )}>
                        {getPassportStrengthLabel(nationalityAdvantages.strongestPassport.passportStrength).label}
                      </span>
                    )}
                  </h3>
                  
                  {/* Passport stats */}
                  <div className="flex flex-wrap gap-4 mb-4 p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Plane className="w-4 h-4 text-primary" />
                      <span className="text-sm">
                        <strong>{nationalityAdvantages.totalVisaFree}</strong> {t('exitKeys.results.visaFreeCountries', 'pays sans visa')}
                      </span>
                    </div>
                    {nationalityAdvantages.combinedBlocs.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Flag className="w-4 h-4 text-primary" />
                        <span className="text-sm">
                          {t('exitKeys.results.memberOf', 'Membre de')}: {nationalityAdvantages.combinedBlocs.map(b => REGIONAL_BLOCS[b]?.icon).join(' ')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Regional blocs */}
                  {nationalityAdvantages.combinedBlocs.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-muted-foreground mb-2">{t('exitKeys.results.regionalBlocs', 'Blocs régionaux')}</p>
                      <div className="flex flex-wrap gap-2">
                        {nationalityAdvantages.combinedBlocs.map(blocId => {
                          const bloc = REGIONAL_BLOCS[blocId];
                          if (!bloc) return null;
                          return (
                            <div key={blocId} className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg">
                              <span className="text-lg">{bloc.icon}</span>
                              <div>
                                <span className="text-sm font-medium">{bloc.name}</span>
                                <p className="text-xs text-muted-foreground">{bloc.description}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Advantages list */}
                  <div className="grid md:grid-cols-2 gap-3">
                    {nationalityAdvantages.uniqueAdvantages.slice(0, 6).map(advantage => (
                      <div key={advantage.id} className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg">
                        <span className="text-xl">{advantage.icon}</span>
                        <div>
                          <p className="font-medium text-sm">{advantage.name}</p>
                          <p className="text-xs text-muted-foreground">{advantage.description}</p>
                        <span className={cn(
                            "text-xs px-2 py-0.5 rounded mt-1 inline-block",
                            advantage.type === 'visa_free' && 'bg-emerald-500/20 text-emerald-400',
                            advantage.type === 'regional_access' && 'bg-blue-500/20 text-blue-400',
                            advantage.type === 'work_permit' && 'bg-amber-500/20 text-amber-400',
                            advantage.type === 'tax_benefit' && 'bg-purple-500/20 text-purple-400',
                            advantage.type === 'residency' && 'bg-cyan-500/20 text-cyan-400',
                            advantage.type === 'citizenship' && 'bg-rose-500/20 text-rose-400',
                          )}>
                            {advantage.type === 'visa_free' && t('exitKeys.advantageTypes.visaFree', 'Visa-free')}
                            {advantage.type === 'regional_access' && t('exitKeys.advantageTypes.regionalAccess', 'Accès régional')}
                            {advantage.type === 'work_permit' && t('exitKeys.advantageTypes.workPermit', 'Travail')}
                            {advantage.type === 'tax_benefit' && t('exitKeys.advantageTypes.taxBenefit', 'Fiscal')}
                            {advantage.type === 'residency' && t('exitKeys.advantageTypes.residency', 'Résidence')}
                            {advantage.type === 'citizenship' && t('exitKeys.advantageTypes.citizenship', 'Citoyenneté')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Installation vs Vacation Tabs */}
              {destinationRecommendations.length > 0 && (
                <div className="glass-card rounded-xl p-6 border-2 border-primary/20">
                  <Tabs defaultValue="installation" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="installation" className="gap-2">
                        <MapPin className="w-4 h-4" />
                        {t('exitKeys.results.installationTab', 'Installation')}
                      </TabsTrigger>
                      <TabsTrigger value="vacances" className="gap-2">
                        <Plane className="w-4 h-4" />
                        {t('exitKeys.results.vacationTab', 'Vacances')}
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="installation">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                          <Map className="w-5 h-5 text-emerald-500" />
                          <h3 className="font-semibold">{t('exitKeys.results.installationDestinations', "Destinations d'Installation")}</h3>
                          <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400">
                            {t('exitKeys.results.optimizedForProfile', 'Optimisées pour votre profil')}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          {t('exitKeys.results.installationDescription', 'Pays où vous pouvez vous installer durablement selon vos nationalités, aspirations et contraintes.')}
                        </p>
                        <DestinationMap
                          recommendations={destinationRecommendations}
                          nationalities={nationalityIds}
                          aspiration={desiredLife}
                          currentCountry={currentCountryId}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="vacances">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                          <Plane className="w-5 h-5 text-blue-500" />
                          <h3 className="font-semibold">{t('exitKeys.results.vacationRecommendations', 'Recommandations Vacances')}</h3>
                          <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">
                            {t('exitKeys.results.byPurchasingPower', "Par pouvoir d'achat")}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          {t('exitKeys.results.vacationDescription', 'Destinations où votre salaire vous permet de profiter sans exploser votre budget, tout en progressant vers vos objectifs.')}
                        </p>
                        <VacationRecommendations
                          currentCountryId={currentCountryId}
                          nationalityIds={nationalityIds}
                          professionId={professionId}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}

              {/* Vacation fallback if no destination recommendations */}
              {destinationRecommendations.length === 0 && (
                <VacationRecommendations
                  currentCountryId={currentCountryId}
                  nationalityIds={nationalityIds}
                  professionId={professionId}
                />
              )}

              {/* Strategic Principles */}
              <div className="bg-accent/30 rounded-xl p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  {t('exitKeys.results.strategicPrinciples', 'Principes Stratégiques Clés')}
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {STRATEGIC_PRINCIPLES.filter(p => 
                    p.applicablePyramids.includes(currentCountry?.pyramidType || 'STABILITY_REDIS')
                  ).slice(0, 4).map(principle => (
                    <div key={principle.id} className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-emerald-500 mt-1 shrink-0" />
                      <div>
                        <p className="font-medium text-sm">{principle.name}</p>
                        <p className="text-xs text-muted-foreground">{principle.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Filters & Compare Link */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-muted/30 rounded-xl p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{t('exitKeys.results.filter', 'Filtrer')}:</span>
                  </div>
                  
                  {/* Difficulty Filter */}
                  <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                    <SelectTrigger className="w-[140px] h-9">
                      <SelectValue placeholder={t('exitKeys.filters.difficulty', 'Difficulté')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('exitKeys.filters.allDifficulties', 'Toutes')}</SelectItem>
                      <SelectItem value="easy">{t('exitKeys.filters.easy', 'Facile')}</SelectItem>
                      <SelectItem value="moderate">{t('exitKeys.filters.moderate', 'Modéré')}</SelectItem>
                      <SelectItem value="hard">{t('exitKeys.filters.hard', 'Difficile')}</SelectItem>
                      <SelectItem value="expert">{t('exitKeys.filters.expert', 'Expert')}</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Duration Filter */}
                  <Select value={durationFilter} onValueChange={setDurationFilter}>
                    <SelectTrigger className="w-[140px] h-9">
                      <SelectValue placeholder={t('exitKeys.filters.duration', 'Durée')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('exitKeys.filters.allDurations', 'Toutes')}</SelectItem>
                      <SelectItem value="short">{t('exitKeys.filters.shortTerm', '1-3 ans')}</SelectItem>
                      <SelectItem value="medium">{t('exitKeys.filters.mediumTerm', '3-7 ans')}</SelectItem>
                      <SelectItem value="long">{t('exitKeys.filters.longTerm', '7+ ans')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Link to="/exit-keys/compare">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Scale className="w-4 h-4" />
                    {t('exitKeys.results.compare', 'Comparer')}
                  </Button>
                </Link>
              </div>

              {/* Exit Keys */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {filteredResults.length > 1 
                      ? t('exitKeys.results.strategiesCountPlural', '{{count}} stratégies', { count: filteredResults.length })
                      : t('exitKeys.results.strategiesCount', '{{count}} stratégie', { count: filteredResults.length })}
                    {(difficultyFilter !== 'all' || durationFilter !== 'all') && ` ${t('exitKeys.results.filtered', '(filtrées)')}`}
                  </span>
                  {(difficultyFilter !== 'all' || durationFilter !== 'all') && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => { setDifficultyFilter('all'); setDurationFilter('all'); }}
                    >
                      {t('exitKeys.results.reset', 'Réinitialiser')}
                    </Button>
                  )}
                </div>

                {filteredResults.length > 0 ? (
                  filteredResults.map((result, index) => (
                    <ExitKeyCard key={result.key.id} result={result} rank={index + 1} />
                  ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>{t('exitKeys.results.noStrategies', 'Aucune stratégie ne correspond aux filtres.')}</p>
                    <Button 
                      variant="outline" 
                      onClick={() => { setDifficultyFilter('all'); setDurationFilter('all'); }} 
                      className="mt-4"
                    >
                      {t('exitKeys.results.resetFilters', 'Réinitialiser les filtres')}
                    </Button>
                  </div>
                )}
              </div>

              {/* Salary Calculator */}
              <SalaryCalculator 
                initialCountryId={currentCountryId} 
                initialProfessionId={professionId} 
              />

              {/* Risk Contexts Section - Dynamic based on origin/destination */}
              <RiskContextsSection 
                originCountryId={birthCountryId}
                originCountryName={birthCountry?.name}
                originPyramidType={birthCountry?.pyramidType}
                destinationCountryId={currentCountryId}
                destinationCountryName={currentCountry?.name}
                destinationPyramidType={currentCountry?.pyramidType}
              />

              {/* Risk Prevention - Contextualized based on user profile */}
              <RiskPrevention 
                currentCountryPyramidType={currentCountry?.pyramidType}
                birthCountryPyramidType={birthCountry?.pyramidType}
                currentCountryId={currentCountryId}
                birthCountryId={birthCountryId}
                originCountryName={birthCountry?.name}
                destinationCountryName={currentCountry?.name}
              />

              {/* Actions */}
              <div className="flex flex-wrap justify-center gap-4 pt-8">
                <Button variant="outline" onClick={handleSaveProfile}>
                  <Save className="w-4 h-4 mr-2" />
                  {t('exitKeys.results.saveProfile', 'Sauvegarder mon profil')}
                </Button>
                <Button variant="ghost" onClick={() => setCurrentStep('origin')}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {t('exitKeys.results.restart', 'Recommencer')}
                </Button>
              </div>

              {/* Guest Mode CTA - Non-aggressive */}
              {!user && (
                <div className="mt-8 p-6 rounded-xl bg-muted/30 border border-border/50 text-center max-w-xl mx-auto">
                  <p className="text-sm text-muted-foreground mb-3">
                    {t('exitKeys.guestCta.localSaved', 'Votre simulation est sauvegardée localement sur cet appareil.')}
                  </p>
                  <p className="text-base font-medium text-foreground mb-4">
                    {t('exitKeys.guestCta.createAccount', 'Créez un compte gratuit pour :')}
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 mb-5">
                    <li>✓ {t('exitKeys.guestCta.benefit1', 'Retrouver votre profil sur tous vos appareils')}</li>
                    <li>✓ {t('exitKeys.guestCta.benefit2', 'Sauvegarder plusieurs scénarios de comparaison')}</li>
                    <li>✓ {t('exitKeys.guestCta.benefit3', 'Accéder au tableau de bord de suivi')}</li>
                    <li>✓ {t('exitKeys.guestCta.benefit4', 'Recevoir des mises à jour personnalisées')}</li>
                  </ul>
                  <Link to="/auth">
                    <Button variant="secondary" size="sm">
                      {t('exitKeys.guestCta.createAccountBtn', 'Créer un compte gratuit')}
                    </Button>
                  </Link>
                  <p className="text-xs text-muted-foreground/60 mt-3">
                    {t('exitKeys.guestCta.notRequired', 'Pas obligatoire. Continuez à explorer librement.')}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        {currentStep !== 'results' && (
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              variant="ghost"
              onClick={prevStep}
              disabled={stepIndex === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('exitKeys.navigation.previous', 'Précédent')}
            </Button>
            <Button
              onClick={nextStep}
              disabled={!canProceed()}
            >
              {stepIndex === STEPS.length - 2 ? t('exitKeys.navigation.viewKeys', 'Voir mes clés') : t('exitKeys.navigation.next', 'Suivant')}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
