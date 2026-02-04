import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Briefcase, MapPin, Calendar, Award, 
  FileText, Users
} from 'lucide-react';

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  country: string;
  year: number;
  outcome: string;
  tags: string[];
  testimonial?: {
    quote: string;
    author: string;
    role: string;
  };
}

interface ExpertPortfolioProps {
  expertId: string;
  expertName: string;
  specialties: string[];
  yearsExperience: number;
  clientsHelped: number;
  successRate: number;
  portfolioItems: PortfolioItem[];
}

const MOCK_PORTFOLIO: PortfolioItem[] = [
  {
    id: '1',
    title: 'Relocalisation famille expatriée au Portugal',
    description: 'Accompagnement complet d\'une famille de 4 personnes dans leur installation à Lisbonne : visa D7, logement, scolarité, ouverture de comptes.',
    country: 'Portugal',
    year: 2025,
    outcome: 'Installation réussie en 4 mois',
    tags: ['Visa D7', 'Famille', 'Lisbonne'],
    testimonial: {
      quote: 'Grâce à son expertise, nous avons évité de nombreuses erreurs et gagné un temps précieux.',
      author: 'Marie & Thomas',
      role: 'Clients particuliers',
    },
  },
  {
    id: '2',
    title: 'Création de filiale aux Émirats',
    description: 'Structuration juridique et fiscale pour une PME tech française souhaitant s\'implanter à Dubaï avec 5 employés.',
    country: 'UAE',
    year: 2024,
    outcome: 'Filiale opérationnelle en 6 semaines',
    tags: ['B2B', 'Tech', 'Free Zone'],
  },
  {
    id: '3',
    title: 'Optimisation fiscale nomade digital',
    description: 'Réorganisation de la résidence fiscale pour un développeur freelance travaillant entre l\'Europe et l\'Asie.',
    country: 'Singapour',
    year: 2024,
    outcome: 'Économie fiscale de 40%',
    tags: ['Freelance', 'Fiscalité', 'Nomade'],
    testimonial: {
      quote: 'Une expertise rare sur les situations internationales complexes.',
      author: 'Julien P.',
      role: 'Développeur freelance',
    },
  },
];

export function ExpertPortfolio({
  specialties = ['Expatriation', 'Fiscalité internationale', 'Création d\'entreprise'],
  yearsExperience = 12,
  clientsHelped = 340,
  successRate = 97,
  portfolioItems = MOCK_PORTFOLIO,
}: Partial<ExpertPortfolioProps>) {
  return (
    <div className="space-y-6">
      {/* Expert Stats */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Expertise & Réalisations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <Calendar className="h-6 w-6 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold">{yearsExperience}</p>
              <p className="text-xs text-muted-foreground">Années d'expérience</p>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <Users className="h-6 w-6 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold">{clientsHelped}+</p>
              <p className="text-xs text-muted-foreground">Clients accompagnés</p>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <Award className="h-6 w-6 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold">{successRate}%</p>
              <p className="text-xs text-muted-foreground">Taux de réussite</p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-sm">Spécialités</h4>
            <div className="flex flex-wrap gap-2">
              {specialties.map((specialty, index) => (
                <Badge key={index} variant="secondary">
                  {specialty}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Items */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Cas Clients (Anonymisés)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {portfolioItems.map((item) => (
            <div
              key={item.id}
              className="p-4 border rounded-lg hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{item.title}</h4>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {item.country}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {item.description}
                  </p>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {item.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      {item.year}
                    </span>
                    <Badge className="bg-green-500/10 text-green-700 border-green-500/30">
                      {item.outcome}
                    </Badge>
                  </div>
                </div>
              </div>

              {item.testimonial && (
                <div className="mt-4 p-3 bg-primary/5 rounded-lg border-l-4 border-primary">
                  <p className="text-sm italic mb-2">"{item.testimonial.quote}"</p>
                  <p className="text-xs text-muted-foreground">
                    — {item.testimonial.author}, {item.testimonial.role}
                  </p>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* CTA */}
      <Card className="glass-card bg-gradient-to-r from-primary/5 to-primary/10">
        <CardContent className="py-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h4 className="font-medium">Intéressé par cet expert ?</h4>
              <p className="text-sm text-muted-foreground">
                Réservez une consultation de 30 minutes pour discuter de votre projet.
              </p>
            </div>
            <Button>
              <Calendar className="h-4 w-4 mr-2" />
              Prendre rendez-vous
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
