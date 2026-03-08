import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Download,
  FileJson,
  FileText,
  FileSpreadsheet,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import { DecisionNodeData } from './DecisionNode';

interface TraceOSExportProps {
  decisions: DecisionNodeData[];
  organizationName?: string;
}

export function TraceOSExport({ decisions, organizationName = 'Organisation' }: TraceOSExportProps) {
  const { t } = useTranslation();
  const [isExporting, setIsExporting] = useState(false);

  // Flatten decisions for export
  const flattenDecisions = (nodes: DecisionNodeData[], depth = 0): (DecisionNodeData & { depth: number })[] => {
    let result: (DecisionNodeData & { depth: number })[] = [];
    nodes.forEach(node => {
      result.push({ ...node, depth });
      if (node.children) {
        result = [...result, ...flattenDecisions(node.children, depth + 1)];
      }
    });
    return result;
  };

  const exportToJSON = () => {
    try {
      const exportData = {
        exportDate: new Date().toISOString(),
        organization: organizationName,
        totalDecisions: flattenDecisions(decisions).length,
        decisions: decisions.map(formatDecisionForExport)
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `traceos-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(t('traceOS.export.jsonSuccess', 'Export JSON réussi'));
    } catch (error) {
      console.error('Export JSON error:', error);
      toast.error(t('traceOS.export.error', 'Erreur lors de l\'export'));
    }
  };

  const exportToCSV = () => {
    try {
      const flatDecisions = flattenDecisions(decisions);
      
      // CSV headers
      const headers = [
        'ID',
        'Titre',
        'Statut',
        'Date',
        'Auteur',
        'Scope',
        'Contexte',
        'Hypothèse principale',
        'Décision',
        'Contraintes',
        'Branches abandonnées',
        'Profondeur'
      ];

      // CSV rows
      const rows = flatDecisions.map(d => [
        d.id,
        `"${(d.title || '').replace(/"/g, '""')}"`,
        d.status,
        d.date,
        `"${(d.author || '').replace(/"/g, '""')}"`,
        d.scope,
        `"${(d.context || '').replace(/"/g, '""')}"`,
        `"${(d.mainHypothesis || '').replace(/"/g, '""')}"`,
        `"${(d.decision || '').replace(/"/g, '""')}"`,
        `"${(d.constraints || []).join('; ').replace(/"/g, '""')}"`,
        `"${(d.abandonedBranches || []).map(b => b.title).join('; ').replace(/"/g, '""')}"`,
        d.depth
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `traceos-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(t('traceOS.export.csvSuccess', 'Export CSV réussi'));
    } catch (error) {
      console.error('Export CSV error:', error);
      toast.error(t('traceOS.export.error', 'Erreur lors de l\'export'));
    }
  };

  const formatDecisionForExport = (decision: DecisionNodeData): any => {
    return {
      id: decision.id,
      title: decision.title,
      context: decision.context,
      mainHypothesis: decision.mainHypothesis,
      alternativeHypotheses: decision.alternativeHypotheses,
      constraints: decision.constraints,
      decision: decision.decision,
      author: decision.author,
      scope: decision.scope,
      status: decision.status,
      date: decision.date,
      abandonedBranches: decision.abandonedBranches,
      children: decision.children?.map(formatDecisionForExport) || []
    };
  };

  const exportToPDF = async () => {
    setIsExporting(true);
    
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      let yPosition = margin;

      // Helper function to add new page if needed
      const checkNewPage = (requiredHeight: number) => {
        if (yPosition + requiredHeight > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
          return true;
        }
        return false;
      };

      // Title
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('TraceOS - Arbre Décisionnel', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;

      // Organization and date
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(organizationName, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 6;
      pdf.setFontSize(10);
      pdf.setTextColor(128, 128, 128);
      pdf.text(`Export du ${new Date().toLocaleDateString('fr-FR')}`, pageWidth / 2, yPosition, { align: 'center' });
      pdf.setTextColor(0, 0, 0);
      yPosition += 15;

      // Stats summary
      const flatDecisions = flattenDecisions(decisions);
      const stats = {
        total: flatDecisions.length,
        validated: flatDecisions.filter(d => d.status === 'validated').length,
        pending: flatDecisions.filter(d => d.status === 'pending').length,
        abandoned: flatDecisions.filter(d => d.status === 'abandoned').length
      };

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Résumé:', margin, yPosition);
      yPosition += 5;
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${stats.total} décisions | ${stats.validated} validées | ${stats.pending} en attente | ${stats.abandoned} abandonnées`, margin, yPosition);
      yPosition += 15;

      // Separator line
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      // Decisions
      const renderDecision = (decision: DecisionNodeData & { depth: number }) => {
        const indent = margin + (decision.depth * 10);
        const textWidth = pageWidth - indent - margin;

        // Check for new page
        checkNewPage(50);

        // Status indicator
        const statusColors: Record<string, [number, number, number]> = {
          validated: [34, 197, 94],
          pending: [245, 158, 11],
          abandoned: [156, 163, 175]
        };
        const color = statusColors[decision.status] || [128, 128, 128];
        pdf.setFillColor(color[0], color[1], color[2]);
        pdf.circle(indent + 2, yPosition - 1, 2, 'F');

        // Title
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        const titleLines = pdf.splitTextToSize(decision.title, textWidth - 10);
        pdf.text(titleLines, indent + 8, yPosition);
        yPosition += titleLines.length * 5 + 2;

        // Metadata
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(128, 128, 128);
        pdf.text(`${decision.date} | ${decision.author} | ${decision.scope}`, indent + 8, yPosition);
        pdf.setTextColor(0, 0, 0);
        yPosition += 5;

        // Decision text
        checkNewPage(20);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        const decisionLines = pdf.splitTextToSize(`Décision: ${decision.decision}`, textWidth - 10);
        pdf.text(decisionLines, indent + 8, yPosition);
        yPosition += decisionLines.length * 4 + 3;

        // Main hypothesis
        if (decision.mainHypothesis) {
          checkNewPage(15);
          pdf.setFontSize(8);
          pdf.setTextColor(100, 100, 100);
          const hypLines = pdf.splitTextToSize(`Hypothèse: ${decision.mainHypothesis}`, textWidth - 10);
          pdf.text(hypLines, indent + 8, yPosition);
          pdf.setTextColor(0, 0, 0);
          yPosition += hypLines.length * 3.5 + 3;
        }

        // Constraints
        if (decision.constraints.length > 0) {
          checkNewPage(10);
          pdf.setFontSize(8);
          pdf.setTextColor(100, 100, 100);
          pdf.text(`Contraintes: ${decision.constraints.join(', ')}`, indent + 8, yPosition);
          pdf.setTextColor(0, 0, 0);
          yPosition += 5;
        }

        // Abandoned branches
        if (decision.abandonedBranches && decision.abandonedBranches.length > 0) {
          checkNewPage(15);
          pdf.setFontSize(8);
          pdf.setTextColor(156, 163, 175);
          pdf.text('Branches abandonnées:', indent + 8, yPosition);
          yPosition += 4;
          decision.abandonedBranches.forEach(branch => {
            pdf.text(`  • ${branch.title}: ${branch.reason}`, indent + 8, yPosition);
            yPosition += 4;
          });
          pdf.setTextColor(0, 0, 0);
        }

        yPosition += 8;
      };

      // Render all decisions
      flatDecisions.forEach(renderDecision);

      // Footer on last page
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      pdf.text(
        'Généré par TraceOS - Compass',
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );

      // Save
      pdf.save(`traceos-export-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success(t('traceOS.export.pdfSuccess', 'Export PDF réussi'));
    } catch (error) {
      console.error('Export PDF error:', error);
      toast.error(t('traceOS.export.error', 'Erreur lors de l\'export'));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" disabled={isExporting || decisions.length === 0}>
          {isExporting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          {t('traceOS.export.button', 'Exporter')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{t('traceOS.export.format', 'Format d\'export')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={exportToPDF} className="gap-2 cursor-pointer">
          <FileText className="w-4 h-4 text-red-500" />
          {t('traceOS.export.pdf', 'Document PDF')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToJSON} className="gap-2 cursor-pointer">
          <FileJson className="w-4 h-4 text-blue-500" />
          {t('traceOS.export.json', 'Données JSON')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToCSV} className="gap-2 cursor-pointer">
          <FileSpreadsheet className="w-4 h-4 text-green-500" />
          {t('traceOS.export.csv', 'Tableau CSV')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
