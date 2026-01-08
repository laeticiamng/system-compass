import { useTranslation } from 'react-i18next';
import { Heart, GraduationCap, Briefcase } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LIFE_MOTOR_PROFILES, type LifeMotorProfile } from '@/lib/types';
import { EDUCATION_LEVELS, PROFESSIONS, PROFESSION_CATEGORY_LABELS, type EducationLevel, type ProfessionCategory } from '@/lib/profession-data';
import { cn } from '@/lib/utils';

interface ProfileStepProps {
  motorProfile: LifeMotorProfile;
  riskTolerance: 'low' | 'medium' | 'high';
  timeHorizon: 'short' | 'medium' | 'long';
  hasCapital: boolean;
  hasCredentials: boolean;
  hasNetwork: boolean;
  hasFamily: boolean;
  isLGBTQ: boolean;
  educationLevel?: EducationLevel;
  professionId?: string;
  onMotorProfileChange: (profile: LifeMotorProfile) => void;
  onRiskToleranceChange: (risk: 'low' | 'medium' | 'high') => void;
  onTimeHorizonChange: (horizon: 'short' | 'medium' | 'long') => void;
  onCapitalChange: (value: boolean) => void;
  onCredentialsChange: (value: boolean) => void;
  onNetworkChange: (value: boolean) => void;
  onFamilyChange: (value: boolean) => void;
  onLGBTQChange: (value: boolean) => void;
  onEducationChange?: (level: EducationLevel) => void;
  onProfessionChange?: (professionId: string) => void;
}

const riskOptions = [
  { value: 'low', label: 'Prudent', description: 'Je préfère la sécurité' },
  { value: 'medium', label: 'Équilibré', description: 'Risques calculés' },
  { value: 'high', label: 'Audacieux', description: 'Je vise haut' },
] as const;

const timeOptions = [
  { value: 'short', label: '1-3 ans', description: 'Résultats rapides' },
  { value: 'medium', label: '3-7 ans', description: 'Progression stable' },
  { value: 'long', label: '7+ ans', description: 'Vision long terme' },
] as const;

// Group professions by category for the select
const groupedProfessions = PROFESSIONS.reduce((acc, prof) => {
  if (!acc[prof.category]) acc[prof.category] = [];
  acc[prof.category].push(prof);
  return acc;
}, {} as Record<ProfessionCategory, typeof PROFESSIONS>);

export function ProfileStep({
  motorProfile,
  riskTolerance,
  timeHorizon,
  hasCapital,
  hasCredentials,
  hasNetwork,
  hasFamily,
  isLGBTQ,
  educationLevel,
  professionId,
  onMotorProfileChange,
  onRiskToleranceChange,
  onTimeHorizonChange,
  onCapitalChange,
  onCredentialsChange,
  onNetworkChange,
  onFamilyChange,
  onLGBTQChange,
  onEducationChange,
  onProfessionChange,
}: ProfileStepProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Heart className="w-12 h-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">{t('exitKeys.profile.title', 'Quel est votre profil ?')}</h2>
        <p className="text-muted-foreground">
          {t('exitKeys.profile.subtitle', 'Votre formation et métier influencent les stratégies disponibles')}
        </p>
      </div>

      {/* Education Level */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-primary" />
          <Label className="text-sm font-medium">Niveau d'études</Label>
        </div>
        <Select value={educationLevel} onValueChange={(v) => onEducationChange?.(v as EducationLevel)}>
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
        <Select value={professionId} onValueChange={(v) => onProfessionChange?.(v)}>
          <SelectTrigger className="w-full h-12">
            <SelectValue placeholder="Sélectionnez votre métier" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {Object.entries(groupedProfessions).map(([category, profs]) => (
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
                        <span className="text-xs bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">🌍 Forte demande</span>
                      )}
                    </span>
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Motor Profile */}
      <div>
        <Label className="text-sm font-medium mb-3 block">{t('exitKeys.profile.lifeMotor', 'Votre moteur de vie')}</Label>
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

      {/* Risk Tolerance */}
      <div>
        <Label className="text-sm font-medium mb-3 block">{t('exitKeys.profile.riskTolerance', 'Tolérance au risque')}</Label>
        <div className="grid grid-cols-3 gap-3">
          {riskOptions.map(option => (
            <button
              key={option.value}
              onClick={() => onRiskToleranceChange(option.value)}
              className={cn(
                "p-4 rounded-lg border text-center transition-all",
                riskTolerance === option.value 
                  ? "border-primary bg-primary/10" 
                  : "border-border hover:border-primary/50"
              )}
            >
              <span className="font-medium block">{t(`exitKeys.profile.risk.${option.value}`, option.label)}</span>
              <span className="text-xs text-muted-foreground">{t(`exitKeys.profile.risk.${option.value}Desc`, option.description)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Time Horizon */}
      <div>
        <Label className="text-sm font-medium mb-3 block">{t('exitKeys.profile.timeHorizon', 'Horizon temporel')}</Label>
        <div className="grid grid-cols-3 gap-3">
          {timeOptions.map(option => (
            <button
              key={option.value}
              onClick={() => onTimeHorizonChange(option.value)}
              className={cn(
                "p-4 rounded-lg border text-center transition-all",
                timeHorizon === option.value 
                  ? "border-primary bg-primary/10" 
                  : "border-border hover:border-primary/50"
              )}
            >
              <span className="font-medium block">{option.label}</span>
              <span className="text-xs text-muted-foreground">{t(`exitKeys.profile.time.${option.value}Desc`, option.description)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-4 pt-4 border-t">
        <div className="flex items-center justify-between">
          <Label htmlFor="capital">{t('exitKeys.profile.hasCapital', "J'ai du capital disponible (> 50k€)")}</Label>
          <Switch id="capital" checked={hasCapital} onCheckedChange={onCapitalChange} />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="credentials">{t('exitKeys.profile.hasCredentials', "J'ai des diplômes/certifications reconnus")}</Label>
          <Switch id="credentials" checked={hasCredentials} onCheckedChange={onCredentialsChange} />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="network">{t('exitKeys.profile.hasNetwork', "J'ai un réseau professionnel solide")}</Label>
          <Switch id="network" checked={hasNetwork} onCheckedChange={onNetworkChange} />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="family">{t('exitKeys.profile.hasFamily', "J'ai une famille à considérer")}</Label>
          <Switch id="family" checked={hasFamily} onCheckedChange={onFamilyChange} />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="lgbtq">{t('exitKeys.profile.isLGBTQ', 'Je suis LGBTQ+')}</Label>
          <Switch id="lgbtq" checked={isLGBTQ} onCheckedChange={onLGBTQChange} />
        </div>
      </div>
    </div>
  );
}