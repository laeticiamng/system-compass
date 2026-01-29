import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Key, 
  Clock, 
  Target, 
  AlertTriangle, 
  CheckCircle,
  DollarSign,
  FileText,
  ArrowRight,
  Bookmark,
  Share2
} from 'lucide-react';
import { type ExitKey } from '@/lib/exit-keys-engine';
import { cn } from '@/lib/utils';

interface ExitKeyDetailsModalProps {
  exitKey: ExitKey | null;
  open: boolean;
  onClose: () => void;
  onSave?: (key: ExitKey) => void;
  onStartPlan?: (key: ExitKey) => void;
}

const difficultyColors: Record<string, string> = {
  accessible: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
  exigeant: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
  expert: 'bg-red-500/10 text-red-500 border-red-500/30',
};

export function ExitKeyDetailsModal({ 
  exitKey, 
  open, 
  onClose,
  onSave,
  onStartPlan 
}: ExitKeyDetailsModalProps) {
  const { t } = useTranslation();

  if (!exitKey) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Key className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl mb-1">{exitKey.name}</DialogTitle>
              <DialogDescription className="flex flex-wrap gap-2">
                <Badge 
                  variant="outline" 
                  className={cn(difficultyColors[exitKey.difficulty] || difficultyColors.accessible)}
                >
                  {t(`exitKeys.difficulty.${exitKey.difficulty}`, exitKey.difficulty)}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Clock className="w-3 h-3" />
                  {exitKey.timeframe}
                </Badge>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">{t('exitKeys.tabs.overview', 'Aperçu')}</TabsTrigger>
              <TabsTrigger value="steps">{t('exitKeys.tabs.steps', 'Étapes')}</TabsTrigger>
              <TabsTrigger value="risks">{t('exitKeys.tabs.risks', 'Risques')}</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <Target className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">{t('exitKeys.objective', 'Objectif')}</h4>
                    <p className="text-sm text-muted-foreground">
                      {exitKey.successCondition}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <DollarSign className="w-5 h-5 text-amber-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">{t('exitKeys.unlocks', 'Ce que ça débloque')}</h4>
                    <p className="text-sm text-muted-foreground">
                      {exitKey.unlocks}
                    </p>
                  </div>
                </div>

                {/* Prerequisites */}
                {exitKey.requirements && exitKey.requirements.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      {t('exitKeys.prerequisites', 'Prérequis')}
                    </h4>
                    <ul className="space-y-1.5">
                      {exitKey.requirements.slice(0, 3).map((requirement, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                          {requirement}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="steps" className="space-y-4 mt-4">
              <div className="space-y-3">
                {exitKey.steps.map((step, index) => (
                  <div 
                    key={index}
                    className="flex gap-3 p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-sm font-medium flex items-center justify-center">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm mb-1">{step.name}</h4>
                      <p className="text-xs text-muted-foreground mb-2">
                        {step.duration}
                      </p>
                      <ul className="space-y-1">
                        {step.actions.slice(0, 2).map((action, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                            <ArrowRight className="w-3 h-3 mt-0.5 text-primary" />
                            {action}
                          </li>
                        ))}
                        {step.actions.length > 2 && (
                          <li className="text-xs text-primary">
                            +{step.actions.length - 2} {t('common.more', 'autres')}
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="risks" className="space-y-4 mt-4">
              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <h4 className="font-medium text-sm flex items-center gap-2 text-amber-600 mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  {t('exitKeys.riskWarning', 'Points de vigilance')}
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  {exitKey.mainRisk}
                </p>
                <ul className="space-y-2">
                  <li className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-amber-500">•</span>
                    {t('exitKeys.risks.timeCommitment', 'Engagement temps significatif requis')}
                  </li>
                  <li className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-amber-500">•</span>
                    {t('exitKeys.risks.financialRisk', 'Risque financier variable selon stratégie')}
                  </li>
                  <li className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-amber-500">•</span>
                    {t('exitKeys.risks.regulatoryChanges', 'Règles susceptibles de changer')}
                  </li>
                </ul>
              </div>
              
              {/* Plan B */}
              {exitKey.planB && (
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-medium text-sm mb-2">{t('exitKeys.planB', 'Plan B')}</h4>
                  <p className="text-sm text-muted-foreground">{exitKey.planB}</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </ScrollArea>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          {onSave && (
            <Button variant="outline" onClick={() => onSave(exitKey)} className="gap-2">
              <Bookmark className="w-4 h-4" />
              {t('exitKeys.save', 'Sauvegarder')}
            </Button>
          )}
          <Button variant="outline" className="gap-2">
            <Share2 className="w-4 h-4" />
            {t('common.share', 'Partager')}
          </Button>
          {onStartPlan && (
            <Button onClick={() => onStartPlan(exitKey)} className="gap-2 flex-1">
              {t('exitKeys.startPlan', 'Démarrer ce plan')}
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
