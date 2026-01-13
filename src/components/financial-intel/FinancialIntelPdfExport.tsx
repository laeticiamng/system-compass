import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { FileText, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import type { FinancialIntelResult } from '@/hooks/useFinancialIntel';

interface FinancialIntelPdfExportProps {
  result: FinancialIntelResult;
  country?: string;
  sectorFocus?: string;
  audience?: string;
  onExportComplete?: () => void;
}

export function FinancialIntelPdfExport({ 
  result,
  country,
  sectorFocus,
  audience,
  onExportComplete
}: FinancialIntelPdfExportProps) {
  const { t } = useTranslation();
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePdf = async () => {
    setIsGenerating(true);
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      let yPosition = margin;

      // Helper to add text with word wrap
      const addText = (text: string, fontSize: number, isBold = false, color: [number, number, number] = [0, 0, 0]) => {
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
        pdf.setTextColor(...color);
        const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin);
        
        if (yPosition + lines.length * fontSize * 0.4 > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        
        pdf.text(lines, margin, yPosition);
        yPosition += lines.length * fontSize * 0.4 + 3;
      };

      const addSection = (title: string, color: [number, number, number] = [0, 0, 0]) => {
        yPosition += 5;
        addText(title, 14, true, color);
        yPosition += 2;
      };

      // Title
      addText('FINANCIAL SAFETY INTEL', 24, true, [59, 130, 246]);
      addText(result.country_profile.name, 18, true);
      yPosition += 5;

      // Disclaimer
      pdf.setFillColor(255, 243, 205);
      pdf.rect(margin, yPosition - 2, pageWidth - 2 * margin, 15, 'F');
      addText(result.disclaimer, 9, false, [133, 77, 14]);
      yPosition += 10;

      // Country Profile
      addSection('PROFIL DU PAYS', [59, 130, 246]);
      addText(`Devise: ${result.country_profile.currency}`, 11);
      addText(`Régulateurs: ${result.country_profile.main_regulators.join(', ')}`, 11);
      addText(`Niveau de confiance: ${result.country_profile.source_confidence}`, 11);
      if (sectorFocus) {
        addText(`Secteur: ${sectorFocus}`, 11);
      }
      if (audience) {
        addText(`Audience: ${audience}`, 11);
      }

      // Scams
      addSection('TOP 7 - MONTAGES À RISQUE', [220, 38, 38]);
      result.scam_top7.forEach((scam, index) => {
        if (yPosition > pageHeight - 50) {
          pdf.addPage();
          yPosition = margin;
        }
        addText(`${index + 1}. ${scam.name} (${scam.category})`, 12, true, [220, 38, 38]);
        addText(scam.process, 10);
        addText(`Signaux d'alerte: ${scam.red_flags.join('; ')}`, 9, false, [100, 100, 100]);
        addText(`Protection: ${scam.protection_checklist.slice(0, 3).join('; ')}`, 9, false, [34, 197, 94]);
        yPosition += 3;
      });

      // Legit options
      addSection('TOP 7 - OPTIONS RÉGULÉES', [34, 197, 94]);
      result.legit_top7.forEach((option, index) => {
        if (yPosition > pageHeight - 50) {
          pdf.addPage();
          yPosition = margin;
        }
        addText(`${index + 1}. ${option.name} (${option.category})`, 12, true, [34, 197, 94]);
        addText(option.why_safer, 10);
        addText(`Vérification: ${option.verification_checklist.slice(0, 3).join('; ')}`, 9, false, [100, 100, 100]);
        yPosition += 3;
      });

      // Sources
      addSection('SOURCES', [100, 100, 100]);
      result.sources.forEach(source => {
        addText(`• ${source.name} (${source.type})${source.url ? ` - ${source.url}` : ''}`, 9);
      });

      // Footer
      yPosition = pageHeight - 10;
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} - Score de confiance: ${Math.round(result.confidence * 100)}%`, margin, yPosition);

      // Save
      const fileName = `financial-intel-${result.country_profile.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      toast.success(t('financialIntel.pdfGenerated', 'PDF généré avec succès'));
      onExportComplete?.();
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error(t('financialIntel.pdfError', 'Erreur lors de la génération du PDF'));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      className="gap-2" 
      onClick={generatePdf}
      disabled={isGenerating}
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {t('financialIntel.generatingPdf', 'Génération...')}
        </>
      ) : (
        <>
          <FileText className="h-4 w-4" />
          <Download className="h-4 w-4" />
          {t('financialIntel.exportPdf', 'Exporter PDF')}
        </>
      )}
    </Button>
  );
}
