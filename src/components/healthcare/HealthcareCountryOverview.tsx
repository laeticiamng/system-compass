import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/skeleton';
import { useHealthcareCountryData } from '@/hooks/useHealthcareData';
import { HealthcareDiplomaCard } from './HealthcareDiplomaCard';
import { HealthcareLicensingCard } from './HealthcareLicensingCard';
import { HealthcareSocialProtectionCard } from './HealthcareSocialProtectionCard';
import { HealthcareDocumentChecklist } from './HealthcareDocumentChecklist';

interface Props {
  countryId: string;
  countryName: string;
}

export function HealthcareCountryOverview({ countryId, countryName }: Props) {
  const { t } = useTranslation();
  const { data, isLoading } = useHealthcareCountryData(countryId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-sm">{t('healthcare.noData', 'Données santé non disponibles pour ce pays.')}</p>
        <p className="text-xs mt-1">{t('healthcare.noDataSub', 'Les données sont en cours d\'ajout pour ce pays.')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <HealthcareDiplomaCard data={data} />
      <HealthcareLicensingCard data={data} />
      <HealthcareSocialProtectionCard data={data} />
      <HealthcareDocumentChecklist countryId={countryId} countryName={countryName} />
    </div>
  );
}
