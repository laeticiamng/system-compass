/**
 * RegulatoryAlerts - Live regulatory alert center
 * Uses AI geopolitical scans + curated country risk intelligence.
 */

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  AlertTriangle,
  Info,
  Globe,
  Clock,
  ExternalLink,
  ChevronDown,
  Shield,
  TrendingUp,
  Radar,
  Loader2,
  Bot,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { useGeopoliticalAlerts } from '@/hooks/useGeopoliticalAlerts';
import { countryRiskProfiles } from '@/lib/country-risks-data';
import { PremiumHero3D } from '@/components/ui/premium-hero-3d';

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
  isAI?: boolean;
  citations?: string[];
  confidence?: number | null;
}

const CATEGORIES = [
  { value: 'all', label: 'Toutes', icon: Globe },
  { value: 'geopolitics', label: 'Géopolitique', icon: Globe },
  { value: 'visa', label: 'Visa', icon: Shield },
  { value: 'tax', label: 'Fiscal', icon: TrendingUp },
  { value: 'safety', label: 'Sécurité', icon: AlertTriangle },
  { value: 'legal', label: 'Juridique', icon: Info },
  { value: 'healthcare', label: 'Santé', icon: CheckCircle2 },
  { value: 'banking', label: 'Banque', icon: TrendingUp },
] as const;

const severityConfig = {
  critical: { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30', badge: 'bg-red-500/20 text-red-400', icon: AlertTriangle, label: 'Critique' },
  warning: { color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30', badge: 'bg-amber-500/20 text-amber-400', icon: AlertTriangle, label: 'Important' },
  info: { color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30', badge: 'bg-blue-500/20 text-blue-400', icon: Info, label: 'Info' },
} as const;

const categoryColors: Record<RegulatoryAlert['category'], string> = {
  visa: 'bg-emerald-500/20 text-emerald-400',
  tax: 'bg-purple-500/20 text-purple-400',
  safety: 'bg-red-500/20 text-red-400',
  healthcare: 'bg-cyan-500/20 text-cyan-400',
  banking: 'bg-amber-500/20 text-amber-400',
  legal: 'bg-indigo-500/20 text-indigo-400',
  geopolitics: 'bg-orange-500/20 text-orange-400',
};

function mapRiskCategory(category: string): RegulatoryAlert['category'] {
  switch (category) {
    case 'financial':
      return 'banking';
    case 'legal_trap':
    case 'bureaucratic':
      return 'legal';
    case 'social':
    case 'corruption':
      return 'safety';
    case 'cultural':
      return 'visa';
    default:
      return 'legal';
  }
}

function mapSeverity(score: number): RegulatoryAlert['severity'] {
  if (score >= 8) return 'critical';
  if (score >= 6) return 'warning';
  return 'info';
}

export default function RegulatoryAlerts() {
  const { permission, requestPermission, isSupported } = useRealtimeNotifications();
  const { alerts: aiAlerts, scanning, triggerScan, loading, error } = useGeopoliticalAlerts();
  const [filter, setFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const curatedAlerts = useMemo<RegulatoryAlert[]>(() => {
    return countryRiskProfiles.flatMap((profile) =>
      profile.hiddenRisks.map((risk) => ({
        id: risk.id,
        country: profile.countryName,
        countryCode: profile.countryId,
        title: risk.title,
        summary: `${risk.description}\n\nMitigation: ${risk.mitigationTips.join(' • ')}`,
        category: mapRiskCategory(risk.category),
        severity: mapSeverity(risk.severity),
        date: profile.lastUpdated,
        source: risk.sources.join(' · '),
        affectsProfiles: risk.affectedProfiles,
      })),
    );
  }, []);

  const aiAsRegulatory = useMemo<RegulatoryAlert[]>(() => {
    return aiAlerts.map((alert) => ({
      id: `ai-${alert.id}`,
      country: alert.region,
      countryCode: alert.country_codes?.[0] || '🌍',
      title: alert.title,
      summary: alert.summary + (alert.impact_assessment ? `\n\nImpact expats : ${alert.impact_assessment}` : ''),
      category: 'geopolitics',
      severity: alert.severity,
      date: alert.detected_at,
      source: `IA Perplexity (${alert.ai_model || 'sonar-pro'})`,
      sourceUrl: alert.citations?.[0],
      affectsProfiles: ['entrepreneur', 'investisseur', 'salarié expatrié', 'digital-nomad'],
      isAI: true,
      citations: alert.citations,
      confidence: alert.ai_confidence,
    }));
  }, [aiAlerts]);

  const allAlerts = useMemo(() => {
    return [...aiAsRegulatory, ...curatedAlerts].sort((a, b) => {
      const severityRank = { critical: 0, warning: 1, info: 2 };
      if (severityRank[a.severity] !== severityRank[b.severity]) {
        return severityRank[a.severity] - severityRank[b.severity];
      }
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [aiAsRegulatory, curatedAlerts]);

  const filtered = filter === 'all' ? allAlerts : allAlerts.filter((alert) => alert.category === filter);
  const criticalCount = allAlerts.filter((alert) => alert.severity === 'critical').length;
  const warningCount = allAlerts.filter((alert) => alert.severity === 'warning').length;

  return (
    <div className="container mx-auto max-w-5xl space-y-8 px-4 py-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-card/70 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.18)] backdrop-blur-xl md:p-8">
        <PremiumHero3D intensity="medium" />
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 space-y-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-primary/10 p-3">
                <Bell className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-display font-bold">Alertes Réglementaires</h1>
                <p className="text-muted-foreground">
                  Veille hybride : signaux géopolitiques en base + risques pays sourcés et actionnables.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className={severityConfig.critical.badge}>
                <AlertTriangle className="mr-1 h-3 w-3" />
                {criticalCount} critique{criticalCount > 1 ? 's' : ''}
              </Badge>
              <Badge variant="outline" className={severityConfig.warning.badge}>
                <AlertTriangle className="mr-1 h-3 w-3" />
                {warningCount} importante{warningCount > 1 ? 's' : ''}
              </Badge>
              <Badge variant="outline" className="bg-muted/50">
                <Globe className="mr-1 h-3 w-3" />
                {allAlerts.length} alertes
              </Badge>
              {aiAlerts.length > 0 && (
                <Badge variant="outline" className="bg-purple-500/20 text-purple-400">
                  <Bot className="mr-1 h-3 w-3" />
                  {aiAlerts.length} IA
                </Badge>
              )}
            </div>
          </div>

          <Card className="border-purple-500/30 bg-purple-500/5">
            <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <Radar className="h-5 w-5 text-purple-400" />
                <div>
                  <p className="text-sm font-medium">Scanner IA géopolitique</p>
                  <p className="text-xs text-muted-foreground">
                    Lance un scan Perplexity pour injecter les derniers événements dans la table `geopolitical_alerts_ai`.
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
                {scanning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Radar className="h-3.5 w-3.5" />}
                {scanning ? 'Scan en cours…' : 'Lancer le scan'}
              </Button>
            </CardContent>
          </Card>

          {isSupported && permission !== 'granted' && (
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-medium">Notifications push</p>
                  <p className="text-xs text-muted-foreground">
                    Recevez les alertes critiques directement sur cet appareil.
                  </p>
                </div>
                <Button size="sm" onClick={requestPermission} className="gap-2">
                  <Bell className="h-4 w-4" />
                  Activer les alertes
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </section>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((category) => {
          const Icon = category.icon;
          const active = filter === category.value;
          return (
            <Button
              key={category.value}
              variant={active ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(category.value)}
              className="gap-2"
            >
              <Icon className="h-4 w-4" />
              {category.label}
            </Button>
          );
        })}
      </div>

      {loading && allAlerts.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center gap-3 py-16 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Chargement des alertes…
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {error && (
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardContent className="py-4 text-sm text-amber-200">
                Impossible de charger la couche IA en direct : {error}. Les alertes pays sourcées restent disponibles.
              </CardContent>
            </Card>
          )}

          {filtered.map((alert) => {
            const config = severityConfig[alert.severity];
            const SeverityIcon = config.icon;
            const isExpanded = expandedId === alert.id;

            return (
              <motion.div key={alert.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className={cn('overflow-hidden border transition-colors', config.bg)}>
                  <CardContent className="p-0">
                    <button
                      type="button"
                      className="w-full p-4 text-left"
                      onClick={() => setExpandedId(isExpanded ? null : alert.id)}
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="flex gap-3">
                          <div className="mt-0.5 rounded-xl bg-background/70 p-2">
                            <SeverityIcon className={cn('h-5 w-5', config.color)} />
                          </div>
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="outline" className={config.badge}>{config.label}</Badge>
                              <Badge variant="outline" className={categoryColors[alert.category]}>{alert.category}</Badge>
                              {alert.isAI && <Badge variant="outline" className="bg-purple-500/20 text-purple-300">IA</Badge>}
                              <Badge variant="outline" className="bg-background/60">{alert.country}</Badge>
                            </div>
                            <div>
                              <h2 className="text-lg font-semibold leading-tight">{alert.title}</h2>
                              <p className="mt-1 text-sm text-muted-foreground">{alert.source}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-muted-foreground md:pl-6">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {new Date(alert.date).toLocaleDateString('fr-FR')}
                          </div>
                          <ChevronDown className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-180')} />
                        </div>
                      </div>
                    </button>

                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden border-t border-white/10"
                        >
                          <div className="space-y-4 p-4 pt-4 text-sm">
                            <p className="whitespace-pre-line text-muted-foreground">{alert.summary}</p>

                            {alert.affectsProfiles.length > 0 && (
                              <div>
                                <p className="mb-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">Profils concernés</p>
                                <div className="flex flex-wrap gap-2">
                                  {alert.affectsProfiles.map((profile) => (
                                    <Badge key={profile} variant="outline" className="bg-background/60">
                                      {profile}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {(alert.sourceUrl || alert.citations?.length) && (
                              <div className="flex flex-wrap gap-2">
                                {alert.sourceUrl && (
                                  <Button asChild size="sm" variant="outline" className="gap-2">
                                    <a href={alert.sourceUrl} target="_blank" rel="noreferrer">
                                      <ExternalLink className="h-4 w-4" />
                                      Source principale
                                    </a>
                                  </Button>
                                )}
                                {alert.citations?.slice(1, 3).map((citation) => (
                                  <Button key={citation} asChild size="sm" variant="ghost" className="gap-2">
                                    <a href={citation} target="_blank" rel="noreferrer">
                                      <ExternalLink className="h-4 w-4" />
                                      Citation
                                    </a>
                                  </Button>
                                ))}
                              </div>
                            )}

                            {typeof alert.confidence === 'number' && (
                              <p className="text-xs text-muted-foreground">
                                Confiance IA estimée : {Math.round(alert.confidence * 100)}%
                              </p>
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

          {filtered.length === 0 && (
            <Card>
              <CardContent className="py-16 text-center text-muted-foreground">
                Aucune alerte pour ce filtre.
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
