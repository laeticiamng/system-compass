import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertTriangle, XCircle, RefreshCw, Database, Zap, Globe, Shield, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ServiceStatus {
  name: string;
  description: string;
  icon: React.ElementType;
  status: 'operational' | 'degraded' | 'outage' | 'checking';
  latency?: number;
  lastCheck: Date;
}

const statusStyles = {
  operational: { label: 'Opérationnel', icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' },
  degraded: { label: 'Dégradé', icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  outage: { label: 'Hors service', icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  checking: { label: 'Vérification...', icon: RefreshCw, color: 'text-muted-foreground', bg: 'bg-muted/30', border: 'border-border' },
};

export default function Status() {
  const { t } = useTranslation();
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: 'Base de données', description: 'Stockage et requêtes', icon: Database, status: 'checking', lastCheck: new Date() },
    { name: 'Authentification', description: 'Connexion et sessions', icon: Shield, status: 'checking', lastCheck: new Date() },
    { name: 'API & Edge Functions', description: 'Calculs et IA', icon: Zap, status: 'checking', lastCheck: new Date() },
    { name: 'CDN & Frontend', description: 'Interface utilisateur', icon: Globe, status: 'checking', lastCheck: new Date() },
  ]);
  const [checking, setChecking] = useState(false);
  const [lastFullCheck, setLastFullCheck] = useState<Date | null>(null);

  const checkService = async (name: string): Promise<Partial<ServiceStatus>> => {
    const start = Date.now();
    try {
      if (name === 'Base de données') {
        const { error } = await supabase.from('countries').select('id').limit(1);
        return { status: error ? 'degraded' : 'operational', latency: Date.now() - start, lastCheck: new Date() };
      }
      if (name === 'Authentification') {
        const { error } = await supabase.auth.getSession();
        return { status: error ? 'degraded' : 'operational', latency: Date.now() - start, lastCheck: new Date() };
      }
      if (name === 'API & Edge Functions') {
        const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/`, { method: 'HEAD' }).catch(() => null);
        return { status: resp ? 'operational' : 'degraded', latency: Date.now() - start, lastCheck: new Date() };
      }
      if (name === 'CDN & Frontend') {
        return { status: navigator.onLine ? 'operational' : 'outage', latency: 0, lastCheck: new Date() };
      }
      return { status: 'operational', lastCheck: new Date() };
    } catch {
      return { status: 'outage', latency: Date.now() - start, lastCheck: new Date() };
    }
  };

  const checkAll = useCallback(async () => {
    setChecking(true);
    const results = await Promise.all(
      services.map(async s => ({ ...s, ...(await checkService(s.name)) }))
    );
    setServices(results);
    setLastFullCheck(new Date());
    setChecking(false);
  }, []);

  useEffect(() => { checkAll(); }, [checkAll]);

  const operationalCount = services.filter(s => s.status === 'operational').length;
  const overallHealth = Math.round((operationalCount / services.length) * 100);
  const overallStatus = operationalCount === services.length ? 'operational' : operationalCount > 0 ? 'degraded' : 'outage';

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Helmet>
        <title>{t('status.metaTitle', 'Status — Compass')}</title>
        <meta name="description" content={t('status.metaDesc', 'État en temps réel de la plateforme Compass.')} />
      </Helmet>

      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          {t('status.title', 'État de la plateforme')}
        </h1>
        <p className="text-muted-foreground">
          {t('status.subtitle', 'Surveillance en temps réel de tous les services System Compass.')}
        </p>
      </div>

      {/* Overall status banner */}
      <Card className={`mb-8 ${statusStyles[overallStatus].border} border-2`}>
        <CardContent className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${statusStyles[overallStatus].bg}`}>
              {overallStatus === 'operational' ? (
                <CheckCircle className="w-8 h-8 text-green-500" />
              ) : overallStatus === 'degraded' ? (
                <AlertTriangle className="w-8 h-8 text-amber-500" />
              ) : (
                <XCircle className="w-8 h-8 text-red-500" />
              )}
            </div>
            <div>
              <p className="text-xl font-bold">
                {overallStatus === 'operational' ? 'Tous les systèmes opérationnels' :
                 overallStatus === 'degraded' ? 'Performance dégradée' : 'Incident en cours'}
              </p>
              <p className="text-sm text-muted-foreground">
                {operationalCount}/{services.length} services opérationnels
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={checkAll} disabled={checking} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </CardContent>
      </Card>

      {/* Health bar */}
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-muted-foreground">Santé globale</span>
          <span className="text-sm font-medium">{overallHealth}%</span>
        </div>
        <Progress value={overallHealth} className="h-3" />
      </div>

      {/* Service cards */}
      <div className="space-y-3 mb-8">
        {services.map(service => {
          const style = statusStyles[service.status];
          const StatusIcon = style.icon;
          const ServiceIcon = service.icon;
          return (
            <Card key={service.name} className={`${style.border} border`}>
              <CardContent className="py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ServiceIcon className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{service.name}</p>
                    <p className="text-xs text-muted-foreground">{service.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {service.latency !== undefined && service.latency > 0 && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />{service.latency}ms
                    </span>
                  )}
                  <Badge variant="outline" className={`${style.bg} ${style.color} ${style.border}`}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {style.label}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {lastFullCheck && (
        <p className="text-xs text-muted-foreground text-center">
          Dernière vérification : {lastFullCheck.toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}
