import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  Plus,
  Link2,
  Tag,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Evidence {
  id: string;
  title: string;
  type: 'document' | 'link' | 'observation' | 'testimonial' | 'data';
  source: string;
  url?: string;
  date: string;
  reliability: 'high' | 'medium' | 'low' | 'unknown';
  supports: 'confirms' | 'contradicts' | 'neutral';
  notes?: string;
}

interface Hypothesis {
  id: string;
  statement: string;
  confidence: number; // 0-100
  evidenceIds: string[];
}

export function EvidenceCollector() {
  const { t } = useTranslation();
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([
    { id: '1', statement: '', confidence: 50, evidenceIds: [] }
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEvidence, setNewEvidence] = useState<Partial<Evidence>>({
    type: 'document',
    reliability: 'medium',
    supports: 'neutral',
  });

  const typeConfig: Record<string, { icon: typeof FileText; color: string }> = {
    document: { icon: FileText, color: 'text-blue-600' },
    link: { icon: Link2, color: 'text-purple-600' },
    observation: { icon: CheckCircle2, color: 'text-green-600' },
    testimonial: { icon: HelpCircle, color: 'text-amber-600' },
    data: { icon: Tag, color: 'text-primary' },
  };

  const reliabilityConfig: Record<string, { label: string; color: string }> = {
    high: { label: t('ovi.evidence.reliability.high', 'Haute'), color: 'bg-green-500/20 text-green-700' },
    medium: { label: t('ovi.evidence.reliability.medium', 'Moyenne'), color: 'bg-amber-500/20 text-amber-700' },
    low: { label: t('ovi.evidence.reliability.low', 'Faible'), color: 'bg-red-500/20 text-red-700' },
    unknown: { label: t('ovi.evidence.reliability.unknown', 'Inconnue'), color: 'bg-gray-500/20 text-gray-700' },
  };

  const addEvidence = () => {
    if (!newEvidence.title || !newEvidence.source) return;

    const evidence: Evidence = {
      id: Date.now().toString(),
      title: newEvidence.title!,
      type: newEvidence.type as Evidence['type'],
      source: newEvidence.source!,
      url: newEvidence.url,
      date: new Date().toISOString().split('T')[0],
      reliability: newEvidence.reliability as Evidence['reliability'],
      supports: newEvidence.supports as Evidence['supports'],
      notes: newEvidence.notes,
    };

    setEvidences([...evidences, evidence]);
    setNewEvidence({ type: 'document', reliability: 'medium', supports: 'neutral' });
    setShowAddForm(false);
  };

  const deleteEvidence = (id: string) => {
    setEvidences(evidences.filter(e => e.id !== id));
  };

  const updateHypothesis = (id: string, updates: Partial<Hypothesis>) => {
    setHypotheses(hypotheses.map(h => 
      h.id === id ? { ...h, ...updates } : h
    ));
  };

  // Calculate hypothesis robustness based on linked evidence
  const calculateRobustness = (hypothesis: Hypothesis) => {
    const linkedEvidences = evidences.filter(e => hypothesis.evidenceIds.includes(e.id));
    if (linkedEvidences.length === 0) return 0;

    const confirmingWeight = linkedEvidences.filter(e => e.supports === 'confirms').length * 2;
    const contradictingWeight = linkedEvidences.filter(e => e.supports === 'contradicts').length * -1.5;
    const reliabilityBonus = linkedEvidences.reduce((sum, e) => {
      if (e.reliability === 'high') return sum + 1;
      if (e.reliability === 'low') return sum - 0.5;
      return sum;
    }, 0);

    const rawScore = 50 + (confirmingWeight + contradictingWeight + reliabilityBonus) * 10;
    return Math.max(0, Math.min(100, rawScore));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
          <FileText className="w-6 h-6 text-primary" />
        </div>
        <h2 className="font-display text-xl font-bold mb-1">
          {t('ovi.evidence.title', 'Collecte de preuves')}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t('ovi.evidence.subtitle', 'Rassemblez et évaluez les éléments qui soutiennent ou contredisent vos hypothèses')}
        </p>
      </div>

      {/* Hypothesis Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-amber-600" />
            {t('ovi.evidence.hypotheses', 'Hypothèse à valider')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {hypotheses.map(hypothesis => {
            const robustness = calculateRobustness(hypothesis);
            return (
              <div key={hypothesis.id} className="space-y-3 p-4 rounded-lg bg-muted/30">
                <Textarea
                  placeholder={t('ovi.evidence.hypothesisPlaceholder', 'Décrivez votre hypothèse principale...')}
                  value={hypothesis.statement}
                  onChange={(e) => updateHypothesis(hypothesis.id, { statement: e.target.value })}
                  className="min-h-[80px]"
                />
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">{t('ovi.evidence.robustness', 'Robustesse')}</span>
                      <span className="font-medium">{Math.round(robustness)}%</span>
                    </div>
                    <Progress value={robustness} className="h-2" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {hypothesis.evidenceIds.length} {t('ovi.evidence.linkedEvidences', 'preuves liées')}
                </p>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Evidence List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Tag className="w-4 h-4 text-primary" />
              {t('ovi.evidence.collected', 'Preuves collectées')}
              <Badge variant="outline">{evidences.length}</Badge>
            </CardTitle>
            <Button size="sm" onClick={() => setShowAddForm(true)} className="gap-1">
              <Plus className="w-4 h-4" />
              {t('ovi.evidence.add', 'Ajouter')}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add form */}
          {showAddForm && (
            <div className="p-4 rounded-lg border border-dashed border-primary/30 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>{t('ovi.evidence.fields.title', 'Titre')} *</Label>
                  <Input
                    value={newEvidence.title || ''}
                    onChange={(e) => setNewEvidence({ ...newEvidence, title: e.target.value })}
                    placeholder={t('ovi.evidence.fields.titlePlaceholder', 'Description de la preuve')}
                  />
                </div>
                <div>
                  <Label>{t('ovi.evidence.fields.type', 'Type')}</Label>
                  <Select 
                    value={newEvidence.type} 
                    onValueChange={(v) => setNewEvidence({ ...newEvidence, type: v as Evidence['type'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="document">{t('ovi.evidence.type.document', 'Document')}</SelectItem>
                      <SelectItem value="link">{t('ovi.evidence.type.link', 'Lien web')}</SelectItem>
                      <SelectItem value="observation">{t('ovi.evidence.type.observation', 'Observation')}</SelectItem>
                      <SelectItem value="testimonial">{t('ovi.evidence.type.testimonial', 'Témoignage')}</SelectItem>
                      <SelectItem value="data">{t('ovi.evidence.type.data', 'Donnée')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t('ovi.evidence.fields.reliability', 'Fiabilité')}</Label>
                  <Select 
                    value={newEvidence.reliability} 
                    onValueChange={(v) => setNewEvidence({ ...newEvidence, reliability: v as Evidence['reliability'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">{t('ovi.evidence.reliability.high', 'Haute')}</SelectItem>
                      <SelectItem value="medium">{t('ovi.evidence.reliability.medium', 'Moyenne')}</SelectItem>
                      <SelectItem value="low">{t('ovi.evidence.reliability.low', 'Faible')}</SelectItem>
                      <SelectItem value="unknown">{t('ovi.evidence.reliability.unknown', 'Inconnue')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t('ovi.evidence.fields.source', 'Source')} *</Label>
                  <Input
                    value={newEvidence.source || ''}
                    onChange={(e) => setNewEvidence({ ...newEvidence, source: e.target.value })}
                    placeholder={t('ovi.evidence.fields.sourcePlaceholder', 'Origine de la preuve')}
                  />
                </div>
                <div>
                  <Label>{t('ovi.evidence.fields.supports', 'Relation à l\'hypothèse')}</Label>
                  <Select 
                    value={newEvidence.supports} 
                    onValueChange={(v) => setNewEvidence({ ...newEvidence, supports: v as Evidence['supports'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="confirms">{t('ovi.evidence.supports.confirms', 'Confirme')}</SelectItem>
                      <SelectItem value="contradicts">{t('ovi.evidence.supports.contradicts', 'Contredit')}</SelectItem>
                      <SelectItem value="neutral">{t('ovi.evidence.supports.neutral', 'Neutre')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label>{t('ovi.evidence.fields.url', 'URL (optionnel)')}</Label>
                  <Input
                    value={newEvidence.url || ''}
                    onChange={(e) => setNewEvidence({ ...newEvidence, url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className="col-span-2">
                  <Label>{t('ovi.evidence.fields.notes', 'Notes')}</Label>
                  <Textarea
                    value={newEvidence.notes || ''}
                    onChange={(e) => setNewEvidence({ ...newEvidence, notes: e.target.value })}
                    placeholder={t('ovi.evidence.fields.notesPlaceholder', 'Observations, commentaires...')}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={addEvidence} disabled={!newEvidence.title || !newEvidence.source}>
                  {t('ovi.evidence.save', 'Enregistrer')}
                </Button>
                <Button variant="ghost" onClick={() => setShowAddForm(false)}>
                  {t('common.cancel', 'Annuler')}
                </Button>
              </div>
            </div>
          )}

          {/* Evidence items */}
          {evidences.length === 0 && !showAddForm ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>{t('ovi.evidence.empty', 'Aucune preuve collectée')}</p>
              <p className="text-xs">{t('ovi.evidence.emptyHint', 'Commencez par ajouter des éléments pour valider vos hypothèses')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {evidences.map(evidence => {
                const typeConf = typeConfig[evidence.type];
                const Icon = typeConf.icon;
                const relConf = reliabilityConfig[evidence.reliability];
                
                return (
                  <div 
                    key={evidence.id}
                    className={`p-3 rounded-lg border ${
                      evidence.supports === 'confirms' ? 'border-green-500/30 bg-green-500/5' :
                      evidence.supports === 'contradicts' ? 'border-red-500/30 bg-red-500/5' :
                      'border-border'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <Icon className={`w-4 h-4 mt-1 ${typeConf.color}`} />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{evidence.title}</h4>
                          <p className="text-xs text-muted-foreground">{evidence.source}</p>
                          {evidence.notes && (
                            <p className="text-xs text-muted-foreground mt-1 italic">{evidence.notes}</p>
                          )}
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline" className={`text-xs ${relConf.color}`}>
                              {relConf.label}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {evidence.supports === 'confirms' && <CheckCircle2 className="w-3 h-3 mr-1 text-green-500" />}
                              {evidence.supports === 'contradicts' && <AlertTriangle className="w-3 h-3 mr-1 text-red-500" />}
                              {t(`ovi.evidence.supports.${evidence.supports}`)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {evidence.url && (
                          <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                            <a href={evidence.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-red-500"
                          onClick={() => deleteEvidence(evidence.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      {evidences.length > 0 && (
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {evidences.filter(e => e.supports === 'confirms').length}
                </p>
                <p className="text-xs text-muted-foreground">{t('ovi.evidence.confirming', 'Confirmantes')}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {evidences.filter(e => e.supports === 'contradicts').length}
                </p>
                <p className="text-xs text-muted-foreground">{t('ovi.evidence.contradicting', 'Contradictoires')}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-600">
                  {evidences.filter(e => e.supports === 'neutral').length}
                </p>
                <p className="text-xs text-muted-foreground">{t('ovi.evidence.neutral', 'Neutres')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
