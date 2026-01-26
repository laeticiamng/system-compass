/**
 * Latent Escalation Rules Component
 * 
 * Configures automatic escalation rules for latent zones.
 * Triggers alerts when certain conditions are met.
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  AlertTriangle, ArrowUpRight, Clock, Bell, Plus, Trash2, 
  Save, Zap, Target, TrendingUp
} from 'lucide-react';

interface EscalationRule {
  id: string;
  name: string;
  trigger: 'tension_count' | 'days_in_status' | 'priority_change' | 'manual';
  threshold: number;
  action: 'notify' | 'escalate_status' | 'create_irreversa' | 'alert_dashboard';
  enabled: boolean;
}

interface LatentEscalationRulesProps {
  zoneId: string;
  onRulesChange?: (rules: EscalationRule[]) => void;
}

const DEFAULT_RULES: EscalationRule[] = [
  {
    id: 'rule-1',
    name: 'Tensions multiples',
    trigger: 'tension_count',
    threshold: 5,
    action: 'notify',
    enabled: true,
  },
  {
    id: 'rule-2',
    name: 'Stagnation prolongée',
    trigger: 'days_in_status',
    threshold: 30,
    action: 'alert_dashboard',
    enabled: true,
  },
  {
    id: 'rule-3',
    name: 'Seuil critique',
    trigger: 'tension_count',
    threshold: 10,
    action: 'create_irreversa',
    enabled: false,
  },
];

const TRIGGER_OPTIONS = [
  { value: 'tension_count', label: 'Nombre de tensions', icon: <TrendingUp className="w-4 h-4" /> },
  { value: 'days_in_status', label: 'Jours dans ce statut', icon: <Clock className="w-4 h-4" /> },
  { value: 'priority_change', label: 'Changement de priorité', icon: <Target className="w-4 h-4" /> },
  { value: 'manual', label: 'Déclenchement manuel', icon: <Zap className="w-4 h-4" /> },
];

const ACTION_OPTIONS = [
  { value: 'notify', label: 'Envoyer une notification', color: 'bg-blue-500' },
  { value: 'escalate_status', label: 'Escalader le statut', color: 'bg-orange-500' },
  { value: 'create_irreversa', label: 'Créer un seuil Irreversa', color: 'bg-red-500' },
  { value: 'alert_dashboard', label: 'Alerte tableau de bord', color: 'bg-amber-500' },
];

export function LatentEscalationRules({ zoneId, onRulesChange }: LatentEscalationRulesProps) {
  const { t } = useTranslation();
  const [rules, setRules] = useState<EscalationRule[]>(DEFAULT_RULES);
  const [hasChanges, setHasChanges] = useState(false);

  // Load rules from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(`latent-rules-${zoneId}`);
    if (stored) {
      try {
        setRules(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse rules:', e);
      }
    }
  }, [zoneId]);

  const saveRules = () => {
    localStorage.setItem(`latent-rules-${zoneId}`, JSON.stringify(rules));
    setHasChanges(false);
    onRulesChange?.(rules);
  };

  const addRule = () => {
    const newRule: EscalationRule = {
      id: `rule-${Date.now()}`,
      name: 'Nouvelle règle',
      trigger: 'tension_count',
      threshold: 5,
      action: 'notify',
      enabled: true,
    };
    setRules([...rules, newRule]);
    setHasChanges(true);
  };

  const updateRule = (id: string, updates: Partial<EscalationRule>) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    setHasChanges(true);
  };

  const deleteRule = (id: string) => {
    setRules(prev => prev.filter(r => r.id !== id));
    setHasChanges(true);
  };

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
    setHasChanges(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <ArrowUpRight className="w-5 h-5 text-amber-500" />
          {t('latent.escalation.title', 'Règles d\'escalade')}
        </CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={addRule}>
            <Plus className="w-4 h-4 mr-1" />
            Ajouter
          </Button>
          {hasChanges && (
            <Button size="sm" onClick={saveRules}>
              <Save className="w-4 h-4 mr-1" />
              Enregistrer
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {rules.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
            <p>Aucune règle d'escalade configurée</p>
            <Button variant="link" onClick={addRule}>
              Créer une première règle
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {rules.map(rule => (
              <div
                key={rule.id}
                className={`p-4 rounded-lg border ${rule.enabled ? 'bg-background' : 'bg-muted/50 opacity-60'}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    {/* Rule Name */}
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={() => toggleRule(rule.id)}
                      />
                      <Input
                        value={rule.name}
                        onChange={(e) => updateRule(rule.id, { name: e.target.value })}
                        className="max-w-[200px] h-8"
                      />
                      {rule.enabled && (
                        <Badge variant="outline" className="bg-green-500/10 text-green-700">
                          Actif
                        </Badge>
                      )}
                    </div>

                    {/* Trigger and Threshold */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <Label className="text-sm text-muted-foreground">Si</Label>
                      <Select
                        value={rule.trigger}
                        onValueChange={(v) => updateRule(rule.id, { trigger: v as EscalationRule['trigger'] })}
                      >
                        <SelectTrigger className="w-[180px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TRIGGER_OPTIONS.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>
                              <div className="flex items-center gap-2">
                                {opt.icon}
                                {opt.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {rule.trigger !== 'manual' && (
                        <>
                          <Label className="text-sm text-muted-foreground">≥</Label>
                          <Input
                            type="number"
                            value={rule.threshold}
                            onChange={(e) => updateRule(rule.id, { threshold: parseInt(e.target.value) || 0 })}
                            className="w-20 h-8"
                            min={1}
                          />
                        </>
                      )}
                    </div>

                    {/* Action */}
                    <div className="flex items-center gap-3">
                      <Label className="text-sm text-muted-foreground">Alors</Label>
                      <Select
                        value={rule.action}
                        onValueChange={(v) => updateRule(rule.id, { action: v as EscalationRule['action'] })}
                      >
                        <SelectTrigger className="w-[220px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ACTION_OPTIONS.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${opt.color}`} />
                                {opt.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Delete button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => deleteRule(rule.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info */}
        <div className="mt-4 p-3 rounded-lg bg-muted/50 flex items-start gap-2">
          <Bell className="w-4 h-4 text-muted-foreground mt-0.5" />
          <p className="text-xs text-muted-foreground">
            Les règles d'escalade permettent d'automatiser les alertes et actions
            lorsque certaines conditions sont atteintes dans vos zones latentes.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
