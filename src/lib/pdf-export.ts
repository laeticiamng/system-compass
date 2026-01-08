import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { Country } from './types';

interface PDFExportOptions {
  country: Country;
  translatedData?: {
    name?: string;
    region?: string;
    ruleOfGold?: string;
    pyramid?: {
      top: string;
      institutions: string;
      gatekeepers: string;
      valueCreators: string;
      base: string;
      realAsset: string;
    };
    whoWins?: string[];
    whoLoses?: string[];
  };
  t: (key: string, fallback?: string) => string;
}

const PYRAMID_COLORS: Record<string, string> = {
  PROBLEM_RENT: '#ef4444',
  STABILITY_REDIS: '#3b82f6',
  COMPETENCE_TRUST: '#22c55e',
  GROWTH_RISK: '#eab308',
  HYBRID_TRANSITION: '#a855f7',
  RESOURCE_EXTRACTION: '#f97316',
};

const PYRAMID_LABELS: Record<string, string> = {
  PROBLEM_RENT: 'Problem Rent',
  STABILITY_REDIS: 'Stability Redis',
  COMPETENCE_TRUST: 'Competence Trust',
  GROWTH_RISK: 'Growth Risk',
  HYBRID_TRANSITION: 'Hybrid Transition',
  RESOURCE_EXTRACTION: 'Resource Extraction',
};

function getFlagEmoji(iso2: string): string {
  const codePoints = iso2
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

function formatPopulation(num: number): string {
  if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
  if (num >= 1000000) return `${(num / 1000000).toFixed(0)}M`;
  return `${(num / 1000).toFixed(0)}K`;
}

export async function exportCountryToPDF({ country, translatedData, t }: PDFExportOptions): Promise<void> {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  let yPos = margin;

  const displayName = translatedData?.name || country.name;
  const displayRegion = translatedData?.region || country.region;
  const displayRuleOfGold = translatedData?.ruleOfGold || country.ruleOfGold;
  const displayWhoWins = translatedData?.whoWins || country.whoWins;
  const displayWhoLoses = translatedData?.whoLoses || country.whoLoses;

  // Header
  pdf.setFillColor(15, 23, 42); // slate-900
  pdf.rect(0, 0, pageWidth, 45, 'F');

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(28);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`${getFlagEmoji(country.iso2)} ${displayName}`, margin, 25);

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  const pyramidLabel = PYRAMID_LABELS[country.pyramidType] || country.pyramidType;
  pdf.text(`${displayRegion} • ${pyramidLabel}`, margin, 35);

  yPos = 55;

  // Rule of Gold
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text(t('countryDetail.ruleOfGold', 'Rule of Gold'), margin, yPos);
  yPos += 8;

  const pyramidColor = PYRAMID_COLORS[country.pyramidType] || '#6366f1';
  pdf.setFillColor(parseInt(pyramidColor.slice(1, 3), 16), parseInt(pyramidColor.slice(3, 5), 16), parseInt(pyramidColor.slice(5, 7), 16));
  pdf.roundedRect(margin, yPos - 4, pageWidth - (margin * 2), 18, 3, 3, 'F');

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'italic');
  const ruleLines = pdf.splitTextToSize(`"${displayRuleOfGold}"`, pageWidth - (margin * 2) - 10);
  pdf.text(ruleLines, margin + 5, yPos + 4);
  yPos += 24;

  // Key Metrics
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text(t('countryDetail.keyMetrics', 'Key Metrics'), margin, yPos);
  yPos += 10;

  const metrics = [
    { label: t('countryDetail.snapshot.gdpPerCapita', 'GDP/Capita'), value: `$${country.snapshot.gdpPerCapita.toLocaleString()}` },
    { label: t('countryDetail.snapshot.population', 'Population'), value: formatPopulation(country.snapshot.population) },
    { label: t('countryDetail.snapshot.passportRank', 'Passport Rank'), value: `#${country.snapshot.passportRank}` },
    { label: t('countryDetail.snapshot.corruptionIndex', 'Corruption'), value: `${country.snapshot.corruptionIndex}/100` },
    { label: t('countryDetail.snapshot.freedomIndex', 'Freedom'), value: `${country.snapshot.freedomIndex}/100` },
  ];

  const metricWidth = (pageWidth - (margin * 2)) / 5;
  metrics.forEach((metric, i) => {
    const x = margin + (i * metricWidth);
    pdf.setFillColor(241, 245, 249);
    pdf.roundedRect(x, yPos - 4, metricWidth - 2, 20, 2, 2, 'F');
    
    pdf.setFontSize(8);
    pdf.setTextColor(100, 116, 139);
    pdf.text(metric.label, x + 3, yPos + 2);
    
    pdf.setFontSize(11);
    pdf.setTextColor(15, 23, 42);
    pdf.setFont('helvetica', 'bold');
    pdf.text(metric.value, x + 3, yPos + 11);
    pdf.setFont('helvetica', 'normal');
  });
  yPos += 28;

  // Risks Section
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text(t('countryDetail.riskAssessment', 'Risk Assessment'), margin, yPos);
  yPos += 10;

  const risks = [
    { label: t('risks.political', 'Political'), value: country.risks.political },
    { label: t('risks.economic', 'Economic'), value: country.risks.economic },
    { label: t('risks.social', 'Social'), value: country.risks.social },
    { label: t('risks.administrative', 'Administrative'), value: country.risks.administrative },
  ];

  risks.forEach((risk, i) => {
    const barWidth = pageWidth - (margin * 2) - 50;
    const filledWidth = (risk.value / 100) * barWidth;
    
    pdf.setFontSize(9);
    pdf.setTextColor(71, 85, 105);
    pdf.text(risk.label, margin, yPos + 4);
    
    // Background bar
    pdf.setFillColor(226, 232, 240);
    pdf.roundedRect(margin + 45, yPos, barWidth, 6, 1, 1, 'F');
    
    // Filled bar
    const riskColor = risk.value > 70 ? '#ef4444' : risk.value > 40 ? '#f59e0b' : '#22c55e';
    pdf.setFillColor(parseInt(riskColor.slice(1, 3), 16), parseInt(riskColor.slice(3, 5), 16), parseInt(riskColor.slice(5, 7), 16));
    pdf.roundedRect(margin + 45, yPos, filledWidth, 6, 1, 1, 'F');
    
    pdf.text(`${risk.value}%`, margin + 48 + barWidth, yPos + 4);
    yPos += 10;
  });
  yPos += 8;

  // Who Wins / Who Loses
  const colWidth = (pageWidth - (margin * 2) - 10) / 2;
  
  // Who Wins
  pdf.setFillColor(220, 252, 231);
  pdf.roundedRect(margin, yPos - 4, colWidth, 50, 3, 3, 'F');
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(22, 101, 52);
  pdf.text(t('countryDetail.whoWins', 'Who Wins'), margin + 5, yPos + 4);
  
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(21, 128, 61);
  displayWhoWins.slice(0, 4).forEach((item, i) => {
    const truncated = item.length > 35 ? item.substring(0, 35) + '...' : item;
    pdf.text(`• ${truncated}`, margin + 5, yPos + 14 + (i * 8));
  });
  
  // Who Loses
  pdf.setFillColor(254, 226, 226);
  pdf.roundedRect(margin + colWidth + 10, yPos - 4, colWidth, 50, 3, 3, 'F');
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(153, 27, 27);
  pdf.text(t('countryDetail.whoLoses', 'Who Loses'), margin + colWidth + 15, yPos + 4);
  
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(185, 28, 28);
  displayWhoLoses.slice(0, 4).forEach((item, i) => {
    const truncated = item.length > 35 ? item.substring(0, 35) + '...' : item;
    pdf.text(`• ${truncated}`, margin + colWidth + 15, yPos + 14 + (i * 8));
  });
  yPos += 58;

  // LGBTQ+ Rights
  if (country.lgbtqRights) {
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text(t('countryDetail.lgbtqRights', 'LGBTQ+ Rights'), margin, yPos);
    yPos += 10;

    const lgbtqScore = country.lgbtqRights.score;
    const scoreColor = lgbtqScore >= 70 ? '#22c55e' : lgbtqScore >= 40 ? '#f59e0b' : '#ef4444';
    
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(parseInt(scoreColor.slice(1, 3), 16), parseInt(scoreColor.slice(3, 5), 16), parseInt(scoreColor.slice(5, 7), 16));
    pdf.text(`${lgbtqScore}/100`, margin, yPos + 8);
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(71, 85, 105);
    
    const rights = [];
    if (country.lgbtqRights.marriage) rights.push('Marriage ✓');
    if (country.lgbtqRights.civilUnion) rights.push('Civil Union ✓');
    if (country.lgbtqRights.adoption) rights.push('Adoption ✓');
    if (country.lgbtqRights.discrimination) rights.push('Anti-Discrimination ✓');
    
    pdf.text(rights.join(' • '), margin + 35, yPos + 3);
    yPos += 18;
  }

  // Footer
  pdf.setFillColor(241, 245, 249);
  pdf.rect(0, pageHeight - 15, pageWidth, 15, 'F');
  
  pdf.setFontSize(8);
  pdf.setTextColor(100, 116, 139);
  pdf.text(`System Compass • ${t('countryDetail.lastUpdated', 'Last updated')}: ${country.lastUpdated}`, margin, pageHeight - 6);
  pdf.text(`Page 1`, pageWidth - margin - 10, pageHeight - 6);

  // Save PDF
  pdf.save(`${country.id}-country-profile.pdf`);
}

export async function exportElementToPDF(elementId: string, filename: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found:', elementId);
    return;
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  const imgWidth = pageWidth - 20;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
  pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, Math.min(imgHeight, pageHeight - 20));
  pdf.save(filename);
}
