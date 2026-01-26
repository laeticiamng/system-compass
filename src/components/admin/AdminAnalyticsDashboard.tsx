// Admin Analytics Dashboard Component
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, Users, Activity, TrendingUp, TrendingDown,
  Globe, Clock, Zap, Target, Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DailyStats {
  date: string;
  unique_users: number;
  page_views: number;
  total_sessions: number;
  avg_session_duration: number;
}

interface ModuleUsage {
  module: string;
  usage_count: number;
  growth_percent: number;
}

interface AdminAnalyticsDashboardProps {
  dailyStats: DailyStats[];
  moduleUsage: ModuleUsage[];
  totalUsers: number;
  activeUsers: number;
  newUsersThisWeek: number;
}

export function AdminAnalyticsDashboard({
  dailyStats,
  moduleUsage,
  totalUsers,
  activeUsers,
  newUsersThisWeek,
}: AdminAnalyticsDashboardProps) {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', {
      month: 'short', day: 'numeric'
    });
  };

  const getTrend = (current: number, previous: number) => {
    if (previous === 0) return { percent: 100, isPositive: true };
    const percent = ((current - previous) / previous) * 100;
    return { percent: Math.abs(percent), isPositive: percent >= 0 };
  };

  const todayStats = dailyStats[0] || { unique_users: 0, page_views: 0, total_sessions: 0, avg_session_duration: 0 };
  const yesterdayStats = dailyStats[1] || { unique_users: 0, page_views: 0, total_sessions: 0, avg_session_duration: 0 };

  const usersTrend = getTrend(todayStats.unique_users, yesterdayStats.unique_users);
  const pageViewsTrend = getTrend(todayStats.page_views, yesterdayStats.page_views);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          {t('admin.analytics.title', 'Platform Analytics')}
          <Badge variant="outline">{t('admin.analytics.adminOnly', 'Admin Only')}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="overview" className="flex-1">
              {t('admin.analytics.overview', 'Overview')}
            </TabsTrigger>
            <TabsTrigger value="modules" className="flex-1">
              {t('admin.analytics.modules', 'Modules')}
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex-1">
              {t('admin.analytics.trends', 'Trends')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-4">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-4 rounded-lg bg-muted/50 border">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground">
                    {t('admin.analytics.totalUsers', 'Total Users')}
                  </span>
                </div>
                <p className="text-2xl font-bold">{formatNumber(totalUsers)}</p>
              </div>
              
              <div className="p-4 rounded-lg bg-muted/50 border">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-muted-foreground">
                    {t('admin.analytics.activeUsers', 'Active Users')}
                  </span>
                </div>
                <p className="text-2xl font-bold">{formatNumber(activeUsers)}</p>
                <p className="text-xs text-muted-foreground">
                  {((activeUsers / totalUsers) * 100).toFixed(1)}% {t('admin.analytics.ofTotal', 'of total')}
                </p>
              </div>
              
              <div className="p-4 rounded-lg bg-muted/50 border">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span className="text-xs text-muted-foreground">
                    {t('admin.analytics.newThisWeek', 'New This Week')}
                  </span>
                </div>
                <p className="text-2xl font-bold">+{formatNumber(newUsersThisWeek)}</p>
              </div>
              
              <div className="p-4 rounded-lg bg-muted/50 border">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span className="text-xs text-muted-foreground">
                    {t('admin.analytics.avgSession', 'Avg Session')}
                  </span>
                </div>
                <p className="text-2xl font-bold">{formatDuration(todayStats.avg_session_duration)}</p>
              </div>
            </div>

            {/* Today vs Yesterday */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    {t('admin.analytics.todayUsers', 'Today\'s Users')}
                  </span>
                  <div className={cn(
                    "flex items-center gap-1 text-xs",
                    usersTrend.isPositive ? "text-green-600" : "text-red-600"
                  )}>
                    {usersTrend.isPositive ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {usersTrend.percent.toFixed(1)}%
                  </div>
                </div>
                <p className="text-3xl font-bold">{todayStats.unique_users}</p>
              </div>
              
              <div className="p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    {t('admin.analytics.pageViews', 'Page Views')}
                  </span>
                  <div className={cn(
                    "flex items-center gap-1 text-xs",
                    pageViewsTrend.isPositive ? "text-green-600" : "text-red-600"
                  )}>
                    {pageViewsTrend.isPositive ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {pageViewsTrend.percent.toFixed(1)}%
                  </div>
                </div>
                <p className="text-3xl font-bold">{todayStats.page_views}</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="modules" className="mt-4">
            <div className="space-y-3">
              {moduleUsage.map((module, index) => (
                <div key={module.module} className="p-3 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">#{index + 1}</Badge>
                      <span className="font-medium text-sm">{module.module}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{formatNumber(module.usage_count)}</span>
                      <div className={cn(
                        "flex items-center gap-1 text-xs",
                        module.growth_percent >= 0 ? "text-green-600" : "text-red-600"
                      )}>
                        {module.growth_percent >= 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {Math.abs(module.growth_percent).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <Progress 
                    value={(module.usage_count / (moduleUsage[0]?.usage_count || 1)) * 100}
                    className="h-1.5"
                  />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="trends" className="mt-4">
            <div className="space-y-3">
              {dailyStats.slice(0, 7).map((day) => (
                <div key={day.date} className="flex items-center gap-3 p-2 rounded border">
                  <div className="flex items-center gap-2 w-24">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{formatDate(day.date)}</span>
                  </div>
                  <div className="flex-1 grid grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="w-3 h-3 text-primary" />
                      <span>{day.unique_users}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="w-3 h-3 text-blue-500" />
                      <span>{day.page_views}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-3 h-3 text-amber-500" />
                      <span>{day.total_sessions}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
