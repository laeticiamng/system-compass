import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Brain, 
  Clock, 
  Gauge, 
  ArrowRight,
  Eye,
  Sparkles
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface OVISuggestionsProps {
  context: 'prevention-filter' | 'compare' | 'trajectory' | 'country';
  decisionType?: string;
  visible?: boolean;
}

interface Suggestion {
  id: string;
  icon: any;
  title: string;
  relevance: string;
  color: string;
}

export function OVISuggestions({ context, visible = true }: OVISuggestionsProps) {
  const { t } = useTranslation();

  if (!visible) return null;

  // Generate contextual suggestions based on simulation type
  const getSuggestions = (): Suggestion[] => {
    const allSuggestions: Record<string, Suggestion[]> = {
      'prevention-filter': [
        {
          id: 'irreversible-decisions',
          icon: Clock,
          title: t('ovi.frameworks.irreversible.title', 'Irreversible Decisions'),
          relevance: t('ovi.suggestions.relevantTo', 'Relevant to your analysis'),
          color: 'amber'
        },
        {
          id: 'cognitive-bias',
          icon: Brain,
          title: t('ovi.frameworks.bias.title', 'Cognitive Biases'),
          relevance: t('ovi.suggestions.relevantTo', 'Relevant to your analysis'),
          color: 'primary'
        }
      ],
      'compare': [
        {
          id: 'control-illusion',
          icon: Gauge,
          title: t('ovi.frameworks.control.title', 'Illusion of Control'),
          relevance: t('ovi.suggestions.relevantTo', 'Relevant to your analysis'),
          color: 'purple'
        },
        {
          id: 'cognitive-bias',
          icon: Brain,
          title: t('ovi.frameworks.bias.title', 'Cognitive Biases'),
          relevance: t('ovi.suggestions.relevantTo', 'Relevant to your analysis'),
          color: 'primary'
        }
      ],
      'trajectory': [
        {
          id: 'individual-vs-system',
          icon: Eye,
          title: t('ovi.frameworks.individual.title', 'Individual vs System'),
          relevance: t('ovi.suggestions.relevantTo', 'Relevant to your analysis'),
          color: 'blue'
        },
        {
          id: 'irreversible-decisions',
          icon: Clock,
          title: t('ovi.frameworks.irreversible.title', 'Irreversible Decisions'),
          relevance: t('ovi.suggestions.relevantTo', 'Relevant to your analysis'),
          color: 'amber'
        }
      ],
      'country': [
        {
          id: 'control-illusion',
          icon: Gauge,
          title: t('ovi.frameworks.control.title', 'Illusion of Control'),
          relevance: t('ovi.suggestions.relevantTo', 'Relevant to your analysis'),
          color: 'purple'
        },
        {
          id: 'individual-vs-system',
          icon: Eye,
          title: t('ovi.frameworks.individual.title', 'Individual vs System'),
          relevance: t('ovi.suggestions.relevantTo', 'Relevant to your analysis'),
          color: 'blue'
        }
      ]
    };

    return allSuggestions[context] || allSuggestions['prevention-filter'];
  };

  const suggestions = getSuggestions();

  const colorClasses: Record<string, { bg: string; text: string }> = {
    primary: { bg: 'bg-primary/10', text: 'text-primary' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-600' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-600' },
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-600' }
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
            <Eye className="w-3.5 h-3.5 text-primary" />
          </div>
          <h4 className="font-medium text-sm">
            {t('ovi.suggestions.title', 'Suggested readings from OVI')}
          </h4>
          <Badge variant="outline" className="ml-auto text-xs border-primary/30">
            <Sparkles className="w-3 h-3 mr-1" />
            Premium
          </Badge>
        </div>

        <p className="text-xs text-muted-foreground mb-3">
          {t('ovi.suggestions.subtitle', 'Enrich your reflection with relevant frameworks')}
        </p>

        <div className="space-y-2">
          {suggestions.map((suggestion) => {
            const Icon = suggestion.icon;
            const colors = colorClasses[suggestion.color];

            return (
              <Link 
                key={suggestion.id} 
                to={`/ovi?article=${suggestion.id}`}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${colors.text}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                    {suggestion.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{suggestion.relevance}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            );
          })}
        </div>

        <div className="mt-3 pt-3 border-t">
          <Link to="/ovi">
            <Button variant="ghost" size="sm" className="w-full gap-2 text-xs">
              {t('ovi.suggestions.viewMore', 'View in OVI')}
              <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
