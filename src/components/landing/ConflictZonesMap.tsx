/**
 * ConflictZonesMap — Premium interactive conflict zones visualization
 * Natural Earth–inspired projection with animated threat markers
 */
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Shield, ExternalLink, X, Radio, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLocalizedNavigate } from '@/hooks/useLocalizedNavigate';
import { useTranslation } from 'react-i18next';

interface ConflictZone {
  id: string;
  nameKey: string;
  nameFallback: string;
  status: 'war' | 'high_tension' | 'instability';
  x: number;
  y: number;
  radiusPx: number;
  impactedCountries: string[];
  summaryKey: string;
  summaryFallback: string;
  since: string;
  casualties?: string;
  trend: 'escalating' | 'stable' | 'de-escalating';
}

const CONFLICT_ZONES: ConflictZone[] = [
  {
    id: 'ukraine',
    nameKey: 'geopolitics.zones.ukraine.name',
    nameFallback: 'Ukraine — Russia',
    status: 'war',
    x: 56, y: 24,
    radiusPx: 65,
    impactedCountries: ['Poland', 'Romania', 'Moldova', 'Baltics', 'Finland'],
    summaryKey: 'geopolitics.zones.ukraine.summary',
    summaryFallback: 'Armed conflict since 2022. Massive EU/US sanctions. Energy and visa impact across Eastern Europe.',
    since: '2022',
    casualties: '500K+',
    trend: 'stable',
  },
  {
    id: 'gaza',
    nameKey: 'geopolitics.zones.gaza.name',
    nameFallback: 'Israel — Gaza',
    status: 'war',
    x: 57, y: 43,
    radiusPx: 50,
    impactedCountries: ['Lebanon', 'Jordan', 'Egypt', 'Yemen (Red Sea)', 'UAE'],
    summaryKey: 'geopolitics.zones.gaza.summary',
    summaryFallback: 'Gaza conflict. Red Sea disruptions (+30% freight costs). Regional tensions with Lebanon and Iran.',
    since: '2023',
    casualties: '45K+',
    trend: 'escalating',
  },
  {
    id: 'sahel',
    nameKey: 'geopolitics.zones.sahel.name',
    nameFallback: 'Sahel (Mali, Burkina, Niger)',
    status: 'instability',
    x: 44, y: 50,
    radiusPx: 58,
    impactedCountries: ['Ivory Coast', 'Ghana', 'Senegal', 'Chad', 'Nigeria'],
    summaryKey: 'geopolitics.zones.sahel.summary',
    summaryFallback: 'Cascading coups. French forces withdrawn. AES alliance pro-Russia. High risk for expats.',
    since: '2021',
    trend: 'escalating',
  },
  {
    id: 'sudan',
    nameKey: 'geopolitics.zones.sudan.name',
    nameFallback: 'Sudan',
    status: 'war',
    x: 57, y: 52,
    radiusPx: 42,
    impactedCountries: ['Chad', 'Egypt', 'Ethiopia', 'South Sudan'],
    summaryKey: 'geopolitics.zones.sudan.summary',
    summaryFallback: 'Civil war SAF vs RSF. Worlds largest displacement crisis (10M+). Famine. Totally inadvisable.',
    since: '2023',
    casualties: '150K+',
    trend: 'escalating',
  },
  {
    id: 'myanmar',
    nameKey: 'geopolitics.zones.myanmar.name',
    nameFallback: 'Myanmar',
    status: 'war',
    x: 78, y: 43,
    radiusPx: 38,
    impactedCountries: ['Thailand', 'India', 'Bangladesh', 'Laos'],
    summaryKey: 'geopolitics.zones.myanmar.summary',
    summaryFallback: 'Civil war against military junta. State collapse. Refugees fleeing to Thailand and India.',
    since: '2021',
    trend: 'de-escalating',
  },
  {
    id: 'taiwan',
    nameKey: 'geopolitics.zones.taiwan.name',
    nameFallback: 'Taiwan Strait',
    status: 'high_tension',
    x: 84, y: 36,
    radiusPx: 48,
    impactedCountries: ['Japan', 'Philippines', 'South Korea', 'Australia'],
    summaryKey: 'geopolitics.zones.taiwan.summary',
    summaryFallback: 'Regular Chinese military exercises. Blockade risk 15-25%. Semiconductor impact (TSMC = 60% global).',
    since: '2022',
    trend: 'stable',
  },
];

const STATUS_CONFIG = {
  war: {
    label: 'geopolitics.status.war',
    labelFallback: 'Active war',
    color: 'bg-red-500',
    pulse: 'bg-red-400/60',
    border: 'border-red-500/20',
    text: 'text-red-500',
    glow: 'rgba(239,68,68,0.35)',
    glowSoft: 'rgba(239,68,68,0.08)',
    badge: 'bg-red-500/10 text-red-500 border-red-500/20',
    panelBg: 'bg-red-500/5 border-red-500/15',
  },
  high_tension: {
    label: 'geopolitics.status.highTension',
    labelFallback: 'High tension',
    color: 'bg-amber-500',
    pulse: 'bg-amber-400/60',
    border: 'border-amber-500/20',
    text: 'text-amber-500',
    glow: 'rgba(245,158,11,0.35)',
    glowSoft: 'rgba(245,158,11,0.08)',
    badge: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    panelBg: 'bg-amber-500/5 border-amber-500/15',
  },
  instability: {
    label: 'geopolitics.status.instability',
    labelFallback: 'Instability',
    color: 'bg-orange-500',
    pulse: 'bg-orange-400/60',
    border: 'border-orange-500/20',
    text: 'text-orange-500',
    glow: 'rgba(249,115,22,0.35)',
    glowSoft: 'rgba(249,115,22,0.08)',
    badge: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    panelBg: 'bg-orange-500/5 border-orange-500/15',
  },
};

const TREND_CONFIG = {
  escalating: { icon: '↗', color: 'text-red-500', label: 'Escalating' },
  stable: { icon: '→', color: 'text-amber-500', label: 'Stable' },
  'de-escalating': { icon: '↘', color: 'text-emerald-500', label: 'De-escalating' },
};

// Realistic continent SVG with better proportions (Robinson-like projection)
function WorldMapSVG() {
  return (
    <svg
      viewBox="0 0 1000 500"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="landGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--foreground))" stopOpacity="0.07" />
          <stop offset="100%" stopColor="hsl(var(--foreground))" stopOpacity="0.04" />
        </linearGradient>
        <filter id="landShadow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Graticule lines for realism */}
      <g stroke="hsl(var(--foreground))" strokeOpacity="0.03" strokeWidth="0.5" fill="none">
        {/* Latitude lines */}
        {[80, 120, 160, 200, 250, 300, 340, 380, 420].map(y => (
          <line key={`lat-${y}`} x1="50" y1={y} x2="950" y2={y} />
        ))}
        {/* Longitude lines */}
        {[100, 200, 300, 400, 500, 600, 700, 800, 900].map(x => (
          <path key={`lon-${x}`} d={`M${x},60 Q${x + 10},250 ${x},460`} />
        ))}
        {/* Equator (stronger) */}
        <line x1="50" y1="250" x2="950" y2="250" strokeOpacity="0.06" strokeWidth="0.8" strokeDasharray="8,4" />
      </g>

      {/* Continents */}
      <g fill="url(#landGrad)" filter="url(#landShadow)">
        {/* North America */}
        <path d="M80,70 C90,55 130,45 170,50 C200,53 215,48 230,60 C245,72 255,65 270,75 C280,82 275,95 268,108 C260,125 250,140 245,155 C238,172 230,185 222,195 C215,205 208,218 200,225 C192,232 180,235 172,228 C160,218 148,225 138,218 C128,210 118,195 110,178 C102,160 98,140 95,120 C92,100 85,85 80,70Z" />
        {/* Greenland */}
        <path d="M215,30 C230,25 255,28 268,35 C275,42 272,55 265,60 C255,67 240,65 228,58 C218,52 212,40 215,30Z" />
        {/* Central America & Caribbean */}
        <path d="M170,215 C178,210 188,215 195,225 C202,235 208,248 215,258 C220,268 222,275 218,282 C212,290 205,285 198,275 C190,262 182,248 175,235 C170,225 165,218 170,215Z" />
        {/* South America */}
        <path d="M218,280 C228,275 245,278 260,288 C278,300 292,318 302,340 C310,360 315,382 312,405 C308,425 298,442 285,455 C272,465 258,468 245,460 C232,450 225,432 220,410 C215,388 212,365 210,342 C208,318 210,298 218,280Z" />
        {/* Europe */}
        <path d="M430,55 C445,48 460,52 475,55 C490,58 502,52 515,58 C530,65 538,72 535,85 C532,95 525,105 520,115 C515,128 508,138 498,145 C488,152 475,148 465,140 C455,132 448,122 440,115 C432,108 428,95 430,82 C432,70 430,60 430,55Z" />
        {/* British Isles */}
        <path d="M410,68 C418,62 428,65 432,72 C435,78 432,85 426,90 C420,94 412,92 408,86 C405,80 406,72 410,68Z" />
        {/* Scandinavia */}
        <path d="M465,18 C472,12 482,15 488,22 C494,32 498,45 495,58 C492,65 485,62 480,55 C475,45 470,32 465,18Z" />
        {/* Iceland */}
        <path d="M378,38 C385,34 394,36 398,42 C400,47 396,52 390,53 C384,54 378,48 378,42Z" />
        {/* Africa */}
        <path d="M435,158 C450,150 468,148 488,152 C508,156 525,165 538,178 C550,192 558,210 565,232 C572,255 576,278 575,302 C574,325 568,348 558,368 C548,385 535,398 518,405 C500,412 482,410 465,400 C448,390 435,372 425,350 C418,330 415,305 418,280 C420,255 425,232 430,210 C435,188 435,172 435,158Z" />
        {/* Madagascar */}
        <path d="M582,345 C586,338 592,340 595,348 C597,358 596,370 592,378 C588,385 583,382 581,372 C580,362 580,352 582,345Z" />
        {/* Middle East */}
        <path d="M535,118 C548,112 565,110 580,115 C595,120 608,130 618,142 C625,155 622,168 612,178 C600,188 588,185 575,178 C562,170 550,162 540,150 C532,140 530,128 535,118Z" />
        {/* Arabian Peninsula */}
        <path d="M565,168 C578,162 592,165 605,172 C615,178 620,188 618,200 C615,212 608,218 598,220 C585,222 575,215 568,205 C562,195 560,178 565,168Z" />
        {/* Central & North Asia */}
        <path d="M555,22 C590,15 635,10 680,12 C725,15 770,22 810,35 C835,45 845,58 838,68 C828,78 810,82 788,78 C765,75 740,68 710,65 C678,62 648,58 620,62 C595,65 572,55 558,42 C548,35 548,28 555,22Z" />
        {/* India */}
        <path d="M635,138 C652,130 672,132 688,140 C700,148 708,162 710,180 C712,200 705,222 692,240 C680,255 665,262 652,255 C640,248 632,232 628,212 C625,192 625,170 628,155 C630,145 632,140 635,138Z" />
        {/* Sri Lanka */}
        <path d="M672,262 C676,258 682,260 684,266 C685,272 682,278 678,280 C674,280 671,274 671,268Z" />
        {/* Southeast Asia */}
        <path d="M715,148 C728,140 745,142 758,152 C768,162 772,178 768,195 C762,212 752,222 738,225 C725,228 715,218 710,205 C705,190 708,170 715,148Z" />
        {/* China / East Asia */}
        <path d="M710,75 C735,68 762,72 790,82 C812,90 828,102 835,118 C840,135 832,150 818,160 C800,170 780,172 758,165 C738,158 722,145 712,128 C705,112 705,95 710,75Z" />
        {/* Korean Peninsula */}
        <path d="M838,88 C842,82 848,85 850,92 C852,100 850,110 846,118 C842,122 838,118 836,110 C835,102 836,95 838,88Z" />
        {/* Japan */}
        <path d="M852,82 C858,75 866,78 870,88 C873,100 870,115 865,125 C860,132 854,128 852,118 C850,108 850,95 852,82Z" />
        {/* Indonesia */}
        <path d="M728,252 C745,245 768,248 790,252 C812,256 832,258 845,262 C852,268 848,275 838,278 C822,282 802,280 780,275 C758,270 738,268 725,265 C718,262 720,256 728,252Z" />
        {/* Philippines */}
        <path d="M808,195 C812,188 818,190 820,198 C822,208 820,218 816,225 C812,230 808,226 806,218 C805,208 806,200 808,195Z" />
        {/* Australia */}
        <path d="M785,322 C808,308 838,305 868,312 C895,320 912,338 918,360 C922,382 912,402 895,415 C875,428 852,432 830,425 C808,418 790,402 782,382 C775,362 778,340 785,322Z" />
        {/* New Zealand */}
        <path d="M928,395 C932,388 938,392 940,400 C941,410 938,420 934,425 C930,428 927,422 926,415 C926,408 926,400 928,395Z" />
        {/* Papua New Guinea */}
        <path d="M862,275 C870,270 880,272 888,278 C894,284 892,292 886,296 C878,300 870,298 864,292 C860,286 858,280 862,275Z" />
      </g>
    </svg>
  );
}

export function ConflictZonesMap() {
  const [selectedZone, setSelectedZone] = useState<ConflictZone | null>(null);
  const navigate = useLocalizedNavigate();
  const { t } = useTranslation();

  const handleZoneClick = useCallback((zone: ConflictZone) => {
    setSelectedZone(prev => prev?.id === zone.id ? null : zone);
  }, []);

  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/30 to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 border border-destructive/20 mb-6"
          >
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <span className="text-sm text-destructive font-medium">
              {t('geopolitics.updatedDate', 'Updated March 2026')}
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="font-display text-3xl md:text-5xl font-bold mb-5 tracking-tight"
          >
            {t('geopolitics.mapTitle', 'Active conflict zones')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg"
          >
            {t('geopolitics.mapSubtitle', '6 conflict or high-tension zones tracked in real time. Click to see impact on neighboring countries.')}
          </motion.p>
        </div>

        {/* Map */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative mx-auto max-w-5xl aspect-[2/1] rounded-2xl border border-border/30 overflow-hidden shadow-[0_8px_60px_-12px_hsl(var(--foreground)/0.08)]"
          style={{
            background: 'linear-gradient(145deg, hsl(var(--card)) 0%, hsl(var(--muted)/0.5) 50%, hsl(var(--card)) 100%)',
          }}
        >
          {/* Vignette overlay */}
          <div
            className="absolute inset-0 pointer-events-none z-[1]"
            style={{
              background: 'radial-gradient(ellipse at center, transparent 50%, hsl(var(--card)/0.6) 100%)',
            }}
          />

          {/* World Map */}
          <WorldMapSVG />

          {/* Conflict markers */}
          {CONFLICT_ZONES.map((zone, index) => {
            const config = STATUS_CONFIG[zone.status];
            const isSelected = selectedZone?.id === zone.id;

            return (
              <motion.div
                key={zone.id}
                className="absolute cursor-pointer group z-10"
                style={{
                  left: `${zone.x}%`,
                  top: `${zone.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + index * 0.08, type: 'spring', stiffness: 200 }}
                onClick={() => handleZoneClick(zone)}
              >
                {/* Impact radius — soft radial fill */}
                <motion.div
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    width: zone.radiusPx * 2,
                    height: zone.radiusPx * 2,
                    left: -zone.radiusPx,
                    top: -zone.radiusPx,
                    background: `radial-gradient(circle, ${config.glowSoft} 0%, transparent 70%)`,
                  }}
                  animate={{
                    opacity: isSelected ? 1 : 0.5,
                    scale: isSelected ? [1, 1.06, 1] : 1,
                  }}
                  transition={{
                    opacity: { duration: 0.3 },
                    scale: { duration: 4, repeat: isSelected ? Infinity : 0, ease: 'easeInOut' },
                  }}
                />

                {/* Dashed border ring */}
                <motion.div
                  className={cn('absolute rounded-full border border-dashed pointer-events-none', config.border)}
                  style={{
                    width: zone.radiusPx * 2,
                    height: zone.radiusPx * 2,
                    left: -zone.radiusPx,
                    top: -zone.radiusPx,
                  }}
                  animate={{
                    opacity: isSelected ? 0.5 : 0.15,
                    rotate: [0, 360],
                  }}
                  transition={{
                    opacity: { duration: 0.3 },
                    rotate: { duration: 120, repeat: Infinity, ease: 'linear' },
                  }}
                />

                {/* Pulse rings — two staggered */}
                <motion.div
                  className={cn('absolute w-6 h-6 -left-3 -top-3 rounded-full', config.pulse)}
                  animate={{ scale: [1, 3], opacity: [0.5, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
                />
                <motion.div
                  className={cn('absolute w-6 h-6 -left-3 -top-3 rounded-full', config.pulse)}
                  animate={{ scale: [1, 3], opacity: [0.5, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut', delay: 1.25 }}
                />

                {/* Core marker */}
                <motion.div
                  className={cn('relative w-3.5 h-3.5 rounded-full shadow-lg z-10 ring-2 ring-background/80', config.color)}
                  style={{ boxShadow: `0 0 16px 3px ${config.glow}` }}
                  whileHover={{ scale: 1.6 }}
                  animate={isSelected ? { scale: [1.3, 1.5, 1.3] } : { scale: 1 }}
                  transition={isSelected
                    ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
                    : { type: 'spring', stiffness: 300 }
                  }
                />

                {/* Tooltip label */}
                <div className={cn(
                  'absolute left-6 top-1/2 -translate-y-1/2 whitespace-nowrap text-xs font-semibold px-3 py-2 rounded-lg border transition-all duration-200 z-20 pointer-events-none',
                  'bg-popover/95 text-popover-foreground border-border/50 shadow-xl backdrop-blur-md',
                  'opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0',
                  isSelected && 'opacity-100 translate-x-0',
                )}>
                  <div className="flex items-center gap-2">
                    <div className={cn('w-2 h-2 rounded-full', config.color)} />
                    {t(zone.nameKey, zone.nameFallback)}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 font-normal">
                    {t(config.label, config.labelFallback)} · {t('geopolitics.since', 'Since')} {zone.since}
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Legend */}
          <div className="absolute bottom-4 left-4 flex items-center gap-5 px-4 py-2.5 rounded-xl bg-background/70 backdrop-blur-md border border-border/30 shadow-sm z-20">
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <div key={key} className="flex items-center gap-2">
                <div className={cn('w-2.5 h-2.5 rounded-full shadow-sm', config.color)} />
                <span className="text-[11px] text-muted-foreground font-medium">
                  {t(config.label, config.labelFallback)}
                </span>
              </div>
            ))}
          </div>

          {/* Live indicator */}
          <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/70 backdrop-blur-md border border-border/30 shadow-sm z-20">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">Live</span>
          </div>

          {/* Zone count */}
          <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/70 backdrop-blur-md border border-border/30 shadow-sm z-20">
            <AlertTriangle className="w-3 h-3 text-destructive" />
            <span className="text-[11px] font-semibold text-muted-foreground">
              {CONFLICT_ZONES.length} {t('geopolitics.zonesTracked', 'zones tracked')}
            </span>
          </div>
        </motion.div>

        {/* Detail panel */}
        <AnimatePresence>
          {selectedZone && (() => {
            const config = STATUS_CONFIG[selectedZone.status];
            const trend = TREND_CONFIG[selectedZone.trend];
            return (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="max-w-2xl mx-auto mt-8"
              >
                <div className={cn('rounded-2xl border p-6 relative backdrop-blur-sm', config.panelBg)}>
                  <button
                    onClick={() => setSelectedZone(null)}
                    className="absolute top-4 right-4 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                    aria-label={t('common.close', 'Close')}
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* Title row */}
                  <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <AlertTriangle className={cn('w-5 h-5', config.text)} />
                    <h3 className="font-bold text-lg">{t(selectedZone.nameKey, selectedZone.nameFallback)}</h3>
                    <Badge variant="outline" className={config.badge}>
                      {t(config.label, config.labelFallback)}
                    </Badge>
                    <Badge variant="outline" className="text-xs text-muted-foreground">
                      {t('geopolitics.since', 'Since')} {selectedZone.since}
                    </Badge>
                    <Badge variant="outline" className={cn('text-xs gap-1', trend.color)}>
                      <TrendingUp className="w-3 h-3" />
                      {trend.label}
                    </Badge>
                  </div>

                  {/* Summary */}
                  <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                    {t(selectedZone.summaryKey, selectedZone.summaryFallback)}
                  </p>

                  {/* Casualties if available */}
                  {selectedZone.casualties && (
                    <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground">
                      <span className="font-medium">{t('geopolitics.estimatedCasualties', 'Est. casualties')}:</span>
                      <span className={cn('font-bold', config.text)}>{selectedZone.casualties}</span>
                    </div>
                  )}

                  {/* Impacted countries */}
                  <div className="flex items-center gap-2 flex-wrap mb-5">
                    <Shield className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-xs text-muted-foreground font-medium">
                      {t('geopolitics.impactedCountries', 'Impacted countries')}:
                    </span>
                    {selectedZone.impactedCountries.map(c => (
                      <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                    ))}
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate('/regulatory-alerts')}
                    className="gap-2"
                  >
                    {t('geopolitics.viewAlerts', 'View detailed alerts')}
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </div>
    </section>
  );
}
