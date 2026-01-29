/**
 * Fiscal Scenario Simulator - Interactive tax scenario planning
 */
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calculator, 
  Building2, 
  User, 
  Coins, 
  TrendingUp,
  RefreshCw,
  Download,
  Lightbulb
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScenarioConfig {
  incomeType: 'salary' | 'freelance' | 'business' | 'dividend' | 'rental';
  annualIncome: number;
  country: string;
  familyStatus: 'single' | 'married' | 'married_children';
  hasCompany: boolean;
  investmentIncome: number;
  wealthAmount: number;
}

interface SimulationResult {
  totalTax: number;
  effectiveRate: number;
  netIncome: number;
  recommendations: string[];
}

const INCOME_TYPES = [
  { value: 'salary', label: 'Salaire', icon: User },
  { value: 'freelance', label: 'Freelance', icon: User },
  { value: 'business', label: 'Entreprise', icon: Building2 },
  { value: 'dividend', label: 'Dividendes', icon: Coins },
  { value: 'rental', label: 'Revenus locatifs', icon: Building2 },
];

const COUNTRIES = [
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'ES', name: 'Espagne', flag: '🇪🇸' },
  { code: 'CH', name: 'Suisse', flag: '🇨🇭' },
  { code: 'AE', name: 'Émirats Arabes Unis', flag: '🇦🇪' },
  { code: 'SG', name: 'Singapour', flag: '🇸🇬' },
  { code: 'MC', name: 'Monaco', flag: '🇲🇨' },
  { code: 'MT', name: 'Malte', flag: '🇲🇹' },
  { code: 'CY', name: 'Chypre', flag: '🇨🇾' },
  { code: 'AD', name: 'Andorre', flag: '🇦🇩' },
];

// Simplified tax calculation
function calculateTax(config: ScenarioConfig): SimulationResult {
  const rates: Record<string, { income: number; social: number; corporate: number }> = {
    'FR': { income: 0.30, social: 0.22, corporate: 0.25 },
    'PT': { income: 0.20, social: 0.11, corporate: 0.21 },
    'ES': { income: 0.24, social: 0.06, corporate: 0.25 },
    'CH': { income: 0.12, social: 0.13, corporate: 0.15 },
    'AE': { income: 0, social: 0, corporate: 0.09 },
    'SG': { income: 0.15, social: 0.20, corporate: 0.17 },
    'MC': { income: 0, social: 0.15, corporate: 0 },
    'MT': { income: 0.15, social: 0.10, corporate: 0.35 },
    'CY': { income: 0.20, social: 0.08, corporate: 0.125 },
    'AD': { income: 0.10, social: 0.05, corporate: 0.10 },
  };

  const rate = rates[config.country] || rates['FR'];
  let totalTax = 0;

  if (config.hasCompany && config.incomeType === 'business') {
    totalTax = config.annualIncome * rate.corporate;
  } else {
    totalTax = config.annualIncome * (rate.income + rate.social);
  }

  // Investment income tax
  if (config.investmentIncome > 0) {
    totalTax += config.investmentIncome * 0.30; // Flat tax approximation
  }

  const netIncome = config.annualIncome + config.investmentIncome - totalTax;
  const effectiveRate = (totalTax / (config.annualIncome + config.investmentIncome)) * 100;

  const recommendations: string[] = [];
  if (effectiveRate > 40) {
    recommendations.push('Envisager une structure holding pour optimiser');
  }
  if (config.country === 'FR' && config.annualIncome > 100000) {
    recommendations.push('Le régime NHR Portugal pourrait réduire votre imposition');
  }
  if (!config.hasCompany && config.incomeType === 'freelance') {
    recommendations.push('Créer une société pourrait être plus avantageux');
  }

  return { totalTax, effectiveRate, netIncome, recommendations };
}

export function FiscalScenarioSimulator() {
  const [config, setConfig] = useState<ScenarioConfig>({
    incomeType: 'salary',
    annualIncome: 80000,
    country: 'FR',
    familyStatus: 'single',
    hasCompany: false,
    investmentIncome: 0,
    wealthAmount: 0,
  });

  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const runSimulation = () => {
    setIsCalculating(true);
    setTimeout(() => {
      setResult(calculateTax(config));
      setIsCalculating(false);
    }, 500);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" />
          Simulateur de scénarios fiscaux
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="income" className="space-y-4">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="income">Revenus</TabsTrigger>
            <TabsTrigger value="structure">Structure</TabsTrigger>
            <TabsTrigger value="result">Résultat</TabsTrigger>
          </TabsList>

          <TabsContent value="income" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type de revenu principal</Label>
                <Select 
                  value={config.incomeType} 
                  onValueChange={(v) => setConfig({ ...config, incomeType: v as ScenarioConfig['incomeType'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INCOME_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="w-4 h-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Pays de résidence fiscale</Label>
                <Select 
                  value={config.country} 
                  onValueChange={(v) => setConfig({ ...config, country: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.flag} {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Revenu annuel brut</Label>
                <span className="font-bold text-primary">
                  {formatCurrency(config.annualIncome)}
                </span>
              </div>
              <Slider
                value={[config.annualIncome]}
                min={20000}
                max={500000}
                step={5000}
                onValueChange={([v]) => setConfig({ ...config, annualIncome: v })}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Revenus d'investissement (optionnel)</Label>
                <span className="font-medium">
                  {formatCurrency(config.investmentIncome)}
                </span>
              </div>
              <Slider
                value={[config.investmentIncome]}
                min={0}
                max={200000}
                step={5000}
                onValueChange={([v]) => setConfig({ ...config, investmentIncome: v })}
              />
            </div>
          </TabsContent>

          <TabsContent value="structure" className="space-y-4">
            <div className="space-y-2">
              <Label>Situation familiale</Label>
              <Select 
                value={config.familyStatus} 
                onValueChange={(v) => setConfig({ ...config, familyStatus: v as ScenarioConfig['familyStatus'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Célibataire</SelectItem>
                  <SelectItem value="married">Marié(e)</SelectItem>
                  <SelectItem value="married_children">Marié(e) avec enfants</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
              <div>
                <p className="font-medium">Structure sociétaire</p>
                <p className="text-sm text-muted-foreground">
                  Exercez-vous via une société ?
                </p>
              </div>
              <Switch
                checked={config.hasCompany}
                onCheckedChange={(v) => setConfig({ ...config, hasCompany: v })}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Patrimoine (pour ISF si applicable)</Label>
                <span className="font-medium">
                  {formatCurrency(config.wealthAmount)}
                </span>
              </div>
              <Slider
                value={[config.wealthAmount]}
                min={0}
                max={5000000}
                step={50000}
                onValueChange={([v]) => setConfig({ ...config, wealthAmount: v })}
              />
            </div>
          </TabsContent>

          <TabsContent value="result" className="space-y-4">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-center">
                      <p className="text-xs text-muted-foreground">Total imposé</p>
                      <p className="text-xl font-bold text-red-500">
                        {formatCurrency(result.totalTax)}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 text-center">
                      <p className="text-xs text-muted-foreground">Taux effectif</p>
                      <p className="text-xl font-bold text-amber-500">
                        {result.effectiveRate.toFixed(1)}%
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-center">
                      <p className="text-xs text-muted-foreground">Revenu net</p>
                      <p className="text-xl font-bold text-emerald-500">
                        {formatCurrency(result.netIncome)}
                      </p>
                    </div>
                  </div>

                  {result.recommendations.length > 0 && (
                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="w-4 h-4 text-primary" />
                        <span className="font-medium">Recommandations</span>
                      </div>
                      <ul className="space-y-1">
                        {result.recommendations.map((rec, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <TrendingUp className="w-3 h-3 mt-1 text-primary" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Configurez vos paramètres puis lancez la simulation</p>
                </div>
              )}
            </AnimatePresence>
          </TabsContent>
        </Tabs>

        <div className="flex gap-3 mt-6">
          <Button 
            onClick={runSimulation} 
            disabled={isCalculating}
            className="flex-1 gap-2"
          >
            {isCalculating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Calculator className="w-4 h-4" />
            )}
            Calculer
          </Button>
          {result && (
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Exporter
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
