/**
 * Fiscal Calculator Page - Advanced multi-country tax comparison
 */
import { useTranslation } from 'react-i18next';
import { FiscalCalculatorWizard } from '@/components/fiscal';

export default function FiscalCalculatorPage() {
  const { t } = useTranslation();
  
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {t('fiscal.headline', 'Calculateur Fiscal International')}
        </h1>
        <p className="text-muted-foreground">
          {t('fiscal.subheadline', 'Comparez votre imposition dans jusqu\'à 4 pays et identifiez la destination la plus avantageuse')}
        </p>
      </div>
      
      <FiscalCalculatorWizard />
    </div>
  );
}
