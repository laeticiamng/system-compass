// PMO Project Synthesis PDF Component
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Download, Loader2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

interface PmoObjective {
  id: string;
  title: string;
  description?: string;
  target_date?: string;
  status: string;
}

interface PmoInitiative {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: number;
  effort_days?: number;
}

interface PmoMilestone {
  id: string;
  title: string;
  target_date: string;
  status: string;
}

interface PmoRisk {
  id: string;
  title: string;
  probability: number;
  impact: number;
  status: string;
}

interface PmoBudgetLine {
  id: string;
  label: string;
  amount: number;
  budget_type: string;
  spent?: number;
}

interface PmoProjectSynthesisProps {
  projectName: string;
  objectives: PmoObjective[];
  initiatives: PmoInitiative[];
  milestones: PmoMilestone[];
  risks: PmoRisk[];
  budgetLines: PmoBudgetLine[];
}

export function PmoProjectSynthesis({
  projectName,
  objectives,
  initiatives,
  milestones,
  risks,
  budgetLines,
}: PmoProjectSynthesisProps) {
  const { t, i18n } = useTranslation();
  const [isExporting, setIsExporting] = useState(false);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(i18n.language === 'fr' ? 'fr-FR' : 'en-US', {
      style: 'currency', currency: 'EUR', maximumFractionDigits: 0
    }).format(amount);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      let y = margin;

      // ===== TITLE PAGE =====
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text(projectName, pageWidth / 2, y + 20, { align: 'center' });
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.text(t('pmo.synthesis.title', 'Project Synthesis Report'), pageWidth / 2, y + 30, { align: 'center' });
      pdf.text(formatDate(new Date().toISOString()), pageWidth / 2, y + 38, { align: 'center' });

      // Summary stats
      y = 70;
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(12);
      const stats = [
        { label: t('pmo.objectives', 'Objectives'), value: objectives.length },
        { label: t('pmo.initiatives', 'Initiatives'), value: initiatives.length },
        { label: t('pmo.milestones', 'Milestones'), value: milestones.length },
        { label: t('pmo.risks', 'Risks'), value: risks.length },
      ];
      
      const colWidth = (pageWidth - margin * 2) / 4;
      stats.forEach((stat, i) => {
        const x = margin + i * colWidth + colWidth / 2;
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(20);
        pdf.text(String(stat.value), x, y, { align: 'center' });
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.text(stat.label, x, y + 6, { align: 'center' });
      });

      // ===== OBJECTIVES =====
      pdf.addPage();
      y = margin;
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(t('pmo.objectives', 'Objectives'), margin, y);
      y += 10;

      objectives.forEach((obj) => {
        if (y > pageHeight - 30) { pdf.addPage(); y = margin; }
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`• ${obj.title}`, margin, y);
        y += 5;
        if (obj.description) {
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(9);
          const descLines = pdf.splitTextToSize(obj.description, pageWidth - margin * 2 - 10);
          pdf.text(descLines, margin + 5, y);
          y += descLines.length * 4 + 3;
        }
      });

      // ===== INITIATIVES =====
      pdf.addPage();
      y = margin;
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(t('pmo.initiatives', 'Initiatives'), margin, y);
      y += 10;

      initiatives.slice(0, 10).forEach((init) => {
        if (y > pageHeight - 30) { pdf.addPage(); y = margin; }
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`[P${init.priority}] ${init.title}`, margin, y);
        y += 5;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(100);
        pdf.text(`Status: ${init.status} | Effort: ${init.effort_days || '?'} days`, margin + 5, y);
        pdf.setTextColor(0);
        y += 6;
      });

      // ===== MILESTONES =====
      pdf.addPage();
      y = margin;
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(t('pmo.milestones', 'Milestones'), margin, y);
      y += 10;

      milestones.forEach((ms) => {
        if (y > pageHeight - 20) { pdf.addPage(); y = margin; }
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        const icon = ms.status === 'completed' ? '✓' : ms.status === 'overdue' ? '⚠' : '○';
        pdf.text(`${icon} ${ms.title} — ${formatDate(ms.target_date)}`, margin, y);
        y += 6;
      });

      // ===== RISKS =====
      pdf.addPage();
      y = margin;
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(t('pmo.risks', 'Risk Register'), margin, y);
      y += 10;

      risks.slice(0, 10).forEach((risk) => {
        if (y > pageHeight - 20) { pdf.addPage(); y = margin; }
        const criticality = risk.probability * risk.impact;
        const icon = criticality >= 60 ? '🔴' : criticality >= 30 ? '🟡' : '🟢';
        pdf.setFontSize(10);
        pdf.text(`${icon} ${risk.title} (P:${risk.probability}% I:${risk.impact}%)`, margin, y);
        y += 6;
      });

      // ===== BUDGET =====
      pdf.addPage();
      y = margin;
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(t('pmo.budget', 'Budget Summary'), margin, y);
      y += 10;

      const totalBudget = budgetLines.reduce((sum, b) => sum + b.amount, 0);
      const totalSpent = budgetLines.reduce((sum, b) => sum + (b.spent || 0), 0);
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${t('pmo.totalBudget', 'Total Budget')}: ${formatCurrency(totalBudget)}`, margin, y);
      y += 6;
      pdf.text(`${t('pmo.totalSpent', 'Total Spent')}: ${formatCurrency(totalSpent)}`, margin, y);
      y += 6;
      pdf.text(`${t('pmo.remaining', 'Remaining')}: ${formatCurrency(totalBudget - totalSpent)}`, margin, y);
      y += 10;

      budgetLines.slice(0, 10).forEach((line) => {
        if (y > pageHeight - 20) { pdf.addPage(); y = margin; }
        pdf.setFontSize(9);
        pdf.text(`• ${line.label} (${line.budget_type}): ${formatCurrency(line.amount)}`, margin, y);
        y += 5;
      });

      // Footer
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'italic');
        pdf.setTextColor(150);
        pdf.text(`${projectName} | Page ${i}/${pageCount}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
      }

      pdf.save(`${projectName}-synthesis-${Date.now()}.pdf`);
      toast.success(t('pmo.exportSuccess', 'Project synthesis exported'));
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error(t('pmo.exportError', 'Failed to export'));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={isExporting}
      className="gap-2"
    >
      {isExporting ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Download className="w-4 h-4" />
      )}
      <FileText className="w-4 h-4" />
      {t('pmo.exportSynthesis', 'Export Synthesis')}
    </Button>
  );
}
