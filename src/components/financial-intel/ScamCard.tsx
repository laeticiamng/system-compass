import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  Target, 
  Shield, 
  Brain,
  ExternalLink,
  Flag
} from 'lucide-react';
import type { ScamItem } from '@/hooks/useFinancialIntel';

interface ScamCardProps {
  scam: ScamItem;
  index: number;
}

const categoryColors: Record<string, string> = {
  ponzi: 'bg-red-500/20 text-red-300 border-red-500/30',
  fake_broker: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  advance_fee: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  pyramid: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  crypto_scam: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  loan_fraud: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  real_estate_fraud: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
};

const categoryLabels: Record<string, string> = {
  ponzi: 'Ponzi',
  fake_broker: 'Faux courtier',
  advance_fee: 'Avance de frais',
  pyramid: 'Pyramide',
  crypto_scam: 'Arnaque crypto',
  loan_fraud: 'Fraude prêt',
  real_estate_fraud: 'Fraude immobilière',
};

export function ScamCard({ scam, index }: ScamCardProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="bg-card/50 border-destructive/20 hover:border-destructive/40 transition-colors">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-destructive/20 text-destructive font-bold text-sm">
                {index + 1}
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg">{scam.name}</CardTitle>
                <Badge 
                  variant="outline" 
                  className={`mt-1 text-xs ${categoryColors[scam.category] || 'bg-muted'}`}
                >
                  {categoryLabels[scam.category] || scam.category}
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
          <p className="text-sm text-muted-foreground">{scam.process}</p>

          <CollapsibleContent className="mt-4 space-y-4">
            {/* Cibles typiques */}
            <div className="flex items-start gap-2">
              <Target className="h-4 w-4 text-orange-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-orange-400 uppercase tracking-wide">
                  {t('financialIntel.typicalTargets', 'Cibles typiques')}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{scam.typical_targets}</p>
              </div>
            </div>

            {/* Signaux d'alerte */}
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-red-400 uppercase tracking-wide">
                  {t('financialIntel.redFlags', 'Signaux d\'alerte')}
                </p>
                <ul className="mt-1 space-y-1">
                  {scam.red_flags.map((flag, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-red-400">•</span>
                      {flag}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Tactiques psychologiques */}
            <div className="flex items-start gap-2">
              <Brain className="h-4 w-4 text-purple-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-purple-400 uppercase tracking-wide">
                  {t('financialIntel.psychologicalTactics', 'Tactiques psychologiques')}
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {scam.psychological_tactics.map((tactic, i) => (
                    <Badge key={i} variant="outline" className="text-xs bg-purple-500/10 border-purple-500/30">
                      {tactic}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Risques */}
            <div className="flex items-start gap-2">
              <Flag className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-destructive uppercase tracking-wide">
                  {t('financialIntel.risks', 'Ce que tu risques')}
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {scam.risks.map((risk, i) => (
                    <Badge key={i} variant="destructive" className="text-xs">
                      {risk}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Protection */}
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-green-400 uppercase tracking-wide">
                  {t('financialIntel.protection', 'Comment te protéger')}
                </p>
                <ul className="mt-1 space-y-1">
                  {scam.protection_checklist.map((item, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-green-400">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Où vérifier / signaler */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/50">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  {t('financialIntel.whereToVerify', 'Où vérifier')}
                </p>
                <ul className="space-y-1">
                  {scam.where_to_verify.map((item, i) => (
                    <li key={i} className="text-xs text-primary flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  {t('financialIntel.whereToReport', 'Où signaler')}
                </p>
                <ul className="space-y-1">
                  {scam.where_to_report.map((item, i) => (
                    <li key={i} className="text-xs text-muted-foreground">{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CollapsibleContent>
        </CardContent>
      </Collapsible>
    </Card>
  );
}
