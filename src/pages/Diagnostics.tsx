/**
 * DIAGNOSTICS PAGE - Dev Only
 * 
 * Displays critical debug information:
 * - userId, auth status
 * - environment (dev/prod)
 * - last API error
 * - average latency
 * - network quality
 * - error history
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRoles } from '@/hooks/useUserRoles';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, Server, User, Shield, Clock, AlertTriangle, Database, Wifi, Trash2, TestTube2 } from 'lucide-react';
import { SmokeTester } from '@/components/common/SmokeTester';
import { useNetworkQuality, getNetworkStatus } from '@/lib/network-utils';

interface LatencyTest {
  endpoint: string;
  latency: number;
  status: 'success' | 'error';
  timestamp: Date;
}

interface ApiError {
  message: string;
  endpoint: string;
  timestamp: Date;
}

const MAX_ERROR_HISTORY = 10;

export default function Diagnostics() {
  const { user, session } = useAuth();
  const { roles, isAdmin } = useUserRoles();
  const [latencyTests, setLatencyTests] = useState<LatencyTest[]>([]);
  const [errorHistory, setErrorHistory] = useState<ApiError[]>([]);
  const [isTestingLatency, setIsTestingLatency] = useState(false);
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const networkQuality = useNetworkQuality();
  const [networkInfo, setNetworkInfo] = useState(getNetworkStatus());

  const isDev = import.meta.env.DEV || window.location.hostname.includes('preview');
  const environment = isDev ? 'development' : 'production';

  // Update network info periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setNetworkInfo(getNetworkStatus());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const addError = (error: ApiError) => {
    setErrorHistory(prev => [error, ...prev].slice(0, MAX_ERROR_HISTORY));
  };

  const clearErrors = () => {
    setErrorHistory([]);
  };

  // Check database connectivity
  useEffect(() => {
    const checkDb = async () => {
      try {
        const start = performance.now();
        const { error } = await supabase.from('countries').select('id').limit(1);
        const latency = Math.round(performance.now() - start);
        
        if (error) {
          setDbStatus('error');
          addError({ message: error.message, endpoint: 'countries', timestamp: new Date() });
        } else {
          setDbStatus('connected');
          setLatencyTests(prev => [...prev.slice(-4), {
            endpoint: 'DB: countries',
            latency,
            status: 'success',
            timestamp: new Date()
          }]);
        }
      } catch (e) {
        setDbStatus('error');
        addError({ message: String(e), endpoint: 'DB check', timestamp: new Date() });
      }
    };
    checkDb();
  }, []);

  const runLatencyTests = async () => {
    setIsTestingLatency(true);
    const tests: LatencyTest[] = [];

    // Test 1: Countries table
    try {
      const start = performance.now();
      await supabase.from('countries').select('id').limit(1);
      tests.push({ endpoint: 'countries', latency: Math.round(performance.now() - start), status: 'success', timestamp: new Date() });
    } catch {
      tests.push({ endpoint: 'countries', latency: 0, status: 'error', timestamp: new Date() });
    }

    // Test 2: Profiles table (if authenticated)
    if (user) {
      try {
        const start = performance.now();
        await supabase.from('profiles').select('id').eq('id', user.id).single();
        tests.push({ endpoint: 'profiles', latency: Math.round(performance.now() - start), status: 'success', timestamp: new Date() });
      } catch {
        tests.push({ endpoint: 'profiles', latency: 0, status: 'error', timestamp: new Date() });
      }
    }

    // Test 3: UI Translations
    try {
      const start = performance.now();
      await supabase.from('ui_translations').select('id').limit(1);
      tests.push({ endpoint: 'ui_translations', latency: Math.round(performance.now() - start), status: 'success', timestamp: new Date() });
    } catch {
      tests.push({ endpoint: 'ui_translations', latency: 0, status: 'error', timestamp: new Date() });
    }

    // Test 4: Edge function (check-subscription)
    if (user) {
      try {
        const start = performance.now();
        await supabase.functions.invoke('check-subscription');
        tests.push({ endpoint: 'edge: check-subscription', latency: Math.round(performance.now() - start), status: 'success', timestamp: new Date() });
      } catch {
        tests.push({ endpoint: 'edge: check-subscription', latency: 0, status: 'error', timestamp: new Date() });
      }
    }

    setLatencyTests(tests);
    setIsTestingLatency(false);
  };

  const avgLatency = latencyTests.length > 0
    ? Math.round(latencyTests.filter(t => t.status === 'success').reduce((sum, t) => sum + t.latency, 0) / latencyTests.filter(t => t.status === 'success').length)
    : 0;

  // Restrict to admins in production
  if (!isDev && !isAdmin) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h1 className="text-2xl font-bold mb-2">Accès restreint</h1>
        <p className="text-muted-foreground">Cette page est réservée aux administrateurs.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Server className="w-8 h-8 text-primary" />
            Diagnostics
          </h1>
          <p className="text-muted-foreground mt-1">Informations système et debugging</p>
        </div>
        <Badge variant={isDev ? 'default' : 'secondary'} className="text-sm">
          {environment.toUpperCase()}
        </Badge>
      </div>

      <Tabs defaultValue="system" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="system" className="gap-2">
            <Server className="w-4 h-4" />
            Système
          </TabsTrigger>
          <TabsTrigger value="smoke" className="gap-2">
            <TestTube2 className="w-4 h-4" />
            Tests de Fumée
          </TabsTrigger>
        </TabsList>

        <TabsContent value="system">

      <div className="grid gap-6 md:grid-cols-2">
        {/* Auth Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="w-5 h-5" />
              Authentification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Statut</span>
              <Badge variant={user ? 'default' : 'outline'}>
                {user ? 'Connecté' : 'Déconnecté'}
              </Badge>
            </div>
            {user && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">User ID</span>
                  <code className="text-xs bg-muted px-2 py-1 rounded">{user.id.slice(0, 8)}...</code>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Email</span>
                  <span className="text-sm">{user.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Session valide</span>
                  <Badge variant={session ? 'default' : 'destructive'}>
                    {session ? 'Oui' : 'Non'}
                  </Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Roles & Permissions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="w-5 h-5" />
              Rôles & Permissions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Admin</span>
              <Badge variant={isAdmin ? 'default' : 'outline'}>
                {isAdmin ? 'Oui' : 'Non'}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Rôles actifs</span>
              <div className="flex gap-1">
                {roles.length > 0 ? roles.map(role => (
                  <Badge key={role} variant="secondary" className="text-xs">{role}</Badge>
                )) : (
                  <span className="text-sm text-muted-foreground">Aucun</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Database Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Database className="w-5 h-5" />
              Base de données
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Connexion</span>
              <Badge variant={dbStatus === 'connected' ? 'default' : dbStatus === 'error' ? 'destructive' : 'outline'}>
                {dbStatus === 'checking' && 'Vérification...'}
                {dbStatus === 'connected' && 'Connecté'}
                {dbStatus === 'error' && 'Erreur'}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Project ID</span>
              <code className="text-xs bg-muted px-2 py-1 rounded">abysiagse...</code>
            </div>
          </CardContent>
        </Card>

        {/* Latency Tests */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="w-5 h-5" />
              Latence API
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Moyenne</span>
              <span className={`font-mono ${avgLatency > 500 ? 'text-destructive' : avgLatency > 200 ? 'text-amber-500' : 'text-green-500'}`}>
                {avgLatency}ms
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={runLatencyTests}
              disabled={isTestingLatency}
              className="w-full"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isTestingLatency ? 'animate-spin' : ''}`} />
              {isTestingLatency ? 'Test en cours...' : 'Lancer tests de latence'}
            </Button>
            {latencyTests.length > 0 && (
              <div className="mt-3 space-y-1">
                {latencyTests.map((test, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">{test.endpoint}</span>
                    <span className={`font-mono ${test.status === 'error' ? 'text-destructive' : ''}`}>
                      {test.status === 'success' ? `${test.latency}ms` : 'Erreur'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Network Status */}
      <Card className="mt-6">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Wifi className="w-5 h-5" />
            Réseau
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Qualité</span>
            <Badge variant={networkQuality === 'good' ? 'default' : networkQuality === 'slow' ? 'secondary' : 'destructive'}>
              {networkQuality === 'good' ? 'Bonne' : networkQuality === 'slow' ? 'Lente' : 'Hors ligne'}
            </Badge>
          </div>
          {networkInfo.effectiveType && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Type de connexion</span>
              <span className="font-mono text-sm">{networkInfo.effectiveType.toUpperCase()}</span>
            </div>
          )}
          {networkInfo.downlink && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Débit estimé</span>
              <span className="font-mono text-sm">{networkInfo.downlink} Mbps</span>
            </div>
          )}
          {networkInfo.rtt && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">RTT</span>
              <span className="font-mono text-sm">{networkInfo.rtt}ms</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error History */}
      {errorHistory.length > 0 && (
        <Card className="mt-6 border-destructive/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg text-destructive">
                <AlertTriangle className="w-5 h-5" />
                Historique des erreurs ({errorHistory.length})
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={clearErrors}>
                <Trash2 className="w-4 h-4 mr-1" />
                Effacer
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 max-h-48 overflow-y-auto">
            {errorHistory.map((error, i) => (
              <div key={i} className="bg-destructive/10 p-2 rounded-lg text-sm">
                <p className="font-mono text-xs">{error.message}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {error.endpoint} • {error.timestamp.toLocaleTimeString()}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Environment Info */}
      <Card className="mt-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Environnement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground block">Mode</span>
              <span className="font-medium">{environment}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Langue</span>
              <span className="font-medium">{navigator.language}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Timezone</span>
              <span className="font-medium">{Intl.DateTimeFormat().resolvedOptions().timeZone}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Heure locale</span>
              <span className="font-medium">{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="smoke">
          <SmokeTester />
        </TabsContent>
      </Tabs>
    </div>
  );
}
