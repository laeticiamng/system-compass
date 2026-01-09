import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft, 
  Brain, 
  Clock, 
  Gauge, 
  Zap, 
  User,
  Timer,
  BookOpen,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Quote
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface OVIArticleProps {
  articleId: string;
  onBack: () => void;
}

interface ArticleContent {
  icon: any;
  title: string;
  subtitle: string;
  readTime: string;
  color: string;
  sections: {
    title: string;
    content: string[];
    type?: 'text' | 'list' | 'quote' | 'warning';
  }[];
  keyTakeaways: string[];
}

export function OVIArticle({ articleId, onBack }: OVIArticleProps) {
  const { t } = useTranslation();

  const articles: Record<string, ArticleContent> = {
    'cognitive-bias': {
      icon: Brain,
      title: t('ovi.articles.bias.title', 'Biais cognitifs'),
      subtitle: t('ovi.articles.bias.subtitle', 'Les filtres invisibles de nos décisions'),
      readTime: '8 min',
      color: 'primary',
      sections: [
        {
          title: t('ovi.articles.bias.s1.title', 'Introduction'),
          content: [
            t('ovi.articles.bias.s1.p1', 'Notre cerveau est une machine extraordinaire, capable de traiter des millions d\'informations par seconde. Pour y parvenir, il utilise des raccourcis — des heuristiques qui nous permettent de décider vite.'),
            t('ovi.articles.bias.s1.p2', 'Ces raccourcis sont précieux dans la vie quotidienne. Mais ils peuvent devenir des pièges dans les décisions importantes, là où la nuance compte.')
          ]
        },
        {
          title: t('ovi.articles.bias.s2.title', 'Les biais les plus courants'),
          type: 'list',
          content: [
            t('ovi.articles.bias.s2.i1', 'Biais de confirmation : chercher les informations qui confirment ce qu\'on croit déjà'),
            t('ovi.articles.bias.s2.i2', 'Biais d\'ancrage : accorder trop d\'importance à la première information reçue'),
            t('ovi.articles.bias.s2.i3', 'Biais de disponibilité : surestimer ce qui est facilement mémorisable'),
            t('ovi.articles.bias.s2.i4', 'Biais du survivant : ne voir que les succès, pas les échecs silencieux'),
            t('ovi.articles.bias.s2.i5', 'Biais de statu quo : préférer ne rien changer, même quand c\'est sous-optimal'),
            t('ovi.articles.bias.s2.i6', 'Aversion à la perte : craindre de perdre plus qu\'on désire gagner')
          ]
        },
        {
          title: t('ovi.articles.bias.s3.title', 'Pourquoi c\'est difficile à voir'),
          content: [
            t('ovi.articles.bias.s3.p1', 'Les biais sont invisibles précisément parce qu\'ils font partie de notre façon de penser. On ne peut pas "sortir" de son cerveau pour l\'observer de l\'extérieur.'),
            t('ovi.articles.bias.s3.p2', 'C\'est pourquoi les cadres de réflexion, les grilles de lecture et le dialogue avec d\'autres perspectives sont si importants. Ils créent une distance — un espace pour voir ce qui nous échappe.')
          ]
        },
        {
          title: '',
          type: 'quote',
          content: [
            t('ovi.articles.bias.quote', 'Le premier pas vers la lucidité n\'est pas de supprimer ses biais — c\'est d\'admettre qu\'on en a.')
          ]
        },
        {
          title: t('ovi.articles.bias.s4.title', 'Que faire ?'),
          content: [
            t('ovi.articles.bias.s4.p1', 'Il ne s\'agit pas d\'éliminer les biais — c\'est impossible. Il s\'agit de créer des conditions où ils ont moins de prise sur nos décisions importantes.'),
            t('ovi.articles.bias.s4.p2', 'Ralentir. Écrire. Questionner ses certitudes. Chercher des avis divergents. Distinguer ce qu\'on sait de ce qu\'on suppose.')
          ]
        }
      ],
      keyTakeaways: [
        t('ovi.articles.bias.key1', 'Les biais sont des raccourcis utiles — sauf dans les décisions complexes'),
        t('ovi.articles.bias.key2', 'On ne peut pas les supprimer, mais on peut créer de la distance'),
        t('ovi.articles.bias.key3', 'Le doute méthodique est un outil, pas une faiblesse')
      ]
    },
    'irreversible-decisions': {
      icon: Clock,
      title: t('ovi.articles.irreversible.title', 'Décisions irréversibles'),
      subtitle: t('ovi.articles.irreversible.subtitle', 'Distinguer ce qui peut être défait de ce qui ne peut pas l\'être'),
      readTime: '6 min',
      color: 'amber',
      sections: [
        {
          title: t('ovi.articles.irreversible.s1.title', 'Le piège de l\'uniformité'),
          content: [
            t('ovi.articles.irreversible.s1.p1', 'Nous avons tendance à traiter toutes les décisions de la même façon. Pourtant, certaines peuvent être annulées en quelques clics ; d\'autres engagent pour des années, voire pour toujours.'),
            t('ovi.articles.irreversible.s1.p2', 'Confondre les deux, c\'est soit hésiter trop longtemps sur ce qui n\'est pas grave, soit s\'engager trop vite sur ce qui l\'est.')
          ]
        },
        {
          title: t('ovi.articles.irreversible.s2.title', 'Une typologie simple'),
          type: 'list',
          content: [
            t('ovi.articles.irreversible.s2.i1', 'Type 1 : Irréversibles. Une fois franchies, pas de retour. Exemples : avoir un enfant, révéler un secret, détruire une relation.'),
            t('ovi.articles.irreversible.s2.i2', 'Type 2 : Réversibles avec coût. On peut revenir en arrière, mais ça coûte (temps, argent, énergie). Exemples : changer de pays, quitter un emploi, acheter un bien.'),
            t('ovi.articles.irreversible.s2.i3', 'Type 3 : Facilement réversibles. Peu de conséquences à annuler. Exemples : tester un outil, modifier un document, reporter une réunion.')
          ]
        },
        {
          title: '',
          type: 'warning',
          content: [
            t('ovi.articles.irreversible.warning', 'Attention : nous sous-estimons souvent le coût de réversibilité. "Je pourrai toujours revenir" est parfois une illusion confortable.')
          ]
        },
        {
          title: t('ovi.articles.irreversible.s3.title', 'Adapter sa méthode'),
          content: [
            t('ovi.articles.irreversible.s3.p1', 'Plus une décision est irréversible, plus elle mérite du temps, de la réflexion et des perspectives multiples.'),
            t('ovi.articles.irreversible.s3.p2', 'Les décisions de Type 1 demandent une vraie pause. Pas de l\'hésitation stérile — mais du temps pour voir ce qu\'on ne voit pas encore.')
          ]
        }
      ],
      keyTakeaways: [
        t('ovi.articles.irreversible.key1', 'Toutes les décisions ne méritent pas le même investissement'),
        t('ovi.articles.irreversible.key2', 'Le coût de réversibilité est souvent sous-estimé'),
        t('ovi.articles.irreversible.key3', 'Plus c\'est irréversible, plus ça mérite du temps')
      ]
    },
    'control-illusion': {
      icon: Gauge,
      title: t('ovi.articles.control.title', 'Illusion de contrôle'),
      subtitle: t('ovi.articles.control.subtitle', 'Ce qui dépend vraiment de nous'),
      readTime: '7 min',
      color: 'purple',
      sections: [
        {
          title: t('ovi.articles.control.s1.title', 'Le mythe du "tout est possible"'),
          content: [
            t('ovi.articles.control.s1.p1', 'La culture contemporaine valorise l\'agentivité : "si tu veux, tu peux". C\'est parfois vrai. C\'est parfois un mensonge cruel.'),
            t('ovi.articles.control.s1.p2', 'Nous évoluons dans des systèmes — économiques, sociaux, institutionnels — qui contraignent nos possibilités. Les ignorer, c\'est se préparer à des déceptions.')
          ]
        },
        {
          title: t('ovi.articles.control.s2.title', 'Trois zones à distinguer'),
          type: 'list',
          content: [
            t('ovi.articles.control.s2.i1', 'Zone de contrôle : ce qui dépend entièrement de moi (mes actions, mes réactions, mon effort)'),
            t('ovi.articles.control.s2.i2', 'Zone d\'influence : ce sur quoi je peux agir, mais sans garantie (mes relations, certaines opportunités)'),
            t('ovi.articles.control.s2.i3', 'Zone d\'acceptation : ce qui m\'échappe (le marché, les décisions des autres, le hasard)')
          ]
        },
        {
          title: t('ovi.articles.control.s3.title', 'Pourquoi ça compte'),
          content: [
            t('ovi.articles.control.s3.p1', 'Confondre ces zones génère soit de la frustration (quand on échoue à contrôler l\'incontrôlable), soit de la passivité (quand on renonce à agir là où on le peut).'),
            t('ovi.articles.control.s3.p2', 'La lucidité consiste à investir son énergie là où elle a prise, et à accepter le reste — non par résignation, mais par réalisme.')
          ]
        }
      ],
      keyTakeaways: [
        t('ovi.articles.control.key1', 'Tout n\'est pas sous notre contrôle — et c\'est normal'),
        t('ovi.articles.control.key2', 'Distinguer contrôle, influence et acceptation économise de l\'énergie'),
        t('ovi.articles.control.key3', 'La lucidité n\'est pas la résignation')
      ]
    },
    'speed-vs-rush': {
      icon: Zap,
      title: t('ovi.articles.speed.title', 'Vitesse vs Précipitation'),
      subtitle: t('ovi.articles.speed.subtitle', 'Agir vite n\'est pas agir dans l\'urgence'),
      readTime: '5 min',
      color: 'emerald',
      sections: [
        {
          title: t('ovi.articles.speed.s1.title', 'Deux façons d\'aller vite'),
          content: [
            t('ovi.articles.speed.s1.p1', 'La vitesse peut être un avantage stratégique. Agir avant les autres, saisir une opportunité, itérer rapidement — tout cela a de la valeur.'),
            t('ovi.articles.speed.s1.p2', 'Mais il y a une différence entre la vitesse délibérée et la précipitation. L\'une est choisie ; l\'autre est subie.')
          ]
        },
        {
          title: t('ovi.articles.speed.s2.title', 'Signaux de précipitation'),
          type: 'list',
          content: [
            t('ovi.articles.speed.s2.i1', 'On n\'a pas le temps de poser la question "est-ce vraiment urgent ?"'),
            t('ovi.articles.speed.s2.i2', 'On ignore les doutes parce qu\'il faut avancer'),
            t('ovi.articles.speed.s2.i3', 'On justifie la hâte par la peur de manquer quelque chose'),
            t('ovi.articles.speed.s2.i4', 'On ne peut pas expliquer clairement pourquoi maintenant')
          ]
        },
        {
          title: t('ovi.articles.speed.s3.title', 'La vraie question'),
          content: [
            t('ovi.articles.speed.s3.p1', 'Avant d\'agir vite, demandez-vous : "Est-ce que je choisis cette vitesse, ou est-ce que je la subis ?"'),
            t('ovi.articles.speed.s3.p2', 'La vitesse choisie est puissante. La précipitation subie est dangereuse.')
          ]
        }
      ],
      keyTakeaways: [
        t('ovi.articles.speed.key1', 'La vitesse peut être un atout — si elle est choisie'),
        t('ovi.articles.speed.key2', 'La précipitation est souvent un symptôme, pas une stratégie'),
        t('ovi.articles.speed.key3', 'Prendre 5 minutes pour se poser la question peut éviter 5 mois de regrets')
      ]
    },
    'individual-vs-system': {
      icon: User,
      title: t('ovi.articles.individual.title', 'Individu vs Système'),
      subtitle: t('ovi.articles.individual.subtitle', 'Responsabilité personnelle et contraintes structurelles'),
      readTime: '9 min',
      color: 'blue',
      sections: [
        {
          title: t('ovi.articles.individual.s1.title', 'Un faux dilemme'),
          content: [
            t('ovi.articles.individual.s1.p1', 'D\'un côté, le discours du "tout est possible si tu y crois". De l\'autre, le fatalisme systémique : "le système est contre toi".'),
            t('ovi.articles.individual.s1.p2', 'Les deux sont vrais — et faux. La réalité est plus nuancée : nous agissons dans des systèmes qui nous contraignent ET nous offrent des possibilités.')
          ]
        },
        {
          title: t('ovi.articles.individual.s2.title', 'Ce que le système fait'),
          content: [
            t('ovi.articles.individual.s2.p1', 'Un système définit des règles, des incitations, des obstacles. Il récompense certains comportements et en punit d\'autres. Il crée des chemins faciles et des impasses.'),
            t('ovi.articles.individual.s2.p2', 'Ignorer le système, c\'est se battre contre des forces invisibles. Le comprendre, c\'est savoir où placer ses efforts.')
          ]
        },
        {
          title: t('ovi.articles.individual.s3.title', 'Ce qui reste à l\'individu'),
          content: [
            t('ovi.articles.individual.s3.p1', 'Même dans les systèmes les plus contraignants, il reste des marges. Des choix. Des façons de naviguer.'),
            t('ovi.articles.individual.s3.p2', 'La responsabilité individuelle n\'est pas de tout contrôler — c\'est de faire le maximum avec ce qui est sous notre contrôle.')
          ]
        }
      ],
      keyTakeaways: [
        t('ovi.articles.individual.key1', 'Ni tout-puissant, ni impuissant'),
        t('ovi.articles.individual.key2', 'Comprendre le système aide à mieux y naviguer'),
        t('ovi.articles.individual.key3', 'La responsabilité porte sur ce qui dépend de nous, pas sur le reste')
      ]
    }
  };

  const article = articles[articleId];
  
  if (!article) {
    return (
      <div className="min-h-screen pt-20 md:pt-24 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Article non trouvé</p>
          <Button onClick={onBack}>Retour</Button>
        </div>
      </div>
    );
  }

  const Icon = article.icon;

  const colorClasses: Record<string, string> = {
    primary: 'text-primary bg-primary/10',
    amber: 'text-amber-600 bg-amber-500/10',
    purple: 'text-purple-600 bg-purple-500/10',
    emerald: 'text-emerald-600 bg-emerald-500/10',
    blue: 'text-blue-600 bg-blue-500/10'
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 pt-20 md:pt-24">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Back Button */}
          <Button variant="ghost" onClick={onBack} className="mb-6 gap-2">
            <ArrowLeft className="w-4 h-4" />
            {t('common.back', 'Retour')}
          </Button>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${colorClasses[article.color]}`}>
                <Icon className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Timer className="w-4 h-4" />
                  {article.readTime}
                </div>
                <h1 className="font-display text-3xl font-bold">{article.title}</h1>
              </div>
            </div>
            <p className="text-xl text-muted-foreground">{article.subtitle}</p>
          </div>

          <Separator className="mb-8" />

          {/* Content */}
          <article className="prose prose-lg dark:prose-invert max-w-none space-y-8">
            {article.sections.map((section, idx) => (
              <div key={idx}>
                {section.title && (
                  <h2 className="font-display text-xl font-semibold mb-4">{section.title}</h2>
                )}
                
                {section.type === 'list' ? (
                  <ul className="space-y-3">
                    {section.content.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : section.type === 'quote' ? (
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <Quote className="w-8 h-8 text-primary flex-shrink-0" />
                        <p className="text-lg italic">{section.content[0]}</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : section.type === 'warning' ? (
                  <Card className="bg-amber-500/5 border-amber-500/20">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <p className="text-muted-foreground">{section.content[0]}</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  section.content.map((p, i) => (
                    <p key={i} className="text-muted-foreground leading-relaxed">{p}</p>
                  ))
                )}
              </div>
            ))}
          </article>

          <Separator className="my-8" />

          {/* Key Takeaways */}
          <Card className="bg-muted/30">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                {t('ovi.articles.keyTakeaways', 'Points clés')}
              </h3>
              <ul className="space-y-3">
                {article.keyTakeaways.map((takeaway, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-0.5">{i + 1}</Badge>
                    <span>{takeaway}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="mt-8 text-center">
            <Button variant="outline" onClick={onBack} className="gap-2">
              <BookOpen className="w-4 h-4" />
              {t('ovi.articles.backToFrameworks', 'Retour aux cadres')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
