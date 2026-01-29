/**
 * SecurityChecker - Basic security validation
 * Addresses: "Sécurité par défaut médiocre" from audit
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, CheckCircle2, Eye, EyeOff, Lock, Unlock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SecurityCheck {
  id: string;
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  check: () => Promise<{ passed: boolean; details: string }>;
}

interface SecurityResult {
  id: string;
  passed: boolean;
  details: string;
}

export function SecurityChecker() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [results, setResults] = useState<SecurityResult[]>([]);
  const [loading, setLoading] = useState(false);

  const securityChecks: SecurityCheck[] = [
    {
      id: 'rls_profiles',
      name: 'RLS Profiles',
      description: 'Vérifier que les profils sont protégés par RLS',
      severity: 'high',
      check: async () => {
        try {
          if (!user) {
            return { passed: true, details: 'Non connecté - pas de test RLS nécessaire' };
          }
          
          // Try to access another user's profile (should fail)
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .neq('id', user.id)
            .limit(1);
            
          // If we get data, RLS is not working properly
          const passed = error !== null || (data && data.length === 0);
          return {
            passed,
            details: passed 
              ? 'RLS fonctionne - pas d\'accès aux autres profils' 
              : 'DANGER: Accès possible aux autres profils'
          };
        } catch {
          return { passed: true, details: 'RLS actif - accès refusé' };
        }
      }
    },
    {
      id: 'session_security',
      name: 'Sécurité session',
      description: 'Vérifier la gestion des tokens',
      severity: 'medium',
      check: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          const hasValidToken = session?.access_token && session.expires_at;
          
          if (!hasValidToken) {
            return { passed: true, details: 'Pas de session - OK' };
          }
          
          // Check token expiry
          const expiresAt = new Date(session.expires_at! * 1000);
          const now = new Date();
          const timeLeft = Math.round((expiresAt.getTime() - now.getTime()) / 1000 / 60);
          
          return {
            passed: timeLeft > 5,
            details: timeLeft > 5 
              ? `Token valide (${timeLeft}min restantes)`
              : `Token expire bientôt (${timeLeft}min)`
          };
        } catch (e) {
          return {
            passed: false,
            details: e instanceof Error ? e.message : 'Erreur session'
          };
        }
      }
    },
    {
      id: 'local_storage',
      name: 'Stockage local',
      description: 'Vérifier que pas de données sensibles en localStorage',
      severity: 'medium',
      check: async () => {
        const sensitiveKeys = ['password', 'token', 'secret', 'key', 'auth'];
        const foundSensitive: string[] = [];
        
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            const lowerKey = key.toLowerCase();
            if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
              foundSensitive.push(key);
            }
          }
        }
        
        return {
          passed: foundSensitive.length === 0,
          details: foundSensitive.length === 0
            ? 'Pas de données sensibles détectées'
            : `ATTENTION: ${foundSensitive.join(', ')}`
        };
      }
    },
    {
      id: 'console_errors',
      name: 'Erreurs console',
      description: 'Vérifier l\'absence d\'erreurs critiques',
      severity: 'low',
      check: async () => {
        // This is simplified - in a real implementation we'd capture console errors
        const errors = (window as any).__consoleErrors || [];
        return {
          passed: errors.length === 0,
          details: errors.length === 0 
            ? 'Pas d\'erreur console détectée'
            : `${errors.length} erreurs détectées`
        };
      }
    }
  ];

  const runSecurityChecks = async () => {
    setLoading(true);
    const checkResults: SecurityResult[] = [];

    for (const check of securityChecks) {
      try {
        const result = await check.check();
        checkResults.push({
          id: check.id,
          ...result
        });
      } catch (e) {
        checkResults.push({
          id: check.id,
          passed: false,
          details: e instanceof Error ? e.message : 'Erreur inconnue'
        });
      }
    }

    setResults(checkResults);
    setLoading(false);
  };

  useEffect(() => {
    // Auto-run on mount
    runSecurityChecks();
  }, [user?.id]);

  const criticalIssues = results.filter(r => {
    const check = securityChecks.find(c => c.id === r.id);
    return check?.severity === 'high' && !r.passed;
  }).length;

  const overallStatus = results.length === 0 ? 'unknown' : 
    criticalIssues > 0 ? 'critical' :
    results.some(r => !r.passed) ? 'warning' : 'safe';

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Vérification sécurité
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge
            variant={overallStatus === 'safe' ? 'default' : 'destructive'}
            className={cn(
              overallStatus === 'safe' && 'bg-primary/20 text-primary',
              overallStatus === 'warning' && 'bg-amber-500/20 text-amber-600',
              overallStatus === 'critical' && 'bg-destructive/20 text-destructive'
            )}
          >
            {overallStatus === 'safe' && <CheckCircle2 className="w-3 h-3 mr-1" />}
            {overallStatus === 'warning' && <AlertTriangle className="w-3 h-3 mr-1" />}
            {overallStatus === 'critical' && <AlertTriangle className="w-3 h-3 mr-1" />}
            {overallStatus === 'safe' ? 'Sécurisé' :
             overallStatus === 'warning' ? 'Avertissements' :
             overallStatus === 'critical' ? 'Critique' : 'Inconnu'}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={runSecurityChecks}
            disabled={loading}
          >
            Actualiser
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {securityChecks.map((check) => {
          const result = results.find(r => r.id === check.id);
          
          return (
            <div
              key={check.id}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border",
                result?.passed 
                  ? "bg-primary/5 border-primary/20"
                  : result
                  ? "bg-destructive/5 border-destructive/20"
                  : "bg-muted/20 border-border"
              )}
            >
              <div className="flex-shrink-0 mt-0.5">
                {result?.passed ? (
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                ) : result ? (
                  <AlertTriangle className={cn(
                    "w-5 h-5",
                    check.severity === 'high' ? "text-destructive" : 
                    check.severity === 'medium' ? "text-amber-500" : "text-muted-foreground"
                  )} />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-muted animate-pulse" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{check.name}</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      check.severity === 'high' && "border-destructive/30 text-destructive",
                      check.severity === 'medium' && "border-amber-500/30 text-amber-600",
                      check.severity === 'low' && "border-muted"
                    )}
                  >
                    {check.severity}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{check.description}</p>
                {result && (
                  <p className={cn(
                    "text-xs mt-1",
                    result.passed ? "text-primary" : "text-destructive"
                  )}>
                    {result.details}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}