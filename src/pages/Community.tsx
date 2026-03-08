import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { SITE_CONFIG } from '@/config/site';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Users, 
  BookOpen, 
  Youtube, 
  Podcast, 
  Calendar, 
  ExternalLink,
  Globe2,
  Heart,
  Sparkles,
  Trophy,
  Star,
  ArrowRight,
  Hash,
  Mic,
  Video,
  CheckCircle2,
  Bell
} from 'lucide-react';
import { toast } from 'sonner';
import { useEventRegistration } from '@/hooks/useEventRegistration';
import { NewsletterSignup } from '@/components/community/NewsletterSignup';
import { ForumPreview } from '@/components/community/ForumPreview';
import { DiscussionThread } from '@/components/community/DiscussionThread';
import { ResourceLibrary } from '@/components/community/ResourceLibrary';

interface DiscordChannel {
  name: string;
  description: string;
  icon: React.ReactNode;
}

const DISCORD_CHANNELS: DiscordChannel[] = [
  { name: '#introductions', description: 'Présentez-vous à la communauté', icon: <Heart className="h-4 w-4" /> },
  { name: '#general-expat', description: 'Discussions générales sur l\'expatriation', icon: <MessageCircle className="h-4 w-4" /> },
  { name: '#ask-the-community', description: 'Posez vos questions, recevez des réponses', icon: <Users className="h-4 w-4" /> },
  { name: '#visa-immigration', description: 'Partagez vos expériences visa', icon: <Globe2 className="h-4 w-4" /> },
  { name: '#fiscalité', description: 'Optimisation et questions fiscales', icon: <Hash className="h-4 w-4" /> },
  { name: '#digital-nomads', description: 'Pour les travailleurs à distance', icon: <Sparkles className="h-4 w-4" /> },
  { name: '#job-opportunities', description: 'Offres d\'emploi et opportunités', icon: <Trophy className="h-4 w-4" /> },
  { name: '#success-stories', description: 'Partagez vos réussites !', icon: <Star className="h-4 w-4" /> },
];

const COUNTRY_CHANNELS = [
  'france', 'portugal', 'spain', 'uae', 'singapore', 'switzerland', 
  'germany', 'usa', 'canada', 'thailand', 'vietnam', 'malaysia'
];

// Generate dynamic upcoming dates
const getUpcomingDate = (daysFromNow: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
};

const UPCOMING_EVENTS = [
  {
    id: '1',
    title: 'AMA: Fiscalité des Digital Nomads',
    date: getUpcomingDate(7),
    time: '19:00 CET',
    speaker: 'Maître Sophie Laurent',
    type: 'webinar',
  },
  {
    id: '2',
    title: 'Meetup Paris - Expats & Entrepreneurs',
    date: getUpcomingDate(14),
    time: '18:30',
    location: 'Paris, France',
    type: 'meetup',
  },
  {
    id: '3',
    title: 'Workshop: Préparer son départ en 90 jours',
    date: getUpcomingDate(21),
    time: '14:00 CET',
    type: 'workshop',
  },
];

const CONTENT_RESOURCES = [
  {
    id: '1',
    type: 'podcast',
    title: 'System Compass Podcast',
    description: 'Interviews d\'expatriés et d\'experts chaque semaine.',
    statusLabel: 'En préparation',
    link: '#',
  },
  {
    id: '2',
    type: 'youtube',
    title: 'Chaîne YouTube',
    description: 'Tutoriels, analyses de pays et conseils pratiques.',
    statusLabel: 'En préparation',
    link: '#',
  },
  {
    id: '3',
    type: 'blog',
    title: 'Blog & Guides',
    description: 'Articles approfondis et guides étape par étape.',
    statusLabel: 'En préparation',
    link: '#',
  },
];

export default function Community() {
  const { t } = useTranslation();
  const { register, isRegistered, isLoading } = useEventRegistration();

  const handleJoinDiscord = () => {
    toast.success(t('toast.community.discordRedirect', 'Redirection vers Discord'), {
      description: t('toast.community.discordJoin', 'Rejoignez notre communauté de +5000 membres !'),
    });
    // In production: window.open('https://discord.gg/systemcompass', '_blank');
  };

  const handleEventRegister = async (event: typeof UPCOMING_EVENTS[0]) => {
    const success = await register({
      eventId: event.id,
      eventTitle: event.title,
      eventDate: event.date,
      eventType: event.type as 'webinar' | 'meetup' | 'workshop' | 'ama',
    });
    if (success) {
      toast.success(t('toast.community.registered', 'Inscrit à "{{title}}"', { title: event.title }));
    }
  };

  return (
    <>
      <Helmet>
        <title>Communauté — Compass</title>
        <meta name="description" content="Rejoignez la communauté Compass : forum, ressources, événements et échanges entre expatriés." />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Communauté — Compass" />
        <meta property="og:description" content="Forum, ressources et événements pour expatriés et aspirants au départ." />
        <meta property="og:image" content={SITE_CONFIG.ogImageUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Communauté - System Compass" />
        <meta name="twitter:description" content="Forum, ressources et événements pour expatriés et aspirants au départ." />
        <meta name="twitter:image" content={SITE_CONFIG.ogImageUrl} />
      </Helmet>
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold gold-text">
          Communauté System Compass
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Rejoignez des milliers d'expatriés, nomades numériques et futurs 
          expatriés. Échangez, apprenez, entraidez-vous.
        </p>
      </div>

      {/* Discord Hero */}
      <Card className="glass-card-elevated bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 overflow-hidden">
        <CardContent className="p-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-indigo-500/20">
                  <MessageCircle className="h-8 w-8 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Discord Officiel</h2>
                  <p className="text-muted-foreground">+5,000 membres actifs</p>
                </div>
              </div>
              
              <p className="text-lg">
                Notre serveur Discord est le cœur de la communauté. Échangez en temps réel 
                avec des expatriés du monde entier, posez vos questions et partagez vos expériences.
              </p>

              <div className="flex flex-wrap gap-3">
                <Badge className="bg-emerald-500/20 text-emerald-400">
                  <Users className="h-3 w-3 mr-1" />
                  Communauté active
                </Badge>
                <Badge className="bg-blue-500/20 text-blue-400">
                  <Globe2 className="h-3 w-3 mr-1" />
                  80+ pays représentés
                </Badge>
                <Badge className="bg-purple-500/20 text-purple-400">
                  <Mic className="h-3 w-3 mr-1" />
                  Événements vocaux
                </Badge>
              </div>

              <Button size="lg" onClick={handleJoinDiscord} className="gap-2">
                <MessageCircle className="h-5 w-5" />
                Rejoindre le Discord
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Salons populaires</h3>
              <div className="grid grid-cols-2 gap-2">
                {DISCORD_CHANNELS.slice(0, 6).map((channel) => (
                  <div 
                    key={channel.name}
                    className="p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {channel.icon}
                      <span className="font-mono text-sm">{channel.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{channel.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Country Channels */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe2 className="h-5 w-5 text-primary" />
            Salons par pays
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Retrouvez des expatriés dans votre destination de rêve
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {COUNTRY_CHANNELS.map((country) => (
              <Badge 
                key={country} 
                variant="secondary" 
                className="cursor-pointer hover:bg-primary/20 transition-colors"
                onClick={handleJoinDiscord}
              >
                #{country}
              </Badge>
            ))}
            <Badge variant="outline" className="cursor-pointer">
              +38 autres pays...
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Events */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Événements à venir
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {UPCOMING_EVENTS.map((event) => (
            <Card key={event.id} className="glass-card hover:shadow-md transition-all duration-300">
              <CardContent className="p-5">
                <div className="space-y-3">
                  <Badge variant={event.type === 'webinar' ? 'default' : 'secondary'}>
                    {event.type === 'webinar' && <Video className="h-3 w-3 mr-1" />}
                    {event.type === 'meetup' && <Users className="h-3 w-3 mr-1" />}
                    {event.type === 'workshop' && <BookOpen className="h-3 w-3 mr-1" />}
                    {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                  </Badge>
                  
                  <h3 className="font-semibold">{event.title}</h3>
                  
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(event.date).toLocaleDateString('fr-FR', { 
                        weekday: 'long', 
                        day: 'numeric', 
                        month: 'long' 
                      })}
                    </p>
                    <p>{event.time}</p>
                    {event.speaker && <p>Avec {event.speaker}</p>}
                    {event.location && <p>{event.location}</p>}
                  </div>

                  {isRegistered(event.id) ? (
                    <Button variant="secondary" className="w-full" disabled>
                      <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-500" />
                      Inscrit
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleEventRegister(event)}
                      disabled={isLoading}
                    >
                      S'inscrire
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Content Resources */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Contenu & Ressources
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {CONTENT_RESOURCES.map((resource) => (
            <Card 
              key={resource.id} 
              className="glass-card hover:shadow-md transition-all duration-300 cursor-pointer relative overflow-hidden"
              onClick={() => toast.info(t('toast.community.comingSoon', 'Contenu bientôt disponible'))}
            >
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="text-[10px]">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Bientôt
                </Badge>
              </div>
              <CardContent className="p-5">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-primary/10">
                      {resource.type === 'podcast' && <Podcast className="h-6 w-6 text-primary" />}
                      {resource.type === 'youtube' && <Youtube className="h-6 w-6 text-red-500" />}
                      {resource.type === 'blog' && <BookOpen className="h-6 w-6 text-primary" />}
                    </div>
                    <div>
                      <h3 className="font-semibold">{resource.title}</h3>
                      <p className="text-xs text-muted-foreground">
                        {resource.statusLabel}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{resource.description}</p>
                  <Button variant="ghost" className="w-full justify-between">
                    Explorer
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Community CTA - Notification */}
      <Card className="glass-card border-primary/20">
        <CardContent className="p-8 text-center space-y-4">
          <Sparkles className="w-8 h-8 text-primary mx-auto" />
          <h3 className="text-xl font-bold">Notre communauté grandit</h3>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Podcast, chaîne YouTube, blog et bien plus arrivent bientôt. 
            Inscrivez-vous pour être informé du lancement.
          </p>
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => {
              toast.success('Vous serez notifié du lancement !');
            }}
          >
            <Bell className="w-4 h-4" />
            Être informé du lancement
          </Button>
        </CardContent>
      </Card>

      {/* Discussion Thread */}
      <DiscussionThread 
        title="Discussions récentes"
        category="general"
      />

      {/* Resource Library */}
      <ResourceLibrary />

      {/* Forum Preview */}
      <ForumPreview />

      {/* Newsletter Signup */}
      <NewsletterSignup />

      {/* CTA */}
      <Card className="glass-card-elevated bg-gradient-to-r from-primary/10 to-primary/5">
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Prêt à rejoindre l'aventure ?</h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            Que vous prépariez votre expatriation ou que vous soyez déjà installé ailleurs,
            notre communauté est là pour vous accompagner.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" onClick={handleJoinDiscord}>
              <MessageCircle className="h-5 w-5 mr-2" />
              Rejoindre Discord
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
}
