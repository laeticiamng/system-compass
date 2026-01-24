import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Sparkles, Loader2, TrendingUp, Users, AlertTriangle, 
  FileCheck, Beaker, ChevronDown, ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useCaseAI } from '@/hooks/useCaseAI';
import { UserCase, isDeepMode } from '@/hooks/useUserCases';
import { toast } from 'sonner';

interface CaseAIGeneratorProps {
  caseData: UserCase;
  countryName: string;
  pyramidType?: string;
  onUpdateCase: (updates: Partial<UserCase>) => void;
}

type GenerationStep = 'market' | 'actors' | 'risks' | 'rules' | 'poc';

const GENERATION_STEPS: Array<{ id: GenerationStep; label: string; icon: React.ElementType; deepOnly: boolean }> = [
  { id: 'market', label: 'Étude de marché', icon: TrendingUp, deepOnly: true },
  { id: 'actors', label: 'Cartographie acteurs', icon: Users, deepOnly: true },
  { id: 'risks', label: 'Registre des risques', icon: AlertTriangle, deepOnly: true },
  { id: 'rules', label: 'Règles structurantes', icon: FileCheck, deepOnly: false },
  { id: 'poc', label: 'Plan POC', icon: Beaker, deepOnly: true },
];

export function CaseAIGenerator({ caseData, countryName, pyramidType, onUpdateCase }: CaseAIGeneratorProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<GenerationStep | null>(null);
  const [completedSteps, setCompletedSteps] = useState<GenerationStep[]>([]);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  
  const {
    isLoading,
    generateMarketStudy,
    generateActorsMap,
    generateRiskRegister,
    generateStructuralRules,
    generatePOCPlan,
    generateCompleteCase,
  } = useCaseAI();

  const isDeep = isDeepMode(caseData.intention);
  const visibleSteps = GENERATION_STEPS.filter(step => !step.deepOnly || isDeep);

  const buildContext = () => ({
    countryName,
    countryContext: {
      pyramidType,
    },
    intention: caseData.intention,
    projectDescription: caseData.title,
    existingData: {
      milestones: caseData.milestones,
      notes: caseData.notes,
    },
  });

  const generateStep = async (step: GenerationStep) => {
    setCurrentStep(step);
    const context = buildContext();

    try {
      let result: any = null;

      switch (step) {
        case 'market':
          result = await generateMarketStudy(context);
          if (result) {
            onUpdateCase({ market_study: result } as any);
          }
          break;
        case 'actors':
          result = await generateActorsMap(context);
          if (result?.actors) {
            onUpdateCase({ actors_map: result.actors } as any);
          }
          break;
        case 'risks':
          result = await generateRiskRegister(context);
          if (result?.risks) {
            onUpdateCase({ risk_register_enhanced: result.risks } as any);
          }
          break;
        case 'rules':
          result = await generateStructuralRules(context);
          if (result?.rules) {
            onUpdateCase({ structural_rules: result.rules } as any);
          }
          break;
        case 'poc':
          result = await generatePOCPlan(context);
          if (result) {
            onUpdateCase({
              poc_hypothesis: result.hypothesis,
              poc_budget: result.budget,
              poc_duration: result.duration,
              poc_success_criteria: result.successCriteria || [],
              poc_stop_criteria: result.stopCriteria || [],
            });
            // Also add milestones
            if (result.milestones?.length > 0) {
              const newMilestones = result.milestones.map((m: any) => ({
                id: crypto.randomUUID(),
                title: m.title,
                deadline: m.deadline,
                completed: false,
                type: 'poc' as const,
              }));
              onUpdateCase({
                milestones: [...caseData.milestones, ...newMilestones],
              });
            }
          }
          break;
      }

      if (result) {
        setCompletedSteps(prev => [...prev, step]);
      }
    } catch (error) {
      console.error(`Generation failed for ${step}:`, error);
    } finally {
      setCurrentStep(null);
    }
  };

  const generateAllSteps = async () => {
    setIsGeneratingAll(true);
    const context = buildContext();

    try {
      const result = await generateCompleteCase(context);
      
      if (result) {
        // Apply all results at once
        const updates: Partial<UserCase> = {};

        if (result.marketStudy) {
          (updates as any).market_study = result.marketStudy;
        }
        if (result.actors?.length > 0) {
          (updates as any).actors_map = result.actors.map((a: any) => ({
            ...a,
            id: a.id || crypto.randomUUID(),
            proofs: a.proofs || [],
          }));
        }
        if (result.risks?.length > 0) {
          (updates as any).risk_register_enhanced = result.risks.map((r: any) => ({
            ...r,
            id: r.id || crypto.randomUUID(),
            alertSignals: r.alertSignals || [],
            protections: r.protections || [],
          }));
        }
        if (result.rules?.length > 0) {
          (updates as any).structural_rules = result.rules.map((r: any) => ({
            ...r,
            id: r.id || crypto.randomUUID(),
          }));
        }
        if (result.poc) {
          updates.poc_hypothesis = result.poc.hypothesis;
          updates.poc_budget = result.poc.budget;
          updates.poc_duration = result.poc.duration;
          updates.poc_success_criteria = result.poc.successCriteria || [];
          updates.poc_stop_criteria = result.poc.stopCriteria || [];
        }
        if (result.milestones?.length > 0) {
          const newMilestones = result.milestones.map((m: any) => ({
            id: crypto.randomUUID(),
            title: m.title,
            deadline: m.deadline,
            completed: false,
            type: m.type || 'custom',
          }));
          updates.milestones = [...caseData.milestones, ...newMilestones];
        }

        onUpdateCase(updates);
        setCompletedSteps(visibleSteps.map(s => s.id));
        toast.success(t('ai.completeGeneration', 'Dossier complet généré !'));
      }
    } catch (error) {
      console.error('Complete generation failed:', error);
    } finally {
      setIsGeneratingAll(false);
    }
  };

  const progress = (completedSteps.length / visibleSteps.length) * 100;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {t('ai.caseGenerator', 'Génération IA')}
                    <Badge variant="secondary" className="text-xs">B2B</Badge>
                  </CardTitle>
                  <CardDescription>
                    {t('ai.caseGeneratorDesc', 'Générer automatiquement le contenu de votre dossier')}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {completedSteps.length > 0 && (
                  <Badge variant="outline" className="bg-green-50">
                    {completedSteps.length}/{visibleSteps.length}
                  </Badge>
                )}
                {isOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </div>
            </div>
          </CollapsibleTrigger>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-4">
            {/* Progress */}
            {completedSteps.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('ai.progress', 'Progression')}</span>
                  <span className="font-medium">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {/* Generate All Button */}
            <Button
              onClick={generateAllSteps}
              disabled={isLoading || isGeneratingAll}
              className="w-full gap-2"
              size="lg"
            >
              {isGeneratingAll ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('ai.generatingComplete', 'Génération complète en cours...')}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {t('ai.generateAll', 'Générer tout le dossier')}
                </>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  {t('common.or', 'ou')}
                </span>
              </div>
            </div>

            {/* Individual Steps */}
            <div className="grid gap-2">
              {visibleSteps.map(step => {
                const Icon = step.icon;
                const isCompleted = completedSteps.includes(step.id);
                const isCurrent = currentStep === step.id;

                return (
                  <Button
                    key={step.id}
                    variant={isCompleted ? 'secondary' : 'outline'}
                    className="justify-start gap-3"
                    disabled={isLoading || isGeneratingAll}
                    onClick={() => generateStep(step.id)}
                  >
                    {isCurrent ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                    <span className="flex-1 text-left">{step.label}</span>
                    {isCompleted && (
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        ✓
                      </Badge>
                    )}
                  </Button>
                );
              })}
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-muted-foreground text-center">
              {t('ai.disclaimer', 'Contenu généré par IA - à vérifier et compléter manuellement')}
            </p>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
