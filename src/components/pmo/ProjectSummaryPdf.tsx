import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Download, 
  Loader2,
  CheckCircle,
  Clock,
  AlertTriangle,
  Target,
  Calendar,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

interface ProjectSummaryData {
  projectName: string;
  projectDescription?: string;
  status: 'on-track' | 'at-risk' | 'delayed' | 'completed';
  progress: number;
  startDate: string;
  targetDate: string;
  objectives: { name: string; progress: number; status: string }[];
  milestones: { name: string; date: string; completed: boolean }[];
  risks: { name: string; level: 'high' | 'medium' | 'low'; mitigation?: string }[];
  team?: { name: string; role: string }[];
  budget?: { allocated: number; spent: number; currency: string };
  generatedAt: string;
}

interface ProjectSummaryPdfProps {
  data: ProjectSummaryData;
  onGenerate?: () => void;
}

export function ProjectSummaryPdf({ data, onGenerate }: ProjectSummaryPdfProps) {
  const { t } = useTranslation();
  const [generating, setGenerating] = useState(false);

  const generatePdf = async () => {
    setGenerating(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let yPos = 20;

      // Header
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text(data.projectName, margin, yPos);
      yPos += 10;

      // Status badge
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const statusText = data.status === 'on-track' ? 'En bonne voie' : 
                        data.status === 'at-risk' ? 'À risque' :
                        data.status === 'delayed' ? 'En retard' : 'Terminé';
      doc.text(`Statut: ${statusText}`, margin, yPos);
      yPos += 6;

      // Progress
      doc.text(`Progression: ${data.progress}%`, margin, yPos);
      yPos += 6;

      // Dates
      doc.text(`Période: ${data.startDate} - ${data.targetDate}`, margin, yPos);
      yPos += 15;

      // Description
      if (data.projectDescription) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Description', margin, yPos);
        yPos += 6;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const descLines = doc.splitTextToSize(data.projectDescription, pageWidth - 2 * margin);
        doc.text(descLines, margin, yPos);
        yPos += descLines.length * 5 + 10;
      }

      // Objectives
      if (data.objectives.length > 0) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Objectifs', margin, yPos);
        yPos += 8;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        data.objectives.forEach(obj => {
          doc.text(`• ${obj.name} (${obj.progress}%)`, margin, yPos);
          yPos += 5;
        });
        yPos += 5;
      }

      // Milestones
      if (data.milestones.length > 0) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Jalons', margin, yPos);
        yPos += 8;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        data.milestones.forEach(milestone => {
          const status = milestone.completed ? '✓' : '○';
          doc.text(`${status} ${milestone.name} - ${milestone.date}`, margin, yPos);
          yPos += 5;
        });
        yPos += 5;
      }

      // Risks
      if (data.risks.length > 0) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Risques', margin, yPos);
        yPos += 8;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        data.risks.forEach(risk => {
          const levelLabel = risk.level === 'high' ? '[ÉLEVÉ]' : risk.level === 'medium' ? '[MOYEN]' : '[FAIBLE]';
          doc.text(`${levelLabel} ${risk.name}`, margin, yPos);
          yPos += 5;
          if (risk.mitigation) {
            doc.text(`   Mitigation: ${risk.mitigation}`, margin, yPos);
            yPos += 5;
          }
        });
        yPos += 5;
      }

      // Budget
      if (data.budget) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Budget', margin, yPos);
        yPos += 8;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const budgetUsed = ((data.budget.spent / data.budget.allocated) * 100).toFixed(1);
        doc.text(`Alloué: ${data.budget.allocated.toLocaleString()} ${data.budget.currency}`, margin, yPos);
        yPos += 5;
        doc.text(`Dépensé: ${data.budget.spent.toLocaleString()} ${data.budget.currency} (${budgetUsed}%)`, margin, yPos);
        yPos += 10;
      }

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(128);
      doc.text(`Généré le ${data.generatedAt} - Compass`, margin, doc.internal.pageSize.getHeight() - 10);

      // Save
      doc.save(`${data.projectName.replace(/\s+/g, '-').toLowerCase()}-summary.pdf`);
      toast.success(t('pmo.pdf.success', 'PDF généré avec succès'));
      onGenerate?.();
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error(t('pmo.pdf.error', 'Erreur lors de la génération du PDF'));
    } finally {
      setGenerating(false);
    }
  };

  const getStatusIcon = () => {
    switch (data.status) {
      case 'on-track': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'at-risk': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'delayed': return <Clock className="w-4 h-4 text-red-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-primary" />;
    }
  };

  const getStatusLabel = () => {
    switch (data.status) {
      case 'on-track': return t('pmo.status.onTrack', 'En bonne voie');
      case 'at-risk': return t('pmo.status.atRisk', 'À risque');
      case 'delayed': return t('pmo.status.delayed', 'En retard');
      case 'completed': return t('pmo.status.completed', 'Terminé');
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{data.projectName}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                {getStatusIcon()}
                {getStatusLabel()}
              </CardDescription>
            </div>
          </div>
          <Button
            onClick={generatePdf}
            disabled={generating}
            className="gap-2"
          >
            {generating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {t('pmo.pdf.generate', 'Générer PDF')}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress overview */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">{t('pmo.progress', 'Progression')}</span>
            <span className="text-sm font-medium">{data.progress}%</span>
          </div>
          <Progress value={data.progress} className="h-2" />
        </div>

        <Separator />

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <Target className="w-5 h-5 text-primary mx-auto mb-1" />
            <div className="text-lg font-bold">{data.objectives.length}</div>
            <div className="text-xs text-muted-foreground">{t('pmo.objectives', 'Objectifs')}</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <Calendar className="w-5 h-5 text-primary mx-auto mb-1" />
            <div className="text-lg font-bold">{data.milestones.filter(m => m.completed).length}/{data.milestones.length}</div>
            <div className="text-xs text-muted-foreground">{t('pmo.milestones', 'Jalons')}</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <AlertTriangle className="w-5 h-5 text-amber-500 mx-auto mb-1" />
            <div className="text-lg font-bold">{data.risks.filter(r => r.level === 'high').length}</div>
            <div className="text-xs text-muted-foreground">{t('pmo.highRisks', 'Risques élevés')}</div>
          </div>
          {data.budget && (
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <BarChart3 className="w-5 h-5 text-primary mx-auto mb-1" />
              <div className="text-lg font-bold">{((data.budget.spent / data.budget.allocated) * 100).toFixed(0)}%</div>
              <div className="text-xs text-muted-foreground">{t('pmo.budgetUsed', 'Budget utilisé')}</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
