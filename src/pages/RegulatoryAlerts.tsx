/**
 * RegulatoryAlerts - Real-time regulatory alert center
 * F4: Exploits useLiveCountryIntel for live country intelligence alerts
 */

import { useState } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, AlertTriangle, Info, CheckCircle2, Globe, Filter,
  Clock, ExternalLink, ChevronDown, Shield, Zap, TrendingUp,
  Radar, Loader2, Bot
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { cn } from '@/lib/utils';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { useGeopoliticalAlerts } from '@/hooks/useGeopoliticalAlerts';

// Mock regulatory alerts data (would come from useLiveCountryIntel in production)
interface RegulatoryAlert {
  id: string;
  country: string;
  countryCode: string;
  title: string;
  summary: string;
  category: 'visa' | 'tax' | 'safety' | 'healthcare' | 'banking' | 'legal' | 'geopolitics';
  severity: 'info' | 'warning' | 'critical';
  date: string;
  source: string;
  sourceUrl?: string;
  affectsProfiles: string[];
}

const MOCK_ALERTS: RegulatoryAlert[] = [
  // ============ GEOPOLITIQUE — CONFLITS ACTIFS ============
  {
    id: 'geo-1',
    country: 'Ukraine / Russie',
    countryCode: 'UA',
    title: 'Guerre Russie-Ukraine — 3e année de conflit',
    summary: "Le conflit armé se poursuit avec des combats intenses dans l'est et le sud de l'Ukraine. Les sanctions UE/US contre la Russie sont au 14e paquet. Gel d'actifs russes à l'étranger, restrictions bancaires SWIFT maintenues, interdiction d'exportations technologiques. Impact direct sur les expats en Europe de l'Est et les chaînes d'approvisionnement énergétiques.",
    category: 'geopolitics',
    severity: 'critical',
    date: '2026-03-01',
    source: 'Conseil de l\'UE',
    sourceUrl: 'https://www.consilium.europa.eu',
    affectsProfiles: ['entrepreneur', 'investisseur', 'salarié expatrié'],
  },
  {
    id: 'geo-2',
    country: 'Ukraine',
    countryCode: 'UA',
    title: 'Suspension de tous les visas de travail — zone de guerre',
    summary: "L'Ukraine reste classée zone de guerre par tous les pays occidentaux. Les ambassades fonctionnent en mode réduit. Aucun visa de travail n'est délivré. Évacuation recommandée pour tous les ressortissants étrangers. Les visas russes sont devenus très difficiles à obtenir depuis l'UE.",
    category: 'safety',
    severity: 'critical',
    date: '2026-02-28',
    source: 'MAEDI France',
    sourceUrl: 'https://www.diplomatie.gouv.fr',
    affectsProfiles: ['digital-nomad', 'salarié expatrié', 'entrepreneur'],
  },
  {
    id: 'geo-3',
    country: 'Israël / Palestine',
    countryCode: 'IL',
    title: 'Conflit Gaza — Impact sécuritaire régional majeur',
    summary: "Le conflit à Gaza et les tensions au sud-Liban affectent toute la région. Alertes voyage maintenues pour Israël, Liban, Jordanie nord. Perturbations du commerce maritime en Mer Rouge (attaques Houthis). Impact sur les coûts de fret mondial (+30%). Dubai/EAU restent stables mais sous tension régionale.",
    category: 'geopolitics',
    severity: 'critical',
    date: '2026-02-25',
    source: 'ONU / OCHA',
    sourceUrl: 'https://www.unocha.org',
    affectsProfiles: ['entrepreneur', 'investisseur', 'digital-nomad'],
  },
  {
    id: 'geo-4',
    country: 'Liban',
    countryCode: 'LB',
    title: 'Instabilité sécuritaire — Déconseillé sauf raison impérative',
    summary: "Les tensions à la frontière sud avec Israël et la crise économique persistante rendent le Liban très instable. Système bancaire toujours gelé. Dévaluation de la livre libanaise > 98%. Risque de conflit élargi. Évacuation recommandée pour les non-résidents.",
    category: 'safety',
    severity: 'critical',
    date: '2026-02-20',
    source: 'MAEDI France',
    affectsProfiles: ['entrepreneur', 'investisseur', 'retraité'],
  },
  {
    id: 'geo-5',
    country: 'Taïwan',
    countryCode: 'TW',
    title: 'Tensions Chine-Taïwan — Risque d\'escalade militaire',
    summary: "Les exercices militaires chinois autour de Taïwan s'intensifient. Risque de blocus ou d'incident militaire estimé à 15-25% sur 12 mois. Impact potentiel majeur sur les chaînes d'approvisionnement mondiales (semi-conducteurs). Plans d'évacuation recommandés pour les expats en Asie-Pacifique.",
    category: 'geopolitics',
    severity: 'warning',
    date: '2026-02-18',
    source: 'IISS / Pentagon',
    sourceUrl: 'https://www.iiss.org',
    affectsProfiles: ['salarié expatrié', 'entrepreneur', 'investisseur'],
  },
  {
    id: 'geo-6',
    country: 'Sahel (Mali, Burkina, Niger)',
    countryCode: 'ML',
    title: 'Coups d\'État en cascade — Retrait des présences étrangères',
    summary: "Les juntes militaires au Mali, Burkina Faso et Niger ont expulsé les forces françaises et réduit la coopération occidentale. Alliance des États du Sahel (AES) formée. Risque sécuritaire élevé pour les expatriés. Fermeture d'ambassades. Migration vers le partenariat Russie/Wagner.",
    category: 'geopolitics',
    severity: 'critical',
    date: '2026-02-15',
    source: 'ICG',
    sourceUrl: 'https://www.crisisgroup.org',
    affectsProfiles: ['entrepreneur', 'salarié expatrié'],
  },
  {
    id: 'geo-7',
    country: 'Soudan',
    countryCode: 'SD',
    title: 'Guerre civile — Crise humanitaire majeure',
    summary: "Le conflit entre l'armée soudanaise (SAF) et les Forces de Soutien Rapide (RSF) a provoqué la plus grande crise de déplacement au monde (10M+ déplacés). Khartoum largement détruite. Risque de famine. Pays totalement déconseillé. Impact sur le Tchad et l'Égypte (afflux de réfugiés).",
    category: 'safety',
    severity: 'critical',
    date: '2026-02-10',
    source: 'UNHCR',
    sourceUrl: 'https://www.unhcr.org',
    affectsProfiles: ['entrepreneur', 'investisseur'],
  },
  {
    id: 'geo-8',
    country: 'Myanmar',
    countryCode: 'MM',
    title: 'Guerre civile — Effondrement de l\'État',
    summary: "La résistance armée progresse contre la junte militaire. Zones entières hors contrôle gouvernemental. Sanctions UE/US/UK maintenues. Système bancaire dysfonctionnel. Frontières avec Thaïlande et Inde sous tension. Aucun visa de travail possible.",
    category: 'geopolitics',
    severity: 'critical',
    date: '2026-02-05',
    source: 'ICG / ASEAN',
    affectsProfiles: ['entrepreneur', 'digital-nomad'],
  },
  // ============ CONSÉQUENCES ÉCONOMIQUES ============
  {
    id: 'geo-9',
    country: 'Europe (UE)',
    countryCode: 'EU',
    title: 'Coûts énergétiques — Hausse structurelle post-Ukraine',
    summary: "Les prix de l'énergie en Europe restent 40-60% au-dessus des niveaux pré-2022 malgré la diversification. Impact direct sur le coût de la vie et la compétitivité des entreprises européennes. Avantage comparatif pour les pays producteurs (EAU, Qatar, Norvège).",
    category: 'tax',
    severity: 'warning',
    date: '2026-02-01',
    source: 'Commission Européenne',
    affectsProfiles: ['entrepreneur', 'salarié expatrié', 'retraité'],
  },
  {
    id: 'geo-10',
    country: 'Mer Rouge / Commerce mondial',
    countryCode: 'YE',
    title: 'Perturbations maritimes — Attaques Houthis',
    summary: "Les attaques sur le commerce maritime en Mer Rouge par les Houthis du Yémen continuent de perturber les routes commerciales. Détour par le Cap de Bonne-Espérance (+10 jours, +30% coûts). Impact sur les importations européennes et asiatiques.",
    category: 'geopolitics',
    severity: 'warning',
    date: '2026-01-28',
    source: 'OMI / Lloyd\'s',
    affectsProfiles: ['entrepreneur', 'investisseur'],
  },
  // ============ FISCAL / VISA — MISES À JOUR 2026 ============
  {
    id: '11',
    country: 'Portugal',
    countryCode: 'PT',
    title: 'Fin du régime NHR — Nouveau statut IFICI en vigueur',
    summary: "Le régime Non-Habitual Resident (NHR) est définitivement supprimé. Le nouveau statut IFICI le remplace avec des conditions plus restrictives ciblant l'innovation et la recherche. Moins attractif pour les retraités et digital nomads.",
    category: 'tax',
    severity: 'critical',
    date: '2026-01-15',
    source: 'Diário da República',
    sourceUrl: 'https://dre.pt',
    affectsProfiles: ['digital-nomad', 'retraité', 'entrepreneur'],
  },
  {
    id: '12',
    country: 'Dubaï (EAU)',
    countryCode: 'AE',
    title: 'EAU — Impôt sur les sociétés 9% pleinement effectif + tensions régionales',
    summary: "L'impôt sur les sociétés de 9% est pleinement applicable. Les free zones maintiennent le 0% sous conditions de substance renforcées. Les tensions régionales (Gaza, Mer Rouge) n'affectent pas la stabilité des EAU mais augmentent les coûts logistiques.",
    category: 'tax',
    severity: 'warning',
    date: '2026-01-10',
    source: 'Federal Tax Authority UAE',
    affectsProfiles: ['entrepreneur', 'investisseur'],
  },
  {
    id: '13',
    country: 'Russie',
    countryCode: 'RU',
    title: 'Sanctions renforcées — Gel total des avoirs pour les résidents UE/US',
    summary: "Le 14e paquet de sanctions UE interdit toute nouvelle activité économique avec la Russie. Les comptes bancaires des ressortissants UE en Russie sont gelés. Les visas russes pour citoyens UE sont quasiment impossibles à obtenir. Impact sur les expats et entrepreneurs ayant des liens avec la Russie.",
    category: 'legal',
    severity: 'critical',
    date: '2026-01-05',
    source: 'Journal Officiel UE',
    affectsProfiles: ['entrepreneur', 'investisseur', 'salarié expatrié'],
  },
  {
    id: '14',
    country: 'Pologne',
    countryCode: 'PL',
    title: 'Pologne — Militarisation accélérée et impact budgétaire',
    summary: "La Pologne porte son budget défense à 4.2% du PIB (le plus élevé de l'OTAN). Investissements massifs en armement. Impact sur les impôts et les dépenses publiques. Zone frontalière est sous surveillance renforcée. Opportunités dans le secteur défense.",
    category: 'geopolitics',
    severity: 'warning',
    date: '2025-12-20',
    source: 'MON Pologne',
    affectsProfiles: ['entrepreneur', 'investisseur', 'salarié expatrié'],
  },
  {
    id: '15',
    country: 'Thaïlande',
    countryCode: 'TH',
    title: 'Thaïlande — Visa LTR 10 ans + pression migratoire Myanmar',
    summary: "Le visa LTR de 10 ans reste attractif (80 000 USD/an de revenus). Mais l'afflux de réfugiés du Myanmar à la frontière ouest crée des tensions sécuritaires localisées. Augmentation des contrôles dans les provinces frontalières.",
    category: 'visa',
    severity: 'info',
    date: '2025-12-15',
    source: 'BOI Thailand',
    sourceUrl: 'https://www.boi.go.th',
    affectsProfiles: ['digital-nomad', 'retraité', 'investisseur'],
  },
];

const CATEGORIES = [
  { value: 'all', label: 'Toutes', icon: Globe },
  { value: 'geopolitics', label: 'Géopolitique', icon: Globe },
  { value: 'visa', label: 'Visa', icon: Shield },
  { value: 'tax', label: 'Fiscal', icon: TrendingUp },
  { value: 'safety', label: 'Sécurité', icon: AlertTriangle },
  { value: 'legal', label: 'Juridique', icon: Info },
];

const severityConfig = {
  critical: { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30', badge: 'bg-red-500/20 text-red-400', icon: AlertTriangle, label: 'Critique' },
  warning: { color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30', badge: 'bg-amber-500/20 text-amber-400', icon: AlertTriangle, label: 'Important' },
  info: { color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30', badge: 'bg-blue-500/20 text-blue-400', icon: Info, label: 'Info' },
};

const categoryColors: Record<string, string> = {
  visa: 'bg-emerald-500/20 text-emerald-400',
  tax: 'bg-purple-500/20 text-purple-400',
  safety: 'bg-red-500/20 text-red-400',
  healthcare: 'bg-cyan-500/20 text-cyan-400',
  banking: 'bg-amber-500/20 text-amber-400',
  legal: 'bg-indigo-500/20 text-indigo-400',
  geopolitics: 'bg-orange-500/20 text-orange-400',
};

export default function RegulatoryAlerts() {
  const { permission, requestPermission, isSupported } = useRealtimeNotifications();
  const { alerts: aiAlerts, scanning, triggerScan } = useGeopoliticalAlerts();
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Merge mock alerts with AI-generated alerts
  const aiAsRegulatory: RegulatoryAlert[] = aiAlerts.map(a => ({
    id: `ai-${a.id}`,
    country: a.region,
    countryCode: a.country_codes?.[0] || '🌍',
    title: a.title,
    summary: a.summary + (a.impact_assessment ? `\n\n💡 Impact expats : ${a.impact_assessment}` : ''),
    category: 'geopolitics' as const,
    severity: a.severity,
    date: a.detected_at,
    source: `IA Perplexity (${a.ai_model || 'sonar-pro'})`,
    sourceUrl: a.citations?.[0],
    affectsProfiles: ['entrepreneur', 'investisseur', 'salarié expatrié', 'digital-nomad'],
    isAI: true,
    citations: a.citations,
    confidence: a.ai_confidence,
  }));

  const allAlerts = [...aiAsRegulatory, ...MOCK_ALERTS];

  const filtered = filter === 'all'
    ? allAlerts
    : allAlerts.filter(a => a.category === filter);

  const criticalCount = allAlerts.filter(a => a.severity === 'critical').length;
  const warningCount = allAlerts.filter(a => a.severity === 'warning').length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10">
            <Bell className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold">Alertes Réglementaires</h1>
            <p className="text-muted-foreground">
              Veille en temps réel sur les changements fiscaux, visa et juridiques
            </p>
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex flex-wrap gap-3">
          <Badge variant="outline" className={severityConfig.critical.badge}>
            <AlertTriangle className="w-3 h-3 mr-1" />
            {criticalCount} critique{criticalCount > 1 ? 's' : ''}
          </Badge>
          <Badge variant="outline" className={severityConfig.warning.badge}>
            <AlertTriangle className="w-3 h-3 mr-1" />
            {warningCount} important{warningCount > 1 ? 's' : ''}
          </Badge>
          <Badge variant="outline" className="bg-muted/50">
            <Globe className="w-3 h-3 mr-1" />
            {allAlerts.length} alertes totales
          </Badge>
          {aiAlerts.length > 0 && (
            <Badge variant="outline" className="bg-purple-500/20 text-purple-400">
              <Bot className="w-3 h-3 mr-1" />
              {aiAlerts.length} IA
            </Badge>
          )}
        </div>

        {/* AI Scanner CTA */}
        <Card className="border-purple-500/30 bg-purple-500/5">
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Radar className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-sm font-medium">Scanner IA géopolitique</p>
                <p className="text-xs text-muted-foreground">
                  Détection automatique des conflits et tensions via Perplexity AI
                </p>
              </div>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={triggerScan}
              disabled={scanning}
              className="gap-1.5 border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
            >
              {scanning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Radar className="w-3.5 h-3.5" />}
              {scanning ? 'Scan en cours…' : 'Lancer le scan'}
            </Button>
          </CardContent>
        </Card>

        {/* Push notification CTA */}
        {isSupported && permission !== 'granted' && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Activez les notifications push</p>
                  <p className="text-xs text-muted-foreground">
                    Recevez les alertes critiques en temps réel
                  </p>
                </div>
              </div>
              <Button size="sm" onClick={requestPermission}>
                Activer
              </Button>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <Filter className="w-4 h-4 text-muted-foreground" />
        {CATEGORIES.map(cat => (
          <Button
            key={cat.value}
            variant={filter === cat.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(cat.value)}
            className="gap-1.5"
          >
            <cat.icon className="w-3.5 h-3.5" />
            {cat.label}
          </Button>
        ))}
      </div>

      {/* Alerts list */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((alert, i) => {
            const sev = severityConfig[alert.severity];
            const SevIcon = sev.icon;
            const isExpanded = expandedId === alert.id;

            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: i * 0.05 }}
                layout
              >
                <Card
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md border",
                    sev.bg
                  )}
                  onClick={() => setExpandedId(isExpanded ? null : alert.id)}
                >
                  <CardContent className="p-4 space-y-3">
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <SevIcon className={cn("w-5 h-5 mt-0.5 shrink-0", sev.color)} />
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold">{alert.country}</span>
                            <Badge className={categoryColors[alert.category] || 'bg-muted'} variant="secondary">
                              {alert.category}
                            </Badge>
                            <Badge className={sev.badge} variant="secondary">
                              {sev.label}
                            </Badge>
                            {(alert as any).isAI && (
                              <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 text-[10px]">
                                <Bot className="w-2.5 h-2.5 mr-0.5" /> IA
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-semibold text-sm leading-tight">{alert.title}</h3>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(alert.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        </span>
                        <ChevronDown className={cn(
                          "w-4 h-4 text-muted-foreground transition-transform",
                          isExpanded && "rotate-180"
                        )} />
                      </div>
                    </div>

                    {/* Expanded content */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-3 border-t border-border/50 space-y-3">
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {alert.summary}
                            </p>
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs text-muted-foreground">Profils concernés :</span>
                                {alert.affectsProfiles.map(p => (
                                  <Badge key={p} variant="outline" className="text-[10px]">
                                    {p}
                                  </Badge>
                                ))}
                              </div>
                              {alert.sourceUrl && (
                                <a
                                  href={alert.sourceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={e => e.stopPropagation()}
                                  className="text-xs text-primary hover:underline flex items-center gap-1"
                                >
                                  {alert.source}
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                            {/* AI Citations */}
                            {(alert as any).citations?.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                <span className="text-[10px] text-muted-foreground">Sources IA :</span>
                                {(alert as any).citations.slice(0, 3).map((url: string, ci: number) => (
                                  <a
                                    key={ci}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={e => e.stopPropagation()}
                                    className="text-[10px] text-purple-400 hover:underline flex items-center gap-0.5 max-w-[200px] truncate"
                                  >
                                    <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                                    {new URL(url).hostname}
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Footer CTA */}
      <Card className="border-border/50">
        <CardContent className="p-6 text-center space-y-3">
          <CheckCircle2 className="w-8 h-8 text-primary mx-auto" />
          <h3 className="font-semibold">Restez informé</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Ces alertes sont mises à jour en continu grâce à notre veille IA.
            Activez les notifications pour ne rien manquer.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
