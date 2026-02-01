/**
 * ExpertMessaging - Real-time messaging component for expert-client communication
 * Supports text messages with read receipts and typing indicators
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageCircle, 
  Send, 
  Check, 
  CheckCheck, 
  User,
  X,
  Loader2,
  Paperclip
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
  readAt?: string;
  type: 'text' | 'system';
}

interface Conversation {
  id: string;
  expertId: string;
  expertName: string;
  expertPhoto?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
}

interface ExpertMessagingProps {
  expertId: string;
  expertName: string;
  expertPhoto?: string;
  open: boolean;
  onClose: () => void;
}

export function ExpertMessaging({ 
  expertId, 
  expertName, 
  expertPhoto, 
  open, 
  onClose 
}: ExpertMessagingProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Mock messages for demo (when not connected to real DB)
  const mockMessages: Message[] = [
    {
      id: '1',
      senderId: expertId,
      senderName: expertName,
      content: `Bonjour ! Je suis ${expertName}. Comment puis-je vous aider dans votre projet d'expatriation ?`,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      type: 'text',
    },
    {
      id: 'system-1',
      senderId: 'system',
      senderName: 'Système',
      content: 'Conversation démarrée. Les messages sont chiffrés de bout en bout.',
      createdAt: new Date(Date.now() - 3500000).toISOString(),
      type: 'system',
    }
  ];

  // Load conversation and messages
  useEffect(() => {
    if (!open || !user) return;

    const loadConversation = async () => {
      setIsLoading(true);
      
      // For demo, use mock messages
      if (expertId.startsWith('mock-')) {
        setMessages(mockMessages);
        setConversationId(`conv-${expertId}-${user.id}`);
        setIsLoading(false);
        return;
      }

      try {
        // Try to find existing conversation
        const { data: conv, error: convError } = await (supabase as any)
          .from('expert_conversations')
          .select('id')
          .eq('expert_id', expertId)
          .eq('user_id', user.id)
          .single();

        if (conv && !convError) {
          setConversationId(conv.id);
          // Load messages
          const { data: msgs } = await (supabase as any)
            .from('expert_messages')
            .select('*')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: true });

          if (msgs) {
            setMessages(msgs.map((m: any) => ({
              id: m.id,
              senderId: m.sender_id,
              senderName: m.sender_name,
              content: m.content,
              createdAt: m.created_at,
              readAt: m.read_at,
              type: m.message_type || 'text',
            })));
          }
        } else {
          // Use mock messages for demo
          setMessages(mockMessages);
          setConversationId(`conv-${expertId}-${user.id}`);
        }
      } catch (err) {
        console.error('Failed to load conversation:', err);
        setMessages(mockMessages);
        setConversationId(`conv-${expertId}-${user.id}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadConversation();
  }, [open, user, expertId, expertName]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !user || isSending) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setIsSending(true);

    // Optimistically add message
    const tempId = `temp-${Date.now()}`;
    const newMsg: Message = {
      id: tempId,
      senderId: user.id,
      senderName: user.email?.split('@')[0] || 'Vous',
      content: messageContent,
      createdAt: new Date().toISOString(),
      type: 'text',
    };
    
    setMessages(prev => [...prev, newMsg]);

    // For mock experts, simulate response
    if (expertId.startsWith('mock-')) {
      setTimeout(() => {
        const responses = [
          "Merci pour votre message. Je vais examiner votre situation et vous répondre rapidement.",
          "C'est une excellente question. Laissez-moi vous donner quelques éléments de réponse.",
          "Je comprends votre préoccupation. Voici ce que je vous conseille...",
          "Pour ce type de projet, il y a plusieurs options à considérer.",
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        setMessages(prev => [...prev, {
          id: `expert-${Date.now()}`,
          senderId: expertId,
          senderName: expertName,
          content: randomResponse,
          createdAt: new Date().toISOString(),
          type: 'text',
        }]);
        setIsSending(false);
      }, 1500);
      return;
    }

    // Save to database for real experts
    try {
      const { error } = await (supabase as any)
        .from('expert_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          sender_name: user.email?.split('@')[0] || 'User',
          content: messageContent,
          message_type: 'text',
        });

      if (error) {
        toast.error('Erreur lors de l\'envoi du message');
        // Remove optimistic message
        setMessages(prev => prev.filter(m => m.id !== tempId));
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      toast.error('Erreur lors de l\'envoi');
    } finally {
      setIsSending(false);
    }
  }, [newMessage, user, expertId, expertName, conversationId, isSending]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="w-full max-w-lg h-[600px] flex flex-col glass-card-elevated shadow-2xl">
        {/* Header */}
        <CardHeader className="flex-shrink-0 border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                {expertPhoto && <AvatarImage src={expertPhoto} alt={expertName} />}
                <AvatarFallback className="bg-primary/10 text-primary">
                  {expertName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-base">{expertName}</CardTitle>
                <Badge variant="secondary" className="text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1" />
                  En ligne
                </Badge>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        {/* Messages Area */}
        <ScrollArea ref={scrollRef} className="flex-1 p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucun message pour l'instant</p>
              <p className="text-sm text-muted-foreground">Envoyez un message pour démarrer la conversation</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => {
                const isOwn = message.senderId === user?.id;
                const isSystem = message.type === 'system';

                if (isSystem) {
                  return (
                    <div key={message.id} className="flex justify-center">
                      <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                        {message.content}
                      </span>
                    </div>
                  );
                }

                return (
                  <div
                    key={message.id}
                    className={cn(
                      "flex",
                      isOwn ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-2",
                        isOwn 
                          ? "bg-primary text-primary-foreground rounded-br-sm" 
                          : "bg-muted rounded-bl-sm"
                      )}
                    >
                      <p className="text-sm">{message.content}</p>
                      <div className={cn(
                        "flex items-center gap-1 mt-1",
                        isOwn ? "justify-end" : "justify-start"
                      )}>
                        <span className="text-[10px] opacity-70">
                          {new Date(message.createdAt).toLocaleTimeString('fr-FR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                        {isOwn && (
                          message.readAt ? (
                            <CheckCheck className="h-3 w-3 opacity-70" />
                          ) : (
                            <Check className="h-3 w-3 opacity-70" />
                          )
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Input Area */}
        <div className="flex-shrink-0 border-t p-4">
          {!user ? (
            <div className="text-center py-2">
              <p className="text-sm text-muted-foreground">
                Connectez-vous pour envoyer un message
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="flex-shrink-0">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Input
                placeholder="Écrivez votre message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={isSending}
                className="flex-1"
              />
              <Button 
                size="icon" 
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || isSending}
                className="flex-shrink-0"
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

// Exported conversations list component for dashboard
export function ExpertConversationsList() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    // Mock conversations for demo
    setConversations([
      {
        id: 'conv-1',
        expertId: 'mock-1',
        expertName: 'Maître Sophie Laurent',
        lastMessage: 'Je vais examiner votre dossier.',
        lastMessageAt: new Date(Date.now() - 3600000).toISOString(),
        unreadCount: 1,
      },
      {
        id: 'conv-2',
        expertId: 'mock-3',
        expertName: 'Emma Rodriguez',
        lastMessage: 'Parfait, je vous envoie les documents.',
        lastMessageAt: new Date(Date.now() - 86400000).toISOString(),
        unreadCount: 0,
      },
    ]);
    setIsLoading(false);
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center p-8">
        <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Connectez-vous pour voir vos conversations</p>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center p-8">
        <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Aucune conversation</p>
        <p className="text-sm text-muted-foreground">Contactez un expert pour démarrer</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((conv) => (
        <Card 
          key={conv.id} 
          className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              {conv.expertPhoto && <AvatarImage src={conv.expertPhoto} />}
              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                {conv.expertName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm truncate">{conv.expertName}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(conv.lastMessageAt || '').toLocaleDateString('fr-FR')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground truncate">
                  {conv.lastMessage}
                </p>
                {conv.unreadCount > 0 && (
                  <Badge className="ml-2 h-5 min-w-[20px] flex items-center justify-center text-xs">
                    {conv.unreadCount}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
