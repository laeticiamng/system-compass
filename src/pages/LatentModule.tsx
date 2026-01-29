import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowLeft, Eye, Layers, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Latent } from '@/components/latent/Latent';
import { useAuth } from '@/hooks/useAuth';

export default function LatentModule() {
  const { t } = useTranslation();
  useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 pt-20 md:pt-24 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-32 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-64 right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      
      {/* Hero Section */}
      <section className="py-8 md:py-12 border-b border-primary/10 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Link to="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              {t('common.back', 'Retour')}
            </Link>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/20 glow-gold">
                <Eye className="w-8 h-8 text-primary" />
              </div>
              <div>
                <Badge variant="outline" className="mb-2 border-primary/30 text-primary bg-primary/5">
                  <Layers className="w-3 h-3 mr-1" />
                  {t('latent.badge', 'Module Latent')}
                </Badge>
                <h1 className="font-display text-3xl md:text-4xl font-bold gold-text">
                  {t('latent.title', 'Zones Latentes')}
                </h1>
              </div>
            </div>
            
            <p className="text-lg text-muted-foreground mb-6">
              {t('latent.subtitle', 'Identifiez et surveillez les zones de votre vie qui sont en tension mais pas encore en crise. Un outil de prévention et de lucidité.')}
            </p>

            <div className="glass-card p-4 rounded-xl border-primary/10 mb-8">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <AlertTriangle className="w-5 h-5 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">
                  <strong className="text-primary">{t('latent.disclaimer.title', 'Outil de réflexion personnelle')}</strong> — {t('latent.disclaimer.text', 'Ce module vous aide à cartographier vos zones de tension. Il ne remplace pas un accompagnement professionnel.')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 relative">
        <Latent />
      </div>
    </div>
  );
}
