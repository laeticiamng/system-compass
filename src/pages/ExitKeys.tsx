import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Key, Compass, Target, Zap, 
  ChevronRight, MapPin, Heart, Shield,
  AlertTriangle, CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { countries } from '@/lib/countries-data';
import { PyramidType, PYRAMID_TYPE_INFO, LifeMotorProfile, LifePriority, LIFE_MOTOR_PROFILES } from '@/lib/types';
import { findCompatibleKeys, UserContext, STRATEGIC_PRINCIPLES } from '@/lib/exit-keys-engine';
import ExitKeyCard from '@/components/ExitKeyCard';
import { cn } from '@/lib/utils';

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
  const [currentStep, setCurrentStep] = useState<Step>('origin');
  
  // User inputs
  const [birthCountryId, setBirthCountryId] = useState<string>('');
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

  // Derived data
  const birthCountry = countries.find(c => c.id === birthCountryId);
  const currentCountry = countries.find(c => c.id === currentCountryId);

  const userContext: UserContext | null = useMemo(() => {
    if (!currentCountry) return null;
    return {
      birthCountry: birthCountry?.pyramidType || currentCountry.pyramidType,
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
  }, [birthCountry, currentCountry, desiredLife, motorProfile, riskTolerance, timeHorizon, hasCapital, hasCredentials, hasNetwork, isLGBTQ, hasFamily]);

  const exitKeyResults = useMemo(() => {
    if (!userContext) return [];
    return findCompatibleKeys(userContext);
  }, [userContext]);

  const stepIndex = STEPS.indexOf(currentStep);
  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  const canProceed = () => {
    switch (currentStep) {
      case 'origin': return !!birthCountryId;
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
                {t('exitKeys.subtitle', 'La stratégie optimale pour votre situation unique')}
              </p>
            </div>
          </div>

          {/* Progress */}
          {currentStep !== 'results' && (
            <div className="mt-6">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Étape {stepIndex + 1} sur {STEPS.length - 1}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {/* Step 1: Origin Country */}
          {currentStep === 'origin' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">D'où venez-vous ?</h2>
                <p className="text-muted-foreground">
                  Votre pays de naissance influence votre point de départ dans le système
                </p>
              </div>

              <Select value={birthCountryId} onValueChange={setBirthCountryId}>
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

              {birthCountry && (
                <div className="glass-card rounded-xl p-6 mt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">{getFlagEmoji(birthCountry.iso2)}</span>
                    <div>
                      <h3 className="font-bold">{birthCountry.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {PYRAMID_TYPE_INFO[birthCountry.pyramidType].label}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground italic">
                    "{birthCountry.ruleOfGold}"
                  </p>
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
                  Votre personnalité influence les stratégies qui vous correspondent
                </p>
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

              {/* Exit Keys */}
              <div className="space-y-4">
                {exitKeyResults.length > 0 ? (
                  exitKeyResults.map((result, index) => (
                    <ExitKeyCard key={result.key.id} result={result} rank={index + 1} />
                  ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>Aucune stratégie trouvée pour cette combinaison.</p>
                    <Button variant="outline" onClick={() => setCurrentStep('origin')} className="mt-4">
                      Modifier mes critères
                    </Button>
                  </div>
                )}
              </div>

              {/* Restart */}
              <div className="text-center pt-8">
                <Button variant="outline" onClick={() => setCurrentStep('origin')}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Recommencer avec d'autres critères
                </Button>
              </div>
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
