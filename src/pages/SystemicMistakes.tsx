import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  AlertTriangle, 
  Clock, 
  Zap, 
  Coins, 
  TrendingDown,
  ArrowRight,
  GraduationCap,
  Plane,
  Building2,
  Users,
  Shield,
  Target,
  Shuffle,
  Gem
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SimulationDisclaimer } from '@/components/SimulationDisclaimer';

interface SystemicMistake {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  typicalContext: string;
  pyramidTypes: { type: string; label: string; color: string }[];
  consequences: {
    time: string;
    energy: string;
    money: string;
    stagnation: string;
  };
  relatedExitKeys?: string[];
}

const SYSTEMIC_MISTAKES: SystemicMistake[] = [
  {
    id: 'country-without-understanding',
    icon: Plane,
    title: "Changer de pays sans comprendre ce que le système récompense",
    description: "Immigrer en pensant que l'effort seul suffit, sans analyser les mécanismes réels de réussite du pays cible.",
    typicalContext: "Professionnel compétent qui quitte un pays de rente problème pour un pays de stabilité-redistribution, s'attendant à être récompensé pour sa seule valeur ajoutée.",
    pyramidTypes: [
      { type: 'PROBLEM_RENT', label: 'Rente du problème', color: 'pyramid-rent' },
      { type: 'STABILITY_REDIS', label: 'Redistribution stabilité', color: 'pyramid-stability' }
    ],
    consequences: {
      time: "3-7 ans de positionnement inadapté",
      energy: "Épuisement face aux obstacles non anticipés",
      money: "Investissement dans les mauvaises certifications ou réseaux",
      stagnation: "Stagnation professionnelle malgré les compétences"
    },
    relatedExitKeys: ['visa-skilled-worker', 'entrepreneur-visa']
  },
  {
    id: 'diplomas-in-network-system',
    icon: GraduationCap,
    title: "Accumuler des diplômes dans un système de réseau",
    description: "Investir des années et des ressources dans l'éducation formelle dans un pays où les connexions priment sur les qualifications.",
    typicalContext: "Jeune diplômé dans un pays de rente problème qui accumule masters et certifications sans construire de réseau parallèle.",
    pyramidTypes: [
      { type: 'PROBLEM_RENT', label: 'Rente du problème', color: 'pyramid-rent' }
    ],
    consequences: {
      time: "4-8 ans d'études peu valorisées",
      energy: "Frustration face au décalage effort/récompense",
      money: "Coût des études sans retour proportionnel",
      stagnation: "Surqualification sans débouchés correspondants"
    },
    relatedExitKeys: ['remote-work', 'freelance-international']
  },
  {
    id: 'stability-in-growth-system',
    icon: Shield,
    title: "Chercher la stabilité dans un système de croissance",
    description: "Espérer des protections sociales fortes et une progression prévisible dans un pays qui récompense le risque et la vélocité.",
    typicalContext: "Professionnel français qui émigre aux États-Unis en s'attendant à un CDI stable avec protection maladie et retraite garantie.",
    pyramidTypes: [
      { type: 'GROWTH_RISK', label: 'Risque croissance', color: 'pyramid-growth' }
    ],
    consequences: {
      time: "2-5 ans à découvrir les règles réelles",
      energy: "Anxiété chronique face à l'instabilité",
      money: "Dépenses imprévues (santé, transitions)",
      stagnation: "Retour contraint ou adaptation douloureuse"
    },
    relatedExitKeys: ['golden-visa', 'retirement-visa']
  },
  {
    id: 'growth-in-stability-system',
    icon: Target,
    title: "Chercher la croissance rapide dans un système de stabilité",
    description: "Tenter de scaler rapidement ou de disruper dans un pays qui valorise la prudence, les processus et la protection des acquis.",
    typicalContext: "Entrepreneur tech américain qui lance une startup en France en espérant la même vélocité et flexibilité qu'en Californie.",
    pyramidTypes: [
      { type: 'STABILITY_REDIS', label: 'Redistribution stabilité', color: 'pyramid-stability' }
    ],
    consequences: {
      time: "2-4 ans de friction administrative",
      energy: "Frustration face à la lenteur perçue",
      money: "Charges et taxes sous-estimées",
      stagnation: "Croissance bridée par les contraintes réglementaires"
    },
    relatedExitKeys: ['entrepreneur-visa', 'digital-nomad']
  },
  {
    id: 'visibility-in-rent-system',
    icon: AlertTriangle,
    title: "Réussir visiblement sans protection dans un système de rente",
    description: "Afficher publiquement sa réussite financière ou professionnelle sans avoir construit les protections nécessaires.",
    typicalContext: "Entrepreneur prospère dans un pays de rente problème qui affiche son succès sur les réseaux sociaux sans réseau politique ou protection.",
    pyramidTypes: [
      { type: 'PROBLEM_RENT', label: 'Rente du problème', color: 'pyramid-rent' },
      { type: 'HYBRID_TRANSITION', label: 'Hybride transition', color: 'pyramid-hybrid' }
    ],
    consequences: {
      time: "Variable, risque permanent",
      energy: "Stress et vigilance constants",
      money: "Extorsion, corruption forcée, saisie",
      stagnation: "Plafonnement auto-imposé ou fuite"
    },
    relatedExitKeys: ['second-residency', 'offshore-structure']
  },
  {
    id: 'betting-against-state',
    icon: Shuffle,
    title: "Parier contre la direction de l'État dans un système hybride",
    description: "Investir ou s'engager dans des secteurs que l'État a décidé de contrôler ou de décourager.",
    typicalContext: "Investisseur étranger qui parie sur un secteur en croissance en Chine sans comprendre les signaux politiques de restriction à venir.",
    pyramidTypes: [
      { type: 'HYBRID_TRANSITION', label: 'Hybride transition', color: 'pyramid-hybrid' }
    ],
    consequences: {
      time: "Perte des années d'investissement",
      energy: "Restructuration forcée et stress",
      money: "Pertes significatives ou totales",
      stagnation: "Exclusion du marché"
    },
    relatedExitKeys: ['investor-visa', 'diversification']
  },
  {
    id: 'expecting-permanence-extraction',
    icon: Gem,
    title: "S'attendre à la permanence dans un système d'extraction",
    description: "Planifier une vie permanente dans un pays de ressources qui ne donne que des contrats temporaires aux étrangers.",
    typicalContext: "Expatrié dans un pays du Golfe qui achète un bien immobilier et s'endette en espérant y rester définitivement.",
    pyramidTypes: [
      { type: 'RESOURCE_EXTRACTION', label: 'Extraction ressources', color: 'pyramid-resource' }
    ],
    consequences: {
      time: "10-20 ans sans citoyenneté possible",
      energy: "Incertitude permanente sur le long terme",
      money: "Actifs difficiles à liquider au départ",
      stagnation: "Ni appartenance ni plan B préparé"
    },
    relatedExitKeys: ['second-passport', 'retirement-planning']
  },
  {
    id: 'ignoring-local-credentials',
    icon: Building2,
    title: "Ignorer les diplômes locaux dans un système de compétence",
    description: "Supposer que son expérience et ses diplômes étrangers suffisent dans un pays qui valorise les certifications locales.",
    typicalContext: "Médecin ou avocat étranger en Suisse ou Allemagne qui refuse de repasser les équivalences locales.",
    pyramidTypes: [
      { type: 'COMPETENCE_TRUST', label: 'Confiance compétence', color: 'pyramid-competence' }
    ],
    consequences: {
      time: "2-5 ans de déclassement professionnel",
      energy: "Frustration face au non-reconnaissance",
      money: "Salaire inférieur au niveau réel",
      stagnation: "Plafond de verre invisible"
    },
    relatedExitKeys: ['skilled-migration', 'credential-recognition']
  },
  {
    id: 'single-income-source',
    icon: Users,
    title: "Dépendre d'une seule source de revenus",
    description: "Mettre tous ses œufs dans le même panier professionnel sans construire d'alternatives.",
    typicalContext: "Cadre supérieur qui compte uniquement sur son emploi sans revenus alternatifs ni compétences exportables.",
    pyramidTypes: [
      { type: 'STABILITY_REDIS', label: 'Redistribution stabilité', color: 'pyramid-stability' },
      { type: 'GROWTH_RISK', label: 'Risque croissance', color: 'pyramid-growth' }
    ],
    consequences: {
      time: "Années de reconstruction après licenciement",
      energy: "Anxiété et dépendance psychologique",
      money: "Chute brutale en cas de perte d'emploi",
      stagnation: "Pouvoir de négociation limité"
    },
    relatedExitKeys: ['remote-work', 'side-business', 'investment']
  }
];

export default function SystemicMistakes() {
  const { t } = useTranslation();

  return (
    <main className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('common.back', 'Retour')}
          </Link>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-destructive/10">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold">
                Erreurs systémiques fréquentes
              </h1>
              <p className="text-muted-foreground">
                Ce que les systèmes ne pardonnent pas — et comment les éviter
              </p>
            </div>
          </div>

          <SimulationDisclaimer variant="compact" className="mt-6" />
        </div>

        {/* Introduction */}
        <div className="glass-card rounded-xl p-6 mb-12 max-w-4xl">
          <p className="text-muted-foreground leading-relaxed">
            Ces erreurs ne sont pas des jugements moraux. Ce sont des <strong className="text-foreground">décalages entre les attentes d'un individu et les règles réelles d'un système</strong>. 
            Comprendre ces patterns permet d'éviter des années de frustration, d'énergie gaspillée, et de ressources mal investies.
          </p>
          <p className="text-sm text-muted-foreground/80 mt-4">
            Chaque erreur est analysée en termes de contexte, pyramides concernées, et conséquences typiques. 
            Les liens vers les pyramides et clés de sortie permettent d'approfondir.
          </p>
        </div>

        {/* Mistakes Grid */}
        <div className="space-y-8">
          {SYSTEMIC_MISTAKES.map((mistake, index) => {
            const Icon = mistake.icon;
            
            return (
              <article 
                key={mistake.id}
                id={mistake.id}
                className="glass-card rounded-2xl p-6 md:p-8 scroll-mt-24"
              >
                {/* Header */}
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 rounded-xl bg-destructive/10 flex-shrink-0">
                    <Icon className="w-6 h-6 text-destructive" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-mono text-muted-foreground">#{index + 1}</span>
                    </div>
                    <h2 className="font-display text-xl md:text-2xl font-bold mb-2">
                      {mistake.title}
                    </h2>
                    <p className="text-muted-foreground">
                      {mistake.description}
                    </p>
                  </div>
                </div>

                {/* Typical Context */}
                <div className="bg-muted/30 rounded-xl p-4 mb-6">
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    Contexte typique
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {mistake.typicalContext}
                  </p>
                </div>

                {/* Pyramids Concerned */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold mb-3">Pyramides concernées</h3>
                  <div className="flex flex-wrap gap-2">
                    {mistake.pyramidTypes.map((pyramid) => (
                      <Link
                        key={pyramid.type}
                        to={`/pyramid-types#${pyramid.type.toLowerCase()}`}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors hover:opacity-80"
                        style={{
                          backgroundColor: `hsl(var(--${pyramid.color}) / 0.15)`,
                          color: `hsl(var(--${pyramid.color}))`
                        }}
                      >
                        {pyramid.label}
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Consequences */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold mb-3">Conséquences fréquentes</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <ConsequenceCard
                      icon={Clock}
                      label="Temps"
                      value={mistake.consequences.time}
                      color="text-blue-500"
                    />
                    <ConsequenceCard
                      icon={Zap}
                      label="Énergie"
                      value={mistake.consequences.energy}
                      color="text-amber-500"
                    />
                    <ConsequenceCard
                      icon={Coins}
                      label="Argent"
                      value={mistake.consequences.money}
                      color="text-emerald-500"
                    />
                    <ConsequenceCard
                      icon={TrendingDown}
                      label="Stagnation"
                      value={mistake.consequences.stagnation}
                      color="text-destructive"
                    />
                  </div>
                </div>

                {/* Related Exit Keys */}
                {mistake.relatedExitKeys && mistake.relatedExitKeys.length > 0 && (
                  <div className="border-t border-border pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Explorer les clés de sortie associées
                      </span>
                      <Link to="/exit-keys">
                        <Button variant="ghost" size="sm" className="gap-2">
                          Voir les clés de sortie
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-16 glass-card rounded-2xl p-8 text-center">
          <h2 className="font-display text-2xl font-bold mb-4">
            Éviter ces erreurs commence par comprendre ton système
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Analyse ta situation actuelle, identifie les décalages potentiels, et explore les stratégies adaptées à ton profil.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/exit-keys">
              <Button size="lg" className="gap-2">
                Simuler ma trajectoire
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/pyramid-types">
              <Button variant="outline" size="lg" className="gap-2">
                Comprendre les pyramides
              </Button>
            </Link>
          </div>
          
          <p className="text-xs text-muted-foreground mt-6">
            Outil d'analyse uniquement. Tu restes responsable de tes décisions.
          </p>
        </div>
      </div>
    </main>
  );
}

function ConsequenceCard({ 
  icon: Icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: string; 
  color: string;
}) {
  return (
    <div className="bg-muted/20 rounded-lg p-3">
      <div className={`flex items-center gap-2 mb-1 ${color}`}>
        <Icon className="w-4 h-4" />
        <span className="text-xs font-semibold">{label}</span>
      </div>
      <p className="text-xs text-muted-foreground">{value}</p>
    </div>
  );
}
