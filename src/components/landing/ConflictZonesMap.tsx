/**
 * ConflictZonesMap — Interactive conflict zones visualization for the homepage
 * Shows active conflicts with animated impact radius on neighboring countries
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Shield, ExternalLink, X, Radio } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLocalizedNavigate } from '@/hooks/useLocalizedNavigate';

interface ConflictZone {
  id: string;
  name: string;
  status: 'war' | 'high_tension' | 'instability';
  x: number;
  y: number;
  radiusPx: number;
  impactedCountries: string[];
  summary: string;
  since: string;
}

const CONFLICT_ZONES: ConflictZone[] = [
  {
    id: 'ukraine',
    name: 'Ukraine — Russie',
    status: 'war',
    x: 56, y: 22,
    radiusPx: 60,
    impactedCountries: ['Pologne', 'Roumanie', 'Moldavie', 'Pays baltes', 'Finlande'],
    summary: 'Conflit armé depuis 2022. Sanctions UE/US massives. Impact sur l\'énergie et les visas en Europe de l\'Est.',
    since: '2022',
  },
  {
    id: 'gaza',
    name: 'Israël — Gaza',
    status: 'war',
    x: 57, y: 42,
    radiusPx: 45,
    impactedCountries: ['Liban', 'Jordanie', 'Égypte', 'Yémen (Mer Rouge)', 'EAU'],
    summary: 'Conflit Gaza. Perturbations Mer Rouge (+30% coûts fret). Tensions régionales avec le Liban et l\'Iran.',
    since: '2023',
  },
  {
    id: 'sahel',
    name: 'Sahel (Mali, Burkina, Niger)',
    status: 'instability',
    x: 44, y: 48,
    radiusPx: 55,
    impactedCountries: ['Côte d\'Ivoire', 'Ghana', 'Sénégal', 'Tchad', 'Nigeria'],
    summary: 'Coups d\'État en cascade. Retrait forces françaises. Alliance AES pro-Russie. Risque élevé pour les expats.',
    since: '2021',
  },
  {
    id: 'sudan',
    name: 'Soudan',
    status: 'war',
    x: 56, y: 50,
    radiusPx: 40,
    impactedCountries: ['Tchad', 'Égypte', 'Éthiopie', 'Soudan du Sud'],
    summary: 'Guerre civile SAF vs RSF. Plus grande crise de déplacement au monde (10M+). Famine. Pays totalement déconseillé.',
    since: '2023',
  },
  {
    id: 'myanmar',
    name: 'Myanmar',
    status: 'war',
    x: 78, y: 42,
    radiusPx: 35,
    impactedCountries: ['Thaïlande', 'Inde', 'Bangladesh', 'Laos'],
    summary: 'Guerre civile contre la junte militaire. Effondrement de l\'État. Réfugiés vers la Thaïlande et l\'Inde.',
    since: '2021',
  },
  {
    id: 'taiwan',
    name: 'Détroit de Taïwan',
    status: 'high_tension',
    x: 84, y: 35,
    radiusPx: 45,
    impactedCountries: ['Japon', 'Philippines', 'Corée du Sud', 'Australie'],
    summary: 'Exercices militaires chinois réguliers. Risque de blocus 15-25%. Impact semi-conducteurs (TSMC = 60% mondial).',
    since: '2022',
  },
];

const STATUS_CONFIG = {
  war: { label: 'Guerre active', color: 'bg-red-500', pulse: 'bg-red-400', border: 'border-red-500/30', fill: 'bg-red-500', text: 'text-red-400', badge: 'bg-red-500/15 text-red-500 border-red-500/30' },
  high_tension: { label: 'Haute tension', color: 'bg-amber-500', pulse: 'bg-amber-400', border: 'border-amber-500/30', fill: 'bg-amber-500', text: 'text-amber-400', badge: 'bg-amber-500/15 text-amber-500 border-amber-500/30' },
  instability: { label: 'Instabilité', color: 'bg-orange-500', pulse: 'bg-orange-400', border: 'border-orange-500/30', fill: 'bg-orange-500', text: 'text-orange-400', badge: 'bg-orange-500/15 text-orange-500 border-orange-500/30' },
};

// SVG paths for simplified continent silhouettes
function ContinentsSVG() {
  return (
    <svg
      viewBox="0 0 1000 500"
      className="absolute inset-0 w-full h-full"
      fill="currentColor"
      opacity={0.06}
    >
      {/* North America */}
      <path d="M120,60 L180,50 L220,70 L240,100 L260,80 L280,90 L270,130 L240,160 L220,200 L200,220 L180,200 L160,210 L140,190 L120,160 L100,130 L110,100 Z" />
      {/* Central America */}
      <path d="M180,200 L200,220 L210,250 L220,270 L210,280 L190,260 L180,240 Z" />
      {/* South America */}
      <path d="M220,270 L250,280 L280,300 L300,340 L310,380 L300,420 L280,450 L260,460 L240,440 L230,400 L220,360 L210,320 L210,290 Z" />
      {/* Europe */}
      <path d="M440,50 L460,55 L480,60 L500,50 L520,60 L540,70 L530,90 L510,100 L520,120 L510,140 L490,150 L470,140 L460,130 L440,120 L430,100 L440,80 Z" />
      {/* UK/Ireland */}
      <path d="M420,70 L435,65 L440,80 L430,90 L420,85 Z" />
      {/* Scandinavia */}
      <path d="M470,20 L480,15 L490,25 L500,50 L490,55 L480,45 L470,30 Z" />
      {/* Africa */}
      <path d="M440,160 L470,150 L500,155 L530,170 L550,200 L570,240 L580,280 L570,320 L560,360 L540,380 L510,390 L480,380 L460,360 L440,320 L430,280 L420,240 L430,200 Z" />
      {/* Middle East */}
      <path d="M540,120 L570,110 L600,120 L620,140 L610,170 L590,180 L570,170 L550,160 L540,140 Z" />
      {/* Central Asia */}
      <path d="M580,70 L640,60 L700,70 L720,90 L700,110 L660,120 L620,110 L590,100 Z" />
      {/* Russia/Siberia */}
      <path d="M520,20 L580,15 L650,10 L740,15 L800,25 L840,40 L820,60 L780,70 L740,65 L700,60 L640,55 L580,60 L540,50 L520,35 Z" />
      {/* India */}
      <path d="M640,140 L670,130 L700,140 L710,170 L700,210 L680,240 L660,250 L640,230 L630,200 L630,170 Z" />
      {/* Southeast Asia */}
      <path d="M720,150 L750,140 L770,160 L760,190 L740,210 L720,200 L710,180 Z" />
      {/* China/East Asia */}
      <path d="M720,80 L760,70 L800,80 L830,100 L840,130 L820,150 L790,160 L760,150 L740,130 L720,110 Z" />
      {/* Japan */}
      <path d="M850,90 L860,80 L870,90 L865,110 L855,120 L845,110 Z" />
      {/* Indonesia */}
      <path d="M740,250 L770,240 L800,245 L830,250 L850,260 L830,270 L800,265 L770,260 L740,260 Z" />
      {/* Australia */}
      <path d="M790,320 L830,300 L870,310 L900,330 L910,360 L890,390 L860,400 L830,390 L800,370 L790,340 Z" />
    </svg>
  );
}

export function ConflictZonesMap() {
  const [selectedZone, setSelectedZone] = useState<ConflictZone | null>(null);
  const navigate = useLocalizedNavigate();

  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/40 to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 border border-destructive/20 mb-6"
          >
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <span className="text-sm text-destructive font-medium">Mise à jour mars 2026</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="font-display text-3xl md:text-5xl font-bold mb-5 tracking-tight"
          >
            Zones de conflit actives
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg"
          >
            6 zones de conflit ou haute tension suivies en temps réel. Cliquez pour voir l'impact sur les pays voisins.
          </motion.p>
        </div>

        {/* Map container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative mx-auto max-w-5xl aspect-[2/1] rounded-2xl border border-border/40 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--muted)) 100%)',
          }}
        >
          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `
                linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
            }}
          />

          {/* Continent silhouettes */}
          <ContinentsSVG />

          {/* Conflict zones */}
          {CONFLICT_ZONES.map((zone) => {
            const config = STATUS_CONFIG[zone.status];
            const isSelected = selectedZone?.id === zone.id;

            return (
              <div
                key={zone.id}
                className="absolute cursor-pointer group z-10"
                style={{
                  left: `${zone.x}%`,
                  top: `${zone.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                onClick={() => setSelectedZone(isSelected ? null : zone)}
              >
                {/* Impact radius - dashed circle */}
                <motion.div
                  className={cn(
                    'absolute rounded-full border border-dashed',
                    config.border,
                  )}
                  style={{
                    width: zone.radiusPx * 2,
                    height: zone.radiusPx * 2,
                    left: -zone.radiusPx,
                    top: -zone.radiusPx,
                  }}
                  animate={{
                    scale: isSelected ? [1, 1.08, 1] : 1,
                    opacity: isSelected ? 0.5 : 0.2,
                  }}
                  transition={{ duration: 3, repeat: isSelected ? Infinity : 0, ease: 'easeInOut' }}
                />

                {/* Impact fill - soft glow */}
                <motion.div
                  className="absolute rounded-full"
                  style={{
                    width: zone.radiusPx * 2,
                    height: zone.radiusPx * 2,
                    left: -zone.radiusPx,
                    top: -zone.radiusPx,
                    background: `radial-gradient(circle, ${
                      zone.status === 'war' ? 'rgba(239,68,68,0.12)' :
                      zone.status === 'high_tension' ? 'rgba(245,158,11,0.12)' :
                      'rgba(249,115,22,0.12)'
                    } 0%, transparent 70%)`,
                  }}
                  animate={{
                    opacity: isSelected ? 1 : 0.4,
                  }}
                />

                {/* Outer pulse ring */}
                <motion.div
                  className={cn('absolute w-5 h-5 -left-2.5 -top-2.5 rounded-full', config.pulse)}
                  animate={{ scale: [1, 2.5, 1], opacity: [0.4, 0, 0.4] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
                />

                {/* Core dot */}
                <motion.div
                  className={cn(
                    'relative w-3 h-3 rounded-full shadow-lg z-10',
                    config.color,
                  )}
                  style={{
                    boxShadow: `0 0 12px 2px ${
                      zone.status === 'war' ? 'rgba(239,68,68,0.4)' :
                      zone.status === 'high_tension' ? 'rgba(245,158,11,0.4)' :
                      'rgba(249,115,22,0.4)'
                    }`,
                  }}
                  whileHover={{ scale: 1.4 }}
                  animate={isSelected ? { scale: 1.5 } : { scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                />

                {/* Label tooltip */}
                <div className={cn(
                  'absolute left-5 top-1/2 -translate-y-1/2 whitespace-nowrap text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-all duration-200 z-20 pointer-events-none',
                  'bg-popover/95 text-popover-foreground border-border shadow-lg backdrop-blur-sm',
                  'opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0',
                  isSelected && 'opacity-100 translate-x-0',
                )}>
                  {zone.name}
                </div>
              </div>
            );
          })}

          {/* Legend */}
          <div className="absolute bottom-4 left-4 flex items-center gap-4 px-3 py-2 rounded-lg bg-background/60 backdrop-blur-sm border border-border/30">
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <div key={key} className="flex items-center gap-1.5">
                <div className={cn('w-2.5 h-2.5 rounded-full', config.color)} />
                <span className="text-[11px] text-muted-foreground font-medium">{config.label}</span>
              </div>
            ))}
          </div>

          {/* Live indicator */}
          <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/60 backdrop-blur-sm border border-border/30">
            <Radio className="w-3 h-3 text-red-500 animate-pulse" />
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Live</span>
          </div>
        </motion.div>

        {/* Detail panel */}
        <AnimatePresence>
          {selectedZone && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              className="max-w-2xl mx-auto mt-8"
            >
              <div className={cn(
                'rounded-2xl border p-6 relative backdrop-blur-sm',
                selectedZone.status === 'war' ? 'bg-red-500/5 border-red-500/20' :
                selectedZone.status === 'high_tension' ? 'bg-amber-500/5 border-amber-500/20' :
                'bg-orange-500/5 border-orange-500/20',
              )}>
                <button
                  onClick={() => setSelectedZone(null)}
                  className="absolute top-4 right-4 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className={cn(
                    'w-5 h-5',
                    STATUS_CONFIG[selectedZone.status].text
                  )} />
                  <h3 className="font-bold text-lg">{selectedZone.name}</h3>
                  <Badge variant="outline" className={STATUS_CONFIG[selectedZone.status].badge}>
                    {STATUS_CONFIG[selectedZone.status].label}
                  </Badge>
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    Depuis {selectedZone.since}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{selectedZone.summary}</p>

                <div className="flex items-center gap-2 flex-wrap mb-5">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-medium">Pays impactés :</span>
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
                  Voir les alertes détaillées
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
