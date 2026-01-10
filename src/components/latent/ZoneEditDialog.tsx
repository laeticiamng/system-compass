import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Edit, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LatentZone } from '@/hooks/useLatentZones';

interface ZoneEditDialogProps {
  zone: LatentZone;
  isOpen: boolean;
  onClose: () => void;
  onSave: (zoneId: string, title: string, description?: string) => Promise<boolean>;
}

export function ZoneEditDialog({ zone, isOpen, onClose, onSave }: ZoneEditDialogProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(zone.title);
  const [description, setDescription] = useState(zone.description || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setTitle(zone.title);
    setDescription(zone.description || '');
  }, [zone]);

  const handleSave = async () => {
    if (!title.trim()) return;
    
    setIsSaving(true);
    const success = await onSave(zone.id, title.trim(), description.trim() || undefined);
    setIsSaving(false);
    
    if (success) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5 text-primary" />
            {t('latent.edit.title')}
          </DialogTitle>
          <DialogDescription>
            {t('latent.create.subtitle')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">{t('latent.create.labelTitle')}</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('latent.create.placeholderTitle')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">{t('latent.create.labelDescription')}</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('latent.create.placeholderDescription')}
              rows={4}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSave} disabled={!title.trim() || isSaving}>
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            {t('latent.edit.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
