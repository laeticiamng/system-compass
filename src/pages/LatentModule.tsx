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
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 pt-20 md:pt-24">
      {/* Hero Section */}
      <section className="py-8 md:py-12 border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Link to="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
              <ArrowLeft className="w-4 h-4" />
              {t('common.back', 'Retour')}
            </Link>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-xl bg-primary/20">
                <Eye className="w-8 h-8 text-primary" />
              </div>
              <div>
                <Badge variant="outline" className="mb-2 border-primary/30 text-primary">
                  <Layers className="w-3 h-3 mr-1" />
                  {t('latent.badge', 'Module Latent')}
                </Badge>
                <h1 className="font-display text-3xl md:text-4xl font-bold">
                  {t('latent.title', 'Zones Latentes')}
                </h1>
              </div>
            </div>
            
            <p className="text-lg text-muted-foreground mb-6">
              {t('latent.subtitle', 'Identifiez et surveillez les zones de votre vie qui sont en tension mais pas encore en crise. Un outil de prévention et de lucidité.')}
            </p>

            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 mb-8">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">{t('latent.disclaimer.title', 'Outil de réflexion personnelle')}</strong> — {t('latent.disclaimer.text', 'Ce module vous aide à cartographier vos zones de tension. Il ne remplace pas un accompagnement professionnel.')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Latent />
      </div>
    </div>
  );
}
