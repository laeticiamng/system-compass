import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Music2, 
  Loader2,
  Info 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PyramidType } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CountryMusicPlayerProps {
  countryId: string;
  countryName: string;
  pyramidType: PyramidType;
  className?: string;
  compact?: boolean;
}

export function CountryMusicPlayer({
  countryId,
  countryName,
  pyramidType,
  className,
  compact = false,
}: CountryMusicPlayerProps) {
  const { t } = useTranslation();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  const pollIntervalMs = 5000;
  const maxPollAttempts = 12;
  const maxAutoRetries = 1;

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  const pollTaskStatus = async (taskId: string) => {
    for (let attempt = 0; attempt < maxPollAttempts; attempt++) {
      if (!isMountedRef.current) {
        return null;
      }

      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));

      const { data: statusData, error: statusError } = await supabase.functions.invoke('music-task-status', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        body: { taskId },
      });

      if (statusError || !statusData) {
        continue;
      }

      if (statusData.status === 'completed' && statusData.audioUrl) {
        return statusData;
      }

      if (statusData.status === 'failed') {
        return statusData;
      }
    }

    return null;
  };

  const generateAndPlayMusic = async () => {
    if (hasLoaded && audioRef.current) {
      // Already loaded, just play/pause
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let attempts = 0;
      let finalError: string | null = null;

      while (attempts <= maxAutoRetries) {
        const { data, error: invokeError } = await supabase.functions.invoke('generate-country-music', {
          body: {
            countryId,
            pyramidType,
            mood: 'narrative',
          },
        });

        if (invokeError) {
          throw new Error(invokeError.message || 'Failed to generate music');
        }
        let audioUrl = (data.audioUrl as string | undefined) || (data.streamUrl as string | undefined);
        // streamUrl from initial response (unused but kept for potential future use)
        if (!audioUrl) {
          if (data.taskId) {
            const statusData = await pollTaskStatus(data.taskId as string);
            audioUrl = statusData?.audioUrl || statusData?.streamUrl;

            if (statusData?.status === 'failed') {
              finalError = statusData.errorMessage || t('music.error', 'Impossible de générer la musique');
            }
          } else {
            finalError = t('music.generating', 'La musique est en cours de génération. Réessayez dans quelques minutes.');
          }
        }

        if (audioUrl) {
          // Create or reuse audio element
          if (!audioRef.current) {
            audioRef.current = new Audio();
          }
          
          audioRef.current.src = audioUrl;
          audioRef.current.volume = volume;
          audioRef.current.crossOrigin = "anonymous";
          
          // Set up event listeners
          audioRef.current.onloadedmetadata = () => {
            setDuration(audioRef.current?.duration || 0);
          };
          
          audioRef.current.ontimeupdate = () => {
            if (audioRef.current) {
              setProgress(audioRef.current.currentTime);
            }
          };
          
          audioRef.current.onended = () => {
            setIsPlaying(false);
            setProgress(0);
          };

          audioRef.current.onerror = () => {
            setError(t('music.loadError', 'Erreur de chargement audio'));
            setIsPlaying(false);
          };

          await audioRef.current.play();
          setIsPlaying(true);
          setHasLoaded(true);
          return;
        }

        attempts += 1;

        if (attempts <= maxAutoRetries) {
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }
      }

      setError(finalError || t('music.generating', 'La musique est en cours de génération. Réessayez dans quelques minutes.'));
      return;

    } catch (err) {
      console.error('Error generating music:', err);
      setError(err instanceof Error ? err.message : t('music.error', 'Impossible de générer la musique'));
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlay = () => {
    if (!hasLoaded) {
      generateAndPlayMusic();
    } else if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={togglePlay}
              disabled={isLoading}
              className={cn("relative", className)}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Music2 className="w-4 h-4" />
              )}
              {isPlaying && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('music.listenTo', { country: countryName })}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className={cn("glass-card rounded-xl p-4", className)}>
      <div className="flex items-center gap-4">
        {/* Play button */}
        <Button
          variant="outline"
          size="icon"
          onClick={togglePlay}
          disabled={isLoading}
          className="h-12 w-12 rounded-full shrink-0"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
        </Button>

        <div className="flex-1 min-w-0">
          {/* Title */}
          <div className="flex items-center gap-2 mb-2">
            <Music2 className="w-4 h-4 text-primary shrink-0" />
            <span className="font-medium truncate">
              {t('music.systemSoundscape', 'Paysage sonore')} - {countryName}
            </span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-3 h-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-sm">{t('music.description', 'La musique représente le système de vie de ce pays. Elle incarne le rythme, les tensions et les opportunités du système.')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Progress bar */}
          {hasLoaded && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{formatTime(progress)}</span>
              <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all"
                  style={{ width: `${(progress / duration) * 100}%` }}
                />
              </div>
              <span>{formatTime(duration)}</span>
            </div>
          )}

          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}
        </div>

        {/* Volume controls */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="h-8 w-8"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            max={1}
            step={0.1}
            onValueChange={handleVolumeChange}
            className="w-20"
          />
        </div>
      </div>
    </div>
  );
}
