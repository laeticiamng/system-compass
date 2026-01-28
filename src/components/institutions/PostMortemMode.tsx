import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Download,
  Lightbulb,
  RefreshCw,
  FileText
} from 'lucide-react';
import { DecisionNodeData } from './DecisionNode';

interface BiasAnalysis {
  id: string;
  name: string;
  description: string;
  detected: boolean;
  evidence: string;
}

interface PostMortemModeProps {
  decision: DecisionNodeData;
  onClose?: () => void;
}

export function PostMortemMode({ decision, onClose }: PostMortemModeProps) {
  const { t } = useTranslation();
  const [outcome, setOutcome] = useState<'success' | 'partial' | 'failure' | null>(null);
  const [lessonsLearned, setLessonsLearned] = useState('');
  const [whatWorked, setWhatWorked] = useState('');
  const [whatDidntWork, setWhatDidntWork] = useState('');
  const [wouldDoAgain, setWouldDoAgain] = useState<'yes' | 'no' | 'modified' | null>(null);
  
  const [biases, setBiases] = useState<BiasAnalysis[]>([
    {
      id: 'confirmation',
      name: t('traceOS.postMortem.biases.confirmation', 'Biais de confirmation'),
      description: t('traceOS.postMortem.biases.confirmationDesc', 'Tendance à privilégier les informations confirmant nos hypothèses.'),
      detected: false,
      evidence: '',
    },
    {
      id: 'anchoring',
      name: t('traceOS.postMortem.biases.anchoring', 'Biais d\'ancrage'),
      description: t('traceOS.postMortem.biases.anchoringDesc', 'Influence excessive de la première information reçue.'),
      detected: false,
      evidence: '',
    },
    {
      id: 'sunk-cost',
      name: t('traceOS.postMortem.biases.sunkCost', 'Biais des coûts irrécupérables'),
      description: t('traceOS.postMortem.biases.sunkCostDesc', 'Continuer un projet en raison des investissements passés.'),
      detected: false,
      evidence: '',
    },
    {
      id: 'groupthink',
      name: t('traceOS.postMortem.biases.groupthink', 'Pensée de groupe'),
      description: t('traceOS.postMortem.biases.groupthinkDesc', 'Conformité au consensus du groupe au détriment de l\'analyse critique.'),
      detected: false,
      evidence: '',
    },
    {
      id: 'hindsight',
      name: t('traceOS.postMortem.biases.hindsight', 'Biais rétrospectif'),
      description: t('traceOS.postMortem.biases.hindsightDesc', 'Tendance à considérer les événements passés comme prévisibles.'),
      detected: false,
      evidence: '',
    },
  ]);

  const toggleBias = (biasId: string) => {
    setBiases(biases.map(b => 
      b.id === biasId ? { ...b, detected: !b.detected } : b
    ));
  };

  const updateBiasEvidence = (biasId: string, evidence: string) => {
    setBiases(biases.map(b => 
      b.id === biasId ? { ...b, evidence } : b
    ));
  };

  const detectedBiasCount = biases.filter(b => b.detected).length;

  const exportToPdf = () => {
    // In production, this would generate a proper PDF
    const content = {
      decision: decision.title,
      date: decision.date,
      outcome,
      lessonsLearned,
      whatWorked,
      whatDidntWork,
      wouldDoAgain,
      biases: biases.filter(b => b.detected),
    };
    
    const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `post-mortem-${decision.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="border-amber-500/30">
      <CardHeader className="bg-amber-500/5">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-amber-600" />
              {t('traceOS.postMortem.title', 'Analyse Post-Mortem')}
            </CardTitle>
            <CardDescription>
              {t('traceOS.postMortem.subtitle', 'Réflexion structurée sur la décision et ses résultats.')}
            </CardDescription>
          </div>
          <Badge variant="outline" className="border-amber-500/30 text-amber-700">
            {decision.title}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Outcome evaluation */}
        <div className="space-y-3">
          <Label className="text-base font-medium">
            {t('traceOS.postMortem.outcome', 'Résultat global de la décision')}
          </Label>
          <RadioGroup value={outcome || ''} onValueChange={(v) => setOutcome(v as typeof outcome)}>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/30 cursor-pointer">
                <RadioGroupItem value="success" id="success" />
                <Label htmlFor="success" className="flex items-center gap-2 cursor-pointer">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  {t('traceOS.postMortem.success', 'Succès')}
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/30 cursor-pointer">
                <RadioGroupItem value="partial" id="partial" />
                <Label htmlFor="partial" className="flex items-center gap-2 cursor-pointer">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  {t('traceOS.postMortem.partial', 'Partiel')}
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/30 cursor-pointer">
                <RadioGroupItem value="failure" id="failure" />
                <Label htmlFor="failure" className="flex items-center gap-2 cursor-pointer">
                  <XCircle className="w-4 h-4 text-red-500" />
                  {t('traceOS.postMortem.failure', 'Échec')}
                </Label>
              </div>
            </div>
          </RadioGroup>
        </div>

        <Separator />

        {/* Bias analysis */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">
              {t('traceOS.postMortem.biasAnalysis', 'Analyse des biais cognitifs')}
            </Label>
            {detectedBiasCount > 0 && (
              <Badge variant="destructive">
                {detectedBiasCount} {t('traceOS.postMortem.biasesDetected', 'biais détectés')}
              </Badge>
            )}
          </div>
          
          <div className="space-y-3">
            {biases.map((bias) => (
              <div 
                key={bias.id}
                className={`p-3 border rounded-lg transition-colors ${
                  bias.detected ? 'bg-red-500/5 border-red-500/30' : ''
                }`}
              >
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleBias(bias.id)}
                >
                  <div>
                    <div className="font-medium">{bias.name}</div>
                    <div className="text-sm text-muted-foreground">{bias.description}</div>
                  </div>
                  <Button
                    variant={bias.detected ? 'destructive' : 'outline'}
                    size="sm"
                  >
                    {bias.detected 
                      ? t('traceOS.postMortem.detected', 'Détecté')
                      : t('traceOS.postMortem.notDetected', 'Non détecté')}
                  </Button>
                </div>
                
                {bias.detected && (
                  <div className="mt-3">
                    <Textarea
                      value={bias.evidence}
                      onChange={(e) => updateBiasEvidence(bias.id, e.target.value)}
                      placeholder={t('traceOS.postMortem.evidencePlaceholder', 'Décrivez les indices qui vous ont fait identifier ce biais...')}
                      className="min-h-[60px]"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Lessons learned */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              {t('traceOS.postMortem.whatWorked', 'Ce qui a fonctionné')}
            </Label>
            <Textarea
              value={whatWorked}
              onChange={(e) => setWhatWorked(e.target.value)}
              placeholder={t('traceOS.postMortem.whatWorkedPlaceholder', 'Points positifs à reproduire...')}
              className="min-h-[100px]"
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500" />
              {t('traceOS.postMortem.whatDidntWork', 'Ce qui n\'a pas fonctionné')}
            </Label>
            <Textarea
              value={whatDidntWork}
              onChange={(e) => setWhatDidntWork(e.target.value)}
              placeholder={t('traceOS.postMortem.whatDidntWorkPlaceholder', 'Points à améliorer...')}
              className="min-h-[100px]"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            {t('traceOS.postMortem.lessonsLearned', 'Leçons apprises')}
          </Label>
          <Textarea
            value={lessonsLearned}
            onChange={(e) => setLessonsLearned(e.target.value)}
            placeholder={t('traceOS.postMortem.lessonsPlaceholder', 'Que retenez-vous de cette expérience ?')}
            className="min-h-[100px]"
          />
        </div>

        {/* Would do again */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-primary" />
            {t('traceOS.postMortem.wouldDoAgain', 'Referiez-vous la même décision ?')}
          </Label>
          <RadioGroup value={wouldDoAgain || ''} onValueChange={(v) => setWouldDoAgain(v as typeof wouldDoAgain)}>
            <div className="flex gap-3">
              <div className="flex items-center space-x-2 p-2 border rounded-lg">
                <RadioGroupItem value="yes" id="yes" />
                <Label htmlFor="yes" className="cursor-pointer">
                  {t('traceOS.postMortem.yes', 'Oui, identique')}
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-2 border rounded-lg">
                <RadioGroupItem value="modified" id="modified" />
                <Label htmlFor="modified" className="cursor-pointer">
                  {t('traceOS.postMortem.modified', 'Oui, avec modifications')}
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-2 border rounded-lg">
                <RadioGroupItem value="no" id="no" />
                <Label htmlFor="no" className="cursor-pointer">
                  {t('traceOS.postMortem.no', 'Non')}
                </Label>
              </div>
            </div>
          </RadioGroup>
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            {t('common.close', 'Fermer')}
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportToPdf} className="gap-2">
              <Download className="w-4 h-4" />
              {t('traceOS.postMortem.export', 'Exporter PDF')}
            </Button>
            <Button className="gap-2">
              <FileText className="w-4 h-4" />
              {t('traceOS.postMortem.save', 'Sauvegarder')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
