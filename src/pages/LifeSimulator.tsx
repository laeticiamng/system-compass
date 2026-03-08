/**
 * Life Simulator — Immersive monthly budget projection
 * Compares origin vs destination with what-if scenarios
 */
import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useCountries } from '@/lib/countries-data';
import {
  ArrowRight, Home, ShoppingCart, Car, HeartPulse, Wifi,
  UtensilsCrossed, GraduationCap, Plane, TrendingDown, TrendingUp,
  Minus, Sliders, Users, User, Baby, AlertTriangle, Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SimulationDisclaimer } from '@/components/SimulationDisclaimer';
import { cn } from '@/lib/utils';

// ─── Budget breakdown categories ───
interface BudgetLine {
  key: string;
  label: string;
  icon: React.ElementType;
  basePercent: number; // % of monthlyBudget
}

const BUDGET_LINES: BudgetLine[] = [
  { key: 'rent', label: 'Loyer', icon: Home, basePercent: 35 },
  { key: 'groceries', label: 'Courses & alimentation', icon: ShoppingCart, basePercent: 20 },
  { key: 'transport', label: 'Transports', icon: Car, basePercent: 10 },
  { key: 'health', label: 'Santé & assurance', icon: HeartPulse, basePercent: 8 },
  { key: 'dining', label: 'Restaurants & sorties', icon: UtensilsCrossed, basePercent: 10 },
  { key: 'telecom', label: 'Internet & téléphone', icon: Wifi, basePercent: 3 },
  { key: 'education', label: 'Éducation', icon: GraduationCap, basePercent: 4 },
  { key: 'leisure', label: 'Loisirs & voyages', icon: Plane, basePercent: 10 },
];

// France reference budget (€/month, single)
const FRANCE_BUDGET_SINGLE = 2200;
const FRANCE_BUDGET_FAMILY = 3800;
const FRANCE_COST_INDEX = 65; // NYC = 100

type FamilyType = 'single' | 'couple' | 'family';

interface WhatIfModifier {
  salaryChange: number; // % change (-50 to +50)
  rentChange: number;   // % change
  childCount: number;
}

function computeBudget(
  monthlyBase: number,
  costIndex: number,
  rentIndex: number,
  groceriesIndex: number,
  familyType: FamilyType,
  whatIf: WhatIfModifier
): { lines: { key: string; label: string; icon: React.ElementType; amount: number }[]; total: number } {
  // Family multipliers
  const familyMult = familyType === 'single' ? 1 : familyType === 'couple' ? 1.6 : 2.2;
  const childExtra = whatIf.childCount * 350 * (costIndex / FRANCE_COST_INDEX);
  
  const base = monthlyBase * familyMult + childExtra;
  
  const lines = BUDGET_LINES.map(line => {
    let amount = base * (line.basePercent / 100);
    
    // Apply specific index adjustments
    if (line.key === 'rent') {
      amount = amount * (rentIndex / FRANCE_COST_INDEX) * (1 + whatIf.rentChange / 100);
    } else if (line.key === 'groceries' || line.key === 'dining') {
      amount = amount * (groceriesIndex / FRANCE_COST_INDEX);
    } else {
      amount = amount * (costIndex / FRANCE_COST_INDEX);
    }
    
    // Education scales with children
    if (line.key === 'education' && familyType !== 'family' && whatIf.childCount === 0) {
      amount = 0;
    }
    
    return { ...line, amount: Math.round(amount) };
  });

  return { lines, total: lines.reduce((s, l) => s + l.amount, 0) };
}

function BudgetBar({ label, icon: Icon, amount, total, maxAmount, color }: {
  label: string; icon: React.ElementType; amount: number; total: number; maxAmount: number; color: string;
}) {
  const pct = total > 0 ? (amount / total) * 100 : 0;
  const barWidth = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;
  
  return (
    <div className="flex items-center gap-3">
      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', color)}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium truncate">{label}</span>
          <span className="text-xs font-bold">{amount.toLocaleString('fr-FR')} €</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <motion.div
            className={cn('h-full rounded-full', color.replace('bg-', 'bg-').replace('/10', '/60'))}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(barWidth, 100)}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
        <span className="text-[10px] text-muted-foreground">{pct.toFixed(1)}% du budget</span>
      </div>
    </div>
  );
}

function DeltaIndicator({ origin, destination }: { origin: number; destination: number }) {
  const delta = destination - origin;
  const pct = origin > 0 ? (delta / origin) * 100 : 0;
  const isPositive = delta < 0; // Less expensive = positive

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        'flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold',
        isPositive ? 'bg-emerald-500/10 text-emerald-500' : delta === 0 ? 'bg-muted text-muted-foreground' : 'bg-red-500/10 text-red-500'
      )}
    >
      {isPositive ? <TrendingDown className="w-5 h-5" /> : delta === 0 ? <Minus className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
      <span>
        {isPositive ? 'Économie' : 'Surcoût'} : {Math.abs(delta).toLocaleString('fr-FR')} €/mois ({Math.abs(pct).toFixed(0)}%)
      </span>
    </motion.div>
  );
}

export default function LifeSimulator() {
  const { countries } = useCountries();
  const [destinationId, setDestinationId] = useState('');
  const [familyType, setFamilyType] = useState<FamilyType>('single');
  const [whatIf, setWhatIf] = useState<WhatIfModifier>({ salaryChange: 0, rentChange: 0, childCount: 0 });

  const destination = useMemo(() => countries.find(c => c.id === destinationId), [countries, destinationId]);

  const originBudget = useMemo(() => {
    const base = familyType === 'family' ? FRANCE_BUDGET_FAMILY : FRANCE_BUDGET_SINGLE;
    return computeBudget(base, FRANCE_COST_INDEX, FRANCE_COST_INDEX, FRANCE_COST_INDEX, familyType, { ...whatIf, rentChange: 0 });
  }, [familyType, whatIf]);

  const destBudget = useMemo(() => {
    if (!destination) return null;
    const col = destination.costOfLiving;
    const base = familyType === 'family' ? (col.monthlyBudgetFamily || col.monthlyBudgetSingle * 1.8) : col.monthlyBudgetSingle;
    return computeBudget(
      base || FRANCE_BUDGET_SINGLE,
      col.index || FRANCE_COST_INDEX,
      col.rentIndex || col.index || FRANCE_COST_INDEX,
      col.groceriesIndex || col.index || FRANCE_COST_INDEX,
      familyType,
      whatIf
    );
  }, [destination, familyType, whatIf]);

  const maxAmount = useMemo(() => {
    const allAmounts = [
      ...originBudget.lines.map(l => l.amount),
      ...(destBudget?.lines.map(l => l.amount) || []),
    ];
    return Math.max(...allAmounts, 1);
  }, [originBudget, destBudget]);

  const sortedCountries = useMemo(
    () => [...countries].sort((a, b) => a.name.localeCompare(b.name)),
    [countries]
  );

  const COLORS = [
    'bg-primary/10 text-primary',
    'bg-accent/20 text-accent-foreground',
    'bg-secondary/30 text-secondary-foreground',
    'bg-muted text-muted-foreground',
    'bg-primary/5 text-primary',
    'bg-accent/10 text-accent-foreground',
    'bg-secondary/10 text-secondary-foreground',
    'bg-muted/50 text-muted-foreground',
  ];

  return (
    <>
      <Helmet>
        <title>Simulateur de Vie — Compass</title>
        <meta name="description" content="Projetez votre budget mensuel dans votre pays de destination. Comparaison avant/après et scénarios what-if." />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <Sparkles className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold">Simulateur de Vie</h1>
              <p className="text-muted-foreground">
                Projetez votre budget mensuel et comparez votre niveau de vie avant/après
              </p>
            </div>
          </div>
        </motion.div>

        {/* Configuration */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sliders className="w-4 h-4" /> Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              {/* Destination */}
              <div className="space-y-1.5">
                <Label>Pays de destination</Label>
                <Select value={destinationId} onValueChange={setDestinationId}>
                  <SelectTrigger><SelectValue placeholder="Choisir un pays" /></SelectTrigger>
                  <SelectContent>
                    {sortedCountries.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Family type */}
              <div className="space-y-1.5">
                <Label>Situation</Label>
                <div className="flex gap-2">
                  {([
                    { value: 'single' as const, icon: User, label: 'Solo' },
                    { value: 'couple' as const, icon: Users, label: 'Couple' },
                    { value: 'family' as const, icon: Baby, label: 'Famille' },
                  ]).map(opt => (
                    <Button
                      key={opt.value}
                      variant={familyType === opt.value ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1 gap-1"
                      onClick={() => setFamilyType(opt.value)}
                    >
                      <opt.icon className="w-3.5 h-3.5" /> {opt.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Children count for family */}
              {familyType === 'family' && (
                <div className="space-y-1.5">
                  <Label>Nombre d'enfants</Label>
                  <Input
                    type="number"
                    min={0}
                    max={6}
                    value={whatIf.childCount}
                    onChange={e => setWhatIf(p => ({ ...p, childCount: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* What-If Scenarios */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Scénarios What-If
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Variation de salaire</Label>
                <Badge variant="outline" className={cn(
                  'text-xs',
                  whatIf.salaryChange > 0 ? 'text-emerald-500' : whatIf.salaryChange < 0 ? 'text-red-500' : ''
                )}>
                  {whatIf.salaryChange > 0 ? '+' : ''}{whatIf.salaryChange}%
                </Badge>
              </div>
              <Slider
                value={[whatIf.salaryChange]}
                onValueChange={([v]) => setWhatIf(p => ({ ...p, salaryChange: v }))}
                min={-50}
                max={50}
                step={5}
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>-50%</span><span>0%</span><span>+50%</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Variation du loyer (destination)</Label>
                <Badge variant="outline" className={cn(
                  'text-xs',
                  whatIf.rentChange > 0 ? 'text-red-500' : whatIf.rentChange < 0 ? 'text-emerald-500' : ''
                )}>
                  {whatIf.rentChange > 0 ? '+' : ''}{whatIf.rentChange}%
                </Badge>
              </div>
              <Slider
                value={[whatIf.rentChange]}
                onValueChange={([v]) => setWhatIf(p => ({ ...p, rentChange: v }))}
                min={-40}
                max={60}
                step={5}
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>-40%</span><span>0%</span><span>+60%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comparison */}
        {destination ? (
          <div className="space-y-6">
            {/* Delta */}
            {destBudget && <DeltaIndicator origin={originBudget.total} destination={destBudget.total} />}

            {/* Side by side */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* France */}
              <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
                <Card className="border-muted">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center justify-between">
                      <span>🇫🇷 France (référence)</span>
                      <Badge variant="secondary" className="text-sm font-bold">
                        {originBudget.total.toLocaleString('fr-FR')} €/mois
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {originBudget.lines.filter(l => l.amount > 0).map((line, i) => (
                      <BudgetBar key={line.key} label={line.label} icon={line.icon} amount={line.amount} total={originBudget.total} maxAmount={maxAmount} color={COLORS[i % COLORS.length]} />
                    ))}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Destination */}
              <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
                <Card className="border-primary/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center justify-between">
                      <span>{destination.name}</span>
                      <Badge className="text-sm font-bold">
                        {destBudget?.total.toLocaleString('fr-FR')} €/mois
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {destBudget?.lines.filter(l => l.amount > 0).map((line, i) => (
                      <BudgetBar key={line.key} label={line.label} icon={line.icon} amount={line.amount} total={destBudget.total} maxAmount={maxAmount} color={COLORS[i % COLORS.length]} />
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Line-by-line delta table */}
            {destBudget && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Comparaison ligne par ligne</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {BUDGET_LINES.map(line => {
                        const orig = originBudget.lines.find(l => l.key === line.key)?.amount || 0;
                        const dest = destBudget.lines.find(l => l.key === line.key)?.amount || 0;
                        if (orig === 0 && dest === 0) return null;
                        const delta = dest - orig;
                        const pct = orig > 0 ? (delta / orig) * 100 : 0;

                        return (
                          <div key={line.key} className="flex items-center gap-3 py-1.5 border-b border-border/30 last:border-0">
                            <line.icon className="w-4 h-4 text-muted-foreground shrink-0" />
                            <span className="text-sm flex-1">{line.label}</span>
                            <span className="text-xs text-muted-foreground w-20 text-right">{orig.toLocaleString('fr-FR')} €</span>
                            <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />
                            <span className="text-xs font-medium w-20 text-right">{dest.toLocaleString('fr-FR')} €</span>
                            <Badge
                              variant="outline"
                              className={cn(
                                'text-[10px] w-16 justify-center',
                                delta < 0 ? 'text-emerald-500 border-emerald-500/30' : delta > 0 ? 'text-red-500 border-red-500/30' : ''
                              )}
                            >
                              {delta > 0 ? '+' : ''}{pct.toFixed(0)}%
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Annual projection */}
            {destBudget && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-5">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Budget annuel France</p>
                        <p className="text-lg font-bold">{(originBudget.total * 12).toLocaleString('fr-FR')} €</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Budget annuel {destination.name}</p>
                        <p className="text-lg font-bold">{(destBudget.total * 12).toLocaleString('fr-FR')} €</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Différence annuelle</p>
                        <p className={cn(
                          'text-lg font-bold',
                          destBudget.total < originBudget.total ? 'text-emerald-500' : destBudget.total > originBudget.total ? 'text-red-500' : ''
                        )}>
                          {((destBudget.total - originBudget.total) * 12 > 0 ? '+' : '')}{((destBudget.total - originBudget.total) * 12).toLocaleString('fr-FR')} €
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <Sparkles className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">Sélectionnez un pays de destination</p>
              <p className="text-sm text-muted-foreground mt-1">pour voir la projection détaillée de votre budget mensuel</p>
            </CardContent>
          </Card>
        )}

        <SimulationDisclaimer />
      </div>
    </>
  );
}
