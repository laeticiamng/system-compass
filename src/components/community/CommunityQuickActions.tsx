/**
 * Community Quick Actions
 * Modern action cards with hover lift, gradient borders, smooth transitions
 * Inspired by 21st.dev card interaction patterns
 */
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  MessageCircle, 
  Calendar, 
  Users, 
  Podcast,
  Share2,
  ArrowUpRight
} from 'lucide-react';

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
  badge?: string;
  index: number;
}

function QuickAction({ icon, label, description, onClick, badge, index }: QuickActionProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.35 }}
      onClick={onClick}
      className="group relative text-left w-full"
    >
      {/* Gradient border on hover */}
      <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-br from-primary/25 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
      
      <div className="relative flex items-start gap-4 rounded-xl border border-border/40 bg-card p-4 transition-all duration-300 group-hover:shadow-[var(--shadow-card)] group-hover:-translate-y-0.5">
        {/* Icon */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary transition-all duration-300 group-hover:bg-primary/15 group-hover:scale-105">
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-semibold">{label}</span>
            {badge && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-primary/5 text-primary border-primary/10">
                {badge}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{description}</p>
        </div>

        {/* Arrow indicator */}
        <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground/40 group-hover:text-primary transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </motion.button>
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
        title: 'Compass Community',
        text: t('community.shareText', 'Rejoignez la communauté des expatriés et futurs expatriés'),
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success(t('community.linkCopied', 'Lien copié !'));
    }
  };

  const actions = [
    {
      icon: <MessageCircle className="w-5 h-5" />,
      label: 'Rejoindre Discord',
      description: 'Chat en temps réel avec la communauté',
      onClick: handleDiscord,
      badge: '5000+',
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      label: 'Événements',
      description: 'Webinaires, meetups et workshops',
      onClick: handleEvents,
      badge: '3 à venir',
    },
    {
      icon: <Podcast className="w-5 h-5" />,
      label: 'Podcast',
      description: "Interviews d'expatriés chaque semaine",
      onClick: handleResources,
      badge: '45 épisodes',
    },
    {
      icon: <Share2 className="w-5 h-5" />,
      label: 'Partager',
      description: 'Inviter un ami à rejoindre',
      onClick: handleShare,
    },
  ];

  return (
    <Card className="overflow-hidden border-0 shadow-none bg-transparent">
      <CardContent className="p-0">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Users className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-semibold text-lg">Actions rapides</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <QuickAction key={action.label} {...action} index={index} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
