import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare, Send, Bot, User, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface CollaborationMessage {
  id: string;
  author: {
    id: string;
    name: string;
    isBot?: boolean;
  };
  content: string;
  timestamp: Date;
  threadId?: string;
}

interface CollaborationThreadProps {
  messages: CollaborationMessage[];
  onSendMessage: (content: string) => Promise<void>;
  isLoading?: boolean;
  maxHeight?: string;
  className?: string;
}

export function CollaborationThread({
  messages,
  onSendMessage,
  isLoading = false,
  maxHeight = '300px',
  className,
}: CollaborationThreadProps) {
  const { t } = useTranslation();
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      await onSendMessage(newMessage.trim());
      setNewMessage('');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return t('collaboration.justNow', 'À l\'instant');
    if (diffMins < 60) return t('collaboration.minutesAgo', { count: diffMins });
    if (diffHours < 24) return t('collaboration.hoursAgo', { count: diffHours });
    
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className={cn('border-primary/20', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          {t('collaboration.title', 'Discussion')}
          {messages.length > 0 && (
            <span className="text-xs text-muted-foreground">
              ({messages.length})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Messages */}
        <ScrollArea style={{ maxHeight }} className="pr-4">
          {messages.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">{t('collaboration.noMessages', 'Aucun message')}</p>
              <p className="text-xs">{t('collaboration.startConversation', 'Commencez la discussion')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="flex gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className={cn(
                      message.author.isBot ? 'bg-primary/10' : 'bg-muted',
                    )}>
                      {message.author.isBot ? (
                        <Bot className="w-4 h-4 text-primary" />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{message.author.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(message.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <div className="flex gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('collaboration.placeholder', 'Écrire un message...')}
            className="min-h-[60px] resize-none"
            disabled={sending || isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending || isLoading}
            className="self-end"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
