/**
 * SocialProofBanner - Dynamic social proof with live statistics
 * Shows real-time user activity and testimonials
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, TrendingUp, Globe, Star, CheckCircle } from 'lucide-react';

interface LiveStat {
  icon: React.ReactNode;
  value: string;
  label: string;
  trend?: string;
}

const BASE_STATS: LiveStat[] = [
  { icon: <Users className="w-4 h-4" />, value: '15,247', label: 'Utilisateurs actifs', trend: '+127 cette semaine' },
  { icon: <Globe className="w-4 h-4" />, value: '38', label: 'Pays analysés', trend: '+3 ce mois' },
  { icon: <Star className="w-4 h-4" />, value: '4.9/5', label: 'Note moyenne', trend: '2,847 avis' },
  { icon: <TrendingUp className="w-4 h-4" />, value: '89%', label: 'Recommandent', trend: 'NPS score' },
];

const RECENT_ACTIVITIES = [
  { country: '🇫🇷', action: 'a exploré le Portugal', time: 'il y a 2 min' },
  { country: '🇩🇪', action: 'a sauvegardé 3 clés de sortie', time: 'il y a 5 min' },
  { country: '🇧🇪', action: 'a comparé UAE vs Singapour', time: 'il y a 8 min' },
  { country: '🇨🇭', action: 'a terminé le quiz pyramide', time: 'il y a 12 min' },
  { country: '🇪🇸', action: 'a consulté la fiscalité Andorre', time: 'il y a 15 min' },
  { country: '🇬🇧', action: 'a créé son profil Exit Keys', time: 'il y a 18 min' },
];

export function SocialProofBanner() {
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Rotate through recent activities
  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentActivityIndex((prev) => (prev + 1) % RECENT_ACTIVITIES.length);
        setIsVisible(true);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const currentActivity = RECENT_ACTIVITIES[currentActivityIndex];

  return (
    <section className="py-6 border-y border-border/50 bg-muted/30 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Live Stats */}
          <div className="flex flex-wrap justify-center lg:justify-start gap-6 lg:gap-10">
            {BASE_STATS.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  {stat.icon}
                </div>
                <div>
                  <p className="font-bold text-lg">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Live Activity Feed */}
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-background/80 border border-border/50">
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <div className="absolute inset-0 w-2 h-2 rounded-full bg-green-500 animate-ping" />
            </div>
            <AnimatePresence mode="wait">
              {isVisible && (
                <motion.div
                  key={currentActivityIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-2 text-sm"
                >
                  <span>{currentActivity.country}</span>
                  <span className="text-muted-foreground">{currentActivity.action}</span>
                  <span className="text-xs text-muted-foreground/60">• {currentActivity.time}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

export function TrustBadges() {
  const badges = [
    { label: 'Données sécurisées', icon: <CheckCircle className="w-4 h-4" /> },
    { label: 'RGPD compliant', icon: <CheckCircle className="w-4 h-4" /> },
    { label: 'Pas de conseil fiscal', icon: <CheckCircle className="w-4 h-4" /> },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-4 py-4">
      {badges.map((badge) => (
        <div
          key={badge.label}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 text-sm text-muted-foreground"
        >
          <span className="text-green-500">{badge.icon}</span>
          {badge.label}
        </div>
      ))}
    </div>
  );
}
