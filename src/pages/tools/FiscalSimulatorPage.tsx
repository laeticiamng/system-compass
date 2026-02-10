/**
 * Fiscal Simulator Page - Interactive 3-step tax comparison
 * Route: /tools/fiscal-simulator
 *
 * Enhanced version with purchasing power adjustment
 */
import { useTranslation } from 'react-i18next';
import { FiscalCalculatorWizard } from '@/components/fiscal';
import { PremiumPageWrapper } from '@/components/PremiumPageWrapper';
import { Calculator } from 'lucide-react';

export default function FiscalSimulatorPage() {
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
          {t('fiscal.simulatorHeadline', 'Simulateur Fiscal International')}
        </h1>
        <p className="text-muted-foreground">
          {t('fiscal.simulatorSubheadline', 'Comparez votre imposition et pouvoir d\'achat dans jusqu\'à 4 pays')}
        </p>
      </div>
    </div>
  );

  return (
    <PremiumPageWrapper
      title={t('subscription.fiscalSimulatorTitle', 'Simulateur Fiscal')}
      description={t('subscription.fiscalSimulatorDesc', 'Simulez votre imposition dans différents pays, avec ajustement du pouvoir d\'achat.')}
      previewContent={previewContent}
    >
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {t('fiscal.simulatorHeadline', 'Simulateur Fiscal International')}
          </h1>
          <p className="text-muted-foreground">
            {t('fiscal.simulatorSubheadline', 'Comparez votre imposition et pouvoir d\'achat dans jusqu\'à 4 pays')}
          </p>
        </div>

        <FiscalCalculatorWizard />
      </div>
    </PremiumPageWrapper>
  );
}
