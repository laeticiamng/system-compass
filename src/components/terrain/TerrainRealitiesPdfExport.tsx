import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { TerrainRealitiesResult } from '@/hooks/useTerrainRealities';
import jsPDF from 'jspdf';

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
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let y = 20;

      // Title
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text(`${t('terrainRealities.title')} - ${countryName}`, margin, y);
      y += 10;

      // Subtitle with date
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(`${t('terrainRealities.lastUpdated')}: ${data.last_updated} | ${t('terrainRealities.confidence')}: ${Math.round(data.confidence_score * 100)}%`, margin, y);
      y += 15;

      // Overall risk
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      const riskColor = data.overall_risk_level === 'high' ? [220, 53, 69] : data.overall_risk_level === 'medium' ? [255, 193, 7] : [40, 167, 69];
      doc.setTextColor(riskColor[0], riskColor[1], riskColor[2]);
      doc.text(`${t('terrainRealities.overallRisk')}: ${t(`terrainRealities.risk${data.overall_risk_level.charAt(0).toUpperCase() + data.overall_risk_level.slice(1)}`)}`, margin, y);
      y += 15;

      doc.setTextColor(0, 0, 0);

      // Helper function to add section
      const addSection = (title: string, content: string[], riskLevel?: string) => {
        if (y > 260) {
          doc.addPage();
          y = 20;
        }

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(title, margin, y);
        y += 8;

        if (riskLevel) {
          doc.setFontSize(9);
          doc.setFont('helvetica', 'italic');
          doc.setTextColor(100, 100, 100);
          doc.text(`Risque: ${riskLevel}`, margin, y);
          y += 6;
        }

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);

        content.forEach(line => {
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          const splitLines = doc.splitTextToSize(line, pageWidth - margin * 2);
          splitLines.forEach((splitLine: string) => {
            doc.text(splitLine, margin, y);
            y += 5;
          });
        });
        y += 8;
      };

      // Healthcare
      const healthcareContent = [
        `Faux médicaments: ${data.healthcare_realities.fake_medications.prevalence}`,
        `Catégories touchées: ${data.healthcare_realities.fake_medications.affected_categories.join(', ')}`,
        `Équipements: ${data.healthcare_realities.medical_equipment.issues.join(', ')}`,
        ...data.healthcare_realities.recommendations.map(r => `• ${r}`)
      ];
      addSection(t('terrainRealities.healthcare'), healthcareContent, data.healthcare_realities.risk_level);

      // Justice
      const justiceContent = [
        `Corruption avocats: ${data.justice_realities.corruption_patterns.lawyer_corruption.prevalence}`,
        `Corruption juges: ${data.justice_realities.corruption_patterns.judicial_corruption.prevalence}`,
        `Délais civils: ${data.justice_realities.average_delays.civil_cases}`,
        `Délais pénaux: ${data.justice_realities.average_delays.criminal_cases}`,
        ...data.justice_realities.recommendations.map(r => `• ${r}`)
      ];
      addSection(t('terrainRealities.justice'), justiceContent, data.justice_realities.risk_level);

      // Security
      const securityContent = [
        `Trafic humain: ${data.security_realities.human_trafficking.prevalence}`,
        `Crime organisé: ${data.security_realities.organized_crime.prevalence}`,
        `Petite délinquance: ${data.security_realities.petty_crime.prevalence}`,
        ...data.security_realities.recommendations.map(r => `• ${r}`)
      ];
      addSection(t('terrainRealities.security'), securityContent, data.security_realities.risk_level);

      // Administration
      const adminContent = [
        `Actes de naissance: ${data.administration_realities.document_reliability.birth_certificates}`,
        `Titres fonciers: ${data.administration_realities.document_reliability.land_titles}`,
        `Licences: ${data.administration_realities.document_reliability.business_licenses}`,
        ...data.administration_realities.recommendations.map(r => `• ${r}`)
      ];
      addSection(t('terrainRealities.administration'), adminContent, data.administration_realities.risk_level);

      // Positive developments
      if (data.positive_developments.length > 0) {
        const posContent = data.positive_developments.map(d => `• ${d.domain}: ${d.development} (${d.since})`);
        addSection(t('terrainRealities.positiveDevelopments'), posContent);
      }

      // Sources
      if (data.sources.length > 0) {
        const sourcesContent = data.sources.map(s => `• ${s.name} (${s.year}) - ${s.type}`);
        addSection(t('terrainRealities.sources'), sourcesContent);
      }

      // Disclaimer
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 100, 100);
      const disclaimerLines = doc.splitTextToSize(data.disclaimer, pageWidth - margin * 2);
      disclaimerLines.forEach((line: string) => {
        doc.text(line, margin, y);
        y += 4;
      });

      // Save
      doc.save(`terrain-realities-${countryName.toLowerCase().replace(/\s+/g, '-')}.pdf`);
      toast.success(t('terrainRealities.pdfExportSuccess'));
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error(t('errors.generationFailed'));
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
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {t('terrainRealities.exportingPdf')}
        </>
      ) : (
        <>
          <FileDown className="h-4 w-4" />
          {t('terrainRealities.exportPdf')}
        </>
      )}
    </Button>
  );
}
