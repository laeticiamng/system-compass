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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';

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
  const activeRequestId = useRef(0);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const mood = 'narrative';

  const cacheKey = `${countryId}:${pyramidType}:${mood}`;
  const taskCacheKey = `music-task:${cacheKey}`;
  const audioCacheKey = `music-audio:${cacheKey}`;

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const loadAndPlayAudio = async (audioUrl: string, streamUrl?: string | null) => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    audioRef.current.src = audioUrl;
    audioRef.current.volume = volume;
    audioRef.current.crossOrigin = "anonymous";

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

    sessionStorage.setItem(
      audioCacheKey,
      JSON.stringify({ audioUrl, streamUrl: streamUrl ?? null })
    );

    await audioRef.current.play();
    setIsPlaying(true);
    setHasLoaded(true);
  };

  const pollTaskStatus = async (taskId: string, requestId: number) => {
    setIsGenerating(true);
    setError(null);

    for (let attempt = 0; attempt < 24; attempt++) {
      if (activeRequestId.current !== requestId) {
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('music_tasks')
        .select('status, audio_url, stream_url, error_message')
        .eq('task_id', taskId)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching music task:', fetchError);
      }

      if (data?.status === 'completed' && (data.audio_url || data.stream_url)) {
        setIsGenerating(false);
        sessionStorage.removeItem(taskCacheKey);
        await loadAndPlayAudio(data.audio_url || data.stream_url || '', data.stream_url);
        return;
      }

      if (data?.status === 'failed') {
        setIsGenerating(false);
        setError(
          data.error_message ||
            t('music.error', 'Impossible de générer la musique')
        );
        sessionStorage.removeItem(taskCacheKey);
        return;
      }

      await delay(5000);
    }

    setIsGenerating(false);
    setError(
      t('music.generating', 'La musique est en cours de génération. Réessayez dans quelques minutes.')
    );
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

    if (isLoading || isGenerating) {
      return;
    }

    const cachedAudio = sessionStorage.getItem(audioCacheKey);
    if (cachedAudio) {
      try {
        const parsed = JSON.parse(cachedAudio) as { audioUrl: string; streamUrl?: string | null };
        if (parsed.audioUrl) {
          await loadAndPlayAudio(parsed.audioUrl, parsed.streamUrl);
          return;
        }
      } catch {
        sessionStorage.removeItem(audioCacheKey);
      }
    }

    const cachedTask = sessionStorage.getItem(taskCacheKey);
    if (cachedTask) {
      const requestId = Date.now();
      activeRequestId.current = requestId;
      try {
        const parsed = JSON.parse(cachedTask) as { taskId: string };
        if (parsed.taskId) {
          await pollTaskStatus(parsed.taskId, requestId);
          return;
        }
      } catch {
        sessionStorage.removeItem(taskCacheKey);
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-country-music`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            countryId,
            pyramidType,
            mood,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.code === 'missing_suno_api_key') {
          throw new Error(
            t('music.apiKeyMissing', 'La clé API Suno est absente. Contactez un administrateur.')
          );
        }
        throw new Error(errorData.error || `Failed to generate music: ${response.status}`);
      }

      const data = await response.json();
      
      // Check for timeout/pending response
      if (response.status === 202 || data.pending || !data.audioUrl) {
        if (data.taskId) {
          sessionStorage.setItem(taskCacheKey, JSON.stringify({ taskId: data.taskId }));
          const requestId = Date.now();
          activeRequestId.current = requestId;
          await pollTaskStatus(data.taskId, requestId);
          return;
        }
        setError(t('music.generating', 'La musique est en cours de génération. Réessayez dans quelques minutes.'));
        return;
      }

      const audioUrl = data.audioUrl;
      await loadAndPlayAudio(audioUrl, data.streamUrl);
      
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
              disabled={isLoading || isGenerating}
              className={cn("relative", className)}
            >
              {isLoading || isGenerating ? (
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
          disabled={isLoading || isGenerating}
          className="h-12 w-12 rounded-full shrink-0"
        >
          {isLoading || isGenerating ? (
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

          {isGenerating && !hasLoaded && (
            <p className="text-xs text-muted-foreground">
              {t('music.generating', 'La musique est en cours de génération. Réessayez dans quelques minutes.')}
            </p>
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
