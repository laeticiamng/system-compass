import { useRef, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Pen, Eraser, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface SignaturePadProps {
  onSignatureChange: (signatureData: string | null) => void;
  disabled?: boolean;
}

export function SignaturePad({ onSignatureChange, disabled = false }: SignaturePadProps) {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  const getCanvas = useCallback(() => canvasRef.current, []);
  const getContext = useCallback(() => canvasRef.current?.getContext('2d'), []);

  // Initialize canvas
  useEffect(() => {
    const canvas = getCanvas();
    const ctx = getContext();
    if (!canvas || !ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    // Style
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Signature line
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, rect.height - 30);
    ctx.lineTo(rect.width - 20, rect.height - 30);
    ctx.stroke();

    // Reset for drawing
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
  }, [getCanvas, getContext]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = getCanvas();
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return;
    
    const ctx = getContext();
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || disabled) return;

    const ctx = getContext();
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    
    setIsDrawing(false);
    
    const canvas = getCanvas();
    if (canvas && hasSignature) {
      const dataUrl = canvas.toDataURL('image/png');
      onSignatureChange(dataUrl);
    }
  };

  const clearSignature = () => {
    const canvas = getCanvas();
    const ctx = getContext();
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    
    // Clear and redraw background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Redraw signature line
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, rect.height - 30);
    ctx.lineTo(rect.width - 20, rect.height - 30);
    ctx.stroke();

    // Reset for drawing
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;

    setHasSignature(false);
    onSignatureChange(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          <Pen className="w-4 h-4" />
          {t('irreversa.signature.label', 'Signature électronique')}
        </Label>
        {hasSignature && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearSignature}
            disabled={disabled}
            className="gap-1 text-xs"
          >
            <Eraser className="w-3 h-3" />
            {t('common.clear', 'Effacer')}
          </Button>
        )}
      </div>

      <div 
        className={`relative rounded-lg border-2 border-dashed transition-colors ${
          disabled 
            ? 'border-muted bg-muted/20 cursor-not-allowed' 
            : hasSignature 
              ? 'border-primary/50 bg-primary/5' 
              : 'border-muted-foreground/30 hover:border-primary/30'
        }`}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-32 rounded-lg cursor-crosshair touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        
        {!hasSignature && !disabled && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-xs text-muted-foreground">
              {t('irreversa.signature.placeholder', 'Signez ici avec la souris ou le doigt')}
            </p>
          </div>
        )}

        {hasSignature && (
          <div className="absolute top-2 right-2">
            <Check className="w-4 h-4 text-primary" />
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        {t('irreversa.signature.legal', 'Cette signature électronique a valeur d\'engagement conformément au règlement eIDAS.')}
      </p>
    </div>
  );
}
