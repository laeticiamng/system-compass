import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bug, 
  Terminal, 
  Database,
  User,
  Globe,
  Clock,
  Trash2,
  Copy,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  data?: unknown;
}

interface DiagnosticsState {
  userId: string | null;
  sessionStatus: 'active' | 'expired' | 'none';
  environment: string;
  lastApiError: string | null;
  avgLatency: number;
  memoryUsage: number;
  language: string;
  timezone: string;
}

export function DevDiagnosticsPanel() {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [diagnostics, setDiagnostics] = useState<DiagnosticsState>({
    userId: null,
    sessionStatus: 'none',
    environment: import.meta.env.MODE,
    lastApiError: null,
    avgLatency: 0,
    memoryUsage: 0,
    language: i18n.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
  const [testing, setTesting] = useState(false);

  // Only show in development
  const isDev = import.meta.env.DEV;

  useEffect(() => {
    if (!isDev) return;

    // Monitor auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setDiagnostics(prev => ({
        ...prev,
        userId: session?.user?.id || null,
        sessionStatus: session ? 'active' : 'none'
      }));
      
      addLog('info', `Auth event: ${event}`, { userId: session?.user?.id });
    });

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setDiagnostics(prev => ({
        ...prev,
        userId: session?.user?.id || null,
        sessionStatus: session ? 'active' : 'none'
      }));
    });

    // Monitor memory if available
    if ('memory' in performance) {
      const updateMemory = () => {
        const memory = (performance as unknown as { memory: { usedJSHeapSize: number } }).memory;
        setDiagnostics(prev => ({
          ...prev,
          memoryUsage: Math.round(memory.usedJSHeapSize / 1024 / 1024)
        }));
      };
      updateMemory();
      const interval = setInterval(updateMemory, 5000);
      return () => {
        clearInterval(interval);
        subscription.unsubscribe();
      };
    }

    return () => {
      subscription.unsubscribe();
    };
  }, [isDev]);

  const addLog = (level: LogEntry['level'], message: string, data?: unknown) => {
    setLogs(prev => [{
      id: crypto.randomUUID(),
      timestamp: new Date(),
      level,
      message,
      data
    }, ...prev.slice(0, 99)]);
  };

  const runDiagnostics = async () => {
    setTesting(true);
    const latencies: number[] = [];
    
    try {
      // Test database
      const dbStart = Date.now();
      const { error: dbError } = await supabase.from('countries').select('id').limit(1);
      latencies.push(Date.now() - dbStart);
      
      if (dbError) {
        addLog('error', 'Database test failed', dbError);
        setDiagnostics(prev => ({ ...prev, lastApiError: dbError.message }));
      } else {
        addLog('info', `Database OK (${latencies[0]}ms)`);
      }

      // Test auth
      const authStart = Date.now();
      const { error: authError } = await supabase.auth.getSession();
      latencies.push(Date.now() - authStart);
      
      if (authError) {
        addLog('error', 'Auth test failed', authError);
      } else {
        addLog('info', `Auth OK (${latencies[1]}ms)`);
      }

      // Calculate average latency
      const avgLatency = Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length);
      setDiagnostics(prev => ({ ...prev, avgLatency }));
      
      addLog('info', `Diagnostics complete. Avg latency: ${avgLatency}ms`);
      toast.success(t('diagnostics.testsComplete', 'Tests terminés'));
    } catch (error) {
      addLog('error', 'Diagnostics failed', error);
      toast.error(t('diagnostics.testsFailed', 'Échec des tests'));
    } finally {
      setTesting(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
    toast.success(t('diagnostics.logsCleared', 'Logs effacés'));
  };

  const copyDiagnostics = () => {
    const data = JSON.stringify({ diagnostics, recentLogs: logs.slice(0, 10) }, null, 2);
    navigator.clipboard.writeText(data);
    toast.success(t('diagnostics.copied', 'Copié dans le presse-papiers'));
  };

  const getStatusIcon = (status: 'active' | 'expired' | 'none') => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'expired': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'none': return <XCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'error': return 'text-red-500';
      case 'warn': return 'text-amber-500';
      case 'info': return 'text-blue-500';
      case 'debug': return 'text-muted-foreground';
    }
  };

  if (!isDev) return null;

  return (
    <>
      {/* Floating trigger button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 left-4 z-50 rounded-full w-12 h-12 bg-background shadow-lg border-primary/20"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bug className="w-5 h-5" />
      </Button>

      {/* Diagnostics panel */}
      {isOpen && (
        <Card className="fixed bottom-20 left-4 w-96 max-h-[70vh] z-50 shadow-xl border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Terminal className="w-5 h-5" />
                {t('diagnostics.devPanel', 'Dev Diagnostics')}
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={copyDiagnostics}>
                  <Copy className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue="status" className="w-full">
              <TabsList className="w-full rounded-none">
                <TabsTrigger value="status" className="flex-1">Status</TabsTrigger>
                <TabsTrigger value="logs" className="flex-1">Logs</TabsTrigger>
              </TabsList>

              <TabsContent value="status" className="p-4 space-y-4">
                {/* Quick stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-muted/30 space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs">
                      <User className="w-3 h-3" />
                      User ID
                    </div>
                    <p className="font-mono text-xs truncate">
                      {diagnostics.userId || 'Anonymous'}
                    </p>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-muted/30 space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs">
                      <Database className="w-3 h-3" />
                      Session
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(diagnostics.sessionStatus)}
                      <span className="text-xs capitalize">{diagnostics.sessionStatus}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-muted/30 space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs">
                      <Globe className="w-3 h-3" />
                      Environment
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {diagnostics.environment}
                    </Badge>
                  </div>

                  <div className="p-3 rounded-lg bg-muted/30 space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs">
                      <Clock className="w-3 h-3" />
                      Avg Latency
                    </div>
                    <p className="font-mono text-xs">
                      {diagnostics.avgLatency}ms
                    </p>
                  </div>
                </div>

                {/* Additional info */}
                <div className="text-xs space-y-1 text-muted-foreground">
                  <p>🌍 Language: {diagnostics.language}</p>
                  <p>🕐 Timezone: {diagnostics.timezone}</p>
                  {diagnostics.memoryUsage > 0 && (
                    <p>💾 Memory: {diagnostics.memoryUsage}MB</p>
                  )}
                </div>

                {/* Last error */}
                {diagnostics.lastApiError && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <p className="text-xs text-red-500 font-medium mb-1">Last API Error</p>
                    <p className="text-xs text-red-400 font-mono">{diagnostics.lastApiError}</p>
                  </div>
                )}

                {/* Actions */}
                <Button 
                  onClick={runDiagnostics} 
                  disabled={testing}
                  className="w-full"
                  size="sm"
                >
                  {testing ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Bug className="w-4 h-4 mr-2" />
                  )}
                  {t('diagnostics.runTests', 'Run Diagnostics')}
                </Button>
              </TabsContent>

              <TabsContent value="logs" className="p-0">
                <div className="flex items-center justify-between px-4 py-2 border-b">
                  <span className="text-xs text-muted-foreground">
                    {logs.length} entries
                  </span>
                  <Button variant="ghost" size="sm" onClick={clearLogs}>
                    <Trash2 className="w-3 h-3 mr-1" />
                    Clear
                  </Button>
                </div>
                <ScrollArea className="h-64">
                  <div className="p-2 space-y-1">
                    {logs.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-8">
                        No logs yet
                      </p>
                    ) : (
                      logs.map(log => (
                        <div 
                          key={log.id}
                          className="p-2 rounded text-xs font-mono bg-muted/20 hover:bg-muted/40"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">
                              {log.timestamp.toLocaleTimeString()}
                            </span>
                            <span className={`uppercase font-bold ${getLevelColor(log.level)}`}>
                              [{log.level}]
                            </span>
                          </div>
                          <p className="mt-1">{log.message}</p>
                          {log.data !== undefined && log.data !== null && (
                            <pre className="mt-1 text-muted-foreground overflow-x-auto text-[10px]">
                              {typeof log.data === 'string' ? log.data : JSON.stringify(log.data, null, 2)}
                            </pre>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </>
  );
}
