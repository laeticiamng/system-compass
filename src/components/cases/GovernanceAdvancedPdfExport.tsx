import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import { GovernanceActor, IntermediationPattern, GovernancePartner, DelayReality } from '@/hooks/useGovernanceIntel';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

interface GovernanceAdvancedPdfExportProps {
  caseName: string;
  countryName: string;
  countryCode: string;
  actors: GovernanceActor[];
  patterns: IntermediationPattern[];
  partners: GovernancePartner[];
  delays: DelayReality[];
}

export function GovernanceAdvancedPdfExport({
  caseName,
  countryName,
  countryCode,
  actors,
  patterns,
  partners,
  delays
}: GovernanceAdvancedPdfExportProps) {
  const { t, i18n } = useTranslation();
  const [isExporting, setIsExporting] = useState(false);
  const dateLocale = i18n.language === 'fr' ? fr : enUS;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;
      let yPos = margin;

      // Helper to add new page if needed
      const checkNewPage = (neededSpace: number) => {
        if (yPos + neededSpace > pdf.internal.pageSize.getHeight() - margin) {
          pdf.addPage();
          yPos = margin;
          return true;
        }
        return false;
      };


      // Title
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text(t('governanceAdvanced.title', 'Gouvernance avancée'), margin, yPos);
      yPos += 10;

      // Case info
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${t('cases.caseName', 'Dossier')}: ${caseName}`, margin, yPos);
      yPos += 6;
      pdf.text(`${t('common.country', 'Pays')}: ${countryName} (${countryCode})`, margin, yPos);
      yPos += 6;
      pdf.text(`${t('common.date', 'Date')}: ${format(new Date(), 'PPP', { locale: dateLocale })}`, margin, yPos);
      yPos += 12;

      // Separator
      pdf.setDrawColor(200);
      pdf.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 10;

      // SECTION: ACTORS
      if (actors.length > 0) {
        checkNewPage(30);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`1. ${t('governanceAdvanced.tabs.actors', 'Acteurs clés')} (${actors.length})`, margin, yPos);
        yPos += 10;

        actors.forEach((actor, index) => {
          checkNewPage(25);
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${index + 1}. ${actor.label}`, margin, yPos);
          yPos += 6;

          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(10);
          
          const actorType = t(`governanceAdvanced.actorTypes.${actor.actor_type}`, actor.actor_type);
          pdf.text(`${t('governanceAdvanced.actorType', 'Type')}: ${actorType}`, margin + 5, yPos);
          yPos += 5;

          if (actor.power_types && actor.power_types.length > 0) {
            const powers = actor.power_types.map(p => t(`governanceAdvanced.powerTypes.${p}`, p)).join(', ');
            pdf.text(`${t('governanceAdvanced.powerType', 'Pouvoirs')}: ${powers}`, margin + 5, yPos);
            yPos += 5;
          }

          if (actor.formality_level) {
            const formality = t(`governanceAdvanced.formalityLevels.${actor.formality_level}`, actor.formality_level);
            pdf.text(`${t('governanceAdvanced.formalityLevel', 'Formalité')}: ${formality}`, margin + 5, yPos);
            yPos += 5;
          }

          if (actor.notes) {
            const noteLines = pdf.splitTextToSize(`${t('governanceAdvanced.notes', 'Notes')}: ${actor.notes}`, contentWidth - 10);
            noteLines.forEach((line: string) => {
              checkNewPage(5);
              pdf.text(line, margin + 5, yPos);
              yPos += 4;
            });
          }

          yPos += 5;
        });
        yPos += 5;
      }

      // SECTION: PATTERNS
      if (patterns.length > 0) {
        checkNewPage(30);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`2. ${t('governanceAdvanced.tabs.patterns', 'Schémas d\'intermédiation')} (${patterns.length})`, margin, yPos);
        yPos += 10;

        patterns.forEach((pattern, index) => {
          checkNewPage(25);
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'bold');
          const patternType = t(`governanceAdvanced.patternTypes.${pattern.pattern_type}`, pattern.pattern_type);
          pdf.text(`${index + 1}. ${patternType}`, margin, yPos);
          yPos += 6;

          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(10);

          const descLines = pdf.splitTextToSize(pattern.description_neutral, contentWidth - 10);
          descLines.forEach((line: string) => {
            checkNewPage(5);
            pdf.text(line, margin + 5, yPos);
            yPos += 4;
          });
          yPos += 2;

          if (pattern.risk_level) {
            const risk = t(`governanceAdvanced.riskLevels.${pattern.risk_level}`, pattern.risk_level);
            pdf.text(`${t('governanceAdvanced.riskLevel', 'Risque')}: ${risk}`, margin + 5, yPos);
            yPos += 5;
          }

          if (pattern.signals && pattern.signals.length > 0) {
            pdf.text(`${t('governanceAdvanced.signals', 'Signaux')}:`, margin + 5, yPos);
            yPos += 4;
            pattern.signals.forEach(s => {
              checkNewPage(5);
              pdf.text(`  • ${s}`, margin + 8, yPos);
              yPos += 4;
            });
          }

          if (pattern.protections && pattern.protections.length > 0) {
            pdf.text(`${t('governanceAdvanced.protections', 'Protections')}:`, margin + 5, yPos);
            yPos += 4;
            pattern.protections.forEach(p => {
              checkNewPage(5);
              pdf.text(`  • ${p}`, margin + 8, yPos);
              yPos += 4;
            });
          }

          yPos += 5;
        });
        yPos += 5;
      }

      // SECTION: PARTNERS
      if (partners.length > 0) {
        checkNewPage(30);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`3. ${t('governanceAdvanced.tabs.partners', 'Partenaires')} (${partners.length})`, margin, yPos);
        yPos += 10;

        partners.forEach((partner, index) => {
          checkNewPage(25);
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'bold');
          const partnerType = t(`governanceAdvanced.partnerTypes.${partner.partner_type}`, partner.partner_type);
          pdf.text(`${index + 1}. ${partnerType}`, margin, yPos);
          yPos += 6;

          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(10);

          if (partner.is_mandatory) {
            pdf.text(`⚠️ ${t('governanceAdvanced.mandatoryPartner', 'Obligatoire')}`, margin + 5, yPos);
            yPos += 5;
          }

          if (partner.description) {
            const descLines = pdf.splitTextToSize(partner.description, contentWidth - 10);
            descLines.forEach((line: string) => {
              checkNewPage(5);
              pdf.text(line, margin + 5, yPos);
              yPos += 4;
            });
            yPos += 2;
          }

          if (partner.risk_flags && partner.risk_flags.length > 0) {
            pdf.text(`${t('governanceAdvanced.riskFlags', 'Risques')}:`, margin + 5, yPos);
            yPos += 4;
            partner.risk_flags.forEach(r => {
              checkNewPage(5);
              pdf.text(`  • ${r}`, margin + 8, yPos);
              yPos += 4;
            });
          }

          if (partner.due_diligence_checklist && partner.due_diligence_checklist.length > 0) {
            pdf.text(`${t('governanceAdvanced.dueDiligence', 'Due diligence')}:`, margin + 5, yPos);
            yPos += 4;
            partner.due_diligence_checklist.forEach(d => {
              checkNewPage(5);
              pdf.text(`  ☐ ${d}`, margin + 8, yPos);
              yPos += 4;
            });
          }

          yPos += 5;
        });
        yPos += 5;
      }

      // SECTION: DELAYS
      if (delays.length > 0) {
        checkNewPage(30);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`4. ${t('governanceAdvanced.tabs.delays', 'Délais réels')} (${delays.length})`, margin, yPos);
        yPos += 10;

        delays.forEach((delay, index) => {
          checkNewPage(30);
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${index + 1}. ${delay.process_name}`, margin, yPos);
          yPos += 6;

          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(10);

          // Timeframes table
          const timeframes = [
            { label: t('governanceAdvanced.official', 'Officiel'), value: delay.official_timeframe },
            { label: t('governanceAdvanced.optimistic', 'Optimiste'), value: delay.optimistic_timeframe },
            { label: t('governanceAdvanced.realistic', 'Réaliste'), value: delay.realistic_timeframe },
            { label: t('governanceAdvanced.pessimistic', 'Pessimiste'), value: delay.pessimistic_timeframe },
          ].filter(tf => tf.value);

          timeframes.forEach(tf => {
            pdf.text(`${tf.label}: ${tf.value}`, margin + 5, yPos);
            yPos += 5;
          });

          if (delay.delay_risk_signals && delay.delay_risk_signals.length > 0) {
            pdf.text(`${t('governanceAdvanced.delayFactors', 'Facteurs de retard')}:`, margin + 5, yPos);
            yPos += 4;
            delay.delay_risk_signals.forEach(s => {
              checkNewPage(5);
              pdf.text(`  • ${s}`, margin + 8, yPos);
              yPos += 4;
            });
          }

          if (delay.cashflow_implications) {
            const cfLines = pdf.splitTextToSize(`${t('governanceAdvanced.cashflowImpact', 'Impact cashflow')}: ${delay.cashflow_implications}`, contentWidth - 10);
            cfLines.forEach((line: string) => {
              checkNewPage(5);
              pdf.text(line, margin + 5, yPos);
              yPos += 4;
            });
          }

          yPos += 5;
        });
      }

      // Footer on each page
      const totalPages = pdf.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(128);
        pdf.text(
          `${t('governanceAdvanced.notice.title', 'Orientation prévention')} - System Compass - Page ${i}/${totalPages}`,
          margin,
          pdf.internal.pageSize.getHeight() - 10
        );
        pdf.setTextColor(0);
      }

      // Save
      const filename = `governance-advanced-${countryCode.toLowerCase()}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      pdf.save(filename);
      toast.success(t('governanceAdvanced.exportSuccess', 'PDF exporté avec succès'));
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error(t('errors.generationFailed', 'Erreur lors de la génération'));
    } finally {
      setIsExporting(false);
    }
  };

  const hasData = actors.length > 0 || patterns.length > 0 || partners.length > 0 || delays.length > 0;

  if (!hasData) {
    return null;
  }

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
        <FileDown className="w-4 h-4" />
      )}
      {isExporting 
        ? t('governanceAdvanced.exporting', 'Export en cours...') 
        : t('governanceAdvanced.exportPdf', 'Exporter PDF')
      }
    </Button>
  );
}
