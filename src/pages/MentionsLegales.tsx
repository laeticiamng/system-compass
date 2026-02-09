/**
 * MentionsLegales - Page des mentions légales
 * Informations légales obligatoires pour un site de vente en ligne
 */

import { ArrowLeft, Building2, User, Globe, Server, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function MentionsLegales() {

  return (
    <div className="min-h-screen bg-background pt-20 sm:pt-24">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Retour à l'accueil
            </Link>
          </Button>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold">
                Mentions Légales
              </h1>
              <p className="text-muted-foreground">
                Informations légales conformément à la loi française
              </p>
            </div>
          </div>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          {/* Éditeur */}
          <section className="p-6 rounded-xl bg-card border border-border/50">
            <h2 className="flex items-center gap-2 text-xl font-semibold mb-4">
              <Building2 className="w-5 h-5 text-primary" />
              Éditeur du Site
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/30">
                  <p className="text-sm text-muted-foreground mb-1">Raison sociale</p>
                  <p className="font-semibold">EmotionsCare SASU</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30">
                  <p className="text-sm text-muted-foreground mb-1">Forme juridique</p>
                  <p className="font-semibold">Société par Actions Simplifiée Unipersonnelle</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30">
                  <p className="text-sm text-muted-foreground mb-1">SIRET</p>
                  <p className="font-semibold font-mono">944 505 445 00014</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30">
                  <p className="text-sm text-muted-foreground mb-1">N° TVA Intracommunautaire</p>
                  <p className="font-semibold font-mono">FR71944505445</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30">
                  <p className="text-sm text-muted-foreground mb-1">Capital social</p>
                  <p className="font-semibold">100 €</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30">
                  <p className="text-sm text-muted-foreground mb-1">Siège social</p>
                  <p className="font-semibold">Amiens, France</p>
                </div>
              </div>
            </div>
          </section>

          {/* Directeur de publication */}
          <section className="p-6 rounded-xl bg-card border border-border/50">
            <h2 className="flex items-center gap-2 text-xl font-semibold mb-4">
              <User className="w-5 h-5 text-primary" />
              Directeur de la Publication
            </h2>
            <p>
              Le directeur de la publication est le représentant légal de la société EmotionsCare SASU.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              Contact : contact@emotionscare.fr
            </p>
          </section>

          {/* Hébergement */}
          <section className="p-6 rounded-xl bg-card border border-border/50">
            <h2 className="flex items-center gap-2 text-xl font-semibold mb-4">
              <Server className="w-5 h-5 text-primary" />
              Hébergement
            </h2>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/30">
                <p className="font-semibold mb-2">Lovable / Supabase</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>Infrastructure cloud sécurisée</li>
                  <li>Données hébergées dans l'Union Européenne</li>
                  <li>Conformité RGPD</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Propriété intellectuelle */}
          <section className="p-6 rounded-xl bg-card border border-border/50">
            <h2 className="flex items-center gap-2 text-xl font-semibold mb-4">
              <Globe className="w-5 h-5 text-primary" />
              Propriété Intellectuelle
            </h2>
            <div className="space-y-4">
              <p>
                L'ensemble du contenu du site Pyramid Compass (textes, graphismes, images, logos, 
                icônes, logiciels, bases de données, etc.) est protégé par le droit d'auteur et 
                les droits de propriété intellectuelle.
              </p>
              <p>
                Toute reproduction, représentation, modification, publication, adaptation de tout 
                ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, 
                est interdite, sauf autorisation écrite préalable de EmotionsCare SASU.
              </p>
              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <p className="text-sm">
                  <strong>Marques :</strong> "Pyramid Compass", "Exit Keys" et le logo associé 
                  sont des marques déposées ou en cours de dépôt par EmotionsCare SASU.
                </p>
              </div>
            </div>
          </section>

          {/* Protection des données */}
          <section className="p-6 rounded-xl bg-card border border-border/50">
            <h2 className="flex items-center gap-2 text-xl font-semibold mb-4">
              <Shield className="w-5 h-5 text-primary" />
              Protection des Données Personnelles
            </h2>
            <div className="space-y-4">
              <p>
                Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi 
                Informatique et Libertés, vous disposez d'un droit d'accès, de rectification, 
                d'effacement et de portabilité de vos données personnelles.
              </p>
              
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <h3 className="font-semibold mb-2">Vos droits</h3>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>Droit d'accès à vos données</li>
                  <li>Droit de rectification</li>
                  <li>Droit à l'effacement ("droit à l'oubli")</li>
                  <li>Droit à la limitation du traitement</li>
                  <li>Droit à la portabilité des données</li>
                  <li>Droit d'opposition</li>
                </ul>
              </div>

              <p>
                Pour exercer ces droits, contactez-nous à : 
                <a href="mailto:privacy@pyramidcompass.com" className="text-primary hover:underline ml-1">
                  privacy@pyramidcompass.com
                </a>
              </p>

              <p className="text-sm text-muted-foreground">
                Vous pouvez également introduire une réclamation auprès de la CNIL 
                (Commission Nationale de l'Informatique et des Libertés) : 
                <a 
                  href="https://www.cnil.fr" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline ml-1"
                >
                  www.cnil.fr
                </a>
              </p>
            </div>
          </section>

          {/* Cookies */}
          <section className="p-6 rounded-xl bg-card border border-border/50">
            <h2 className="text-xl font-semibold mb-4">Cookies</h2>
            <p>
              Ce site utilise des cookies pour améliorer votre expérience utilisateur et analyser 
              le trafic. Vous pouvez gérer vos préférences de cookies à tout moment via le bandeau 
              de consentement ou les paramètres de votre navigateur.
            </p>
            <div className="mt-4">
              <Link to="/privacy" className="text-primary hover:underline">
                Consulter notre politique de confidentialité complète →
              </Link>
            </div>
          </section>

          {/* Liens utiles */}
          <section className="p-6 rounded-xl bg-primary/5 border border-primary/20">
            <h2 className="text-xl font-semibold mb-4">Documents légaux</h2>
            <ul className="space-y-2">
              <li>
                <Link to="/cgv" className="text-primary hover:underline flex items-center gap-2">
                  → Conditions Générales de Vente
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-primary hover:underline flex items-center gap-2">
                  → Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link to="/disclaimer" className="text-primary hover:underline flex items-center gap-2">
                  → Disclaimer / Avertissements
                </Link>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
