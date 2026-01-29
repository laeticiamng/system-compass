import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CreditCard, 
  Shield, 
  Plane, 
  Landmark, 
  ExternalLink,
  CheckCircle2,
  Percent,
  Star,
  ArrowRight,
  Gift,
  TrendingUp,
  Globe2,
  Calculator
} from 'lucide-react';
import { toast } from 'sonner';
import { PartnerCostCalculator } from '@/components/partners/PartnerCostCalculator';
import { InsuranceComparator } from '@/components/partners/InsuranceComparator';

interface Partner {
  id: string;
  name: string;
  logo?: string;
  category: 'banking' | 'insurance' | 'travel' | 'services';
  description: string;
  benefits: string[];
  discount?: string;
  rating: number;
  countries: string[];
  affiliateLink: string;
  featured?: boolean;
}

const PARTNERS: Partner[] = [
  // Banking
  {
    id: 'wise',
    name: 'Wise (TransferWise)',
    category: 'banking',
    description: 'Transferts internationaux au taux de change réel. Compte multi-devises gratuit.',
    benefits: [
      'Taux de change réel (mid-market)',
      'Carte de débit multi-devises',
      'Détails bancaires locaux dans 10+ devises',
      'Frais transparents et bas',
    ],
    discount: 'Premier transfert gratuit',
    rating: 4.8,
    countries: ['Monde entier'],
    affiliateLink: 'https://wise.com',
    featured: true,
  },
  {
    id: 'revolut',
    name: 'Revolut',
    category: 'banking',
    description: 'Super-app financière avec trading, crypto et transferts internationaux.',
    benefits: [
      'Carte virtuelle et physique gratuite',
      'Échange devises sans frais (limite mensuelle)',
      'Crypto et trading actions',
      'Assurance voyage incluse (plans payants)',
    ],
    discount: '3 mois Premium gratuits',
    rating: 4.6,
    countries: ['Europe', 'UK', 'USA', 'Singapour'],
    affiliateLink: 'https://revolut.com',
    featured: true,
  },
  {
    id: 'n26',
    name: 'N26',
    category: 'banking',
    description: 'Banque mobile allemande avec licence bancaire européenne complète.',
    benefits: [
      'IBAN allemand',
      'Carte Mastercard gratuite',
      'Espaces (comptes épargne intégrés)',
      'Retraits gratuits dans le monde',
    ],
    rating: 4.4,
    countries: ['Zone Euro'],
    affiliateLink: 'https://n26.com',
  },
  {
    id: 'charles-schwab',
    name: 'Charles Schwab',
    category: 'banking',
    description: 'Compte bancaire et investissement américain accessible aux expats.',
    benefits: [
      'Aucuns frais de retrait DAB monde',
      'Compte d\'investissement intégré',
      'Chèques et virements US',
      'Service client excellent',
    ],
    rating: 4.7,
    countries: ['USA', 'Monde (expats US)'],
    affiliateLink: 'https://schwab.com',
  },
  // Insurance
  {
    id: 'safety-wing',
    name: 'SafetyWing',
    category: 'insurance',
    description: 'Assurance santé et voyage conçue pour les nomades numériques.',
    benefits: [
      'Couverture mondiale (sauf pays d\'origine)',
      'Paiement mensuel flexible',
      'Pas de période d\'engagement',
      'Couverture COVID-19 incluse',
    ],
    discount: '-10% via notre lien',
    rating: 4.5,
    countries: ['Monde entier'],
    affiliateLink: 'https://safetywing.com',
    featured: true,
  },
  {
    id: 'allianz-expat',
    name: 'Allianz Care',
    category: 'insurance',
    description: 'Assurance santé internationale premium pour expatriés.',
    benefits: [
      'Couverture complète mondiale',
      'Réseau médical international',
      'Rapatriement inclus',
      'Maternité et bien-être optionnels',
    ],
    rating: 4.6,
    countries: ['Monde entier'],
    affiliateLink: 'https://allianzcare.com',
  },
  {
    id: 'april-expat',
    name: 'APRIL International',
    category: 'insurance',
    description: 'Assurance expat française avec expertise CFE.',
    benefits: [
      'Compatible CFE (France)',
      'Plans personnalisables',
      'Assistance 24/7 en français',
      'Gestion des soins en France',
    ],
    rating: 4.3,
    countries: ['Monde entier'],
    affiliateLink: 'https://april-international.com',
  },
  // Travel
  {
    id: 'skyscanner',
    name: 'Skyscanner',
    category: 'travel',
    description: 'Comparateur de vols pour trouver les meilleures offres.',
    benefits: [
      'Comparaison tous les vols',
      'Alertes prix',
      'Recherche flexible (mois entier)',
      'Location voiture et hôtels',
    ],
    rating: 4.5,
    countries: ['Monde entier'],
    affiliateLink: 'https://skyscanner.com',
  },
  {
    id: 'booking',
    name: 'Booking.com',
    category: 'travel',
    description: 'Plateforme de réservation hébergements avec programme Genius.',
    benefits: [
      'Plus grand choix mondial',
      'Annulation gratuite fréquente',
      'Programme fidélité Genius',
      'Prix garantis les plus bas',
    ],
    rating: 4.4,
    countries: ['Monde entier'],
    affiliateLink: 'https://booking.com',
  },
  {
    id: 'airbnb',
    name: 'Airbnb',
    category: 'travel',
    description: 'Location courte et moyenne durée, idéal pour tester une destination.',
    benefits: [
      'Logements uniques',
      'Avis vérifiés',
      'Réductions séjours longs',
      'Expériences locales',
    ],
    discount: '€25 de crédit voyage',
    rating: 4.3,
    countries: ['Monde entier'],
    affiliateLink: 'https://airbnb.com',
  },
  // Services
  {
    id: 'remote',
    name: 'Remote.com',
    category: 'services',
    description: 'Employer of Record pour embaucher légalement partout dans le monde.',
    benefits: [
      'Contrats locaux conformes',
      'Paie et avantages gérés',
      'Propriété intellectuelle protégée',
      'Support RH dédié',
    ],
    rating: 4.7,
    countries: ['180+ pays'],
    affiliateLink: 'https://remote.com',
  },
  {
    id: 'deel',
    name: 'Deel',
    category: 'services',
    description: 'Plateforme de paie internationale pour freelances et employés.',
    benefits: [
      'Paiement dans 150+ devises',
      'Contrats générés automatiquement',
      'Conformité locale',
      'Retrait crypto possible',
    ],
    rating: 4.6,
    countries: ['150+ pays'],
    affiliateLink: 'https://deel.com',
  },
];

const CATEGORIES = [
  { value: 'all', label: 'Tous', icon: Globe2 },
  { value: 'calculators', label: 'Comparateurs', icon: Calculator },
  { value: 'banking', label: 'Banque', icon: Landmark },
  { value: 'insurance', label: 'Assurance', icon: Shield },
  { value: 'travel', label: 'Voyage', icon: Plane },
  { value: 'services', label: 'Services', icon: CreditCard },
];

export default function PartnerIntegrations() {

  const handlePartnerClick = (partner: Partner) => {
    toast.success(`Redirection vers ${partner.name}`, {
      description: partner.discount || 'Profitez de notre partenariat',
    });
    // In production, this would use affiliate links
    window.open(partner.affiliateLink, '_blank', 'noopener,noreferrer');
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'banking': return <Landmark className="h-5 w-5" />;
      case 'insurance': return <Shield className="h-5 w-5" />;
      case 'travel': return <Plane className="h-5 w-5" />;
      case 'services': return <CreditCard className="h-5 w-5" />;
      default: return <Globe2 className="h-5 w-5" />;
    }
  };

  const featuredPartners = PARTNERS.filter(p => p.featured);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold gold-text">
          Partenaires & Intégrations
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Les meilleurs outils et services pour réussir votre expatriation. 
          Profitez de nos partenariats exclusifs.
        </p>
      </div>

      {/* Featured Partners */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Star className="h-5 w-5 text-amber-500" />
          Partenaires vedettes
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {featuredPartners.map((partner) => (
            <Card 
              key={partner.id} 
              className="glass-card-elevated hover:shadow-lg transition-all duration-300 cursor-pointer group relative overflow-hidden"
              onClick={() => handlePartnerClick(partner)}
            >
              {partner.discount && (
                <div className="absolute top-3 right-3">
                  <Badge className="bg-emerald-500 text-white">
                    <Gift className="h-3 w-3 mr-1" />
                    {partner.discount}
                  </Badge>
                </div>
              )}
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-primary/10">
                      {getCategoryIcon(partner.category)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{partner.name}</h3>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                        <span>{partner.rating}</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {partner.description}
                  </p>

                  <ul className="space-y-1">
                    {partner.benefits.slice(0, 3).map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  <Button className="w-full group-hover:bg-primary/90">
                    Découvrir
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Calculators Section */}
      <div className="space-y-6">
        <PartnerCostCalculator />
        <InsuranceComparator />
      </div>

      {/* All Partners by Category */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="flex flex-wrap h-auto gap-2">
          {CATEGORIES.map((category) => (
            <TabsTrigger 
              key={category.value} 
              value={category.value}
              className="flex items-center gap-2"
            >
              <category.icon className="h-4 w-4" />
              {category.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {CATEGORIES.map((category) => (
          <TabsContent key={category.value} value={category.value} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {PARTNERS
                .filter(p => category.value === 'all' || p.category === category.value)
                .map((partner) => (
                  <Card 
                    key={partner.id} 
                    className="glass-card hover:shadow-md transition-all duration-300 cursor-pointer"
                    onClick={() => handlePartnerClick(partner)}
                  >
                    <CardContent className="p-5">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-muted">
                              {getCategoryIcon(partner.category)}
                            </div>
                            <div>
                              <h3 className="font-medium">{partner.name}</h3>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                                <span>{partner.rating}</span>
                              </div>
                            </div>
                          </div>
                          {partner.discount && (
                            <Badge variant="secondary" className="text-xs">
                              <Percent className="h-3 w-3 mr-1" />
                              Promo
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {partner.description}
                        </p>

                        <div className="flex flex-wrap gap-1">
                          {partner.countries.slice(0, 2).map((country) => (
                            <Badge key={country} variant="outline" className="text-xs">
                              {country}
                            </Badge>
                          ))}
                        </div>

                        <Button variant="ghost" className="w-full justify-between">
                          En savoir plus
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Why use partners */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Pourquoi utiliser nos partenaires ?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <h3 className="font-medium flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Testés et approuvés
              </h3>
              <p className="text-sm text-muted-foreground">
                Chaque partenaire est évalué par notre équipe et par notre communauté d'expatriés.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium flex items-center gap-2">
                <Gift className="h-4 w-4 text-primary" />
                Avantages exclusifs
              </h3>
              <p className="text-sm text-muted-foreground">
                Profitez de réductions et bonus réservés aux utilisateurs de System Compass.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-500" />
                Support dédié
              </h3>
              <p className="text-sm text-muted-foreground">
                En cas de problème, notre équipe peut intervenir auprès de nos partenaires.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Become Partner CTA */}
      <Card className="glass-card-elevated bg-gradient-to-r from-primary/10 to-primary/5">
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Devenir partenaire</h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            Vous proposez un service utile aux expatriés ? Rejoignez notre réseau 
            de partenaires et accédez à notre communauté qualifiée.
          </p>
          <Button 
            size="lg"
            onClick={() => toast.info('Programme partenaires bientôt disponible')}
          >
            Nous contacter
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
