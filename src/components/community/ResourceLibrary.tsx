import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, Video, Download, ExternalLink, Search,
  BookOpen, FileCheck, Globe, Users, Star
} from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'guide' | 'template' | 'video' | 'checklist' | 'tool';
  category: string;
  countries?: string[];
  downloadUrl?: string;
  externalUrl?: string;
  rating: number;
  downloads: number;
  updatedAt: Date;
  isPremium: boolean;
}

const RESOURCES: Resource[] = [
  {
    id: '1',
    title: 'Guide complet visa D7 Portugal',
    description: 'Toutes les étapes pour obtenir votre visa de résident au Portugal, avec modèles de documents.',
    type: 'guide',
    category: 'Visa',
    countries: ['Portugal'],
    downloadUrl: '#',
    rating: 4.8,
    downloads: 2340,
    updatedAt: new Date(2026, 0, 15),
    isPremium: false,
  },
  {
    id: '2',
    title: 'Checklist déménagement international',
    description: 'Liste de contrôle exhaustive pour ne rien oublier avant, pendant et après votre déménagement.',
    type: 'checklist',
    category: 'Déménagement',
    downloadUrl: '#',
    rating: 4.9,
    downloads: 5621,
    updatedAt: new Date(2026, 1, 1),
    isPremium: false,
  },
  {
    id: '3',
    title: 'Modèle business plan expat',
    description: 'Template Excel pour planifier votre budget d\'expatriation sur 12 mois.',
    type: 'template',
    category: 'Finance',
    downloadUrl: '#',
    rating: 4.6,
    downloads: 1892,
    updatedAt: new Date(2025, 11, 20),
    isPremium: true,
  },
  {
    id: '4',
    title: 'Webinaire: Fiscalité des nomades digitaux',
    description: 'Replay du webinaire avec expert-comptable spécialisé en fiscalité internationale.',
    type: 'video',
    category: 'Fiscalité',
    externalUrl: '#',
    rating: 4.7,
    downloads: 890,
    updatedAt: new Date(2025, 10, 8),
    isPremium: true,
  },
  {
    id: '5',
    title: 'Comparateur assurances expatriés',
    description: 'Outil interactif pour comparer les offres d\'assurance santé internationale.',
    type: 'tool',
    category: 'Assurance',
    externalUrl: '#',
    rating: 4.5,
    downloads: 3210,
    updatedAt: new Date(2026, 0, 28),
    isPremium: false,
  },
  {
    id: '6',
    title: 'Guide ouverture compte bancaire UAE',
    description: 'Procédure détaillée pour ouvrir un compte aux Émirats, banques recommandées.',
    type: 'guide',
    category: 'Banque',
    countries: ['UAE'],
    downloadUrl: '#',
    rating: 4.4,
    downloads: 756,
    updatedAt: new Date(2025, 9, 15),
    isPremium: false,
  },
];

const TYPE_ICONS = {
  guide: <BookOpen className="h-4 w-4" />,
  template: <FileText className="h-4 w-4" />,
  video: <Video className="h-4 w-4" />,
  checklist: <FileCheck className="h-4 w-4" />,
  tool: <Globe className="h-4 w-4" />,
};

const TYPE_LABELS = {
  guide: 'Guide',
  template: 'Modèle',
  video: 'Vidéo',
  checklist: 'Checklist',
  tool: 'Outil',
};

export function ResourceLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = ['all', ...new Set(RESOURCES.map(r => r.category))];

  const filteredResources = RESOURCES.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || resource.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Bibliothèque de Ressources
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une ressource..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Categories */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="flex flex-wrap h-auto gap-1">
            {categories.map(cat => (
              <TabsTrigger key={cat} value={cat} className="text-xs">
                {cat === 'all' ? 'Tous' : cat}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Resources Grid */}
        <div className="grid gap-3 md:grid-cols-2">
          {filteredResources.map(resource => (
            <div
              key={resource.id}
              className="p-4 border rounded-lg hover:border-primary/50 transition-colors group"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                  {TYPE_ICONS[resource.type]}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
                        {resource.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="secondary" className="text-xs">
                          {TYPE_LABELS[resource.type]}
                        </Badge>
                        {resource.isPremium && (
                          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-xs">
                            Premium
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                    {resource.description}
                  </p>

                  {resource.countries && (
                    <div className="flex gap-1 mt-2">
                      {resource.countries.map(country => (
                        <Badge key={country} variant="outline" className="text-xs">
                          {country}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-3 pt-2 border-t">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        {resource.rating}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {resource.downloads.toLocaleString()}
                      </span>
                    </div>

                    {resource.downloadUrl ? (
                      <Button size="sm" variant="ghost" className="h-7">
                        <Download className="h-3 w-3 mr-1" />
                        Télécharger
                      </Button>
                    ) : (
                      <Button size="sm" variant="ghost" className="h-7">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Accéder
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredResources.length === 0 && (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              Aucune ressource trouvée pour cette recherche
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
