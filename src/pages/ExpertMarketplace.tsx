import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
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
  MessageCircle,
  CheckCircle2,
  Shield,
  Award,
  Video,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { ExpertProfileDialog } from '@/components/marketplace/ExpertProfileDialog';
import { VideoConsultationDialog } from '@/components/marketplace/VideoConsultationBooking';
import { ExpertReviews } from '@/components/marketplace/ExpertReviews';
import { useExperts, type Expert } from '@/hooks/useExperts';
import { useAuth } from '@/hooks/useAuth';

const EXPERT_TYPES = [
  { value: 'all', label: 'Tous les experts', icon: Globe2 },
  { value: 'lawyer', label: 'Avocats', icon: Scale },
  { value: 'tax_advisor', label: 'Conseillers fiscaux', icon: Calculator },
  { value: 'immigration', label: 'Immigration', icon: FileText },
  { value: 'notary', label: 'Notaires', icon: FileText },
  { value: 'business', label: 'Business', icon: Building2 },
];

// Adapter to match legacy interface for dialogs
interface LegacyExpert {
  id: string;
  name: string;
  type: string;
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

function expertToLegacy(expert: Expert): LegacyExpert {
  return {
    id: expert.id,
    name: expert.name,
    type: expert.type,
    photo: expert.photoUrl,
    countries: expert.countries,
    languages: expert.languages,
    specialties: expert.specialties,
    rating: expert.rating,
    reviewCount: expert.reviewCount,
    priceRange: { min: expert.priceMin, max: expert.priceMax, currency: expert.currency },
    responseTime: expert.responseTime,
    verified: expert.verified,
    bio: expert.bio,
    experience: expert.experienceYears,
  };
}

export default function ExpertMarketplace() {
  const { user } = useAuth();
  const { experts, isLoading, error, fetchExperts } = useExperts();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedExpert, setSelectedExpert] = useState<LegacyExpert | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showBooking, setShowBooking] = useState(false);

  // Refetch when filters change
  useEffect(() => {
    fetchExperts({ type: selectedType, country: selectedCountry });
  }, [selectedType, selectedCountry, fetchExperts]);

  const allCountries = useMemo(() => {
    const countries = new Set<string>();
    experts.forEach(expert => expert.countries.forEach(c => countries.add(c)));
    return Array.from(countries).sort();
  }, [experts]);

  const filteredExperts = useMemo(() => {
    return experts.filter(expert => {
      const matchesSearch = searchQuery === '' || 
        expert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expert.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
        expert.countries.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSearch;
    });
  }, [experts, searchQuery]);

  const handleViewProfile = (expert: Expert) => {
    setSelectedExpert(expertToLegacy(expert));
    setShowProfile(true);
  };

  const handleBookConsultation = (expert: Expert) => {
    setSelectedExpert(expertToLegacy(expert));
    setShowBooking(true);
  };

  const handleContact = async (expert: Expert) => {
    if (!user) {
      toast.error('Connectez-vous pour contacter un expert');
      return;
    }
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-4">
          <Skeleton className="h-10 w-64 mx-auto" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-16 w-full" />
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

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
        {error && (
          <div className="flex items-center justify-center gap-2 text-amber-500">
            <span className="text-sm">Données de démonstration affichées</span>
            <Button variant="ghost" size="sm" onClick={() => fetchExperts()}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Réessayer
            </Button>
          </div>
        )}
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
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
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
                        <span>{expert.experienceYears} ans d'exp.</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                        <span className="font-medium">{expert.rating.toFixed(1)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{expert.reviewCount} avis</p>
                    </div>
                  </div>

                  {/* Countries */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {expert.countries.slice(0, 3).map((country) => (
                      <Badge key={country} variant="secondary" className="text-xs">
                        {country}
                      </Badge>
                    ))}
                    {expert.countries.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{expert.countries.length - 3}
                      </Badge>
                    )}
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
                          {expert.priceMin}-{expert.priceMax} {expert.currency}
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewProfile(expert);
                        }}
                      >
                        <Star className="h-4 w-4 mr-1" />
                        Profil
                      </Button>
                      <Button 
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBookConsultation(expert);
                        }}
                      >
                        <Video className="h-4 w-4 mr-1" />
                        Réserver
                      </Button>
                      <Button 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleContact(expert);
                        }}
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

      {/* Expert Reviews Section */}
      {filteredExperts.length > 0 && (
        <ExpertReviews 
          expertId={filteredExperts[0].id} 
          expertName={filteredExperts[0].name}
          averageRating={filteredExperts[0].rating}
          totalReviews={filteredExperts[0].reviewCount}
        />
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

      {/* Expert Profile Dialog */}
      {selectedExpert && (
        <ExpertProfileDialog
          expert={selectedExpert}
          open={showProfile}
          onOpenChange={setShowProfile}
        />
      )}

      {/* Video Consultation Dialog */}
      {selectedExpert && (
        <VideoConsultationDialog
          expert={{
            ...selectedExpert,
            pricePerHour: selectedExpert.priceRange.min,
            currency: selectedExpert.priceRange.currency,
            availableSlots: [],
          }}
          open={showBooking}
          onOpenChange={setShowBooking}
        />
      )}
    </div>
  );
}
