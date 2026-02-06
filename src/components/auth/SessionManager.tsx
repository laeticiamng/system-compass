/**
 * SessionManager - Manage user sessions and devices
 * Shows active sessions and allows revoking access
 */
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Smartphone, 
  Monitor, 
  Tablet,
  MapPin,
  Clock,
  Shield,
  LogOut,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface Session {
  id: string;
  device: 'mobile' | 'desktop' | 'tablet';
  browser: string;
  location: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
  createdAt: string;
}

interface SessionManagerProps {
  sessions?: Session[];
  onRevokeSession?: (sessionId: string) => Promise<void>;
  onRevokeAll?: () => Promise<void>;
}

// Parse user agent to get device and browser info
function parseUserAgent(userAgent: string): { device: Session['device']; browser: string } {
  const device: Session['device'] = /mobile|android|iphone|ipad/i.test(userAgent)
    ? /ipad|tablet/i.test(userAgent) ? 'tablet' : 'mobile'
    : 'desktop';
  
  let browser = 'Navigateur inconnu';
  if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Safari')) browser = 'Safari';
  else if (userAgent.includes('Edge')) browser = 'Edge';
  
  return { device, browser };
}

export function SessionManager({ 
  sessions: propSessions,
  onRevokeSession,
  onRevokeAll 
}: SessionManagerProps) {
  const [revoking, setRevoking] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useTranslation();
  const { session: currentSession } = useAuth();

  // Fetch current session info
  useEffect(() => {
    const fetchSessionInfo = async () => {
      if (propSessions && propSessions.length > 0) {
        setSessions(propSessions);
        setLoading(false);
        return;
      }

      if (!currentSession) {
        setSessions([]);
        setLoading(false);
        return;
      }

      try {
        // Get current session from Supabase - we can only see the current session
        const userAgent = navigator.userAgent;
        const { device, browser } = parseUserAgent(userAgent);
        
        const currentSessionInfo: Session = {
          id: currentSession.access_token.substring(0, 20),
          device,
          browser,
          location: 'Session actuelle',
          ip: '***.***.***',
          lastActive: 'Maintenant',
          isCurrent: true,
          createdAt: new Date(currentSession.expires_at ? currentSession.expires_at * 1000 - 3600000 : Date.now()).toISOString()
        };

        setSessions([currentSessionInfo]);
      } catch (error) {
        console.error('Error fetching session info:', error);
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSessionInfo();
  }, [currentSession, propSessions]);

  const getDeviceIcon = (device: Session['device']) => {
    switch (device) {
      case 'mobile': return <Smartphone className="h-5 w-5" />;
      case 'tablet': return <Tablet className="h-5 w-5" />;
      default: return <Monitor className="h-5 w-5" />;
    }
  };

  const handleRevoke = async (sessionId: string) => {
    if (!onRevokeSession) return;
    
    setRevoking(sessionId);
    try {
      await onRevokeSession(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      toast({
        title: t('settings.sessions.revoked', 'Session révoquée'),
        description: t('settings.sessions.revokedDescription', "L'appareil a été déconnecté avec succès."),
      });
    } catch {
      toast({
        title: t('common.error', 'Erreur'),
        description: t('settings.sessions.revokeError', 'Impossible de révoquer la session.'),
        variant: "destructive",
      });
    } finally {
      setRevoking(null);
    }
  };

  const handleRevokeAll = async () => {
    if (!onRevokeAll) {
      // Default behavior: sign out everywhere
      try {
        await supabase.auth.signOut({ scope: 'global' });
        toast({
          title: t('settings.sessions.allRevoked', 'Sessions révoquées'),
          description: t('settings.sessions.allRevokedDescription', 'Vous avez été déconnecté de tous les appareils.'),
        });
      } catch {
        toast({
          title: t('common.error', 'Erreur'),
          description: t('settings.sessions.revokeAllError', 'Impossible de révoquer les sessions.'),
          variant: "destructive",
        });
      }
      return;
    }
    
    try {
      await onRevokeAll();
      toast({
        title: t('settings.sessions.allRevoked', 'Sessions révoquées'),
        description: t('settings.sessions.othersRevoked', 'Tous les autres appareils ont été déconnectés.'),
      });
    } catch {
      toast({
        title: t('common.error', 'Erreur'),
        description: t('settings.sessions.revokeAllError', 'Impossible de révoquer les sessions.'),
        variant: "destructive",
      });
    }
  };

  const refreshSessions = () => {
    setLoading(true);
    // Re-trigger the effect by updating state
    setSessions([]);
    setTimeout(() => {
      if (currentSession) {
        const userAgent = navigator.userAgent;
        const { device, browser } = parseUserAgent(userAgent);
        setSessions([{
          id: currentSession.access_token.substring(0, 20),
          device,
          browser,
          location: 'Session actuelle',
          ip: '***.***.***',
          lastActive: 'Maintenant',
          isCurrent: true,
          createdAt: new Date().toISOString()
        }]);
      }
      setLoading(false);
    }, 500);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Sessions actives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Sessions actives
            </CardTitle>
            <CardDescription>
              Gérez vos sessions de connexion sur différents appareils
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={refreshSessions}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            {sessions.length > 1 && (
              <Button variant="outline" size="sm" onClick={handleRevokeAll}>
                <LogOut className="h-4 w-4 mr-2" />
                Déconnecter tout
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {sessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Aucune session active</p>
          </div>
        ) : (
          sessions.map(session => (
            <div 
              key={session.id}
              className={`p-4 rounded-lg border ${
                session.isCurrent ? 'border-primary bg-primary/5' : 'border-border'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-muted">
                  {getDeviceIcon(session.device)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{session.browser}</span>
                    {session.isCurrent && (
                      <Badge variant="default" className="text-xs">
                        Session actuelle
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {session.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {session.lastActive}
                    </span>
                  </div>
                </div>
                {!session.isCurrent && onRevokeSession && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRevoke(session.id)}
                    disabled={revoking === session.id}
                  >
                    {revoking === session.id ? (
                      "..."
                    ) : (
                      <>
                        <LogOut className="h-4 w-4 mr-1" />
                        Révoquer
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          ))
        )}

        <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-sm">
          <AlertTriangle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-muted-foreground">
            Si vous ne reconnaissez pas une session, révoquez-la immédiatement 
            et changez votre mot de passe.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
