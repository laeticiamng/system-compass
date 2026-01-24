import { useState } from 'react';
import { Globe, Info, Palmtree, Building2, ArrowRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DestinationRecommendation } from '@/lib/nationality-advantages';
import { DestinationInsights } from './DestinationInsights';
import { InstallationTimeline } from './InstallationTimeline';

interface DestinationMapProps {
  recommendations: DestinationRecommendation[];
  nationalities: string[];
  aspiration: string;
  currentCountry: string;
  onCompare?: (dest1: DestinationRecommendation, dest2: DestinationRecommendation) => void;
}

// Coordonnées simplifiées pour affichage sur grille
const REGION_POSITIONS: Record<string, { x: number; y: number; region: string }> = {
  // Europe
  france: { x: 45, y: 25, region: 'europe' },
  germany: { x: 50, y: 22, region: 'europe' },
  switzerland: { x: 48, y: 27, region: 'europe' },
  spain: { x: 40, y: 32, region: 'europe' },
  portugal: { x: 37, y: 32, region: 'europe' },
  italy: { x: 52, y: 30, region: 'europe' },
  netherlands: { x: 47, y: 20, region: 'europe' },
  uk: { x: 42, y: 18, region: 'europe' },
  ireland: { x: 38, y: 17, region: 'europe' },
  belgium: { x: 46, y: 21, region: 'europe' },
  austria: { x: 53, y: 26, region: 'europe' },
  sweden: { x: 52, y: 12, region: 'europe' },
  norway: { x: 50, y: 10, region: 'europe' },
  denmark: { x: 49, y: 15, region: 'europe' },
  finland: { x: 56, y: 10, region: 'europe' },
  poland: { x: 55, y: 20, region: 'europe' },
  czechia: { x: 53, y: 23, region: 'europe' },
  hungary: { x: 56, y: 26, region: 'europe' },
  greece: { x: 57, y: 34, region: 'europe' },
  croatia: { x: 54, y: 28, region: 'europe' },
  
  // Americas
  usa: { x: 20, y: 30, region: 'americas' },
  canada: { x: 18, y: 18, region: 'americas' },
  mexico: { x: 15, y: 40, region: 'americas' },
  brazil: { x: 28, y: 55, region: 'americas' },
  argentina: { x: 25, y: 70, region: 'americas' },
  chile: { x: 23, y: 68, region: 'americas' },
  colombia: { x: 22, y: 48, region: 'americas' },
  
  // Asia-Pacific
  japan: { x: 85, y: 30, region: 'asia' },
  south_korea: { x: 82, y: 32, region: 'asia' },
  china: { x: 78, y: 32, region: 'asia' },
  singapore: { x: 77, y: 50, region: 'asia' },
  thailand: { x: 75, y: 45, region: 'asia' },
  vietnam: { x: 77, y: 43, region: 'asia' },
  indonesia: { x: 80, y: 55, region: 'asia' },
  malaysia: { x: 76, y: 48, region: 'asia' },
  philippines: { x: 82, y: 45, region: 'asia' },
  india: { x: 70, y: 40, region: 'asia' },
  australia: { x: 85, y: 65, region: 'oceania' },
  new_zealand: { x: 92, y: 72, region: 'oceania' },
  
  // Middle East & Africa
  uae: { x: 65, y: 40, region: 'middle_east' },
  israel: { x: 60, y: 35, region: 'middle_east' },
  turkey: { x: 58, y: 32, region: 'middle_east' },
  egypt: { x: 58, y: 38, region: 'africa' },
  south_africa: { x: 55, y: 68, region: 'africa' },
  morocco: { x: 42, y: 35, region: 'africa' },
};

const REGION_COLORS = {
  europe: 'bg-blue-500',
  americas: 'bg-emerald-500',
  asia: 'bg-amber-500',
  oceania: 'bg-cyan-500',
  middle_east: 'bg-orange-500',
  africa: 'bg-rose-500',
};

export function DestinationMap({
  recommendations,
  nationalities,
  aspiration,
  currentCountry,
  onCompare,
}: DestinationMapProps) {
  const [selectedDest, setSelectedDest] = useState<DestinationRecommendation | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareDests, setCompareDests] = useState<DestinationRecommendation[]>([]);
  const [viewMode, setViewMode] = useState<'vacation' | 'installation'>('vacation');
  const [showInsights, setShowInsights] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);

  const handleDestClick = (dest: DestinationRecommendation) => {
    if (compareMode) {
      if (compareDests.length < 2 && !compareDests.find(d => d.countryId === dest.countryId)) {
        const newCompareDests = [...compareDests, dest];
        setCompareDests(newCompareDests);
        if (newCompareDests.length === 2 && onCompare) {
          onCompare(newCompareDests[0], newCompareDests[1]);
        }
      } else if (compareDests.find(d => d.countryId === dest.countryId)) {
        setCompareDests(compareDests.filter(d => d.countryId !== dest.countryId));
      }
    } else {
      setSelectedDest(selectedDest?.countryId === dest.countryId ? null : dest);
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-muted/30 rounded-xl">
        {/* Mode Toggle */}
        <div className="flex items-center gap-2 p-1 bg-muted rounded-lg">
          <Button
            variant={viewMode === 'vacation' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('vacation')}
            className="gap-2"
          >
            <Palmtree className="w-4 h-4" />
            Vacances
          </Button>
          <Button
            variant={viewMode === 'installation' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('installation')}
            className="gap-2"
          >
            <Building2 className="w-4 h-4" />
            Installation
          </Button>
        </div>

        {/* Compare Toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant={compareMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setCompareMode(!compareMode);
              setCompareDests([]);
            }}
          >
            {compareMode ? `Comparer (${compareDests.length}/2)` : 'Mode comparaison'}
          </Button>
          {compareMode && compareDests.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setCompareDests([])}>
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Visual Map */}
      <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-4 min-h-[400px] overflow-hidden">
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(10)].map((_, i) => (
            <div key={`h-${i}`} className="absolute w-full h-px bg-white" style={{ top: `${(i + 1) * 10}%` }} />
          ))}
          {[...Array(10)].map((_, i) => (
            <div key={`v-${i}`} className="absolute h-full w-px bg-white" style={{ left: `${(i + 1) * 10}%` }} />
          ))}
        </div>

        {/* Regions Labels */}
        <div className="absolute top-2 left-2 flex flex-wrap gap-2 text-xs">
          {Object.entries({ europe: '🌍 Europe', americas: '🌎 Amériques', asia: '🌏 Asie', oceania: '🏝️ Océanie' }).map(([key, label]) => (
            <span key={key} className={cn('px-2 py-1 rounded-full text-white/80', REGION_COLORS[key as keyof typeof REGION_COLORS])}>
              {label}
            </span>
          ))}
        </div>

        {/* Destination Points */}
        {recommendations.map((dest, index) => {
          const pos = REGION_POSITIONS[dest.countryId];
          if (!pos) return null;
          
          const isSelected = selectedDest?.countryId === dest.countryId;
          const isComparing = compareDests.find(d => d.countryId === dest.countryId);
          const size = Math.max(24, 40 - index * 3);
          
          return (
            <button
              key={dest.countryId}
              onClick={() => handleDestClick(dest)}
              className={cn(
                "absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-125 z-10",
                isSelected && "ring-4 ring-primary scale-125 z-20",
                isComparing && "ring-4 ring-amber-500 scale-110",
                dest.score >= 70 ? 'bg-emerald-500' : dest.score >= 50 ? 'bg-amber-500' : 'bg-orange-500'
              )}
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                width: size,
                height: size,
              }}
              title={`${dest.countryName} - ${dest.score}%`}
            >
              <span className="text-sm">{dest.flag}</span>
              {index < 3 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-[10px] rounded-full flex items-center justify-center text-white font-bold">
                  {index + 1}
                </span>
              )}
            </button>
          );
        })}

        {/* Connection lines for compare mode */}
        {compareMode && compareDests.length === 2 && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <line
              x1={`${REGION_POSITIONS[compareDests[0].countryId]?.x || 0}%`}
              y1={`${REGION_POSITIONS[compareDests[0].countryId]?.y || 0}%`}
              x2={`${REGION_POSITIONS[compareDests[1].countryId]?.x || 0}%`}
              y2={`${REGION_POSITIONS[compareDests[1].countryId]?.y || 0}%`}
              stroke="rgb(251, 191, 36)"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          </svg>
        )}
      </div>

      {/* Selected Destination Details */}
      {selectedDest && !compareMode && (
        <div className="glass-card rounded-xl p-6 border-2 border-primary/30 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{selectedDest.flag}</span>
              <div>
                <h3 className="text-xl font-bold">{selectedDest.countryName}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full",
                    selectedDest.accessType === 'visa_free' && "bg-emerald-500/20 text-emerald-400",
                    selectedDest.accessType === 'easy_visa' && "bg-green-500/20 text-green-400",
                    selectedDest.accessType === 'work_visa' && "bg-amber-500/20 text-amber-400",
                    selectedDest.accessType === 'requires_visa' && "bg-orange-500/20 text-orange-400",
                  )}>
                    {selectedDest.accessType === 'visa_free' && '✓ Sans visa'}
                    {selectedDest.accessType === 'easy_visa' && '○ Visa facile'}
                    {selectedDest.accessType === 'work_visa' && '◐ Visa travail'}
                    {selectedDest.accessType === 'requires_visa' && '● Visa requis'}
                  </span>
                  <span className="text-sm font-medium text-primary">{selectedDest.score}% match</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {viewMode === 'installation' && (
                <Button 
                  variant="outline"
                  onClick={() => setShowTimeline(true)}
                  className="gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Timeline
                </Button>
              )}
              <Button 
                onClick={() => setShowInsights(true)}
                className="gap-2"
              >
                <Info className="w-4 h-4" />
                {viewMode === 'vacation' ? 'Guide Vacances' : 'Guide Installation'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Mode-specific quick info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                {viewMode === 'vacation' ? (
                  <><Palmtree className="w-4 h-4 text-emerald-500" /> Pour vos vacances</>
                ) : (
                  <><Building2 className="w-4 h-4 text-blue-500" /> Pour vous installer</>
                )}
              </h4>
              <ul className="text-sm space-y-1">
                {selectedDest.reasons.slice(0, 3).map((reason, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" /> Avantages liés à vos nationalités
              </h4>
              <div className="flex flex-wrap gap-1">
                {selectedDest.matchedAdvantages.map((adv, i) => (
                  <span key={i} className="text-xs px-2 py-1 bg-primary/10 rounded-full">
                    {adv}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Installation Timeline Dialog */}
      {showTimeline && selectedDest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl">
            <InstallationTimeline
              destination={selectedDest}
              aspiration={aspiration}
              currentCountry={currentCountry}
              onClose={() => setShowTimeline(false)}
            />
          </div>
        </div>
      )}
      {/* AI Insights Dialog */}
      {showInsights && selectedDest && (
        <DestinationInsights
          destination={selectedDest}
          nationalities={nationalities}
          aspiration={aspiration}
          currentCountry={currentCountry}
          mode={viewMode}
          onClose={() => setShowInsights(false)}
        />
      )}

      {/* Compare Preview */}
      {compareMode && compareDests.length === 2 && (
        <div className="glass-card rounded-xl p-4 border-2 border-amber-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{compareDests[0].flag}</span>
                <span className="font-medium">{compareDests[0].countryName}</span>
              </div>
              <span className="text-muted-foreground">vs</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{compareDests[1].flag}</span>
                <span className="font-medium">{compareDests[1].countryName}</span>
              </div>
            </div>
            <Button onClick={() => onCompare?.(compareDests[0], compareDests[1])}>
              Comparer en détail
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
