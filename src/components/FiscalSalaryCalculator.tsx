import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Calculator, 
  TrendingUp, 
  TrendingDown, 
  Heart, 
  Briefcase, 
  Home,
  PiggyBank,
  AlertTriangle,
  CheckCircle,
  Info,
  Percent,
  Building2,
  Banknote
} from 'lucide-react';
import { 
  FISCAL_SYSTEMS_EXTENDED, 
  calculateNetSalary, 
  getFiscalSummary,
  compareSalaries,
  type NetSalaryResult 
} from '@/lib/fiscal-data';
import { PROFESSIONS, getProfession, PROFESSION_CATEGORY_LABELS, type ProfessionCategory } from '@/lib/profession-data';
import { countries } from '@/lib/countries-data';
import { cn } from '@/lib/utils';

interface FiscalSalaryCalculatorProps {
  initialCountryId?: string;
  initialProfessionId?: string;
  className?: string;
}

const getFlagEmoji = (iso2: string): string => {
  if (!iso2) return '';
  const codePoints = iso2
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

// Group professions by category
const groupedProfessions = PROFESSIONS.reduce((acc, prof) => {
  if (!acc[prof.category]) acc[prof.category] = [];
  acc[prof.category].push(prof);
  return acc;
}, {} as Record<ProfessionCategory, typeof PROFESSIONS>);

// Base annual gross salaries by country (EUR)
const BASE_GROSS_SALARIES: Record<string, number> = {
  france: 42000,
  germany: 52000,
  switzerland: 95000,
  usa: 65000,
  uk: 48000,
  uae: 70000,
  singapore: 65000,
  canada: 55000,
  cameroon: 5500,
  japan: 48000,
  spain: 32000,
  portugal: 22000,
  italy: 35000,
  morocco: 12000,
  netherlands: 55000,
  senegal: 8000,
  cote_divoire: 10000,
};

export function FiscalSalaryCalculator({ 
  initialCountryId, 
  initialProfessionId,
  className 
}: FiscalSalaryCalculatorProps) {
  const { t } = useTranslation();
  
  // Only show countries with fiscal data
  const fiscalCountryIds = Object.keys(FISCAL_SYSTEMS_EXTENDED);
  const fiscalCountries = countries.filter(c => fiscalCountryIds.includes(c.id));
  
  const [selectedCountry, setSelectedCountry] = useState(initialCountryId || '');
  const [selectedProfession, setSelectedProfession] = useState(initialProfessionId || '');
  const [comparisonCountry, setComparisonCountry] = useState('');
  
  // Calculate gross salary based on profession and country
  const grossSalary = useMemo(() => {
    if (!selectedCountry || !selectedProfession) return 0;
    const profession = getProfession(selectedProfession);
    if (!profession) return 0;
    
    const baseSalary = BASE_GROSS_SALARIES[selectedCountry] || 35000;
    return Math.round(baseSalary * profession.averageSalaryMultiplier);
  }, [selectedCountry, selectedProfession]);
  
  const netResult = useMemo(() => {
    if (!selectedCountry || !grossSalary) return null;
    return calculateNetSalary(selectedCountry, grossSalary);
  }, [selectedCountry, grossSalary]);
  
  const fiscalSummary = useMemo(() => {
    if (!selectedCountry) return [];
    return getFiscalSummary(selectedCountry);
  }, [selectedCountry]);
  
  // Comparison calculation
  const comparisonGrossSalary = useMemo(() => {
    if (!comparisonCountry || !selectedProfession) return 0;
    const profession = getProfession(selectedProfession);
    if (!profession) return 0;
    
    const baseSalary = BASE_GROSS_SALARIES[comparisonCountry] || 35000;
    return Math.round(baseSalary * profession.averageSalaryMultiplier);
  }, [comparisonCountry, selectedProfession]);
  
  const comparisonResult = useMemo(() => {
    if (!selectedCountry || !comparisonCountry || !grossSalary || !comparisonGrossSalary) return null;
    return compareSalaries(selectedCountry, grossSalary, comparisonCountry, comparisonGrossSalary);
  }, [selectedCountry, comparisonCountry, grossSalary, comparisonGrossSalary]);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR',
      maximumFractionDigits: 0 
    }).format(amount);
  };
  
  const getCountryName = (countryId: string) => {
    const country = countries.find(c => c.id === countryId);
    return country?.name || countryId;
  };
  
  const getCountryIso = (countryId: string) => {
    const country = countries.find(c => c.id === countryId);
    return country?.iso2 || '';
  };
  
  const profession = selectedProfession ? getProfession(selectedProfession) : null;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" />
          {t('fiscal.salaryCalculator', 'Calculateur de Salaire Net')}
        </CardTitle>
        <CardDescription>
          {t('fiscal.description', 'Estimez votre salaire net réel avec impôts, charges sociales et coût de la vie')}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Country & Profession Selection */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('common.country', 'Pays')}</label>
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger>
                <SelectValue placeholder={t('fiscal.selectCountry', 'Sélectionner un pays')} />
              </SelectTrigger>
              <SelectContent>
                {fiscalCountries.map(country => (
                  <SelectItem key={country.id} value={country.id}>
                    {getFlagEmoji(country.iso2)} {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('profile.profession', 'Profession')}</label>
            <Select value={selectedProfession} onValueChange={setSelectedProfession}>
              <SelectTrigger>
                <SelectValue placeholder={t('fiscal.selectProfession', 'Sélectionner une profession')} />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {Object.entries(groupedProfessions).map(([category, profs]) => (
                  <SelectGroup key={category}>
                    <SelectLabel className="text-primary font-semibold">
                      {PROFESSION_CATEGORY_LABELS[category as ProfessionCategory].icon} {PROFESSION_CATEGORY_LABELS[category as ProfessionCategory].label}
                    </SelectLabel>
                    {profs.filter(p => p.category !== 'student' && p.category !== 'unemployed' && p.category !== 'retired').map(p => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Results */}
        {netResult && grossSalary > 0 && (
          <>
            <Separator />
            
            {/* Main Results Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <ResultCard
                icon={<Briefcase className="w-4 h-4" />}
                label={t('fiscal.grossAnnual', 'Brut annuel')}
                value={formatCurrency(netResult.grossAnnual)}
                subValue={`${formatCurrency(netResult.grossMonthly)}/mois`}
              />
              <ResultCard
                icon={<PiggyBank className="w-4 h-4" />}
                label={t('fiscal.netMonthly', 'Net mensuel')}
                value={formatCurrency(netResult.netMonthly)}
                highlight
                subValue={`${formatCurrency(netResult.netAnnual)}/an`}
              />
              <ResultCard
                icon={<Home className="w-4 h-4" />}
                label={t('fiscal.purchasingPower', 'Pouvoir d\'achat')}
                value={formatCurrency(netResult.purchasingPowerAdjusted)}
                subValue={t('fiscal.adjustedForCostOfLiving', 'Ajusté au coût de vie')}
              />
              <ResultCard
                icon={<Heart className="w-4 h-4" />}
                label={t('fiscal.healthcareCost', 'Coût santé/an')}
                value={formatCurrency(netResult.totalHealthcareCost)}
                subValue={t('fiscal.insuranceAndCopays', 'Assurance + frais')}
              />
            </div>
            
            {/* Deduction Breakdown */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Percent className="w-4 h-4 text-muted-foreground" />
                {t('fiscal.deductionBreakdown', 'Détail des prélèvements')}
              </h4>
              
              <div className="space-y-2">
                <DeductionRow 
                  label={t('fiscal.incomeTax', 'Impôt sur le revenu')}
                  amount={netResult.incomeTax / 12}
                  percentage={netResult.effectiveTaxRate}
                  formatCurrency={formatCurrency}
                />
                <DeductionRow 
                  label={t('fiscal.socialContributions', 'Cotisations sociales')}
                  amount={netResult.socialContributions / 12}
                  percentage={(netResult.socialContributions / netResult.grossAnnual) * 100}
                  formatCurrency={formatCurrency}
                />
                {netResult.pension > 0 && (
                  <DeductionRow 
                    label={t('fiscal.pension', 'Retraite')}
                    amount={netResult.pension / 12}
                    percentage={(netResult.pension / netResult.grossAnnual) * 100}
                    formatCurrency={formatCurrency}
                  />
                )}
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="font-medium">{t('fiscal.totalDeductions', 'Total prélevé')}</span>
                <span className="font-bold text-destructive">
                  {netResult.effectiveTotalRate.toFixed(1)}%
                </span>
              </div>
            </div>
            
            {/* Fiscal Summary */}
            <div className="flex flex-wrap gap-2">
              {fiscalSummary.map((summary, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {summary}
                </Badge>
              ))}
            </div>
            
            {/* Profession Info */}
            {profession && (
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{profession.name}</span>
                  <Badge variant={profession.internationalDemand === 'very_high' ? 'default' : 'secondary'}>
                    {t(`fiscal.demand.${profession.internationalDemand}`, profession.internationalDemand)}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    {profession.remoteWorkPossible ? (
                      <><CheckCircle className="w-3 h-3 text-green-500" /> {t('fiscal.remoteWork', 'Télétravail possible')}</>
                    ) : (
                      <><AlertTriangle className="w-3 h-3 text-yellow-500" /> {t('fiscal.onSiteRequired', 'Présentiel requis')}</>
                    )}
                  </span>
                </div>
              </div>
            )}
          </>
        )}
        
        {/* Comparison Section */}
        {selectedCountry && selectedProfession && (
          <>
            <Separator />
            
            <div className="space-y-4">
              <h4 className="font-medium">{t('fiscal.compareWith', 'Comparer avec un autre pays')}</h4>
              
              <Select value={comparisonCountry} onValueChange={setComparisonCountry}>
                <SelectTrigger>
                  <SelectValue placeholder={t('fiscal.selectCountry', 'Sélectionner un pays à comparer')} />
                </SelectTrigger>
                <SelectContent>
                  {fiscalCountries.filter(c => c.id !== selectedCountry).map(country => (
                    <SelectItem key={country.id} value={country.id}>
                      {getFlagEmoji(country.iso2)} {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {comparisonResult && comparisonResult.country1 && comparisonResult.country2 && (
                <div className="space-y-4">
                  {/* Comparison Cards */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <ComparisonCard
                      countryName={getCountryName(selectedCountry)}
                      countryIso={getCountryIso(selectedCountry)}
                      netMonthly={comparisonResult.country1.netMonthly}
                      purchasingPower={comparisonResult.country1.purchasingPowerAdjusted}
                      taxRate={comparisonResult.country1.effectiveTotalRate}
                      formatCurrency={formatCurrency}
                      isWinner={comparisonResult.winner === selectedCountry}
                    />
                    <ComparisonCard
                      countryName={getCountryName(comparisonCountry)}
                      countryIso={getCountryIso(comparisonCountry)}
                      netMonthly={comparisonResult.country2.netMonthly}
                      purchasingPower={comparisonResult.country2.purchasingPowerAdjusted}
                      taxRate={comparisonResult.country2.effectiveTotalRate}
                      formatCurrency={formatCurrency}
                      isWinner={comparisonResult.winner === comparisonCountry}
                    />
                  </div>
                  
                  {/* Analysis */}
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      {comparisonResult.purchasingPowerDifference > 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                      <span className="font-medium">
                        {t('fiscal.analysis', 'Analyse')}
                      </span>
                    </div>
                    <ul className="space-y-1 text-sm">
                      {comparisonResult.analysis.map((point, i) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
        
        {/* Empty State */}
        {!selectedCountry && !selectedProfession && (
          <div className="text-center py-8 text-muted-foreground">
            <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>{t('fiscal.emptyState', 'Sélectionnez un pays et une profession pour calculer votre salaire net')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Helper Components
function ResultCard({ 
  icon, 
  label, 
  value, 
  subValue, 
  highlight 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  subValue?: string;
  highlight?: boolean;
}) {
  return (
    <div className={cn(
      "p-4 rounded-lg border",
      highlight ? 'bg-primary/5 border-primary/20' : 'bg-muted/50'
    )}>
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div className={cn("text-lg font-bold", highlight && 'text-primary')}>{value}</div>
      {subValue && <div className="text-xs text-muted-foreground">{subValue}</div>}
    </div>
  );
}

function DeductionRow({ 
  label, 
  amount, 
  percentage,
  formatCurrency 
}: { 
  label: string; 
  amount: number; 
  percentage: number;
  formatCurrency: (n: number) => string;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-destructive">-{formatCurrency(amount)}</span>
        <Badge variant="outline" className="text-xs">
          {percentage.toFixed(1)}%
        </Badge>
      </div>
    </div>
  );
}

function ComparisonCard({
  countryName,
  countryIso,
  netMonthly,
  purchasingPower,
  taxRate,
  formatCurrency,
  isWinner
}: {
  countryName: string;
  countryIso: string;
  netMonthly: number;
  purchasingPower: number;
  taxRate: number;
  formatCurrency: (n: number) => string;
  isWinner: boolean;
}) {
  return (
    <div className={cn(
      "p-4 rounded-lg border",
      isWinner ? 'border-green-500 bg-green-500/5' : ''
    )}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{countryIso && getFlagEmoji(countryIso)}</span>
        <span className="font-medium">{countryName}</span>
        {isWinner && <Badge className="bg-green-500">Meilleur</Badge>}
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Net mensuel</span>
          <span className="font-medium">{formatCurrency(netMonthly)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Pouvoir d'achat</span>
          <span className="font-medium">{formatCurrency(purchasingPower)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Prélèvements</span>
          <span className="text-destructive">{taxRate.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}

export default FiscalSalaryCalculator;
