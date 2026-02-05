/**
 * Expert Country Widget - Shows recommended experts for a country
 */
import { Link } from 'react-router-dom';
import { useExpertsByCountry } from '@/hooks/useExpertsDb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, CheckCircle2, ArrowRight, Users } from 'lucide-react';

const SPECIALTY_LABELS: Record<string, string> = {
  tax_law: 'Fiscal',
  immigration: 'Immigration',
  business_setup: 'Business',
  real_estate: 'Immobilier',
  wealth_management: 'Patrimoine',
};

interface ExpertCountryWidgetProps {
  countryId: string;
  countryName: string;
}

export function ExpertCountryWidget({ countryId, countryName }: ExpertCountryWidgetProps) {
  const { data: experts, isLoading } = useExpertsByCountry(countryId, 3);
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2].map(i => (
            <Skeleton key={i} className="h-20" />
          ))}
        </CardContent>
      </Card>
    );
  }
  
  if (!experts || experts.length === 0) {
    return null; // Don't show widget if no experts
  }
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="w-5 h-5 text-primary" />
          Experts pour {countryName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {experts.map(expert => {
          const initials = expert.display_name.split(' ').map(n => n[0]).join('').slice(0, 2);
          
          return (
            <Link
              key={expert.id}
              to={`/experts/${expert.id}`}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <Avatar className="w-12 h-12">
                <AvatarImage src={expert.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="font-medium truncate">{expert.display_name}</span>
                  {expert.is_verified && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-0.5">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    {expert.rating_avg.toFixed(1)}
                  </span>
                  <span>•</span>
                  <span>{expert.hourly_rate} {expert.currency}</span>
                </div>
                <div className="flex gap-1 mt-1">
                  {expert.specialties.slice(0, 2).map(s => (
                    <Badge key={s} variant="outline" className="text-xs py-0">
                      {SPECIALTY_LABELS[s] || s}
                    </Badge>
                  ))}
                </div>
              </div>
            </Link>
          );
        })}
        
        <Button variant="ghost" className="w-full" asChild>
          <Link to={`/experts?country=${countryId}`}>
            Voir tous les experts
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
