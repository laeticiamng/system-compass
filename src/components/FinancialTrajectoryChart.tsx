import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { 
  TrendingUp, 
  BarChart3, 
  Radar as RadarIcon,
  Plus,
  X
} from 'lucide-react';
import { FISCAL_SYSTEMS_EXTENDED, calculateNetSalary, type NetSalaryResult } from '@/lib/fiscal-data';
import { countries } from '@/lib/countries-data';
import { cn } from '@/lib/utils';

interface FinancialTrajectoryChartProps {
  className?: string;
}

type ChartType = 'line' | 'bar' | 'radar';

const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(142, 76%, 36%)', // green
  'hsl(38, 92%, 50%)',  // orange
  'hsl(280, 65%, 60%)', // purple
  'hsl(199, 89%, 48%)', // blue
];

const getFlagEmoji = (iso2: string): string => {
  if (!iso2) return '';
  const codePoints = iso2.toUpperCase().split('').map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

// Base salaries for comparison (same profession across countries)
const BASE_SALARIES: Record<string, number> = {
  france: 50000, germany: 58000, switzerland: 95000, usa: 70000, uk: 52000,
  uae: 80000, singapore: 72000, canada: 60000, cameroon: 8000, japan: 55000,
  spain: 38000, portugal: 28000, italy: 40000, morocco: 15000, netherlands: 58000,
  senegal: 12000, cote_divoire: 14000, turkey: 18000, brazil: 20000, poland: 30000,
  greece: 28000, thailand: 18000, vietnam: 12000, australia: 75000, mexico: 22000,
  argentina: 15000, colombia: 16000,
};

export function FinancialTrajectoryChart({ className }: FinancialTrajectoryChartProps) {
  const { t } = useTranslation();
  
  const fiscalCountryIds = Object.keys(FISCAL_SYSTEMS_EXTENDED);
  const fiscalCountries = countries.filter(c => fiscalCountryIds.includes(c.id));
  
  const [selectedCountries, setSelectedCountries] = useState<string[]>(['france', 'germany', 'portugal']);
  const [chartType, setChartType] = useState<ChartType>('line');
  const [addingCountry, setAddingCountry] = useState(false);
  
  const addCountry = (countryId: string) => {
    if (selectedCountries.length < 5 && !selectedCountries.includes(countryId)) {
      setSelectedCountries([...selectedCountries, countryId]);
    }
    setAddingCountry(false);
  };
  
  const removeCountry = (countryId: string) => {
    if (selectedCountries.length > 1) {
      setSelectedCountries(selectedCountries.filter(c => c !== countryId));
    }
  };
  
  // Calculate 10-year trajectory for each country
  const trajectoryData = useMemo(() => {
    const years = Array.from({ length: 11 }, (_, i) => i);
    
    return years.map(yearIndex => {
      const dataPoint: Record<string, number | string> = {
        year: new Date().getFullYear() + yearIndex,
        yearLabel: `+${yearIndex}`,
      };
      
      selectedCountries.forEach(countryId => {
        const baseSalary = BASE_SALARIES[countryId] || 40000;
        // Assume 3% annual salary growth
        const salary = baseSalary * Math.pow(1.03, yearIndex);
        const result = calculateNetSalary(countryId, salary);
        
        if (result) {
          // Use purchasing power adjusted monthly
          dataPoint[countryId] = Math.round(result.purchasingPowerAdjusted);
        }
      });
      
      return dataPoint;
    });
  }, [selectedCountries]);
  
  // Comparison data for bar chart
  const comparisonData = useMemo(() => {
    return selectedCountries.map(countryId => {
      const baseSalary = BASE_SALARIES[countryId] || 40000;
      const result = calculateNetSalary(countryId, baseSalary);
      const fiscal = FISCAL_SYSTEMS_EXTENDED[countryId];
      const country = countries.find(c => c.id === countryId);
      
      return {
        countryId,
        name: country?.name || countryId,
        flag: getFlagEmoji(country?.iso2 || ''),
        grossSalary: baseSalary,
        netMonthly: result?.netMonthly || 0,
        purchasingPower: result?.purchasingPowerAdjusted || 0,
        effectiveTaxRate: result?.effectiveTotalRate || 0,
        healthcareCost: result?.totalHealthcareCost || 0,
        costOfLiving: fiscal?.costOfLivingMultiplier || 1,
      };
    });
  }, [selectedCountries]);
  
  // Radar data for multi-dimensional comparison
  const radarData = useMemo(() => {
    const metrics = [
      { key: 'netSalary', label: t('trajectory.netSalary', 'Salaire Net') },
      { key: 'purchasingPower', label: t('trajectory.purchasingPower', 'Pouvoir Achat') },
      { key: 'lowTaxes', label: t('trajectory.lowTaxes', 'Fiscalité') },
      { key: 'healthcare', label: t('trajectory.healthcare', 'Santé') },
      { key: 'costOfLiving', label: t('trajectory.costOfLiving', 'Coût Vie') },
    ];
    
    return metrics.map(metric => {
      const point: Record<string, string | number> = { metric: metric.label };
      
      selectedCountries.forEach(countryId => {
        const data = comparisonData.find(c => c.countryId === countryId);
        if (!data) return;
        
        // Normalize to 0-100 scale
        let value = 0;
        switch (metric.key) {
          case 'netSalary':
            value = Math.min(100, (data.netMonthly / 6000) * 100);
            break;
          case 'purchasingPower':
            value = Math.min(100, (data.purchasingPower / 5000) * 100);
            break;
          case 'lowTaxes':
            value = Math.max(0, 100 - data.effectiveTaxRate * 2);
            break;
          case 'healthcare':
            value = Math.max(0, 100 - (data.healthcareCost / 50));
            break;
          case 'costOfLiving':
            value = Math.max(0, 100 - (data.costOfLiving * 50));
            break;
        }
        
        point[countryId] = Math.round(value);
      });
      
      return point;
    });
  }, [selectedCountries, comparisonData, t]);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR',
      maximumFractionDigits: 0 
    }).format(value);
  };
  
  const getCountryName = (countryId: string) => {
    return countries.find(c => c.id === countryId)?.name || countryId;
  };
  
  const getCountryIso = (countryId: string) => {
    return countries.find(c => c.id === countryId)?.iso2 || '';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              {t('trajectory.title', 'Trajectoire Financière Comparée')}
            </CardTitle>
            <CardDescription>
              {t('trajectory.description', 'Comparez l\'évolution du pouvoir d\'achat sur 10 ans')}
            </CardDescription>
          </div>
          
          {/* Chart Type Selector */}
          <div className="flex gap-1">
            <Button
              variant={chartType === 'line' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('line')}
            >
              <TrendingUp className="w-4 h-4" />
            </Button>
            <Button
              variant={chartType === 'bar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('bar')}
            >
              <BarChart3 className="w-4 h-4" />
            </Button>
            <Button
              variant={chartType === 'radar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('radar')}
            >
              <RadarIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Country Selection */}
        <div className="flex flex-wrap gap-2">
          {selectedCountries.map((countryId, index) => (
            <Badge
              key={countryId}
              variant="secondary"
              className="flex items-center gap-1 py-1.5 px-3"
              style={{ borderColor: CHART_COLORS[index] }}
            >
              <span 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: CHART_COLORS[index] }}
              />
              {getFlagEmoji(getCountryIso(countryId))} {getCountryName(countryId)}
              {selectedCountries.length > 1 && (
                <button 
                  onClick={() => removeCountry(countryId)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </Badge>
          ))}
          
          {selectedCountries.length < 5 && (
            addingCountry ? (
              <Select onValueChange={addCountry}>
                <SelectTrigger className="w-[180px] h-8">
                  <SelectValue placeholder={t('trajectory.addCountry', 'Ajouter...')} />
                </SelectTrigger>
                <SelectContent>
                  {fiscalCountries
                    .filter(c => !selectedCountries.includes(c.id))
                    .map(country => (
                      <SelectItem key={country.id} value={country.id}>
                        {getFlagEmoji(country.iso2)} {country.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAddingCountry(true)}
              >
                <Plus className="w-4 h-4 mr-1" />
                {t('trajectory.addCountry', 'Ajouter')}
              </Button>
            )
          )}
        </div>
        
        {/* Chart */}
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <LineChart data={trajectoryData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="yearLabel" tick={{ fontSize: 12 }} />
                <YAxis 
                  tick={{ fontSize: 12 }} 
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k€`}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    formatCurrency(value),
                    getCountryName(name)
                  ]}
                  labelFormatter={(label) => `Année ${label}`}
                />
                <Legend formatter={(value) => getCountryName(value)} />
                {selectedCountries.map((countryId, index) => (
                  <Line
                    key={countryId}
                    type="monotone"
                    dataKey={countryId}
                    name={countryId}
                    stroke={CHART_COLORS[index]}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                ))}
              </LineChart>
            ) : chartType === 'bar' ? (
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => v.length > 10 ? v.slice(0, 10) + '...' : v}
                />
                <YAxis 
                  tick={{ fontSize: 12 }} 
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k€`}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    formatCurrency(value),
                    name === 'netMonthly' ? t('trajectory.netMonthly', 'Net mensuel') :
                    name === 'purchasingPower' ? t('trajectory.purchasingPower', 'Pouvoir d\'achat') :
                    name
                  ]}
                />
                <Legend />
                <Bar 
                  dataKey="netMonthly" 
                  name={t('trajectory.netMonthly', 'Net mensuel')}
                  fill="hsl(var(--primary))" 
                />
                <Bar 
                  dataKey="purchasingPower" 
                  name={t('trajectory.purchasingPower', 'Pouvoir achat')}
                  fill="hsl(var(--muted-foreground))" 
                />
              </BarChart>
            ) : (
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                {selectedCountries.map((countryId, index) => (
                  <Radar
                    key={countryId}
                    name={getCountryName(countryId)}
                    dataKey={countryId}
                    stroke={CHART_COLORS[index]}
                    fill={CHART_COLORS[index]}
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                ))}
                <Legend />
              </RadarChart>
            )}
          </ResponsiveContainer>
        </div>
        
        {/* Summary Cards */}
        <div className="grid sm:grid-cols-3 gap-4 pt-4 border-t">
          {comparisonData.slice(0, 3).map((country, index) => (
            <div 
              key={country.countryId}
              className="p-3 rounded-lg border"
              style={{ borderLeftColor: CHART_COLORS[index], borderLeftWidth: 3 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{country.flag}</span>
                <span className="font-medium text-sm">{country.name}</span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('trajectory.netMonthly', 'Net/mois')}</span>
                  <span className="font-medium">{formatCurrency(country.netMonthly)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('trajectory.purchasingPower', 'Pouvoir achat')}</span>
                  <span className="font-medium">{formatCurrency(country.purchasingPower)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('trajectory.taxes', 'Prélèvements')}</span>
                  <span className="font-medium text-destructive">{country.effectiveTaxRate.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default FinancialTrajectoryChart;
