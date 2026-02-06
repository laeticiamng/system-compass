import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FileCheck, Plus, Trash2, AlertCircle, CheckCircle2, 
  ExternalLink, Shield, Building2, DollarSign, FileText, Users
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserCase } from '@/hooks/useUserCases';

type RuleType = 'property' | 'joint_venture' | 'fiscal' | 'contract' | 'labor' | 'licensing' | 'custom';
type VerificationStatus = 'unverified' | 'in_progress' | 'verified';

interface StructuralRule {
  id: string;
  type: RuleType;
  title: string;
  description: string;
  source: string;
  sourceUrl?: string;
  status: VerificationStatus;
  verifiedAt?: string;
  notes: string;
}

interface StructuralRulesSectionProps {
  caseData: UserCase;
  onUpdateCase: (updates: Partial<UserCase>) => void;
  countryName: string;
}

const RULE_TYPES: Record<RuleType, { label: string; icon: React.ElementType; description: string }> = {
  property: { 
    label: 'Propriété', 
    icon: Building2,
    description: 'Règles de propriété foncière/immobilière pour étrangers',
  },
  joint_venture: { 
    label: 'Joint Venture', 
    icon: Users,
    description: 'Obligations de partenariat local (% capital, représentation)',
  },
  fiscal: { 
    label: 'Fiscalité', 
    icon: DollarSign,
    description: 'Régimes fiscaux spéciaux, retenues à la source, double imposition',
  },
  contract: { 
    label: 'Contractualisation', 
    icon: FileText,
    description: 'Droit applicable, tribunaux compétents, arbitrage',
  },
  labor: { 
    label: 'Droit du travail', 
    icon: Users,
    description: 'Quotas d\'employés locaux, permis de travail, protection sociale',
  },
  licensing: { 
    label: 'Licences & Agréments', 
    icon: FileCheck,
    description: 'Autorisations sectorielles, certifications obligatoires',
  },
  custom: { 
    label: 'Autre règle', 
    icon: Shield,
    description: 'Règle spécifique non catégorisée',
  },
};

const STATUS_CONFIG: Record<VerificationStatus, { label: string; color: string; icon: React.ElementType }> = {
  unverified: { label: 'Non vérifié', color: 'bg-gray-100 text-gray-700', icon: AlertCircle },
  in_progress: { label: 'En vérification', color: 'bg-yellow-100 text-yellow-700', icon: AlertCircle },
  verified: { label: 'Vérifié', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
};

export function StructuralRulesSection({ caseData, onUpdateCase, countryName }: StructuralRulesSectionProps) {
  const { t } = useTranslation();
  const [expandedRule, setExpandedRule] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);

  // Get rules from case data
  const rules: StructuralRule[] = ((caseData as unknown as Record<string, unknown>).structural_rules as StructuralRule[]) || [];

  const updateRules = (newRules: StructuralRule[]) => {
    onUpdateCase({ structural_rules: newRules } as Partial<UserCase>);
  };

  const addRule = (type: RuleType = 'custom') => {
    const template = RULE_TYPES[type];
    const newRule: StructuralRule = {
      id: crypto.randomUUID(),
      type,
      title: type === 'custom' ? '' : template.label,
      description: type === 'custom' ? '' : template.description,
      source: '',
      status: 'unverified',
      notes: '',
    };
    updateRules([...rules, newRule]);
    setExpandedRule(newRule.id);
    setShowTemplates(false);
  };

  const updateRule = (id: string, updates: Partial<StructuralRule>) => {
    updateRules(rules.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const deleteRule = (id: string) => {
    updateRules(rules.filter(r => r.id !== id));
    if (expandedRule === id) setExpandedRule(null);
  };

  const verifyRule = (id: string) => {
    updateRule(id, { 
      status: 'verified', 
      verifiedAt: new Date().toISOString() 
    });
  };

  // Stats
  const verifiedCount = rules.filter(r => r.status === 'verified').length;
  const unverifiedCount = rules.filter(r => r.status === 'unverified').length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="w-5 h-5" />
              {t('structuralRules.title', 'Règles structurantes')}
            </CardTitle>
            <CardDescription>
              {t('structuralRules.description', 'Règles légales et réglementaires à vérifier pour {{country}}', { country: countryName })}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setShowTemplates(!showTemplates)}>
              {t('structuralRules.templates', 'Modèles')}
            </Button>
            <Button size="sm" onClick={() => addRule('custom')}>
              <Plus className="w-4 h-4 mr-1" />
              {t('structuralRules.add', 'Ajouter')}
            </Button>
          </div>
        </div>

        {/* Stats */}
        {rules.length > 0 && (
          <div className="flex gap-4 mt-4">
            <Badge variant="outline">{rules.length} {t('structuralRules.rules', 'règles')}</Badge>
            <Badge variant="outline" className="bg-green-50">{verifiedCount} {t('structuralRules.verified', 'vérifiées')}</Badge>
            {unverifiedCount > 0 && (
              <Badge variant="secondary" className="bg-amber-50">{unverifiedCount} {t('structuralRules.pending', 'à vérifier')}</Badge>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Templates */}
        {showTemplates && (
          <Card className="border-dashed">
            <CardContent className="p-4">
              <p className="text-sm font-medium mb-3">{t('structuralRules.selectTemplate', 'Types de règles courants')}</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.entries(RULE_TYPES).filter(([key]) => key !== 'custom').map(([key, template]) => {
                  const Icon = template.icon;
                  return (
                    <Button
                      key={key}
                      variant="outline"
                      size="sm"
                      className="h-auto py-2 flex-col items-start text-left"
                      onClick={() => addRule(key as RuleType)}
                    >
                      <div className="flex items-center gap-1 mb-1">
                        <Icon className="w-3 h-3" />
                        <span className="text-xs font-medium">{template.label}</span>
                      </div>
                      <span className="text-xs text-muted-foreground line-clamp-1">{template.description}</span>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rules List */}
        {rules.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>{t('structuralRules.empty', 'Aucune règle documentée')}</p>
            <p className="text-sm">{t('structuralRules.emptyHint', 'Utilisez les modèles pour documenter les règles à vérifier')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rules.map(rule => {
              const template = RULE_TYPES[rule.type];
              const Icon = template.icon;
              const statusConfig = STATUS_CONFIG[rule.status];
              const StatusIcon = statusConfig.icon;
              const isExpanded = expandedRule === rule.id;

              return (
                <Card key={rule.id} className={rule.status === 'verified' ? 'border-green-200' : ''}>
                  <CardContent className="p-4">
                    <div 
                      className="flex items-start gap-3 cursor-pointer"
                      onClick={() => setExpandedRule(isExpanded ? null : rule.id)}
                    >
                      <div className="p-2 rounded-lg bg-muted">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{rule.title || template.label}</span>
                          <Badge className={`text-xs ${statusConfig.color}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">{rule.description}</p>
                        {rule.source && (
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {t('structuralRules.source', 'Source')}: {rule.source}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteRule(rule.id);
                        }}
                        className="shrink-0"
                      >
                        <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-medium">{t('structuralRules.ruleTitle', 'Titre de la règle')}</label>
                            <Input
                              value={rule.title}
                              onChange={(e) => updateRule(rule.id, { title: e.target.value })}
                              placeholder={t('structuralRules.titlePlaceholder', 'Ex: Obligation de JV à 51%')}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium">{t('structuralRules.ruleType', 'Type')}</label>
                            <Select
                              value={rule.type}
                              onValueChange={(val) => updateRule(rule.id, { type: val as RuleType })}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(RULE_TYPES).map(([key, config]) => (
                                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-medium">{t('structuralRules.ruleDescription', 'Description détaillée')}</label>
                          <Textarea
                            value={rule.description}
                            onChange={(e) => updateRule(rule.id, { description: e.target.value })}
                            placeholder={t('structuralRules.descPlaceholder', 'Décrivez la règle et ses implications...')}
                            className="mt-1"
                          />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-medium">{t('structuralRules.sourceRef', 'Source / Référence')}</label>
                            <Input
                              value={rule.source}
                              onChange={(e) => updateRule(rule.id, { source: e.target.value })}
                              placeholder={t('structuralRules.sourcePlaceholder', 'Ex: Code des investissements Art. 12')}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium">{t('structuralRules.sourceUrl', 'URL de la source')}</label>
                            <div className="flex gap-2 mt-1">
                              <Input
                                value={rule.sourceUrl || ''}
                                onChange={(e) => updateRule(rule.id, { sourceUrl: e.target.value })}
                                placeholder="https://..."
                              />
                              {rule.sourceUrl && (
                                <Button size="icon" variant="outline" asChild>
                                  <a href={rule.sourceUrl} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-medium">{t('structuralRules.notes', 'Notes')}</label>
                          <Textarea
                            value={rule.notes}
                            onChange={(e) => updateRule(rule.id, { notes: e.target.value })}
                            placeholder={t('structuralRules.notesPlaceholder', 'Notes de vérification, contacts, observations...')}
                            className="mt-1"
                          />
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t">
                          <Select
                            value={rule.status}
                            onValueChange={(val) => updateRule(rule.id, { status: val as VerificationStatus })}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="unverified">{t('structuralRules.status.unverified', 'Non vérifié')}</SelectItem>
                              <SelectItem value="in_progress">{t('structuralRules.status.inProgress', 'En vérification')}</SelectItem>
                              <SelectItem value="verified">{t('structuralRules.status.verified', 'Vérifié')}</SelectItem>
                            </SelectContent>
                          </Select>

                          {rule.status !== 'verified' && (
                            <Button size="sm" variant="outline" onClick={() => verifyRule(rule.id)}>
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              {t('structuralRules.markVerified', 'Marquer vérifié')}
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Warning notice */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
          <p className="font-medium mb-1">{t('structuralRules.notice.title', '⚠️ Note de prudence')}</p>
          <p>{t('structuralRules.notice.text', 'Ces informations sont fournies à titre indicatif et doivent être confirmées auprès de sources officielles avant tout engagement. Les réglementations évoluent fréquemment.')}</p>
        </div>
      </CardContent>
    </Card>
  );
}
