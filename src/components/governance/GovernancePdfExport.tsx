/**
 * Governance PDF Export Component
 * 
 * Generates comprehensive PDF reports for country governance analysis.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import jsPDF from 'jspdf';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';
import type { GovernanceScore } from '@/hooks/useCountryGovernance';

interface GovernancePdfExportProps {
  countryName: string;
  countryId: string;
  governance: GovernanceScore;
  actors?: Array<{
    label: string;
    actor_type: string;
    sector?: string;
    power_types?: string[];
  }>;
}

export function GovernancePdfExport({
  countryName,
  countryId,
  governance,
  actors = [],
}: GovernancePdfExportProps) {
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
      doc.text(`Analyse de Gouvernance: ${countryName}`, pageWidth / 2, y, { align: 'center' });
      y += 10;

      // Date
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, pageWidth / 2, y, { align: 'center' });
      y += 15;

      // Scores Section
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Scores de Gouvernance', 14, y);
      y += 8;

      const scores = [
        { label: 'Stabilité', value: governance.stability_score, notes: governance.stability_notes },
        { label: 'Écosystème', value: governance.ecosystem_score, notes: governance.ecosystem_notes },
        { label: 'Risque de Capture', value: governance.capture_risk_score, notes: governance.capture_risk_notes },
        { label: 'Friction', value: governance.friction_score, notes: governance.friction_notes },
        { label: 'Opérationnel', value: governance.operational_score, notes: governance.operational_notes },
      ];

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      for (const score of scores) {
        const scoreText = `${score.label}: ${score.value}/5`;
        const progressBar = '█'.repeat(score.value) + '░'.repeat(5 - score.value);
        doc.text(`${scoreText} ${progressBar}`, 14, y);
        y += 5;
        
        if (score.notes) {
          doc.setFontSize(9);
          doc.setTextColor(100);
          const lines = doc.splitTextToSize(score.notes, pageWidth - 28);
          doc.text(lines, 14, y);
          y += lines.length * 4 + 3;
          doc.setTextColor(0);
          doc.setFontSize(10);
        }
      }

      y += 10;

      // Attractiveness Section
      if (governance.attractiveness) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Facteurs d\'Attractivité', 14, y);
        y += 8;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        const attr = governance.attractiveness as Record<string, unknown>;
        for (const [key, value] of Object.entries(attr)) {
          if (typeof value === 'string' || typeof value === 'number') {
            doc.text(`• ${key}: ${value}`, 14, y);
            y += 5;
          }
        }
        y += 5;
      }

      // Friction Risks
      if (governance.friction_risks && Array.isArray(governance.friction_risks)) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Risques de Friction', 14, y);
        y += 8;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        for (const risk of governance.friction_risks) {
          if (typeof risk === 'string') {
            doc.text(`• ${risk}`, 14, y);
            y += 5;
          }
        }
        y += 5;
      }

      // Check if we need a new page
      if (y > 250) {
        doc.addPage();
        y = 20;
      }

      // Actors Section
      if (actors.length > 0) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Acteurs Clés', 14, y);
        y += 8;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        for (const actor of actors.slice(0, 10)) {
          const actorText = `• ${actor.label} (${actor.actor_type})${actor.sector ? ` - ${actor.sector}` : ''}`;
          doc.text(actorText, 14, y);
          y += 5;

          if (y > 280) {
            doc.addPage();
            y = 20;
          }
        }
      }

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `Page ${i} sur ${pageCount} | World Alignment Platform`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      // Save
      doc.save(`governance-${countryId}-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('PDF export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button variant="outline" onClick={exportToPdf} disabled={isExporting}>
      {isExporting ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <FileDown className="w-4 h-4 mr-2" />
      )}
      {t('governance.exportPdf', 'Exporter PDF')}
    </Button>
  );
}
