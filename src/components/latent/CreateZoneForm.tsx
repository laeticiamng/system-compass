import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface CreateZoneFormProps {
  onSubmit: (title: string, description?: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function CreateZoneForm({ onSubmit, onCancel, isLoading }: CreateZoneFormProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSubmit(title.trim(), description.trim() || undefined);
    }
  };

  return (
    <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Plus className="w-5 h-5 text-primary" />
          {t('latent.create.title')}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {t('latent.create.subtitle')}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="zone-title">{t('latent.create.labelTitle')}</Label>
            <Input
              id="zone-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('latent.create.placeholderTitle')}
              className="bg-background"
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              {t('latent.create.hintTitle')}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="zone-description">{t('latent.create.labelDescription')}</Label>
            <Textarea
              id="zone-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('latent.create.placeholderDescription')}
              rows={3}
              className="bg-background resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {t('latent.create.hintDescription')}
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={!title.trim() || isLoading} className="flex-1">
              {isLoading ? t('common.loading') : t('latent.create.submit')}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
