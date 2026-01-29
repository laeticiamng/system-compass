/**
 * Expert Profile Dialog - Full expert profile with reviews and booking
 */
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Star, 
  MapPin, 
  Languages, 
  Clock, 
  CheckCircle2, 
  MessageCircle,
  Video,
  
  Award,
  Briefcase,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { VideoConsultationDialog } from './VideoConsultationBooking';

interface Review {
  id: string;
  author: string;
  date: string;
  rating: number;
  comment: string;
  helpful: number;
  verified: boolean;
}

interface Expert {
  id: string;
  name: string;
  type: string;
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

interface ExpertProfileDialogProps {
  expert: Expert;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MOCK_REVIEWS: Review[] = [
  {
    id: '1',
    author: 'Jean-Pierre M.',
    date: '2024-01-15',
    rating: 5,
    comment: 'Excellent accompagnement pour ma relocalisation en Suisse. Très professionnel et disponible.',
    helpful: 12,
    verified: true,
  },
  {
    id: '2',
    author: 'Marie L.',
    date: '2024-01-10',
    rating: 4,
    comment: 'Bons conseils fiscaux, réponses claires à mes questions. Je recommande.',
    helpful: 8,
    verified: true,
  },
  {
    id: '3',
    author: 'Thomas D.',
    date: '2023-12-28',
    rating: 5,
    comment: 'Expertise pointue sur le régime NHR Portugal. M\'a fait économiser beaucoup.',
    helpful: 15,
    verified: true,
  },
];

export function ExpertProfileDialog({ expert, open, onOpenChange }: ExpertProfileDialogProps) {
  const [showBooking, setShowBooking] = useState(false);
  const [activeTab, setActiveTab] = useState('about');

  const ratingDistribution = {
    5: 75,
    4: 18,
    3: 5,
    2: 1,
    1: 1,
  };

  const bookingExpert = {
    ...expert,
    pricePerHour: expert.priceRange.min,
    currency: expert.priceRange.currency,
    availableSlots: [],
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="text-2xl bg-gradient-to-br from-primary/20 to-primary/40 text-primary">
                  {expert.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <DialogTitle className="flex items-center gap-2 text-xl">
                  {expert.name}
                  {expert.verified && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                </DialogTitle>
                <p className="text-muted-foreground">{expert.type}</p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                    <span className="font-medium">{expert.rating}</span>
                    <span className="text-muted-foreground">({expert.reviewCount} avis)</span>
                  </div>
                  <Badge variant="secondary">
                    <Briefcase className="h-3 w-3 mr-1" />
                    {expert.experience} ans
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">
                  {expert.priceRange.min}-{expert.priceRange.max}{expert.priceRange.currency}
                </p>
                <p className="text-sm text-muted-foreground">/consultation</p>
              </div>
            </div>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="about">Profil</TabsTrigger>
              <TabsTrigger value="reviews">Avis ({expert.reviewCount})</TabsTrigger>
              <TabsTrigger value="credentials">Qualifications</TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="space-y-4 mt-4">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">À propos</h3>
                  <p className="text-muted-foreground">{expert.bio}</p>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Pays couverts
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {expert.countries.map(country => (
                        <Badge key={country} variant="secondary">{country}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Languages className="h-4 w-4" />
                      Langues
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {expert.languages.map(lang => (
                        <Badge key={lang} variant="outline">{lang}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Spécialités
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {expert.specialties.map(specialty => (
                      <Badge key={specialty} variant="secondary">{specialty}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Temps de réponse moyen</span>
                  </div>
                  <Badge>{expert.responseTime}</Badge>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-4 mt-4">
              {/* Rating Summary */}
              <Card>
                <CardContent className="p-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-primary mb-2">{expert.rating}</div>
                      <div className="flex items-center justify-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star 
                            key={star} 
                            className={`h-5 w-5 ${star <= expert.rating ? 'fill-amber-500 text-amber-500' : 'text-muted'}`}
                          />
                        ))}
                      </div>
                      <p className="text-muted-foreground">Basé sur {expert.reviewCount} avis</p>
                    </div>
                    <div className="space-y-2">
                      {Object.entries(ratingDistribution).reverse().map(([stars, percentage]) => (
                        <div key={stars} className="flex items-center gap-2">
                          <span className="text-sm w-12">{stars} étoiles</span>
                          <Progress value={percentage} className="flex-1 h-2" />
                          <span className="text-sm text-muted-foreground w-8">{percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Reviews List */}
              <div className="space-y-4">
                {MOCK_REVIEWS.map(review => (
                  <Card key={review.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{review.author}</span>
                            {review.verified && (
                              <Badge variant="outline" className="text-xs">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Vérifié
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(review.date).toLocaleDateString('fr-FR', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star 
                              key={star} 
                              className={`h-4 w-4 ${star <= review.rating ? 'fill-amber-500 text-amber-500' : 'text-muted'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm mb-3">{review.comment}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                          <ThumbsUp className="h-4 w-4" />
                          Utile ({review.helpful})
                        </button>
                        <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                          <ThumbsDown className="h-4 w-4" />
                          Pas utile
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="credentials" className="space-y-4 mt-4">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-4">Vérifications</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      <div>
                        <p className="font-medium">Identité vérifiée</p>
                        <p className="text-sm text-muted-foreground">Document officiel vérifié</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      <div>
                        <p className="font-medium">Qualifications vérifiées</p>
                        <p className="text-sm text-muted-foreground">Diplômes et certifications confirmés</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      <div>
                        <p className="font-medium">Assurance RC Pro</p>
                        <p className="text-sm text-muted-foreground">Couverture professionnelle active</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-4">Formation & Expérience</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                      <div>
                        <p className="font-medium">{expert.experience} ans d'expérience</p>
                        <p className="text-sm text-muted-foreground">Spécialisation en {expert.specialties[0]}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                      <div>
                        <p className="font-medium">+{expert.reviewCount} consultations réalisées</p>
                        <p className="text-sm text-muted-foreground">Sur la plateforme System Compass</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex gap-3 mt-4 pt-4 border-t">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              <MessageCircle className="h-4 w-4 mr-2" />
              Envoyer un message
            </Button>
            <Button className="flex-1" onClick={() => setShowBooking(true)}>
              <Video className="h-4 w-4 mr-2" />
              Réserver une consultation
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <VideoConsultationDialog
        expert={bookingExpert}
        open={showBooking}
        onOpenChange={setShowBooking}
      />
    </>
  );
}
