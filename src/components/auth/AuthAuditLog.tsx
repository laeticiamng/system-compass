// Auth Audit Log Component - Track authentication events
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Shield, LogIn, LogOut, KeyRound, AlertTriangle,
  CheckCircle, XCircle, Clock, Globe, Smartphone
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuthEvent {
  id: string;
  event_type: 'login' | 'logout' | 'password_change' | 'failed_attempt' | 'session_refresh' | 'mfa_enabled';
  status: 'success' | 'failure';
  ip_address?: string;
  user_agent?: string;
  location?: string;
  created_at: string;
  details?: string;
}

interface AuthAuditLogProps {
  events: AuthEvent[];
  showFilters?: boolean;
}

export function AuthAuditLog({ events }: AuthAuditLogProps) {
  const { t, i18n } = useTranslation();

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'login': return LogIn;
      case 'logout': return LogOut;
      case 'password_change': return KeyRound;
      case 'failed_attempt': return AlertTriangle;
      case 'session_refresh': return Clock;
      case 'mfa_enabled': return Shield;
      default: return Shield;
    }
  };

  const getEventLabel = (type: string) => {
    const labels: Record<string, string> = {
      login: t('auth.events.login', 'Login'),
      logout: t('auth.events.logout', 'Logout'),
      password_change: t('auth.events.passwordChange', 'Password Changed'),
      failed_attempt: t('auth.events.failedAttempt', 'Failed Attempt'),
      session_refresh: t('auth.events.sessionRefresh', 'Session Refresh'),
      mfa_enabled: t('auth.events.mfaEnabled', 'MFA Enabled'),
    };
    return labels[type] || type;
  };

  const getStatusColor = (status: string) => {
    return status === 'success' 
      ? 'text-green-600 bg-green-500/10' 
      : 'text-red-600 bg-red-500/10';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const parseUserAgent = (ua?: string) => {
    if (!ua) return { device: 'Unknown', browser: 'Unknown' };
    
    const isMobile = /Mobile|Android|iPhone/.test(ua);
    const browser = ua.match(/(Chrome|Firefox|Safari|Edge)/)?.[1] || 'Unknown';
    
    return {
      device: isMobile ? 'Mobile' : 'Desktop',
      browser,
    };
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Shield className="w-5 h-5" />
          {t('auth.auditLog', 'Security Audit Log')}
          <Badge variant="outline">{events.length} {t('auth.events', 'events')}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Shield className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>{t('auth.noEvents', 'No security events recorded')}</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {events.map((event) => {
                const Icon = getEventIcon(event.event_type);
                const { device, browser } = parseUserAgent(event.user_agent);
                
                return (
                  <div 
                    key={event.id}
                    className={cn(
                      "p-3 rounded-lg border transition-colors",
                      event.status === 'failure' && "border-red-500/30 bg-red-500/5"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "p-2 rounded-full",
                          event.status === 'success' ? "bg-green-500/10" : "bg-red-500/10"
                        )}>
                          <Icon className={cn(
                            "w-4 h-4",
                            event.status === 'success' ? "text-green-600" : "text-red-600"
                          )} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {getEventLabel(event.event_type)}
                            </span>
                            <Badge 
                              variant="outline" 
                              className={cn("text-xs", getStatusColor(event.status))}
                            >
                              {event.status === 'success' ? (
                                <CheckCircle className="w-3 h-3 mr-1" />
                              ) : (
                                <XCircle className="w-3 h-3 mr-1" />
                              )}
                              {event.status}
                            </Badge>
                          </div>
                          
                          {event.details && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {event.details}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(event.created_at)}
                            </span>
                            {event.location && (
                              <span className="flex items-center gap-1">
                                <Globe className="w-3 h-3" />
                                {event.location}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Smartphone className="w-3 h-3" />
                              {device} • {browser}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}

        {/* Security Tip */}
        <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-700">
                {t('auth.securityTip', 'Security Tip')}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {t('auth.reviewEvents', 'Review your login history regularly. Report any suspicious activity immediately.')}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
