import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MessageCircle, Globe2, Trophy, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface CommunityStatsProps {
  discordMembers?: number;
  countriesRepresented?: number;
  articlesCount?: number;
  podcastEpisodes?: number;
}

export function CommunityStats({
  discordMembers = 5247,
  countriesRepresented = 50,
  articlesCount = 120,
  podcastEpisodes = 45,
}: CommunityStatsProps) {
  const stats = [
    {
      label: 'Membres Discord',
      value: discordMembers.toLocaleString(),
      icon: Users,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10',
    },
    {
      label: 'Pays représentés',
      value: `${countriesRepresented}+`,
      icon: Globe2,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
    {
      label: 'Guides & articles',
      value: `${articlesCount}+`,
      icon: MessageCircle,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      label: 'Épisodes podcast',
      value: podcastEpisodes.toString(),
      icon: TrendingUp,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
  ];

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          Communauté en chiffres
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="text-center p-4 rounded-lg bg-secondary/30"
            >
              <div className={`w-12 h-12 mx-auto mb-3 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
