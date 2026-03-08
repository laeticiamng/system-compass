import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GraduationCap, ExternalLink, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { HealthcareCountryData } from '@/hooks/useHealthcareData';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Props {
  data: HealthcareCountryData;
}

export function HealthcareDiplomaCard({ data }: Props) {
  const { t } = useTranslation();
  const verifiedAgo = formatDistanceToNow(new Date(data.last_verified_at), { addSuffix: true, locale: fr });

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <GraduationCap className="w-5 h-5 text-primary" />
            {t('healthcare.diploma.title', 'Reconnaissance du diplôme')}
          </CardTitle>
          <Badge variant="outline" className="text-xs gap-1">
            <CheckCircle2 className="w-3 h-3" />
            {t('healthcare.verified', 'Vérifié')} {verifiedAgo}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {data.diploma_authority_name}
          {data.diploma_authority_acronym && (
            <span className="font-semibold text-foreground"> ({data.diploma_authority_acronym})</span>
          )}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-muted/50 p-3 text-center">
            <Clock className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-xl font-bold text-primary">{data.diploma_recognition_duration_months || '?'}</p>
            <p className="text-[10px] text-muted-foreground">{t('healthcare.diploma.months', 'mois estimés')}</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3 text-center">
            <AlertCircle className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-xl font-bold text-primary">{data.diploma_recognition_cost_eur ? `${data.diploma_recognition_cost_eur}€` : '—'}</p>
            <p className="text-[10px] text-muted-foreground">{t('healthcare.diploma.cost', 'coût estimé')}</p>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">{t('healthcare.diploma.steps', 'Étapes de reconnaissance')}</h4>
          <ol className="space-y-2">
            {data.diploma_recognition_steps.map((step) => (
              <li key={step.order} className="flex gap-3 text-sm">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                  {step.order}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{step.title}</p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                  {step.estimated_days > 0 && (
                    <p className="text-[10px] text-primary mt-0.5">
                      ≈ {step.estimated_days} {t('common.days', 'jours')}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Language requirements */}
        {data.language_requirements && (
          <div className="rounded-lg border p-3 space-y-1">
            <h4 className="text-sm font-semibold">{t('healthcare.diploma.language', 'Exigences linguistiques')}</h4>
            <p className="text-sm">
              {t('healthcare.diploma.level', 'Niveau requis')}: <span className="font-semibold text-primary">{data.language_requirements.level}</span>
            </p>
            <div className="flex gap-1.5">
              {data.language_requirements.languages.map(lang => (
                <Badge key={lang} variant="secondary" className="text-xs">{lang.toUpperCase()}</Badge>
              ))}
            </div>
            {data.language_requirements.notes && (
              <p className="text-xs text-muted-foreground italic">{data.language_requirements.notes}</p>
            )}
          </div>
        )}

        {/* Source link */}
        {data.diploma_recognition_url && (
          <Button variant="outline" size="sm" className="w-full gap-2" asChild>
            <a href={data.diploma_recognition_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-3.5 h-3.5" />
              {t('healthcare.diploma.officialSite', 'Site officiel')} — {data.diploma_authority_acronym || data.diploma_authority_name}
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
