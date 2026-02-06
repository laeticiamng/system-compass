/**
 * ToolsHub - Central Hub for all platform tools and features
 * Provides clear categorization and easy access to all modules
 */

import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { 
  Compass, Map, Globe, Triangle, Key, Scale, Gamepad2, 
  User, Users, Play, Shield, BarChart3, BookOpen, 
  Building2, Eye, AlertCircle, CreditCard, FileText,
  Calculator, Target, Zap, Award, MessageSquare, Briefcase,
  LayoutDashboard, Bell, TrendingUp, Lock
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Routes that are masked/redirected and should be shown as "coming soon"
const MASKED_ROUTES = new Set([
  '/errors-illusions', '/personas', '/academic', '/latent', 
  '/irreversa', '/ovi', '/community', '/b2b', '/partner-services'
]);

interface ToolItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  badge?: string;
  comingSoon?: boolean;
}

export default function ToolsHub() {
  const { t } = useTranslation();

  const TOOL_CATEGORIES = [
    {
      id: 'discover',
      title: t('hub.category.discover', 'Découvrir'),
      description: t('hub.category.discoverDesc', 'Explorer les pays et comprendre les systèmes'),
      icon: Compass,
      color: 'from-blue-500/20 to-cyan-500/20',
      borderColor: 'border-blue-500/30',
      tools: [
        { href: '/countries', icon: Map, label: t('hub.tool.countries', 'Pays'), description: t('hub.tool.countriesDesc', 'Explorer 195+ pays') },
        { href: '/world-map', icon: Globe, label: t('hub.tool.worldMap', 'Carte Monde'), description: t('hub.tool.worldMapDesc', 'Vue interactive') },
        { href: '/pyramid-types', icon: Triangle, label: t('hub.tool.pyramids', 'Pyramides'), description: t('hub.tool.pyramidsDesc', '6 types de systèmes') },
        { href: '/compare', icon: Scale, label: t('hub.tool.compare', 'Comparer'), description: t('hub.tool.compareDesc', 'Jusqu\'à 4 pays') },
        { href: '/terrain', icon: Map, label: t('hub.tool.terrain', 'Réalités Terrain'), description: t('hub.tool.terrainDesc', 'Vécu quotidien') },
      ] as ToolItem[],
    },
    {
      id: 'analyze',
      title: t('hub.category.analyze', 'Analyser'),
      description: t('hub.category.analyzeDesc', 'Tests de profil et outils d\'analyse personnalisée'),
      icon: Target,
      color: 'from-purple-500/20 to-pink-500/20',
      borderColor: 'border-purple-500/30',
      tools: [
        { href: '/quick-test', icon: Zap, label: t('hub.tool.quickTest', 'Test Rapide'), description: t('hub.tool.quickTestDesc', '2 min'), badge: t('common.popular', 'Populaire') },
        { href: '/profile-test', icon: User, label: t('hub.tool.profileTest', 'Test Complet'), description: t('hub.tool.profileTestDesc', '15 min') },
        { href: '/profile-matcher', icon: Users, label: t('hub.tool.profileMatcher', 'Matcher Pays'), description: t('hub.tool.profileMatcherDesc', 'Compatibilité') },
        { href: '/life-trajectory', icon: TrendingUp, label: t('hub.tool.trajectory', 'Trajectoire'), description: t('hub.tool.trajectoryDesc', 'Simulation vie') },
        { href: '/fiscal-calculator', icon: Calculator, label: t('hub.tool.fiscalCalc', 'Calculateur Fiscal'), description: t('hub.tool.fiscalCalcDesc', 'Net vs Brut') },
      ] as ToolItem[],
    },
    {
      id: 'plan',
      title: t('hub.category.plan', 'Planifier'),
      description: t('hub.category.planDesc', 'Stratégies de sortie et prise de décision'),
      icon: Key,
      color: 'from-amber-500/20 to-orange-500/20',
      borderColor: 'border-amber-500/30',
      tools: [
        { href: '/exit-keys', icon: Key, label: t('hub.tool.exitKeys', 'Exit Keys'), description: t('hub.tool.exitKeysDesc', 'Stratégies de sortie') },
        { href: '/exit-keys/catalog', icon: FileText, label: t('hub.tool.catalog', 'Catalogue'), description: t('hub.tool.catalogDesc', '50+ clés') },
        { href: '/exit-keys/compare', icon: Scale, label: t('hub.tool.compareKeys', 'Comparer Clés'), description: t('hub.tool.compareKeysDesc', 'Analyse comparative') },
        { href: '/prevention-filter', icon: Shield, label: t('hub.tool.preventionFilter', 'Filtre Décision'), description: t('hub.tool.preventionFilterDesc', 'Anti-illusions') },
      ] as ToolItem[],
    },
    {
      id: 'learn',
      title: t('hub.category.learn', 'Apprendre'),
      description: t('hub.category.learnDesc', 'Jeux éducatifs et progression gamifiée'),
      icon: Gamepad2,
      color: 'from-emerald-500/20 to-teal-500/20',
      borderColor: 'border-emerald-500/30',
      tools: [
        { href: '/pyramid-quiz', icon: Gamepad2, label: t('hub.tool.quiz', 'Quiz Pyramides'), description: t('hub.tool.quizDesc', 'Testez vos connaissances') },
        { href: '/life-game', icon: Play, label: t('hub.tool.lifeGame', 'Mode Éducatif'), description: t('hub.tool.lifeGameDesc', 'Simulation interactive') },
        { href: '/gamification', icon: Award, label: t('hub.tool.gamification', 'Progression'), description: t('hub.tool.gamificationDesc', 'XP & badges'), badge: t('common.new', 'Nouveau') },
        { href: '/how-to-read', icon: BookOpen, label: t('hub.tool.guide', 'Guide'), description: t('hub.tool.guideDesc', 'Mode d\'emploi') },
      ] as ToolItem[],
    },
    {
      id: 'pro',
      title: t('hub.category.pro', 'Pro & Business'),
      description: t('hub.category.proDesc', 'Modules avancés pour professionnels'),
      icon: Building2,
      color: 'from-slate-500/20 to-zinc-500/20',
      borderColor: 'border-slate-500/30',
      badge: 'Pro',
      tools: [
        { href: '/institutions', icon: Building2, label: t('hub.tool.traceOS', 'TraceOS'), description: t('hub.tool.traceOSDesc', 'Audit institutionnel') },
        { href: '/financial-safety-intel', icon: Shield, label: t('hub.tool.finIntel', 'Intel Financière'), description: t('hub.tool.finIntelDesc', 'Sécurité financière') },
        { href: '/latent', icon: Eye, label: t('hub.tool.latent', 'Zones Latentes'), description: t('hub.tool.latentDesc', 'Risques cachés'), comingSoon: true },
        { href: '/irreversa', icon: AlertCircle, label: t('hub.tool.irreversa', 'Irreversa'), description: t('hub.tool.irreversaDesc', 'Seuils critiques'), comingSoon: true },
        { href: '/ovi', icon: Eye, label: t('hub.tool.ovi', 'OVI'), description: t('hub.tool.oviDesc', 'Observatoire'), comingSoon: true },
      ] as ToolItem[],
    },
    {
      id: 'connect',
      title: t('hub.category.connect', 'Communauté'),
      description: t('hub.category.connectDesc', 'Experts, partenaires et entraide'),
      icon: MessageSquare,
      color: 'from-rose-500/20 to-red-500/20',
      borderColor: 'border-rose-500/30',
      tools: [
        { href: '/experts', icon: Briefcase, label: t('hub.tool.experts', 'Experts'), description: t('hub.tool.expertsDesc', 'Marketplace') },
        { href: '/community', icon: MessageSquare, label: t('hub.tool.community', 'Communauté'), description: t('hub.tool.communityDesc', 'Forum & events'), comingSoon: true },
        { href: '/partner-services', icon: Users, label: t('hub.tool.partners', 'Partenaires'), description: t('hub.tool.partnersDesc', 'Services vérifiés'), comingSoon: true },
        { href: '/b2b', icon: Building2, label: t('hub.tool.b2b', 'B2B'), description: t('hub.tool.b2bDesc', 'Solutions entreprises'), comingSoon: true },
      ] as ToolItem[],
    },
  ];

  const QUICK_ACCESS = [
    { href: '/dashboard', icon: LayoutDashboard, label: t('hub.quick.dashboard', 'Dashboard'), description: t('hub.quick.dashboardDesc', 'Vue d\'ensemble') },
    { href: '/usage', icon: BarChart3, label: t('hub.quick.usage', 'Consommation'), description: t('hub.quick.usageDesc', 'Quota & stats') },
    { href: '/settings/notifications', icon: Bell, label: t('hub.quick.notifications', 'Notifications'), description: t('hub.quick.notificationsDesc', 'Alertes') },
    { href: '/pricing', icon: CreditCard, label: t('hub.quick.pricing', 'Tarifs'), description: t('hub.quick.pricingDesc', 'Plans & pricing') },
  ];

  return (
    <>
      <Helmet>
        <title>{t('hub.meta.title', 'Centre des Outils - Pyramid Compass | Analyse & Planification')}</title>
        <meta name="description" content={t('hub.meta.description', 'Accédez à tous les outils Pyramid Compass : tests de profil, comparateur de pays, Exit Keys, calculateur fiscal, et plus.')} />
        <meta property="og:title" content={t('hub.meta.ogTitle', 'Centre des Outils - Pyramid Compass')} />
        <meta property="og:description" content={t('hub.meta.ogDescription', 'Tous vos outils d\'analyse, de planification et de décision en un seul endroit.')} />
        <meta property="og:url" content="https://world-alignment.lovable.app/tools" />
        <link rel="canonical" href="https://world-alignment.lovable.app/tools" />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 pt-16 md:pt-20">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-3">
            {t('hub.title', 'Centre des Outils')}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('hub.subtitle', 'Tous vos outils d\'analyse, de planification et de décision en un seul endroit')}
          </p>
        </motion.div>

        {/* Quick Access Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap justify-center gap-2 mb-10"
        >
          {QUICK_ACCESS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                to={item.href}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 hover:bg-secondary border border-border/50 hover:border-primary/30 transition-all text-sm"
              >
                <Icon className="w-4 h-4 text-primary" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </motion.div>

        {/* Categories Grid */}
        <div className="grid gap-6 md:gap-8">
          {TOOL_CATEGORIES.map((category, categoryIndex) => {
            const CategoryIcon = category.icon;
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + categoryIndex * 0.05 }}
              >
                <Card className={cn("overflow-hidden border", category.borderColor)}>
                  <CardHeader className={cn("bg-gradient-to-r", category.color)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-background/80">
                          <CategoryIcon className="w-5 h-5 text-foreground" />
                        </div>
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {category.title}
                            {'badge' in category && category.badge && (
                              <Badge variant="secondary" className="text-xs">
                                {category.badge}
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription>{category.description}</CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                      {category.tools.map((tool) => {
                        const ToolIcon = tool.icon;
                        const isMasked = MASKED_ROUTES.has(tool.href);
                        const isComingSoon = tool.comingSoon || isMasked;

                        if (isComingSoon) {
                          return (
                            <div
                              key={tool.href}
                              className="relative p-3 rounded-lg border border-border/30 text-center opacity-60 cursor-default"
                            >
                              <Badge 
                                variant="outline" 
                                className="absolute -top-2 -right-2 text-[10px] px-1.5 py-0 bg-muted"
                              >
                                <Lock className="w-2.5 h-2.5 mr-0.5" />
                                {t('common.comingSoon', 'Bientôt')}
                              </Badge>
                              <ToolIcon className="w-6 h-6 mx-auto mb-2 text-muted-foreground/50" />
                              <div className="font-medium text-sm mb-0.5 text-muted-foreground">{tool.label}</div>
                              <div className="text-[11px] text-muted-foreground/60 line-clamp-1">
                                {tool.description}
                              </div>
                            </div>
                          );
                        }

                        return (
                          <Link
                            key={tool.href}
                            to={tool.href}
                            className="group relative p-3 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all text-center"
                          >
                            {tool.badge && (
                              <Badge 
                                variant="default" 
                                className="absolute -top-2 -right-2 text-[10px] px-1.5 py-0"
                              >
                                {tool.badge}
                              </Badge>
                            )}
                            <ToolIcon className="w-6 h-6 mx-auto mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
                            <div className="font-medium text-sm mb-0.5">{tool.label}</div>
                            <div className="text-[11px] text-muted-foreground line-clamp-1">
                              {tool.description}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Help Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 text-center"
        >
          <p className="text-sm text-muted-foreground mb-3">
            {t('hub.help', 'Besoin d\'aide pour choisir ?')}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/quick-test">
              <Badge variant="outline" className="px-4 py-2 text-sm hover:bg-primary/10 cursor-pointer">
                🚀 {t('hub.startQuickTest', 'Commencer par le Test Rapide')}
              </Badge>
            </Link>
            <Link to="/how-to-read">
              <Badge variant="outline" className="px-4 py-2 text-sm hover:bg-primary/10 cursor-pointer">
                📖 {t('hub.readGuide', 'Lire le Guide')}
              </Badge>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
    </>
  );
}
