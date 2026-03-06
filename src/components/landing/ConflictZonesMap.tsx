/**
 * ConflictZonesMap — Interactive conflict zones visualization for the homepage
 * Shows active conflicts with animated impact radius on neighboring countries
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Shield, ExternalLink, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLocalizedNavigate } from '@/hooks/useLocalizedNavigate';

interface ConflictZone {
  id: string;
  name: string;
  status: 'war' | 'high_tension' | 'instability';
  x: number; // % position on simplified map
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
  war: { label: 'Guerre active', color: 'bg-red-500', pulse: 'bg-red-400', badge: 'bg-red-500/20 text-red-400 border-red-500/30' },
  high_tension: { label: 'Haute tension', color: 'bg-amber-500', pulse: 'bg-amber-400', badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  instability: { label: 'Instabilité', color: 'bg-orange-500', pulse: 'bg-orange-400', badge: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
};

export function ConflictZonesMap() {
  const [selectedZone, setSelectedZone] = useState<ConflictZone | null>(null);
  const navigate = useLocalizedNavigate();

  return (
    <section className="py-20 md:py-28 bg-muted/30 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 mb-6"
          >
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-sm text-red-400 font-medium">Mise à jour mars 2026</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-3xl md:text-4xl font-bold mb-4"
          >
            Zones de conflit actives
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-muted-foreground max-w-2xl mx-auto"
          >
            6 zones de conflit ou haute tension suivies en temps réel. Cliquez pour voir l'impact sur les pays voisins.
          </motion.p>
        </div>

        {/* Map container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative mx-auto max-w-4xl aspect-[2/1] bg-background/50 rounded-2xl border border-border/50 overflow-hidden backdrop-blur-sm"
        >
          {/* Simplified world map background - CSS grid continents */}
          <div className="absolute inset-0 opacity-10">
            {/* Europe */}
            <div className="absolute w-[12%] h-[18%] top-[15%] left-[46%] bg-foreground rounded-md" />
            {/* Africa */}
            <div className="absolute w-[10%] h-[28%] top-[35%] left-[46%] bg-foreground rounded-md" />
            {/* Asia */}
            <div className="absolute w-[25%] h-[30%] top-[12%] left-[58%] bg-foreground rounded-lg" />
            {/* North America */}
            <div className="absolute w-[18%] h-[22%] top-[12%] left-[12%] bg-foreground rounded-lg" />
            {/* South America */}
            <div className="absolute w-[10%] h-[25%] top-[42%] left-[24%] bg-foreground rounded-md" />
            {/* Australia */}
            <div className="absolute w-[8%] h-[10%] top-[62%] left-[82%] bg-foreground rounded-md" />
          </div>

          {/* Conflict zones */}
          {CONFLICT_ZONES.map((zone) => {
            const config = STATUS_CONFIG[zone.status];
            const isSelected = selectedZone?.id === zone.id;

            return (
              <div
                key={zone.id}
                className="absolute cursor-pointer group"
                style={{
                  left: `${zone.x}%`,
                  top: `${zone.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                onClick={() => setSelectedZone(isSelected ? null : zone)}
              >
                {/* Impact radius */}
                <motion.div
                  className={cn(
                    'absolute rounded-full border-2 border-dashed',
                    zone.status === 'war' ? 'border-red-500/30' : zone.status === 'high_tension' ? 'border-amber-500/30' : 'border-orange-500/30',
                  )}
                  style={{
                    width: zone.radiusPx * 2,
                    height: zone.radiusPx * 2,
                    left: -zone.radiusPx,
                    top: -zone.radiusPx,
                  }}
                  animate={{
                    scale: isSelected ? [1, 1.1, 1] : 1,
                    opacity: isSelected ? 0.6 : 0.25,
                  }}
                  transition={{ duration: 2, repeat: isSelected ? Infinity : 0 }}
                />

                {/* Impact fill */}
                <motion.div
                  className={cn(
                    'absolute rounded-full',
                    zone.status === 'war' ? 'bg-red-500/8' : zone.status === 'high_tension' ? 'bg-amber-500/8' : 'bg-orange-500/8',
                  )}
                  style={{
                    width: zone.radiusPx * 2,
                    height: zone.radiusPx * 2,
                    left: -zone.radiusPx,
                    top: -zone.radiusPx,
                  }}
                  animate={{
                    opacity: isSelected ? 0.3 : 0.1,
                  }}
                />

                {/* Pulse */}
                <motion.div
                  className={cn('absolute w-4 h-4 -left-2 -top-2 rounded-full', config.pulse)}
                  animate={{ scale: [1, 2, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />

                {/* Dot */}
                <div className={cn(
                  'relative w-4 h-4 rounded-full border-2 border-background z-10 transition-transform',
                  config.color,
                  isSelected && 'scale-150',
                )} />

                {/* Label on hover */}
                <div className={cn(
                  'absolute left-6 top-1/2 -translate-y-1/2 whitespace-nowrap text-xs font-medium px-2 py-1 rounded-md border transition-opacity z-20',
                  'bg-popover text-popover-foreground border-border shadow-md',
                  'opacity-0 group-hover:opacity-100',
                  isSelected && 'opacity-100',
                )}>
                  {zone.name}
                </div>
              </div>
            );
          })}

          {/* Legend */}
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <div key={key} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <div className={cn('w-2 h-2 rounded-full', config.color)} />
                {config.label}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Detail panel */}
        <AnimatePresence>
          {selectedZone && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="max-w-2xl mx-auto mt-6"
            >
              <div className={cn(
                'rounded-xl border p-5 relative',
                selectedZone.status === 'war' ? 'bg-red-500/5 border-red-500/20' :
                selectedZone.status === 'high_tension' ? 'bg-amber-500/5 border-amber-500/20' :
                'bg-orange-500/5 border-orange-500/20',
              )}>
                <button
                  onClick={() => setSelectedZone(null)}
                  className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-3 mb-3">
                  <AlertTriangle className={cn(
                    'w-5 h-5',
                    selectedZone.status === 'war' ? 'text-red-400' :
                    selectedZone.status === 'high_tension' ? 'text-amber-400' : 'text-orange-400'
                  )} />
                  <h3 className="font-bold text-lg">{selectedZone.name}</h3>
                  <Badge variant="outline" className={STATUS_CONFIG[selectedZone.status].badge}>
                    {STATUS_CONFIG[selectedZone.status].label}
                  </Badge>
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    Depuis {selectedZone.since}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground mb-4">{selectedZone.summary}</p>

                <div className="flex items-center gap-2 flex-wrap mb-4">
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
