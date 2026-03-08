import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle2, XCircle } from 'lucide-react';
import { HealthcareCountryData } from '@/hooks/useHealthcareData';

interface Props {
  data: HealthcareCountryData;
}

const LEVEL_LABELS: Record<string, string> = {
  national: 'National',
  cantonal: 'Cantonal',
  departmental: 'Départemental',
  state: 'État / Land',
};

export function HealthcareLicensingCard({ data }: Props) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="w-5 h-5 text-primary" />
          {t('healthcare.licensing.title', 'Autorisation d\'exercer')}
        </CardTitle>
        {data.licensing_authority_name && (
          <p className="text-sm text-muted-foreground">
            {data.licensing_authority_name}
            {data.licensing_authority_level && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {LEVEL_LABELS[data.licensing_authority_level] || data.licensing_authority_level}
              </Badge>
            )}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Requirements */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">{t('healthcare.licensing.requirements', 'Conditions requises')}</h4>
          <ul className="space-y-1.5">
            {data.licensing_requirements.map((req, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                {req.mandatory ? (
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                )}
                <span>{req.requirement}</span>
                {req.mandatory && (
                  <Badge variant="destructive" className="text-[9px] ml-auto shrink-0">
                    {t('common.mandatory', 'Obligatoire')}
                  </Badge>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Insurance */}
        <div className="rounded-lg border p-3 space-y-2">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-500" />
            {t('healthcare.licensing.insurance', 'Assurance RC professionnelle')}
          </h4>
          <div className="flex items-center gap-2">
            <Badge variant={data.insurance_mandatory ? 'destructive' : 'secondary'}>
              {data.insurance_mandatory 
                ? t('healthcare.licensing.insuranceMandatory', 'Obligatoire')
                : t('healthcare.licensing.insuranceOptional', 'Facultative')}
            </Badge>
            {data.insurance_min_coverage_eur && (
              <span className="text-sm text-muted-foreground">
                Min. {(data.insurance_min_coverage_eur / 1000000).toFixed(1)}M€
              </span>
            )}
          </div>
          {data.insurance_notes && (
            <p className="text-xs text-muted-foreground">{data.insurance_notes}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
