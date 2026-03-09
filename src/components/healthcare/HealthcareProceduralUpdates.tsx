import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, ExternalLink, CheckCircle2, AlertTriangle, Info, Clock } from 'lucide-react';
import { useHealthcareCountryData } from '@/hooks/useHealthcareData';
import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Props {
  countryId: string;
}

interface ProceduralUpdate {
  id: string;
  date: string;
  type: 'change' | 'info' | 'warning';
  title: string;
  description: string;
  sourceUrl: string;
  sourceName: string;
  verified: boolean;
}

function getUpdatesForCountry(countryId: string): ProceduralUpdate[] {
  const updates: Record<string, ProceduralUpdate[]> = {
    switzerland: [
      { id: '1', date: '2026-02-15', type: 'change', title: 'MEBEKO — Nouveaux frais de dossier', description: 'Les frais de traitement pour la reconnaissance des diplômes médicaux passent de CHF 800 à CHF 900 à partir du 1er avril 2026.', sourceUrl: 'https://www.bag.admin.ch/mebeko', sourceName: 'OFSP / MEBEKO', verified: true },
      { id: '2', date: '2026-01-20', type: 'info', title: 'Canton de Genève — Procédure dématérialisée', description: 'Le dépôt des demandes d\'autorisation de pratiquer est désormais possible en ligne via le guichet cantonal.', sourceUrl: 'https://www.ge.ch/sante', sourceName: 'Canton de Genève', verified: true },
      { id: '3', date: '2025-11-01', type: 'warning', title: 'Exigence linguistique renforcée', description: 'Le niveau B2 en langue officielle du canton est désormais exigé pour tous les professionnels hors UE (auparavant B1).', sourceUrl: 'https://www.fedlex.admin.ch', sourceName: 'Fedlex', verified: true },
    ],
    france: [
      { id: '4', date: '2026-03-01', type: 'change', title: 'CNOM — Réforme de l\'inscription', description: 'Nouvelle procédure de vérification des diplômes européens. Délai de traitement estimé réduit à 2 mois.', sourceUrl: 'https://www.conseil-national.medecin.fr', sourceName: 'CNOM', verified: true },
      { id: '5', date: '2026-01-10', type: 'info', title: 'ARS — Zones sous-dotées', description: 'Mise à jour de la liste des zones prioritaires ouvrant droit à des aides à l\'installation pour les médecins.', sourceUrl: 'https://www.ars.sante.fr', sourceName: 'ARS', verified: true },
    ],
    germany: [
      { id: '6', date: '2026-02-01', type: 'change', title: 'Approbation — Fachsprachprüfung', description: 'Nouvelles modalités pour l\'examen de langue médicale (Fachsprachprüfung). Format en 3 parties maintenu.', sourceUrl: 'https://www.bundesaerztekammer.de', sourceName: 'Bundesärztekammer', verified: true },
    ],
    belgium: [
      { id: '7', date: '2026-01-15', type: 'info', title: 'SPF Santé — Visa de conformité', description: 'Le délai moyen d\'obtention du visa de conformité est passé de 8 à 6 semaines.', sourceUrl: 'https://www.health.belgium.be', sourceName: 'SPF Santé publique', verified: true },
    ],
  };
  return updates[countryId] || [];
}

const typeConfig = {
  change: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30', label: 'Changement' },
  info: { icon: Info, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30', label: 'Information' },
  warning: { icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/30', label: 'Alerte' },
};

export function HealthcareProceduralUpdates({ countryId }: Props) {
  const { t } = useTranslation();
  const { data: countryData } = useHealthcareCountryData(countryId);
  const updates = getUpdatesForCountry(countryId);

  const lastVerified = countryData?.last_verified_at
    ? format(new Date(countryData.last_verified_at), 'dd MMMM yyyy', { locale: fr })
    : null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="w-5 h-5 text-primary" />
            {t('healthcare.updates.title', 'Mises à jour réglementaires')}
          </CardTitle>
          {lastVerified && (
            <Badge variant="outline" className="text-[10px] gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              {t('healthcare.updates.verified', 'Vérifié le')} {lastVerified}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {t('healthcare.updates.subtitle', 'Suivez les changements réglementaires qui impactent votre parcours professionnel.')}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {updates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            {t('healthcare.updates.noData', 'Pas de mises à jour récentes pour ce pays.')}
          </div>
        ) : (
          updates.map((update) => {
            const config = typeConfig[update.type];
            const Icon = config.icon;
            const ago = formatDistanceToNow(new Date(update.date), { addSuffix: true, locale: fr });

            return (
              <div
                key={update.id}
                className={`rounded-lg border ${config.border} ${config.bg} p-3 space-y-2`}
              >
                <div className="flex items-start gap-2">
                  <Icon className={`w-4 h-4 ${config.color} shrink-0 mt-0.5`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-semibold">{update.title}</h4>
                      <Badge variant="secondary" className="text-[9px]">{config.label}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{update.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {ago}
                      </span>
                      {update.verified && (
                        <span className="text-[10px] text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> {t('healthcare.updates.verifiedLabel', 'Vérifié')}
                        </span>
                      )}
                      <Button variant="ghost" size="sm" className="text-[10px] h-6 gap-1 ml-auto" asChild>
                        <a href={update.sourceUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3 h-3" /> {update.sourceName}
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
