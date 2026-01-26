// TraceOS Multi-format Export Component
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger, DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { Download, Loader2, FileText, FileJson, Table2 } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

interface Decision {
  id: string;
  title: string;
  status: string;
  hypothesis?: string;
  context?: string;
  alternatives?: string[];
  constraints?: string[];
  abandoned_branches?: string[];
  created_at: string;
  sealed_at?: string;
}

interface TraceOSMultiExportProps {
  decisions: Decision[];
  projectName?: string;
}

export function TraceOSMultiExport({ decisions, projectName = 'TraceOS' }: TraceOSMultiExportProps) {
  const { t, i18n } = useTranslation();
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<string | null>(null);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const exportCSV = () => {
    const headers = ['ID', 'Title', 'Status', 'Hypothesis', 'Context', 'Alternatives', 'Constraints', 'Abandoned', 'Created', 'Sealed'];
    const rows = decisions.map(d => [
      d.id,
      d.title,
      d.status,
      d.hypothesis || '',
      d.context || '',
      (d.alternatives || []).join('; '),
      (d.constraints || []).join('; '),
      (d.abandoned_branches || []).join('; '),
      formatDate(d.created_at),
      d.sealed_at ? formatDate(d.sealed_at) : '',
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${projectName}-decisions-${Date.now()}.csv`;
    link.click();
  };

  const exportJSON = () => {
    const exportData = {
      project: projectName,
      exported_at: new Date().toISOString(),
      total_decisions: decisions.length,
      decisions: decisions.map(d => ({
        id: d.id,
        title: d.title,
        status: d.status,
        hypothesis: d.hypothesis,
        context: d.context,
        alternatives: d.alternatives,
        constraints: d.constraints,
        abandoned_branches: d.abandoned_branches,
        created_at: d.created_at,
        sealed_at: d.sealed_at,
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${projectName}-decisions-${Date.now()}.json`;
    link.click();
  };

  const exportPDF = () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    let y = margin;

    // Title
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${projectName} - Decision Log`, pageWidth / 2, y, { align: 'center' });
    y += 10;

    // Subtitle
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    pdf.text(`${t('traceos.exportDate', 'Exported')}: ${formatDate(new Date().toISOString())}`, pageWidth / 2, y, { align: 'center' });
    pdf.text(`${decisions.length} ${t('traceos.decisions', 'decisions')}`, pageWidth / 2, y + 5, { align: 'center' });
    y += 15;

    // Decisions
    decisions.forEach((decision, index) => {
      if (y > pageHeight - 40) {
        pdf.addPage();
        y = margin;
      }

      // Decision header
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, y, pageWidth - margin, y);
      y += 5;

      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${index + 1}. ${decision.title}`, margin, y);
      y += 6;

      // Status badge
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Status: ${decision.status} | Created: ${formatDate(decision.created_at)}`, margin, y);
      y += 6;

      // Hypothesis
      if (decision.hypothesis) {
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'bold');
        pdf.text(t('traceos.hypothesis', 'Hypothesis') + ':', margin, y);
        y += 4;
        pdf.setFont('helvetica', 'normal');
        const hypLines = pdf.splitTextToSize(decision.hypothesis, pageWidth - margin * 2);
        pdf.text(hypLines, margin + 5, y);
        y += hypLines.length * 4 + 2;
      }

      // Context
      if (decision.context) {
        pdf.setFont('helvetica', 'bold');
        pdf.text(t('traceos.context', 'Context') + ':', margin, y);
        y += 4;
        pdf.setFont('helvetica', 'normal');
        const ctxLines = pdf.splitTextToSize(decision.context, pageWidth - margin * 2);
        pdf.text(ctxLines, margin + 5, y);
        y += ctxLines.length * 4 + 2;
      }

      // Constraints
      if (decision.constraints && decision.constraints.length > 0) {
        pdf.setFont('helvetica', 'bold');
        pdf.text(t('traceos.constraints', 'Constraints') + ':', margin, y);
        y += 4;
        pdf.setFont('helvetica', 'normal');
        decision.constraints.slice(0, 3).forEach(c => {
          pdf.text(`• ${c}`, margin + 5, y);
          y += 4;
        });
      }

      y += 5;
    });

    // Footer
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'italic');
    pdf.setTextColor(150, 150, 150);
    pdf.text(t('traceos.disclaimer', 'Decision intelligence export - for internal use only'), pageWidth / 2, pageHeight - 10, { align: 'center' });

    pdf.save(`${projectName}-decisions-${Date.now()}.pdf`);
  };

  const handleExport = async (format: string) => {
    setIsExporting(true);
    setExportFormat(format);
    try {
      switch (format) {
        case 'csv':
          exportCSV();
          break;
        case 'json':
          exportJSON();
          break;
        case 'pdf':
          exportPDF();
          break;
      }
      toast.success(t('traceos.exportSuccess', 'Export completed'));
    } catch (error) {
      console.error('Export error:', error);
      toast.error(t('traceos.exportError', 'Export failed'));
    } finally {
      setIsExporting(false);
      setExportFormat(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isExporting || decisions.length === 0}>
          {isExporting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          {t('traceos.export', 'Export')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport('csv')} disabled={exportFormat === 'csv'}>
          <Table2 className="w-4 h-4 mr-2" />
          {t('traceos.exportCSV', 'Export CSV')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('json')} disabled={exportFormat === 'json'}>
          <FileJson className="w-4 h-4 mr-2" />
          {t('traceos.exportJSON', 'Export JSON')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExport('pdf')} disabled={exportFormat === 'pdf'}>
          <FileText className="w-4 h-4 mr-2" />
          {t('traceos.exportPDF', 'Export PDF Report')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
