import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, ArrowRight, TrendingDown, TrendingUp, Heart, Coins, AlertTriangle } from 'lucide-react';

interface TaxResult {
  grossSalary: number;
  incomeTax: number;
  socialContributions: number;
  healthInsurance: number;
  pensionContribution: number;
  netTakeHome: number;
  effectiveRate: number;
}

interface CountryConfig {
  id: string;
  name: string;
  flag: string;
  currency: string;
  incomeTaxRate: number;
  socialRate: number;
  healthLabel: string;
  healthRate: number;
  pensionLabel: string;
  pensionRate: number;
  pensionNotes: string;
}

const COUNTRIES: CountryConfig[] = [
  {
    id: 'switzerland', name: 'Suisse', flag: '🇨🇭', currency: 'CHF',
    incomeTaxRate: 0.115, socialRate: 0.0525, healthLabel: 'LAMal',
    healthRate: 0.04, pensionLabel: '2ème pilier (LPP)', pensionRate: 0.075,
    pensionNotes: 'Capitalisation obligatoire dès CHF 22\'050/an. Contribution employeur/employé 50/50.',
  },
  {
    id: 'france', name: 'France', flag: '🇫🇷', currency: 'EUR',
    incomeTaxRate: 0.14, socialRate: 0.22, healthLabel: 'Sécurité sociale',
    healthRate: 0.076, pensionLabel: 'Retraite (CNAV + complémentaire)', pensionRate: 0.108,
    pensionNotes: 'Système par répartition. Taux plein à 43 annuités. CARMF pour médecins.',
  },
  {
    id: 'germany', name: 'Allemagne', flag: '🇩🇪', currency: 'EUR',
    incomeTaxRate: 0.18, socialRate: 0.20, healthLabel: 'Gesetzliche Krankenversicherung',
    healthRate: 0.073, pensionLabel: 'Rentenversicherung', pensionRate: 0.093,
    pensionNotes: 'Cotisation retraite paritaire employeur/employé à 18.6% du brut.',
  },
  {
    id: 'belgium', name: 'Belgique', flag: '🇧🇪', currency: 'EUR',
    incomeTaxRate: 0.25, socialRate: 0.1307, healthLabel: 'INAMI',
    healthRate: 0.038, pensionLabel: 'Pension légale', pensionRate: 0.0787,
    pensionNotes: 'Pension de salarié calculée sur 45 ans de carrière.',
  },
];

function computeTax(country: CountryConfig, gross: number): TaxResult {
  const incomeTax = gross * country.incomeTaxRate;
  const socialContributions = gross * country.socialRate;
  const healthInsurance = gross * country.healthRate;
  const pensionContribution = gross * country.pensionRate;
  const totalDeductions = incomeTax + socialContributions + healthInsurance + pensionContribution;
  const netTakeHome = gross - totalDeductions;
  const effectiveRate = gross > 0 ? (totalDeductions / gross) * 100 : 0;
  return { grossSalary: gross, incomeTax, socialContributions, healthInsurance, pensionContribution, netTakeHome, effectiveRate };
}

function ResultColumn({ country, result }: { country: CountryConfig; result: TaxResult }) {
  const { t } = useTranslation();
  const rows = [
    { label: t('healthcare.tax.incomeTax', 'Impôt sur le revenu'), value: result.incomeTax, icon: TrendingDown, color: 'text-destructive' },
    { label: t('healthcare.tax.socialContrib', 'Cotisations sociales'), value: result.socialContributions, icon: Coins, color: 'text-amber-500' },
    { label: country.healthLabel, value: result.healthInsurance, icon: Heart, color: 'text-red-500' },
    { label: country.pensionLabel, value: result.pensionContribution, icon: TrendingUp, color: 'text-primary' },
  ];

  return (
    <div className="flex-1 space-y-3">
      <div className="text-center space-y-1">
        <p className="text-2xl">{country.flag}</p>
        <h4 className="font-semibold text-sm">{country.name}</h4>
        <Badge variant="outline" className="text-[10px]">{country.currency}</Badge>
      </div>

      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between text-xs rounded-lg bg-muted/50 px-3 py-2">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <row.icon className={`w-3 h-3 ${row.color}`} />
              {row.label}
            </span>
            <span className="font-medium">-{Math.round(row.value).toLocaleString()}</span>
          </div>
        ))}
      </div>

      <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-3 text-center space-y-1">
        <p className="text-[10px] text-muted-foreground">{t('healthcare.tax.netTakeHome', 'Net mensuel')}</p>
        <p className="text-xl font-bold text-primary">{Math.round(result.netTakeHome).toLocaleString()} {country.currency}</p>
        <Badge variant="secondary" className="text-[9px]">
          {result.effectiveRate.toFixed(1)}% {t('healthcare.tax.effectiveRate', 'taux effectif')}
        </Badge>
      </div>

      <p className="text-[10px] text-muted-foreground italic leading-relaxed">{country.pensionNotes}</p>
    </div>
  );
}

export function HealthcareTaxCalculator() {
  const { t } = useTranslation();
  const [originId, setOriginId] = useState('france');
  const [targetId, setTargetId] = useState('switzerland');
  const [grossSalary, setGrossSalary] = useState('6000');

  const origin = COUNTRIES.find(c => c.id === originId)!;
  const target = COUNTRIES.find(c => c.id === targetId)!;
  const gross = parseFloat(grossSalary) || 0;

  const originResult = useMemo(() => computeTax(origin, gross), [origin, gross]);
  const targetResult = useMemo(() => computeTax(target, gross), [target, gross]);
  const netDifference = targetResult.netTakeHome - originResult.netTakeHome;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calculator className="w-5 h-5 text-primary" />
          {t('healthcare.tax.title', 'Simulateur Frontalier — Protection Sociale')}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {t('healthcare.tax.subtitle', 'Comparez le net après impôts, cotisations sociales et retraite entre deux pays.')}
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Inputs */}
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium">{t('healthcare.tax.currentCountry', 'Pays actuel')}</label>
            <Select value={originId} onValueChange={setOriginId}>
              <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {COUNTRIES.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.flag} {c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium">{t('healthcare.tax.targetCountry', 'Pays cible')}</label>
            <Select value={targetId} onValueChange={setTargetId}>
              <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {COUNTRIES.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.flag} {c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium">{t('healthcare.tax.grossSalary', 'Salaire brut mensuel')}</label>
            <Input
              type="number"
              value={grossSalary}
              onChange={(e) => setGrossSalary(e.target.value)}
              className="h-9 text-xs"
              placeholder="6000"
            />
          </div>
        </div>

        {/* Side-by-side comparison */}
        {gross > 0 && (
          <>
            <div className="flex gap-4">
              <ResultColumn country={origin} result={originResult} />
              <div className="flex flex-col items-center justify-center">
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
              </div>
              <ResultColumn country={target} result={targetResult} />
            </div>

            {/* Net difference banner */}
            <div className={`rounded-lg p-3 text-center ${netDifference >= 0 ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-destructive/10 border border-destructive/30'}`}>
              <p className="text-xs text-muted-foreground">{t('healthcare.tax.difference', 'Différence nette mensuelle')}</p>
              <p className={`text-lg font-bold ${netDifference >= 0 ? 'text-emerald-600' : 'text-destructive'}`}>
                {netDifference >= 0 ? '+' : ''}{Math.round(netDifference).toLocaleString()} /mois
              </p>
            </div>

            {/* Disclaimer */}
            <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                {t('healthcare.tax.disclaimer', 'Simulation indicative basée sur des taux moyens. Les montants réels dépendent de votre situation personnelle, canton/département de résidence, et statut professionnel exact. Consultez un expert fiscal pour une analyse personnalisée.')}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
