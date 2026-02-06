/**
 * Community Quick Actions
 * Provides quick action buttons for community engagement
 */
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { 
  MessageCircle, 
  Calendar, 
  Users, 
  Podcast,
  Share2
} from 'lucide-react';

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
  badge?: string;
}

function QuickAction({ icon, label, description, onClick, badge }: QuickActionProps) {
  return (
    <button
      onClick={onClick}
      className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-all text-left group"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{label}</span>
            {badge && (
              <Badge variant="secondary" className="text-xs">
                {badge}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </button>
  );
}

export function CommunityQuickActions() {
  const { t } = useTranslation();

  const handleDiscord = () => {
    toast.info(t('community.discordRedirect', 'Redirection vers Discord...'), {
      description: t('community.discordDesc', 'Rejoignez +5000 membres de la communauté'),
    });
  };

  const handleEvents = () => {
    toast.info(t('community.viewEvents', 'Voir les événements à venir'));
    document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleResources = () => {
    toast.info(t('community.accessResources', 'Accéder aux ressources'));
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'System Compass Community',
        text: t('community.shareText', 'Rejoignez la communauté des expatriés et futurs expatriés'),
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success(t('community.linkCopied', 'Lien copié !'));
    }
  };

  return (
    <Card className="glass-card">
      <CardContent className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Actions rapides
        </h3>
        <div className="grid md:grid-cols-2 gap-3">
          <QuickAction
            icon={<MessageCircle className="w-5 h-5" />}
            label="Rejoindre Discord"
            description="Chat en temps réel avec la communauté"
            onClick={handleDiscord}
            badge="5000+ membres"
          />
          <QuickAction
            icon={<Calendar className="w-5 h-5" />}
            label="Événements"
            description="Webinaires, meetups et workshops"
            onClick={handleEvents}
            badge="3 à venir"
          />
          <QuickAction
            icon={<Podcast className="w-5 h-5" />}
            label="Podcast"
            description="Interviews d'expatriés chaque semaine"
            onClick={handleResources}
            badge="45 épisodes"
          />
          <QuickAction
            icon={<Share2 className="w-5 h-5" />}
            label="Partager"
            description="Inviter un ami à rejoindre"
            onClick={handleShare}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function CommunityStats() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="p-4 rounded-lg bg-primary/5 text-center">
        <p className="text-2xl font-bold text-primary">5,247</p>
        <p className="text-sm text-muted-foreground">Membres Discord</p>
      </div>
      <div className="p-4 rounded-lg bg-primary/5 text-center">
        <p className="text-2xl font-bold text-primary">50+</p>
        <p className="text-sm text-muted-foreground">Pays représentés</p>
      </div>
      <div className="p-4 rounded-lg bg-primary/5 text-center">
        <p className="text-2xl font-bold text-primary">120+</p>
        <p className="text-sm text-muted-foreground">Guides & articles</p>
      </div>
      <div className="p-4 rounded-lg bg-primary/5 text-center">
        <p className="text-2xl font-bold text-primary">45</p>
        <p className="text-sm text-muted-foreground">Épisodes podcast</p>
      </div>
    </div>
  );
}
