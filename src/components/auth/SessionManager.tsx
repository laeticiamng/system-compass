/**
 * SessionManager - Manage user sessions and devices
 * Shows active sessions and allows revoking access
 */
import { useState } from 'react';
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
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

export function SessionManager({ 
  sessions = [],
  onRevokeSession,
  onRevokeAll 
}: SessionManagerProps) {
  const [revoking, setRevoking] = useState<string | null>(null);
  const { toast } = useToast();

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
      toast({
        title: "Session révoquée",
        description: "L'appareil a été déconnecté avec succès.",
      });
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de révoquer la session.",
        variant: "destructive",
      });
    } finally {
      setRevoking(null);
    }
  };

  const handleRevokeAll = async () => {
    if (!onRevokeAll) return;
    
    try {
      await onRevokeAll();
      toast({
        title: "Sessions révoquées",
        description: "Tous les autres appareils ont été déconnectés.",
      });
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de révoquer les sessions.",
        variant: "destructive",
      });
    }
  };

  // Demo sessions if none provided
  const displaySessions: Session[] = sessions.length > 0 ? sessions : [
    {
      id: '1',
      device: 'desktop',
      browser: 'Chrome 120',
      location: 'Paris, France',
      ip: '192.168.1.***',
      lastActive: 'Maintenant',
      isCurrent: true,
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      device: 'mobile',
      browser: 'Safari iOS',
      location: 'Lyon, France',
      ip: '10.0.0.***',
      lastActive: 'Il y a 2 heures',
      isCurrent: false,
      createdAt: new Date(Date.now() - 86400000).toISOString()
    }
  ];

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
          {displaySessions.length > 1 && onRevokeAll && (
            <Button variant="outline" size="sm" onClick={handleRevokeAll}>
              <LogOut className="h-4 w-4 mr-2" />
              Déconnecter tout
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {displaySessions.map(session => (
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
        ))}

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
