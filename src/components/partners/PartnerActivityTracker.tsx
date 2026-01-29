import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar,
  BarChart3,
  Clock,
  Target
} from 'lucide-react';

interface ActivityEntry {
  id: string;
  type: 'referral' | 'click' | 'conversion' | 'commission';
  partnerId: string;
  partnerName: string;
  amount?: number;
  currency?: string;
  timestamp: Date;
  status: 'pending' | 'confirmed' | 'paid';
}

interface PartnerStats {
  totalClicks: number;
  totalConversions: number;
  conversionRate: number;
  totalCommissions: number;
  pendingCommissions: number;
  thisMonthClicks: number;
  thisMonthConversions: number;
}

interface PartnerActivityTrackerProps {
  partnerId?: string;
  className?: string;
}

export function PartnerActivityTracker({ partnerId, className = '' }: PartnerActivityTrackerProps) {
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [stats, setStats] = useState<PartnerStats>({
    totalClicks: 0,
    totalConversions: 0,
    conversionRate: 0,
    totalCommissions: 0,
    pendingCommissions: 0,
    thisMonthClicks: 0,
    thisMonthConversions: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading partner activity data
    const loadData = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock data - in production, fetch from Supabase
      const mockActivities: ActivityEntry[] = [
        {
          id: '1',
          type: 'conversion',
          partnerId: 'wise',
          partnerName: 'Wise',
          amount: 25,
          currency: '€',
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          status: 'confirmed',
        },
        {
          id: '2',
          type: 'click',
          partnerId: 'revolut',
          partnerName: 'Revolut',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
          status: 'confirmed',
        },
        {
          id: '3',
          type: 'commission',
          partnerId: 'safetywing',
          partnerName: 'SafetyWing',
          amount: 45,
          currency: '€',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
          status: 'pending',
        },
        {
          id: '4',
          type: 'referral',
          partnerId: 'wise',
          partnerName: 'Wise',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
          status: 'confirmed',
        },
      ];

      const mockStats: PartnerStats = {
        totalClicks: 1247,
        totalConversions: 89,
        conversionRate: 7.14,
        totalCommissions: 2340,
        pendingCommissions: 185,
        thisMonthClicks: 312,
        thisMonthConversions: 23,
      };

      setActivities(partnerId 
        ? mockActivities.filter(a => a.partnerId === partnerId) 
        : mockActivities
      );
      setStats(mockStats);
      setIsLoading(false);
    };

    loadData();
  }, [partnerId]);

  const getActivityIcon = (type: ActivityEntry['type']) => {
    switch (type) {
      case 'click': return <Activity className="h-4 w-4 text-blue-500" />;
      case 'referral': return <Users className="h-4 w-4 text-purple-500" />;
      case 'conversion': return <Target className="h-4 w-4 text-emerald-500" />;
      case 'commission': return <DollarSign className="h-4 w-4 text-amber-500" />;
    }
  };

  const getActivityLabel = (type: ActivityEntry['type']) => {
    switch (type) {
      case 'click': return 'Clic';
      case 'referral': return 'Référence';
      case 'conversion': return 'Conversion';
      case 'commission': return 'Commission';
    }
  };

  const getStatusBadge = (status: ActivityEntry['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">En attente</Badge>;
      case 'confirmed':
        return <Badge className="bg-emerald-500/20 text-emerald-600">Confirmé</Badge>;
      case 'paid':
        return <Badge className="bg-blue-500/20 text-blue-600">Payé</Badge>;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'À l\'instant';
    if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)}h`;
    return `Il y a ${Math.floor(seconds / 86400)}j`;
  };

  if (isLoading) {
    return (
      <Card className={`glass-card ${className}`}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-20 bg-muted rounded" />
            <div className="h-4 bg-muted rounded w-2/3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Activity className="h-4 w-4" />
              <span className="text-sm">Clics totaux</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalClicks.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">
              +{stats.thisMonthClicks} ce mois
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Target className="h-4 w-4" />
              <span className="text-sm">Conversions</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalConversions}</p>
            <p className="text-xs text-muted-foreground">
              +{stats.thisMonthConversions} ce mois
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">Taux conversion</span>
            </div>
            <p className="text-2xl font-bold">{stats.conversionRate}%</p>
            <Progress value={stats.conversionRate * 10} className="h-1 mt-2" />
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm">Commissions</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalCommissions}€</p>
            <p className="text-xs text-amber-500">
              {stats.pendingCommissions}€ en attente
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-5 w-5 text-primary" />
            Activité récente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activities.length === 0 ? (
              <p className="text-center text-muted-foreground py-6">
                Aucune activité récente
              </p>
            ) : (
              activities.map((activity) => (
                <div 
                  key={activity.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getActivityIcon(activity.type)}
                    <div>
                      <p className="font-medium text-sm">
                        {getActivityLabel(activity.type)} - {activity.partnerName}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTimeAgo(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {activity.amount && (
                      <span className="font-semibold text-emerald-600">
                        +{activity.amount}{activity.currency}
                      </span>
                    )}
                    {getStatusBadge(activity.status)}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Performance */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-primary" />
            Performance mensuelle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Objectif clics</span>
              <span className="text-sm font-medium">{stats.thisMonthClicks}/500</span>
            </div>
            <Progress value={(stats.thisMonthClicks / 500) * 100} className="h-2" />
            
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm">Objectif conversions</span>
              <span className="text-sm font-medium">{stats.thisMonthConversions}/30</span>
            </div>
            <Progress value={(stats.thisMonthConversions / 30) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
