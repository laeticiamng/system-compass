import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { jsPDF } from 'jspdf';
import { ExitKeyResult } from '@/lib/exit-keys-engine';
import { toast } from 'sonner';

interface ExitKeysPdfExportProps {
  results: ExitKeyResult[];
  profileSummary: {
    birthCountry?: string;
    currentCountry?: string;
    nationalities?: string[];
    desiredLife?: string;
    motorProfile?: string;
    riskTolerance?: string;
    timeHorizon?: string;
  };
}

export function ExitKeysPdfExport({ results, profileSummary }: ExitKeysPdfExportProps) {
  const { t } = useTranslation();
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePdf = async () => {
    setIsGenerating(true);
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let y = 20;

      // Title
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('Pyramid Compass', margin, y);
      y += 10;
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'normal');
      doc.text(t('exitKeys.pdf.title', 'Rapport Clés de Sortie'), margin, y);
      y += 10;
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(new Date().toLocaleDateString('fr-FR'), margin, y);
      doc.setTextColor(0);
      y += 15;

      // Profile Summary
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(t('exitKeys.pdf.profileSection', 'Votre Profil'), margin, y);
      y += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      const profileLines = [
        `${t('exitKeys.summary.origin', 'Origine')}: ${profileSummary.birthCountry || '-'}`,
        `${t('exitKeys.summary.current', 'Pays actuel')}: ${profileSummary.currentCountry || '-'}`,
        `${t('exitKeys.summary.nationalities', 'Nationalités')}: ${profileSummary.nationalities?.join(', ') || '-'}`,
        `${t('exitKeys.summary.priority', 'Priorité')}: ${profileSummary.desiredLife || '-'}`,
        `${t('exitKeys.summary.profile', 'Profil moteur')}: ${profileSummary.motorProfile || '-'}`,
        `${t('exitKeys.summary.risk', 'Tolérance risque')}: ${profileSummary.riskTolerance || '-'}`,
        `${t('exitKeys.summary.horizon', 'Horizon')}: ${profileSummary.timeHorizon || '-'}`,
      ];

      profileLines.forEach(line => {
        doc.text(line, margin, y);
        y += 6;
      });

      y += 10;

      // Results
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(t('exitKeys.pdf.resultsSection', 'Clés de Sortie Recommandées'), margin, y);
      y += 10;

      results.slice(0, 5).forEach((result, index) => {
        // Check if we need a new page
        if (y > 250) {
          doc.addPage();
          y = 20;
        }

        const key = result.key;
        
        // Key header
        doc.setFillColor(245, 245, 245);
        doc.rect(margin, y - 4, pageWidth - 2 * margin, 30, 'F');
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`${index + 1}. ${key.name}`, margin + 5, y + 2);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100);
        doc.text(`${t('exitKeys.compatibility', 'Compatibilité')}: ${result.compatibility}% | ${key.difficulty} | ${key.timeframe}`, margin + 5, y + 10);
        doc.setTextColor(0);
        
        y += 20;

        // Unlocks
        doc.setFont('helvetica', 'bold');
        doc.text(t('exitKeys.pdf.unlocks', 'Débloque:'), margin + 5, y);
        y += 5;
        doc.setFont('helvetica', 'normal');
        const unlocksLines = doc.splitTextToSize(key.unlocks, pageWidth - 2 * margin - 10);
        doc.text(unlocksLines, margin + 5, y);
        y += unlocksLines.length * 5 + 3;

        // Success Condition
        doc.setFont('helvetica', 'bold');
        doc.text(t('exitKeys.pdf.successCondition', 'Condition de réussite:'), margin + 5, y);
        y += 5;
        doc.setFont('helvetica', 'normal');
        const successLines = doc.splitTextToSize(key.successCondition, pageWidth - 2 * margin - 10);
        doc.text(successLines, margin + 5, y);
        y += successLines.length * 5 + 3;

        // Main Risk
        doc.setFont('helvetica', 'bold');
        doc.text(t('exitKeys.pdf.mainRisk', 'Risque principal:'), margin + 5, y);
        y += 5;
        doc.setFont('helvetica', 'normal');
        const riskLines = doc.splitTextToSize(key.mainRisk, pageWidth - 2 * margin - 10);
        doc.text(riskLines, margin + 5, y);
        y += riskLines.length * 5 + 3;

        // Check page before warnings/accelerators section
        if (y > 240) {
          doc.addPage();
          y = 20;
        }

        // Warnings (always show at least default if none)
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(180, 80, 50);
        doc.text(t('exitKeys.pdf.warnings', '⚠️ Avertissements:'), margin + 5, y);
        y += 5;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0);
        
        const warningsToShow = result.warnings.length > 0 
          ? result.warnings 
          : [t('exitKeys.pdf.noSpecificWarning', 'Suivre le plan par phases sans brûler les étapes')];
        
        warningsToShow.forEach(warning => {
          doc.text(`• ${warning}`, margin + 10, y);
          y += 5;
        });
        y += 2;

        // Accelerators (always show at least default if none)
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(50, 150, 80);
        doc.text(t('exitKeys.pdf.accelerators', '✓ Accélérateurs:'), margin + 5, y);
        y += 5;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0);
        
        const acceleratorsToShow = result.accelerators.length > 0 
          ? result.accelerators 
          : [t('exitKeys.pdf.noSpecificAccelerator', 'Compétences transférables et réseau diaspora')];
        
        acceleratorsToShow.forEach(acc => {
          doc.text(`✓ ${acc}`, margin + 10, y);
          y += 5;
        });
        y += 2;

        // Plan B (new section)
        if (result.planB) {
          if (y > 250) {
            doc.addPage();
            y = 20;
          }
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(100, 100, 180);
          doc.text(t('exitKeys.pdf.planB', '🔄 Plan B:'), margin + 5, y);
          y += 5;
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(0);
          const planBLines = doc.splitTextToSize(result.planB, pageWidth - 2 * margin - 10);
          doc.text(planBLines, margin + 10, y);
          y += planBLines.length * 5 + 2;
        }

        // Phases overview (new compact section)
        if (result.personalizedSteps && result.personalizedSteps.length > 0) {
          if (y > 235) {
            doc.addPage();
            y = 20;
          }
          doc.setFont('helvetica', 'bold');
          doc.text(t('exitKeys.pdf.phases', '📋 Phases du parcours:'), margin + 5, y);
          y += 5;
          doc.setFont('helvetica', 'normal');
          
          result.personalizedSteps.slice(0, 3).forEach((step, stepIdx) => {
            const phaseText = `Phase ${step.phase}: ${step.name} (${step.duration})`;
            doc.text(`${stepIdx + 1}. ${phaseText}`, margin + 10, y);
            y += 5;
            if (step.milestone) {
              doc.setTextColor(80);
              doc.text(`   → ${step.milestone}`, margin + 15, y);
              doc.setTextColor(0);
              y += 5;
            }
          });
        }

        y += 10;
      });

      // Disclaimer
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      
      doc.setFontSize(8);
      doc.setTextColor(100);
      const disclaimer = t('exitKeys.pdf.disclaimer', 'Ce document est généré à titre informatif uniquement. Les informations présentées sont des simulations basées sur votre profil et ne constituent pas des conseils juridiques, fiscaux ou financiers.');
      const disclaimerLines = doc.splitTextToSize(disclaimer, pageWidth - 2 * margin);
      doc.text(disclaimerLines, margin, y);

      // Save
      doc.save(`pyramid-compass-exit-keys-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success(t('exitKeys.pdf.success', 'PDF généré avec succès'));
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error(t('exitKeys.pdf.error', 'Erreur lors de la génération du PDF'));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      onClick={generatePdf}
      disabled={isGenerating || results.length === 0}
      className="gap-2"
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          {t('exitKeys.pdf.generating', 'Génération...')}
        </>
      ) : (
        <>
          <FileText className="w-4 h-4" />
          {t('exitKeys.pdf.export', 'Exporter PDF')}
        </>
      )}
    </Button>
  );
}
