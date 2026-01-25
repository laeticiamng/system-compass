import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, MousePointer2, Edit3, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Presence {
  id: string;
  name: string;
  color: string;
  cursor?: { x: number; y: number };
  currentDecisionId?: string;
  isEditing?: boolean;
}

interface TraceOSCollaborationProps {
  channelName: string;
  onPresenceChange?: (presences: Presence[]) => void;
  containerRef?: React.RefObject<HTMLElement>;
}

const COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4',
  '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#14b8a6'
];

const getRandomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

export function TraceOSCollaboration({ 
  channelName, 
  onPresenceChange,
  containerRef 
}: TraceOSCollaborationProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [presences, setPresences] = useState<Presence[]>([]);
  const [myColor] = useState(getRandomColor);
  const [cursorPositions, setCursorPositions] = useState<Record<string, { x: number; y: number }>>({});

  // Set up presence channel
  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel(`traceos-collab-${channelName}`, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const newPresences: Presence[] = [];
        
        Object.entries(state).forEach(([key, value]) => {
          if (Array.isArray(value) && value.length > 0) {
            const presence = value[0] as any;
            if (key !== user.id) {
              newPresences.push({
                id: key,
                name: presence.name || 'Anonyme',
                color: presence.color || getRandomColor(),
                cursor: presence.cursor,
                currentDecisionId: presence.currentDecisionId,
                isEditing: presence.isEditing,
              });
            }
          }
        });
        
        setPresences(newPresences);
        onPresenceChange?.(newPresences);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences: joinedPresences }) => {
        console.log('User joined:', key, joinedPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .on('broadcast', { event: 'cursor' }, ({ payload }) => {
        if (payload.userId !== user.id) {
          setCursorPositions(prev => ({
            ...prev,
            [payload.userId]: { x: payload.x, y: payload.y }
          }));
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'Anonyme',
            color: myColor,
            online_at: new Date().toISOString(),
          });
        }
      });

    // Track cursor movement
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef?.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        channel.send({
          type: 'broadcast',
          event: 'cursor',
          payload: { userId: user.id, x, y }
        });
      }
    };

    if (containerRef?.current) {
      containerRef.current.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      if (containerRef?.current) {
        containerRef.current.removeEventListener('mousemove', handleMouseMove);
      }
      supabase.removeChannel(channel);
    };
  }, [user, channelName, myColor, onPresenceChange, containerRef]);

  if (!user) return null;

  return (
    <div className="relative">
      {/* Presence indicators */}
      <div className="flex items-center gap-2 mb-4">
        <TooltipProvider>
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-muted/50 border">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">{presences.length + 1}</span>
            <span className="text-xs text-muted-foreground ml-1">
              {t('traceOS.collaboration.online', 'en ligne')}
            </span>
          </div>

          {/* Active users */}
          <div className="flex -space-x-2">
            {/* Current user */}
            <Tooltip>
              <TooltipTrigger>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-background shadow-sm"
                  style={{ backgroundColor: myColor }}
                >
                  {(user.user_metadata?.display_name || user.email?.split('@')[0] || 'A')[0].toUpperCase()}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('traceOS.collaboration.you', 'Vous')}</p>
              </TooltipContent>
            </Tooltip>

            {/* Other users */}
            {presences.map((presence) => (
              <Tooltip key={presence.id}>
                <TooltipTrigger>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-background shadow-sm relative"
                    style={{ backgroundColor: presence.color }}
                  >
                    {presence.name[0].toUpperCase()}
                    {presence.isEditing && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-amber-500 rounded-full flex items-center justify-center">
                        <Edit3 className="w-2 h-2 text-white" />
                      </span>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="flex items-center gap-2">
                    {presence.name}
                    {presence.isEditing ? (
                      <Badge variant="secondary" className="text-xs">
                        <Edit3 className="w-3 h-3 mr-1" />
                        {t('traceOS.collaboration.editing', 'Édite')}
                      </Badge>
                    ) : presence.currentDecisionId && (
                      <Badge variant="outline" className="text-xs">
                        <Eye className="w-3 h-3 mr-1" />
                        {t('traceOS.collaboration.viewing', 'Consulte')}
                      </Badge>
                    )}
                  </p>
                </TooltipContent>
              </Tooltip>
            ))
            }
          </div>
        </TooltipProvider>
      </div>

      {/* Remote cursors */}
      {containerRef?.current && Object.entries(cursorPositions).map(([userId, pos]) => {
        const presence = presences.find(p => p.id === userId);
        if (!presence) return null;
        
        return (
          <div
            key={userId}
            className="absolute pointer-events-none z-50 transition-all duration-75"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: 'translate(-2px, -2px)',
            }}
          >
            <MousePointer2
              className="w-5 h-5 drop-shadow-md"
              style={{ color: presence.color }}
              fill={presence.color}
            />
            <span
              className="absolute left-4 top-3 px-1.5 py-0.5 text-xs font-medium text-white rounded whitespace-nowrap shadow-sm"
              style={{ backgroundColor: presence.color }}
            >
              {presence.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// Hook for tracking decision activity
export function useDecisionActivity(channelName: string) {
  const { user } = useAuth();
  
  const trackDecision = useCallback(async (decisionId: string, isEditing: boolean) => {
    if (!user) return;
    
    const channel = supabase.channel(`traceos-collab-${channelName}`);
    await channel.track({
      currentDecisionId: decisionId,
      isEditing,
    });
  }, [user, channelName]);

  return { trackDecision };
}
