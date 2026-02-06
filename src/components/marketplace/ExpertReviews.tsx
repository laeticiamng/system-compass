/**
 * Expert Reviews - Verified review system for marketplace experts
 */
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Star,
  ThumbsUp,
  CheckCircle2,
  MessageCircle,
  Shield,
  Award,
  User,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface Review {
  id: string;
  authorName: string;
  authorCountry: string;
  rating: number;
  title: string;
  content: string;
  verified: boolean;
  helpful: number;
  createdAt: Date;
  expertResponse?: string;
  tags?: string[];
}

interface ExpertReviewsProps {
  expertId: string;
  expertName: string;
  averageRating: number;
  totalReviews: number;
}

// Mock reviews - in production would come from database
const MOCK_REVIEWS: Review[] = [
  {
    id: '1',
    authorName: 'Client vérifié',
    authorCountry: 'Europe',
    rating: 5,
    title: 'Accompagnement exceptionnel',
    content: 'Accompagnement de qualité dans ma transition internationale. Connaissance approfondie des conventions fiscales. Tout a été géré de manière professionnelle et transparente.',
    verified: true,
    helpful: 24,
    createdAt: new Date('2025-11-15'),
    expertResponse: 'Merci pour votre confiance. Ce fut un plaisir de vous accompagner dans ce projet.',
    tags: ['Expatriation', 'Fiscalité', 'Suisse'],
  },
  {
    id: '2',
    authorName: 'Client vérifié',
    authorCountry: 'Europe',
    rating: 5,
    title: 'Très professionnel',
    content: 'Excellente communication et expertise pointue. Réponses rapides et solutions adaptées à ma situation complexe.',
    verified: true,
    helpful: 18,
    createdAt: new Date('2025-10-28'),
    tags: ['Structure patrimoniale', 'Luxembourg'],
  },
  {
    id: '3',
    authorName: 'Client vérifié',
    authorCountry: 'Europe',
    rating: 4,
    title: 'Bon accompagnement',
    content: 'Service de qualité, même si les délais étaient un peu longs. Résultat satisfaisant au final.',
    verified: true,
    helpful: 8,
    createdAt: new Date('2025-09-12'),
    tags: ['Droit fiscal'],
  },
];

const RATING_DISTRIBUTION = [
  { stars: 5, percentage: 78 },
  { stars: 4, percentage: 15 },
  { stars: 3, percentage: 5 },
  { stars: 2, percentage: 1 },
  { stars: 1, percentage: 1 },
];

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            sizeClasses[size],
            star <= rating
              ? 'fill-amber-500 text-amber-500'
              : 'fill-muted text-muted'
          )}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const { t } = useTranslation();
  const [helpful, setHelpful] = useState(review.helpful);
  const [hasVoted, setHasVoted] = useState(false);

  const handleHelpful = () => {
    if (!hasVoted) {
      setHelpful(prev => prev + 1);
      setHasVoted(true);
      toast.success(t('reviews.voteSuccess', 'Merci pour votre vote'));
    }
  };

  return (
    <Card className="glass-card">
      <CardContent className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{review.authorName}</span>
                {review.verified && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    Vérifié
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{review.authorCountry}</span>
                <span>•</span>
                <Calendar className="h-3 w-3" />
                <span>{review.createdAt.toLocaleDateString('fr-FR')}</span>
              </div>
            </div>
          </div>
          <StarRating rating={review.rating} />
        </div>

        {/* Content */}
        <div>
          <h4 className="font-medium mb-2">{review.title}</h4>
          <p className="text-muted-foreground">{review.content}</p>
        </div>

        {/* Tags */}
        {review.tags && review.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {review.tags.map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Expert Response */}
        {review.expertResponse && (
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Réponse de l'expert</span>
            </div>
            <p className="text-sm text-muted-foreground">{review.expertResponse}</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleHelpful}
            disabled={hasVoted}
            className="gap-2"
          >
            <ThumbsUp className={cn('h-4 w-4', hasVoted && 'text-primary')} />
            Utile ({helpful})
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function ExpertReviews({ 
  expertId: _expertId,
  expertName,
  averageRating, 
  totalReviews 
}: ExpertReviewsProps) {
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newReview, setNewReview] = useState('');
  const { t } = useTranslation();

  const handleSubmitReview = () => {
    if (newRating === 0) {
      toast.error(t('reviews.selectRating', 'Veuillez sélectionner une note'));
      return;
    }
    if (newReview.trim().length < 20) {
      toast.error(t('reviews.minLength', 'Votre avis doit contenir au moins 20 caractères'));
      return;
    }
    toast.success(t('reviews.submitted', 'Avis soumis pour vérification'));
    setShowWriteReview(false);
    setNewRating(0);
    setNewReview('');
  };

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Avis vérifiés sur {expertName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Rating Overview */}
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-primary">{averageRating.toFixed(1)}</div>
                <StarRating rating={Math.round(averageRating)} size="md" />
                <div className="text-sm text-muted-foreground mt-1">
                  {totalReviews} avis
                </div>
              </div>
              
              <div className="flex-1 space-y-2">
                {RATING_DISTRIBUTION.map(({ stars, percentage }) => (
                  <div key={stars} className="flex items-center gap-2">
                    <span className="text-sm w-3">{stars}</span>
                    <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                    <Progress value={percentage} className="h-2 flex-1" />
                    <span className="text-xs text-muted-foreground w-8">{percentage}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Trust Badges */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-emerald-500/10 rounded-lg">
                <Shield className="h-5 w-5 text-emerald-500" />
                <div>
                  <p className="font-medium text-sm">Avis vérifiés</p>
                  <p className="text-xs text-muted-foreground">
                    Seuls les clients ayant effectué une consultation peuvent laisser un avis
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowWriteReview(!showWriteReview)}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Écrire un avis
              </Button>
            </div>
          </div>

          {/* Write Review Form */}
          {showWriteReview && (
            <div className="mt-6 p-4 bg-secondary/30 rounded-lg space-y-4">
              <div>
                <Label className="mb-2 block">Votre note</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setNewRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={cn(
                          'h-8 w-8',
                          star <= newRating
                            ? 'fill-amber-500 text-amber-500'
                            : 'fill-muted text-muted hover:fill-amber-300 hover:text-amber-300'
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="review-content">Votre avis</Label>
                <Textarea
                  id="review-content"
                  placeholder="Partagez votre expérience..."
                  value={newReview}
                  onChange={(e) => setNewReview(e.target.value)}
                  className="mt-2"
                  rows={4}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Minimum 20 caractères ({newReview.length}/20)
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSubmitReview}>Soumettre</Button>
                <Button variant="ghost" onClick={() => setShowWriteReview(false)}>
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review List */}
      <div className="space-y-4">
        {MOCK_REVIEWS.map(review => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      {/* Load More */}
      <div className="text-center">
        <Button variant="outline">
          Voir plus d'avis
        </Button>
      </div>
    </div>
  );
}
