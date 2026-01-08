import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Shield, Phone, ExternalLink, Heart, XCircle, CheckCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { PyramidType } from '@/lib/types';

interface RiskPreventionProps {
  currentCountryPyramidType?: PyramidType;
  birthCountryPyramidType?: PyramidType;
  currentCountryId?: string;
  birthCountryId?: string;
}

interface RiskCategory {
  id: string;
  title: string;
  icon: string;
  severity: 'critical' | 'high' | 'medium';
  description: string;
  realStats: string[];
  warningSignals: string[];
  preventionTips: string[];
  resources: { name: string; url?: string; phone?: string }[];
  // Which pyramid types this risk is most relevant for
  relevantFor: {
    fromPyramids?: PyramidType[];  // If user is FROM these pyramid types
    toPyramids?: PyramidType[];    // If user is GOING TO these pyramid types
    countryIds?: string[];          // Specific countries (e.g., Mediterranean crossing)
  };
}

// All possible risk categories
const ALL_RISK_CATEGORIES: RiskCategory[] = [
  {
    id: 'human_trafficking',
    title: 'Traite des êtres humains',
    icon: '🚨',
    severity: 'critical',
    description: 'Le trafic d\'êtres humains touche plus de 40 millions de personnes dans le monde. Les victimes sont souvent recrutées via de fausses promesses de travail ou d\'études à l\'étranger.',
    realStats: [
      'Plus de 50 000 personnes victimes de traite identifiées en Europe chaque année',
      '71% des victimes de traite sont des femmes et des filles',
      'Le trafic humain génère 150 milliards de dollars par an pour les trafiquants',
      'Les victimes perdent en moyenne 5-10 années de leur vie',
    ],
    warningSignals: [
      'On vous demande de remettre vos documents d\'identité',
      'Promesses irréalistes de salaire ou de conditions de vie',
      'Demande de paiement initial pour un "visa" ou "contrat de travail"',
      'Isolement de votre famille et amis',
      'Contrat uniquement oral ou dans une langue que vous ne comprenez pas',
      'Transport organisé par des inconnus',
    ],
    preventionTips: [
      'Vérifiez TOUJOURS l\'existence légale de l\'employeur ou l\'agence',
      'Gardez TOUJOURS vos documents d\'identité avec vous',
      'Informez votre famille de vos plans de voyage avec tous les détails',
      'Utilisez les voies légales d\'immigration même si elles sont plus longues',
      'Méfiez-vous des offres "trop belles pour être vraies"',
    ],
    resources: [
      { name: 'Hotline traite des êtres humains France', phone: '0 805 123 123' },
      { name: 'Organisation Internationale pour les Migrations', url: 'https://www.iom.int' },
      { name: 'La Cimade', url: 'https://www.lacimade.org' },
    ],
    relevantFor: {
      fromPyramids: ['PROBLEM_RENT', 'RESOURCE_EXTRACTION'],
      toPyramids: ['STABILITY_REDIS', 'COMPETENCE_TRUST'],
    },
  },
  {
    id: 'fake_smugglers',
    title: 'Faux passeurs et traversées dangereuses',
    icon: '⚠️',
    severity: 'critical',
    description: 'Chaque année, des milliers de personnes meurent en tentant des traversées clandestines. Les passeurs ne garantissent rien et profitent de la détresse des migrants.',
    realStats: [
      'Plus de 2000 personnes meurent chaque année en Méditerranée',
      'Le coût moyen d\'un passage clandestin : 3000-8000€ sans garantie',
      '60% des migrants clandestins subissent des violences pendant le voyage',
      'Beaucoup sont abandonnés en route après avoir payé',
    ],
    warningSignals: [
      'Demande de paiement en espèces uniquement',
      'Promesses de voyage "100% sûr" ou "garanti"',
      'Aucun contrat ou reçu fourni',
      'On vous demande de mentir aux autorités',
      'Départ précipité sans préparation',
    ],
    preventionTips: [
      'Les voies légales sont TOUJOURS plus sûres, même si plus longues',
      'Documentez-vous sur les vraies options de visa de votre pays',
      'Les bourses d\'études existent - cherchez les voies officielles',
      'Parlez à des associations d\'aide aux migrants avant tout projet',
    ],
    resources: [
      { name: 'HCR - Agence des Nations Unies pour les réfugiés', url: 'https://www.unhcr.org' },
      { name: 'SOS Méditerranée', url: 'https://sosmediterranee.fr' },
    ],
    relevantFor: {
      fromPyramids: ['PROBLEM_RENT'],
      countryIds: ['nigeria', 'senegal', 'mali', 'morocco', 'algeria', 'tunisia', 'libya', 'eritrea', 'sudan', 'syria', 'afghanistan'],
    },
  },
  {
    id: 'exploitation_work',
    title: 'Exploitation au travail',
    icon: '⛓️',
    severity: 'high',
    description: 'Des travailleurs migrants se retrouvent piégés dans des situations d\'exploitation : salaires non payés, conditions indignes, séquestration de documents.',
    realStats: [
      '25 millions de personnes victimes de travail forcé dans le monde',
      'Secteurs à risque : agriculture, construction, travail domestique, restauration',
      'De nombreuses victimes travaillent 12-16h par jour sans repos',
    ],
    warningSignals: [
      'Employeur qui demande de garder vos papiers "en sécurité"',
      'Logement fourni sur le lieu de travail sans alternative',
      'Déductions surprises sur votre salaire',
      'Interdiction de contacter votre famille',
      'Menaces si vous voulez partir',
    ],
    preventionTips: [
      'Faites des recherches sur l\'employeur avant d\'accepter',
      'Exigez un contrat écrit dans votre langue',
      'Connaissez vos droits dans le pays de destination',
      'Gardez les coordonnées de votre ambassade',
      'Ne remettez jamais vos papiers',
    ],
    resources: [
      { name: 'Inspection du travail France', phone: '0 800 730 033' },
      { name: 'Comité contre l\'esclavage moderne', url: 'https://ccem.org' },
    ],
    relevantFor: {
      // Universal - relevant for anyone moving for work
      fromPyramids: ['PROBLEM_RENT', 'RESOURCE_EXTRACTION', 'HYBRID_TRANSITION'],
    },
  },
  {
    id: 'scam_immigration',
    title: 'Arnaques à l\'immigration',
    icon: '🎭',
    severity: 'high',
    description: 'De faux avocats, agences ou "facilitateurs" promettent des visas garantis contre paiement. Ces escroqueries coûtent des milliers d\'euros et n\'aboutissent jamais.',
    realStats: [
      'Pertes moyennes par victime : 2000-15000€',
      'Faux sites d\'ambassades et de gouvernements très sophistiqués',
      'Arnaques aux mariages blancs : risque pénal en plus des pertes financières',
    ],
    warningSignals: [
      '"Visa garanti" - aucun visa n\'est garanti',
      'Demande de paiement avant toute démarche officielle',
      'Communication uniquement par réseaux sociaux',
      'Urgence artificielle : "dernières places disponibles"',
      'Prix très différent des frais officiels',
    ],
    preventionTips: [
      'Consultez TOUJOURS le site officiel de l\'ambassade',
      'Les vrais frais de visa sont publics et fixes',
      'Les avocats certifiés sont vérifiables',
      'Ne payez jamais à l\'avance pour un "résultat garanti"',
      'Méfiez-vous des témoignages non vérifiables',
    ],
    resources: [
      { name: 'France Diplomatie - Visas', url: 'https://france-visas.gouv.fr' },
      { name: 'Signal-Arnaques', url: 'https://signal-arnaques.com' },
    ],
    relevantFor: {
      // Relevant for most people seeking immigration, especially from less stable regions
      fromPyramids: ['PROBLEM_RENT', 'RESOURCE_EXTRACTION', 'HYBRID_TRANSITION', 'GROWTH_RISK'],
    },
  },
  {
    id: 'sexual_exploitation',
    title: 'Exploitation sexuelle',
    icon: '🛑',
    severity: 'critical',
    description: 'Des femmes et jeunes filles sont trompées par des promesses de travail en Europe et finissent exploitées dans des réseaux de prostitution. C\'est un crime.',
    realStats: [
      'Principale forme de traite en Europe (45% des cas)',
      'Victimes souvent du Nigeria, Roumanie, Albanie, Chine',
      'Les victimes contractent des "dettes" impossibles à rembourser',
      'Amsterdam, Paris, Rome : principales destinations d\'exploitation',
    ],
    warningSignals: [
      'Offre de travail comme "mannequin" ou "hôtesse" sans expérience requise',
      '"Sponsor" qui paie votre voyage en échange de "remboursement"',
      'On vous demande de garder secret votre départ',
      'Promesses vagues sur le type exact de travail',
    ],
    preventionTips: [
      'Vérifiez l\'existence réelle de l\'agence ou employeur',
      'Un vrai employeur ne vous demandera jamais de "rembourser" votre voyage',
      'Parlez de TOUTE offre à votre famille et vos amis',
      'Si ça semble trop beau, c\'est probablement une arnaque',
    ],
    resources: [
      { name: 'Mouvement du Nid', url: 'https://mouvementdunid.org' },
      { name: 'Association ALC Nice', url: 'https://association-alc.org' },
      { name: 'Numéro national d\'aide aux victimes', phone: '116 006' },
    ],
    relevantFor: {
      fromPyramids: ['PROBLEM_RENT'],
      countryIds: ['nigeria', 'romania', 'albania', 'china', 'moldova', 'ukraine', 'bulgaria'],
    },
  },
  // New categories for people from stable countries
  {
    id: 'healthcare_abroad',
    title: 'Santé et couverture médicale à l\'étranger',
    icon: '🏥',
    severity: 'high',
    description: 'S\'installer à l\'étranger sans anticiper les frais de santé peut être désastreux. Les systèmes de santé varient énormément d\'un pays à l\'autre.',
    realStats: [
      'Une hospitalisation aux USA peut coûter 50 000€+ sans assurance',
      'De nombreux pays n\'ont pas de système de santé public',
      'Les maladies chroniques sont souvent exclues des assurances voyages',
      'Le rapatriement sanitaire coûte entre 10 000 et 100 000€',
    ],
    warningSignals: [
      'Partir sans assurance santé internationale',
      'Ne pas vérifier les accords de sécurité sociale entre pays',
      'Oublier de déclarer ses maladies préexistantes',
      'Sous-estimer les coûts de santé dans le pays de destination',
    ],
    preventionTips: [
      'Souscrivez une assurance santé internationale AVANT de partir',
      'Vérifiez les conventions de sécurité sociale bilatérales',
      'Conservez un "fonds d\'urgence santé" accessible',
      'Renseignez-vous sur le système de santé local avant de partir',
      'Gardez vos médicaments essentiels en quantité suffisante',
    ],
    resources: [
      { name: 'Ameli - Droits à l\'étranger', url: 'https://www.ameli.fr/assure/droits-demarches/europe-international' },
      { name: 'Cleiss - Protection sociale', url: 'https://www.cleiss.fr' },
    ],
    relevantFor: {
      fromPyramids: ['STABILITY_REDIS', 'COMPETENCE_TRUST'],
      toPyramids: ['GROWTH_RISK', 'RESOURCE_EXTRACTION', 'PROBLEM_RENT'],
    },
  },
  {
    id: 'retirement_abroad',
    title: 'Retraite à l\'étranger',
    icon: '🌴',
    severity: 'medium',
    description: 'Prendre sa retraite dans un pays au coût de la vie plus bas est tentant, mais comporte des risques souvent sous-estimés.',
    realStats: [
      'De nombreux retraités français vivent au Maroc, Portugal, Thaïlande',
      'Les pensions peuvent être imposées différemment selon les conventions',
      'L\'accès aux soins peut devenir critique avec l\'âge',
      'Les fluctuations monétaires peuvent réduire significativement le pouvoir d\'achat',
    ],
    warningSignals: [
      'Ne pas vérifier la fiscalité de sa pension à l\'étranger',
      'Sous-estimer le mal du pays et l\'isolement',
      'Ignorer l\'évolution possible de sa santé',
      'Ne pas prévoir de solution pour revenir si nécessaire',
    ],
    preventionTips: [
      'Testez avec des séjours prolongés avant de vous installer',
      'Conservez une adresse et des liens en France',
      'Prévoyez un budget "retour d\'urgence"',
      'Vérifiez les conventions fiscales et de sécurité sociale',
      'Gardez une partie de votre épargne en euros accessible',
    ],
    resources: [
      { name: 'France Diplomatie - Retraite à l\'étranger', url: 'https://www.diplomatie.gouv.fr/fr/services-aux-francais/preparer-son-expatriation/retraite/' },
      { name: 'Union des Français de l\'Étranger', url: 'https://www.ufe.org' },
    ],
    relevantFor: {
      fromPyramids: ['STABILITY_REDIS', 'COMPETENCE_TRUST'],
    },
  },
  {
    id: 'expat_bubble',
    title: 'Piège de la bulle expatriée',
    icon: '🫧',
    severity: 'medium',
    description: 'Vivre entre expatriés sans s\'intégrer peut mener à l\'isolement, des coûts de vie élevés et une expérience superficielle.',
    realStats: [
      'De nombreux expatriés restent entre eux et ne parlent pas la langue locale',
      'Le coût de vie "expatrié" peut être 2-3x celui des locaux',
      'L\'isolement culturel augmente le risque de retour prématuré',
      'Les enfants peuvent avoir du mal à s\'adapter à leur retour',
    ],
    warningSignals: [
      'Vivre uniquement dans des quartiers "expat"',
      'Ne pas apprendre la langue locale',
      'Fréquenter uniquement des compatriotes',
      'Reproduire exactement son mode de vie d\'origine',
    ],
    preventionTips: [
      'Apprenez au moins les bases de la langue locale',
      'Sortez des zones expatriées pour découvrir le "vrai" pays',
      'Créez des liens avec la population locale',
      'Adaptez votre mode de vie au contexte local',
      'Inscrivez-vous à des activités locales, pas juste expatriées',
    ],
    resources: [
      { name: 'Français du Monde', url: 'https://www.francais-du-monde.org' },
    ],
    relevantFor: {
      fromPyramids: ['STABILITY_REDIS', 'COMPETENCE_TRUST'],
    },
  },
  {
    id: 'digital_nomad_reality',
    title: 'Réalité du nomadisme digital',
    icon: '💻',
    severity: 'medium',
    description: 'Le lifestyle "digital nomad" est souvent idéalisé. La réalité implique des défis fiscaux, sociaux et professionnels.',
    realStats: [
      'Beaucoup de "nomades" retournent à une vie sédentaire après 1-2 ans',
      'Les questions fiscales sont complexes et souvent ignorées',
      'L\'absence de droits sociaux peut être problématique',
      'La solitude est le problème #1 cité par les digital nomads',
    ],
    warningSignals: [
      'Ne pas se renseigner sur ses obligations fiscales',
      'Ignorer les questions de visa de travail',
      'Sous-estimer le besoin de stabilité et de routine',
      'Ne pas prévoir de couverture santé internationale',
    ],
    preventionTips: [
      'Clarifiez votre situation fiscale AVANT de partir',
      'Vérifiez les visas "digital nomad" qui existent dans certains pays',
      'Prévoyez des périodes de stabilité entre vos déplacements',
      'Créez des routines et maintenez des liens sociaux forts',
      'Ayez une assurance santé internationale complète',
    ],
    resources: [
      { name: 'Portail Auto-Entrepreneur', url: 'https://www.autoentrepreneur.urssaf.fr' },
    ],
    relevantFor: {
      fromPyramids: ['STABILITY_REDIS', 'COMPETENCE_TRUST'],
    },
  },
];

// Get relevant risks based on user's situation
function getRelevantRisks(
  currentCountryPyramid?: PyramidType,
  birthCountryPyramid?: PyramidType,
  currentCountryId?: string,
  birthCountryId?: string
): RiskCategory[] {
  // If no context, return universal risks (work exploitation and scams)
  if (!currentCountryPyramid && !birthCountryPyramid) {
    return ALL_RISK_CATEGORIES.filter(r => 
      r.id === 'exploitation_work' || r.id === 'scam_immigration'
    );
  }

  const originPyramid = birthCountryPyramid || currentCountryPyramid;
  
  return ALL_RISK_CATEGORIES.filter(risk => {
    // Check if country ID is explicitly listed
    if (risk.relevantFor.countryIds?.length) {
      if (birthCountryId && risk.relevantFor.countryIds.includes(birthCountryId)) {
        return true;
      }
      if (currentCountryId && risk.relevantFor.countryIds.includes(currentCountryId)) {
        return true;
      }
    }

    // Check if origin pyramid type matches
    if (risk.relevantFor.fromPyramids?.length && originPyramid) {
      if (risk.relevantFor.fromPyramids.includes(originPyramid)) {
        return true;
      }
    }

    // Check if destination pyramid type matches
    if (risk.relevantFor.toPyramids?.length && currentCountryPyramid) {
      if (risk.relevantFor.toPyramids.includes(currentCountryPyramid)) {
        return true;
      }
    }

    return false;
  });
}

function getSeverityColor(severity: RiskCategory['severity']) {
  switch (severity) {
    case 'critical': return 'bg-red-500/20 border-red-500/50 text-red-400';
    case 'high': return 'bg-amber-500/20 border-amber-500/50 text-amber-400';
    case 'medium': return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400';
  }
}

export function RiskPrevention({ 
  currentCountryPyramidType,
  birthCountryPyramidType,
  currentCountryId,
  birthCountryId 
}: RiskPreventionProps) {
  const relevantRisks = useMemo(() => {
    return getRelevantRisks(
      currentCountryPyramidType,
      birthCountryPyramidType,
      currentCountryId,
      birthCountryId
    );
  }, [currentCountryPyramidType, birthCountryPyramidType, currentCountryId, birthCountryId]);

  // If no relevant risks, don't show the section
  if (relevantRisks.length === 0) {
    return null;
  }

  // Determine the primary context for the header message
  const isFromStableCountry = birthCountryPyramidType && 
    ['STABILITY_REDIS', 'COMPETENCE_TRUST'].includes(birthCountryPyramidType);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className={cn(
        "glass-card rounded-xl p-6 border-2",
        isFromStableCountry 
          ? "border-amber-500/30 bg-amber-500/5"
          : "border-red-500/30 bg-red-500/5"
      )}>
        <div className="flex items-start gap-4">
          <div className={cn(
            "p-3 rounded-full",
            isFromStableCountry ? "bg-amber-500/20" : "bg-red-500/20"
          )}>
            <AlertTriangle className={cn(
              "w-8 h-8",
              isFromStableCountry ? "text-amber-400" : "text-red-400"
            )} />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">
              {isFromStableCountry 
                ? '⚠️ Points de Vigilance pour Votre Projet'
                : '⚠️ Risques des Raccourcis'
              }
            </h2>
            <p className="text-muted-foreground mb-4">
              {isFromStableCountry 
                ? 'Votre situation privilégiée vous protège de certains risques, mais d\'autres défis vous attendent. Voici ce qu\'il faut anticiper.'
                : 'Cette section n\'est pas là pour faire peur, mais pour informer et protéger. Les chemins officiels sont plus longs mais infiniment plus sûrs.'
              }
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Information = Protection</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-400" />
                <span>Aucun jugement, que de la prévention</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Golden Rule - only for migration risks */}
      {!isFromStableCountry && (
        <div className="glass-card rounded-xl p-6 bg-amber-500/5 border-amber-500/30">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <span className="text-2xl">🔑</span>
            Règle d'Or
          </h3>
          <p className="text-lg font-medium text-amber-400 mb-2">
            "Si une offre semble trop belle pour être vraie, elle l'est probablement."
          </p>
          <p className="text-muted-foreground">
            Les vrais emplois légaux ne demandent jamais de payer à l'avance. 
            Les vrais visas passent par les voies officielles. 
            Les vraies opportunités vous laissent le temps de réfléchir.
          </p>
        </div>
      )}

      {/* Risk Categories */}
      <Accordion type="single" collapsible className="space-y-4">
        {relevantRisks.map(category => (
          <AccordionItem 
            key={category.id} 
            value={category.id}
            className={cn("glass-card rounded-xl border-2", getSeverityColor(category.severity))}
          >
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-4 text-left">
                <span className="text-3xl">{category.icon}</span>
                <div>
                  <h3 className="font-bold text-lg">{category.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">{category.description}</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-6">
                {/* Stats */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Chiffres réels
                  </h4>
                  <ul className="space-y-2">
                    {category.realStats.map((stat, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        {stat}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Warning Signals */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2 text-red-400">
                    <XCircle className="w-4 h-4" />
                    Signaux d'alerte
                  </h4>
                  <div className="grid md:grid-cols-2 gap-2">
                    {category.warningSignals.map((signal, i) => (
                      <div key={i} className="text-sm flex items-start gap-2 p-2 bg-red-500/10 rounded-lg">
                        <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                        {signal}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Prevention Tips */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2 text-emerald-400">
                    <CheckCircle className="w-4 h-4" />
                    Comment se protéger
                  </h4>
                  <div className="grid md:grid-cols-2 gap-2">
                    {category.preventionTips.map((tip, i) => (
                      <div key={i} className="text-sm flex items-start gap-2 p-2 bg-emerald-500/10 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                        {tip}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resources */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2 text-blue-400">
                    <Phone className="w-4 h-4" />
                    Ressources et aide
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {category.resources.map((resource, i) => (
                      <div key={i}>
                        {resource.url ? (
                          <Button 
                            variant="outline" 
                            size="sm"
                            asChild
                            className="gap-2"
                          >
                            <a href={resource.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-3 h-3" />
                              {resource.name}
                            </a>
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" className="gap-2">
                            <Phone className="w-3 h-3" />
                            {resource.name}: {resource.phone}
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Closing message */}
      <div className="glass-card rounded-xl p-6 text-center">
        <Heart className="w-12 h-12 text-rose-400 mx-auto mb-4" />
        <h3 className="font-bold text-xl mb-2">
          {isFromStableCountry 
            ? 'Préparez-vous bien, profitez pleinement'
            : 'Chaque vie compte'
          }
        </h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {isFromStableCountry 
            ? 'Une bonne préparation vous permettra de profiter pleinement de votre expérience à l\'étranger. Anticipez les défis pour mieux les surmonter.'
            : 'Si vous connaissez quelqu\'un qui envisage de prendre des risques, partagez cette information. Il existe toujours des alternatives légales, même si elles demandent plus de patience. Votre vie vaut plus que n\'importe quel raccourci.'
          }
        </p>
      </div>
    </div>
  );
}
