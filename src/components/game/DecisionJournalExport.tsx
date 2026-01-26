// Game Decision Journal Export Component
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Loader2, FileText, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

interface GameDecision {
  turn: number;
  action: string;
  outcome: string;
  moneyChange: number;
  healthChange: number;
  riskEvent?: boolean;
  country?: string;
}

interface DecisionJournalExportProps {
  decisions: GameDecision[];
  gameMode: 'solo' | 'race';
  finalScore: number;
  archetype?: string;
  countriesVisited?: string[];
}

export function DecisionJournalExport({
  decisions,
  gameMode,
  finalScore,
  archetype,
  countriesVisited = [],
}: DecisionJournalExportProps) {
  const { t, i18n } = useTranslation();
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      let y = margin;

      // Header
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text(t('game.journal.title', 'Decision Journal'), pageWidth / 2, y, { align: 'center' });
      y += 10;

      // Subtitle
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(128, 128, 128);
      const dateStr = new Date().toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US');
      pdf.text(`${gameMode === 'solo' ? 'Solo' : 'Race'} Mode • ${dateStr}`, pageWidth / 2, y, { align: 'center' });
      y += 12;

      // Summary Box
      pdf.setTextColor(0, 0, 0);
      pdf.setFillColor(245, 245, 250);
      pdf.roundedRect(margin, y, pageWidth - margin * 2, 25, 3, 3, 'F');
      y += 6;

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text(t('game.journal.summary', 'Game Summary'), margin + 5, y);
      y += 6;

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${t('game.score', 'Final Score')}: ${finalScore.toLocaleString()}`, margin + 5, y);
      pdf.text(`${t('game.turns', 'Turns')}: ${decisions.length}`, margin + 60, y);
      if (archetype) {
        pdf.text(`${t('game.archetype', 'Archetype')}: ${archetype}`, margin + 100, y);
      }
      y += 5;

      if (countriesVisited.length > 0) {
        pdf.text(`${t('game.countriesVisited', 'Countries')}: ${countriesVisited.join(', ')}`, margin + 5, y);
      }
      y += 15;

      // Decisions Table Header
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(t('game.journal.decisions', 'Decision Log'), margin, y);
      y += 8;

      // Table headers
      pdf.setFillColor(79, 70, 229);
      pdf.setTextColor(255, 255, 255);
      pdf.rect(margin, y - 4, pageWidth - margin * 2, 7, 'F');
      pdf.setFontSize(8);
      pdf.text(t('game.turn', 'Turn'), margin + 3, y);
      pdf.text(t('game.action', 'Action'), margin + 18, y);
      pdf.text(t('game.outcome', 'Outcome'), margin + 75, y);
      pdf.text('💰', margin + 130, y);
      pdf.text('❤️', margin + 145, y);
      pdf.text('⚠️', margin + 160, y);
      y += 6;

      // Table rows
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');

      decisions.forEach((decision, index) => {
        if (y > pageHeight - 20) {
          pdf.addPage();
          y = margin;
        }

        // Alternating row background
        if (index % 2 === 0) {
          pdf.setFillColor(250, 250, 252);
          pdf.rect(margin, y - 3, pageWidth - margin * 2, 6, 'F');
        }

        pdf.setFontSize(7);
        pdf.text(decision.turn.toString(), margin + 5, y);
        
        const actionText = decision.action.substring(0, 30) + (decision.action.length > 30 ? '...' : '');
        pdf.text(actionText, margin + 18, y);
        
        const outcomeText = decision.outcome.substring(0, 28) + (decision.outcome.length > 28 ? '...' : '');
        pdf.text(outcomeText, margin + 75, y);
        
        // Money change with color
        const moneyStr = decision.moneyChange >= 0 ? `+${decision.moneyChange}` : decision.moneyChange.toString();
        pdf.setTextColor(decision.moneyChange >= 0 ? 34 : 220, decision.moneyChange >= 0 ? 197 : 38, decision.moneyChange >= 0 ? 94 : 38);
        pdf.text(moneyStr, margin + 130, y);
        
        // Health change with color
        const healthStr = decision.healthChange >= 0 ? `+${decision.healthChange}` : decision.healthChange.toString();
        pdf.setTextColor(decision.healthChange >= 0 ? 34 : 220, decision.healthChange >= 0 ? 197 : 38, decision.healthChange >= 0 ? 94 : 38);
        pdf.text(healthStr, margin + 145, y);
        
        // Risk event indicator
        pdf.setTextColor(0, 0, 0);
        pdf.text(decision.riskEvent ? '●' : '○', margin + 163, y);
        
        y += 5;
      });

      // Statistics section
      y += 10;
      if (y > pageHeight - 40) {
        pdf.addPage();
        y = margin;
      }

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text(t('game.journal.stats', 'Statistics'), margin, y);
      y += 7;

      const totalMoney = decisions.reduce((acc, d) => acc + d.moneyChange, 0);
      const totalHealth = decisions.reduce((acc, d) => acc + d.healthChange, 0);
      const riskEvents = decisions.filter(d => d.riskEvent).length;
      const riskSuccessRate = riskEvents > 0 
        ? Math.round((decisions.filter(d => d.riskEvent && d.moneyChange > 0).length / riskEvents) * 100)
        : 0;

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${t('game.journal.totalMoney', 'Net Money Change')}: ${totalMoney >= 0 ? '+' : ''}${totalMoney.toLocaleString()}`, margin, y);
      y += 5;
      pdf.text(`${t('game.journal.totalHealth', 'Net Health Change')}: ${totalHealth >= 0 ? '+' : ''}${totalHealth}`, margin, y);
      y += 5;
      pdf.text(`${t('game.journal.riskEvents', 'Risk Events')}: ${riskEvents}`, margin, y);
      y += 5;
      pdf.text(`${t('game.journal.riskSuccessRate', 'Risk Success Rate')}: ${riskSuccessRate}%`, margin, y);
      y += 10;

      // Disclaimer
      y = pageHeight - 15;
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'italic');
      pdf.setTextColor(150, 150, 150);
      pdf.text(t('game.journal.disclaimer', 'Educational simulation. Not financial advice.'), pageWidth / 2, y, { align: 'center' });

      // Save
      pdf.save(`decision-journal-${gameMode}-${Date.now()}.pdf`);
      toast.success(t('game.journal.exportSuccess', 'Journal exported successfully'));
    } catch (error) {
      console.error('Journal export error:', error);
      toast.error(t('game.journal.exportError', 'Failed to export journal'));
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCsv = () => {
    try {
      const headers = ['Turn', 'Action', 'Outcome', 'Money Change', 'Health Change', 'Risk Event', 'Country'];
      const rows = decisions.map(d => [
        d.turn,
        `"${d.action.replace(/"/g, '""')}"`,
        `"${d.outcome.replace(/"/g, '""')}"`,
        d.moneyChange,
        d.healthChange,
        d.riskEvent ? 'Yes' : 'No',
        d.country || '',
      ]);

      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `decision-journal-${gameMode}-${Date.now()}.csv`;
      link.click();

      toast.success(t('game.journal.csvExportSuccess', 'CSV exported successfully'));
    } catch (error) {
      toast.error(t('game.journal.exportError', 'Failed to export CSV'));
    }
  };

  if (decisions.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          {t('game.journal.title', 'Decision Journal')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          {t('game.journal.description', 'Export your game decisions for analysis and learning.')}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPdf}
            disabled={isExporting}
            className="gap-2"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
            PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            CSV
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
