import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Compass, 
  Target, 
  Key, 
  Map, 
  ArrowRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

const QUICK_START_STEPS = [
  {
    id: 'profile',
    icon: Target,
    titleKey: 'dashboard.quickStart.profile.title',
    descKey: 'dashboard.quickStart.profile.desc',
    link: '/exit-keys',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    id: 'test',
    icon: Sparkles,
    titleKey: 'dashboard.quickStart.test.title',
    descKey: 'dashboard.quickStart.test.desc',
    link: '/quick-test',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
  },
  {
    id: 'countries',
    icon: Map,
    titleKey: 'dashboard.quickStart.countries.title',
    descKey: 'dashboard.quickStart.countries.desc',
    link: '/countries',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
  },
  {
    id: 'exitKeys',
    icon: Key,
    titleKey: 'dashboard.quickStart.exitKeys.title',
    descKey: 'dashboard.quickStart.exitKeys.desc',
    link: '/exit-keys-catalog',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
];

interface EmptyDashboardStateProps {
  hasProfile?: boolean;
  hasExitKey?: boolean;
}

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
    <Card className="border-dashed border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
      <CardContent className="p-6 md:p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Compass className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">
            {t('dashboard.emptyState.title', 'Bienvenue sur Pyramid Compass')}
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            {t('dashboard.emptyState.subtitle', 'Commencez votre exploration en quelques étapes simples')}
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          {QUICK_START_STEPS.map((step) => {
            const StepIcon = step.icon;
            const status = getStepStatus(step.id);
            
            return (
              <Link 
                key={step.id} 
                to={step.link}
                className="block"
              >
                <div className={`
                  relative flex items-start gap-4 p-4 rounded-xl border transition-all
                  ${status === 'done' 
                    ? 'bg-muted/30 border-muted' 
                    : status === 'current'
                    ? 'bg-background border-primary/50 hover:border-primary shadow-sm'
                    : 'bg-background/50 border-border/50 hover:border-border'
                  }
                `}>
                  {/* Step Number / Check */}
                  <div className={`
                    flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                    ${status === 'done' 
                      ? 'bg-emerald-500/20 text-emerald-500' 
                      : status === 'current'
                      ? step.bgColor + ' ' + step.color
                      : 'bg-muted text-muted-foreground'
                    }
                  `}>
                    {status === 'done' ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <StepIcon className="w-4 h-4" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold mb-1 ${status === 'done' ? 'text-muted-foreground line-through' : ''}`}>
                      {t(step.titleKey, step.id)}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {t(step.descKey, '')}
                    </p>
                  </div>

                  {status === 'current' && (
                    <ArrowRight className={`w-5 h-5 flex-shrink-0 ${step.color}`} />
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Action */}
        <div className="text-center">
          <Button asChild size="lg" className="gap-2">
            <Link to={hasProfile ? '/quick-test' : '/exit-keys'}>
              {hasProfile 
                ? t('dashboard.emptyState.continueTest', 'Faire le test rapide')
                : t('dashboard.emptyState.startProfile', 'Créer mon profil')
              }
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}