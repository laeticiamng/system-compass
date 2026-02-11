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
import { useToast } from '@/hooks/use-toast';
import { Country } from '@/lib/types';
import jsPDF from 'jspdf';

interface CountryPdfExportProps {
  country: Country;
  intelligenceData?: any;
  variantsData?: any;
  tagsData?: any;
  governanceData?: any;
}

interface ExportOptions {
  includeOverview: boolean;
  includeRisks: boolean;
  includePlaybook: boolean;
  includeIntelligence: boolean;
  includeVariants: boolean;
  includeTags: boolean;
  includeGovernance: boolean;
}

export function CountryPdfExport({
  country,
  intelligenceData,
  variantsData,
  tagsData,
  governanceData,
}: CountryPdfExportProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [options, setOptions] = useState<ExportOptions>({
    includeOverview: true,
    includeRisks: true,
    includePlaybook: true,
    includeIntelligence: !!intelligenceData,
    includeVariants: !!variantsData,
    includeTags: !!tagsData,
    includeGovernance: !!governanceData,
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
        
        // Check for page break
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
        items.forEach(item => {
          addText(`• ${item}`, 10);
        });
      };

      // Header
      pdf.setFillColor(15, 23, 42);
      pdf.rect(0, 0, pageWidth, 40, 'F');
      pdf.setTextColor('#FFFFFF');
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text(country.nameLocal || country.name, margin, 25);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${country.region} | ${country.pyramidType}`, margin, 33);
      yPos = 50;

      // Overview
      if (options.includeOverview) {
        addSectionTitle(t('countryDetail.overview', 'Vue d\'ensemble'));
        addText(country.ruleOfGold || '', 11);
        yPos += 5;
        
        // Snapshot
        if (country.snapshot) {
          addText(`PIB/hab: $${country.snapshot.gdpPerCapita?.toLocaleString() || 'N/A'}`, 10);
          addText(`Population: ${(country.snapshot.population / 1000000).toFixed(1)}M`, 10);
          addText(`Rang passeport: #${country.snapshot.passportRank || 'N/A'}`, 10);
        }
      }

      // Risks
      if (options.includeRisks && country.risks) {
        addSectionTitle(t('countryDetail.risks', 'Risques'));
        Object.entries(country.risks).forEach(([key, value]) => {
          const barWidth = (value as number) / 100 * (contentWidth - 40);
          pdf.setFillColor(value > 70 ? 239 : value > 40 ? 245 : 34, value > 70 ? 68 : value > 40 ? 158 : 197, value > 70 ? 68 : value > 40 ? 11 : 94);
          pdf.rect(margin, yPos - 3, barWidth, 5, 'F');
          pdf.setTextColor('#333333');
          pdf.setFontSize(9);
          pdf.text(`${key}: ${value}%`, margin + barWidth + 5, yPos);
          yPos += 8;
        });
      }

      // Playbook
      if (options.includePlaybook && country.playbook) {
        addSectionTitle(t('countryDetail.playbook', 'Playbook'));
        
        if (country.playbook.do?.length) {
          addText(t('playbook.do', 'À faire:'), 11, true, '#22c55e');
          addBulletList(country.playbook.do);
        }
        
        if (country.playbook.dont?.length) {
          addText(t('playbook.dont', 'À éviter:'), 11, true, '#ef4444');
          addBulletList(country.playbook.dont);
        }

        if (country.playbook.planB) {
          yPos += 3;
          addText(`Plan B: ${country.playbook.planB}`, 10);
        }
      }

      // Intelligence
      if (options.includeIntelligence && intelligenceData) {
        addSectionTitle(t('intelligence.title', 'Intelligence Layer'));
        
        if (intelligenceData.social_norms) {
          addText(`Normes sociales: ${intelligenceData.social_norms}`, 10);
        }
        if (intelligenceData.authority_relation) {
          addText(`Relation à l'autorité: ${intelligenceData.authority_relation}`, 10);
        }
        if (intelligenceData.risk_attitude) {
          addText(`Attitude au risque: ${intelligenceData.risk_attitude}`, 10);
        }
        
        if (intelligenceData.strategies_rewarded?.length) {
          addText('Stratégies récompensées:', 10, true, '#22c55e');
          addBulletList(intelligenceData.strategies_rewarded);
        }
        
        if (intelligenceData.newcomer_mistakes?.length) {
          addText('Erreurs fréquentes:', 10, true, '#f59e0b');
          addBulletList(intelligenceData.newcomer_mistakes);
        }
      }

      // Variants
      if (options.includeVariants && variantsData) {
        addSectionTitle(t('variants.title', 'Réalités du terrain'));
        
        if (variantsData.profiles_succeed?.length) {
          addText('Profils qui réussissent:', 10, true, '#22c55e');
          addBulletList(variantsData.profiles_succeed.slice(0, 5));
        }
        
        if (variantsData.profiles_struggle?.length) {
          addText('Profils en difficulté:', 10, true, '#ef4444');
          addBulletList(variantsData.profiles_struggle.slice(0, 5));
        }
        
        if (variantsData.surprises?.length) {
          addText('Surprises courantes:', 10, true, '#f59e0b');
          addBulletList(variantsData.surprises.slice(0, 5));
        }

        if (variantsData.daily_life?.length) {
          addText('Vie quotidienne:', 10, true);
          addBulletList(variantsData.daily_life.slice(0, 4));
        }

        if (variantsData.labor_market?.length) {
          addText('Marché du travail:', 10, true);
          addBulletList(variantsData.labor_market.slice(0, 4));
        }
      }

      // Tags
      if (options.includeTags && tagsData) {
        addSectionTitle(t('tags.title', 'Indicateurs clés'));
        
        const tagLabels: Record<string, string> = {
          social_mobility: 'Mobilité sociale',
          predictability: 'Prévisibilité',
          risk_tolerance: 'Tolérance au risque',
          network_weight: 'Poids du réseau',
          diploma_weight: 'Poids du diplôme',
          admin_speed: 'Rapidité admin',
        };

        Object.entries(tagLabels).forEach(([key, label]) => {
          const value = tagsData[key];
          if (typeof value === 'number') {
            const barWidth = (value / 5) * (contentWidth - 50);
            pdf.setFillColor(59, 130, 246);
            pdf.rect(margin, yPos - 3, barWidth, 5, 'F');
            pdf.setFontSize(9);
            pdf.text(`${label}: ${value}/5`, margin + barWidth + 5, yPos);
            yPos += 8;
          }
        });
      }

      // Governance (B2B)
      if (options.includeGovernance && governanceData) {
        addSectionTitle(t('governance.title', 'Gouvernance & Terrain'));
        
        // Scores
        const scoreLabels: Record<string, string> = {
          stability_score: 'Stabilité institutionnelle',
          friction_score: 'Friction opérationnelle',
          operational_score: 'Score opérationnel',
          capture_risk_score: 'Risque de capture',
          ecosystem_score: 'Écosystème',
        };

        Object.entries(scoreLabels).forEach(([key, label]) => {
          const value = governanceData[key];
          if (typeof value === 'number') {
            const barWidth = (value / 5) * (contentWidth - 50);
            const color = value >= 4 ? [34, 197, 94] : value >= 3 ? [245, 158, 11] : [239, 68, 68];
            pdf.setFillColor(color[0], color[1], color[2]);
            pdf.rect(margin, yPos - 3, barWidth, 5, 'F');
            pdf.setFontSize(9);
            pdf.text(`${label}: ${value}/5`, margin + barWidth + 5, yPos);
            yPos += 8;
          }
        });

        // State of Art checklist
        if (governanceData.state_of_art?.length) {
          yPos += 3;
          addText('État de l\'art:', 10, true);
          governanceData.state_of_art.slice(0, 6).forEach((item: any) => {
            const status = item.checked ? '✓' : '○';
            addText(`${status} ${item.label}`, 9);
          });
        }

        // Attractiveness
        if (governanceData.attractiveness) {
          yPos += 3;
          addText('Attractivité terrain:', 10, true);
          const attr = governanceData.attractiveness;
          if (attr.demand) addText(`• Demande: ${attr.demand}/5`, 9);
          if (attr.easeOfDoing) addText(`• Facilité d'implantation: ${attr.easeOfDoing}/5`, 9);
          if (attr.marketAccess) addText(`• Accès marché: ${attr.marketAccess}/5`, 9);
          if (attr.signals?.length) {
            addText('Signaux clés:', 9, true);
            attr.signals.slice(0, 3).forEach((s: string) => addText(`• ${s}`, 9));
          }
        }

        // Competition
        if (governanceData.competition?.length) {
          yPos += 3;
          addText('Concurrence identifiée:', 10, true);
          governanceData.competition.slice(0, 4).forEach((comp: any) => {
            addText(`• ${comp.name} (${comp.type}) - ${comp.implantation}`, 9);
          });
        }

        // Friction Risks
        if (governanceData.friction_risks?.redFlags?.length) {
          yPos += 3;
          addText('Points de vigilance:', 10, true, '#ef4444');
          governanceData.friction_risks.redFlags.slice(0, 4).forEach((rf: any) => {
            const severity = rf.severity === 'high' ? '🔴' : rf.severity === 'medium' ? '🟠' : '🟡';
            addText(`${severity} ${rf.label}`, 9);
          });
        }

        // Fiscal Checklist
        if (governanceData.fiscal_checklist?.length) {
          yPos += 3;
          addText('Checklist fiscale:', 10, true);
          governanceData.fiscal_checklist.slice(0, 5).forEach((item: any) => {
            const status = item.checked ? '✓' : '○';
            const critical = item.critical ? ' (critique)' : '';
            addText(`${status} ${item.label}${critical}`, 9);
          });
        }

        // Customs & Logistics
        if (governanceData.customs_logistics?.length) {
          yPos += 3;
          addText('Douanes & Logistique:', 10, true);
          governanceData.customs_logistics.slice(0, 4).forEach((item: any) => {
            const status = item.checked ? '✓' : '○';
            const risk = item.riskLevel === 'high' ? '⚠️' : '';
            addText(`${status} ${item.label} ${risk}`, 9);
          });
        }
      }

      // Footer
      const footerY = pdf.internal.pageSize.getHeight() - 15;
      pdf.setFontSize(8);
      pdf.setTextColor('#9CA3AF');
      const footerText = t('export.footer', 'Generated by System Compass | {{date}} | Simulation only', {
        date: new Date().toLocaleDateString()
      });
      pdf.text(footerText, margin, footerY);

      // Save
      const filename = `${country.id}-analysis-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);

      setIsComplete(true);
      toast({
        title: t('export.success', 'Export réussi'),
        description: t('export.downloaded', 'Le PDF a été téléchargé'),
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: t('export.error', 'Erreur d\'export'),
        description: t('export.errorDesc', 'Impossible de générer le PDF'),
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          {t('export.pdf', 'Export PDF')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {t('export.title', 'Exporter l\'analyse')}
          </DialogTitle>
          <DialogDescription>
            {t('export.description', 'Sélectionnez les sections à inclure dans le PDF')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {[
            { key: 'includeOverview', label: t('export.overview', 'Vue d\'ensemble'), always: true },
            { key: 'includeRisks', label: t('export.risks', 'Risques'), always: true },
            { key: 'includePlaybook', label: t('export.playbook', 'Playbook'), always: true },
            { key: 'includeIntelligence', label: t('export.intelligence', 'Intelligence Layer'), always: false, available: !!intelligenceData },
            { key: 'includeVariants', label: t('export.variants', 'Variants'), always: false, available: !!variantsData },
            { key: 'includeTags', label: t('export.tags', 'Tags/Indicateurs'), always: false, available: !!tagsData },
            { key: 'includeGovernance', label: t('export.governance', 'Gouvernance & Terrain (B2B)'), always: false, available: !!governanceData },
          ].map(item => (
            <div key={item.key} className="flex items-center space-x-2">
              <Checkbox
                id={item.key}
                checked={options[item.key as keyof ExportOptions]}
                onCheckedChange={checked => 
                  setOptions(prev => ({ ...prev, [item.key]: !!checked }))
                }
                disabled={item.always || (item.available === false)}
              />
              <Label 
                htmlFor={item.key}
                className={item.available === false ? 'text-muted-foreground line-through' : ''}
              >
                {item.label}
                {item.available === false && (
                  <span className="text-xs ml-2">({t('export.notAvailable', 'non disponible')})</span>
                )}
              </Label>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <Button
            onClick={generatePdf}
            disabled={isExporting}
            className="gap-2"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('export.generating', 'Génération...')}
              </>
            ) : isComplete ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                {t('export.complete', 'Terminé!')}
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                {t('export.generate', 'Générer le PDF')}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
