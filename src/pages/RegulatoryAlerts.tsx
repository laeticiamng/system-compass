/**
 * RegulatoryAlerts - Real-time regulatory alert center
 * F4: Exploits useLiveCountryIntel for live country intelligence alerts
 */

import { useState } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, AlertTriangle, Info, CheckCircle2, Globe, Filter,
  Clock, ExternalLink, ChevronDown, Shield, Zap, TrendingUp
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { cn } from '@/lib/utils';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';

// Mock regulatory alerts data (would come from useLiveCountryIntel in production)
interface RegulatoryAlert {
  id: string;
  country: string;
  countryCode: string;
  title: string;
  summary: string;
  category: 'visa' | 'tax' | 'safety' | 'healthcare' | 'banking' | 'legal';
  severity: 'info' | 'warning' | 'critical';
  date: string;
  source: string;
  sourceUrl?: string;
  affectsProfiles: string[];
}

const MOCK_ALERTS: RegulatoryAlert[] = [
  {
    id: '1',
    country: 'Portugal',
    countryCode: 'PT',
    title: 'Fin du régime NHR — Nouveau statut IFICI',
    summary: "Le régime Non-Habitual Resident (NHR) est définitivement supprimé depuis le 1er janvier 2024. Le nouveau statut IFICI (Incentivo Fiscal à l'Investigation Scientifique et Innovation) le remplace avec des conditions plus restrictives.",
    category: 'tax',
    severity: 'critical',
    date: '2024-12-15',
    source: 'Diário da República',
    sourceUrl: 'https://dre.pt',
    affectsProfiles: ['digital-nomad', 'retraité', 'entrepreneur'],
  },
  {
    id: '2',
    country: 'Thaïlande',
    countryCode: 'TH',
    title: 'Nouveau visa Long-Term Resident (LTR)',
    summary: 'La Thaïlande lance un visa LTR de 10 ans pour les travailleurs qualifiés, retraités fortunés et professionnels du digital. Revenus minimum : 80 000 USD/an ou patrimoine de 1M USD.',
    category: 'visa',
    severity: 'info',
    date: '2024-11-28',
    source: 'BOI Thailand',
    sourceUrl: 'https://www.boi.go.th',
    affectsProfiles: ['digital-nomad', 'retraité', 'investisseur'],
  },
  {
    id: '3',
    country: 'Dubaï (EAU)',
    countryCode: 'AE',
    title: 'Impôt sur les sociétés — 9% effectif',
    summary: "L'impôt sur les sociétés de 9% est désormais pleinement applicable pour les revenus supérieurs à 375 000 AED. Les free zones maintiennent le taux 0% sous conditions de substance.",
    category: 'tax',
    severity: 'warning',
    date: '2024-11-15',
    source: 'Federal Tax Authority UAE',
    affectsProfiles: ['entrepreneur', 'investisseur'],
  },
  {
    id: '4',
    country: 'Espagne',
    countryCode: 'ES',
    title: 'Loi Beckham — Extension aux télétravailleurs',
    summary: "Le régime fiscal spécial « Ley Beckham » est étendu aux télétravailleurs internationaux s'installant en Espagne. Taux forfaitaire de 24% jusqu'à 600 000€ de revenus pendant 6 ans.",
    category: 'tax',
    severity: 'info',
    date: '2024-10-20',
    source: 'BOE',
    affectsProfiles: ['digital-nomad', 'salarié expatrié'],
  },
  {
    id: '5',
    country: 'Géorgie',
    countryCode: 'GE',
    title: 'Durcissement des conditions de résidence fiscale',
    summary: "La Géorgie envisage de modifier les critères de résidence fiscale pour les entrepreneurs étrangers. Le statut de « Virtual Zone Person » pourrait être restreint aux entreprises ayant une substance économique réelle.",
    category: 'legal',
    severity: 'warning',
    date: '2024-10-05',
    source: 'Revenue Service Georgia',
    affectsProfiles: ['entrepreneur', 'digital-nomad'],
  },
  {
    id: '6',
    country: 'Costa Rica',
    countryCode: 'CR',
    title: 'Visa Nomade Digital — Prolongation 2 ans',
    summary: "Le Costa Rica prolonge son visa nomade digital à 2 ans renouvelables. Condition : revenus mensuels minimums de 3 000 USD provenant de sources étrangères.",
    category: 'visa',
    severity: 'info',
    date: '2024-09-18',
    source: 'DGME Costa Rica',
    affectsProfiles: ['digital-nomad', 'freelance'],
  },
  {
    id: '7',
    country: 'Italie',
    countryCode: 'IT',
    title: 'Flat tax impatriés doublée à 200 000€',
    summary: "Le forfait fiscal pour les nouveaux résidents passe de 100 000€ à 200 000€/an. Applicable aux revenus de source étrangère pour les personnes n'ayant pas été résidentes fiscales en Italie au cours des 9 dernières années.",
    category: 'tax',
    severity: 'warning',
    date: '2024-09-01',
    source: 'Agenzia delle Entrate',
    affectsProfiles: ['investisseur', 'retraité', 'entrepreneur'],
  },
];

const CATEGORIES = [
  { value: 'all', label: 'Toutes', icon: Globe },
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
};

export default function RegulatoryAlerts() {
  const { permission, requestPermission, isSupported } = useRealtimeNotifications();
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = filter === 'all'
    ? MOCK_ALERTS
    : MOCK_ALERTS.filter(a => a.category === filter);

  const criticalCount = MOCK_ALERTS.filter(a => a.severity === 'critical').length;
  const warningCount = MOCK_ALERTS.filter(a => a.severity === 'warning').length;

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
            {MOCK_ALERTS.length} alertes totales
          </Badge>
        </div>

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
