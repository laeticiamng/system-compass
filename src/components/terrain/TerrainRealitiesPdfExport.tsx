import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { FileText, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { TerrainRealitiesResult } from '@/hooks/useTerrainRealities';
import { toast } from 'sonner';

interface TerrainRealitiesPdfExportProps {
  data: TerrainRealitiesResult;
  countryName: string;
}

export function TerrainRealitiesPdfExport({ data, countryName }: TerrainRealitiesPdfExportProps) {
  const { t } = useTranslation();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const doc = new jsPDF();
      let yPos = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;

      const addNewPageIfNeeded = (requiredSpace: number) => {
        if (yPos + requiredSpace > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage();
          yPos = 20;
        }
      };

      const getRiskLabel = (level: 'high' | 'medium' | 'low') => {
        return t(`terrainRealities.risk${level.charAt(0).toUpperCase() + level.slice(1)}`);
      };

      // Title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(`${t('terrainRealities.title')} - ${countryName}`, margin, yPos);
      yPos += 10;

      // Metadata
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`${t('terrainRealities.lastUpdated')}: ${data.last_updated}`, margin, yPos);
      yPos += 5;
      doc.text(`${t('terrainRealities.overallRisk')}: ${getRiskLabel(data.overall_risk_level)}`, margin, yPos);
      yPos += 5;
      doc.text(`${t('terrainRealities.confidence')}: ${Math.round(data.confidence_score * 100)}%`, margin, yPos);
      yPos += 10;

      // Section: Healthcare
      addNewPageIfNeeded(60);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`${t('terrainRealities.healthcare')} (${getRiskLabel(data.healthcare_realities.risk_level)})`, margin, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      // Fake medications
      doc.text(`${t('terrainRealities.pdfFakeMedications')}: ${data.healthcare_realities.fake_medications.prevalence}`, margin, yPos);
      yPos += 5;

      if (data.healthcare_realities.fake_medications.affected_categories.length > 0) {
        const categories = data.healthcare_realities.fake_medications.affected_categories.join(', ');
        const lines = doc.splitTextToSize(`${t('terrainRealities.pdfAffectedCategories')}: ${categories}`, maxWidth);
        doc.text(lines, margin, yPos);
        yPos += lines.length * 5;
      }

      // Medical equipment
      if (data.healthcare_realities.medical_equipment.issues.length > 0) {
        const issues = data.healthcare_realities.medical_equipment.issues.join(', ');
        const lines = doc.splitTextToSize(`${t('terrainRealities.pdfEquipmentIssues')}: ${issues}`, maxWidth);
        addNewPageIfNeeded(lines.length * 5);
        doc.text(lines, margin, yPos);
        yPos += lines.length * 5;
      }

      // Recommendations
      if (data.healthcare_realities.recommendations.length > 0) {
        addNewPageIfNeeded(20);
        doc.setFont('helvetica', 'bold');
        doc.text(`${t('terrainRealities.recommendations')}:`, margin, yPos);
        yPos += 5;
        doc.setFont('helvetica', 'normal');
        data.healthcare_realities.recommendations.forEach(rec => {
          const lines = doc.splitTextToSize(`• ${rec}`, maxWidth - 5);
          addNewPageIfNeeded(lines.length * 5);
          doc.text(lines, margin + 5, yPos);
          yPos += lines.length * 5;
        });
      }

      yPos += 10;

      // Section: Justice
      addNewPageIfNeeded(60);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`${t('terrainRealities.justice')} (${getRiskLabel(data.justice_realities.risk_level)})`, margin, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      doc.text(`${t('terrainRealities.pdfLawyerCorruption')}: ${data.justice_realities.corruption_patterns.lawyer_corruption.prevalence}`, margin, yPos);
      yPos += 5;
      doc.text(`${t('terrainRealities.pdfJudicialCorruption')}: ${data.justice_realities.corruption_patterns.judicial_corruption.prevalence}`, margin, yPos);
      yPos += 5;
      doc.text(`${t('terrainRealities.pdfCivilDelays')}: ${data.justice_realities.average_delays.civil_cases}`, margin, yPos);
      yPos += 5;
      doc.text(`${t('terrainRealities.pdfCriminalDelays')}: ${data.justice_realities.average_delays.criminal_cases}`, margin, yPos);
      yPos += 10;

      // Section: Security
      addNewPageIfNeeded(60);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`${t('terrainRealities.security')} (${getRiskLabel(data.security_realities.risk_level)})`, margin, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      doc.text(`${t('terrainRealities.pdfHumanTrafficking')}: ${data.security_realities.human_trafficking.prevalence}`, margin, yPos);
      yPos += 5;
      doc.text(`${t('terrainRealities.pdfOrganizedCrime')}: ${data.security_realities.organized_crime.prevalence}`, margin, yPos);
      yPos += 5;
      doc.text(`${t('terrainRealities.pdfPettyCrime')}: ${data.security_realities.petty_crime.prevalence}`, margin, yPos);
      yPos += 10;

      // Section: Administration
      addNewPageIfNeeded(60);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`${t('terrainRealities.administration')} (${getRiskLabel(data.administration_realities.risk_level)})`, margin, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      doc.text(`${t('terrainRealities.pdfBirthCertificates')}: ${data.administration_realities.document_reliability.birth_certificates}`, margin, yPos);
      yPos += 5;
      doc.text(`${t('terrainRealities.pdfLandTitles')}: ${data.administration_realities.document_reliability.land_titles}`, margin, yPos);
      yPos += 5;
      doc.text(`${t('terrainRealities.pdfBusinessLicenses')}: ${data.administration_realities.document_reliability.business_licenses}`, margin, yPos);
      yPos += 10;

      // Positive developments
      if (data.positive_developments.length > 0) {
        addNewPageIfNeeded(40);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(t('terrainRealities.positiveDevelopments'), margin, yPos);
        yPos += 8;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        data.positive_developments.forEach(dev => {
          const lines = doc.splitTextToSize(`• [${dev.domain}] ${dev.development} (${dev.since})`, maxWidth - 5);
          addNewPageIfNeeded(lines.length * 5);
          doc.text(lines, margin + 5, yPos);
          yPos += lines.length * 5 + 2;
        });
      }

      yPos += 10;

      // Sources with URLs
      if (data.sources.length > 0) {
        addNewPageIfNeeded(40);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`${t('terrainRealities.sources')} (${data.sources.length})`, margin, yPos);
        yPos += 8;

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        data.sources.forEach(source => {
          const sourceText = source.url 
            ? `• ${source.name} (${source.year}) - ${source.type} - ${source.url}`
            : `• ${source.name} (${source.year}) - ${source.type}`;
          const lines = doc.splitTextToSize(sourceText, maxWidth - 5);
          addNewPageIfNeeded(lines.length * 4);
          doc.text(lines, margin + 5, yPos);
          yPos += lines.length * 4 + 1;
        });
      }

      // Disclaimer
      addNewPageIfNeeded(30);
      yPos += 10;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      const disclaimerLines = doc.splitTextToSize(`${t('terrainRealities.pdfDisclaimer')}: ${data.disclaimer}`, maxWidth);
      doc.text(disclaimerLines, margin, yPos);
      yPos += disclaimerLines.length * 4 + 10;

      // Footer
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(t('terrainRealities.pdfGeneratedBy'), margin, doc.internal.pageSize.getHeight() - 10);
      doc.text(new Date().toLocaleDateString(), pageWidth - margin - 30, doc.internal.pageSize.getHeight() - 10);

      // Save
      const fileName = `terrain-realities-${countryName.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      toast.success(t('terrainRealities.pdfExportSuccess'));
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Export failed');
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
      className="gap-1"
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FileText className="h-4 w-4" />
      )}
      <span className="hidden sm:inline">
        {isExporting ? t('terrainRealities.exportingPdf') : t('terrainRealities.exportPdf')}
      </span>
    </Button>
  );
}
