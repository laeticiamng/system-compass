import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Scale, 
  FileText, 
  Globe2, 
  Calculator, 
  Building2, 
  Star, 
  MapPin, 
  Languages, 
  Clock, 
  Euro, 
  Search,
  ExternalLink,
  MessageCircle,
  CheckCircle2,
  Shield,
  Award
} from 'lucide-react';
import { toast } from 'sonner';

interface Expert {
  id: string;
  name: string;
  type: 'lawyer' | 'tax_advisor' | 'immigration' | 'notary' | 'business';
  photo?: string;
  countries: string[];
  languages: string[];
  specialties: string[];
  rating: number;
  reviewCount: number;
  priceRange: { min: number; max: number; currency: string };
  responseTime: string;
  verified: boolean;
  bio: string;
  experience: number;
}

const EXPERTS: Expert[] = [
  {
    id: '1',
    name: 'Maître Sophie Laurent',
    type: 'lawyer',
    countries: ['France', 'Belgium', 'Luxembourg'],
    languages: ['Français', 'English', 'Néerlandais'],
    specialties: ['Droit fiscal international', 'Expatriation', 'Structuration patrimoniale'],
    rating: 4.9,
    reviewCount: 156,
    priceRange: { min: 200, max: 400, currency: '€' },
    responseTime: '24h',
    verified: true,
    bio: 'Avocate au Barreau de Paris, spécialisée depuis 15 ans dans l\'accompagnement des expatriés et la fiscalité internationale.',
    experience: 15,
  },
  {
    id: '2',
    name: 'Dr. Michael Weber',
    type: 'tax_advisor',
    countries: ['Germany', 'Switzerland', 'Austria'],
    languages: ['Deutsch', 'English', 'Français'],
    specialties: ['Steueroptimierung', 'Holding structures', 'Cross-border taxation'],
    rating: 4.8,
    reviewCount: 98,
    priceRange: { min: 250, max: 500, currency: '€' },
    responseTime: '48h',
    verified: true,
    bio: 'Expert-comptable et conseiller fiscal avec une expertise reconnue en structuration internationale.',
    experience: 20,
  },
  {
    id: '3',
    name: 'Emma Rodriguez',
    type: 'immigration',
    countries: ['Spain', 'Portugal', 'Andorra'],
    languages: ['Español', 'Português', 'English', 'Français'],
    specialties: ['Golden Visa', 'NHR Portugal', 'Beckham Law Spain', 'Residency'],
    rating: 4.9,
    reviewCount: 234,
    priceRange: { min: 150, max: 350, currency: '€' },
    responseTime: '12h',
    verified: true,
    bio: 'Consultante en immigration spécialisée dans les programmes de résidence européens depuis 10 ans.',
    experience: 10,
  },
  {
    id: '4',
    name: 'James Chen',
    type: 'business',
    countries: ['Singapore', 'Hong Kong', 'UAE'],
    languages: ['English', '中文', 'Français'],
    specialties: ['Company formation', 'Offshore structures', 'Banking'],
    rating: 4.7,
    reviewCount: 87,
    priceRange: { min: 300, max: 600, currency: '$' },
    responseTime: '24h',
    verified: true,
    bio: 'Business consultant avec 12 ans d\'expérience dans la création de sociétés en Asie et au Moyen-Orient.',
    experience: 12,
  },
  {
    id: '5',
    name: 'Maître Pierre Dubois',
    type: 'notary',
    countries: ['France', 'Monaco'],
    languages: ['Français', 'English', 'Italiano'],
    specialties: ['Immobilier international', 'Successions transfrontalières', 'Donations'],
    rating: 4.8,
    reviewCount: 67,
    priceRange: { min: 180, max: 350, currency: '€' },
    responseTime: '72h',
    verified: true,
    bio: 'Notaire spécialisé dans les actes à dimension internationale et les successions complexes.',
    experience: 18,
  },
  {
    id: '6',
    name: 'Dr. Sarah Williams',
    type: 'tax_advisor',
    countries: ['UK', 'Ireland', 'Malta'],
    languages: ['English', 'Français'],
    specialties: ['UK Non-Dom', 'Remittance basis', 'Ireland tax residence'],
    rating: 4.9,
    reviewCount: 145,
    priceRange: { min: 280, max: 550, currency: '£' },
    responseTime: '24h',
    verified: true,
    bio: 'Tax advisor certifiée avec expertise pointue sur les régimes fiscaux britanniques et irlandais.',
    experience: 14,
  },
  {
    id: '7',
    name: 'Marco Rossi',
    type: 'lawyer',
    countries: ['Italy', 'Switzerland', 'San Marino'],
    languages: ['Italiano', 'Français', 'English', 'Deutsch'],
    specialties: ['Flat tax Italy', 'Swiss permits', 'Art & wealth'],
    rating: 4.6,
    reviewCount: 52,
    priceRange: { min: 200, max: 400, currency: '€' },
    responseTime: '48h',
    verified: true,
    bio: 'Avocat franco-italien spécialisé dans la relocalisation fiscale et le conseil en gestion de patrimoine.',
    experience: 11,
  },
  {
    id: '8',
    name: 'Ana Silva',
    type: 'immigration',
    countries: ['Brazil', 'Argentina', 'Uruguay', 'Chile'],
    languages: ['Português', 'Español', 'English'],
    specialties: ['Mercosur residency', 'Business visas', 'Investment migration'],
    rating: 4.7,
    reviewCount: 78,
    priceRange: { min: 120, max: 280, currency: '$' },
    responseTime: '24h',
    verified: true,
    bio: 'Spécialiste de l\'immigration en Amérique du Sud avec focus sur les programmes investisseurs.',
    experience: 8,
  },
];

const EXPERT_TYPES = [
  { value: 'all', label: 'Tous les experts', icon: Globe2 },
  { value: 'lawyer', label: 'Avocats', icon: Scale },
  { value: 'tax_advisor', label: 'Conseillers fiscaux', icon: Calculator },
  { value: 'immigration', label: 'Immigration', icon: FileText },
  { value: 'notary', label: 'Notaires', icon: FileText },
  { value: 'business', label: 'Business', icon: Building2 },
];

export default function ExpertMarketplace() {
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState('all');

  const allCountries = useMemo(() => {
    const countries = new Set<string>();
    EXPERTS.forEach(expert => expert.countries.forEach(c => countries.add(c)));
    return Array.from(countries).sort();
  }, []);

  const filteredExperts = useMemo(() => {
    return EXPERTS.filter(expert => {
      const matchesType = selectedType === 'all' || expert.type === selectedType;
      const matchesCountry = selectedCountry === 'all' || expert.countries.includes(selectedCountry);
      const matchesSearch = searchQuery === '' || 
        expert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expert.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
        expert.countries.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesType && matchesCountry && matchesSearch;
    });
  }, [selectedType, selectedCountry, searchQuery]);

  const handleContact = (expert: Expert) => {
    toast.success(`Demande de contact envoyée à ${expert.name}`, {
      description: 'Vous recevrez une réponse sous ' + expert.responseTime,
    });
  };

  const getTypeLabel = (type: string) => {
    const found = EXPERT_TYPES.find(t => t.value === type);
    return found?.label || type;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lawyer': return <Scale className="h-4 w-4" />;
      case 'tax_advisor': return <Calculator className="h-4 w-4" />;
      case 'immigration': return <FileText className="h-4 w-4" />;
      case 'notary': return <FileText className="h-4 w-4" />;
      case 'business': return <Building2 className="h-4 w-4" />;
      default: return <Globe2 className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold gold-text">
          Marketplace d'Experts
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Trouvez les meilleurs experts pour votre projet d'expatriation : avocats, 
          conseillers fiscaux, spécialistes en immigration.
        </p>
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card p-4 text-center">
          <Shield className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
          <p className="text-sm font-medium">Experts Vérifiés</p>
          <p className="text-xs text-muted-foreground">100% certifiés</p>
        </Card>
        <Card className="glass-card p-4 text-center">
          <Award className="h-8 w-8 mx-auto mb-2 text-amber-500" />
          <p className="text-sm font-medium">Qualité Garantie</p>
          <p className="text-xs text-muted-foreground">Note min. 4.5/5</p>
        </Card>
        <Card className="glass-card p-4 text-center">
          <Clock className="h-8 w-8 mx-auto mb-2 text-blue-500" />
          <p className="text-sm font-medium">Réponse Rapide</p>
          <p className="text-xs text-muted-foreground">Sous 24-48h</p>
        </Card>
        <Card className="glass-card p-4 text-center">
          <Euro className="h-8 w-8 mx-auto mb-2 text-primary" />
          <p className="text-sm font-medium">Tarifs Transparents</p>
          <p className="text-xs text-muted-foreground">Sans surprise</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, spécialité, pays..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Type d'expert" />
              </SelectTrigger>
              <SelectContent>
                {EXPERT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <type.icon className="h-4 w-4" />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger>
                <SelectValue placeholder="Pays" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les pays</SelectItem>
                {allCountries.map((country) => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          {filteredExperts.length} expert{filteredExperts.length > 1 ? 's' : ''} trouvé{filteredExperts.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Expert Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {filteredExperts.map((expert) => (
          <Card key={expert.id} className="glass-card-elevated hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-2xl font-bold text-primary">
                    {expert.name.split(' ').map(n => n[0]).join('')}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{expert.name}</h3>
                        {expert.verified && (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {getTypeIcon(expert.type)}
                        <span>{getTypeLabel(expert.type)}</span>
                        <span>•</span>
                        <span>{expert.experience} ans d'exp.</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                        <span className="font-medium">{expert.rating}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{expert.reviewCount} avis</p>
                    </div>
                  </div>

                  {/* Countries */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {expert.countries.map((country) => (
                      <Badge key={country} variant="secondary" className="text-xs">
                        {country}
                      </Badge>
                    ))}
                  </div>

                  {/* Languages */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Languages className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {expert.languages.join(', ')}
                    </span>
                  </div>

                  {/* Specialties */}
                  <div className="flex flex-wrap gap-1">
                    {expert.specialties.slice(0, 3).map((specialty) => (
                      <Badge key={specialty} variant="outline" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                    {expert.specialties.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{expert.specialties.length - 3}
                      </Badge>
                    )}
                  </div>

                  {/* Price & Action */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div>
                      <p className="text-sm">
                        <span className="font-medium text-primary">
                          {expert.priceRange.min}-{expert.priceRange.max}{expert.priceRange.currency}
                        </span>
                        <span className="text-muted-foreground">/consultation</span>
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Réponse sous {expert.responseTime}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => toast.info('Profil complet bientôt disponible')}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Profil
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleContact(expert)}
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Contact
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredExperts.length === 0 && (
        <Card className="glass-card p-12 text-center">
          <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Aucun expert trouvé</h3>
          <p className="text-muted-foreground">
            Essayez de modifier vos critères de recherche
          </p>
        </Card>
      )}

      {/* CTA */}
      <Card className="glass-card-elevated bg-gradient-to-r from-primary/10 to-primary/5">
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Vous êtes expert ?</h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            Rejoignez notre réseau d'experts vérifiés et accédez à des clients qualifiés 
            en recherche active de conseils pour leur projet d'expatriation.
          </p>
          <Button 
            size="lg"
            onClick={() => toast.info('Inscription partenaires bientôt disponible')}
          >
            Devenir partenaire expert
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
