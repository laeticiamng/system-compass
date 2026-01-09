import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  TrendingUp, 
  Users, 
  Rocket, 
  AlertTriangle, 
  Target,
  ChevronDown,
  ChevronUp,
  Eye,
  HelpCircle,
  DollarSign,
  GitBranch,
  CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface UseCase {
  id: string;
  icon: any;
  title: string;
  description: string;
  color: string;
  variables: string[];
  uncertainties: string[];
  hiddenCosts: string[];
  blindSpots: string[];
  scenarios: { name: string; description: string }[];
}

export function InstitutionalUseCases() {
  const { t } = useTranslation();
  const [expandedCase, setExpandedCase] = useState<string | null>('strategic');

  const useCases: UseCase[] = [
    {
      id: 'strategic',
      icon: TrendingUp,
      title: t('institutions.useCases.strategic.title', 'Arbitrage stratégique'),
      description: t('institutions.useCases.strategic.desc', 'Investissements, priorités, allocation de ressources'),
      color: 'primary',
      variables: [
        t('institutions.useCases.strategic.var1', 'Montant et horizon d\'investissement'),
        t('institutions.useCases.strategic.var2', 'Retour attendu vs risque acceptable'),
        t('institutions.useCases.strategic.var3', 'Capacité d\'exécution interne'),
        t('institutions.useCases.strategic.var4', 'Dépendances externes (marché, réglementation)')
      ],
      uncertainties: [
        t('institutions.useCases.strategic.unc1', 'Évolution du marché à horizon X'),
        t('institutions.useCases.strategic.unc2', 'Réaction des concurrents'),
        t('institutions.useCases.strategic.unc3', 'Adoption interne du changement')
      ],
      hiddenCosts: [
        t('institutions.useCases.strategic.cost1', 'Coût d\'opportunité des options non prises'),
        t('institutions.useCases.strategic.cost2', 'Temps de transition et courbe d\'apprentissage'),
        t('institutions.useCases.strategic.cost3', 'Impact sur les projets existants')
      ],
      blindSpots: [
        t('institutions.useCases.strategic.blind1', 'Hypothèses implicites sur la croissance'),
        t('institutions.useCases.strategic.blind2', 'Surestimation de la capacité d\'absorption'),
        t('institutions.useCases.strategic.blind3', 'Négligence des signaux faibles')
      ],
      scenarios: [
        { name: t('institutions.useCases.strategic.scen1.name', 'Scénario A'), description: t('institutions.useCases.strategic.scen1.desc', 'Investissement progressif avec jalons') },
        { name: t('institutions.useCases.strategic.scen2.name', 'Scénario B'), description: t('institutions.useCases.strategic.scen2.desc', 'Investissement massif et rapide') },
        { name: t('institutions.useCases.strategic.scen3.name', 'Scénario C'), description: t('institutions.useCases.strategic.scen3.desc', 'Attente et observation du marché') }
      ]
    },
    {
      id: 'hr',
      icon: Users,
      title: t('institutions.useCases.hr.title', 'Décisions RH sensibles'),
      description: t('institutions.useCases.hr.desc', 'Mobilité, organisation, restructuration'),
      color: 'blue',
      variables: [
        t('institutions.useCases.hr.var1', 'Nombre de personnes concernées'),
        t('institutions.useCases.hr.var2', 'Compétences clés à préserver'),
        t('institutions.useCases.hr.var3', 'Délais légaux et conventionnels'),
        t('institutions.useCases.hr.var4', 'Budget disponible pour accompagnement')
      ],
      uncertainties: [
        t('institutions.useCases.hr.unc1', 'Réaction des équipes et du climat social'),
        t('institutions.useCases.hr.unc2', 'Rétention des talents critiques'),
        t('institutions.useCases.hr.unc3', 'Productivité pendant la transition')
      ],
      hiddenCosts: [
        t('institutions.useCases.hr.cost1', 'Perte de savoir tacite'),
        t('institutions.useCases.hr.cost2', 'Coût de recrutement futur'),
        t('institutions.useCases.hr.cost3', 'Impact sur la marque employeur')
      ],
      blindSpots: [
        t('institutions.useCases.hr.blind1', 'Sous-estimation de l\'attachement émotionnel'),
        t('institutions.useCases.hr.blind2', 'Réseaux informels de compétences'),
        t('institutions.useCases.hr.blind3', 'Effet sur les non-concernés')
      ],
      scenarios: [
        { name: t('institutions.useCases.hr.scen1.name', 'Scénario A'), description: t('institutions.useCases.hr.scen1.desc', 'Restructuration progressive avec reclassement') },
        { name: t('institutions.useCases.hr.scen2.name', 'Scénario B'), description: t('institutions.useCases.hr.scen2.desc', 'Externalisation partielle des fonctions') },
        { name: t('institutions.useCases.hr.scen3.name', 'Scénario C'), description: t('institutions.useCases.hr.scen3.desc', 'Réorganisation sans suppression de poste') }
      ]
    },
    {
      id: 'project',
      icon: Rocket,
      title: t('institutions.useCases.project.title', 'Lancement / arrêt de projets'),
      description: t('institutions.useCases.project.desc', 'Go/No-go, pivot, abandon'),
      color: 'emerald',
      variables: [
        t('institutions.useCases.project.var1', 'Investissement déjà réalisé (sunk cost)'),
        t('institutions.useCases.project.var2', 'Investissement restant nécessaire'),
        t('institutions.useCases.project.var3', 'Probabilité de succès estimée'),
        t('institutions.useCases.project.var4', 'Valeur en cas de succès')
      ],
      uncertainties: [
        t('institutions.useCases.project.unc1', 'Évolution des besoins du marché'),
        t('institutions.useCases.project.unc2', 'Capacité à tenir les délais'),
        t('institutions.useCases.project.unc3', 'Risques techniques non identifiés')
      ],
      hiddenCosts: [
        t('institutions.useCases.project.cost1', 'Coût de communication interne de l\'arrêt'),
        t('institutions.useCases.project.cost2', 'Démotivation des équipes'),
        t('institutions.useCases.project.cost3', 'Perte de crédibilité du sponsor')
      ],
      blindSpots: [
        t('institutions.useCases.project.blind1', 'Biais d\'engagement (sunk cost fallacy)'),
        t('institutions.useCases.project.blind2', 'Optimisme sur les estimations'),
        t('institutions.useCases.project.blind3', 'Pression sociale pour continuer')
      ],
      scenarios: [
        { name: t('institutions.useCases.project.scen1.name', 'Scénario A'), description: t('institutions.useCases.project.scen1.desc', 'Poursuite avec réduction de périmètre') },
        { name: t('institutions.useCases.project.scen2.name', 'Scénario B'), description: t('institutions.useCases.project.scen2.desc', 'Pivot vers une nouvelle cible') },
        { name: t('institutions.useCases.project.scen3.name', 'Scénario C'), description: t('institutions.useCases.project.scen3.desc', 'Arrêt propre avec capitalisation') }
      ]
    },
    {
      id: 'crisis',
      icon: AlertTriangle,
      title: t('institutions.useCases.crisis.title', 'Gestion de crise'),
      description: t('institutions.useCases.crisis.desc', 'Situations complexes, urgentes ou sensibles'),
      color: 'amber',
      variables: [
        t('institutions.useCases.crisis.var1', 'Nature et gravité de la crise'),
        t('institutions.useCases.crisis.var2', 'Parties prenantes impactées'),
        t('institutions.useCases.crisis.var3', 'Délai avant point de non-retour'),
        t('institutions.useCases.crisis.var4', 'Ressources mobilisables immédiatement')
      ],
      uncertainties: [
        t('institutions.useCases.crisis.unc1', 'Évolution de la situation'),
        t('institutions.useCases.crisis.unc2', 'Réaction des médias / opinion'),
        t('institutions.useCases.crisis.unc3', 'Comportement des parties prenantes')
      ],
      hiddenCosts: [
        t('institutions.useCases.crisis.cost1', 'Dommages réputationnels à long terme'),
        t('institutions.useCases.crisis.cost2', 'Épuisement des équipes'),
        t('institutions.useCases.crisis.cost3', 'Précédents juridiques créés')
      ],
      blindSpots: [
        t('institutions.useCases.crisis.blind1', 'Focalisation sur le symptôme vs la cause'),
        t('institutions.useCases.crisis.blind2', 'Victimes secondaires négligées'),
        t('institutions.useCases.crisis.blind3', 'Effet sur la confiance interne')
      ],
      scenarios: [
        { name: t('institutions.useCases.crisis.scen1.name', 'Scénario A'), description: t('institutions.useCases.crisis.scen1.desc', 'Communication proactive et transparente') },
        { name: t('institutions.useCases.crisis.scen2.name', 'Scénario B'), description: t('institutions.useCases.crisis.scen2.desc', 'Confinement et gestion en interne') },
        { name: t('institutions.useCases.crisis.scen3.name', 'Scénario C'), description: t('institutions.useCases.crisis.scen3.desc', 'Escalade vers les autorités compétentes') }
      ]
    },
    {
      id: 'longterm',
      icon: Target,
      title: t('institutions.useCases.longterm.title', 'Orientation long terme'),
      description: t('institutions.useCases.longterm.desc', 'Croissance, transformation, repositionnement'),
      color: 'purple',
      variables: [
        t('institutions.useCases.longterm.var1', 'Vision à 5-10 ans'),
        t('institutions.useCases.longterm.var2', 'Tendances structurelles du secteur'),
        t('institutions.useCases.longterm.var3', 'Capacités à développer'),
        t('institutions.useCases.longterm.var4', 'Partenariats stratégiques possibles')
      ],
      uncertainties: [
        t('institutions.useCases.longterm.unc1', 'Évolutions technologiques'),
        t('institutions.useCases.longterm.unc2', 'Changements réglementaires'),
        t('institutions.useCases.longterm.unc3', 'Évolution des attentes sociétales')
      ],
      hiddenCosts: [
        t('institutions.useCases.longterm.cost1', 'Inertie organisationnelle'),
        t('institutions.useCases.longterm.cost2', 'Résistance au changement'),
        t('institutions.useCases.longterm.cost3', 'Perte de focus sur le court terme')
      ],
      blindSpots: [
        t('institutions.useCases.longterm.blind1', 'Projection des tendances actuelles'),
        t('institutions.useCases.longterm.blind2', 'Sous-estimation des disruptions'),
        t('institutions.useCases.longterm.blind3', 'Biais de confirmation stratégique')
      ],
      scenarios: [
        { name: t('institutions.useCases.longterm.scen1.name', 'Scénario A'), description: t('institutions.useCases.longterm.scen1.desc', 'Transformation digitale accélérée') },
        { name: t('institutions.useCases.longterm.scen2.name', 'Scénario B'), description: t('institutions.useCases.longterm.scen2.desc', 'Diversification vers de nouveaux marchés') },
        { name: t('institutions.useCases.longterm.scen3.name', 'Scénario C'), description: t('institutions.useCases.longterm.scen3.desc', 'Consolidation et excellence opérationnelle') }
      ]
    }
  ];

  const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
    primary: { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20' },
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500/20' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'border-emerald-500/20' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-600', border: 'border-amber-500/20' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-600', border: 'border-purple-500/20' }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="font-display text-2xl font-bold mb-2">
          {t('institutions.useCases.title', 'Cas d\'usage institutionnels')}
        </h2>
        <p className="text-muted-foreground">
          {t('institutions.useCases.subtitle', 'Templates dédiés pour les décisions organisationnelles complexes')}
        </p>
      </div>

      <div className="space-y-4">
        {useCases.map((useCase) => {
          const Icon = useCase.icon;
          const colors = colorClasses[useCase.color];
          const isExpanded = expandedCase === useCase.id;

          return (
            <Collapsible
              key={useCase.id}
              open={isExpanded}
              onOpenChange={() => setExpandedCase(isExpanded ? null : useCase.id)}
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
                          <CardTitle className="text-lg">{useCase.title}</CardTitle>
                          <CardDescription>{useCase.description}</CardDescription>
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
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Variables */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                          <h4 className="font-semibold">{t('institutions.useCases.variables', 'Variables explicites')}</h4>
                        </div>
                        <ul className="space-y-2">
                          {useCase.variables.map((v, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                              {v}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Uncertainties */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <HelpCircle className="w-4 h-4 text-amber-500" />
                          <h4 className="font-semibold">{t('institutions.useCases.uncertainties', 'Zones d\'incertitude')}</h4>
                        </div>
                        <ul className="space-y-2">
                          {useCase.uncertainties.map((u, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                              {u}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Hidden Costs */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-red-500" />
                          <h4 className="font-semibold">{t('institutions.useCases.hiddenCosts', 'Coûts cachés')}</h4>
                        </div>
                        <ul className="space-y-2">
                          {useCase.hiddenCosts.map((c, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                              {c}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Blind Spots */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-purple-500" />
                          <h4 className="font-semibold">{t('institutions.useCases.blindSpots', 'Angles morts')}</h4>
                        </div>
                        <ul className="space-y-2">
                          {useCase.blindSpots.map((b, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                              {b}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Scenarios */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <GitBranch className="w-4 h-4 text-blue-500" />
                        <h4 className="font-semibold">{t('institutions.useCases.scenarios', 'Scénarios comparatifs')}</h4>
                      </div>
                      <div className="grid md:grid-cols-3 gap-3">
                        {useCase.scenarios.map((s, i) => (
                          <div key={i} className="p-4 rounded-lg bg-muted/50 border">
                            <Badge variant="outline" className="mb-2">{s.name}</Badge>
                            <p className="text-sm text-muted-foreground">{s.description}</p>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground italic text-center mt-2">
                        {t('institutions.useCases.noRecommendation', 'Ces scénarios sont présentés sans recommandation. L\'outil éclaire, il ne prescrit pas.')}
                      </p>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
}
