import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Database,
  Zap,
  Globe
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SystemStatus {
  name: string;
  status: 'online' | 'degraded' | 'offline' | 'checking';
  latency?: number;
  lastCheck: Date;
}

export function SystemHealthMonitor() {
  const { t } = useTranslation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [systems, setSystems] = useState<SystemStatus[]>([
    { name: 'Database', status: 'checking', lastCheck: new Date() },
    { name: 'Auth', status: 'checking', lastCheck: new Date() },
    { name: 'Edge Functions', status: 'checking', lastCheck: new Date() },
  ]);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Initial check
    checkAllSystems();
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkSystem = async (name: string): Promise<SystemStatus> => {
    const startTime = Date.now();
    try {
      if (name === 'Database') {
        const { error } = await supabase.from('countries').select('id').limit(1);
        const latency = Date.now() - startTime;
        return {
          name,
          status: error ? 'degraded' : 'online',
          latency,
          lastCheck: new Date()
        };
      } else if (name === 'Auth') {
        const { error } = await supabase.auth.getSession();
        const latency = Date.now() - startTime;
        return {
          name,
          status: error ? 'degraded' : 'online',
          latency,
          lastCheck: new Date()
        };
      } else if (name === 'Edge Functions') {
        // Simple check - just verify the endpoint responds
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/`, {
          method: 'HEAD',
        }).catch(() => null);
        const latency = Date.now() - startTime;
        return {
          name,
          status: response ? 'online' : 'degraded',
          latency,
          lastCheck: new Date()
        };
      }
      return { name, status: 'offline', lastCheck: new Date() };
    } catch {
      return { name, status: 'offline', lastCheck: new Date() };
    }
  };

  const checkAllSystems = async () => {
    setChecking(true);
    const results = await Promise.all(
      systems.map(s => checkSystem(s.name))
    );
    setSystems(results);
    setChecking(false);
  };

  const getStatusIcon = (status: SystemStatus['status']) => {
    switch (status) {
      case 'online': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'degraded': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'offline': return <WifiOff className="w-4 h-4 text-red-500" />;
      case 'checking': return <RefreshCw className="w-4 h-4 text-muted-foreground animate-spin" />;
    }
  };

  const getStatusBadge = (status: SystemStatus['status']) => {
    switch (status) {
      case 'online': return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">En ligne</Badge>;
      case 'degraded': return <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">Dégradé</Badge>;
      case 'offline': return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">Hors ligne</Badge>;
      case 'checking': return <Badge variant="outline" className="bg-muted text-muted-foreground">Vérification...</Badge>;
    }
  };

  const getSystemIcon = (name: string) => {
    switch (name) {
      case 'Database': return <Database className="w-4 h-4" />;
      case 'Auth': return <Zap className="w-4 h-4" />;
      case 'Edge Functions': return <Globe className="w-4 h-4" />;
      default: return <Wifi className="w-4 h-4" />;
    }
  };

  const overallHealth = systems.every(s => s.status === 'online') ? 100 :
                        systems.every(s => s.status === 'offline') ? 0 :
                        systems.filter(s => s.status === 'online').length / systems.length * 100;

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isOnline ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
              {isOnline ? (
                <Wifi className="w-5 h-5 text-green-500" />
              ) : (
                <WifiOff className="w-5 h-5 text-red-500" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg">
                {t('diagnostics.systemHealth', 'État du Système')}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {isOnline ? t('diagnostics.online', 'Connecté') : t('diagnostics.offline', 'Hors ligne')}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={checkAllSystems}
            disabled={checking}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
            {t('diagnostics.refresh', 'Actualiser')}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall health bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">{t('diagnostics.overallHealth', 'Santé globale')}</span>
            <span className="text-sm font-medium">{overallHealth.toFixed(0)}%</span>
          </div>
          <Progress value={overallHealth} className="h-2" />
        </div>

        {/* Individual systems */}
        <div className="space-y-3">
          {systems.map((system) => (
            <div 
              key={system.name}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(system.status)}
                <div className="flex items-center gap-2">
                  {getSystemIcon(system.name)}
                  <span className="font-medium">{system.name}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {system.latency && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {system.latency}ms
                  </span>
                )}
                {getStatusBadge(system.status)}
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground text-center">
          {t('diagnostics.lastUpdate', 'Dernière vérification:')} {systems[0]?.lastCheck.toLocaleTimeString()}
        </p>
      </CardContent>
    </Card>
  );
}
