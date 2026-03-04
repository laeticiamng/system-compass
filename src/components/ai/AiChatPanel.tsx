import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, MessageCircle, Sparkles, Trash2, User, MapPin, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;

interface UserProfile {
  display_name: string | null;
  current_country: string | null;
  nationalities: string[] | null;
  profession_id: string | null;
  motor_profile: string | null;
  desired_life: string | null;
}

function getPersonalizedSuggestions(profile: UserProfile | null, watchlist: string[]): string[] {
  const base = [
    "Quels pays sont idéaux pour mon profil ?",
    "Quelles démarches administratives dois-je prévoir ?",
  ];

  if (watchlist.length > 0) {
    const country = watchlist[0];
    base.unshift(`Donne-moi un résumé complet de ${country} pour mon expatriation`);
    if (watchlist.length > 1) {
      base.push(`Compare ${watchlist[0]} et ${watchlist[1]} pour ma situation`);
    }
  }

  if (profile?.profession_id) {
    base.push(`Quels pays offrent les meilleures opportunités pour un ${profile.profession_id} ?`);
  }

  if (profile?.current_country) {
    base.push(`Quelles sont les étapes pour quitter ${profile.current_country} ?`);
  }

  return base.slice(0, 4);
}

export function AiChatPanel() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [contextLoaded, setContextLoaded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch user context when panel opens
  useEffect(() => {
    if (!isOpen || !user || contextLoaded) return;

    const fetchContext = async () => {
      try {
        const [profileRes, watchlistRes] = await Promise.all([
          supabase
            .from('profiles')
            .select('display_name, current_country, nationalities, profession_id, motor_profile, desired_life')
            .eq('id', user.id)
            .maybeSingle(),
          supabase
            .from('user_country_watchlist')
            .select('country_id')
            .eq('user_id', user.id)
            .limit(20),
        ]);

        if (profileRes.data) setProfile(profileRes.data);
        if (watchlistRes.data) setWatchlist(watchlistRes.data.map(w => w.country_id));
        setContextLoaded(true);
      } catch {
        // Non-blocking
        setContextLoaded(true);
      }
    };

    fetchContext();
  }, [isOpen, user, contextLoaded]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      const el = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (el) el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  const streamChat = useCallback(async (allMessages: ChatMessage[]) => {
    // Get the session token for server-side auth
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    const resp = await fetch(CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ messages: allMessages }),
    });

    if (!resp.ok) {
      const errData = await resp.json().catch(() => ({}));
      if (resp.status === 429) {
        toast.error(errData.error || 'Trop de requêtes, réessayez plus tard.');
      } else if (resp.status === 402) {
        toast.error(errData.error || 'Crédits IA insuffisants.');
      } else {
        toast.error('Erreur du service IA');
      }
      throw new Error('Stream failed');
    }

    if (!resp.body) throw new Error('No body');

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = '';
    let assistantSoFar = '';

    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      const content = assistantSoFar;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant') {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content } : m));
        }
        return [...prev, { role: 'assistant', content }];
      });
    };

    let streamDone = false;
    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);
        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (line.startsWith(':') || line.trim() === '') continue;
        if (!line.startsWith('data: ')) continue;
        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') { streamDone = true; break; }
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) upsert(content);
        } catch {
          textBuffer = line + '\n' + textBuffer;
          break;
        }
      }
    }

    // Final flush
    if (textBuffer.trim()) {
      for (let raw of textBuffer.split('\n')) {
        if (!raw) continue;
        if (raw.endsWith('\r')) raw = raw.slice(0, -1);
        if (raw.startsWith(':') || raw.trim() === '') continue;
        if (!raw.startsWith('data: ')) continue;
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === '[DONE]') continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) upsert(content);
        } catch { /* ignore */ }
      }
    }
  }, []);

  const send = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: msg };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      await streamChat(newMessages);
    } catch {
      // Error already handled via toast
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const suggestions = getPersonalizedSuggestions(profile, watchlist);
  const hasContext = profile?.display_name || watchlist.length > 0;

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              size="lg"
              className="rounded-full w-14 h-14 shadow-lg bg-primary hover:bg-primary/90 p-0 relative"
              aria-label="Ouvrir l'assistant IA"
            >
              <MessageCircle className="w-6 h-6" />
              {user && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-primary/80 rounded-full border-2 border-background" />
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-background border-l shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/5 to-primary/10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-sm">
                    {profile?.display_name
                      ? `Coach de ${profile.display_name}`
                      : 'Coach Expatriation IA'}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {hasContext ? 'Contexte personnalisé actif' : 'Posez toutes vos questions'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <Button variant="ghost" size="icon" onClick={clearChat} title="Effacer">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Context badges */}
            {hasContext && messages.length === 0 && (
              <div className="px-4 pt-3 flex flex-wrap gap-1.5">
                {profile?.current_country && (
                  <Badge variant="secondary" className="text-[10px] gap-1">
                    <MapPin className="w-3 h-3" />
                    {profile.current_country}
                  </Badge>
                )}
                {profile?.profession_id && (
                  <Badge variant="secondary" className="text-[10px] gap-1">
                    <User className="w-3 h-3" />
                    {profile.profession_id}
                  </Badge>
                )}
                {watchlist.length > 0 && (
                  <Badge variant="secondary" className="text-[10px] gap-1">
                    <Globe className="w-3 h-3" />
                    {watchlist.length} pays suivis
                  </Badge>
                )}
              </div>
            )}

            {/* Messages */}
            <ScrollArea className="flex-1" ref={scrollRef}>
              <div className="p-4 space-y-4">
                {messages.length === 0 && (
                  <div className="space-y-4 pt-2">
                    <div className="text-center">
                      <Sparkles className="w-10 h-10 text-primary mx-auto mb-3 opacity-50" />
                      <p className="text-sm text-muted-foreground mb-1">
                        {profile?.display_name
                          ? `Bonjour ${profile.display_name} 👋`
                          : 'Bonjour 👋'}
                      </p>
                      <p className="text-xs text-muted-foreground mb-4">
                        {hasContext
                          ? 'Je connais votre profil et vos pays favoris. Comment puis-je vous aider ?'
                          : 'Je suis votre coach IA en expatriation. Comment puis-je vous aider ?'}
                      </p>
                    </div>
                    <div className="grid gap-2">
                      {suggestions.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => send(s)}
                          className="text-left text-xs p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={cn(
                      'flex',
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={cn(
                        'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm',
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-muted rounded-bl-md'
                      )}
                    >
                      {msg.role === 'assistant' ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-3 border-t bg-muted/30">
              <div className="flex gap-2 items-end">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Posez votre question..."
                  className="min-h-[40px] max-h-[120px] resize-none text-sm"
                  rows={1}
                  disabled={isLoading}
                />
                <Button
                  onClick={() => send()}
                  size="icon"
                  disabled={!input.trim() || isLoading}
                  className="shrink-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground text-center mt-2">
                Outil informatif uniquement — consultez un professionnel pour des conseils personnalisés.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
