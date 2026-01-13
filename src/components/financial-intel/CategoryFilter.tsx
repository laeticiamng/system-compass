import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string | null;
  onSelect: (category: string | null) => void;
  type: 'scam' | 'legit';
}

const scamCategoryLabels: Record<string, string> = {
  ponzi: 'Ponzi',
  fake_broker: 'Faux courtier',
  advance_fee: 'Avance de frais',
  pyramid: 'Pyramide',
  crypto_scam: 'Arnaque crypto',
  loan_fraud: 'Fraude prêt',
  real_estate_fraud: 'Fraude immobilière',
};

const legitCategoryLabels: Record<string, string> = {
  savings: 'Épargne',
  bonds: 'Obligations',
  funds: 'Fonds/ETF',
  retirement: 'Retraite',
  insurance: 'Assurance',
  micro_savings: 'Micro-épargne',
  real_estate: 'Immobilier',
};

export function CategoryFilter({ categories, selectedCategory, onSelect, type }: CategoryFilterProps) {
  const { t } = useTranslation();
  const labels = type === 'scam' ? scamCategoryLabels : legitCategoryLabels;
  
  const uniqueCategories = [...new Set(categories)];

  if (uniqueCategories.length <= 1) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 py-2">
      <span className="text-xs text-muted-foreground">
        {t('financialIntel.filterByCategory', 'Filtrer par catégorie:')}
      </span>
      
      {selectedCategory && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 gap-1 text-xs"
          onClick={() => onSelect(null)}
        >
          <X className="h-3 w-3" />
          {t('common.clearFilter', 'Effacer')}
        </Button>
      )}
      
      {uniqueCategories.map((category) => (
        <Badge
          key={category}
          variant={selectedCategory === category ? 'default' : 'outline'}
          className={`cursor-pointer text-xs transition-colors ${
            selectedCategory === category 
              ? type === 'scam' ? 'bg-destructive' : 'bg-primary'
              : 'hover:bg-muted'
          }`}
          onClick={() => onSelect(selectedCategory === category ? null : category)}
        >
          {labels[category] || category}
        </Badge>
      ))}
    </div>
  );
}
