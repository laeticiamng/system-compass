import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowLeft, Lock, AlertTriangle, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Irreversa } from '@/components/irreversa/Irreversa';
import { useAuth } from '@/hooks/useAuth';

export default function IrreversaModule() {
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
              <div className="p-3 rounded-xl bg-destructive/20">
                <Lock className="w-8 h-8 text-destructive" />
              </div>
              <div>
                <Badge variant="outline" className="mb-2 border-destructive/30 text-destructive">
                  <Shield className="w-3 h-3 mr-1" />
                  {t('irreversa.badge', 'Module Irreversa')}
                </Badge>
                <h1 className="font-display text-3xl md:text-4xl font-bold">
                  {t('irreversa.title', 'Seuils Irréversibles')}
                </h1>
              </div>
            </div>
            
            <p className="text-lg text-muted-foreground mb-6">
              {t('irreversa.subtitle', 'Documentez et scelllez les moments où une situation devient irréversible. Un outil de traçabilité et de clarté pour les décisions majeures.')}
            </p>

            <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20 mb-8">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">{t('irreversa.disclaimer.title', 'Outil de documentation')}</strong> — {t('irreversa.disclaimer.text', 'Ce module vous aide à documenter les seuils franchis. Il a une valeur de clarification personnelle, pas légale.')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Irreversa />
      </div>
    </div>
  );
}
