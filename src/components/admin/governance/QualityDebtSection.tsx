import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

// Static snapshot — updated manually when audits run.
const SNAPSHOT = {
  e2eCoverage: '6 parcours / 44 tests',
  edgeFunctions: 30,
  tables: 80,
  pages: 110,
  lastAudit: '2026-04-17',
};

export function QualityDebtSection() {
  const [purging, setPurging] = useState(false);

  const handlePurge = async () => {
    setPurging(true);
    const { data, error } = await supabase.rpc('purge_old_error_logs');
    setPurging(false);
    if (error) toast.error(`Échec: ${error.message}`);
    else toast.success(`${data ?? 0} logs supprimés (> 30 jours).`);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Couverture E2E
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className="text-base">
              {SNAPSHOT.e2eCoverage}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Edge functions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-display">{SNAPSHOT.edgeFunctions}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tables DB
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-display">{SNAPSHOT.tables}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-display">{SNAPSHOT.pages}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Actions de maintenance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-lg border bg-muted/30">
            <div>
              <p className="font-medium">Purger les logs anciens</p>
              <p className="text-sm text-muted-foreground">
                Supprime les entrées de <code>error_logs</code> de plus de 30 jours.
              </p>
            </div>
            <Button onClick={handlePurge} disabled={purging} variant="outline">
              <Trash2 className="w-4 h-4 mr-2" />
              {purging ? 'Purge…' : 'Purger > 30j'}
            </Button>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-lg border bg-muted/30">
            <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">Dernier audit 360°</p>
              <p className="text-muted-foreground">{SNAPSHOT.lastAudit}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
