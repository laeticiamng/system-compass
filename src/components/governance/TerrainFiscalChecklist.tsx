import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Receipt, 
  Building2, 
  User, 
  Globe,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

interface FiscalItem {
  id: string;
  label: string;
  category: 'individual' | 'company' | 'international';
  clarified: boolean;
  critical: boolean;
}

interface TerrainFiscalChecklistProps {
  countryId: string;
  countryName: string;
}

export function TerrainFiscalChecklist({ countryName }: TerrainFiscalChecklistProps) {
  const { t } = useTranslation();

  const fiscalItems: Omit<FiscalItem, 'clarified'>[] = [
    { id: 'tax-residency', label: t('governance.fiscal.item.taxResidency', 'Critères de résidence fiscale'), category: 'individual', critical: true },
    { id: 'income-tax', label: t('governance.fiscal.item.incomeTax', "Barème d'imposition sur le revenu"), category: 'individual', critical: true },
    { id: 'social-charges', label: t('governance.fiscal.item.socialCharges', 'Charges sociales obligatoires'), category: 'individual', critical: true },
    { id: 'wealth-tax', label: t('governance.fiscal.item.wealthTax', 'Impôt sur la fortune (existence/seuils)'), category: 'individual', critical: false },
    { id: 'exit-tax', label: t('governance.fiscal.item.exitTax', 'Exit tax ou taxation de départ'), category: 'individual', critical: false },
    { id: 'corporate-tax', label: t('governance.fiscal.item.corporateTax', 'Impôt sur les sociétés (taux effectif)'), category: 'company', critical: true },
    { id: 'vat', label: t('governance.fiscal.item.vat', 'TVA et règles de facturation'), category: 'company', critical: true },
    { id: 'incentives', label: t('governance.fiscal.item.incentives', 'Régimes incitatifs (zones, secteurs)'), category: 'company', critical: false },
    { id: 'payroll-taxes', label: t('governance.fiscal.item.payrollTaxes', 'Charges employeur'), category: 'company', critical: true },
    { id: 'transfer-pricing', label: t('governance.fiscal.item.transferPricing', 'Règles de prix de transfert'), category: 'company', critical: false },
    { id: 'tax-treaties', label: t('governance.fiscal.item.taxTreaties', "Conventions fiscales avec pays d'origine"), category: 'international', critical: true },
    { id: 'dividends', label: t('governance.fiscal.item.dividends', 'Taxation des dividendes (entrée/sortie)'), category: 'international', critical: false },
    { id: 'cfc-rules', label: t('governance.fiscal.item.cfcRules', 'Règles CFC (sociétés étrangères contrôlées)'), category: 'international', critical: false },
    { id: 'substance', label: t('governance.fiscal.item.substance', 'Exigences de substance économique'), category: 'international', critical: true },
  ];

  const categoryConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    individual: { 
      label: t('governance.fiscal.category.individual', 'Fiscalité personnelle'), 
      icon: <User className="w-4 h-4" />,
      color: 'bg-blue-500/20 text-blue-700 border-blue-500/30'
    },
    company: { 
      label: t('governance.fiscal.category.company', 'Fiscalité entreprise'), 
      icon: <Building2 className="w-4 h-4" />,
      color: 'bg-green-500/20 text-green-700 border-green-500/30'
    },
    international: { 
      label: t('governance.fiscal.category.international', 'Fiscalité internationale'), 
      icon: <Globe className="w-4 h-4" />,
      color: 'bg-purple-500/20 text-purple-700 border-purple-500/30'
    },
  };

  const [items, setItems] = useState<FiscalItem[]>(
    fiscalItems.map(item => ({ ...item, clarified: false }))
  );

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, clarified: !item.clarified } : item
    ));
  };

  const clarifiedCount = items.filter(i => i.clarified).length;
  const criticalClarified = items.filter(i => i.critical && i.clarified).length;
  const criticalTotal = items.filter(i => i.critical).length;
  const progress = Math.round((clarifiedCount / items.length) * 100);

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, FiscalItem[]>);

  return (
    <Card className="border-emerald-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Receipt className="w-5 h-5 text-emerald-600" />
            {t('governance.fiscal.title', 'Fiscalité (checklist)')}
          </CardTitle>
          <div className="text-right">
            <Badge variant="outline" className={progress === 100 ? 'bg-green-500/20 text-green-700' : ''}>
              {clarifiedCount}/{items.length} ({progress}%)
            </Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {t('governance.fiscal.description', 'Points à clarifier avant d\'investir sur')} {countryName}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Critical Status */}
        <div className={`p-3 rounded-lg flex items-center gap-3 ${
          criticalClarified === criticalTotal 
            ? 'bg-green-500/10 border border-green-500/30' 
            : 'bg-amber-500/10 border border-amber-500/30'
        }`}>
          {criticalClarified === criticalTotal ? (
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-600" />
          )}
          <div className="text-sm">
            <span className="font-medium">{t('governance.fiscal.criticalPoints', 'Points critiques')} : </span>
            <span className={criticalClarified === criticalTotal ? 'text-green-700' : 'text-amber-700'}>
              {criticalClarified}/{criticalTotal} {t('governance.fiscal.clarified', 'clarifiés')}
            </span>
          </div>
        </div>

        {/* Categorized Items */}
        {Object.entries(groupedItems).map(([category, categoryItems]) => (
          <div key={category} className="space-y-3">
            <div className="flex items-center gap-2">
              {categoryConfig[category]?.icon}
              <Badge className={categoryConfig[category]?.color}>
                {categoryConfig[category]?.label}
              </Badge>
            </div>
            <div className="space-y-2 ml-6">
              {categoryItems.map(item => (
                <div 
                  key={item.id}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer ${
                    item.clarified ? 'bg-green-500/10' : 'bg-muted/50 hover:bg-muted/80'
                  }`}
                  onClick={() => toggleItem(item.id)}
                >
                  <Checkbox
                    checked={item.clarified}
                    onCheckedChange={() => toggleItem(item.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className={`flex-1 text-sm ${item.clarified ? 'line-through text-muted-foreground' : ''}`}>
                    {item.label}
                  </span>
                  {item.critical && (
                    <Badge variant="outline" className="text-xs bg-red-500/10 text-red-600 border-red-500/30">
                      {t('governance.fiscal.critical', 'Critique')}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Recommendation */}
        <div className="p-4 bg-emerald-500/10 rounded-lg">
          <h4 className="font-medium text-sm mb-2">
            {t('governance.fiscal.recommendation', 'Recommandation')}
          </h4>
          <p className="text-sm text-muted-foreground">
            {t('governance.fiscal.recommendationText', 'Consultez un fiscaliste local avant tout engagement financier significatif. Les règles évoluent et l\'interprétation locale peut différer des textes.')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
