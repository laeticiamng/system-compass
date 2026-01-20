import { useTranslation } from 'react-i18next';
import { Compass, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCountries } from '@/lib/countries-data';
import { usePyramidTranslations } from '@/hooks/usePyramidTranslations';

interface CurrentCountryStepProps {
  birthCountryId: string;
  currentCountryId: string;
  onCurrentCountryChange: (id: string) => void;
}

function getFlagEmoji(iso2: string) {
  return iso2
    .toUpperCase()
    .split('')
    .map(char => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join('');
}

export function CurrentCountryStep({
  birthCountryId,
  currentCountryId,
  onCurrentCountryChange,
}: CurrentCountryStepProps) {
  const { t } = useTranslation();
  const { countries } = useCountries();
  const { getPyramidLabel, getWhoThrives, getWhoPays } = usePyramidTranslations();
  const currentCountry = countries.find(c => c.id === currentCountryId);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Compass className="w-12 h-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">{t('exitKeys.current.title', 'Où êtes-vous maintenant ?')}</h2>
        <p className="text-muted-foreground">
          {t('exitKeys.current.subtitle', 'Votre pays actuel détermine les contraintes et opportunités disponibles')}
        </p>
      </div>

      <Select value={currentCountryId} onValueChange={onCurrentCountryChange}>
        <SelectTrigger className="w-full h-14 text-lg">
          <SelectValue placeholder={t('exitKeys.current.selectCountry', 'Sélectionnez votre pays actuel')} />
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

      <Button 
        variant="ghost" 
        className="w-full" 
        onClick={() => onCurrentCountryChange(birthCountryId)}
        disabled={!birthCountryId}
      >
        {t('exitKeys.current.sameAsBirth', 'Même pays que naissance')}
      </Button>

      {currentCountry && (
        <div className="glass-card rounded-xl p-6 mt-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">{getFlagEmoji(currentCountry.iso2)}</span>
            <div>
              <h3 className="font-bold">{currentCountry.name}</h3>
              <p className="text-sm text-muted-foreground">
                {getPyramidLabel(currentCountry.pyramidType)}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t('exitKeys.current.whoWins', 'Qui gagne ici')}</p>
              <ul className="text-sm space-y-1">
                {getWhoThrives(currentCountry.pyramidType).slice(0, 2).map((item, i) => (
                  <li key={i} className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-500 dark:text-green-400 shrink-0" />
                    <span className="truncate">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t('exitKeys.current.whoLoses', 'Qui perd ici')}</p>
              <ul className="text-sm space-y-1">
                {getWhoPays(currentCountry.pyramidType).slice(0, 2).map((item, i) => (
                  <li key={i} className="flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-destructive shrink-0" />
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
