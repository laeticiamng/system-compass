import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Users, 
  Monitor, 
  Target, 
  DollarSign, 
  Scale, 
  Building2,
  Briefcase,
  Shield,
  FileText
} from 'lucide-react';

interface DecisionTemplate {
  id: string;
  category: 'rh' | 'it' | 'strategy' | 'finance' | 'legal' | 'operations';
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  template: {
    title: string;
    context: string;
    mainHypothesis: string;
    alternativeHypotheses: string[];
    constraints: string[];
    scope: string;
  };
}

const templates: DecisionTemplate[] = [
  // RH Templates
  {
    id: 'rh-recruitment',
    category: 'rh',
    icon: Users,
    title: 'Recrutement stratégique',
    description: 'Décision de recrutement pour un poste clé',
    template: {
      title: 'Recrutement [Poste]',
      context: 'Besoin identifié suite à [croissance/départ/réorganisation]. Impact sur [équipe/projet].',
      mainHypothesis: 'Recruter un profil [junior/senior] avec expertise en [domaine]',
      alternativeHypotheses: [
        'Promotion interne d\'un collaborateur existant',
        'Externalisation de la fonction',
        'Réorganisation des responsabilités actuelles'
      ],
      constraints: [
        'Budget alloué : [montant]',
        'Délai de recrutement : [durée]',
        'Disponibilité du manager pour intégration'
      ],
      scope: 'RH / Direction'
    }
  },
  {
    id: 'rh-reorganization',
    category: 'rh',
    icon: Building2,
    title: 'Réorganisation d\'équipe',
    description: 'Restructuration ou fusion d\'équipes',
    template: {
      title: 'Réorganisation [Département]',
      context: 'Contexte de [transformation/optimisation/croissance] nécessitant une revue de l\'organisation.',
      mainHypothesis: 'Fusionner les équipes [A] et [B] sous une direction unique',
      alternativeHypotheses: [
        'Maintenir la structure actuelle avec coordination renforcée',
        'Créer une structure matricielle',
        'Externaliser certaines fonctions'
      ],
      constraints: [
        'Préserver les compétences clés',
        'Respecter les obligations sociales',
        'Limiter l\'impact sur les projets en cours'
      ],
      scope: 'Direction Générale'
    }
  },
  // IT Templates
  {
    id: 'it-migration',
    category: 'it',
    icon: Monitor,
    title: 'Migration technologique',
    description: 'Changement d\'infrastructure ou de stack',
    template: {
      title: 'Migration vers [Technologie/Plateforme]',
      context: 'Obsolescence de [système actuel] / Besoin de [scalabilité/performance/sécurité].',
      mainHypothesis: 'Migrer vers [nouvelle solution] avec approche [big bang/progressive]',
      alternativeHypotheses: [
        'Moderniser le système existant',
        'Adopter une solution hybride',
        'Externaliser vers un service managé'
      ],
      constraints: [
        'Budget projet : [montant]',
        'Fenêtre de migration : [période]',
        'Continuité de service requise',
        'Formation des équipes'
      ],
      scope: 'DSI / Direction'
    }
  },
  {
    id: 'it-security',
    category: 'it',
    icon: Shield,
    title: 'Politique de sécurité',
    description: 'Renforcement ou révision sécuritaire',
    template: {
      title: 'Renforcement sécurité [Périmètre]',
      context: 'Suite à [audit/incident/nouvelle réglementation], nécessité de renforcer la posture sécurité.',
      mainHypothesis: 'Implémenter [solution/politique] pour adresser [risque identifié]',
      alternativeHypotheses: [
        'Accepter le risque avec mesures compensatoires',
        'Transférer le risque (assurance)',
        'Éviter le risque en abandonnant l\'activité concernée'
      ],
      constraints: [
        'Conformité réglementaire (RGPD, NIS2...)',
        'Impact utilisateurs acceptable',
        'Budget sécurité disponible'
      ],
      scope: 'RSSI / DSI'
    }
  },
  // Strategy Templates
  {
    id: 'strategy-market',
    category: 'strategy',
    icon: Target,
    title: 'Entrée sur un marché',
    description: 'Expansion géographique ou sectorielle',
    template: {
      title: 'Expansion [Marché/Segment]',
      context: 'Opportunité identifiée sur [marché]. Potentiel estimé à [valeur]. Concurrence : [analyse].',
      mainHypothesis: 'Lancer une offre [produit/service] sur [marché] via [canal]',
      alternativeHypotheses: [
        'Partenariat avec acteur local établi',
        'Acquisition d\'un concurrent local',
        'Test en mode pilote avant déploiement'
      ],
      constraints: [
        'Investissement initial : [montant]',
        'ROI attendu : [horizon]',
        'Ressources humaines disponibles',
        'Risques réglementaires locaux'
      ],
      scope: 'Comité Stratégique'
    }
  },
  {
    id: 'strategy-pivot',
    category: 'strategy',
    icon: Briefcase,
    title: 'Pivot stratégique',
    description: 'Réorientation du modèle d\'affaires',
    template: {
      title: 'Pivot vers [Nouveau modèle]',
      context: 'Évolution du marché nécessitant une adaptation. [Menaces/Opportunités] identifiées.',
      mainHypothesis: 'Réorienter l\'offre vers [nouveau positionnement] en [horizon]',
      alternativeHypotheses: [
        'Diversification de l\'offre actuelle',
        'Consolidation sur le cœur de métier',
        'Recherche de nouveaux canaux de distribution'
      ],
      constraints: [
        'Préserver la base clients existante',
        'Capacité de financement de la transition',
        'Compétences à acquérir ou développer'
      ],
      scope: 'Direction Générale / Board'
    }
  },
  // Finance Templates
  {
    id: 'finance-investment',
    category: 'finance',
    icon: DollarSign,
    title: 'Décision d\'investissement',
    description: 'Allocation de capital importante',
    template: {
      title: 'Investissement [Projet/Asset]',
      context: 'Opportunité d\'investissement de [montant] dans [projet]. VAN estimée : [valeur]. TRI : [%].',
      mainHypothesis: 'Approuver l\'investissement avec [conditions]',
      alternativeHypotheses: [
        'Reporter l\'investissement à [date]',
        'Investissement partiel en phase 1',
        'Recherche de co-investisseurs'
      ],
      constraints: [
        'Capacité de financement disponible',
        'Impact sur les ratios financiers',
        'Cohérence avec la stratégie groupe',
        'Risques de marché'
      ],
      scope: 'CFO / Comité Financier'
    }
  },
  {
    id: 'finance-cost',
    category: 'finance',
    icon: Scale,
    title: 'Optimisation des coûts',
    description: 'Plan de réduction ou rationalisation',
    template: {
      title: 'Plan d\'optimisation [Périmètre]',
      context: 'Objectif de réduction de [X%] des coûts [opérationnels/structurels] sur [horizon].',
      mainHypothesis: 'Implémenter le plan [A] ciblant [postes de coûts]',
      alternativeHypotheses: [
        'Approche progressive par phases',
        'Focus sur l\'amélioration des revenus plutôt que réduction',
        'Externalisation de fonctions non-core'
      ],
      constraints: [
        'Maintenir la qualité de service',
        'Respecter les engagements contractuels',
        'Préserver les talents clés',
        'Timeline de mise en œuvre'
      ],
      scope: 'Direction Financière'
    }
  },
  // Legal Templates
  {
    id: 'legal-compliance',
    category: 'legal',
    icon: FileText,
    title: 'Mise en conformité',
    description: 'Adaptation réglementaire',
    template: {
      title: 'Conformité [Réglementation]',
      context: 'Nouvelle réglementation [nom] applicable au [date]. Écart de conformité identifié sur [périmètre].',
      mainHypothesis: 'Plan de mise en conformité en [X] phases d\'ici [date]',
      alternativeHypotheses: [
        'Demande de dérogation ou délai supplémentaire',
        'Externalisation de la fonction concernée',
        'Cessation de l\'activité non-conforme'
      ],
      constraints: [
        'Deadline réglementaire non négociable',
        'Sanctions en cas de non-conformité',
        'Budget compliance limité',
        'Ressources expertes requises'
      ],
      scope: 'Direction Juridique'
    }
  }
];

const categoryColors: Record<string, string> = {
  rh: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  it: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  strategy: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  finance: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  legal: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
  operations: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20'
};

const getCategoryLabel = (category: string, t: ReturnType<typeof useTranslation>['t']): string => {
  const labels: Record<string, string> = {
    rh: t('traceOS.categories.hr', 'RH'),
    it: t('traceOS.categories.it', 'IT'),
    strategy: t('traceOS.categories.strategy', 'Stratégie'),
    finance: t('traceOS.categories.finance', 'Finance'),
    legal: t('traceOS.categories.legal', 'Juridique'),
    operations: t('traceOS.categories.operations', 'Opérations')
  };
  return labels[category] || category;
};

interface DecisionTemplatesProps {
  onSelectTemplate: (template: DecisionTemplate['template']) => void;
}

export function DecisionTemplates({ onSelectTemplate }: DecisionTemplatesProps) {
  const { t } = useTranslation();

  const groupedTemplates = templates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, DecisionTemplate[]>);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {t('traceos.templates.title', 'Templates de décision')}
        </CardTitle>
        <CardDescription>
          {t('traceos.templates.description', 'Utilisez un template pour accélérer la création de votre décision')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96 pr-4">
          <div className="space-y-6">
            {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
              <div key={category} className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={categoryColors[category]}>
                    {getCategoryLabel(category, t)}
                  </Badge>
                </div>
                <div className="grid gap-3">
                  {categoryTemplates.map((template) => (
                    <Card 
                      key={template.id}
                      className="cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => onSelectTemplate(template.template)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${categoryColors[template.category]}`}>
                            <template.icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm">{template.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {template.description}
                            </p>
                          </div>
                          <Button size="sm" variant="ghost">
                            {t('traceos.templates.use', 'Utiliser')}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export type { DecisionTemplate };
