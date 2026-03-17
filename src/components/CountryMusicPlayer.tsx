import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Volume2,
  VolumeX,
  Music2,
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
import {
  PremiumPlayerShell,
  AudioVisualizer,
  PremiumProgressBar,
  PlayButton,
} from '@/components/ui/premium-player-shell';

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
            <div className={cn("relative", className)}>
              <PlayButton
                isPlaying={isPlaying}
                isLoading={isLoading}
                onClick={togglePlay}
                size="sm"
              />
              {isPlaying && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full animate-pulse ring-2 ring-background" />
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('music.listenTo', { country: countryName })}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <PremiumPlayerShell
      isPlaying={isPlaying}
      compact
      className={className}
    >
      <div className="flex items-center gap-4">
        {/* Premium play button */}
        <PlayButton
          isPlaying={isPlaying}
          isLoading={isLoading}
          onClick={togglePlay}
          size="default"
        />

        <div className="flex-1 min-w-0">
          {/* Title with audio visualizer */}
          <div className="flex items-center gap-2 mb-2">
            {isPlaying ? (
              <AudioVisualizer isPlaying={isPlaying} barCount={4} className="shrink-0" />
            ) : (
              <Music2 className="w-4 h-4 text-primary shrink-0" />
            )}
            <span className="font-medium truncate text-sm">
              {t('music.systemSoundscape', 'Paysage sonore')} - {countryName}
            </span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-3 h-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-sm">{t('music.description', 'La musique représente l\'ambiance de ce pays. Elle incarne le rythme, les tensions et les opportunités de la vie locale.')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Premium progress bar */}
          {hasLoaded && (
            <div className="space-y-1.5">
              <PremiumProgressBar
                progress={progress}
                duration={duration}
                onSeek={(time) => {
                  if (audioRef.current) {
                    audioRef.current.currentTime = time;
                    setProgress(time);
                  }
                }}
              />
              <div className="flex justify-between text-[10px] text-muted-foreground tabular-nums">
                <span>{formatTime(progress)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          )}

          {error && (
            <p className="text-xs text-destructive mt-1">{error}</p>
          )}
        </div>

        {/* Volume controls */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="h-8 w-8 hover:bg-primary/10"
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
    </PremiumPlayerShell>
  );
}
