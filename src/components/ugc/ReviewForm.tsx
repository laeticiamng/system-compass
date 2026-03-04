/**
 * UGC Review submission form with criteria ratings
 */
import { useState } from 'react';
import { Star, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { type ReviewFormData } from '@/hooks/useUgcReviews';

const PROFILE_TYPES = [
  { value: 'digital_nomad', label: 'Digital Nomad' },
  { value: 'family', label: 'Famille expatriée' },
  { value: 'retiree', label: 'Retraité' },
  { value: 'entrepreneur', label: 'Entrepreneur' },
  { value: 'remote_worker', label: 'Télétravailleur' },
  { value: 'student', label: 'Étudiant' },
  { value: 'other', label: 'Autre' },
];

const CRITERIA = [
  { key: 'rating_admin', label: 'Administration' },
  { key: 'rating_cost', label: 'Coût de la vie' },
  { key: 'rating_integration', label: 'Intégration' },
  { key: 'rating_safety', label: 'Sécurité' },
  { key: 'rating_quality_life', label: 'Qualité de vie' },
] as const;

function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <button
          key={s}
          type="button"
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(s)}
        >
          <Star className={cn(
            'w-5 h-5 transition-colors',
            s <= (hover || value) ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'
          )} />
        </button>
      ))}
    </div>
  );
}

interface Props {
  countryId?: string;
  countryName?: string;
  onSubmit: (data: ReviewFormData) => void;
  isSubmitting?: boolean;
}

export function ReviewForm({ countryId, countryName, onSubmit, isSubmitting }: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [ratingOverall, setRatingOverall] = useState(0);
  const [criteriaRatings, setCriteriaRatings] = useState<Record<string, number>>({});
  const [profileType, setProfileType] = useState('other');
  const [fromCountry, setFromCountry] = useState('');
  const [durationMonths, setDurationMonths] = useState('');
  const [pros, setPros] = useState<string[]>([]);
  const [cons, setCons] = useState<string[]>([]);
  const [newPro, setNewPro] = useState('');
  const [newCon, setNewCon] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratingOverall || !title.trim() || !content.trim()) return;

    onSubmit({
      country_id: countryId || '',
      title: title.trim(),
      content: content.trim(),
      rating_overall: ratingOverall,
      rating_admin: criteriaRatings.rating_admin,
      rating_cost: criteriaRatings.rating_cost,
      rating_integration: criteriaRatings.rating_integration,
      rating_safety: criteriaRatings.rating_safety,
      rating_quality_life: criteriaRatings.rating_quality_life,
      pros,
      cons,
      profile_type: profileType,
      from_country: fromCountry || undefined,
      duration_months: durationMonths ? parseInt(durationMonths) : undefined,
      tags: [profileType],
    });
    setOpen(false);
    // Reset
    setTitle(''); setContent(''); setRatingOverall(0); setCriteriaRatings({});
    setPros([]); setCons([]); setFromCountry(''); setDurationMonths('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Partager mon expérience
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Mon avis sur {countryName || 'ce pays'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Overall Rating */}
          <div className="space-y-1.5">
            <Label>Note globale *</Label>
            <StarInput value={ratingOverall} onChange={setRatingOverall} />
          </div>

          {/* Criteria Ratings */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Notation par critère (optionnel)</Label>
            <div className="grid grid-cols-2 gap-3">
              {CRITERIA.map(c => (
                <div key={c.key} className="flex items-center justify-between gap-2">
                  <span className="text-xs">{c.label}</span>
                  <StarInput
                    value={criteriaRatings[c.key] || 0}
                    onChange={v => setCriteriaRatings(prev => ({ ...prev, [c.key]: v }))}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Title & Content */}
          <div className="space-y-1.5">
            <Label>Titre *</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Résumez votre expérience" maxLength={150} />
          </div>
          <div className="space-y-1.5">
            <Label>Votre témoignage *</Label>
            <Textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Partagez les détails de votre expatriation..." rows={4} maxLength={2000} />
          </div>

          {/* Profile & Meta */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Profil</Label>
              <Select value={profileType} onValueChange={setProfileType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PROFILE_TYPES.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Pays d'origine</Label>
              <Input value={fromCountry} onChange={e => setFromCountry(e.target.value)} placeholder="France" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Durée sur place (mois)</Label>
            <Input type="number" value={durationMonths} onChange={e => setDurationMonths(e.target.value)} min={1} max={600} />
          </div>

          {/* Pros */}
          <div className="space-y-1.5">
            <Label>Points positifs</Label>
            <div className="flex gap-2">
              <Input value={newPro} onChange={e => setNewPro(e.target.value)} placeholder="Ex: Climat agréable" onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (newPro.trim()) { setPros(p => [...p, newPro.trim()]); setNewPro(''); } } }} />
              <Button type="button" size="sm" variant="outline" onClick={() => { if (newPro.trim()) { setPros(p => [...p, newPro.trim()]); setNewPro(''); } }}>
                <Plus className="w-3 h-3" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {pros.map((p, i) => (
                <span key={i} className="inline-flex items-center gap-1 text-xs bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full">
                  ✅ {p}
                  <button type="button" onClick={() => setPros(prev => prev.filter((_, j) => j !== i))}><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
          </div>

          {/* Cons */}
          <div className="space-y-1.5">
            <Label>Points de vigilance</Label>
            <div className="flex gap-2">
              <Input value={newCon} onChange={e => setNewCon(e.target.value)} placeholder="Ex: Bureaucratie lente" onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (newCon.trim()) { setCons(c => [...c, newCon.trim()]); setNewCon(''); } } }} />
              <Button type="button" size="sm" variant="outline" onClick={() => { if (newCon.trim()) { setCons(c => [...c, newCon.trim()]); setNewCon(''); } }}>
                <Plus className="w-3 h-3" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {cons.map((c, i) => (
                <span key={i} className="inline-flex items-center gap-1 text-xs bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full">
                  ⚠️ {c}
                  <button type="button" onClick={() => setCons(prev => prev.filter((_, j) => j !== i))}><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={!ratingOverall || !title.trim() || !content.trim() || isSubmitting}>
            {isSubmitting ? 'Publication...' : 'Publier mon avis'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
