/**
 * useCountryAudioGuide - Hook for AI-generated audio narration using ElevenLabs
 * Revolutionary feature: Immersive audio guides for each country
 */

import { useState, useCallback, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { generateAudio, playBase64Audio } from '@/lib/api/premium-intel';
import { useToast } from '@/hooks/use-toast';

export type VoiceStyle = 'narrator' | 'guide' | 'expert' | 'friendly';
export type AudioSection = 'overview' | 'culture' | 'visa' | 'cost' | 'tips' | 'risks';

interface AudioGuideOptions {
  countryName: string;
  countryId: string;
}

interface GeneratedAudio {
  section: AudioSection;
  audioContent: string;
  voiceStyle: VoiceStyle;
  timestamp: Date;
  duration?: number;
}

const SECTION_PROMPTS: Record<AudioSection, (country: string) => string> = {
  overview: (c) => `Bienvenue dans votre guide audio pour ${c}. Ce pays offre des opportunités uniques pour les expatriés.`,
  culture: (c) => `Parlons de la culture de ${c}. Comprendre les codes sociaux locaux est essentiel pour réussir votre intégration.`,
  visa: (c) => `Les options de visa pour ${c}. Voici ce que vous devez savoir avant de commencer vos démarches.`,
  cost: (c) => `Le coût de la vie en ${c}. Voici une analyse réaliste de votre budget mensuel.`,
  tips: (c) => `Conseils pratiques pour ${c}. Ces astuces vous feront gagner du temps et éviter les erreurs courantes.`,
  risks: (c) => `Les risques à connaître pour ${c}. Être informé vous permettra de mieux vous protéger.`,
};

export function useCountryAudioGuide({ countryName, countryId }: AudioGuideOptions) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSection, setCurrentSection] = useState<AudioSection | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [progress, setProgress] = useState(0);

  const cacheKey = ['audio-guide', countryId];

  // Generate audio for a section
  const generateSectionAudio = useMutation({
    mutationFn: async ({ section, voiceStyle = 'narrator', customText }: {
      section: AudioSection;
      voiceStyle?: VoiceStyle;
      customText?: string;
    }): Promise<GeneratedAudio> => {
      const text = customText || SECTION_PROMPTS[section](countryName);
      
      const result = await generateAudio(text, { voiceStyle });
      
      if (!result.success || !result.audioContent) {
        throw new Error(result.error || 'Failed to generate audio');
      }

      return {
        section,
        audioContent: result.audioContent,
        voiceStyle,
        timestamp: new Date(),
      };
    },
    onSuccess: (data) => {
      // Cache the generated audio
      queryClient.setQueryData([...cacheKey, data.section], data);
      toast({
        title: '🎧 Audio Généré',
        description: `Guide audio "${data.section}" prêt à écouter`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Erreur Audio',
        description: error instanceof Error ? error.message : 'Échec génération audio',
        variant: 'destructive',
      });
    },
  });

  // Play audio from cache or generate
  const playSection = useCallback(async (section: AudioSection, voiceStyle: VoiceStyle = 'narrator') => {
    // Check cache first
    const cached = queryClient.getQueryData<GeneratedAudio>([...cacheKey, section]);
    
    let audioContent: string;
    
    if (cached) {
      audioContent = cached.audioContent;
    } else {
      // Generate new audio
      const result = await generateSectionAudio.mutateAsync({ section, voiceStyle });
      audioContent = result.audioContent;
    }

    // Play the audio
    setCurrentSection(section);
    setIsPlaying(true);
    setProgress(0);

    const audio = playBase64Audio(audioContent);
    audioRef.current = audio;

    // Track progress
    audio.ontimeupdate = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    audio.onended = () => {
      setIsPlaying(false);
      setCurrentSection(null);
      setProgress(0);
    };

    audio.onerror = () => {
      setIsPlaying(false);
      setCurrentSection(null);
      toast({
        title: 'Erreur Lecture',
        description: 'Impossible de lire l\'audio',
        variant: 'destructive',
      });
    };
  }, [queryClient, cacheKey, generateSectionAudio, toast]);

  // Stop playback
  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    setCurrentSection(null);
    setProgress(0);
  }, []);

  // Pause/Resume
  const togglePlayback = useCallback(() => {
    if (audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play();
        setIsPlaying(true);
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, []);

  // Generate full tour (all sections)
  const generateFullTour = useCallback(async (voiceStyle: VoiceStyle = 'narrator') => {
    const sections: AudioSection[] = ['overview', 'culture', 'visa', 'cost', 'tips', 'risks'];
    
    for (const section of sections) {
      const cached = queryClient.getQueryData<GeneratedAudio>([...cacheKey, section]);
      if (!cached) {
        await generateSectionAudio.mutateAsync({ section, voiceStyle });
      }
    }

    toast({
      title: '🎙️ Tour Complet Généré',
      description: `6 guides audio prêts pour ${countryName}`,
    });
  }, [queryClient, cacheKey, generateSectionAudio, countryName, toast]);

  // Check if section is cached
  const isSectionCached = useCallback((section: AudioSection): boolean => {
    return !!queryClient.getQueryData<GeneratedAudio>([...cacheKey, section]);
  }, [queryClient, cacheKey]);

  return {
    // State
    isGenerating: generateSectionAudio.isPending,
    isPlaying,
    currentSection,
    progress,
    
    // Actions
    generateSectionAudio: generateSectionAudio.mutate,
    playSection,
    stopPlayback,
    togglePlayback,
    generateFullTour,
    
    // Cache
    isSectionCached,
    
    // Errors
    error: generateSectionAudio.error,
  };
}
