/**
 * ConflictZonesMap — Premium interactive conflict zones visualization
 * Natural Earth–inspired projection with animated threat markers
 */
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Shield, ExternalLink, X, TrendingUp } from 'lucide-react';
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
  escalating: { icon: '↗', color: 'text-red-500', labelKey: 'geopolitics.trend.escalating', labelFallback: 'Escalating' },
  stable: { icon: '→', color: 'text-amber-500', labelKey: 'geopolitics.trend.stable', labelFallback: 'Stable' },
  'de-escalating': { icon: '↘', color: 'text-emerald-500', labelKey: 'geopolitics.trend.de-escalating', labelFallback: 'De-escalating' },
};

// Realistic world map SVG — simplified Natural Earth / Robinson projection
function WorldMapSVG() {
  return (
    <svg
      viewBox="0 0 1000 500"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="landGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--foreground))" stopOpacity="0.08" />
          <stop offset="100%" stopColor="hsl(var(--foreground))" stopOpacity="0.04" />
        </linearGradient>
      </defs>

      {/* Graticule */}
      <g stroke="hsl(var(--foreground))" strokeOpacity="0.04" strokeWidth="0.4" fill="none">
        {[100, 150, 200, 250, 300, 350, 400].map(y => (
          <line key={`lat-${y}`} x1="30" y1={y} x2="970" y2={y} />
        ))}
        {[100, 200, 300, 400, 500, 600, 700, 800, 900].map(x => (
          <line key={`lon-${x}`} x1={x} y1="40" x2={x} y2="460" />
        ))}
        {/* Equator */}
        <line x1="30" y1="250" x2="970" y2="250" strokeOpacity="0.07" strokeWidth="0.6" strokeDasharray="6,3" />
      </g>

      {/* Continents — clean recognizable shapes */}
      <g fill="url(#landGrad)" stroke="hsl(var(--foreground))" strokeOpacity="0.06" strokeWidth="0.5">
        {/* North America */}
        <path d="M60,80 L100,55 L140,48 L175,55 L210,50 L245,58 L265,75 L280,65 L270,90 L260,110 L258,130 L250,155 L240,175 L230,190 L220,200 L205,210 L195,225 L180,230 L165,222 L155,225 L145,215 L130,205 L118,190 L108,170 L100,150 L95,130 L90,110 L82,95 Z" />
        {/* Greenland */}
        <path d="M230,28 L260,22 L285,28 L295,40 L288,55 L270,62 L248,58 L235,45 Z" />
        {/* Central America */}
        <path d="M165,228 L175,235 L185,248 L195,262 L200,270 L195,278 L185,275 L175,265 L170,250 L162,238 Z" />
        {/* South America */}
        <path d="M200,278 L220,272 L240,278 L258,290 L275,310 L288,335 L298,362 L302,390 L298,415 L288,435 L272,448 L255,455 L240,450 L228,435 L220,412 L215,388 L210,358 L208,330 L205,305 L200,290 Z" />
        {/* Europe */}
        <path d="M430,48 L445,42 L462,45 L478,48 L495,45 L510,52 L525,58 L535,68 L538,82 L532,95 L525,108 L518,118 L508,128 L498,135 L488,138 L475,132 L462,125 L452,118 L442,108 L435,95 L432,80 L430,65 Z" />
        {/* British Isles */}
        <path d="M408,62 L418,55 L428,58 L432,68 L428,78 L420,85 L412,82 L406,72 Z" />
        {/* Scandinavia */}
        <path d="M462,15 L472,10 L482,15 L490,28 L495,45 L492,55 L485,52 L478,42 L472,28 L465,20 Z" />
        {/* Africa */}
        <path d="M438,145 L455,138 L475,135 L495,138 L515,148 L530,162 L542,180 L552,202 L560,228 L565,258 L565,288 L562,315 L555,340 L545,362 L530,380 L515,392 L498,398 L480,395 L465,385 L452,370 L442,348 L435,322 L430,295 L428,268 L430,240 L432,215 L435,190 L435,168 Z" />
        {/* Madagascar */}
        <path d="M580,340 L588,332 L595,340 L598,355 L595,372 L588,382 L582,375 L578,358 Z" />
        {/* Middle East */}
        <path d="M540,110 L558,105 L578,108 L598,115 L615,128 L625,142 L628,158 L620,170 L608,175 L595,172 L580,168 L568,158 L555,148 L545,135 L540,122 Z" />
        {/* Arabian Peninsula */}
        <path d="M562,168 L580,160 L598,165 L612,175 L618,190 L615,205 L605,215 L592,218 L578,212 L568,200 L562,185 Z" />
        {/* Russia / Central Asia */}
        <path d="M540,18 L580,12 L630,8 L680,10 L730,15 L775,22 L815,32 L845,45 L855,58 L848,68 L830,75 L808,72 L782,68 L755,62 L725,58 L695,55 L665,52 L635,55 L610,52 L585,48 L562,40 L545,30 Z" />
        {/* India */}
        <path d="M638,132 L658,125 L678,130 L695,142 L705,160 L712,182 L710,205 L702,225 L690,242 L675,252 L660,248 L648,235 L638,215 L632,192 L630,170 L632,152 Z" />
        {/* Sri Lanka */}
        <path d="M672,258 L680,252 L686,258 L686,268 L680,275 L674,270 Z" />
        {/* Southeast Asia */}
        <path d="M718,140 L735,132 L752,138 L765,152 L772,170 L770,190 L762,208 L750,218 L738,222 L725,215 L718,200 L712,180 L712,160 Z" />
        {/* China / East Asia */}
        <path d="M715,68 L742,60 L770,65 L798,75 L820,88 L835,105 L838,122 L830,138 L815,150 L798,158 L778,160 L758,155 L740,145 L725,132 L715,115 L710,98 L712,82 Z" />
        {/* Korean Peninsula */}
        <path d="M840,82 L848,75 L855,82 L855,98 L850,112 L845,118 L838,112 L836,98 Z" />
        {/* Japan */}
        <path d="M858,72 L865,65 L872,72 L875,88 L872,108 L868,122 L862,128 L855,120 L854,105 L855,88 Z" />
        {/* Indonesia */}
        <path d="M725,248 L748,242 L775,245 L802,248 L828,252 L848,258 L855,265 L848,272 L828,275 L802,272 L775,268 L748,262 L730,258 Z" />
        {/* Philippines */}
        <path d="M812,188 L820,182 L826,188 L826,202 L822,215 L816,222 L810,215 L808,200 Z" />
        {/* Australia */}
        <path d="M788,318 L815,305 L845,302 L878,308 L905,322 L920,342 L925,365 L918,388 L905,405 L885,418 L862,425 L838,422 L818,412 L802,395 L790,375 L785,352 L785,335 Z" />
        {/* New Zealand */}
        <path d="M935,388 L942,382 L948,390 L948,405 L942,418 L935,422 L930,415 L930,400 Z" />
        {/* Papua New Guinea */}
        <path d="M868,270 L882,265 L895,270 L900,280 L895,288 L882,290 L872,285 Z" />
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6"
          >
            <Shield className="w-4 h-4 text-amber-500" />
            <span className="text-sm text-amber-500 font-medium">
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
                      {t(trend.labelKey, trend.labelFallback)}
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
