/**
 * Advanced Fiscal Calculator - 4-step wizard
 */
import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StepIndicator } from '@/components/ui/step-indicator';
import { Calculator, ArrowLeft, ArrowRight, Download, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { FiscalProfileStep } from './wizard/FiscalProfileStep';
import { FiscalCountryStep } from './wizard/FiscalCountryStep';
import { FiscalResultsStep } from './wizard/FiscalResultsStep';
import { FiscalDetailsStep } from './wizard/FiscalDetailsStep';
import { SimulationDisclaimer } from '@/components/SimulationDisclaimer';

import type { TaxProfile } from '@/lib/fiscalEngine';

const WIZARD_STEPS = [
  { id: 'profile', label: 'Profil fiscal' },
  { id: 'countries', label: 'Pays à comparer' },
  { id: 'results', label: 'Résultats' },
  { id: 'details', label: 'Détails & Export' },
];

export function FiscalCalculatorWizard() {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  
  // Profile state
  const [profile, setProfile] = useState<TaxProfile>({
    status: 'single',
    children: 0,
    incomeType: 'salary',
    grossIncome: 50000,
    netWealth: undefined,
  });
  
  // Selected countries
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  
  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 0:
        return profile.grossIncome > 0;
      case 1:
        return selectedCountries.length >= 2;
      case 2:
      case 3:
        return true;
      default:
        return false;
    }
  }, [currentStep, profile, selectedCountries]);
  
  const handleNext = () => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleStepClick = (stepIndex: number) => {
    // Only allow going back or to already completed steps
    if (stepIndex < currentStep) {
      setCurrentStep(stepIndex);
    }
  };
  
  return (
    <Card className="glass-card overflow-hidden">
      <CardHeader className="border-b border-border/50">
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" />
          {t('fiscal.advancedCalculator', 'Calculateur fiscal avancé')}
        </CardTitle>
        
        <div className="mt-4">
          <StepIndicator
            steps={WIZARD_STEPS}
            currentStep={currentStep}
            completedSteps={Array.from({ length: currentStep }, (_, i) => i)}
            size="sm"
            onStepClick={handleStepClick}
          />
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {currentStep === 0 && (
              <FiscalProfileStep
                profile={profile}
                onChange={setProfile}
              />
            )}
            
            {currentStep === 1 && (
              <FiscalCountryStep
                selectedCountries={selectedCountries}
                onSelectionChange={setSelectedCountries}
              />
            )}
            
            {currentStep === 2 && (
              <FiscalResultsStep
                profile={profile}
                selectedCountries={selectedCountries}
              />
            )}
            
            {currentStep === 3 && (
              <FiscalDetailsStep
                profile={profile}
                selectedCountries={selectedCountries}
              />
            )}
          </motion.div>
        </AnimatePresence>
        
        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-border/50">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.previous', 'Précédent')}
          </Button>
          
          {currentStep < WIZARD_STEPS.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed}
            >
              {t('common.next', 'Suivant')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                {t('fiscal.exportPDF', 'Exporter en PDF')}
              </Button>
              <Button variant="secondary">
                <Users className="w-4 h-4 mr-2" />
                {t('fiscal.consultExpert', 'Consulter un expert')}
              </Button>
            </div>
          )}
        </div>
        
        {/* Disclaimer always visible */}
        <div className="mt-6">
          <SimulationDisclaimer variant="compact" />
        </div>
      </CardContent>
    </Card>
  );
}
