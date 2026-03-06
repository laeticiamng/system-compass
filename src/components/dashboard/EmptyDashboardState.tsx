import { useTranslation } from 'react-i18next';
import { LocalizedLink as Link } from '@/components/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { 
  Compass, 
  Target, 
  Key, 
  Map, 
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Zap
} from 'lucide-react';

const QUICK_START_STEPS = [
  {
    id: 'profile',
    icon: Target,
    titleKey: 'dashboard.quickStart.profile.title',
    titleFallback: 'Créer votre profil',
    descKey: 'dashboard.quickStart.profile.desc',
    descFallback: 'Définissez votre situation, vos objectifs et vos contraintes pour recevoir des recommandations personnalisées.',
    link: '/exit-keys',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    id: 'test',
    icon: Sparkles,
    titleKey: 'dashboard.quickStart.test.title',
    titleFallback: 'Test rapide (2 min)',
    descKey: 'dashboard.quickStart.test.desc',
    descFallback: 'Découvrez en quelques questions quels pays correspondent à votre profil.',
    link: '/quick-test',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
  },
  {
    id: 'countries',
    icon: Map,
    titleKey: 'dashboard.quickStart.countries.title',
    titleFallback: 'Explorer les pays',
    descKey: 'dashboard.quickStart.countries.desc',
    descFallback: 'Parcourez notre catalogue de 44 pays avec analyses détaillées et comparaisons.',
    link: '/countries',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
  },
  {
    id: 'exitKeys',
    icon: Key,
    titleKey: 'dashboard.quickStart.exitKeys.title',
    titleFallback: 'Clés de sortie',
    descKey: 'dashboard.quickStart.exitKeys.desc',
    descFallback: 'Accédez aux stratégies d\'expatriation adaptées à votre situation.',
    link: '/exit-keys-catalog',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
];

interface EmptyDashboardStateProps {
  hasProfile?: boolean;
  hasExitKey?: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export function EmptyDashboardState({ hasProfile = false, hasExitKey = false }: EmptyDashboardStateProps) {
  const { t } = useTranslation();

  const getStepStatus = (stepId: string): 'done' | 'current' | 'pending' => {
    if (stepId === 'profile' && hasProfile) return 'done';
    if (stepId === 'exitKeys' && hasExitKey) return 'done';
    if (stepId === 'profile' && !hasProfile) return 'current';
    if (stepId === 'test' && hasProfile && !hasExitKey) return 'current';
    return 'pending';
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Card className="border-dashed border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent overflow-hidden">
        <CardContent className="p-6 md:p-8">
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Compass className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {t('dashboard.emptyState.title', 'Bienvenue sur System Compass 🧭')}
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              {t('dashboard.emptyState.subtitle', 'Votre tableau de bord se remplira au fur et à mesure. Commencez par ces étapes :')}
            </p>
          </motion.div>

          {/* Steps Grid */}
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            {QUICK_START_STEPS.map((step, index) => {
              const StepIcon = step.icon;
              const status = getStepStatus(step.id);
              
              return (
                <motion.div key={step.id} variants={itemVariants}>
                  <Link 
                    to={step.link}
                    className="block group"
                  >
                    <div className={`
                      relative flex items-start gap-4 p-4 rounded-xl border transition-all duration-200
                      ${status === 'done' 
                        ? 'bg-muted/30 border-muted opacity-70' 
                        : status === 'current'
                        ? 'bg-background border-primary/50 hover:border-primary shadow-sm hover:shadow-md'
                        : 'bg-background/50 border-border/50 hover:border-border hover:bg-background/80'
                      }
                    `}>
                      {/* Step indicator */}
                      <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                        {status === 'done' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : index + 1}
                      </div>

                      {/* Icon */}
                      <div className={`
                        flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110
                        ${status === 'done' 
                          ? 'bg-emerald-500/20 text-emerald-500' 
                          : step.bgColor + ' ' + step.color
                        }
                      `}>
                        {status === 'done' ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <StepIcon className="w-5 h-5" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold mb-1 text-sm ${status === 'done' ? 'text-muted-foreground line-through' : ''}`}>
                          {t(step.titleKey, step.titleFallback)}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {t(step.descKey, step.descFallback)}
                        </p>
                      </div>

                      {status === 'current' && (
                        <ArrowRight className={`w-5 h-5 flex-shrink-0 ${step.color} transition-transform group-hover:translate-x-1`} />
                      )}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Quick Action */}
          <motion.div variants={itemVariants} className="text-center">
            <Button asChild size="lg" className="gap-2 btn-premium text-primary-foreground">
              <Link to={hasProfile ? '/quick-test' : '/exit-keys'}>
                <Zap className="w-4 h-4" />
                {hasProfile 
                  ? t('dashboard.emptyState.continueTest', 'Faire le test rapide')
                  : t('dashboard.emptyState.startProfile', 'Commencer maintenant')
                }
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
