import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Map, Globe, CheckCircle, Clock, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface CountryProgress {
  countryId: string;
  countryName: string;
  flag: string;
  status: 'exploring' | 'planning' | 'preparing' | 'relocating' | 'settled';
  progress: number;
  lastActivity: string;
  exitKeyActive?: boolean;
}

const STATUS_CONFIG = {
  exploring: { label: 'Exploration', color: 'bg-blue-500', order: 1 },
  planning: { label: 'Planification', color: 'bg-purple-500', order: 2 },
  preparing: { label: 'Préparation', color: 'bg-amber-500', order: 3 },
  relocating: { label: 'Relocalisation', color: 'bg-orange-500', order: 4 },
  settled: { label: 'Installé', color: 'bg-green-500', order: 5 },
};

const MOCK_PROGRESS: CountryProgress[] = [
  {
    countryId: 'portugal',
    countryName: 'Portugal',
    flag: '🇵🇹',
    status: 'preparing',
    progress: 65,
    lastActivity: 'Visa D7 soumis',
    exitKeyActive: true,
  },
  {
    countryId: 'spain',
    countryName: 'Espagne',
    flag: '🇪🇸',
    status: 'exploring',
    progress: 25,
    lastActivity: 'Profil consulté',
  },
  {
    countryId: 'uae',
    countryName: 'Émirats Arabes Unis',
    flag: '🇦🇪',
    status: 'planning',
    progress: 40,
    lastActivity: 'Comparaison fiscale',
  },
];

export function CountryProgressTracker() {
  const countries = MOCK_PROGRESS.sort(
    (a, b) => STATUS_CONFIG[b.status].order - STATUS_CONFIG[a.status].order
  );

  const activeCount = countries.filter(c => c.status !== 'exploring').length;

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Map className="h-5 w-5 text-primary" />
            Progression par Pays
          </CardTitle>
          <Badge variant="outline">
            {activeCount} actif{activeCount > 1 ? 's' : ''}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {countries.map(country => {
          const status = STATUS_CONFIG[country.status];

          return (
            <div
              key={country.countryId}
              className="p-4 border rounded-lg hover:border-primary/50 transition-colors group"
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">{country.flag}</span>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{country.countryName}</h4>
                      {country.exitKeyActive && (
                        <Badge className="bg-primary/10 text-primary text-xs">
                          Exit Key actif
                        </Badge>
                      )}
                    </div>
                    <Badge className={`${status.color} text-white`}>
                      {status.label}
                    </Badge>
                  </div>

                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progression</span>
                      <span className="font-medium">{country.progress}%</span>
                    </div>
                    <Progress value={country.progress} className="h-1.5" />
                  </div>

                  <div className="flex items-center justify-between mt-3 text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {country.lastActivity}
                    </span>
                    <Link to={`/country/${country.countryId}`}>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Voir détails
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="mt-4 pt-3 border-t">
                <div className="flex items-center justify-between">
                  {Object.entries(STATUS_CONFIG).map(([key, config], index) => {
                    const isActive = STATUS_CONFIG[country.status].order >= config.order;
                    const isCurrent = country.status === key;
                    
                    return (
                      <div key={key} className="flex items-center">
                        <div className={`
                          w-6 h-6 rounded-full flex items-center justify-center text-xs
                          ${isActive 
                            ? isCurrent 
                              ? `${config.color} text-white ring-2 ring-offset-2 ring-${config.color}` 
                              : 'bg-green-500 text-white'
                            : 'bg-muted text-muted-foreground'
                          }
                        `}>
                          {isActive && !isCurrent ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : (
                            index + 1
                          )}
                        </div>
                        {index < Object.keys(STATUS_CONFIG).length - 1 && (
                          <div className={`w-8 h-0.5 ${
                            STATUS_CONFIG[country.status].order > config.order
                              ? 'bg-green-500'
                              : 'bg-muted'
                          }`} />
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-1">
                  {Object.values(STATUS_CONFIG).map((config, index) => (
                    <span key={index} className="text-[10px] text-muted-foreground w-12 text-center">
                      {config.label.split(' ')[0]}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        {/* Add Country CTA */}
        <Link to="/countries">
          <Button variant="outline" className="w-full mt-2">
            <Globe className="h-4 w-4 mr-2" />
            Explorer d'autres pays
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
