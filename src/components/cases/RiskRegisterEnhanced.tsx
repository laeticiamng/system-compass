import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  AlertTriangle, Plus, Trash2, Shield, Clock, DollarSign, 
  Users, Eye, ChevronDown, ChevronRight, CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { UserCase } from '@/hooks/useUserCases';

type RiskCategory = 'context' | 'delays' | 'opacity' | 'disclosure' | 'capture' | 'budget' | 'dependency' | 'instability' | 'custom';
type Probability = 'low' | 'medium' | 'high';
type ImpactType = 'time' | 'money' | 'control';

interface Risk {
  id: string;
  category: RiskCategory;
  description: string;
  probability: Probability;
  impact: ImpactType[];
  alertSignals: string[];
  protections: string[];
  status: 'open' | 'mitigated' | 'accepted';
  notes: string;
}

interface RiskRegisterEnhancedProps {
  caseData: UserCase;
  onUpdateCase: (updates: Partial<UserCase>) => void;
}

const RISK_TEMPLATES: Record<RiskCategory, { label: string; description: string; icon: React.ElementType }> = {
  context: { 
    label: 'Sous-estimation du contexte', 
    description: 'Méconnaissance des spécificités locales',
    icon: Eye,
  },
  delays: { 
    label: 'Délais réels vs annoncés', 
    description: 'Écart entre les délais officiels et la réalité',
    icon: Clock,
  },
  opacity: { 
    label: 'Opacité administrative', 
    description: 'Processus invisibles, règles non-écrites',
    icon: Shield,
  },
  disclosure: { 
    label: 'Divulgation excessive', 
    description: 'Risque de copie, chantage ou dépendance',
    icon: AlertTriangle,
  },
  capture: { 
    label: 'Capture après investissement', 
    description: 'Blocage une fois l\'investissement engagé',
    icon: Users,
  },
  budget: { 
    label: 'Dépassement budgétaire', 
    description: 'CAPEX/OPEX réel supérieur au budget (x3-x5)',
    icon: DollarSign,
  },
  dependency: { 
    label: 'Dépendance unique', 
    description: 'Point de blocage unique, acteur monopolistique',
    icon: Users,
  },
  instability: { 
    label: 'Instabilité contractuelle', 
    description: 'Changement d\'autorité, révision unilatérale',
    icon: Shield,
  },
  custom: { 
    label: 'Autre risque', 
    description: 'Risque spécifique au projet',
    icon: AlertTriangle,
  },
};

const PROBABILITY_CONFIG: Record<Probability, { label: string; color: string }> = {
  low: { label: 'Faible', color: 'bg-green-100 text-green-700' },
  medium: { label: 'Moyen', color: 'bg-yellow-100 text-yellow-700' },
  high: { label: 'Élevé', color: 'bg-red-100 text-red-700' },
};

const IMPACT_LABELS: Record<ImpactType, string> = {
  time: 'Temps',
  money: 'Argent',
  control: 'Contrôle',
};

export function RiskRegisterEnhanced({ caseData, onUpdateCase }: RiskRegisterEnhancedProps) {
  const { t } = useTranslation();
  const [expandedRisk, setExpandedRisk] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);

  // Get risks from case data
  const risks: Risk[] = ((caseData as unknown as Record<string, unknown>).risk_register_enhanced as Risk[]) || [];

  const updateRisks = (newRisks: Risk[]) => {
    onUpdateCase({ risk_register_enhanced: newRisks } as Partial<UserCase>);
  };

  const addRisk = (category: RiskCategory = 'custom') => {
    const template = RISK_TEMPLATES[category];
    const newRisk: Risk = {
      id: crypto.randomUUID(),
      category,
      description: category === 'custom' ? '' : template.description,
      probability: 'medium',
      impact: ['time'],
      alertSignals: [],
      protections: [],
      status: 'open',
      notes: '',
    };
    updateRisks([...risks, newRisk]);
    setExpandedRisk(newRisk.id);
    setShowTemplates(false);
  };

  const updateRisk = (id: string, updates: Partial<Risk>) => {
    updateRisks(risks.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const deleteRisk = (id: string) => {
    updateRisks(risks.filter(r => r.id !== id));
    if (expandedRisk === id) setExpandedRisk(null);
  };

  const addArrayItem = (riskId: string, field: 'alertSignals' | 'protections', value: string) => {
    if (!value.trim()) return;
    const risk = risks.find(r => r.id === riskId);
    if (risk) {
      updateRisk(riskId, { [field]: [...risk[field], value.trim()] });
    }
  };

  const removeArrayItem = (riskId: string, field: 'alertSignals' | 'protections', idx: number) => {
    const risk = risks.find(r => r.id === riskId);
    if (risk) {
      updateRisk(riskId, { [field]: risk[field].filter((_, i) => i !== idx) });
    }
  };

  const toggleImpact = (riskId: string, impactType: ImpactType) => {
    const risk = risks.find(r => r.id === riskId);
    if (risk) {
      const newImpacts = risk.impact.includes(impactType)
        ? risk.impact.filter(i => i !== impactType)
        : [...risk.impact, impactType];
      updateRisk(riskId, { impact: newImpacts });
    }
  };

  // Stats
  const openRisks = risks.filter(r => r.status === 'open');
  const highRisks = risks.filter(r => r.probability === 'high' && r.status === 'open');
  const mitigatedRisks = risks.filter(r => r.status === 'mitigated');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              {t('riskRegister.title', 'Registre des risques')}
            </CardTitle>
            <CardDescription>
              {t('riskRegister.description', 'Identifiez, évaluez et protégez-vous des risques projet')}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setShowTemplates(!showTemplates)}>
              {t('riskRegister.templates', 'Modèles')}
            </Button>
            <Button size="sm" onClick={() => addRisk('custom')}>
              <Plus className="w-4 h-4 mr-1" />
              {t('riskRegister.add', 'Ajouter')}
            </Button>
          </div>
        </div>

        {/* Stats */}
        {risks.length > 0 && (
          <div className="flex gap-4 mt-4">
            <Badge variant="outline">{openRisks.length} {t('riskRegister.open', 'ouverts')}</Badge>
            {highRisks.length > 0 && (
              <Badge variant="destructive">{highRisks.length} {t('riskRegister.high', 'critiques')}</Badge>
            )}
            <Badge variant="outline" className="bg-green-50">{mitigatedRisks.length} {t('riskRegister.mitigated', 'atténués')}</Badge>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Risk Templates */}
        {showTemplates && (
          <Card className="border-dashed">
            <CardContent className="p-4">
              <p className="text-sm font-medium mb-3">{t('riskRegister.selectTemplate', 'Sélectionner un modèle de risque')}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.entries(RISK_TEMPLATES).filter(([key]) => key !== 'custom').map(([key, template]) => {
                  const Icon = template.icon;
                  return (
                    <Button
                      key={key}
                      variant="outline"
                      size="sm"
                      className="h-auto py-2 flex-col items-start text-left"
                      onClick={() => addRisk(key as RiskCategory)}
                    >
                      <div className="flex items-center gap-1 mb-1">
                        <Icon className="w-3 h-3" />
                        <span className="text-xs font-medium">{template.label}</span>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Risk List */}
        {risks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>{t('riskRegister.empty', 'Aucun risque documenté')}</p>
            <p className="text-sm">{t('riskRegister.emptyHint', 'Utilisez les modèles pour commencer rapidement')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {risks.map(risk => {
              const template = RISK_TEMPLATES[risk.category];
              const Icon = template.icon;
              const isExpanded = expandedRisk === risk.id;
              const probConfig = PROBABILITY_CONFIG[risk.probability];

              return (
                <Collapsible key={risk.id} open={isExpanded} onOpenChange={() => setExpandedRisk(isExpanded ? null : risk.id)}>
                  <Card className={risk.status === 'mitigated' ? 'opacity-60' : ''}>
                    <CardContent className="p-3">
                      <CollapsibleTrigger asChild>
                        <div className="flex items-start gap-3 cursor-pointer">
                          <div className="p-1.5 rounded bg-muted">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium">{template.label}</span>
                              <Badge className={`text-xs ${probConfig.color}`}>{probConfig.label}</Badge>
                              {risk.status === 'mitigated' && (
                                <Badge variant="outline" className="bg-green-50 text-green-700">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  {t('riskRegister.statusMitigated', 'Atténué')}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{risk.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              {risk.impact.map(imp => (
                                <Badge key={imp} variant="secondary" className="text-xs">{IMPACT_LABELS[imp]}</Badge>
                              ))}
                            </div>
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </div>
                        </div>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <div className="mt-4 pt-4 border-t space-y-4">
                          {/* Description */}
                          <div>
                            <label className="text-xs font-medium">{t('riskRegister.description', 'Description')}</label>
                            <Textarea
                              value={risk.description}
                              onChange={(e) => updateRisk(risk.id, { description: e.target.value })}
                              className="mt-1 text-sm"
                            />
                          </div>

                          {/* Probability & Impact */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-xs font-medium">{t('riskRegister.probability', 'Probabilité')}</label>
                              <Select
                                value={risk.probability}
                                onValueChange={(val) => updateRisk(risk.id, { probability: val as Probability })}
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(PROBABILITY_CONFIG).map(([key, config]) => (
                                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="text-xs font-medium">{t('riskRegister.impact', 'Impact')}</label>
                              <div className="flex gap-2 mt-1">
                                {Object.entries(IMPACT_LABELS).map(([key, label]) => (
                                  <Button
                                    key={key}
                                    size="sm"
                                    variant={risk.impact.includes(key as ImpactType) ? 'default' : 'outline'}
                                    onClick={() => toggleImpact(risk.id, key as ImpactType)}
                                    className="text-xs"
                                  >
                                    {label}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Alert Signals */}
                          <div>
                            <label className="text-xs font-medium">{t('riskRegister.signals', 'Signaux d\'alerte')}</label>
                            <div className="flex gap-2 mt-1">
                              <Input
                                placeholder={t('riskRegister.addSignal', 'Ajouter un signal...')}
                                className="text-sm"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    addArrayItem(risk.id, 'alertSignals', e.currentTarget.value);
                                    e.currentTarget.value = '';
                                  }
                                }}
                              />
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {risk.alertSignals.map((signal, idx) => (
                                <Badge 
                                  key={idx} 
                                  variant="secondary" 
                                  className="text-xs cursor-pointer"
                                  onClick={() => removeArrayItem(risk.id, 'alertSignals', idx)}
                                >
                                  {signal} ×
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Protections */}
                          <div>
                            <label className="text-xs font-medium">{t('riskRegister.protections', 'Mesures de protection')}</label>
                            <div className="flex gap-2 mt-1">
                              <Input
                                placeholder={t('riskRegister.addProtection', 'Ajouter une protection...')}
                                className="text-sm"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    addArrayItem(risk.id, 'protections', e.currentTarget.value);
                                    e.currentTarget.value = '';
                                  }
                                }}
                              />
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {risk.protections.map((protection, idx) => (
                                <Badge 
                                  key={idx} 
                                  variant="outline" 
                                  className="text-xs cursor-pointer bg-green-50"
                                  onClick={() => removeArrayItem(risk.id, 'protections', idx)}
                                >
                                  <Shield className="w-3 h-3 mr-1" />
                                  {protection} ×
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Status & Actions */}
                          <div className="flex items-center justify-between pt-2 border-t">
                            <Select
                              value={risk.status}
                              onValueChange={(val) => updateRisk(risk.id, { status: val as Risk['status'] })}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="open">{t('riskRegister.statusOpen', 'Ouvert')}</SelectItem>
                                <SelectItem value="mitigated">{t('riskRegister.statusMitigated', 'Atténué')}</SelectItem>
                                <SelectItem value="accepted">{t('riskRegister.statusAccepted', 'Accepté')}</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteRisk(risk.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              {t('common.delete', 'Supprimer')}
                            </Button>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </CardContent>
                  </Card>
                </Collapsible>
              );
            })}
          </div>
        )}

        {/* Protective measures notice */}
        <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg text-xs">
          <p className="font-medium mb-1 text-green-800 dark:text-green-300">{t('riskRegister.protectionsTitle', 'Protections recommandées')}</p>
          <ul className="space-y-1 text-green-700 dark:text-green-400">
            <li>• {t('riskRegister.protection1', 'Jalons contractuels avec clauses de sortie')}</li>
            <li>• {t('riskRegister.protection2', 'POC minimal avant engagement significatif')}</li>
            <li>• {t('riskRegister.protection3', 'Diversification des acteurs clés')}</li>
            <li>• {t('riskRegister.protection4', 'Documentation systématique (preuves)')}</li>
            <li>• {t('riskRegister.protection5', 'Critères No-Go explicites')}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
