import { useDefaultCountry } from '@/hooks/useDefaultCountry';
import { useTranslation } from 'react-i18next';
import { MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Convert ISO2 code to flag emoji
function getFlagEmoji(iso2: string): string {
  const codePoints = iso2
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export function CountryIndicator() {
  const { t } = useTranslation();
  const { getDefaultCountry } = useDefaultCountry();
  const country = getDefaultCountry();

  if (!country) return null;

  const flag = getFlagEmoji(country.iso2);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link 
          to={`/country/${country.id}`}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <MapPin className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t('footer.defaultCountry', 'Pays par défaut')}:</span>
          <span className="font-medium text-foreground">{flag} {country.name}</span>
        </Link>
      </TooltipTrigger>
      <TooltipContent>
        <p>{t('footer.defaultCountryTooltip', 'Les calculateurs utilisent ce pays par défaut. Changez-le dans les outils.')}</p>
      </TooltipContent>
    </Tooltip>
  );
}
