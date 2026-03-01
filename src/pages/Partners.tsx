import { useState } from "react";
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users, Building2, Heart, Sparkles,
  ArrowRight, Ban, Eye, CheckCircle2, Quote
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePartnerProgram } from "@/hooks/usePartnerProgram";
import { PartnerApplicationForm } from "@/components/partners/PartnerApplicationForm";
import { PartnerDashboard } from "@/components/partners/PartnerDashboard";
import { Link } from "react-router-dom";

const PROGRAM_EXCLUSIONS = [
  "Aucun mécanisme de recrutement en chaîne",
  "Aucune hiérarchie entre partenaires",
  "Aucune promesse de gain",
  "Aucune obligation de diffusion",
  "Aucun objectif quantitatif imposé"
];

export default function Partners() {
  const { user } = useAuth();
  const { isApprovedPartner, loading } = usePartnerProgram();
  const [selectedTab, setSelectedTab] = useState<string>("info");

  const hasApprovedApplication = isApprovedPartner('ambassador') || isApprovedPartner('b2b_partner');

  return (
    <div className="min-h-screen bg-background pt-16 sm:pt-20">
      <Helmet>
        <title>Programme Partenaires - System Compass</title>
        <meta name="description" content="Rejoignez le programme Compass Partners : ambassadeur ou partenaire B2B. Diffusion responsable de System Compass, sans mécanisme de recrutement en chaîne." />
        <link rel="canonical" href="https://system-compass.app/partners" />
        <meta property="og:title" content="Programme Partenaires - System Compass" />
        <meta property="og:description" content="Compass Partners : ambassadeur ou partenaire B2B pour diffuser la lucidité." />
        <meta property="og:url" content="https://system-compass.app/partners" />
      </Helmet>
      {/* Hero Section */}
      <section className="relative py-8 sm:py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
        <div className="container mx-auto px-3 sm:px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="outline" className="mb-3 sm:mb-4 text-xs sm:text-sm">
              <Sparkles className="h-3 w-3 mr-1" />
              Programme Partenaires
            </Badge>
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4 sm:mb-6">
              Compass Partners
            </h1>
            <p className="text-sm sm:text-lg text-muted-foreground mb-6 sm:mb-8">
              Diffusion responsable de System Compass
            </p>
            
            <div className="bg-card border rounded-xl p-4 sm:p-6 text-left max-w-xl mx-auto">
              <Quote className="h-6 w-6 sm:h-8 sm:w-8 text-primary/30 mb-2" />
              <p className="text-sm sm:text-lg italic text-foreground/80">
                System Compass reconnaît les personnes qui contribuent à diffuser la lucidité,
                par l'usage, la compréhension et la responsabilité.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-3 sm:px-4 pb-12 sm:pb-16">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6 sm:space-y-8">
          <div className="flex justify-center">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full max-w-2xl h-auto gap-1 p-1">
              <TabsTrigger value="info" className="text-xs sm:text-sm py-2">Présentation</TabsTrigger>
              <TabsTrigger value="ambassador" className="text-xs sm:text-sm py-2">Ambassadeur</TabsTrigger>
              <TabsTrigger value="b2b" className="text-xs sm:text-sm py-2">B2B</TabsTrigger>
              {user && <TabsTrigger value="dashboard" className="text-xs sm:text-sm py-2">Mon espace</TabsTrigger>}
            </TabsList>
          </div>

          {/* Info Tab */}
          <TabsContent value="info" className="space-y-8">
            {/* Principle */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  Principe fondateur
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  System Compass repose sur une conviction simple :
                </p>
                <blockquote className="border-l-4 border-primary pl-4 py-2 bg-muted/30 rounded-r">
                  <p className="font-medium">
                    La lucidité se diffuse par l'usage réel, la compréhension et la responsabilité,
                    pas par des mécanismes de recrutement ou de promesse.
                  </p>
                </blockquote>
                <p className="text-muted-foreground">
                  Le programme partenaires formalise cette diffusion sans créer de hiérarchie, 
                  sans incitation au recrutement, et sans dépendance entre participants.
                </p>
              </CardContent>
            </Card>

            {/* Two positions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <Card className="group hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Ambassadeur Compass</CardTitle>
                      <CardDescription>Poste 1</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Rôle</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Présenter System Compass à des personnes pertinentes</li>
                      <li>• Partager une expérience d'usage authentique</li>
                      <li>• Contribuer par des retours qualitatifs</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Reconnaissance</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        Crédits d'usage sur la plateforme
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        Accès à des fonctionnalités avancées
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        Badge Ambassadeur Compass
                      </li>
                    </ul>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setSelectedTab("ambassador")}
                  >
                    En savoir plus
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="group hover:border-blue-500/50 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                      <Building2 className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Partenaire B2B Compass</CardTitle>
                      <CardDescription>Poste 2</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Rôle</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Mise en relation avec des organisations</li>
                      <li>• Qualifier le besoin en amont</li>
                      <li>• Faciliter l'entrée en relation</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Reconnaissance</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        Rémunération claire et contractuelle
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        Accès à des outils B2B dédiés
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        Association à l'écosystème
                      </li>
                    </ul>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setSelectedTab("b2b")}
                  >
                    En savoir plus
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* What we don't do */}
            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ban className="h-5 w-5 text-destructive" />
                  Hors périmètre explicite
                </CardTitle>
                <CardDescription>
                  Ce que ce programme n'est PAS
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {PROGRAM_EXCLUSIONS.map((exclusion, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <Ban className="h-4 w-4 text-destructive/60 flex-shrink-0" />
                      {exclusion}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ambassador Tab */}
          <TabsContent value="ambassador">
            <div className="max-w-2xl mx-auto">
              {!user ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Connexion requise</h3>
                    <p className="text-muted-foreground mb-4">
                      Connectez-vous pour postuler au programme Ambassadeur.
                    </p>
                    <Button asChild>
                      <Link to="/auth">Se connecter</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <PartnerApplicationForm 
                  type="ambassador" 
                  onSuccess={() => setSelectedTab("dashboard")}
                />
              )}
            </div>
          </TabsContent>

          {/* B2B Tab */}
          <TabsContent value="b2b">
            <div className="max-w-2xl mx-auto">
              {!user ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Connexion requise</h3>
                    <p className="text-muted-foreground mb-4">
                      Connectez-vous pour postuler au programme Partenaire B2B.
                    </p>
                    <Button asChild>
                      <Link to="/auth">Se connecter</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <PartnerApplicationForm 
                  type="b2b_partner" 
                  onSuccess={() => setSelectedTab("dashboard")}
                />
              )}
            </div>
          </TabsContent>

          {/* Dashboard Tab */}
          {user && (
            <TabsContent value="dashboard">
              <div className="max-w-4xl mx-auto">
                {hasApprovedApplication || loading ? (
                  <PartnerDashboard />
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Aucune candidature approuvée</h3>
                      <p className="text-muted-foreground mb-4">
                        Votre tableau de bord sera accessible une fois votre candidature approuvée.
                      </p>
                      <div className="flex gap-3 justify-center">
                        <Button variant="outline" onClick={() => setSelectedTab("ambassador")}>
                          Postuler Ambassadeur
                        </Button>
                        <Button variant="outline" onClick={() => setSelectedTab("b2b")}>
                          Postuler B2B
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
