import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { User, MapPin, GraduationCap, Target, Save, Edit, X } from 'lucide-react';
import { useCountries } from '@/lib/countries-store';
import { LIFE_MOTOR_PROFILES } from '@/lib/types';

const EDUCATION_LEVELS = [
  { value: 'high_school', label: 'Bac / Équivalent' },
  { value: 'bachelor', label: 'Licence / Bachelor' },
  { value: 'master', label: 'Master / MBA' },
  { value: 'phd', label: 'Doctorat / PhD' },
  { value: 'vocational', label: 'Formation professionnelle' },
  { value: 'self_taught', label: 'Autodidacte' },
];

const RISK_TOLERANCE_LEVELS = [
  { value: 'conservative', label: 'Conservateur', color: 'bg-blue-500' },
  { value: 'moderate', label: 'Modéré', color: 'bg-amber-500' },
  { value: 'aggressive', label: 'Opportuniste', color: 'bg-red-500' },
];

// Convert ISO2 country code to flag emoji
const getFlag = (iso2: string) => {
  if (!iso2 || iso2.length !== 2) return '🌍';
  return iso2
    .toUpperCase()
    .split('')
    .map(char => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join('');
};

export function UserProfileWidget() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { profile, isLoading, upsertProfile, isUpdating } = useUserProfile();
  const { countries } = useCountries();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    display_name: '',
    birth_country: '',
    current_country: '',
    education_level: '',
    motor_profile: '',
    risk_tolerance: '',
  });

  const handleEdit = () => {
    setFormData({
      display_name: profile?.display_name || '',
      birth_country: profile?.birth_country || '',
      current_country: profile?.current_country || '',
      education_level: profile?.education_level || '',
      motor_profile: profile?.motor_profile || '',
      risk_tolerance: profile?.risk_tolerance || '',
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    upsertProfile(formData, {
      onSuccess: () => {
        toast.success(t('profile.saved', 'Profil enregistré !'));
        setIsEditing(false);
      },
      onError: () => {
        toast.error(t('profile.saveError', 'Erreur lors de la sauvegarde'));
      },
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (isEditing) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            {t('profile.editTitle', 'Modifier mon profil')}
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t('profile.displayName', 'Nom affiché')}</Label>
            <Input 
              value={formData.display_name}
              onChange={e => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
              placeholder={user?.email?.split('@')[0]}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('profile.birthCountry', 'Pays de naissance')}</Label>
              <Select 
                value={formData.birth_country}
                onValueChange={val => setFormData(prev => ({ ...prev, birth_country: val }))}
              >
                <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                <SelectContent>
                  {countries.map(c => (
                    <SelectItem key={c.id} value={c.id}>{getFlag(c.iso2)} {c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('profile.currentCountry', 'Pays actuel')}</Label>
              <Select 
                value={formData.current_country}
                onValueChange={val => setFormData(prev => ({ ...prev, current_country: val }))}
              >
                <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                <SelectContent>
                  {countries.map(c => (
                    <SelectItem key={c.id} value={c.id}>{getFlag(c.iso2)} {c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('profile.education', 'Niveau d\'études')}</Label>
            <Select 
              value={formData.education_level}
              onValueChange={val => setFormData(prev => ({ ...prev, education_level: val }))}
            >
              <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
              <SelectContent>
                {EDUCATION_LEVELS.map(e => (
                  <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('profile.motorProfile', 'Moteur de vie')}</Label>
            <Select 
              value={formData.motor_profile}
              onValueChange={val => setFormData(prev => ({ ...prev, motor_profile: val }))}
            >
              <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
              <SelectContent>
                {Object.entries(LIFE_MOTOR_PROFILES).map(([key, info]) => (
                  <SelectItem key={key} value={key}>{info.icon} {info.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('profile.riskTolerance', 'Tolérance au risque')}</Label>
            <div className="flex gap-2">
              {RISK_TOLERANCE_LEVELS.map(r => (
                <Button
                  key={r.value}
                  type="button"
                  variant={formData.risk_tolerance === r.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFormData(prev => ({ ...prev, risk_tolerance: r.value }))}
                  className="flex-1"
                >
                  {r.label}
                </Button>
              ))}
            </div>
          </div>

          <Button onClick={handleSave} disabled={isUpdating} className="w-full gap-2">
            <Save className="w-4 h-4" />
            {t('common.save', 'Sauvegarder')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // View mode
  const countryInfo = (countryId: string | null) => {
    if (!countryId) return null;
    const country = countries.find(c => c.id === countryId);
    return country ? `${getFlag(country.iso2)} ${country.name}` : countryId;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          {t('profile.title', 'Mon profil')}
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={handleEdit}>
          <Edit className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {!profile ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground text-sm mb-3">
              {t('profile.noProfile', 'Complétez votre profil pour personnaliser vos recommandations')}
            </p>
            <Button onClick={handleEdit} variant="outline" size="sm" className="gap-2">
              <User className="w-4 h-4" />
              {t('profile.create', 'Créer mon profil')}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{profile.display_name || user?.email?.split('@')[0]}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              {profile.birth_country && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-muted-foreground" />
                  <span className="truncate">{countryInfo(profile.birth_country)}</span>
                </div>
              )}
              {profile.current_country && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-primary" />
                  <span className="truncate">{countryInfo(profile.current_country)}</span>
                </div>
              )}
              {profile.education_level && (
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-3 h-3 text-muted-foreground" />
                  <span className="truncate">
                    {EDUCATION_LEVELS.find(e => e.value === profile.education_level)?.label || profile.education_level}
                  </span>
                </div>
              )}
              {profile.motor_profile && LIFE_MOTOR_PROFILES[profile.motor_profile as keyof typeof LIFE_MOTOR_PROFILES] && (
                <div className="flex items-center gap-2">
                  <Target className="w-3 h-3 text-muted-foreground" />
                  <span className="truncate">
                    {LIFE_MOTOR_PROFILES[profile.motor_profile as keyof typeof LIFE_MOTOR_PROFILES].label}
                  </span>
                </div>
              )}
            </div>

            {profile.risk_tolerance && (
              <Badge variant="outline" className="text-xs">
                {RISK_TOLERANCE_LEVELS.find(r => r.value === profile.risk_tolerance)?.label || profile.risk_tolerance}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
