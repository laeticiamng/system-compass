/**
 * SmartDashboardWidget - AI-powered recommendations widget for dashboard
 * Revolutionary: Personalized country recommendations integrated in dashboard
 */

import { motion } from 'framer-motion';
import { useLocalizedNavigate } from '@/hooks/useLocalizedNavigate';
import { useSmartRecommendations } from '@/hooks/useSmartRecommendations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AnimatedSkeleton } from '@/components/ui/animated-skeleton';
import {
  Sparkles,
  TrendingUp,
  ChevronRight,
  Target,
  Briefcase,
  Heart,
  DollarSign,
} from 'lucide-react';

export function SmartDashboardWidget() {
  const navigate = useLocalizedNavigate();
  const { topRecommendations, isLoading, hasProfile } = useSmartRecommendations();

  if (isLoading) {
    return (
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <AnimatedSkeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          <AnimatedSkeleton className="h-16 w-full" />
          <AnimatedSkeleton className="h-16 w-full" />
          <AnimatedSkeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!hasProfile) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
        <CardContent className="py-6 text-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Target className="w-10 h-10 mx-auto text-primary mb-3" />
          </motion.div>
          <h3 className="font-semibold mb-2">Recommandations Personnalisées</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Complétez votre profil pour découvrir les pays qui vous correspondent.
          </p>
          <Button onClick={() => navigate('/profile')} size="sm" className="gap-2">
            <Sparkles className="w-4 h-4" />
            Créer mon profil
          </Button>
        </CardContent>
      </Card>
    );
  }

  const top3 = topRecommendations.slice(0, 3);

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
          >
            <Sparkles className="w-5 h-5 text-primary" />
          </motion.div>
          Top Recommandations IA
          <Badge variant="outline" className="ml-auto text-xs bg-primary/10">
            Personnalisé
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {top3.map((rec, idx) => (
          <motion.div
            key={rec.countryId}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="p-3 rounded-lg border bg-card/50 cursor-pointer hover:shadow-md transition-all"
            onClick={() => navigate(`/country/${rec.countryId}`)}
          >
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-sm">
                #{idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getFlagEmoji(rec.iso2)}</span>
                  <span className="font-medium truncate">{rec.countryName}</span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3 h-3" />
                    {rec.breakdown.careerPotential}%
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    {rec.breakdown.lifestyleMatch}%
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    {rec.breakdown.costEfficiency}%
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0 text-right">
                <div className="text-lg font-bold text-primary">{rec.totalScore}</div>
                <Progress value={rec.totalScore} className="w-12 h-1" />
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </motion.div>
        ))}

        <Button
          variant="ghost"
          className="w-full gap-2 mt-2"
          onClick={() => navigate('/recommendations')}
        >
          <TrendingUp className="w-4 h-4" />
          Voir toutes les recommandations
        </Button>
      </CardContent>
    </Card>
  );
}

function getFlagEmoji(iso2: string): string {
  if (!iso2 || iso2.length !== 2) return '🏳️';
  const codePoints = iso2
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}
