import { useTranslation } from 'react-i18next';
import { AlertTriangle, Shield, Phone, ExternalLink, Heart, XCircle, CheckCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';

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
}

const RISK_CATEGORIES: RiskCategory[] = [
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
  },
];

function getSeverityColor(severity: RiskCategory['severity']) {
  switch (severity) {
    case 'critical': return 'bg-red-500/20 border-red-500/50 text-red-400';
    case 'high': return 'bg-amber-500/20 border-amber-500/50 text-amber-400';
    case 'medium': return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400';
  }
}

export function RiskPrevention() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass-card rounded-xl p-6 border-2 border-red-500/30 bg-red-500/5">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-red-500/20">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">⚠️ Risques des Raccourcis</h2>
            <p className="text-muted-foreground mb-4">
              Cette section n'est pas là pour faire peur, mais pour <strong>informer et protéger</strong>. 
              Les chemins officiels sont plus longs mais infiniment plus sûrs. Chaque raccourci implique des risques 
              que les trafiquants ne vous expliqueront jamais.
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

      {/* Golden Rule */}
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

      {/* Risk Categories */}
      <Accordion type="single" collapsible className="space-y-4">
        {RISK_CATEGORIES.map(category => (
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
        <h3 className="font-bold text-xl mb-2">Chaque vie compte</h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Si vous connaissez quelqu'un qui envisage de prendre des risques, partagez cette information. 
          Il existe <strong>toujours</strong> des alternatives légales, même si elles demandent plus de patience. 
          Votre vie vaut plus que n'importe quel raccourci.
        </p>
      </div>
    </div>
  );
}
