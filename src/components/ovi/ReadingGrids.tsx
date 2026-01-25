import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Grid3X3, 
  ArrowLeftRight,
  User,
  Eye,
  Layers,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  HelpCircle,
  Briefcase,
  Heart,
  Building2,
  Rocket
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface Grid {
  id: string;
  icon: any;
  title: string;
  description: string;
  color: string;
  dimensions: { left: string; right: string };
  applications: { domain: string; icon: any; examples: { left: string; right: string }[] }[];
  questions: string[];
}

export function ReadingGrids() {
  const { t } = useTranslation();
  const [expandedGrid, setExpandedGrid] = useState<string | null>('reversibility');

  const grids: Grid[] = [
    {
      id: 'reversibility',
      icon: ArrowLeftRight,
      title: t('ovi.grids.reversibility.title', 'Réversible / Irréversible'),
      description: t('ovi.grids.reversibility.desc', 'Distinguer ce qui peut être défait de ce qui engage définitivement'),
      color: 'primary',
      dimensions: { 
        left: t('ovi.grids.reversibility.left', 'Réversible'), 
        right: t('ovi.grids.reversibility.right', 'Irréversible') 
      },
      applications: [
        {
          domain: t('ovi.domains.personal', 'Vie personnelle'),
          icon: Heart,
          examples: [
            { left: t('ovi.grids.reversibility.personal.left1', 'Changer de ville'), right: t('ovi.grids.reversibility.personal.right1', 'Avoir un enfant') },
            { left: t('ovi.grids.reversibility.personal.left2', 'Essayer un nouveau hobby'), right: t('ovi.grids.reversibility.personal.right2', 'Brûler un pont relationnel') }
          ]
        },
        {
          domain: t('ovi.domains.career', 'Carrière'),
          icon: Briefcase,
          examples: [
            { left: t('ovi.grids.reversibility.career.left1', 'Prendre un congé sabbatique'), right: t('ovi.grids.reversibility.career.right1', 'Quitter avec éclat') },
            { left: t('ovi.grids.reversibility.career.left2', 'Tester un side-project'), right: t('ovi.grids.reversibility.career.right2', 'Perdre une certification') }
          ]
        },
        {
          domain: t('ovi.domains.organization', 'Organisation'),
          icon: Building2,
          examples: [
            { left: t('ovi.grids.reversibility.org.left1', 'Réorganiser une équipe'), right: t('ovi.grids.reversibility.org.right1', 'Licencier un expert clé') },
            { left: t('ovi.grids.reversibility.org.left2', 'Tester un nouveau process'), right: t('ovi.grids.reversibility.org.right2', 'Fusionner des entités') }
          ]
        },
        {
          domain: t('ovi.domains.projects', 'Projets complexes'),
          icon: Rocket,
          examples: [
            { left: t('ovi.grids.reversibility.project.left1', 'Changer de stack technique'), right: t('ovi.grids.reversibility.project.right1', 'Signer un contrat exclusif') },
            { left: t('ovi.grids.reversibility.project.left2', 'Reporter un lancement'), right: t('ovi.grids.reversibility.project.right2', 'Publier une annonce') }
          ]
        }
      ],
      questions: [
        t('ovi.grids.reversibility.q1', 'Cette décision peut-elle être annulée ou ajustée plus tard ?'),
        t('ovi.grids.reversibility.q2', 'Quel est le coût réel d\'un retour en arrière ?'),
        t('ovi.grids.reversibility.q3', 'Suis-je en train de confondre "difficile à défaire" et "impossible à défaire" ?')
      ]
    },
    {
      id: 'agency',
      icon: User,
      title: t('ovi.grids.agency.title', 'Moi / Système'),
      description: t('ovi.grids.agency.desc', 'Cartographier ce qui dépend de notre action et ce qui nous dépasse'),
      color: 'amber',
      dimensions: { 
        left: t('ovi.grids.agency.left', 'Dépend de moi'), 
        right: t('ovi.grids.agency.right', 'Dépend du système') 
      },
      applications: [
        {
          domain: t('ovi.domains.personal', 'Vie personnelle'),
          icon: Heart,
          examples: [
            { left: t('ovi.grids.agency.personal.left1', 'Mon effort quotidien'), right: t('ovi.grids.agency.personal.right1', 'Le marché immobilier') },
            { left: t('ovi.grids.agency.personal.left2', 'Ma gestion du temps'), right: t('ovi.grids.agency.personal.right2', 'Les normes sociales') }
          ]
        },
        {
          domain: t('ovi.domains.career', 'Carrière'),
          icon: Briefcase,
          examples: [
            { left: t('ovi.grids.agency.career.left1', 'Mes compétences'), right: t('ovi.grids.agency.career.right1', 'La conjoncture économique') },
            { left: t('ovi.grids.agency.career.left2', 'Ma préparation aux entretiens'), right: t('ovi.grids.agency.career.right2', 'La politique interne') }
          ]
        },
        {
          domain: t('ovi.domains.organization', 'Organisation'),
          icon: Building2,
          examples: [
            { left: t('ovi.grids.agency.org.left1', 'La qualité de mon management'), right: t('ovi.grids.agency.org.right1', 'Les décisions du groupe') },
            { left: t('ovi.grids.agency.org.left2', 'La culture que je crée'), right: t('ovi.grids.agency.org.right2', 'La réglementation') }
          ]
        },
        {
          domain: t('ovi.domains.projects', 'Projets complexes'),
          icon: Rocket,
          examples: [
            { left: t('ovi.grids.agency.project.left1', 'L\'exécution'), right: t('ovi.grids.agency.project.right1', 'L\'adoption par le marché') },
            { left: t('ovi.grids.agency.project.left2', 'Le choix des partenaires'), right: t('ovi.grids.agency.project.right2', 'Les délais administratifs') }
          ]
        }
      ],
      questions: [
        t('ovi.grids.agency.q1', 'Sur quoi ai-je vraiment prise dans cette situation ?'),
        t('ovi.grids.agency.q2', 'Est-ce que je surestime ou sous-estime mon pouvoir d\'action ?'),
        t('ovi.grids.agency.q3', 'Quelles contraintes systémiques dois-je accepter comme données ?')
      ]
    },
    {
      id: 'visibility',
      icon: Eye,
      title: t('ovi.grids.visibility.title', 'Visible / Invisible'),
      description: t('ovi.grids.visibility.desc', 'Identifier ce qui est apparent et ce qui reste caché'),
      color: 'purple',
      dimensions: { 
        left: t('ovi.grids.visibility.left', 'Visible aujourd\'hui'), 
        right: t('ovi.grids.visibility.right', 'Invisible aujourd\'hui') 
      },
      applications: [
        {
          domain: t('ovi.domains.personal', 'Vie personnelle'),
          icon: Heart,
          examples: [
            { left: t('ovi.grids.visibility.personal.left1', 'Le salaire actuel'), right: t('ovi.grids.visibility.personal.right1', 'L\'usure relationnelle') },
            { left: t('ovi.grids.visibility.personal.left2', 'Le confort matériel'), right: t('ovi.grids.visibility.personal.right2', 'Le coût d\'opportunité') }
          ]
        },
        {
          domain: t('ovi.domains.career', 'Carrière'),
          icon: Briefcase,
          examples: [
            { left: t('ovi.grids.visibility.career.left1', 'Le titre du poste'), right: t('ovi.grids.visibility.career.right1', 'L\'apprentissage réel') },
            { left: t('ovi.grids.visibility.career.left2', 'La rémunération'), right: t('ovi.grids.visibility.career.right2', 'L\'impact sur la santé') }
          ]
        },
        {
          domain: t('ovi.domains.organization', 'Organisation'),
          icon: Building2,
          examples: [
            { left: t('ovi.grids.visibility.org.left1', 'Les KPIs'), right: t('ovi.grids.visibility.org.right1', 'Le moral des équipes') },
            { left: t('ovi.grids.visibility.org.left2', 'Le chiffre d\'affaires'), right: t('ovi.grids.visibility.org.right2', 'La dette technique') }
          ]
        },
        {
          domain: t('ovi.domains.projects', 'Projets complexes'),
          icon: Rocket,
          examples: [
            { left: t('ovi.grids.visibility.project.left1', 'Le MVP'), right: t('ovi.grids.visibility.project.right1', 'La complexité de la maintenance') },
            { left: t('ovi.grids.visibility.project.left2', 'Les premiers clients'), right: t('ovi.grids.visibility.project.right2', 'Le product-market fit réel') }
          ]
        }
      ],
      questions: [
        t('ovi.grids.visibility.q1', 'Qu\'est-ce que je ne vois pas encore dans cette situation ?'),
        t('ovi.grids.visibility.q2', 'Quels coûts ou bénéfices n\'apparaîtront que plus tard ?'),
        t('ovi.grids.visibility.q3', 'Suis-je en train de me fier uniquement à ce qui est mesurable ?')
      ]
    }
  ];

  const colorClasses: Record<string, { bg: string; text: string; border: string; leftBg: string; rightBg: string }> = {
    primary: { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20', leftBg: 'bg-emerald-500/10', rightBg: 'bg-red-500/10' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-600', border: 'border-amber-500/20', leftBg: 'bg-blue-500/10', rightBg: 'bg-gray-500/10' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-600', border: 'border-purple-500/20', leftBg: 'bg-primary/10', rightBg: 'bg-muted' }
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 mb-4">
          <Grid3X3 className="w-8 h-8 text-amber-600" />
        </div>
        <h2 className="font-display text-2xl font-bold mb-2">
          {t('ovi.grids.title', 'Grilles de lecture')}
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {t('ovi.grids.subtitle', 'Grilles transversales applicables à la vie personnelle, carrière, organisation et projets complexes.')}
        </p>
      </div>

      <div className="space-y-4">
        {grids.map((grid) => {
          const Icon = grid.icon;
          const colors = colorClasses[grid.color];
          const isExpanded = expandedGrid === grid.id;

          return (
            <Collapsible
              key={grid.id}
              open={isExpanded}
              onOpenChange={() => setExpandedGrid(isExpanded ? null : grid.id)}
            >
              <Card className={cn('transition-all', isExpanded && colors.border)}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', colors.bg)}>
                          <Icon className={cn('w-6 h-6', colors.text)} />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{grid.title}</CardTitle>
                          <CardDescription>{grid.description}</CardDescription>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="pt-0 space-y-6">
                    {/* Dimension Headers */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className={cn('p-4 rounded-lg text-center font-medium', colors.leftBg)}>
                        {grid.dimensions.left}
                      </div>
                      <div className={cn('p-4 rounded-lg text-center font-medium', colors.rightBg)}>
                        {grid.dimensions.right}
                      </div>
                    </div>

                    {/* Applications by Domain */}
                    {grid.applications.map((app, idx) => {
                      const DomainIcon = app.icon;
                      return (
                        <div key={idx}>
                          <div className="flex items-center gap-2 mb-3">
                            <DomainIcon className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{app.domain}</span>
                          </div>
                          <div className="space-y-2">
                            {app.examples.map((ex, i) => (
                              <div key={i} className="grid grid-cols-2 gap-4">
                                <div className={cn('p-3 rounded-lg text-sm', colors.leftBg)}>
                                  <CheckCircle2 className="w-3 h-3 inline mr-2 text-emerald-500" />
                                  {ex.left}
                                </div>
                                <div className={cn('p-3 rounded-lg text-sm', colors.rightBg)}>
                                  <HelpCircle className="w-3 h-3 inline mr-2 text-muted-foreground" />
                                  {ex.right}
                                </div>
                              </div>
                            ))}
                          </div>
                          {idx < grid.applications.length - 1 && <Separator className="my-4" />}
                        </div>
                      );
                    })}

                    {/* Guiding Questions */}
                    <div className="bg-muted/30 rounded-xl p-4">
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <HelpCircle className="w-4 h-4" />
                        {t('ovi.grids.questions', 'Questions à se poser')}
                      </h4>
                      <ul className="space-y-2">
                        {grid.questions.map((q, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-primary">→</span>
                            {q}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}
      </div>

      {/* Usage Note */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Layers className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <h4 className="font-medium mb-1">{t('ovi.grids.usage.title', 'Comment utiliser ces grilles')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('ovi.grids.usage.desc', 'Ces grilles ne sont pas des formules magiques. Elles sont des lentilles — des façons de regarder une situation sous un angle différent. Utilisez-les pour questionner, pas pour conclure.')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
