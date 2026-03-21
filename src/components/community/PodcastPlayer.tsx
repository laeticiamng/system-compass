/**
 * Podcast Player - Audio player for community podcasts
 */
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import {
  Podcast,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Clock,
  ExternalLink,
  Headphones,
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  PremiumPlayerShell,
  AudioVisualizer,
  PremiumProgressBar,
  PlayButton,
} from '@/components/ui/premium-player-shell';

interface Episode {
  id: string;
  title: string;
  description: string;
  duration: string; // "45:32"
  date: string;
  audioUrl?: string;
  guest?: string;
  category: string;
}

// Dev-only placeholder data — not shown in production
const MOCK_EPISODES: Episode[] = import.meta.env.DEV ? [
  {
    id: '1',
    title: 'EP45 - Fiscalité des Digital Nomads en 2026',
    description: 'Discussion avec Maître Laurent sur les nouvelles règles fiscales pour les travailleurs à distance.',
    duration: '52:18',
    date: '2026-01-28',
    guest: 'Maître Sophie Laurent',
    category: 'Fiscalité',
  },
  {
    id: '2',
    title: 'EP44 - Retour d\'expérience : 5 ans à Singapour',
    description: 'Marc partage son parcours d\'entrepreneur français à Singapour.',
    duration: '48:45',
    date: '2026-01-21',
    guest: 'Marc Dubois',
    category: 'Témoignages',
  },
  {
    id: '3',
    title: 'EP43 - Golden Visa : comparatif 2026',
    description: 'Tour d\'horizon des programmes de résidence par investissement.',
    duration: '55:12',
    date: '2026-01-14',
    category: 'Immigration',
  },
  {
    id: '4',
    title: 'EP42 - Assurance santé internationale',
    description: 'Guide complet pour choisir sa couverture santé en expatriation.',
    duration: '41:30',
    date: '2026-01-07',
    guest: 'Dr. Anne Martin',
    category: 'Santé',
  },
] : [];

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function EpisodeCard({ 
  episode, 
  isPlaying, 
  onPlay 
}: { 
  episode: Episode; 
  isPlaying: boolean;
  onPlay: () => void;
}) {
  return (
    <div className={cn(
      'p-4 rounded-xl border transition-all duration-300 hover:bg-secondary/20',
      isPlaying && 'border-primary/40 bg-primary/5 shadow-[0_0_20px_-8px_hsl(var(--primary)/0.2)]'
    )}>
      <div className="flex items-start gap-4">
        <PlayButton
          isPlaying={isPlaying}
          onClick={onPlay}
          size="default"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <Badge variant="secondary" className="text-xs">{episode.category}</Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {episode.duration}
            </span>
          </div>
          
          <h4 className="font-medium text-sm truncate">{episode.title}</h4>
          
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
            {episode.description}
          </p>
          
          {episode.guest && (
            <p className="text-xs text-primary mt-1">
              Invité : {episode.guest}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function PodcastPlayer() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  
  // Simulated playback
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentEpisode) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 0.1;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentEpisode]);

  const handlePlayEpisode = (episode: Episode) => {
    if (currentEpisode?.id === episode.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentEpisode(episode);
      setIsPlaying(true);
      setProgress(0);
    }
  };

  const handleSkip = (direction: 'back' | 'forward') => {
    const skipAmount = direction === 'back' ? -3 : 3;
    setProgress(prev => Math.max(0, Math.min(100, prev + skipAmount)));
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Podcast className="h-5 w-5 text-primary" />
            Compass Podcast
          </CardTitle>
          <Badge variant="outline" className="gap-1">
            <Headphones className="h-3 w-3" />
            {MOCK_EPISODES.length} épisodes
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Player — Premium Shell */}
        {currentEpisode && (
          <PremiumPlayerShell isPlaying={isPlaying} compact>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-12 w-12 rounded-lg bg-primary/15 flex items-center justify-center relative">
                <Podcast className="h-6 w-6 text-primary" />
                {isPlaying && (
                  <AudioVisualizer isPlaying={isPlaying} barCount={3} className="absolute -bottom-1 left-1/2 -translate-x-1/2" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">{currentEpisode.title}</h4>
                <p className="text-xs text-muted-foreground">
                  {currentEpisode.guest || 'Compass'}
                </p>
              </div>
            </div>

            {/* Premium Progress Bar */}
            <div className="space-y-2">
              <PremiumProgressBar
                progress={progress}
                duration={100}
                onSeek={(val) => setProgress(val)}
              />
              <div className="flex justify-between text-[10px] text-muted-foreground tabular-nums">
                <span>{formatTime(progress * 30)}</span>
                <span>{currentEpisode.duration}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-primary/10"
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  onValueChange={([val]) => {
                    setVolume(val);
                    if (val > 0) setIsMuted(false);
                  }}
                  max={100}
                  className="w-20"
                />
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-primary/10"
                  onClick={() => handleSkip('back')}
                >
                  <SkipBack className="h-4 w-4" />
                </Button>
                <PlayButton
                  isPlaying={isPlaying}
                  onClick={() => setIsPlaying(!isPlaying)}
                  size="default"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-primary/10"
                  onClick={() => handleSkip('forward')}
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>

              <span className="text-xs text-muted-foreground font-mono">1.0x</span>
            </div>
          </PremiumPlayerShell>
        )}
        
        {/* Episode List */}
        <div className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-between"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <span className="flex items-center gap-2">
              Tous les épisodes
              <Badge variant="secondary">{MOCK_EPISODES.length}</Badge>
            </span>
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          
          {isExpanded && (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {MOCK_EPISODES.map(episode => (
                <EpisodeCard
                  key={episode.id}
                  episode={episode}
                  isPlaying={currentEpisode?.id === episode.id && isPlaying}
                  onPlay={() => handlePlayEpisode(episode)}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Subscribe Links */}
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          <Button variant="outline" size="sm" className="gap-1">
            <ExternalLink className="h-3 w-3" />
            Apple Podcasts
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <ExternalLink className="h-3 w-3" />
            Spotify
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <ExternalLink className="h-3 w-3" />
            RSS
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
