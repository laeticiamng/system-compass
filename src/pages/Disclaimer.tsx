import { Helmet } from 'react-helmet-async';
import { LocalizedLink as Link } from '@/components/i18n';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft, 
  AlertTriangle, 
  Scale, 
  FileWarning, 
  Heart,
  Shield,
  Info,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function Disclaimer() {
  const { t } = useTranslation();

  return (
    <main className="min-h-screen bg-background pt-24 pb-16">
      <Helmet>
        <title>Avertissements & Limites - System Compass</title>
        <meta name="description" content="Avertissements légaux de System Compass : outil éducatif d'analyse des systèmes de pays. Simulation ≠ prédiction. Ne constitue pas un conseil professionnel." />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Avertissements & Limites - System Compass" />
        <meta property="og:description" content="Ce que System Compass est — et ce qu'il n'est pas. Outil éducatif, pas de conseil professionnel." />
        <meta property="og:image" content="https://system-compass.app/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Avertissements & Limites - System Compass" />
        <meta name="twitter:description" content="Ce que System Compass est — et ce qu'il n'est pas. Outil éducatif, pas de conseil professionnel." />
        <meta name="twitter:image" content="https://system-compass.app/og-image.png" />
      </Helmet>
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('common.backHome', 'Retour à l\'accueil')}
          </Link>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-xl bg-amber-500/20">
              <Scale className="w-8 h-8 text-amber-500" />
            </div>
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold">
                {t('disclaimer.title', 'Avertissements & Limites')}
              </h1>
              <p className="text-muted-foreground">
                {t('disclaimer.subtitle', 'Ce que cet outil est — et ce qu\'il n\'est pas')}
              </p>
            </div>
          </div>
        </div>

        {/* TL;DR Summary */}
        <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
          <CardContent className="p-6">
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              En résumé
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-background/60">
                <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Outil éducatif</p>
                  <p className="text-xs text-muted-foreground">Un simulateur pour réfléchir, pas un conseiller.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-background/60">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Pas de conseil pro</p>
                  <p className="text-xs text-muted-foreground">Consultez des experts pour toute décision importante.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-background/60">
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Vous décidez</p>
                  <p className="text-xs text-muted-foreground">Vous êtes seul(e) responsable de vos choix.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Nature de l'outil */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Info className="w-5 h-5 text-primary" />
                Nature de l'outil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                <strong className="text-foreground">System Compass</strong> est un <strong className="text-foreground">outil d'analyse et de simulation</strong> conçu pour aider à comprendre les systèmes socio-économiques de différents pays et explorer des trajectoires de vie hypothétiques.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
                  <h4 className="font-semibold text-green-600 flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4" />
                    Ce que c'est
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Un outil éducatif et informatif</li>
                    <li>• Un simulateur de scénarios hypothétiques</li>
                    <li>• Un agrégateur de données publiques</li>
                    <li>• Un support à la réflexion personnelle</li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                  <h4 className="font-semibold text-red-600 flex items-center gap-2 mb-2">
                    <XCircle className="w-4 h-4" />
                    Ce que ce n'est PAS
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Un cabinet de conseil</li>
                    <li>• Un service juridique ou fiscal</li>
                    <li>• Un conseiller en immigration</li>
                    <li>• Une source de vérité absolue</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Simulation ≠ Prédiction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Simulation ≠ Prédiction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Les simulations et analyses présentées sont basées sur des <strong className="text-foreground">modèles simplifiés</strong> de la réalité. Elles ne prédisent pas l'avenir et ne garantissent aucun résultat.
              </p>
              <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-amber-600">Important :</strong> Les conditions réelles varient selon les situations individuelles, les changements législatifs, les contextes économiques et de nombreux facteurs imprévisibles. Toute simulation doit être considérée comme un <strong>point de départ pour la réflexion</strong>, jamais comme un plan d'action définitif.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 mt-4">
                <p className="text-sm font-medium text-foreground mb-2">Formulations utilisées dans l'outil :</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <em>"tend à favoriser"</em> — pas "garantit"</li>
                  <li>• <em>"implique souvent"</em> — pas "toujours"</li>
                  <li>• <em>"risques fréquents"</em> — pas "certains"</li>
                  <li>• <em>"dépend de ton contexte réel"</em> — pas de vérité universelle</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Pas de conseil professionnel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <FileWarning className="w-5 h-5 text-red-500" />
                Absence de conseil professionnel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 mb-4">
                <p className="text-sm font-semibold text-red-600 mb-2">⚠️ Avertissement essentiel</p>
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Aucun résultat affiché n'est un diagnostic, une recommandation, ni un avis professionnel.</strong> Cet outil ne remplace aucun conseil spécialisé (juridique, fiscal, médical, ou autre).
                </p>
              </div>
              <p className="text-muted-foreground">
                Cet outil <strong className="text-foreground">ne fournit aucun conseil</strong> de nature :
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <span className="text-2xl mb-2 block">⚖️</span>
                  <p className="font-medium">Juridique</p>
                  <p className="text-xs text-muted-foreground">Droit, contrats, immigration</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <span className="text-2xl mb-2 block">💰</span>
                  <p className="font-medium">Financier / Fiscal</p>
                  <p className="text-xs text-muted-foreground">Impôts, investissements, patrimoine</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <span className="text-2xl mb-2 block">🏥</span>
                  <p className="font-medium">Médical</p>
                  <p className="text-xs text-muted-foreground">Santé, bien-être, diagnostic</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Pour toute décision importante, consultez <strong className="text-foreground">des professionnels qualifiés</strong> (avocats, experts-comptables, conseillers en immigration, médecins, etc.) dans les juridictions concernées.
              </p>
            </CardContent>
          </Card>

          {/* Responsabilité utilisateur */}
          <Card className="border-foreground/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-foreground" />
                Responsabilité de l'utilisateur
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                En utilisant cet outil, vous reconnaissez et acceptez que :
              </p>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="text-primary">1.</span>
                  <span>Vous êtes <strong className="text-foreground">seul(e) responsable</strong> de vos décisions et de leurs conséquences.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary">2.</span>
                  <span>Les informations présentées peuvent être <strong className="text-foreground">incomplètes ou obsolètes</strong>.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary">3.</span>
                  <span>Vous devez <strong className="text-foreground">vérifier toute information</strong> auprès de sources officielles avant d'agir.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary">4.</span>
                  <span>Les créateurs de cet outil <strong className="text-foreground">déclinent toute responsabilité</strong> quant aux résultats de vos décisions.</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Données et sources */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Info className="w-5 h-5 text-blue-500" />
                Données et sources
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Les données présentées proviennent de sources publiques et sont fournies <strong className="text-foreground">à titre indicatif uniquement</strong>. Elles peuvent :
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Contenir des erreurs ou approximations</li>
                <li>• Être datées ou ne plus refléter la réalité actuelle</li>
                <li>• Varier selon les régions ou situations spécifiques</li>
                <li>• Ne pas couvrir tous les cas particuliers</li>
              </ul>
            </CardContent>
          </Card>

          <Separator />

          {/* Link to How to Read */}
          <div className="glass-card rounded-xl p-6 text-center">
            <Info className="w-8 h-8 text-primary mx-auto mb-4" />
            <p className="text-lg font-medium text-foreground mb-2">
              Besoin de plus de contexte ?
            </p>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-4">
              Découvrez comment interpréter correctement les résultats de simulation avec des exemples concrets.
            </p>
            <Link 
              to="/how-to-read"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium"
            >
              Comment lire les résultats
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </Link>
          </div>

          <Separator />

          {/* Final statement */}
          <div className="text-center py-8">
            <Heart className="w-8 h-8 text-primary mx-auto mb-4" />
            <p className="text-lg font-medium text-foreground mb-2">
              Notre mission
            </p>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Nous croyons que la connaissance des systèmes aide à faire de meilleurs choix. Cet outil existe pour <strong className="text-foreground">éclairer, pas pour décider à votre place</strong>. Utilisez-le comme un compas, pas comme une carte définitive.
            </p>
          </div>

          {/* Last update */}
          <p className="text-center text-xs text-muted-foreground">
            Dernière mise à jour : Janvier 2026
          </p>
        </div>
      </div>
    </main>
  );
}
