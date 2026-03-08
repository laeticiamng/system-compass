import { useDefaultCountry } from '@/hooks/useDefaultCountry';
import { useTranslation } from 'react-i18next';
import { MapPin, ChevronDown, Check } from 'lucide-react';
import { useCountries } from '@/lib/countries-data';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  const { defaultCountryId, setDefaultCountry, getDefaultCountry } = useDefaultCountry();
  const { countries } = useCountries();
  const country = getDefaultCountry();

  if (!country) return null;

  const flag = getFlagEmoji(country.iso2);

  // Group countries by region
  const countryGroups = countries.reduce((acc, c) => {
    if (!acc[c.region]) acc[c.region] = [];
    acc[c.region].push(c);
    return acc;
  }, {} as Record<string, typeof countries>);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground h-auto py-1.5"
        >
          <MapPin className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t('footer.defaultCountry', 'Mon pays')}:</span>
          <span className="font-medium text-foreground">{flag} {country.name}</span>
          <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="center" 
        className="w-64 bg-popover border border-border shadow-lg z-50"
      >
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          {t('footer.selectDefaultCountry', 'Sélectionner le pays par défaut')}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[300px]">
          {Object.entries(countryGroups).sort().map(([region, regionCountries]) => (
            <div key={region}>
              <DropdownMenuLabel className="text-xs text-muted-foreground py-1">
                {region}
              </DropdownMenuLabel>
              {regionCountries.sort((a, b) => a.name.localeCompare(b.name)).map((c) => (
                <DropdownMenuItem
                  key={c.id}
                  onClick={() => setDefaultCountry(c.id)}
                  className="cursor-pointer flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <span>{getFlagEmoji(c.iso2)}</span>
                    <span>{c.name}</span>
                  </span>
                  {c.id === defaultCountryId && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </DropdownMenuItem>
              ))}
            </div>
          ))}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
