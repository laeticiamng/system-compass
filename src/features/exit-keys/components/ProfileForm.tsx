import { useTranslation } from 'react-i18next';
import { MapPin, Flag, Heart, Compass, Target, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { countries } from '@/lib/countries-data';
import { PYRAMID_TYPE_INFO, LifeMotorProfile, LifePriority, LIFE_MOTOR_PROFILES } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ProfileFormProps {
  // Origin step
  birthCountryId: string;
  nationalityIds: string[];
  currentCountryId: string;
  // Profile step
  motorProfile: LifeMotorProfile;
  riskTolerance: 'low' | 'medium' | 'high';
  timeHorizon: 'short' | 'medium' | 'long';
  hasCapital: boolean;
  hasCredentials: boolean;
  hasNetwork: boolean;
  hasFamily: boolean;
  isLGBTQ: boolean;
  // Goals step
  desiredLife: LifePriority;
  // Handlers
  onBirthCountryChange: (id: string) => void;
  onNationalityAdd: (id: string) => void;
  onNationalityRemove: (id: string) => void;
  onCurrentCountryChange: (id: string) => void;
  onMotorProfileChange: (profile: LifeMotorProfile) => void;
  onRiskToleranceChange: (risk: 'low' | 'medium' | 'high') => void;
  onTimeHorizonChange: (horizon: 'short' | 'medium' | 'long') => void;
  onCapitalChange: (value: boolean) => void;
  onCredentialsChange: (value: boolean) => void;
  onNetworkChange: (value: boolean) => void;
  onFamilyChange: (value: boolean) => void;
  onLGBTQChange: (value: boolean) => void;
  onDesiredLifeChange: (priority: LifePriority) => void;
}

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

function getFlagEmoji(iso2: string) {
  return iso2
    .toUpperCase()
    .split('')
    .map(char => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join('');
}

export function OriginStep({
  birthCountryId,
  nationalityIds,
  onBirthCountryChange,
  onNationalityAdd,
  onNationalityRemove,
}: Pick<ProfileFormProps, 'birthCountryId' | 'nationalityIds' | 'onBirthCountryChange' | 'onNationalityAdd' | 'onNationalityRemove'>) {
  const { t } = useTranslation();
  const birthCountry = countries.find(c => c.id === birthCountryId);
  const nationalityCountries = nationalityIds.map(id => countries.find(c => c.id === id)).filter(Boolean);

  return (
    <div className="space-y-8">
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
          onBirthCountryChange(v);
          if (nationalityIds.length === 0) onNationalityAdd(v);
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

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Flag className="w-5 h-5 text-primary" />
          <Label className="text-sm font-medium">Nationalité(s)</Label>
          <span className="text-xs text-muted-foreground">(multi-nationalité supportée)</span>
        </div>
        
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
                    onClick={() => onNationalityRemove(natId)}
                    className="ml-1 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <Select 
          value="" 
          onValueChange={(v) => {
            if (v && !nationalityIds.includes(v)) {
              onNationalityAdd(v);
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
      </div>
    </div>
  );
}

export function CurrentCountryStep({
  birthCountryId,
  currentCountryId,
  onCurrentCountryChange,
}: Pick<ProfileFormProps, 'birthCountryId' | 'currentCountryId' | 'onCurrentCountryChange'>) {
  const currentCountry = countries.find(c => c.id === currentCountryId);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Compass className="w-12 h-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Où êtes-vous maintenant ?</h2>
        <p className="text-muted-foreground">
          Votre pays actuel détermine les contraintes et opportunités disponibles
        </p>
      </div>

      <Select value={currentCountryId} onValueChange={onCurrentCountryChange}>
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
        onClick={() => onCurrentCountryChange(birthCountryId)}
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
  );
}

export function ProfileStep({
  motorProfile,
  riskTolerance,
  timeHorizon,
  hasCapital,
  hasCredentials,
  hasNetwork,
  hasFamily,
  isLGBTQ,
  onMotorProfileChange,
  onRiskToleranceChange,
  onTimeHorizonChange,
  onCapitalChange,
  onCredentialsChange,
  onNetworkChange,
  onFamilyChange,
  onLGBTQChange,
}: Pick<ProfileFormProps, 
  'motorProfile' | 'riskTolerance' | 'timeHorizon' | 'hasCapital' | 'hasCredentials' | 
  'hasNetwork' | 'hasFamily' | 'isLGBTQ' | 'onMotorProfileChange' | 'onRiskToleranceChange' | 
  'onTimeHorizonChange' | 'onCapitalChange' | 'onCredentialsChange' | 'onNetworkChange' | 
  'onFamilyChange' | 'onLGBTQChange'
>) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Heart className="w-12 h-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Quel est votre profil ?</h2>
        <p className="text-muted-foreground">
          Votre personnalité influence les stratégies qui vous correspondent
        </p>
      </div>

      <div>
        <Label className="text-sm font-medium mb-3 block">Votre moteur de vie</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(LIFE_MOTOR_PROFILES).map(([key, profile]) => (
            <button
              key={key}
              onClick={() => onMotorProfileChange(key as LifeMotorProfile)}
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

      <div>
        <Label className="text-sm font-medium mb-3 block">Tolérance au risque</Label>
        <div className="grid grid-cols-3 gap-3">
          {riskOptions.map(option => (
            <button
              key={option.value}
              onClick={() => onRiskToleranceChange(option.value as 'low' | 'medium' | 'high')}
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

      <div>
        <Label className="text-sm font-medium mb-3 block">Horizon temporel</Label>
        <div className="grid grid-cols-3 gap-3">
          {timeOptions.map(option => (
            <button
              key={option.value}
              onClick={() => onTimeHorizonChange(option.value as 'short' | 'medium' | 'long')}
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

      <div className="space-y-4 pt-4 border-t">
        <div className="flex items-center justify-between">
          <Label htmlFor="capital">J'ai du capital disponible (&gt; 50k€)</Label>
          <Switch id="capital" checked={hasCapital} onCheckedChange={onCapitalChange} />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="credentials">J'ai des diplômes/certifications reconnus</Label>
          <Switch id="credentials" checked={hasCredentials} onCheckedChange={onCredentialsChange} />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="network">J'ai un réseau professionnel solide</Label>
          <Switch id="network" checked={hasNetwork} onCheckedChange={onNetworkChange} />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="family">J'ai une famille à considérer</Label>
          <Switch id="family" checked={hasFamily} onCheckedChange={onFamilyChange} />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="lgbtq">Je suis LGBTQ+</Label>
          <Switch id="lgbtq" checked={isLGBTQ} onCheckedChange={onLGBTQChange} />
        </div>
      </div>
    </div>
  );
}

export function GoalsStep({
  desiredLife,
  onDesiredLifeChange,
  birthCountry,
  currentCountry,
  motorProfile,
}: Pick<ProfileFormProps, 'desiredLife' | 'onDesiredLifeChange'> & {
  birthCountry?: { name: string };
  currentCountry?: { name: string };
  motorProfile: LifeMotorProfile;
}) {
  return (
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
            onClick={() => onDesiredLifeChange(option.value)}
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

      <div className="glass-card rounded-xl p-6 mt-8">
        <h3 className="font-semibold mb-4">Résumé de votre profil</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Origine:</span>
            <span className="ml-2 font-medium">{birthCountry?.name || '-'}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Actuel:</span>
            <span className="ml-2 font-medium">{currentCountry?.name || '-'}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Profil:</span>
            <span className="ml-2 font-medium">{LIFE_MOTOR_PROFILES[motorProfile].icon}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Priorité:</span>
            <span className="ml-2 font-medium">
              {priorityOptions.find(p => p.value === desiredLife)?.icon}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
