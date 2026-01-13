import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ChevronDown, 
  ChevronUp, 
  Shield, 
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  XCircle
} from 'lucide-react';
import type { LegitOption } from '@/hooks/useFinancialIntel';

interface LegitOptionCardProps {
  option: LegitOption;
  index: number;
}

const categoryColors: Record<string, string> = {
  savings: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  bonds: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  funds: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  retirement: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  insurance: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  micro_savings: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  real_estate: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
};

const categoryLabels: Record<string, string> = {
  savings: 'Épargne',
  bonds: 'Obligations',
  funds: 'Fonds/ETF',
  retirement: 'Retraite',
  insurance: 'Assurance',
  micro_savings: 'Micro-épargne',
  real_estate: 'Immobilier',
};

export function LegitOptionCard({ option, index }: LegitOptionCardProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="bg-card/50 border-primary/20 hover:border-primary/40 transition-colors">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold text-sm">
                {index + 1}
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg">{option.name}</CardTitle>
                <Badge 
                  variant="outline" 
                  className={`mt-1 text-xs ${categoryColors[option.category] || 'bg-muted'}`}
                >
                  {categoryLabels[option.category] || option.category}
                </Badge>
              </div>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <CollapsibleContent className="mt-2 space-y-4">
            {/* Pourquoi c'est plus sûr */}
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-green-400 uppercase tracking-wide">
                  {t('financialIntel.whySafer', 'Pourquoi c\'est plus sûr')}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{option.why_safer}</p>
              </div>
            </div>

            {/* Ce que ça n'est pas */}
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-yellow-400 uppercase tracking-wide">
                  {t('financialIntel.whatItsNot', 'Ce que ça n\'est PAS')}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{option.what_its_not}</p>
              </div>
            </div>

            {/* Checklist de vérification */}
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-primary uppercase tracking-wide">
                  {t('financialIntel.verificationChecklist', 'Checklist de vérification')}
                </p>
                <ul className="mt-1 space-y-1">
                  {option.verification_checklist.map((item, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary">☐</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Quand éviter */}
            {option.when_to_avoid.length > 0 && (
              <div className="flex items-start gap-2">
                <XCircle className="h-4 w-4 text-orange-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-orange-400 uppercase tracking-wide">
                    {t('financialIntel.whenToAvoid', 'Cas où éviter')}
                  </p>
                  <ul className="mt-1 space-y-1">
                    {option.when_to_avoid.map((item, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-orange-400">⚠</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Ressources officielles */}
            <div className="pt-2 border-t border-border/50">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                {t('financialIntel.officialResources', 'Ressources officielles')}
              </p>
              <ul className="space-y-1">
                {option.official_resources.map((item, i) => (
                  <li key={i} className="text-xs text-primary flex items-center gap-1">
                    <ExternalLink className="h-3 w-3" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </CollapsibleContent>

          {!isOpen && (
            <p className="text-sm text-muted-foreground line-clamp-2">{option.why_safer}</p>
          )}
        </CardContent>
      </Collapsible>
    </Card>
  );
}
