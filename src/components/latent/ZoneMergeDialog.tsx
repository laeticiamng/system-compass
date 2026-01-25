import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  GitMerge,
  Check,
  ArrowRight,
  Sparkles,
  Shield,
  Leaf,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LatentZone, TensionType } from '@/hooks/useLatentZones';

interface ZoneMergeDialogProps {
  zones: LatentZone[];
  isOpen: boolean;
  onClose: () => void;
  onMerge: (
    sourceZoneIds: string[], 
    newTitle: string, 
    newDescription: string, 
    tensionsToKeep: string[]
  ) => Promise<boolean>;
}

const TENSION_CONFIG: Record<TensionType, { icon: typeof Sparkles; color: string }> = {
  nourishing: { icon: Sparkles, color: 'text-green-600' },
  blocking: { icon: Shield, color: 'text-red-600' },
  fragility: { icon: Leaf, color: 'text-amber-600' },
  premature_crushing: { icon: AlertTriangle, color: 'text-purple-600' }
};

export function ZoneMergeDialog({ zones, isOpen, onClose, onMerge }: ZoneMergeDialogProps) {
  const { t } = useTranslation();
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [selectedTensions, setSelectedTensions] = useState<string[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [step, setStep] = useState<'select' | 'configure' | 'tensions'>('select');

  const selectedZoneObjects = zones.filter(z => selectedZones.includes(z.id));
  
  const allTensions = selectedZoneObjects.flatMap(z => 
    (z.tensions || []).map(t => ({ ...t, zoneName: z.title }))
  );

  const handleToggleZone = (zoneId: string) => {
    setSelectedZones(prev => 
      prev.includes(zoneId) 
        ? prev.filter(id => id !== zoneId)
        : [...prev, zoneId]
    );
  };

  const handleToggleTension = (tensionId: string) => {
    setSelectedTensions(prev =>
      prev.includes(tensionId)
        ? prev.filter(id => id !== tensionId)
        : [...prev, tensionId]
    );
  };

  const handleSelectAllTensions = () => {
    if (selectedTensions.length === allTensions.length) {
      setSelectedTensions([]);
    } else {
      setSelectedTensions(allTensions.map(t => t.id));
    }
  };

  const handleNextStep = () => {
    if (step === 'select' && selectedZones.length >= 2) {
      // Pre-fill title with combined zone names
      setNewTitle(selectedZoneObjects.map(z => z.title).join(' + '));
      // Pre-fill description
      setNewDescription(
        selectedZoneObjects
          .filter(z => z.description)
          .map(z => z.description)
          .join('\n\n---\n\n')
      );
      // Pre-select all tensions
      setSelectedTensions(allTensions.map(t => t.id));
      setStep('configure');
    } else if (step === 'configure') {
      setStep('tensions');
    }
  };

  const handlePrevStep = () => {
    if (step === 'configure') {
      setStep('select');
    } else if (step === 'tensions') {
      setStep('configure');
    }
  };

  const handleMerge = async () => {
    if (!newTitle.trim()) return;

    setIsMerging(true);
    const success = await onMerge(selectedZones, newTitle.trim(), newDescription.trim(), selectedTensions);
    setIsMerging(false);

    if (success) {
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedZones([]);
    setNewTitle('');
    setNewDescription('');
    setSelectedTensions([]);
    setStep('select');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitMerge className="w-5 h-5 text-primary" />
            {t('latent.merge.title', 'Fusionner des zones')}
          </DialogTitle>
          <DialogDescription>
            {step === 'select' && t('latent.merge.stepSelect', 'Sélectionnez les zones à fusionner (minimum 2)')}
            {step === 'configure' && t('latent.merge.stepConfigure', 'Configurez la nouvelle zone fusionnée')}
            {step === 'tensions' && t('latent.merge.stepTensions', 'Choisissez les tensions à préserver')}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 py-2">
          <StepIndicator 
            step={1} 
            label={t('latent.merge.step1', 'Sélection')} 
            active={step === 'select'} 
            completed={step !== 'select'} 
          />
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
          <StepIndicator 
            step={2} 
            label={t('latent.merge.step2', 'Configuration')} 
            active={step === 'configure'} 
            completed={step === 'tensions'} 
          />
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
          <StepIndicator 
            step={3} 
            label={t('latent.merge.step3', 'Tensions')} 
            active={step === 'tensions'} 
            completed={false} 
          />
        </div>

        <ScrollArea className="flex-1 pr-4">
          {/* Step 1: Select Zones */}
          {step === 'select' && (
            <div className="space-y-3">
              {zones.map(zone => (
                <Card 
                  key={zone.id}
                  className={`cursor-pointer transition-all ${
                    selectedZones.includes(zone.id) 
                      ? 'border-primary bg-primary/5' 
                      : 'hover:border-muted-foreground/50'
                  }`}
                  onClick={() => handleToggleZone(zone.id)}
                >
                  <CardContent className="p-3 flex items-start gap-3">
                    <Checkbox 
                      checked={selectedZones.includes(zone.id)}
                      onCheckedChange={() => handleToggleZone(zone.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{zone.title}</p>
                      {zone.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {zone.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {t(`latent.status.${zone.status}`)}
                        </Badge>
                        {(zone.tensions?.length || 0) > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {zone.tensions?.length} tensions
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Step 2: Configure New Zone */}
          {step === 'configure' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="merge-title">
                  {t('latent.merge.newTitle', 'Titre de la zone fusionnée')}
                </Label>
                <Input
                  id="merge-title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={t('latent.merge.titlePlaceholder', 'Un nouveau titre ouvert...')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="merge-description">
                  {t('latent.merge.newDescription', 'Description fusionnée')}
                </Label>
                <Textarea
                  id="merge-description"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder={t('latent.merge.descriptionPlaceholder', 'Description combinée...')}
                  rows={5}
                />
                <p className="text-xs text-muted-foreground">
                  {t('latent.merge.descriptionHint', 'Les descriptions des zones sources ont été combinées')}
                </p>
              </div>

              {/* Preview of zones being merged */}
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-xs font-medium mb-2">
                  {t('latent.merge.zonesIncluded', 'Zones incluses :')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedZoneObjects.map(z => (
                    <Badge key={z.id} variant="secondary">
                      {z.title}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Select Tensions */}
          {step === 'tensions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm">
                  {t('latent.merge.tensionsCount', '{{selected}}/{{total}} tensions sélectionnées', {
                    selected: selectedTensions.length,
                    total: allTensions.length
                  })}
                </p>
                <Button variant="outline" size="sm" onClick={handleSelectAllTensions}>
                  {selectedTensions.length === allTensions.length 
                    ? t('latent.merge.deselectAll', 'Tout désélectionner')
                    : t('latent.merge.selectAll', 'Tout sélectionner')
                  }
                </Button>
              </div>

              <Separator />

              {allTensions.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  {t('latent.merge.noTensions', 'Aucune tension à préserver')}
                </p>
              ) : (
                <div className="space-y-2">
                  {allTensions.map(tension => {
                    const config = TENSION_CONFIG[tension.tension_type];
                    const Icon = config.icon;
                    
                    return (
                      <div 
                        key={tension.id}
                        className={`flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-all ${
                          selectedTensions.includes(tension.id)
                            ? 'bg-primary/5 border border-primary/20'
                            : 'bg-muted/30 hover:bg-muted/50'
                        }`}
                        onClick={() => handleToggleTension(tension.id)}
                      >
                        <Checkbox 
                          checked={selectedTensions.includes(tension.id)}
                          onCheckedChange={() => handleToggleTension(tension.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Icon className={`w-3 h-3 ${config.color}`} />
                            <span className="text-xs font-medium">
                              {t(`latent.tension.${tension.tension_type === 'premature_crushing' ? 'prematureCrushing' : tension.tension_type}`)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ({tension.zoneName})
                            </span>
                          </div>
                          <p className="text-sm mt-1">{tension.content}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="flex-shrink-0 gap-2">
          {step !== 'select' && (
            <Button variant="outline" onClick={handlePrevStep}>
              {t('common.back')}
            </Button>
          )}
          
          {step === 'tensions' ? (
            <Button 
              onClick={handleMerge} 
              disabled={!newTitle.trim() || isMerging}
              className="gap-2"
            >
              {isMerging ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <GitMerge className="w-4 h-4" />
              )}
              {t('latent.merge.confirm', 'Fusionner')}
            </Button>
          ) : (
            <Button 
              onClick={handleNextStep} 
              disabled={step === 'select' && selectedZones.length < 2}
            >
              {t('common.next')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StepIndicator({ step, label, active, completed }: { 
  step: number; 
  label: string; 
  active: boolean;
  completed: boolean;
}) {
  return (
    <div className={`flex items-center gap-2 ${active ? 'text-primary' : 'text-muted-foreground'}`}>
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
        ${completed ? 'bg-primary text-primary-foreground' : 
          active ? 'bg-primary/20 border-2 border-primary' : 'bg-muted'}
      `}>
        {completed ? <Check className="w-3 h-3" /> : step}
      </div>
      <span className="text-xs hidden sm:inline">{label}</span>
    </div>
  );
}
