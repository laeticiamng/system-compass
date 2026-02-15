import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  ArrowLeft,
  User,
  Calendar,
  Share2,
  Check,
  AlertTriangle,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getArticleBySlug, getRelatedArticles, BLOG_CATEGORIES } from '@/lib/blog-data';
import { BlogPostingJsonLd } from '@/components/seo/JsonLd';

export default function BlogArticle() {
  useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const [linkCopied, setLinkCopied] = useState(false);

  const article = useMemo(() => {
    if (!slug) return undefined;
    return getArticleBySlug(slug);
  }, [slug]);

  const relatedArticles = useMemo(() => {
    if (!article) return [];
    return getRelatedArticles(article, 3);
  }, [article]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  const isLegalOrFiscal = article?.category === 'fiscal' || article?.category === 'legal';

  // 404 state
  if (!article) {
    return (
      <>
        <Helmet>
          <title>Article non trouvé - System Compass</title>
        </Helmet>
        <div className="min-h-screen pt-20 sm:pt-24 pb-12 sm:pb-16">
          <div className="container mx-auto px-3 sm:px-4 text-center py-16">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
            <h1 className="font-display text-2xl sm:text-3xl font-bold mb-4">
              Article non trouvé
            </h1>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              L'article que vous recherchez n'existe pas ou a été déplacé.
            </p>
            <Button asChild>
              <Link to="/blog">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour au blog
              </Link>
            </Button>
          </div>
        </div>
      </>
    );
  }

  // Split content into paragraphs for rendering
  const paragraphs = article.content.split('\n\n').filter(p => p.trim().length > 0);

  return (
    <>
      <Helmet>
        <title>{article.title} - Blog System Compass</title>
        <meta name="description" content={article.excerpt} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://system-compass.app/blog/${article.slug}`} />
        <meta property="article:published_time" content={article.publishedAt} />
        <meta property="article:author" content={article.author} />
        <meta property="article:section" content={BLOG_CATEGORIES[article.category].label} />
        {article.tags.map(tag => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={article.excerpt} />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href={`https://system-compass.app/blog/${article.slug}`} />
      </Helmet>

      <BlogPostingJsonLd
        title={article.title}
        description={article.excerpt}
        datePublished={article.publishedAt}
        author={article.author}
        url={`https://system-compass.app/blog/${article.slug}`}
      />

      <div className="min-h-screen pt-20 sm:pt-24 pb-12 sm:pb-16">
        <div className="container mx-auto px-3 sm:px-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6 sm:mb-8">
            <Link to="/" className="hover:text-foreground transition-colors">
              Accueil
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/blog" className="hover:text-foreground transition-colors">
              Blog
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-none">
              {article.title}
            </span>
          </nav>

          <div className="max-w-4xl mx-auto">
            {/* Article Header */}
            <header className="mb-8 sm:mb-10">
              <div className="flex items-center gap-2 mb-4">
                <Badge
                  variant="outline"
                  className={cn('text-xs', BLOG_CATEGORIES[article.category].color)}
                >
                  {BLOG_CATEGORIES[article.category].label}
                </Badge>
                {article.featured && (
                  <Badge className="text-xs bg-primary/10 text-primary border-primary/30" variant="outline">
                    A la une
                  </Badge>
                )}
              </div>

              <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 leading-tight">
                {article.title}
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground mb-6">
                {article.excerpt}
              </p>

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-muted-foreground pb-6 border-b border-border/50">
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  {article.author}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {formatDate(article.publishedAt)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {article.readTime} min de lecture
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto text-muted-foreground hover:text-foreground"
                  onClick={handleCopyLink}
                >
                  {linkCopied ? (
                    <>
                      <Check className="w-4 h-4 mr-1.5 text-emerald-500" />
                      <span className="text-emerald-500">Lien copié</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4 mr-1.5" />
                      Partager
                    </>
                  )}
                </Button>
              </div>
            </header>

            {/* Legal/Fiscal Disclaimer Banner */}
            {isLegalOrFiscal && (
              <Card className="border-l-4 border-amber-500 mb-8">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-sm mb-1">Avertissement important</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Les informations contenues dans cet article sont fournies à titre informatif
                        et éducatif uniquement. Elles ne constituent en aucun cas un conseil{' '}
                        {article.category === 'fiscal' ? 'fiscal' : 'juridique'} personnalisé.
                        Consultez un professionnel qualifié avant toute décision.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Article Content */}
            <article className="prose prose-lg dark:prose-invert max-w-none mb-10 sm:mb-14">
              {paragraphs.map((paragraph, index) => {
                // Check if paragraph starts with "Avertissement" to style it differently
                if (paragraph.trim().startsWith('Avertissement')) {
                  return (
                    <div
                      key={index}
                      className="my-6 p-4 sm:p-5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-sm sm:text-base text-muted-foreground"
                    >
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-1" />
                        <p className="m-0 leading-relaxed">{paragraph}</p>
                      </div>
                    </div>
                  );
                }

                return (
                  <p
                    key={index}
                    className="text-sm sm:text-base leading-relaxed text-foreground/90 mb-5 sm:mb-6"
                  >
                    {paragraph}
                  </p>
                );
              })}
            </article>

            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2 mb-10 sm:mb-14 pb-8 border-b border-border/50">
              <span className="text-sm text-muted-foreground mr-1">Tags :</span>
              {article.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Share Section */}
            <div className="flex items-center justify-between mb-10 sm:mb-14">
              <Button variant="outline" asChild>
                <Link to="/blog">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour au blog
                </Link>
              </Button>
              <Button variant="outline" onClick={handleCopyLink}>
                {linkCopied ? (
                  <>
                    <Check className="w-4 h-4 mr-2 text-emerald-500" />
                    Lien copié !
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 mr-2" />
                    Copier le lien
                  </>
                )}
              </Button>
            </div>

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
              <section>
                <h2 className="font-display text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Articles similaires
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {relatedArticles.map((related) => (
                    <Link
                      key={related.id}
                      to={`/blog/${related.slug}`}
                      className="group block"
                    >
                      <Card className="glass-card h-full hover:border-primary/30 transition-all duration-300 hover:shadow-[0_0_30px_hsl(var(--primary)/0.1)]">
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge
                              variant="outline"
                              className={cn('text-xs', BLOG_CATEGORIES[related.category].color)}
                            >
                              {BLOG_CATEGORIES[related.category].label}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {related.readTime} min
                            </span>
                          </div>
                          <CardTitle className="text-base sm:text-lg group-hover:text-primary transition-colors leading-tight">
                            {related.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {related.excerpt}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {formatDate(related.publishedAt)}
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
          </div>
        </div>
      </div>
    </>
  );
}
