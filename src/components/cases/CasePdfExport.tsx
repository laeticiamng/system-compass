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
  // New options
  includeMarketStudy: boolean;
  includeActorsMap: boolean;
  includeRiskRegisterEnhanced: boolean;
  includeStructuralRules: boolean;
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
    // New options
    includeMarketStudy: isDeep,
    includeActorsMap: isDeep,
    includeRiskRegisterEnhanced: isDeep,
    includeStructuralRules: isDeep,
  });

  // Get enhanced data from case
  const marketStudy = (caseData as any).market_study;
  const actorsMap = (caseData as any).actors_map || [];
  const riskRegisterEnhanced = (caseData as any).risk_register_enhanced || [];
  const structuralRules = (caseData as any).structural_rules || [];

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
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;
      let yPos = margin;

      const checkNewPage = () => {
        if (yPos > pageHeight - margin - 20) {
          pdf.addPage();
          yPos = margin;
        }
      };

      const addText = (text: string, fontSize: number, isBold = false, color = '#333333') => {
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
        pdf.setTextColor(color);
        const lines = pdf.splitTextToSize(text, contentWidth);
        pdf.text(lines, margin, yPos);
        yPos += lines.length * (fontSize * 0.4) + 3;
        checkNewPage();
      };

      const addSectionTitle = (title: string) => {
        checkNewPage();
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

      const addSubSection = (title: string) => {
        checkNewPage();
        yPos += 3;
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor('#555555');
        pdf.text(title, margin, yPos);
        yPos += 6;
        pdf.setTextColor('#333333');
      };

      const addBulletList = (items: string[]) => {
        items.forEach((item) => {
          checkNewPage();
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.text('•', margin, yPos);
          const lines = pdf.splitTextToSize(item, contentWidth - 5);
          pdf.text(lines, margin + 5, yPos);
          yPos += lines.length * 4 + 2;
        });
      };

      const addKeyValue = (key: string, value: string) => {
        checkNewPage();
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${key}:`, margin, yPos);
        pdf.setFont('helvetica', 'normal');
        const lines = pdf.splitTextToSize(value, contentWidth - 40);
        pdf.text(lines, margin + 35, yPos);
        yPos += lines.length * 4 + 2;
      };

      // ===== HEADER =====
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

      // ===== GOVERNANCE =====
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

      // ===== MARKET STUDY (NEW - DEEP) =====
      if (options.includeMarketStudy && isDeep && marketStudy) {
        addSectionTitle(t('marketStudy.title', 'Étude de Marché'));
        
        if (marketStudy.problemStatement) {
          addSubSection(t('marketStudy.problem.statement', 'Problème résolu'));
          addText(marketStudy.problemStatement, 10);
        }
        
        if (marketStudy.valueProposition) {
          addSubSection(t('marketStudy.problem.value', 'Proposition de valeur'));
          addText(marketStudy.valueProposition, 10);
        }

        if (marketStudy.customerSegments?.length > 0) {
          addSubSection(t('marketStudy.customers.segments', 'Segments clients'));
          addBulletList(marketStudy.customerSegments);
        }

        if (marketStudy.competitors?.length > 0) {
          addSubSection(t('marketStudy.competition.title', 'Concurrence'));
          marketStudy.competitors.forEach((comp: any) => {
            addText(`${comp.name} (${comp.implantation}) - ${comp.strengths}`, 10);
          });
        }

        if (marketStudy.differentiation) {
          addSubSection(t('marketStudy.diff.why', 'Différenciation'));
          addText(marketStudy.differentiation, 10);
        }

        if (marketStudy.goToMarket) {
          addSubSection(t('marketStudy.gtm.strategy', 'Go-to-Market'));
          addText(marketStudy.goToMarket, 10);
        }

        if (marketStudy.unitEconomics?.pricePerUnit > 0) {
          addSubSection(t('marketStudy.economics.title', 'Économie unitaire'));
          addKeyValue(t('marketStudy.economics.cost', 'Coût'), `${marketStudy.unitEconomics.costPerUnit} €`);
          addKeyValue(t('marketStudy.economics.price', 'Prix'), `${marketStudy.unitEconomics.pricePerUnit} €`);
          addKeyValue(t('marketStudy.economics.margin', 'Marge'), `${marketStudy.unitEconomics.marginPercent}%`);
        }

        if (marketStudy.keyRisks?.length > 0) {
          addSubSection(t('marketStudy.risks.title', 'Risques clés'));
          addBulletList(marketStudy.keyRisks);
        }

        if (marketStudy.feasibility) {
          addSubSection(t('marketStudy.conclusion.feasibility', 'Faisabilité'));
          addText(marketStudy.feasibility.toUpperCase(), 11, true);
        }

        if (marketStudy.conditionsToValidate?.length > 0) {
          addSubSection(t('marketStudy.conclusion.conditions', 'Conditions à valider'));
          addBulletList(marketStudy.conditionsToValidate);
        }
      }

      // ===== ACTORS MAP (NEW - DEEP) =====
      if (options.includeActorsMap && isDeep && actorsMap.length > 0) {
        addSectionTitle(t('actorsMap.title', 'Cartographie des Acteurs'));
        
        const actorTypeLabels: Record<string, string> = {
          institutional: 'Institutionnel',
          decider: 'Décideur',
          access: 'Accès',
          blocker: 'Bloqueur',
          operator: 'Opérateur',
          potential_partner: 'Partenaire potentiel',
          provider: 'Prestataire',
        };

        actorsMap.forEach((actor: any) => {
          const typeLabel = actorTypeLabels[actor.type] || actor.type;
          const reliabilityLabel = actor.reliability === 'verified' ? '✓ Vérifié' : 
                                   actor.reliability === 'in_progress' ? '⏳ En cours' : '○ Non vérifié';
          const depLabel = actor.dependencyLevel === 'high' ? 'Dép. élevée' : 
                          actor.dependencyLevel === 'medium' ? 'Dép. moyenne' : 'Dép. faible';
          
          addText(`${actor.isRedFlag ? '⚠️ ' : ''}${actor.name || 'Sans nom'} - ${typeLabel}`, 10, true);
          addText(`   ${reliabilityLabel} | ${depLabel}`, 9, false, '#666666');
          if (actor.notes) {
            addText(`   ${actor.notes}`, 9, false, '#888888');
          }
          yPos += 2;
        });
      }

      // ===== RISK REGISTER ENHANCED (NEW - DEEP) =====
      if (options.includeRiskRegisterEnhanced && isDeep && riskRegisterEnhanced.length > 0) {
        addSectionTitle(t('riskRegister.title', 'Registre des Risques'));
        
        const riskCategoryLabels: Record<string, string> = {
          context: 'Sous-estimation contexte',
          delays: 'Délais',
          opacity: 'Opacité',
          disclosure: 'Divulgation',
          capture: 'Capture',
          budget: 'Budget',
          dependency: 'Dépendance',
          instability: 'Instabilité',
          custom: 'Autre',
        };

        riskRegisterEnhanced.forEach((risk: any) => {
          const categoryLabel = riskCategoryLabels[risk.category] || risk.category;
          const probLabel = risk.probability === 'high' ? '🔴 Élevé' : 
                           risk.probability === 'medium' ? '🟡 Moyen' : '🟢 Faible';
          const statusLabel = risk.status === 'mitigated' ? '✓ Atténué' : 
                             risk.status === 'accepted' ? '○ Accepté' : '⏳ Ouvert';
          
          addText(`[${categoryLabel}] ${probLabel} - ${statusLabel}`, 10, true);
          if (risk.description) {
            addText(`   ${risk.description}`, 9, false, '#666666');
          }
          if (risk.protections?.length > 0) {
            addText(`   Protections: ${risk.protections.join(', ')}`, 9, false, '#228B22');
          }
          yPos += 2;
        });
      }

      // ===== STRUCTURAL RULES (NEW) =====
      if (options.includeStructuralRules && structuralRules.length > 0) {
        addSectionTitle(t('structuralRules.title', 'Règles Structurantes'));
        
        const ruleTypeLabels: Record<string, string> = {
          property: 'Propriété',
          joint_venture: 'Joint Venture',
          fiscal: 'Fiscalité',
          contract: 'Contrat',
          labor: 'Travail',
          licensing: 'Licence',
          custom: 'Autre',
        };

        structuralRules.forEach((rule: any) => {
          const typeLabel = ruleTypeLabels[rule.type] || rule.type;
          const statusIcon = rule.status === 'verified' ? '✓' : rule.status === 'in_progress' ? '⏳' : '○';
          
          addText(`${statusIcon} [${typeLabel}] ${rule.title}`, 10, true);
          if (rule.description) {
            addText(`   ${rule.description}`, 9, false, '#666666');
          }
          if (rule.source) {
            addText(`   Source: ${rule.source}`, 9, false, '#888888');
          }
          yPos += 2;
        });
      }

      // ===== MILESTONES =====
      if (options.includeMilestones && caseData.milestones.length > 0) {
        addSectionTitle(t('cases.milestones.title', 'Jalons'));
        
        const pending = caseData.milestones.filter(m => !m.completed);
        const completed = caseData.milestones.filter(m => m.completed);
        
        if (pending.length > 0) {
          addSubSection(t('cases.milestones.pending', 'À compléter'));
          addBulletList(pending.map(m => `${m.title}${m.deadline ? ` (${m.deadline})` : ''}`));
        }
        
        if (completed.length > 0) {
          addSubSection(t('cases.milestones.completed', 'Terminés'));
          addBulletList(completed.map(m => `✓ ${m.title}`));
        }
      }

      // ===== LEGACY RISK REGISTER =====
      if (options.includeRiskRegister && isDeep && caseData.risk_register.length > 0) {
        addSectionTitle(t('terrainGovernance.deep.riskRegister', 'Risk Register (legacy)'));
        
        caseData.risk_register.forEach(risk => {
          addText(`[${risk.probability.toUpperCase()}/${risk.impact.toUpperCase()}] ${risk.description}`, 10);
          if (risk.mitigation) {
            addText(`  → ${risk.mitigation}`, 9, false, '#666666');
          }
          yPos += 2;
        });
      }

      // ===== GOVERNANCE MAP (LEGACY) =====
      if (options.includeGovernanceMap && isDeep && caseData.governance_map.length > 0) {
        addSectionTitle(t('terrainGovernance.stakeholders.title', 'Cartographie des acteurs (legacy)'));
        
        caseData.governance_map.forEach(actor => {
          addText(`${actor.name} - ${actor.role} (${actor.power}, fiabilité: ${actor.reliability}/5)`, 10);
          yPos += 1;
        });
      }

      // ===== POC =====
      if (options.includePOC && isDeep && caseData.poc_hypothesis) {
        addSectionTitle(t('terrainGovernance.poc.title', 'POC Planner'));
        
        addKeyValue(t('terrainGovernance.poc.hypothesis', 'Hypothèse'), caseData.poc_hypothesis);
        if (caseData.poc_budget) {
          addKeyValue(t('terrainGovernance.poc.maxBudget', 'Budget max'), `${caseData.poc_budget.toLocaleString()} €`);
        }
        if (caseData.poc_duration) {
          addKeyValue(t('terrainGovernance.poc.duration', 'Durée'), caseData.poc_duration);
        }
        if (caseData.poc_success_criteria.length > 0) {
          addSubSection(t('terrainGovernance.poc.successCriteria', 'Critères de succès'));
          addBulletList(caseData.poc_success_criteria);
        }
        if (caseData.poc_stop_criteria.length > 0) {
          addSubSection(t('terrainGovernance.poc.stopCriteria', 'Critères d\'arrêt'));
          addBulletList(caseData.poc_stop_criteria);
        }
      }

      // ===== CASH REALITY =====
      if (options.includeCashReality && isDeep && caseData.cash_reality?.capex_estimated) {
        addSectionTitle(t('terrainGovernance.deep.cashReality', 'Cash Reality'));
        
        const { capex_estimated, capex_buffer_multiplier = 3, opex_monthly, runway_months } = caseData.cash_reality;
        addKeyValue('CAPEX estimé', `${capex_estimated?.toLocaleString()} €`);
        addKeyValue('Multiplicateur', `x${capex_buffer_multiplier}`);
        addKeyValue('Budget réaliste', `${(capex_estimated * capex_buffer_multiplier).toLocaleString()} €`);
        if (opex_monthly) {
          addKeyValue('OPEX mensuel', `${opex_monthly.toLocaleString()} €`);
        }
        if (runway_months) {
          addKeyValue('Runway', `${runway_months} mois`);
        }
      }

      // ===== NOTES =====
      if (options.includeNotes && caseData.notes) {
        addSectionTitle(t('cases.notes.title', 'Notes'));
        addText(caseData.notes, 10);
      }

      // ===== FOOTER =====
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor('#999999');
        const footerText = `${t('export.generatedBy', 'Généré par Compass')} - ${new Date().toLocaleDateString()} - Page ${i}/${totalPages}`;
        pdf.text(footerText, margin, pageHeight - 10);
      }

      // Save
      const filename = `${caseData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${isDeep ? 'governance_b2b' : 'relocation'}.pdf`;
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

  const hasMarketStudy = !!marketStudy?.problemStatement;
  const hasActors = actorsMap.length > 0;
  const hasEnhancedRisks = riskRegisterEnhanced.length > 0;
  const hasRules = structuralRules.length > 0;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          {t('export.exportPdf', 'Exporter PDF')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
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

          {/* NEW DEEP options */}
          {isDeep && (
            <>
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-3">{t('cases.export.newSections', 'Nouvelles sections B2B')}</p>
              </div>

              <div className="flex items-center gap-3">
                <Checkbox
                  id="marketStudy"
                  checked={options.includeMarketStudy}
                  onCheckedChange={() => toggleOption('includeMarketStudy')}
                  disabled={!hasMarketStudy}
                />
                <Label htmlFor="marketStudy" className={`flex items-center gap-2 ${!hasMarketStudy ? 'opacity-50' : ''}`}>
                  {t('marketStudy.title', 'Étude de marché')}
                  <Badge variant="outline" className="text-xs">B2B</Badge>
                  {!hasMarketStudy && <span className="text-xs text-muted-foreground">(vide)</span>}
                </Label>
              </div>

              <div className="flex items-center gap-3">
                <Checkbox
                  id="actorsMap"
                  checked={options.includeActorsMap}
                  onCheckedChange={() => toggleOption('includeActorsMap')}
                  disabled={!hasActors}
                />
                <Label htmlFor="actorsMap" className={`flex items-center gap-2 ${!hasActors ? 'opacity-50' : ''}`}>
                  {t('actorsMap.title', 'Cartographie acteurs')}
                  <Badge variant="outline" className="text-xs">B2B</Badge>
                  {!hasActors && <span className="text-xs text-muted-foreground">(vide)</span>}
                </Label>
              </div>

              <div className="flex items-center gap-3">
                <Checkbox
                  id="riskRegisterEnhanced"
                  checked={options.includeRiskRegisterEnhanced}
                  onCheckedChange={() => toggleOption('includeRiskRegisterEnhanced')}
                  disabled={!hasEnhancedRisks}
                />
                <Label htmlFor="riskRegisterEnhanced" className={`flex items-center gap-2 ${!hasEnhancedRisks ? 'opacity-50' : ''}`}>
                  {t('riskRegister.title', 'Registre des risques')}
                  <Badge variant="outline" className="text-xs">B2B</Badge>
                  {!hasEnhancedRisks && <span className="text-xs text-muted-foreground">(vide)</span>}
                </Label>
              </div>

              <div className="flex items-center gap-3">
                <Checkbox
                  id="structuralRules"
                  checked={options.includeStructuralRules}
                  onCheckedChange={() => toggleOption('includeStructuralRules')}
                  disabled={!hasRules}
                />
                <Label htmlFor="structuralRules" className={`flex items-center gap-2 ${!hasRules ? 'opacity-50' : ''}`}>
                  {t('structuralRules.title', 'Règles structurantes')}
                  <Badge variant="outline" className="text-xs">B2B</Badge>
                  {!hasRules && <span className="text-xs text-muted-foreground">(vide)</span>}
                </Label>
              </div>

              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-3">{t('cases.export.legacySections', 'Sections existantes')}</p>
              </div>

              <div className="flex items-center gap-3">
                <Checkbox
                  id="riskRegister"
                  checked={options.includeRiskRegister}
                  onCheckedChange={() => toggleOption('includeRiskRegister')}
                />
                <Label htmlFor="riskRegister" className="flex items-center gap-2">
                  {t('terrainGovernance.deep.riskRegister', 'Risk Register (legacy)')}
                </Label>
              </div>

              <div className="flex items-center gap-3">
                <Checkbox
                  id="governanceMap"
                  checked={options.includeGovernanceMap}
                  onCheckedChange={() => toggleOption('includeGovernanceMap')}
                />
                <Label htmlFor="governanceMap" className="flex items-center gap-2">
                  {t('terrainGovernance.stakeholders.title', 'Cartographie acteurs (legacy)')}
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
                </Label>
              </div>
            </>
          )}

          <div className="flex items-center gap-3 pt-2 border-t">
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
