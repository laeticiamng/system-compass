import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { Calculator, ArrowRight, Download, TrendingUp, TrendingDown, Equal, Heart, Briefcase, Home, PiggyBank } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  FISCAL_SYSTEMS, 
  FISCAL_SYSTEMS_EXTENDED, 
  calculateNetSalary, 
  compareSalaries,
  getFiscalSummary,
  type NetSalaryResult 
} from '@/lib/fiscal-data';
import { exportFiscalComparisonPDF, exportSingleCountryPDF } from '@/lib/fiscal-pdf-export';
import { cn } from '@/lib/utils';

const COUNTRY_NAMES: Record<string, string> = {
  france: '🇫🇷 France',
  germany: '🇩🇪 Allemagne',
  switzerland: '🇨🇭 Suisse',
  usa: '🇺🇸 États-Unis',
  uk: '🇬🇧 Royaume-Uni',
  uae: '🇦🇪 Émirats Arabes Unis',
  singapore: '🇸🇬 Singapour',
  canada: '🇨🇦 Canada',
  cameroon: '🇨🇲 Cameroun',
  morocco: '🇲🇦 Maroc',
  spain: '🇪🇸 Espagne',
  portugal: '🇵🇹 Portugal',
  netherlands: '🇳🇱 Pays-Bas',
  belgium: '🇧🇪 Belgique',
  italy: '🇮🇹 Italie',
  japan: '🇯🇵 Japon',
  australia: '🇦🇺 Australie',
  brazil: '🇧🇷 Brésil',
  mexico: '🇲🇽 Mexique',
  india: '🇮🇳 Inde',
};

const availableCountries = Object.keys({ ...FISCAL_SYSTEMS, ...FISCAL_SYSTEMS_EXTENDED });

function formatCurrency(amount: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function SalaryBreakdownCard({ result, countryName }: { result: NetSalaryResult; countryName: string }) {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" />
          {countryName}
        </CardTitle>
        <CardDescription>
          Salaire brut: {formatCurrency(result.grossAnnual)}/an
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Net salary highlight */}
        <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
          <div className="text-sm text-muted-foreground">Salaire net mensuel</div>
          <div className="text-3xl font-bold text-primary">
            {formatCurrency(result.netMonthly)}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {formatCurrency(result.netAnnual)}/an
          </div>
        </div>
        
        {/* Breakdown */}
        <div className="space-y-3">
          {result.breakdown.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{item.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {formatCurrency(item.amount)}
                </span>
                <Badge variant="outline" className="text-xs">
                  {item.percentage.toFixed(1)}%
                </Badge>
              </div>
            </div>
          ))}
        </div>
        
        {/* Effective rates */}
        <div className="pt-4 border-t border-border space-y-2">
          <div className="flex justify-between text-sm">
            <span>Taux d'imposition effectif</span>
            <span className="font-medium">{result.effectiveTaxRate.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Taux total (impôts + charges)</span>
            <span className="font-medium">{result.effectiveTotalRate.toFixed(1)}%</span>
          </div>
          <Progress value={result.effectiveTotalRate} className="h-2" />
        </div>
        
        {/* Healthcare */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-4 h-4 text-red-400" />
            <span className="text-sm font-medium">Santé</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Coût annuel estimé: {formatCurrency(result.totalHealthcareCost)}
          </div>
        </div>
        
        {/* Purchasing power */}
        <div className="p-3 bg-secondary/50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <PiggyBank className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium">Pouvoir d'achat ajusté</span>
          </div>
          <div className="text-xl font-bold">
            {formatCurrency(result.purchasingPowerAdjusted)}/mois
          </div>
          <div className="text-xs text-muted-foreground">
            Ajusté au coût de la vie local
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ComparisonResult({ 
  origin, 
  destination, 
  originName, 
  destinationName,
  analysis 
}: { 
  origin: NetSalaryResult;
  destination: NetSalaryResult;
  originName: string;
  destinationName: string;
  analysis: string[];
}) {
  const netDiff = destination.netMonthly - origin.netMonthly;
  const ppDiff = destination.purchasingPowerAdjusted - origin.purchasingPowerAdjusted;
  
  return (
    <Card className="glass-card border-primary/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Analyse comparative
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Net difference */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-secondary/50 rounded-lg text-center">
            <div className="text-sm text-muted-foreground mb-1">Différence nette</div>
            <div className={cn(
              "text-2xl font-bold",
              netDiff > 0 ? "text-emerald-400" : netDiff < 0 ? "text-red-400" : "text-muted-foreground"
            )}>
              {netDiff > 0 ? '+' : ''}{formatCurrency(netDiff)}/mois
            </div>
          </div>
          
          <div className="p-4 bg-secondary/50 rounded-lg text-center">
            <div className="text-sm text-muted-foreground mb-1">Pouvoir d'achat</div>
            <div className={cn(
              "text-2xl font-bold",
              ppDiff > 0 ? "text-emerald-400" : ppDiff < 0 ? "text-red-400" : "text-muted-foreground"
            )}>
              {ppDiff > 0 ? '+' : ''}{formatCurrency(ppDiff)}/mois
            </div>
          </div>
        </div>
        
        {/* Winner */}
        <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
          <div className="flex items-center justify-center gap-2">
            {ppDiff > 0 ? (
              <>
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <span className="font-medium">
                  {destinationName} offre un meilleur pouvoir d'achat
                </span>
              </>
            ) : ppDiff < 0 ? (
              <>
                <TrendingDown className="w-5 h-5 text-red-400" />
                <span className="font-medium">
                  {originName} offre un meilleur pouvoir d'achat
                </span>
              </>
            ) : (
              <>
                <Equal className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">Pouvoir d'achat équivalent</span>
              </>
            )}
          </div>
        </div>
        
        {/* Analysis points */}
        <div className="space-y-2">
          {analysis.map((point, index) => (
            <div key={index} className="flex items-start gap-2 text-sm">
              <span className="text-primary">•</span>
              <span>{point}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function FiscalCalculator() {
  const { t } = useTranslation();
  
  // State
  const [originCountry, setOriginCountry] = useState('france');
  const [destinationCountry, setDestinationCountry] = useState('');
  const [grossSalary, setGrossSalary] = useState(50000);
  const [destinationSalary, setDestinationSalary] = useState(50000);
  const [activeTab, setActiveTab] = useState('single');
  
  // Calculations
  const originResult = useMemo(() => 
    calculateNetSalary(originCountry, grossSalary), 
    [originCountry, grossSalary]
  );
  
  const comparison = useMemo(() => {
    if (!destinationCountry) return null;
    return compareSalaries(originCountry, grossSalary, destinationCountry, destinationSalary);
  }, [originCountry, grossSalary, destinationCountry, destinationSalary]);
  
  const originSummary = useMemo(() => getFiscalSummary(originCountry), [originCountry]);
  
  const handleExportPDF = () => {
    if (comparison && comparison.country1 && comparison.country2) {
      exportFiscalComparisonPDF({
        originCountry,
        originCountryName: COUNTRY_NAMES[originCountry] || originCountry,
        originResult: comparison.country1,
        destinationCountry,
        destinationCountryName: COUNTRY_NAMES[destinationCountry] || destinationCountry,
        destinationResult: comparison.country2,
        analysis: comparison.analysis,
      });
      toast.success(t('toast.fiscal.pdfGenerated', 'PDF généré avec succès !'));
    } else if (originResult) {
      exportSingleCountryPDF(
        originCountry,
        COUNTRY_NAMES[originCountry] || originCountry,
        originResult
      );
      toast.success(t('toast.fiscal.pdfGenerated', 'PDF généré avec succès !'));
    }
  };
  
  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <Helmet>
        <title>Simulateur Fiscal International - System Compass</title>
        <meta name="description" content="Calculez votre salaire net et pouvoir d'achat dans 20 pays. Comparaison fiscale incluant impôts, charges sociales, coût de la vie et couverture santé." />
        <link rel="canonical" href="https://system-compass.app/fiscal-calculator" />
        <meta property="og:title" content="Simulateur Fiscal International - System Compass" />
        <meta property="og:description" content="Comparez votre salaire net et pouvoir d'achat entre 20 pays." />
        <meta property="og:url" content="https://system-compass.app/fiscal-calculator" />
      </Helmet>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-4 flex items-center justify-center gap-3">
          <Calculator className="w-8 h-8 text-primary" />
          {t('fiscalCalculator.title', 'Calculateur Fiscal')}
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {t('fiscalCalculator.description', 'Comparez votre salaire net et pouvoir d\'achat entre 20 pays. Incluant impôts, charges sociales, et coût de la vie.')}
        </p>
      </div>
      
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
          <TabsTrigger value="single">Simulation simple</TabsTrigger>
          <TabsTrigger value="compare">Comparaison</TabsTrigger>
        </TabsList>
        
        <TabsContent value="single" className="space-y-6">
          {/* Input Card */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Paramètres</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Pays</Label>
                <Select value={originCountry} onValueChange={setOriginCountry}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCountries.map(id => (
                      <SelectItem key={id} value={id}>
                        {COUNTRY_NAMES[id] || id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Salaire brut annuel (€)</Label>
                <Input
                  type="number"
                  value={grossSalary}
                  onChange={(e) => setGrossSalary(Number(e.target.value))}
                  min={0}
                  step={1000}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Results */}
          <div className="grid md:grid-cols-2 gap-6">
            {originResult && (
              <SalaryBreakdownCard 
                result={originResult} 
                countryName={COUNTRY_NAMES[originCountry] || originCountry} 
              />
            )}
            
            {/* Fiscal Summary */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  Résumé fiscal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {originSummary.map((item, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <span>{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="compare" className="space-y-6">
          {/* Comparison Inputs */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Comparer deux situations
                <ArrowRight className="w-5 h-5 text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                {/* Origin */}
                <div className="space-y-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <Home className="w-4 h-4" />
                    Situation actuelle
                  </h3>
                  <div className="space-y-2">
                    <Label>Pays d'origine</Label>
                    <Select value={originCountry} onValueChange={setOriginCountry}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCountries.map(id => (
                          <SelectItem key={id} value={id}>
                            {COUNTRY_NAMES[id] || id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Salaire brut annuel (€)</Label>
                    <Input
                      type="number"
                      value={grossSalary}
                      onChange={(e) => setGrossSalary(Number(e.target.value))}
                      min={0}
                      step={1000}
                    />
                  </div>
                </div>
                
                {/* Destination */}
                <div className="space-y-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Situation envisagée
                  </h3>
                  <div className="space-y-2">
                    <Label>Pays de destination</Label>
                    <Select value={destinationCountry} onValueChange={setDestinationCountry}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un pays" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCountries
                          .filter(id => id !== originCountry)
                          .map(id => (
                            <SelectItem key={id} value={id}>
                              {COUNTRY_NAMES[id] || id}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Salaire brut annuel attendu (€)</Label>
                    <Input
                      type="number"
                      value={destinationSalary}
                      onChange={(e) => setDestinationSalary(Number(e.target.value))}
                      min={0}
                      step={1000}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Comparison Results */}
          {comparison && comparison.country1 && comparison.country2 && (
            <>
              <div className="grid md:grid-cols-2 gap-6">
                <SalaryBreakdownCard 
                  result={comparison.country1} 
                  countryName={COUNTRY_NAMES[originCountry] || originCountry} 
                />
                <SalaryBreakdownCard 
                  result={comparison.country2} 
                  countryName={COUNTRY_NAMES[destinationCountry] || destinationCountry} 
                />
              </div>
              
              <ComparisonResult
                origin={comparison.country1}
                destination={comparison.country2}
                originName={COUNTRY_NAMES[originCountry] || originCountry}
                destinationName={COUNTRY_NAMES[destinationCountry] || destinationCountry}
                analysis={comparison.analysis}
              />
            </>
          )}
          
          {/* Export Button */}
          {comparison && comparison.country1 && comparison.country2 && (
            <div className="flex justify-center">
              <Button onClick={handleExportPDF} className="gap-2">
                <Download className="w-4 h-4" />
                Exporter en PDF
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Special Regimes Info */}
      <Card className="glass-card mt-8">
        <CardHeader>
          <CardTitle>Régimes fiscaux spéciaux</CardTitle>
          <CardDescription>
            Certains pays offrent des régimes avantageux pour les expatriés
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-secondary/50 rounded-lg">
              <h4 className="font-medium mb-2">🇵🇹 Portugal NHR</h4>
              <p className="text-sm text-muted-foreground">
                Taux fixe de 20% sur revenus d'emploi qualifié pendant 10 ans
              </p>
            </div>
            <div className="p-4 bg-secondary/50 rounded-lg">
              <h4 className="font-medium mb-2">🇪🇸 Loi Beckham</h4>
              <p className="text-sm text-muted-foreground">
                Taux fixe de 24% pendant 6 ans pour nouveaux résidents
              </p>
            </div>
            <div className="p-4 bg-secondary/50 rounded-lg">
              <h4 className="font-medium mb-2">🇦🇪 Dubai</h4>
              <p className="text-sm text-muted-foreground">
                0% d'impôt sur le revenu des personnes physiques
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
