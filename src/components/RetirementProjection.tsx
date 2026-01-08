import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart
} from 'recharts';
import { 
  PiggyBank, 
  TrendingUp, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Target
} from 'lucide-react';
import { FISCAL_SYSTEMS_EXTENDED, calculateNetSalary } from '@/lib/fiscal-data';
import { countries } from '@/lib/countries-data';
import { cn } from '@/lib/utils';

interface RetirementProjectionProps {
  initialCountryId?: string;
  className?: string;
}

interface ProjectionYear {
  year: number;
  age: number;
  grossSalary: number;
  netSalary: number;
  pensionContributions: number;
  accumulatedPension: number;
  estimatedMonthlyPension: number;
}

// Pension replacement rates by country (approximate)
const PENSION_REPLACEMENT_RATES: Record<string, number> = {
  france: 0.74,
  germany: 0.52,
  switzerland: 0.44,
  usa: 0.39,
  uk: 0.58,
  uae: 0, // No public pension for expats
  singapore: 0, // CPF for citizens only
  canada: 0.42,
  cameroon: 0.30,
  japan: 0.40,
  spain: 0.80,
  portugal: 0.74,
  italy: 0.82,
  morocco: 0.35,
  netherlands: 0.71,
  senegal: 0.30,
  cote_divoire: 0.30,
  turkey: 0.65,
  brazil: 0.70,
  poland: 0.54,
  greece: 0.77,
  thailand: 0.25,
  vietnam: 0.30,
  australia: 0.42,
  mexico: 0.28,
  argentina: 0.72,
  colombia: 0.45,
};

const RETIREMENT_AGES: Record<string, number> = {
  france: 64,
  germany: 67,
  switzerland: 65,
  usa: 67,
  uk: 66,
  uae: 60,
  singapore: 65,
  canada: 65,
  cameroon: 60,
  japan: 65,
  spain: 67,
  portugal: 66,
  italy: 67,
  morocco: 60,
  netherlands: 67,
  senegal: 60,
  cote_divoire: 60,
  turkey: 65,
  brazil: 65,
  poland: 65,
  greece: 67,
  thailand: 60,
  vietnam: 60,
  australia: 67,
  mexico: 65,
  argentina: 65,
  colombia: 62,
};

const getFlagEmoji = (iso2: string): string => {
  if (!iso2) return '';
  const codePoints = iso2.toUpperCase().split('').map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

export function RetirementProjection({ initialCountryId, className }: RetirementProjectionProps) {
  const { t } = useTranslation();
  
  const fiscalCountryIds = Object.keys(FISCAL_SYSTEMS_EXTENDED);
  const fiscalCountries = countries.filter(c => fiscalCountryIds.includes(c.id));
  
  const [selectedCountry, setSelectedCountry] = useState(initialCountryId || 'france');
  const [currentAge, setCurrentAge] = useState([35]);
  const [grossAnnualSalary, setGrossAnnualSalary] = useState([50000]);
  const [salaryGrowthRate, setSalaryGrowthRate] = useState([2]); // % per year
  const [privateContributionRate, setPrivateContributionRate] = useState([5]); // % additional savings
  
  const fiscal = FISCAL_SYSTEMS_EXTENDED[selectedCountry];
  const retirementAge = RETIREMENT_AGES[selectedCountry] || 65;
  const replacementRate = PENSION_REPLACEMENT_RATES[selectedCountry] || 0.50;
  
  const projection = useMemo((): ProjectionYear[] => {
    if (!fiscal) return [];
    
    const years: ProjectionYear[] = [];
    const startAge = currentAge[0];
    const projectionYears = 20;
    let accumulatedPension = 0;
    
    for (let i = 0; i <= projectionYears; i++) {
      const age = startAge + i;
      const year = new Date().getFullYear() + i;
      
      // Salary with growth
      const salary = grossAnnualSalary[0] * Math.pow(1 + salaryGrowthRate[0] / 100, i);
      
      const netResult = calculateNetSalary(selectedCountry, salary);
      if (!netResult) continue;
      
      // Pension contributions (public + private)
      const publicPension = salary * (fiscal.socialContributions.pension / 100);
      const privatePension = salary * (privateContributionRate[0] / 100);
      const totalContribution = publicPension + privatePension;
      
      // Accumulate with 4% average return
      accumulatedPension = (accumulatedPension + totalContribution) * 1.04;
      
      // Estimated monthly pension at retirement
      const yearsToRetirement = Math.max(0, retirementAge - age);
      const projectedAccumulated = yearsToRetirement > 0 
        ? accumulatedPension * Math.pow(1.04, yearsToRetirement)
        : accumulatedPension;
      
      // State pension estimate (replacement rate on final salary)
      const finalSalaryEstimate = grossAnnualSalary[0] * Math.pow(1 + salaryGrowthRate[0] / 100, retirementAge - startAge);
      const statePensionMonthly = (finalSalaryEstimate * replacementRate) / 12;
      
      // Private pension drawdown (4% rule over 20 years)
      const privatePensionMonthly = (projectedAccumulated * 0.04) / 12;
      
      years.push({
        year,
        age,
        grossSalary: Math.round(salary),
        netSalary: Math.round(netResult.netAnnual),
        pensionContributions: Math.round(totalContribution),
        accumulatedPension: Math.round(accumulatedPension),
        estimatedMonthlyPension: Math.round(statePensionMonthly + privatePensionMonthly),
      });
    }
    
    return years;
  }, [selectedCountry, currentAge, grossAnnualSalary, salaryGrowthRate, privateContributionRate, fiscal, retirementAge, replacementRate]);
  
  const finalProjection = projection[projection.length - 1];
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR',
      maximumFractionDigits: 0 
    }).format(amount);
  };
  
  const getCountryName = (countryId: string) => {
    return countries.find(c => c.id === countryId)?.name || countryId;
  };
  
  const getPensionQuality = () => {
    if (replacementRate >= 0.7) return { label: t('retirement.excellent', 'Excellent'), color: 'text-green-600', bg: 'bg-green-500/10' };
    if (replacementRate >= 0.5) return { label: t('retirement.good', 'Bon'), color: 'text-yellow-600', bg: 'bg-yellow-500/10' };
    if (replacementRate >= 0.3) return { label: t('retirement.moderate', 'Modéré'), color: 'text-orange-600', bg: 'bg-orange-500/10' };
    return { label: t('retirement.low', 'Faible'), color: 'text-red-600', bg: 'bg-red-500/10' };
  };
  
  const pensionQuality = getPensionQuality();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PiggyBank className="w-5 h-5 text-primary" />
          {t('retirement.projectionTitle', 'Projection Retraite 10-20 ans')}
        </CardTitle>
        <CardDescription>
          {t('retirement.projectionDescription', 'Simulez votre capital retraite selon le pays et vos paramètres')}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Country Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">{t('common.country', 'Pays')}</label>
          <Select value={selectedCountry} onValueChange={setSelectedCountry}>
            <SelectTrigger>
              <SelectValue />
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
        
        {/* Parameters */}
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>{t('retirement.currentAge', 'Âge actuel')}</span>
              <span className="font-medium">{currentAge[0]} ans</span>
            </div>
            <Slider
              value={currentAge}
              onValueChange={setCurrentAge}
              min={20}
              max={60}
              step={1}
            />
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>{t('retirement.grossSalary', 'Salaire brut annuel')}</span>
              <span className="font-medium">{formatCurrency(grossAnnualSalary[0])}</span>
            </div>
            <Slider
              value={grossAnnualSalary}
              onValueChange={setGrossAnnualSalary}
              min={20000}
              max={200000}
              step={5000}
            />
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>{t('retirement.salaryGrowth', 'Croissance salariale/an')}</span>
              <span className="font-medium">{salaryGrowthRate[0]}%</span>
            </div>
            <Slider
              value={salaryGrowthRate}
              onValueChange={setSalaryGrowthRate}
              min={0}
              max={8}
              step={0.5}
            />
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>{t('retirement.privateContribution', 'Épargne privée/an')}</span>
              <span className="font-medium">{privateContributionRate[0]}%</span>
            </div>
            <Slider
              value={privateContributionRate}
              onValueChange={setPrivateContributionRate}
              min={0}
              max={20}
              step={1}
            />
          </div>
        </div>
        
        {/* Country Info Badges */}
        {fiscal && (
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {t('retirement.retirementAge', 'Retraite à')} {retirementAge} ans
            </Badge>
            <Badge variant="outline" className={cn("flex items-center gap-1", pensionQuality.bg)}>
              <Target className="w-3 h-3" />
              {t('retirement.replacementRate', 'Taux')}: {Math.round(replacementRate * 100)}%
            </Badge>
            <Badge variant="secondary" className={cn(pensionQuality.color)}>
              {pensionQuality.label}
            </Badge>
          </div>
        )}
        
        {/* Chart */}
        {projection.length > 0 && (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projection}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="age" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v) => `${v}ans`}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k€`}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    formatCurrency(value),
                    name === 'accumulatedPension' ? t('retirement.accumulated', 'Capital accumulé') :
                    name === 'netSalary' ? t('retirement.netSalary', 'Salaire net') :
                    name
                  ]}
                  labelFormatter={(age) => `${age} ans`}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="accumulatedPension"
                  name={t('retirement.accumulated', 'Capital retraite')}
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary) / 0.2)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="netSalary"
                  name={t('retirement.netSalary', 'Salaire net annuel')}
                  stroke="hsl(var(--muted-foreground))"
                  fill="hsl(var(--muted) / 0.3)"
                  strokeWidth={1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
        
        {/* Results Summary */}
        {finalProjection && (
          <div className="grid sm:grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center p-4 rounded-lg bg-primary/5">
              <div className="text-sm text-muted-foreground mb-1">
                {t('retirement.in20years', 'Dans 20 ans')}
              </div>
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(finalProjection.accumulatedPension)}
              </div>
              <div className="text-xs text-muted-foreground">
                {t('retirement.capitalAccumulated', 'Capital accumulé')}
              </div>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-sm text-muted-foreground mb-1">
                {t('retirement.estimatedPension', 'Pension estimée')}
              </div>
              <div className="text-2xl font-bold">
                {formatCurrency(finalProjection.estimatedMonthlyPension)}
                <span className="text-sm font-normal">/mois</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {t('retirement.stateAndPrivate', 'État + privé')}
              </div>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-sm text-muted-foreground mb-1">
                {t('retirement.totalContributions', 'Cotisations totales')}
              </div>
              <div className="text-2xl font-bold">
                {formatCurrency(projection.reduce((sum, p) => sum + p.pensionContributions, 0))}
              </div>
              <div className="text-xs text-muted-foreground">
                {t('retirement.over20years', 'Sur 20 ans')}
              </div>
            </div>
          </div>
        )}
        
        {/* Warnings */}
        {replacementRate === 0 && (
          <div className="flex items-start gap-2 p-4 rounded-lg bg-destructive/10 text-destructive">
            <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">{t('retirement.noPensionWarning', 'Pas de retraite publique pour expatriés')}</p>
              <p className="text-sm mt-1">
                {t('retirement.noPensionExplanation', 'Dans ce pays, les expatriés n\'ont pas accès au système de retraite public. Une épargne privée importante est essentielle.')}
              </p>
            </div>
          </div>
        )}
        
        {fiscal && fiscal.notes && (
          <div className="text-xs text-muted-foreground space-y-1">
            {fiscal.notes.slice(0, 2).map((note, i) => (
              <p key={i}>• {note}</p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default RetirementProjection;
