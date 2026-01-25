import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Calculator, 
  TrendingUp, 
  PiggyBank, 
  Calendar,
  Briefcase,
  Home,
  FileText,
  Plane,
  Shield,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { getCountryCurrency } from '@/lib/profession-data';

interface StrategyCostSimulatorProps {
  countryId: string;
  countryName: string;
  professionId?: string;
  intention: string;
}

interface CostCategory {
  id: string;
  label: string;
  icon: typeof Calculator;
  type: 'capex' | 'opex';
  baseAmount: number;
  variable: boolean;
}

export function StrategyCostSimulator({
  countryId,
  countryName,
  intention
}: StrategyCostSimulatorProps) {
  const { t } = useTranslation();
  const currency = getCountryCurrency(countryId);
  
  const [monthsPlanned, setMonthsPlanned] = useState(12);
  const [customBudget, setCustomBudget] = useState<number | null>(null);

  // Get base costs based on country cost of living multiplier
  const costMultiplier = useMemo(() => {
    const multipliers: Record<string, number> = {
      switzerland: 2.0,
      usa: 1.5,
      uk: 1.4,
      germany: 1.2,
      france: 1.15,
      canada: 1.3,
      australia: 1.4,
      japan: 1.3,
      singapore: 1.6,
      uae: 1.5,
      netherlands: 1.2,
      belgium: 1.1,
      ireland: 1.3,
      spain: 0.85,
      portugal: 0.75,
      italy: 0.95,
      poland: 0.6,
      czech_republic: 0.65,
      hungary: 0.55,
      morocco: 0.4,
      senegal: 0.35,
      thailand: 0.45,
      vietnam: 0.35,
      mexico: 0.5,
      brazil: 0.55,
    };
    return multipliers[countryId] || 1.0;
  }, [countryId]);

  // Define cost categories based on intention
  const costCategories: CostCategory[] = useMemo(() => {
    const baseCosts: CostCategory[] = [
      { id: 'visa', label: t('exitKeys.costs.visa', 'Visa & permis'), icon: FileText, type: 'capex', baseAmount: 500, variable: false },
      { id: 'travel', label: t('exitKeys.costs.travel', 'Voyage initial'), icon: Plane, type: 'capex', baseAmount: 800, variable: false },
      { id: 'housing_deposit', label: t('exitKeys.costs.deposit', 'Dépôt logement'), icon: Home, type: 'capex', baseAmount: 2000, variable: true },
      { id: 'setup', label: t('exitKeys.costs.setup', 'Installation'), icon: Briefcase, type: 'capex', baseAmount: 1500, variable: true },
      { id: 'rent', label: t('exitKeys.costs.rent', 'Loyer mensuel'), icon: Home, type: 'opex', baseAmount: 1200, variable: true },
      { id: 'living', label: t('exitKeys.costs.living', 'Vie quotidienne'), icon: PiggyBank, type: 'opex', baseAmount: 800, variable: true },
      { id: 'insurance', label: t('exitKeys.costs.insurance', 'Assurances'), icon: Shield, type: 'opex', baseAmount: 150, variable: true },
    ];

    // Add intention-specific costs
    if (intention === 'installation' || intention === 'work') {
      baseCosts.push({ 
        id: 'professional', 
        label: t('exitKeys.costs.professional', 'Frais professionnels'), 
        icon: Briefcase, 
        type: 'capex', 
        baseAmount: 1000, 
        variable: false 
      });
    }

    if (intention === 'retirement') {
      baseCosts.push({ 
        id: 'healthcare', 
        label: t('exitKeys.costs.healthcare', 'Santé & prévoyance'), 
        icon: Shield, 
        type: 'opex', 
        baseAmount: 400, 
        variable: true 
      });
    }

    if (intention === 'digital_nomad') {
      baseCosts.push({ 
        id: 'coworking', 
        label: t('exitKeys.costs.coworking', 'Coworking & internet'), 
        icon: Briefcase, 
        type: 'opex', 
        baseAmount: 200, 
        variable: true 
      });
    }

    return baseCosts;
  }, [intention, t]);

  // Calculate costs
  const calculations = useMemo(() => {
    const capexItems = costCategories.filter(c => c.type === 'capex');
    const opexItems = costCategories.filter(c => c.type === 'opex');

    const capexTotal = capexItems.reduce((sum, item) => {
      const amount = item.variable ? item.baseAmount * costMultiplier : item.baseAmount;
      return sum + amount;
    }, 0);

    const opexMonthly = opexItems.reduce((sum, item) => {
      const amount = item.variable ? item.baseAmount * costMultiplier : item.baseAmount;
      return sum + amount;
    }, 0);

    const opexTotal = opexMonthly * monthsPlanned;
    const totalCost = capexTotal + opexTotal;
    const buffer = totalCost * 0.15; // 15% buffer recommended
    const recommendedBudget = totalCost + buffer;

    return {
      capexItems,
      opexItems,
      capexTotal,
      opexMonthly,
      opexTotal,
      totalCost,
      buffer,
      recommendedBudget
    };
  }, [costCategories, costMultiplier, monthsPlanned]);

  // Budget status
  const budgetStatus = useMemo(() => {
    if (!customBudget) return null;
    
    const ratio = customBudget / calculations.recommendedBudget;
    
    if (ratio >= 1.2) return { status: 'excellent', color: 'text-green-600', message: t('exitKeys.costs.status.excellent', 'Budget confortable, marge de sécurité élevée') };
    if (ratio >= 1.0) return { status: 'good', color: 'text-emerald-600', message: t('exitKeys.costs.status.good', 'Budget adapté avec marge') };
    if (ratio >= 0.85) return { status: 'tight', color: 'text-amber-600', message: t('exitKeys.costs.status.tight', 'Budget serré, vigilance recommandée') };
    return { status: 'insufficient', color: 'text-red-600', message: t('exitKeys.costs.status.insufficient', 'Budget insuffisant, risque élevé') };
  }, [customBudget, calculations.recommendedBudget, t]);

  const formatAmount = (amount: number) => {
    return `${Math.round(amount).toLocaleString()} ${currency.symbol}`;
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calculator className="w-5 h-5 text-primary" />
          {t('exitKeys.costs.title', 'Simulateur de coûts')}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {t('exitKeys.costs.subtitle', 'Estimation CAPEX/OPEX pour')} {countryName}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Duration slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {t('exitKeys.costs.duration', 'Durée planifiée')}
            </Label>
            <Badge variant="outline">{monthsPlanned} {t('common.months', 'mois')}</Badge>
          </div>
          <Slider
            value={[monthsPlanned]}
            onValueChange={(v) => setMonthsPlanned(v[0])}
            min={3}
            max={36}
            step={3}
            className="w-full"
          />
        </div>

        <Separator />

        {/* CAPEX Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              CAPEX ({t('exitKeys.costs.oneTime', 'Investissement initial')})
            </h4>
            <span className="font-bold text-primary">{formatAmount(calculations.capexTotal)}</span>
          </div>
          <div className="grid gap-2">
            {calculations.capexItems.map(item => {
              const Icon = item.icon;
              const amount = item.variable ? item.baseAmount * costMultiplier : item.baseAmount;
              return (
                <div key={item.id} className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/30">
                  <span className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                    {item.label}
                  </span>
                  <span className="text-muted-foreground">{formatAmount(amount)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* OPEX Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <PiggyBank className="w-4 h-4 text-amber-600" />
              OPEX ({t('exitKeys.costs.monthly', 'Mensuel')})
            </h4>
            <span className="font-bold text-amber-600">{formatAmount(calculations.opexMonthly)}/mois</span>
          </div>
          <div className="grid gap-2">
            {calculations.opexItems.map(item => {
              const Icon = item.icon;
              const amount = item.variable ? item.baseAmount * costMultiplier : item.baseAmount;
              return (
                <div key={item.id} className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/30">
                  <span className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                    {item.label}
                  </span>
                  <span className="text-muted-foreground">{formatAmount(amount)}</span>
                </div>
              );
            })}
          </div>
          <div className="p-3 rounded-lg bg-amber-500/10 text-sm">
            <span className="text-muted-foreground">{t('exitKeys.costs.totalOpex', 'Total sur')} {monthsPlanned} {t('common.months', 'mois')}:</span>
            <span className="font-bold ml-2">{formatAmount(calculations.opexTotal)}</span>
          </div>
        </div>

        <Separator />

        {/* Total Summary */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-amber-500/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium">{t('exitKeys.costs.totalCost', 'Coût total estimé')}</span>
            <span className="text-xl font-bold">{formatAmount(calculations.totalCost)}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{t('exitKeys.costs.buffer', 'Marge de sécurité (15%)')}</span>
            <span>+{formatAmount(calculations.buffer)}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="font-semibold text-primary">{t('exitKeys.costs.recommended', 'Budget recommandé')}</span>
            <span className="text-xl font-bold text-primary">{formatAmount(calculations.recommendedBudget)}</span>
          </div>
        </div>

        {/* Custom Budget Input */}
        <div className="space-y-3">
          <Label>{t('exitKeys.costs.yourBudget', 'Votre budget disponible')}</Label>
          <Input
            type="number"
            placeholder={`Ex: ${Math.round(calculations.recommendedBudget)}`}
            value={customBudget || ''}
            onChange={(e) => setCustomBudget(e.target.value ? Number(e.target.value) : null)}
            className="text-right font-mono"
          />
          {budgetStatus && (
            <div className={`p-3 rounded-lg ${budgetStatus.status === 'insufficient' ? 'bg-red-500/10' : budgetStatus.status === 'tight' ? 'bg-amber-500/10' : 'bg-green-500/10'}`}>
              <div className="flex items-start gap-2">
                {budgetStatus.status === 'insufficient' && <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />}
                <p className={`text-sm ${budgetStatus.color}`}>{budgetStatus.message}</p>
              </div>
              <Progress 
                value={Math.min(100, (customBudget! / calculations.recommendedBudget) * 100)} 
                className="mt-2 h-2"
              />
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground italic">
          {t('exitKeys.costs.disclaimer', '⚠️ Ces estimations sont indicatives et basées sur des moyennes. Les coûts réels peuvent varier significativement selon votre situation spécifique.')}
        </p>
      </CardContent>
    </Card>
  );
}
