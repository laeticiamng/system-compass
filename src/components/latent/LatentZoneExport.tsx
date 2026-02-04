/**
 * LatentZoneExport - PDF export for latent zones
 * Generates professional reports for zone analysis
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Loader2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import type { LatentZone } from '@/hooks/useLatentZones';

interface LatentZoneExportProps {
  zones: LatentZone[];
  tensions?: Array<{
    zone_id: string;
    tension_type: string;
    description: string;
    intensity: number;
  }>;
}

export function LatentZoneExport({ zones, tensions = [] }: LatentZoneExportProps) {
  const { t } = useTranslation();
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (zones.length === 0) {
      toast.error(t('latent.export.noZones', 'Aucune zone à exporter'));
      return;
    }

    setExporting(true);
    
    try {
      const { jsPDF } = await import('jspdf');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      let yPos = margin;

      // Header
      pdf.setFontSize(24);
      pdf.setTextColor(45, 55, 72);
      pdf.text(t('latent.export.title', 'Rapport Zones Latentes'), margin, yPos);
      yPos += 15;

      // Date
      pdf.setFontSize(10);
      pdf.setTextColor(107, 114, 128);
      pdf.text(`${t('latent.export.generatedOn', 'Généré le')} ${new Date().toLocaleDateString('fr-FR')}`, margin, yPos);
      yPos += 15;

      // Summary
      pdf.setFontSize(14);
      pdf.setTextColor(45, 55, 72);
      pdf.text(t('latent.export.summary', 'Résumé'), margin, yPos);
      yPos += 8;

      pdf.setFontSize(10);
      pdf.setTextColor(75, 85, 99);
      pdf.text(`${t('latent.export.totalZones', 'Zones totales')}: ${zones.length}`, margin, yPos);
      yPos += 6;
      pdf.text(`${t('latent.export.totalTensions', 'Tensions totales')}: ${tensions.length}`, margin, yPos);
      yPos += 15;

      // Zones detail
      pdf.setFontSize(14);
      pdf.setTextColor(45, 55, 72);
      pdf.text(t('latent.export.zonesDetail', 'Détail des zones'), margin, yPos);
      yPos += 10;

      zones.forEach((zone, index) => {
        if (yPos > pageHeight - 60) {
          pdf.addPage();
          yPos = margin;
        }

        pdf.setFontSize(12);
        pdf.setTextColor(45, 55, 72);
        pdf.text(`${index + 1}. ${zone.title}`, margin, yPos);
        yPos += 6;

        pdf.setFontSize(9);
        pdf.setTextColor(107, 114, 128);
        pdf.text(`${t('latent.export.status', 'Statut')}: ${zone.status}`, margin + 5, yPos);
        yPos += 5;

        if (zone.description) {
          const descLines = pdf.splitTextToSize(zone.description, pageWidth - margin * 2 - 5);
          descLines.slice(0, 3).forEach((line: string) => {
            pdf.text(line, margin + 5, yPos);
            yPos += 4;
          });
        }

        const zoneTensions = tensions.filter(t => t.zone_id === zone.id);
        if (zoneTensions.length > 0) {
          yPos += 2;
          pdf.setFontSize(9);
          pdf.setTextColor(220, 38, 38);
          pdf.text(`Tensions: ${zoneTensions.length}`, margin + 5, yPos);
          yPos += 5;
        }

        yPos += 8;
      });

      // Footer
      pdf.setFontSize(8);
      pdf.setTextColor(156, 163, 175);
      pdf.text(
        t('latent.export.disclaimer', 'Ce document est généré automatiquement.'),
        margin,
        pageHeight - 10
      );

      const fileName = `zones-latentes-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      toast.success(t('latent.export.success', 'Export PDF réussi'));
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error(t('latent.export.error', 'Erreur lors de l\'export'));
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={exporting || zones.length === 0}
      className="gap-2"
    >
      {exporting ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <FileText className="w-4 h-4" />
      )}
      {t('latent.export.button', 'Exporter PDF')}
    </Button>
  );
}
