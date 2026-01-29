import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FlaskConical, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Minus,
  Play,
  RotateCcw,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export interface ScenarioVariable {
  id: string;
  label: string;
  description?: string;
  type: 'slider' | 'toggle';
  defaultValue: number | boolean;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export interface ScenarioResult {
  id: string;
  label: string;
  baseValue: number;
  simulatedValue: number;
  unit?: string;
  format?: 'number' | 'percent' | 'currency';
  isPositive?: boolean; // If higher = better
}

interface ScenarioSimulatorProps {
  title: string;
  description?: string;
  variables: ScenarioVariable[];
  calculateResults: (values: Record<string, number | boolean>) => ScenarioResult[];
  presets?: {
    id: string;
    label: string;
    description?: string;
    values: Record<string, number | boolean>;
  }[];
  className?: string;
}

export function ScenarioSimulator({
  title,
  description,
  variables,
  calculateResults,
  presets = [],
  className,
}: ScenarioSimulatorProps) {
  const { t } = useTranslation();
  
  // Initialize values with defaults
  const [values, setValues] = useState<Record<string, number | boolean>>(() => {
    const initial: Record<string, number | boolean> = {};
    variables.forEach(v => {
      initial[v.id] = v.defaultValue;
    });
    return initial;
  });

  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const results = useMemo(() => calculateResults(values), [values, calculateResults]);

  const updateValue = (id: string, value: number | boolean) => {
    setValues(prev => ({ ...prev, [id]: value }));
    setSelectedPreset(null);
  };

  const applyPreset = (preset: typeof presets[0]) => {
    setValues(preset.values);
    setSelectedPreset(preset.id);
  };

  const resetToDefaults = () => {
    const defaults: Record<string, number | boolean> = {};
    variables.forEach(v => {
      defaults[v.id] = v.defaultValue;
    });
    setValues(defaults);
    setSelectedPreset(null);
  };

  const formatValue = (result: ScenarioResult): string => {
    const value = result.simulatedValue;
    switch (result.format) {
      case 'percent':
        return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
      case 'currency':
        return new Intl.NumberFormat('fr-FR', { 
          style: 'currency', 
          currency: 'EUR',
          maximumFractionDigits: 0,
        }).format(value);
      default:
        return value.toLocaleString();
    }
  };

  const getDelta = (result: ScenarioResult): { value: number; isPositive: boolean } => {
    const delta = result.simulatedValue - result.baseValue;
    const isPositive = result.isPositive !== undefined 
      ? (delta > 0) === result.isPositive
      : delta > 0;
    return { value: delta, isPositive };
  };

  return (
    <Card className={cn('border-primary/20', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetToDefaults}
            className="gap-1 text-xs"
          >
            <RotateCcw className="w-3 h-3" />
            {t('scenario.reset', 'Réinitialiser')}
          </Button>
        </div>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Presets */}
        {presets.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">
              {t('scenario.presets', 'Scénarios prédéfinis')}
            </Label>
            <div className="flex flex-wrap gap-2">
              {presets.map(preset => (
                <Button
                  key={preset.id}
                  variant={selectedPreset === preset.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => applyPreset(preset)}
                  className="gap-1"
                >
                  <Play className="w-3 h-3" />
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Variables */}
        <div className="space-y-4">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">
            {t('scenario.variables', 'Variables')}
          </Label>
          {variables.map(variable => (
            <div key={variable.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor={variable.id} className="text-sm font-medium">
                  {variable.label}
                </Label>
                {variable.type === 'slider' && (
                  <span className="text-sm font-mono text-primary">
                    {values[variable.id] as number}{variable.unit || ''}
                  </span>
                )}
              </div>
              {variable.description && (
                <p className="text-xs text-muted-foreground">{variable.description}</p>
              )}
              {variable.type === 'slider' ? (
                <Slider
                  id={variable.id}
                  value={[values[variable.id] as number]}
                  onValueChange={([v]) => updateValue(variable.id, v)}
                  min={variable.min || 0}
                  max={variable.max || 100}
                  step={variable.step || 1}
                  className="py-2"
                />
              ) : (
                <Switch
                  id={variable.id}
                  checked={values[variable.id] as boolean}
                  onCheckedChange={v => updateValue(variable.id, v)}
                />
              )}
            </div>
          ))}
        </div>

        <Separator />

        {/* Results */}
        <div className="space-y-3">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">
            {t('scenario.results', 'Résultats simulés')}
          </Label>
          <div className="space-y-2">
            {results.map(result => {
              const delta = getDelta(result);
              const DeltaIcon = delta.value === 0 
                ? Minus 
                : delta.isPositive 
                  ? TrendingUp 
                  : TrendingDown;
              
              return (
                <div 
                  key={result.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{result.label}</span>
                    {result.unit && (
                      <Badge variant="outline" className="text-xs">
                        {result.unit}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      {formatValue({ ...result, simulatedValue: result.baseValue })}
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    <span className={cn(
                      'text-sm font-semibold',
                      delta.value !== 0 && (delta.isPositive ? 'text-green-500' : 'text-red-500'),
                    )}>
                      {formatValue(result)}
                    </span>
                    <DeltaIcon className={cn(
                      'w-4 h-4',
                      delta.value === 0 && 'text-muted-foreground',
                      delta.value !== 0 && (delta.isPositive ? 'text-green-500' : 'text-red-500'),
                    )} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
          <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            {t('scenario.disclaimer', 'Ces projections sont des simulations basées sur les paramètres fournis. Les résultats réels peuvent varier.')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
