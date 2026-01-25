import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Move,
  CheckCircle2,
  Clock,
  XCircle
} from 'lucide-react';
import { DecisionNodeData } from './DecisionNode';

interface GraphNode {
  id: string;
  x: number;
  y: number;
  data: DecisionNodeData;
  children: string[];
}

interface InteractiveDecisionGraphProps {
  decisions: DecisionNodeData[];
  onSelectDecision?: (decision: DecisionNodeData) => void;
  selectedDecisionId?: string;
}

const NODE_WIDTH = 200;
const NODE_HEIGHT = 80;
const HORIZONTAL_SPACING = 280;
const VERTICAL_SPACING = 120;

export function InteractiveDecisionGraph({
  decisions,
  onSelectDecision,
  selectedDecisionId
}: InteractiveDecisionGraphProps) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);

  // Build graph nodes from decision tree
  useEffect(() => {
    const graphNodes: GraphNode[] = [];
    
    const processNode = (
      decision: DecisionNodeData, 
      depth: number, 
      index: number,
      parentY: number
    ): void => {
      const x = depth * HORIZONTAL_SPACING;
      const y = parentY + index * VERTICAL_SPACING;
      
      graphNodes.push({
        id: decision.id,
        x,
        y,
        data: decision,
        children: decision.children?.map(c => c.id) || []
      });

      decision.children?.forEach((child, idx) => {
        processNode(child, depth + 1, idx, y);
      });
    };

    decisions.forEach((decision, idx) => {
      processNode(decision, 0, idx, idx * VERTICAL_SPACING * 2);
    });

    setNodes(graphNodes);
  }, [decisions]);

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === containerRef.current || (e.target as HTMLElement).classList.contains('graph-bg')) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && !draggedNode) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    } else if (draggedNode) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const newX = (e.clientX - rect.left - pan.x) / zoom;
        const newY = (e.clientY - rect.top - pan.y) / zoom;
        
        setNodes(prev => prev.map(node => 
          node.id === draggedNode 
            ? { ...node, x: newX - NODE_WIDTH / 2, y: newY - NODE_HEIGHT / 2 }
            : node
        ));
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedNode(null);
  };

  // Zoom handlers
  const handleZoomIn = () => setZoom(z => Math.min(z + 0.2, 2));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.2, 0.4));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 50, y: 50 });
  };

  // Wheel zoom
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(z => Math.min(Math.max(z + delta, 0.4), 2));
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel]);

  // Node drag start
  const handleNodeDragStart = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setDraggedNode(nodeId);
  };

  // Get status styling
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'validated':
        return { bg: 'bg-emerald-500/20', border: 'border-emerald-500', icon: CheckCircle2, color: 'text-emerald-600' };
      case 'abandoned':
        return { bg: 'bg-rose-500/20', border: 'border-rose-500', icon: XCircle, color: 'text-rose-600' };
      default:
        return { bg: 'bg-amber-500/20', border: 'border-amber-500', icon: Clock, color: 'text-amber-600' };
    }
  };

  // Find node by id
  const findNodeById = (id: string) => nodes.find(n => n.id === id);

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Move className="h-5 w-5" />
            {t('traceos.graph.title', 'Vue graphique interactive')}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono">
              {Math.round(zoom * 100)}%
            </Badge>
            <Button size="sm" variant="outline" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={handleResetView}>
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {t('traceos.graph.instructions', 'Glissez pour déplacer les nœuds, scroll pour zoomer')}
        </p>
      </CardHeader>
      <CardContent>
        <div
          ref={containerRef}
          className="relative w-full h-[500px] bg-muted/30 rounded-lg overflow-hidden cursor-grab active:cursor-grabbing graph-bg"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            backgroundImage: `
              linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
            `,
            backgroundSize: `${40 * zoom}px ${40 * zoom}px`,
            backgroundPosition: `${pan.x}px ${pan.y}px`
          }}
        >
          <svg
            className="absolute inset-0 pointer-events-none"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0'
            }}
          >
            {/* Draw edges */}
            {nodes.map(node => 
              node.children.map(childId => {
                const childNode = findNodeById(childId);
                if (!childNode) return null;
                
                const startX = node.x + NODE_WIDTH;
                const startY = node.y + NODE_HEIGHT / 2;
                const endX = childNode.x;
                const endY = childNode.y + NODE_HEIGHT / 2;
                const midX = (startX + endX) / 2;

                return (
                  <path
                    key={`${node.id}-${childId}`}
                    d={`M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`}
                    fill="none"
                    stroke="hsl(var(--border))"
                    strokeWidth={2}
                    strokeDasharray={childNode.data.status === 'abandoned' ? '5,5' : undefined}
                  />
                );
              })
            )}
          </svg>

          {/* Render nodes */}
          <div
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0'
            }}
          >
            {nodes.map(node => {
              const style = getStatusStyle(node.data.status);
              const isSelected = selectedDecisionId === node.id;
              const Icon = style.icon;

              return (
                <div
                  key={node.id}
                  className={`absolute cursor-move transition-shadow ${
                    isSelected ? 'ring-2 ring-primary ring-offset-2' : ''
                  } ${draggedNode === node.id ? 'z-50' : 'z-10'}`}
                  style={{
                    left: node.x,
                    top: node.y,
                    width: NODE_WIDTH,
                    height: NODE_HEIGHT
                  }}
                  onMouseDown={(e) => handleNodeDragStart(e, node.id)}
                  onClick={() => onSelectDecision?.(node.data)}
                >
                  <div className={`h-full rounded-lg border-2 ${style.border} ${style.bg} p-3 shadow-lg backdrop-blur-sm`}>
                    <div className="flex items-start gap-2">
                      <Icon className={`h-4 w-4 flex-shrink-0 ${style.color}`} />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-xs truncate">
                          {node.data.title}
                        </h4>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {node.data.date} • {node.data.author}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-[9px] px-1 py-0">
                            {node.data.scope}
                          </Badge>
                          {node.data.children && node.data.children.length > 0 && (
                            <Badge variant="secondary" className="text-[9px] px-1 py-0">
                              +{node.data.children.length}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty state */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              {t('traceos.graph.empty', 'Aucune décision à afficher')}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
