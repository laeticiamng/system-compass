/**
 * Weather Widget - Display weather for target country
 */
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Cloud,
  Sun,
  CloudRain,
  CloudSnow,
  Wind,
  Droplets,
  MapPin,
  RefreshCw,
  CloudSun,
  CloudFog
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WeatherData {
  city: string;
  country: string;
  temperature: number;
  feelsLike: number;
  condition: 'sunny' | 'cloudy' | 'partly-cloudy' | 'rainy' | 'snowy' | 'foggy' | 'windy';
  humidity: number;
  windSpeed: number;
  forecast: {
    day: string;
    high: number;
    low: number;
    condition: 'sunny' | 'cloudy' | 'partly-cloudy' | 'rainy' | 'snowy';
  }[];
}

// Mock weather data generator based on country
function getMockWeather(countryId: string): WeatherData {
  const weatherByCountry: Record<string, Partial<WeatherData>> = {
    portugal: { city: 'Lisbonne', temperature: 18, condition: 'sunny', humidity: 65 },
    uae: { city: 'Dubaï', temperature: 32, condition: 'sunny', humidity: 45 },
    singapore: { city: 'Singapour', temperature: 31, condition: 'partly-cloudy', humidity: 85 },
    switzerland: { city: 'Zurich', temperature: 4, condition: 'cloudy', humidity: 75 },
    germany: { city: 'Berlin', temperature: 2, condition: 'snowy', humidity: 80 },
    spain: { city: 'Madrid', temperature: 12, condition: 'sunny', humidity: 55 },
    thailand: { city: 'Bangkok', temperature: 33, condition: 'partly-cloudy', humidity: 78 },
    japan: { city: 'Tokyo', temperature: 8, condition: 'cloudy', humidity: 60 },
    canada: { city: 'Toronto', temperature: -5, condition: 'snowy', humidity: 70 },
    australia: { city: 'Sydney', temperature: 26, condition: 'sunny', humidity: 60 },
  };

  const defaults = weatherByCountry[countryId] || { city: 'Paris', temperature: 10, condition: 'cloudy' as const, humidity: 70 };
  
  return {
    city: defaults.city || 'Ville',
    country: countryId,
    temperature: defaults.temperature || 15,
    feelsLike: (defaults.temperature || 15) - 2,
    condition: defaults.condition || 'cloudy',
    humidity: defaults.humidity || 65,
    windSpeed: Math.floor(Math.random() * 20) + 5,
    forecast: [
      { day: 'Lun', high: (defaults.temperature || 15) + 2, low: (defaults.temperature || 15) - 5, condition: 'sunny' },
      { day: 'Mar', high: (defaults.temperature || 15) + 1, low: (defaults.temperature || 15) - 4, condition: 'partly-cloudy' },
      { day: 'Mer', high: (defaults.temperature || 15), low: (defaults.temperature || 15) - 6, condition: 'cloudy' },
      { day: 'Jeu', high: (defaults.temperature || 15) - 1, low: (defaults.temperature || 15) - 7, condition: 'rainy' },
      { day: 'Ven', high: (defaults.temperature || 15) + 3, low: (defaults.temperature || 15) - 3, condition: 'sunny' },
    ],
  };
}

const conditionIcons = {
  sunny: Sun,
  cloudy: Cloud,
  'partly-cloudy': CloudSun,
  rainy: CloudRain,
  snowy: CloudSnow,
  foggy: CloudFog,
  windy: Wind,
};

const conditionLabels = {
  sunny: 'Ensoleillé',
  cloudy: 'Nuageux',
  'partly-cloudy': 'Partiellement nuageux',
  rainy: 'Pluvieux',
  snowy: 'Neigeux',
  foggy: 'Brumeux',
  windy: 'Venteux',
};

const conditionColors = {
  sunny: 'text-amber-500',
  cloudy: 'text-slate-400',
  'partly-cloudy': 'text-sky-400',
  rainy: 'text-blue-500',
  snowy: 'text-cyan-300',
  foggy: 'text-slate-300',
  windy: 'text-teal-400',
};

interface WeatherWidgetProps {
  countryId?: string;
  compact?: boolean;
}

export function WeatherWidget({ countryId = 'portugal', compact = false }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchWeather = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setWeather(getMockWeather(countryId));
      setLastUpdate(new Date());
      setIsLoading(false);
    }, 500);
  };

  useEffect(() => {
    fetchWeather();
  }, [countryId]);

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!weather) return null;

  const WeatherIcon = conditionIcons[weather.condition];

  if (compact) {
    return (
      <Card className="glass-card">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <WeatherIcon className={cn('h-6 w-6', conditionColors[weather.condition])} />
              <div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {weather.city}
                </p>
                <p className="text-lg font-bold">{weather.temperature}°C</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={fetchWeather}>
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 via-transparent to-blue-500/5" />
      <CardHeader className="relative pb-2">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-base">
            <MapPin className="h-4 w-4 text-primary" />
            Météo {weather.city}
          </span>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={fetchWeather}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="relative space-y-4">
        {/* Current Weather */}
        <div className="flex items-center gap-4">
          <div className={cn(
            'h-20 w-20 rounded-full flex items-center justify-center',
            'bg-gradient-to-br from-white/10 to-white/5'
          )}>
            <WeatherIcon className={cn('h-12 w-12', conditionColors[weather.condition])} />
          </div>
          
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">{weather.temperature}</span>
              <span className="text-2xl text-muted-foreground">°C</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Ressenti {weather.feelsLike}°C
            </p>
            <Badge variant="secondary" className="mt-1">
              {conditionLabels[weather.condition]}
            </Badge>
          </div>
        </div>
        
        {/* Weather Details */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30">
            <Droplets className="h-4 w-4 text-blue-400" />
            <div>
              <p className="text-xs text-muted-foreground">Humidité</p>
              <p className="font-medium text-sm">{weather.humidity}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30">
            <Wind className="h-4 w-4 text-teal-400" />
            <div>
              <p className="text-xs text-muted-foreground">Vent</p>
              <p className="font-medium text-sm">{weather.windSpeed} km/h</p>
            </div>
          </div>
        </div>
        
        {/* 5-Day Forecast */}
        <div className="pt-3 border-t">
          <p className="text-xs text-muted-foreground mb-2">Prévisions 5 jours</p>
          <div className="grid grid-cols-5 gap-1">
            {weather.forecast.map((day) => {
              const DayIcon = conditionIcons[day.condition];
              return (
                <div key={day.day} className="text-center p-2 rounded-lg hover:bg-secondary/30 transition-colors">
                  <p className="text-xs font-medium">{day.day}</p>
                  <DayIcon className={cn('h-5 w-5 mx-auto my-1', conditionColors[day.condition])} />
                  <p className="text-xs">
                    <span className="font-medium">{day.high}°</span>
                    <span className="text-muted-foreground">/{day.low}°</span>
                  </p>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Last Update */}
        <p className="text-xs text-muted-foreground text-center pt-2">
          Mis à jour : {lastUpdate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </CardContent>
    </Card>
  );
}
