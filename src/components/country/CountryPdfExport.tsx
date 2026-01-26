// Country PDF Export Component - 1-page synthesis per country
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Download, Loader2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

interface CountryData {
  id: string;
  name: string;
  region: string;
  pyramid_type: string;
  snapshot?: {
    summary?: string;
    stability_score?: number;
    economic_freedom?: number;
  };
  quality_of_life?: {
    healthcare_quality?: number;
    education_quality?: number;
    safety_index?: number;
  };
  risks?: Array<{ title: string; severity: string }>;
  positive_points?: Array<{ title: string }>;
}

interface CountryPdfExportProps {
  country: CountryData;
}

export function CountryPdfExport({ country }: CountryPdfExportProps) {
  const { t, i18n } = useTranslation();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 15;
      let y = margin;

      // Header
      pdf.setFontSize(22);
      pdf.setFont('helvetica', 'bold');
      pdf.text(country.name, pageWidth / 2, y, { align: 'center' });
      y += 10;

      // Subtitle
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.text(`${country.region} • ${country.pyramid_type}`, pageWidth / 2, y, { align: 'center' });
      y += 8;

      // Date
      pdf.setFontSize(9);
      const dateStr = new Date().toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
      pdf.text(dateStr, pageWidth / 2, y, { align: 'center' });
      y += 15;

      // Divider
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, y, pageWidth - margin, y);
      y += 10;

      // Summary section
      if (country.snapshot?.summary) {
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text(t('country.summary', 'Summary'), margin, y);
        y += 7;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        const summaryLines = pdf.splitTextToSize(country.snapshot.summary, pageWidth - margin * 2);
        pdf.text(summaryLines, margin, y);
        y += summaryLines.length * 5 + 8;
      }

      // Key Indicators
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(t('country.keyIndicators', 'Key Indicators'), margin, y);
      y += 8;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      const indicators = [
        { label: t('country.stability', 'Stability'), value: country.snapshot?.stability_score ?? 'N/A' },
        { label: t('country.economicFreedom', 'Economic Freedom'), value: country.snapshot?.economic_freedom ?? 'N/A' },
        { label: t('country.healthcare', 'Healthcare'), value: country.quality_of_life?.healthcare_quality ?? 'N/A' },
        { label: t('country.education', 'Education'), value: country.quality_of_life?.education_quality ?? 'N/A' },
        { label: t('country.safety', 'Safety'), value: country.quality_of_life?.safety_index ?? 'N/A' },
      ];

      indicators.forEach((ind) => {
        pdf.text(`• ${ind.label}: ${typeof ind.value === 'number' ? `${ind.value}/100` : ind.value}`, margin + 5, y);
        y += 5;
      });
      y += 8;

      // Positive Points
      if (country.positive_points && country.positive_points.length > 0) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(34, 139, 34);
        pdf.text(t('country.positivePoints', 'Positive Points'), margin, y);
        y += 7;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 0, 0);
        country.positive_points.slice(0, 5).forEach((point) => {
          pdf.text(`✓ ${point.title}`, margin + 5, y);
          y += 5;
        });
        y += 8;
      }

      // Risks
      if (country.risks && country.risks.length > 0) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(180, 0, 0);
        pdf.text(t('country.risks', 'Risks'), margin, y);
        y += 7;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 0, 0);
        country.risks.slice(0, 5).forEach((risk) => {
          pdf.text(`⚠ ${risk.title} (${risk.severity})`, margin + 5, y);
          y += 5;
        });
      }

      // Footer disclaimer
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'italic');
      pdf.setTextColor(150, 150, 150);
      const disclaimer = t('intelligence.disclaimer', 'Analysis tool: not advice.');
      pdf.text(disclaimer, pageWidth / 2, 280, { align: 'center' });

      // Save
      pdf.save(`country-${country.id}-synthesis-${Date.now()}.pdf`);
      toast.success(t('country.exportSuccess', 'Country synthesis exported'));
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error(t('country.exportError', 'Failed to export'));
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
      {t('country.exportPdf', 'Export PDF')}
    </Button>
  );
}
