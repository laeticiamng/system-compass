/**
 * CGV - Conditions Générales de Vente
 * Page légale requise pour la vente de services en ligne
 */

import { ArrowLeft, FileText, CreditCard, RefreshCcw, Scale, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function CGV() {

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
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
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold">
                Conditions Générales de Vente
              </h1>
              <p className="text-muted-foreground">
                Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          {/* Article 1 */}
          <section className="p-6 rounded-xl bg-card border border-border/50">
            <h2 className="flex items-center gap-2 text-xl font-semibold mb-4">
              <FileText className="w-5 h-5 text-primary" />
              Article 1 - Description du Service
            </h2>
            <p>
              Pyramid Compass est une plateforme d'analyse et de comparaison des systèmes économiques 
              et sociaux de différents pays. Le service propose :
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>L'accès à des fiches pays détaillées avec analyse des "pyramides de pouvoir"</li>
              <li>Des outils de test de profil et de matching pays-utilisateur</li>
              <li>Des stratégies de sortie personnalisées</li>
              <li>Un calculateur fiscal comparatif</li>
              <li>Des simulations de trajectoire de vie</li>
            </ul>
            <p className="mt-4 text-muted-foreground text-sm">
              ⚠️ Le service fournit des informations à caractère éducatif uniquement. 
              Il ne constitue en aucun cas un conseil juridique, fiscal ou financier personnalisé.
            </p>
          </section>

          {/* Article 2 */}
          <section className="p-6 rounded-xl bg-card border border-border/50">
            <h2 className="flex items-center gap-2 text-xl font-semibold mb-4">
              <CreditCard className="w-5 h-5 text-primary" />
              Article 2 - Prix et Modalités de Paiement
            </h2>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <h3 className="font-semibold mb-2">Offre Premium</h3>
                <p className="text-2xl font-bold text-primary">9,90 € / mois</p>
                <p className="text-sm text-muted-foreground mt-1">TVA incluse</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Modalités de paiement</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Le paiement s'effectue par carte bancaire via la plateforme sécurisée Stripe</li>
                  <li>L'abonnement est à tacite reconduction mensuelle</li>
                  <li>Le prélèvement est effectué automatiquement chaque mois à la date anniversaire de souscription</li>
                  <li>Une facture est automatiquement générée et accessible depuis votre espace client</li>
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-muted/30">
                <h3 className="font-semibold mb-2">Offre Gratuite</h3>
                <p>Une offre gratuite avec accès limité est disponible :</p>
                <ul className="list-disc pl-6 space-y-1 mt-2 text-sm">
                  <li>Accès à 3 pays (France, Suisse, Belgique)</li>
                  <li>Quiz de profil basique</li>
                  <li>Vue pyramide simplifiée</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Article 3 */}
          <section className="p-6 rounded-xl bg-card border border-border/50">
            <h2 className="flex items-center gap-2 text-xl font-semibold mb-4">
              <RefreshCcw className="w-5 h-5 text-primary" />
              Article 3 - Droit de Rétractation
            </h2>
            <div className="space-y-4">
              <p>
                Conformément à l'article L221-18 du Code de la consommation, vous disposez d'un 
                <strong> délai de rétractation de 14 jours</strong> à compter de la souscription 
                de votre abonnement, sans avoir à justifier de motifs ni à payer de pénalités.
              </p>
              
              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <h3 className="font-semibold text-amber-600 dark:text-amber-400 mb-2">
                  Comment exercer votre droit de rétractation ?
                </h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Par email à : support@pyramidcompass.com</li>
                  <li>Via le formulaire de contact sur le site</li>
                  <li>Par courrier à l'adresse du siège social</li>
                </ul>
              </div>

              <p className="text-sm text-muted-foreground">
                En cas de rétractation, le remboursement sera effectué dans un délai de 14 jours 
                suivant la réception de votre demande, par le même moyen de paiement que celui utilisé 
                lors de la transaction initiale.
              </p>
            </div>
          </section>

          {/* Article 4 */}
          <section className="p-6 rounded-xl bg-card border border-border/50">
            <h2 className="flex items-center gap-2 text-xl font-semibold mb-4">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Article 4 - Résiliation
            </h2>
            <div className="space-y-4">
              <p>
                L'abonnement Premium peut être résilié <strong>à tout moment</strong>, sans frais 
                ni pénalités, directement depuis votre espace personnel.
              </p>
              
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <h3 className="font-semibold text-green-600 dark:text-green-400 mb-2">
                  Procédure de résiliation
                </h3>
                <ol className="list-decimal pl-6 space-y-1">
                  <li>Connectez-vous à votre compte</li>
                  <li>Accédez à votre Dashboard</li>
                  <li>Cliquez sur "Gérer mon abonnement"</li>
                  <li>Sélectionnez "Annuler l'abonnement"</li>
                </ol>
              </div>

              <p>
                La résiliation prend effet à la fin de la période de facturation en cours. 
                Vous conservez l'accès aux fonctionnalités Premium jusqu'à cette date.
              </p>
            </div>
          </section>

          {/* Article 5 */}
          <section className="p-6 rounded-xl bg-card border border-border/50">
            <h2 className="flex items-center gap-2 text-xl font-semibold mb-4">
              <Scale className="w-5 h-5 text-primary" />
              Article 5 - Droit Applicable et Juridiction
            </h2>
            <div className="space-y-4">
              <p>
                Les présentes Conditions Générales de Vente sont soumises au <strong>droit français</strong>.
              </p>
              
              <p>
                En cas de litige relatif à l'interprétation ou l'exécution des présentes CGV, 
                les parties s'efforceront de trouver une solution amiable. À défaut, le litige 
                sera porté devant les tribunaux compétents de <strong>Amiens, France</strong>.
              </p>

              <div className="p-4 rounded-lg bg-muted/30">
                <h3 className="font-semibold mb-2">Médiation</h3>
                <p className="text-sm">
                  Conformément à l'article L612-1 du Code de la consommation, vous pouvez recourir 
                  gratuitement au service de médiation de la consommation. Le médiateur peut être 
                  saisi via la plateforme européenne de règlement en ligne des litiges : 
                  <a 
                    href="https://ec.europa.eu/consumers/odr" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline ml-1"
                  >
                    ec.europa.eu/consumers/odr
                  </a>
                </p>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="p-6 rounded-xl bg-primary/5 border border-primary/20">
            <h2 className="text-xl font-semibold mb-4">Contact</h2>
            <p>
              Pour toute question relative aux présentes CGV, vous pouvez nous contacter :
            </p>
            <ul className="mt-4 space-y-2">
              <li>
                <strong>Email :</strong> support@pyramidcompass.com
              </li>
              <li>
                <strong>Éditeur :</strong> EmotionsCare SASU
              </li>
              <li>
                <strong>Siège social :</strong> Amiens, France
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
