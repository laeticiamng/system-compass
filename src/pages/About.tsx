import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  Compass, 
  Target, 
  ShieldX, 
  BookOpen, 
  Users, 
  ArrowRight,
  Key,
  Gamepad2,
  HelpCircle,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function About() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Hero */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Compass className="w-4 h-4" />
            {t('about.badge', 'Notre mission')}
          </div>
          
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
            {t('about.title', 'Outil de lucidité stratégique')}
          </h1>
          
          <p className="text-xl text-muted-foreground mb-4">
            {t('about.subtitle', 'Simulateur de décisions dans des systèmes réels. Outil d\'analyse uniquement.')}
          </p>

          <p className="text-primary font-medium">
            {t('common.positioningLine', 'Tu décides, nous éclairons.')}
          </p>
        </div>

        {/* What we are */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="glass-card rounded-2xl p-8 md:p-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-lg bg-emerald-500/10">
                <Target className="w-6 h-6 text-emerald-500" />
              </div>
              <h2 className="font-display text-2xl font-bold">
                {t('about.whatWeAre.title', 'Ce que nous sommes')}
              </h2>
            </div>
            
            <ul className="space-y-4 text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="text-emerald-500 mt-1">✓</span>
                <span>{t('about.whatWeAre.point1', 'Un simulateur pour tester des décisions avant de les vivre')}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-500 mt-1">✓</span>
                <span>{t('about.whatWeAre.point2', 'Un outil d\'analyse des systèmes (fiscaux, sociaux, migratoires)')}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-500 mt-1">✓</span>
                <span>{t('about.whatWeAre.point3', 'Une grille de lecture pour comprendre comment fonctionne le monde')}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-500 mt-1">✓</span>
                <span>{t('about.whatWeAre.point4', 'Un espace de réflexion stratégique, pas de jugement')}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* What we are NOT */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="glass-card rounded-2xl p-8 md:p-12 border-rose-500/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-lg bg-rose-500/10">
                <ShieldX className="w-6 h-6 text-rose-500" />
              </div>
              <h2 className="font-display text-2xl font-bold">
                {t('about.whatWeAreNot.title', 'Ce que nous ne sommes PAS')}
              </h2>
            </div>
            
            <ul className="space-y-4 text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="text-rose-500 mt-1">✗</span>
                <span>{t('about.whatWeAreNot.point1', 'Un cabinet de conseil juridique, fiscal ou médical')}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-rose-500 mt-1">✗</span>
                <span>{t('about.whatWeAreNot.point2', 'Un coach de vie ou un service de développement personnel')}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-rose-500 mt-1">✗</span>
                <span>{t('about.whatWeAreNot.point3', 'Une promesse de réussite ou de résultats garantis')}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-rose-500 mt-1">✗</span>
                <span>{t('about.whatWeAreNot.point4', 'Un outil qui te dit quoi faire — tu restes responsable de tes décisions')}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Two modes */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="font-display text-2xl font-bold text-center mb-8">
            {t('about.modes.title', 'Deux façons d\'utiliser l\'outil')}
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass-card rounded-xl p-6 border-2 border-primary/30">
              <div className="p-3 rounded-full bg-primary/10 w-fit mb-4">
                <Key className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display font-bold text-lg mb-2">
                {t('about.modes.simulation.title', 'Simulation personnelle')}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t('about.modes.simulation.description', 'Analyse TA situation réelle, teste TES options, comprends les conséquences de TES choix potentiels.')}
              </p>
              <Link to="/exit-keys">
                <Button variant="outline" size="sm" className="gap-2">
                  Clés de Sortie
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            <div className="glass-card rounded-xl p-6 border-2 border-blue-500/30">
              <div className="p-3 rounded-full bg-blue-500/10 w-fit mb-4">
                <Gamepad2 className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="font-display font-bold text-lg mb-2">
                {t('about.modes.game.title', 'Mode éducatif (jeu)')}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t('about.modes.game.description', 'Incarne un personnage FICTIF au hasard. Découvre les mécanismes du monde sans risque. C\'est un jeu pédagogique.')}
              </p>
              <Link to="/life-game">
                <Button variant="outline" size="sm" className="gap-2">
                  Mode Éducatif
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Origin story */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="glass-card rounded-2xl p-8 md:p-12 bg-amber-500/5 border-amber-500/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-lg bg-amber-500/10">
                <BookOpen className="w-6 h-6 text-amber-500" />
              </div>
              <h2 className="font-display text-2xl font-bold">
                {t('about.origin.title', 'Pourquoi cet outil existe')}
              </h2>
            </div>
            
            <div className="space-y-4 text-muted-foreground">
              <p>
                {t('about.origin.paragraph1', 'Cet outil a été créé par quelqu\'un qui a perdu des années à faire des choix sans comprendre le système dans lequel il évoluait.')}
              </p>
              <p>
                {t('about.origin.paragraph2', 'Mauvais pays, mauvaise carrière, mauvais timing — pas par manque d\'intelligence, mais par manque de grille de lecture.')}
              </p>
              <p>
                {t('about.origin.paragraph3', 'Pyramid Compass est né de cette frustration : offrir à tous l\'analyse que seuls les privilégiés reçoivent de leur entourage.')}
              </p>
              <p className="font-medium text-foreground">
                {t('about.origin.conclusion', 'Ce n\'est pas un outil qui te dit quoi faire. C\'est un outil qui t\'aide à VOIR — pour que TU décides en connaissance de cause.')}
              </p>
            </div>
          </div>
        </div>

        {/* For everyone */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h2 className="font-display text-2xl font-bold">
                {t('about.forEveryone.title', 'Pour tout le monde')}
              </h2>
            </div>
            <p className="text-muted-foreground">
              {t('about.forEveryone.subtitle', 'Quel que soit ton point de départ, tu mérites d\'avoir accès à l\'information.')}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <span className="px-3 py-2 rounded-full bg-muted text-sm">🥖 Boulanger</span>
            <span className="px-3 py-2 rounded-full bg-muted text-sm">🏭 Ouvrier</span>
            <span className="px-3 py-2 rounded-full bg-muted text-sm">🎓 Étudiant</span>
            <span className="px-3 py-2 rounded-full bg-muted text-sm">🌴 Retraité</span>
            <span className="px-3 py-2 rounded-full bg-muted text-sm">🚀 Entrepreneur</span>
            <span className="px-3 py-2 rounded-full bg-muted text-sm">👨‍👩‍👧 Parent diaspora</span>
            <span className="px-3 py-2 rounded-full bg-muted text-sm">🌍 Migrant</span>
            <span className="px-3 py-2 rounded-full bg-muted text-sm">💼 Cadre</span>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="flex items-center gap-3 mb-8 justify-center">
            <div className="p-3 rounded-lg bg-primary/10">
              <HelpCircle className="w-6 h-6 text-primary" />
            </div>
            <h2 className="font-display text-2xl font-bold">
              {t('about.faq.title', 'Questions fréquentes')}
            </h2>
          </div>

          <Accordion type="single" collapsible className="space-y-3">
            <AccordionItem value="item-1" className="glass-card rounded-xl px-6 border-none">
              <AccordionTrigger className="text-left hover:no-underline">
                {t('about.faq.q1.question', 'Est-ce que Pyramid Compass peut me dire quel pays choisir ?')}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {t('about.faq.q1.answer', 'Non. L\'outil analyse les systèmes et simule des scénarios, mais la décision finale t\'appartient. Nous fournissons l\'information, tu fais tes propres choix.')}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="glass-card rounded-xl px-6 border-none">
              <AccordionTrigger className="text-left hover:no-underline">
                {t('about.faq.q2.question', 'Les données sont-elles fiables ?')}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {t('about.faq.q2.answer', 'Nous utilisons des sources publiques (indices de corruption, données fiscales, classements passeports). Ces données sont indicatives et peuvent évoluer. Vérifie toujours auprès de sources officielles avant toute décision importante.')}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="glass-card rounded-xl px-6 border-none">
              <AccordionTrigger className="text-left hover:no-underline">
                {t('about.faq.q3.question', 'Quelle différence entre "Ma simulation" et "Mode éducatif" ?')}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {t('about.faq.q3.answer', '"Ma simulation" (Clés de Sortie) analyse TA vraie situation avec TES paramètres. Le "Mode éducatif" te fait incarner un personnage FICTIF aléatoire pour comprendre les mécanismes sans t\'impliquer personnellement.')}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="glass-card rounded-xl px-6 border-none">
              <AccordionTrigger className="text-left hover:no-underline">
                {t('about.faq.q4.question', 'Est-ce gratuit ?')}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {t('about.faq.q4.answer', 'Oui, l\'outil est gratuit. Tu peux créer un compte pour synchroniser tes données entre appareils, mais ce n\'est pas obligatoire.')}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="glass-card rounded-xl px-6 border-none">
              <AccordionTrigger className="text-left hover:no-underline">
                {t('about.faq.q5.question', 'Mes données personnelles sont-elles protégées ?')}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {t('about.faq.q5.answer', 'Les données de simulation restent sur ton appareil ou dans ton compte personnel. Nous ne vendons pas tes données et ne les partageons avec personne.')}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6" className="glass-card rounded-xl px-6 border-none">
              <AccordionTrigger className="text-left hover:no-underline">
                {t('about.faq.q6.question', 'Puis-je utiliser cet outil pour des décisions importantes ?')}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {t('about.faq.q6.answer', 'Cet outil est un point de départ pour ta réflexion, pas une source de vérité absolue. Pour des décisions importantes (immigration, fiscalité, santé), consulte toujours des professionnels qualifiés.')}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Disclaimer */}
        <div className="max-w-2xl mx-auto">
          <div className="glass-card rounded-xl p-6 border-l-4 border-primary text-center">
            <p className="text-sm text-muted-foreground">
              {t('common.disclaimer', 'Pas de conseil juridique, financier ou médical. Tu restes responsable de tes décisions.')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
