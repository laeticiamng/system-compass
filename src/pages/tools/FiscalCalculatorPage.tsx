/**
 * Fiscal Calculator Page - Advanced multi-country tax comparison
 */
import { useTranslation } from 'react-i18next';
import { FiscalCalculatorWizard } from '@/components/fiscal';
import { PremiumPageWrapper } from '@/components/PremiumPageWrapper';
import { Calculator } from 'lucide-react';

export default function FiscalCalculatorPage() {
  const { t } = useTranslation();

  const previewContent = (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="p-4 rounded-full bg-primary/10">
            <Calculator className="w-8 h-8 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-2">
          {t('fiscal.headline', 'Calculateur Fiscal International')}
        </h1>
        <p className="text-muted-foreground">
          {t('fiscal.subheadline', 'Comparez votre imposition dans jusqu\'à 4 pays et identifiez la destination la plus avantageuse')}
        </p>
      </div>
    </div>
  );
  
  return (
    <PremiumPageWrapper
      title={t('subscription.fiscalCalculatorTitle', 'Calculateur Fiscal')}
      description={t('subscription.fiscalCalculatorDesc', 'Simulez votre imposition dans différents pays et optimisez votre fiscalité internationale.')}
      previewContent={previewContent}
    >
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
    </PremiumPageWrapper>
  );
}
