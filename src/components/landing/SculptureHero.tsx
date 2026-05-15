/**
 * SculptureHero - Awwwards-grade immersive hero
 * Inspired by Transparent Speaker / B&O / Teenage Engineering.
 *
 * Performance:
 * - Tick marks rendered as a single inline SVG (1 paint vs 36 DOM nodes)
 * - Mousemove throttled to rAF (1 update per frame instead of per event)
 * - On coarse pointer / reduced motion / small viewports: heavy GPU layers skipped
 * - `will-change: transform` on animated layers to keep them on the GPU
 * - `contain: paint` to isolate paint from the rest of the page
 */
import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useLocalizedNavigate } from '@/hooks/useLocalizedNavigate';
import { ArrowRight, Zap, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TrustBadges } from '@/components/landing/SocialProofBanner';
import { useFpsBudget } from '@/hooks/useFpsBudget';

const TICK_COUNT = 36;

/** Single inline SVG dial — 1 paint instead of 36 DOM rotations. */
function CompassDial() {
  const ticks = Array.from({ length: TICK_COUNT }).map((_, i) => {
    const major = i % 9 === 0;
    const len = major ? 9 : 4;
    return (
      <line
        key={i}
        x1="50"
        y1="2"
        x2="50"
        y2={2 + len}
        stroke="currentColor"
        strokeWidth={major ? 0.6 : 0.3}
        transform={`rotate(${i * (360 / TICK_COUNT)} 50 50)`}
      />
    );
  });
  return (
    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full text-foreground/25" aria-hidden="true">
      {ticks}
    </svg>
  );
}

export function SculptureHero() {
  const { t } = useTranslation();
  const navigate = useLocalizedNavigate();
  const ref = useRef<HTMLElement>(null);

  const [perfMode, setPerfMode] = useState(false); // true → skip heavy layers
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const small = window.innerWidth < 768;
    const lowCores = (navigator as any).hardwareConcurrency && (navigator as any).hardwareConcurrency <= 4;
    setPerfMode(reduce || coarse || small || !!lowCores);
  }, []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const sculptureRotate = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const sculptureScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const sculptureY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const innerOpacity = useTransform(scrollYProgress, [0, 0.4], [0, 1]);
  const titleY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  // Cursor parallax
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18 });
  const sy = useSpring(my, { stiffness: 60, damping: 18 });
  const tiltX = useTransform(sy, [-0.5, 0.5], [8, -8]);
  const tiltY = useTransform(sx, [-0.5, 0.5], [-8, 8]);

  // rAF-throttled mousemove
  const pending = useRef<{ x: number; y: number } | null>(null);
  const rafScheduled = useRef(false);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (perfMode) return;
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    pending.current = { x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 };
    if (!rafScheduled.current) {
      rafScheduled.current = true;
      requestAnimationFrame(() => {
        if (pending.current) {
          mx.set(pending.current.x);
          my.set(pending.current.y);
        }
        rafScheduled.current = false;
      });
    }
  };

  return (
    <section
      ref={ref}
      onMouseMove={handleMouseMove}
      className="relative min-h-[100vh] flex items-center justify-center overflow-hidden pt-20"
      style={{ perspective: 1400, contain: 'paint' }}
    >
      {/* Atmospheric base — kept always (cheap radial gradient) */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_30%,hsl(var(--primary)/0.10)_0%,transparent_60%)]" />
        {!perfMode && (
          <div
            className="absolute inset-0 opacity-[0.04] mix-blend-overlay motion-reduce:hidden"
            style={{
              backgroundImage:
                'url("data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22><filter id=%22n%22><feTurbulence baseFrequency=%220.9%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/></svg>")',
            }}
          />
        )}
      </div>

      {/* THE SCULPTURE */}
      <motion.div
        style={{
          rotate: sculptureRotate,
          scale: sculptureScale,
          y: sculptureY,
          rotateX: perfMode ? 0 : tiltX,
          rotateY: perfMode ? 0 : tiltY,
          willChange: 'transform',
        }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(95vw,820px)] aspect-square pointer-events-none motion-reduce:hidden"
      >
        {/* Outer brushed-metal ring */}
        <div
          className="absolute inset-0 rounded-full border border-foreground/10"
          style={{
            background:
              'conic-gradient(from 0deg, hsl(var(--foreground)/0.04), hsl(var(--primary)/0.10), hsl(var(--foreground)/0.04), hsl(var(--primary)/0.08), hsl(var(--foreground)/0.04))',
            boxShadow: 'inset 0 0 80px hsl(var(--primary)/0.06), 0 30px 80px -20px hsl(var(--primary)/0.25)',
          }}
        />
        {/* Mid ring — glass (no backdrop-blur in perfMode: backdrop filters are very expensive) */}
        <motion.div
          animate={perfMode ? undefined : { rotate: -360 }}
          transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
          className={`absolute inset-[8%] rounded-full border border-primary/15 ${perfMode ? '' : 'backdrop-blur-[1px]'}`}
          style={{
            background: 'radial-gradient(circle at 30% 20%, hsl(var(--primary)/0.10), transparent 60%)',
            willChange: 'transform',
          }}
        />
        {/* Inner ring — exposed mechanism, ticks as a single SVG */}
        <motion.div
          style={{ opacity: innerOpacity }}
          className="absolute inset-[18%] rounded-full border border-amber-400/20"
        >
          <CompassDial />
        </motion.div>
        {/* Core */}
        <div
          className="absolute inset-[36%] rounded-full"
          style={{
            background:
              'radial-gradient(circle at 35% 30%, hsl(var(--primary)/0.55), hsl(var(--primary)/0.15) 50%, transparent 70%)',
            boxShadow: '0 0 120px 20px hsl(var(--primary)/0.25)',
          }}
        />
        {!perfMode && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-[44%] rounded-full border border-primary/30"
            style={{ willChange: 'transform' }}
          />
        )}
      </motion.div>

      {/* HEADLINE + CTA */}
      <motion.div
        style={{ y: titleY, opacity: titleOpacity, willChange: 'transform, opacity' }}
        className="relative z-10 container mx-auto px-4 text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/25 bg-background/40 backdrop-blur-md mb-7"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[11px] tracking-[0.2em] uppercase text-primary/90">
            {t('landing.hero.badge', '100% gratuit pour commencer')}
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="font-display font-medium tracking-[-0.03em] text-[clamp(2.4rem,7vw,6rem)] leading-[0.95] mb-6"
        >
          <span className="block">{t('landing.hero.titleLine1', 'Vous voulez vous expatrier ?')}</span>
          <span className="block bg-gradient-to-br from-foreground via-foreground/90 to-primary bg-clip-text text-transparent">
            {t('landing.hero.titleLine2', 'Comparez les pays avant de partir.')}
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.9 }}
          className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto mb-7"
        >
          {t('landing.hero.subtitle', 'Fiscalité, coût de la vie, visas, qualité de vie : comparez 80+ pays en 2 minutes et trouvez celui qui vous correspond.')}
        </motion.p>

        <TrustBadges />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-3 justify-center items-center mt-2"
        >
          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 22 }}
            onClick={() => navigate('/quick-test')}
            className="btn-cta-premium h-13 px-7 text-base gap-2 flex items-center justify-center text-primary-foreground font-semibold rounded-full"
          >
            <Zap className="w-4 h-4" />
            <span>{t('landing.hero.ctaPrimary', 'Faire le test gratuit')}</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/countries')}
              className="h-12 px-6 rounded-full gap-2 border-border/60 bg-background/40 backdrop-blur-md"
            >
              <Globe className="w-4 h-4" />
              {t('landing.hero.ctaSecondary', 'Explorer les pays')}
            </Button>
          </motion.div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="absolute left-1/2 -translate-x-1/2 bottom-6 text-[10px] tracking-[0.3em] uppercase text-muted-foreground/70 flex flex-col items-center gap-2"
        >
          <span>{t('landing.hero.scroll', 'Découvrir')}</span>
          <motion.span
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
            className="block w-px h-8 bg-gradient-to-b from-foreground/40 to-transparent"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
