/**
 * Convention Warning Component - Shows bilateral tax treaty status
 */
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { FileCheck, AlertTriangle, Info } from 'lucide-react';

interface ConventionWarningProps {
  originCountryId: string;
  destinationCountryId: string;
}

export function ConventionWarning({ originCountryId, destinationCountryId }: ConventionWarningProps) {
  const { t } = useTranslation();
  
  // Fetch convention between the two countries
  const { data: conventions, isLoading } = useQuery({
    queryKey: ['fiscal-convention', originCountryId, destinationCountryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fiscal_conventions')
        .select('*')
        .or(`and(country_a_id.eq.${originCountryId},country_b_id.eq.${destinationCountryId}),and(country_a_id.eq.${destinationCountryId},country_b_id.eq.${originCountryId})`);
      
      if (error) throw error;
      return data;
    },
    enabled: !!originCountryId && !!destinationCountryId && originCountryId !== destinationCountryId,
  });
  
  if (isLoading || !originCountryId || !destinationCountryId || originCountryId === destinationCountryId) {
    return null;
  }
  
  const hasConvention = conventions && conventions.length > 0;
  const convention = conventions?.[0];
  
  if (hasConvention && convention) {
    const conventionTypeLabels: Record<string, string> = {
      'exemption': t('fiscal.convention.exemption', 'Exonération'),
      'credit': t('fiscal.convention.credit', 'Crédit d\'impôt'),
      'deduction': t('fiscal.convention.deduction', 'Déduction'),
    };
    
    return (
      <Alert className="bg-emerald-500/10 border-emerald-500/30">
        <FileCheck className="h-4 w-4 text-emerald-600" />
        <AlertTitle className="text-emerald-700">
          {t('fiscal.convention.exists', 'Convention fiscale bilatérale')}
        </AlertTitle>
        <AlertDescription className="text-emerald-600">
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="border-emerald-500/50 text-emerald-700">
              {conventionTypeLabels[convention.convention_type] || convention.convention_type}
            </Badge>
            <span className="text-sm">
              {t('fiscal.convention.appliedMethod', 'Méthode appliquée pour éviter la double imposition')}
            </span>
          </div>
          {convention.applicable_income_types && convention.applicable_income_types.length > 0 && (
            <p className="text-xs mt-2 text-muted-foreground">
              {t('fiscal.convention.appliesTo', 'S\'applique à')}: {convention.applicable_income_types.join(', ')}
            </p>
          )}
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <Alert className="bg-amber-500/10 border-amber-500/30">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-700">
        {t('fiscal.convention.none', 'Pas de convention fiscale')}
      </AlertTitle>
      <AlertDescription className="text-amber-600">
        <p className="text-sm mt-1">
          {t('fiscal.convention.noneDesc', 'Aucune convention bilatérale n\'a été trouvée entre ces deux pays. Risque potentiel de double imposition.')}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <Info className="w-3 h-3" />
          <span className="text-xs">
            {t('fiscal.convention.consultAdvice', 'Consultez un conseiller fiscal pour votre situation spécifique.')}
          </span>
        </div>
      </AlertDescription>
    </Alert>
  );
}
