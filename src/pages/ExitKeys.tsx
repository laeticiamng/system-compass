import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Key, Compass, Target, Zap, 
  ChevronRight, MapPin, Heart, Shield,
  AlertTriangle, CheckCircle, Save, RefreshCw,
  Filter, Clock, Scale, Flag, Globe, Plane, Map,
  GraduationCap, Briefcase
} from 'lucide-react';
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
import { countries } from '@/lib/countries-data';
import { PyramidType, PYRAMID_TYPE_INFO, LifeMotorProfile, LifePriority, LIFE_MOTOR_PROFILES } from '@/lib/types';
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
import { RiskPrevention } from '@/components/RiskPrevention';
import { SalaryCalculator } from '@/components/SalaryCalculator';
import { JourneyProgressBar, getJourneyPhase } from '@/components/JourneyProgressBar';
import { SimulationDisclaimer } from '@/components/SimulationDisclaimer';

const STEPS = ['origin', 'current', 'profile', 'goals', 'results'] as const;
type Step = typeof STEPS[number];

const priorityOptions: { value: LifePriority; label: string; icon: string }[] = [
  { value: 'freedom', label: 'Liberté', icon: '🦅' },
  { value: 'money', label: 'Argent', icon: '💰' },
  { value: 'meaning', label: 'Sens', icon: '💫' },
  { value: 'status', label: 'Statut', icon: '👔' },
  { value: 'family', label: 'Famille', icon: '👨‍👩‍👧' },
  { value: 'calm', label: 'Sérénité', icon: '🧘' },
];

const riskOptions = [
  { value: 'low', label: 'Prudent', description: 'Je préfère la sécurité' },
  { value: 'medium', label: 'Équilibré', description: 'Risques calculés' },
  { value: 'high', label: 'Audacieux', description: 'Je vise haut' },
];

const timeOptions = [
  { value: 'short', label: '1-3 ans', description: 'Résultats rapides' },
  { value: 'medium', label: '3-7 ans', description: 'Progression stable' },
  { value: 'long', label: '7+ ans', description: 'Vision long terme' },
];

export default function ExitKeys() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { profile: savedProfile, saveProfile, loading: profileLoading } = useExitKeysProfile();
  const [currentStep, setCurrentStep] = useState<Step>('origin');
  
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
  const nationalityCountries = nationalityIds.map(id => countries.find(c => c.id === id)).filter(Boolean) as typeof countries;
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
      setCurrentStep(STEPS[nextIndex]);
      // Auto-save when reaching results
      if (STEPS[nextIndex] === 'results') {
        handleSaveProfile();
      }
    }
  };

  const prevStep = () => {
    const prevIndex = stepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex]);
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
      {/* Sticky Journey Progress Bar */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50 py-4 mb-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <JourneyProgressBar currentPhase={getJourneyPhase(currentStep)} />
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('common.back', 'Retour')}
          </Link>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-primary/20">
              <Key className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold">
                {t('exitKeys.title', 'Trouvez Votre Clé de Sortie')}
              </h1>
              <p className="text-muted-foreground">
                {t('exitKeys.subtitle', 'Simulez et analysez les stratégies adaptées à votre situation')}
              </p>
              <SimulationDisclaimer variant="compact" className="mt-2" />
            </div>
          </div>

          {/* Central Philosophy Message */}
          <div className="mb-8 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-amber-500/5 border border-primary/20">
            <p className="text-sm text-center text-muted-foreground">
              <strong className="text-foreground">Rappel :</strong> Pyramid Compass structure la lucidité. 
              Si l'analyse révèle que votre option est trop risquée ou irréaliste, 
              nous vous aiderons à explorer des alternatives : rester et entreprendre, migrer autrement, se former d'abord, ou changer d'objectif.
            </p>
          </div>

          {/* Detailed step progress (below sticky bar) */}
          {currentStep !== 'results' && (
            <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Sous-étape {stepIndex + 1} sur {STEPS.length - 1}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-1.5 mt-2" />
            </div>
          )}
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {/* Step 1: Origin Country */}
          {currentStep === 'origin' && (
            <div className="space-y-8">
              {/* Birth Country */}
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">D'où venez-vous ?</h2>
                  <p className="text-muted-foreground">
                    Votre pays de naissance influence votre point de départ dans le système
                  </p>
                </div>

                <Label className="text-sm font-medium">Pays de naissance</Label>
                <Select value={birthCountryId} onValueChange={(v) => {
                  setBirthCountryId(v);
                  if (nationalityIds.length === 0) setNationalityIds([v]);
                }}>
                  <SelectTrigger className="w-full h-14 text-lg">
                    <SelectValue placeholder="Sélectionnez votre pays de naissance" />
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
              </div>

              {/* Nationalities - Multi-select */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Flag className="w-5 h-5 text-primary" />
                  <Label className="text-sm font-medium">Nationalité(s)</Label>
                  <span className="text-xs text-muted-foreground">(multi-nationalité supportée)</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Vos nationalités déterminent les visas et opportunités accessibles
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
                    <SelectValue placeholder={nationalityIds.length > 0 ? "Ajouter une autre nationalité" : "Sélectionnez votre nationalité"} />
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
            <div className="space-y-6">
              <div className="text-center mb-8">
                <Compass className="w-12 h-12 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Où êtes-vous maintenant ?</h2>
                <p className="text-muted-foreground">
                  Votre pays actuel détermine les contraintes et opportunités disponibles
                </p>
              </div>

              <Select value={currentCountryId} onValueChange={setCurrentCountryId}>
                <SelectTrigger className="w-full h-14 text-lg">
                  <SelectValue placeholder="Sélectionnez votre pays actuel" />
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
                variant="ghost" 
                className="w-full" 
                onClick={() => setCurrentCountryId(birthCountryId)}
                disabled={!birthCountryId}
              >
                Même pays que naissance
              </Button>

              {currentCountry && (
                <div className="glass-card rounded-xl p-6 mt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">{getFlagEmoji(currentCountry.iso2)}</span>
                    <div>
                      <h3 className="font-bold">{currentCountry.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {PYRAMID_TYPE_INFO[currentCountry.pyramidType].label}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Qui gagne ici</p>
                      <ul className="text-sm space-y-1">
                        {currentCountry.whoWins.slice(0, 2).map((item, i) => (
                          <li key={i} className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-emerald-500" />
                            <span className="truncate">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Qui perd ici</p>
                      <ul className="text-sm space-y-1">
                        {currentCountry.whoLoses.slice(0, 2).map((item, i) => (
                          <li key={i} className="flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-destructive" />
                            <span className="truncate">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Profile */}
          {currentStep === 'profile' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <Heart className="w-12 h-12 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Quel est votre profil ?</h2>
                <p className="text-muted-foreground">
                  Votre formation et métier déterminent les stratégies accessibles
                </p>
              </div>

              {/* Education Level */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-primary" />
                  <Label className="text-sm font-medium">Niveau d'études</Label>
                </div>
                <Select value={educationLevel} onValueChange={(v) => setEducationLevel(v as EducationLevel)}>
                  <SelectTrigger className="w-full h-12">
                    <SelectValue placeholder="Sélectionnez votre niveau d'études" />
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
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  <Label className="text-sm font-medium">Métier actuel</Label>
                </div>
                <Select value={professionId} onValueChange={setProfessionId}>
                  <SelectTrigger className="w-full h-12">
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
                  <p className="text-xs text-muted-foreground">
                    {(() => {
                      const prof = getProfession(professionId);
                      return prof ? `${prof.compatibleExitKeys.length} stratégies compatibles avec ce métier` : '';
                    })()}
                  </p>
                )}
              </div>

              {/* Motor Profile */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Votre moteur de vie</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(LIFE_MOTOR_PROFILES).map(([key, profile]) => (
                    <button
                      key={key}
                      onClick={() => setMotorProfile(key as LifeMotorProfile)}
                      className={cn(
                        "p-3 rounded-lg border text-center transition-all",
                        motorProfile === key 
                          ? "border-primary bg-primary/10" 
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <span className="text-2xl block mb-1">{profile.icon}</span>
                      <span className="text-xs font-medium">{t(profile.label)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Risk Tolerance */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Tolérance au risque</Label>
                <div className="grid grid-cols-3 gap-3">
                  {riskOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => setRiskTolerance(option.value as 'low' | 'medium' | 'high')}
                      className={cn(
                        "p-4 rounded-lg border text-center transition-all",
                        riskTolerance === option.value 
                          ? "border-primary bg-primary/10" 
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <span className="font-medium block">{option.label}</span>
                      <span className="text-xs text-muted-foreground">{option.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Horizon */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Horizon temporel</Label>
                <div className="grid grid-cols-3 gap-3">
                  {timeOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => setTimeHorizon(option.value as 'short' | 'medium' | 'long')}
                      className={cn(
                        "p-4 rounded-lg border text-center transition-all",
                        timeHorizon === option.value 
                          ? "border-primary bg-primary/10" 
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <span className="font-medium block">{option.label}</span>
                      <span className="text-xs text-muted-foreground">{option.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <Label htmlFor="capital">J'ai du capital disponible (&gt; 50k€)</Label>
                  <Switch id="capital" checked={hasCapital} onCheckedChange={setHasCapital} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="credentials">J'ai des diplômes/certifications reconnus</Label>
                  <Switch id="credentials" checked={hasCredentials} onCheckedChange={setHasCredentials} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="network">J'ai un réseau professionnel solide</Label>
                  <Switch id="network" checked={hasNetwork} onCheckedChange={setHasNetwork} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="family">J'ai une famille à considérer</Label>
                  <Switch id="family" checked={hasFamily} onCheckedChange={setHasFamily} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="lgbtq">Je suis LGBTQ+</Label>
                  <Switch id="lgbtq" checked={isLGBTQ} onCheckedChange={setIsLGBTQ} />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Goals */}
          {currentStep === 'goals' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <Target className="w-12 h-12 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Que recherchez-vous ?</h2>
                <p className="text-muted-foreground">
                  Votre priorité de vie oriente la destination idéale
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
                    <span className="font-medium">{option.label}</span>
                  </button>
                ))}
              </div>

              {/* Summary */}
              <div className="glass-card rounded-xl p-6 mt-8">
                <h3 className="font-semibold mb-4">Résumé de votre profil</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Origine:</span>
                    <span className="ml-2 font-medium">{birthCountry?.name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Actuel:</span>
                    <span className="ml-2 font-medium">{currentCountry?.name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Profil:</span>
                    <span className="ml-2 font-medium">{LIFE_MOTOR_PROFILES[motorProfile].icon}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Priorité:</span>
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
                <h2 className="text-2xl font-bold mb-2">Vos Clés de Sortie</h2>
                <p className="text-muted-foreground">
                  {exitKeyResults.length} stratégies identifiées pour votre situation
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
                    <span>{priorityOptions.find(p => p.value === desiredLife)?.label}</span>
                  </div>
                </div>
              </div>

              {/* Nationality Advantages */}
              {nationalityAdvantages.uniqueAdvantages.length > 0 && (
                <div className="glass-card rounded-xl p-6 border-2 border-primary/20">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary" />
                    Avantages de vos Nationalités
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
                        <strong>{nationalityAdvantages.totalVisaFree}</strong> pays sans visa
                      </span>
                    </div>
                    {nationalityAdvantages.combinedBlocs.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Flag className="w-4 h-4 text-primary" />
                        <span className="text-sm">
                          Membre de: {nationalityAdvantages.combinedBlocs.map(b => REGIONAL_BLOCS[b]?.icon).join(' ')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Regional blocs */}
                  {nationalityAdvantages.combinedBlocs.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-muted-foreground mb-2">Blocs régionaux</p>
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
                            {advantage.type === 'visa_free' && 'Visa-free'}
                            {advantage.type === 'regional_access' && 'Accès régional'}
                            {advantage.type === 'work_permit' && 'Travail'}
                            {advantage.type === 'tax_benefit' && 'Fiscal'}
                            {advantage.type === 'residency' && 'Résidence'}
                            {advantage.type === 'citizenship' && 'Citoyenneté'}
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
                        Installation
                      </TabsTrigger>
                      <TabsTrigger value="vacances" className="gap-2">
                        <Plane className="w-4 h-4" />
                        Vacances
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="installation">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                          <Map className="w-5 h-5 text-emerald-500" />
                          <h3 className="font-semibold">Destinations d'Installation</h3>
                          <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400">
                            Optimisées pour votre profil
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          Pays où vous pouvez vous installer durablement selon vos nationalités, aspirations et contraintes.
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
                          <h3 className="font-semibold">Recommandations Vacances</h3>
                          <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">
                            Par pouvoir d'achat
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          Destinations où votre salaire vous permet de profiter sans exploser votre budget, tout en progressant vers vos objectifs.
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
                  Principes Stratégiques Clés
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
                    <span className="text-sm font-medium">Filtrer:</span>
                  </div>
                  
                  {/* Difficulty Filter */}
                  <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                    <SelectTrigger className="w-[140px] h-9">
                      <SelectValue placeholder="Difficulté" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes</SelectItem>
                      <SelectItem value="easy">Facile</SelectItem>
                      <SelectItem value="moderate">Modéré</SelectItem>
                      <SelectItem value="hard">Difficile</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Duration Filter */}
                  <Select value={durationFilter} onValueChange={setDurationFilter}>
                    <SelectTrigger className="w-[140px] h-9">
                      <SelectValue placeholder="Durée" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes</SelectItem>
                      <SelectItem value="short">1-3 ans</SelectItem>
                      <SelectItem value="medium">3-7 ans</SelectItem>
                      <SelectItem value="long">7+ ans</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Link to="/exit-keys/compare">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Scale className="w-4 h-4" />
                    Comparer
                  </Button>
                </Link>
              </div>

              {/* Exit Keys */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {filteredResults.length} stratégie{filteredResults.length > 1 ? 's' : ''} 
                    {(difficultyFilter !== 'all' || durationFilter !== 'all') && ' (filtrées)'}
                  </span>
                  {(difficultyFilter !== 'all' || durationFilter !== 'all') && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => { setDifficultyFilter('all'); setDurationFilter('all'); }}
                    >
                      Réinitialiser
                    </Button>
                  )}
                </div>

                {filteredResults.length > 0 ? (
                  filteredResults.map((result, index) => (
                    <ExitKeyCard key={result.key.id} result={result} rank={index + 1} />
                  ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>Aucune stratégie ne correspond aux filtres.</p>
                    <Button 
                      variant="outline" 
                      onClick={() => { setDifficultyFilter('all'); setDurationFilter('all'); }} 
                      className="mt-4"
                    >
                      Réinitialiser les filtres
                    </Button>
                  </div>
                )}
              </div>

              {/* Salary Calculator */}
              <SalaryCalculator 
                initialCountryId={currentCountryId} 
                initialProfessionId={professionId} 
              />

              {/* Risk Prevention - Contextualized based on user profile */}
              <RiskPrevention 
                currentCountryPyramidType={currentCountry?.pyramidType}
                birthCountryPyramidType={birthCountry?.pyramidType}
                currentCountryId={currentCountryId}
                birthCountryId={birthCountryId}
              />

              {/* Actions */}
              <div className="flex flex-wrap justify-center gap-4 pt-8">
                <Button variant="outline" onClick={handleSaveProfile}>
                  <Save className="w-4 h-4 mr-2" />
                  Sauvegarder mon profil
                </Button>
                <Button variant="ghost" onClick={() => setCurrentStep('origin')}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Recommencer
                </Button>
              </div>

              {/* Guest Mode CTA - Non-aggressive */}
              {!user && (
                <div className="mt-8 p-6 rounded-xl bg-muted/30 border border-border/50 text-center max-w-xl mx-auto">
                  <p className="text-sm text-muted-foreground mb-3">
                    Votre simulation est sauvegardée localement sur cet appareil.
                  </p>
                  <p className="text-base font-medium text-foreground mb-4">
                    Créez un compte gratuit pour :
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 mb-5">
                    <li>✓ Retrouver votre profil sur tous vos appareils</li>
                    <li>✓ Sauvegarder plusieurs scénarios de comparaison</li>
                    <li>✓ Accéder au tableau de bord de suivi</li>
                    <li>✓ Recevoir des mises à jour personnalisées</li>
                  </ul>
                  <Link to="/auth">
                    <Button variant="secondary" size="sm">
                      Créer un compte gratuit
                    </Button>
                  </Link>
                  <p className="text-xs text-muted-foreground/60 mt-3">
                    Pas obligatoire. Continuez à explorer librement.
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
              Précédent
            </Button>
            <Button
              onClick={nextStep}
              disabled={!canProceed()}
            >
              {stepIndex === STEPS.length - 2 ? 'Voir mes clés' : 'Suivant'}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
