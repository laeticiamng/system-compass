/**
 * HeroSection - Premium cinematic hero for landing page
 * Optimized for both desktop and mobile with reduced motion on mobile
 */

import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Route, Play, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface HeroSectionProps {
  onExitKeysClick: () => void;
}

export function HeroSection({ onExitKeysClick }: HeroSectionProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const heroRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 100]);

  // Reduce particle count on mobile for performance
  const particleCount = isMobile ? 8 : 20;

  return (
    <section ref={heroRef} className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
      {/* Layered premium background effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.15)_0%,transparent_50%)]" />
        
        {/* Aurora-like morphing blobs - simplified on mobile */}
        {!isMobile && (
          <>
            <motion.div 
              className="absolute -top-[40%] -left-[20%] w-[140%] h-[100%]"
              style={{
                background: 'radial-gradient(ellipse at 30% 40%, hsl(45 93% 58% / 0.08) 0%, transparent 50%)',
                filter: 'blur(100px)',
              }}
              animate={{
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 0.98, 1],
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* Secondary aurora */}
            <motion.div 
              className="absolute -bottom-[30%] -right-[20%] w-[120%] h-[80%]"
              style={{
                background: 'radial-gradient(ellipse at 70% 60%, hsl(280 70% 55% / 0.06) 0%, hsl(200 80% 60% / 0.04) 40%, transparent 60%)',
                filter: 'blur(80px)',
              }}
              animate={{
                rotate: [0, -8, 4, 0],
                scale: [1.1, 1, 1.08, 1.1],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Spotlight effect */}
            <motion.div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px]"
              style={{
                background: 'conic-gradient(from 0deg, transparent, hsl(var(--primary) / 0.03), transparent, hsl(280 70% 55% / 0.02), transparent)',
                filter: 'blur(60px)',
              }}
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 30,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </>
        )}
        
        {/* Floating particles - reduced on mobile */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(particleCount)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-primary/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${100 + Math.random() * 20}%`,
              }}
              animate={{
                y: [0, -window.innerHeight - 100],
                x: [0, (Math.random() - 0.5) * 100],
                opacity: [0, 1, 1, 0],
                scale: [0, 1.5, 1, 0.5],
              }}
              transition={{
                duration: 10 + Math.random() * 15,
                repeat: Infinity,
                delay: Math.random() * 10,
                ease: "easeOut"
              }}
            />
          ))}
        </div>

        {/* Grid pattern with fade */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
            maskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, black 20%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, black 20%, transparent 70%)',
          }}
        />

        {/* Noise texture overlay */}
        <div 
          className="absolute inset-0 opacity-[0.015] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <motion.div 
        className="relative z-10 container mx-auto px-4 text-center pt-24 md:pt-20"
        style={{ 
          opacity: heroOpacity, 
          scale: heroScale, 
          y: heroY,
        }}
      >
        {/* Floating premium badge */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.8, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
          transition={{ delay: 0.2, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border border-primary/20 backdrop-blur-xl mb-8 md:mb-12 shadow-[0_0_40px_hsl(var(--primary)/0.15),inset_0_1px_0_hsl(0_0%_100%/0.1)]"
        >
          <motion.div
            animate={{ 
              rotate: [0, 15, -15, 0],
              scale: [1, 1.2, 1, 1]
            }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
          >
            <Sparkles className="w-4 h-4 text-primary" />
          </motion.div>
          <span className="text-xs sm:text-sm text-primary font-medium tracking-wide line-clamp-1">
            {t('hero.madeBy', "Créé par quelqu'un qui a perdu énormément de temps")}
          </span>
          <motion.div
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-primary/60 hidden sm:block"
          />
        </motion.div>

        {/* Main headline - Cinematic reveal */}
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="font-display font-bold tracking-tight mb-6 md:mb-10"
        >
          <motion.span 
            initial={{ opacity: 0, y: 60, filter: 'blur(20px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: 0.5, duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            className="block text-[clamp(2.2rem,8vw,9rem)] leading-[0.9] text-foreground font-extrabold"
          >
            {t('hero.appleTitle1', 'Comprends les règles.')}
          </motion.span>
          <motion.span 
            initial={{ opacity: 0, y: 60, filter: 'blur(20px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: 0.7, duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            className="block text-[clamp(2.2rem,8vw,9rem)] leading-[0.9] bg-gradient-to-r from-primary via-amber-400 via-50% to-orange-500 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-text font-extrabold"
          >
            {t('hero.appleTitle2', 'Avant de t\'engager.')}
          </motion.span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-[clamp(1rem,2.2vw,1.5rem)] text-muted-foreground max-w-3xl mx-auto mb-10 md:mb-16 leading-relaxed font-light px-2"
        >
          {t('hero.appleSubtitle', "L'outil qui analyse les règles réelles des pays et simule les conséquences de tes décisions. Pas de promesses. Pas de conseils. Juste la réalité.")}
        </motion.p>

        {/* Premium CTA Buttons - Optimized for mobile */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-12 md:mb-24 px-2"
        >
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="w-full sm:w-auto"
          >
            <Button
              size="lg"
              onClick={() => { onExitKeysClick(); navigate('/exit-keys'); }}
              className="w-full sm:w-auto h-14 sm:h-16 md:h-[4.5rem] px-8 sm:px-12 text-base sm:text-lg bg-gradient-to-r from-primary via-primary to-amber-500 text-primary-foreground rounded-full gap-3 sm:gap-4 group relative overflow-hidden transition-all duration-500 shadow-[0_0_0_1px_hsl(var(--primary)),0_8px_40px_-8px_hsl(var(--primary)/0.6),0_0_80px_-20px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_0_1px_hsl(var(--primary)),0_16px_60px_-8px_hsl(var(--primary)/0.7),0_0_100px_-20px_hsl(var(--primary)/0.5)]"
            >
              {/* Shimmer effect */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
              {/* Glow overlay */}
              <span className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Route className="w-5 h-5 sm:w-6 sm:h-6 relative z-10" />
              <span className="relative z-10 font-semibold">{t('hero.startAnalysis', 'Analyser ma situation')}</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 relative z-10 transition-transform duration-300 group-hover:translate-x-2" />
            </Button>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="w-full sm:w-auto"
          >
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/quick-test')}
              className="w-full sm:w-auto h-14 sm:h-16 md:h-[4.5rem] px-8 sm:px-12 text-base sm:text-lg rounded-full gap-3 sm:gap-4 border-2 border-border/40 bg-background/50 backdrop-blur-xl hover:bg-background/80 hover:border-primary/30 group transition-all duration-500 shadow-[0_8px_30px_-10px_hsl(var(--foreground)/0.1)]"
            >
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </motion.div>
              <span className="font-medium">{t('hero.quickTest', 'Test rapide (60s)')}</span>
            </Button>
          </motion.div>
        </motion.div>

        {/* Stats row - Glass morphism - Responsive */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="inline-flex flex-wrap items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl bg-card/30 backdrop-blur-xl border border-border/20 shadow-[0_8px_32px_-8px_hsl(var(--foreground)/0.05)]"
        >
          <StatItem value="38" label={t('stats.countries', 'pays analysés')} />
          <div className="w-px h-6 sm:h-8 bg-border/30 mx-2 sm:mx-4 hidden sm:block" />
          <StatItem value="50+" label={t('stats.keys', 'critères comparés')} />
          <div className="w-px h-6 sm:h-8 bg-border/30 mx-2 sm:mx-4 hidden sm:block" />
          <StatItem value="6" label={t('stats.pyramids', 'profils d\'expatrié')} />
        </motion.div>

        {/* Scroll indicator - Hidden on very small screens */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 1 }}
          className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 hidden sm:block"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2 sm:gap-3"
          >
            <span className="text-[9px] sm:text-[10px] text-muted-foreground/40 uppercase tracking-[0.3em] font-medium">
              {t('hero.scroll', 'Découvrir')}
            </span>
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-5 h-8 sm:w-6 sm:h-10 rounded-full border-2 border-muted-foreground/20 flex items-start justify-center p-1.5 sm:p-2"
            >
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-muted-foreground/40"
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}

// Premium stat item component
function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-1.5 sm:py-2">
      <motion.span 
        className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground font-display"
        initial={{ opacity: 0, scale: 0.5 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {value}
      </motion.span>
      <span className="text-muted-foreground/70 text-xs sm:text-sm">{label}</span>
    </div>
  );
}
