/**
 * /admin/governance — Internal governance cockpit (admin only).
 * Aggregates signals from error_logs and analytics_events.
 */
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Shield, Users, Database, RefreshCw } from 'lucide-react';
import { HealthSection } from '@/components/admin/governance/HealthSection';
import { SecuritySection } from '@/components/admin/governance/SecuritySection';
import { ActivationSection } from '@/components/admin/governance/ActivationSection';
import { QualityDebtSection } from '@/components/admin/governance/QualityDebtSection';

type Window = '24h' | '7d' | '30d';

export default function Governance() {
  const [windowSize, setWindowSize] = useState<Window>('24h');
  const [refreshKey, setRefreshKey] = useState(0);

  // Auto-refresh every 60s
  useEffect(() => {
    const id = window.setInterval(() => setRefreshKey((k) => k + 1), 60_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display tracking-tight">Cockpit de gouvernance</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Santé technique, sécurité, activation produit, dette qualité.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border bg-card p-1">
            {(['24h', '7d', '30d'] as const).map((w) => (
              <Button
                key={w}
                variant={windowSize === w ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setWindowSize(w)}
                className="h-8"
              >
                {w}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={() => setRefreshKey((k) => k + 1)}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Rafraîchir
          </Button>
        </div>
      </header>

      <Tabs defaultValue="health" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full md:w-auto">
          <TabsTrigger value="health" className="gap-2">
            <Activity className="w-4 h-4" /> Santé
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="w-4 h-4" /> Sécurité
          </TabsTrigger>
          <TabsTrigger value="activation" className="gap-2">
            <Users className="w-4 h-4" /> Activation
          </TabsTrigger>
          <TabsTrigger value="quality" className="gap-2">
            <Database className="w-4 h-4" /> Qualité
          </TabsTrigger>
        </TabsList>

        <TabsContent value="health">
          <HealthSection windowSize={windowSize} refreshKey={refreshKey} />
        </TabsContent>
        <TabsContent value="security">
          <SecuritySection windowSize={windowSize} refreshKey={refreshKey} />
        </TabsContent>
        <TabsContent value="activation">
          <ActivationSection windowSize={windowSize} refreshKey={refreshKey} />
        </TabsContent>
        <TabsContent value="quality">
          <QualityDebtSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
