/**
 * EconomicNews - Section actualités économiques inspirée Coface
 * Analyses régulières et alertes risques pays
 */
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  Newspaper, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Calendar,
  ArrowRight,
  Globe,
  Shield
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LocalizedLink as Link } from '@/components/i18n';
import { cn } from '@/lib/utils';

interface NewsItem {
  id: string;
  date: string;
  category: 'risk_update' | 'economic_analysis' | 'expert_advice' | 'alert';
  titleKey: string;
  summaryKey: string;
  countries?: string[];
  trend?: 'up' | 'down' | 'stable';
  severity?: 'info' | 'warning' | 'critical';
}

// Static news data (in production would come from API/CMS)
const newsItems: NewsItem[] = [
  {
    id: 'news-1',
    date: '2026-01-28',
    category: 'risk_update',
    titleKey: 'news.riskUpdate2026',
    summaryKey: 'news.riskUpdate2026Summary',
    countries: ['argentina', 'turkey', 'egypt'],
    trend: 'down',
    severity: 'warning'
  },
  {
    id: 'news-2',
    date: '2026-01-25',
    category: 'economic_analysis',
    titleKey: 'news.euAnalysis',
    summaryKey: 'news.euAnalysisSummary',
    countries: ['germany', 'france', 'netherlands'],
    trend: 'stable',
    severity: 'info'
  },
  {
    id: 'news-3',
    date: '2026-01-20',
    category: 'expert_advice',
    titleKey: 'news.expatTrends',
    summaryKey: 'news.expatTrendsSummary',
    countries: ['portugal', 'uae', 'thailand'],
    trend: 'up',
    severity: 'info'
  },
  {
    id: 'news-4',
    date: '2026-01-15',
    category: 'alert',
    titleKey: 'news.visaChanges',
    summaryKey: 'news.visaChangesSummary',
    countries: ['uk', 'australia'],
    severity: 'critical'
  }
];

const categoryConfig = {
  risk_update: { icon: AlertTriangle, color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
  economic_analysis: { icon: TrendingUp, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  expert_advice: { icon: Shield, color: 'text-primary', bgColor: 'bg-primary/10' },
  alert: { icon: AlertTriangle, color: 'text-destructive', bgColor: 'bg-destructive/10' }
};

export function EconomicNews() {
  const { t } = useTranslation();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    }).format(date);
  };

  const getCategoryLabel = (category: NewsItem['category']) => {
    switch (category) {
      case 'risk_update': return t('news.categoryRisk', 'Mise à jour risques');
      case 'economic_analysis': return t('news.categoryEconomic', 'Analyse économique');
      case 'expert_advice': return t('news.categoryExpert', 'Conseils experts');
      case 'alert': return t('news.categoryAlert', 'Alerte');
    }
  };

  const getSeverityBadge = (severity?: NewsItem['severity']) => {
    if (!severity) return null;
    const styles = {
      info: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      warning: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      critical: 'bg-destructive/10 text-destructive border-destructive/20'
    };
    return styles[severity];
  };

  return (
    <section className="py-24 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Newspaper className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-medium">
              {t('news.badge', 'Actualités économiques')}
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            {t('news.title', 'Risques pays & analyses')}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t('news.subtitle', 'Restez informé des évolutions économiques et des risques pays qui impactent vos décisions.')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {newsItems.map((news, index) => {
            const config = categoryConfig[news.category];
            const IconComponent = config.icon;
            
            return (
              <motion.div
                key={news.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:border-primary/30 transition-colors group cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium",
                        config.bgColor, config.color
                      )}>
                        <IconComponent className="w-3 h-3" />
                        {getCategoryLabel(news.category)}
                      </div>
                      {news.trend && (
                        <div className={cn(
                          "p-1 rounded-full",
                          news.trend === 'up' ? 'bg-emerald-500/10' : 
                          news.trend === 'down' ? 'bg-destructive/10' : 'bg-muted'
                        )}>
                          {news.trend === 'up' ? (
                            <TrendingUp className="w-3 h-3 text-emerald-500" />
                          ) : news.trend === 'down' ? (
                            <TrendingDown className="w-3 h-3 text-destructive" />
                          ) : null}
                        </div>
                      )}
                    </div>
                    <CardTitle className="text-base font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                      {t(news.titleKey, news.titleKey)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      {t(news.summaryKey, news.summaryKey)}
                    </p>
                    
                    {news.countries && news.countries.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {news.countries.slice(0, 3).map(country => (
                          <Badge key={country} variant="outline" className="text-xs capitalize">
                            {country}
                          </Badge>
                        ))}
                        {news.countries.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{news.countries.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(news.date)}
                      </div>
                      {news.severity && (
                        <Badge variant="outline" className={cn("text-xs", getSeverityBadge(news.severity))}>
                          {news.severity === 'critical' ? t('news.critical', 'Critique') :
                           news.severity === 'warning' ? t('news.warning', 'Attention') :
                           t('news.info', 'Info')}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button
            variant="outline"
            size="lg"
            className="rounded-full gap-2"
            asChild
          >
            <Link to="/countries">
              <Globe className="w-4 h-4" />
              {t('news.viewAllCountries', 'Voir tous les pays analysés')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
