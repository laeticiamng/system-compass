import { PyramidType, PYRAMID_TYPE_INFO } from '@/lib/types';
import { cn } from '@/lib/utils';

interface PlayerOnBoard {
  id: number;
  position: number;
  color: string;
  isMoving?: boolean;
}

interface HexagonalBoardProps {
  players: PlayerOnBoard[];
  currentPlayerId?: number;
  onSquareClick?: (position: number) => void;
}

// Hexagonal board with 6 sides - one for each pyramid type
// Total 42 squares: 6 pyramids × 6 squares + center + corners
export const HEXAGONAL_BOARD: {
  id: number;
  type: 'start' | 'pyramid' | 'question' | 'chance' | 'trap' | 'bonus' | 'finish' | 'corner';
  pyramid?: PyramidType;
  side?: number; // 0-5 for each pyramid side
  name?: string;
  questionIndex?: number;
}[] = [
  // Center start
  { id: 0, type: 'start', name: 'START' },
  
  // Side 0 - COMPETENCE_TRUST (Green)
  { id: 1, type: 'pyramid', pyramid: 'COMPETENCE_TRUST', side: 0 },
  { id: 2, type: 'question', questionIndex: 0, side: 0 },
  { id: 3, type: 'pyramid', pyramid: 'COMPETENCE_TRUST', side: 0 },
  { id: 4, type: 'chance', name: '🎲', side: 0 },
  { id: 5, type: 'pyramid', pyramid: 'COMPETENCE_TRUST', side: 0 },
  { id: 6, type: 'corner', side: 0, name: '⬡' },
  
  // Side 1 - STABILITY_REDIS (Blue)
  { id: 7, type: 'pyramid', pyramid: 'STABILITY_REDIS', side: 1 },
  { id: 8, type: 'bonus', name: '⭐', side: 1 },
  { id: 9, type: 'pyramid', pyramid: 'STABILITY_REDIS', side: 1 },
  { id: 10, type: 'question', questionIndex: 1, side: 1 },
  { id: 11, type: 'pyramid', pyramid: 'STABILITY_REDIS', side: 1 },
  { id: 12, type: 'corner', side: 1, name: '⬡' },
  
  // Side 2 - GROWTH_RISK (Yellow)
  { id: 13, type: 'pyramid', pyramid: 'GROWTH_RISK', side: 2 },
  { id: 14, type: 'trap', name: '⚠️', side: 2 },
  { id: 15, type: 'pyramid', pyramid: 'GROWTH_RISK', side: 2 },
  { id: 16, type: 'chance', name: '🎲', side: 2 },
  { id: 17, type: 'pyramid', pyramid: 'GROWTH_RISK', side: 2 },
  { id: 18, type: 'corner', side: 2, name: '⬡' },
  
  // Side 3 - PROBLEM_RENT (Red)
  { id: 19, type: 'pyramid', pyramid: 'PROBLEM_RENT', side: 3 },
  { id: 20, type: 'question', questionIndex: 2, side: 3 },
  { id: 21, type: 'pyramid', pyramid: 'PROBLEM_RENT', side: 3 },
  { id: 22, type: 'bonus', name: '⭐', side: 3 },
  { id: 23, type: 'pyramid', pyramid: 'PROBLEM_RENT', side: 3 },
  { id: 24, type: 'corner', side: 3, name: '⬡' },
  
  // Side 4 - HYBRID_TRANSITION (Purple)
  { id: 25, type: 'pyramid', pyramid: 'HYBRID_TRANSITION', side: 4 },
  { id: 26, type: 'trap', name: '⚠️', side: 4 },
  { id: 27, type: 'pyramid', pyramid: 'HYBRID_TRANSITION', side: 4 },
  { id: 28, type: 'question', questionIndex: 3, side: 4 },
  { id: 29, type: 'pyramid', pyramid: 'HYBRID_TRANSITION', side: 4 },
  { id: 30, type: 'corner', side: 4, name: '⬡' },
  
  // Side 5 - RESOURCE_EXTRACTION (Orange)
  { id: 31, type: 'pyramid', pyramid: 'RESOURCE_EXTRACTION', side: 5 },
  { id: 32, type: 'chance', name: '🎲', side: 5 },
  { id: 33, type: 'pyramid', pyramid: 'RESOURCE_EXTRACTION', side: 5 },
  { id: 34, type: 'bonus', name: '⭐', side: 5 },
  { id: 35, type: 'pyramid', pyramid: 'RESOURCE_EXTRACTION', side: 5 },
  { id: 36, type: 'corner', side: 5, name: '⬡' },
  
  // Final stretch to finish
  { id: 37, type: 'question', questionIndex: 4 },
  { id: 38, type: 'trap', name: '⚠️' },
  { id: 39, type: 'bonus', name: '⭐' },
  { id: 40, type: 'question', questionIndex: 5 },
  { id: 41, type: 'finish', name: 'FIN' },
];

const PYRAMID_COLORS: Record<PyramidType, { bg: string; border: string; text: string }> = {
  COMPETENCE_TRUST: { bg: 'bg-emerald-500/20', border: 'border-emerald-500', text: 'text-emerald-400' },
  STABILITY_REDIS: { bg: 'bg-blue-500/20', border: 'border-blue-500', text: 'text-blue-400' },
  GROWTH_RISK: { bg: 'bg-yellow-500/20', border: 'border-yellow-500', text: 'text-yellow-400' },
  PROBLEM_RENT: { bg: 'bg-red-500/20', border: 'border-red-500', text: 'text-red-400' },
  HYBRID_TRANSITION: { bg: 'bg-purple-500/20', border: 'border-purple-500', text: 'text-purple-400' },
  RESOURCE_EXTRACTION: { bg: 'bg-orange-500/20', border: 'border-orange-500', text: 'text-orange-400' },
};

// _SIDE_ROTATION used for future hexagonal layout enhancements

export default function HexagonalBoard({ players, currentPlayerId, onSquareClick }: HexagonalBoardProps) {

  const getSquareStyle = (square: typeof HEXAGONAL_BOARD[0]) => {
    let baseClass = "w-12 h-12 md:w-14 md:h-14 rounded-lg border-2 flex flex-col items-center justify-center text-xs relative transition-all duration-300 cursor-pointer hover:scale-105";
    
    if (square.type === 'start') {
      return cn(baseClass, "bg-gradient-to-br from-green-500/30 to-emerald-500/30 border-green-400 ring-2 ring-green-400/50");
    }
    if (square.type === 'finish') {
      return cn(baseClass, "bg-gradient-to-br from-yellow-500/30 to-amber-500/30 border-yellow-400 ring-2 ring-yellow-400/50");
    }
    if (square.type === 'corner') {
      return cn(baseClass, "bg-gradient-to-br from-slate-600/30 to-slate-700/30 border-slate-500");
    }
    if (square.type === 'pyramid' && square.pyramid) {
      const colors = PYRAMID_COLORS[square.pyramid];
      return cn(baseClass, colors.bg, colors.border, colors.text);
    }
    if (square.type === 'question') {
      return cn(baseClass, "bg-indigo-500/20 border-indigo-500");
    }
    if (square.type === 'chance') {
      return cn(baseClass, "bg-cyan-500/20 border-cyan-500");
    }
    if (square.type === 'trap') {
      return cn(baseClass, "bg-rose-500/20 border-rose-500");
    }
    if (square.type === 'bonus') {
      return cn(baseClass, "bg-amber-500/20 border-amber-500");
    }
    return baseClass;
  };

  const renderSquare = (square: typeof HEXAGONAL_BOARD[0]) => {
    const playersOnSquare = players.filter(p => p.position === square.id);
    const hasCurrentPlayer = playersOnSquare.some(p => p.id === currentPlayerId);
    
    return (
      <div
        key={square.id}
        className={cn(
          getSquareStyle(square),
          hasCurrentPlayer && "ring-2 ring-white/50 scale-110 z-10"
        )}
        onClick={() => onSquareClick?.(square.id)}
      >
        <span className="text-[10px] opacity-50 absolute top-0.5 left-1">{square.id}</span>
        
        {square.type === 'pyramid' && square.pyramid && (
          <span className="text-[10px] font-bold text-center leading-tight">
            {PYRAMID_TYPE_INFO[square.pyramid].label.split(' ')[0].slice(0, 4)}
          </span>
        )}
        
        {square.type === 'start' && <span className="text-lg">🏁</span>}
        {square.type === 'finish' && <span className="text-lg">🏆</span>}
        {square.type === 'question' && <span className="text-lg">❓</span>}
        {square.type === 'chance' && <span className="text-lg">🎲</span>}
        {square.type === 'trap' && <span className="text-lg">⚠️</span>}
        {square.type === 'bonus' && <span className="text-lg">⭐</span>}
        {square.type === 'corner' && <span className="text-lg">⬡</span>}
        
        {/* Player tokens */}
        {playersOnSquare.length > 0 && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
            {playersOnSquare.map(player => (
              <div
                key={player.id}
                className={cn(
                  "w-3 h-3 rounded-full shadow-lg border border-white/50",
                  player.color,
                  player.isMoving && "animate-bounce"
                )}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  // Render hexagonal layout
  const renderHexagonalLayout = () => {
    // Center row (start)
    const centerRow = [HEXAGONAL_BOARD[0]];
    
    // 6 sides with their squares
    const sides = [];
    for (let i = 0; i < 6; i++) {
      const startIdx = 1 + i * 6;
      sides.push(HEXAGONAL_BOARD.slice(startIdx, startIdx + 6));
    }
    
    // Final stretch
    const finalStretch = HEXAGONAL_BOARD.slice(37, 42);

    return (
      <div className="flex flex-col items-center gap-4">
        {/* Top sides (0, 1, 2) */}
        <div className="flex gap-2 flex-wrap justify-center">
          {sides[0].map(renderSquare)}
        </div>
        <div className="flex gap-2 flex-wrap justify-center">
          {sides[1].map(renderSquare)}
          <div className="w-4" />
          {sides[2].map(renderSquare)}
        </div>
        
        {/* Center with start */}
        <div className="flex gap-2 items-center justify-center">
          {sides[5].slice(0, 3).map(renderSquare)}
          <div className="mx-4">{renderSquare(centerRow[0])}</div>
          {sides[3].slice(0, 3).map(renderSquare)}
        </div>
        
        {/* Bottom sides (5, 4, 3) */}
        <div className="flex gap-2 flex-wrap justify-center">
          {sides[5].slice(3).map(renderSquare)}
          <div className="w-4" />
          {sides[3].slice(3).map(renderSquare)}
        </div>
        <div className="flex gap-2 flex-wrap justify-center">
          {sides[4].map(renderSquare)}
        </div>
        
        {/* Final stretch */}
        <div className="flex gap-2 flex-wrap justify-center mt-4 pt-4 border-t border-border/50">
          {finalStretch.map(renderSquare)}
        </div>
      </div>
    );
  };

  return (
    <div className="glass-card rounded-2xl p-6 overflow-x-auto">
      <div className="min-w-[600px]">
        {renderHexagonalLayout()}
      </div>
      
      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 justify-center text-xs">
        {Object.entries(PYRAMID_COLORS).map(([type, colors]) => (
          <div key={type} className="flex items-center gap-2">
            <div className={cn("w-4 h-4 rounded", colors.bg, colors.border, "border")} />
            <span className="text-muted-foreground">{PYRAMID_TYPE_INFO[type as PyramidType].label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
