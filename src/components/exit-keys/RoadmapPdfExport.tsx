/**
 * Exit Keys Roadmap PDF Export
 * 
 * Exports personalized exit strategy roadmaps to PDF format.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import jsPDF from 'jspdf';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';

interface RoadmapPhase {
  id: string;
  title: string;
  duration: string;
  steps: Array<{
    id: string;
    label: string;
    cost?: string;
    authority?: string;
    completed?: boolean;
  }>;
}

interface RoadmapPdfExportProps {
  destinationCountry: string;
  profession: string;
  phases: RoadmapPhase[];
  risks?: string[];
  successMilestones?: string[];
  estimatedCost?: string;
  estimatedDuration?: string;
}

export function RoadmapPdfExport({
  destinationCountry,
  profession,
  phases,
  risks = [],
  successMilestones = [],
  estimatedCost,
  estimatedDuration,
}: RoadmapPdfExportProps) {
  const { t } = useTranslation();
  const [isExporting, setIsExporting] = useState(false);

  const exportToPdf = async () => {
    setIsExporting(true);

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let y = 20;

      // Title
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Feuille de Route Personnalisée', pageWidth / 2, y, { align: 'center' });
      y += 12;

      // Subtitle
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text(`${profession} → ${destinationCountry}`, pageWidth / 2, y, { align: 'center' });
      y += 8;

      // Date
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, pageWidth / 2, y, { align: 'center' });
      doc.setTextColor(0);
      y += 15;

      // Summary Box
      if (estimatedCost || estimatedDuration) {
        doc.setFillColor(240, 240, 240);
        doc.roundedRect(14, y, pageWidth - 28, 20, 3, 3, 'F');
        doc.setFontSize(11);
        y += 8;
        
        const summary = [];
        if (estimatedDuration) summary.push(`Durée estimée: ${estimatedDuration}`);
        if (estimatedCost) summary.push(`Coût estimé: ${estimatedCost}`);
        doc.text(summary.join(' | '), pageWidth / 2, y, { align: 'center' });
        y += 18;
      }

      // Phases
      for (const phase of phases) {
        // Check for page break
        if (y > 250) {
          doc.addPage();
          y = 20;
        }

        // Phase header
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(50, 100, 200);
        doc.text(`${phase.title}`, 14, y);
        doc.setTextColor(0);
        y += 5;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(100);
        doc.text(`Durée: ${phase.duration}`, 14, y);
        doc.setTextColor(0);
        doc.setFont('helvetica', 'normal');
        y += 8;

        // Steps
        for (const step of phase.steps) {
          if (y > 275) {
            doc.addPage();
            y = 20;
          }

          const checkbox = step.completed ? '☑' : '☐';
          doc.text(`${checkbox} ${step.label}`, 20, y);
          y += 5;

          if (step.cost || step.authority) {
            doc.setFontSize(9);
            doc.setTextColor(100);
            const details = [];
            if (step.cost) details.push(`Coût: ${step.cost}`);
            if (step.authority) details.push(`Autorité: ${step.authority}`);
            doc.text(`    ${details.join(' | ')}`, 20, y);
            doc.setTextColor(0);
            doc.setFontSize(10);
            y += 5;
          }
        }

        y += 8;
      }

      // Risks Section
      if (risks.length > 0) {
        if (y > 230) {
          doc.addPage();
          y = 20;
        }

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(200, 50, 50);
        doc.text('Risques à Anticiper', 14, y);
        doc.setTextColor(0);
        y += 8;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        for (const risk of risks) {
          doc.text(`⚠ ${risk}`, 14, y);
          y += 5;
        }
        y += 5;
      }

      // Success Milestones
      if (successMilestones.length > 0) {
        if (y > 230) {
          doc.addPage();
          y = 20;
        }

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(50, 150, 50);
        doc.text('Jalons de Succès', 14, y);
        doc.setTextColor(0);
        y += 8;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        for (const milestone of successMilestones) {
          doc.text(`✓ ${milestone}`, 14, y);
          y += 5;
        }
      }

      // Footer on all pages
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `Page ${i}/${pageCount} | Stratégies - System Compass`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      // Save
      const fileName = `roadmap-${destinationCountry.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

    } catch (error) {
      console.error('PDF export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button onClick={exportToPdf} disabled={isExporting}>
      {isExporting ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <FileDown className="w-4 h-4 mr-2" />
      )}
      {t('exitKeys.exportRoadmap', 'Exporter ma feuille de route')}
    </Button>
  );
}
