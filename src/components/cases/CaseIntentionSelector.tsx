import { useTranslation } from 'react-i18next';
import { Home, Building2, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CaseIntention } from '@/hooks/useUserCases';

interface CaseIntentionSelectorProps {
  onSelect: (intention: CaseIntention) => void;
  countryName?: string;
}

export function CaseIntentionSelector({ onSelect, countryName }: CaseIntentionSelectorProps) {
  const { t } = useTranslation();

  const options: Array<{
    intention: CaseIntention;
    icon: React.ReactNode;
    title: string;
    description: string;
    features: string[];
    depth: 'LIGHT' | 'DEEP';
    badge?: string;
  }> = [
    {
      intention: 'relocation',
      icon: <Home className="w-8 h-8" />,
      title: t('cases.intention.relocation.title', 'Vivre / S\'installer'),
      description: t('cases.intention.relocation.description', 'Préparez votre installation avec une vue claire sur les démarches et risques'),
      features: [
        t('cases.intention.relocation.features.stability', 'Prévisibilité & stabilité'),
        t('cases.intention.relocation.features.admin', 'Checklist démarches'),
        t('cases.intention.relocation.features.timeline', 'Timeline réaliste'),
        t('cases.intention.relocation.features.redFlags', 'Drapeaux rouges'),
        t('cases.intention.relocation.features.tooLate', 'Ce qu\'on comprend trop tard'),
      ],
      depth: 'LIGHT',
    },
    {
      intention: 'entrepreneurship',
      icon: <Building2 className="w-8 h-8" />,
      title: t('cases.intention.entrepreneurship.title', 'Entreprendre / Implanter'),
      description: t('cases.intention.entrepreneurship.description', 'Analyse gouvernance complète pour projets d\'implantation'),
      features: [
        t('cases.intention.entrepreneurship.features.governance', 'Gouvernance & Stratégie'),
        t('cases.intention.entrepreneurship.features.riskRegister', 'Risk Register complet'),
        t('cases.intention.entrepreneurship.features.poc', 'POC Planner'),
        t('cases.intention.entrepreneurship.features.partners', 'Vetting partenaires'),
        t('cases.intention.entrepreneurship.features.antiCopy', 'Protection anti-copie'),
        t('cases.intention.entrepreneurship.features.cashReality', 'Cash Reality'),
      ],
      depth: 'DEEP',
      badge: 'B2B',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">
          {t('cases.intention.title', 'Quel est votre objectif ?')}
        </h2>
        {countryName && (
          <p className="text-muted-foreground">
            {t('cases.intention.subtitle', 'Pour votre projet en {{country}}', { country: countryName })}
          </p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {options.map((option) => (
          <Card
            key={option.intention}
            className="cursor-pointer transition-all hover:border-primary hover:shadow-lg group relative overflow-hidden"
            onClick={() => onSelect(option.intention)}
          >
            {option.badge && (
              <Badge className="absolute top-4 right-4 bg-primary">
                {option.badge}
              </Badge>
            )}
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${option.depth === 'DEEP' ? 'bg-primary/10 text-primary' : 'bg-secondary text-foreground'}`}>
                  {option.icon}
                </div>
                <div>
                  <CardTitle className="text-xl">{option.title}</CardTitle>
                  <Badge variant="outline" className="mt-1">
                    {option.depth === 'LIGHT' 
                      ? t('cases.depth.light', 'Mode Essentiel')
                      : t('cases.depth.deep', 'Mode Complet')
                    }
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                {option.description}
              </CardDescription>
              <ul className="space-y-2">
                {option.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <ChevronRight className="w-4 h-4 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-center text-sm text-muted-foreground">
        {t('cases.intention.note', 'Vous pourrez accéder aux fonctionnalités avancées à tout moment')}
      </p>
    </div>
  );
}
