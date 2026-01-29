/**
 * ToolsHub - Central Hub for all platform tools and features
 * Provides clear categorization and easy access to all modules
 */

import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  Compass, Map, Globe, Triangle, Key, Scale, Gamepad2, 
  User, Users, Play, Shield, BarChart3, BookOpen, 
  Building2, Eye, AlertCircle, CreditCard, FileText,
  Calculator, Target, Zap, Award, MessageSquare, Briefcase,
  LayoutDashboard, Bell, TrendingUp, Lightbulb
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Tool categories with clear hierarchy
const TOOL_CATEGORIES = [
  {
    id: 'discover',
    title: 'Découvrir',
    description: 'Explorer les pays et comprendre les systèmes',
    icon: Compass,
    color: 'from-blue-500/20 to-cyan-500/20',
    borderColor: 'border-blue-500/30',
    tools: [
      { href: '/countries', icon: Map, label: 'Pays', description: 'Explorer 195+ pays' },
      { href: '/world-map', icon: Globe, label: 'Carte Monde', description: 'Vue interactive' },
      { href: '/pyramid-types', icon: Triangle, label: 'Pyramides', description: '6 types de systèmes' },
      { href: '/compare', icon: Scale, label: 'Comparer', description: 'Jusqu\'à 4 pays' },
      { href: '/terrain', icon: Map, label: 'Réalités Terrain', description: 'Vécu quotidien' },
    ],
  },
  {
    id: 'analyze',
    title: 'Analyser',
    description: 'Tests de profil et outils d\'analyse personnalisée',
    icon: Target,
    color: 'from-purple-500/20 to-pink-500/20',
    borderColor: 'border-purple-500/30',
    tools: [
      { href: '/quick-test', icon: Zap, label: 'Test Rapide', description: '2 min', badge: 'Populaire' },
      { href: '/profile-test', icon: User, label: 'Test Complet', description: '15 min' },
      { href: '/profile-matcher', icon: Users, label: 'Matcher Pays', description: 'Compatibilité' },
      { href: '/life-trajectory', icon: TrendingUp, label: 'Trajectoire', description: 'Simulation vie' },
      { href: '/fiscal-calculator', icon: Calculator, label: 'Calculateur Fiscal', description: 'Net vs Brut' },
    ],
  },
  {
    id: 'plan',
    title: 'Planifier',
    description: 'Stratégies de sortie et prise de décision',
    icon: Key,
    color: 'from-amber-500/20 to-orange-500/20',
    borderColor: 'border-amber-500/30',
    tools: [
      { href: '/exit-keys', icon: Key, label: 'Exit Keys', description: 'Stratégies de sortie' },
      { href: '/exit-keys/catalog', icon: FileText, label: 'Catalogue', description: '50+ clés' },
      { href: '/exit-keys/compare', icon: Scale, label: 'Comparer Clés', description: 'Analyse comparative' },
      { href: '/prevention-filter', icon: Shield, label: 'Filtre Décision', description: 'Anti-illusions' },
      { href: '/errors-illusions', icon: Lightbulb, label: 'Erreurs', description: 'Pièges à éviter' },
    ],
  },
  {
    id: 'learn',
    title: 'Apprendre',
    description: 'Jeux éducatifs et progression gamifiée',
    icon: Gamepad2,
    color: 'from-emerald-500/20 to-teal-500/20',
    borderColor: 'border-emerald-500/30',
    tools: [
      { href: '/pyramid-quiz', icon: Gamepad2, label: 'Quiz Pyramides', description: 'Testez vos connaissances' },
      { href: '/life-game', icon: Play, label: 'Mode Éducatif', description: 'Simulation interactive' },
      { href: '/gamification', icon: Award, label: 'Progression', description: 'XP & badges', badge: 'Nouveau' },
      { href: '/personas', icon: Users, label: 'Parcours Persona', description: 'Cas d\'usage' },
      { href: '/how-to-read', icon: BookOpen, label: 'Guide', description: 'Mode d\'emploi' },
    ],
  },
  {
    id: 'pro',
    title: 'Pro & Business',
    description: 'Modules avancés pour professionnels',
    icon: Building2,
    color: 'from-slate-500/20 to-zinc-500/20',
    borderColor: 'border-slate-500/30',
    badge: 'Pro',
    tools: [
      { href: '/institutions', icon: Building2, label: 'TraceOS', description: 'Audit institutionnel' },
      { href: '/latent', icon: Eye, label: 'Zones Latentes', description: 'Risques cachés' },
      { href: '/irreversa', icon: AlertCircle, label: 'Irreversa', description: 'Seuils critiques' },
      { href: '/ovi', icon: Eye, label: 'OVI', description: 'Observatoire' },
      { href: '/financial-safety-intel', icon: Shield, label: 'Intel Financière', description: 'Sécurité financière' },
    ],
  },
  {
    id: 'connect',
    title: 'Communauté',
    description: 'Experts, partenaires et entraide',
    icon: MessageSquare,
    color: 'from-rose-500/20 to-red-500/20',
    borderColor: 'border-rose-500/30',
    tools: [
      { href: '/experts', icon: Briefcase, label: 'Experts', description: 'Marketplace' },
      { href: '/community', icon: MessageSquare, label: 'Communauté', description: 'Forum & events' },
      { href: '/partner-services', icon: Users, label: 'Partenaires', description: 'Services vérifiés' },
      { href: '/b2b', icon: Building2, label: 'B2B', description: 'Solutions entreprises' },
    ],
  },
];

const QUICK_ACCESS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', description: 'Vue d\'ensemble' },
  { href: '/usage', icon: BarChart3, label: 'Consommation', description: 'Quota & stats' },
  { href: '/settings/notifications', icon: Bell, label: 'Notifications', description: 'Alertes' },
  { href: '/pricing', icon: CreditCard, label: 'Tarifs', description: 'Plans & pricing' },
];

export default function ToolsHub() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
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
                            {category.badge && (
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
                        return (
                          <Link
                            key={tool.href}
                            to={tool.href}
                            className="group relative p-3 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all text-center"
                          >
                            {'badge' in tool && tool.badge && (
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
                🚀 Commencer par le Test Rapide
              </Badge>
            </Link>
            <Link to="/how-to-read">
              <Badge variant="outline" className="px-4 py-2 text-sm hover:bg-primary/10 cursor-pointer">
                📖 Lire le Guide
              </Badge>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
