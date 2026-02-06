import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { 
  MessageCircle, ThumbsUp, Reply, Flag, 
  Clock, ChevronDown, ChevronUp, Send
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ThreadPost {
  id: string;
  author: string;
  authorAvatar?: string;
  content: string;
  createdAt: Date;
  likes: number;
  replies: ThreadPost[];
  tags?: string[];
}

interface DiscussionThreadProps {
  title: string;
  category?: string;
  initialPosts?: ThreadPost[];
}

const MOCK_POSTS: ThreadPost[] = [
  {
    id: '1',
    author: 'Utilisateur·rice',
    content: "Bonjour à tous ! Je prépare mon expatriation au Portugal et j'aimerais avoir vos retours sur le processus de visa D7. Combien de temps a duré votre dossier ?",
    createdAt: new Date(Date.now() - 3600000 * 24 * 2),
    likes: 12,
    tags: ['Portugal', 'Visa D7', 'Expatriation'],
    replies: [
      {
        id: '1-1',
        author: 'Membre communauté',
        content: "J'ai obtenu mon D7 en 3 mois environ. Le plus long c'est la collecte des documents, surtout les extraits de casier traduits. Bon courage !",
        createdAt: new Date(Date.now() - 3600000 * 12),
        likes: 5,
        replies: [],
      },
      {
        id: '1-2',
        author: 'Membre communauté',
        content: "Même expérience que Jean-Pierre. Conseil : préparez tous vos relevés bancaires sur 6 mois minimum, ils sont très regardants sur les revenus passifs.",
        createdAt: new Date(Date.now() - 3600000 * 6),
        likes: 8,
        replies: [],
      },
    ],
  },
  {
    id: '2',
    author: 'Utilisateur·rice',
    content: "Quelqu'un a-t-il de l'expérience avec le Golden Visa UAE ? Je me demande si c'est vraiment avantageux pour un freelance tech.",
    createdAt: new Date(Date.now() - 3600000 * 48),
    likes: 7,
    tags: ['UAE', 'Golden Visa', 'Freelance'],
    replies: [],
  },
];

export function DiscussionThread({ 
  title = "Discussions Communauté", 
  category: _category = "general",
  initialPosts = MOCK_POSTS 
}: DiscussionThreadProps) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<ThreadPost[]>(initialPosts);
  const [newPost, setNewPost] = useState('');
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const toggleReplies = (postId: string) => {
    const newExpanded = new Set(expandedReplies);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
    }
    setExpandedReplies(newExpanded);
  };

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return { ...post, likes: post.likes + 1 };
      }
      return {
        ...post,
        replies: post.replies.map(reply => 
          reply.id === postId ? { ...reply, likes: reply.likes + 1 } : reply
        ),
      };
    }));
  };

  const handleSubmitPost = () => {
    if (!newPost.trim() || !user) return;

    const post: ThreadPost = {
      id: `new-${Date.now()}`,
      author: 'Vous',
      content: newPost,
      createdAt: new Date(),
      likes: 0,
      replies: [],
    };

    setPosts([post, ...posts]);
    setNewPost('');
  };

  const handleSubmitReply = (parentId: string) => {
    if (!replyContent.trim() || !user) return;

    const reply: ThreadPost = {
      id: `reply-${Date.now()}`,
      author: 'Vous',
      content: replyContent,
      createdAt: new Date(),
      likes: 0,
      replies: [],
    };

    setPosts(posts.map(post => {
      if (post.id === parentId) {
        return { ...post, replies: [...post.replies, reply] };
      }
      return post;
    }));

    setReplyContent('');
    setReplyingTo(null);
    setExpandedReplies(prev => new Set(prev).add(parentId));
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* New Post Form */}
        {user && (
          <div className="p-4 bg-muted/30 rounded-lg space-y-3">
            <Textarea
              placeholder="Partagez votre question ou expérience..."
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="min-h-[80px] resize-none"
            />
            <div className="flex justify-end">
              <Button 
                onClick={handleSubmitPost}
                disabled={!newPost.trim()}
                size="sm"
              >
                <Send className="h-4 w-4 mr-2" />
                Publier
              </Button>
            </div>
          </div>
        )}

        {/* Posts List */}
        <div className="space-y-4">
          {posts.map(post => (
            <div key={post.id} className="border rounded-lg p-4 space-y-3">
              {/* Post Header */}
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {post.author[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{post.author}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(post.createdAt, { addSuffix: true, locale: fr })}
                    </span>
                  </div>
                  {post.tags && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {post.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Post Content */}
              <p className="text-sm leading-relaxed">{post.content}</p>

              {/* Post Actions */}
              <div className="flex items-center gap-2 pt-2 border-t">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleLike(post.id)}
                  className="text-muted-foreground hover:text-primary"
                >
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  {post.likes}
                </Button>
                
                {user && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setReplyingTo(replyingTo === post.id ? null : post.id)}
                    className="text-muted-foreground"
                  >
                    <Reply className="h-4 w-4 mr-1" />
                    Répondre
                  </Button>
                )}

                {post.replies.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleReplies(post.id)}
                    className="text-muted-foreground ml-auto"
                  >
                    {expandedReplies.has(post.id) ? (
                      <ChevronUp className="h-4 w-4 mr-1" />
                    ) : (
                      <ChevronDown className="h-4 w-4 mr-1" />
                    )}
                    {post.replies.length} réponse{post.replies.length > 1 ? 's' : ''}
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                >
                  <Flag className="h-4 w-4" />
                </Button>
              </div>

              {/* Reply Form */}
              {replyingTo === post.id && (
                <div className="pl-12 space-y-2">
                  <Textarea
                    placeholder="Votre réponse..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="min-h-[60px] resize-none"
                  />
                  <div className="flex gap-2 justify-end">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setReplyingTo(null)}
                    >
                      Annuler
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleSubmitReply(post.id)}
                      disabled={!replyContent.trim()}
                    >
                      Répondre
                    </Button>
                  </div>
                </div>
              )}

              {/* Replies */}
              {expandedReplies.has(post.id) && post.replies.length > 0 && (
                <div className="pl-12 space-y-3 border-l-2 border-muted ml-5">
                  {post.replies.map(reply => (
                    <div key={reply.id} className="pl-4 py-2">
                      <div className="flex items-center gap-2 mb-1">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {reply.author[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">{reply.author}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(reply.createdAt, { addSuffix: true, locale: fr })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{reply.content}</p>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleLike(reply.id)}
                        className="text-muted-foreground hover:text-primary mt-1 h-7"
                      >
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        {reply.likes}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
