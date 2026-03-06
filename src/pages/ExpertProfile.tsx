/**
 * Expert Profile Page - Individual expert view with reviews and booking
 */
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { LocalizedLink as Link } from '@/components/i18n';
import { useExpertById } from '@/hooks/useExpertsDb';
import { useExpertReviews } from '@/hooks/useExpertReviews';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Star,
  MapPin,
  Languages,
  Clock,
  CheckCircle2,
  Award,
  ExternalLink,
  MessageCircle,
  Calendar,
  ArrowLeft,
  Shield,
  Briefcase,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ConsultationBookingForm } from '@/components/marketplace/ConsultationBookingForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const SPECIALTY_LABELS: Record<string, string> = {
  tax_law: 'Droit fiscal',
  immigration: 'Immigration',
  business_setup: 'Création entreprise',
  real_estate: 'Immobilier',
  wealth_management: 'Gestion patrimoine',
  international_tax: 'Fiscalité internationale',
  golden_visa: 'Golden Visa',
  tax_residency: 'Résidence fiscale',
  estate_planning: 'Planification successorale',
  inheritance: 'Successions',
  notary: 'Notariat',
  lump_sum_taxation: 'Forfait fiscal',
  private_banking: 'Banque privée',
};

export default function ExpertProfile() {
  const { id } = useParams<{ id: string }>();
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  
  const { data: expert, isLoading: expertLoading, error } = useExpertById(id);
  const { reviews, stats, fetchReviews } = useExpertReviews(id);
  
  // Fetch reviews on mount
  useEffect(() => {
    if (id) fetchReviews(id);
  }, [id, fetchReviews]);
  
  if (expertLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Skeleton className="h-8 w-32 mb-8" />
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-64" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-24" />
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !expert) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Expert non trouvé</h1>
        <Button asChild>
          <Link to="/experts"><ArrowLeft className="w-4 h-4 mr-2" /> Retour à la marketplace</Link>
        </Button>
      </div>
    );
  }
  
  const initials = expert.display_name.split(' ').map(n => n[0]).join('').slice(0, 2);
  
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      {/* Back navigation */}
      <Button variant="ghost" asChild className="mb-6">
        <Link to="/experts">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à la marketplace
        </Link>
      </Button>
      
      <div className="grid gap-6 md:grid-cols-3">
        {/* Main content */}
        <div className="md:col-span-2 space-y-6">
          {/* Header Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex gap-6">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={expert.avatar_url || undefined} />
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h1 className="text-2xl font-bold">{expert.display_name}</h1>
                      {expert.is_verified && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                        <span className="font-medium text-foreground">
                          {expert.rating_avg.toFixed(1)}
                        </span>
                        <span>({expert.review_count} avis)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>Répond sous {expert.response_time_hours}h</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {expert.specialties.slice(0, 4).map(specialty => (
                        <Badge key={specialty} variant="secondary">
                          {SPECIALTY_LABELS[specialty] || specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Bio */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  À propos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {expert.bio || 'Aucune description disponible.'}
                </p>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Countries & Languages */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <h3 className="font-medium flex items-center gap-2 mb-3">
                      <MapPin className="w-4 h-4" />
                      Pays de compétence
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {expert.countries.map(country => (
                        <Badge key={country} variant="outline">
                          {country}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium flex items-center gap-2 mb-3">
                      <Languages className="w-4 h-4" />
                      Langues parlées
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {expert.languages.map(lang => (
                        <Badge key={lang} variant="outline">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Certifications */}
          {expert.certifications && expert.certifications.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Certifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {expert.certifications.map((cert, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">{cert.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {cert.issuer} • {cert.year}
                          </p>
                        </div>
                        {cert.verified && (
                          <Badge variant="secondary" className="gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Vérifié
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
          
          {/* Reviews */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Avis clients ({stats?.totalReviews || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats && stats.totalReviews > 0 ? (
                  <>
                    {/* Rating distribution */}
                    <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="text-center">
                          <p className="text-4xl font-bold">{stats.averageRating.toFixed(1)}</p>
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < Math.round(stats.averageRating) ? 'fill-amber-500 text-amber-500' : 'text-muted'}`}
                              />
                            ))}
                          </div>
                        </div>
                        <Separator orientation="vertical" className="h-16" />
                        <div className="flex-1 space-y-1">
                          {stats.ratingDistribution.map(({ stars, count, percentage }) => (
                            <div key={stars} className="flex items-center gap-2 text-sm">
                              <span className="w-6">{stars}★</span>
                              <Progress value={percentage} className="h-2 flex-1" />
                              <span className="w-8 text-muted-foreground">{count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* Reviews list */}
                    <div className="space-y-4">
                      {reviews.slice(0, 5).map(review => (
                        <div key={review.id} className="border-b border-border/50 pb-4 last:border-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="flex gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3 h-3 ${i < review.rating ? 'fill-amber-500 text-amber-500' : 'text-muted'}`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {review.authorName}
                              </span>
                              {review.verified && (
                                <Badge variant="outline" className="text-xs">
                                  <Shield className="w-3 h-3 mr-1" />
                                  Achat vérifié
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                          <p className="font-medium mb-1">{review.title}</p>
                          <p className="text-sm text-muted-foreground">{review.content}</p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Aucun avis pour le moment
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-4">
          {/* Pricing Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <p className="text-3xl font-bold text-primary">
                    {expert.hourly_rate} {expert.currency}
                  </p>
                  <p className="text-sm text-muted-foreground">/consultation</p>
                </div>
                
                <div className="space-y-3">
                  <Button className="w-full" onClick={() => setShowBookingDialog(true)}>
                    <Calendar className="w-4 h-4 mr-2" />
                    Réserver une consultation
                  </Button>
                  
                  <Button variant="outline" className="w-full">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Envoyer un message
                  </Button>
                  
                  {expert.booking_url && (
                    <Button variant="ghost" className="w-full" asChild>
                      <a href={expert.booking_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Réserver externe
                      </a>
                    </Button>
                  )}
                </div>
                
                <Separator className="my-6" />
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Répond sous {expert.response_time_hours}h</span>
                  </div>
                  {expert.is_verified && (
                    <div className="flex items-center gap-2 text-emerald-600">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Expert vérifié</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
      
      {/* Booking Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Réserver avec {expert.display_name}</DialogTitle>
          </DialogHeader>
          <ConsultationBookingForm
            expertId={expert.id}
            expertName={expert.display_name}
            priceRange={{ min: expert.hourly_rate, max: expert.hourly_rate * 2, currency: expert.currency }}
            onCancel={() => setShowBookingDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
