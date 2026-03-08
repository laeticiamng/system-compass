/**
 * Privacy Policy - Politique de Confidentialité RGPD
 * Dedicated routable page for GDPR compliance
 * EmotionsCare SASU - Compass
 */

import { ArrowLeft, Shield, Eye, Database, Lock, UserCheck, Globe, Bell, Trash2, FileText } from 'lucide-react';
import { LocalizedLink as Link } from '@/components/i18n';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { SITE_CONFIG } from '@/config/site';
import { Button } from '@/components/ui/button';

export default function Privacy() {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t('privacy.meta.title', 'Politique de Confidentialité — Compass')}</title>
        <meta name="description" content={t('privacy.meta.description', 'Politique de confidentialité RGPD de Compass. Découvrez comment nous protégeons vos données personnelles.')} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Politique de Confidentialité — Compass" />
        <meta property="og:description" content="Politique de confidentialité RGPD de Compass. Protection des données personnelles." />
        <meta property="og:image" content={SITE_CONFIG.ogImageUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Politique de Confidentialité — Compass" />
        <meta name="twitter:description" content="Politique de confidentialité RGPD de Compass. Protection des données personnelles." />
        <meta name="twitter:image" content={SITE_CONFIG.ogImageUrl} />
      </Helmet>

      <div className="min-h-screen bg-background pt-20 sm:pt-24">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <Button variant="ghost" asChild className="mb-4">
              <Link to="/" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                {t('common.backHome', "Retour à l'accueil")}
              </Link>
            </Button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold">
                  {t('privacy.title', 'Politique de Confidentialité')}
                </h1>
                <p className="text-muted-foreground">
                  {t('privacy.subtitle', 'Dernière mise à jour : février 2026')}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 mb-6">
              <p className="text-sm">
                {t('privacy.intro', "Chez Compass (édité par EmotionsCare SASU), la protection de vos données personnelles est une priorité. Cette politique explique comment nous collectons, utilisons et protégeons vos informations conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés.")}
              </p>
            </div>
          </div>

          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
            {/* Responsable du traitement */}
            <section className="p-6 rounded-xl bg-card border border-border/50">
              <h2 className="flex items-center gap-2 text-xl font-semibold mb-4">
                <UserCheck className="w-5 h-5 text-primary" />
                {t('privacy.controller.title', 'Responsable du Traitement')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/30">
                  <p className="text-sm text-muted-foreground mb-1">{t('privacy.controller.company', 'Raison sociale')}</p>
                  <p className="font-semibold">EmotionsCare SASU</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30">
                  <p className="text-sm text-muted-foreground mb-1">SIRET</p>
                  <p className="font-semibold font-mono">944 505 445 00014</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30">
                  <p className="text-sm text-muted-foreground mb-1">{t('privacy.controller.location', 'Siège social')}</p>
                  <p className="font-semibold">Amiens, France</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30">
                  <p className="text-sm text-muted-foreground mb-1">{t('privacy.controller.contact', 'Contact DPO')}</p>
                  <p className="font-semibold">
                    <a href="mailto:privacy@pyramidcompass.com" className="text-primary hover:underline">
                      privacy@pyramidcompass.com
                    </a>
                  </p>
                </div>
              </div>
            </section>

            {/* Données collectées */}
            <section className="p-6 rounded-xl bg-card border border-border/50">
              <h2 className="flex items-center gap-2 text-xl font-semibold mb-4">
                <Database className="w-5 h-5 text-primary" />
                {t('privacy.data.title', 'Données Collectées')}
              </h2>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/30">
                  <h3 className="font-semibold mb-2">{t('privacy.data.account', 'Données de compte')}</h3>
                  <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
                    <li>{t('privacy.data.account.email', 'Adresse email (pour la création de compte)')}</li>
                    <li>{t('privacy.data.account.name', "Nom d'affichage (facultatif)")}</li>
                    <li>{t('privacy.data.account.password', 'Mot de passe (hashé, jamais stocké en clair)')}</li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg bg-muted/30">
                  <h3 className="font-semibold mb-2">{t('privacy.data.usage', "Données d'utilisation")}</h3>
                  <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
                    <li>{t('privacy.data.usage.preferences', 'Préférences de pays et résultats de tests (stockés localement)')}</li>
                    <li>{t('privacy.data.usage.progress', 'Progression de gamification (XP, badges, niveau)')}</li>
                    <li>{t('privacy.data.usage.saved', 'Pays sauvegardés et comparaisons')}</li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg bg-muted/30">
                  <h3 className="font-semibold mb-2">{t('privacy.data.analytics', 'Données analytiques')}</h3>
                  <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
                    <li>{t('privacy.data.analytics.plausible', 'Plausible.io : analytics privacy-first, sans cookies, sans données personnelles')}</li>
                    <li>{t('privacy.data.analytics.notracking', 'Aucun tracker tiers (pas de Google Analytics, pas de Facebook Pixel)')}</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Architecture local-first */}
            <section className="p-6 rounded-xl bg-card border border-border/50">
              <h2 className="flex items-center gap-2 text-xl font-semibold mb-4">
                <Lock className="w-5 h-5 text-primary" />
                {t('privacy.localFirst.title', 'Architecture Local-First')}
              </h2>
              <div className="space-y-4">
                <p>
                  {t('privacy.localFirst.desc', "Compass adopte une architecture local-first : vos données sont d'abord stockées sur votre appareil (localStorage du navigateur). Aucune donnée n'est envoyée à nos serveurs sans votre consentement explicite.")}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <h3 className="font-semibold mb-2 text-emerald-700 dark:text-emerald-400">{t('privacy.localFirst.guest', 'Mode invité (non connecté)')}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t('privacy.localFirst.guestDesc', "Toutes vos données restent sur votre appareil. Rien n'est transmis à nos serveurs. Vos résultats de tests, pays sauvegardés et préférences restent dans le stockage local de votre navigateur.")}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <h3 className="font-semibold mb-2 text-blue-700 dark:text-blue-400">{t('privacy.localFirst.auth', 'Mode connecté')}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t('privacy.localFirst.authDesc', "Si vous créez un compte, vos données peuvent être synchronisées avec notre cloud (Supabase, hébergé dans l'UE) pour un accès multi-appareils. Cette synchronisation est optionnelle.")}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Finalités du traitement */}
            <section className="p-6 rounded-xl bg-card border border-border/50">
              <h2 className="flex items-center gap-2 text-xl font-semibold mb-4">
                <Eye className="w-5 h-5 text-primary" />
                {t('privacy.purposes.title', 'Finalités du Traitement')}
              </h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-bold text-primary">1</span>
                  </div>
                  <div>
                    <p className="font-medium">{t('privacy.purposes.service', "Fourniture du service")}</p>
                    <p className="text-sm text-muted-foreground">{t('privacy.purposes.serviceDesc', "Permettre l'utilisation des outils d'analyse de pays, tests, simulateurs et recommandations personnalisées.")}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-bold text-primary">2</span>
                  </div>
                  <div>
                    <p className="font-medium">{t('privacy.purposes.account', 'Gestion de compte')}</p>
                    <p className="text-sm text-muted-foreground">{t('privacy.purposes.accountDesc', "Création, authentification et gestion de votre compte utilisateur et abonnement.")}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-bold text-primary">3</span>
                  </div>
                  <div>
                    <p className="font-medium">{t('privacy.purposes.improve', 'Amélioration du service')}</p>
                    <p className="text-sm text-muted-foreground">{t('privacy.purposes.improveDesc', "Analyse anonyme de l'utilisation via Plausible.io (privacy-first, sans cookies, conforme RGPD).")}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-bold text-primary">4</span>
                  </div>
                  <div>
                    <p className="font-medium">{t('privacy.purposes.communication', 'Communication')}</p>
                    <p className="text-sm text-muted-foreground">{t('privacy.purposes.communicationDesc', "Envoi de notifications de service et, avec votre consentement, de notre newsletter.")}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Base légale */}
            <section className="p-6 rounded-xl bg-card border border-border/50">
              <h2 className="flex items-center gap-2 text-xl font-semibold mb-4">
                <FileText className="w-5 h-5 text-primary" />
                {t('privacy.legal.title', 'Base Légale du Traitement')}
              </h2>
              <div className="space-y-3 text-sm">
                <p><strong>{t('privacy.legal.consent', 'Consentement')}</strong> {t('privacy.legal.consentDesc', ": création de compte, newsletter, synchronisation cloud.")}</p>
                <p><strong>{t('privacy.legal.contract', 'Exécution contractuelle')}</strong> {t('privacy.legal.contractDesc', ": fourniture des services souscrits (Free, Premium, Pro).")}</p>
                <p><strong>{t('privacy.legal.interest', 'Intérêt légitime')}</strong> {t('privacy.legal.interestDesc', ": amélioration du service, sécurité, prévention des fraudes.")}</p>
                <p><strong>{t('privacy.legal.obligation', 'Obligation légale')}</strong> {t('privacy.legal.obligationDesc', ": conservation des données de facturation conformément au droit français.")}</p>
              </div>
            </section>

            {/* Durée de conservation */}
            <section className="p-6 rounded-xl bg-card border border-border/50">
              <h2 className="flex items-center gap-2 text-xl font-semibold mb-4">
                <Bell className="w-5 h-5 text-primary" />
                {t('privacy.retention.title', 'Durée de Conservation')}
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold">{t('privacy.retention.type', 'Type de données')}</th>
                      <th className="text-left py-3 px-4 font-semibold">{t('privacy.retention.duration', 'Durée')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="py-3 px-4">{t('privacy.retention.account', 'Données de compte')}</td>
                      <td className="py-3 px-4">{t('privacy.retention.accountDuration', "Durée de l'abonnement + 3 ans")}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4">{t('privacy.retention.usage', "Données d'utilisation")}</td>
                      <td className="py-3 px-4">{t('privacy.retention.usageDuration', '2 ans après dernière activité')}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4">{t('privacy.retention.billing', 'Données de facturation')}</td>
                      <td className="py-3 px-4">{t('privacy.retention.billingDuration', '10 ans (obligation légale)')}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4">{t('privacy.retention.analytics', 'Analytics (Plausible)')}</td>
                      <td className="py-3 px-4">{t('privacy.retention.analyticsDuration', 'Agrégées, non nominatives')}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4">{t('privacy.retention.local', 'Données locales (localStorage)')}</td>
                      <td className="py-3 px-4">{t('privacy.retention.localDuration', 'Sous votre contrôle exclusif')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Partage des données */}
            <section className="p-6 rounded-xl bg-card border border-border/50">
              <h2 className="flex items-center gap-2 text-xl font-semibold mb-4">
                <Globe className="w-5 h-5 text-primary" />
                {t('privacy.sharing.title', 'Partage et Sous-traitants')}
              </h2>
              <div className="space-y-4">
                <p>{t('privacy.sharing.intro', "Nous ne vendons jamais vos données personnelles. Nous partageons vos données uniquement avec les sous-traitants suivants, nécessaires au fonctionnement du service :")}</p>
                <div className="space-y-3">
                  <div className="p-4 rounded-lg bg-muted/30">
                    <p className="font-semibold">Supabase (hébergement & base de données)</p>
                    <p className="text-sm text-muted-foreground">{t('privacy.sharing.supabase', "Hébergement UE, chiffrement des données au repos et en transit. Conforme RGPD.")}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30">
                    <p className="font-semibold">Plausible.io (analytics)</p>
                    <p className="text-sm text-muted-foreground">{t('privacy.sharing.plausible', "Analytics privacy-first, hébergé dans l'UE, sans cookies, sans données personnelles. Conforme RGPD.")}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30">
                    <p className="font-semibold">Stripe (paiements)</p>
                    <p className="text-sm text-muted-foreground">{t('privacy.sharing.stripe', "Traitement des paiements certifié PCI-DSS. Nous ne stockons jamais vos informations bancaires.")}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30">
                    <p className="font-semibold">Mapbox (cartographie)</p>
                    <p className="text-sm text-muted-foreground">{t('privacy.sharing.mapbox', "Affichage de la carte interactive. Aucune donnée personnelle transmise.")}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Vos droits */}
            <section className="p-6 rounded-xl bg-card border border-border/50">
              <h2 className="flex items-center gap-2 text-xl font-semibold mb-4">
                <UserCheck className="w-5 h-5 text-primary" />
                {t('privacy.rights.title', 'Vos Droits RGPD')}
              </h2>
              <div className="space-y-4">
                <p>{t('privacy.rights.intro', 'Conformément au RGPD (articles 15 à 22), vous disposez des droits suivants :')}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <h3 className="font-semibold mb-1">{t('privacy.rights.access', "Droit d'accès")}</h3>
                    <p className="text-sm text-muted-foreground">{t('privacy.rights.accessDesc', 'Obtenir une copie de toutes vos données personnelles.')}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <h3 className="font-semibold mb-1">{t('privacy.rights.rectification', 'Droit de rectification')}</h3>
                    <p className="text-sm text-muted-foreground">{t('privacy.rights.rectificationDesc', 'Corriger des données inexactes ou incomplètes.')}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <h3 className="font-semibold mb-1">{t('privacy.rights.erasure', "Droit à l'effacement")}</h3>
                    <p className="text-sm text-muted-foreground">{t('privacy.rights.erasureDesc', "Demander la suppression de vos données (\"droit à l'oubli\").")}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <h3 className="font-semibold mb-1">{t('privacy.rights.portability', 'Droit à la portabilité')}</h3>
                    <p className="text-sm text-muted-foreground">{t('privacy.rights.portabilityDesc', 'Recevoir vos données dans un format structuré et lisible.')}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <h3 className="font-semibold mb-1">{t('privacy.rights.restriction', 'Droit à la limitation')}</h3>
                    <p className="text-sm text-muted-foreground">{t('privacy.rights.restrictionDesc', 'Limiter le traitement de vos données dans certains cas.')}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <h3 className="font-semibold mb-1">{t('privacy.rights.objection', "Droit d'opposition")}</h3>
                    <p className="text-sm text-muted-foreground">{t('privacy.rights.objectionDesc', "Vous opposer au traitement de vos données pour motif légitime.")}</p>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <p className="text-sm">
                    <strong>{t('privacy.rights.howTo', 'Comment exercer vos droits ?')}</strong>{' '}
                    {t('privacy.rights.howToDesc', "Envoyez un email à")} {' '}
                    <a href="mailto:privacy@pyramidcompass.com" className="text-primary hover:underline">
                      privacy@pyramidcompass.com
                    </a>
                    {' '}{t('privacy.rights.howToDesc2', "avec une preuve d'identité. Nous répondrons sous 30 jours.")}
                  </p>
                </div>
              </div>
            </section>

            {/* Suppression des données locales */}
            <section className="p-6 rounded-xl bg-card border border-border/50">
              <h2 className="flex items-center gap-2 text-xl font-semibold mb-4">
                <Trash2 className="w-5 h-5 text-primary" />
                {t('privacy.localData.title', 'Suppression des Données Locales')}
              </h2>
              <div className="space-y-4">
                <p>{t('privacy.localData.desc', "En mode invité, toutes vos données sont stockées localement dans votre navigateur. Pour les supprimer :")}</p>
                <ol className="list-decimal pl-6 space-y-2 text-sm">
                  <li>{t('privacy.localData.step1', "Ouvrez les paramètres de votre navigateur")}</li>
                  <li>{t('privacy.localData.step2', "Accédez à la section \"Données de sites\"")}</li>
                  <li>{t('privacy.localData.step3', "Recherchez le domaine de Compass")}</li>
                  <li>{t('privacy.localData.step4', "Supprimez les données associées")}</li>
                </ol>
                <p className="text-sm text-muted-foreground">
                  {t('privacy.localData.note', "La déconnexion de votre compte efface également toutes les données locales de l'appareil.")}
                </p>
              </div>
            </section>

            {/* Cookies */}
            <section className="p-6 rounded-xl bg-card border border-border/50">
              <h2 className="text-xl font-semibold mb-4">{t('privacy.cookies.title', 'Cookies')}</h2>
              <div className="space-y-4">
                <p>{t('privacy.cookies.desc', "Compass utilise un minimum de cookies, strictement nécessaires au fonctionnement du service :")}</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-semibold">Cookie</th>
                        <th className="text-left py-3 px-4 font-semibold">{t('privacy.cookies.purpose', 'Finalité')}</th>
                        <th className="text-left py-3 px-4 font-semibold">{t('privacy.cookies.duration', 'Durée')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      <tr>
                        <td className="py-3 px-4 font-mono text-xs">sb-*-auth-token</td>
                        <td className="py-3 px-4">{t('privacy.cookies.auth', 'Session authentification')}</td>
                        <td className="py-3 px-4">{t('privacy.cookies.authDuration', 'Session')}</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-mono text-xs">i18nextLng</td>
                        <td className="py-3 px-4">{t('privacy.cookies.lang', 'Préférence de langue')}</td>
                        <td className="py-3 px-4">{t('privacy.cookies.langDuration', 'Persistant')}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('privacy.cookies.noTracking', "Aucun cookie de tracking ou publicitaire n'est utilisé. Plausible.io fonctionne sans cookies.")}
                </p>
              </div>
            </section>

            {/* Sécurité */}
            <section className="p-6 rounded-xl bg-card border border-border/50">
              <h2 className="flex items-center gap-2 text-xl font-semibold mb-4">
                <Lock className="w-5 h-5 text-primary" />
                {t('privacy.security.title', 'Sécurité des Données')}
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-sm">
                <li>{t('privacy.security.https', 'Chiffrement HTTPS sur toutes les communications')}</li>
                <li>{t('privacy.security.hash', "Mots de passe hashés avec bcrypt (jamais stockés en clair)")}</li>
                <li>{t('privacy.security.rls', "Row Level Security (RLS) sur toutes les tables Supabase")}</li>
                <li>{t('privacy.security.encryption', 'Chiffrement des données au repos')}</li>
                <li>{t('privacy.security.audit', 'Audits de sécurité réguliers')}</li>
                <li>{t('privacy.security.robots', 'Routes sensibles (/admin/, /diagnostics) protégées dans robots.txt')}</li>
              </ul>
            </section>

            {/* Transferts internationaux */}
            <section className="p-6 rounded-xl bg-card border border-border/50">
              <h2 className="flex items-center gap-2 text-xl font-semibold mb-4">
                <Globe className="w-5 h-5 text-primary" />
                {t('privacy.transfers.title', 'Transferts Internationaux')}
              </h2>
              <p>
                {t('privacy.transfers.desc', "Vos données sont principalement hébergées dans l'Union Européenne (Supabase EU). En cas de transfert hors UE (ex : Stripe US), nous nous assurons que les garanties appropriées sont en place (clauses contractuelles types, décisions d'adéquation).")}
              </p>
            </section>

            {/* Mineurs */}
            <section className="p-6 rounded-xl bg-card border border-border/50">
              <h2 className="text-xl font-semibold mb-4">{t('privacy.minors.title', 'Protection des Mineurs')}</h2>
              <p>
                {t('privacy.minors.desc', "Compass s'adresse à un public majeur (18 ans et plus). Nous ne collectons pas sciemment de données personnelles de mineurs. Si nous découvrons que des données de mineurs ont été collectées, elles seront supprimées immédiatement.")}
              </p>
            </section>

            {/* Modifications */}
            <section className="p-6 rounded-xl bg-card border border-border/50">
              <h2 className="text-xl font-semibold mb-4">{t('privacy.changes.title', 'Modifications de cette Politique')}</h2>
              <p>
                {t('privacy.changes.desc', "Nous pouvons mettre à jour cette politique de confidentialité. En cas de modification substantielle, nous vous en informerons par email ou via une notification dans l'application. La date de dernière mise à jour est indiquée en haut de cette page.")}
              </p>
            </section>

            {/* Réclamation */}
            <section className="p-6 rounded-xl bg-primary/5 border border-primary/20">
              <h2 className="text-xl font-semibold mb-4">{t('privacy.complaint.title', 'Réclamation')}</h2>
              <p className="mb-4">
                {t('privacy.complaint.desc', "Si vous estimez que le traitement de vos données personnelles n'est pas conforme au RGPD, vous pouvez introduire une réclamation auprès de la CNIL :")}
              </p>
              <div className="p-4 rounded-lg bg-background/50">
                <p className="font-semibold">Commission Nationale de l'Informatique et des Libertés (CNIL)</p>
                <p className="text-sm text-muted-foreground mt-1">3 Place de Fontenoy, TSA 80715, 75334 Paris Cedex 07</p>
                <p className="text-sm mt-2">
                  <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    www.cnil.fr
                  </a>
                </p>
              </div>
            </section>

            {/* Liens utiles */}
            <section className="p-6 rounded-xl bg-card border border-border/50">
              <h2 className="text-xl font-semibold mb-4">{t('privacy.links.title', 'Documents liés')}</h2>
              <ul className="space-y-2">
                <li>
                  <Link to="/mentions-legales" className="text-primary hover:underline flex items-center gap-2">
                    {t('privacy.links.legal', '→ Mentions Légales')}
                  </Link>
                </li>
                <li>
                  <Link to="/cgv" className="text-primary hover:underline flex items-center gap-2">
                    {t('privacy.links.cgv', '→ Conditions Générales de Vente')}
                  </Link>
                </li>
                <li>
                  <Link to="/disclaimer" className="text-primary hover:underline flex items-center gap-2">
                    {t('privacy.links.disclaimer', '→ Disclaimer / Avertissements')}
                  </Link>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
