/**
 * UGC Expat Journal entry form
 */
import { useState } from 'react';
import { BookOpen, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { type JournalFormData } from '@/hooks/useUgcJournal';

const MOODS = [
  { value: 'excited', label: '🤩 Enthousiaste' },
  { value: 'happy', label: '😊 Positif' },
  { value: 'neutral', label: '😐 Neutre' },
  { value: 'stressed', label: '😰 Stressé' },
  { value: 'homesick', label: '🏠 Nostalgie' },
  { value: 'frustrated', label: '😤 Frustré' },
];

interface Props {
  onSubmit: (data: JournalFormData) => void;
  isSubmitting?: boolean;
}

export function JournalForm({ onSubmit, isSubmitting }: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [countryId, setCountryId] = useState('');
  const [monthNumber, setMonthNumber] = useState('');
  const [mood, setMood] = useState('neutral');
  const [isPublic, setIsPublic] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !countryId.trim()) return;
    onSubmit({
      country_id: countryId.trim(),
      title: title.trim(),
      content: content.trim(),
      month_number: monthNumber ? parseInt(monthNumber) : undefined,
      mood,
      is_public: isPublic,
      tags: [mood],
    });
    setOpen(false);
    setTitle(''); setContent(''); setCountryId(''); setMonthNumber('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <BookOpen className="w-4 h-4" />
          Écrire dans mon journal
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nouvelle entrée de journal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Pays *</Label>
              <Input value={countryId} onChange={e => setCountryId(e.target.value)} placeholder="Ex: portugal" />
            </div>
            <div className="space-y-1.5">
              <Label>Mois n°</Label>
              <Input type="number" value={monthNumber} onChange={e => setMonthNumber(e.target.value)} placeholder="Ex: 3" min={1} max={120} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Humeur</Label>
            <Select value={mood} onValueChange={setMood}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {MOODS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Titre *</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Mon premier mois à Lisbonne" maxLength={150} />
          </div>

          <div className="space-y-1.5">
            <Label>Contenu *</Label>
            <Textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Racontez votre expérience ce mois-ci..." rows={5} maxLength={5000} />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Visible par la communauté</span>
            </div>
            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
          </div>

          <Button type="submit" className="w-full" disabled={!title.trim() || !content.trim() || !countryId.trim() || isSubmitting}>
            {isSubmitting ? 'Publication...' : 'Publier'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
