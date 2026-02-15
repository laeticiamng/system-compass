/**
 * Fiscal Details Step - Step 4 of the fiscal calculator wizard
 */
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, ExternalLink, FileText, Users, Info, Clock } from 'lucide-react';
import { toast } from 'sonner';

import { useFiscalRulesMultiple, useSpecialRegimesMultiple } from '@/hooks/useFiscalData';
import { calculateCountryTax, formatCurrency, formatPercent, DEFAULT_TAX_RULES, type TaxProfile, type TaxCalculationResult } from '@/lib/fiscalEngine';
import { SimulationDisclaimer } from '@/components/SimulationDisclaimer';

interface FiscalDetailsStepProps {
  profile: TaxProfile;
  selectedCountries: string[];
}

export function FiscalDetailsStep({ profile, selectedCountries }: FiscalDetailsStepProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.split('-')[0] || 'fr';
  
  // Fetch country names
  const { data: countries } = useQuery({
    queryKey: ['countries-names', selectedCountries],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('countries')
        .select('id, name, iso2')
        .in('id', selectedCountries);
      
      if (error) throw error;
      return data;
    },
    enabled: selectedCountries.length > 0,
  });
  
  // Fetch fiscal rules
  const { data: rulesMap } = useFiscalRulesMultiple(selectedCountries);
  
  // Fetch special regimes
  const { data: regimesMap } = useSpecialRegimesMultiple(selectedCountries);
  
  // Calculate results for each country
  const results = useMemo(() => {
    if (!countries || !rulesMap) return [];
    
    const calculations: TaxCalculationResult[] = [];
    
    for (const country of countries) {
      let rules = rulesMap[country.id] || [];
      
      if (rules.length === 0 && DEFAULT_TAX_RULES[country.id]) {
        const defaultRule = DEFAULT_TAX_RULES[country.id];
        rules = [
          {
            id: 'default-income',
            country_id: country.id,
            rule_type: 'income_tax',
            brackets: defaultRule.incomeTax,
            deductions: {},
            currency: country.id === 'switzerland' ? 'CHF' : 'EUR',
            notes_i18n: {},
            source_url: null,
            valid_from: new Date().toISOString(),
            valid_to: null,
          },
          {
            id: 'default-social',
            country_id: country.id,
            rule_type: 'social_contributions',
            brackets: [{ min: 0, max: null, rate: defaultRule.socialRate }],
            deductions: {},
            currency: country.id === 'switzerland' ? 'CHF' : 'EUR',
            notes_i18n: {},
            source_url: null,
            valid_from: new Date().toISOString(),
            valid_to: null,
          },
        ];
      }
      
      const result = calculateCountryTax(profile, rules, country.id, country.name);
      result.hasSpecialRegimes = (regimesMap?.[country.id]?.length || 0) > 0;
      calculations.push(result);
    }
    
    return calculations.sort((a, b) => a.effectiveRate - b.effectiveRate);
  }, [countries, rulesMap, regimesMap, profile]);
  
  const handleExportPDF = () => {
    if (results.length === 0) {
      toast.error(t('fiscal.export.noData', 'Aucune donnée à exporter'));
      return;
    }

    toast.info(t('fiscal.export.preparing', 'Préparation du PDF...'));

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    const lineHeight = 6;

    let y = margin;

    const ensureSpace = (requiredHeight: number) => {
      if (y + requiredHeight > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
    };

    doc.setFontSize(16);
    doc.text(t('fiscal.export.reportTitle', 'Rapport fiscal détaillé'), margin, y);
    y += lineHeight;

    doc.setFontSize(10);
    doc.setTextColor(90, 90, 90);
    doc.text(
      `${t('fiscal.export.generatedOn', 'Généré le')} ${format(new Date(), 'yyyy-MM-dd HH:mm')}`,
      margin,
      y,
    );
    y += lineHeight + 2;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.text(t('fiscal.export.profileTitle', 'Profil simulé'), margin, y);
    y += lineHeight;
    doc.setFontSize(10);

    const profileLines = [
      `${t('fiscal.profile.gross', 'Revenu brut')}: ${formatCurrency(profile.grossIncome, 'EUR')}`,
      `${t('fiscal.profile.familyStatus', 'Statut familial')}: ${profile.familyStatus}`,
      `${t('fiscal.profile.children', 'Enfants')}: ${profile.children}`,
      `${t('fiscal.profile.socialStatus', 'Statut social')}: ${profile.socialStatus}`,
    ];

    for (const line of profileLines) {
      ensureSpace(lineHeight);
      doc.text(line, margin, y);
      y += lineHeight;
    }

    y += 2;

    for (const [index, result] of results.entries()) {
      ensureSpace(40);

      doc.setDrawColor(220, 220, 220);
      doc.roundedRect(margin, y - 4, pageWidth - margin * 2, 34, 2, 2);

      doc.setFontSize(12);
      doc.text(`${index + 1}. ${result.countryName}`, margin + 2, y + 2);
      y += lineHeight + 1;

      doc.setFontSize(10);
      const detailLines = [
        `${t('fiscal.details.effectiveRate', 'Taux effectif')}: ${formatPercent(result.effectiveRate)}`,
        `${t('fiscal.details.netResult', 'Net')}: ${formatCurrency(result.netIncome, result.currency)}`,
        `${t('fiscal.details.incomeTax', 'Impôt revenu')}: -${formatCurrency(result.incomeTax, result.currency)}`,
        `${t('fiscal.details.social', 'Cotisations')}: -${formatCurrency(result.socialContributions, result.currency)}`,
      ];

      for (const line of detailLines) {
        doc.text(line, margin + 2, y + 2);
        y += lineHeight;
      }

      if (result.hasSpecialRegimes) {
        doc.setTextColor(59, 130, 246);
        doc.text(t('fiscal.details.hasSpecialRegimes', 'Régimes spéciaux disponibles'), margin + 2, y + 2);
        doc.setTextColor(0, 0, 0);
        y += lineHeight;
      }

      y += 4;
    }

    const fileName = `fiscal-details-${lang}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    doc.save(fileName);
    toast.success(t('fiscal.export.success', 'PDF généré avec succès'));
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold mb-2">
            {t('fiscal.details.title', 'Détail des calculs')}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t('fiscal.details.subtitle', 'Analyse tranche par tranche pour chaque pays')}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={handleExportPDF}>
            <Download className="w-4 h-4 mr-2" />
            {t('fiscal.export.pdf', 'Exporter en PDF')}
          </Button>
        </div>
      </div>
      
      {/* Detailed breakdown per country */}
      <Accordion type="multiple" className="space-y-3">
        {results.map((result, index) => (
          <AccordionItem
            key={result.countryId}
            value={result.countryId}
            className="border rounded-lg overflow-hidden"
          >
            <AccordionTrigger className="px-4 hover:no-underline">
              <div className="flex items-center gap-3 w-full">
                <span className="text-2xl font-bold text-muted-foreground">{index + 1}</span>
                <div className="flex-1 text-left">
                  <p className="font-semibold">{result.countryName}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('fiscal.details.effectiveRate', 'Taux effectif')}: {formatPercent(result.effectiveRate)}
                  </p>
                </div>
                <div className="text-right mr-4">
                  <p className="font-bold text-primary">{formatCurrency(result.netIncome, result.currency)}</p>
                  <p className="text-xs text-muted-foreground">{t('fiscal.details.net', 'net/an')}</p>
                </div>
              </div>
            </AccordionTrigger>
            
            <AccordionContent className="px-4 pb-4">
              {/* Income tax brackets */}
              {result.incomeTaxBrackets.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    {t('fiscal.details.incomeTaxBrackets', 'Tranches d\'impôt sur le revenu')}
                  </h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('fiscal.details.bracket', 'Tranche')}</TableHead>
                        <TableHead className="text-right">{t('fiscal.details.rate', 'Taux')}</TableHead>
                        <TableHead className="text-right">{t('fiscal.details.taxable', 'Imposable')}</TableHead>
                        <TableHead className="text-right">{t('fiscal.details.tax', 'Impôt')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.incomeTaxBrackets
                        .filter(b => b.taxableInBracket > 0)
                        .map((bracket, i) => (
                          <TableRow key={i}>
                            <TableCell>
                              {formatCurrency(bracket.min, result.currency)} - {bracket.max ? formatCurrency(bracket.max, result.currency) : '∞'}
                            </TableCell>
                            <TableCell className="text-right">{formatPercent(bracket.rate * 100)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(bracket.taxableInBracket, result.currency)}</TableCell>
                            <TableCell className="text-right font-medium">{formatCurrency(bracket.taxForBracket, result.currency)}</TableCell>
                          </TableRow>
                        ))}
                      <TableRow className="font-semibold">
                        <TableCell colSpan={3}>{t('fiscal.details.totalIncomeTax', 'Total IR')}</TableCell>
                        <TableCell className="text-right">{formatCurrency(result.incomeTax, result.currency)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}
              
              {/* Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">{t('fiscal.details.gross', 'Revenu brut')}</p>
                  <p className="font-semibold">{formatCurrency(result.grossIncome, result.currency)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('fiscal.details.incomeTax', 'Impôt revenu')}</p>
                  <p className="font-semibold text-destructive">-{formatCurrency(result.incomeTax, result.currency)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('fiscal.details.social', 'Cotisations')}</p>
                  <p className="font-semibold text-destructive">-{formatCurrency(result.socialContributions, result.currency)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('fiscal.details.netResult', 'Net')}</p>
                  <p className="font-bold text-primary">{formatCurrency(result.netIncome, result.currency)}</p>
                </div>
              </div>
              
              {/* Special regimes */}
              {regimesMap && regimesMap[result.countryId] && regimesMap[result.countryId].length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4 text-primary" />
                    {t('fiscal.details.specialRegimes', 'Régimes fiscaux spéciaux disponibles')}
                  </h4>
                  <div className="space-y-2">
                    {regimesMap[result.countryId].map(regime => (
                      <Card key={regime.id} className="bg-primary/5 border-primary/20">
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium">{regime.regime_name}</p>
                              <p className="text-sm text-muted-foreground">
                                {regime.description_i18n[lang] || regime.description_i18n['fr'] || regime.description_i18n['en']}
                              </p>
                              {regime.duration_years && (
                                <Badge variant="outline" className="mt-2">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {regime.duration_years} {t('fiscal.details.years', 'ans')}
                                </Badge>
                              )}
                            </div>
                            {regime.source_url && (
                              <Button variant="ghost" size="sm" asChild>
                                <a href={regime.source_url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      
      {/* Actions */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div>
              <h4 className="font-medium">{t('fiscal.details.needHelp', 'Besoin d\'un accompagnement personnalisé ?')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('fiscal.details.expertHelp', 'Consultez un expert fiscal pour optimiser votre situation')}
              </p>
            </div>
            <Button variant="secondary">
              <Users className="w-4 h-4 mr-2" />
              {t('fiscal.details.consultExpert', 'Consulter un expert')}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Prominent disclaimer */}
      <SimulationDisclaimer variant="prominent" />
    </div>
  );
}
