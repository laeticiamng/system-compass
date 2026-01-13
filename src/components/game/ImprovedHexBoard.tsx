import { useState } from 'react';
import { PyramidType, PYRAMID_TYPE_INFO } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface PlayerOnBoard {
  id: number;
  position: number;
  color: string;
  name: string;
  isMoving?: boolean;
}

interface ImprovedHexBoardProps {
  players: PlayerOnBoard[];
  currentPlayerId?: number;
  onSquareClick?: (position: number) => void;
  highlightedSquares?: number[];
}

// Types de cases avec effets
interface BoardSquare {
  id: number;
  type: 'start' | 'pyramid' | 'event' | 'chance' | 'trap' | 'bonus' | 'shop' | 'rest' | 'finish' | 'corner';
  pyramid?: PyramidType;
  side?: number;
  name?: string;
  effect?: string;
  description?: string;
}

export const IMPROVED_BOARD: BoardSquare[] = [
  // Départ
  { id: 0, type: 'start', name: 'Départ', effect: '+1 temps', description: 'Début de votre voyage' },
  
  // Côté 1 - COMPETENCE_TRUST (Vert)
  { id: 1, type: 'pyramid', pyramid: 'COMPETENCE_TRUST', side: 0, effect: '+1 Compétence', description: 'Zone méritocratique' },
  { id: 2, type: 'event', name: '❓', side: 0, effect: 'Événement aléatoire', description: 'Tirez une carte événement' },
  { id: 3, type: 'shop', name: '🏪', side: 0, effect: 'Échange ressources', description: 'Convertissez vos ressources' },
  { id: 4, type: 'pyramid', pyramid: 'COMPETENCE_TRUST', side: 0, effect: '+1 Compétence', description: 'Zone méritocratique' },
  { id: 5, type: 'bonus', name: '⭐', side: 0, effect: '+2 ressource au choix', description: 'Bonus rare!' },
  { id: 6, type: 'corner', side: 0, name: '🔄', effect: 'Changement de zone', description: 'Transition' },
  
  // Côté 2 - STABILITY_REDIS (Bleu)
  { id: 7, type: 'pyramid', pyramid: 'STABILITY_REDIS', side: 1, effect: '+1 Sécurité', description: 'Zone stable' },
  { id: 8, type: 'rest', name: '🏥', side: 1, effect: '+2 Santé', description: 'Récupérez vos forces' },
  { id: 9, type: 'pyramid', pyramid: 'STABILITY_REDIS', side: 1, effect: '+1 Sécurité', description: 'Zone stable' },
  { id: 10, type: 'event', name: '❓', side: 1, effect: 'Événement aléatoire', description: 'Tirez une carte événement' },
  { id: 11, type: 'chance', name: '🎲', side: 1, effect: 'Fortune ou malchance', description: 'Lancez le dé du destin' },
  { id: 12, type: 'corner', side: 1, name: '🔄', effect: 'Changement de zone', description: 'Transition' },
  
  // Côté 3 - GROWTH_RISK (Jaune)
  { id: 13, type: 'pyramid', pyramid: 'GROWTH_RISK', side: 2, effect: '+1 Croissance', description: 'Zone opportuniste' },
  { id: 14, type: 'trap', name: '⚠️', side: 2, effect: 'Risque obligatoire', description: 'Tentez votre chance' },
  { id: 15, type: 'bonus', name: '💎', side: 2, effect: '+3 Argent', description: 'Jackpot!' },
  { id: 16, type: 'pyramid', pyramid: 'GROWTH_RISK', side: 2, effect: '+1 Croissance', description: 'Zone opportuniste' },
  { id: 17, type: 'shop', name: '🏪', side: 2, effect: 'Investissement', description: 'Doublez ou perdez' },
  { id: 18, type: 'corner', side: 2, name: '🔄', effect: 'Changement de zone', description: 'Transition' },
  
  // Côté 4 - PROBLEM_RENT (Rouge)
  { id: 19, type: 'pyramid', pyramid: 'PROBLEM_RENT', side: 3, effect: '+1 Réseau informel', description: 'Zone clientéliste' },
  { id: 20, type: 'event', name: '🎭', side: 3, effect: 'Choix moral', description: 'Décision éthique' },
  { id: 21, type: 'trap', name: '🕵️', side: 3, effect: 'Corruption possible', description: 'Risque de capture' },
  { id: 22, type: 'pyramid', pyramid: 'PROBLEM_RENT', side: 3, effect: '+1 Réseau informel', description: 'Zone clientéliste' },
  { id: 23, type: 'chance', name: '🎲', side: 3, effect: 'Patronage', description: 'Trouve un protecteur?' },
  { id: 24, type: 'corner', side: 3, name: '🔄', effect: 'Changement de zone', description: 'Transition' },
  
  // Côté 5 - HYBRID_TRANSITION (Violet)
  { id: 25, type: 'pyramid', pyramid: 'HYBRID_TRANSITION', side: 4, effect: '+1 Adaptabilité', description: 'Zone de transition' },
  { id: 26, type: 'event', name: '🔀', side: 4, effect: 'Double système', description: 'Formel ou informel?' },
  { id: 27, type: 'rest', name: '☕', side: 4, effect: '+1 Temps', description: 'Pause stratégique' },
  { id: 28, type: 'pyramid', pyramid: 'HYBRID_TRANSITION', side: 4, effect: '+1 Adaptabilité', description: 'Zone de transition' },
  { id: 29, type: 'bonus', name: '🌟', side: 4, effect: 'Compétence transférable', description: '+2 Compétences' },
  { id: 30, type: 'corner', side: 4, name: '🔄', effect: 'Changement de zone', description: 'Transition' },
  
  // Côté 6 - RESOURCE_EXTRACTION (Orange)
  { id: 31, type: 'pyramid', pyramid: 'RESOURCE_EXTRACTION', side: 5, effect: '+1 Extraction', description: 'Zone de ressources' },
  { id: 32, type: 'chance', name: '⛏️', side: 5, effect: 'Boom ou bust', description: 'Ressource volatile' },
  { id: 33, type: 'trap', name: '🌪️', side: 5, effect: 'Instabilité', description: 'Risque politique' },
  { id: 34, type: 'pyramid', pyramid: 'RESOURCE_EXTRACTION', side: 5, effect: '+1 Extraction', description: 'Zone de ressources' },
  { id: 35, type: 'bonus', name: '🛢️', side: 5, effect: '+4 Argent', description: 'Gisement découvert!' },
  { id: 36, type: 'corner', side: 5, name: '🔄', effect: 'Changement de zone', description: 'Transition' },
  
  // Ligne finale
  { id: 37, type: 'event', name: '🎯', effect: 'Épreuve finale', description: 'Test de compétences' },
  { id: 38, type: 'trap', name: '⚡', effect: 'Dernier obstacle', description: 'Dernière épreuve' },
  { id: 39, type: 'bonus', name: '🎁', effect: 'Récompense finale', description: 'Cadeau du destin' },
  { id: 40, type: 'rest', name: '🏖️', effect: 'Dernière pause', description: 'Repos mérité' },
  { id: 41, type: 'finish', name: '🏆', effect: 'Victoire!', description: 'Vous avez terminé!' },
];

const PYRAMID_STYLES: Record<PyramidType, { bg: string; border: string; glow: string }> = {
  COMPETENCE_TRUST: { 
    bg: 'bg-gradient-to-br from-emerald-600/30 to-green-500/20', 
    border: 'border-emerald-500', 
    glow: 'shadow-emerald-500/30' 
  },
  STABILITY_REDIS: { 
    bg: 'bg-gradient-to-br from-blue-600/30 to-cyan-500/20', 
    border: 'border-blue-500', 
    glow: 'shadow-blue-500/30' 
  },
  GROWTH_RISK: { 
    bg: 'bg-gradient-to-br from-yellow-600/30 to-amber-500/20', 
    border: 'border-yellow-500', 
    glow: 'shadow-yellow-500/30' 
  },
  PROBLEM_RENT: { 
    bg: 'bg-gradient-to-br from-red-600/30 to-rose-500/20', 
    border: 'border-red-500', 
    glow: 'shadow-red-500/30' 
  },
  HYBRID_TRANSITION: { 
    bg: 'bg-gradient-to-br from-purple-600/30 to-violet-500/20', 
    border: 'border-purple-500', 
    glow: 'shadow-purple-500/30' 
  },
  RESOURCE_EXTRACTION: { 
    bg: 'bg-gradient-to-br from-orange-600/30 to-amber-500/20', 
    border: 'border-orange-500', 
    glow: 'shadow-orange-500/30' 
  },
};

const TYPE_STYLES: Record<BoardSquare['type'], { bg: string; border: string }> = {
  start: { bg: 'bg-gradient-to-br from-green-500/40 to-emerald-600/30', border: 'border-green-400' },
  finish: { bg: 'bg-gradient-to-br from-amber-500/40 to-yellow-600/30', border: 'border-amber-400' },
  event: { bg: 'bg-gradient-to-br from-indigo-500/30 to-blue-600/20', border: 'border-indigo-500' },
  chance: { bg: 'bg-gradient-to-br from-cyan-500/30 to-teal-600/20', border: 'border-cyan-500' },
  trap: { bg: 'bg-gradient-to-br from-rose-500/30 to-red-600/20', border: 'border-rose-500' },
  bonus: { bg: 'bg-gradient-to-br from-amber-500/30 to-yellow-600/20', border: 'border-amber-500' },
  shop: { bg: 'bg-gradient-to-br from-violet-500/30 to-purple-600/20', border: 'border-violet-500' },
  rest: { bg: 'bg-gradient-to-br from-sky-500/30 to-blue-600/20', border: 'border-sky-500' },
  corner: { bg: 'bg-gradient-to-br from-slate-500/30 to-gray-600/20', border: 'border-slate-500' },
  pyramid: { bg: '', border: '' },
};

export default function ImprovedHexBoard({ 
  players, 
  currentPlayerId, 
  onSquareClick,
  highlightedSquares = []
}: ImprovedHexBoardProps) {
  const { t } = useTranslation();
  const [hoveredSquare, setHoveredSquare] = useState<number | null>(null);

  const getSquareStyle = (square: BoardSquare) => {
    const isHighlighted = highlightedSquares.includes(square.id);
    const hasPlayer = players.some(p => p.position === square.id);
    const hasCurrentPlayer = players.some(p => p.position === square.id && p.id === currentPlayerId);
    
    let baseStyle = "relative w-14 h-14 md:w-16 md:h-16 rounded-xl border-2 flex flex-col items-center justify-center text-xs transition-all duration-300 cursor-pointer";
    
    if (square.type === 'pyramid' && square.pyramid) {
      const style = PYRAMID_STYLES[square.pyramid];
      baseStyle = cn(baseStyle, style.bg, style.border, "shadow-lg", style.glow);
    } else {
      const style = TYPE_STYLES[square.type];
      baseStyle = cn(baseStyle, style.bg, style.border);
    }
    
    if (isHighlighted) {
      baseStyle = cn(baseStyle, "ring-2 ring-primary ring-offset-2 ring-offset-background animate-pulse");
    }
    
    if (hasCurrentPlayer) {
      baseStyle = cn(baseStyle, "ring-4 ring-white/70 scale-110 z-20");
    } else if (hasPlayer) {
      baseStyle = cn(baseStyle, "ring-2 ring-white/30");
    }
    
    return baseStyle;
  };

  const renderSquare = (square: BoardSquare) => {
    const playersOnSquare = players.filter(p => p.position === square.id);
    const isHovered = hoveredSquare === square.id;

    return (
      <TooltipProvider key={square.id}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={getSquareStyle(square)}
              onClick={() => onSquareClick?.(square.id)}
              onMouseEnter={() => setHoveredSquare(square.id)}
              onMouseLeave={() => setHoveredSquare(null)}
            >
              {/* Numéro de case */}
              <span className="absolute top-0.5 left-1 text-[8px] opacity-40 font-mono">
                {square.id}
              </span>
              
              {/* Contenu principal */}
              {square.type === 'pyramid' && square.pyramid ? (
                <div className="text-center">
                <span className="text-lg">
                  🏛️
                </span>
                  <span className="block text-[8px] font-bold opacity-70">
                    {PYRAMID_TYPE_INFO[square.pyramid].label.split(' ')[0].slice(0, 5)}
                  </span>
                </div>
              ) : (
                <span className={cn(
                  "text-xl transition-transform",
                  isHovered && "scale-125"
                )}>
                  {square.type === 'start' && '🏁'}
                  {square.type === 'finish' && '🏆'}
                  {square.type === 'event' && (square.name || '❓')}
                  {square.type === 'chance' && (square.name || '🎲')}
                  {square.type === 'trap' && (square.name || '⚠️')}
                  {square.type === 'bonus' && (square.name || '⭐')}
                  {square.type === 'shop' && '🏪'}
                  {square.type === 'rest' && (square.name || '🏥')}
                  {square.type === 'corner' && '🔄'}
                </span>
              )}
              
              {/* Joueurs sur la case */}
              {playersOnSquare.length > 0 && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-0.5">
                  {playersOnSquare.map(player => (
                    <div
                      key={player.id}
                      className={cn(
                        "w-4 h-4 rounded-full shadow-lg border-2 border-white/50 flex items-center justify-center text-[8px] font-bold text-white",
                        player.color,
                        player.isMoving && "animate-bounce"
                      )}
                      title={player.name}
                    >
                      {player.id + 1}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Effet brillant pour bonus */}
              {square.type === 'bonus' && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-transparent via-white/10 to-transparent animate-shimmer" />
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-1">
              <p className="font-semibold">{square.name || square.type}</p>
              <p className="text-xs text-muted-foreground">{square.description}</p>
              {square.effect && (
                <p className="text-xs text-primary font-medium">{square.effect}</p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  // Organisation du plateau
  const sides = [];
  for (let i = 0; i < 6; i++) {
    const startIdx = 1 + i * 6;
    sides.push(IMPROVED_BOARD.slice(startIdx, startIdx + 6));
  }
  const finalStretch = IMPROVED_BOARD.slice(37, 42);

  return (
    <div className="glass-card rounded-2xl p-4 md:p-6 overflow-x-auto bg-gradient-to-br from-slate-900/50 to-slate-800/30">
      <div className="min-w-[600px] space-y-3">
        {/* Rangée 1 */}
        <div className="flex gap-2 justify-center">
          {sides[0].map(renderSquare)}
        </div>
        
        {/* Rangée 2 */}
        <div className="flex gap-2 justify-center">
          {sides[1].map(renderSquare)}
          <div className="w-6" />
          {sides[2].map(renderSquare)}
        </div>
        
        {/* Centre avec départ */}
        <div className="flex gap-2 items-center justify-center">
          {sides[5].slice(0, 3).map(renderSquare)}
          <div className="mx-4 transform scale-125">
            {renderSquare(IMPROVED_BOARD[0])}
          </div>
          {sides[3].slice(0, 3).map(renderSquare)}
        </div>
        
        {/* Rangée 4 */}
        <div className="flex gap-2 justify-center">
          {sides[5].slice(3).map(renderSquare)}
          <div className="w-6" />
          {sides[3].slice(3).map(renderSquare)}
        </div>
        
        {/* Rangée 5 */}
        <div className="flex gap-2 justify-center">
          {sides[4].map(renderSquare)}
        </div>
        
        {/* Ligne finale */}
        <div className="flex gap-2 justify-center mt-6 pt-4 border-t border-border/30">
          <div className="flex items-center gap-1 mr-4">
            <span className="text-lg">🎯</span>
            <span className="text-sm font-medium text-muted-foreground">Ligne d'arrivée</span>
          </div>
          {finalStretch.map(renderSquare)}
        </div>
      </div>
      
      {/* Légende compacte */}
      <div className="mt-6 flex flex-wrap gap-3 justify-center text-xs border-t border-border/30 pt-4">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-emerald-500/30 border border-emerald-500" />
          <span>Compétence</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-blue-500/30 border border-blue-500" />
          <span>Stabilité</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-yellow-500/30 border border-yellow-500" />
          <span>Croissance</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-red-500/30 border border-red-500" />
          <span>Clientélisme</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-purple-500/30 border border-purple-500" />
          <span>Hybride</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-orange-500/30 border border-orange-500" />
          <span>Extraction</span>
        </div>
      </div>
    </div>
  );
}