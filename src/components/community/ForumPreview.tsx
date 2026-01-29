/**
 * Forum Preview - Community forum integration component
 */
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MessageSquare,
  TrendingUp,
  Clock,
  Search,
  Eye,
  MessageCircle,
  ThumbsUp,
  Pin,
  ExternalLink,
  Award
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ForumTopic {
  id: string;
  title: string;
  author: string;
  authorBadge?: 'expert' | 'moderator' | 'contributor';
  category: string;
  replies: number;
  views: number;
  likes: number;
  lastActivity: Date;
  isPinned?: boolean;
  isSolved?: boolean;
}

const FORUM_CATEGORIES = [
  { id: 'all', label: 'Tous', count: 1247 },
  { id: 'visa', label: 'Visa & Immigration', count: 342 },
  { id: 'fiscal', label: 'Fiscalité', count: 289 },
  { id: 'expat', label: 'Vie d\'expat', count: 456 },
  { id: 'countries', label: 'Pays', count: 160 },
];

const TRENDING_TOPICS: ForumTopic[] = [
  {
    id: '1',
    title: 'Portugal NHR 2026 : ce qui change réellement',
    author: 'ExpatExpert',
    authorBadge: 'expert',
    category: 'Fiscalité',
    replies: 87,
    views: 2341,
    likes: 156,
    lastActivity: new Date(Date.now() - 3600000),
    isPinned: true,
    isSolved: false,
  },
  {
    id: '2',
    title: 'Retour d\'expérience : 2 ans aux Émirats',
    author: 'NomadePro',
    authorBadge: 'contributor',
    category: 'Vie d\'expat',
    replies: 64,
    views: 1876,
    likes: 98,
    lastActivity: new Date(Date.now() - 7200000),
    isSolved: false,
  },
  {
    id: '3',
    title: 'Golden Visa Espagne : processus complet 2026',
    author: 'MariaS',
    category: 'Visa & Immigration',
    replies: 45,
    views: 1234,
    likes: 67,
    lastActivity: new Date(Date.now() - 14400000),
    isSolved: true,
  },
  {
    id: '4',
    title: 'Suisse vs Luxembourg : comparatif fiscal indépendants',
    author: 'FiscalPro',
    authorBadge: 'expert',
    category: 'Fiscalité',
    replies: 38,
    views: 987,
    likes: 54,
    lastActivity: new Date(Date.now() - 28800000),
    isSolved: false,
  },
  {
    id: '5',
    title: 'Banques pour non-résidents : retours d\'expérience',
    author: 'GlobalNomad',
    category: 'Vie d\'expat',
    replies: 92,
    views: 2145,
    likes: 112,
    lastActivity: new Date(Date.now() - 43200000),
    isSolved: true,
  },
];

const RECENT_TOPICS: ForumTopic[] = [
  {
    id: '6',
    title: 'Question sur la résidence fiscale - double nationalité',
    author: 'NewExpat',
    category: 'Fiscalité',
    replies: 12,
    views: 156,
    likes: 8,
    lastActivity: new Date(Date.now() - 1800000),
    isSolved: false,
  },
  {
    id: '7',
    title: 'Assurance santé internationale : vos recommandations ?',
    author: 'HealthFirst',
    category: 'Vie d\'expat',
    replies: 24,
    views: 342,
    likes: 19,
    lastActivity: new Date(Date.now() - 3600000),
    isSolved: false,
  },
  {
    id: '8',
    title: 'Démarches visa D7 Portugal - délais actuels',
    author: 'PortugalDreamer',
    category: 'Visa & Immigration',
    replies: 8,
    views: 89,
    likes: 5,
    lastActivity: new Date(Date.now() - 5400000),
    isSolved: false,
  },
];

function formatTimeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  
  if (hours < 1) return 'Il y a moins d\'1h';
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `Il y a ${days}j`;
}

function AuthorBadge({ badge }: { badge?: 'expert' | 'moderator' | 'contributor' }) {
  if (!badge) return null;

  const config = {
    expert: { label: 'Expert', className: 'bg-amber-500/20 text-amber-400' },
    moderator: { label: 'Mod', className: 'bg-blue-500/20 text-blue-400' },
    contributor: { label: 'Contributeur', className: 'bg-emerald-500/20 text-emerald-400' },
  };

  const { label, className } = config[badge];

  return (
    <Badge variant="outline" className={cn('text-xs ml-1', className)}>
      {label}
    </Badge>
  );
}

function TopicCard({ topic }: { topic: ForumTopic }) {
  return (
    <div className={cn(
      'p-4 rounded-lg border transition-all hover:bg-secondary/30 cursor-pointer',
      topic.isPinned && 'border-primary/30 bg-primary/5'
    )}>
      <div className="flex items-start gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            {topic.isPinned && (
              <Pin className="h-4 w-4 text-primary" />
            )}
            <h4 className="font-medium hover:text-primary transition-colors">
              {topic.title}
            </h4>
            {topic.isSolved && (
              <Badge variant="secondary" className="text-xs bg-emerald-500/20 text-emerald-400">
                Résolu
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1">
              {topic.author}
              <AuthorBadge badge={topic.authorBadge} />
            </span>
            <Badge variant="outline" className="text-xs">{topic.category}</Badge>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTimeAgo(topic.lastActivity)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4" />
            {topic.replies}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {topic.views}
          </span>
          <span className="flex items-center gap-1">
            <ThumbsUp className="h-4 w-4" />
            {topic.likes}
          </span>
        </div>
      </div>
    </div>
  );
}

export function ForumPreview() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <Card className="glass-card-elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Forum Communautaire
        </CardTitle>
        <CardDescription>
          Échangez avec la communauté System Compass
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search and Categories */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher dans le forum..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {FORUM_CATEGORIES.map(cat => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.label}
                <Badge variant="secondary" className="ml-2 text-xs">
                  {cat.count}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        {/* Topics Tabs */}
        <Tabs defaultValue="trending" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="trending" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Tendances
            </TabsTrigger>
            <TabsTrigger value="recent" className="gap-2">
              <Clock className="h-4 w-4" />
              Récents
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="trending" className="space-y-3">
            {TRENDING_TOPICS.map(topic => (
              <TopicCard key={topic.id} topic={topic} />
            ))}
          </TabsContent>
          
          <TabsContent value="recent" className="space-y-3">
            {RECENT_TOPICS.map(topic => (
              <TopicCard key={topic.id} topic={topic} />
            ))}
          </TabsContent>
        </Tabs>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-secondary/30 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">1,247</div>
            <div className="text-xs text-muted-foreground">Discussions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">8,432</div>
            <div className="text-xs text-muted-foreground">Réponses</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">3,156</div>
            <div className="text-xs text-muted-foreground">Membres</div>
          </div>
        </div>

        {/* Top Contributors */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Award className="h-4 w-4 text-primary" />
            Top contributeurs
          </h4>
          <div className="flex flex-wrap gap-2">
            {['ExpatExpert', 'FiscalPro', 'NomadePro', 'GlobalNomad', 'TaxAdvisor'].map((name, i) => (
              <Badge key={name} variant="secondary" className="gap-1">
                <span className="font-bold text-primary">#{i + 1}</span>
                {name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button className="flex-1 gap-2">
            <MessageSquare className="h-4 w-4" />
            Nouvelle discussion
          </Button>
          <Button variant="outline" className="gap-2">
            <ExternalLink className="h-4 w-4" />
            Forum complet
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
