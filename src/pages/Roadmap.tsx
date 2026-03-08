import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Rocket, Sparkles, Target } from 'lucide-react';

interface RoadmapItem {
  title: string;
  description: string;
  status: 'done' | 'in_progress' | 'planned' | 'exploring';
  quarter: string;
  tags: string[];
}

const roadmapData: RoadmapItem[] = [
  // Done
  { title: 'Intelligence pays 80+', description: 'Profils complets avec pyramides systémiques, visa, fiscalité, risques.', status: 'done', quarter: 'Q1 2026', tags: ['Core'] },
  { title: 'Quick Test interactif', description: 'Test de compatibilité pays en 2 minutes, sans inscription.', status: 'done', quarter: 'Q1 2026', tags: ['Core'] },
  { title: 'Comparaison multi-pays', description: 'Comparez jusqu\'à 4 pays côte à côte sur tous les critères.', status: 'done', quarter: 'Q1 2026', tags: ['Outil'] },
  { title: 'Simulateur fiscal', description: 'Calculez votre imposition estimée dans n\'importe quel pays.', status: 'done', quarter: 'Q1 2026', tags: ['Outil'] },
  { title: 'Multilingue FR/EN', description: 'Interface et données disponibles en français et anglais.', status: 'done', quarter: 'Q1 2026', tags: ['UX'] },
  { title: 'Auth complète', description: 'Email, Google, Apple, Magic Link avec vérification.', status: 'done', quarter: 'Q1 2026', tags: ['Sécurité'] },
  { title: 'Dashboard personnel', description: 'Suivi de progression, alertes pays, historique.', status: 'done', quarter: 'Q1 2026', tags: ['Premium'] },
  { title: 'Beta Feedback', description: 'Système de retour intégré pour les beta-testeurs.', status: 'done', quarter: 'Q1 2026', tags: ['Plateforme'] },
  // In progress
  { title: 'Marketplace experts', description: 'Consultez des experts certifiés par pays et spécialité.', status: 'in_progress', quarter: 'Q1 2026', tags: ['Premium'] },
  { title: 'TraceOS — journal de bord', description: 'Documentez chaque étape de votre expatriation.', status: 'in_progress', quarter: 'Q1 2026', tags: ['Outil'] },
  { title: 'Alertes réglementaires', description: 'Notifications en temps réel sur les changements légaux/fiscaux.', status: 'in_progress', quarter: 'Q2 2026', tags: ['Premium'] },
  // Planned
  { title: 'App mobile (PWA)', description: 'Accès hors-ligne et notifications push.', status: 'planned', quarter: 'Q2 2026', tags: ['Mobile'] },
  { title: 'API publique', description: 'Accès programmatique aux données pays pour intégrateurs.', status: 'planned', quarter: 'Q2 2026', tags: ['Développeurs'] },
  { title: 'Workspace famille', description: 'Espace partagé pour planifier une expatriation en famille.', status: 'planned', quarter: 'Q2 2026', tags: ['Premium'] },
  // Exploring
  { title: 'IA conversationnelle avancée', description: 'Assistant IA spécialisé expatriation avec contexte personnalisé.', status: 'exploring', quarter: 'Q3 2026', tags: ['IA'] },
  { title: 'Partenariats bancaires', description: 'Connexion directe avec des banques internationales.', status: 'exploring', quarter: 'Q3 2026', tags: ['Partenaire'] },
];

const statusConfig = {
  done: { label: 'Livré', icon: CheckCircle, variant: 'default' as const, color: 'text-green-500' },
  in_progress: { label: 'En cours', icon: Rocket, variant: 'secondary' as const, color: 'text-blue-500' },
  planned: { label: 'Planifié', icon: Target, variant: 'outline' as const, color: 'text-amber-500' },
  exploring: { label: 'En exploration', icon: Sparkles, variant: 'outline' as const, color: 'text-purple-500' },
};

export default function Roadmap() {
  const { t } = useTranslation();
  const grouped = {
    in_progress: roadmapData.filter(i => i.status === 'in_progress'),
    planned: roadmapData.filter(i => i.status === 'planned'),
    exploring: roadmapData.filter(i => i.status === 'exploring'),
    done: roadmapData.filter(i => i.status === 'done'),
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Helmet>
        <title>{t('roadmap.metaTitle', 'Roadmap — System Compass')}</title>
        <meta name="description" content={t('roadmap.metaDesc', 'Découvrez les fonctionnalités à venir et celles déjà livrées sur System Compass.')} />
      </Helmet>

      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          {t('roadmap.title', 'Roadmap Produit')}
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {t('roadmap.subtitle', 'Transparence totale sur ce que nous construisons. Votre feedback influence directement nos priorités.')}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {Object.entries(statusConfig).map(([key, cfg]) => {
          const Icon = cfg.icon;
          const count = grouped[key as keyof typeof grouped]?.length || 0;
          return (
            <Card key={key} className="text-center">
              <CardContent className="py-4">
                <Icon className={`w-6 h-6 mx-auto mb-2 ${cfg.color}`} />
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-xs text-muted-foreground">{cfg.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Sections */}
      {(Object.entries(grouped) as Array<[keyof typeof grouped, RoadmapItem[]]>).map(([status, items]) => {
        if (items.length === 0) return null;
        const cfg = statusConfig[status];
        const Icon = cfg.icon;
        return (
          <div key={status} className="mb-8">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
              <Icon className={`w-5 h-5 ${cfg.color}`} />
              {cfg.label}
              <Badge variant={cfg.variant} className="ml-2">{items.length}</Badge>
            </h2>
            <div className="space-y-3">
              {items.map((item, i) => (
                <Card key={i} className="hover:border-primary/20 transition-colors">
                  <CardContent className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className="text-xs"><Clock className="w-3 h-3 mr-1" />{item.quarter}</Badge>
                      {item.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
