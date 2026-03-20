/**
 * ToolsHub - Central Hub for all platform tools and features
 * Prioritises the user journey with live modules only.
 */

import { LocalizedLink as Link } from '@/components/i18n';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { SITE_CONFIG } from '@/config/site';
import { motion } from 'framer-motion';
import {
  Compass,
  Map,
  Globe,
  Triangle,
  Key,
  Scale,
  Gamepad2,
  User,
  Users,
  Play,
  Shield,
  BarChart3,
  BookOpen,
  Building2,
  Eye,
  AlertCircle,
  CreditCard,
  FileText,
  Calculator,
  Target,
  Zap,
  Award,
  MessageSquare,
  Briefcase,
  LayoutDashboard,
  Bell,
  TrendingUp,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PremiumHero3D } from '@/components/ui/premium-hero-3d';

interface ToolItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  badge?: string;
  accent?: string;
  priority?: 'featured' | 'high' | 'medium';
}

interface ToolCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  borderColor: string;
  badge?: string;
  tools: ToolItem[];
}

export default function ToolsHub() {
  const { t } = useTranslation();

  const TOOL_CATEGORIES: ToolCategory[] = [
    {
      id: 'discover',
      title: t('hub.category.discover', 'Découvrir'),
      description: t('hub.category.discoverDesc', 'Explorer les pays et leurs spécificités'),
      icon: Compass,
      color: 'from-blue-500/20 to-cyan-500/20',
      borderColor: 'border-blue-500/30',
      tools: [
        { href: '/countries', icon: Map, label: t('hub.tool.countries', 'Pays'), description: t('hub.tool.countriesDesc', '80+ pays analysés en profondeur'), badge: t('common.popular', 'Populaire'), accent: 'from-blue-500/15 to-cyan-500/5', priority: 'featured' },
        { href: '/world-map', icon: Globe, label: t('hub.tool.worldMap', 'Carte Monde'), description: t('hub.tool.worldMapDesc', 'Vue interactive'), accent: 'from-sky-500/15 to-cyan-500/5', priority: 'high' },
        { href: '/compare', icon: Scale, label: t('hub.tool.compare', 'Comparer'), description: t('hub.tool.compareDesc', 'Jusqu\'à 4 pays'), accent: 'from-indigo-500/15 to-blue-500/5', priority: 'high' },
        { href: '/terrain', icon: Map, label: t('hub.tool.terrain', 'Vie sur place'), description: t('hub.tool.terrainDesc', 'Vécu quotidien'), accent: 'from-emerald-500/15 to-teal-500/5', priority: 'high' },
        { href: '/pyramid-types', icon: Triangle, label: t('hub.tool.pyramids', 'Profils de pays'), description: t('hub.tool.pyramidsDesc', '6 catégories de pays'), accent: 'from-violet-500/15 to-fuchsia-500/5', priority: 'medium' },
      ],
    },
    {
      id: 'analyze',
      title: t('hub.category.analyze', 'Analyser'),
      description: t('hub.category.analyzeDesc', 'Tests de profil et outils d\'analyse personnalisée'),
      icon: Target,
      color: 'from-purple-500/20 to-pink-500/20',
      borderColor: 'border-purple-500/30',
      tools: [
        { href: '/quick-test', icon: Zap, label: t('hub.tool.quickTest', 'Test Rapide'), description: t('hub.tool.quickTestDesc', '2 min'), badge: t('common.popular', 'Populaire'), accent: 'from-amber-500/20 to-orange-500/5', priority: 'featured' },
        { href: '/tools/matcher', icon: Users, label: t('hub.tool.matcher', 'Trouver mon pays'), description: t('hub.tool.matcherDesc', '10 questions, top 5 pays'), badge: t('common.new', 'Nouveau'), accent: 'from-primary/20 to-fuchsia-500/5', priority: 'featured' },
        { href: '/profile-matcher', icon: Users, label: t('hub.tool.profileMatcher', 'Compatibilité avancée'), description: t('hub.tool.profileMatcherDesc', 'Analyse détaillée par profil'), accent: 'from-violet-500/15 to-pink-500/5', priority: 'high' },
        { href: '/life-trajectory', icon: TrendingUp, label: t('hub.tool.trajectory', 'Simulation de vie'), description: t('hub.tool.trajectoryDesc', 'Projetez-vous dans un pays'), accent: 'from-cyan-500/15 to-primary/5', priority: 'high' },
        { href: '/tools/fiscal-simulator', icon: Calculator, label: t('hub.tool.fiscalSim', 'Simulateur Fiscal'), description: t('hub.tool.fiscalSimDesc', 'Impôts + pouvoir d\'achat'), badge: t('common.new', 'Nouveau'), accent: 'from-emerald-500/15 to-primary/5', priority: 'high' },
        { href: '/fiscal-calculator', icon: Calculator, label: t('hub.tool.fiscalCalc', 'Calculateur Fiscal'), description: t('hub.tool.fiscalCalcDesc', 'Net vs Brut'), accent: 'from-slate-500/15 to-primary/5', priority: 'medium' },
        { href: '/profile-test', icon: User, label: t('hub.tool.profileTest', 'Test Complet'), description: t('hub.tool.profileTestDesc', '15 min'), accent: 'from-zinc-500/15 to-primary/5', priority: 'medium' },
      ],
    },
    {
      id: 'plan',
      title: t('hub.category.plan', 'Planifier'),
      description: t('hub.category.planDesc', 'Stratégies de sortie et prise de décision'),
      icon: Key,
      color: 'from-amber-500/20 to-orange-500/20',
      borderColor: 'border-amber-500/30',
      tools: [
        { href: '/exit-keys', icon: Key, label: t('hub.tool.exitKeys', 'Stratégies'), description: t('hub.tool.exitKeysDesc', 'Stratégies de sortie'), badge: t('common.popular', 'Populaire'), accent: 'from-amber-500/20 to-orange-500/5', priority: 'featured' },
        { href: '/trace', icon: FileText, label: t('hub.tool.traceJournal', 'Journal Décisions'), description: t('hub.tool.traceJournalDesc', 'Timeline + annotations + PDF'), badge: t('common.new', 'Nouveau'), accent: 'from-primary/20 to-amber-500/5', priority: 'featured' },
        { href: '/prevention-filter', icon: Shield, label: t('hub.tool.preventionFilter', 'Filtre Décision'), description: t('hub.tool.preventionFilterDesc', 'Anti-illusions'), accent: 'from-red-500/15 to-orange-500/5', priority: 'high' },
        { href: '/exit-keys/catalog', icon: FileText, label: t('hub.tool.catalog', 'Catalogue'), description: t('hub.tool.catalogDesc', '50+ clés'), accent: 'from-yellow-500/15 to-amber-500/5', priority: 'high' },
        { href: '/exit-keys/compare', icon: Scale, label: t('hub.tool.compareKeys', 'Comparer Clés'), description: t('hub.tool.compareKeysDesc', 'Analyse comparative'), accent: 'from-orange-500/15 to-red-500/5', priority: 'medium' },
      ],
    },
    {
      id: 'learn',
      title: t('hub.category.learn', 'Apprendre'),
      description: t('hub.category.learnDesc', 'Jeux éducatifs et progression gamifiée'),
      icon: Gamepad2,
      color: 'from-emerald-500/20 to-teal-500/20',
      borderColor: 'border-emerald-500/30',
      tools: [
        { href: '/pyramid-quiz', icon: Gamepad2, label: t('hub.tool.quiz', 'Quiz Découverte'), description: t('hub.tool.quizDesc', 'Testez vos connaissances'), accent: 'from-emerald-500/15 to-teal-500/5', priority: 'featured' },
        { href: '/life-game', icon: Play, label: t('hub.tool.lifeGame', 'Mode Éducatif'), description: t('hub.tool.lifeGameDesc', 'Simulation interactive'), accent: 'from-green-500/15 to-emerald-500/5', priority: 'high' },
        { href: '/gamification', icon: Award, label: t('hub.tool.gamification', 'Progression'), description: t('hub.tool.gamificationDesc', 'XP & badges'), badge: t('common.new', 'Nouveau'), accent: 'from-teal-500/15 to-cyan-500/5', priority: 'high' },
        { href: '/personas', icon: Users, label: t('hub.tool.personas', 'Parcours Persona'), description: t('hub.tool.personasDesc', 'Cas d\'usage et trajectoires'), accent: 'from-lime-500/15 to-emerald-500/5', priority: 'medium' },
        { href: '/how-to-read', icon: BookOpen, label: t('hub.tool.guide', 'Guide'), description: t('hub.tool.guideDesc', 'Mode d\'emploi'), accent: 'from-slate-500/15 to-emerald-500/5', priority: 'medium' },
      ],
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
        { href: '/institutions', icon: Building2, label: t('hub.tool.traceOS', 'TraceOS'), description: t('hub.tool.traceOSDesc', 'Audit institutionnel'), accent: 'from-slate-500/20 to-zinc-500/5', priority: 'featured' },
        { href: '/financial-safety-intel', icon: Shield, label: t('hub.tool.finIntel', 'Intel Financière'), description: t('hub.tool.finIntelDesc', 'Sécurité financière'), accent: 'from-cyan-500/15 to-blue-500/5', priority: 'featured' },
        { href: '/latent', icon: Eye, label: t('hub.tool.latent', 'Zones Latentes'), description: t('hub.tool.latentDesc', 'Risques cachés'), accent: 'from-violet-500/15 to-slate-500/5', priority: 'high' },
        { href: '/irreversa', icon: AlertCircle, label: t('hub.tool.irreversa', 'Irreversa'), description: t('hub.tool.irreversaDesc', 'Seuils critiques'), accent: 'from-rose-500/15 to-orange-500/5', priority: 'high' },
        { href: '/ovi', icon: Eye, label: t('hub.tool.ovi', 'OVI'), description: t('hub.tool.oviDesc', 'Observatoire'), accent: 'from-indigo-500/15 to-violet-500/5', priority: 'medium' },
        { href: '/academic', icon: BookOpen, label: t('hub.tool.academic', 'Académique'), description: t('hub.tool.academicDesc', 'Cadres d\'analyse et cas'), accent: 'from-zinc-500/15 to-slate-500/5', priority: 'medium' },
      ],
    },
    {
      id: 'connect',
      title: t('hub.category.connect', 'Communauté'),
      description: t('hub.category.connectDesc', 'Experts, partenaires et entraide'),
      icon: MessageSquare,
      color: 'from-rose-500/20 to-red-500/20',
      borderColor: 'border-rose-500/30',
      tools: [
        { href: '/experts', icon: Briefcase, label: t('hub.tool.experts', 'Experts'), description: t('hub.tool.expertsDesc', 'Marketplace'), accent: 'from-rose-500/15 to-red-500/5', priority: 'featured' },
        { href: '/community', icon: MessageSquare, label: t('hub.tool.community', 'Communauté'), description: t('hub.tool.communityDesc', 'Forum & events'), accent: 'from-pink-500/15 to-rose-500/5', priority: 'high' },
        { href: '/partner-services', icon: Users, label: t('hub.tool.partners', 'Partenaires'), description: t('hub.tool.partnersDesc', 'Services vérifiés'), accent: 'from-red-500/15 to-orange-500/5', priority: 'high' },
        { href: '/partners', icon: Sparkles, label: t('hub.tool.partnerProgram', 'Programme Partenaires'), description: t('hub.tool.partnerProgramDesc', 'Ambassadeurs & B2B'), accent: 'from-amber-500/15 to-rose-500/5', priority: 'high' },
        { href: '/b2b', icon: Building2, label: t('hub.tool.b2b', 'B2B'), description: t('hub.tool.b2bDesc', 'Solutions entreprises'), accent: 'from-slate-500/15 to-rose-500/5', priority: 'medium' },
      ],
    },
  ];

  const QUICK_ACCESS = [
    { href: '/dashboard', icon: LayoutDashboard, label: t('hub.quick.dashboard', 'Dashboard'), description: t('hub.quick.dashboardDesc', 'Vue d\'ensemble') },
    { href: '/usage', icon: BarChart3, label: t('hub.quick.usage', 'Consommation'), description: t('hub.quick.usageDesc', 'Quota & stats') },
    { href: '/settings/notifications', icon: Bell, label: t('hub.quick.notifications', 'Notifications'), description: t('hub.quick.notificationsDesc', 'Alertes') },
    { href: '/pricing', icon: CreditCard, label: t('hub.quick.pricing', 'Tarifs'), description: t('hub.quick.pricingDesc', 'Plans & pricing') },
  ];

  const FEATURED_TOOLS = TOOL_CATEGORIES.flatMap((category) =>
    category.tools
      .filter((tool) => tool.priority === 'featured')
      .slice(0, 2)
      .map((tool) => ({ ...tool, category: category.title })),
  ).slice(0, 4);

  return (
    <>
      <Helmet>
        <title>{t('hub.meta.title', 'Centre des Outils — Compass')}</title>
        <meta name="description" content={t('hub.meta.description', 'Accédez à tous les outils Compass : tests de profil, comparateur de pays, stratégies, calculateur fiscal, et plus.')} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={t('hub.meta.ogTitle', 'Centre des Outils — Compass')} />
        <meta property="og:description" content={t('hub.meta.ogDescription', 'Tous vos outils d\'analyse, de planification et de décision en un seul endroit.')} />
        <meta property="og:image" content={SITE_CONFIG.ogImageUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={t('hub.meta.ogTitle', 'Centre des Outils — Compass')} />
        <meta name="twitter:description" content={t('hub.meta.ogDescription', 'Tous vos outils d\'analyse, de planification et de décision en un seul endroit.')} />
        <meta name="twitter:image" content={SITE_CONFIG.ogImageUrl} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20 pt-16 md:pt-20">
        <div className="container mx-auto px-4 py-8 md:py-12 space-y-10 md:space-y-12">
          <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-card/70 px-6 py-8 shadow-[0_25px_80px_rgba(0,0,0,0.18)] backdrop-blur-xl md:px-10 md:py-12">
            <PremiumHero3D intensity="bold" />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative z-10 text-center"
            >
              <Badge variant="outline" className="mb-4 border-primary/30 bg-background/70 px-4 py-1 text-xs uppercase tracking-[0.25em] text-primary">
                Compass OS
              </Badge>
              <h1 className="text-3xl font-display font-bold md:text-5xl">
                {t('hub.title', 'Centre des Outils')}
              </h1>
              <p className="mx-auto mt-4 max-w-3xl text-sm text-muted-foreground md:text-base">
                {t('hub.subtitle', 'Tous vos outils d\'analyse, de planification et de décision en un seul endroit')}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {QUICK_ACCESS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-background/70 px-4 py-2 text-sm shadow-sm transition-all hover:border-primary/40 hover:bg-background"
                    >
                      <Icon className="h-4 w-4 text-primary" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </section>

          <section className="grid gap-4 lg:grid-cols-4">
            {FEATURED_TOOLS.map((tool, index) => {
              const ToolIcon = tool.icon;
              return (
                <motion.div
                  key={tool.href}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                >
                  <Link to={tool.href} className="group block h-full">
                    <Card className={cn('relative h-full overflow-hidden border-white/10 bg-card/80 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_18px_60px_rgba(0,0,0,0.18)]', tool.accent && `bg-gradient-to-br ${tool.accent}`)}>
                      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-70" />
                      <CardHeader className="space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="rounded-2xl border border-white/15 bg-background/70 p-3 shadow-sm backdrop-blur">
                            <ToolIcon className="h-5 w-5 text-primary" />
                          </div>
                          {tool.badge && <Badge>{tool.badge}</Badge>}
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{tool.category}</p>
                          <CardTitle className="mt-2 text-lg">{tool.label}</CardTitle>
                          <CardDescription className="mt-2 text-sm text-muted-foreground">{tool.description}</CardDescription>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="inline-flex items-center gap-2 text-sm font-medium text-primary">
                          {t('hub.openTool', 'Ouvrir l’outil')}
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </section>

          <div className="grid gap-6 md:gap-8">
            {TOOL_CATEGORIES.map((category, categoryIndex) => {
              const CategoryIcon = category.icon;
              const orderedTools = [...category.tools].sort((a, b) => {
                const rank = { featured: 0, high: 1, medium: 2 };
                return rank[a.priority ?? 'medium'] - rank[b.priority ?? 'medium'];
              });

              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + categoryIndex * 0.04 }}
                >
                  <Card className={cn('overflow-hidden border bg-card/70 backdrop-blur-xl', category.borderColor)}>
                    <CardHeader className={cn('bg-gradient-to-r', category.color)}>
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="rounded-xl bg-background/85 p-2 shadow-sm">
                            <CategoryIcon className="h-5 w-5 text-foreground" />
                          </div>
                          <div>
                            <CardTitle className="flex items-center gap-2 text-lg">
                              {category.title}
                              {category.badge && (
                                <Badge variant="secondary" className="text-xs">
                                  {category.badge}
                                </Badge>
                              )}
                            </CardTitle>
                            <CardDescription>{category.description}</CardDescription>
                          </div>
                        </div>
                        <Badge variant="outline" className="hidden sm:inline-flex bg-background/70">
                          {orderedTools.length} outils
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                        {orderedTools.map((tool) => {
                          const ToolIcon = tool.icon;

                          return (
                            <Link
                              key={tool.href}
                              to={tool.href}
                              className={cn('group relative rounded-2xl border border-border/50 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_16px_50px_rgba(0,0,0,0.12)]', tool.accent && `bg-gradient-to-br ${tool.accent}`)}
                            >
                              <div className="mb-4 flex items-start justify-between gap-3">
                                <div className="rounded-xl border border-white/15 bg-background/80 p-2 backdrop-blur-sm">
                                  <ToolIcon className="h-5 w-5 text-primary transition-transform duration-300 group-hover:scale-110" />
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                  {tool.badge && (
                                    <Badge variant="default" className="text-[10px] px-1.5 py-0">
                                      {tool.badge}
                                    </Badge>
                                  )}
                                  {tool.priority === 'featured' && (
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-background/70">
                                      {t('hub.recommended', 'Recommandé')}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="space-y-1.5">
                                <div className="font-medium text-sm">{tool.label}</div>
                                <div className="text-xs text-muted-foreground line-clamp-2">{tool.description}</div>
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

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }} className="text-center">
            <p className="mb-3 text-sm text-muted-foreground">{t('hub.help', 'Besoin d\'aide pour choisir ?')}</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/quick-test">
                <Badge variant="outline" className="cursor-pointer px-4 py-2 text-sm hover:bg-primary/10">🚀 {t('hub.startQuickTest', 'Commencer par le Test Rapide')}</Badge>
              </Link>
              <Link to="/tools/matcher">
                <Badge variant="outline" className="cursor-pointer px-4 py-2 text-sm hover:bg-primary/10">🧭 {t('hub.runMatcher', 'Lancer le Country Matcher')}</Badge>
              </Link>
              <Link to="/how-to-read">
                <Badge variant="outline" className="cursor-pointer px-4 py-2 text-sm hover:bg-primary/10">📖 {t('hub.readGuide', 'Lire le Guide')}</Badge>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
