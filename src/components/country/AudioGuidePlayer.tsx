/**
 * AudioGuidePlayer - Immersive audio guide player with ElevenLabs TTS
 * Revolutionary feature: AI-generated audio narration for each country
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useCountryAudioGuide, type AudioSection, type VoiceStyle } from '@/hooks/useCountryAudioGuide';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Headphones,
  Play,
  Pause,
  Square,
  Volume2,
  Loader2,
  Globe,
  Users,
  Plane,
  Wallet,
  Lightbulb,
  AlertTriangle,
  Wand2,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  countryId: string;
  countryName: string;
}

const SECTIONS: { id: AudioSection; icon: typeof Globe; label: string; description: string }[] = [
  { id: 'overview', icon: Globe, label: 'Vue d\'ensemble', description: 'Introduction au pays' },
  { id: 'culture', icon: Users, label: 'Culture', description: 'Codes sociaux locaux' },
  { id: 'visa', icon: Plane, label: 'Visa', description: 'Options et démarches' },
  { id: 'cost', icon: Wallet, label: 'Budget', description: 'Coût de vie réaliste' },
  { id: 'tips', icon: Lightbulb, label: 'Conseils', description: 'Astuces pratiques' },
  { id: 'risks', icon: AlertTriangle, label: 'Risques', description: 'Points de vigilance' },
];

const VOICE_STYLES: { id: VoiceStyle; label: string }[] = [
  { id: 'narrator', label: '🎙️ Narrateur' },
  { id: 'guide', label: '🧭 Guide' },
  { id: 'expert', label: '🎓 Expert' },
  { id: 'friendly', label: '😊 Amical' },
];

export function AudioGuidePlayer({ countryId, countryName }: Props) {
  const { t } = useTranslation();
  const [voiceStyle, setVoiceStyle] = useState<VoiceStyle>('narrator');
  
  const {
    isGenerating,
    isPlaying,
    currentSection,
    progress,
    playSection,
    stopPlayback,
    togglePlayback,
    generateFullTour,
    isSectionCached,
  } = useCountryAudioGuide({ countryName, countryId });

  const handlePlaySection = async (section: AudioSection) => {
    if (currentSection === section && isPlaying) {
      togglePlayback();
    } else if (currentSection === section) {
      togglePlayback();
    } else {
      await playSection(section, voiceStyle);
    }
  };

  return (
    <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-background to-accent/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <motion.div
              animate={isPlaying ? { scale: [1, 1.1, 1] } : {}}
              transition={{ repeat: Infinity, duration: 0.5 }}
            >
              <Headphones className="w-5 h-5 text-primary" />
            </motion.div>
            {t('audioGuide.title', 'Guide Audio IA')}
            <Badge variant="outline" className="text-xs bg-gradient-to-r from-primary/10 to-accent/10">
              <Volume2 className="w-3 h-3 mr-1" />
              ElevenLabs
            </Badge>
          </CardTitle>
          
          {/* Voice Style Selector */}
          <Select value={voiceStyle} onValueChange={(v) => setVoiceStyle(v as VoiceStyle)}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VOICE_STYLES.map((style) => (
                <SelectItem key={style.id} value={style.id}>
                  {style.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Playback Progress */}
        <AnimatePresence>
          {(isPlaying || currentSection) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium flex items-center gap-2">
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="w-2 h-2 rounded-full bg-red-500"
                  />
                  {SECTIONS.find(s => s.id === currentSection)?.label || 'Lecture'}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={togglePlayback}
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={stopPlayback}
                  >
                    <Square className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <Progress value={progress} className="h-1.5" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Section Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            const isCurrent = currentSection === section.id;
            const isCached = isSectionCached(section.id);
            const isThisPlaying = isCurrent && isPlaying;

            return (
              <motion.div
                key={section.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant={isCurrent ? 'default' : 'outline'}
                  className={cn(
                    'w-full h-auto py-3 px-3 flex flex-col items-center gap-1.5 transition-all',
                    isCurrent && 'shadow-lg shadow-primary/25',
                    !isCurrent && isCached && 'border-primary/30 bg-primary/5'
                  )}
                  onClick={() => handlePlaySection(section.id)}
                  disabled={isGenerating && !isCached}
                >
                  <div className="relative">
                    <Icon className={cn('w-5 h-5', isCurrent && 'text-primary-foreground')} />
                    {isThisPlaying && (
                      <motion.div
                        className="absolute -inset-1 rounded-full border-2 border-primary-foreground/50"
                        animate={{ scale: [1, 1.3, 1], opacity: [1, 0, 1] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                      />
                    )}
                    {isCached && !isCurrent && (
                      <CheckCircle2 className="w-3 h-3 text-primary absolute -top-1 -right-1" />
                    )}
                  </div>
                  <span className="text-xs font-medium">{section.label}</span>
                  <span className="text-[10px] opacity-70 line-clamp-1">{section.description}</span>
                </Button>
              </motion.div>
            );
          })}
        </div>

        {/* Generate Full Tour */}
        <Button
          onClick={() => generateFullTour(voiceStyle)}
          disabled={isGenerating}
          variant="outline"
          className="w-full gap-2 border-dashed"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t('audioGuide.generating', 'Génération en cours...')}
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              {t('audioGuide.generateAll', 'Générer le tour complet')}
            </>
          )}
        </Button>

        {/* Powered By */}
        <p className="text-[10px] text-center text-muted-foreground">
          Propulsé par ElevenLabs • Voix synthétisée par IA
        </p>
      </CardContent>
    </Card>
  );
}
