/**
 * RealTimeAnalyticsWidget - Live user behavior insights
 * Revolutionary: Real-time session tracking with heatmap preview
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AnimatedSkeleton } from '@/components/ui/animated-skeleton';
import {
  Activity,
  Eye,
  MousePointerClick,
  Clock,
  Users,
  Zap,
} from 'lucide-react';

interface SessionData {
  totalSessions: number;
  activeNow: number;
  avgDuration: number;
  topPages: { path: string; views: number }[];
  recentEvents: { name: string; timestamp: Date }[];
}

export function RealTimeAnalyticsWidget() {
  const [pulseActive, setPulseActive] = useState(true);

  // Fetch analytics data
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['realtime-analytics'],
    queryFn: async (): Promise<SessionData> => {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      
      // Get today's sessions
      const { data: sessions } = await supabase
        .from('analytics_sessions')
        .select('*')
        .gte('first_seen_at', today);

      // Get recent events
      const { data: events } = await supabase
        .from('analytics_events')
        .select('event_name, created_at, page_path')
        .order('created_at', { ascending: false })
        .limit(10);

      // Calculate metrics
      const totalSessions = sessions?.length || 0;
      const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000).toISOString();
      const activeNow = sessions?.filter(s => s.last_seen_at >= fiveMinAgo).length || 0;
      
      // Calculate average session duration from real data
      let avgDuration = 0;
      if (sessions && sessions.length > 0) {
        const durations = sessions.map(s => {
          const first = new Date(s.first_seen_at).getTime();
          const last = new Date(s.last_seen_at).getTime();
          return (last - first) / 1000; // in seconds
        });
        avgDuration = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
      }

      // Top pages from events
      const pageViews: Record<string, number> = {};
      events?.forEach(e => {
        if (e.page_path) {
          pageViews[e.page_path] = (pageViews[e.page_path] || 0) + 1;
        }
      });
      const topPages = Object.entries(pageViews)
        .map(([path, views]) => ({ path, views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 4);

      return {
        totalSessions,
        activeNow,
        avgDuration,
        topPages,
        recentEvents: events?.map(e => ({
          name: e.event_name,
          timestamp: new Date(e.created_at),
        })) || [],
      };
    },
    refetchInterval: 30000, // Refresh every 30s
    staleTime: 10000,
  });

  // Pulse animation
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseActive(p => !p);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <AnimatedSkeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <AnimatedSkeleton className="h-16" />
            <AnimatedSkeleton className="h-16" />
            <AnimatedSkeleton className="h-16" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <motion.div
            animate={pulseActive ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.5 }}
          >
            <Activity className="w-5 h-5 text-primary" />
          </motion.div>
          Analytics Temps Réel
          <Badge variant="outline" className="ml-auto text-xs bg-green-500/10 text-green-500 border-green-500/30">
            <motion.span
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 inline-block"
            />
            LIVE
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-2">
          <MetricCard
            icon={Users}
            label="Sessions"
            value={analyticsData?.totalSessions || 0}
            color="text-blue-500"
          />
          <MetricCard
            icon={Zap}
            label="Actifs"
            value={analyticsData?.activeNow || 0}
            color="text-green-500"
            pulse
          />
          <MetricCard
            icon={Clock}
            label="Durée moy."
            value={`${Math.round((analyticsData?.avgDuration || 0) / 60)}m`}
            color="text-amber-500"
          />
        </div>

        {/* Top Pages */}
        {analyticsData?.topPages && analyticsData.topPages.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
              <Eye className="w-3 h-3" />
              Pages populaires
            </h4>
            <div className="space-y-1.5">
              {analyticsData.topPages.map((page, idx) => (
                <motion.div
                  key={page.path}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center gap-2 text-xs"
                >
                  <span className="truncate flex-1 text-muted-foreground">{page.path}</span>
                  <Progress value={(page.views / (analyticsData.topPages[0]?.views || 1)) * 100} className="w-16 h-1" />
                  <span className="font-medium w-6 text-right">{page.views}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Events */}
        {analyticsData?.recentEvents && analyticsData.recentEvents.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
              <MousePointerClick className="w-3 h-3" />
              Événements récents
            </h4>
            <div className="flex flex-wrap gap-1">
              <AnimatePresence>
                {analyticsData.recentEvents.slice(0, 5).map((event, idx) => (
                  <motion.div
                    key={`${event.name}-${idx}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <Badge variant="secondary" className="text-[10px]">
                      {event.name}
                    </Badge>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface MetricCardProps {
  icon: typeof Activity;
  label: string;
  value: number | string;
  color: string;
  pulse?: boolean;
}

function MetricCard({ icon: Icon, label, value, color, pulse }: MetricCardProps) {
  return (
    <div className="p-3 rounded-lg bg-muted/30 text-center">
      <motion.div
        animate={pulse ? { scale: [1, 1.1, 1] } : {}}
        transition={{ repeat: Infinity, duration: 2 }}
        className="mb-1"
      >
        <Icon className={`w-4 h-4 mx-auto ${color}`} />
      </motion.div>
      <div className="text-lg font-bold">{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}
