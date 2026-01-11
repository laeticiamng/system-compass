import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, FileText, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { UserCase, isDeepMode } from '@/hooks/useUserCases';
import { GovernanceScore } from '@/hooks/useCountryGovernance';
import jsPDF from 'jspdf';

interface CasePdfExportProps {
  caseData: UserCase;
  governanceData?: GovernanceScore | null;
  countryName: string;
}

interface ExportOptions {
  includeGovernance: boolean;
  includeMilestones: boolean;
  includeRiskRegister: boolean;
  includeGovernanceMap: boolean;
  includePOC: boolean;
  includeCashReality: boolean;
  includeNotes: boolean;
}

export function CasePdfExport({ caseData, governanceData, countryName }: CasePdfExportProps) {
  const { t } = useTranslation();
  const [isExporting, setIsExporting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const isDeep = isDeepMode(caseData.intention);

  const [options, setOptions] = useState<ExportOptions>({
    includeGovernance: true,
    includeMilestones: true,
    includeRiskRegister: isDeep,
    includeGovernanceMap: isDeep,
    includePOC: isDeep,
    includeCashReality: isDeep,
    includeNotes: true,
  });

  const generatePdf = async () => {
    setIsExporting(true);
    setIsComplete(false);

    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;
      let yPos = margin;

      const addText = (text: string, fontSize: number, isBold = false, color = '#333333') => {
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
        pdf.setTextColor(color);
        const lines = pdf.splitTextToSize(text, contentWidth);
        pdf.text(lines, margin, yPos);
        yPos += lines.length * (fontSize * 0.4) + 3;
        
        if (yPos > pdf.internal.pageSize.getHeight() - margin) {
          pdf.addPage();
          yPos = margin;
        }
      };

      const addSectionTitle = (title: string) => {
        yPos += 5;
        pdf.setFillColor(59, 130, 246);
        pdf.rect(margin, yPos - 5, contentWidth, 10, 'F');
        pdf.setTextColor('#FFFFFF');
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text(title, margin + 3, yPos + 2);
        yPos += 12;
        pdf.setTextColor('#333333');
      };

      const addBulletList = (items: string[]) => {
        items.forEach((item) => {
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.text('•', margin, yPos);
          const lines = pdf.splitTextToSize(item, contentWidth - 5);
          pdf.text(lines, margin + 5, yPos);
          yPos += lines.length * 4 + 2;
          
          if (yPos > pdf.internal.pageSize.getHeight() - margin) {
            pdf.addPage();
            yPos = margin;
          }
        });
      };

      // Header
      addText(caseData.title, 22, true);
      addText(countryName, 14, false, '#666666');
      addText(
        isDeep 
          ? t('cases.export.deepSubtitle', 'Dossier Gouvernance & Stratégie (B2B)')
          : t('cases.export.lightSubtitle', 'Dossier Relocation Readiness'),
        12,
        false,
        '#888888'
      );
      yPos += 5;

      // Status & Progress
      addText(`${t('cases.status.label', 'Statut')}: ${t(`cases.status.${caseData.status}`, caseData.status)}`, 11);
      addText(`${t('cases.scenario', 'Scénario')}: ${t(`cases.timeline.${caseData.timeline_scenario}`, caseData.timeline_scenario)}`, 11);
      yPos += 5;

      // Governance Section
      if (options.includeGovernance && governanceData) {
        addSectionTitle(isDeep ? t('terrainGovernance.deep.title', 'Gouvernance & Stratégie') : t('terrainGovernance.light.title', 'Réalité administrative'));
        
        addText(`${t('terrainGovernance.scores.stability', 'Stabilité')}: ${governanceData.stability_score}/5`, 11);
        addText(`${t('terrainGovernance.scores.friction', 'Friction')}: ${governanceData.friction_score}/5`, 11);
        addText(`${t('terrainGovernance.scores.operational', 'Opérationnel')}: ${governanceData.operational_score}/5`, 11);
        
        if (isDeep) {
          addText(`${t('terrainGovernance.scores.captureRisk', 'Risque de capture')}: ${governanceData.capture_risk_score}/5`, 11);
          addText(`${t('terrainGovernance.scores.ecosystem', 'Écosystème')}: ${governanceData.ecosystem_score}/5`, 11);
        }
        yPos += 3;
      }

      // Milestones
      if (options.includeMilestones && caseData.milestones.length > 0) {
        addSectionTitle(t('cases.milestones.title', 'Jalons'));
        
        const pending = caseData.milestones.filter(m => !m.completed);
        const completed = caseData.milestones.filter(m => m.completed);
        
        if (pending.length > 0) {
          addText(t('cases.milestones.pending', 'À compléter') + ':', 11, true);
          addBulletList(pending.map(m => `${m.title}${m.deadline ? ` (${m.deadline})` : ''}`));
        }
        
        if (completed.length > 0) {
          addText(t('cases.milestones.completed', 'Terminés') + ':', 11, true);
          addBulletList(completed.map(m => `${m.title}`));
        }
      }

      // Risk Register (DEEP only)
      if (options.includeRiskRegister && isDeep && caseData.risk_register.length > 0) {
        addSectionTitle(t('terrainGovernance.deep.riskRegister', 'Risk Register'));
        
        caseData.risk_register.forEach(risk => {
          addText(`[${risk.probability.toUpperCase()}/${risk.impact.toUpperCase()}] ${risk.description}`, 10);
          if (risk.mitigation) {
            addText(`  → ${risk.mitigation}`, 9, false, '#666666');
          }
          yPos += 2;
        });
      }

      // Governance Map (DEEP only)
      if (options.includeGovernanceMap && isDeep && caseData.governance_map.length > 0) {
        addSectionTitle(t('terrainGovernance.stakeholders.title', 'Cartographie des acteurs'));
        
        caseData.governance_map.forEach(actor => {
          addText(`${actor.name} - ${actor.role} (${actor.power}, fiabilité: ${actor.reliability}/5)`, 10);
          yPos += 1;
        });
      }

      // POC (DEEP only)
      if (options.includePOC && isDeep && caseData.poc_hypothesis) {
        addSectionTitle(t('terrainGovernance.poc.title', 'POC Planner'));
        
        addText(`${t('terrainGovernance.poc.hypothesis', 'Hypothèse')}: ${caseData.poc_hypothesis}`, 10);
        if (caseData.poc_budget) {
          addText(`${t('terrainGovernance.poc.maxBudget', 'Budget max')}: ${caseData.poc_budget.toLocaleString()} €`, 10);
        }
        if (caseData.poc_duration) {
          addText(`${t('terrainGovernance.poc.duration', 'Durée')}: ${caseData.poc_duration}`, 10);
        }
      }

      // Cash Reality (DEEP only)
      if (options.includeCashReality && isDeep && caseData.cash_reality?.capex_estimated) {
        addSectionTitle(t('terrainGovernance.deep.cashReality', 'Cash Reality'));
        
        const { capex_estimated, capex_buffer_multiplier = 3 } = caseData.cash_reality;
        addText(`CAPEX estimé: ${capex_estimated?.toLocaleString()} €`, 10);
        addText(`Multiplicateur: x${capex_buffer_multiplier}`, 10);
        addText(`Budget réaliste: ${(capex_estimated * capex_buffer_multiplier).toLocaleString()} €`, 10, true);
      }

      // Notes
      if (options.includeNotes && caseData.notes) {
        addSectionTitle(t('cases.notes.title', 'Notes'));
        addText(caseData.notes, 10);
      }

      // Footer
      pdf.setFontSize(8);
      pdf.setTextColor('#999999');
      const footerText = `${t('export.generatedBy', 'Généré par Compass')} - ${new Date().toLocaleDateString()}`;
      pdf.text(footerText, margin, pdf.internal.pageSize.getHeight() - 10);

      // Save
      const filename = `${caseData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${isDeep ? 'governance' : 'relocation'}.pdf`;
      pdf.save(filename);

      setIsComplete(true);
      toast.success(t('export.success', 'Export PDF réussi'));

      setTimeout(() => {
        setIsComplete(false);
      }, 2000);
    } catch (error) {
      console.error('PDF export failed:', error);
      toast.error(t('export.error', 'Erreur lors de l\'export'));
    } finally {
      setIsExporting(false);
    }
  };

  const toggleOption = (key: keyof ExportOptions) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          {t('export.exportPdf', 'Exporter PDF')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {isDeep 
              ? t('cases.export.deepTitle', 'Export Gouvernance & Stratégie')
              : t('cases.export.lightTitle', 'Export Relocation Readiness')
            }
          </DialogTitle>
          <DialogDescription>
            {t('cases.export.description', 'Sélectionnez les sections à inclure')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Common options */}
          <div className="flex items-center gap-3">
            <Checkbox
              id="governance"
              checked={options.includeGovernance}
              onCheckedChange={() => toggleOption('includeGovernance')}
            />
            <Label htmlFor="governance">
              {isDeep ? t('terrainGovernance.deep.title', 'Gouvernance & Stratégie') : t('terrainGovernance.light.title', 'Réalité administrative')}
            </Label>
          </div>

          <div className="flex items-center gap-3">
            <Checkbox
              id="milestones"
              checked={options.includeMilestones}
              onCheckedChange={() => toggleOption('includeMilestones')}
            />
            <Label htmlFor="milestones">{t('cases.milestones.title', 'Jalons')}</Label>
          </div>

          {/* DEEP only options */}
          {isDeep && (
            <>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="riskRegister"
                  checked={options.includeRiskRegister}
                  onCheckedChange={() => toggleOption('includeRiskRegister')}
                />
                <Label htmlFor="riskRegister" className="flex items-center gap-2">
                  {t('terrainGovernance.deep.riskRegister', 'Risk Register')}
                  <Badge variant="outline" className="text-xs">B2B</Badge>
                </Label>
              </div>

              <div className="flex items-center gap-3">
                <Checkbox
                  id="governanceMap"
                  checked={options.includeGovernanceMap}
                  onCheckedChange={() => toggleOption('includeGovernanceMap')}
                />
                <Label htmlFor="governanceMap" className="flex items-center gap-2">
                  {t('terrainGovernance.stakeholders.title', 'Cartographie acteurs')}
                  <Badge variant="outline" className="text-xs">B2B</Badge>
                </Label>
              </div>

              <div className="flex items-center gap-3">
                <Checkbox
                  id="poc"
                  checked={options.includePOC}
                  onCheckedChange={() => toggleOption('includePOC')}
                />
                <Label htmlFor="poc" className="flex items-center gap-2">
                  {t('terrainGovernance.poc.title', 'POC Planner')}
                  <Badge variant="outline" className="text-xs">B2B</Badge>
                </Label>
              </div>

              <div className="flex items-center gap-3">
                <Checkbox
                  id="cashReality"
                  checked={options.includeCashReality}
                  onCheckedChange={() => toggleOption('includeCashReality')}
                />
                <Label htmlFor="cashReality" className="flex items-center gap-2">
                  {t('terrainGovernance.deep.cashReality', 'Cash Reality')}
                  <Badge variant="outline" className="text-xs">B2B</Badge>
                </Label>
              </div>
            </>
          )}

          <div className="flex items-center gap-3">
            <Checkbox
              id="notes"
              checked={options.includeNotes}
              onCheckedChange={() => toggleOption('includeNotes')}
            />
            <Label htmlFor="notes">{t('cases.notes.title', 'Notes')}</Label>
          </div>
        </div>

        <Button
          onClick={generatePdf}
          disabled={isExporting}
          className="w-full gap-2"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t('export.generating', 'Génération...')}
            </>
          ) : isComplete ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              {t('export.downloaded', 'Téléchargé !')}
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              {t('export.download', 'Télécharger')}
            </>
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
