import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ChevronDown, ChevronUp, Clock, Target, AlertTriangle, 
  Zap, CheckCircle, Shield, TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ExitKeyResult } from '@/lib/exit-keys-engine';
import { cn } from '@/lib/utils';

interface ExitKeyCardProps {
  result: ExitKeyResult;
  rank: number;
}

const difficultyColors = {
  easy: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  moderate: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  hard: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  expert: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const difficultyLabels = {
  easy: 'Facile',
  moderate: 'Modéré',
  hard: 'Difficile',
  expert: 'Expert',
};

export default function ExitKeyCard({ result, rank }: ExitKeyCardProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(rank === 1);
  const { key, compatibility, personalizedSteps, warnings, accelerators, planB } = result;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className={cn(
        "glass-card rounded-xl border transition-all duration-300",
        rank === 1 ? "border-primary/50 ring-2 ring-primary/20" : "border-border/50",
        isOpen && "shadow-lg"
      )}>
        {/* Header - Always visible */}
        <CollapsibleTrigger asChild>
          <button className="w-full p-6 text-left focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-xl">
            <div className="flex items-start gap-4">
              {/* Rank & Icon */}
              <div className="relative">
                <span className="text-4xl">{key.icon}</span>
                {rank === 1 && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-primary-foreground">★</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-display text-xl font-bold truncate">{key.name}</h3>
                  <Badge variant="outline" className={difficultyColors[key.difficulty]}>
                    {difficultyLabels[key.difficulty]}
                  </Badge>
                </div>
                
                <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                  {key.description}
                </p>

                {/* Quick Stats */}
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-primary" />
                    <span className="font-medium">{compatibility}%</span>
                    <span className="text-muted-foreground">compatible</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{key.timeframe}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <span>{key.successRate}%</span>
                    <span className="text-muted-foreground">succès</span>
                  </div>
                </div>
              </div>

              {/* Expand/Collapse */}
              <div className="shrink-0">
                {isOpen ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            </div>

            {/* Compatibility Bar */}
            <div className="mt-4">
              <Progress value={compatibility} className="h-2" />
            </div>
          </button>
        </CollapsibleTrigger>

        {/* Expanded Content */}
        <CollapsibleContent>
          <div className="px-6 pb-6 space-y-6 border-t border-border/50 pt-6">
            {/* Accelerators */}
            {accelerators.length > 0 && (
              <div className="bg-emerald-500/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-emerald-500" />
                  <h4 className="font-semibold text-emerald-400">Vos Accélérateurs</h4>
                </div>
                <ul className="space-y-1">
                  {accelerators.map((acc, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5">+</span>
                      {acc}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Warnings */}
            {warnings.length > 0 && (
              <div className="bg-amber-500/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <h4 className="font-semibold text-amber-400">Points d'Attention</h4>
                </div>
                <ul className="space-y-1">
                  {warnings.map((warn, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">⚠</span>
                      {warn}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Phases/Steps */}
            <div>
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                Plan d'Exécution en {personalizedSteps.length} Phases
              </h4>
              
              <div className="space-y-4">
                {personalizedSteps.map((step, index) => (
                  <div 
                    key={index}
                    className="relative pl-8 pb-4 border-l-2 border-border last:border-l-transparent"
                  >
                    {/* Phase indicator */}
                    <div className="absolute left-0 top-0 -translate-x-1/2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-xs font-bold text-primary-foreground">{step.phase}</span>
                    </div>

                    <div className="bg-accent/30 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium">{step.name}</h5>
                        <Badge variant="outline" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {step.duration}
                        </Badge>
                      </div>

                      {/* Actions */}
                      <ul className="space-y-1 mb-3">
                        {step.actions.map((action, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <CheckCircle className="w-3 h-3 text-primary shrink-0 mt-1" />
                            {action}
                          </li>
                        ))}
                      </ul>

                      {/* Milestone */}
                      <div className="flex items-center gap-2 p-2 bg-primary/10 rounded-md">
                        <Target className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-primary">{step.milestone}</span>
                      </div>

                      {/* Critical Rule */}
                      {step.criticalRule && (
                        <div className="mt-2 flex items-center gap-2 p-2 bg-destructive/10 rounded-md">
                          <Shield className="w-4 h-4 text-destructive" />
                          <span className="text-sm font-medium text-destructive">{step.criticalRule}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Requirements */}
            <div>
              <h4 className="font-semibold mb-3">Prérequis</h4>
              <div className="flex flex-wrap gap-2">
                {key.requirements.map((req, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {req}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Risks */}
            <div>
              <h4 className="font-semibold mb-3 text-destructive">Risques Principaux</h4>
              <ul className="space-y-1">
                {key.risks.map((risk, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-destructive mt-0.5">×</span>
                    {risk}
                  </li>
                ))}
              </ul>
            </div>

            {/* Plan B */}
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-primary" />
                <h4 className="font-semibold">Plan B</h4>
              </div>
              <p className="text-sm text-muted-foreground">{planB}</p>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
