// TraceOS Post-Mortem Mode Component
import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  FileSearch, Clock, CheckCircle, XCircle, AlertTriangle, 
  Lightbulb, Target, Download, Save, Loader2,
  ThumbsUp, ThumbsDown, Minus, ArrowRight
} from 'lucide-react';

import { toast } from 'sonner';
import jsPDF from 'jspdf';

interface Decision {
  id: string;
  title: string;
  date: string;
  outcome?: 'success' | 'partial' | 'failure' | 'pending';
  hypothesis?: string;
  context?: string;
}

interface PostMortemData {
  decisionId: string;
  actualOutcome: 'success' | 'partial' | 'failure';
  outcomeDescription: string;
  hypothesisAccuracy: 'confirmed' | 'partially_confirmed' | 'invalidated';
  surprises: string;
  lessonsLearned: string;
  wouldChangeWhat: string;
  recommendations: string;
  biasesDetected: string[];
  completedAt?: string;
}

interface PostMortemModeProps {
  decision: Decision;
  onComplete?: (data: PostMortemData) => void;
}

const COMMON_BIASES = [
  { id: 'confirmation', label: 'Confirmation Bias' },
  { id: 'sunk_cost', label: 'Sunk Cost Fallacy' },
  { id: 'anchoring', label: 'Anchoring' },
  { id: 'overconfidence', label: 'Overconfidence' },
  { id: 'availability', label: 'Availability Heuristic' },
  { id: 'hindsight', label: 'Hindsight Bias' },
  { id: 'groupthink', label: 'Groupthink' },
  { id: 'recency', label: 'Recency Bias' },
];

export function PostMortemMode({ decision, onComplete }: PostMortemModeProps) {
  const { t } = useTranslation();
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [data, setData] = useState<Partial<PostMortemData>>({
    decisionId: decision.id,
    biasesDetected: [],
  });

  const isComplete = useMemo(() => {
    return !!(
      data.actualOutcome &&
      data.outcomeDescription &&
      data.hypothesisAccuracy &&
      data.lessonsLearned
    );
  }, [data]);

  const handleBiasToggle = (biasId: string) => {
    setData(prev => ({
      ...prev,
      biasesDetected: prev.biasesDetected?.includes(biasId)
        ? prev.biasesDetected.filter(b => b !== biasId)
        : [...(prev.biasesDetected || []), biasId],
    }));
  };

  const handleSave = async () => {
    if (!isComplete) {
      toast.error(t('traceos.postMortem.incomplete', 'Please complete required fields'));
      return;
    }

    setIsSaving(true);
    try {
      const completeData: PostMortemData = {
        ...data as PostMortemData,
        completedAt: new Date().toISOString(),
      };
      
      // In production, this would save to database
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onComplete?.(completeData);
      toast.success(t('traceos.postMortem.saved', 'Post-mortem analysis saved'));
    } catch (error) {
      toast.error(t('traceos.postMortem.saveFailed', 'Failed to save analysis'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      let y = margin;

      // Title
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text(t('traceos.postMortem.pdfTitle', 'Decision Post-Mortem'), pageWidth / 2, y, { align: 'center' });
      y += 15;

      // Decision info
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${t('traceos.decision', 'Decision')}: ${decision.title}`, margin, y);
      y += 7;
      pdf.text(`${t('common.date', 'Date')}: ${decision.date}`, margin, y);
      y += 10;

      // Outcome
      pdf.setFont('helvetica', 'bold');
      pdf.text(t('traceos.postMortem.outcome', 'Outcome'), margin, y);
      y += 6;
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${data.actualOutcome?.toUpperCase() || 'N/A'}`, margin, y);
      y += 5;
      const outcomeLines = pdf.splitTextToSize(data.outcomeDescription || '', pageWidth - margin * 2);
      pdf.text(outcomeLines, margin, y);
      y += outcomeLines.length * 5 + 8;

      // Hypothesis accuracy
      pdf.setFont('helvetica', 'bold');
      pdf.text(t('traceos.postMortem.hypothesisAccuracy', 'Hypothesis Accuracy'), margin, y);
      y += 6;
      pdf.setFont('helvetica', 'normal');
      pdf.text(data.hypothesisAccuracy?.replace('_', ' ').toUpperCase() || 'N/A', margin, y);
      y += 10;

      // Lessons learned
      pdf.setFont('helvetica', 'bold');
      pdf.text(t('traceos.postMortem.lessons', 'Lessons Learned'), margin, y);
      y += 6;
      pdf.setFont('helvetica', 'normal');
      const lessonsLines = pdf.splitTextToSize(data.lessonsLearned || '', pageWidth - margin * 2);
      pdf.text(lessonsLines, margin, y);
      y += lessonsLines.length * 5 + 8;

      // Biases
      if (data.biasesDetected && data.biasesDetected.length > 0) {
        pdf.setFont('helvetica', 'bold');
        pdf.text(t('traceos.postMortem.biasesDetected', 'Biases Detected'), margin, y);
        y += 6;
        pdf.setFont('helvetica', 'normal');
        const biasLabels = data.biasesDetected.map(b => COMMON_BIASES.find(cb => cb.id === b)?.label || b);
        pdf.text(biasLabels.join(', '), margin, y);
        y += 10;
      }

      // Recommendations
      if (data.recommendations) {
        pdf.setFont('helvetica', 'bold');
        pdf.text(t('traceos.postMortem.recommendations', 'Recommendations'), margin, y);
        y += 6;
        pdf.setFont('helvetica', 'normal');
        const recLines = pdf.splitTextToSize(data.recommendations, pageWidth - margin * 2);
        pdf.text(recLines, margin, y);
      }

      pdf.save(`post-mortem-${decision.id}-${Date.now()}.pdf`);
      toast.success(t('traceos.postMortem.exportSuccess', 'Post-mortem exported'));
    } catch (error) {
      toast.error(t('traceos.postMortem.exportFailed', 'Failed to export'));
    } finally {
      setIsExporting(false);
    }
  };

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case 'success': return <ThumbsUp className="w-4 h-4 text-green-600" />;
      case 'partial': return <Minus className="w-4 h-4 text-yellow-600" />;
      case 'failure': return <ThumbsDown className="w-4 h-4 text-red-600" />;
      default: return null;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileSearch className="w-5 h-5" />
            {t('traceos.postMortem.title', 'Post-Mortem Analysis')}
          </CardTitle>
          <Badge variant="outline" className="gap-1">
            <Clock className="w-3 h-3" />
            {decision.date}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Decision summary */}
        <div className="p-3 rounded-lg bg-muted/50">
          <p className="font-medium">{decision.title}</p>
          {decision.hypothesis && (
            <p className="text-sm text-muted-foreground mt-1">
              <span className="font-medium">{t('traceos.hypothesis', 'Hypothesis')}:</span> {decision.hypothesis}
            </p>
          )}
        </div>

        {/* Actual Outcome */}
        <div className="space-y-2">
          <Label>{t('traceos.postMortem.actualOutcome', 'What was the actual outcome?')} *</Label>
          <Select
            value={data.actualOutcome}
            onValueChange={(value: 'success' | 'partial' | 'failure') => 
              setData(prev => ({ ...prev, actualOutcome: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder={t('traceos.postMortem.selectOutcome', 'Select outcome')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="success">
                <span className="flex items-center gap-2">
                  <ThumbsUp className="w-4 h-4 text-green-600" />
                  {t('traceos.postMortem.outcomes.success', 'Success')}
                </span>
              </SelectItem>
              <SelectItem value="partial">
                <span className="flex items-center gap-2">
                  <Minus className="w-4 h-4 text-yellow-600" />
                  {t('traceos.postMortem.outcomes.partial', 'Partial Success')}
                </span>
              </SelectItem>
              <SelectItem value="failure">
                <span className="flex items-center gap-2">
                  <ThumbsDown className="w-4 h-4 text-red-600" />
                  {t('traceos.postMortem.outcomes.failure', 'Failure')}
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{t('traceos.postMortem.describeOutcome', 'Describe the outcome')} *</Label>
          <Textarea
            value={data.outcomeDescription || ''}
            onChange={(e) => setData(prev => ({ ...prev, outcomeDescription: e.target.value }))}
            placeholder={t('traceos.postMortem.outcomePlaceholder', 'What specifically happened?')}
            rows={3}
          />
        </div>

        <Separator />

        {/* Hypothesis accuracy */}
        <div className="space-y-2">
          <Label>{t('traceos.postMortem.wasHypothesisCorrect', 'Was your initial hypothesis correct?')} *</Label>
          <Select
            value={data.hypothesisAccuracy}
            onValueChange={(value: 'confirmed' | 'partially_confirmed' | 'invalidated') => 
              setData(prev => ({ ...prev, hypothesisAccuracy: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder={t('traceos.postMortem.selectAccuracy', 'Select accuracy')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="confirmed">
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  {t('traceos.postMortem.accuracy.confirmed', 'Confirmed')}
                </span>
              </SelectItem>
              <SelectItem value="partially_confirmed">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  {t('traceos.postMortem.accuracy.partial', 'Partially Confirmed')}
                </span>
              </SelectItem>
              <SelectItem value="invalidated">
                <span className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-600" />
                  {t('traceos.postMortem.accuracy.invalidated', 'Invalidated')}
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Surprises */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            {t('traceos.postMortem.surprises', 'What surprised you?')}
          </Label>
          <Textarea
            value={data.surprises || ''}
            onChange={(e) => setData(prev => ({ ...prev, surprises: e.target.value }))}
            placeholder={t('traceos.postMortem.surprisesPlaceholder', 'Unexpected events, reactions, or results...')}
            rows={2}
          />
        </div>

        {/* Lessons learned */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            {t('traceos.postMortem.lessonsLearned', 'Key lessons learned')} *
          </Label>
          <Textarea
            value={data.lessonsLearned || ''}
            onChange={(e) => setData(prev => ({ ...prev, lessonsLearned: e.target.value }))}
            placeholder={t('traceos.postMortem.lessonsPlaceholder', 'What will you do differently next time?')}
            rows={3}
          />
        </div>

        {/* Biases detected */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            {t('traceos.postMortem.biasesTitle', 'Cognitive biases detected (select all that apply)')}
          </Label>
          <div className="flex flex-wrap gap-2">
            {COMMON_BIASES.map(bias => (
              <Badge
                key={bias.id}
                variant={data.biasesDetected?.includes(bias.id) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => handleBiasToggle(bias.id)}
              >
                {t(`traceos.biases.${bias.id}`, bias.label)}
              </Badge>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <ArrowRight className="w-4 h-4" />
            {t('traceos.postMortem.recommendations', 'Recommendations for future decisions')}
          </Label>
          <Textarea
            value={data.recommendations || ''}
            onChange={(e) => setData(prev => ({ ...prev, recommendations: e.target.value }))}
            placeholder={t('traceos.postMortem.recommendationsPlaceholder', 'What should the team remember?')}
            rows={2}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button 
            onClick={handleSave} 
            disabled={!isComplete || isSaving} 
            className="flex-1 gap-2"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {t('traceos.postMortem.save', 'Save Analysis')}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleExportPdf}
            disabled={!isComplete || isExporting}
            className="gap-2"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
