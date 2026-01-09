import { useTranslation } from 'react-i18next';
import { 
  Brain, 
  Clock, 
  Gauge, 
  Zap, 
  User,
  ArrowRight,
  BookOpen,
  Timer,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Framework {
  id: string;
  icon: any;
  title: string;
  subtitle: string;
  color: string;
  readTime: string;
  tags: string[];
  preview: string;
}

interface ReflectionFrameworksProps {
  onSelectArticle: (id: string) => void;
}

export function ReflectionFrameworks({ onSelectArticle }: ReflectionFrameworksProps) {
  const { t } = useTranslation();

  const frameworks: Framework[] = [
    {
      id: 'cognitive-bias',
      icon: Brain,
      title: t('ovi.frameworks.bias.title', 'Biais cognitifs'),
      subtitle: t('ovi.frameworks.bias.subtitle', 'Les filtres invisibles de nos décisions'),
      color: 'primary',
      readTime: t('ovi.readTime', '{{min}} min', { min: 8 }),
      tags: [t('ovi.tags.psychology', 'Psychologie'), t('ovi.tags.decision', 'Décision')],
      preview: t('ovi.frameworks.bias.preview', 'Nos cerveaux sont équipés de raccourcis qui nous font gagner du temps — et parfois nous font perdre en lucidité. Ce cadre explore les principaux biais qui affectent nos décisions importantes.')
    },
    {
      id: 'irreversible-decisions',
      icon: Clock,
      title: t('ovi.frameworks.irreversible.title', 'Décisions irréversibles'),
      subtitle: t('ovi.frameworks.irreversible.subtitle', 'Distinguer ce qui peut être défait de ce qui ne peut pas l\'être'),
      color: 'amber',
      readTime: t('ovi.readTime', '{{min}} min', { min: 6 }),
      tags: [t('ovi.tags.strategy', 'Stratégie'), t('ovi.tags.risk', 'Risque')],
      preview: t('ovi.frameworks.irreversible.preview', 'Toutes les décisions ne se valent pas. Certaines peuvent être annulées ou ajustées ; d\'autres engagent définitivement. Ce cadre propose une méthode pour les distinguer.')
    },
    {
      id: 'control-illusion',
      icon: Gauge,
      title: t('ovi.frameworks.control.title', 'Illusion de contrôle'),
      subtitle: t('ovi.frameworks.control.subtitle', 'Ce qui dépend vraiment de nous'),
      color: 'purple',
      readTime: t('ovi.readTime', '{{min}} min', { min: 7 }),
      tags: [t('ovi.tags.philosophy', 'Philosophie'), t('ovi.tags.systems', 'Systèmes')],
      preview: t('ovi.frameworks.control.preview', 'Nous surestimons souvent notre influence sur les événements. Ce cadre aide à cartographier ce qui relève de notre action et ce qui dépend de forces extérieures.')
    },
    {
      id: 'speed-vs-rush',
      icon: Zap,
      title: t('ovi.frameworks.speed.title', 'Vitesse vs Précipitation'),
      subtitle: t('ovi.frameworks.speed.subtitle', 'Agir vite n\'est pas agir dans l\'urgence'),
      color: 'emerald',
      readTime: t('ovi.readTime', '{{min}} min', { min: 5 }),
      tags: [t('ovi.tags.execution', 'Exécution'), t('ovi.tags.timing', 'Timing')],
      preview: t('ovi.frameworks.speed.preview', 'La vitesse peut être un atout stratégique. La précipitation est toujours un risque. Ce cadre propose des critères pour distinguer l\'une de l\'autre.')
    },
    {
      id: 'individual-vs-system',
      icon: User,
      title: t('ovi.frameworks.individual.title', 'Individu vs Système'),
      subtitle: t('ovi.frameworks.individual.subtitle', 'Responsabilité personnelle et contraintes structurelles'),
      color: 'blue',
      readTime: t('ovi.readTime', '{{min}} min', { min: 9 }),
      tags: [t('ovi.tags.sociology', 'Sociologie'), t('ovi.tags.responsibility', 'Responsabilité')],
      preview: t('ovi.frameworks.individual.preview', 'Où s\'arrête la responsabilité individuelle ? Où commence la contrainte systémique ? Ce cadre explore cette frontière floue mais cruciale.')
    }
  ];

  const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
    primary: { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-600', border: 'border-amber-500/20' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-600', border: 'border-purple-500/20' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'border-emerald-500/20' },
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500/20' }
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Brain className="w-8 h-8 text-primary" />
        </div>
        <h2 className="font-display text-2xl font-bold mb-2">
          {t('ovi.frameworks.title', 'Cadres de réflexion')}
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {t('ovi.frameworks.subtitle', 'Articles courts et structurants. Pas d\'opinion, des cadres pour penser.')}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {frameworks.map((framework) => {
          const Icon = framework.icon;
          const colors = colorClasses[framework.color];

          return (
            <Card 
              key={framework.id} 
              className={`group hover:shadow-lg transition-all cursor-pointer ${colors.border}`}
              onClick={() => onSelectArticle(framework.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${colors.text}`} />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Timer className="w-3 h-3" />
                    {framework.readTime}
                  </div>
                </div>
                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                  {framework.title}
                </CardTitle>
                <CardDescription>{framework.subtitle}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {framework.preview}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {framework.tags.map((tag, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Button variant="ghost" size="sm" className="gap-1 group-hover:text-primary">
                    {t('ovi.frameworks.read', 'Lire')}
                    <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Disclaimer */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Eye className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">
                {t('ovi.frameworks.disclaimer', 'Ces cadres sont des outils de réflexion, pas des vérités absolues. Ils visent à structurer la pensée, pas à la remplacer. Chaque situation mérite sa propre analyse.')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
