/**
 * Fiscal Calculator PDF Export
 * Generates professional PDF reports for salary comparisons
 */
import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { NetSalaryResult } from './fiscal-data';

interface ExportData {
  originCountry: string;
  originCountryName: string;
  originResult: NetSalaryResult;
  destinationCountry?: string;
  destinationCountryName?: string;
  destinationResult?: NetSalaryResult;
  analysis?: string[];
}

function formatCurrency(amount: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function exportFiscalComparisonPDF(data: ExportData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  let yPos = 20;
  const leftMargin = 20;
  const rightMargin = pageWidth - 20;
  const colWidth = (pageWidth - 40) / 2;

  // Header
  doc.setFontSize(22);
  doc.setTextColor(59, 130, 246); // Primary blue
  doc.text('System Compass', leftMargin, yPos);
  
  yPos += 10;
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('Simulation Fiscale', leftMargin, yPos);
  
  yPos += 8;
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Généré le ${format(new Date(), 'dd MMMM yyyy', { locale: fr })}`, leftMargin, yPos);
  
  // Separator line
  yPos += 10;
  doc.setDrawColor(200, 200, 200);
  doc.line(leftMargin, yPos, rightMargin, yPos);
  yPos += 15;

  // Helper function to add a section
  const addSection = (title: string, result: NetSalaryResult, xOffset: number) => {
    let sectionY = yPos;
    
    // Section title
    doc.setFontSize(14);
    doc.setTextColor(59, 130, 246);
    doc.text(title, xOffset, sectionY);
    sectionY += 10;

    // Gross salary
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Salaire brut annuel:', xOffset, sectionY);
    doc.setTextColor(0, 0, 0);
    doc.text(formatCurrency(result.grossAnnual), xOffset + 50, sectionY);
    sectionY += 8;

    // Net salary (highlighted)
    doc.setFillColor(240, 249, 255);
    doc.roundedRect(xOffset - 2, sectionY - 4, colWidth - 10, 20, 2, 2, 'F');
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Salaire net mensuel:', xOffset, sectionY);
    sectionY += 6;
    doc.setFontSize(16);
    doc.setTextColor(59, 130, 246);
    doc.text(formatCurrency(result.netMonthly), xOffset, sectionY);
    sectionY += 14;

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Net annuel:', xOffset, sectionY);
    doc.setTextColor(0, 0, 0);
    doc.text(formatCurrency(result.netAnnual), xOffset + 30, sectionY);
    sectionY += 10;

    // Breakdown
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text('Détail des prélèvements:', xOffset, sectionY);
    sectionY += 7;

    result.breakdown.forEach(item => {
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.text(`• ${item.label}:`, xOffset, sectionY);
      doc.text(`${formatCurrency(item.amount)} (${item.percentage.toFixed(1)}%)`, xOffset + 55, sectionY);
      sectionY += 6;
    });

    sectionY += 5;

    // Rates
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Taux d\'imposition effectif:', xOffset, sectionY);
    doc.setTextColor(0, 0, 0);
    doc.text(`${result.effectiveTaxRate.toFixed(1)}%`, xOffset + 55, sectionY);
    sectionY += 6;

    doc.setTextColor(100, 100, 100);
    doc.text('Taux total de prélèvements:', xOffset, sectionY);
    doc.setTextColor(0, 0, 0);
    doc.text(`${result.effectiveTotalRate.toFixed(1)}%`, xOffset + 60, sectionY);
    sectionY += 10;

    // Purchasing power
    doc.setFillColor(255, 251, 235);
    doc.roundedRect(xOffset - 2, sectionY - 4, colWidth - 10, 16, 2, 2, 'F');
    
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('Pouvoir d\'achat ajusté:', xOffset, sectionY);
    sectionY += 5;
    doc.setFontSize(12);
    doc.setTextColor(217, 119, 6);
    doc.text(`${formatCurrency(result.purchasingPowerAdjusted)}/mois`, xOffset, sectionY);

    return sectionY + 15;
  };

  // Origin country
  const endYOrigin = addSection(data.originCountryName, data.originResult, leftMargin);

  // Destination country (if comparison)
  if (data.destinationCountryName && data.destinationResult) {
    addSection(data.destinationCountryName, data.destinationResult, leftMargin + colWidth);
  }

  yPos = Math.max(endYOrigin, yPos + 100);

  // Comparison analysis (if applicable)
  if (data.analysis && data.analysis.length > 0 && data.destinationResult) {
    yPos += 10;
    
    // Check if we need a new page
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.setTextColor(59, 130, 246);
    doc.text('Analyse comparative', leftMargin, yPos);
    yPos += 10;

    // Net difference
    const netDiff = data.destinationResult.netMonthly - data.originResult.netMonthly;
    const ppDiff = data.destinationResult.purchasingPowerAdjusted - data.originResult.purchasingPowerAdjusted;

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Différence nette mensuelle:', leftMargin, yPos);
    doc.setTextColor(netDiff >= 0 ? 22 : 220, netDiff >= 0 ? 163 : 38, netDiff >= 0 ? 74 : 38);
    doc.text(`${netDiff >= 0 ? '+' : ''}${formatCurrency(netDiff)}`, leftMargin + 60, yPos);
    yPos += 7;

    doc.setTextColor(100, 100, 100);
    doc.text('Différence pouvoir d\'achat:', leftMargin, yPos);
    doc.setTextColor(ppDiff >= 0 ? 22 : 220, ppDiff >= 0 ? 163 : 38, ppDiff >= 0 ? 74 : 38);
    doc.text(`${ppDiff >= 0 ? '+' : ''}${formatCurrency(ppDiff)}`, leftMargin + 60, yPos);
    yPos += 12;

    // Analysis points
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    data.analysis.forEach(point => {
      const lines = doc.splitTextToSize(`• ${point}`, pageWidth - 40);
      lines.forEach((line: string) => {
        doc.text(line, leftMargin, yPos);
        yPos += 5;
      });
      yPos += 2;
    });
  }

  // Footer
  yPos = doc.internal.pageSize.getHeight() - 20;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Ce document est fourni à titre informatif uniquement. Consultez un professionnel pour des conseils personnalisés.', leftMargin, yPos);
  yPos += 4;
  doc.text('© Compass - system-compass.app', leftMargin, yPos);

  // Save
  const filename = data.destinationCountryName 
    ? `simulation-fiscale-${data.originCountry}-vs-${data.destinationCountry}-${format(new Date(), 'yyyy-MM-dd')}.pdf`
    : `simulation-fiscale-${data.originCountry}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  
  doc.save(filename);
}

export function exportSingleCountryPDF(
  countryId: string,
  countryName: string,
  result: NetSalaryResult
): void {
  exportFiscalComparisonPDF({
    originCountry: countryId,
    originCountryName: countryName,
    originResult: result,
  });
}
