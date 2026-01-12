import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Lightbulb, Users, Building2, Sparkles, FileText, Shield,
  TrendingUp, DollarSign, Package, AlertTriangle, CheckCircle,
  ChevronLeft, ChevronRight, Save, Loader2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserCase } from '@/hooks/useUserCases';

interface MarketStudyData {
  problemStatement: string;
  valueProposition: string;
  customerSegments: string[];
  payingCustomer: string;
  endUser: string;
  competitors: Array<{
    name: string;
    scope: string;
    implantation: 'local' | 'regional' | 'national' | 'international';
    strengths: string;
  }>;
  differentiation: string;
  timingReason: string;
  regulations: string[];
  constraints: string[];
  goToMarket: string;
  channels: string[];
  unitEconomics: {
    costPerUnit: number;
    pricePerUnit: number;
    marginPercent: number;
    breakeven: string;
  };
  operations: string;
  logistics: string;
  customsNotes: string;
  keyRisks: string[];
  feasibility: 'low' | 'medium' | 'high';
  conditionsToValidate: string[];
  externalStudyBy?: string;
  externalStudySummary?: string;
}

interface MarketStudyWizardProps {
  caseData: UserCase;
  onUpdateCase: (updates: Partial<UserCase>) => void;
  countryName: string;
}

const STEPS = [
  { id: 'problem', icon: Lightbulb, label: 'Problème & Valeur' },
  { id: 'customers', icon: Users, label: 'Clients' },
  { id: 'competition', icon: Building2, label: 'Concurrence' },
  { id: 'differentiation', icon: Sparkles, label: 'Différenciation' },
  { id: 'regulation', icon: Shield, label: 'Réglementation' },
  { id: 'goToMarket', icon: TrendingUp, label: 'Go-to-Market' },
  { id: 'economics', icon: DollarSign, label: 'Économie' },
  { id: 'operations', icon: Package, label: 'Opérations' },
  { id: 'risks', icon: AlertTriangle, label: 'Risques' },
  { id: 'conclusion', icon: CheckCircle, label: 'Conclusion' },
] as const;

const DEFAULT_STUDY: MarketStudyData = {
  problemStatement: '',
  valueProposition: '',
  customerSegments: [],
  payingCustomer: '',
  endUser: '',
  competitors: [],
  differentiation: '',
  timingReason: '',
  regulations: [],
  constraints: [],
  goToMarket: '',
  channels: [],
  unitEconomics: {
    costPerUnit: 0,
    pricePerUnit: 0,
    marginPercent: 0,
    breakeven: '',
  },
  operations: '',
  logistics: '',
  customsNotes: '',
  keyRisks: [],
  feasibility: 'medium',
  conditionsToValidate: [],
};

export function MarketStudyWizard({ caseData, onUpdateCase, countryName }: MarketStudyWizardProps) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  
  // Load existing study or use default
  const [study, setStudy] = useState<MarketStudyData>(() => {
    const existing = (caseData as any).market_study;
    return existing ? { ...DEFAULT_STUDY, ...existing } : DEFAULT_STUDY;
  });

  const updateStudy = (updates: Partial<MarketStudyData>) => {
    setStudy(prev => ({ ...prev, ...updates }));
  };

  const saveStudy = async () => {
    setIsSaving(true);
    try {
      onUpdateCase({ market_study: study } as any);
    } finally {
      setIsSaving(false);
    }
  };

  const addCompetitor = () => {
    updateStudy({
      competitors: [...study.competitors, { name: '', scope: '', implantation: 'local', strengths: '' }],
    });
  };

  const updateCompetitor = (idx: number, updates: Partial<MarketStudyData['competitors'][0]>) => {
    const updated = [...study.competitors];
    updated[idx] = { ...updated[idx], ...updates };
    updateStudy({ competitors: updated });
  };

  const removeCompetitor = (idx: number) => {
    updateStudy({ competitors: study.competitors.filter((_, i) => i !== idx) });
  };

  const addArrayItem = (field: 'customerSegments' | 'regulations' | 'constraints' | 'channels' | 'keyRisks' | 'conditionsToValidate', value: string) => {
    if (!value.trim()) return;
    updateStudy({ [field]: [...study[field], value.trim()] });
  };

  const removeArrayItem = (field: 'customerSegments' | 'regulations' | 'constraints' | 'channels' | 'keyRisks' | 'conditionsToValidate', idx: number) => {
    updateStudy({ [field]: study[field].filter((_, i) => i !== idx) });
  };

  // Calculate progress
  const getProgress = () => {
    let filled = 0;
    let total = 10;
    if (study.problemStatement) filled++;
    if (study.valueProposition) filled++;
    if (study.customerSegments.length > 0) filled++;
    if (study.competitors.length > 0) filled++;
    if (study.differentiation) filled++;
    if (study.goToMarket) filled++;
    if (study.unitEconomics.pricePerUnit > 0) filled++;
    if (study.operations) filled++;
    if (study.keyRisks.length > 0) filled++;
    if (study.conditionsToValidate.length > 0) filled++;
    return Math.round((filled / total) * 100);
  };

  const renderStep = () => {
    switch (STEPS[currentStep].id) {
      case 'problem':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">{t('marketStudy.problem.statement', 'Quel problème résolvez-vous ?')}</label>
              <Textarea
                value={study.problemStatement}
                onChange={(e) => updateStudy({ problemStatement: e.target.value })}
                placeholder={t('marketStudy.problem.placeholder', 'Décrivez le problème que votre offre résout...')}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">{t('marketStudy.problem.value', 'Proposition de valeur')}</label>
              <Textarea
                value={study.valueProposition}
                onChange={(e) => updateStudy({ valueProposition: e.target.value })}
                placeholder={t('marketStudy.problem.valuePlaceholder', 'En quoi votre solution est-elle unique ?')}
                className="mt-1"
              />
            </div>
          </div>
        );

      case 'customers':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">{t('marketStudy.customers.segments', 'Segments clients')}</label>
              <div className="flex gap-2 mt-1">
                <Input
                  placeholder={t('marketStudy.customers.addSegment', 'Ajouter un segment...')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addArrayItem('customerSegments', e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {study.customerSegments.map((seg, idx) => (
                  <Badge key={idx} variant="secondary" className="cursor-pointer" onClick={() => removeArrayItem('customerSegments', idx)}>
                    {seg} ×
                  </Badge>
                ))}
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">{t('marketStudy.customers.paying', 'Qui paye ?')}</label>
                <Input
                  value={study.payingCustomer}
                  onChange={(e) => updateStudy({ payingCustomer: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">{t('marketStudy.customers.endUser', 'Qui utilise ?')}</label>
                <Input
                  value={study.endUser}
                  onChange={(e) => updateStudy({ endUser: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        );

      case 'competition':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t('marketStudy.competition.title', 'Concurrents identifiés')}</label>
              <Button size="sm" variant="outline" onClick={addCompetitor}>
                {t('common.add', 'Ajouter')}
              </Button>
            </div>
            {study.competitors.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t('marketStudy.competition.empty', 'Aucun concurrent ajouté')}
              </p>
            ) : (
              <div className="space-y-3">
                {study.competitors.map((comp, idx) => (
                  <Card key={idx}>
                    <CardContent className="p-3 space-y-2">
                      <div className="grid grid-cols-3 gap-2">
                        <Input
                          placeholder={t('marketStudy.competition.name', 'Nom')}
                          value={comp.name}
                          onChange={(e) => updateCompetitor(idx, { name: e.target.value })}
                        />
                        <Input
                          placeholder={t('marketStudy.competition.scope', 'Périmètre')}
                          value={comp.scope}
                          onChange={(e) => updateCompetitor(idx, { scope: e.target.value })}
                        />
                        <Select
                          value={comp.implantation}
                          onValueChange={(val) => updateCompetitor(idx, { implantation: val as any })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="local">{t('marketStudy.competition.local', 'Local')}</SelectItem>
                            <SelectItem value="regional">{t('marketStudy.competition.regional', 'Régional')}</SelectItem>
                            <SelectItem value="national">{t('marketStudy.competition.national', 'National')}</SelectItem>
                            <SelectItem value="international">{t('marketStudy.competition.international', 'International')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder={t('marketStudy.competition.strengths', 'Points forts')}
                          value={comp.strengths}
                          onChange={(e) => updateCompetitor(idx, { strengths: e.target.value })}
                          className="flex-1"
                        />
                        <Button size="icon" variant="ghost" onClick={() => removeCompetitor(idx)}>
                          ×
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case 'differentiation':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">{t('marketStudy.diff.why', 'Pourquoi vous ?')}</label>
              <Textarea
                value={study.differentiation}
                onChange={(e) => updateStudy({ differentiation: e.target.value })}
                placeholder={t('marketStudy.diff.placeholder', 'Qu\'est-ce qui vous différencie réellement ?')}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">{t('marketStudy.diff.timing', 'Pourquoi maintenant ?')}</label>
              <Textarea
                value={study.timingReason}
                onChange={(e) => updateStudy({ timingReason: e.target.value })}
                placeholder={t('marketStudy.diff.timingPlaceholder', 'Quel facteur rend ce moment propice ?')}
                className="mt-1"
              />
            </div>
          </div>
        );

      case 'regulation':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">{t('marketStudy.regulation.list', 'Réglementations applicables')}</label>
              <div className="flex gap-2 mt-1">
                <Input
                  placeholder={t('marketStudy.regulation.add', 'Ajouter une réglementation...')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addArrayItem('regulations', e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {study.regulations.map((reg, idx) => (
                  <Badge key={idx} variant="outline" className="cursor-pointer" onClick={() => removeArrayItem('regulations', idx)}>
                    {reg} ×
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">{t('marketStudy.regulation.constraints', 'Contraintes identifiées')}</label>
              <div className="flex gap-2 mt-1">
                <Input
                  placeholder={t('marketStudy.regulation.addConstraint', 'Ajouter une contrainte...')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addArrayItem('constraints', e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {study.constraints.map((c, idx) => (
                  <Badge key={idx} variant="destructive" className="cursor-pointer" onClick={() => removeArrayItem('constraints', idx)}>
                    {c} ×
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        );

      case 'goToMarket':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">{t('marketStudy.gtm.strategy', 'Stratégie d\'entrée')}</label>
              <Textarea
                value={study.goToMarket}
                onChange={(e) => updateStudy({ goToMarket: e.target.value })}
                placeholder={t('marketStudy.gtm.placeholder', 'Comment allez-vous atteindre vos premiers clients ?')}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">{t('marketStudy.gtm.channels', 'Canaux de distribution')}</label>
              <div className="flex gap-2 mt-1">
                <Input
                  placeholder={t('marketStudy.gtm.addChannel', 'Ajouter un canal...')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addArrayItem('channels', e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {study.channels.map((ch, idx) => (
                  <Badge key={idx} variant="secondary" className="cursor-pointer" onClick={() => removeArrayItem('channels', idx)}>
                    {ch} ×
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        );

      case 'economics':
        return (
          <div className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">{t('marketStudy.economics.cost', 'Coût unitaire (€)')}</label>
                <Input
                  type="number"
                  value={study.unitEconomics.costPerUnit || ''}
                  onChange={(e) => updateStudy({
                    unitEconomics: { ...study.unitEconomics, costPerUnit: parseFloat(e.target.value) || 0 }
                  })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">{t('marketStudy.economics.price', 'Prix unitaire (€)')}</label>
                <Input
                  type="number"
                  value={study.unitEconomics.pricePerUnit || ''}
                  onChange={(e) => updateStudy({
                    unitEconomics: { ...study.unitEconomics, pricePerUnit: parseFloat(e.target.value) || 0 }
                  })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">{t('marketStudy.economics.margin', 'Marge (%)')}</label>
                <Input
                  type="number"
                  value={study.unitEconomics.marginPercent || ''}
                  onChange={(e) => updateStudy({
                    unitEconomics: { ...study.unitEconomics, marginPercent: parseFloat(e.target.value) || 0 }
                  })}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">{t('marketStudy.economics.breakeven', 'Seuil de rentabilité')}</label>
              <Input
                value={study.unitEconomics.breakeven}
                onChange={(e) => updateStudy({
                  unitEconomics: { ...study.unitEconomics, breakeven: e.target.value }
                })}
                placeholder={t('marketStudy.economics.breakevenPlaceholder', 'Ex: 100 clients / mois')}
                className="mt-1"
              />
            </div>
          </div>
        );

      case 'operations':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">{t('marketStudy.operations.description', 'Opérations')}</label>
              <Textarea
                value={study.operations}
                onChange={(e) => updateStudy({ operations: e.target.value })}
                placeholder={t('marketStudy.operations.placeholder', 'Comment produisez-vous / livrez-vous ?')}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">{t('marketStudy.operations.logistics', 'Logistique')}</label>
              <Textarea
                value={study.logistics}
                onChange={(e) => updateStudy({ logistics: e.target.value })}
                placeholder={t('marketStudy.operations.logisticsPlaceholder', 'Transport, stockage, distribution...')}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">{t('marketStudy.operations.customs', 'Douanes (si applicable)')}</label>
              <Textarea
                value={study.customsNotes}
                onChange={(e) => updateStudy({ customsNotes: e.target.value })}
                placeholder={t('marketStudy.operations.customsPlaceholder', 'Points d\'attention douaniers...')}
                className="mt-1"
              />
            </div>
          </div>
        );

      case 'risks':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">{t('marketStudy.risks.key', 'Risques clés identifiés')}</label>
              <div className="flex gap-2 mt-1">
                <Input
                  placeholder={t('marketStudy.risks.add', 'Ajouter un risque...')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addArrayItem('keyRisks', e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {study.keyRisks.map((risk, idx) => (
                  <Badge key={idx} variant="destructive" className="cursor-pointer" onClick={() => removeArrayItem('keyRisks', idx)}>
                    {risk} ×
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        );

      case 'conclusion':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">{t('marketStudy.conclusion.feasibility', 'Faisabilité estimée')}</label>
              <Select
                value={study.feasibility}
                onValueChange={(val) => updateStudy({ feasibility: val as any })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">{t('marketStudy.conclusion.low', 'Faible')}</SelectItem>
                  <SelectItem value="medium">{t('marketStudy.conclusion.medium', 'Moyenne')}</SelectItem>
                  <SelectItem value="high">{t('marketStudy.conclusion.high', 'Forte')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">{t('marketStudy.conclusion.conditions', 'Conditions à valider avant investissement')}</label>
              <div className="flex gap-2 mt-1">
                <Input
                  placeholder={t('marketStudy.conclusion.addCondition', 'Ajouter une condition...')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addArrayItem('conditionsToValidate', e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {study.conditionsToValidate.map((cond, idx) => (
                  <Badge key={idx} variant="outline" className="cursor-pointer" onClick={() => removeArrayItem('conditionsToValidate', idx)}>
                    {cond} ×
                  </Badge>
                ))}
              </div>
            </div>
            <div className="border-t pt-4 mt-4">
              <label className="text-sm font-medium">{t('marketStudy.conclusion.external', 'Étude externe (optionnel)')}</label>
              <Input
                value={study.externalStudyBy || ''}
                onChange={(e) => updateStudy({ externalStudyBy: e.target.value })}
                placeholder={t('marketStudy.conclusion.externalBy', 'Réalisée par...')}
                className="mt-1"
              />
              <Textarea
                value={study.externalStudySummary || ''}
                onChange={(e) => updateStudy({ externalStudySummary: e.target.value })}
                placeholder={t('marketStudy.conclusion.externalSummary', 'Résumé de l\'étude externe...')}
                className="mt-2"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {t('marketStudy.title', 'Étude de marché & faisabilité')}
            </CardTitle>
            <CardDescription>
              {t('marketStudy.description', 'Analyse structurée pour {{country}}', { country: countryName })}
            </CardDescription>
          </div>
          <Badge variant="outline">{getProgress()}%</Badge>
        </div>
        <Progress value={getProgress()} className="h-1 mt-2" />
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Steps Navigation */}
        <div className="flex overflow-x-auto gap-1 pb-2">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isActive = idx === currentStep;
            const isPast = idx < currentStep;
            return (
              <button
                key={step.id}
                onClick={() => setCurrentStep(idx)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : isPast
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted text-muted-foreground'
                }`}
              >
                <Icon className="w-3 h-3" />
                {step.label}
              </button>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="min-h-[200px]">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            {t('common.previous', 'Précédent')}
          </Button>

          <Button onClick={saveStudy} disabled={isSaving} variant="secondary">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
            {t('common.save', 'Enregistrer')}
          </Button>

          <Button
            onClick={() => setCurrentStep(Math.min(STEPS.length - 1, currentStep + 1))}
            disabled={currentStep === STEPS.length - 1}
          >
            {t('common.next', 'Suivant')}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
