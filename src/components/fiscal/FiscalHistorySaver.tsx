/**
 * Fiscal History Saver Component
 * Saves and displays fiscal calculation history
 */
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Save, History, Trash2, Clock, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface FiscalCalculation {
  id: string;
  originCountry: string;
  destinationCountry?: string;
  grossSalary: number;
  destinationSalary?: number;
  netDifference?: number;
  purchasingPowerDifference?: number;
  timestamp: string;
}

const STORAGE_KEY = 'fiscal_calculation_history';
const MAX_HISTORY = 20;

export function useFiscalHistory() {
  // Auth hook available for future user-specific storage
  const { t } = useTranslation();
  const [history, setHistory] = useState<FiscalCalculation[]>([]);

  // Load history on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch {
        setHistory([]);
      }
    }
  }, []);

  const saveCalculation = (calc: Omit<FiscalCalculation, 'id' | 'timestamp'>) => {
    const newCalc: FiscalCalculation = {
      ...calc,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };

    const updated = [newCalc, ...history].slice(0, MAX_HISTORY);
    setHistory(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    toast.success(t('fiscal.saved', 'Calcul sauvegardé'));
    return newCalc;
  };

  const deleteCalculation = (id: string) => {
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    toast.success(t('fiscal.deleted', 'Calcul supprimé'));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
    toast.success(t('fiscal.cleared', 'Historique effacé'));
  };

  return { history, saveCalculation, deleteCalculation, clearHistory };
}

interface FiscalHistorySaverProps {
  originCountry: string;
  destinationCountry?: string;
  grossSalary: number;
  destinationSalary?: number;
  netDifference?: number;
  purchasingPowerDifference?: number;
  onLoadCalculation?: (calc: FiscalCalculation) => void;
}

export function FiscalHistorySaver({
  originCountry,
  destinationCountry,
  grossSalary,
  destinationSalary,
  netDifference,
  purchasingPowerDifference,
  onLoadCalculation,
}: FiscalHistorySaverProps) {
  const { history, saveCalculation, deleteCalculation, clearHistory } = useFiscalHistory();
  const [showHistory, setShowHistory] = useState(false);

  const handleSave = () => {
    saveCalculation({
      originCountry,
      destinationCountry,
      grossSalary,
      destinationSalary,
      netDifference,
      purchasingPowerDifference,
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button onClick={handleSave} variant="outline" className="gap-2">
          <Save className="w-4 h-4" />
          Sauvegarder
        </Button>
        <Button 
          onClick={() => setShowHistory(!showHistory)} 
          variant="ghost" 
          className="gap-2"
        >
          <History className="w-4 h-4" />
          Historique ({history.length})
        </Button>
      </div>

      {showHistory && history.length > 0 && (
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Historique des calculs
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearHistory}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Effacer tout
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {history.map((calc) => (
                  <div
                    key={calc.id}
                    className="p-3 rounded-lg bg-secondary/50 hover:bg-secondary/70 cursor-pointer transition-colors"
                    onClick={() => onLoadCalculation?.(calc)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {calc.originCountry}
                        </Badge>
                        {calc.destinationCountry && (
                          <>
                            <span className="text-muted-foreground">→</span>
                            <Badge variant="outline">
                              {calc.destinationCountry}
                            </Badge>
                          </>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteCalculation(calc.id);
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Brut: {formatCurrency(calc.grossSalary)}
                      </span>
                      {calc.purchasingPowerDifference !== undefined && (
                        <span className={cn(
                          "flex items-center gap-1",
                          calc.purchasingPowerDifference > 0 ? "text-emerald-400" : "text-red-400"
                        )}>
                          <TrendingUp className="w-3 h-3" />
                          {calc.purchasingPowerDifference > 0 ? '+' : ''}
                          {formatCurrency(calc.purchasingPowerDifference)}
                        </span>
                      )}
                    </div>
                    
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatDate(calc.timestamp)}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {showHistory && history.length === 0 && (
        <Card className="glass-card">
          <CardContent className="p-6 text-center text-muted-foreground">
            <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Aucun calcul sauvegardé</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
