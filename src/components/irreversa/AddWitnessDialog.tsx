import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UserPlus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useIrreversa, IrreversaWitness } from '@/hooks/useIrreversa';
import { toast } from 'sonner';

interface AddWitnessDialogProps {
  thresholdId: string;
  onWitnessAdded?: (witness: IrreversaWitness) => void;
  disabled?: boolean;
}

const WITNESS_ROLES = [
  'executive',
  'board_member',
  'legal_counsel',
  'external_advisor',
  'auditor',
  'stakeholder'
];

export function AddWitnessDialog({ thresholdId, onWitnessAdded, disabled }: AddWitnessDialogProps) {
  const { t } = useTranslation();
  const { addWitness } = useIrreversa();
  
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('executive');
  const [statement, setStatement] = useState('');

  const handleSubmit = async () => {
    if (!name.trim()) return;

    setIsSubmitting(true);
    const witness = await addWitness(
      thresholdId,
      name.trim(),
      role,
      statement.trim() || undefined
    );
    setIsSubmitting(false);

    if (witness) {
      toast.success(t('irreversa.witnesses.added'));
      onWitnessAdded?.(witness);
      setOpen(false);
      setName('');
      setRole('executive');
      setStatement('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" disabled={disabled}>
          <UserPlus className="w-4 h-4" />
          {t('irreversa.witnesses.add')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            {t('irreversa.witnesses.add')}
          </DialogTitle>
          <DialogDescription>
            {t('irreversa.witnesses.title')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{t('irreversa.witnesses.name')} *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('irreversa.placeholders.actorName')}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('irreversa.witnesses.role')} *</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WITNESS_ROLES.map(r => (
                  <SelectItem key={r} value={r}>
                    {t(`irreversa.witnessRole.${r}`, r.replace('_', ' '))}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('irreversa.witnesses.statement')}</Label>
            <Textarea
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              placeholder={t('irreversa.placeholders.validationStatement')}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!name.trim() || isSubmitting}
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {t('irreversa.witnesses.add')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
