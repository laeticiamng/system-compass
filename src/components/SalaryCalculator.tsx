import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DollarSign, TrendingUp, Globe, Briefcase, GraduationCap, Building, ArrowRight } from 'lucide-react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { countries } from '@/lib/countries-data';
import { PROFESSIONS, PROFESSION_CATEGORY_LABELS, getEstimatedSalary, EDUCATION_LEVELS, type ProfessionCategory, type EducationLevel } from '@/lib/profession-data';
import { cn } from '@/lib/utils';
import { useDefaultCountry } from '@/hooks/useDefaultCountry';

interface SalaryCalculatorProps {
  initialCountryId?: string;
  initialProfessionId?: string;
}

// Group professions by category
const groupedProfessions = PROFESSIONS.reduce((acc, prof) => {
  if (!acc[prof.category]) acc[prof.category] = [];
  acc[prof.category].push(prof);
  return acc;
}, {} as Record<ProfessionCategory, typeof PROFESSIONS>);

const getFlagEmoji = (iso2: string) => {
  return iso2
    .toUpperCase()
    .split('')
    .map(char => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join('');
};

export function SalaryCalculator({ initialCountryId, initialProfessionId }: SalaryCalculatorProps) {
  const { t } = useTranslation();
  const { defaultCountryId, setDefaultCountry } = useDefaultCountry();
  
  // Utilise le pays initial si fourni, sinon le pays par défaut (Nigeria)
  const [countryId, setCountryId] = useState(initialCountryId || defaultCountryId);
  const [professionId, setProfessionId] = useState(initialProfessionId || '');
  const [compareCountryId, setCompareCountryId] = useState<string>('');

  // Mémoriser le pays sélectionné comme défaut
  useEffect(() => {
    if (countryId && countryId !== defaultCountryId) {
      setDefaultCountry(countryId);
    }
  }, [countryId, defaultCountryId, setDefaultCountry]);

  const selectedCountry = countries.find(c => c.id === countryId);
  const selectedProfession = PROFESSIONS.find(p => p.id === professionId);
  const compareCountry = countries.find(c => c.id === compareCountryId);

  const salary = useMemo(() => {
    if (!countryId || !professionId) return 0;
    return getEstimatedSalary(countryId, professionId);
  }, [countryId, professionId]);

  const compareSalary = useMemo(() => {
    if (!compareCountryId || !professionId) return 0;
    return getEstimatedSalary(compareCountryId, professionId);
  }, [compareCountryId, professionId]);

  const salaryDiff = compareSalary - salary;
  const salaryDiffPercent = salary > 0 ? Math.round((salaryDiff / salary) * 100) : 0;

  // Calculate purchasing power ratio
  const purchasingPowerRatio = useMemo(() => {
    if (!selectedCountry || !compareCountry) return null;
    const costRatio = compareCountry.costOfLiving.monthlyBudgetSingle / selectedCountry.costOfLiving.monthlyBudgetSingle;
    const salaryRatio = compareSalary / (salary || 1);
    return salaryRatio / costRatio;
  }, [selectedCountry, compareCountry, salary, compareSalary]);

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/20">
          <DollarSign className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="font-bold text-lg">Calculateur de Salaire</h3>
          <p className="text-sm text-muted-foreground">Estimez votre salaire selon le pays et le métier</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {/* Country Select */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Pays de résidence
          </label>
          <Select value={countryId} onValueChange={setCountryId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sélectionnez un pays" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {countries.map(country => (
                <SelectItem key={country.id} value={country.id}>
                  <span className="flex items-center gap-2">
                    <span>{getFlagEmoji(country.iso2)}</span>
                    <span>{country.name}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Profession Select */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Métier
          </label>
          <Select value={professionId} onValueChange={setProfessionId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sélectionnez un métier" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {Object.entries(groupedProfessions).map(([category, profs]) => (
                <SelectGroup key={category}>
                  <SelectLabel className="text-primary font-semibold">
                    {PROFESSION_CATEGORY_LABELS[category as ProfessionCategory].icon} {PROFESSION_CATEGORY_LABELS[category as ProfessionCategory].label}
                  </SelectLabel>
                  {profs.map(prof => (
                    <SelectItem key={prof.id} value={prof.id}>
                      {prof.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Result Display */}
      {salary > 0 && (
        <div className="space-y-4">
          <div className="p-4 bg-primary/10 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Salaire mensuel net estimé</span>
              {selectedProfession && (
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full",
                  selectedProfession.internationalDemand === 'very_high' && 'bg-emerald-500/20 text-emerald-400',
                  selectedProfession.internationalDemand === 'high' && 'bg-blue-500/20 text-blue-400',
                  selectedProfession.internationalDemand === 'medium' && 'bg-amber-500/20 text-amber-400',
                  selectedProfession.internationalDemand === 'low' && 'bg-muted text-muted-foreground',
                )}>
                  {selectedProfession.internationalDemand === 'very_high' && '🌍 Très demandé'}
                  {selectedProfession.internationalDemand === 'high' && '🌍 Demandé'}
                  {selectedProfession.internationalDemand === 'medium' && 'Demande moyenne'}
                  {selectedProfession.internationalDemand === 'low' && 'Demande locale'}
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-primary">{salary.toLocaleString()}€</span>
              <span className="text-muted-foreground">/mois</span>
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              Soit ~{(salary * 12).toLocaleString()}€/an
            </div>
            {selectedCountry && (
              <div className="mt-3 pt-3 border-t border-border/50">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Coût de vie moyen</span>
                  <span>{selectedCountry.costOfLiving.monthlyBudgetSingle}€/mois</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-muted-foreground">Reste après dépenses</span>
                  <span className={cn(
                    "font-medium",
                    salary - selectedCountry.costOfLiving.monthlyBudgetSingle > 0 ? 'text-emerald-400' : 'text-red-400'
                  )}>
                    {(salary - selectedCountry.costOfLiving.monthlyBudgetSingle).toLocaleString()}€
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Profession Info */}
          {selectedProfession && (
            <div className="p-4 bg-muted/30 rounded-xl">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Informations sur le métier
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Formation requise:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedProfession.requiredEducation.slice(0, 2).map(edu => {
                      const eduInfo = EDUCATION_LEVELS.find(e => e.id === edu);
                      return (
                        <span key={edu} className="text-xs bg-primary/10 px-2 py-0.5 rounded">
                          {eduInfo?.icon} {eduInfo?.label}
                        </span>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Travail à distance:</span>
                  <p className={cn("font-medium", selectedProfession.remoteWorkPossible ? 'text-emerald-400' : 'text-muted-foreground')}>
                    {selectedProfession.remoteWorkPossible ? '✓ Possible' : '✗ Non applicable'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Compare Section */}
          <div className="p-4 bg-muted/20 rounded-xl">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Comparer avec un autre pays
            </h4>
            <Select value={compareCountryId} onValueChange={setCompareCountryId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionnez un pays à comparer" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {countries.filter(c => c.id !== countryId).map(country => (
                  <SelectItem key={country.id} value={country.id}>
                    <span className="flex items-center gap-2">
                      <span>{getFlagEmoji(country.iso2)}</span>
                      <span>{country.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {compareSalary > 0 && compareCountry && (
              <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {selectedCountry && <span>{getFlagEmoji(selectedCountry.iso2)}</span>}
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    <span>{getFlagEmoji(compareCountry.iso2)}</span>
                  </div>
                  <span className={cn(
                    "text-sm font-bold",
                    salaryDiff > 0 ? 'text-emerald-400' : salaryDiff < 0 ? 'text-red-400' : 'text-muted-foreground'
                  )}>
                    {salaryDiff > 0 ? '+' : ''}{salaryDiffPercent}%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center p-2 bg-background/50 rounded">
                    <p className="text-muted-foreground text-xs">{compareCountry.name}</p>
                    <p className="font-bold text-lg">{compareSalary.toLocaleString()}€</p>
                  </div>
                  <div className="text-center p-2 bg-background/50 rounded">
                    <p className="text-muted-foreground text-xs">Différence</p>
                    <p className={cn("font-bold text-lg", salaryDiff > 0 ? 'text-emerald-400' : 'text-red-400')}>
                      {salaryDiff > 0 ? '+' : ''}{salaryDiff.toLocaleString()}€
                    </p>
                  </div>
                </div>

                {purchasingPowerRatio && (
                  <div className="mt-3 pt-3 border-t border-border/50 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Ratio pouvoir d'achat</p>
                    <p className={cn(
                      "font-bold",
                      purchasingPowerRatio > 1.2 ? 'text-emerald-400' : 
                      purchasingPowerRatio < 0.8 ? 'text-red-400' : 'text-amber-400'
                    )}>
                      {purchasingPowerRatio > 1.2 && '✓ Meilleur pouvoir d\'achat'}
                      {purchasingPowerRatio >= 0.8 && purchasingPowerRatio <= 1.2 && '≈ Pouvoir d\'achat similaire'}
                      {purchasingPowerRatio < 0.8 && '✗ Pouvoir d\'achat inférieur'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Ratio: {purchasingPowerRatio.toFixed(2)}x
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {!salary && (
        <div className="text-center py-8 text-muted-foreground">
          <Building className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Sélectionnez un pays et un métier pour voir l'estimation salariale</p>
        </div>
      )}
    </div>
  );
}
