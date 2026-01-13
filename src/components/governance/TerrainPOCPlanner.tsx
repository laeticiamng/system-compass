import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Beaker, 
  Target, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  XCircle,
  AlertTriangle,
  Save,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { useUserGovernanceNotes } from '@/hooks/useCountryGovernance';
import { toast } from 'sonner';

interface POCPlan {
  hypothesis: string;
  maxBudget: number;
  currency: string;
  duration: number; // weeks
  successCriteria: string[];
  stopCriteria: string[];
  nextSteps: string;
}

interface TerrainPOCPlannerProps {
  countryId: string;
  countryName: string;
  projectType?: string;
}

export function TerrainPOCPlanner({ countryId, countryName, projectType }: TerrainPOCPlannerProps) {
  const { t } = useTranslation();
  const { notes, saveNotes, isSaving, isLoading } = useUserGovernanceNotes(countryId);
  const [plan, setPlan] = useState<POCPlan>({
    hypothesis: '',
    maxBudget: 5000,
    currency: 'EUR',
    duration: 4,
    successCriteria: [''],
    stopCriteria: [''],
    nextSteps: '',
  });

  // Load POC plan from saved notes
  useEffect(() => {
    if (notes?.poc_plan) {
      const savedPlan = notes.poc_plan as any;
      setPlan(prev => ({
        ...prev,
        hypothesis: savedPlan.hypothesis || '',
        maxBudget: savedPlan.maxBudget || 5000,
        duration: typeof savedPlan.duration === 'number' ? savedPlan.duration : parseInt(savedPlan.duration) || 4,
        successCriteria: savedPlan.successCriteria || [''],
        stopCriteria: savedPlan.stopCriteria || [''],
        nextSteps: savedPlan.nextSteps || '',
      }));
    }
  }, [notes]);

  const updatePlan = (updates: Partial<POCPlan>) => {
    setPlan(prev => ({ ...prev, ...updates }));
  };

  const addSuccessCriteria = () => {
    setPlan(prev => ({ ...prev, successCriteria: [...prev.successCriteria, ''] }));
  };

  const updateSuccessCriteria = (index: number, value: string) => {
    setPlan(prev => ({
      ...prev,
      successCriteria: prev.successCriteria.map((c, i) => i === index ? value : c)
    }));
  };

  const addStopCriteria = () => {
    setPlan(prev => ({ ...prev, stopCriteria: [...prev.stopCriteria, ''] }));
  };

  const updateStopCriteria = (index: number, value: string) => {
    setPlan(prev => ({
      ...prev,
      stopCriteria: prev.stopCriteria.map((c, i) => i === index ? value : c)
    }));
  };

  const isComplete = plan.hypothesis && 
    plan.successCriteria.some(c => c.trim()) && 
    plan.stopCriteria.some(c => c.trim());

  const handleSave = () => {
    saveNotes({ 
      poc_plan: {
        hypothesis: plan.hypothesis,
        maxBudget: plan.maxBudget,
        duration: `${plan.duration} weeks`,
        successCriteria: plan.successCriteria.filter(c => c.trim()),
        stopCriteria: plan.stopCriteria.filter(c => c.trim()),
      } as any
    });
    toast.success(t('common.saved', 'Sauvegardé'));
  };

  if (isLoading) {
    return (
      <Card className="border-cyan-500/20">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-cyan-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Beaker className="w-5 h-5 text-cyan-600" />
          {t('governance.poc.title', 'POC (Proof of Concept)')}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {t('governance.poc.description', 'Plan minimal avant engagement sur')} {countryName}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Warning */}
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm">
            {t('governance.poc.warning', 'L\'objectif du POC est d\'empêcher de démarrer directement en grand. Tester petit, apprendre, puis décider.')}
          </p>
        </div>

        {/* Hypothesis */}
        <div className="space-y-2">
          <label className="font-medium text-sm flex items-center gap-2">
            <Target className="w-4 h-4 text-cyan-600" />
            {t('governance.poc.hypothesis', 'Hypothèse à tester')}
          </label>
          <Textarea
            placeholder={t('governance.poc.hypothesisPlaceholder', 'Ex: \'Le marché local est prêt à payer 50€/mois pour notre service\'')}
            value={plan.hypothesis}
            onChange={(e) => updatePlan({ hypothesis: e.target.value })}
            className="min-h-[80px]"
          />
        </div>

        {/* Budget and Duration */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="font-medium text-sm flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-cyan-600" />
              {t('governance.poc.maxBudget', 'Budget maximum')}
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={plan.maxBudget}
                onChange={(e) => updatePlan({ maxBudget: parseInt(e.target.value) || 0 })}
                className="w-32"
              />
              <select 
                value={plan.currency}
                onChange={(e) => updatePlan({ currency: e.target.value })}
                className="px-3 py-2 rounded-md border bg-background"
              >
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
                <option value="CHF">CHF</option>
              </select>
            </div>
            <p className="text-xs text-muted-foreground">
              {t('governance.poc.budgetTip', 'Montant que vous êtes prêt à perdre entièrement')}
            </p>
          </div>

          <div className="space-y-3">
            <label className="font-medium text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-600" />
              {t('governance.poc.duration', 'Durée')} : {plan.duration} {t('governance.poc.weeks', 'semaines')}
            </label>
            <Slider
              value={[plan.duration]}
              onValueChange={(v) => updatePlan({ duration: v[0] })}
              min={1}
              max={12}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              {t('governance.poc.durationTip', 'Après cette durée, décision obligatoire : continuer/pivoter/arrêter')}
            </p>
          </div>
        </div>

        {/* Success Criteria */}
        <div className="space-y-3">
          <label className="font-medium text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            {t('governance.poc.successCriteria', 'Critères de succès (pour continuer)')}
          </label>
          {plan.successCriteria.map((criteria, index) => (
            <Input
              key={index}
              placeholder={t('governance.poc.successPlaceholder', `Critère ${index + 1} (ex: '10 clients payants', '1 contrat signé')`)}
              value={criteria}
              onChange={(e) => updateSuccessCriteria(index, e.target.value)}
            />
          ))}
          <Button variant="ghost" size="sm" onClick={addSuccessCriteria} className="gap-1">
            + {t('governance.poc.addCriteria', 'Ajouter un critère')}
          </Button>
        </div>

        {/* Stop Criteria */}
        <div className="space-y-3">
          <label className="font-medium text-sm flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-600" />
            {t('governance.poc.stopCriteria', 'Critères d\'arrêt (pour stopper)')}
          </label>
          {plan.stopCriteria.map((criteria, index) => (
            <Input
              key={index}
              placeholder={t('governance.poc.stopPlaceholder', `Signal d'arrêt ${index + 1} (ex: '0 prospect qualifié après 4 semaines')`)}
              value={criteria}
              onChange={(e) => updateStopCriteria(index, e.target.value)}
            />
          ))}
          <Button variant="ghost" size="sm" onClick={addStopCriteria} className="gap-1">
            + {t('governance.poc.addSignal', 'Ajouter un signal')}
          </Button>
        </div>

        {/* Next Steps */}
        <div className="space-y-2">
          <label className="font-medium text-sm flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-cyan-600" />
            {t('governance.poc.nextSteps', 'Prochaines étapes si succès')}
          </label>
          <Textarea
            placeholder={t('governance.poc.nextStepsPlaceholder', 'Ce qui se passe si les critères de succès sont atteints...')}
            value={plan.nextSteps}
            onChange={(e) => updatePlan({ nextSteps: e.target.value })}
          />
        </div>

        {/* Summary */}
        {isComplete && (
          <div className="p-4 bg-cyan-500/10 rounded-lg space-y-2">
            <h4 className="font-medium text-sm">{t('governance.poc.summary', 'Résumé POC')}</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">{t('governance.poc.budgetMax', 'Budget max')} :</span>
                <span className="ml-2 font-medium">{plan.maxBudget} {plan.currency}</span>
              </div>
              <div>
                <span className="text-muted-foreground">{t('governance.poc.durationLabel', 'Durée')} :</span>
                <span className="ml-2 font-medium">{plan.duration} {t('governance.poc.weeks', 'semaines')}</span>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t">
          <Button 
            onClick={handleSave} 
            disabled={!isComplete || isSaving}
            className="gap-2"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {t('governance.poc.savePlan', 'Sauvegarder le plan POC')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
