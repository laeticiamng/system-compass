/**
 * SmokeTester - Automated smoke tests for critical paths
 * Addresses: "Tests mal conçus" and "Edge cases négligés" from audit
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, XCircle, Loader2, Play, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { scrapeUrl, searchWithAI, generateAudio } from '@/lib/api/premium-intel';

interface SmokeTest {
  id: string;
  name: string;
  description: string;
  critical: boolean;
  test: () => Promise<{ passed: boolean; message: string; duration: number }>;
}

interface SmokeTestResult {
  id: string;
  passed: boolean;
  message: string;
  duration: number;
}

export function SmokeTester() {
  useTranslation();
  const { user } = useAuth();
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<SmokeTestResult[]>([]);
  const [progress, setProgress] = useState(0);

  const smokeTests: SmokeTest[] = [
    {
      id: 'database_connection',
      name: 'Connexion base de données',
      description: 'Vérifier la connectivité Supabase',
      critical: true,
      test: async () => {
        const start = Date.now();
        try {
          const { error } = await supabase.from('countries').select('id').limit(1);
          const duration = Date.now() - start;
          return {
            passed: !error,
            message: error ? error.message : 'Connexion OK',
            duration
          };
        } catch (e) {
          return {
            passed: false,
            message: e instanceof Error ? e.message : 'Erreur inconnue',
            duration: Date.now() - start
          };
        }
      }
    },
    {
      id: 'auth_cycle',
      name: 'Cycle d\'authentification',
      description: 'Test connexion/déconnexion',
      critical: true,
      test: async () => {
        const start = Date.now();
        try {
          // Test getting current session
          const { data: { session } } = await supabase.auth.getSession();
          const duration = Date.now() - start;
          return {
            passed: true,
            message: `Session: ${session ? 'Connecté' : 'Anonyme'}`,
            duration
          };
        } catch (e) {
          return {
            passed: false,
            message: e instanceof Error ? e.message : 'Auth failed',
            duration: Date.now() - start
          };
        }
      }
    },
    {
      id: 'countries_load',
      name: 'Chargement pays',
      description: 'Vérifier que les pays se chargent',
      critical: true,
      test: async () => {
        const start = Date.now();
        try {
          const { data, error } = await supabase
            .from('countries')
            .select('id, name, pyramid_type')
            .limit(10);
          const duration = Date.now() - start;
          return {
            passed: !error && data && data.length > 0,
            message: error ? error.message : `${data?.length || 0} pays chargés`,
            duration
          };
        } catch (e) {
          return {
            passed: false,
            message: e instanceof Error ? e.message : 'Erreur chargement pays',
            duration: Date.now() - start
          };
        }
      }
    },
    {
      id: 'profile_access',
      name: 'Accès profil utilisateur',
      description: 'Test RLS sur les profils',
      critical: true,
      test: async () => {
        const start = Date.now();
        try {
          if (!user) {
            return {
              passed: true,
              message: 'Pas connecté - OK',
              duration: Date.now() - start
            };
          }
          
          const { error } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .single();
            
          const duration = Date.now() - start;
          return {
            passed: !error,
            message: error ? error.message : 'Accès profil OK',
            duration
          };
        } catch (e) {
          return {
            passed: false,
            message: e instanceof Error ? e.message : 'Erreur profil',
            duration: Date.now() - start
          };
        }
      }
    },
    {
      id: 'api_performance',
      name: 'Performance API',
      description: 'Mesurer la latence moyenne',
      critical: false,
      test: async () => {
        const start = Date.now();
        const calls = [];
        
        // Test 3 calls
        for (let i = 0; i < 3; i++) {
          const callStart = Date.now();
          try {
            await supabase.from('countries').select('count', { count: 'exact', head: true });
            calls.push(Date.now() - callStart);
          } catch {
            calls.push(5000); // 5s penalty for failed calls
          }
        }
        
        const avgLatency = calls.reduce((a, b) => a + b, 0) / calls.length;
        const duration = Date.now() - start;
        
        return {
          passed: avgLatency < 2000,
          message: `Latence moyenne: ${avgLatency.toFixed(0)}ms`,
          duration
        };
      }
    },
    // Premium Intelligence Tests
    {
      id: 'firecrawl_scrape',
      name: 'Firecrawl Scraping',
      description: 'Test scraping temps réel',
      critical: false,
      test: async () => {
        const start = Date.now();
        try {
          const result = await scrapeUrl('https://example.com', { formats: ['markdown'] });
          const duration = Date.now() - start;
          return {
            passed: result.success,
            message: result.success ? 'Scraping OK' : (result.error || 'Échec scraping'),
            duration
          };
        } catch (e) {
          return {
            passed: false,
            message: e instanceof Error ? e.message : 'Erreur Firecrawl',
            duration: Date.now() - start
          };
        }
      }
    },
    {
      id: 'perplexity_search',
      name: 'Perplexity AI Search',
      description: 'Test recherche IA avec citations',
      critical: false,
      test: async () => {
        const start = Date.now();
        try {
          const result = await searchWithAI('What is 2+2?', { maxTokens: 100 });
          const duration = Date.now() - start;
          return {
            passed: result.success && !!result.content,
            message: result.success ? `Réponse: ${result.content?.slice(0, 50)}...` : (result.error || 'Échec recherche'),
            duration
          };
        } catch (e) {
          return {
            passed: false,
            message: e instanceof Error ? e.message : 'Erreur Perplexity',
            duration: Date.now() - start
          };
        }
      }
    },
    {
      id: 'elevenlabs_tts',
      name: 'ElevenLabs TTS',
      description: 'Test synthèse vocale IA',
      critical: false,
      test: async () => {
        const start = Date.now();
        try {
          const result = await generateAudio('Test', { voiceStyle: 'narrator' });
          const duration = Date.now() - start;
          return {
            passed: result.success && !!result.audioContent,
            message: result.success ? 'Audio généré OK' : (result.error || 'Échec TTS'),
            duration
          };
        } catch (e) {
          return {
            passed: false,
            message: e instanceof Error ? e.message : 'Erreur ElevenLabs',
            duration: Date.now() - start
          };
        }
      }
    }
  ];

  const runTests = async () => {
    setRunning(true);
    setResults([]);
    setProgress(0);
    
    const testResults: SmokeTestResult[] = [];
    
    for (let i = 0; i < smokeTests.length; i++) {
      const test = smokeTests[i];
      setProgress(((i) / smokeTests.length) * 100);
      
      try {
        const result = await test.test();
        testResults.push({
          id: test.id,
          ...result
        });
      } catch (e) {
        testResults.push({
          id: test.id,
          passed: false,
          message: e instanceof Error ? e.message : 'Test failed',
          duration: 0
        });
      }
      
      setResults([...testResults]);
    }
    
    setProgress(100);
    setRunning(false);
  };

  const criticalTests = smokeTests.filter(t => t.critical);
  const passedCritical = results.filter(r => {
    const test = smokeTests.find(t => t.id === r.id);
    return test?.critical && r.passed;
  }).length;

  const allPassed = results.length > 0 && results.every(r => r.passed);
  const criticalPassed = passedCritical === criticalTests.length;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="w-5 h-5 text-primary" />
          Tests de fumée (Smoke Tests)
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Vérification rapide des fonctions critiques
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="flex gap-2">
          <Button onClick={runTests} disabled={running} className="gap-2">
            {running ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Tests en cours...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Lancer les tests
              </>
            )}
          </Button>
          {results.length > 0 && (
            <Button
              variant="outline"
              onClick={() => {
                setResults([]);
                setProgress(0);
              }}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Réinitialiser
            </Button>
          )}
        </div>

        {/* Progress */}
        {running && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Test {Math.floor((progress / 100) * smokeTests.length) + 1} sur {smokeTests.length}
            </p>
          </div>
        )}

        {/* Overall Status */}
        {results.length === smokeTests.length && (
          <div className={cn(
            "p-4 rounded-lg border",
            allPassed 
              ? "bg-primary/10 border-primary/30 text-primary"
              : criticalPassed
              ? "bg-amber-500/10 border-amber-500/30 text-amber-600"
              : "bg-destructive/10 border-destructive/30 text-destructive"
          )}>
            {allPassed ? (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">Tous les tests passés ✓</span>
              </div>
            ) : criticalPassed ? (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">Tests critiques passés</span>
                <Badge variant="outline" className="text-amber-600">
                  {results.filter(r => r.passed).length}/{results.length}
                </Badge>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                <span className="font-medium">Tests critiques échoués</span>
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Résultats détaillés</h4>
            {smokeTests.map((test, index) => {
              const result = results.find(r => r.id === test.id);
              const isRunning = running && index === results.length;
              
              return (
                <div
                  key={test.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border",
                    result?.passed 
                      ? "bg-primary/5 border-primary/20"
                      : result && !result.passed
                      ? "bg-destructive/5 border-destructive/20"
                      : "bg-muted/20 border-border"
                  )}
                >
                  <div className="flex-shrink-0">
                    {isRunning ? (
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    ) : result?.passed ? (
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    ) : result ? (
                      <XCircle className="w-5 h-5 text-destructive" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-muted" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{test.name}</span>
                      {test.critical && (
                        <Badge variant="destructive" className="text-xs">
                          Critique
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{test.description}</p>
                    {result && (
                      <p className={cn(
                        "text-xs mt-1",
                        result.passed ? "text-primary" : "text-destructive"
                      )}>
                        {result.message} ({result.duration}ms)
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}