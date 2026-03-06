/**
 * SmartRecommendationsCard - AI-powered personalized country recommendations
 * Revolutionary feature: Dynamic matching based on user profile
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useLocalizedNavigate } from '@/hooks/useLocalizedNavigate';
import { useSmartRecommendations } from '@/hooks/useSmartRecommendations';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sparkles,
  TrendingUp,
  Heart,
  DollarSign,
  Briefcase,
  Star,
  AlertTriangle,
  ChevronRight,
  Target,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const RECOMMENDATION_COLORS = {
  highly_recommended: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  recommended: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/30',
  consider: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30',
  caution: 'text-destructive bg-destructive/10 border-destructive/30',
};

export function SmartRecommendationsCard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('top');
  
  const {
    topRecommendations,
    highlyRecommended,
    countriesToAvoid,
    isLoading,
    hasProfile,
    sortBy,
    setSortBy,
  } = useSmartRecommendations();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!hasProfile) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
        <CardContent className="py-8 text-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Target className="w-12 h-12 mx-auto text-primary mb-4" />
          </motion.div>
          <h3 className="text-lg font-semibold mb-2">
            {t('recommendations.noProfile', 'Créez votre profil')}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {t('recommendations.noProfileDesc', 'Complétez votre profil pour recevoir des recommandations personnalisées.')}
          </p>
          <Button onClick={() => navigate('/profile')} className="gap-2">
            <Sparkles className="w-4 h-4" />
            {t('recommendations.createProfile', 'Compléter mon profil')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-background to-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
              >
                <Sparkles className="w-5 h-5 text-primary" />
              </motion.div>
              {t('recommendations.title', 'Recommandations IA')}
            </CardTitle>
            <CardDescription>
              {t('recommendations.subtitle', 'Basées sur votre profil unique')}
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-primary/10">
            <Zap className="w-3 h-3 mr-1" />
            Personnalisé
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Sort Options */}
        <div className="flex gap-2 flex-wrap">
          {[
            { id: 'score', label: 'Score global', icon: Star },
            { id: 'career', label: 'Carrière', icon: Briefcase },
            { id: 'lifestyle', label: 'Lifestyle', icon: Heart },
            { id: 'cost', label: 'Budget', icon: DollarSign },
          ].map((option) => {
            const Icon = option.icon;
            return (
              <Button
                key={option.id}
                variant={sortBy === option.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy(option.id as typeof sortBy)}
                className="gap-1 text-xs"
              >
                <Icon className="w-3 h-3" />
                {option.label}
              </Button>
            );
          })}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="top" className="text-xs gap-1">
              <TrendingUp className="w-3 h-3" />
              Top 10
            </TabsTrigger>
            <TabsTrigger value="perfect" className="text-xs gap-1">
              <Star className="w-3 h-3" />
              Parfaits
            </TabsTrigger>
            <TabsTrigger value="avoid" className="text-xs gap-1">
              <AlertTriangle className="w-3 h-3" />
              À éviter
            </TabsTrigger>
          </TabsList>

          <TabsContent value="top" className="mt-4 space-y-2">
            {topRecommendations.slice(0, 5).map((rec, idx) => (
              <RecommendationRow key={rec.countryId} recommendation={rec} rank={idx + 1} />
            ))}
          </TabsContent>

          <TabsContent value="perfect" className="mt-4 space-y-2">
            {highlyRecommended.length > 0 ? (
              highlyRecommended.slice(0, 5).map((rec, idx) => (
                <RecommendationRow key={rec.countryId} recommendation={rec} rank={idx + 1} />
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4 text-sm">
                Aucun pays ne correspond parfaitement à votre profil.
              </p>
            )}
          </TabsContent>

          <TabsContent value="avoid" className="mt-4 space-y-2">
            {countriesToAvoid.map((rec) => (
              <RecommendationRow key={rec.countryId} recommendation={rec} showChallenges />
            ))}
          </TabsContent>
        </Tabs>

        {/* View All */}
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={() => navigate('/recommendations')}
        >
          {t('recommendations.viewAll', 'Voir toutes les recommandations')}
          <ChevronRight className="w-4 h-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

interface RecommendationRowProps {
  recommendation: ReturnType<typeof useSmartRecommendations>['topRecommendations'][0];
  rank?: number;
  showChallenges?: boolean;
}

function RecommendationRow({ recommendation, rank, showChallenges }: RecommendationRowProps) {
  const navigate = useNavigate();
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.01 }}
      className={cn(
        'p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md',
        RECOMMENDATION_COLORS[recommendation.recommendation]
      )}
      onClick={() => navigate(`/country/${recommendation.countryId}`)}
    >
      <div className="flex items-center gap-3">
        {rank && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-background flex items-center justify-center font-bold text-sm">
            #{rank}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">{getFlagEmoji(recommendation.iso2)}</span>
            <span className="font-medium truncate">{recommendation.countryName}</span>
            <Badge variant="secondary" className="text-[10px]">
              {recommendation.region}
            </Badge>
          </div>
          
          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Briefcase className="w-3 h-3" />
              {recommendation.breakdown.careerPotential}%
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              {recommendation.breakdown.lifestyleMatch}%
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              {recommendation.breakdown.costEfficiency}%
            </span>
          </div>

          {showChallenges && recommendation.challenges.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {recommendation.challenges.slice(0, 2).map((challenge, idx) => (
                <Badge key={idx} variant="outline" className="text-[10px] bg-red-500/10 text-red-500">
                  {challenge}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex-shrink-0 flex flex-col items-end gap-1">
          <div className="text-lg font-bold">{recommendation.totalScore}</div>
          <Progress value={recommendation.totalScore} className="w-16 h-1.5" />
        </div>

        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </div>
    </motion.div>
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
