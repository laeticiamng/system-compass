// Smart tips widget for dashboard - i18n ready
import { Lightbulb, ArrowRight, X, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface Tip {
  id: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionUrl?: string;
  priority?: 'low' | 'medium' | 'high';
}

interface SmartTipsWidgetProps {
  tips?: Tip[];
  onDismiss?: (tipId: string) => void;
  onAction?: (tipId: string) => void;
  autoRotate?: boolean;
  rotateInterval?: number;
  className?: string;
}

export function SmartTipsWidget({
  tips: tipsProp,
  onDismiss: onDismissProp,
  onAction,
  autoRotate = true,
  rotateInterval = 10000,
  className
}: SmartTipsWidgetProps) {
  const { t } = useTranslation();

  const defaultTips: Tip[] = [
    {
      id: 'complete-profile',
      title: t('tips.completeProfile', 'Complétez votre profil'),
      description: t('tips.completeProfileDesc', 'Un profil complet permet des recommandations plus précises'),
      actionLabel: t('tips.completeProfileAction', 'Compléter'),
      actionUrl: '/exit-keys',
      priority: 'high'
    },
    {
      id: 'explore-countries',
      title: t('tips.exploreCountries', 'Explorez de nouveaux pays'),
      description: t('tips.exploreCountriesDesc', 'Découvrez les 38 pays analysés et leurs systèmes pyramidaux'),
      actionLabel: t('tips.exploreCountriesAction', 'Explorer'),
      actionUrl: '/countries',
      priority: 'medium'
    },
    {
      id: 'try-simulation',
      title: t('tips.trySimulation', 'Testez une simulation'),
      description: t('tips.trySimulationDesc', 'Simulez votre trajectoire avec le Life Game éducatif'),
      actionLabel: t('tips.trySimulationAction', 'Jouer'),
      actionUrl: '/life-game',
      priority: 'low'
    },
    {
      id: 'save-comparison',
      title: t('tips.saveComparison', 'Sauvegardez vos comparaisons'),
      description: t('tips.saveComparisonDesc', 'Connectez-vous pour sauvegarder vos analyses et les retrouver plus tard'),
      actionLabel: t('tips.saveComparisonAction', 'Se connecter'),
      actionUrl: '/auth',
      priority: 'medium'
    }
  ];

  const tips = tipsProp ?? defaultTips;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [isHovered, setIsHovered] = useState(false);

  const activeTips = tips.filter(tip => !dismissed.has(tip.id));
  const currentTip = activeTips[currentIndex % activeTips.length];

  useEffect(() => {
    if (!autoRotate || isHovered || activeTips.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % activeTips.length);
    }, rotateInterval);

    return () => clearInterval(timer);
  }, [autoRotate, isHovered, activeTips.length, rotateInterval]);

  const handleDismiss = (tipId: string) => {
    setDismissed(prev => new Set([...prev, tipId]));
    onDismissProp?.(tipId);
  };

  const handleAction = (tipId: string) => {
    onAction?.(tipId);
  };

  if (activeTips.length === 0) return null;

  const priorityColors = {
    high: 'border-amber-500/30 bg-amber-500/5',
    medium: 'border-primary/30 bg-primary/5',
    low: 'border-border bg-muted/30'
  };

  return (
    <Card 
      className={cn(
        'transition-all duration-300',
        priorityColors[currentTip?.priority || 'medium'],
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
            <Lightbulb className="w-5 h-5 text-primary" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-sm">{currentTip?.title}</h4>
              {currentTip?.priority === 'high' && (
                <Sparkles className="w-3 h-3 text-amber-500" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              {currentTip?.description}
            </p>
            
            <div className="flex items-center gap-2">
              {currentTip?.actionLabel && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1"
                  onClick={() => handleAction(currentTip.id)}
                  asChild={!!currentTip.actionUrl}
                >
                  {currentTip.actionUrl ? (
                    <a href={currentTip.actionUrl}>
                      {currentTip.actionLabel}
                      <ArrowRight className="w-3 h-3" />
                    </a>
                  ) : (
                    <>
                      {currentTip.actionLabel}
                      <ArrowRight className="w-3 h-3" />
                    </>
                  )}
                </Button>
              )}
              
              {/* Pagination dots */}
              {activeTips.length > 1 && (
                <div className="flex items-center gap-1 ml-auto">
                  {activeTips.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={cn(
                        'w-1.5 h-1.5 rounded-full transition-colors',
                        index === currentIndex % activeTips.length
                          ? 'bg-primary'
                          : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                      )}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 text-muted-foreground hover:text-foreground -mt-1 -mr-1"
            onClick={() => handleDismiss(currentTip?.id || '')}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
