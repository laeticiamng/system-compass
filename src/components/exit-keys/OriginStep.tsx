import { useTranslation } from 'react-i18next';
import { MapPin, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCountries } from '@/lib/countries-data';
import { PYRAMID_TYPE_INFO, type Country } from '@/lib/types';

interface OriginStepProps {
  birthCountryId: string;
  nationalityIds: string[];
  onBirthCountryChange: (id: string) => void;
  onNationalityAdd: (id: string) => void;
  onNationalityRemove: (id: string) => void;
}

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
}: OriginStepProps) {
  const { t } = useTranslation();
  const { countries } = useCountries();
  const birthCountry = countries.find(c => c.id === birthCountryId);
  const nationalityCountries = nationalityIds
    .map(id => countries.find(c => c.id === id))
    .filter(Boolean) as Country[];

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="text-center mb-6">
          <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">{t('exitKeys.origin.title', "D'où venez-vous ?")}</h2>
          <p className="text-muted-foreground">
            {t('exitKeys.origin.subtitle', 'Votre pays de naissance influence votre point de départ dans le système')}
          </p>
        </div>

        <Label className="text-sm font-medium">{t('exitKeys.origin.birthCountry', 'Pays de naissance')}</Label>
        <Select value={birthCountryId} onValueChange={(v) => {
          onBirthCountryChange(v);
          if (nationalityIds.length === 0) onNationalityAdd(v);
        }}>
          <SelectTrigger className="w-full h-14 text-lg">
            <SelectValue placeholder={t('exitKeys.origin.selectBirthCountry', 'Sélectionnez votre pays de naissance')} />
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
          <Label className="text-sm font-medium">{t('exitKeys.origin.nationalities', 'Nationalité(s)')}</Label>
          <span className="text-xs text-muted-foreground">({t('exitKeys.origin.multiSupported', 'multi-nationalité supportée')})</span>
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
            <SelectValue placeholder={nationalityIds.length > 0 
              ? t('exitKeys.origin.addAnother', 'Ajouter une autre nationalité') 
              : t('exitKeys.origin.selectNationality', 'Sélectionnez votre nationalité')} 
            />
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
            onClick={() => onNationalityAdd(birthCountryId)}
          >
            {t('exitKeys.origin.addBirthNationality', 'Ajouter nationalité du pays de naissance')}
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
                <span className="text-xs text-muted-foreground">{t('exitKeys.origin.birthCountryLabel', 'Pays de naissance')}</span>
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
                <span className="text-xs text-muted-foreground">{t('exitKeys.origin.nationalitiesLabel', 'Nationalité(s)')}</span>
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
  );
}
