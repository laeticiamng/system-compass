/**
 * Blog article data - Pillar content for expatriation guidance
 * 10 comprehensive articles covering key expatriation topics
 */

export interface BlogArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: 'guide' | 'fiscal' | 'lifestyle' | 'legal' | 'country' | 'digital-nomad';
  tags: string[];
  author: string;
  publishedAt: string;
  readTime: number;
  featured: boolean;
  imageAlt: string;
}

export const BLOG_CATEGORIES: Record<BlogArticle['category'], { label: string; color: string }> = {
  guide: { label: 'Guide', color: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  fiscal: { label: 'Fiscalité', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  lifestyle: { label: 'Lifestyle', color: 'bg-purple-500/10 text-purple-600 border-purple-500/30' },
  legal: { label: 'Juridique', color: 'bg-red-500/10 text-red-600 border-red-500/30' },
  country: { label: 'Pays', color: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  'digital-nomad': { label: 'Digital Nomad', color: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/30' },
};

export const blogArticles: BlogArticle[] = [
  {
    id: '1',
    slug: 'guide-complet-expatriation-10-etapes-essentielles',
    title: 'Guide complet de l\'expatriation : les 10 étapes essentielles',
    excerpt: 'De la réflexion initiale à l\'installation dans votre nouveau pays, découvrez les étapes incontournables pour réussir votre expatriation sans mauvaises surprises.',
    content: `L'expatriation est un projet de vie majeur qui nécessite une préparation rigoureuse. Que vous partiez pour des raisons professionnelles, fiscales ou simplement pour changer de cadre de vie, les étapes à suivre restent sensiblement les mêmes. Ce guide vous accompagne à travers les 10 phases essentielles pour transformer votre projet en réalité.

La première étape consiste à définir clairement vos motivations et vos objectifs. Pourquoi souhaitez-vous partir ? Quelles sont vos priorités : carrière, qualité de vie, fiscalité, éducation des enfants ? Cette introspection est fondamentale car elle orientera toutes vos décisions ultérieures. Prenez le temps de rédiger un document synthétisant vos critères non négociables et vos compromis acceptables. Ensuite, lancez-vous dans une phase de recherche approfondie sur les destinations potentielles en croisant ces critères avec les réalités de chaque pays.

Les étapes administratives constituent souvent le volet le plus complexe. Il vous faudra rassembler vos documents d'identité, faire apostiller certains actes, obtenir un visa ou un permis de résidence, et potentiellement faire reconnaître vos diplômes. Commencez ces démarches au moins 6 à 12 mois avant votre date de départ prévue. N'oubliez pas de prévenir votre caisse de retraite, votre assurance maladie et votre centre des impôts de votre changement de situation. La résiliation ou le transfert de vos contrats (bail, assurances, abonnements) doit également être planifiée.

Sur le plan financier, préparez un budget détaillé incluant les frais de déménagement, les premiers mois sans revenus potentiels, le dépôt de garantie pour un logement, et une réserve d'urgence équivalente à 6 mois de dépenses dans le pays cible. Renseignez-vous sur les conventions fiscales entre votre pays d'origine et votre pays de destination pour éviter la double imposition. L'ouverture d'un compte bancaire local et le choix d'une solution de transfert d'argent internationale sont des priorités à traiter avant votre arrivée.

Enfin, ne sous-estimez pas la dimension humaine de l'expatriation. Le départ implique de quitter un réseau social et familial établi. Préparez vos proches, maintenez des rituels de communication, et dès votre arrivée, investissez dans la création d'un nouveau cercle social. Rejoindre des associations d'expatriés, participer à des événements locaux et apprendre la langue du pays sont des accélérateurs d'intégration puissants. L'expatriation réussie est celle où l'on se sent chez soi dans son nouveau pays tout en gardant des liens solides avec ses racines.

Pour structurer votre projet, nous recommandons d'utiliser un rétroplanning détaillé avec des jalons à 12 mois, 6 mois, 3 mois et 1 mois avant le départ. Chaque jalon doit comporter des actions administratives, financières et personnelles clairement définies. Cette méthode transforme un projet qui peut sembler écrasant en une série d'étapes gérables et mesurables.`,
    category: 'guide',
    tags: ['expatriation', 'préparation', 'démarches', 'checklist', 'planification'],
    author: 'Compass',
    publishedAt: '2025-01-15',
    readTime: 12,
    featured: true,
    imageAlt: 'Illustration d\'une carte du monde avec des étapes de planification d\'expatriation',
  },
  {
    id: '2',
    slug: 'fiscalite-expatries-comprendre-residence-fiscale',
    title: 'Fiscalité des expatriés : comprendre la résidence fiscale',
    excerpt: 'La résidence fiscale est le concept clé qui détermine où et comment vous serez imposé. Décryptage des règles françaises et internationales.',
    content: `La question de la résidence fiscale est probablement la plus déterminante dans un projet d'expatriation. Elle conditionne dans quel pays vous paierez vos impôts et selon quelles règles. Contrairement à une idée reçue, quitter physiquement la France ne suffit pas toujours à perdre sa résidence fiscale française. Les critères sont multiples et parfois subtils.

En droit français, l'article 4B du Code général des impôts définit quatre critères alternatifs de résidence fiscale : le foyer ou le lieu de séjour principal en France, l'exercice d'une activité professionnelle principale en France, le centre des intérêts économiques en France. Il suffit de remplir un seul de ces critères pour être considéré comme résident fiscal français et être imposé sur l'ensemble de ses revenus mondiaux. Le critère du foyer est particulièrement scruté : si votre conjoint et vos enfants restent en France, l'administration fiscale peut considérer que votre foyer y demeure, même si vous vivez à l'étranger la majeure partie de l'année.

Les conventions fiscales bilatérales jouent un rôle crucial pour éviter la double imposition. La France a signé plus de 120 conventions avec d'autres pays. Ces accords définissent des règles de départage lorsque deux pays revendiquent la résidence fiscale d'un même contribuable. En général, la convention privilégie le pays du foyer permanent, puis celui des liens personnels et économiques les plus étroits, et enfin le lieu de séjour habituel. Il est essentiel d'étudier la convention spécifique applicable à votre situation avant de prendre toute décision.

L'exit tax (ou impôt de départ) est un autre dispositif à connaître. Instaurée pour éviter que des contribuables ne s'expatrient uniquement pour échapper à l'imposition des plus-values latentes, elle s'applique aux détenteurs de participations significatives (valeur supérieure à 800 000 euros ou représentant au moins 50 % des bénéfices sociaux d'une société). Un sursis de paiement est possible, notamment au sein de l'Union européenne, mais le contribuable doit respecter des obligations déclaratives strictes pendant plusieurs années après son départ.

La planification fiscale de l'expatriation doit être anticipée et accompagnée par des professionnels. Un avocat fiscaliste spécialisé en droit international pourra analyser votre situation personnelle, identifier les risques de requalification, et vous aider à structurer votre départ de manière conforme. Les erreurs dans ce domaine peuvent coûter extrêmement cher, avec des redressements fiscaux pouvant remonter sur plusieurs années et des pénalités significatives.

Avertissement : Les informations contenues dans cet article sont fournies à titre informatif et ne constituent pas un conseil fiscal personnalisé. La fiscalité internationale est un domaine complexe et en constante évolution. Consultez impérativement un professionnel qualifié (avocat fiscaliste, expert-comptable spécialisé) avant de prendre toute décision ayant des implications fiscales.`,
    category: 'fiscal',
    tags: ['fiscalité', 'résidence fiscale', 'impôts', 'exit tax', 'conventions fiscales'],
    author: 'Compass',
    publishedAt: '2025-01-22',
    readTime: 15,
    featured: true,
    imageAlt: 'Illustration de documents fiscaux et d\'une carte du monde représentant la résidence fiscale',
  },
  {
    id: '3',
    slug: 'digital-nomad-meilleurs-pays-2025',
    title: 'Digital nomad : les meilleurs pays en 2025',
    excerpt: 'Visas dédiés, coût de la vie, qualité d\'internet et communauté : notre classement des destinations les plus attractives pour les travailleurs nomades.',
    content: `Le mode de vie digital nomad continue de gagner en popularité en 2025, porté par la généralisation du travail à distance et l'émergence de visas spécifiquement conçus pour cette population. De plus en plus de pays ont compris l'intérêt économique d'attirer ces travailleurs qualifiés qui consomment localement tout en générant leurs revenus à l'étranger. Voici notre analyse des destinations les plus pertinentes.

Le Portugal reste une valeur sûre, notamment grâce à son visa D8 pour travailleurs à distance. Lisbonne et Porto offrent un écosystème tech dynamique, des espaces de coworking de qualité, une excellente connectivité internet (fibre largement déployée) et un coût de la vie encore raisonnable malgré la hausse des dernières années. Le régime fiscal des résidents non habituels (RNH), bien qu'il ait été réformé en 2024, offre toujours des avantages pour certains profils. Le climat doux, la sécurité et la communauté francophone établie sont des atouts supplémentaires.

La Thaïlande a lancé son visa Long-Term Resident (LTR) et le Destination Thailand Visa (DTV), rendant le séjour longue durée plus accessible. Bangkok, Chiang Mai et les îles du sud proposent un coût de la vie très compétitif, une gastronomie exceptionnelle et une communauté nomade extrêmement active. L'internet est rapide et fiable dans les zones urbaines. Attention cependant aux questions de visa de travail : travailler pour des clients étrangers depuis la Thaïlande reste une zone grise juridique qu'il convient de gérer avec précaution.

L'Espagne a introduit la Ley de Startups avec un visa pour nomades numériques et un régime fiscal avantageux (loi Beckham réformée). Barcelone, Valence et les îles Canaries (notamment Tenerife et Gran Canaria) sont devenues des hubs majeurs pour les nomades. Le coût de la vie reste modéré hors des grandes métropoles, et la qualité de vie espagnole (climat, gastronomie, vie sociale) est un argument de poids. Les îles Canaries bénéficient en plus d'un régime fiscal spécial (ZEC) et d'un décalage horaire favorable pour travailler avec des clients européens et américains.

D'autres destinations méritent une attention particulière en 2025 : la Géorgie avec son programme « Remotely from Georgia » et son régime fiscal très favorable pour les petits entrepreneurs, l'Estonie et son programme e-Residency qui permet de gérer une entreprise européenne depuis n'importe où, le Mexique (Mexico City, Playa del Carmen) avec son coût de vie attractif et sa proximité avec les États-Unis, ou encore Dubaï qui attire avec son visa freelance et l'absence d'impôt sur le revenu, mais dont le coût de vie élevé peut nuire à l'équation financière globale.

Le choix du pays idéal dépend de vos priorités personnelles : fiscalité, coût de la vie, climat, fuseau horaire par rapport à vos clients, qualité de l'infrastructure numérique, facilité d'obtention du visa et qualité de la communauté nomade locale. Nous recommandons de tester une destination pendant 1 à 3 mois avant de s'engager sur un séjour plus long, et de bien étudier les implications fiscales dans votre pays d'origine avant de partir.`,
    category: 'digital-nomad',
    tags: ['digital nomad', 'visa nomade', 'travail à distance', 'coworking', 'freelance'],
    author: 'Compass',
    publishedAt: '2025-02-05',
    readTime: 11,
    featured: true,
    imageAlt: 'Digital nomad travaillant sur un ordinateur portable avec une vue panoramique',
  },
  {
    id: '4',
    slug: 'expatrier-en-famille-preparer-enfants-changement',
    title: 'S\'expatrier en famille : préparer les enfants au changement',
    excerpt: 'L\'expatriation avec des enfants nécessite une préparation spécifique. Scolarité, adaptation émotionnelle et intégration : les clés pour une transition réussie.',
    content: `S'expatrier en famille est une aventure extraordinaire qui peut offrir aux enfants une ouverture sur le monde inestimable. Cependant, c'est aussi un bouleversement majeur dans leur vie qui mérite une attention et une préparation particulières. Les enfants n'ont pas choisi de partir et leur capacité d'adaptation, bien que souvent remarquable, ne doit pas être tenue pour acquise.

La question de la scolarité est généralement la première préoccupation des parents expatriés. Plusieurs options s'offrent à vous : l'école française à l'étranger (réseau AEFE ou établissements homologués), l'école internationale (souvent en anglais avec le programme IB), l'école locale du pays d'accueil, ou l'enseignement à distance (CNED). Chaque option a ses avantages et ses limites. L'école française assure la continuité du cursus mais peut créer une bulle communautaire. L'école locale favorise l'intégration mais peut poser des défis linguistiques initiaux. L'école internationale offre un environnement multiculturel mais à un coût souvent élevé. Le choix dépend de l'âge de l'enfant, de la durée prévue de l'expatriation et du projet éducatif familial.

Sur le plan émotionnel, les enfants traversent des phases d'adaptation similaires aux adultes, mais les expriment différemment selon leur âge. Les tout-petits (0-3 ans) s'adaptent généralement bien si leurs figures d'attachement sont sereines. Les enfants de 4 à 10 ans peuvent manifester de l'anxiété par des régressions comportementales, des troubles du sommeil ou une agressivité inhabituelle. Les adolescents, en pleine construction identitaire, peuvent vivre le départ comme un arrachement à leur groupe social, ce qui est particulièrement déstabilisant. Il est crucial d'ouvrir un espace de dialogue où chaque enfant peut exprimer ses peurs et ses attentes sans jugement.

Préparez le départ en impliquant les enfants dans le projet. Montrez-leur des photos et des vidéos du nouveau pays, apprenez ensemble quelques mots de la langue locale, lisez des livres sur la culture du pays de destination. Si possible, effectuez un voyage de reconnaissance en famille avant le déménagement définitif. Ce repérage permet aux enfants de se projeter concrètement et de réduire l'anxiété liée à l'inconnu. Permettez-leur aussi de faire leurs adieux correctement : une fête avec les amis, un album souvenir, l'échange de coordonnées pour rester en contact.

Une fois sur place, soyez patients et attentifs. L'adaptation prend en moyenne 6 à 12 mois pour un enfant. Maintenez des routines familières (repas en famille, rituels du coucher) tout en étant ouverts aux nouvelles habitudes locales. Encouragez les activités extrascolaires qui permettent de créer des liens avec les enfants locaux : sport, musique, arts. Les enfants expatriés développent souvent ce qu'on appelle une « identité de troisième culture » : ils ne se sentent ni complètement de leur pays d'origine, ni complètement du pays d'accueil, mais créent une identité hybride riche et unique. Cette expérience, bien accompagnée, devient un atout considérable pour leur vie future.`,
    category: 'lifestyle',
    tags: ['famille', 'enfants', 'scolarité', 'adaptation', 'école internationale'],
    author: 'Compass',
    publishedAt: '2025-02-12',
    readTime: 10,
    featured: false,
    imageAlt: 'Famille avec enfants préparant leur expatriation avec des cartons et une carte du monde',
  },
  {
    id: '5',
    slug: 'pieges-juridiques-expatriation-eviter',
    title: 'Les pièges juridiques de l\'expatriation à éviter',
    excerpt: 'Droit du travail, protection sociale, régime matrimonial, succession : les zones de risque juridique que tout expatrié doit connaître avant de partir.',
    content: `L'expatriation s'accompagne d'un changement profond de cadre juridique qui est souvent sous-estimé par les candidats au départ. Les règles qui régissaient votre vie quotidienne en France ne s'appliquent plus forcément à l'étranger, et de nouvelles contraintes apparaissent. Ignorer ces enjeux peut avoir des conséquences financières et personnelles graves.

Le droit du travail est un premier terrain miné. Si vous êtes détaché par votre employeur français, votre contrat de travail français continue de s'appliquer pendant une période limitée (généralement 24 mois, renouvelable). Mais si vous êtes embauché localement avec un contrat local, c'est le droit du travail du pays d'accueil qui s'applique intégralement. Les protections auxquelles vous étiez habitué (préavis, indemnités de licenciement, congés payés, protection de la maternité) peuvent être très différentes. Dans certains pays, le licenciement « at will » est la norme, sans indemnité ni justification nécessaire. Avant de signer un contrat local, faites-le analyser par un avocat connaissant le droit local.

La protection sociale est un autre enjeu majeur. En quittant la France, vous sortez progressivement du système de sécurité sociale français, sauf si vous optez pour la Caisse des Français de l'Étranger (CFE) qui permet de maintenir une couverture de type sécurité sociale. Sans cette démarche, vous dépendez uniquement du système de santé local, qui peut être très différent en termes de qualité et de couverture. Vos droits à la retraite française cessent également de s'accumuler si vous ne cotisez plus volontairement. Il est crucial de comprendre l'impact de l'expatriation sur vos droits sociaux à long terme et de prendre les dispositions nécessaires.

Le régime matrimonial et le droit de la famille sont des sujets souvent négligés mais potentiellement explosifs. En France, le régime matrimonial par défaut est la communauté réduite aux acquêts. Mais dans d'autres pays, les règles peuvent être très différentes. En cas de divorce à l'étranger, quel tribunal sera compétent ? Quel droit sera appliqué ? Les réponses dépendent de multiples facteurs (nationalité, résidence habituelle, lieu du mariage) et peuvent réserver de très mauvaises surprises. De même, les règles de succession varient considérablement d'un pays à l'autre. Certains pays appliquent la loi du domicile du défunt, d'autres la loi de la nationalité. Le règlement européen sur les successions (règlement Bruxelles IV) a harmonisé certaines règles au sein de l'UE, mais avec de nombreuses nuances.

Les obligations déclaratives constituent un piège fréquent. Même expatrié, un Français peut avoir des obligations fiscales en France (déclaration des comptes bancaires étrangers, déclaration des revenus de source française, déclaration des trusts et structures juridiques étrangères). L'omission de ces déclarations peut entraîner des amendes considérables : 1 500 euros par compte non déclaré et par an, voire 10 000 euros si le compte est dans un pays non coopératif. La transparence fiscale internationale (échange automatique de données via le CRS) rend la dissimulation de comptes à l'étranger de plus en plus risquée et illusoire.

Avertissement : Cet article présente des informations juridiques générales qui ne sauraient se substituer à un conseil juridique personnalisé. Le droit international privé est extrêmement complexe et chaque situation est unique. Consultez un avocat spécialisé en droit international avant de prendre des décisions engageantes.`,
    category: 'legal',
    tags: ['juridique', 'droit du travail', 'protection sociale', 'succession', 'régime matrimonial'],
    author: 'Compass',
    publishedAt: '2025-02-20',
    readTime: 14,
    featured: false,
    imageAlt: 'Illustration de documents juridiques avec un marteau de juge et une balance',
  },
  {
    id: '6',
    slug: 'portugal-guide-complet-installation',
    title: 'Portugal : le guide complet pour s\'y installer',
    excerpt: 'Visa, logement, fiscalité, coût de la vie, système de santé : tout ce que vous devez savoir pour réussir votre installation au Portugal.',
    content: `Le Portugal est devenu en quelques années l'une des destinations préférées des expatriés francophones. Climat agréable, coût de la vie modéré, sécurité, excellente gastronomie et proximité avec la France en font un choix particulièrement attractif. Mais derrière l'image idyllique, une installation réussie demande une préparation sérieuse.

Pour s'installer au Portugal en tant que citoyen européen, les formalités sont relativement simples. Vous avez le droit de résider librement pendant 3 mois, puis vous devez vous enregistrer auprès de la mairie (Câmara Municipal) pour obtenir un certificat de résidence. Vous aurez besoin d'un NIF (numéro fiscal portugais), indispensable pour à peu près toutes les démarches : ouvrir un compte bancaire, signer un bail, souscrire des abonnements. Le NIF peut être obtenu auprès du bureau des finances (Finanças) local. Pour les non-européens, les options incluent le visa D7 (revenus passifs), le visa D8 (travailleurs à distance), le visa de travail classique ou encore le Golden Visa (investissement), dont les conditions ont été significativement modifiées en 2023.

Le marché immobilier portugais a connu une forte hausse des prix, particulièrement à Lisbonne et Porto. Les loyers à Lisbonne sont désormais comparables à ceux de certaines villes françaises de taille moyenne. Cependant, en s'éloignant des centres-villes ou en explorant des régions comme l'Alentejo, l'Algarve intérieure ou le centre du pays, on trouve encore des prix raisonnables. Pour la location, attendez-vous à devoir verser 2 à 3 mois de caution. L'achat immobilier est accessible mais nécessite un accompagnement juridique (avocat et notaire) pour sécuriser la transaction, les pratiques locales différant sensiblement de celles en France.

Le régime fiscal portugais a évolué. Le statut de Résident Non Habituel (RNH), qui offrait un taux forfaitaire de 20 % sur les revenus d'activité et une exonération sur la plupart des revenus étrangers, a été abrogé pour les nouveaux arrivants à partir de 2024. Un nouveau régime d'incitation fiscale pour la recherche scientifique et l'innovation l'a partiellement remplacé, mais avec des conditions plus restrictives. Les pensions de retraite de source étrangère, autrefois exonérées, sont désormais taxées à un taux minimum de 10 %. Malgré ces changements, le Portugal reste fiscalement compétitif par rapport à la France pour de nombreux profils, mais une analyse personnalisée est indispensable.

Le système de santé portugais (SNS - Serviço Nacional de Saúde) est public et accessible aux résidents. La qualité des soins est globalement bonne, notamment dans les grandes villes, mais les délais d'attente pour les spécialistes peuvent être longs dans le système public. Beaucoup d'expatriés optent pour une assurance santé privée complémentaire, avec des cotisations allant de 50 à 200 euros par mois selon l'âge et les garanties. Le coût de la vie global au Portugal est environ 30 à 40 % inférieur à celui de la France pour un couple, mais cet écart se réduit à Lisbonne. Un couple peut vivre confortablement avec 2 500 à 3 500 euros par mois selon la ville et le mode de vie.

La communauté francophone au Portugal est très active, avec de nombreuses associations, groupes Facebook et événements réguliers. Si cette communauté facilite l'intégration initiale, nous recommandons de faire l'effort d'apprendre le portugais pour une intégration réelle et durable. La langue est relativement accessible pour les francophones et son apprentissage est un signe de respect envers le pays d'accueil qui est très apprécié par les Portugais.`,
    category: 'country',
    tags: ['Portugal', 'Lisbonne', 'visa', 'NHR', 'installation', 'immobilier'],
    author: 'Compass',
    publishedAt: '2025-03-01',
    readTime: 13,
    featured: false,
    imageAlt: 'Vue panoramique de Lisbonne avec le pont du 25 avril et les toits colorés',
  },
  {
    id: '7',
    slug: 'retraite-etranger-destinations-avantageuses',
    title: 'Retraite à l\'étranger : les destinations les plus avantageuses',
    excerpt: 'Fiscalité favorable, coût de la vie réduit, qualité de vie : découvrez les pays qui offrent les meilleures conditions pour profiter de votre retraite.',
    content: `Prendre sa retraite à l'étranger est un projet qui séduit de plus en plus de Français. Selon les dernières estimations, plus d'un million de retraités français vivent hors de France. Les motivations sont variées : un pouvoir d'achat supérieur grâce à un coût de la vie plus bas, un climat plus clément, une fiscalité plus douce, ou simplement l'envie de découvrir une nouvelle culture. Mais toutes les destinations ne se valent pas et le choix doit être mûrement réfléchi.

Le Maroc figure parmi les destinations historiques des retraités français. Le coût de la vie y est environ 50 à 60 % inférieur à celui de la France, la langue française est largement parlée, et la proximité géographique permet des allers-retours faciles. La convention fiscale franco-marocaine prévoit que les pensions de retraite privées sont imposables dans le pays de résidence, ce qui est avantageux compte tenu des taux d'imposition marocains plus modérés. Le système de santé privé est de bonne qualité dans les grandes villes. Cependant, le Maroc requiert une adaptation culturelle significative et les démarches administratives peuvent être longues et complexes.

La Grèce a mis en place en 2020 un régime fiscal spécifique pour attirer les retraités étrangers : un taux forfaitaire de 7 % sur tous les revenus de source étrangère pendant 15 ans. Ce dispositif, inspiré du modèle portugais, est particulièrement attractif pour les retraités percevant des pensions conséquentes. Le coût de la vie en Grèce est environ 25 à 35 % inférieur à celui de la France, le climat méditerranéen est excellent, et les infrastructures de santé se sont considérablement améliorées. Les îles grecques ou les villes comme Athènes, Thessalonique ou Kalamata offrent un cadre de vie très agréable.

Le pays de Galles a perdu de son attrait post-Brexit, mais d'autres destinations européennes émergent. L'Italie propose un régime forfaitaire de 7 % pour les retraités s'installant dans les communes du sud de moins de 20 000 habitants. Malte offre un programme de résidence pour retraités avec un taux de 15 % sur les revenus transférés. La Thaïlande, le Costa Rica et le Panama proposent des visas spécifiques pour retraités avec des conditions financières relativement accessibles et un coût de la vie très attractif, mais nécessitent une adaptation plus importante sur le plan culturel et linguistique.

Avant de vous décider, plusieurs critères méritent une analyse approfondie : la qualité et l'accessibilité du système de santé (un enjeu crucial avec l'avancée en âge), la stabilité politique et économique du pays, la fiscalité applicable à vos différentes sources de revenus (pension de base, complémentaire, revenus fonciers, revenus de capitaux), la facilité d'obtention d'un titre de séjour, la présence d'une communauté francophone, et la qualité des liaisons aériennes avec la France pour les visites familiales. N'oubliez pas non plus d'étudier les implications sur vos droits sociaux français et la portabilité de votre assurance maladie.

Nous recommandons vivement de passer plusieurs mois dans le pays envisagé, à différentes saisons, avant de prendre une décision définitive. L'image vacancière d'un pays peut être très différente de la réalité quotidienne d'un résident permanent. Certains retraités optent pour une solution intermédiaire : passer 6 mois dans le pays choisi et 6 mois en France, ce qui peut permettre de conserver certains avantages sociaux français tout en profitant d'un cadre de vie différent.`,
    category: 'guide',
    tags: ['retraite', 'pension', 'coût de la vie', 'fiscalité retraite', 'senior'],
    author: 'Compass',
    publishedAt: '2025-03-10',
    readTime: 12,
    featured: false,
    imageAlt: 'Couple de retraités profitant d\'une terrasse ensoleillée à l\'étranger',
  },
  {
    id: '8',
    slug: 'assurance-sante-expatrie-choisir-couverture',
    title: 'Assurance santé expatrié : comment choisir la bonne couverture',
    excerpt: 'CFE, assurance au 1er euro, complémentaire locale : comprendre les options d\'assurance santé pour expatriés et choisir la formule adaptée à votre situation.',
    content: `La couverture santé est l'un des aspects les plus critiques de l'expatriation, et pourtant l'un des plus mal compris. En quittant la France, vous sortez progressivement du régime de la Sécurité sociale et devez trouver une solution de remplacement adaptée à votre situation. Les options sont multiples et le choix optimal dépend de nombreux facteurs : votre pays de destination, votre âge, votre état de santé, votre situation familiale et votre budget.

La Caisse des Français de l'Étranger (CFE) est souvent la première option envisagée. Organisme de Sécurité sociale dédié aux expatriés, la CFE vous permet de continuer à bénéficier d'une couverture similaire à celle de la Sécurité sociale française. Elle rembourse sur la base des tarifs français, ce qui peut être insuffisant dans les pays où les frais médicaux sont élevés (États-Unis, Suisse, Singapour). La CFE assure aussi la continuité de vos droits : en cas de retour en France, votre réintégration dans le système de Sécurité sociale est immédiate. Les cotisations varient selon l'âge et la catégorie (salarié, travailleur indépendant, retraité) et vont de 70 à plus de 400 euros par mois.

L'assurance santé internationale au 1er euro est une alternative de plus en plus populaire. Proposée par des assureurs privés spécialisés (April International, Henner, Allianz Care, Cigna, etc.), elle couvre l'intégralité des frais dès le premier euro dépensé, sans passer par un organisme de Sécurité sociale. Les garanties sont souvent plus étendues que celles de la CFE : hospitalisation, médecine courante, optique, dentaire, maternité, rapatriement, et parfois même des prestations de bien-être. Le coût dépend fortement de la zone géographique, de l'âge du souscripteur, du niveau de garanties et de la franchise choisie. Pour un adulte de 35 ans dans une zone à coût médical modéré, comptez entre 100 et 250 euros par mois pour une couverture complète.

Certains expatriés optent pour une approche hybride : la CFE pour la base (et la continuité des droits) complétée par une mutuelle internationale pour les dépassements et les prestations non couvertes. D'autres, notamment dans les pays disposant d'un bon système de santé public et accessible (Portugal, Espagne, Thaïlande), choisissent de s'affilier au système local et de souscrire simplement une complémentaire locale. Cette option est souvent la plus économique mais ne maintient pas vos droits à la Sécurité sociale française.

Quelques points de vigilance sont essentiels lors du choix de votre couverture. Vérifiez les exclusions de garanties, notamment les conditions préexistantes, les sports à risque et les pandémies. Assurez-vous que le contrat couvre le rapatriement sanitaire vers la France. Contrôlez les plafonds de remboursement, particulièrement pour l'hospitalisation. Examinez le réseau de professionnels de santé partenaires dans votre pays de destination (tiers payant vs avance de frais). Enfin, soyez attentif à l'évolution des cotisations avec l'âge : certains contrats deviennent prohibitifs après 60 ans. La souscription avant le départ est fortement recommandée, car les questionnaires médicaux sont généralement plus favorables lorsqu'on s'assure avant de quitter son pays d'origine.`,
    category: 'guide',
    tags: ['assurance santé', 'CFE', 'couverture médicale', 'sécurité sociale', 'rapatriement'],
    author: 'System Compass',
    publishedAt: '2025-03-18',
    readTime: 11,
    featured: false,
    imageAlt: 'Illustration d\'un stéthoscope posé sur un passeport et des documents d\'assurance',
  },
  {
    id: '9',
    slug: 'creer-entreprise-etranger-juridictions-regimes-fiscaux',
    title: 'Créer son entreprise à l\'étranger : juridictions et régimes fiscaux',
    excerpt: 'Estonie, Dubaï, Irlande, Singapour : analyse comparative des juridictions les plus attractives pour créer et gérer une entreprise depuis l\'étranger.',
    content: `La création d'une entreprise à l'étranger est une démarche de plus en plus courante, portée par la globalisation et la dématérialisation des activités économiques. Que vous soyez freelance, consultant, e-commerçant ou fondateur de startup, le choix de la juridiction d'incorporation a des implications majeures sur votre fiscalité, votre crédibilité commerciale et votre cadre réglementaire. Ce choix ne doit pas se faire uniquement sur des critères fiscaux.

L'Estonie est devenue une référence pour les entrepreneurs numériques grâce à son programme e-Residency. Ce pays balte propose un taux d'imposition de 0 % sur les bénéfices réinvestis dans l'entreprise. L'impôt de 20 % ne s'applique que lors de la distribution de dividendes. La création d'entreprise est entièrement dématérialisée, les formalités administratives sont minimalistes, et l'écosystème entrepreneurial est très dynamique. Le coût de création et de maintenance d'une OÜ (équivalent de la SARL) est raisonnable : environ 200 euros de frais de création et 100 à 300 euros par mois pour la comptabilité. Attention cependant : si vous êtes résident fiscal français et que votre entreprise estonienne est dirigée depuis la France, elle peut être considérée comme ayant son établissement stable en France et être imposée en France.

Dubaï (Émirats Arabes Unis) attire un nombre croissant d'entrepreneurs grâce à l'absence d'impôt sur les sociétés pour les entreprises réalisant moins de 375 000 AED de bénéfices (environ 95 000 euros), et un taux de 9 % au-delà. Les zones franches (DMCC, DIFC, DAFZA) offrent des conditions d'installation simplifiées avec des licences commerciales dédiées. Le visa entrepreneur est accessible et la qualité de vie est excellente, avec des infrastructures de premier plan. Les inconvénients incluent un coût de la vie élevé, la nécessité de louer un bureau (ou un virtual office) dans la zone franche, et des frais de visa et de licence annuels conséquents (5 000 à 15 000 euros par an selon la zone franche).

L'Irlande est le choix privilégié pour les entreprises technologiques et les activités liées à la propriété intellectuelle. Son taux d'impôt sur les sociétés de 12,5 % sur les bénéfices commerciaux est l'un des plus bas d'Europe. Membre de l'Union européenne, l'Irlande offre un accès au marché unique et un réseau de conventions fiscales très étendu. Dublin dispose d'un écosystème tech mature avec la présence des sièges européens de Google, Facebook, Apple et de nombreuses startups. La création d'une Limited (Ltd) est rapide et relativement peu coûteuse. Cependant, le coût de la vie à Dublin est élevé et l'Irlande a renforcé ses règles de substance économique pour lutter contre les montages artificiels.

D'autres juridictions méritent d'être considérées selon votre activité : Singapour pour le commerce en Asie (taux de 17 % avec des exemptions pour les nouvelles entreprises), Hong Kong pour sa simplicité administrative et son taux de 8,25 % sur les premiers 2 millions HKD de bénéfices, ou le Portugal avec le régime de la Madeira International Business Center (taux réduit de 5 % sous conditions). Le choix doit intégrer des critères au-delà de la fiscalité : réputation de la juridiction, facilité bancaire, stabilité juridique, réseau de conventions fiscales, obligations comptables et coût de gestion annuel.

Avertissement : La création d'une structure à l'étranger dans un but principalement fiscal sans substance économique réelle (bureaux, employés, activité effective) peut être requalifiée par l'administration fiscale française comme un montage abusif. Les règles CFC (Controlled Foreign Company) permettent à la France d'imposer les bénéfices d'une société étrangère contrôlée par un résident français si cette société est soumise à un régime fiscal privilégié. Toute structuration internationale doit être accompagnée par des professionnels qualifiés et respecter la substance économique réelle.`,
    category: 'fiscal',
    tags: ['entreprise', 'création société', 'juridiction', 'e-residency', 'fiscalité entreprise'],
    author: 'System Compass',
    publishedAt: '2025-03-25',
    readTime: 14,
    featured: false,
    imageAlt: 'Globe terrestre entouré de documents d\'entreprise et de drapeaux internationaux',
  },
  {
    id: '10',
    slug: 'choc-culturel-comprendre-surmonter-phases-adaptation',
    title: 'Le choc culturel : comprendre et surmonter les phases d\'adaptation',
    excerpt: 'Lune de miel, frustration, ajustement, adaptation : décryptage des 4 phases du choc culturel et stratégies concrètes pour traverser chaque étape.',
    content: `Le choc culturel est une expérience quasi universelle pour tout expatrié, quelle que soit la destination. Même les voyageurs aguerris et les personnes les plus ouvertes d'esprit y sont confrontés. Loin d'être un signe de faiblesse, c'est une réaction psychologique normale face au bouleversement de tous les repères culturels, sociaux et comportementaux qui structurent notre quotidien. Comprendre ce processus permet de le traverser plus sereinement.

Le modèle de Kalervo Oberg, anthropologue qui a formalisé le concept en 1954, décrit quatre phases distinctes. La première est la « lune de miel » : tout est nouveau, excitant et fascinant. Les différences culturelles sont perçues comme pittoresques et enrichissantes. Cette phase dure généralement de quelques semaines à quelques mois. Puis vient la phase de « frustration » ou de « crise » : l'enthousiasme initial laisse place à l'irritation. Les différences culturelles, autrefois charmantes, deviennent source d'agacement. La barrière linguistique pèse, les démarches administratives semblent kafkaïennes, les codes sociaux sont indéchiffrables. Un sentiment de solitude et de nostalgie du pays d'origine s'installe. C'est la phase la plus difficile et celle où le risque d'abandon du projet est le plus élevé.

La troisième phase est celle de l'« ajustement » : progressivement, vous commencez à comprendre les codes culturels locaux, même si vous ne les adoptez pas tous. Vous développez des stratégies pour naviguer dans votre environnement. Les amitiés locales se construisent, la langue s'améliore, les routines s'installent. Vous commencez à apprécier certains aspects de la culture locale tout en gardant un regard critique sain. La quatrième phase est celle de l'« adaptation » ou de la « maîtrise biculturelle » : vous évoluez avec aisance dans la culture locale tout en conservant votre identité culturelle d'origine. Vous êtes capable de naviguer entre les deux cultures, d'en apprécier les forces respectives et d'en comprendre les limites.

Pour traverser ces phases, plusieurs stratégies ont fait leurs preuves. Premièrement, investissez massivement dans l'apprentissage de la langue locale. Même un niveau basique de communication transforme radicalement votre expérience quotidienne et la perception que les locaux ont de vous. Deuxièmement, construisez un réseau social diversifié : ne vous limitez pas à la communauté expatriée (même si elle est un soutien précieux dans les premiers mois), mais nouez des liens avec des locaux. Troisièmement, maintenez une activité physique régulière et des habitudes de vie saines : le stress du changement culturel a un impact réel sur le corps et l'alimentation, le sommeil et l'exercice sont vos meilleurs alliés.

Le « choc culturel inversé » au retour dans son pays d'origine est un phénomène moins connu mais tout aussi déstabilisant. Après une expatriation prolongée, on ne retrouve jamais exactement le pays, les amis et la vie qu'on a quittés. On a changé, et notre entourage aussi. Ce décalage peut être source de frustration et de sentiment d'étrangeté dans son propre pays. En avoir conscience permet de s'y préparer. L'expatriation est en définitive un voyage intérieur autant qu'un déplacement géographique. Elle nous confronte à nos certitudes, élargit notre vision du monde et nous transforme en profondeur. C'est précisément cette transformation qui en fait une expérience si précieuse et si formatrice.`,
    category: 'lifestyle',
    tags: ['choc culturel', 'adaptation', 'intégration', 'psychologie', 'expatriation'],
    author: 'System Compass',
    publishedAt: '2025-04-02',
    readTime: 10,
    featured: false,
    imageAlt: 'Illustration abstraite représentant les différentes phases d\'adaptation culturelle',
  },
];

/**
 * Get a blog article by its slug
 */
export function getArticleBySlug(slug: string): BlogArticle | undefined {
  return blogArticles.find(article => article.slug === slug);
}

/**
 * Get related articles (same category, excluding current)
 */
export function getRelatedArticles(article: BlogArticle, limit = 3): BlogArticle[] {
  return blogArticles
    .filter(a => a.id !== article.id && (a.category === article.category || a.tags.some(tag => article.tags.includes(tag))))
    .slice(0, limit);
}

/**
 * Get featured articles
 */
export function getFeaturedArticles(): BlogArticle[] {
  return blogArticles.filter(article => article.featured);
}

/**
 * Get all unique tags
 */
export function getAllTags(): string[] {
  const tags = new Set<string>();
  blogArticles.forEach(article => article.tags.forEach(tag => tags.add(tag)));
  return Array.from(tags).sort();
}
