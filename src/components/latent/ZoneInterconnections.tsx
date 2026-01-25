import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  Shield,
  Leaf,
  AlertTriangle,
  Link2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LatentZone, ZoneStatus, TensionType } from '@/hooks/useLatentZones';

interface ZoneInterconnectionsProps {
  zones: LatentZone[];
  onSelectZone?: (zone: LatentZone) => void;
}

const STATUS_CONFIG: Record<ZoneStatus, { color: string; bgColor: string }> = {
  dormant: { color: '#64748b', bgColor: 'bg-slate-100' },
  emergent: { color: '#f59e0b', bgColor: 'bg-amber-100' },
  fragile: { color: '#3b82f6', bgColor: 'bg-blue-100' },
  blocked: { color: '#ef4444', bgColor: 'bg-red-100' }
};

const TENSION_CONFIG: Record<TensionType, { color: string; icon: typeof Sparkles }> = {
  nourishing: { color: '#16a34a', icon: Sparkles },
  blocking: { color: '#dc2626', icon: Shield },
  fragility: { color: '#d97706', icon: Leaf },
  premature_crushing: { color: '#9333ea', icon: AlertTriangle }
};

export function ZoneInterconnections({ zones, onSelectZone }: ZoneInterconnectionsProps) {
  const { t } = useTranslation();

  // Calculate connections based on shared tension types or keywords
  const connections = useMemo(() => {
    const links: Array<{ source: string; target: string; strength: number; sharedTypes: TensionType[] }> = [];
    
    for (let i = 0; i < zones.length; i++) {
      for (let j = i + 1; j < zones.length; j++) {
        const zone1 = zones[i];
        const zone2 = zones[j];
        
        const types1 = new Set((zone1.tensions || []).map(t => t.tension_type));
        const types2 = new Set((zone2.tensions || []).map(t => t.tension_type));
        
        const sharedTypes = [...types1].filter(t => types2.has(t)) as TensionType[];
        
        if (sharedTypes.length > 0) {
          links.push({
            source: zone1.id,
            target: zone2.id,
            strength: sharedTypes.length,
            sharedTypes
          });
        }
      }
    }
    
    return links;
  }, [zones]);

  // Calculate positions for zones in a circular layout
  const zonePositions = useMemo(() => {
    const centerX = 200;
    const centerY = 200;
    const radius = 150;
    
    return zones.map((zone, idx) => {
      const angle = (2 * Math.PI * idx) / zones.length - Math.PI / 2;
      return {
        zone,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
    });
  }, [zones]);

  const getPositionById = (id: string) => {
    return zonePositions.find(p => p.zone.id === id);
  };

  if (zones.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          {t('latent.interconnections.empty', 'Aucune zone à visualiser')}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Link2 className="w-5 h-5" />
          {t('latent.interconnections.title', 'Interconnexions')}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {t('latent.interconnections.subtitle', 'Liens entre zones basés sur les tensions partagées')}
        </p>
      </CardHeader>
      <CardContent>
        <div className="relative w-full aspect-square max-w-[400px] mx-auto">
          <svg viewBox="0 0 400 400" className="w-full h-full">
            {/* Background circle */}
            <circle 
              cx="200" 
              cy="200" 
              r="180" 
              fill="none" 
              stroke="currentColor" 
              strokeOpacity="0.1" 
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            
            {/* Connection lines */}
            {connections.map((connection, idx) => {
              const source = getPositionById(connection.source);
              const target = getPositionById(connection.target);
              
              if (!source || !target) return null;
              
              const mainColor = TENSION_CONFIG[connection.sharedTypes[0]]?.color || '#888';
              
              return (
                <g key={idx}>
                  <line
                    x1={source.x}
                    y1={source.y}
                    x2={target.x}
                    y2={target.y}
                    stroke={mainColor}
                    strokeWidth={connection.strength * 2}
                    strokeOpacity="0.4"
                    strokeLinecap="round"
                  />
                  {/* Animated pulse */}
                  <circle r="4" fill={mainColor}>
                    <animateMotion
                      dur={`${4 - connection.strength}s`}
                      repeatCount="indefinite"
                      path={`M${source.x},${source.y} L${target.x},${target.y}`}
                    />
                    <animate
                      attributeName="opacity"
                      values="1;0.3;1"
                      dur={`${4 - connection.strength}s`}
                      repeatCount="indefinite"
                    />
                  </circle>
                </g>
              );
            })}
            
            {/* Zone nodes */}
            {zonePositions.map(({ zone, x, y }) => {
              const config = STATUS_CONFIG[zone.status];
              const tensionCount = (zone.tensions || []).length;
              const nodeSize = 20 + tensionCount * 4;
              
              return (
                <g 
                  key={zone.id}
                  className="cursor-pointer transition-transform hover:scale-110"
                  onClick={() => onSelectZone?.(zone)}
                >
                  {/* Outer glow based on tension count */}
                  <circle
                    cx={x}
                    cy={y}
                    r={nodeSize + 8}
                    fill={config.color}
                    fillOpacity="0.1"
                  />
                  
                  {/* Main node */}
                  <circle
                    cx={x}
                    cy={y}
                    r={nodeSize}
                    fill={config.color}
                    fillOpacity="0.8"
                    stroke={config.color}
                    strokeWidth="2"
                  />
                  
                  {/* Tension indicators around node */}
                  {(zone.tensions || []).slice(0, 4).map((tension, idx) => {
                    const tensionAngle = (2 * Math.PI * idx) / 4;
                    const indicatorX = x + (nodeSize + 6) * Math.cos(tensionAngle);
                    const indicatorY = y + (nodeSize + 6) * Math.sin(tensionAngle);
                    const tensionColor = TENSION_CONFIG[tension.tension_type]?.color || '#888';
                    
                    return (
                      <circle
                        key={tension.id}
                        cx={indicatorX}
                        cy={indicatorY}
                        r="4"
                        fill={tensionColor}
                      />
                    );
                  })}
                  
                  {/* Label */}
                  <text
                    x={x}
                    y={y + nodeSize + 20}
                    textAnchor="middle"
                    className="text-xs fill-current"
                    style={{ fontSize: '10px' }}
                  >
                    {zone.title.length > 15 ? zone.title.slice(0, 15) + '...' : zone.title}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium mb-2">{t('latent.status.title', 'Statuts')}</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                <Badge key={status} variant="outline" className="text-xs gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: config.color }} />
                  {t(`latent.status.${status}`)}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium mb-2">{t('latent.tensions.title', 'Tensions')}</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(TENSION_CONFIG).map(([type, config]) => {
                const Icon = config.icon;
                return (
                  <Badge key={type} variant="outline" className="text-xs gap-1">
                    <Icon className="w-3 h-3" style={{ color: config.color }} />
                    {t(`latent.tension.${type === 'premature_crushing' ? 'prematureCrushing' : type}`)}
                  </Badge>
                );
              })}
            </div>
          </div>
        </div>

        {/* Connections summary */}
        {connections.length > 0 && (
          <div className="mt-4 p-3 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground">
              {t('latent.interconnections.found', '{{count}} connexions identifiées', { count: connections.length })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
