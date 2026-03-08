/**
 * Public Changelog Page
 * Shows data updates, new features, and platform changes
 */
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Clock,
  Database,
  Globe,
  Zap,
  Shield,
  Bug,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type ChangeType = 'data' | 'feature' | 'fix' | 'improvement' | 'security';

interface ChangelogEntry {
  date: string;
  version?: string;
  changes: {
    type: ChangeType;
    text: string;
  }[];
}

const TYPE_CONFIG: Record<ChangeType, { icon: React.ComponentType<{ className?: string }>; label: string; color: string }> = {
  data: { icon: Database, label: 'Données', color: 'bg-blue-500/20 text-blue-600 dark:text-blue-400' },
  feature: { icon: Sparkles, label: 'Nouveau', color: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' },
  fix: { icon: Bug, label: 'Correctif', color: 'bg-amber-500/20 text-amber-600 dark:text-amber-400' },
  improvement: { icon: Zap, label: 'Amélioration', color: 'bg-violet-500/20 text-violet-600 dark:text-violet-400' },
  security: { icon: Shield, label: 'Sécurité', color: 'bg-red-500/20 text-red-600 dark:text-red-400' },
};

const CHANGELOG: ChangelogEntry[] = [
  {
    date: '2026-03-04',
    version: 'v7.3.0',
    changes: [
      { type: 'data', text: 'Mise à jour géopolitique complète mars 2026 — 8 conflits actifs intégrés (Ukraine, Gaza, Sahel, Myanmar, Soudan, Taïwan)' },
      { type: 'data', text: 'Recalibration des scores de risques pour la Russie (safety 55→80, volatility 85→92), la Pologne (volatility 35→45) et notes visa actualisées' },
      { type: 'feature', text: 'Nouveau filtre « Géopolitique » dans les alertes réglementaires — 15 alertes géopolitiques avec sources' },
      { type: 'improvement', text: 'Module académique GeopoliticalAnalysis recalibré — indices de puissance France post-Ukraine, 8 risques géopolitiques détaillés' },
      { type: 'data', text: 'Indicateurs institutionnels mis à jour 2025-2026 (CPI, Rule of Law, Political Stability, HDI)' },
      { type: 'security', text: 'Alertes de sécurité critique pour Ukraine, Soudan, Myanmar, Sahel — zones déconseillées documentées' },
    ],
  },
  {
    date: '2026-03-04',
    version: 'v7.2.0',
    changes: [
      { type: 'feature', text: 'Page Timeline d\'expatriation interactive — parcours J-180 → J+90 avec réversibilité' },
      { type: 'feature', text: 'Checklist administrative par pays — 6 catégories, 40+ tâches avec progression' },
      { type: 'feature', text: 'Comparaison Avant/Après fiscale — visualisation du delta net mensuel animé' },
      { type: 'feature', text: 'Page Changelog publique pour la transparence des mises à jour' },
      { type: 'fix', text: 'Correction du chevauchement du disclaimer sur mobile' },
      { type: 'fix', text: 'Ajout des traductions FR manquantes pour le hero /countries' },
      { type: 'improvement', text: 'Widget shortcuts conditionnel — masqué avant le Quick Test' },
    ],
  },
  {
    date: '2026-02-28',
    version: 'v7.1.0',
    changes: [
      { type: 'feature', text: 'Support de 13 langues — Chinois, Hindi, Arabe, Bengali, Russe, Ourdou ajoutés' },
      { type: 'data', text: 'Traductions des points positifs pour les 13 langues supportées' },
      { type: 'improvement', text: 'Support RTL complet pour l\'Arabe et l\'Ourdou' },
    ],
  },
  {
    date: '2026-02-20',
    version: 'v7.0.0',
    changes: [
      { type: 'feature', text: 'Module Intelligence Financière IA — détection des schémas légitimes vs frauduleux' },
      { type: 'feature', text: 'Marketplace d\'experts — mise en relation avec des professionnels vérifiés' },
      { type: 'data', text: '80+ pays analysés en profondeur avec couche intelligence' },
      { type: 'improvement', text: 'Simulateur fiscal avec conventions bilatérales et régimes spéciaux' },
      { type: 'security', text: 'Authentification renforcée avec gestion des rôles admin' },
    ],
  },
  {
    date: '2026-02-10',
    version: 'v6.5.0',
    changes: [
      { type: 'feature', text: 'Module TraceOS — journal décisionnel pour suivre votre parcours' },
      { type: 'feature', text: 'Gamification — système XP, badges et défis quotidiens' },
      { type: 'data', text: 'Mise à jour des données fiscales Portugal, Suisse, UAE' },
      { type: 'improvement', text: 'Carte du monde interactive avec filtres avancés' },
    ],
  },
  {
    date: '2026-01-25',
    version: 'v6.0.0',
    changes: [
      { type: 'feature', text: 'Modules Latent & Irreversa — analyse des zones latentes et seuils critiques' },
      { type: 'feature', text: 'Exit Keys — catalogue de 50+ stratégies de sortie personnalisées' },
      { type: 'data', text: 'Ajout de 15 pays avec couche intelligence étendue' },
      { type: 'improvement', text: 'Navigation simplifiée à 6 entrées principales' },
    ],
  },
];

export default function Changelog() {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t('changelog.seoTitle', 'Changelog | Compass')}</title>
        <meta name="description" content={t('changelog.seoDesc', 'Historique des mises à jour de Compass. Nouvelles fonctionnalités, corrections et mises à jour des données.')} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <section className="relative py-14 sm:py-18 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Badge variant="outline" className="mb-4 gap-2">
                <Clock className="w-3.5 h-3.5" />
                {t('changelog.badge', 'Transparence & traçabilité')}
              </Badge>
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
                <span className="block text-foreground">{t('changelog.heroTitle1', 'Changelog')}</span>
                <span className="block bg-gradient-to-r from-primary via-amber-400 to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradient_3s_ease-in-out_infinite]">
                  {t('changelog.heroTitle2', 'ce qui change, quand.')}
                </span>
              </h1>
              <p className="text-lg text-muted-foreground">
                {t('changelog.heroSubtitle', 'Chaque mise à jour de données, nouvelle fonctionnalité et correction est documentée ici.')}
              </p>
            </motion.div>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-20 max-w-3xl">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border hidden sm:block" />

            <div className="space-y-8">
              {CHANGELOG.map((entry, idx) => (
                <motion.div
                  key={entry.date}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative sm:pl-12"
                >
                  {/* Timeline dot */}
                  <div className="absolute left-2.5 top-6 w-3 h-3 rounded-full bg-primary border-2 border-background hidden sm:block" />

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-muted-foreground" />
                          <time className="text-sm font-medium text-muted-foreground">
                            {new Date(entry.date).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </time>
                        </div>
                        {entry.version && (
                          <Badge variant="outline" className="text-xs">
                            {entry.version}
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-3">
                        {entry.changes.map((change, cIdx) => {
                          const config = TYPE_CONFIG[change.type];
                          const Icon = config.icon;
                          return (
                            <div key={cIdx} className="flex items-start gap-3">
                              <Badge
                                variant="outline"
                                className={cn('text-[10px] px-1.5 py-0.5 border-0 shrink-0', config.color)}
                              >
                                <Icon className="w-3 h-3 mr-1" />
                                {config.label}
                              </Badge>
                              <p className="text-sm text-foreground">{change.text}</p>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
