/**
 * Risk Review Modal - PMO Module
 * 
 * Allows users to add formal reviews to risks with decisions and notes.
 * Implements the addReview functionality that was previously a placeholder.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  ClipboardCheck, AlertTriangle, TrendingUp, TrendingDown, 
  CheckCircle2, Shield, ArrowUpRight, Loader2
} from 'lucide-react';
import type { PmoRiskRow, ReviewDecision } from '@/lib/pmo-types';

interface RiskReviewModalProps {
  risk: PmoRiskRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (review: {
    decision: ReviewDecision;
    assessment?: string | null;
    new_impact: number;
    new_probability: number;
    new_score: number;
    previous_score: number | null;
    actions_generated?: string[] | null;
  }) => Promise<void>;
  isSubmitting?: boolean;
}

const DECISION_OPTIONS: { value: ReviewDecision; label: string; icon: React.ReactNode; description: string }[] = [
  { 
    value: 'accept', 
    label: 'Accepter', 
    icon: <CheckCircle2 className="w-4 h-4" />,
    description: 'Le risque est accepté tel quel, sans action supplémentaire'
  },
  { 
    value: 'mitigate', 
    label: 'Atténuer', 
    icon: <Shield className="w-4 h-4" />,
    description: 'Des actions de mitigation sont nécessaires'
  },
  { 
    value: 'escalate', 
    label: 'Escalader', 
    icon: <ArrowUpRight className="w-4 h-4" />,
    description: 'Le risque doit être porté à un niveau supérieur'
  },
  { 
    value: 'transfer', 
    label: 'Transférer', 
    icon: <TrendingUp className="w-4 h-4" />,
    description: 'Transférer le risque (assurance, sous-traitance)'
  },
  { 
    value: 'close', 
    label: 'Clôturer', 
    icon: <TrendingDown className="w-4 h-4" />,
    description: 'Le risque n\'est plus pertinent ou a été résolu'
  },
];

export function RiskReviewModal({
  risk,
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}: RiskReviewModalProps) {
  const { t } = useTranslation();
  
  const [decision, setDecision] = useState<ReviewDecision>('accept');
  const [notes, setNotes] = useState('');
  const [newImpact, setNewImpact] = useState<number>(risk?.impact || 3);
  const [newProbability, setNewProbability] = useState<number>(risk?.probability || 3);
  const [actionsTaken, setActionsTaken] = useState('');

  // Reset form when risk changes
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && risk) {
      setNewImpact(risk.impact);
      setNewProbability(risk.probability);
      setDecision('accept');
      setNotes('');
      setActionsTaken('');
    }
    onOpenChange(isOpen);
  };

  const handleSubmit = async () => {
    if (!risk) return;

    const review = {
      decision,
      assessment: notes.trim() || null,
      previous_score: risk.score,
      new_impact: newImpact,
      new_probability: newProbability,
      new_score: newImpact * newProbability,
      actions_generated: actionsTaken.trim() ? [actionsTaken.trim()] : null,
    };

    await onSubmit(review);
    onOpenChange(false);
  };

  const currentScore = (risk?.impact || 0) * (risk?.probability || 0);
  const newScore = newImpact * newProbability;
  const scoreChange = newScore - currentScore;

  const getScoreColor = (score: number) => {
    if (score <= 4) return 'text-green-600';
    if (score <= 9) return 'text-yellow-600';
    if (score <= 16) return 'text-orange-600';
    return 'text-red-600';
  };

  if (!risk) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-primary" />
            {t('pmo.risks.reviewTitle', 'Revue du risque')}
          </DialogTitle>
          <DialogDescription>
            {risk.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Score Display */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div>
              <span className="text-sm text-muted-foreground">Score actuel</span>
              <p className={`text-2xl font-bold ${getScoreColor(currentScore)}`}>
                {currentScore}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {scoreChange !== 0 && (
                <Badge variant={scoreChange < 0 ? 'default' : 'destructive'}>
                  {scoreChange > 0 ? '+' : ''}{scoreChange}
                </Badge>
              )}
              <span className="text-xl">→</span>
              <div>
                <span className="text-sm text-muted-foreground">Nouveau score</span>
                <p className={`text-2xl font-bold ${getScoreColor(newScore)}`}>
                  {newScore}
                </p>
              </div>
            </div>
          </div>

          {/* Re-evaluation sliders */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Impact (1-5)</Label>
              <div className="flex items-center gap-3">
                <Slider
                  value={[newImpact]}
                  onValueChange={([val]) => setNewImpact(val)}
                  min={1}
                  max={5}
                  step={1}
                  className="flex-1"
                />
                <Badge variant="outline">{newImpact}</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Probabilité (1-5)</Label>
              <div className="flex items-center gap-3">
                <Slider
                  value={[newProbability]}
                  onValueChange={([val]) => setNewProbability(val)}
                  min={1}
                  max={5}
                  step={1}
                  className="flex-1"
                />
                <Badge variant="outline">{newProbability}</Badge>
              </div>
            </div>
          </div>

          {/* Decision */}
          <div className="space-y-2">
            <Label>Décision</Label>
            <Select value={decision} onValueChange={(v) => setDecision(v as ReviewDecision)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DECISION_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div className="flex items-center gap-2">
                      {opt.icon}
                      <span>{opt.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {DECISION_OPTIONS.find(o => o.value === decision)?.description}
            </p>
          </div>

          {/* Actions Taken */}
          <div className="space-y-2">
            <Label>Actions réalisées</Label>
            <Textarea
              value={actionsTaken}
              onChange={(e) => setActionsTaken(e.target.value)}
              placeholder="Décrivez les actions déjà prises pour ce risque..."
              rows={2}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes de revue</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observations, contexte, recommandations..."
              rows={3}
            />
          </div>

          {/* Warning for escalation */}
          {decision === 'escalate' && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                L'escalade notifiera automatiquement les parties prenantes concernées.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Enregistrer la revue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
