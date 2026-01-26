// Partner Activity Tracker Component
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, Users, FileText, Star, TrendingUp,
  Calendar, Award, Clock, CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PartnerActivity {
  id: string;
  type: 'contribution' | 'referral' | 'feedback' | 'milestone';
  description: string;
  credits_awarded: number;
  created_at: string;
}

interface PartnerStats {
  total_contributions: number;
  total_referrals: number;
  total_credits: number;
  rank: 'bronze' | 'silver' | 'gold' | 'platinum';
  next_rank_progress: number;
  next_rank_threshold: number;
  active_since: string;
}

interface PartnerActivityTrackerProps {
  partnerId: string;
  stats: PartnerStats;
  activities?: PartnerActivity[];
}

export function PartnerActivityTracker({ stats, activities = [] }: PartnerActivityTrackerProps) {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'platinum': return 'text-purple-600 bg-purple-500/10';
      case 'gold': return 'text-amber-600 bg-amber-500/10';
      case 'silver': return 'text-slate-500 bg-slate-500/10';
      case 'bronze': return 'text-orange-700 bg-orange-500/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getRankIcon = (rank: string) => {
    switch (rank) {
      case 'platinum': return '💎';
      case 'gold': return '🥇';
      case 'silver': return '🥈';
      case 'bronze': return '🥉';
      default: return '⭐';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'contribution': return FileText;
      case 'referral': return Users;
      case 'feedback': return Star;
      case 'milestone': return Award;
      default: return Activity;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5" />
            {t('partner.activityTracker', 'Activity Tracker')}
          </CardTitle>
          <Badge className={cn("gap-1", getRankColor(stats.rank))}>
            <span>{getRankIcon(stats.rank)}</span>
            {stats.rank.charAt(0).toUpperCase() + stats.rank.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="overview" className="flex-1">
              {t('partner.overview', 'Overview')}
            </TabsTrigger>
            <TabsTrigger value="history" className="flex-1">
              {t('partner.history', 'History')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <FileText className="w-5 h-5 mx-auto mb-1 text-primary" />
                <p className="text-2xl font-bold">{stats.total_contributions}</p>
                <p className="text-xs text-muted-foreground">
                  {t('partner.contributions', 'Contributions')}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <Users className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                <p className="text-2xl font-bold">{stats.total_referrals}</p>
                <p className="text-xs text-muted-foreground">
                  {t('partner.referrals', 'Referrals')}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <Star className="w-5 h-5 mx-auto mb-1 text-amber-500" />
                <p className="text-2xl font-bold">{stats.total_credits}</p>
                <p className="text-xs text-muted-foreground">
                  {t('partner.credits', 'Credits')}
                </p>
              </div>
            </div>

            {/* Rank Progress */}
            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">
                    {t('partner.nextRank', 'Progress to Next Rank')}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {stats.next_rank_progress}/{stats.next_rank_threshold}
                </span>
              </div>
              <Progress 
                value={(stats.next_rank_progress / stats.next_rank_threshold) * 100} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground mt-2">
                {stats.next_rank_threshold - stats.next_rank_progress} {t('partner.pointsToNextRank', 'points to next rank')}
              </p>
            </div>

            {/* Member Since */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>
                {t('partner.memberSince', 'Member since')}: {formatDate(stats.active_since)}
              </span>
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            {activities.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>{t('partner.noActivity', 'No recent activity')}</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {activities.map((activity) => {
                  const Icon = getActivityIcon(activity.type);
                  return (
                    <div 
                      key={activity.id}
                      className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="p-2 rounded-full bg-primary/10">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(activity.created_at)}
                        </p>
                      </div>
                      {activity.credits_awarded > 0 && (
                        <Badge variant="secondary" className="gap-1">
                          <CheckCircle className="w-3 h-3" />
                          +{activity.credits_awarded}
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
