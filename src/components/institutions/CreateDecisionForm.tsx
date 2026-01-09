import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Plus,
  X,
  Target,
  FileText,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  User,
  Calendar,
  Save,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DecisionNodeData } from './DecisionNode';

interface CreateDecisionFormProps {
  onSubmit: (decision: Omit<DecisionNodeData, 'id' | 'children'>) => void;
  onCancel: () => void;
  parentDecision?: DecisionNodeData;
  isLoading?: boolean;
}

export function CreateDecisionForm({ onSubmit, onCancel, parentDecision, isLoading }: CreateDecisionFormProps) {
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    title: '',
    context: '',
    mainHypothesis: '',
    alternativeHypotheses: [''],
    constraints: [''],
    decision: '',
    author: '',
    scope: '',
    date: new Date().toISOString().split('T')[0],
    status: 'pending' as const
  });

  const handleAddAlternative = () => {
    setFormData(prev => ({
      ...prev,
      alternativeHypotheses: [...prev.alternativeHypotheses, '']
    }));
  };

  const handleRemoveAlternative = (index: number) => {
    setFormData(prev => ({
      ...prev,
      alternativeHypotheses: prev.alternativeHypotheses.filter((_, i) => i !== index)
    }));
  };

  const handleAddConstraint = () => {
    setFormData(prev => ({
      ...prev,
      constraints: [...prev.constraints, '']
    }));
  };

  const handleRemoveConstraint = (index: number) => {
    setFormData(prev => ({
      ...prev,
      constraints: prev.constraints.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSubmit({
      ...formData,
      alternativeHypotheses: formData.alternativeHypotheses.filter(h => h.trim()),
      constraints: formData.constraints.filter(c => c.trim()),
      abandonedBranches: []
    });
  };

  const isValid = formData.title && formData.context && formData.mainHypothesis && 
                  formData.decision && formData.author && formData.scope;

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5 text-primary" />
          {parentDecision 
            ? t('traceOS.form.titleSub', 'Nouvelle sous-décision')
            : t('traceOS.form.title', 'Nouvelle décision')
          }
        </CardTitle>
        {parentDecision && (
          <p className="text-sm text-muted-foreground">
            {t('traceOS.form.parentDecision', 'Rattachée à')} : <strong>{parentDecision.title}</strong>
          </p>
        )}
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              {t('traceOS.form.decisionTitle', 'Intitulé de la décision')} *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder={t('traceOS.form.titlePlaceholder', 'Ex: Choix du nouveau CRM')}
            />
          </div>

          {/* Context */}
          <div className="space-y-2">
            <Label htmlFor="context" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              {t('traceOS.form.context', 'Contexte')} *
            </Label>
            <Textarea
              id="context"
              value={formData.context}
              onChange={(e) => setFormData(prev => ({ ...prev, context: e.target.value }))}
              placeholder={t('traceOS.form.contextPlaceholder', 'Décrivez le contexte qui a mené à cette décision...')}
              rows={3}
            />
          </div>

          {/* Main Hypothesis */}
          <div className="space-y-2">
            <Label htmlFor="mainHypothesis" className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              {t('traceOS.form.mainHypothesis', 'Hypothèse principale')} *
            </Label>
            <Textarea
              id="mainHypothesis"
              value={formData.mainHypothesis}
              onChange={(e) => setFormData(prev => ({ ...prev, mainHypothesis: e.target.value }))}
              placeholder={t('traceOS.form.hypothesisPlaceholder', "L'hypothèse sur laquelle repose cette décision...")}
              rows={2}
            />
          </div>

          {/* Alternative Hypotheses */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              {t('traceOS.form.alternativeHypotheses', 'Hypothèses alternatives')}
              <Badge variant="outline" className="text-xs">Optionnel</Badge>
            </Label>
            <div className="space-y-2">
              {formData.alternativeHypotheses.map((hyp, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={hyp}
                    onChange={(e) => {
                      const newHypotheses = [...formData.alternativeHypotheses];
                      newHypotheses[index] = e.target.value;
                      setFormData(prev => ({ ...prev, alternativeHypotheses: newHypotheses }));
                    }}
                    placeholder={t('traceOS.form.alternativePlaceholder', 'Une autre hypothèse envisagée...')}
                  />
                  {formData.alternativeHypotheses.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveAlternative(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddAlternative}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                {t('traceOS.form.addAlternative', 'Ajouter une hypothèse')}
              </Button>
            </div>
          </div>

          {/* Constraints */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              {t('traceOS.form.constraints', 'Contraintes identifiées')}
              <Badge variant="outline" className="text-xs">Optionnel</Badge>
            </Label>
            <div className="space-y-2">
              {formData.constraints.map((constraint, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={constraint}
                    onChange={(e) => {
                      const newConstraints = [...formData.constraints];
                      newConstraints[index] = e.target.value;
                      setFormData(prev => ({ ...prev, constraints: newConstraints }));
                    }}
                    placeholder={t('traceOS.form.constraintPlaceholder', 'Ex: Budget limité, Deadline serrée...')}
                  />
                  {formData.constraints.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveConstraint(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddConstraint}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                {t('traceOS.form.addConstraint', 'Ajouter une contrainte')}
              </Button>
            </div>
          </div>

          {/* Decision Taken */}
          <div className="space-y-2">
            <Label htmlFor="decision" className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              {t('traceOS.form.decisionTaken', 'Décision prise')} *
            </Label>
            <Textarea
              id="decision"
              value={formData.decision}
              onChange={(e) => setFormData(prev => ({ ...prev, decision: e.target.value }))}
              placeholder={t('traceOS.form.decisionPlaceholder', 'La décision finale retenue...')}
              rows={2}
            />
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="author" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {t('traceOS.form.author', 'Auteur')} *
              </Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                placeholder={t('traceOS.form.authorPlaceholder', 'Nom ou rôle')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scope" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                {t('traceOS.form.scope', 'Périmètre')} *
              </Label>
              <Select 
                value={formData.scope} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, scope: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('traceOS.form.scopePlaceholder', 'Sélectionner...')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="strategic">{t('traceOS.form.scopeStrategic', 'Stratégique')}</SelectItem>
                  <SelectItem value="operational">{t('traceOS.form.scopeOperational', 'Opérationnel')}</SelectItem>
                  <SelectItem value="tactical">{t('traceOS.form.scopeTactical', 'Tactique')}</SelectItem>
                  <SelectItem value="project">{t('traceOS.form.scopeProject', 'Projet')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {t('traceOS.form.date', 'Date')}
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              {t('common.cancel', 'Annuler')}
            </Button>
            <Button type="submit" disabled={!isValid || isLoading} className="gap-2">
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {t('traceOS.form.save', 'Enregistrer la décision')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
