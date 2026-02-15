import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, Tag, ArrowRight, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { blogArticles, getFeaturedArticles, BLOG_CATEGORIES, type BlogArticle } from '@/lib/blog-data';

type CategoryFilter = BlogArticle['category'] | 'all';

export default function Blog() {
  const { } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');

  const featuredArticles = useMemo(() => getFeaturedArticles(), []);

  const filteredArticles = useMemo(() => {
    let results = blogArticles;

    if (activeCategory !== 'all') {
      results = results.filter(article => article.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      results = results.filter(article =>
        article.title.toLowerCase().includes(query) ||
        article.excerpt.toLowerCase().includes(query) ||
        article.tags.some(tag => tag.toLowerCase().includes(query)) ||
        article.category.toLowerCase().includes(query)
      );
    }

    return results;
  }, [searchQuery, activeCategory]);

  const nonFeaturedArticles = useMemo(() => {
    if (activeCategory !== 'all' || searchQuery.trim()) {
      return filteredArticles;
    }
    return filteredArticles.filter(article => !article.featured);
  }, [filteredArticles, activeCategory, searchQuery]);

  const showFeatured = activeCategory === 'all' && !searchQuery.trim();

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const categories: { key: CategoryFilter; label: string }[] = [
    { key: 'all', label: 'Tous les articles' },
    { key: 'guide', label: BLOG_CATEGORIES.guide.label },
    { key: 'fiscal', label: BLOG_CATEGORIES.fiscal.label },
    { key: 'lifestyle', label: BLOG_CATEGORIES.lifestyle.label },
    { key: 'legal', label: BLOG_CATEGORIES.legal.label },
    { key: 'country', label: BLOG_CATEGORIES.country.label },
    { key: 'digital-nomad', label: BLOG_CATEGORIES['digital-nomad'].label },
  ];

  return (
    <>
      <Helmet>
        <title>Blog Expatriation - System Compass | Guides et conseils pour expatriés</title>
        <meta name="description" content="Guides complets, conseils pratiques et analyses sur l'expatriation : fiscalité, démarches, destinations, digital nomad, famille et bien plus." />
        <meta property="og:title" content="Blog Expatriation - System Compass" />
        <meta property="og:description" content="Guides complets, conseils pratiques et analyses sur l'expatriation : fiscalité, démarches, destinations, digital nomad." />
        <meta property="og:type" content="website" />
        <meta name="twitter:title" content="Blog Expatriation - System Compass" />
        <meta name="twitter:description" content="Guides complets et analyses sur l'expatriation pour vous accompagner dans votre projet." />
        <link rel="canonical" href="https://system-compass.app/blog" />
      </Helmet>

      <div className="min-h-screen pt-20 sm:pt-24 pb-12 sm:pb-16">
        <div className="container mx-auto px-3 sm:px-4">
          {/* Header */}
          <div className="max-w-3xl mb-8 sm:mb-12">
            <Badge className="mb-3 sm:mb-4 px-2 sm:px-3 py-1 text-xs sm:text-sm" variant="outline">
              <BookOpen className="w-3 h-3 mr-1 sm:mr-2" />
              Blog Expatriation
            </Badge>
            <h1 className="font-display text-2xl sm:text-4xl font-bold mb-3 sm:mb-4 gold-text">
              Guides et conseils pour votre expatriation
            </h1>
            <p className="text-sm sm:text-lg text-muted-foreground">
              Des articles approfondis pour vous accompagner dans chaque étape de votre projet d'expatriation. Fiscalité, démarches, destinations et mode de vie.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-xl mb-6 sm:mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Rechercher un article, un sujet..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 h-12 rounded-full bg-background border border-border/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20 text-sm sm:text-base transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-sm"
                >
                  Effacer
                </button>
              )}
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 mb-8 sm:mb-10">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={cn(
                  'px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all border',
                  activeCategory === cat.key
                    ? 'bg-primary/10 text-primary border-primary/30'
                    : 'bg-background text-muted-foreground hover:text-foreground border-border/50 hover:border-border'
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Results count */}
          <div className="text-sm text-muted-foreground mb-6">
            <span className="font-medium text-foreground">{filteredArticles.length}</span>{' '}
            {filteredArticles.length > 1 ? 'articles trouvés' : 'article trouvé'}
          </div>

          {/* Featured Articles */}
          {showFeatured && featuredArticles.length > 0 && (
            <section className="mb-10 sm:mb-14">
              <h2 className="font-display text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
                <Tag className="w-5 h-5 text-primary" />
                Articles à la une
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {featuredArticles.map((article, index) => (
                  <Link
                    key={article.id}
                    to={`/blog/${article.slug}`}
                    className={cn(
                      'group block',
                      index === 0 && 'lg:col-span-2 lg:row-span-2'
                    )}
                  >
                    <Card className={cn(
                      'glass-card h-full hover:border-primary/30 transition-all duration-300 hover:shadow-[0_0_30px_hsl(var(--primary)/0.1)]',
                      index === 0 && 'lg:min-h-[400px]'
                    )}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant="outline"
                            className={cn('text-xs', BLOG_CATEGORIES[article.category].color)}
                          >
                            {BLOG_CATEGORIES[article.category].label}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {article.readTime} min
                          </span>
                        </div>
                        <CardTitle className={cn(
                          'group-hover:text-primary transition-colors leading-tight',
                          index === 0 ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg'
                        )}>
                          {article.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className={cn(
                          'text-muted-foreground mb-4',
                          index === 0 ? 'text-sm sm:text-base' : 'text-sm line-clamp-2'
                        )}>
                          {article.excerpt}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {formatDate(article.publishedAt)}
                          </span>
                          <span className="text-primary text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                            Lire
                            <ArrowRight className="w-4 h-4" />
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* All Articles Grid */}
          <section>
            {!showFeatured && searchQuery.trim() && filteredArticles.length === 0 && (
              <div className="text-center py-16">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-display text-lg font-semibold mb-2">Aucun article trouvé</h3>
                <p className="text-muted-foreground mb-4">
                  Aucun article ne correspond à votre recherche "{searchQuery}".
                </p>
                <Button variant="outline" onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}>
                  Voir tous les articles
                </Button>
              </div>
            )}

            {nonFeaturedArticles.length > 0 && (
              <>
                {showFeatured && (
                  <h2 className="font-display text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Tous les articles
                  </h2>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {nonFeaturedArticles.map((article) => (
                    <Link
                      key={article.id}
                      to={`/blog/${article.slug}`}
                      className="group block"
                    >
                      <Card className="glass-card h-full hover:border-primary/30 transition-all duration-300 hover:shadow-[0_0_30px_hsl(var(--primary)/0.1)]">
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge
                              variant="outline"
                              className={cn('text-xs', BLOG_CATEGORIES[article.category].color)}
                            >
                              {BLOG_CATEGORIES[article.category].label}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {article.readTime} min
                            </span>
                          </div>
                          <CardTitle className="text-base sm:text-lg group-hover:text-primary transition-colors leading-tight">
                            {article.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                            {article.excerpt}
                          </p>
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {article.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {formatDate(article.publishedAt)}
                            </span>
                            <span className="text-primary text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                              Lire
                              <ArrowRight className="w-4 h-4" />
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
