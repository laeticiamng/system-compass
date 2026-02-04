import { useState, useMemo } from 'react';
import {
  Calculator,
  TrendingUp,
  DollarSign,
  BarChart3,
  Target,
  AlertTriangle,
  LineChart,
  Building2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from 'recharts';
import { cn } from '@/lib/utils';

// Types for financial modeling
interface DCFInputs {
  initialInvestment: number;
  projectedCashFlows: number[];
  discountRate: number;
  terminalGrowthRate: number;
  projectionYears: number;
}

interface MonteCarloResult {
  mean: number;
  median: number;
  stdDev: number;
  percentile5: number;
  percentile95: number;
  simulations: number[];
}

interface TaxScenario {
  country: string;
  grossIncome: number;
  socialCharges: number;
  incomeTax: number;
  wealthTax: number;
  capitalGainsTax: number;
  vatRecovery: number;
  netIncome: number;
  effectiveRate: number;
}

interface FinancialModelingProps {
  initialData?: Partial<DCFInputs>;
}

export function FinancialModeling({
  initialData
}: FinancialModelingProps) {
  const [activeModel, setActiveModel] = useState<'dcf' | 'montecarlo' | 'fiscal' | 'breakeven'>('dcf');
  
  // DCF Model State
  const [dcfInputs, setDcfInputs] = useState<DCFInputs>({
    initialInvestment: 50000,
    projectedCashFlows: [10000, 15000, 20000, 25000, 30000],
    discountRate: 8,
    terminalGrowthRate: 2,
    projectionYears: 5,
    ...initialData
  });
  
  // Monte Carlo State
  const [monteCarloParams, setMonteCarloParams] = useState({
    baseValue: 100000,
    meanReturn: 7,
    volatility: 15,
    years: 10,
    simulations: 1000,
  });
  
  // Tax Comparison State
  const [taxInputs, setTaxInputs] = useState({
    grossIncome: 100000,
    capitalGains: 20000,
    patrimony: 500000,
    familySize: 1,
  });

  // DCF Calculation
  const dcfResults = useMemo(() => {
    const { initialInvestment, projectedCashFlows, discountRate, terminalGrowthRate } = dcfInputs;
    const r = discountRate / 100;
    const g = terminalGrowthRate / 100;
    
    // Present Value of Cash Flows
    let pvCashFlows = 0;
    const yearlyPV: { year: number; cashFlow: number; pv: number; cumulative: number }[] = [];
    
    projectedCashFlows.forEach((cf, i) => {
      const pv = cf / Math.pow(1 + r, i + 1);
      pvCashFlows += pv;
      yearlyPV.push({
        year: i + 1,
        cashFlow: cf,
        pv: Math.round(pv),
        cumulative: Math.round(pvCashFlows),
      });
    });
    
    // Terminal Value (Gordon Growth Model)
    const lastCashFlow = projectedCashFlows[projectedCashFlows.length - 1];
    const terminalValue = (lastCashFlow * (1 + g)) / (r - g);
    const pvTerminal = terminalValue / Math.pow(1 + r, projectedCashFlows.length);
    
    // NPV
    const npv = pvCashFlows + pvTerminal - initialInvestment;
    
    // IRR (Newton-Raphson approximation)
    let irr = 0.1;
    for (let iter = 0; iter < 100; iter++) {
      let npvCalc = -initialInvestment;
      let derivative = 0;
      projectedCashFlows.forEach((cf, i) => {
        npvCalc += cf / Math.pow(1 + irr, i + 1);
        derivative -= (i + 1) * cf / Math.pow(1 + irr, i + 2);
      });
      npvCalc += terminalValue / Math.pow(1 + irr, projectedCashFlows.length);
      derivative -= projectedCashFlows.length * terminalValue / Math.pow(1 + irr, projectedCashFlows.length + 1);
      
      if (Math.abs(npvCalc) < 0.01) break;
      irr = irr - npvCalc / derivative;
    }
    
    // Payback Period
    let payback = 0;
    let cumulative = -initialInvestment;
    for (let i = 0; i < projectedCashFlows.length; i++) {
      cumulative += projectedCashFlows[i];
      if (cumulative >= 0) {
        payback = i + 1 - (cumulative / projectedCashFlows[i]);
        break;
      }
    }
    if (cumulative < 0) payback = -1; // Never pays back
    
    return {
      npv: Math.round(npv),
      irr: (irr * 100).toFixed(2),
      paybackPeriod: payback > 0 ? payback.toFixed(1) : 'N/A',
      pvCashFlows: Math.round(pvCashFlows),
      terminalValue: Math.round(terminalValue),
      pvTerminal: Math.round(pvTerminal),
      yearlyPV,
      profitabilityIndex: ((pvCashFlows + pvTerminal) / initialInvestment).toFixed(2),
    };
  }, [dcfInputs]);

  // Monte Carlo Simulation
  const monteCarloResults = useMemo((): MonteCarloResult => {
    const { baseValue, meanReturn, volatility, years, simulations } = monteCarloParams;
    const results: number[] = [];
    const mu = meanReturn / 100;
    const sigma = volatility / 100;
    
    for (let sim = 0; sim < simulations; sim++) {
      let value = baseValue;
      for (let y = 0; y < years; y++) {
        // Box-Muller transform for normal distribution
        const u1 = Math.random();
        const u2 = Math.random();
        const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        const return_ = mu + sigma * z;
        value *= (1 + return_);
      }
      results.push(value);
    }
    
    results.sort((a, b) => a - b);
    const mean = results.reduce((a, b) => a + b, 0) / results.length;
    const variance = results.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / results.length;
    
    return {
      mean: Math.round(mean),
      median: Math.round(results[Math.floor(results.length / 2)]),
      stdDev: Math.round(Math.sqrt(variance)),
      percentile5: Math.round(results[Math.floor(results.length * 0.05)]),
      percentile95: Math.round(results[Math.floor(results.length * 0.95)]),
      simulations: results,
    };
  }, [monteCarloParams]);

  // Tax Scenarios Comparison
  const taxScenarios: TaxScenario[] = useMemo(() => {
    const { grossIncome, capitalGains, patrimony } = taxInputs;
    
    // Simplified tax calculations for demonstration
    const scenarios: TaxScenario[] = [
      {
        country: 'France',
        grossIncome,
        socialCharges: grossIncome * 0.22,
        incomeTax: grossIncome > 150000 ? grossIncome * 0.41 : grossIncome * 0.30,
        wealthTax: patrimony > 1300000 ? (patrimony - 800000) * 0.005 : 0,
        capitalGainsTax: capitalGains * 0.30,
        vatRecovery: 0,
        netIncome: 0,
        effectiveRate: 0,
      },
      {
        country: 'Portugal (NHR)',
        grossIncome,
        socialCharges: grossIncome * 0.11,
        incomeTax: grossIncome * 0.20,
        wealthTax: 0,
        capitalGainsTax: capitalGains * 0.28,
        vatRecovery: 0,
        netIncome: 0,
        effectiveRate: 0,
      },
      {
        country: 'UAE (Dubai)',
        grossIncome,
        socialCharges: 0,
        incomeTax: 0,
        wealthTax: 0,
        capitalGainsTax: 0,
        vatRecovery: grossIncome * 0.05 * 0.5, // Simplified VAT impact
        netIncome: 0,
        effectiveRate: 0,
      },
      {
        country: 'Suisse (Genève)',
        grossIncome,
        socialCharges: grossIncome * 0.13,
        incomeTax: grossIncome * 0.35,
        wealthTax: patrimony * 0.01,
        capitalGainsTax: 0,
        vatRecovery: 0,
        netIncome: 0,
        effectiveRate: 0,
      },
    ];
    
    return scenarios.map(s => {
      const totalTax = s.socialCharges + s.incomeTax + s.wealthTax + s.capitalGainsTax - s.vatRecovery;
      s.netIncome = s.grossIncome + capitalGains - totalTax;
      s.effectiveRate = (totalTax / (s.grossIncome + capitalGains)) * 100;
      return s;
    });
  }, [taxInputs]);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
  };

  // Monte Carlo distribution data for chart
  const distributionData = useMemo(() => {
    const buckets = 20;
    const min = monteCarloResults.percentile5 * 0.8;
    const max = monteCarloResults.percentile95 * 1.2;
    const step = (max - min) / buckets;
    
    const data: { range: string; count: number; percentage: number }[] = [];
    for (let i = 0; i < buckets; i++) {
      const lower = min + i * step;
      const upper = lower + step;
      const count = monteCarloResults.simulations.filter(v => v >= lower && v < upper).length;
      data.push({
        range: `${formatCurrency(lower)}`,
        count,
        percentage: (count / monteCarloParams.simulations) * 100,
      });
    }
    return data;
  }, [monteCarloResults, monteCarloParams.simulations]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card rounded-xl p-6 border-l-4 border-primary">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-primary/10">
            <Calculator className="w-8 h-8 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="font-display text-2xl font-bold mb-2">
              Modélisation Financière Avancée
            </h2>
            <p className="text-muted-foreground">
              Outils quantitatifs de niveau CFA/MBA pour l'analyse financière, 
              la valorisation d'actifs et l'optimisation fiscale internationale.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="outline" className="gap-1">
                <TrendingUp className="w-3 h-3" />
                DCF Analysis
              </Badge>
              <Badge variant="outline">Monte Carlo</Badge>
              <Badge variant="outline">Fiscalité Internationale</Badge>
              <Badge variant="outline">Break-Even</Badge>
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeModel} onValueChange={(v) => setActiveModel(v as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dcf" className="gap-2">
            <LineChart className="w-4 h-4" />
            DCF
          </TabsTrigger>
          <TabsTrigger value="montecarlo" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Monte Carlo
          </TabsTrigger>
          <TabsTrigger value="fiscal" className="gap-2">
            <Building2 className="w-4 h-4" />
            Fiscal
          </TabsTrigger>
          <TabsTrigger value="breakeven" className="gap-2">
            <Target className="w-4 h-4" />
            Break-Even
          </TabsTrigger>
        </TabsList>

        {/* DCF Analysis */}
        <TabsContent value="dcf" className="space-y-6 mt-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Inputs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Paramètres DCF
                </CardTitle>
                <CardDescription>
                  Discounted Cash Flow - Méthode de valorisation basée sur l'actualisation 
                  des flux de trésorerie futurs (Warren Buffett, McKinsey).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Investissement Initial</Label>
                  <Input
                    type="number"
                    value={dcfInputs.initialInvestment}
                    onChange={(e) => setDcfInputs(prev => ({ ...prev, initialInvestment: Number(e.target.value) }))}
                  />
                </div>
                
                <div>
                  <Label>Taux d'actualisation (WACC): {dcfInputs.discountRate}%</Label>
                  <Slider
                    value={[dcfInputs.discountRate]}
                    onValueChange={([v]) => setDcfInputs(prev => ({ ...prev, discountRate: v }))}
                    min={1}
                    max={20}
                    step={0.5}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Coût moyen pondéré du capital (WACC = Weighted Average Cost of Capital)
                  </p>
                </div>
                
                <div>
                  <Label>Taux de croissance terminal: {dcfInputs.terminalGrowthRate}%</Label>
                  <Slider
                    value={[dcfInputs.terminalGrowthRate]}
                    onValueChange={([v]) => setDcfInputs(prev => ({ ...prev, terminalGrowthRate: v }))}
                    min={0}
                    max={5}
                    step={0.25}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Croissance perpétuelle après la période de projection (modèle Gordon)
                  </p>
                </div>
                
                <div>
                  <Label className="mb-2 block">Cash Flows Projetés (par année)</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {dcfInputs.projectedCashFlows.map((cf, i) => (
                      <Input
                        key={i}
                        type="number"
                        value={cf}
                        onChange={(e) => {
                          const newCFs = [...dcfInputs.projectedCashFlows];
                          newCFs[i] = Number(e.target.value);
                          setDcfInputs(prev => ({ ...prev, projectedCashFlows: newCFs }));
                        }}
                        className="text-center"
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            <Card>
              <CardHeader>
                <CardTitle>Résultats de Valorisation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className={cn(
                    "p-4 rounded-lg text-center",
                    dcfResults.npv >= 0 ? "bg-green-500/10" : "bg-red-500/10"
                  )}>
                    <p className="text-sm text-muted-foreground">VAN (NPV)</p>
                    <p className={cn(
                      "text-2xl font-bold",
                      dcfResults.npv >= 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {formatCurrency(dcfResults.npv)}
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-primary/10 text-center">
                    <p className="text-sm text-muted-foreground">TRI (IRR)</p>
                    <p className="text-2xl font-bold text-primary">{dcfResults.irr}%</p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-muted text-center">
                    <p className="text-sm text-muted-foreground">Délai de récupération</p>
                    <p className="text-xl font-bold">{dcfResults.paybackPeriod} ans</p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-muted text-center">
                    <p className="text-sm text-muted-foreground">Indice de rentabilité</p>
                    <p className="text-xl font-bold">{dcfResults.profitabilityIndex}x</p>
                  </div>
                </div>
                
                {/* Chart */}
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={dcfResults.yearlyPV}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={(v) => `${v/1000}k`} />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Area 
                      type="monotone" 
                      dataKey="cumulative" 
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary) / 0.2)" 
                      name="PV Cumulée"
                    />
                  </AreaChart>
                </ResponsiveContainer>
                
                <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm">
                  <p className="font-medium mb-1">Interprétation :</p>
                  <p className="text-muted-foreground">
                    {dcfResults.npv >= 0 
                      ? `Le projet crée de la valeur (NPV > 0). Le TRI de ${dcfResults.irr}% est ${parseFloat(dcfResults.irr) > dcfInputs.discountRate ? 'supérieur' : 'inférieur'} au coût du capital.`
                      : "Le projet détruit de la valeur. À reconsidérer ou restructurer."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Monte Carlo */}
        <TabsContent value="montecarlo" className="space-y-6 mt-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Simulation Monte Carlo
                </CardTitle>
                <CardDescription>
                  Méthode stochastique pour modéliser l'incertitude et les distributions 
                  de probabilité des rendements (utilisée par Goldman Sachs, JP Morgan).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Valeur initiale du patrimoine</Label>
                  <Input
                    type="number"
                    value={monteCarloParams.baseValue}
                    onChange={(e) => setMonteCarloParams(prev => ({ ...prev, baseValue: Number(e.target.value) }))}
                  />
                </div>
                
                <div>
                  <Label>Rendement annuel moyen attendu: {monteCarloParams.meanReturn}%</Label>
                  <Slider
                    value={[monteCarloParams.meanReturn]}
                    onValueChange={([v]) => setMonteCarloParams(prev => ({ ...prev, meanReturn: v }))}
                    min={0}
                    max={15}
                    step={0.5}
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label>Volatilité (écart-type): {monteCarloParams.volatility}%</Label>
                  <Slider
                    value={[monteCarloParams.volatility]}
                    onValueChange={([v]) => setMonteCarloParams(prev => ({ ...prev, volatility: v }))}
                    min={5}
                    max={40}
                    step={1}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Mesure du risque - S&P 500 historique ≈ 15%, Crypto ≈ 80%
                  </p>
                </div>
                
                <div>
                  <Label>Horizon temporel: {monteCarloParams.years} ans</Label>
                  <Slider
                    value={[monteCarloParams.years]}
                    onValueChange={([v]) => setMonteCarloParams(prev => ({ ...prev, years: v }))}
                    min={1}
                    max={30}
                    step={1}
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label>Nombre de simulations: {monteCarloParams.simulations.toLocaleString()}</Label>
                  <Slider
                    value={[monteCarloParams.simulations]}
                    onValueChange={([v]) => setMonteCarloParams(prev => ({ ...prev, simulations: v }))}
                    min={100}
                    max={10000}
                    step={100}
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribution des Résultats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="p-3 rounded-lg bg-red-500/10 text-center">
                    <p className="text-xs text-muted-foreground">5ème percentile</p>
                    <p className="text-lg font-bold text-red-600">{formatCurrency(monteCarloResults.percentile5)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-primary/10 text-center">
                    <p className="text-xs text-muted-foreground">Médiane</p>
                    <p className="text-lg font-bold text-primary">{formatCurrency(monteCarloResults.median)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-green-500/10 text-center">
                    <p className="text-xs text-muted-foreground">95ème percentile</p>
                    <p className="text-lg font-bold text-green-600">{formatCurrency(monteCarloResults.percentile95)}</p>
                  </div>
                </div>
                
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={distributionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                    <YAxis tickFormatter={(v) => `${v}%`} />
                    <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} />
                    <Bar dataKey="percentage" fill="hsl(var(--primary))" name="Probabilité" />
                  </BarChart>
                </ResponsiveContainer>
                
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-muted-foreground">Moyenne</p>
                    <p className="font-bold">{formatCurrency(monteCarloResults.mean)}</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-muted-foreground">Écart-type</p>
                    <p className="font-bold">{formatCurrency(monteCarloResults.stdDev)}</p>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-amber-500/10 rounded-lg text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span className="font-medium">Value at Risk (VaR 95%)</span>
                  </div>
                  <p className="text-muted-foreground">
                    Il y a 5% de chances que votre patrimoine soit inférieur à {formatCurrency(monteCarloResults.percentile5)} 
                    après {monteCarloParams.years} ans.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Fiscal Optimization */}
        <TabsContent value="fiscal" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Comparateur Fiscal International
              </CardTitle>
              <CardDescription>
                Analyse comparative de la charge fiscale totale selon les juridictions. 
                Inclut IR, cotisations sociales, ISF/IFI et plus-values.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <div>
                  <Label>Revenu brut annuel</Label>
                  <Input
                    type="number"
                    value={taxInputs.grossIncome}
                    onChange={(e) => setTaxInputs(prev => ({ ...prev, grossIncome: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label>Plus-values annuelles</Label>
                  <Input
                    type="number"
                    value={taxInputs.capitalGains}
                    onChange={(e) => setTaxInputs(prev => ({ ...prev, capitalGains: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label>Patrimoine net</Label>
                  <Input
                    type="number"
                    value={taxInputs.patrimony}
                    onChange={(e) => setTaxInputs(prev => ({ ...prev, patrimony: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label>Parts fiscales</Label>
                  <Input
                    type="number"
                    value={taxInputs.familySize}
                    onChange={(e) => setTaxInputs(prev => ({ ...prev, familySize: Number(e.target.value) }))}
                  />
                </div>
              </div>
              
              {/* Tax Comparison Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3">Pays</th>
                      <th className="text-right p-3">Cotisations</th>
                      <th className="text-right p-3">IR</th>
                      <th className="text-right p-3">ISF/IFI</th>
                      <th className="text-right p-3">Plus-values</th>
                      <th className="text-right p-3 font-bold">Net après impôts</th>
                      <th className="text-right p-3">Taux effectif</th>
                    </tr>
                  </thead>
                  <tbody>
                    {taxScenarios.sort((a, b) => b.netIncome - a.netIncome).map((scenario, idx) => (
                      <tr 
                        key={scenario.country} 
                        className={cn(
                          "border-b hover:bg-muted/30",
                          idx === 0 && "bg-green-500/5"
                        )}
                      >
                        <td className="p-3 font-medium">
                          {scenario.country}
                          {idx === 0 && <Badge className="ml-2 text-xs" variant="default">Optimal</Badge>}
                        </td>
                        <td className="text-right p-3 text-red-500">-{formatCurrency(scenario.socialCharges)}</td>
                        <td className="text-right p-3 text-red-500">-{formatCurrency(scenario.incomeTax)}</td>
                        <td className="text-right p-3 text-red-500">-{formatCurrency(scenario.wealthTax)}</td>
                        <td className="text-right p-3 text-red-500">-{formatCurrency(scenario.capitalGainsTax)}</td>
                        <td className="text-right p-3 font-bold text-green-600">{formatCurrency(scenario.netIncome)}</td>
                        <td className="text-right p-3">
                          <Badge variant={scenario.effectiveRate < 30 ? "default" : scenario.effectiveRate < 50 ? "secondary" : "destructive"}>
                            {scenario.effectiveRate.toFixed(1)}%
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Avertissement Important
                </h4>
                <p className="text-sm text-muted-foreground">
                  Cette simulation est indicative et simplifiée. La fiscalité internationale dépend de nombreux facteurs : 
                  conventions fiscales bilatérales, résidence fiscale effective, source des revenus, structures juridiques, etc. 
                  Consultez un avocat fiscaliste pour toute décision.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Break-Even Analysis */}
        <TabsContent value="breakeven" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Analyse du Point Mort
              </CardTitle>
              <CardDescription>
                Détermination du seuil de rentabilité pour les projets de relocalisation 
                ou d'investissement international.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Analyse Break-Even en développement</p>
                <p className="text-sm">Calcul du point mort financier pour votre projet de relocalisation</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default FinancialModeling;
