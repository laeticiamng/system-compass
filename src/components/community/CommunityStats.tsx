/**
 * Community Stats Component
 * Bento-grid inspired stats with animated counters
 * Patterns: 21st.dev feature cards, gradient icon backgrounds
 */

import { Card, CardContent } from '@/components/ui/card';
import { Users, MessageCircle, Globe2, TrendingUp } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

interface CommunityStatsProps {
  discordMembers?: number;
  countriesRepresented?: number;
  articlesCount?: number;
  podcastEpisodes?: number;
}

function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!isInView) return;
    const duration = 1200;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplay(Math.floor(eased * value));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {display.toLocaleString()}{suffix}
    </span>
  );
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
      value: discordMembers,
      suffix: '',
      icon: Users,
      gradient: 'from-indigo-500/20 to-indigo-600/5',
      iconColor: 'text-indigo-500',
      borderAccent: 'group-hover:border-indigo-500/30',
    },
    {
      label: 'Pays représentés',
      value: countriesRepresented,
      suffix: '+',
      icon: Globe2,
      gradient: 'from-emerald-500/20 to-emerald-600/5',
      iconColor: 'text-emerald-500',
      borderAccent: 'group-hover:border-emerald-500/30',
    },
    {
      label: 'Guides & articles',
      value: articlesCount,
      suffix: '+',
      icon: MessageCircle,
      gradient: 'from-amber-500/20 to-amber-600/5',
      iconColor: 'text-amber-500',
      borderAccent: 'group-hover:border-amber-500/30',
    },
    {
      label: 'Épisodes podcast',
      value: podcastEpisodes,
      suffix: '',
      icon: TrendingUp,
      gradient: 'from-primary/20 to-primary/5',
      iconColor: 'text-primary',
      borderAccent: 'group-hover:border-primary/30',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.08, duration: 0.4 }}
          className="group"
        >
          <Card className={`relative overflow-hidden border border-border/50 transition-all duration-300 hover:shadow-[var(--shadow-card)] hover:-translate-y-0.5 ${stat.borderAccent}`}>
            {/* Background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            
            <CardContent className="relative p-5 flex flex-col items-center text-center gap-3">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient}`}>
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
              <div>
                <p className="text-2xl font-bold tracking-tight font-[family-name:var(--font-heading)]">
                  <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
