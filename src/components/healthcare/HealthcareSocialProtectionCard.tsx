import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Coins, Handshake } from 'lucide-react';
import { HealthcareCountryData } from '@/hooks/useHealthcareData';

interface Props {
  data: HealthcareCountryData;
}

export function HealthcareSocialProtectionCard({ data }: Props) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Heart className="w-5 h-5 text-primary" />
          {t('healthcare.social.title', 'Protection sociale')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Health insurance */}
        {data.health_insurance_system && (
          <div className="rounded-lg bg-muted/50 p-3 space-y-1">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" />
              {t('healthcare.social.healthInsurance', 'Assurance maladie')}
            </h4>
            <p className="text-sm text-muted-foreground">{data.health_insurance_system}</p>
          </div>
        )}

        {/* Social protection system */}
        {data.social_protection_system && (
          <div className="rounded-lg bg-muted/50 p-3 space-y-1">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-500" />
              {t('healthcare.social.system', 'Système social')}
            </h4>
            <p className="text-sm text-muted-foreground">{data.social_protection_system}</p>
          </div>
        )}

        {/* Pension system */}
        {data.pension_system && (
          <div className="rounded-lg border p-3 space-y-2">
            <h4 className="text-sm font-semibold">{t('healthcare.social.pension', 'Système de retraite')}</h4>
            <div className="space-y-1.5">
              {Object.entries(data.pension_system).map(([key, value]) => (
                <div key={key} className="flex items-start gap-2 text-sm">
                  <Badge variant="outline" className="text-[9px] shrink-0 mt-0.5">{key}</Badge>
                  <span className="text-muted-foreground">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cross-border agreements */}
        {data.cross_border_agreements.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Handshake className="w-4 h-4 text-primary" />
              {t('healthcare.social.agreements', 'Accords bilatéraux')}
            </h4>
            <div className="space-y-1.5">
              {data.cross_border_agreements.map((a, i) => (
                <div key={i} className="flex items-center gap-2 text-sm rounded-lg bg-muted/30 px-3 py-2">
                  <span className="font-medium">{a.country}</span>
                  <Badge variant="secondary" className="text-[9px]">{a.type}</Badge>
                  <span className="text-xs text-muted-foreground ml-auto">{a.details}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
