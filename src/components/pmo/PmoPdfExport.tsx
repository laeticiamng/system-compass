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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { 
  PmoObjectiveRow, 
  PmoInitiativeRow, 
  PmoRiskRow,
  PmoBudgetLineRow,
  PmoMilestoneRow
} from '@/lib/pmo-types';
import {
  formatBudgetAmount,
  calculateRiskScore,
  getRiskSeverity,
  PRIORITY_LABELS,
  RISK_CATEGORY_LABELS,
  BUDGET_CATEGORY_LABELS,
  type ObjectivePriority,
  type RiskCategory,
  type BudgetCategory
} from '@/lib/pmo-types';

export type PackType = 'b2c_simple' | 'b2b_comex' | 'investor' | 'compliance_audit';

interface PmoPdfExportProps {
  caseTitle: string;
  objectives: PmoObjectiveRow[];
  initiatives: PmoInitiativeRow[];
  risks: PmoRiskRow[];
  budgetLines: PmoBudgetLineRow[];
  milestones: PmoMilestoneRow[];
  isDeep?: boolean;
}

const PACK_CONFIGS: Record<PackType, { title: string; description: string; color: string }> = {
  b2c_simple: {
    title: 'Pack Simple (B2C)',
    description: 'Décision + plan 30/90j + risques + prochaines actions',
    color: '#3b82f6',
  },
  b2b_comex: {
    title: 'Pack COMEX (B2B)',
    description: 'Objectifs, roadmap, KPI, risques, budget, arbitrages',
    color: '#8b5cf6',
  },
  investor: {
    title: 'Pack Investisseur',
    description: 'MVP path, time-to-market, budget, risques, mitigations',
    color: '#22c55e',
  },
  compliance_audit: {
    title: 'Pack Audit/Conformité',
    description: 'Traçabilité, décisions, preuves, conformité',
    color: '#f59e0b',
  },
};

export function PmoPdfExport({
  caseTitle,
  objectives,
  initiatives,
  risks,
  budgetLines,
  milestones,
  isDeep = false,
}: PmoPdfExportProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'fr' ? 'fr' : 'en';
  const [isExporting, setIsExporting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [selectedPack, setSelectedPack] = useState<PackType>('b2c_simple');

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

      const addSectionTitle = (title: string, color: string = '#3b82f6') => {
        checkNewPage();
        yPos += 5;
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        pdf.setFillColor(r, g, b);
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

      const packConfig = PACK_CONFIGS[selectedPack];

      // ===== HEADER =====
      addText(caseTitle, 22, true);
      addText(packConfig.title, 14, false, packConfig.color);
      addText(`Généré le ${format(new Date(), 'dd MMMM yyyy', { locale: fr })}`, 10, false, '#888888');
      yPos += 5;

      // ===== PACK-SPECIFIC CONTENT =====
      
      if (selectedPack === 'b2c_simple') {
        // B2C Simple Pack
        addSectionTitle('📎 Résumé du projet', '#3b82f6');
        addText(`Ce document présente votre plan d'action personnel avec les étapes clés et les points d'attention.`, 10);
        yPos += 5;

        // Goals
        if (objectives.length > 0) {
          addSectionTitle('🎯 Vos objectifs', '#22c55e');
          objectives.slice(0, 3).forEach(obj => {
            addText(`${obj.title}`, 12, true);
            if (obj.description) addText(obj.description, 10);
            addKeyValue('Horizon', `${obj.horizon_days} jours`);
            yPos += 3;
          });
        }

        // Steps (Initiatives as steps)
        if (initiatives.length > 0) {
          addSectionTitle('📝 Prochaines étapes', '#3b82f6');
          const todoInitiatives = initiatives.filter(i => i.status !== 'done').slice(0, 10);
          addBulletList(todoInitiatives.map(i => `${i.title}${i.status === 'in_progress' ? ' (en cours)' : ''}`));
        }

        // Risks as concerns
        if (risks.length > 0) {
          addSectionTitle('⚠️ Points d\'attention', '#f59e0b');
          const topRisks = risks.slice(0, 5);
          topRisks.forEach(risk => {
            const score = calculateRiskScore(risk.impact, risk.probability);
            const severity = getRiskSeverity(score);
            addText(`${risk.title} (${severity})`, 11, true);
            if (risk.mitigation_plan) {
              addText(`→ ${risk.mitigation_plan}`, 10, false, '#666666');
            }
            yPos += 2;
          });
        }
      }

      if (selectedPack === 'b2b_comex') {
        // COMEX Pack
        addSectionTitle('📊 Synthèse COMEX', '#8b5cf6');
        
        // KPIs
        addKeyValue('Objectifs actifs', objectives.filter(o => o.status === 'active').length.toString());
        addKeyValue('Initiatives', initiatives.length.toString());
        addKeyValue('Initiatives terminées', initiatives.filter(i => i.status === 'done').length.toString());
        addKeyValue('Risques critiques', risks.filter(r => calculateRiskScore(r.impact, r.probability) > 16).length.toString());
        yPos += 5;

        // Strategic Objectives
        if (objectives.length > 0) {
          addSectionTitle('🎯 Objectifs stratégiques', '#3b82f6');
          objectives.forEach(obj => {
            addText(`${obj.title}`, 12, true);
            addKeyValue('Priorité', PRIORITY_LABELS[obj.priority as ObjectivePriority]?.[lang] || obj.priority);
            addKeyValue('Horizon', `${obj.horizon_days} jours`);
            addKeyValue('Statut', obj.status);
            const linkedInitiatives = initiatives.filter(i => i.objective_id === obj.id);
            addKeyValue('Initiatives liées', linkedInitiatives.length.toString());
            yPos += 5;
          });
        }

        // Critical Risks
        const criticalRisks = risks.filter(r => calculateRiskScore(r.impact, r.probability) >= 12);
        if (criticalRisks.length > 0) {
          addSectionTitle('🚨 Risques critiques', '#ef4444');
          criticalRisks.forEach(risk => {
            const score = calculateRiskScore(risk.impact, risk.probability);
            addText(`${risk.title} (Score: ${score})`, 11, true);
            addKeyValue('Catégorie', RISK_CATEGORY_LABELS[risk.category as RiskCategory]?.[lang] || risk.category);
            addKeyValue('Impact', `${risk.impact}/5`);
            addKeyValue('Probabilité', `${risk.probability}/5`);
            if (risk.mitigation_plan) {
              addText(`Mitigation: ${risk.mitigation_plan}`, 10, false, '#666666');
            }
            yPos += 3;
          });
        }

        // Budget Summary
        if (budgetLines.length > 0) {
          addSectionTitle('💰 Budget', '#22c55e');
          const totalBudget = budgetLines.reduce((sum, l) => sum + l.amount, 0);
          const capex = budgetLines.filter(l => l.budget_type === 'capex').reduce((sum, l) => sum + l.amount, 0);
          const opex = budgetLines.filter(l => l.budget_type === 'opex').reduce((sum, l) => sum + l.amount, 0);
          addKeyValue('Budget total', formatBudgetAmount(totalBudget));
          addKeyValue('CAPEX', formatBudgetAmount(capex));
          addKeyValue('OPEX', formatBudgetAmount(opex));
        }

        // Decisions needed
        addSectionTitle('⚡ Arbitrages requis', '#f59e0b');
        const blockedInitiatives = initiatives.filter(i => i.status === 'blocked');
        if (blockedInitiatives.length > 0) {
          addBulletList(blockedInitiatives.map(i => `${i.title} - Bloqué`));
        } else {
          addText('Aucun arbitrage en attente.', 10);
        }
      }

      if (selectedPack === 'investor') {
        // Investor Pack
        addSectionTitle('💼 Pack Investisseur', '#22c55e');
        
        // MVP Path
        addSectionTitle('🚀 Chemin MVP', '#3b82f6');
        const priorityObjectives = objectives
          .filter(o => o.priority === 'critical' || o.priority === 'high')
          .slice(0, 3);
        if (priorityObjectives.length > 0) {
          priorityObjectives.forEach(obj => {
            addText(`${obj.title}`, 12, true);
            addKeyValue('Horizon', `${obj.horizon_days} jours`);
            const linkedInit = initiatives.filter(i => i.objective_id === obj.id);
            addKeyValue('Initiatives', linkedInit.length.toString());
          });
        }

        // Milestones
        if (milestones.length > 0) {
          addSectionTitle('🏁 Jalons clés', '#8b5cf6');
          milestones.slice(0, 5).forEach(m => {
            addText(`${m.title}`, 11, true);
            addKeyValue('Date cible', m.target_date ? format(new Date(m.target_date), 'dd/MM/yyyy') : 'Non définie');
            addKeyValue('Statut', m.status);
          });
        }

        // Budget
        if (budgetLines.length > 0) {
          addSectionTitle('💰 Projection financière', '#22c55e');
          const totalBudget = budgetLines.reduce((sum, l) => sum + l.amount, 0);
          addKeyValue('Budget prévisionnel', formatBudgetAmount(totalBudget));
          
          // By category
          const byCategory: Record<string, number> = {};
          budgetLines.forEach(line => {
            byCategory[line.category] = (byCategory[line.category] || 0) + line.amount;
          });
          Object.entries(byCategory).slice(0, 5).forEach(([cat, amount]) => {
            addKeyValue(BUDGET_CATEGORY_LABELS[cat as BudgetCategory]?.[lang] || cat, formatBudgetAmount(amount));
          });
        }

        // Risks & Mitigations
        if (risks.length > 0) {
          addSectionTitle('⚠️ Risques & Mitigations', '#f59e0b');
          risks.slice(0, 5).forEach(risk => {
            const score = calculateRiskScore(risk.impact, risk.probability);
            const severity = getRiskSeverity(score);
            addText(`${risk.title} (${severity.toUpperCase()})`, 11, true);
            if (risk.mitigation_plan) {
              addText(`→ ${risk.mitigation_plan}`, 10, false, '#666666');
            }
            yPos += 2;
          });
        }
      }

      if (selectedPack === 'compliance_audit') {
        // Compliance/Audit Pack
        addSectionTitle('📋 Pack Audit & Traçabilité', '#f59e0b');
        addText('Ce document fournit une vue d\'ensemble de la traçabilité et des décisions du projet.', 10);
        yPos += 5;

        // All Objectives with dates
        if (objectives.length > 0) {
          addSectionTitle('🎯 Historique des objectifs', '#3b82f6');
          objectives.forEach(obj => {
            addText(`${obj.title}`, 11, true);
            addKeyValue('Créé le', format(new Date(obj.created_at), 'dd/MM/yyyy HH:mm'));
            addKeyValue('Statut', obj.status);
            if (obj.updated_at !== obj.created_at) {
              addKeyValue('Modifié le', format(new Date(obj.updated_at), 'dd/MM/yyyy HH:mm'));
            }
            yPos += 3;
          });
        }

        // All Risks with full details
        if (risks.length > 0) {
          addSectionTitle('🚨 Registre des risques complet', '#ef4444');
          risks.forEach(risk => {
            const score = calculateRiskScore(risk.impact, risk.probability);
            addText(`${risk.title}`, 11, true);
            addKeyValue('Catégorie', RISK_CATEGORY_LABELS[risk.category as RiskCategory]?.[lang] || risk.category);
            addKeyValue('Score', `${score} (I:${risk.impact} x P:${risk.probability})`);
            addKeyValue('Statut', risk.status);
            addKeyValue('Créé le', format(new Date(risk.created_at), 'dd/MM/yyyy'));
            if (risk.mitigation_plan) {
              addText(`Plan de mitigation: ${risk.mitigation_plan}`, 10);
            }
            if (risk.contingency_plan) {
              addText(`Plan de contingence: ${risk.contingency_plan}`, 10);
            }
            yPos += 5;
          });
        }

        // Budget Lines with full traceability
        if (budgetLines.length > 0) {
          addSectionTitle('💰 Lignes budgétaires (audit)', '#22c55e');
          budgetLines.forEach(line => {
            addText(`${line.description}`, 11, true);
            addKeyValue('Montant', formatBudgetAmount(line.amount));
            addKeyValue('Type', line.budget_type.toUpperCase());
            addKeyValue('Catégorie', BUDGET_CATEGORY_LABELS[line.category as BudgetCategory]?.[lang] || line.category);
            addKeyValue('Mois', line.month_year);
            if (line.justification) {
              addText(`Justification: ${line.justification}`, 10, false, '#666666');
            }
            yPos += 3;
          });
        }
      }

      // ===== FOOTER =====
      yPos = pageHeight - 15;
      pdf.setFontSize(8);
      pdf.setTextColor('#999999');
      pdf.text(`${packConfig.title} - ${caseTitle} - ${format(new Date(), 'dd/MM/yyyy')}`, margin, yPos);
      pdf.text('Généré par System Compass', pageWidth - margin - 40, yPos);

      // Save
      const fileName = `${selectedPack}-${caseTitle.toLowerCase().replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      pdf.save(fileName);

      setIsComplete(true);
      toast.success(t('pmo.export.success', 'PDF généré avec succès'));
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error(t('pmo.export.error', 'Erreur lors de la génération'));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileText className="w-4 h-4" />
          {t('pmo.export.button', 'Exporter Pack')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            {t('pmo.export.title', 'Générer un Pack PDF')}
          </DialogTitle>
          <DialogDescription>
            {t('pmo.export.description', 'Choisissez le type de pack à exporter')}
          </DialogDescription>
        </DialogHeader>

        <RadioGroup
          value={selectedPack}
          onValueChange={(v) => setSelectedPack(v as PackType)}
          className="space-y-3 py-4"
        >
          {Object.entries(PACK_CONFIGS).map(([key, config]) => {
            const isAvailable = key === 'b2c_simple' || isDeep;
            return (
              <div
                key={key}
                className={`flex items-start gap-3 p-3 rounded-lg border ${
                  selectedPack === key ? 'border-primary bg-primary/5' : 'border-border'
                } ${!isAvailable ? 'opacity-50' : ''}`}
              >
                <RadioGroupItem value={key} id={key} disabled={!isAvailable} />
                <Label htmlFor={key} className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{config.title}</span>
                    {!isAvailable && (
                      <Badge variant="outline" className="text-xs">Mode Complet</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {config.description}
                  </p>
                </Label>
              </div>
            );
          })}
        </RadioGroup>

        <Button
          onClick={generatePdf}
          disabled={isExporting}
          className="w-full gap-2"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t('pmo.export.generating', 'Génération...')}
            </>
          ) : isComplete ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              {t('pmo.export.complete', 'Terminé !')}
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              {t('pmo.export.generate', 'Générer le PDF')}
            </>
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
