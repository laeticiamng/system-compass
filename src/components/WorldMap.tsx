import { useState, useMemo } from 'react';
import { useLocalizedNavigate } from '@/hooks/useLocalizedNavigate';
import { useTranslation } from 'react-i18next';
import { ZoomIn, ZoomOut, RotateCcw, Shield, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useCountries } from '@/lib/countries-data';
import { DB_COMPLETE_COUNTRY_IDS, hasCompleteDbData, EXTENDED_COUNTRY_META } from '@/lib/countries-extended';

interface CountryPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Positions approximatives des pays sur une carte mondiale simplifiée (en pourcentage)
const COUNTRY_POSITIONS: Record<string, CountryPosition> = {
  // Europe
  france: { x: 47, y: 32, width: 3, height: 3 },
  germany: { x: 50, y: 30, width: 2.5, height: 2.5 },
  switzerland: { x: 49, y: 34, width: 1.5, height: 1.5 },
  netherlands: { x: 48.5, y: 28, width: 1.5, height: 1.5 },
  portugal: { x: 43, y: 37, width: 1.5, height: 2 },
  'united-kingdom': { x: 45.5, y: 27, width: 2, height: 2.5 },
  italy: { x: 51, y: 36, width: 2, height: 3 },
  spain: { x: 44, y: 38, width: 3, height: 2.5 },
  austria: { x: 52, y: 32, width: 2, height: 1.5 },
  belgium: { x: 48, y: 29, width: 1.2, height: 1.2 },
  denmark: { x: 50, y: 25, width: 1.5, height: 1.5 },
  sweden: { x: 52, y: 20, width: 2, height: 4 },
  poland: { x: 54, y: 29, width: 2.5, height: 2 },
  
  // Americas
  usa: { x: 18, y: 35, width: 8, height: 5 },
  canada: { x: 18, y: 25, width: 10, height: 5 },
  brazil: { x: 30, y: 58, width: 6, height: 6 },
  mexico: { x: 15, y: 45, width: 3, height: 2.5 },
  argentina: { x: 28, y: 72, width: 3, height: 5 },
  chile: { x: 26, y: 70, width: 1.5, height: 6 },
  colombia: { x: 25, y: 52, width: 2.5, height: 2.5 },
  peru: { x: 24, y: 58, width: 2.5, height: 3 },
  cuba: { x: 23, y: 47, width: 2, height: 1 },
  
  // Asia
  china: { x: 75, y: 38, width: 7, height: 5 },
  japan: { x: 86, y: 36, width: 2, height: 3 },
  india: { x: 70, y: 45, width: 4, height: 4 },
  singapore: { x: 77, y: 55, width: 0.8, height: 0.8 },
  uae: { x: 64, y: 47, width: 1.5, height: 1.5 },
  
  // Oceania
  australia: { x: 83, y: 68, width: 6, height: 5 },
  
  // Africa
  'south-africa': { x: 56, y: 72, width: 3, height: 3 },
  cameroon: { x: 51, y: 54, width: 2, height: 2 },
  senegal: { x: 42, y: 50, width: 1.5, height: 1.5 },
  morocco: { x: 44, y: 42, width: 2.5, height: 2 },
  nigeria: { x: 50, y: 52, width: 2.5, height: 2 },
  'ivory-coast': { x: 45, y: 54, width: 2, height: 2 },
  drc: { x: 55, y: 58, width: 3, height: 3 },
  russia: { x: 70, y: 22, width: 15, height: 8 },
};

const PYRAMID_COLORS: Record<string, string> = {
  PROBLEM_RENT: 'fill-orange-500',
  STABILITY_REDIS: 'fill-blue-500',
  COMPETENCE_TRUST: 'fill-emerald-500',
  GROWTH_RISK: 'fill-amber-500',
  HYBRID_TRANSITION: 'fill-purple-500',
  RESOURCE_EXTRACTION: 'fill-red-500',
};

const PYRAMID_BG_COLORS: Record<string, string> = {
  PROBLEM_RENT: 'bg-orange-500/20',
  STABILITY_REDIS: 'bg-blue-500/20',
  COMPETENCE_TRUST: 'bg-emerald-500/20',
  GROWTH_RISK: 'bg-amber-500/20',
  HYBRID_TRANSITION: 'bg-purple-500/20',
  RESOURCE_EXTRACTION: 'bg-red-500/20',
};

interface WorldMapProps {
  onSelectCountry?: (countryId: string) => void;
  selectedCountryId?: string;
  highlightCountries?: string[];
  showLegend?: boolean;
  interactive?: boolean;
}

export function WorldMap({
  onSelectCountry,
  selectedCountryId,
  highlightCountries,
  showLegend = true,
  interactive = true,
}: WorldMapProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { countries } = useCountries();
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

  // Combine all countries (from data + extended)
  const allCountries = useMemo(() => {
    const fromData = countries.map(c => ({
      id: c.id,
      name: c.name,
      nameLocal: c.nameLocal,
      pyramidType: c.pyramidType,
      region: c.region,
    }));

    const fromExtended = Object.entries(EXTENDED_COUNTRY_META)
      .filter(([id]) => !fromData.find(c => c.id === id))
      .map(([id, meta]) => ({
        id,
        name: meta.name,
        nameLocal: meta.nameLocal,
        pyramidType: meta.pyramidType,
        region: meta.region,
      }));

    return [...fromData, ...fromExtended];
  }, [countries]);

  const handleCountryClick = (countryId: string) => {
    if (!interactive) return;
    if (onSelectCountry) {
      onSelectCountry(countryId);
    } else {
      navigate(`/country/${countryId}`);
    }
  };

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.25, 3));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.25, 0.5));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const getCountryData = (id: string) => {
    const fromData = countries.find(c => c.id === id);
    if (fromData) return fromData;
    
    const meta = EXTENDED_COUNTRY_META[id];
    if (meta) return { ...meta, id };
    
    return null;
  };

  return (
    <div className="relative w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl overflow-hidden">
      {/* Controls */}
      {interactive && (
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
          <Button variant="secondary" size="icon" onClick={handleZoomIn} className="backdrop-blur-sm bg-background/80">
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="secondary" size="icon" onClick={handleZoomOut} className="backdrop-blur-sm bg-background/80">
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button variant="secondary" size="icon" onClick={handleReset} className="backdrop-blur-sm bg-background/80">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Legend */}
      {showLegend && (
        <div className="absolute top-4 left-4 z-20 p-3 rounded-lg backdrop-blur-sm bg-background/80 border">
          <h4 className="text-xs font-semibold mb-2 flex items-center gap-2">
            <Globe className="w-3 h-3" />
            {t('countries.pyramidTypes', 'Types de pyramides')}
          </h4>
          <div className="space-y-1 text-xs">
            {Object.entries(PYRAMID_BG_COLORS).slice(0, 6).map(([type, color]) => (
              <div key={type} className="flex items-center gap-2">
                <div className={cn("w-3 h-3 rounded-sm", color.replace('/20', ''))} />
                <span className="text-muted-foreground">
                  {t(`pyramidTypes.${type}.short`, type.replace('_', ' '))}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Country count badge */}
      <div className="absolute bottom-4 left-4 z-20 px-3 py-1.5 rounded-full backdrop-blur-sm bg-primary/20 text-primary text-xs font-medium">
        {DB_COMPLETE_COUNTRY_IDS.length} {t('countries.analyzed', 'pays analysés')}
      </div>

      {/* SVG Map */}
      <svg
        viewBox="0 0 100 80"
        className="w-full h-[400px] md:h-[500px] cursor-grab active:cursor-grabbing touch-pan-x touch-pan-y"
        style={{
          transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
          transformOrigin: 'center center',
        }}
        onTouchStart={(e) => {
          if (e.touches.length === 1) {
            const touch = e.touches[0];
            setPan(prev => ({ ...prev, startX: touch.clientX, startY: touch.clientY }));
          }
        }}
        onTouchMove={(e) => {
          if (e.touches.length === 2 && interactive) {
            // Pinch zoom
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const dist = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
            setZoom(() => Math.min(Math.max(dist / 200, 0.5), 3));
          }
        }}
      >
        {/* Background - Ocean */}
        <rect x="0" y="0" width="100" height="80" className="fill-slate-800/50" />

        {/* Continent shapes (simplified) */}
        <g className="fill-slate-700/30 stroke-slate-600/20 stroke-[0.1]">
          {/* North America */}
          <path d="M5,15 Q12,8 28,12 L35,25 Q30,35 25,42 L18,45 Q8,40 5,30 Z" />
          {/* South America */}
          <path d="M22,48 Q28,45 32,52 L35,68 Q30,80 26,78 L24,65 Q20,55 22,48 Z" />
          {/* Europe */}
          <path d="M42,20 Q55,18 58,25 L56,38 Q50,42 42,40 L40,30 Z" />
          {/* Africa */}
          <path d="M42,42 Q55,40 60,48 L58,70 Q50,78 45,75 L42,55 Z" />
          {/* Asia */}
          <path d="M58,15 Q85,12 92,25 L90,50 Q75,55 60,50 L58,35 Z" />
          {/* Australia */}
          <path d="M78,62 Q88,58 92,65 L90,75 Q82,78 78,72 Z" />
        </g>

        {/* Grid lines */}
        <g className="stroke-slate-600/10 stroke-[0.05]">
          {[...Array(9)].map((_, i) => (
            <line key={`h-${i}`} x1="0" y1={(i + 1) * 8} x2="100" y2={(i + 1) * 8} />
          ))}
          {[...Array(9)].map((_, i) => (
            <line key={`v-${i}`} x1={(i + 1) * 10} y1="0" x2={(i + 1) * 10} y2="80" />
          ))}
        </g>

        {/* Country markers */}
        <TooltipProvider>
          {allCountries.map(country => {
            const pos = COUNTRY_POSITIONS[country.id];
            if (!pos) return null;

            const isSelected = selectedCountryId === country.id;
            const isHighlighted = highlightCountries?.includes(country.id);
            const isHovered = hoveredCountry === country.id;
            const hasDbData = hasCompleteDbData(country.id);
            const pyramidColor = PYRAMID_COLORS[country.pyramidType] || 'fill-gray-500';

            return (
              <g key={country.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <g
                      onClick={() => handleCountryClick(country.id)}
                      onMouseEnter={() => setHoveredCountry(country.id)}
                      onMouseLeave={() => setHoveredCountry(null)}
                      className={cn(
                        "cursor-pointer transition-all duration-200",
                        interactive && "hover:opacity-100"
                      )}
                      style={{
                        transform: isHovered || isSelected ? 'scale(1.3)' : 'scale(1)',
                        transformOrigin: `${pos.x}% ${pos.y}%`,
                      }}
                    >
                      {/* Country marker */}
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={hasDbData ? 1.5 : 1}
                        className={cn(
                          pyramidColor,
                          "transition-all duration-200",
                          (isSelected || isHighlighted) && "stroke-white stroke-[0.3]",
                          !hasDbData && "opacity-60"
                        )}
                      />
                      
                      {/* Pulse effect for selected */}
                      {isSelected && (
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r={2.5}
                          className="fill-none stroke-primary stroke-[0.2] animate-ping"
                        />
                      )}

                      {/* Intelligence badge */}
                      {hasDbData && (
                        <circle
                          cx={pos.x + 1}
                          cy={pos.y - 1}
                          r={0.4}
                          className="fill-primary"
                        />
                      )}
                    </g>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="p-3">
                    <div className="space-y-1">
                      <p className="font-bold">{country.nameLocal || country.name}</p>
                      <p className="text-xs text-muted-foreground">{country.region}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded-full",
                          PYRAMID_BG_COLORS[country.pyramidType]
                        )}>
                          {t(`pyramidTypes.${country.pyramidType}.short`, country.pyramidType)}
                        </span>
                        {hasDbData && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                            Intelligence
                          </span>
                        )}
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </g>
            );
          })}
        </TooltipProvider>
      </svg>

      {/* Hovered country info panel */}
      {hoveredCountry && (
        <div className="absolute bottom-4 right-4 z-20 p-4 rounded-lg backdrop-blur-sm bg-background/90 border min-w-[200px] animate-in fade-in slide-in-from-bottom-2">
          {(() => {
            const data = getCountryData(hoveredCountry);
            if (!data) return null;
            
            return (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold">{data.nameLocal || data.name}</h3>
                </div>
                <p className="text-xs text-muted-foreground">{data.region}</p>
                <div className={cn(
                  "text-xs px-2 py-1 rounded-full inline-block",
                  PYRAMID_BG_COLORS[data.pyramidType]
                )}>
                  {t(`pyramidTypes.${data.pyramidType}.short`, data.pyramidType)}
                </div>
                {hoveredCountry && hasCompleteDbData(hoveredCountry) && (
                  <div className="flex items-center gap-2 text-xs text-primary mt-2">
                    <Shield className="w-3 h-3" />
                    <span>{t('countries.intelligenceAvailable', 'Intelligence Layer disponible')}</span>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
